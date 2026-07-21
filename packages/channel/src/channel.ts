import type { AsyncStreamable, AsyncStreamSource } from '@rimbu/stream/async';

import { Module } from '@rimbu/common/module';

import { ChannelError } from '#channel/channel-error';
import { ChannelImpl } from '#channel/channel-impl';
import { attachAbort, createCleaner } from '#channel/utils';

// Re-export all sub-modules from the main entry point
export { CrossChannel } from '@rimbu/channel/cross-channel';
export { Mutex } from '@rimbu/channel/mutex';
export { RemoteChannel } from '@rimbu/channel/remote-channel';
export { RemoteChannelClient } from '@rimbu/channel/remote-channel-client';
export { RemoteChannelServer } from '@rimbu/channel/remote-channel-server';
export { RemoteObject, RemoteObjectError } from '@rimbu/channel/remote-object';
export { RpcProxy, RpcProxyError } from '@rimbu/channel/rpc-proxy';
export { Semaphore, SemaphoreError } from '@rimbu/channel/semaphore';
export { WaitGroup, WaitGroupError } from '@rimbu/channel/wait-group';

export { ChannelError };

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
		 * The maximum amount of messages the Channel can buffer. If 0 (or `Channel.UNBUFFERED`), the channel is unbuffered
		 * and the communication is synchronous.
		 */
		get capacity(): number;
		/**
		 * The amount of messages currently in the read buffer.
		 */
		get length(): number;
		/**
		 * Returns true if the channel is closed and there are no messages in the buffer (length = 0), false otherwise.
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
		 * @returns a `Promise` resolving to the next message `T`, or to the recover
		 * return value `RT` when the `recover` overload is used
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
		/**
		 * Attempts to receive a message from the Channel without blocking. Returns the message immediately if
		 * one is available, or a `Channel.Error` if the channel is empty, exhausted, or closed.
		 * - Returns `ChannelError.ChannelEmptyError` if the channel is open but has no messages.
		 * - Returns `ChannelError.ChannelExhaustedError` if the channel is closed and empty.
		 * @returns the next message `T`, or a `Channel.Error` describing why no message was available
		 */
		tryReceive(): T | Channel.Error;
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
		 * @returns a `Promise` that resolves to `void`, or to the recover return value on error
		 */
		send<RT>(
			value: T,
			options: {
				signal?: AbortSignal | undefined;
				timeoutMs?: number | undefined;
				recover: (channelError: Channel.Error) => RT;
			},
		): Promise<void | RT>;
		send(
			value: T,
			options?: {
				signal?: AbortSignal | undefined;
				timeoutMs?: number | undefined;
				recover?: undefined;
			},
		): Promise<void>;
		/**
		 * Sequentially send all the values in the given `source` to the channel. Blocks until all the values are sent.
		 * @param source - a stream source containing the values to send
		 * @param options - the message send options<br/>
		 * - signal: (optional) an abort signal to cancel sending<br/>
		 * - timeoutMs: (optional) amount of milliseconds to wait for being able to send message, for each separate message in the source<br/>
		 * - recover: (optional) a function invoked on the first error; stops sending further items
		 * @returns a `Promise` that resolves to `void`, or to the recover return value on error
		 */
		sendAll<RT>(
			source: AsyncStreamSource<T>,
			options: {
				signal?: AbortSignal | undefined;
				timeoutMs?: number | undefined;
				recover: (channelError: Channel.Error) => RT;
			},
		): Promise<void | RT>;
		sendAll(
			source: AsyncStreamSource<T>,
			options?: {
				signal?: AbortSignal | undefined;
				timeoutMs?: number | undefined;
				recover?: undefined;
			},
		): Promise<void>;
		/**
		 * Attempts to send a message to the Channel without blocking. Returns `undefined` on success, or a
		 * `Channel.Error` if the channel is full or closed.
		 * @param value - the message to send
		 * @returns `undefined` on success, or a `Channel.Error` describing why the send could not proceed
		 */
		trySend(value: T): Channel.Error | undefined;
		/**
		 * Closes the channel. After closing, further `send` calls throw a
		 * `ChannelError.ChannelClosedError`, and `receive` on an empty buffer rejects
		 * with `ChannelExhaustedError`. Calling `close()` on an already-closed channel
		 * also throws `ChannelError.ChannelClosedError`.
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
	export type Error = ChannelError;

	/**
	 * The configuration options for creating a Channel.
	 */
	export interface Config {
		/**
		 * The channel capacity, indicating the amount of messages a channel will buffer
		 * before sending to the channel will block. Use `Channel.UNBUFFERED` (or `0`) for
		 * an unbuffered channel where each send blocks until a receiver is ready.
		 */
		capacity?: number | undefined;
	}

	/**
	 * Defines the static `Channel` API.
	 */
	export interface Constructors {
		/**
		 * Capacity value for an unbuffered channel. An unbuffered channel requires a receiver to be
		 * ready before a send can proceed (synchronous handoff).
		 */
		readonly UNBUFFERED: 0;

		/**
		 * Returns a new Channel instance that can be used to synchronize asynchronous processes within a single thread.
		 * @typeparam T - the channel message type
		 * @param options - (optional) the options used to create the channel<br/>
		 * - capacity: (optional) the buffer size of the channel (use `Channel.UNBUFFERED` or `0` for unbuffered)
		 */
		create<T = void>(options?: Channel.Config): Channel<T>;

		/**
		 * Resolves, from the given channel array, to the channel value that is received first, taking into account the provided
		 * options.
		 * @typeparam CS - an array of typed read channels
		 * @typeparam RT - when recover is provided, the recover type
		 * @param channels - an array of (read) channels to receive a value from
		 * @param options - (optional) additional options:<br/>
		 * - signal: an abort signal that can be provided to abort waiting for a value<br/>
		 * - timeoutMs: if none of the channels receives a value within the given amount of milliseconds, will throw<br/>
		 * - recover: when given, catches any `Channel.Error` instance and allows returning a backup value
		 * @returns a `Promise` resolving to the first received message (the union of the
		 * channels' message types), or to the recover value if `recover` is given
		 */
		select: {
			<CS extends Channel.Read<any>[], RT>(
				channels: CS,
				options: {
					signal?: AbortSignal | undefined;
					timeoutMs?: number | undefined;
					recover: (channelError: Channel.Error) => RT;
				},
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
				},
			): Promise<
				{
					[K in keyof CS]: Channel.MessageType<CS[K]>;
				}[number]
			>;
		};

		/**
		 * Resolves, from the given tuples of channels and channel value handlers, the result of applying the corresponding channel handler to the
		 * first channel value that is received.
		 * @typeparam TS - an array of channel message types
		 * @typeparam HS - an array of tuples containing a read channel for the message type, and a handler for the message
		 * @param cases - an array of tuples, each containing a (read) channel and a handler for the received value
		 * @param options - (optional) options to take into account:<br/>
		 * - signal: an AbortSignal that can be provided to abort waiting for a value<br/>
		 * - timeoutMs: if none of the channels receives a value within the given amount of milliseconds, will throw<br/>
		 * - recover: when given, catches any `Channel.Error` instance and allows returning a backup value
		 * @returns a `Promise` resolving to the result of the handler for the first
		 * channel that receives a value (the union of handler return types), or to the
		 * recover value if `recover` is given
		 */
		selectCase: {
			<
				TS extends any[],
				HS extends {
					[K in keyof TS]: [Channel.Read<TS[K]>, (value: TS[K]) => any];
				},
			>(
				cases: HS & {
					[K in keyof TS]: [Channel.Read<TS[K]>, (value: TS[K]) => any];
				},
				options?: {
					signal?: AbortSignal | undefined;
					timeoutMs?: number | undefined;
					recover?: undefined;
				},
			): Promise<{ [K in keyof HS]: ReturnType<HS[K][1]> }[number]>;
			<
				TS extends any[],
				HS extends {
					[K in keyof TS]: [Channel.Read<TS[K]>, (value: TS[K]) => any];
				},
				RT,
			>(
				cases: HS & {
					[K in keyof TS]: [Channel.Read<TS[K]>, (value: TS[K]) => any];
				},
				options: {
					signal?: AbortSignal | undefined;
					timeoutMs?: number | undefined;
					recover: (channelError: Channel.Error) => RT;
				},
			): Promise<{ [K in keyof HS]: ReturnType<HS[K][1]> }[number] | RT>;
		};
	}
}

const channelModule = Module.create<Channel.Constructors>(() => ({
	UNBUFFERED: 0,
	create: (options) => {
		return new ChannelImpl(options);
	},
	select: async <CS extends Channel.Read<any>[], RT>(
		channels: CS,
		options: {
			signal?: AbortSignal | undefined;
			timeoutMs?: number | undefined;
			recover?: ((channelError: Channel.Error) => RT) | undefined;
		} = {},
	): Promise<
		| RT
		| {
				[K in keyof CS]: Channel.MessageType<CS[K]>;
		  }[number]
	> => {
		const { signal, timeoutMs, recover } = options;

		if (signal?.aborted) {
			throw new ChannelError.OperationAbortedError();
		}

		const localController = new AbortController();
		const abortLocalController = (): void => localController.abort();

		const cleaner = createCleaner();

		cleaner.add(
			abortLocalController,
			attachAbort(signal, abortLocalController),
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
			if (err instanceof AggregateError) {
				err = new ChannelError.SelectError(err.errors);
			}

			if (recover !== undefined) {
				if (ChannelError.isChannelError(err)) {
					return recover(err);
				}
			}

			throw err;
		}
	},
	selectCase: async <
		TS extends any[],
		HS extends {
			[K in keyof TS]: [Channel.Read<TS[K]>, (value: TS[K]) => any];
		},
		RT,
	>(
		cases: HS & {
			[K in keyof TS]: [Channel.Read<TS[K]>, (value: TS[K]) => any];
		},
		options: {
			signal?: AbortSignal | undefined;
			timeoutMs?: number | undefined;
			recover?: ((channelError: Channel.Error) => RT) | undefined;
		} = {},
	): Promise<{ [K in keyof HS]: ReturnType<HS[K][1]> }[number] | RT> => {
		const { signal, timeoutMs, recover } = options;

		if (signal?.aborted) {
			throw new ChannelError.OperationAbortedError();
		}

		const localController = new AbortController();
		const abortLocalController = (): void => localController.abort();

		const cleaner = createCleaner();

		cleaner.add(
			abortLocalController,
			attachAbort(signal, abortLocalController),
		);

		const mappedCases = (
			cases as Array<[Channel.Read<any>, (value: any) => any]>
		).map(async ([chan, handler]) => {
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
			if (err instanceof AggregateError) {
				err = new ChannelError.SelectError(err.errors);
			}

			if (recover !== undefined) {
				if (ChannelError.isChannelError(err)) {
					return recover(err);
				}
			}

			throw err;
		}
	},
}));

export const Channel: Channel.Constructors = channelModule.build();
