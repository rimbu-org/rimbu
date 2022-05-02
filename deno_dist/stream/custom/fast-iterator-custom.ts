import { OptLazy } from '../../common/mod.ts';
import type { FastIterator } from '../../stream/mod.ts';

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
