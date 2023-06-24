import { CollectFun, Eq, OptLazy } from './internal.ts';

/**
 * A `Reducer` is a stand-alone calculation that takes input values of type I, and, when requested, produces an output value of type O.
 * @typeparam I - the input value type
 * @typeparam O - the output value type
 */
export type Reducer<I, O = I> = Reducer.Impl<I, O, unknown>;

function identity<T>(value: T): T {
  return value;
}

export namespace Reducer {
  /**
   * The Implementation interface for a `Reducer`, which also exposes the internal state type.
   * @typeparam I - the input value type
   * @typeparam O - the output value type
   * @typeparam S - the internal state type
   */
  export interface Impl<I, O, S> {
    /**
     * The initial state value for the reducer algorithm.
     */
    readonly init: OptLazy<S>;
    /**
     * Returns the next state based on the given input values
     * @param state - the current state
     * @param elem - the current input value
     * @param index - the current input index
     * @param halt - a function that, when called, ensures no more values are passed to the reducer
     */
    next(state: S, elem: I, index: number, halt: () => void): S;
    /**
     * Returns the output value based on the given `state`
     * @param state - the current state
     */
    stateToResult(state: S): O;
    /**
     * Returns a `Reducer` instance that only passes values to the reducer that satisy the given `pred` predicate.
     * @param pred - a function that returns true if the value should be passed to the reducer based on the following inputs:<br/>
     * - value: the current input value<br/>
     * - index: the current input index<br/>
     * - halt: function that, when called, ensures no more new values are passed to the reducer
     * @example
     * ```ts
     * Reducer.sum.filterInput(v => v > 10)
     * // this reducer will only sum values larger than 10
     * ```
     */
    filterInput(
      pred: (value: I, index: number, halt: () => void) => boolean
    ): Reducer<I, O>;
    /**
     * Returns a `Reducer` instance that converts its input values using given `mapFun` before passing them to the reducer.
     * @typeparam I2 - the resulting reducer input type
     * @param mapFun - a function that returns a new value to pass to the reducer based on the following inputs:<br/>
     * - value: the current input value<br/>
     * - index: the current input index
     * @example
     * ```ts
     * Reducer.sum.mapInput(v => v * 2)
     * // this reducer will double all input values before summing them
     * ```
     */
    mapInput<I2>(mapFun: (value: I2, index: number) => I): Reducer<I2, O>;
    /**
     * Returns a `Reducer` instance that converts or filters its input values using given `collectFun` before passing them to the reducer.
     * @typeparam I2 - the resulting reducer input type
     * @param collectFun - a function receiving<br/>
     * - `value`: the next value<br/>
     * - `index`: the value index<br/>
     * - `skip`: a token that, when returned, will not add a value to the resulting collection<br/>
     * - `halt`: a function that, when called, ensures no next elements are passed
     * @example
     * ```ts
     * Reducer.sum.collectInput((v, _, skip) => v <= 10 ? skip : v * 2)
     * // this reducer will double all input values larger thant 10 before summing them,
     * // and will skip all values smaller than 10
     * ```
     */
    collectInput<I2>(collectFun: CollectFun<I2, I>): Reducer<I2, O>;
    /**
     * Returns a `Reducer` instance that converts its output values using given `mapFun`.
     * @typeparam O2 - the resulting reducer output type
     * @param mapFun - a function that takes the current output value and converts it to a new output value
     * @example
     * ```ts
     * Reducer.sum.mapOutput(String)
     * // this reducer will convert all its results to string before returning them
     * ```
     */
    mapOutput<O2>(mapFun: (value: O) => O2): Reducer<I, O2>;
    /**
     * Returns a `Reducer` instance that takes at most the given `amount` of input elements, and will ignore subsequent elements.
     * @param amount - the amount of elements to accept
     * @example
     * ```ts
     * Stream.range({ end: 10 }).reduce(Reducer.sum.takeInput(2))
     * // => 1
     * ```
     */
    takeInput(amount: number): Reducer<I, O>;
    /**
     * Returns a `Reducer` instance that skips the first given `amount` of input elements, and will process subsequent elements.
     * @param amount - the amount of elements to skip
     * @example
     * ```ts
     * Stream.range({ end: 10 }).reduce(Reducer.sum.dropInput(9))
     * // => 19
     * ```
     */
    dropInput(amount: number): Reducer<I, O>;
    /**
     * Returns a `Reducer` instance that takes given `amount` of elements starting at given `from` index, and ignores other elements.
     * @param from - (default: 0) the index at which to start processing elements
     * @param amount - (optional) the amount of elements to process, if not given, processes all elements from the `from` index
     * @example
     * ```ts
     * Stream.range({ end: 10 }).reduce(Reducer.sum.sliceInput(1, 2))
     * // => 3
     * ```
     */
    sliceInput(from?: number, amount?: number): Reducer<I, O>;
  }

  /**
   * A base class that can be used to easily create `Reducer` instances.
   * @typeparam I - the input value type
   * @typeparam O - the output value type
   * @typeparam S - the internal state type
   */
  export class Base<I, O, S> implements Reducer.Impl<I, O, S> {
    constructor(
      readonly init: OptLazy<S>,
      readonly next: (state: S, elem: I, index: number, halt: () => void) => S,
      readonly stateToResult: (state: S) => O
    ) {}

    filterInput(
      pred: (value: I, index: number, halt: () => void) => boolean
    ): Reducer<I, O> {
      return create(
        (): { state: S; nextIndex: number } => ({
          nextIndex: 0,
          state: OptLazy(this.init),
        }),
        (state, elem, index, halt): { state: S; nextIndex: number } => {
          if (pred(elem, index, halt)) {
            state.state = this.next(state.state, elem, state.nextIndex++, halt);
          }
          return state;
        },
        (state): O => this.stateToResult(state.state)
      );
    }

    mapInput<I2>(mapFun: (value: I2, index: number) => I): Reducer<I2, O> {
      return create(
        this.init,
        (state, elem, index, halt): S =>
          this.next(state, mapFun(elem, index), index, halt),
        this.stateToResult
      );
    }

    collectInput<I2>(collectFun: CollectFun<I2, I>): Reducer<I2, O> {
      return create(
        (): { state: S; nextIndex: number } => ({
          nextIndex: 0,
          state: OptLazy(this.init),
        }),
        (state, elem, index, halt): { state: S; nextIndex: number } => {
          const nextElem = collectFun(elem, index, CollectFun.Skip, halt);

          if (CollectFun.Skip !== nextElem) {
            state.state = this.next(
              state.state,
              nextElem,
              state.nextIndex++,
              halt
            );
          }

          return state;
        },
        (state): O => this.stateToResult(state.state)
      );
    }

    mapOutput<O2>(mapFun: (value: O) => O2): Reducer<I, O2> {
      return create(
        this.init,
        this.next,
        (state): O2 => mapFun(this.stateToResult(state))
      );
    }

    takeInput(amount: number): Reducer<I, O> {
      if (amount <= 0) {
        return create(this.init, identity, this.stateToResult);
      }

      return this.filterInput((_, i, halt): boolean => {
        const more = i < amount;
        if (!more) halt();
        return more;
      });
    }

    dropInput(amount: number): Reducer<I, O> {
      if (amount <= 0) return this;

      return this.filterInput((_, i): boolean => i >= amount);
    }

    sliceInput(from = 0, amount?: number): Reducer<I, O> {
      if (undefined === amount) return this.dropInput(from);
      if (amount <= 0) return create(this.init, identity, this.stateToResult);
      if (from <= 0) return this.takeInput(amount);
      return this.takeInput(amount).dropInput(from);
    }
  }

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
   * const evenNumberOfOnes = Reducer
   *   .create(
   *     true,
   *     (current, value: number) => value === 1 ? !current : current,
   *     state => state ? 'even' : 'not even')
   * const result = Stream.of(1, 2, 3, 2, 1)).reduce(evenNumberOfOnes)
   * console.log+(result)
   * // => 'even'
   * ```
   */
  export function create<I, O = I, S = O>(
    init: OptLazy<S>,
    next: (current: S, next: I, index: number, halt: () => void) => S,
    stateToResult: (state: S) => O
  ): Reducer<I, O> {
    return new Reducer.Base(init, next, stateToResult);
  }

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
   * const sum = Reducer
   *   .createMono(
   *     0,
   *     (current, value) => current + value
   *   )
   * const result = Stream.of(1, 2, 3, 2, 1)).reduce(sum)
   * console.log+(result)
   * // => 9
   * ```
   */
  export function createMono<T>(
    init: OptLazy<T>,
    next: (current: T, next: T, index: number, halt: () => void) => T,
    stateToResult?: (state: T) => T
  ): Reducer<T> {
    return create(init, next, stateToResult ?? identity);
  }

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
   * const boolToString = Reducer
   *   .createOutput(
   *     '',
   *     (current, value: boolean) => current + (value ? 'T' : 'F')
   *   )
   * const result = Stream.of(true, false, true)).reduce(boolToString)
   * console.log+(result)
   * // => 'TFT'
   * ```
   */
  export function createOutput<I, O = I>(
    init: OptLazy<O>,
    next: (current: O, next: I, index: number, halt: () => void) => O,
    stateToResult?: (state: O) => O
  ): Reducer<I, O> {
    return create(init, next, stateToResult ?? identity);
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
    <T>(compFun: (v1: T, v2: T) => number): Reducer<T, T | undefined>;
    <T, O>(compFun: (v1: T, v2: T) => number, otherwise: OptLazy<O>): Reducer<
      T,
      T | O
    >;
  } = <T, O>(compFun: (v1: T, v2: T) => number, otherwise?: OptLazy<O>) => {
    const token = Symbol();
    return create<T, T | O, T | typeof token>(
      token,
      (state, next): T => {
        if (token === state) return next;
        return compFun(state, next) < 0 ? state : next;
      },
      (state): T | O => (token === state ? OptLazy(otherwise!) : state)
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
    (): Reducer<number, number | undefined>;
    <O>(otherwise: OptLazy<O>): Reducer<number, number | O>;
  } = <O,>(otherwise?: OptLazy<O>) => {
    return create<number, number | O, number | undefined>(
      undefined,
      (state, next): number =>
        undefined !== state && state < next ? state : next,
      (state): number | O => state ?? OptLazy(otherwise!)
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
    <T>(compFun: (v1: T, v2: T) => number): Reducer<T, T | undefined>;
    <T, O>(compFun: (v1: T, v2: T) => number, otherwise: OptLazy<O>): Reducer<
      T,
      T | O
    >;
  } = <T, O>(
    compFun: (v1: T, v2: T) => number,
    otherwise?: OptLazy<O>
  ): Reducer<T, T | O> => {
    const token = Symbol();
    return create<T, T | O, T | typeof token>(
      token,
      (state, next): T => {
        if (token === state) return next;
        return compFun(state, next) > 0 ? state : next;
      },
      (state): T | O => (token === state ? OptLazy(otherwise!) : state)
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
    (): Reducer<number, number | undefined>;
    <O>(otherwise: OptLazy<O>): Reducer<number, number | O>;
  } = <O,>(otherwise?: OptLazy<O>): Reducer<number, number | O> => {
    return create<number, number | O, number | undefined>(
      undefined,
      (state, next): number =>
        undefined !== state && state > next ? state : next,
      (state): number | O => state ?? OptLazy(otherwise!)
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
  } = {}): Reducer<T, string> {
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
   * Returns a `Reducer` that remembers the amount of input items provided.
   * @param pred - (optional) a predicate that returns false if the item should not be counted given:<br/>
   * - value: the current input value<br/>
   * - index: the input value index
   * @example
   * ```ts
   * const stream = Stream.range({ amount: 10 })
   * console.log(stream.reduce(Reducer.count()))
   * // => 10
   * console.log(stream.reduce(Reducer.count(v => v < 5)))
   * // => 5
   * ```
   */
  export const count: {
    (): Reducer<never, number>;
    <T>(pred: (value: T, index: number) => boolean): Reducer<T, number>;
  } = (
    pred?: (value: unknown, index: number) => boolean
  ): Reducer<never, number> => {
    if (undefined === pred) return createOutput(0, (_, __, i): number => i + 1);

    return createOutput(0, (state, next, i): number => {
      if (pred?.(next, i)) return state + 1;
      return state;
    });
  };

  /**
   * Returns a `Reducer` that remembers the first input value for which the given `pred` function returns true.
   * @param pred - a function taking an input value and its index, and returning true if the value should be remembered
   * @param otherwise - (default: undefined) a fallback value to output if no input value yet has satisfied the given predicate
   * @typeparam T - the input value type
   * @typeparam O - the fallback value type
   * @example
   * ```ts
   * console.log(Stream.range({ amount: 10 }).reduce(Reducer.firstWhere(v => v > 5)))
   * // => 6
   * ```
   */
  export const firstWhere: {
    <T>(pred: (value: T, index: number) => boolean): Reducer<T, T | undefined>;
    <T, O>(
      pred: (value: T, index: number) => boolean,
      otherwise: OptLazy<O>
    ): Reducer<T, T | O>;
  } = <T, O>(
    pred: (value: T, index: number) => boolean,
    otherwise?: OptLazy<O>
  ) => {
    const token = Symbol();

    return create<T, T | O, T | typeof token>(
      token,
      (state, next, i, halt): T | typeof token => {
        if (token === state && pred(next, i)) {
          halt();
          return next;
        }
        return state;
      },
      (state): T | O => (token === state ? OptLazy(otherwise!) : state)
    );
  };

  /**
   * Returns a `Reducer` that remembers the first input value.
   * @param otherwise - (default: undefined) a fallback value to output if no input value has been provided
   * @typeparam T - the input value type
   * @typeparam O - the fallback value type
   * @example
   * ```ts
   * console.log(Stream.range{ amount: 10 }).reduce(Reducer.first())
   * // => 0
   * ```
   */
  export const first: {
    <T>(): Reducer<T, T | undefined>;
    <T, O>(otherwise: OptLazy<O>): Reducer<T, T | O>;
  } = <T, O>(otherwise?: OptLazy<O>): Reducer<T, T | O> => {
    const token = Symbol();

    return create<T, T | O, T | typeof token>(
      token,
      (state, next, _, halt): T => {
        halt();
        if (token === state) return next;
        return state;
      },
      (state): T | O => (token === state ? OptLazy(otherwise!) : state)
    );
  };

  /**
   * Returns a `Reducer` that remembers the last input value for which the given `pred` function returns true.
   * @param pred - a function taking an input value and its index, and returning true if the value should be remembered
   * @param otherwise - (default: undefined) a fallback value to output if no input value yet has satisfied the given predicate
   * @typeparam T - the input value type
   * @typeparam O - the fallback value type
   * @example
   * ```ts
   * console.log(Stream.range({ amount: 10 }).reduce(Reducer.lastWhere(v => v > 5)))
   * // => 9
   * ```
   */
  export const lastWhere: {
    <T>(pred: (value: T, index: number) => boolean): Reducer<T, T | undefined>;
    <T, O>(
      pred: (value: T, index: number) => boolean,
      otherwise: OptLazy<O>
    ): Reducer<T, T | O>;
  } = <T, O>(
    pred: (value: T, index: number) => boolean,
    otherwise?: OptLazy<O>
  ) => {
    const token = Symbol();

    return create<T, T | O, T | typeof token>(
      token,
      (state, next, i): T | typeof token => {
        if (pred(next, i)) return next;
        return state;
      },
      (state): T | O => (token === state ? OptLazy(otherwise!) : state)
    );
  };

  /**
   * Returns a `Reducer` that remembers the last input value.
   * @param otherwise - (default: undefined) a fallback value to output if no input value has been provided
   * @typeparam T - the input value type
   * @typeparam O - the fallback value type
   * @example
   * ```ts
   * console.log(Stream.range{ amount: 10 }).reduce(Reducer.last())
   * // => 9
   * ```
   */
  export const last: {
    <T>(): Reducer<T, T | undefined>;
    <T, O>(otherwise: OptLazy<O>): Reducer<T, T | O>;
  } = <T, O>(otherwise?: OptLazy<O>): Reducer<T, T | O> => {
    const token = Symbol();

    return create<T, T | O, T | typeof token>(
      () => token,
      (_, next): T => next,
      (state): T | O => (token === state ? OptLazy(otherwise!) : state)
    );
  };

  /**
   * Returns a `Reducer` that ouputs false as long as no input value satisfies given `pred`, true otherwise.
   * @typeparam T - the element type
   * @param pred - a function taking an input value and its index, and returning true if the value satisfies the predicate
   * @example
   * ```ts
   * console.log(Stream.range{ amount: 10 }).reduce(Reducer.some(v => v > 5))
   * // => true
   * ```
   */
  export function some<T>(
    pred: (value: T, index: number) => boolean
  ): Reducer<T, boolean> {
    return createOutput<T, boolean>(false, (state, next, i, halt): boolean => {
      if (state) return state;
      const satisfies = pred(next, i);

      if (satisfies) {
        halt();
      }

      return satisfies;
    });
  }

  /**
   * Returns a `Reducer` that ouputs true as long as all input values satisfy the given `pred`, false otherwise.
   * @typeparam T - the element type
   * @param pred - a function taking an input value and its index, and returning true if the value satisfies the predicate
   * @example
   * ```ts
   * console.log(Stream.range{ amount: 10 }).reduce(Reducer.every(v => v < 5))
   * // => false
   * ```
   */
  export function every<T>(
    pred: (value: T, index: number) => boolean
  ): Reducer<T, boolean> {
    return createOutput<T, boolean>(true, (state, next, i, halt): boolean => {
      if (!state) return state;

      const satisfies = pred(next, i);

      if (!satisfies) {
        halt();
      }

      return satisfies;
    });
  }

  /**
   * Returns a `Reducer` that outputs false as long as the given `elem` has not been encountered in the input values, true otherwise.
   * @typeparam T - the element type
   * @param elem - the element to search for
   * @param eq - (optional) a comparison function that returns true if te two given input values are considered equal
   * @example
   * ```ts
   * console.log(Stream.range({ amount: 10 }).reduce(Reducer.contains(5)))
   * // => true
   * ```
   */
  export function contains<T>(
    elem: T,
    eq: Eq<T> = Object.is
  ): Reducer<T, boolean> {
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
   * Returns a `Reducer` that takes boolean values and outputs true if all input values are true, and false otherwise.
   * @example
   * ```ts
   * console.log(Stream.of(true, false, true)).reduce(Reducer.and))
   * // => false
   * ```
   */
  export const and = createMono(true, (state, next, _, halt): boolean => {
    if (!state) return state;
    if (!next) halt();
    return next;
  });

  /**
   * Returns a `Reducer` that takes boolean values and outputs true if one or more input values are true, and false otherwise.
   * @example
   * ```ts
   * console.log(Stream.of(true, false, true)).reduce(Reducer.or))
   * // => true
   * ```
   */
  export const or = createMono(false, (state, next, _, halt): boolean => {
    if (state) return state;
    if (next) halt();
    return next;
  });

  /**
   * Returns a `Reducer` that outputs true if no input values are received, false otherwise.
   * @example
   * ```ts
   * console.log(Stream.of(1, 2, 3).reduce(Reducer.isEmpty))
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
   * Returns a `Reducer` that outputs true if one or more input values are received, false otherwise.
   * @example
   * ```ts
   * console.log(Stream.of(1, 2, 3).reduce(Reducer.nonEmpty))
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
   * Returns a `Reducer` that collects received input values in an array, and returns a copy of that array as an output value when requested.
   * @typeparam T - the element type
   * @example
   * ```ts
   * console.log(Stream.of(1, 2, 3).reduce(Reducer.toArray()))
   * // => [1, 2, 3]
   * ```
   */
  export function toArray<T>(): Reducer<T, T[]> {
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
  export function toJSMap<K, V>(): Reducer<[K, V], Map<K, V>> {
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
   * Returns a `Reducer` that collects received input values into a mutable JS Set, and returns
   * a copy of that map when output is requested.
   * @typeparam T - the element type
   * @example
   * ```ts
   * console.log(Stream.of(1, 2, 3).reduce(Reducer.toJSSet()))
   * // Set {1, 2, 3}
   * ```
   */
  export function toJSSet<T>(): Reducer<T, Set<T>> {
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
  export function toJSObject<K extends string | number | symbol, V>(): Reducer<
    [K, V],
    Record<K, V>
  > {
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
   * Returns a `Reducer` that combines multiple input `reducers` by providing input values to all of them and collecting the outputs in an array.
   * @param reducers - 2 or more reducers to combine
   * @example
   * ```ts
   * const red = Reducer.combineArr(Reducer.sum, Reducer.average)
   * console.log(Stream.range({amount: 9 }).reduce(red))
   * // => [36, 4]
   * ```
   */
  export function combineArr<
    T,
    R extends readonly [unknown, unknown, ...unknown[]]
  >(
    ...reducers: { [K in keyof R]: Reducer<T, R[K]> } & Reducer<T, unknown>[]
  ): Reducer<T, R> {
    const createState = (): {
      reducer: Reducer<T, unknown>;
      halted: boolean;
      halt(): void;
      state: unknown;
    }[] => {
      return reducers.map((reducer) => {
        const result = {
          reducer,
          halted: false,
          halt(): void {
            result.halted = true;
          },
          state: OptLazy(reducer.init),
        };

        return result;
      });
    };

    return create<T, R, ReturnType<typeof createState>>(
      createState,
      (allState, next, index, halt) => {
        let anyNotHalted = false;

        let i = -1;
        const len = allState.length;

        while (++i < len) {
          const red = allState[i];

          if (red.halted) {
            continue;
          }

          red.state = red.reducer.next(red.state, next, index, red.halt);

          if (!red.halted) {
            anyNotHalted = true;
          }
        }

        if (!anyNotHalted) {
          halt();
        }

        return allState;
      },
      (allState) =>
        allState.map((st) => st.reducer.stateToResult(st.state)) as any
    );
  }

  /**
   * Returns a `Reducer` that combines multiple input `reducers` by providing input values to all of them and collecting the outputs in the shape of the given object.
   * @typeparam T - the input type for all the reducers
   * @typeparam R - the result object shape
   * @param reducerObj - an object of keys, and reducers corresponding to those keys
   * @example
   * ```ts
   * const red = Reducer.combineObj({
   *   theSum: Reducer.sum,
   *   theAverage: Reducer.average
   * });
   *
   * Stream.range({ amount: 9 }).reduce(red);
   * // => { theSum: 36, theAverage: 4 }
   * ```
   */
  export function combineObj<T, R extends { readonly [key: string]: unknown }>(
    reducerObj: { readonly [K in keyof R]: Reducer<T, R[K]> } & Record<
      string,
      Reducer<T, unknown>
    >
  ): Reducer<T, R> {
    const createState = (): Record<
      keyof R,
      {
        reducer: Reducer<T, unknown>;
        halted: boolean;
        halt(): void;
        state: unknown;
      }
    > => {
      const allState: any = {};

      for (const key in reducerObj) {
        const reducer = reducerObj[key];

        const result = {
          reducer,
          halted: false,
          halt(): void {
            result.halted = true;
          },
          state: OptLazy(reducer.init),
        };

        allState[key] = result;
      }

      return allState;
    };

    return create<T, R, ReturnType<typeof createState>>(
      createState,
      (allState, next, index, halt) => {
        let anyNotHalted = false;

        for (const key in allState) {
          const red = allState[key];

          if (red.halted) {
            continue;
          }

          red.state = red.reducer.next(red.state, next, index, red.halt);

          if (!red.halted) {
            anyNotHalted = true;
          }
        }

        if (!anyNotHalted) {
          halt();
        }

        return allState;
      },
      (allState) => {
        const result: any = {};

        for (const key in allState) {
          const st = allState[key];
          result[key] = st.reducer.stateToResult(st.state);
        }

        return result;
      }
    );
  }
}
