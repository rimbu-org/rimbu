import { attachAbort, Channel, type WaitGroup } from '../index.mjs';

export class WaitGroupImpl implements WaitGroup {
  #blockPromise:
    | {
        promise: Promise<void>;
        resolve: () => void;
      }
    | undefined;

  #count = 0;

  #setBlockPromiseIfUndefined(): void {
    if (this.#blockPromise !== undefined) {
      return;
    }

    const { promise, resolve } = Promise.withResolvers<void>();
    this.#blockPromise = {
      promise,
      resolve,
    };
  }

  add(amount = 1): void {
    if (amount <= 0) {
      return;
    }

    this.#setBlockPromiseIfUndefined();
    this.#count += amount;
  }

  done(amount = 1): void {
    if (amount <= 0) {
      return;
    }

    this.#count -= Math.min(amount, this.#count);

    if (this.#count <= 0) {
      if (this.#blockPromise === undefined) {
        return;
      }

      this.#blockPromise.resolve();
      this.#blockPromise = undefined;
    }
  }

  async wait(options?: {
    signal?: AbortSignal | undefined;
    timeoutMs?: number | undefined;
  }): Promise<void> {
    if (this.#count <= 0 || this.#blockPromise === undefined) {
      return;
    }

    const promises = [this.#blockPromise.promise];

    const cancelController = new AbortController();

    attachAbort(options?.signal, () => {
      cancelController.abort();
    });

    if (options?.signal) {
      promises.push(
        new Promise<void>((_, reject) => {
          attachAbort(cancelController.signal, () => {
            reject(new Channel.Error.OperationAbortedError());
          });
        })
      );
    }
    if (options?.timeoutMs) {
      promises.push(
        new Promise<void>((_, reject) => {
          const timeout = setTimeout(() => {
            reject(new Channel.Error.TimeoutError());
          }, options.timeoutMs);
          attachAbort(cancelController.signal, () => {
            clearTimeout(timeout);
            reject(new Channel.Error.OperationAbortedError());
          });
        })
      );
    }

    try {
      await Promise.race(promises);
    } finally {
      cancelController.abort();
    }
  }
}
