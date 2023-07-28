import { Channel, Semaphore } from '../index.ts';

export class SemaphoreImpl implements Semaphore {
  constructor(readonly maxSize: number) {
    if (maxSize < 1) {
      throw new Semaphore.Error.InvalidConfigError('invalid max size');
    }
  }

  readonly @rimbu/blockChannels = new Map<Channel, number>();

  @rimbu/currentSize = 0;

  canAcquire(weight = 1): boolean {
    if (weight <= 0) {
      return true;
    }

    return this.@rimbu/currentSize + weight <= this.maxSize;
  }

  async acquire(weight = 1): Promise<void> {
    if (weight <= 0) {
      return;
    }

    if (weight > this.maxSize) {
      throw new Semaphore.Error.InsufficientCapacityError();
    }

    if (this.@rimbu/currentSize + weight <= this.maxSize) {
      // there are no blocked channels and the requested weight fits in the available semaphore size
      this.@rimbu/currentSize += weight;
      return;
    }

    const blockChannels = this.@rimbu/blockChannels;

    const blockCh = Channel.create();
    blockChannels.set(blockCh, weight);

    await blockCh.receive();
  }

  release(weight = 1): void {
    if (weight <= 0) {
      return;
    }

    if (this.@rimbu/currentSize < weight) {
      throw new Semaphore.Error.CapacityUnderflowError();
    }

    this.@rimbu/currentSize -= weight;

    if (this.@rimbu/blockChannels.size <= 0) {
      return;
    }

    let availableCapacity = this.maxSize - this.@rimbu/currentSize;

    for (const [itemCh, itemWeight] of this.@rimbu/blockChannels) {
      if (availableCapacity <= 0) {
        return;
      }

      if (itemWeight <= availableCapacity) {
        this.@rimbu/currentSize += itemWeight;
        availableCapacity -= itemWeight;
        this.@rimbu/blockChannels.delete(itemCh);

        itemCh.send();
      }
    }
  }
}
