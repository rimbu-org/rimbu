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
