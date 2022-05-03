import { AsyncOptLazy, MaybePromise } from '../../common/mod.ts';
import type { AsyncFastIterator } from '../../stream/async/index.ts';

export const fixedDoneAsyncIteratorResult = Promise.resolve({
  done: true,
  value: undefined,
} as IteratorResult<any>);

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
    return fixedDoneAsyncIteratorResult;
  },
};

export abstract class AsyncFastIteratorBase<T> implements AsyncFastIterator<T> {
  abstract fastNext<O>(otherwise?: AsyncOptLazy<O>): MaybePromise<T | O>;
  return?: () => Promise<any>;

  async next(): Promise<IteratorResult<T>> {
    const done = Symbol('Done');
    const value = await this.fastNext(done);
    if (done === value) return fixedDoneAsyncIteratorResult;
    return { value, done: false };
  }
}
