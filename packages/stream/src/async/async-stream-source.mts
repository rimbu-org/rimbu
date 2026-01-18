import type { MaybePromise } from '@rimbu/common';

import type { StreamSource } from '@rimbu/stream';
import type { AsyncStream, AsyncStreamable } from '@rimbu/stream/async';

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
