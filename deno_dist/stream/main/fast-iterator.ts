import { OptLazy } from '../../common/mod.ts';

/**
 * An iterator that extends the default `Iterator` interface with methods that give more performance.
 * @typeparam T - the element type
 */
export interface FastIterator<T> extends Iterator<T> {
  /**
   * Returns the next iterator value, or the given `otherwise` `OptLazy` value instead.
   * @param otherwise - (default: undefined) the value to return if the iterator has no more values
   */
  fastNext(): T | undefined;
  fastNext<O>(otherwise: OptLazy<O>): T | O;
  /**
   * Returns the next `IteratorResult`.
   */
  next(): IteratorResult<T>;
}

const _fixedDone: IteratorResult<any> = {
  done: true,
  value: undefined,
};

export namespace FastIterator {
  export const fixedDone: IteratorResult<any> = _fixedDone;

  export const emptyFastIterator: FastIterator<any> = {
    fastNext<O>(otherwise?: OptLazy<O>): O {
      return OptLazy(otherwise) as O;
    },
    next(): IteratorResult<any> {
      return _fixedDone;
    },
  };

  export function isFastIterator<T>(
    iterator: Iterator<T>
  ): iterator is FastIterator<T> {
    return `fastNext` in iterator;
  }
}
