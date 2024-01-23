import { AsyncStream, type AsyncStreamSource } from '@rimbu/stream/async';
import { AsyncFromStream } from '@rimbu/stream/async-custom';

import { Channel, type RemoteChannel } from '../index.mjs';

import {
  ChannelFastIterator,
  attachAbort,
  createCleaner,
  getRandomSequenceNumber,
  timeoutAction,
} from '../index.mjs';

export namespace RemoteChannelBase {
  export interface MessageBase<T extends string> {
    channelId: string;
    sourceInstanceId: number;
    targetInstanceId?: number;
    type: T;
  }

  export type MessageWithData<T extends string, D> = MessageBase<T> & D;

  export type MessageFormat =
    | MessageBase<'OPEN_CHANNEL_REQUEST'>
    | MessageWithData<'OPEN_CHANNEL_RESPONSE', { ack: number }>
    | MessageWithData<'OPEN_CHANNEL_CONFIRM', { ack: number }>
    | MessageBase<'CLOSE_CHANNEL_INFORM'>
    | MessageWithData<'SEND_VALUE_REQUEST', { value: any }>
    | MessageWithData<'SEND_VALUE_RESPONSE', { accepted: boolean }>
    | MessageBase<'SEND_VALUE_REQUEST_CANCEL'>;

  export type MessageTypes = MessageFormat['type'];
}

export abstract class RemoteChannelBase {
  readonly #port;
  readonly #channelId;

  constructor(
    port: RemoteChannel.SimpleMessagePort,
    config: RemoteChannel.ReadConfig
  ) {
    this.#port = port;
    this.#channelId = config.channelId;
  }

  abstract get initialized(): Promise<void>;

  protected instanceId: number | undefined;
  protected otherInstanceId: number | undefined;

  protected postMessage<T extends RemoteChannelBase.MessageTypes>(
    type: T,
    message: Omit<
      RemoteChannelBase.MessageFormat & { type: T },
      'type' | 'channelId' | 'sourceInstanceId' | 'targetInstanceId'
    >
  ): void {
    const data = {
      ...message,
      type,
      channelId: this.#channelId,
      sourceInstanceId: this.instanceId,
      targetInstanceId: this.otherInstanceId,
    };

    // console.log("post", data, {
    //   self: this.instanceId,
    //   other: this.otherInstanceId,
    // });

    this.#port.postMessage(data);
  }

  protected async receiveMessage<T extends RemoteChannelBase.MessageTypes>(
    type: T,
    options: {
      filter?: (data: RemoteChannelBase.MessageFormat & { type: T }) => boolean;
      timeoutMs?: number;
      signal?: AbortSignal;
    } = {}
  ): Promise<RemoteChannelBase.MessageFormat & { type: T }> {
    const { filter, timeoutMs, signal } = options;

    const cleaner = createCleaner();

    return await new Promise<any>((resolve, reject) => {
      const listener = ({ data }: { data: any }): void => {
        if (
          data.type === type &&
          data.channelId === this.#channelId &&
          (this.instanceId === undefined ||
            data.targetInstanceId === this.instanceId) &&
          (this.otherInstanceId === undefined ||
            data.sourceInstanceId === this.otherInstanceId) &&
          filter?.(data) !== false
        ) {
          //   console.log("receive", data, {
          //     self: this.instanceId,
          //     other: this.otherInstanceId,
          //   });
          resolve(data);
        }
      };

      this.#port.addEventListener('message', listener);

      cleaner.add(
        () => {
          this.#port.removeEventListener('message', listener);
        },
        timeoutAction(
          () => reject(new Channel.Error.TimeoutError()),
          timeoutMs
        ),
        attachAbort(signal, () =>
          reject(new Channel.Error.OperationAbortedError())
        )
      );
    }).finally(() => {
      cleaner.cleanup();
    });
  }
}

export class RemoteChannelWrite<T>
  extends RemoteChannelBase
  implements Channel.Write<T>
{
  readonly #closeController = new AbortController();

  readonly #initialized;
  readonly #validator;

  #isSending = false;

  constructor(
    port: RemoteChannel.SimpleMessagePort,
    config: RemoteChannel.ReadConfig
  ) {
    super(port, config);

    this.#validator = config.validator;

    this.#initialized = this.#performHandshake(config);
  }

  get initialized(): Promise<void> {
    return this.#initialized;
  }

  get isClosed(): boolean {
    return this.#closeController.signal.aborted;
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

    const cleaner = createCleaner();

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

      this.#isSending = true;

      const localController = new AbortController();

      let specificError: Channel.Error | undefined;

      cleaner.add(
        attachAbort(signal, () => localController.abort()),
        attachAbort(this.#closeController.signal, () => {
          specificError = new Channel.Error.ChannelClosedError();
          localController.abort();
        }),
        timeoutAction(() => {
          specificError = new Channel.Error.TimeoutError();
          localController.abort();
        }, timeoutMs)
      );

      this.postMessage('SEND_VALUE_REQUEST', { value });

      const { accepted } = await this.receiveMessage('SEND_VALUE_RESPONSE', {
        signal: localController.signal,
      }).catch((err) => {
        if (specificError !== undefined) {
          throw specificError;
        }

        throw err;
      });

      if (!accepted) {
        throw new Channel.Error.InvalidMessageTypeError(value);
      }
    } catch (err) {
      this.postMessage('SEND_VALUE_REQUEST_CANCEL', {});

      if (catchChannelErrors && Channel.Error.isChannelError(err)) {
        return err;
      }

      throw err;
    } finally {
      this.#isSending = false;
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

  close(): void {
    if (this.isClosed) {
      throw new Channel.Error.ChannelClosedError();
    }

    this.#closeController.abort();

    this.postMessage('CLOSE_CHANNEL_INFORM', {});
  }

  async #performHandshake(config: RemoteChannel.WriteConfig): Promise<void> {
    const { maxHandshakeAttempts = 100, handshakeAttemptTimeoutMs = 100 } =
      config;

    let attempt = 1;

    while (this.otherInstanceId === undefined) {
      try {
        const instanceId = getRandomSequenceNumber();
        this.instanceId = instanceId;

        this.postMessage('OPEN_CHANNEL_REQUEST', {});

        const { sourceInstanceId } = await this.receiveMessage(
          'OPEN_CHANNEL_RESPONSE',
          {
            timeoutMs: handshakeAttemptTimeoutMs,
            filter: (message) => message.ack === instanceId + 1,
          }
        );

        this.otherInstanceId = sourceInstanceId;

        this.postMessage('OPEN_CHANNEL_CONFIRM', {
          ack: sourceInstanceId + 1,
        });
      } catch {
        this.instanceId = undefined;
        this.otherInstanceId = undefined;
      }

      attempt++;

      if (attempt >= maxHandshakeAttempts) {
        throw new Channel.Error.HandshakeError();
      }
    }
  }
}

export class RemoteChannelRead<T>
  extends RemoteChannelBase
  implements Channel.Read<T>
{
  readonly #closedController = new AbortController();
  readonly #exhaustedController = new AbortController();

  readonly #initialized;
  readonly #receiveBufferCh;

  constructor(
    port: RemoteChannel.SimpleMessagePort,
    config: RemoteChannel.WriteConfig
  ) {
    super(port, config);

    this.#receiveBufferCh = Channel.create<T>({
      validator: config.validator,
      capacity: config.capacity,
    });

    attachAbort(this.#closedController.signal, () => {
      this.#receiveBufferCh.close();
    });

    this.#initialized = this.#performHandshake(config).then(() => {
      return this.#startMain();
    });
  }

  get initialized(): Promise<void> {
    return this.#initialized;
  }

  get capacity(): number {
    return this.#receiveBufferCh.capacity;
  }

  get length(): number {
    return this.#receiveBufferCh.length;
  }

  get isExhausted(): boolean {
    return this.#receiveBufferCh.isExhausted;
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this.asyncStream()[Symbol.asyncIterator]();
  }

  asyncStream(): AsyncStream<T> {
    return new AsyncFromStream<T>(() => new ChannelFastIterator<T>(this));
  }

  readable(): Channel.Read<T> {
    return this;
  }

  async receive<RT>(
    options: {
      signal?: AbortSignal | undefined;
      timeoutMs?: number | undefined;
      recover?: ((channelError: Channel.Error) => RT) | undefined;
    } = {}
  ): Promise<T | RT> {
    return await this.#receiveBufferCh.receive(options as any);
  }

  async #performHandshake(config: RemoteChannel.ReadConfig): Promise<void> {
    const { maxHandshakeAttempts = 10, handshakeAttemptTimeoutMs = 1000 } =
      config;

    let attempt = 1;

    while (this.otherInstanceId === undefined) {
      try {
        const { sourceInstanceId } = await this.receiveMessage(
          'OPEN_CHANNEL_REQUEST',
          { timeoutMs: handshakeAttemptTimeoutMs }
        );

        let instanceId = getRandomSequenceNumber();

        // own seq number should not be equal to received seq
        while (instanceId === sourceInstanceId) {
          instanceId = getRandomSequenceNumber();
        }

        this.instanceId = instanceId;
        this.otherInstanceId = sourceInstanceId;

        this.postMessage('OPEN_CHANNEL_RESPONSE', {
          ack: sourceInstanceId + 1,
        });

        await this.receiveMessage('OPEN_CHANNEL_CONFIRM', {
          timeoutMs: handshakeAttemptTimeoutMs,
          filter: (message) => message.ack === instanceId + 1,
        });
      } catch {
        this.instanceId = undefined;
        this.otherInstanceId = undefined;
      }

      attempt++;

      if (attempt >= maxHandshakeAttempts) {
        throw new Channel.Error.HandshakeError();
      }
    }
  }

  async #startMain(): Promise<void> {
    this.#startCloseChannelInformHandler();
    this.#startReceiveHandler();
  }

  async #startCloseChannelInformHandler(): Promise<void> {
    await this.receiveMessage('CLOSE_CHANNEL_INFORM');
    this.#closedController.abort();
  }

  async #startReceiveHandler(): Promise<void> {
    while (!this.isExhausted) {
      try {
        const { value } = await this.receiveMessage('SEND_VALUE_REQUEST', {
          signal: this.#exhaustedController.signal,
        });

        const cancelController = new AbortController();

        const receivePromise = this.#receiveBufferCh.send(value, {
          signal: cancelController.signal,
        });

        const receiveCancelFn = async (): Promise<void> => {
          await this.receiveMessage('SEND_VALUE_REQUEST_CANCEL', {
            signal: cancelController.signal,
          });
        };

        await Promise.race([receivePromise, receiveCancelFn()]).finally(() => {
          cancelController.abort();
        });

        this.postMessage('SEND_VALUE_RESPONSE', { accepted: true });
      } catch (err) {
        this.postMessage('SEND_VALUE_RESPONSE', { accepted: false });
      }
    }
  }
}
