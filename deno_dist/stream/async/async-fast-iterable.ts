import type { AsyncFastIterator } from '../../stream/async/index.ts';

/**
 * An interface that extends the standard `AsyncIterable` interface to return
 * an `AsyncFastIterator` instead of a normal `AsyncIterator`.
 * @typeparam T - the element type
 */
export interface AsyncFastIterable<T> extends AsyncIterable<T> {
  [Symbol.asyncIterator](): AsyncFastIterator<T>;
}
