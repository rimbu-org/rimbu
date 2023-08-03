import { Channel, type WaitGroup } from '../index.ts';

export class WaitGroupImpl implements WaitGroup {
  readonly #waitCh = Channel.create();

  #_blockPromise: Promise<void> | undefined;

  #count = 0;

  get #blockPromise(): Promise<void> {
    if (this.#_blockPromise === undefined) {
      this.#_blockPromise = this.#waitCh.receive().then(() => {
        this.#_blockPromise = undefined;
      });
    }

    return this.#_blockPromise;
  }

  add(amount = 1): void {
    if (amount <= 0) {
      return;
    }

    this.#count += amount;
  }

  done(amount = 1): void {
    if (amount <= 0) {
      return;
    }

    this.#count -= Math.min(amount, this.#count);

    if (this.#count <= 0) {
      this.#waitCh.send();
    }
  }

  async wait(): Promise<void> {
    if (this.#count <= 0) {
      return;
    }

    await this.#blockPromise;
  }
}
