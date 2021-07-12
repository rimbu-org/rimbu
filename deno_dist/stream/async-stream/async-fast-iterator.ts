import { AsyncOptLazy, MaybePromise, FastIterator } from '../internal.ts';

export interface AsyncFastIterator<T> extends AsyncIterator<T> {
  fastNext(): MaybePromise<T | undefined>;
  fastNext<O>(otherwise: AsyncOptLazy<O>): MaybePromise<T | O>;
  next(): Promise<IteratorResult<T>>;
}

export namespace AsyncFastIterator {
  export const fixedDone = Promise.resolve(FastIterator.fixedDone);

  export function isAsyncFastIterator<T>(
    iterator: AsyncIterator<T>
  ): iterator is AsyncFastIterator<T> {
    return `fastNext` in iterator;
  }

  export const emptyAsyncFastIterator: AsyncFastIterator<any> = {
    fastNext<O>(otherwise?: AsyncOptLazy<O>): MaybePromise<O> {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    },
    next(): Promise<IteratorResult<any>> {
      return fixedDone;
    },
  };
}
