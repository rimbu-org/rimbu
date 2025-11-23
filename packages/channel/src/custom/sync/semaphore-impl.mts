import { Channel, Semaphore } from '../index.mjs';

/**
 * Default in-memory implementation of a weighted `Semaphore`.
 */
export class SemaphoreImpl implements Semaphore {
  constructor(readonly maxSize: number) {
    if (maxSize < 1) {
      throw new Semaphore.Error.InvalidConfigError('invalid max size');
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
    }
  ): Promise<void> {
    if (weight <= 0) {
      return;
    }

    if (weight > this.maxSize) {
      throw new Semaphore.Error.InsufficientCapacityError();
    }

    if (this.#currentSize + weight <= this.maxSize) {
      // there are no blocked channels and the requested weight fits in the available semaphore size
      this.#currentSize += weight;
      return;
    }

    const blockChannels = this.#blockChannels;

    const blockCh = Channel.create();
    blockChannels.set(blockCh, weight);

    await blockCh.receive(options);
  }

  release(weight = 1): void {
    if (weight <= 0) {
      return;
    }

    if (this.#currentSize < weight) {
      throw new Semaphore.Error.CapacityUnderflowError();
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
