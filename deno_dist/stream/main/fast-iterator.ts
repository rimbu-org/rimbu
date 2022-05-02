import type { OptLazy } from '../../common/mod.ts';

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
