import { OptLazy, type AsyncOptLazy } from '../../../common/mod.ts';
import { AsyncStream, type AsyncStreamSource } from '../../../stream/async/index.ts';
import {
  AsyncFastIteratorBase,
  AsyncFromStream,
} from '../../../stream/async-custom/index.ts';

import {
  Channel,
  attachAbort,
  createCleaner,
  timeoutAction,
} from '../index.ts';

export class ChannelFastIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(readonly sourceCh: Channel.Read<T>) {
    super();
  }

  async fastNext<O>(otherwise?: AsyncOptLazy<O> | undefined): Promise<T | O> {
    try {
      return await this.sourceCh.receive();
    } catch {
      return OptLazy(otherwise!);
    }
  }
}

export class ChannelImpl<T> implements Channel.Read<T>, Channel.Write<T> {
  readonly @rimbu/closeController = new AbortController();
  readonly @rimbu/getNextValueQueue = new Set<() => T>();

  readonly @rimbu/capacity;
  readonly @rimbu/validator;

  constructor(
    options: {
      capacity?: number | undefined;
      validator?: ((value: any) => boolean) | undefined;
    } = {}
  ) {
    this.@rimbu/capacity = options.capacity ?? 0;
    this.@rimbu/validator = options.validator;
  }

  @rimbu/blockedReceiver: ((value: T) => void) | undefined;
  @rimbu/isSending = false;

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this.asyncStream()[Symbol.asyncIterator]();
  }

  asyncStream(): AsyncStream<T> {
    return new AsyncFromStream(() => new ChannelFastIterator<T>(this));
  }

  get capacity(): number {
    return this.@rimbu/capacity;
  }

  get length(): number {
    return Math.min(this.@rimbu/bufferSize, this.capacity);
  }

  get isClosed(): boolean {
    return this.@rimbu/closeController.signal.aborted;
  }

  get isExhausted(): boolean {
    return this.isClosed && this.@rimbu/bufferSize <= 0;
  }

  get @rimbu/bufferSize(): number {
    return this.@rimbu/getNextValueQueue.size;
  }

  get @rimbu/bufferEmpty(): boolean {
    return this.@rimbu/bufferSize <= 0;
  }

  get @rimbu/bufferFull(): boolean {
    return this.@rimbu/bufferSize >= this.capacity;
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

      if (this.@rimbu/isSending) {
        throw new Channel.Error.AlreadyBusySendingError();
      }

      if (this.@rimbu/validator?.(value) === false) {
        throw new Channel.Error.InvalidMessageTypeError(value);
      }

      if (this.@rimbu/bufferFull && timeoutMs !== undefined && timeoutMs <= 0) {
        throw new Channel.Error.TimeoutError();
      }

      {
        const receiver = this.@rimbu/blockedReceiver;

        if (this.@rimbu/bufferEmpty && receiver !== undefined) {
          receiver(value);
          return;
        }
      }

      if (!this.@rimbu/bufferFull) {
        // store in buffer, no way to cancel send
        this.@rimbu/getNextValueQueue.add(() => value);
        return;
      }

      const cleaner = createCleaner();

      return await new Promise<void>((resolve, reject) => {
        this.@rimbu/isSending = true;

        const getNextValue = (): T => {
          resolve();
          return value;
        };

        // store in buffer and wait for consumption or cancellation
        this.@rimbu/getNextValueQueue.add(getNextValue);

        const cancel = (reason?: Channel.Error): void => {
          this.@rimbu/getNextValueQueue.delete(getNextValue);
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
        this.@rimbu/isSending = false;
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

      if (this.@rimbu/blockedReceiver !== undefined) {
        throw new Channel.Error.AlreadyBusyReceivingError();
      }

      if (!this.@rimbu/bufferEmpty) {
        const [getNextValue] = this.@rimbu/getNextValueQueue;
        this.@rimbu/getNextValueQueue.delete(getNextValue);
        const value = getNextValue();

        return value;
      }

      const cleaner = createCleaner();

      return await new Promise<T>((resolve, reject) => {
        const receiveValue = (value: T): void => {
          if (this.@rimbu/validator?.(value) === false) {
            reject(new Channel.Error.InvalidMessageTypeError(value));
          } else {
            resolve(value);
          }
        };

        this.@rimbu/blockedReceiver = receiveValue;

        cleaner.add(
          attachAbort(signal, () => {
            reject(new Channel.Error.OperationAbortedError());
          }),
          attachAbort(this.@rimbu/closeController.signal, () => {
            if (this.@rimbu/bufferEmpty) {
              reject(new Channel.Error.ChannelExhaustedError());
            }
          }),
          timeoutAction(() => {
            reject(new Channel.Error.TimeoutError());
          }, timeoutMs)
        );
      }).finally(() => {
        cleaner.cleanup();
        this.@rimbu/blockedReceiver = undefined;
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

    this.@rimbu/closeController.abort();
  }
}
