import { OptLazy } from '@rimbu/common';
import type { FastIterator } from '@rimbu/stream';

export const fixedDoneIteratorResult: IteratorResult<any> = {
  done: true,
  value: undefined,
};

export const emptyFastIterator: FastIterator<any> = {
  fastNext<O>(otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  },
  next(): IteratorResult<any> {
    return fixedDoneIteratorResult;
  },
};

export function isFastIterator<T>(
  iterator: Iterator<T>
): iterator is FastIterator<T> {
  return `fastNext` in iterator;
}

/**
 * A base class for `FastIterator` instances, that takes implements the default `next`
 * function based on the abstract `fastNext` function.
 */
export abstract class FastIteratorBase<T> implements FastIterator<T> {
  abstract fastNext<O>(otherwise?: OptLazy<O>): T | O;

  next(): IteratorResult<T> {
    const done = Symbol('Done');
    const value = this.fastNext(done);
    if (done === value) return fixedDoneIteratorResult;
    return { value, done: false };
  }
}
