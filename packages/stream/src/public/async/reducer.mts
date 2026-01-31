import type { AsyncOptLazy, MaybePromise } from '@rimbu/common/async-opt-lazy';
import type { AsyncCollectFun } from '@rimbu/common/collect';

import type { AsyncReducerFactory } from '#async/reducer-factory';
import { asyncReducerFactoryModule } from '#async/reducer-factory-module';
import type { AsyncStreamSource } from '@rimbu/stream/async';
import type { Reducer } from '@rimbu/stream/reducer';

/**
 * An `AsyncReducer` is a stand-alone asynchronous calculation that takes input values of type I,
 * and, when requested, produces an output value of type O.
 * @typeparam I - the input value type
 * @typeparam O - the output value type
 */
export type AsyncReducer<I, O = I> = AsyncReducer.Impl<I, O, unknown>;

export namespace AsyncReducer {
  /**
   * Convenience type to allow synchronous reducers to be supplied to functions that accept async reducers.
   * @typeparam I - the input type
   * @typeparam O - the output type
   */
  export type Accept<I, O> = AsyncReducer<I, O> | Reducer<I, O>;

  /**
   * The AsyncReducer implementation interface defining the required methods.
   * @typeparam I - the input type
   * @typeparam O - the output type
   * @typeparam S - the state type
   */
  export interface Impl<I, O, S> {
    /**
     * The initial state value for the reducer algorithm.
     * @param initHalt - a callback function that, if called, indicates that the reducer does not accept any input.
     */
    readonly init: (initHalt: () => void) => MaybePromise<S>;
    /**
     * Returns the next state based on the given input values
     * @param state - the current state
     * @param elem - the current input value
     * @param index - the current input index
     * @param halt - a function that, when called, ensures no more values are passed to the reducer
     */
    next(state: S, elem: I, index: number, halt: () => void): MaybePromise<S>;
    /**
     * Returns the output value based on the given `state`
     * @param state - the current state
     * @param index - the value index
     * @param halted - a boolean indicating whether the reducer is halted
     */
    stateToResult(state: S, index: number, halted: boolean): MaybePromise<O>;
    /**
     * An optional function that is called when the reducer will no longer receive values.
     * @param state - the final reducer state
     * @param error - (optional) if an error has occured, it ix passed here
     */
    onClose?: ((state: S, error?: unknown) => MaybePromise<void>) | undefined;
    /**
     * Returns an `AsyncReducer` instance that only passes values to the reducer that satisy the given `pred` predicate.
     * @param pred - a potaentially asynchronous function that returns true if the value should be passed to the reducer based on the following inputs:<br/>
     * - value: the current input value<br/>
     * - index: the current input index<br/>
     * - halt: function that, when called, ensures no more new values are passed to the reducer
     * @param options - (optional) an object containing the following properties:<br/>
     * - negate: (default: false) when true will invert the given predicate
     * @note if the predicate is a type guard, the return type is automatically inferred
     * @example
     * ```ts
     * AsyncReducer
     *   .createMono(0, async (c, v) => c + v)
     *   .filterInput(async v => v > 10)
     * // this reducer will only sum values larger than 10
     * ```
     */
    filterInput<IF extends I>(
      pred: (value: I, index: number, halt: () => void) => value is IF,
      options?: { negate?: false | undefined }
    ): AsyncReducer<IF, O>;
    filterInput<IF extends I>(
      pred: (value: I, index: number, halt: () => void) => value is IF,
      options: { negate: true }
    ): AsyncReducer<Exclude<I, IF>, O>;
    filterInput(
      pred: (
        value: I,
        index: number,
        halt: () => void
      ) => MaybePromise<boolean>,
      options?: { negate?: boolean | undefined }
    ): AsyncReducer<I, O>;
    /**
     * Returns an `AsyncReducer` instance that converts its input values using given `mapFun` before passing them to the reducer.
     * @param mapFun - a potentially asynchronous function that returns a new value to pass to the reducer based on the following inputs:<br/>
     * - value: the current input value<br/>
     * - index: the current input index
     * @typeparam I2 - the new input type
     * @example
     * ```ts
     * AsyncReducer
     *   .createMono(0, async (c, v) => c + v)
     *   .mapInput(async v => v * 2)
     * // this reducer will double all input values before summing them
     * ```
     */
    mapInput: <I2>(
      mapFun: (value: I2, index: number) => MaybePromise<I>
    ) => AsyncReducer<I2, O>;
    /**
     * Returns an `AsyncReducer` instance that converts its input values using given `flatMapFun` before passing them to the reducer.
     * @param flatMapFun - a potentially asynchronous function that returns am arbitrary number of new values to pass to the reducer based on the following inputs:<br/>
     * - value: the current input value<br/>
     * - index: the current input index
     * @typeparam I2 - the new input type
     * @example
     * ```ts
     * AsyncReducer
     *   .createMono(0, async (c, v) => c + v)
     *   .flatMapInput(async v => [v, v])
     * // this reducer will include all input values twice before summing them
     * ```
     */
    flatMapInput<I2>(
      flatMapFun: (
        value: I2,
        index: number
      ) => MaybePromise<AsyncStreamSource<I>>
    ): AsyncReducer<I2, O>;
    /**
     * Returns an `AsyncReducer` instance that converts or filters its input values using given `collectFun` before passing them to the reducer.
     * @typeparam I2 - the new input type
     * @param collectFun - a (potentially async) function receiving<br/>
     * - `value`: the next value<br/>
     * - `index`: the value index<br/>
     * - `skip`: a token that, when returned, will not add a value to the resulting collection<br/>
     * - `halt`: a function that, when called, ensures no next elements are passed
     * @example
     * ```ts
     * AsyncReducer
     *   .createMono(0, async (c, v) => c + v)
     *   .collectInput(async (v, _, skip) => v <= 10 ? skip : v * 2)
     * // this reducer will double all input values larger thant 10 before summing them,
     * // and will skip all values smaller than 10
     * ```
     */
    collectInput<I2>(collectFun: AsyncCollectFun<I2, I>): AsyncReducer<I2, O>;
    /**
     * Returns an `AsyncReducer` instance that converts its output values using given `mapFun`.
     * @param mapFun - a potentially asynchronous function that takes the current output value and converts it to a new output value
     * @typeparam O2 - the new output type
     * @example
     * ```ts
     * AsyncReducer
     *   .createMono(0, async (c, v) => c + v)
     *   .mapOutput(async v => String(v))
     * // this reducer will convert all its results to string before returning them
     * ```
     */
    mapOutput<O2>(
      mapFun: (value: O, index: number, halted: boolean) => MaybePromise<O2>
    ): AsyncReducer<I, O2>;
    /**
     * Returns an `AsyncReducer` instance that takes at most the given `amount` of input elements, and will ignore subsequent elements.
     * @param amount - the amount of elements to accept
     * @example
     * ```ts
     * await AsyncStream
     *   .from(Stream.range({ end: 10 }))
     *   .reduce(
     *     AsyncReducer
     *       .createMono(0, async (c, v) => c + v)
     *       .takeInput(2)
     *   )
     * // => 1
     * ```
     */
    takeInput(amount: number): AsyncReducer<I, O>;
    /**
     * Returns an `AsyncReducer` instance that skips the first given `amount` of input elements, and will process subsequent elements.
     * @param amount - the amount of elements to skip
     * @example
     * ```ts
     * await AsyncStream
     *   .from(Stream.range({ end: 10 }))
     *   .reduce(
     *     AsyncReducer
     *       .createMono(0, async (c, v) => c + v)
     *       .dropInput(9)
     *   )
     * // => 19
     * ```
     */
    dropInput(amount: number): AsyncReducer<I, O>;
    /**
     * Returns an `AsyncReducer` instance that takes given `amount` of elements starting at given `from` index, and ignores other elements.
     * @param from - (default: 0) the index at which to start processing elements
     * @param amount - (optional) the amount of elements to process, if not given, processes all elements from the `from` index
     * @example
     * ```ts
     * await AsyncStream
     *   .from(Stream.range({ end: 10 }))
     *   .reduce(
     *     AsyncReducer
     *       .createMono(0, async (c, v) => c + v)
     *       .sliceInput(1, 2)
     *   )
     * // => 3
     * ```
     */
    sliceInput(
      from?: number | undefined,
      amount?: number | undefined
    ): AsyncReducer<I, O>;
    /**
     * Returns an 'AsyncReducer` instance that produces at most `amount` values.
     * @param amount - the maximum amount of values to produce.
     */
    takeOutput(amount: number): AsyncReducer<I, O>;
    /**
     * Returns an 'AsyncReducer` instance that produces until the given `pred` predicate returns true for
     * the output value.
     * @param pred - a potaentially asynchronous function that returns true if the value should be passed to the reducer based on the following inputs:<br/>
     * - value: the current input value<br/>
     * - index: the current input index<br/>
     * - halt: function that, when called, ensures no more new values are passed to the reducer
     * @param options - (optional) an object containing the following properties:<br/>
     * - negate: (default: false) when true will invert the given predicate
     */
    takeOutputUntil(
      pred: (value: O, index: number) => MaybePromise<boolean>,
      options?: { negate?: boolean | undefined }
    ): AsyncReducer<I, O>;
    /**
     * Returns a reducer that applies the given `nextReducers` sequentially after this reducer
     * has halted, and moving on to the next provided reducer until it is halted. Optionally, it provides the last output
     * value of the previous reducer.
     * @param nextReducers - an number of reducers consuming and producing the same types as the current reducer.
     * @example
     * ```ts
     * const result = await AsyncStream.range({ amount: 6 })
     *  .reduce(
     *    Reducer.sum
     *      .takeInput(3)
     *      .chain(
     *        v => v > 10 ? Reducer.product : Reducer.sum
     *      )
     *    )
     * console.log(result)
     * // => 21
     * ```
     */
    chain<O2 extends O>(
      nextReducers: AsyncStreamSource<
        AsyncOptLazy<AsyncReducer.Accept<I, O2>, [O2]>
      >
    ): AsyncReducer<I, O2>;

    /**
     * Returns a promise that resolves to a 'runnable' instance of the current reducer specification. This instance maintains its own state
     * and indices, so that the instance only needs to be provided the input values, and output values can be
     * retrieved when needed. The state is kept private.
     * @example
     * ```ts
     * const reducer = AsyncReducer.from(Reducer.sum.mapOutput(v => v * 2));
     * const instance = reducer.compile();
     * await instance.next(3);
     * await instance.next(5);
     * console.log(await instance.getOutput());
     * // => 16
     * ```
     */
    compile(): Promise<AsyncReducer.Instance<I, O>>;
  }

  /**
   * An async reducer instance that manages its own state based on the reducer definition that
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
    next(value: I): MaybePromise<void>;
    /**
     * Returns the output value based on the current given input values.
     */
    getOutput(): MaybePromise<O>;
    /**
     * Closes any resources that may have been opened.
     * @param err - (optional) if an error occurrerd it can be supplied
     */
    onClose(err?: unknown): Promise<void>;
  }

  /**
   * Type defining the allowed shape of async reducer combinations.
   * @typeparam T - the input type
   */
  export type CombineShape<T> =
    | AsyncReducer.Accept<T, any>
    | AsyncReducer.CombineShape<T>[]
    | { [key: string]: AsyncReducer.CombineShape<T> };

  /**
   * Type defining the result type of an async reducer combination for a given shape.
   * @typeparam S - the reducer combination shape
   */
  export type CombineResult<S extends AsyncReducer.CombineShape<any>> =
    /* tuple */ S extends readonly AsyncReducer.CombineShape<any>[]
      ? /* is array? */ 0 extends S['length']
        ? AsyncReducer.CombineResult<S[number]>[]
        : /* only tuples */ {
            [K in keyof S]: S[K] extends AsyncReducer.CombineShape<any>
              ? AsyncReducer.CombineResult<S[K]>
              : never;
          }
      : /* plain object */ S extends {
            [key: string]: AsyncReducer.CombineShape<any>;
          }
        ? { [K in keyof S]: AsyncReducer.CombineResult<S[K]> }
        : /* simple reducer */ S extends AsyncReducer.Accept<any, infer R>
          ? R
          : never;
}

export const AsyncReducer: AsyncReducerFactory =
  asyncReducerFactoryModule.build();
