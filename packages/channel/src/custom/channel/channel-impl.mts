import { AsyncOptLazy } from '@rimbu/common';
import { AsyncStream, type AsyncStreamSource } from '@rimbu/stream/async';
import {
  AsyncFastIteratorBase,
  AsyncFromStream,
} from '@rimbu/stream/async-custom';

import {
  Channel,
  attachAbort,
  createCleaner,
  timeoutAction,
} from '../index.mjs';

/**
 * Fast async iterator adapter that turns a `Channel.Read` into an `AsyncStream`.
 * @typeparam T - the channel message type
 */
export class ChannelFastIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(readonly sourceCh: Channel.Read<T>) {
    super();
  }

  async fastNext<O>(otherwise?: AsyncOptLazy<O> | undefined): Promise<T | O> {
    try {
      return await this.sourceCh.receive();
    } catch {
      return AsyncOptLazy.toPromise(otherwise!);
    }
  }
}

/**
 * Default in-memory implementation of a `Channel` that backs the public channel API.
 * @typeparam T - the channel message type
 */
export class ChannelImpl<T> implements Channel.Read<T>, Channel.Write<T> {
  readonly #closeController = new AbortController();
  readonly #getNextValueQueue = new Set<() => T>();

  readonly #capacity;
  readonly #validator;

  constructor(
    options: {
      capacity?: number | undefined;
      validator?: ((value: any) => boolean) | undefined;
    } = {}
  ) {
    this.#capacity = options.capacity ?? 0;
    this.#validator = options.validator;
  }

  #blockedReceiver: ((value: T) => void) | undefined;
  #isSending = false;

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this.asyncStream()[Symbol.asyncIterator]();
  }

  asyncStream(): AsyncStream<T> {
    return new AsyncFromStream<T>(() => new ChannelFastIterator<T>(this));
  }

  get capacity(): number {
    return this.#capacity;
  }

  get length(): number {
    return Math.min(this.#bufferSize, this.capacity);
  }

  get isClosed(): boolean {
    return this.#closeController.signal.aborted;
  }

  get isExhausted(): boolean {
    return this.isClosed && this.#bufferSize <= 0;
  }

  get #bufferSize(): number {
    return this.#getNextValueQueue.size;
  }

  get #bufferEmpty(): boolean {
    return this.#bufferSize <= 0;
  }

  get #bufferFull(): boolean {
    return this.#bufferSize >= this.capacity;
  }

  readable(): Channel.Read<T> {
    return this;
  }

  writable(): Channel.Write<T> {
    return this;
  }

  async send(
    value: T,
    options: {
      signal?: AbortSignal | undefined;
      timeoutMs?: number | undefined;
      catchChannelErrors?: boolean | undefined;
    } = {}
  ): Promise<any> {
    const { signal, timeoutMs, catchChannelErrors = false } = options;

    try {
      if (this.isClosed) {
        throw new Channel.Error.ChannelClosedError();
      }

      if (signal?.aborted) {
        throw new Channel.Error.OperationAbortedError();
      }

      if (this.#isSending) {
        throw new Channel.Error.AlreadyBusySendingError();
      }

      if (this.#validator?.(value) === false) {
        throw new Channel.Error.InvalidMessageTypeError(value);
      }

      if (this.#bufferFull && timeoutMs !== undefined && timeoutMs <= 0) {
        throw new Channel.Error.TimeoutError();
      }

      {
        const receiver = this.#blockedReceiver;

        if (this.#bufferEmpty && receiver !== undefined) {
          receiver(value);
          return;
        }
      }

      if (!this.#bufferFull) {
        // store in buffer, no way to cancel send
        this.#getNextValueQueue.add(() => value);
        return;
      }

      const cleaner = createCleaner();

      return await new Promise<void>((resolve, reject) => {
        this.#isSending = true;

        const getNextValue = (): T => {
          resolve();
          return value;
        };

        // store in buffer and wait for consumption or cancellation
        this.#getNextValueQueue.add(getNextValue);

        const cancel = (reason?: Channel.Error): void => {
          this.#getNextValueQueue.delete(getNextValue);
          reject(reason);
        };

        cleaner.add(
          attachAbort(signal, () => {
            cancel(new Channel.Error.OperationAbortedError());
          }),
          timeoutAction(() => {
            cancel(new Channel.Error.TimeoutError());
          }, timeoutMs)
        );
      }).finally(() => {
        cleaner.cleanup();
        this.#isSending = false;
      });
    } catch (err) {
      if (catchChannelErrors && Channel.Error.isChannelError(err)) {
        return err;
      }

      throw err;
    }
  }

  async sendAll(
    source: AsyncStreamSource<T>,
    options: {
      signal?: AbortSignal | undefined;
      timeoutMs?: number | undefined;
      catchChannelErrors?: boolean | undefined;
    } = {}
  ): Promise<any> {
    const iterator = AsyncStream.from(source)[Symbol.asyncIterator]();
    const done = Symbol('done');
    let value: T | typeof done;

    while (done !== (value = await iterator.fastNext(done))) {
      await this.send(value, options);
    }
  }

  async receive<RT>(
    options: {
      signal?: AbortSignal | undefined;
      timeoutMs?: number | undefined;
      recover?: ((channelError: Channel.Error) => RT) | undefined;
    } = {}
  ): Promise<T | RT> {
    const { signal, timeoutMs, recover } = options;

    try {
      if (this.isExhausted) {
        throw new Channel.Error.ChannelExhaustedError();
      }

      if (signal?.aborted) {
        throw new Channel.Error.OperationAbortedError();
      }

      if (this.#blockedReceiver !== undefined) {
        throw new Channel.Error.AlreadyBusyReceivingError();
      }

      if (!this.#bufferEmpty) {
        const [getNextValue] = this.#getNextValueQueue;
        this.#getNextValueQueue.delete(getNextValue);
        const value = getNextValue();

        return value;
      }

      const cleaner = createCleaner();

      return await new Promise<T>((resolve, reject) => {
        const receiveValue = (value: T): void => {
          if (this.#validator?.(value) === false) {
            reject(new Channel.Error.InvalidMessageTypeError(value));
          } else {
            resolve(value);
          }
        };

        this.#blockedReceiver = receiveValue;

        cleaner.add(
          attachAbort(signal, () => {
            reject(new Channel.Error.OperationAbortedError());
          }),
          attachAbort(this.#closeController.signal, () => {
            if (this.#bufferEmpty) {
              reject(new Channel.Error.ChannelExhaustedError());
            }
          }),
          timeoutAction(() => {
            reject(new Channel.Error.TimeoutError());
          }, timeoutMs)
        );
      }).finally(() => {
        cleaner.cleanup();
        this.#blockedReceiver = undefined;
      });
    } catch (err) {
      if (recover !== undefined && Channel.Error.isChannelError(err)) {
        return recover(err);
      }

      throw err;
    }
  }

  close(): void {
    if (this.isClosed) {
      throw new Channel.Error.ChannelClosedError();
    }

    this.#closeController.abort();
  }
}
