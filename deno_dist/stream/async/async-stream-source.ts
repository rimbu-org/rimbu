import type { AsyncStream, AsyncStreamable } from '../../stream/async/index.ts';
import type { StreamSource } from '../../stream/mod.ts';

import type { MaybePromise } from '../../common/mod.ts';

export type AsyncStreamSource<T> =
  | undefined
  | AsyncStreamSource.NonEmpty<T>
  | AsyncStream<T>
  | (() => MaybePromise<AsyncStreamSource<T>>)
  | AsyncStreamable<T>
  | StreamSource<T>
  | AsyncIterable<T>;

export namespace AsyncStreamSource {
  export type NonEmpty<T> =
    | AsyncStream.NonEmpty<T>
    | AsyncStreamable.NonEmpty<T>
    | StreamSource.NonEmpty<T>
    | (() => MaybePromise<AsyncStreamSource.NonEmpty<T>>);
}
