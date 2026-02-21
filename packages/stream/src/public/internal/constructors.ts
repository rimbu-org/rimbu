import type { Token } from '@rimbu/base/token';
import type { IndexRange } from '@rimbu/common/index-range';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { ArrayNonEmpty, StringNonEmpty } from '@rimbu/common/types';
import type { Stream, StreamSource } from '@rimbu/stream';
import type { Reducer } from '@rimbu/stream/reducer';

/**
 * An interface describing all factory functions used to create `Stream` instances.
 * Implementations of this interface are exposed via the global `Stream` value and the `@rimbu/stream/custom` sub-package.
 */
export interface StreamConstructors {
	/**
	 * Returns true if the given `source` is a `StreamSource` that is known to be empty.
	 * If this function returns `false`, the source may still be empty; it is simply not known.
	 * @param source - a potential stream source
	 * @note
	 * If this function returns false, it does not guarantee that the Stream is not empty. It only
	 * means that it is not known if it is empty.
	 */
	isEmptyStreamSourceInstance: (source: StreamSource<any>) => boolean;
	/**
	 * Returns an empty Stream of given type T.
	 * @typeparam T - the Stream element type
	 * @example
	 * ```ts
	 * Stream.empty<number>().toArray()   // => []
	 * ```
	 */
	empty<T>(): Stream<T>;
	/**
	 * Returns a non-empty Stream containing the given `values`
	 * @typeparam T - the Stream element type
	 * @param values - the values the Stream should return
	 * @example
	 * ```ts
	 * Stream.of(1, 2, 3).toArray()   // => [1, 2, 3]
	 * ```
	 */
	of<T>(...values: ArrayNonEmpty<T>): Stream.NonEmpty<T>;
	/**
	 * Returns a Stream containing the values in the given `sources` concatenated
	 * @typeparam T - the Stream element type
	 * @param sources - a non-empty array of `StreamSource` instances containing values
	 * @example
	 * ```ts
	 * Stream.from([1, 2, 3]).toArray()          // => [1, 2, 3]
	 * Stream.from('marmot').toArray()           // => ['m', 'a', 'r', 'm', 'o', 't']
	 * Stream.from([1, 2, 3], [4, 5]).toArray()  // => [1, 2, 3, 4, 5]
	 * ```
	 */
	from<T>(
		...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
	): Stream.NonEmpty<T>;
	from<T>(...sources: ArrayNonEmpty<StreamSource<T>>): Stream<T>;
	/**
	 * Returns a Stream returning elements from the given `array`, taking into account the given options.
	 * @typeparam T - the Stream element type
	 * @param array - the source of the values for the Stream
	 * @param options - (optional) the options used to create the Stream, containing:<br/>
	 * - range: (optional) a sub index range of the array<br/>
	 * - reversed: (default: false) if true reverses the order of the Stream
	 * @example
	 * ```ts
	 * Stream.fromArray([1, 2, 3]).toArray()                                            // => [1, 2, 3]
	 * Stream.fromArray([1, 2, 3], { range: { start: -2 } }).toArray()                  // => [1, 2]
	 * Stream.fromArray([1, 2, 3], { range: { start: 1 }, reversed: true }).toArray()   // => [3, 2]
	 * ```
	 */
	fromArray<T>(
		array: ArrayNonEmpty<T>,
		options?: {
			range?: undefined;
			reversed?: boolean;
		},
	): Stream.NonEmpty<T>;
	fromArray<T>(
		array: readonly T[],
		options?: {
			range?: IndexRange | undefined;
			reversed?: boolean;
		},
	): Stream<T>;
	/**
	 * Returns a Stream consisting of the object keys from the given `obj` object.
	 * @typeparam K - the object key type
	 * @param obj - the source object
	 * @example
	 * ```ts
	 * Stream.fromObjectKeys({ a: 1, b: 'b' }).toArray()  // => ['a', 'b']
	 * ```
	 */
	fromObjectKeys<K extends string | number | symbol>(
		obj: Record<K, any>,
	): Stream<K>;
	/**
	 * Returns a Stream consisting of the object values from the given `obj` object.
	 * @typeparam V - the object value type
	 * @param obj - the source object
	 * @example
	 * ```ts
	 * Stream.fromObjectValues({ a: 1, b: 'b' }).toArray()  // => [1, 'b']
	 * ```
	 */
	fromObjectValues<V>(obj: Record<any, V> | readonly V[]): Stream<V>;
	/**
	 * Returns a Stream consisting of the object entries as tuples from the given `obj` object.
	 * @typeparam K - the object key type
	 * @typeparam V - the object value type
	 * @param obj - the source object
	 * @example
	 * ```ts
	 * Stream.fromObject({ a: 1, b: 'b' }).toArray()   // => [['a', 1], ['b', 'b']]
	 * ```
	 */
	fromObject<K extends string | number | symbol, V>(
		obj: Record<K, V>,
	): Stream<[K, V]>;
	/**
	 * Returns a Stream consisting of the characters from given string `source`, taking into account the given
	 * options.
	 * @typeparam S - the input string type
	 * @param source - the source string
	 * @param options - (optional) the options used to create the Stream, containing:<br/>
	 * - range: (optional) a sub index range of the string<br/>
	 * - reversed: (default: false) if true reverses the order of the Stream
	 * @example
	 * ```ts
	 * Stream.fromString('marmot').toArray()                       // => ['m', 'a', 'r', 'm', 'o', 't']
	 * Stream.fromString('marmot', { range: { start: -3 } }).toArray()        // => ['m', 'o', 't']
	 * Stream.fromString('marmot', { range: { amount: 3 }, reversed: true}).toArray()  // => ['r', 'a', 'm']
	 * ```
	 */
	fromString<S extends string>(
		source: StringNonEmpty<S>,
		options?: {
			range?: undefined;
			reversed?: boolean;
		},
	): Stream.NonEmpty<string>;
	fromString(
		source: string,
		options?: {
			range?: IndexRange;
			reversed?: boolean;
		},
	): Stream<string>;
	/**
	 * Returns a Stream that eternally returns the given `value`.
	 * @typeparam T - the element type
	 * @param value - the value to return
	 * @example
	 * ```ts
	 * console.log(Stream.always(5).take(4).toArray())
	 * => [5, 5, 5, 5]
	 * ```
	 */
	always<T>(value: T): Stream.NonEmpty<T>;
	/**
	 * For a Stream of tuples, supplied each tuple element as an argument to given function `f` for each element of the Stream, with the optionally given `args` as extra arguments.
	 * @typeparam T - the Stream element type, should be a tuple
	 * @typeparam A - the optional arguments type
	 * @param source - a Stream of tuples
	 * @param f - the function to perform, receiving each Stream tuple element, and optionally receiving given extra `args`.
	 * @param args - (optional) a list of extra arguments to pass to given `f` for each element
	 *
	 * @note used mostly for performance since a new function is not needed to spread the tuples to arguments
	 * @example
	 * ```ts
	 * Stream.applyForEach([[1, 'a'], [2, 'b']], console.log, 'bongo')
	 * // => logs:
	 * // 1 a bongo
	 * // 2 b bongo
	 * ```
	 * @note O(N)
	 */
	applyForEach<T extends readonly unknown[], A extends readonly unknown[]>(
		source: StreamSource<Readonly<T>>,
		f: (...args: [...T, ...A]) => void,
		...args: A
	): void;
	/**
	 * For a Stream of tuples in given `source`, returns a Stream with the result of supplying each tuple element as an argument to given `mapFun` function for each element of the Stream,
	 * with the optionally given `args` as extra arguments.
	 * @typeparam T - the Stream element type, should be a tuple
	 * @typeparam A - the optional arguments type
	 * @typeparam R - the result Stream element type
	 * @param source - a Stream of tuples
	 * @param mapFun - a function receiving the tuple elements as arguments, and optionally receiving given extra `args`, and returning the result Stream element.
	 * @param args - (optional) extra arguments to pass to given `mapFun` for each element
	 *
	 * @note used mostly for performance since a new function is not needed to spread the tuples to arguments
	 * @example
	 * ```ts
	 * const s = Stream.applyMap([[1, 'a'], [2, 'b']], List.of, true)
	 * console.log(s.toArray())
	 * // => [List(1, 'a', true), List(2, 'b', true)]
	 * ```
	 * @note O(N)
	 */
	applyMap<T extends readonly unknown[], A extends readonly unknown[], R>(
		source: StreamSource.NonEmpty<Readonly<T>>,
		mapFun: (...args: [...T, ...A]) => R,
		...args: A
	): Stream.NonEmpty<R>;
	applyMap<T extends readonly unknown[], A extends readonly unknown[], R>(
		source: StreamSource<Readonly<T>>,
		mapFun: (...args: [...T, ...A]) => R,
		...args: A
	): Stream<R>;
	/**
	 * For a Stream of tuples in given `source`, returns a Stream where the result of supplying each tuple element as an argument to given `mapFun` function for each element of the Stream,
	 * with the optionally given `args` as extra arguments, is true.
	 * @typeparam T - the Stream element type, should be a tuple
	 * @typeparam A - the optional arguments type
	 * @param source - a Stream of tuples
	 * @param options - the options used to create the Stream, containing:<br/>
	 * - pred: a function receiving the tuple elements as arguments, and optionally receiving given extra `args`, and returning true if the element should be included in the result stream.<br/>
	 * - negate: (default: false) if true will negate the predicate
	 * @param args: given extra arguments to supply to the predicated if needed
	 * @note used mostly for performance since a new function is not needed to spread the tuples to arguments
	 * @example
	 * ```ts
	 * function sumEq(a: number, b: number, total: number): boolean {
	 *   return a + b === total
	 * }
	 * const s = Stream.applyFilter([[1, 3], [2, 4], [3, 3]], { pred: sumEq }, 6)
	 * console.log(s.toArray())
	 * // => [[2, 4], [3, 3]]
	 * ```
	 * @note O(N)
	 */
	applyFilter<T extends readonly unknown[], A extends readonly unknown[]>(
		source: StreamSource<Readonly<T>>,
		options: {
			pred: (...args: [...T, ...A]) => boolean;
			negate?: boolean;
		},
		...args: A
	): Stream<T>;
	/**
	 * Returns a Stream of numbers within the given `range`, increasing or decreasing with optionally given `delta`.
	 * @param range - the range of numbers the Stream can contain
	 * @param options - the options used to create the Stream, containing:<br/>
	 * - delta: (default: 1) the difference between a number and the next returned number
	 * @example
	 * ```ts
	 * Stream.range({ amount: 3 }).toArray()              // => [0, 1, 2]
	 * Stream.range({ start: 2, amount: 3 }).toArray()    // => [2, 3, 4]
	 * Stream.range({ start: 5 }, { delta: 2 }).toArray()            // => [5, 7, 9, .... ]
	 * ```
	 */
	range(range: IndexRange, options?: { delta?: number }): Stream<number>;
	/**
	 * Returns an infinite Stream containing random numbers between 0 and 1.
	 * @example
	 * ```ts
	 * Stream.random().take(3).toArray()     // => [0.3243..., 0.19524...., 0.78324...]
	 * ```
	 */
	random(): Stream.NonEmpty<number>;
	/**
	 * Returns an infinite Stream containing random integer numbers between given `min` and `max`
	 * @param min - the minimum value
	 * @param max - the maximum value
	 * @example
	 * ```ts
	 * Stream.randomInt(0, 10).take(3).toArray()    // => [4, 9, 3]
	 * ```
	 */
	randomInt(min: number, max: number): Stream.NonEmpty<number>;
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
		next: (current: T, index: number, stop: Token) => T | Token,
	): Stream.NonEmpty<T>;
	/**
	 * Returns a Stream with the result of applying given `zipFun` to each successive value resulting from the given `sources`.
	 * @param sources - the input stream sources
	 * @param zipFun - a function taking one element from each given Stream, and returning a result value
	 * @example
	 * ```ts
	 * Stream.zipWith(
	 *   [1, 2],
	 *   [3, 4, 5],
	 *   [true, false]
	 * )(
	 *   (a, b, c) => c ? a + b : a - b
	 * ).toArray()
	 * // => [4, -2]
	 * ```
	 * @note ends the Stream when any of the given streams ends
	 */
	zipWith<I extends readonly [unknown, ...unknown[]]>(
		...sources: { [K in keyof I]: StreamSource.NonEmpty<I[K]> } & unknown[]
	): <R>(zipFun: (...values: I) => R) => Stream.NonEmpty<R>;
	zipWith<I extends readonly [unknown, ...unknown[]]>(
		...sources: { [K in keyof I]: StreamSource<I[K]> } & unknown[]
	): <R>(zipFun: (...values: I) => R) => Stream<R>;
	/**
	 * Returns a Stream with tuples containing each successive value from the given `sources`.
	 * @param sources - the input stream sources
	 * @example
	 * ```ts
	 * Stream.zip([1, 2, 3], [4, 5], ['a', 'b', 'c']).toArray()    // => [[1, 4, 'a'], [2, 5, 'b']]
	 * ```
	 * @note ends the Stream when any of the given streams ends
	 */
	zip<I extends readonly [unknown, ...unknown[]]>(
		...sources: { [K in keyof I]: StreamSource.NonEmpty<I[K]> } & unknown[]
	): Stream.NonEmpty<I>;
	zip<I extends readonly [unknown, ...unknown[]]>(
		...sources: { [K in keyof I]: StreamSource<I[K]> } & unknown[]
	): Stream<I>;
	/**
	 * Returns a Stream with the result of applying given `zipFun` to each successive value resulting from the given `sources`, adding
	 * given `fillValue` to any Streams that end before all streams have ended.
	 * @param sources - the input stream sources
	 * @param fillValue - the value to add to streams that end early
	 * @param zipFun - a function taking one element from each given Stream, and returning a result value
	 * @example
	 * ```ts
	 * Stream.zipAllWith(
	 *   [1, 2],
	 *   [3, 4, 5],
	 *   [6, 7]
	 * )(
	 *   0,
	 *   (a, b, c) => a + b + c,
	 * ).toArray()
	 * // => [10, 13, 5]
	 * ```
	 */
	zipAllWith<I extends readonly [unknown, ...unknown[]]>(
		...sources: { [K in keyof I]: StreamSource.NonEmpty<I[K]> } & unknown[]
	): <O, R>(
		fillValue: OptLazy<O>,
		zipFun: (...values: { [K in keyof I]: I[K] | O }) => R,
	) => Stream.NonEmpty<R>;
	zipAllWith<I extends readonly [unknown, ...unknown[]]>(
		...sources: { [K in keyof I]: StreamSource<I[K]> } & unknown[]
	): <O, R>(
		fillValue: OptLazy<O>,
		zipFun: (...values: { [K in keyof I]: I[K] | O }) => R,
	) => Stream<R>;
	/**
	 * Returns a Stream with tuples containing each successive value from the given `sources`, adding given `fillValue` to any Streams
	 * that end before all streams have ended.
	 * @param fillValue - the value to add to streams that end early
	 * @param sources - the input stream sources
	 * @example
	 * ```ts
	 * Stream.zipAll(
	 *   0,
	 *   [1, 2, 3],
	 *   [4, 5],
	 *   ['a', 'b', 'c']
	 * ).toArray()
	 * // => [[1, 4, 'a'], [2, 5, 'b'], [3, 0, 'c']]
	 * ```
	 */
	zipAll<I extends readonly [unknown, ...unknown[]], O>(
		fillValue: OptLazy<O>,
		...sources: { [K in keyof I]: StreamSource.NonEmpty<I[K]> } & unknown[]
	): Stream.NonEmpty<{ [K in keyof I]: I[K] | O }>;
	zipAll<I extends readonly [unknown, ...unknown[]], O>(
		fillValue: OptLazy<O>,
		...sources: { [K in keyof I]: StreamSource<I[K]> } & unknown[]
	): Stream<{ [K in keyof I]: I[K] | O }>;
	/**
	 * Returns a Stream concatenating the given `source` StreamSource containing StreamSources.
	 * @example
	 * ```ts
	 * Stream.flatten(Stream.of([[1, 2], [3], [], [4]])).toArray()  // => [1, 2, 3, 4]
	 * Stream.flatten(Stream.of(['ma', 'r', '', 'mot')).toArray()   // => ['m', 'a', 'r', 'm', 'o', 't']
	 * ```
	 */
	flatten<T extends StreamSource.NonEmpty<unknown>>(
		source: StreamSource.NonEmpty<T>,
	): Stream.NonEmpty<StreamSource.ElementType<T>>;
	flatten<T extends StreamSource<unknown>>(
		source: StreamSource<T>,
	): Stream<StreamSource.ElementType<T>>;
	/**
	 * Returns an array containing a Stream for each tuple element in this stream.
	 * @param options - the options used to create the result, containing:<br/>
	 * - length: the stream element tuple length
	 * @example
	 * ```ts
	 * const [a, b] = Stream.unzip(Stream.of([[1, 'a'], [2, 'b']]), 2)
	 * a.toArray()   // => [1, 2]
	 * b.toArray()   // => ['a', 'b']
	 * ```
	 */
	unzip<T extends readonly unknown[] & { length: L }, L extends number>(
		source: Stream.NonEmpty<T>,
		options: {
			length: L;
		},
	): { [K in keyof T]: Stream.NonEmpty<T[K]> };
	unzip<T extends readonly unknown[] & { length: L }, L extends number>(
		source: Stream<T>,
		options: { length: L },
	): { [K in keyof T]: Stream<T[K]> };
	/**
	 * Returns the result of applying the `valueToKey` function to calculate a key for each value, and feeding the tuple of the key and the value to the
	 * `collector` reducer, and finally returning its result. If no collector is given, the default collector will return a JS multimap
	 * of the type `Map<K, V[]>`.
	 * @param source - the source of values to group
	 * @param valueToKey - function taking a value and its index, and returning the corresponding key
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - collector: (default: Reducer.toArray()) a reducer that collects the incoming tuple of key and value, and provides the output
	 * @typeparam T - the input value type
	 * @typeparam K - the key type
	 * @typeparam R - the collector output type
	 * @example
	 * ```ts
	 * Stream.groupBy(Stream.of(1, 2, 3), (v) => v % 2))
	 * // => Map {0 => [2], 1 => [1, 3]}
	 * ```
	 */
	groupBy<T, K>(
		source: StreamSource<T>,
		valueToKey: (value: T, index: number) => K,
	): {
		<R>(options: {
			collector: Reducer<[K, T], R> | Reducer<readonly [K, T], R>;
		}): R;
		(options?: { collector?: undefined } | undefined): Map<K, T[]>;
	};
	/**
	 * Returns a tuple of which the first element is the result of collecting the elements for which the given `predicate` is true, and
	 * the second one the result of collecting the other elements. Own reducers can be provided as collectors, by default the values are
	 * collected into an array.
	 * @param source - the source of values to partition
	 * @param pred - a predicate receiving the value and its index
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - collectorTrue: (default: Reducer.toArray()) a reducer that collects the values for which the predicate is true<br/>
	 * - collectorFalse: (default: Reducer.toArray()) a reducer that collects the values for which the predicate is false
	 * @typeparam T - the input element type
	 * @typeparam RT - the reducer result type for the `collectorTrue` value
	 * @typeparam RF - the reducer result type for the `collectorFalse` value
	 * @note if the predicate is a type guard, the return type is automatically inferred
	 */
	partition<T, TT extends T = T>(
		source: StreamSource<T>,
		pred: (value: T, index: number) => value is TT,
	): {
		<RT, RF>(options: {
			collectorTrue: Reducer<TT, RT>;
			collectorFalse: Reducer<Exclude<T, TT>, RF>;
		}): [true: RT, false: RF];
		(
			options?:
				| {
						collectorTrue?: undefined;
						collectorFalse?: undefined;
				  }
				| undefined,
		): [true: TT[], false: Exclude<T, TT>[]];
	};
	partition<T>(
		source: StreamSource<T>,
		pred: (value: T, index: number) => boolean,
	): {
		<RT, RF>(options: {
			collectorTrue: Reducer<T, RT>;
			collectorFalse: Reducer<T, RF>;
		}): [true: RT, false: RF];
		(
			options?:
				| {
						collectorTrue?: undefined;
						collectorFalse?: undefined;
				  }
				| undefined,
		): [true: T[], false: T[]];
	};
}
