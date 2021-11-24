import { Stream, Streamable } from '../internal';

/**
 * Any object that is Iterable, a Stream, or can produce a Stream.
 */
export type StreamSource<T> = Iterable<T> | Stream<T> | Streamable<T>;

export namespace StreamSource {
  /**
   * Any object that is a non-empty Stream, can produce a non-empty Stream, or is a non-empty array.
   */
  export type NonEmpty<T> =
    | Stream.NonEmpty<T>
    | Streamable.NonEmpty<T>
    | readonly [T, ...T[]];

  /**
   * Returns true if the given `source` StreamSource is known to be empty.
   * @param source - a StreamSource
   * @note
   * If this function returns false, it does not guarantee that the Stream is not empty. It only
   * means that it is not known if it is empty.
   */
  export function isEmptyInstance(source: StreamSource<unknown>): boolean {
    if (source === '') return true;
    if (typeof source === 'object') {
      if (source === Stream.empty()) return true;
      if (`length` in source && (source as any).length === 0) return true;
      if (`size` in source && (source as any).size === 0) return true;
      if (`isEmpty` in source && (source as any).isEmpty === true) return true;
    }

    return false;
  }
}
