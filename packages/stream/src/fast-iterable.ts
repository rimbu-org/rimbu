import type { FastIterator } from './internal';

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
