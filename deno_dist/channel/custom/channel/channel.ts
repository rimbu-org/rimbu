import {
  type AsyncStreamSource,
  type AsyncStreamable,
} from '../../../stream/async/index.ts';

import {
  ChannelError,
  ChannelImpl,
  attachAbort,
  createCleaner,
} from '../index.ts';

/**
 * A Rimbu Channel offers various ways to synchronize communication between asynchronous processes. These processes can send and receive
 * messages in a blocking way. Channel messages are of type T, and channels can be buffered or unbuffered. A buffered channel can queue
 * a given amount of messages before blocking the sender.
 * @typeparam T - the channel message type
 */
export interface Channel<T = void> extends Channel.Read<T>, Channel.Write<T> {}

export namespace Channel {
  /**
   * A read-only Channel that can perform blocking reads. This means that a `receive` call will block until a message is available.
   * @typeparam T - the channel message type
   */
  export interface Read<T = void> extends AsyncIterable<T>, AsyncStreamable<T> {
    /**
     * The maximum amount of messages the Channel can buffer. If 0, the channel is unbuffered and the communication is synchronous.
     */
    get capacity(): number;
    /**
     * The amount of messages currently in the read buffer.
     */
    get length(): number;
    /**
     * Returns true if the channel is closed and there are no message in the buffer (length = 0), false otherwise.
     */
    get isExhausted(): boolean;
    /**
     * Returns the Channel as a readonly Channel.Read instance.
     */
    readable(): Channel.Read<T>;
    /**
     * Returns the next message sent to the Channel. Blocks if there are no messages.
     * @param options - (optional) the options to receive a message<br/>
     * - signal: (optional) an abort signal to cancel receiving<br/>
     * - timeoutMs: (optional) amount of milliseconds to wait for received message<br/>
     * - recover: (optional) a function that can be supplied to recover from a channel error
     */
    receive<RT>(options: {
      signal?: AbortSignal | undefined;
      timeoutMs?: number | undefined;
      recover: (channelError: Channel.Error) => RT;
    }): Promise<T | RT>;
    receive(options?: {
      signal?: AbortSignal | undefined;
      timeoutMs?: number | undefined;
      recover?: undefined;
    }): Promise<T>;
  }

  /**
   * A write-only Channel that can perform blocking writes. This means that a `send` call will block until the channel has capacity to send a
   * message.
   * @typeparam T - the channel message type
   */
  export interface Write<T = void> {
    /**
     * Returns true if the Channel is closed.
     */
    get isClosed(): boolean;
    /**
     * Returns the Channel as a write-only Channel.Write instance.
     */
    writable(): Channel.Write<T>;
    /**
     * Send the given `value` message to the Channel. Blocks if the Channel is already at maximum capacity.
     * @param value - the message to send to the channel
     * @param options - (optional) the message send options<br/>
     * - signal: (optional) an abort signal to cancel sending<br/>
     * - timeoutMs: (optional) amount of milliseconds to wait for being able to send message<br/>
     * - recover: (optional) a function that can be supplied to recover from a channel error
     */
    send(
      value: T,
      options: {
        signal?: AbortSignal | undefined;
        timeoutMs?: number | undefined;
        catchChannelErrors?: false | undefined;
      }
    ): Promise<void>;
    send(
      value: T,
      options?: {
        signal?: AbortSignal | undefined;
        timeoutMs?: number | undefined;
        catchChannelErrors: boolean;
      }
    ): Promise<undefined | Channel.Error>;
    /**
     * Sequentially send all the values in the given `source` to the channel. Blocks until all the values are sent.
     * @param source - a stream source containing the values to send
     * @param options - the message send options<br/>
     * - signal: (optional) an abort signal to cancel sending<br/>
     * - timeoutMs: (optional) amount of milliseconds to wait for being able to send message, for each separate message in the source<br/>
     * - recover: (optional) a function that can be supplied to recover from a channel error
     */
    sendAll(
      source: AsyncStreamSource<T>,
      options: {
        signal?: AbortSignal | undefined;
        timeoutMs?: number | undefined;
        catchChannelErrors?: false | undefined;
      }
    ): Promise<void>;
    sendAll(
      source: AsyncStreamSource<T>,
      options?: {
        signal?: AbortSignal | undefined;
        timeoutMs?: number | undefined;
        catchChannelErrors: boolean;
      }
    ): Promise<undefined | Channel.Error>;
    /**
     * Closes the channel. After a close, further send actions will throw.
     */
    close(): void;
  }

  /**
   * Utility type to extract the message type from a Channel.
   * @typeparam C - the Channel type from which to extract the type
   */
  export type MessageType<C extends Channel.Read<any> | Channel.Write<any>> =
    C extends Channel.Read<infer T>
      ? T
      : C extends Channel.Write<infer T>
      ? T
      : never;

  /**
   * The Channel Error type.
   */
  export type Error = ChannelError.ChannelError;

  /**
   * The configuration options for creating a Channel.
   */
  export interface Config {
    /**
     * Tha channel capacity, indicating the amount of messages a channel will buffer
     * before sending to the channel will block.
     */
    capacity?: number | undefined;
    /**
     * A validation function that is used when sending values. If the provided value returns true, the
     * value is valid and will be sent. If the value is false, an exception will be thrown.
     */
    validator?: ((value: any) => boolean) | undefined;
  }

  /**
   * Defines the static `Channel` API.
   */
  export interface Constructors {
    /**
     * The types of possible Channel errors.
     */
    get Error(): typeof ChannelError;

    /**
     * Returns a new Channel instance that can be used to synchronize asynchronous processes within a single thread.
     * @typeparam T - the channel message type
     * @param options - (optional) the options used to create the channel<br/>
     * - capacity: (optional) the buffer size of the channel<br/>
     * - validator: (optional) a function taking a message and returning true if the message is of a valid type, false otherwise
     */
    create<T = void>(options?: Channel.Config): Channel<T>;

    /**
     * Resolves, from the given channel array, to the channel value that is received first, taking into account the provided
     * options.
     * @typeparam CS - an array of typed read channels
     * @typeparam RT - when recover is provided, the recover type
     * @param channels - an array of (read) channels to receive a value from
     * @param options - (optional) additional options:<br/>
     * - signal: an abortsignal that can be provided to abort waiting for a value<br/>
     * - timeoutMs: if none of the channels receives a value within the given amount of milliseconds, will throw<br/>
     * - recover: when given, catches any `Channel.Error` instance and allows returning a backup value
     */
    select: {
      <CS extends Channel.Read<any>[], RT>(
        channels: CS,
        options: {
          signal?: AbortSignal | undefined;
          timeoutMs?: number | undefined;
          recover: (channelError: Channel.Error) => RT;
        }
      ): Promise<
        | RT
        | {
            [K in keyof CS]: Channel.MessageType<CS[K]>;
          }[number]
      >;
      <CS extends Channel.Read<any>[]>(
        channels: CS,
        options?: {
          signal?: AbortSignal | undefined;
          timeoutMs?: number | undefined;
          recover?: undefined;
        }
      ): Promise<
        {
          [K in keyof CS]: Channel.MessageType<CS[K]>;
        }[number]
      >;
    };

    /**
     * Resolves, from the given tuples of channels and channel value handlers, the result of applying the corresponding channel handler to the
     * first channel value that is received.
     * options.
     * @typeparam TS - an array of channel message types
     * @typeparam HS - an array of tuple containing a read channel for the message type, and a handler for the message
     * @param options - options to take into account:<br/>
     * - signal: an abortsignal that can be provided to abort waiting for a value<br/>
     * - timeoutMs: if none of the channels receives a value within the given amount of milliseconds, will throw<br/>
     * - recover: when given, catches any `Channel.Error` instance and allows returning a backup value
     * @param cases - a number of tuples, each tuple containing a (read) channel and a handler for converting the received value into another value
     */
    selectMap: {
      <
        TS extends any[],
        HS extends {
          [K in keyof TS]: [Channel.Read<TS[K]>, (value: TS[K]) => any];
        }
      >(
        options?: {
          signal?: AbortSignal | undefined;
          timeoutMs?: number | undefined;
          recover?: undefined;
        },
        ...cases: HS & {
          [K in keyof TS]: [Channel.Read<TS[K]>, (value: TS[K]) => any];
        }
      ): Promise<{ [K in keyof HS]: Promise<ReturnType<HS[K][1]>> }[number]>;
      <
        TS extends any[],
        HS extends {
          [K in keyof TS]: [Channel.Read<TS[K]>, (value: TS[K]) => any];
        },
        RT
      >(
        options: {
          signal?: AbortSignal | undefined;
          timeoutMs?: number | undefined;
          recover: (channelError: Channel.Error) => RT;
        },
        ...cases: HS & {
          [K in keyof TS]: [Channel.Read<TS[K]>, (value: TS[K]) => any];
        }
      ): Promise<
        { [K in keyof HS]: Promise<ReturnType<HS[K][1]>> }[number] | RT
      >;
    };
  }
}

export const Channel: Channel.Constructors = Object.freeze(
  class {
    static get Error(): typeof ChannelError {
      return ChannelError;
    }

    static create<T = void>(options: Channel.Config = {}): Channel<T> {
      return new ChannelImpl(options);
    }

    static async select<CS extends Channel.Read<any>[], RT>(
      channels: CS,
      options: {
        signal?: AbortSignal | undefined;
        timeoutMs?: number | undefined;
        recover?: ((channelError: Channel.Error) => RT) | undefined;
      } = {}
    ): Promise<
      | RT
      | {
          [K in keyof CS]: Channel.MessageType<CS[K]>;
        }[number]
    > {
      const { signal, timeoutMs, recover } = options;

      if (signal?.aborted) {
        throw new Channel.Error.OperationAbortedError();
      }

      const localController = new AbortController();
      const abortLocalController = (): void => localController.abort();

      const cleaner = createCleaner();

      cleaner.add(
        abortLocalController,
        attachAbort(signal, abortLocalController)
      );

      const mappedChannels = channels.map(async (channel) => {
        try {
          const value = await channel.receive({
            signal: localController.signal,
            timeoutMs,
          });

          return value;
        } finally {
          // abort other channel receivers
          cleaner.cleanup();
        }
      });

      try {
        return await Promise.any(mappedChannels);
      } catch (err) {
        if (recover !== undefined) {
          if (Channel.Error.isChannelError(err)) {
            return recover(err);
          } else if (err instanceof AggregateError) {
            return recover(new Channel.Error.TimeoutError());
          }
        }

        throw err;
      }
    }

    static async selectMap<
      TS extends any[],
      HS extends {
        [K in keyof TS]: [Channel.Read<TS[K]>, (value: TS[K]) => any];
      },
      RT
    >(
      options: {
        signal?: AbortSignal | undefined;
        timeoutMs?: number | undefined;
        recover?: ((channelError: Channel.Error) => RT) | undefined;
      } = {},
      ...cases: HS & {
        [K in keyof TS]: [Channel.Read<TS[K]>, (value: TS[K]) => any];
      }
    ): Promise<
      { [K in keyof HS]: Promise<ReturnType<HS[K][1]>> }[number] | RT
    > {
      const { signal, timeoutMs, recover } = options;

      if (signal?.aborted) {
        throw new Channel.Error.OperationAbortedError();
      }

      const localController = new AbortController();
      const abortLocalController = (): void => localController.abort();

      const cleaner = createCleaner();

      cleaner.add(
        abortLocalController,
        attachAbort(signal, abortLocalController)
      );

      const mappedCases = cases.map(async ([chan, handler]) => {
        try {
          const value = await chan.receive({
            signal: localController.signal,
            timeoutMs,
          });

          return [handler, value] as const;
        } finally {
          // abort other channel receivers
          cleaner.cleanup();
        }
      });

      try {
        const [handler, value] = await Promise.any(mappedCases);

        return handler(value);
      } catch (err) {
        if (recover !== undefined) {
          if (Channel.Error.isChannelError(err)) {
            return recover(err);
          } else if (err instanceof AggregateError) {
            return recover(new Channel.Error.TimeoutError());
          }
        }

        throw err;
      }
    }
  }
);
