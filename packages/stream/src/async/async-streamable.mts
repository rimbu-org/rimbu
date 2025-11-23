import type { AsyncStream } from '@rimbu/stream/async';

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
