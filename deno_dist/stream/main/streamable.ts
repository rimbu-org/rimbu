import type { Stream } from '../../stream/main/index.ts';

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
