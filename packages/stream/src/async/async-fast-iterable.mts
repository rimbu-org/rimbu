import type { AsyncFastIterator } from '@rimbu/stream/async';

export interface AsyncFastIterable<T> extends AsyncIterable<T> {
  [Symbol.asyncIterator](): AsyncFastIterator<T>;
}
