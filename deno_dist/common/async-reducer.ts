import {
  AsyncCollectFun,
  AsyncOptLazy,
  CollectFun,
  MaybePromise,
  Reducer,
} from './internal.ts';

/**
 * An `AsyncReducer` is a stand-alone asynchronous calculation that takes input values of type I,
 * and, when requested, produces an output value of type O.
 * @typeparam I - the input value type
 * @typeparam O - the output value type
 */
export type AsyncReducer<I, O = I> = AsyncReducer.Impl<I, O, unknown>;

function identity<T>(value: T): T {
  return value;
}

export namespace AsyncReducer {
  export interface Impl<I, O, S> {
    /**
     * The initial state value for the reducer algorithm.
     */
    readonly init: AsyncOptLazy<S>;
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
     */
    stateToResult(state: S): MaybePromise<O>;
    /**
     * An optional function that is called when the reducer will no longer receive values.
     * @param state - the final reducer state
     * @param error - (optional) if an error has occured, it ix passed here
     */
    onClose?(state: S, error?: unknown): MaybePromise<void>;
    /**
     * Returns an `AsyncReducer` instance that only passes values to the reducer that satisy the given `pred` predicate.
     * @param pred - a potaentially asynchronous function that returns true if the value should be passed to the reducer based on the following inputs:
     * - value: the current input value
     * - index: the current input index
     * - halt: function that, when called, ensures no more new values are passed to the reducer
     * @example
     * AsyncReducer
     *   .createMono(0, async (c, v) => c + v)
     *   .filterInput(async v => v > 10)
     * // this reducer will only sum values larger than 10
     */
    filterInput(
      pred: (value: I, index: number, halt: () => void) => MaybePromise<boolean>
    ): AsyncReducer<I, O>;
    /**
     * Returns an `AsyncReducer` instance that converts its input values using given `mapFun` before passing them to the reducer.
     * @param mapFun - a potentially asynchronous function that returns a new value to pass to the reducer based on the following inputs:
     * - value: the current input value
     * - index: the current input index
     * @example
     * AsyncReducer
     *   .createMono(0, async (c, v) => c + v)
     *   .mapInput(async v => v * 2)
     * // this reducer will double all input values before summing them
     */
    mapInput<I2>(
      mapFun: (value: I2, index: number) => MaybePromise<I>
    ): AsyncReducer<I2, O>;
    /**
     * Returns an `AsyncReducer` instance that converts or filters its input values using given `collectFun` before passing them to the reducer.
     * @param collectFun - a function receiving
     * * `value`: the next value
     * * `index`: the value index
     * * `skip`: a token that, when returned, will not add a value to the resulting collection
     * * `halt`: a function that, when called, ensures no next elements are passed
     * @example
     * AsyncReducer
     *   .createMono(0, async (c, v) => c + v)
     *   .collectInput(async (v, _, skip) => v <= 10 ? skip : v * 2)
     * // this reducer will double all input values larger thant 10 before summing them,
     * // and will skip all values smaller than 10
     */
    collectInput<I2>(collectFun: AsyncCollectFun<I2, I>): AsyncReducer<I2, O>;
    /**
     * Returns an `AsyncReducer` instance that converts its output values using given `mapFun`.
     * @param mapFun - a potentially asynchronous function that takes the current output value and converts it to a new output value
     * AsyncReducer
     *   .createMono(0, async (c, v) => c + v)
     *   .mapOutput(async v => String(v))
     * // this reducer will convert all its results to string before returning them
     */
    mapOutput<O2>(mapFun: (value: O) => MaybePromise<O2>): AsyncReducer<I, O2>;
    /**
     * Returns an `AsyncReducer` instance that takes at most the given `amount` of input elements, and will ignore subsequent elements.
     * @param amount - the amount of elements to accept
     * @example
     * await AsyncStream
     *   .from(Stream.range({ end: 10 }))
     *   .reduce(
     *     AsyncReducer
     *       .createMono(0, async (c, v) => c + v)
     *       .takeInput(2)
     *   )
     * // => 1
     */
    takeInput(amount: number): AsyncReducer<I, O>;
    /**
     * Returns a `Reducer` instance that skips the first given `amount` of input elements, and will process subsequent elements.
     * @param amount - the amount of elements to skip
     * @example
     * await AsyncStream
     *   .from(Stream.range({ end: 10 }))
     *   .reduce(
     *     AsyncReducer
     *       .createMono(0, async (c, v) => c + v)
     *       .dropInput(9)
     *   )
     * // => 19
     */
    dropInput(amount: number): AsyncReducer<I, O>;
    /**
     * Returns a `Reducer` instance that takes given `amount` of elements starting at given `from` index, and ignores other elements.
     * @param from - (default: 0) the index at which to start processing elements
     * @param amount - (optional) the amount of elements to process, if not given, processes all elements from the `from` index
     * @example
     * await AsyncStream
     *   .from(Stream.range({ end: 10 }))
     *   .reduce(
     *     AsyncReducer
     *       .createMono(0, async (c, v) => c + v)
     *       .sliceInput(1, 2)
     *   )
     * // => 3
     */
    sliceInput(from?: number, amount?: number): AsyncReducer<I, O>;
  }

  /**
   * A base class that can be used to easily create `AsyncReducer` instances.
   * @typeparam I - the input value type
   * @typeparam O - the output value type
   * @typeparam S - the internal state type
   */
  export class Base<I, O, S> implements AsyncReducer.Impl<I, O, S> {
    constructor(
      readonly init: AsyncOptLazy<S>,
      readonly next: (
        state: S,
        elem: I,
        index: number,
        halt: () => void
      ) => MaybePromise<S>,
      readonly stateToResult: (state: S) => MaybePromise<O>,
      readonly onClose?: (state: S, error?: unknown) => MaybePromise<void>
    ) {}

    filterInput(
      pred: (value: I, index: number, halt: () => void) => MaybePromise<boolean>
    ): AsyncReducer<I, O> {
      return create(
        async (): Promise<{ state: S; nextIndex: number }> => ({
          nextIndex: 0,
          state: await AsyncOptLazy.toMaybePromise(this.init),
        }),
        async (
          state,
          elem,
          index,
          halt
        ): Promise<{ state: S; nextIndex: number }> => {
          if (pred(elem, index, halt)) {
            state.state = await this.next(
              state.state,
              elem,
              state.nextIndex++,
              halt
            );
          }
          return state;
        },
        (state): MaybePromise<O> => this.stateToResult(state.state),
        (state, error) => this.onClose?.(state.state, error)
      );
    }

    mapInput<I2>(
      mapFun: (value: I2, index: number) => MaybePromise<I>
    ): AsyncReducer<I2, O> {
      return create(
        this.init,
        async (state, elem, index, halt): Promise<S> =>
          this.next(state, await mapFun(elem, index), index, halt),
        this.stateToResult,
        this.onClose
      );
    }

    collectInput<I2>(collectFun: AsyncCollectFun<I2, I>): AsyncReducer<I2, O> {
      return create(
        async (): Promise<{ state: S; nextIndex: number }> => ({
          nextIndex: 0,
          state: await AsyncOptLazy.toMaybePromise(this.init),
        }),
        async (
          state,
          elem,
          index,
          halt
        ): Promise<{ state: S; nextIndex: number }> => {
          const nextElem = await collectFun(elem, index, CollectFun.Skip, halt);

          if (CollectFun.Skip !== nextElem) {
            state.state = await this.next(
              state.state,
              nextElem,
              state.nextIndex++,
              halt
            );
          }

          return state;
        },
        (state): MaybePromise<O> => this.stateToResult(state.state),
        (state, error) => this.onClose?.(state.state, error)
      );
    }

    mapOutput<O2>(mapFun: (value: O) => MaybePromise<O2>): AsyncReducer<I, O2> {
      return create(
        this.init,
        this.next,
        async (state): Promise<O2> => mapFun(await this.stateToResult(state)),
        this.onClose
      );
    }

    takeInput(amount: number): AsyncReducer<I, O> {
      if (amount <= 0) {
        return create(this.init, identity, this.stateToResult);
      }

      return this.filterInput((_, i, halt): boolean => {
        const more = i < amount;
        if (!more) halt();
        return more;
      });
    }

    dropInput(amount: number): AsyncReducer<I, O> {
      if (amount <= 0) return this;

      return this.filterInput((_, i): boolean => i >= amount);
    }

    sliceInput(from = 0, amount?: number): AsyncReducer<I, O> {
      if (undefined === amount) return this.dropInput(from);
      if (amount <= 0) return create(this.init, identity, this.stateToResult);
      if (from <= 0) return this.takeInput(amount);
      return this.takeInput(amount).dropInput(from);
    }
  }

  /**
   * Returns an `AsyncReducer` with the given options:
   * @param init - the optionally lazy and/or promised initial state value
   * @param next - returns (potentially asynchronously) the next state value based on the given inputs:
   * - current: the current state
   * - next: the current input value
   * - index: the input index value
   * - halt: function that, when called, ensures no more elements are passed to the reducer
   * @param stateToResult - a potentially asynchronous function that converts the current state to an output value
   * @param onClose - (optional) a function that will be called when the reducer will no longer receive values
   * @typeparam I - the input value type
   * @typeparam O - the output value type
   * @typeparam S - the internal state type
   */
  export function create<I, O = I, S = O>(
    init: AsyncOptLazy<S>,
    next: (
      current: S,
      next: I,
      index: number,
      halt: () => void
    ) => MaybePromise<S>,
    stateToResult: (state: S) => MaybePromise<O>,
    onClose?: (state: S, error?: unknown) => MaybePromise<void>
  ): AsyncReducer<I, O> {
    return new AsyncReducer.Base(init, next, stateToResult, onClose);
  }

  /**
   * Returns an `AsyncReducer` of which the input, state, and output types are the same.
   * @param init - the optionally lazy and/or promised initial state value
   * @param next - returns (potentially asynchronously) the next state value based on the given inputs:
   * - current: the current state
   * - next: the current input value
   * - index: the input index value
   * - halt: function that, when called, ensures no more elements are passed to the reducer
   * @param stateToResult - a potentially asynchronous function that converts the current state to an output value
   * @param onClose - (optional) a function that will be called when the reducer will no longer receive values
   * @typeparam I - the input value type
   * @typeparam O - the output value type
   * @typeparam S - the internal state type
   */
  export function createMono<T>(
    init: AsyncOptLazy<T>,
    next: (
      current: T,
      next: T,
      index: number,
      halt: () => void
    ) => MaybePromise<T>,
    stateToResult?: (state: T) => MaybePromise<T>,
    onClose?: (state: T, error?: unknown) => MaybePromise<void>
  ): AsyncReducer<T> {
    return create(init, next, stateToResult ?? identity, onClose);
  }

  /**
   * Returns an `AsyncReducer` of which the state and output types are the same.
   * @param init - the optionally lazy and/or promised initial state value
   * @param next - returns (potentially asynchronously) the next state value based on the given inputs:
   * - current: the current state
   * - next: the current input value
   * - index: the input index value
   * - halt: function that, when called, ensures no more elements are passed to the reducer
   * @param stateToResult - a potentially asynchronous function that converts the current state to an output value
   * @param onClose - (optional) a function that will be called when the reducer will no longer receive values
   * @typeparam I - the input value type
   * @typeparam O - the output value type
   * @typeparam S - the internal state type
   */
  export function createOutput<I, O = I>(
    init: AsyncOptLazy<O>,
    next: (
      current: O,
      next: I,
      index: number,
      halt: () => void
    ) => MaybePromise<O>,
    stateToResult?: (state: O) => MaybePromise<O>,
    onClose?: (state: O, error?: unknown) => MaybePromise<void>
  ): AsyncReducer<I, O> {
    return create(init, next, stateToResult ?? identity, onClose);
  }

  export function from<I, O>(reducer: Reducer<I, O>): AsyncReducer<I, O> {
    return AsyncReducer.create(
      reducer.init,
      reducer.next,
      reducer.stateToResult
    );
  }
}
