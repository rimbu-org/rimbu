import { AsyncOptLazy, MaybePromise } from '@rimbu/common';
import type { AsyncFastIterator } from '@rimbu/stream/async';

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
