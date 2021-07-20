import type { OptLazy } from '@rimbu/common';
import { AsyncStream, AsyncStreamable, StreamSource } from '../internal';

export type AsyncStreamSource<T> =
  | AsyncStreamSource.NonEmpty<T>
  | OptLazy<
      | AsyncStreamable<T>
      | StreamSource<T>
      | AsyncIterable<T>
      | Promise<StreamSource<T>>
    >;

export namespace AsyncStreamSource {
  export type NonEmpty<T> = OptLazy<
    | AsyncStreamable.NonEmpty<T>
    | StreamSource.NonEmpty<T>
    | Promise<StreamSource.NonEmpty<T>>
  >;

  export function isEmptyInstance(source: AsyncStreamSource<any>): boolean {
    return (
      source === AsyncStream.empty() ||
      StreamSource.isEmptyInstance(source as StreamSource<any>)
    );
  }
}
