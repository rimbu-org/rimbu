import type { Stream, Streamable } from '#stream/main';

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
