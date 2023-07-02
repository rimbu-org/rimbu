import type { AsyncFastIterator } from '#stream/async';

export interface AsyncFastIterable<T> extends AsyncIterable<T> {
  [Symbol.asyncIterator](): AsyncFastIterator<T>;
}
