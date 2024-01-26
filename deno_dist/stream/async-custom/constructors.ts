import type { Token } from '../../base/mod.ts';
import type { ArrayNonEmpty, AsyncOptLazy, MaybePromise } from '../../common/mod.ts';

import type { AsyncStream, AsyncStreamSource } from '../../stream/async/index.ts';

export interface AsyncStreamConstructors {
  of<T>(...values: ArrayNonEmpty<AsyncOptLazy<T>>): AsyncStream.NonEmpty<T>;
  from<T>(
    ...sources: ArrayNonEmpty<AsyncStreamSource.NonEmpty<T>>
  ): AsyncStream.NonEmpty<T>;
  from<T>(...sources: ArrayNonEmpty<AsyncStreamSource<T>>): AsyncStream<T>;
  fromResource<T, R>(options: {
    open: () => MaybePromise<R>;
    createSource: (resource: R) => AsyncStreamSource.NonEmpty<T>;
    close?: (resource: R) => MaybePromise<void>;
  }): AsyncStream.NonEmpty<T>;
  fromResource<T, R>(options: {
    open: () => MaybePromise<R>;
    createSource: (resource: R) => MaybePromise<AsyncStreamSource<T>>;
    close?: (resource: R) => MaybePromise<void>;
  }): AsyncStream<T>;
  /** Returns an AsyncStream with the result of applying given `zipFun` to each successive value resulting from the given `sources`.
   * @param sources - the input async stream sources
   * @param zipFun - a potentially asynchronous function taking one element from each given Stream, and returning a result value
   * @example
   * ```ts
   * await AsyncStream.zipWith(
   *   [1, 2],
   *   [3, 4, 5],
   *   [true, false]
   * )(
   *   async (a, b, c) => c ? a + b : a - b,
   * ).toArray()
   * // => [4, -2]
   * ```
   * @note ends the AsyncStream when any of the given streams ends
   */
  zipWith<I extends readonly [unknown, ...unknown[]]>(
    ...sources: { [K in keyof I]: AsyncStreamSource.NonEmpty<I[K]> } & unknown[]
  ): <R>(zipFun: (...values: I) => R) => AsyncStream.NonEmpty<R>;
  zipWith<I extends readonly [unknown, ...unknown[]]>(
    ...sources: { [K in keyof I]: AsyncStreamSource<I[K]> } & unknown[]
  ): <R>(zipFun: (...values: I) => R) => AsyncStream<R>;
  /**
   * Returns an AsyncStream with tuples containing each successive value from the given `sources`.
   * @param sources - the input async stream sources
   * @example
   * ```ts
   * await AsyncStream.zip(
   *   [1, 2, 3],
   *   [4, 5],
   *   ['a', 'b', 'c']
   * ).toArray()
   * // => [[1, 4, 'a'], [2, 5, 'b']]
   * ```
   * @note ends the AsyncStream when any of the given streams ends
   */
  zip<I extends readonly [unknown, ...unknown[]]>(
    ...sources: { [K in keyof I]: AsyncStreamSource.NonEmpty<I[K]> } & unknown[]
  ): AsyncStream.NonEmpty<I>;
  zip<I extends readonly [unknown, ...unknown[]]>(
    ...sources: { [K in keyof I]: AsyncStreamSource<I[K]> } & unknown[]
  ): AsyncStream<I>;
  /**
   * Returns an AsyncStream with the result of applying given `zipFun` to each successive value resulting from the given `sources`, adding
   * given `fillValue` to any Streams that end before all streams have ended.
   * @param sources - the input async stream sources
   * @param fillValue - the `AsyncOptLazyz value to add to streams that end early
   * @param zipFun - a potentially asynchronous function taking one element from each given Stream, and returning a result value
   * @example
   * ```ts
   * await AsyncStream.zipAllWith(
   *   [1, 2],
   *   [3, 4, 5],
   *   [6, 7]
   * )(
   *   async () => 0,
   *   async (a, b, c) => a + b + c,
   * ).toArray()
   * // => [10, 13, 5]
   * ```
   */
  zipAllWith<I extends readonly [unknown, ...unknown[]]>(
    ...sources: { [K in keyof I]: AsyncStreamSource.NonEmpty<I[K]> } & unknown[]
  ): <O, R>(
    fillValue: AsyncOptLazy<O>,
    zipFun: (...values: { [K in keyof I]: I[K] | O }) => MaybePromise<R>
  ) => AsyncStream.NonEmpty<R>;
  zipAllWith<I extends readonly [unknown, ...unknown[]]>(
    ...sources: { [K in keyof I]: AsyncStreamSource<I[K]> } & unknown[]
  ): <O, R>(
    fillValue: AsyncOptLazy<O>,
    zipFun: (...values: { [K in keyof I]: I[K] | O }) => MaybePromise<R>
  ) => AsyncStream<R>;

  /**
   * Returns an AsyncStream with tuples containing each successive value from the given `sources`, adding given `fillValue` to any streams
   * that end before all streams have ended.
   * @param fillValue - the `AsyncOptLazy` value to add to streams that end early
   * @param sources - the input async stream sources
   * @example
   * ```ts
   * await AsyncStream.zipAll(
   *   0,
   *   [1, 2, 3],
   *   [4, 5],
   *   ['a', 'b', 'c']
   * ).toArray()
   * // => [[1, 4, 'a'], [2, 5, 'b'], [3, 0, 'c']]
   * ```
   * @note ends the AsyncStream when any of the given streams ends
   */
  zipAll<I extends readonly [unknown, ...unknown[]], O>(
    fillValue: AsyncOptLazy<O>,
    ...sources: { [K in keyof I]: AsyncStreamSource.NonEmpty<I[K]> } & unknown[]
  ): AsyncStream.NonEmpty<{ [K in keyof I]: I[K] | O }>;
  zipAll<I extends readonly [unknown, ...unknown[]], O>(
    fillValue: AsyncOptLazy<O>,
    ...sources: { [K in keyof I]: AsyncStreamSource<I[K]> } & unknown[]
  ): AsyncStream<{ [K in keyof I]: I[K] | O }>;
  /**
   * Returns an AsyncStream concatenating the given `source` AsyncStreamSource containing StreamSources.
   * @param source - a StreamSource containing nested StreamSources
   * @example
   * ```ts
   * await AsyncStream.flatten(AsyncStream.of([[1, 2], [3], [], [4]])).toArray()  // => [1, 2, 3, 4]
   * await AsyncStream.flatten(AsyncStream.of(['ma', 'r', '', 'mot')).toArray()   // => ['m', 'a', 'r', 'm', 'o', 't']
   * ```
   */
  flatten<T extends AsyncStreamSource.NonEmpty<S>, S>(
    source: AsyncStreamSource.NonEmpty<T>
  ): AsyncStream.NonEmpty<S>;
  flatten<T extends AsyncStreamSource<S>, S>(
    source: AsyncStreamSource<T>
  ): AsyncStream<S>;
  /**
   * Returns an array containing an AsyncStream for each tuple element resulting from given `source` AsyncStream.
   * @param source - a Stream containing tuple elements
   * @param length - the tuple length
   * @example
   * ```ts
   * const [a, b] = AsyncStream.unzip(AsyncStream.of([[1, 'a'], [2, 'b']]), 2)
   * await a.toArray()   // => [1, 2]
   * await b.toArray()   // => ['a', 'b']
   * ```
   */
  unzip<T extends readonly unknown[] & { length: L }, L extends number>(
    source: AsyncStream.NonEmpty<T>,
    options: { length: L }
  ): { [K in keyof T]: AsyncStream.NonEmpty<T[K]> };
  unzip<T extends readonly unknown[] & { length: L }, L extends number>(
    source: AsyncStream<T>,
    options: { length: L }
  ): { [K in keyof T]: AsyncStream<T[K]> };
  empty<T>(): AsyncStream<T>;
  always<T>(value: AsyncOptLazy<T>): AsyncStream.NonEmpty<T>;
  /**
   * Returns a possibly infinite Stream starting with given `init` value, followed by applying given `next` function to the previous value.
   * @param init - an initial value
   * @param next - a function taking the last value, its index, and a stop token, and returning a new value or a stop token
   * @example
   * ```ts
   * Stream.unfold(2, v => v * v).take(4).toArray()   // => [2, 4, 16, 256]
   * ```
   */
  unfold<T>(
    init: T,
    next: (current: T, index: number, stop: Token) => MaybePromise<T | Token>
  ): AsyncStream.NonEmpty<T>;
}
