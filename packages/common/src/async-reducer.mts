import {
  type AsyncCollectFun,
  AsyncOptLazy,
  CollectFun,
  type MaybePromise,
  Reducer,
  Eq,
} from './internal.mjs';

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
    onClose?: ((state: S, error?: unknown) => MaybePromise<void>) | undefined;
    /**
     * Returns an `AsyncReducer` instance that only passes values to the reducer that satisy the given `pred` predicate.
     * @param pred - a potaentially asynchronous function that returns true if the value should be passed to the reducer based on the following inputs:<br/>
     * - value: the current input value<br/>
     * - index: the current input index<br/>
     * - halt: function that, when called, ensures no more new values are passed to the reducer
     * @example
     * ```ts
     * AsyncReducer
     *   .createMono(0, async (c, v) => c + v)
     *   .filterInput(async v => v > 10)
     * // this reducer will only sum values larger than 10
     * ```
     */
    filterInput(
      pred: (value: I, index: number, halt: () => void) => MaybePromise<boolean>
    ): AsyncReducer<I, O>;
    /**
     * Returns an `AsyncReducer` instance that converts its input values using given `mapFun` before passing them to the reducer.
     * @param mapFun - a potentially asynchronous function that returns a new value to pass to the reducer based on the following inputs:<br/>
     * - value: the current input value<br/>
     * - index: the current input index
     * @example
     * ```ts
     * AsyncReducer
     *   .createMono(0, async (c, v) => c + v)
     *   .mapInput(async v => v * 2)
     * // this reducer will double all input values before summing them
     * ```
     */
    mapInput<I2>(
      mapFun: (value: I2, index: number) => MaybePromise<I>
    ): AsyncReducer<I2, O>;
    /**
     * Returns an `AsyncReducer` instance that converts or filters its input values using given `collectFun` before passing them to the reducer.
     * @param collectFun - a function receiving<br/>
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
     * @example
     * ```ts
     * AsyncReducer
     *   .createMono(0, async (c, v) => c + v)
     *   .mapOutput(async v => String(v))
     * // this reducer will convert all its results to string before returning them
     * ```
     */
    mapOutput<O2>(mapFun: (value: O) => O2): AsyncReducer<I, O2>;
    mapOutput<O2>(mapFun: (value: O) => Promise<O2>): AsyncReducer<I, O2>;
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
     * Returns a `Reducer` instance that skips the first given `amount` of input elements, and will process subsequent elements.
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
     * Returns a `Reducer` instance that takes given `amount` of elements starting at given `from` index, and ignores other elements.
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
      if (amount <= 0) {
        return this as AsyncReducer<I, O>;
      }

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
    return new AsyncReducer.Base(
      init,
      next,
      stateToResult,
      onClose
    ) as AsyncReducer<I, O>;
  }

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

  /**
   * A `Reducer` that sums all given numeric input values.
   * @example
   * ```ts
   * console.log(Stream.range({ amount: 5 }).reduce(Reducer.sum))
   * // => 10
   * ```
   */
  export const sum = createMono(0, (state, next): number => state + next);

  /**
   * A `Reducer` that calculates the product of all given numeric input values.
   * @example
   * ```ts
   * console.log(Stream.range({ start: 1, amount: 5 }).reduce(product))
   * // => 120
   * ```
   */
  export const product = createMono(1, (state, next, _, halt): number => {
    if (0 === next) halt();
    return state * next;
  });

  /**
   * A `Reducer` that calculates the average of all given numberic input values.
   * @example
   * ```ts
   * console.log(Stream.range({ amount: 5 }).reduce(Reducer.average));
   * // => 2
   * ```
   */
  export const average = createMono(
    0,
    (avg, value, index): number => avg + (value - avg) / (index + 1)
  );

  /**
   * Returns a `Reducer` that remembers the minimum value of the inputs using the given `compFun` to compare input values
   * @param compFun - a comparison function for two input values, returning 0 when equal, positive when greater, negetive when smaller
   * @param otherwise - (default: undefineds) a fallback value when there were no input values given
   * @example
   * ```ts
   * const stream = Stream.of('abc', 'a', 'abcde', 'ab')
   * console.log(stream.minBy((s1, s2) => s1.length - s2.length))
   * // 'a'
   * ```
   */
  export const minBy: {
    <T>(compFun: (v1: T, v2: T) => MaybePromise<number>): AsyncReducer<
      T,
      T | undefined
    >;
    <T, O>(
      compFun: (v1: T, v2: T) => MaybePromise<number>,
      otherwise: AsyncOptLazy<O>
    ): AsyncReducer<T, T | O>;
  } = <T, O>(
    compFun: (v1: T, v2: T) => MaybePromise<number>,
    otherwise?: AsyncOptLazy<O>
  ) => {
    const token = Symbol();
    return create<T, T | O, T | typeof token>(
      token,
      async (state, next): Promise<T> => {
        if (token === state) return next;
        return (await compFun(state, next)) < 0 ? state : next;
      },
      (state): MaybePromise<T | O> =>
        token === state ? AsyncOptLazy.toMaybePromise(otherwise!) : state
    );
  };

  /**
   * Returns a `Reducer` that remembers the minimum value of the numberic inputs.
   * @param otherwise - (default: undefined) a fallback value when there were no input values given
   * @example
   * ```ts
   * console.log(Stream.of(5, 3, 7, 4).reduce(Reducer.min()))
   * // => 3
   * ```
   */
  // prettier-ignore
  export const min: {
    (): AsyncReducer<number, number | undefined>;
    <O>(otherwise: AsyncOptLazy<O>): AsyncReducer<number, number | O>;
  } = <O,>(otherwise?: AsyncOptLazy<O>) => {
    return create<number, number | O, number | undefined>(
      undefined,
      (state, next): number =>
        undefined !== state && state < next ? state : next,
      (state): MaybePromise<number | O> =>
        state ?? AsyncOptLazy.toMaybePromise(otherwise!)
    );
  };

  /**
   * Returns a `Reducer` that remembers the maximum value of the inputs using the given `compFun` to compare input values
   * @param compFun - a comparison function for two input values, returning 0 when equal, positive when greater, negetive when smaller
   * @param otherwise - (default: undefined) a fallback value when there were no input values given
   * @example
   * ```ts
   * const stream = Stream.of('abc', 'a', 'abcde', 'ab')
   * console.log(stream.maxBy((s1, s2) => s1.length - s2.length))
   * // 'abcde'
   * ```
   */
  export const maxBy: {
    <T>(compFun: (v1: T, v2: T) => MaybePromise<number>): AsyncReducer<
      T,
      T | undefined
    >;
    <T, O>(
      compFun: (v1: T, v2: T) => MaybePromise<number>,
      otherwise: AsyncOptLazy<O>
    ): AsyncReducer<T, T | O>;
  } = <T, O>(
    compFun: (v1: T, v2: T) => MaybePromise<number>,
    otherwise?: AsyncOptLazy<O>
  ): AsyncReducer<T, T | O> => {
    const token = Symbol();
    return create<T, T | O, T | typeof token>(
      token,
      async (state, next): Promise<T> => {
        if (token === state) return next;
        return (await compFun(state, next)) > 0 ? state : next;
      },
      (state): MaybePromise<T | O> =>
        token === state ? AsyncOptLazy.toMaybePromise(otherwise!) : state
    );
  };

  /**
   * Returns a `Reducer` that remembers the maximum value of the numberic inputs.
   * @param otherwise - (default: undefined) a fallback value when there were no input values given
   * @example
   * ```ts
   * console.log(Stream.of(5, 3, 7, 4).reduce(Reducer.max()))
   * // => 7
   * ```
   */
  // prettier-ignore
  export const max: {
    (): AsyncReducer<number, number | undefined>;
    <O>(otherwise: AsyncOptLazy<O>): AsyncReducer<number, number | O>;
  } = <O,>(otherwise?: AsyncOptLazy<O>): AsyncReducer<number, number | O> => {
    return create<number, number | O, number | undefined>(
      undefined,
      (state, next): number =>
        undefined !== state && state > next ? state : next,
      (state): MaybePromise<number | O> =>
        state ?? AsyncOptLazy.toMaybePromise(otherwise!)
    );
  };

  /**
   * Returns a `Reducer` that joins the given input values into a string using the given options.
   * @param options - an object containing:<br/>
   * - sep: (optional) a seperator string value between values in the output<br/>
   * - start: (optional) a start string to prepend to the output<br/>
   * - end: (optional) an end string to append to the output<br/>
   * @example
   * ```ts
   * console.log(Stream.of(1, 2, 3).reduce(Reducer.join({ sep: '-' })))
   * // => '1-2-3'
   * ```
   */
  export function join<T>({
    sep = '',
    start = '',
    end = '',
    valueToString = String as (value: T) => string,
  } = {}): AsyncReducer<T, string> {
    let curSep = '';
    let curStart = start;
    return create(
      '',
      (state, next): string => {
        const result = curStart.concat(state, curSep, valueToString(next));
        curSep = sep;
        curStart = '';
        return result;
      },
      (state): string => state.concat(end)
    );
  }

  /**
   * Returns an `AsyncReducer` that remembers the amount of input items provided.
   * @param pred - (optional) a predicate that returns false if the item should not be counted given:<br/>
   * - value: the current input value<br/>
   * - index: the input value index
   * @example
   * ```ts
   * const stream = AsyncStream.from(Stream.range({ amount: 10 }))
   * console.log(await stream.reduce(AsyncReducer.count()))
   * // => 10
   * console.log(await stream.reduce(AsyncReducer.count(async v => v < 5)))
   * // => 5
   * ```
   */
  export const count: {
    (): AsyncReducer<never, number>;
    <T>(pred: (value: T, index: number) => MaybePromise<boolean>): AsyncReducer<
      T,
      number
    >;
  } = (
    pred?: (value: any, index: number) => MaybePromise<boolean>
  ): AsyncReducer<never, number> => {
    if (undefined === pred) return createOutput(0, (_, __, i): number => i + 1);

    return createOutput(0, async (state, next, i): Promise<number> => {
      if (await pred?.(next, i)) return state + 1;
      return state;
    });
  };

  /**
   * Returns an `AsyncReducer` that remembers the first input value for which the given `pred` function returns true.
   * @param pred - a function taking an input value and its index, and returning true if the value should be remembered
   * @param otherwise - (default: undefined) a fallback value to output if no input value yet has satisfied the given predicate
   * @typeparam T - the input value type
   * @typeparam O - the fallback value type
   * @example
   * ```ts
   * await AsyncStream.from(Stream.range({ amount: 10 })).reduce(AsyncReducer.firstWhere(async v => v > 5)))
   * // => 6
   * ```
   */
  export const firstWhere: {
    <T>(pred: (value: T, index: number) => MaybePromise<boolean>): AsyncReducer<
      T,
      T | undefined
    >;
    <T, O>(
      pred: (value: T, index: number) => MaybePromise<boolean>,
      otherwise: AsyncOptLazy<O>
    ): AsyncReducer<T, T | O>;
  } = <T, O>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    otherwise?: AsyncOptLazy<O>
  ) => {
    const token = Symbol();

    return create<T, T | O, T | typeof token>(
      token,
      async (state, next, i, halt): Promise<T | typeof token> => {
        if (token === state && (await pred(next, i))) {
          halt();
          return next;
        }
        return state;
      },
      (state): MaybePromise<T | O> =>
        token === state ? AsyncOptLazy.toMaybePromise(otherwise!) : state
    );
  };

  /**
   * Returns an `AsyncReducer` that remembers the first input value.
   * @param otherwise - (default: undefined) a fallback value to output if no input value has been provided
   * @typeparam T - the input value type
   * @typeparam O - the fallback value type
   * @example
   * ```ts
   * await AsyncStream.from(Stream.range{ amount: 10 })).reduce(AsyncReducer.first())
   * // => 0
   * ```
   */
  export const first: {
    <T>(): AsyncReducer<T, T | undefined>;
    <T, O>(otherwise: AsyncOptLazy<O>): AsyncReducer<T, T | O>;
  } = <T, O>(otherwise?: AsyncOptLazy<O>): AsyncReducer<T, T | O> => {
    const token = Symbol();

    return create<T, T | O, T | typeof token>(
      token,
      (state, next, _, halt): T => {
        halt();
        if (token === state) return next;
        return state;
      },
      (state): MaybePromise<T | O> =>
        token === state ? AsyncOptLazy.toMaybePromise(otherwise!) : state
    );
  };

  /**
   * Returns an `AsyncReducer` that remembers the last input value for which the given `pred` function returns true.
   * @param pred - a function taking an input value and its index, and returning true if the value should be remembered
   * @param otherwise - (default: undefined) a fallback value to output if no input value yet has satisfied the given predicate
   * @typeparam T - the input value type
   * @typeparam O - the fallback value type
   * @example
   * ```ts
   * await AsyncStream.from(Stream.range({ amount: 10 })).reduce(AsyncReducer.lastWhere(async v => v > 5)))
   * // => 9
   * ```
   */
  export const lastWhere: {
    <T>(pred: (value: T, index: number) => MaybePromise<boolean>): AsyncReducer<
      T,
      T | undefined
    >;
    <T, O>(
      pred: (value: T, index: number) => MaybePromise<boolean>,
      otherwise: AsyncOptLazy<O>
    ): AsyncReducer<T, T | O>;
  } = <T, O>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    otherwise?: AsyncOptLazy<O>
  ) => {
    const token = Symbol();

    return create<T, T | O, T | typeof token>(
      token,
      async (state, next, i): Promise<T | typeof token> => {
        if (await pred(next, i)) return next;
        return state;
      },
      (state): MaybePromise<T | O> =>
        token === state ? AsyncOptLazy.toMaybePromise(otherwise!) : state
    );
  };

  /**
   * Returns an `AsyncReducer` that remembers the last input value.
   * @param otherwise - (default: undefined) a fallback value to output if no input value has been provided
   * @typeparam T - the input value type
   * @typeparam O - the fallback value type
   * @example
   * ```ts
   * await AsyncStream.from(Stream.range{ amount: 10 })).reduce(AsyncReducer.last())
   * // => 9
   * ```
   */
  export const last: {
    <T>(): AsyncReducer<T, T | undefined>;
    <T, O>(otherwise: AsyncOptLazy<O>): AsyncReducer<T, T | O>;
  } = <T, O>(otherwise?: AsyncOptLazy<O>): AsyncReducer<T, T | O> => {
    const token = Symbol();

    return create<T, T | O, T | typeof token>(
      () => token,
      (_, next): T => next,
      (state): MaybePromise<T | O> =>
        token === state ? AsyncOptLazy.toMaybePromise(otherwise!) : state
    );
  };

  /**
   * Returns a `Reducer` that ouputs false as long as no input value satisfies given `pred`, true otherwise.
   * @typeparam T - the element type
   * @param pred - a function taking an input value and its index, and returning true if the value satisfies the predicate
   * @example
   * ```ts
   * await AsyncStream.from(Stream.range{ amount: 10 })).reduce(AsyncReducer.some(async v => v > 5))
   * // => true
   * ```
   */
  export function some<T>(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): AsyncReducer<T, boolean> {
    return createOutput<T, boolean>(
      false,
      async (state, next, i, halt): Promise<boolean> => {
        if (state) return state;
        const satisfies = await pred(next, i);

        if (satisfies) {
          halt();
        }

        return satisfies;
      }
    );
  }

  /**
   * Returns an `AsyncReducer` that ouputs true as long as all input values satisfy the given `pred`, false otherwise.
   * @typeparam T - the element type
   * @param pred - a function taking an input value and its index, and returning true if the value satisfies the predicate
   * @example
   * ```ts
   * await AsyncStream.from(Stream.range{ amount: 10 })).reduce(AsyncReducer.every(async v => v < 5))
   * // => false
   * ```
   */
  export function every<T>(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): AsyncReducer<T, boolean> {
    return createOutput<T, boolean>(
      true,
      async (state, next, i, halt): Promise<boolean> => {
        if (!state) return state;

        const satisfies = await pred(next, i);

        if (!satisfies) {
          halt();
        }

        return satisfies;
      }
    );
  }

  /**
   * Returns an `AsyncReducer` that outputs false as long as the given `elem` has not been encountered in the input values, true otherwise.
   * @typeparam T - the element type
   * @param elem - the element to search for
   * @param eq - (optional) a comparison function that returns true if te two given input values are considered equal
   * @example
   * ```ts
   * await AsyncStream.from(Stream.range({ amount: 10 })).reduce(AsyncReducer.contains(5)))
   * // => true
   * ```
   */
  export function contains<T>(
    elem: T,
    eq: Eq<T> = Object.is
  ): AsyncReducer<T, boolean> {
    return createOutput<T, boolean>(false, (state, next, _, halt): boolean => {
      if (state) return state;
      const satisfies = eq(next, elem);

      if (satisfies) {
        halt();
      }

      return satisfies;
    });
  }

  /**
   * Returns an `AsyncReducer` that takes boolean values and outputs true if all input values are true, and false otherwise.
   * @example
   * ```ts
   * await AsyncStream.of(true, false, true)).reduce(AsyncReducer.and))
   * // => false
   * ```
   */
  export const and = createMono(true, (state, next, _, halt): boolean => {
    if (!state) return state;
    if (!next) halt();
    return next;
  });

  /**
   * Returns an `AsyncReducer` that takes boolean values and outputs true if one or more input values are true, and false otherwise.
   * @example
   * ```ts
   * await AsyncStream.of(true, false, true)).reduce(AsyncReducer.or))
   * // => true
   * ```
   */
  export const or = createMono(false, (state, next, _, halt): boolean => {
    if (state) return state;
    if (next) halt();
    return next;
  });

  /**
   * Returns an `AsyncReducer` that outputs true if no input values are received, false otherwise.
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.isEmpty))
   * // => false
   * ```
   */
  export const isEmpty = createOutput<never, boolean>(
    true,
    (_, __, ___, halt): false => {
      halt();
      return false;
    }
  );

  /**
   * Returns an `AsyncReducer` that outputs true if one or more input values are received, false otherwise.
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.nonEmpty))
   * // => true
   * ```
   */
  export const nonEmpty = createOutput<never, boolean>(
    false,
    (_, __, ___, halt): true => {
      halt();
      return true;
    }
  );

  /**
   * Returns an `AsyncReducer` that collects received input values in an array, and returns a copy of that array as an output value when requested.
   * @typeparam T - the element type
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.toArray()))
   * // => [1, 2, 3]
   * ```
   */
  export function toArray<T>(): AsyncReducer<T, T[]> {
    return create(
      (): T[] => [],
      (state, next): T[] => {
        state.push(next);
        return state;
      },
      (state): T[] => state.slice()
    );
  }

  /**
   * Returns a `AsyncReducer` that collects received input tuples into a mutable JS Map, and returns
   * a copy of that map when output is requested.
   * @typeparam K - the map key type
   * @typeparam V - the map value type
   * @example
   * ```ts
   * await AsyncStream.of([1, 'a'], [2, 'b']).reduce(AsyncReducer.toJSMap()))
   * // Map { 1 => 'a', 2 => 'b' }
   * ```
   */
  export function toJSMap<K, V>(): AsyncReducer<[K, V], Map<K, V>> {
    return create(
      (): Map<K, V> => new Map(),
      (state, next): Map<K, V> => {
        state.set(next[0], next[1]);
        return state;
      },
      (s): Map<K, V> => new Map(s)
    );
  }

  /**
   * Returns an `AsyncReducer` that collects received input values into a mutable JS Set, and returns
   * a copy of that map when output is requested.
   * @typeparam T - the element type
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.toJSSet()))
   * // Set {1, 2, 3}
   * ```
   */
  export function toJSSet<T>(): AsyncReducer<T, Set<T>> {
    return create(
      (): Set<T> => new Set<T>(),
      (state, next): Set<T> => {
        state.add(next);
        return state;
      },
      (s): Set<T> => new Set(s)
    );
  }

  /**
   * Returns an `AsyncReducer` that collects 2-tuples containing keys and values into a plain JS object, and
   * returns a copy of that object when output is requested.
   * @typeparam K - the result object key type
   * @typeparam V - the result object value type
   * @example
   * ```ts
   * await AsyncStream.of(['a', 1], ['b', true]).reduce(AsyncReducer.toJSObject()))
   * // { a: 1, b: true }
   * ```
   */
  export function toJSObject<
    K extends string | number | symbol,
    V
  >(): AsyncReducer<[K, V], Record<K, V>> {
    return create(
      () => ({} as Record<K, V>),
      (state, entry) => {
        state[entry[0]] = entry[1];
        return state;
      },
      (s) => ({ ...s })
    );
  }

  /**
   * Returns an `AsyncReducer` that combines multiple input `reducers` by providing input values to all of them and collecting the outputs in an array.
   * @param reducers - 2 or more reducers to combine
   * @example
   * ```ts
   * const red = AsyncReducer.combineArr(AsyncReducer.sum, AsyncReducer.average)
   *
   * await AsyncStream.from(Stream.range({ amount: 9 }))
   *  .reduce(red)
   * // => [36, 4]
   * ```
   */
  export function combineArr<
    T,
    R extends readonly [unknown, unknown, ...unknown[]]
  >(
    ...reducers: { [K in keyof R]: AsyncReducer<T, R[K]> } & AsyncReducer<
      T,
      unknown
    >[]
  ): AsyncReducer<T, R> {
    const createState = (): Promise<
      {
        reducer: AsyncReducer<T, unknown>;
        halted: boolean;
        halt(): void;
        state: unknown;
      }[]
    > => {
      return Promise.all(
        reducers.map(async (reducer) => {
          const result = {
            reducer,
            halted: false,
            halt(): void {
              result.halted = true;
            },
            state: await AsyncOptLazy.toMaybePromise(reducer.init),
          };

          return result;
        })
      );
    };

    return create<
      T,
      R,
      {
        reducer: AsyncReducer<T, unknown>;
        halted: boolean;
        halt(): void;
        state: unknown;
      }[]
    >(
      createState,
      async (allState, next, index, halt) => {
        let anyNotHalted = false;

        await Promise.all(
          allState.map(async (red) => {
            if (red.halted) return;

            red.state = await red.reducer.next(
              red.state,
              next,
              index,
              red.halt
            );
            if (!red.halted) anyNotHalted = true;
          })
        );

        if (!anyNotHalted) halt();

        return allState;
      },
      (allState) =>
        Promise.all(
          allState.map((st) => st.reducer.stateToResult(st.state))
        ) as any
    );
  }

  /**
   * Returns an `AsyncReducer` that combines multiple input `reducers` by providing input values to all of them and collecting the outputs in the shape of the given object.
   * @typeparam T - the input type for all the reducers
   * @typeparam R - the result object shape
   * @param reducerObj - an object of keys, and reducers corresponding to those keys
   * @example
   * ```ts
   * const red = AsyncReducer.combineObj({
   *   theSum: Reducer.sum,
   *   theAverage: Reducer.average
   * });
   *
   * await AsyncStream.from(Stream.range({ amount: 9 }))
   *   .reduce(red));
   * // => { theSum: 36, theAverage: 4 }
   * ```
   */
  export function combineObj<T, R extends { readonly [key: string]: unknown }>(
    reducerObj: { readonly [K in keyof R]: AsyncReducer<T, R[K]> } & Record<
      string,
      AsyncReducer<T, unknown>
    >
  ): AsyncReducer<T, R> {
    const createState = async (): Promise<
      Record<
        keyof R,
        {
          reducer: AsyncReducer<T, unknown>;
          halted: boolean;
          halt(): void;
          state: unknown;
        }
      >
    > => {
      const entries = await Promise.all(
        Object.entries(reducerObj).map(async ([key, reducer]) => {
          const result = {
            reducer,
            halted: false,
            halt(): void {
              result.halted = true;
            },
            state: await AsyncOptLazy.toMaybePromise(reducer.init),
          };

          return [key, result] as const;
        })
      );

      return Object.fromEntries(entries) as any;
    };

    return create<
      T,
      R,
      Record<
        keyof R,
        {
          reducer: AsyncReducer<T, unknown>;
          halted: boolean;
          halt(): void;
          state: unknown;
        }
      >
    >(
      createState,
      async (allState, next, index, halt) => {
        let anyNotHalted = false;

        await Promise.all(
          Object.values(allState).map(async (red) => {
            if (red.halted) {
              return;
            }

            red.state = await red.reducer.next(
              red.state,
              next,
              index,
              red.halt
            );

            if (!red.halted) {
              anyNotHalted = true;
            }
          })
        );

        if (!anyNotHalted) {
          halt();
        }

        return allState;
      },
      async (allState) => {
        const entries = await Promise.all(
          Object.entries(allState).map(
            async ([key, st]) =>
              [key, await st.reducer.stateToResult(st.state)] as const
          )
        );

        return Object.fromEntries(entries) as any;
      }
    );
  }
}
