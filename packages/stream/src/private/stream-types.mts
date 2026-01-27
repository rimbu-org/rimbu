import type { OptLazy } from '@rimbu/common/opt-lazy';

import type { Stream } from '@rimbu/stream';

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

/**
 * Any object that is Iterable, a Stream, or can produce a Stream.
 * @typeparam T - the element type
 */
export type StreamSource<T> =
  | undefined
  | Iterable<T>
  | Stream<T>
  | Streamable<T>;

export namespace StreamSource {
  /**
   * Any object that is a non-empty Stream, can produce a non-empty Stream, or is a non-empty array.
   * @typeparam T - the element type
   */
  export type NonEmpty<T> =
    | Stream.NonEmpty<T>
    | Streamable.NonEmpty<T>
    | readonly [T, ...T[]];
}

/**
 * An object that can create a Stream of elements of type `T`.
 * @typeparam T - the element type
 */
export interface Streamable<T> {
  /**
   * Returns a `Stream` containing the elements in this collection.
   */
  stream(): Stream<T>;
}

export namespace Streamable {
  /**
   * An object that can create a non-empty Stream of elements of type `T`.
   * @typeparam T - the element type
   */
  export interface NonEmpty<T> {
    /**
     * Returns a non-empty `Stream` of the elements in this collection.
     */
    stream(): Stream.NonEmpty<T>;
  }
}
