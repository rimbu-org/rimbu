import type { AsyncStream } from '#stream/async';

export interface AsyncStreamable<T> {
  asyncStream(): AsyncStream<T>;
}

export namespace AsyncStreamable {
  export interface NonEmpty<T> {
    asyncStream(): AsyncStream.NonEmpty<T>;
  }
}
