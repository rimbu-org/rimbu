import type { Token } from '@rimbu/base/token';
import type { AsyncOptLazy, MaybePromise } from '@rimbu/common/async-opt-lazy';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { AsyncStream, AsyncStreamSource } from '@rimbu/stream/async';
import type { AsyncReducer } from '@rimbu/stream/async/reducer';

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
	): <R>(zipFun: (...values: I) => MaybePromise<R>) => AsyncStream.NonEmpty<R>;
	zipWith<I extends readonly [unknown, ...unknown[]]>(
		...sources: { [K in keyof I]: AsyncStreamSource<I[K]> } & unknown[]
	): <R>(zipFun: (...values: I) => MaybePromise<R>) => AsyncStream<R>;
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
		zipFun: (...values: { [K in keyof I]: I[K] | O }) => MaybePromise<R>,
	) => AsyncStream.NonEmpty<R>;
	zipAllWith<I extends readonly [unknown, ...unknown[]]>(
		...sources: { [K in keyof I]: AsyncStreamSource<I[K]> } & unknown[]
	): <O, R>(
		fillValue: AsyncOptLazy<O>,
		zipFun: (...values: { [K in keyof I]: I[K] | O }) => MaybePromise<R>,
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
	 * const [a, b] = AsyncStream.unzip(AsyncStream.of([[1, 'a'], [2, 'b']]), 2)
	 * await a.toArray()   // => [1, 2]
	 * await b.toArray()   // => ['a', 'b']
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
	 * Stream.unfold(2, v => v * v).take(4).toArray()   // => [2, 4, 16, 256]
	 * ```
	 */
	unfold<T>(
		init: T,
		next: (current: T, index: number, stop: Token) => MaybePromise<T | Token>,
	): AsyncStream.NonEmpty<T>;
	/**
	 * Returns a promise resolving to the result of applying the `valueToKey` function to calculate a key for each value, and feeding the tuple of the key and the value to the
	 * `collector` reducer, and finally returning its result. If no collector is given, the default collector will return a JS multimap
	 * of the type `Map<K, V[]>`.
	 * @param valueToKey - potentially async function taking a value and its index, and returning the corresponding key
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - collector: (default: Reducer.toArray()) a reducer that collects the incoming tuple of key and value, and provides the output
	 * @typeparam T - the input value type
	 * @typeparam K - the key type
	 * @typeparam R - the collector output type
	 * @example
	 * ```ts
	 * await AsyncStream.of(1, 2, 3).groupBy((v) => v % 2)
	 * // => Map {0 => [2], 1 => [1, 3]}
	 * ```
	 */
	groupBy<T, K>(
		source: AsyncStreamSource<T>,
		valueToKey: (value: T, index: number) => MaybePromise<K>,
	): {
		<R>(options: {
			collector: AsyncReducer<[K, T], R> | AsyncReducer<readonly [K, T], R>;
		}): Promise<R>;
		(options?: { collector?: undefined } | undefined): Promise<Map<K, T[]>>;
	};
	/**
	 * Returns a promise resolving to a tuple of which the first element is the result of collecting the elements for which the given `predicate` is true, and
	 * the second one the result of collecting the other elements. Own reducers can be provided as collectors, by default the values are
	 * collected into an array.
	 * @param pred - a potentially async predicate receiving the value and its index
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - collectorTrue: (default: Reducer.toArray()) a reducer that collects the values for which the predicate is true<br/>
	 * - collectorFalse: (default: Reducer.toArray()) a reducer that collects the values for which the predicate is false
	 * @typeparam T - the input element type
	 * @typeparam RT - the reducer result type for the `collectorTrue` value
	 * @typeparam RF - the reducer result type for the `collectorFalse` value
	 * @note if the predicate is a type guard, the return type is automatically inferred
	 */
	partition<T, TT extends T = T>(
		source: AsyncStreamSource<T>,
		pred: (value: T, index: number) => value is TT,
	): {
		<RT, RF>(options: {
			collectorTrue: AsyncReducer.Accept<TT, RT>;
			collectorFalse: AsyncReducer.Accept<Exclude<T, TT>, RF>;
		}): Promise<[true: RT, false: RF]>;
		(
			options?:
				| {
						collectorTrue?: undefined;
						collectorFalse?: undefined;
				  }
				| undefined,
		): Promise<[true: TT[], false: Exclude<T, TT>[]]>;
	};
	partition<T>(
		source: AsyncStreamSource<T>,
		pred: (value: T, index: number) => MaybePromise<boolean>,
	): {
		<RT, RF>(options: {
			collectorTrue: AsyncReducer.Accept<T, RT>;
			collectorFalse: AsyncReducer.Accept<T, RF>;
		}): Promise<[true: RT, false: RF]>;
		(
			options?:
				| {
						collectorTrue?: undefined;
						collectorFalse?: undefined;
				  }
				| undefined,
		): Promise<[true: T[], false: T[]]>;
	};
}
