import type { RemoteChannel } from '@rimbu/channel/remote-channel';

import { Channel, ChannelError } from '@rimbu/channel';
import { AsyncFromStream } from '@rimbu/stream/advanced/async/stream-base';
import { AsyncStream, type AsyncStreamSource } from '@rimbu/stream/async';

import { ChannelFastIterator } from '#channel/channel-impl';
import {
	attachAbort,
	createCleaner,
	getRandomSequenceNumber,
	timeoutAction,
} from '#channel/utils';

/**
 * Namespace containing shared protocol message types used by the remote channel implementations.
 */
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

/**
 * Base class encapsulating the low-level message-port protocol used by remote read/write channel implementations.
 */
export abstract class RemoteChannelBase {
	readonly #port;
	readonly #channelId;

	constructor(
		port: RemoteChannel.SimpleMessagePort,
		config: RemoteChannel.ReadConfig,
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
		>,
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
		} = {},
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
					// console.log('receive', data, {
					// 	self: this.instanceId,
					// 	other: this.otherInstanceId,
					// });
					resolve(data);
				}
			};

			this.#port.addEventListener('message', listener);

			cleaner.add(
				() => {
					this.#port.removeEventListener('message', listener);
				},
				timeoutAction(() => reject(new ChannelError.TimeoutError()), timeoutMs),
				attachAbort(signal, () =>
					reject(new ChannelError.OperationAbortedError()),
				),
			);
		}).finally(() => {
			cleaner.cleanup();
		});
	}
}

/**
 * Implementation of a write-only remote `Channel` using a `RemoteChannel.SimpleMessagePort`.
 * @typeparam T - the channel message type
 */
export class RemoteChannelWrite<T>
	extends RemoteChannelBase
	implements Channel.Write<T>
{
	readonly #closeController = new AbortController();

	readonly #initialized;
	readonly #validator;

	constructor(
		port: RemoteChannel.SimpleMessagePort,
		config: RemoteChannel.WriteConfig,
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

	async send<RT>(
		value: T,
		options: {
			signal?: AbortSignal | undefined;
			timeoutMs?: number | undefined;
			recover?: ((channelError: ChannelError) => RT) | undefined;
		} = {},
	): Promise<void | RT> {
		const { signal, timeoutMs, recover } = options;

		const cleaner = createCleaner();

		try {
			if (this.isClosed) {
				throw new ChannelError.ChannelClosedError();
			}

			if (signal?.aborted) {
				throw new ChannelError.OperationAbortedError();
			}

			if (this.#validator?.(value) === false) {
				throw new ChannelError.InvalidMessageTypeError(value);
			}

			const localController = new AbortController();

			let specificError: ChannelError | undefined;

			cleaner.add(
				attachAbort(signal, () => localController.abort()),
				attachAbort(this.#closeController.signal, () => {
					specificError = new ChannelError.ChannelClosedError();
					localController.abort();
				}),
				timeoutAction(() => {
					specificError = new ChannelError.TimeoutError();
					localController.abort();
				}, timeoutMs),
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
				throw new ChannelError.InvalidMessageTypeError(value);
			}
		} catch (err) {
			this.postMessage('SEND_VALUE_REQUEST_CANCEL', {});

			if (recover !== undefined && ChannelError.isChannelError(err)) {
				return recover(err);
			}

			throw err;
		} finally {
			cleaner.cleanup();
		}
	}

	async sendAll<RT>(
		source: AsyncStreamSource<T>,
		options: {
			signal?: AbortSignal | undefined;
			timeoutMs?: number | undefined;
			recover?: ((channelError: ChannelError) => RT) | undefined;
		} = {},
	): Promise<void | RT> {
		const iterator = AsyncStream.from(source)[Symbol.asyncIterator]();
		const done = Symbol('done');
		let value: T | typeof done;

		while (done !== (value = await iterator.fastNext(done))) {
			const result = await this.send(value, options as any);
			if (result !== undefined) {
				return result as RT;
			}
		}
	}

	trySend(_value: T): ChannelError | undefined {
		// Remote channels do not support non-blocking sends
		return new ChannelError.ChannelClosedError();
	}

	close(): void {
		if (this.isClosed) {
			throw new ChannelError.ChannelClosedError();
		}

		this.#closeController.abort();

		this.postMessage('CLOSE_CHANNEL_INFORM', {});
	}

	async #performHandshake(config: RemoteChannel.WriteConfig): Promise<void> {
		const { handshakeTimeoutMs = 10000 } = config;

		// Each attempt uses a short per-attempt window; retry until the total budget expires
		const attemptTimeoutMs = 100;
		const deadline = Date.now() + handshakeTimeoutMs;

		while (this.otherInstanceId === undefined) {
			if (Date.now() >= deadline) {
				throw new ChannelError.HandshakeError();
			}

			try {
				const instanceId = getRandomSequenceNumber();
				this.instanceId = instanceId;

				this.postMessage('OPEN_CHANNEL_REQUEST', {});

				const { sourceInstanceId } = await this.receiveMessage(
					'OPEN_CHANNEL_RESPONSE',
					{
						timeoutMs: attemptTimeoutMs,
						filter: (message) => message.ack === instanceId + 1,
					},
				);

				this.otherInstanceId = sourceInstanceId;

				this.postMessage('OPEN_CHANNEL_CONFIRM', {
					ack: sourceInstanceId + 1,
				});
			} catch {
				this.instanceId = undefined;
				this.otherInstanceId = undefined;
			}
		}
	}
}

/**
 * Implementation of a read-only remote `Channel` using a `RemoteChannel.SimpleMessagePort`.
 * @typeparam T - the channel message type
 */
export class RemoteChannelRead<T>
	extends RemoteChannelBase
	implements Channel.Read<T>
{
	readonly #closedController = new AbortController();
	readonly #exhaustedController = new AbortController();

	readonly #initialized;
	readonly #receiveBufferCh;
	readonly #validator;

	constructor(
		port: RemoteChannel.SimpleMessagePort,
		config: RemoteChannel.ReadConfig & { capacity?: number },
	) {
		super(port, config);

		this.#validator = config.validator;
		this.#receiveBufferCh = Channel.create<T>({
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
			recover?: ((channelError: ChannelError) => RT) | undefined;
		} = {},
	): Promise<T | RT> {
		return await this.#receiveBufferCh.receive(options as any);
	}

	tryReceive(): T | ChannelError {
		return this.#receiveBufferCh.tryReceive();
	}

	async #performHandshake(config: RemoteChannel.ReadConfig): Promise<void> {
		const { handshakeTimeoutMs = 10000 } = config;

		// Use a longer per-attempt window on the read side (it waits for the writer to initiate)
		const attemptTimeoutMs = 1000;
		const deadline = Date.now() + handshakeTimeoutMs;

		while (this.otherInstanceId === undefined) {
			if (Date.now() >= deadline) {
				throw new ChannelError.HandshakeError();
			}

			try {
				const { sourceInstanceId } = await this.receiveMessage(
					'OPEN_CHANNEL_REQUEST',
					{
						timeoutMs: attemptTimeoutMs,
					},
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
					timeoutMs: attemptTimeoutMs,
					filter: (message) => message.ack === instanceId + 1,
				});
			} catch {
				this.instanceId = undefined;
				this.otherInstanceId = undefined;
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

				if (this.#validator?.(value) === false) {
					this.postMessage('SEND_VALUE_RESPONSE', { accepted: false });
					continue;
				}

				const cancelController = new AbortController();

				const receivePromise = this.#receiveBufferCh.send(value, {
					signal: cancelController.signal,
				});

				const receiveCancelPromise = this.receiveMessage(
					'SEND_VALUE_REQUEST_CANCEL',
					{
						signal: cancelController.signal,
					},
				);

				await Promise.race([receivePromise, receiveCancelPromise]).finally(
					() => {
						cancelController.abort();
					},
				);

				this.postMessage('SEND_VALUE_RESPONSE', { accepted: true });
			} catch {
				this.postMessage('SEND_VALUE_RESPONSE', { accepted: false });
			}
		}
	}
}
