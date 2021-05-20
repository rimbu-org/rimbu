import { OptLazy } from '@rimbu/common';

/**
 * An iterator that extends the default `Iterator` interface with methods that give more performance.
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
   * @see {Iterator}
   */
  next(): IteratorResult<T>;
}

export namespace FastIterator {
  export const fixedDone: IteratorResult<any> = {
    done: true,
    value: undefined,
  };

  export const emptyFastIterator: FastIterator<any> = {
    fastNext<O>(otherwise?: OptLazy<O>): O {
      return OptLazy(otherwise) as O;
    },
    next(): IteratorResult<any> {
      return fixedDone;
    },
  };

  /**
   * A base class for `FastIterator` instances, that takes implements the default `next`
   * function based on the abstract `fastNext` function.
   */
  export abstract class Base<T> implements FastIterator<T> {
    abstract fastNext<O>(otherwise?: OptLazy<O>): T | O;

    next(): IteratorResult<T> {
      const done = Symbol('Done');
      const value = this.fastNext(done);
      if (done === value) return fixedDone;
      return { value, done: false };
    }
  }
}

/**
 * An interface that extends the standard `Iterable` interface to return
 * a `FastIterator` instead of a normal `Iterator`.
 */
export interface FastIterable<T> extends Iterable<T> {
  /**
   * Returns a `FastIterator` instance used to iterate over the values of this `Iterable`.
   */
  [Symbol.iterator](): FastIterator<T>;
}
