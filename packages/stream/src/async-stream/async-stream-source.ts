import type { MaybePromise } from '@rimbu/common';
import { AsyncStream, AsyncStreamable, StreamSource } from '../internal';

export type AsyncStreamSource<T> =
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

  export function isEmptyInstance(source: AsyncStreamSource<any>): boolean {
    return (
      source === AsyncStream.empty() ||
      StreamSource.isEmptyInstance(source as StreamSource<any>)
    );
  }
}
