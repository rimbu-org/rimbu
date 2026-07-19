import type { Token } from '@rimbu/base/token';
import type { AsyncOptLazy, MaybePromise } from '@rimbu/common/async-opt-lazy';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { AsyncStream, AsyncStreamSource } from '@rimbu/stream/async';
/**
 * An interface describing all factory functions used to create `AsyncStream` instances.
 * Implementations of this interface are exposed via the global `AsyncStream` value and the `@rimbu/stream/async-custom` sub-package.
 */
export interface AsyncStreamConstructors {
	/**
	 * Returns true if the given async stream source is known to be empty.
	 * If this function returns false, the source may still be empty; it is simply not known.
	 * @param source - a potential async stream source
	 */
	isEmptyAsyncStreamSourceInstance(source: AsyncStreamSource<any>): boolean;
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
	/**
	 * Returns an AsyncStream with tuples containing each successive value from the given `sources`.
	 * @param sources - the input async stream sources
	 * @example
	 * ```ts
	 * import { AsyncStream } from '@rimbu/stream/async';
	 *
	 * await AsyncStream.zip(
	 *   [1, 2, 3],
	 *   [4, 5],
	 *   ['a', 'b', 'c']
	 * ).toArray()
	 * // => [[1, 4, 'a'], [2, 5, 'b']]
	 * // to apply a transform, chain .map():
	 * console.log(await AsyncStream.zip([1, 2], [3, 4, 5]).map(([a, b]) => a + b).toArray()); // => [4, 6]
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
	 * Returns an AsyncStream with tuples containing each successive value from the given `sources`, adding given `fillValue` to any streams
	 * that end before all streams have ended.
	 * @param fillValue - the `AsyncOptLazy` value to add to streams that end early
	 * @param sources - the input async stream sources
	 * @example
	 * ```ts
	 * import { AsyncStream } from '@rimbu/stream/async';
	 *
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
	 * import { AsyncStream } from '@rimbu/stream/async';
	 *
	 * console.log(await AsyncStream.flatten(AsyncStream.of([[1, 2], [3], [], [4]])).toArray()); // => [1, 2, 3, 4]
	 * await AsyncStream.flatten(AsyncStream.of(['ma', 'r', '', 'mot')).toArray()   // => ['m', 'a', 'r', 'm', 'o', 't']
	 * ```
	 */
	flatten<T extends AsyncStreamSource.NonEmpty<unknown>>(
		source: AsyncStreamSource.NonEmpty<T>,
	): AsyncStream.NonEmpty<AsyncStreamSource.ElementType<T>>;
	flatten<T extends AsyncStreamSource<unknown>>(
		source: AsyncStreamSource<T>,
	): AsyncStream<AsyncStreamSource.ElementType<T>>;
	/**
	 * Returns an array containing an AsyncStream for each tuple element resulting from given `source` AsyncStream.
	 * @param source - a Stream containing tuple elements
	 * @param length - the tuple length
	 * @example
	 * ```ts
	 * import { AsyncStream } from '@rimbu/stream/async';
	 *
	 * const [a, b] = AsyncStream.unzip(AsyncStream.of([[1, 'a'], [2, 'b']]), 2)
	 * console.log(await a.toArray()); // => [1, 2]
	 * console.log(await b.toArray()); // => ['a', 'b']
	 * ```
	 */
	unzip<T extends readonly unknown[] & { length: L }, L extends number>(
		source: AsyncStream.NonEmpty<T>,
		options: { length: L },
	): { [K in keyof T]: AsyncStream.NonEmpty<T[K]> };
	unzip<T extends readonly unknown[] & { length: L }, L extends number>(
		source: AsyncStream<T>,
		options: { length: L },
	): { [K in keyof T]: AsyncStream<T[K]> };
	empty<T>(): AsyncStream<T>;
	always<T>(value: AsyncOptLazy<T>): AsyncStream.NonEmpty<T>;
	/**
	 * Returns a possibly infinite Stream starting with given `init` value, followed by applying given `next` function to the previous value.
	 * @param init - an initial value
	 * @param next - a function taking the last value, its index, and a stop token, and returning a new value or a stop token
	 * @example
	 * ```ts
	 * import { Stream } from '@rimbu/stream';
	 *
	 * console.log(Stream.unfold(2, v => v * v).take(4).toArray()); // => [2, 4, 16, 256]
	 * ```
	 */
	unfold<T>(
		init: T,
		next: (current: T, index: number, stop: Token) => MaybePromise<T | Token>,
	): AsyncStream.NonEmpty<T>;
}
