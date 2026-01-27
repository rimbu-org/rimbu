import type { AsyncOptLazy, MaybePromise } from '@rimbu/common/async-opt-lazy';

import type { StreamSource } from '@rimbu/stream';
import type { AsyncStream } from '@rimbu/stream/async';

/**
 * An interface that extends the standard `AsyncIterable` interface to return
 * an `AsyncFastIterator` instead of a normal `AsyncIterator`.
 * @typeparam T - the element type
 */
export interface AsyncFastIterable<T> extends AsyncIterable<T> {
  [Symbol.asyncIterator](): AsyncFastIterator<T>;
}

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

/**
 * Any source that can be converted to an `AsyncStream`.
 * This includes async streams, sync streams, async iterables, and lazy factories.
 * @typeparam T - the element type
 */
export type AsyncStreamSource<T> =
  | undefined
  | AsyncStreamSource.NonEmpty<T>
  | AsyncStream<T>
  | (() => MaybePromise<AsyncStreamSource<T>>)
  | AsyncStreamable<T>
  | StreamSource<T>
  | AsyncIterable<T>;

export namespace AsyncStreamSource {
  /**
   * Any async stream source that is known to contain at least one element.
   * @typeparam T - the element type
   */
  export type NonEmpty<T> =
    | AsyncStream.NonEmpty<T>
    | AsyncStreamable.NonEmpty<T>
    | StreamSource.NonEmpty<T>
    | (() => MaybePromise<AsyncStreamSource.NonEmpty<T>>);
}

/**
 * An object that can create an `AsyncStream` of elements of type `T`.
 * @typeparam T - the element type
 */
export interface AsyncStreamable<T> {
  /**
   * Returns an asynchronous stream containing the elements in this collection.
   */
  asyncStream(): AsyncStream<T>;
}

export namespace AsyncStreamable {
  /**
   * An object that can create a non-empty `AsyncStream` of elements of type `T`.
   * @typeparam T - the element type
   */
  export interface NonEmpty<T> {
    /**
     * Returns a non-empty asynchronous stream containing the elements in this collection.
     */
    asyncStream(): AsyncStream.NonEmpty<T>;
  }
}
