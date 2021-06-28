import type { Stream } from './internal.ts';

/**
 * An object that can create a Stream of elements of type `T`
 */
export interface Streamable<T> {
  stream(): Stream<T>;
}

export namespace Streamable {
  /**
   * An object that can create a non-empty Stream of elements of type `T`
   */
  export interface NonEmpty<T> {
    stream(): Stream.NonEmpty<T>;
  }
}
