import type { AsyncStream } from '../../stream/async/index.ts';

/**
 * Represents an object that can produce an asynchronous stream of values.
 * @typeparam T - the type of elements in the stream
 */
export interface AsyncStreamable<T> {
  /**
   * Returns an asynchronous stream of values.
   */
  asyncStream(): AsyncStream<T>;
}

export namespace AsyncStreamable {
  /**
   * Represents a non-empty object that can produce an asynchronous stream of values.
   * @typeparam T - the type of elements in the stream
   */
  export interface NonEmpty<T> {
    /**
     * Returns an asynchronous stream of values.
     */
    asyncStream(): AsyncStream.NonEmpty<T>;
  }
}
