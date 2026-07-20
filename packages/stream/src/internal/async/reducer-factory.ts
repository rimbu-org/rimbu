import type { AsyncOptLazy, MaybePromise } from '@rimbu/common/async-opt-lazy';
import type { Eq } from '@rimbu/common/eq';
import type { AsyncStreamSource } from '@rimbu/stream/async';
import type { AsyncReducer } from '@rimbu/stream/async/reducer';

export interface AsyncReducerFactory {
	/**
	 * Returns an `AsyncReducer` with the given options:
	 * @param init - the optionally lazy and/or promised initial state value
	 * @param next - returns (potentially asynchronously) the next state value based on the given inputs:<br/>
	 * - current: the current state<br/>
	 * - next: the current input value<br/>
	 * - index: the input index value<br/>
	 * - halt: function that, when called, ensures no more elements are passed to the reducer
	 * @param stateToResult - a potentially asynchronous function that converts the current state to an output value
	 * @param onClose - (optional) a function that will be called when the reducer will no longer receive values
	 * @typeparam I - the input value type
	 * @typeparam O - the output value type
	 * @typeparam S - the internal state type
	 */
	create<I, O = I, S = O>(
		init: (initHalt: () => void) => MaybePromise<S>,
		next: (
			current: S,
			next: I,
			index: number,
			halt: () => void,
		) => MaybePromise<S>,
		stateToResult: (
			state: S,
			index: number,
			halted: boolean,
		) => MaybePromise<O>,
		onClose?: (state: S, error?: unknown) => MaybePromise<void>,
	): AsyncReducer<I, O>;

	/**
	 * Returns an `AsyncReducer` of which the input, state, and output types are the same.
	 * @param init - the optionally lazy and/or promised initial state value
	 * @param next - returns (potentially asynchronously) the next state value based on the given inputs:<br/>
	 * - current: the current state<br/>
	 * - next: the current input value<br/>
	 * - index: the input index value<br/>
	 * - halt: function that, when called, ensures no more elements are passed to the reducer
	 * @param stateToResult - a potentially asynchronous function that converts the current state to an output value
	 * @param onClose - (optional) a function that will be called when the reducer will no longer receive values
	 * @typeparam T - the overall value type
	 */
	createMono<T>(
		init: (initHalt: () => void) => MaybePromise<T>,
		next: (
			current: T,
			next: T,
			index: number,
			halt: () => void,
		) => MaybePromise<T>,
		stateToResult?: (
			state: T,
			index: number,
			halted: boolean,
		) => MaybePromise<T>,
		onClose?: (state: T, error?: unknown) => MaybePromise<void>,
	): AsyncReducer<T>;

	/**
	 * Returns an `AsyncReducer` of which the state and output types are the same.
	 * @param init - the optionally lazy and/or promised initial state value
	 * @param next - returns (potentially asynchronously) the next state value based on the given inputs:<br/>
	 * - current: the current state<br/>
	 * - next: the current input value<br/>
	 * - index: the input index value<br/>
	 * - halt: function that, when called, ensures no more elements are passed to the reducer
	 * @param stateToResult - a potentially asynchronous function that converts the current state to an output value
	 * @param onClose - (optional) a function that will be called when the reducer will no longer receive values
	 * @typeparam I - the input value type
	 * @typeparam O - the output value type
	 */
	createOutput<I, O = I>(
		init: (initHalt: () => void) => MaybePromise<O>,
		next: (
			current: O,
			next: I,
			index: number,
			halt: () => void,
		) => MaybePromise<O>,
		stateToResult?: (
			state: O,
			index: number,
			halted: boolean,
		) => MaybePromise<O>,
		onClose?: (state: O, error?: unknown) => MaybePromise<void>,
	): AsyncReducer<I, O>;

	/**
	 * Returns an `AsyncReducer` that uses the given `init` and `next` values to fold the input values into
	 * result values.
	 * @param init - an (optionally lazy) initial result value
	 * @param next - a (potentially async) function taking the following arguments:<br/>
	 * - current - the current result value<br/>
	 * - value - the next input value<br/>
	 * - index: the input index value<br/>
	 * - halt: function that, when called, ensures no more elements are passed to the reducer
	 * @typeparam T - the input type
	 * @typeparam R - the output type
	 */
	fold<T, R>(
		init: AsyncOptLazy<R>,
		next: (
			current: R,
			value: T,
			index: number,
			halt: () => void,
		) => MaybePromise<R>,
	): AsyncReducer<T, R>;

	/**
	 * Returns an `AsyncReducer` from a given `Reducer` or `AsyncReducer` instance.
	 * @param reducer - the input reducer to convert
	 * @typeparam I - the input element type
	 * @typeparam O - the output element type
	 */
	from<I, O>(reducer: AsyncReducer.Accept<I, O>): AsyncReducer<I, O>;

	/**
	 * Returns a `Reducer` that remembers the minimum value of the inputs using the given `compFun` to compare input values
	 * @param compFun - a comparison function for two input values, returning 0 when equal, positive when greater, negetive when smaller
	 * @param otherwise - (default: undefineds) a fallback value when there were no input values given
	 * @typeparam T - the element type
	 * @typeparam O - the fallback value type
	 * @example
	 * ```ts
	 * import { Stream } from '@rimbu/stream';
	 *
	 * const stream = Stream.of('abc', 'a', 'abcde', 'ab')
	 * console.log(stream.minBy((s1, s2) => s1.length - s2.length))
	 * // 'a'
	 * ```
	 */
	minBy: {
		<T>(
			compFun: (v1: T, v2: T) => MaybePromise<number>,
		): AsyncReducer<T, T | undefined>;
		<T, O>(
			compFun: (v1: T, v2: T) => MaybePromise<number>,
			otherwise: AsyncOptLazy<O>,
		): AsyncReducer<T, T | O>;
	};

	/**
	 * Returns a `Reducer` that remembers the minimum value of the numberic inputs.
	 * @param otherwise - (default: undefined) a fallback value when there were no input values given
	 * @typeparam O - the fallback value type
	 * @example
	 * ```ts
	 * import { Stream } from '@rimbu/stream';
	 * import { Reducer } from '@rimbu/stream/reducer';
	 *
	 * console.log(Stream.of(5, 3, 7, 4).reduce(Reducer.min()))
	 * // => 3
	 * ```
	 */
	min: {
		(): AsyncReducer<number, number | undefined>;
		<O>(otherwise: AsyncOptLazy<O>): AsyncReducer<number, number | O>;
	};

	/**
	 * Returns a `Reducer` that remembers the maximum value of the inputs using the given `compFun` to compare input values
	 * @param compFun - a comparison function for two input values, returning 0 when equal, positive when greater, negetive when smaller
	 * @param otherwise - (default: undefined) a fallback value when there were no input values given
	 * @typeparam T - the element type
	 * @typeparam O - the fallback value type
	 * @example
	 * ```ts
	 * import { Stream } from '@rimbu/stream';
	 *
	 * const stream = Stream.of('abc', 'a', 'abcde', 'ab')
	 * console.log(stream.maxBy((s1, s2) => s1.length - s2.length))
	 * // 'abcde'
	 * ```
	 */
	maxBy: {
		<T>(
			compFun: (v1: T, v2: T) => MaybePromise<number>,
		): AsyncReducer<T, T | undefined>;
		<T, O>(
			compFun: (v1: T, v2: T) => MaybePromise<number>,
			otherwise: AsyncOptLazy<O>,
		): AsyncReducer<T, T | O>;
	};

	/**
	 * Returns a `Reducer` that remembers the maximum value of the numberic inputs.
	 * @param otherwise - (default: undefined) a fallback value when there were no input values given
	 * @typeparam O - the fallback value type
	 * @example
	 * ```ts
	 * import { Stream } from '@rimbu/stream';
	 * import { Reducer } from '@rimbu/stream/reducer';
	 *
	 * console.log(Stream.of(5, 3, 7, 4).reduce(Reducer.max()))
	 * // => 7
	 * ```
	 */
	max: {
		(): AsyncReducer<number, number | undefined>;
		<O>(otherwise: AsyncOptLazy<O>): AsyncReducer<number, number | O>;
	};

	/**
	 * Returns an `AsyncReducer` that remembers the first input value.
	 * @param otherwise - (default: undefined) a fallback value to output if no input value has been provided
	 * @typeparam T - the input value type
	 * @typeparam O - the fallback value type
	 * @example
	 * ```ts
	 * import { Stream } from '@rimbu/stream';
	 * import { AsyncStream } from '@rimbu/stream/async';
	 * import { AsyncReducer } from '@rimbu/stream/async/reducer';
	 *
	 * await AsyncStream.from(Stream.range({ amount: 10 })).reduce(
	 *   AsyncReducer.first()
	 * )
	 * // => 0
	 * ```
	 */
	first: {
		<T>(): AsyncReducer<T, T | undefined>;
		<T, O>(otherwise: AsyncOptLazy<O>): AsyncReducer<T, T | O>;
	};

	/**
	 * Returns an `AsyncReducer` that remembers the last input value.
	 * @param otherwise - (default: undefined) a fallback value to output if no input value has been provided
	 * @typeparam T - the input value type
	 * @typeparam O - the fallback value type
	 * @example
	 * ```ts
	 * import { Stream } from '@rimbu/stream';
	 * import { AsyncStream } from '@rimbu/stream/async';
	 * import { AsyncReducer } from '@rimbu/stream/async/reducer';
	 *
	 * await AsyncStream.from(Stream.range({ amount: 10 })).reduce(
	 *   AsyncReducer.last()
	 * )
	 * // => 9
	 * ```
	 */
	last: {
		<T>(): AsyncReducer<T, T | undefined>;
		<T, O>(otherwise: AsyncOptLazy<O>): AsyncReducer<T, T | O>;
	};

	/**
	 * Returns an AsyncReducer that only produces an output value when having receives exactly one
	 * input value, otherwise will return the `otherwise` value or undefined.
	 * @param otherwise - the fallback value to return when more or less than one value is received.
	 * @typeparam T - the element type
	 * @typeparam O - the fallback value type
	 */
	single: {
		<T>(): AsyncReducer<T, T | undefined>;
		<T, O>(otherwise: AsyncOptLazy<O>): AsyncReducer<T, T | O>;
	};

	/**
	 * Returns an `AsyncReducer` that ouputs false as long as no input value satisfies given `pred`, true otherwise.
	 * @typeparam T - the element type
	 * @param pred - a potentiall async function taking an input value and its index, and returning true if the value satisfies the predicate
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - negate: (default: false) when true will invert the given predicate
	 */
	some<T>(
		pred: (value: T, index: number) => MaybePromise<boolean>,
		options?: { negate?: boolean | undefined } | undefined,
	): AsyncReducer<T, boolean>;

	/**
	 * Returns an `AsyncReducer` that ouputs true as long as all input values satisfy the given `pred`, false otherwise.
	 * @typeparam T - the element type
	 * @param pred - a potentially async function taking an input value and its index, and returning true if the value satisfies the predicate
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - negate: (default: false) when true will invert the given predicate
	 */
	every<T>(
		pred: (value: T, index: number) => MaybePromise<boolean>,
		options?: { negate?: boolean | undefined } | undefined,
	): AsyncReducer<T, boolean>;

	/**
	 * Returns an `AsyncReducer` that ouputs true when the received elements match the given `other` async stream source according to the `eq` instance, false otherwise.
	 * @typeparam T - the element type
	 * @param other - an async stream source containg elements to match against
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
	 * - negate: (default: false) when true will invert the given predicate
	 */
	equals<T>(
		other: AsyncStreamSource<T>,
		options?:
			| { eq?: Eq<T> | undefined; negate?: boolean | undefined }
			| undefined,
	): AsyncReducer<T, boolean>;

	/**
	 * An `AsyncReducer` that outputs true if no input values are received, false otherwise.
	 * @example
	 * ```ts
	 * import { AsyncStream } from '@rimbu/stream/async';
	 * import { AsyncReducer } from '@rimbu/stream/async/reducer';
	 *
	 * await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.isEmpty)
	 * // => false
	 * ```
	 */
	isEmpty: AsyncReducer<any, boolean>;

	/**
	 * An `AsyncReducer` that outputs true if one or more input values are received, false otherwise.
	 * @example
	 * ```ts
	 * import { AsyncStream } from '@rimbu/stream/async';
	 * import { AsyncReducer } from '@rimbu/stream/async/reducer';
	 *
	 * await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.nonEmpty)
	 * // => true
	 * ```
	 */
	nonEmpty: AsyncReducer<any, boolean>;

	/**
	 * Returns a `AsyncReducer` that returns true if the first input values match the given `slice` values repeated `amount` times. Otherwise,
	 * returns false.
	 * @param slice - a async sequence of elements to match against
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - amount: (detaulf: 1) the amount of elements to find
	 * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
	 */
	startsWithSlice<T>(
		slice: AsyncStreamSource<T>,
		options?: { eq?: Eq<T> | undefined; amount?: number } | undefined,
	): AsyncReducer<T, boolean>;

	/**
	 * Returns an `AsyncReducer` that returns true if the last input values match the given `slice` values repeated `amount` times. Otherwise,
	 * returns false.
	 * @param slice - a async sequence of elements to match against
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - amount: (detaulf: 1) the amount of elements to find
	 * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
	 */
	endsWithSlice<T>(
		slice: AsyncStreamSource<T>,
		options?: { eq?: Eq<T> | undefined; amount?: number } | undefined,
	): AsyncReducer<T, boolean>;

	/**
	 * Returns an `AsyncReducer` that returns true if the input values contain the given `slice` sequence `amount` times. Otherwise,
	 * returns false.
	 * @param slice - a async sequence of elements to match against
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - amount: (detaulf: 1) the amount of elements to find
	 * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
	 */
	containsSlice<T>(
		slice: AsyncStreamSource<T>,
		options?:
			| { eq?: Eq<T> | undefined; amount?: number | undefined }
			| undefined,
	): AsyncReducer<T, boolean>;

	/**
	 * Returns an `AsyncReducer` that splits the incoming values into two separate outputs based on the given `pred` predicate. Values for which the predicate is true
	 * are fed into the `collectorTrue` reducer, and other values are fed into the `collectorFalse` instance. If no collectors are provided the values are collected
	 * into arrays.
	 * @param pred - a potentially async predicate receiving the value and its index
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - collectorTrue: (default: Reducer.toArray()) a reducer that collects the values for which the predicate is true<br/>
	 * - collectorFalse: (default: Reducer.toArray()) a reducer that collects the values for which the predicate is false
	 * @typeparam T - the input element type
	 * @typeparam RT - the reducer result type for the `collectorTrue` value
	 * @typeparam RF - the reducer result type for the `collectorFalse` value
	 * @note if the predicate is a type guard, the return type is automatically inferred
	 * ```
	 */
	partition: {
		<T, T2 extends T, RT, RF = RT>(
			pred: (value: T, index: number) => value is T2,
			options: {
				collectorTrue: AsyncReducer.Accept<T2, RT>;
				collectorFalse: AsyncReducer.Accept<Exclude<T, T2>, RF>;
			},
		): AsyncReducer<T, [true: RT, false: RF]>;
		<T, T2 extends T>(
			pred: (value: T, index: number) => value is T2,
			options?: {
				collectorTrue?: undefined;
				collectorFalse?: undefined;
			},
		): AsyncReducer<T, [true: T2[], false: Exclude<T, T2>[]]>;
		<T, RT, RF = RT>(
			pred: (value: T, index: number) => MaybePromise<boolean>,
			options: {
				collectorTrue: AsyncReducer.Accept<T, RT>;
				collectorFalse: AsyncReducer.Accept<T, RF>;
			},
		): AsyncReducer<T, [true: RT, false: RF]>;
		<T>(
			pred: (value: T, index: number) => MaybePromise<boolean>,
			options?: {
				collectorTrue?: undefined;
				collectorFalse?: undefined;
			},
		): AsyncReducer<T, [true: T[], false: T[]]>;
	};

	/**
	 * Returns an `AsyncReducer` that uses the `valueToKey` function to calculate a key for each value, and feeds the tuple of the key and the value to the
	 * `collector` reducer. Finally, it returns the output of the `collector`. If no collector is given, the default collector will return a JS multimap
	 * of the type `Map<K, V[]>`.
	 * @param valueToKey - potentially async function taking a value and its index, and returning the corresponding key
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - collector: (default: Reducer.toArray()) a reducer that collects the incoming tuple of key and value, and provides the output
	 * @typeparam T - the input value type
	 * @typeparam K - the key type
	 * @typeparam R - the collector output type
	 * ```
	 */
	groupBy: {
		<T, K, R, T2 extends readonly [K, T] = [K, T]>(
			valueToKey: (value: T, index: number) => MaybePromise<K>,
			options: {
				collector: AsyncReducer.Accept<[K, T] | T2, R>;
			},
		): AsyncReducer<T, R>;
		<T, K>(
			valueToKey: (value: T, index: number) => MaybePromise<K>,
			options?: {
				collector?: undefined;
			},
		): AsyncReducer<T, Map<K, T[]>>;
	};

	/**
	 * Returns an `AsyncReducer` that feeds incoming values to all reducers in the provided `reducers` source, and halts when the first
	 * reducer in the array is halted and returns the output of that reducer. Returns the `otherwise` value if no reducer is yet halted.
	 * @param reducers - a stream source of async reducers that will receive the incoming values
	 * @param otherwise - a fallback value to return if none of the reducers has been halted
	 * @typeparam T - the input value type
	 * @typeparam R - the output value type
	 * @typeparam O - the fallback value type
	 */
	race: {
		<T, R, O>(
			reducers: AsyncReducer.Accept<T, R>[],
			otherwise: AsyncOptLazy<O>,
		): AsyncReducer<T, R | O>;
		<T, R>(
			reducers: AsyncReducer.Accept<T, R>[],
		): AsyncReducer<T, R | undefined>;
	};

	/**
	 * Returns an `AsyncReducer` that combines multiple input `reducers` according to the given "shape" by providing input values to all of them and collecting the outputs in the shape.
	 * @typeparam T - the input value type for all the reducers
	 * @typeparam S - the desired result shape type
	 * @param shape - a shape defining where reducer outputs will be located in the result. It can consist of a single reducer, an array of shapes, or an object with string keys and shapes as values.
	 */
	combine<T, const S extends AsyncReducer.CombineShape<T>>(
		shape: S & AsyncReducer.CombineShape<T>,
	): AsyncReducer<T, AsyncReducer.CombineResult<S>>;

	/**
	 * Returns an `AsyncReducer` instance that first applies this reducer, and then applies the given `next` reducer to each output produced
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
	 * import { Stream } from '@rimbu/stream';
	 * import { AsyncStream } from '@rimbu/stream/async';
	 * import { Reducer } from '@rimbu/stream/reducer';
	 * import { AsyncReducer } from '@rimbu/stream/async/reducer';
	 *
	 * AsyncStream
	 *  .from(Stream.of(1, 2, 3))
	 *  .reduce(
	 *    AsyncReducer.pipe(Reducer.product, Reducer.sum)
	 *  )
	 * // => 9
	 * ```
	 */
	pipe: {
		<I, O1, O2>(
			reducer1: AsyncReducer.Accept<I, O1>,
			reducer2: AsyncReducer.Accept<O1, O2>,
		): AsyncReducer<I, O2>;
		<I, O1, O2, O3>(
			reducer1: AsyncReducer.Accept<I, O1>,
			reducer2: AsyncReducer.Accept<O1, O2>,
			reducer3: AsyncReducer.Accept<O2, O3>,
		): AsyncReducer<I, O3>;
		<I, O1, O2, O3, O4>(
			reducer1: AsyncReducer.Accept<I, O1>,
			reducer2: AsyncReducer.Accept<O1, O2>,
			reducer3: AsyncReducer.Accept<O2, O3>,
			reducer4: AsyncReducer.Accept<O3, O4>,
		): AsyncReducer<I, O4>;
		<I, O1, O2, O3, O4, O5>(
			reducer1: AsyncReducer.Accept<I, O1>,
			reducer2: AsyncReducer.Accept<O1, O2>,
			reducer3: AsyncReducer.Accept<O2, O3>,
			reducer4: AsyncReducer.Accept<O3, O4>,
			reducer5: AsyncReducer.Accept<O4, O5>,
		): AsyncReducer<I, O5>;
	};
}
