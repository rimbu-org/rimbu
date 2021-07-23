import type { MaybePromise, OptLazy } from '../../common/mod.ts';
import { AsyncStream, AsyncStreamable, StreamSource } from '../internal.ts';

export type AsyncStreamSource<T> =
  | AsyncStreamSource.NonEmpty<T>
  | (() => MaybePromise<AsyncStreamSource<T>>)
  | AsyncStreamable<T>
  | StreamSource<T>
  | AsyncIterable<T>;

export namespace AsyncStreamSource {
  export type NonEmpty<T> = OptLazy<
    | AsyncStreamable.NonEmpty<T>
    | StreamSource.NonEmpty<T>
    | (() => MaybePromise<AsyncStreamSource.NonEmpty<T>>)
  >;

  export function isEmptyInstance(source: AsyncStreamSource<any>): boolean {
    return (
      source === AsyncStream.empty() ||
      StreamSource.isEmptyInstance(source as StreamSource<any>)
    );
  }
}
