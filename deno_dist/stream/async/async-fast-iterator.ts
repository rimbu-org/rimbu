import type { AsyncOptLazy, MaybePromise } from '../../common/mod.ts';

export interface AsyncFastIterator<T> extends AsyncIterator<T> {
  fastNext(): MaybePromise<T | undefined>;
  fastNext<O>(otherwise: AsyncOptLazy<O>): MaybePromise<T | O>;
  next(): Promise<IteratorResult<T>>;
}
