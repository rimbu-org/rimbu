import type { AsyncOptLazy, MaybePromise } from '@rimbu/common';

/**
 * An asynchronous iterator that extends the default `AsyncIterator` interface with methods for improved performance.
 * @typeparam T - the element type
 */
export interface AsyncFastIterator<T> extends AsyncIterator<T> {
  /**
   * Returns the next iterator value asynchronously, or the given `otherwise` `AsyncOptLazy` value instead.
   */
  fastNext(): MaybePromise<T | undefined>;

  /**
   * Returns the next iterator value asynchronously, or the given `otherwise` `AsyncOptLazy` value instead.
   * @param otherwise - (default: undefined) the value to return if the iterator has no more values
   * @typeparam O - the type of the alternative value
   */
  fastNext<O>(otherwise: AsyncOptLazy<O>): MaybePromise<T | O>;

  /**
   * Returns a promise resolving to the next `IteratorResult`.
   */
  next(): Promise<IteratorResult<T>>;
}
