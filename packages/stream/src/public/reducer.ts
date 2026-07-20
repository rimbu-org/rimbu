import type { CollectFun } from '@rimbu/common/collect';
import type { IndexRange } from '@rimbu/common/index-range';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { StreamSource } from '@rimbu/stream';

import type { ReducerFactory } from '#stream/reducer-factory';

import { reducerFactoryModule } from '#stream/reducer-factory-module';

/**
 * A `Reducer` is a stand-alone calculation that takes input values of type I, and, when requested, produces an output value of type O.
 * @typeparam I - the input value type
 * @typeparam O - the output value type
 */
export type Reducer<I, O = I> = Reducer.Impl<I, O, unknown>;

export namespace Reducer {
	/**
	 * The Implementation interface for a `Reducer`, which also exposes the internal state type.
	 * @typeparam I - the input value type
	 * @typeparam O - the output value type
	 * @typeparam S - the internal state type
	 */
	export interface Impl<I, O, S = unknown> {
		/**
		 * A function that produces the initial state value for the reducer algorithm.
		 * @param initHalt - a callback function that, if called, indicates that the reducer does not accept any input.
		 */
		readonly init: (initHalt: () => void) => S;
		/**
		 * Returns the next state based on the given input values:
		 * @param state - the current state
		 * @param elem - the current input value
		 * @param index - the current input index
		 * @param halt - a function that, when called, ensures no more values are passed to the reducer
		 */
		next(state: S, elem: I, index: number, halt: () => void): S;
		/**
		 * Returns the output value based on the given `state`.
		 * @param state - the current state
		 * @param index - the value index
		 * @param halted - a boolean indicating whether the reducer is halted
		 */
		stateToResult(state: S, index: number, halted: boolean): O;
		/**
		 * Returns a `Reducer` instance that only passes values to the reducer that satisy the given `pred` predicate.
		 * @param pred - a function that returns true if the value should be passed to the reducer based on the following inputs:<br/>
		 * - value: the current input value<br/>
		 * - index: the current input index<br/>
		 * - halt: function that, when called, ensures no more new values are passed to the reducer
		 * @param options - (optional) an object containing the following properties:<br/>
		 * - negate: (default: false) when true will invert the given predicate
		 * @note if the predicate is a type guard, the return type is automatically inferred
		 */
		filterInput<IF extends I>(
			pred: (value: I, index: number, halt: () => void) => value is IF,
			options?: { negate?: false | undefined },
		): Reducer<IF, O>;
		filterInput<IF extends I>(
			pred: (value: I, index: number, halt: () => void) => value is IF,
			options: { negate: true },
		): Reducer<Exclude<I, IF>, O>;
		filterInput(
			pred: (value: I, index: number, halt: () => void) => boolean,
			options?: { negate?: boolean | undefined },
		): Reducer<I, O>;
		/**
		 * Returns a `Reducer` instance that converts its input values using given `mapFun` before passing them to this reducer.
		 * @param mapFun - a function that returns a new value to pass to the reducer based on the following inputs:<br/>
		 * - value: the current input value<br/>
		 * - index: the current input index
		 * @typeparam I2 - the resulting reducer input type
		 */
		mapInput: <I2>(mapFun: (value: I2, index: number) => I) => Reducer<I2, O>;
		/**
		 * Returns a `Reducer` instance that converts each output value from some source reducer into an arbitrary number of output values
		 * using given `flatMapFun` before passing them to this reducer.
		 * @typeparam I2 - the resulting reducer input type
		 * @param mapFun - a function that returns a new value to pass to the reducer based on the following inputs:<br/>
		 * - value: the current input value<br/>
		 * - index: the current input index
		 */
		flatMapInput<I2>(
			flatMapFun: (value: I2, index: number) => StreamSource<I>,
		): Reducer<I2, O>;
		/**
		 * Returns a `Reducer` instance that converts or filters its input values using given `collectFun` before passing them to the reducer.
		 * @param collectFun - a function receiving<br/>
		 * - `value`: the next value<br/>
		 * - `index`: the value index<br/>
		 * - `skip`: a token that, when returned, will not add a value to the resulting collection<br/>
		 * - `halt`: a function that, when called, ensures no next elements are passed
		 * @typeparam I2 - the resulting reducer input type
		 */
		collectInput<I2>(collectFun: CollectFun<I2, I>): Reducer<I2, O>;
		/**
		 * Returns a `Reducer` instance that converts its output values using given `mapFun`.
		 * @typeparam O2 - the resulting reducer output type
		 * @param mapFun - a function that takes the current output value and converts it to a new output value
		 * @typeparam O2 - the new output type
		 */
		mapOutput<O2>(
			mapFun: (value: O, index: number, halted: boolean) => O2,
		): Reducer<I, O2>;
		/**
		 * Returns a `Reducer` instance that takes at most the given `amount` of input elements, and will ignore subsequent elements.
		 * @param amount - the amount of elements to accept
		 */
		takeInput(amount: number): Reducer<I, O>;
		/**
		 * Returns a `Reducer` instance that skips the first given `amount` of input elements, and will process subsequent elements.
		 * @param amount - the amount of elements to skip
		 */
		dropInput(amount: number): Reducer<I, O>;
		/**
		 * Returns a `Reducer` instance that only processes elements within the given `range`, and ignores other elements.
		 * @param range - (optional) an `IndexRange` specifying which input elements to process; if omitted, all elements are processed
		 */
		sliceInput(range?: IndexRange): Reducer<I, O>;
		/**
		 * Returns a `Reducer` instance that produces at most `amount` values.
		 * @param amount - the maximum amount of values to produce.
		 */
		takeOutput(amount: number): Reducer<I, O>;
		/**
		 * Returns a `Reducer` instance that produces until the given `pred` predicate returns true for
		 * the output value.
		 * @param pred - a function that returns true if the value should be passed to the reducer based on the following inputs:<br/>
		 * - value: the current input value<br/>
		 * - index: the current input index<br/>
		 * - halt: function that, when called, ensures no more new values are passed to the reducer
		 * @param options - (optional) an object containing the following properties:<br/>
		 * - negate: (default: false) when true will invert the given predicate
		 */
		takeOutputUntil(
			pred: (value: O, index: number) => boolean,
			options?: { negate?: boolean },
		): Reducer<I, O>;
		/**
		 * Returns a reducer that applies this reducer and then the `nextReducers` sequentially on halting of each reducer.
		 * It provides the last output value of the active reducer.
		 * @param nextReducers - an number of reducers consuming and producing the same types as the current reducer.
		 */
		chain<O2 extends O>(
			nextReducers: StreamSource<OptLazy<Reducer<I, O2>, [O2]>>,
		): Reducer<I, O2>;
		/**
		 * Returns a 'runnable' instance of the current reducer specification. This instance maintains its own state
		 * and indices, so that the instance only needs to be provided the input values, and output values can be
		 * retrieved when needed. The state is kept private.
		 */
		compile(): Reducer.Instance<I, O>;
	}

	/**
	 * A reducer instance that manages its own state based on the reducer definition that
	 * was used to create this instance.
	 * @typeparam I - the input element type
	 * @typeparam O - the output element type
	 */
	export interface Instance<I, O> {
		/**
		 * Returns true if the reducer instance does not receive any more values, false otherwise.
		 */
		get halted(): boolean;
		/**
		 * Returns the index of the last received value.
		 */
		get index(): number;
		/**
		 * Method that, when called, halts the reducer instance so that it will no longer receive values.
		 */
		halt(): void;
		/**
		 * Sends a new value into the reducer instance.
		 * @param value - the next input value
		 */
		next(value: I): void;
		/**
		 * Returns the output value based on the current given input values.
		 */
		getOutput(): O;
	}

	/**
	 * Type defining the allowed shape of reducer combinations.
	 * @typeparam T - the input type
	 */
	export type CombineShape<T> =
		| Reducer<T, any>
		| Reducer.CombineShape<T>[]
		| { [key: string]: Reducer.CombineShape<T> };

	/**
	 * Type defining the result type of a reducer combination for a given shape.
	 * @typeparam S - the reducer combination shape
	 */
	export type CombineResult<S extends Reducer.CombineShape<any>> =
		/* tuple */ S extends readonly Reducer.CombineShape<any>[]
			? /* is array? */ 0 extends S['length']
				? Reducer.CombineResult<S[number]>[]
				: /* only tuples */ {
						[K in keyof S]: S[K] extends Reducer.CombineShape<any>
							? Reducer.CombineResult<S[K]>
							: never;
					}
			: /* plain object */ S extends {
						[key: string]: Reducer.CombineShape<any>;
					}
				? { [K in keyof S]: Reducer.CombineResult<S[K]> }
				: /* simple reducer */ S extends Reducer<any, infer R>
					? R
					: never;
}

/**
 * @expandType ReducerFactory
 */
export const Reducer: ReducerFactory = reducerFactoryModule.build();
