import type { AsyncFastIterator } from '../../stream/async/index.ts';

export interface AsyncFastIterable<T> extends AsyncIterable<T> {
  [Symbol.asyncIterator](): AsyncFastIterator<T>;
}
