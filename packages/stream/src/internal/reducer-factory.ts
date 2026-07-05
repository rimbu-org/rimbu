import type { Eq } from '@rimbu/common/eq';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { Reducer } from '@rimbu/stream/reducer';

import type { StreamSource } from '#private/stream-types';

export interface ReducerFactory {
	/**
	 * Returns a `Reducer` with the given options:
	 * @param init - the initial state value
	 * @param next - returns the next state value based on the given inputs:<br/>
	 * - current: the current state<br/>
	 * - next: the current input value<br/>
	 * - index: the input index value<br/>
	 * - halt: function that, when called, ensures no more elements are passed to the reducer
	 * @param stateToResult - a function that converts the current state to an output value
	 * @typeparam I - the input value type
	 * @typeparam O - the output value type
	 * @typeparam S - the internal state type
	 * @example
	 * ```ts
	 * const evenNumberOfOnes = Reducer.create(
	 *   true,
	 *   (current, value: number) => (value === 1 ? !current : current),
	 *   (state) => (state ? 'even' : 'not even')
	 * );
	 * const result = Stream.of(1, 2, 3, 2, 1).reduce(evenNumberOfOnes);
	 * console.log(result);
	 * // => 'even'
	 * ```
	 */
	create<I, O = I, S = O>(
		init: (initHalt: () => void) => S,
		next: (current: S, next: I, index: number, halt: () => void) => S,
		stateToResult: (state: S, index: number, halted: boolean) => O,
	): Reducer<I, O>;

	/**
	 * Returns a `Reducer` of which the input, state, and output types are the same.
	 * @param init - the initial state value
	 * @param next - returns the next state value based on the given inputs:<br/>
	 * - current: the current state<br/>
	 * - next: the current input value<br/>
	 * - index: the input index value<br/>
	 * - halt: function that, when called, ensures no more elements are passed to the reducer
	 * @param stateToResult - (optional) a function that converts the current state to an output value
	 * @typeparam T - the overall value type
	 * @example
	 * ```ts
	 * const sum = Reducer.createMono(
	 *   0,
	 *   (current, value) => current + value
	 * );
	 * const result = Stream.of(1, 2, 3, 2, 1).reduce(sum);
	 * console.log(result);
	 * // => 9
	 * ```
	 */
	createMono<T>(
		init: (initHalt: () => void) => T,
		next: (current: T, next: T, index: number, halt: () => void) => T,
		stateToResult?: (state: T, index: number, halted: boolean) => T,
	): Reducer<T>;

	/**
	 * Returns a `Reducer` of which the state and output types are the same.
	 * @param init - the initial state value
	 * @param next - returns the next state value based on the given inputs:<br/>
	 * - current: the current state<br/>
	 * - next: the current input value<br/>
	 * - index: the input index value<br/>
	 * - halt: function that, when called, ensures no more elements are passed to the reducer
	 * @param stateToResult - (optional) a function that converts the current state to an output value
	 * @typeparam I - the input value type
	 * @typeparam O - the output value type
	 * @example
	 * ```ts
	 * const boolToString = Reducer.createOutput(
	 *   '',
	 *   (current, value: boolean) => current + (value ? 'T' : 'F')
	 * );
	 * const result = Stream.of(true, false, true).reduce(boolToString);
	 * console.log(result);
	 * // => 'TFT'
	 * ```
	 */
	createOutput<I, O = I>(
		init: (initHalt: () => void) => O,
		next: (current: O, next: I, index: number, halt: () => void) => O,
		stateToResult?: (state: O, index: number, halted: boolean) => O,
	): Reducer<I, O>;

	/**
	 * Returns a `Reducer` that uses the given `init` and `next` values to fold the input values into
	 * result values.
	 * @param init - an (optionally lazy) initial result value
	 * @param next - a function taking the following arguments:<br/>
	 * - current - the current result value<br/>
	 * - value - the next input value<br/>
	 * - index: the input index value<br/>
	 * - halt: function that, when called, ensures no more elements are passed to the reducer
	 * @typeparam T - the input type
	 * @typeparam R - the output type
	 */
	fold<T, R>(
		init: OptLazy<R>,
		next: (current: R, value: T, index: number, halt: () => void) => R,
	): Reducer<T, R>;

	/**
	 * A `Reducer` that sums all given numeric input values.
	 * @example
	 * ```ts
	 * console.log(Stream.range({ amount: 5 }).reduce(Reducer.sum))
	 * // => 10
	 * ```
	 */
	sum: Reducer<number>;

	/**
	 * A `Reducer` that calculates the product of all given numeric input values.
	 * @example
	 * ```ts
	 * console.log(Stream.range({ start: 1, amount: 5 }).reduce(product))
	 * // => 120
	 * ```
	 */
	product: Reducer<number>;

	/**
	 * A `Reducer` that calculates the average of all given numberic input values.
	 * @example
	 * ```ts
	 * console.log(Stream.range({ amount: 5 }).reduce(Reducer.average));
	 * // => 2
	 * ```
	 */
	average: Reducer<number>;

	/**
	 * Returns a `Reducer` that remembers the minimum value of the inputs using the given `compFun` to compare input values
	 * @param compFun - a comparison function for two input values, returning 0 when equal, positive when greater, negetive when smaller
	 * @param otherwise - (default: undefineds) a fallback value when there were no input values given
	 * @typeparam T - the element type
	 * @typeparam O - the fallback value type
	 * @example
	 * ```ts
	 * const stream = Stream.of('abc', 'a', 'abcde', 'ab')
	 * console.log(stream.minBy((s1, s2) => s1.length - s2.length))
	 * // 'a'
	 * ```
	 */
	minBy: {
		<T>(compFun: (v1: T, v2: T) => number): Reducer<T, T | undefined>;
		<T, O>(
			compFun: (v1: T, v2: T) => number,
			otherwise: OptLazy<O>,
		): Reducer<T, T | O>;
	};

	/**
	 * Returns a `Reducer` that remembers the minimum value of the numberic inputs.
	 * @param otherwise - (default: undefined) a fallback value when there were no input values given
	 * @typeparam O - the fallback value type
	 * @example
	 * ```ts
	 * console.log(Stream.of(5, 3, 7, 4).reduce(Reducer.min()))
	 * // => 3
	 * ```
	 */
	min: {
		(): Reducer<number, number | undefined>;
		<O>(otherwise: OptLazy<O>): Reducer<number, number | O>;
	};

	/**
	 * Returns a `Reducer` that remembers the maximum value of the inputs using the given `compFun` to compare input values
	 * @param compFun - a comparison function for two input values, returning 0 when equal, positive when greater, negetive when smaller
	 * @param otherwise - (default: undefined) a fallback value when there were no input values given
	 * @typeparam T - the element type
	 * @typeparam O - the fallback value type
	 * @example
	 * ```ts
	 * const stream = Stream.of('abc', 'a', 'abcde', 'ab')
	 * console.log(stream.maxBy((s1, s2) => s1.length - s2.length))
	 * // 'abcde'
	 * ```
	 */
	maxBy: {
		<T>(compFun: (v1: T, v2: T) => number): Reducer<T, T | undefined>;
		<T, O>(
			compFun: (v1: T, v2: T) => number,
			otherwise: OptLazy<O>,
		): Reducer<T, T | O>;
	};

	/**
	 * Returns a `Reducer` that remembers the maximum value of the numberic inputs.
	 * @param otherwise - (default: undefined) a fallback value when there were no input values given
	 * @typeparam O - the fallback value type
	 * @example
	 * ```ts
	 * console.log(Stream.of(5, 3, 7, 4).reduce(Reducer.max()))
	 * // => 7
	 * ```
	 */
	max: {
		(): Reducer<number, number | undefined>;
		<O>(otherwise: OptLazy<O>): Reducer<number, number | O>;
	};

	/**
	 * Returns a `Reducer` that joins the given input values into a string using the given options.
	 * @param options - an object containing:<br/>
	 * - sep: (optional) a seperator string value between values in the output<br/>
	 * - start: (optional) a start string to prepend to the output<br/>
	 * - end: (optional) an end string to append to the output<br/>
	 * @typeparam T - the input element type
	 * @example
	 * ```ts
	 * console.log(Stream.of(1, 2, 3).reduce(Reducer.join({ sep: '-' })))
	 * // => '1-2-3'
	 * ```
	 */
	join<T>(
		options?:
			| {
					sep?: string | undefined;
					start?: string | undefined;
					end?: string | undefined;
					valueToString?: ((value: T) => string) | undefined;
			  }
			| undefined,
	): Reducer<T, string>;

	/**
	 * A `Reducer` that remembers the amount of input items provided.
	 * @example
	 * ```ts
	 * const stream = Stream.range({ amount: 10 })
	 * console.log(stream.reduce(Reducer.count))
	 * // => 10
	 * ```
	 */
	count: Reducer<any, number>;

	/**
	 * Returns a `Reducer` that remembers the first input value.
	 * @param otherwise - (default: undefined) a fallback value to output if no input value has been provided
	 * @typeparam T - the input value type
	 * @typeparam O - the fallback value type
	 * @example
	 * ```ts
	 * console.log(Stream.range({ amount: 10 }).reduce(Reducer.first()))
	 * // => 0
	 * ```
	 */
	first: {
		<T>(): Reducer<T, T | undefined>;
		<T, O>(otherwise: OptLazy<O>): Reducer<T, T | O>;
	};

	/**
	 * Returns a `Reducer` that remembers the last input value.
	 * @param otherwise - (default: undefined) a fallback value to output if no input value has been provided
	 * @typeparam T - the input value type
	 * @typeparam O - the fallback value type
	 * @example
	 * ```ts
	 * console.log(Stream.range({ amount: 10 }).reduce(Reducer.last()))
	 * // => 9
	 * ```
	 */
	last: {
		<T>(): Reducer<T, T | undefined>;
		<T, O>(otherwise: OptLazy<O>): Reducer<T, T | O>;
	};

	/**
	 * Returns a Reducer that only produces an output value when having receives exactly one
	 * input value, otherwise will return the `otherwise` value or undefined.
	 * @param otherwise - the fallback value to return when more or less than one value is received.
	 * @typeparam T - the element type
	 * @typeparam O - the fallback value type
	 */
	single: {
		<T>(): Reducer<T, T | undefined>;
		<T, O>(otherwise: OptLazy<O>): Reducer<T, T | O>;
	};

	/**
	 * Returns a `Reducer` that ouputs false as long as no input value satisfies given `pred`, true otherwise.
	 * @typeparam T - the element type
	 * @param pred - a function taking an input value and its index, and returning true if the value satisfies the predicate
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - negate: (default: false) when true will invert the given predicate
	 * @example
	 * ```ts
	 * console.log(
	 *   Stream.range({ amount: 10 }).reduce(Reducer.some((v) => v > 5))
	 * )
	 * // => true
	 * ```
	 */
	some<T>(
		pred: (value: T, index: number) => boolean,
		options?: { negate?: boolean } | undefined,
	): Reducer<T, boolean>;

	/**
	 * Returns a `Reducer` that ouputs true as long as all input values satisfy the given `pred`, false otherwise.
	 * @typeparam T - the element type
	 * @param pred - a function taking an input value and its index, and returning true if the value satisfies the predicate
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - negate: (default: false) when true will invert the given predicate
	 * @example
	 * ```ts
	 * console.log(
	 *   Stream.range({ amount: 10 }).reduce(Reducer.every((v) => v < 5))
	 * )
	 * // => false
	 * ```
	 */
	every<T>(
		pred: (value: T, index: number) => boolean,
		options?: { negate?: boolean } | undefined,
	): Reducer<T, boolean>;

	/**
	 * Returns a `Reducer` that ouputs true when the received elements match the given `other` stream source according to the `eq` instance, false otherwise.
	 * @typeparam T - the element type
	 * @param other - a stream source containg elements to match against
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
	 * - negate: (default: false) when true will invert the given predicate
	 */
	equals<T>(
		other: StreamSource<T>,
		options?: { eq?: Eq<T>; negate?: boolean } | undefined,
	): Reducer<T, boolean>;

	/**
	 * Returns a `Reducer` that outputs false as long as the given `elem` has not been encountered the given `amount` of times in the input values, true otherwise.
	 * @typeparam T - the element type
	 * @param elem - the element to search for
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - amount: (detaulf: 1) the amount of elements to find
	 * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
	 * - negate: (default: false) when true will invert the given predicate
	 * @example
	 * ```ts
	 * console.log(Stream.range({ amount: 10 }).reduce(Reducer.contains(5)))
	 * // => true
	 * ```
	 */
	contains<T, T2 extends T = T>(
		elem: T2,
		options?:
			| {
					amount?: number | undefined;
					eq?: Eq<T | T2> | undefined;
					negate?: boolean | undefined;
			  }
			| undefined,
	): Reducer<T, boolean>;

	/**
	 * Returns a `Reducer` that returns true if the first input values match the given `slice` values repeated `amount` times. Otherwise,
	 * returns false.
	 * @param slice - a sequence of elements to match against
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - amount: (detaulf: 1) the amount of elements to find
	 * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
	 */
	startsWithSlice<T>(
		slice: StreamSource<T>,
		options?:
			| { eq?: Eq<T> | undefined; amount?: number | undefined }
			| undefined,
	): Reducer<T, boolean>;

	/**
	 * Returns a `Reducer` that returns true if the last input values match the given `slice` values repeated `amount` times. Otherwise,
	 * returns false.
	 * @param slice - a sequence of elements to match against
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - amount: (detaulf: 1) the amount of elements to find
	 * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
	 */
	endsWithSlice<T>(
		slice: StreamSource<T>,
		options?:
			| { eq?: Eq<T> | undefined; amount?: number | undefined }
			| undefined,
	): Reducer<T, boolean>;

	/**
	 * Returns a `Reducer` that returns true if the input values contain the given `slice` sequence `amount` times. Otherwise,
	 * returns false.
	 * @param slice - a sequence of elements to match against
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - amount: (detaulf: 1) the amount of elements to find
	 * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
	 */
	containsSlice<T>(
		slice: StreamSource<T>,
		options?:
			| { eq?: Eq<T> | undefined; amount?: number | undefined }
			| undefined,
	): Reducer<T, boolean>;

	/**
	 * A `Reducer` that takes boolean values and outputs true if all input values are true, and false otherwise.
	 * @example
	 * ```ts
	 * console.log(Stream.of(true, false, true)).reduce(Reducer.and))
	 * // => false
	 * ```
	 */
	and: Reducer<boolean>;

	/**
	 * A `Reducer` that takes boolean values and outputs true if one or more input values are true, and false otherwise.
	 * @example
	 * ```ts
	 * console.log(Stream.of(true, false, true)).reduce(Reducer.or))
	 * // => true
	 * ```
	 */
	or: Reducer<boolean>;

	/**
	 * A `Reducer` that outputs true if no input values are received, false otherwise.
	 * @example
	 * ```ts
	 * console.log(Stream.of(1, 2, 3).reduce(Reducer.isEmpty))
	 * // => false
	 * ```
	 */
	isEmpty: Reducer<any, boolean>;

	/**
	 * A `Reducer` that outputs true if one or more input values are received, false otherwise.
	 * @example
	 * ```ts
	 * console.log(Stream.of(1, 2, 3).reduce(Reducer.nonEmpty))
	 * // => true
	 * ```
	 */
	nonEmpty: Reducer<any, boolean>;

	/**
	 * Returns a `Reducer` that always outputs the given `value`, and does not accept input values.
	 */
	constant<T>(value: OptLazy<T>): Reducer<any, T>;

	/**
	 * Returns a `Reducer` that splits the incoming values into two separate outputs based on the given `pred` predicate. Values for which the predicate is true
	 * are fed into the `collectorTrue` reducer, and other values are fed into the `collectorFalse` instance. If no collectors are provided the values are collected
	 * into arrays.
	 * @param pred - a predicate receiving the value and its index
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - collectorTrue: (default: Reducer.toArray()) a reducer that collects the values for which the predicate is true<br/>
	 * - collectorFalse: (default: Reducer.toArray()) a reducer that collects the values for which the predicate is false
	 * @typeparam T - the input element type
	 * @typeparam RT - the reducer result type for the `collectorTrue` value
	 * @typeparam RF - the reducer result type for the `collectorFalse` value
	 * @note if the predicate is a type guard, the return type is automatically inferred
	 * @example
	 * ```ts
	 * Stream.of(1, 2, 3).partition((v) => v % 2 === 0)
	 * // => [[2], [1, 3]]
	 *
	 * Stream.of<number | string>(1, 'a', 'b', 2)
	 *   .partition((v): v is string => typeof v === 'string')
	 * // => [['a', 'b'], [1, 2]]
	 * // return type is: [string[], number[]]
	 *
	 * Stream.of(1, 2, 3, 4).partition(
	 *   (v) => v % 2 === 0,
	 *   { collectorTrue: Reducer.toJSSet(), collectorFalse: Reducer.sum }
	 * )
	 * // => [Set(2, 4), 4]
	 * ```
	 */
	partition: {
		<T, T2 extends T, RT, RF = RT>(
			pred: (value: T, index: number) => value is T2,
			options: {
				collectorTrue: Reducer<T2, RT>;
				collectorFalse: Reducer<Exclude<T, T2>, RF>;
			},
		): Reducer<T, [true: RT, false: RF]>;
		<T, T2 extends T>(
			pred: (value: T, index: number) => value is T2,
			options?: {
				collectorTrue?: undefined;
				collectorFalse?: undefined;
			},
		): Reducer<T, [true: T2[], false: Exclude<T, T2>[]]>;
		<T, RT, RF = RT>(
			pred: (value: T, index: number) => boolean,
			options: {
				collectorTrue: Reducer<T, RT>;
				collectorFalse: Reducer<T, RF>;
			},
		): Reducer<T, [true: RT, false: RF]>;
		<T>(
			pred: (value: T, index: number) => boolean,
			options?: {
				collectorTrue?: undefined;
				collectorFalse?: undefined;
			},
		): Reducer<T, [true: T[], false: T[]]>;
	};

	/**
	 * Returns a `Reducer` that uses the `valueToKey` function to calculate a key for each value, and feeds the tuple of the key and the value to the
	 * `collector` reducer. Finally, it returns the output of the `collector`. If no collector is given, the default collector will return a JS multimap
	 * of the type `Map<K, V[]>`.
	 * @param valueToKey - function taking a value and its index, and returning the corresponding key
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - collector: (default: Reducer.toArray()) a reducer that collects the incoming tuple of key and value, and provides the output
	 * @typeparam T - the input value type
	 * @typeparam K - the key type
	 * @typeparam R - the collector output type
	 * @example
	 * ```ts
	 * Stream.of(1, 2, 3).groupBy((v) => v % 2)
	 * // => Map {0 => [2], 1 => [1, 3]}
	 * ```
	 */
	groupBy: {
		<T, K, R, T2 extends readonly [K, T] = [K, T]>(
			valueToKey: (value: T, index: number) => K,
			options: {
				collector: Reducer<[K, T] | T2, R>;
			},
		): Reducer<T, R>;
		<T, K>(
			valueToKey: (value: T, index: number) => K,
			options?: {
				collector?: undefined;
			},
		): Reducer<T, Map<K, T[]>>;
	};

	/**
	 * Returns a `Reducer` that feeds incoming values to all reducers in the provided `reducers` source, and halts when the first
	 * reducer in the array is halted and returns the output of that reducer. Returns the `otherwise` value if no reducer is yet halted.
	 * @param reducers - a stream source of reducers that will receive the incoming values
	 * @param otherwise - a fallback value to return if none of the reducers has been halted
	 * @typeparam T - the input value type
	 * @typeparam R - the output value type
	 * @typeparam O - the fallback value type
	 */
	race: {
		<T, R, O>(
			reducers: StreamSource<Reducer<T, R>>,
			otherwise: OptLazy<O>,
		): Reducer<T, R | O>;
		<T, R>(reducers: StreamSource<Reducer<T, R>>): Reducer<T, R | undefined>;
	};

	/**
	 * Returns a `Reducer` that collects received input values in an array, and returns a copy of that array as an output value when requested.
	 * @typeparam T - the element type
	 * @param options - (optional) object specifying the following properties<br/>
	 * - reversed: (optional) when true will create a reversed array
	 * @example
	 * ```ts
	 * console.log(Stream.of(1, 2, 3).reduce(Reducer.toArray()))
	 * // => [1, 2, 3]
	 * console.log(Stream.of(1, 2, 3).reduce(Reducer.toArray({ reversed: true })))
	 * // => [3, 2, 1]
	 * ```
	 */
	toArray<T>(
		options?: { reversed?: boolean | undefined } | undefined,
	): Reducer<T, T[]>;

	/**
	 * Returns a `Reducer` that collects received input tuples into a mutable JS Map, and returns
	 * a copy of that map when output is requested.
	 * @typeparam K - the map key type
	 * @typeparam V - the map value type
	 * @example
	 * ```ts
	 * console.log(Stream.of([1, 'a'], [2, 'b']).reduce(Reducer.toJSMap()))
	 * // Map { 1 => 'a', 2 => 'b' }
	 * ```
	 */
	toJSMap<K, V>(): Reducer<readonly [K, V], Map<K, V>>;

	/**
	 * Returns a `Reducer` that collects received input tuples into a mutable JS multimap, and returns
	 * a copy of that map when output is requested.
	 * @typeparam K - the map key type
	 * @typeparam V - the map value type
	 * @example
	 * ```ts
	 * console.log(Stream.of([1, 'a'], [2, 'b']).reduce(Reducer.toJSMap()))
	 * // Map { 1 => 'a', 2 => 'b' }
	 * ```
	 */
	toJSMultiMap<K, V>(): Reducer<readonly [K, V], Map<K, V[]>>;

	/**
	 * Returns a `Reducer` that collects received input values into a mutable JS Set, and returns
	 * a copy of that map when output is requested.
	 * @typeparam T - the element type
	 * @example
	 * ```ts
	 * console.log(Stream.of(1, 2, 3).reduce(Reducer.toJSSet()))
	 * // Set {1, 2, 3}
	 * ```
	 */
	toJSSet<T>(): Reducer<T, Set<T>>;

	/**
	 * Returns a `Reducer` that collects 2-tuples containing keys and values into a plain JS object, and
	 * returns a copy of that object when output is requested.
	 * @typeparam K - the result object key type
	 * @typeparam V - the result object value type
	 * @example
	 * ```ts
	 * console.log(Stream.of(['a', 1], ['b', true]).reduce(Reducer.toJSObject()))
	 * // { a: 1, b: true }
	 * ```
	 */
	toJSObject<K extends string | number | symbol, V>(): Reducer<
		readonly [K, V],
		Record<K, V>
	>;

	/**
	 * Returns a `Reducer` that combines multiple input `reducers` according to the given "shape" by providing input values to all of them and collecting the outputs in the shape.
	 * @typeparam T - the input value type for all the reducers
	 * @typeparam S - the desired result shape type
	 * @param shape - a shape defining where reducer outputs will be located in the result. It can consist of a single reducer, an array of shapes, or an object with string keys and shapes as values.
	 * @example
	 * ```ts
	 * const red = Reducer.combine([Reducer.sum, { av: [Reducer.average] }])
	 * console.log(Stream.range({amount: 9 }).reduce(red))
	 * // => [36, { av: [4] }]
	 * ```
	 */
	combine<const S extends Reducer.CombineShape<any>>(
		shape: S &
			Reducer.CombineShape<S extends Reducer.CombineShape<infer T> ? T : never>,
	): Reducer<
		S extends Reducer.CombineShape<infer T> ? T : never,
		Reducer.CombineResult<S>
	>;

	/**
	 * Returns a `Reducer` instance that first applies this reducer, and then applies the given `next` reducer to each output produced
	 * by the previous reducer.
	 * @typeparam I - the input type of the `reducer1` reducer
	 * @typeparam O1 - the output type of the `reducer1` reducer
	 * @typeparam O2 - the output type of the `reducer2` reducer
	 * @typeparam O3 - the output type of the `reducer3` reducer
	 * @typeparam O4 - the output type of the `reducer4` reducer
	 * @typeparam O5 - the output type of the `reducer5` reducer
	 * @param reducer1 - the next reducer to apply to each output of this reducer.
	 * @param reducer2 - (optional) the next reducer to apply to each output of this reducer.
	 * @param reducer3 - (optional) the next reducer to apply to each output of this reducer.
	 * @param reducer4 - (optional) the next reducer to apply to each output of this reducer.
	 * @param reducer5 - (optional) the next reducer to apply to each output of this reducer.
	 * @example
	 * ```ts
	 * Stream.of(1, 2, 3)
	 *  .reduce(
	 *    Reducer.pipe(Reducer.product, Reducer.sum)
	 *  )
	 * // => 9
	 * ```
	 */
	pipe: {
		<I, O1, O2>(
			reducer1: Reducer<I, O1>,
			reducer2: Reducer<O1, O2>,
		): Reducer<I, O2>;
		<I, O1, O2, O3>(
			reducer1: Reducer<I, O1>,
			reducer2: Reducer<O1, O2>,
			reducer3: Reducer<O2, O3>,
		): Reducer<I, O3>;
		<I, O1, O2, O3, O4>(
			reducer1: Reducer<I, O1>,
			reducer2: Reducer<O1, O2>,
			reducer3: Reducer<O2, O3>,
			reducer4: Reducer<O3, O4>,
		): Reducer<I, O4>;
		<I, O1, O2, O3, O4, O5>(
			reducer1: Reducer<I, O1>,
			reducer2: Reducer<O1, O2>,
			reducer3: Reducer<O2, O3>,
			reducer4: Reducer<O3, O4>,
			reducer5: Reducer<O4, O5>,
		): Reducer<I, O5>;
	};
}
