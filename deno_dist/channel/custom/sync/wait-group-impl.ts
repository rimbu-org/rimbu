import { Channel, type WaitGroup } from '../index.ts';

export class WaitGroupImpl implements WaitGroup {
  readonly @rimbu/waitCh = Channel.create();

  @rimbu/_blockPromise: Promise<void> | undefined;

  @rimbu/count = 0;

  get @rimbu/blockPromise(): Promise<void> {
    if (this.@rimbu/_blockPromise === undefined) {
      this.@rimbu/_blockPromise = this.@rimbu/waitCh.receive().then(() => {
        this.@rimbu/_blockPromise = undefined;
      });
    }

    return this.@rimbu/_blockPromise;
  }

  add(amount = 1): void {
    if (amount <= 0) {
      return;
    }

    this.@rimbu/count += amount;
  }

  done(amount = 1): void {
    if (amount <= 0) {
      return;
    }

    this.@rimbu/count -= Math.min(amount, this.@rimbu/count);

    if (this.@rimbu/count <= 0) {
      this.@rimbu/waitCh.send();
    }
  }

  async wait(): Promise<void> {
    if (this.@rimbu/count <= 0) {
      return;
    }

    await this.@rimbu/blockPromise;
  }
}
