import type { FastIterator } from './index.mjs';

/**
 * An interface that extends the standard `Iterable` interface to return
 * a `FastIterator` instead of a normal `Iterator`.
 * @typeparam T - the element type
 */
export interface FastIterable<T> extends Iterable<T> {
  /**
   * Returns a `FastIterator` instance used to iterate over the values of this `Iterable`.
   */
  [Symbol.iterator](): FastIterator<T>;
}
