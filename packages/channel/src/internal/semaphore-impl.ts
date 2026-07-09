import type { Semaphore } from '@rimbu/channel/semaphore';

import { Channel } from '@rimbu/channel';

import { SemaphoreError } from '#private/semaphore-error';

/**
 * Default in-memory implementation of a weighted `Semaphore`.
 */
export class SemaphoreImpl implements Semaphore {
	constructor(readonly maxSize: number) {
		if (maxSize < 1) {
			throw new SemaphoreError.InvalidConfigError('invalid max size');
		}
	}

	readonly #blockChannels = new Map<Channel, number>();

	#currentSize = 0;

	canAcquire(weight = 1): boolean {
		if (weight <= 0) {
			return true;
		}

		return this.#currentSize + weight <= this.maxSize;
	}

	async acquire(
		weight = 1,
		options?: {
			signal?: AbortSignal | undefined;
			timeoutMs?: number | undefined;
		},
	): Promise<void> {
		if (weight <= 0) {
			return;
		}

		if (weight > this.maxSize) {
			throw new SemaphoreError.InsufficientCapacityError();
		}

		if (this.#currentSize + weight <= this.maxSize) {
			// there are no blocked channels and the requested weight fits in the available semaphore size
			this.#currentSize += weight;
			return;
		}

		const blockChannels = this.#blockChannels;

		const blockCh = Channel.create();
		blockChannels.set(blockCh, weight);

		try {
			await blockCh.receive(options);
		} catch (err) {
			// If the waiter was aborted, timed out, or otherwise failed to
			// receive its slot, we must remove the block channel entry so a
			// later `release` does not attribute weight to a phantom holder.
			// If `release` already claimed the slot and sent (i.e. the entry
			// was removed from the map before we got here), we must undo the
			// weight allocation that release performed on our behalf.
			if (blockChannels.delete(blockCh)) {
				// entry was still queued: nothing to undo
			} else {
				// entry was already claimed by release: give the weight back
				this.release(weight);
			}
			throw err;
		}
	}

	release(weight = 1): void {
		if (weight <= 0) {
			return;
		}

		if (this.#currentSize < weight) {
			throw new SemaphoreError.CapacityUnderflowError();
		}

		this.#currentSize -= weight;

		if (this.#blockChannels.size <= 0) {
			return;
		}

		let availableCapacity = this.maxSize - this.#currentSize;

		for (const [itemCh, itemWeight] of this.#blockChannels) {
			if (availableCapacity <= 0) {
				return;
			}

			if (itemWeight <= availableCapacity) {
				this.#currentSize += itemWeight;
				availableCapacity -= itemWeight;
				this.#blockChannels.delete(itemCh);

				itemCh.send();
			}
		}
	}
}
