import type { Channel } from '@rimbu/channel';

import { AsyncOptLazy } from '@rimbu/common/async-opt-lazy';
import { AsyncStream, type AsyncStreamSource } from '@rimbu/stream/async';
import { AsyncFastIteratorBase } from '@rimbu/stream/advanced/async/fast-iterator-base';
import { AsyncFromStream } from '@rimbu/stream/advanced/async/stream-base';

import { ChannelError } from '#channel/channel-error';
import { attachAbort, createCleaner, timeoutAction } from '#channel/utils';

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
 * Multiple concurrent senders and receivers are supported; they are queued FIFO.
 * @typeparam T - the channel message type
 */
export class ChannelImpl<T> implements Channel.Read<T>, Channel.Write<T> {
	readonly #closeController = new AbortController();

	// Queue of getters representing buffered (or blocked-sender) values
	readonly #getNextValueQueue = new Set<() => T>();

	// Queue of blocked receivers waiting for a value
	readonly #blockedReceivers = new Set<(value: T) => void>();

	readonly #capacity;

	constructor(
		options: {
			capacity?: number | undefined;
		} = {},
	) {
		this.#capacity = options.capacity ?? 0;
	}

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

	/**
	 * Attempt to hand `value` directly to a blocked receiver. Returns true if consumed.
	 */
	#tryDeliverToBlockedReceiver(value: T): boolean {
		if (this.#blockedReceivers.size === 0) {
			return false;
		}

		const [receiver] = this.#blockedReceivers;
		this.#blockedReceivers.delete(receiver);
		receiver(value);
		return true;
	}

	async send<RT>(
		value: T,
		options: {
			signal?: AbortSignal | undefined;
			timeoutMs?: number | undefined;
			recover?: ((channelError: Channel.Error) => RT) | undefined;
		} = {},
	): Promise<void | RT> {
		const { signal, timeoutMs, recover } = options;

		try {
			if (this.isClosed) {
				throw new ChannelError.ChannelClosedError();
			}

			if (signal?.aborted) {
				throw new ChannelError.OperationAbortedError();
			}

			if (this.#bufferFull && timeoutMs !== undefined && timeoutMs <= 0) {
				throw new ChannelError.TimeoutError();
			}

			// If a receiver is waiting and buffer is empty, hand value directly
			if (this.#bufferEmpty && this.#tryDeliverToBlockedReceiver(value)) {
				return;
			}

			if (!this.#bufferFull) {
				// store in buffer
				this.#getNextValueQueue.add(() => value);
				return;
			}

			// Buffer full: block until a receiver consumes our value or we are cancelled
			const cleaner = createCleaner();

			return await new Promise<void>((resolve, reject) => {
				const getNextValue = (): T => {
					resolve();
					return value;
				};

				// store in buffer and wait for consumption or cancellation
				this.#getNextValueQueue.add(getNextValue);

				const cancel = (reason?: ChannelError): void => {
					this.#getNextValueQueue.delete(getNextValue);
					reject(reason);
				};

				cleaner.add(
					attachAbort(signal, () => {
						cancel(new ChannelError.OperationAbortedError());
					}),
					timeoutAction(() => {
						cancel(new ChannelError.TimeoutError());
					}, timeoutMs),
				);
			}).finally(() => {
				cleaner.cleanup();
			});
		} catch (err) {
			if (recover !== undefined && ChannelError.isChannelError(err)) {
				return recover(err);
			}

			throw err;
		}
	}

	async sendAll<RT>(
		source: AsyncStreamSource<T>,
		options: {
			signal?: AbortSignal | undefined;
			timeoutMs?: number | undefined;
			recover?: ((channelError: Channel.Error) => RT) | undefined;
		} = {},
	): Promise<void | RT> {
		const iterator = AsyncStream.from(source)[Symbol.asyncIterator]();
		const done = Symbol('done');
		let value: T | typeof done;

		while (done !== (value = await iterator.fastNext(done))) {
			const result = await this.send(value, options as any);
			if (result !== undefined) {
				// recover was called — stop sending
				return result as RT;
			}
		}
	}

	trySend(value: T): Channel.Error | undefined {
		if (this.isClosed) {
			return new ChannelError.ChannelClosedError();
		}

		// If a receiver is waiting and buffer is empty, hand value directly
		if (this.#bufferEmpty && this.#tryDeliverToBlockedReceiver(value)) {
			return undefined;
		}

		if (!this.#bufferFull) {
			this.#getNextValueQueue.add(() => value);
			return undefined;
		}

		// Buffer full — would need to block, so fail
		return new ChannelError.ChannelExhaustedError();
	}

	async receive<RT>(
		options: {
			signal?: AbortSignal | undefined;
			timeoutMs?: number | undefined;
			recover?: ((channelError: ChannelError) => RT) | undefined;
		} = {},
	): Promise<T | RT> {
		const { signal, timeoutMs, recover } = options;

		try {
			if (this.isExhausted) {
				throw new ChannelError.ChannelExhaustedError();
			}

			if (signal?.aborted) {
				throw new ChannelError.OperationAbortedError();
			}

			if (!this.#bufferEmpty) {
				const [getNextValue] = this.#getNextValueQueue;
				this.#getNextValueQueue.delete(getNextValue);
				return getNextValue();
			}

			// No value in buffer — block until a sender delivers or we are cancelled
			const cleaner = createCleaner();

			return await new Promise<T>((resolve, reject) => {
				const receiveValue = (value: T): void => {
					resolve(value);
				};

				this.#blockedReceivers.add(receiveValue);

				cleaner.add(
					() => {
						this.#blockedReceivers.delete(receiveValue);
					},
					attachAbort(signal, () => {
						reject(new ChannelError.OperationAbortedError());
					}),
					attachAbort(this.#closeController.signal, () => {
						if (this.#bufferEmpty) {
							reject(new ChannelError.ChannelExhaustedError());
						}
					}),
					timeoutAction(() => {
						reject(new ChannelError.TimeoutError());
					}, timeoutMs),
				);
			}).finally(() => {
				cleaner.cleanup();
			});
		} catch (err) {
			if (recover !== undefined && ChannelError.isChannelError(err)) {
				return recover(err);
			}

			throw err;
		}
	}

	tryReceive(): T | Channel.Error {
		if (this.isExhausted) {
			return new ChannelError.ChannelExhaustedError();
		}

		if (this.isClosed) {
			return new ChannelError.ChannelClosedError();
		}

		if (!this.#bufferEmpty) {
			const [getNextValue] = this.#getNextValueQueue;
			this.#getNextValueQueue.delete(getNextValue);
			return getNextValue();
		}

		return new ChannelError.ChannelEmptyError();
	}

	close(): void {
		if (this.isClosed) {
			throw new ChannelError.ChannelClosedError();
		}

		this.#closeController.abort();
	}
}
