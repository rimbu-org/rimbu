import type { FastIterator } from '@rimbu/stream';

export interface FastIteratorFactory {
  /**
   * A frozen `IteratorResult` instance representing the completed iterator state.
   * This value is reused by several fast iterator implementations to avoid allocations.
   */
  _fixedDoneIteratorResult: IteratorResult<any>;
  /**
   * A `FastIterator` that is already exhausted and never yields values.
   * Its `fastNext` method always returns the provided fallback value.
   */
  _emptyFastIteratorInstance: FastIterator<any>;
  /**
   * Returns true if the given `iterator` implements the `FastIterator` interface.
   * @param iterator - the iterator instance to test
   */
  isFastIterator<T>(iterator: Iterator<T>): iterator is FastIterator<T>;
}
