import { CollectFun, type Eq, ErrBase, OptLazy } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

/**
 * A `Reducer` is a stand-alone calculation that takes input values of type I, and, when requested, produces an output value of type O.
 * @typeparam I - the input value type
 * @typeparam O - the output value type
 */
export type Reducer<I, O = I> = Reducer.Impl<I, O, unknown>;

function identity<T>(value: T): T {
  return value;
}

function combineObj<T, R extends { readonly [key: string]: unknown }>(
  reducerObj: { readonly [K in keyof R]: Reducer<T, R[K]> } & Record<
    string,
    Reducer<T, unknown>
  >
): Reducer<T, R> {
  return Reducer.create(
    () => {
      const result: Record<string, Reducer.Instance<T, any>> = {};

      for (const key in reducerObj) {
        result[key] = reducerObj[key].compile();
      }

      return result;
    },
    (state, elem, index, halt) => {
      let anyNotHalted = false;

      for (const key in state) {
        const reducerInstance = state[key];

        if (!reducerInstance.halted) {
          reducerInstance.next(elem);

          anyNotHalted = anyNotHalted || !reducerInstance.halted;
        }
      }

      if (!anyNotHalted) {
        halt();
      }

      return state;
    },
    (state) => {
      const result: any = {};

      for (const key in state) {
        result[key] = state[key].getOutput();
      }

      return result as R;
    }
  );
}

function combineArr<T, R extends readonly [unknown, unknown, ...unknown[]]>(
  ...reducers: { [K in keyof R]: Reducer<T, R[K]> } & Reducer<T, unknown>[]
): Reducer<T, R> {
  return Reducer.create<T, any, Reducer.Instance<T, unknown>[]>(
    () => reducers.map((reducer) => reducer.compile()),
    (state, elem, index, halt) => {
      let anyNotHalted = false;

      let i = -1;
      const len = state.length;

      while (++i < len) {
        const reducerInstance = state[i];

        if (!reducerInstance.halted) {
          reducerInstance.next(elem);
          anyNotHalted = anyNotHalted || !reducerInstance.halted;
        }
      }

      if (!anyNotHalted) {
        halt();
      }

      return state;
    },
    (state) => state.map((reducerInstance) => reducerInstance.getOutput())
  );
}

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
     */
    readonly init: () => S;
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
     */
    stateToResult(state: S): O;
    /**
     * Returns a `Reducer` instance that only passes values to the reducer that satisy the given `pred` predicate.
     * @param pred - a function that returns true if the value should be passed to the reducer based on the following inputs:<br/>
     * - value: the current input value<br/>
     * - index: the current input index<br/>
     * - halt: function that, when called, ensures no more new values are passed to the reducer
     * @param options - (optional) an object containing the following properties:<br/>
     * - negate: (default: false) when true will invert the given predicate
     * @example
     * ```ts
     * Reducer.sum.filterInput(v => v > 10)
     * // this reducer will only sum values larger than 10
     * ```
     */
    filterInput(
      pred: (value: I, index: number, halt: () => void) => boolean,
      options?: { negate?: boolean }
    ): Reducer<I, O>;
    /**
     * Returns a `Reducer` instance that converts its input values using given `mapFun` before passing them to this reducer.
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
     * Returns a `Reducer` instance that converts each output value from some source reducer into an arbitrary number of output values
     * using given `flatMapFun` before passing them to this reducer.
     * @typeparam I2 - the resulting reducer input type
     * @param mapFun - a function that returns a new value to pass to the reducer based on the following inputs:<br/>
     * - value: the current input value<br/>
     * - index: the current input index
     * @example
     * ```ts
     * Reducer.sum.flatMapInput(v => [v, v + 1])
     * // this reducer will add v and v + 1 to the sum for each input value
     * ```
     */
    flatMapInput<I2>(
      flatMapFun: (value: I2, index: number) => StreamSource<I>
    ): Reducer<I2, O>;
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
    /**
     * Returns a `Reducer` instance that first applies this reducer, and then applies the given `next` reducer to each output produced
     * by the previous reducer.
     * @typeparam O1 - the output type of the `nextReducer1` reducer
     * @typeparam O2 - the output type of the `nextReducer2` reducer
     * @typeparam O3 - the output type of the `nextReducer3` reducer
     * @typeparam O4 - the output type of the `nextReducer4` reducer
     * @typeparam O5 - the output type of the `nextReducer5` reducer
     * @param nextReducer1 - the next reducer to apply to each output of this reducer.
     * @param nextReducer2 - (optional) the next reducer to apply to each output of this reducer.
     * @param nextReducer3 - (optional) the next reducer to apply to each output of this reducer.
     * @param nextReducer4 - (optional) the next reducer to apply to each output of this reducer.
     * @param nextReducer5 - (optional) the next reducer to apply to each output of this reducer.
     * @example
     * ```ts
     * Stream.of(1, 2, 3)
     *  .reduce(
     *    Reducer.product
     *      .pipe(Reducer.sum)
     *    )
     * // => 9
     * ```
     */
    pipe<O1>(nextReducer1: Reducer<O, O1>): Reducer<I, O1>;
    pipe<O1, O2>(
      nextReducer1: Reducer<O, O1>,
      nextReducer2: Reducer<O1, O2>
    ): Reducer<I, O2>;
    pipe<O1, O2, O3>(
      nextReducer1: Reducer<O, O1>,
      nextReducer2: Reducer<O1, O2>,
      nextReducer3: Reducer<O2, O3>
    ): Reducer<I, O3>;
    pipe<O1, O2, O3, O4>(
      nextReducer1: Reducer<O, O1>,
      nextReducer2: Reducer<O1, O2>,
      nextReducer3: Reducer<O2, O3>,
      nextReducer4: Reducer<O3, O4>
    ): Reducer<I, O4>;
    pipe<O1, O2, O3, O4, O5>(
      nextReducer1: Reducer<O, O1>,
      nextReducer2: Reducer<O1, O2>,
      nextReducer3: Reducer<O2, O3>,
      nextReducer4: Reducer<O3, O4>,
      nextReducer5: Reducer<O4, O5>
    ): Reducer<I, O5>;
    /**
     * Returns a reducer that applies the given `nextReducers` sequentially after this reducer
     * has halted, and moving on to the next provided reducer until it is halted. Optionally, it provides the last output
     * value of the previous reducer.
     * @param nextReducers - an number of reducers consuming and producing the same types as the current reducer.
     * @example
     * ```ts
     * const result = Stream.range({ amount: 6 })
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
    chain<O1>(nextReducer1: OptLazy<Reducer<I, O1>, [O]>): Reducer<I, O1>;
    chain<O1, O2>(
      nextReducer1: OptLazy<Reducer<I, O1>, [O]>,
      nextReducer2: OptLazy<Reducer<I, O2>, [O1]>
    ): Reducer<I, O2>;
    chain<O1, O2, O3>(
      nextReducer1: OptLazy<Reducer<I, O1>, [O]>,
      nextReducer2: OptLazy<Reducer<I, O2>, [O1]>,
      nextReducer3: OptLazy<Reducer<I, O3>, [O2]>
    ): Reducer<I, O3>;
    chain<O1, O2, O3, O4>(
      nextReducer1: OptLazy<Reducer<I, O1>, [O]>,
      nextReducer2: OptLazy<Reducer<I, O2>, [O1]>,
      nextReducer3: OptLazy<Reducer<I, O3>, [O2]>,
      nextReducer4: OptLazy<Reducer<I, O4>, [O3]>
    ): Reducer<I, O4>;
    chain<O1, O2, O3, O4, O5>(
      nextReducer1: OptLazy<Reducer<I, O1>, [O]>,
      nextReducer2: OptLazy<Reducer<I, O2>, [O1]>,
      nextReducer3: OptLazy<Reducer<I, O3>, [O2]>,
      nextReducer4: OptLazy<Reducer<I, O4>, [O3]>,
      nextReducer5: OptLazy<Reducer<I, O5>, [O4]>
    ): Reducer<I, O5>;
    /**
     * Returns a 'runnable' instance of the current reducer specification. This instance maintains its own state
     * and indices, so that the instance only needs to be provided the input values, and output values can be
     * retrieved when needed. The state is kept private.
     * @example
     * ```ts
     * const reducer = Reducer.sum.mapOutput(v => v * 2);
     * const instance = reducer.compile();
     * instance.next(3);
     * instance.next(5);
     * console.log(instance.getOutput());
     * // => 16
     * ```
     */

    compile(): Reducer.Instance<I, O>;
  }

  /**
   * A base class that can be used to easily create `Reducer` instances.
   * @typeparam I - the input value type
   * @typeparam O - the output value type
   * @typeparam S - the internal state type
   */
  export class Base<I, O, S> implements Reducer.Impl<I, O, S> {
    constructor(
      readonly init: () => S,
      readonly next: (state: S, elem: I, index: number, halt: () => void) => S,
      readonly stateToResult: (state: S) => O
    ) {}

    filterInput(
      pred: (value: I, index: number, halt: () => void) => boolean,
      options: { negate?: boolean } = {}
    ): Reducer<I, O> {
      const { negate = false } = options;

      return create(
        () => this.compile(),
        (state, elem, index, halt) => {
          if (pred(elem, index, halt) !== negate) {
            state.next(elem);

            if (state.halted) {
              halt();
            }
          }

          return state;
        },
        (state): O => state.getOutput()
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

    flatMapInput<I2>(
      flatMapFun: (value: I2, index: number) => StreamSource<I>
    ): Reducer<I2, O> {
      return create<I2, O, Reducer.Instance<I, O>>(
        () => this.compile(),
        (state, elem, index, halt) => {
          if (state.halted) {
            halt();
            return state;
          }

          const elems = flatMapFun(elem, index);

          const iter = Stream.from(elems)[Symbol.iterator]();
          const done = Symbol();
          let value: I | typeof done;

          while (done !== (value = iter.fastNext(done))) {
            state.next(value);

            if (state.halted) {
              halt();
              break;
            }
          }

          return state;
        },
        (state) => state.getOutput()
      );
    }

    collectInput<I2>(collectFun: CollectFun<I2, I>): Reducer<I2, O> {
      return create(
        () => this.compile(),
        (state, elem, index, halt) => {
          const nextElem = collectFun(elem, index, CollectFun.Skip, halt);

          if (CollectFun.Skip !== nextElem) {
            state.next(nextElem);
            if (state.halted) {
              halt();
            }
          }

          return state;
        },
        (state): O => state.getOutput()
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
        if (i >= amount - 1) {
          halt();
        }

        return i < amount;
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

    pipe<O2>(...nextReducers: Reducer<O, O2>[]): Reducer<I, O2> {
      if (nextReducers.length <= 0) {
        return this as any;
      }

      const [nextReducer, ...others] = nextReducers as Reducer<any, any>[];

      if (others.length > 0) {
        return (this.pipe(nextReducer).pipe as any)(...others);
      }

      return Reducer.create(
        () => ({
          thisInstance: this.compile(),
          nextInstance: nextReducer.compile(),
        }),
        (state, next, index, halt) => {
          const { thisInstance, nextInstance } = state;

          thisInstance.next(next);
          nextInstance.next(thisInstance.getOutput());

          if (thisInstance.halted || nextInstance.halted) {
            halt();
          }

          return state;
        },
        (state) => state.nextInstance.getOutput()
      );
    }

    chain(...nextReducers: OptLazy<Reducer<I, any>, [any]>[]): Reducer<I, O> {
      return Reducer.create(
        () => ({
          activeIndex: -1,
          activeInstance: this.compile() as Reducer.Instance<I, O>,
        }),
        (state, next, index, halt) => {
          while (state.activeInstance.halted) {
            if (state.activeIndex >= nextReducers.length - 1) {
              return state;
            }

            state.activeInstance = OptLazy(
              nextReducers[++state.activeIndex],
              state.activeInstance.getOutput()
            ).compile();
          }

          state.activeInstance.next(next);

          if (
            state.activeInstance.halted &&
            state.activeIndex >= nextReducers.length - 1
          ) {
            halt();
          }

          return state;
        },
        (state) => state.activeInstance.getOutput()
      );
    }

    compile(): Reducer.Instance<I, O> {
      return new Reducer.InstanceImpl(this);
    }
  }

  export interface Instance<I, O> {
    get halted(): boolean;
    get index(): number;
    next(value: I): void;
    getOutput(): O;
  }

  export class InstanceImpl<I, O, S> implements Reducer.Instance<I, O> {
    constructor(readonly reducer: Reducer.Impl<I, O, S>) {}

    #initialized = false;
    #_state: S | undefined;
    #index = 0;
    #halted = false;

    get #state(): S {
      if (!this.#initialized) {
        this.#_state = this.reducer.init();
        this.#initialized = true;
      }

      return this.#_state as S;
    }

    set #state(value: S) {
      this.#_state = value;
    }

    #halt = (): void => {
      this.#halted = true;
    };

    get halted(): boolean {
      return this.#halted;
    }

    get index(): number {
      return this.#index;
    }

    next = (value: I): void => {
      if (this.#halted) {
        throw new Reducer.ReducerHaltedError();
      }

      this.#state = this.reducer.next(
        this.#state,
        value,
        this.#index++,
        this.#halt
      );
    };

    getOutput(): O {
      return this.reducer.stateToResult(this.#state as S);
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
    init: () => S,
    next: (current: S, next: I, index: number, halt: () => void) => S,
    stateToResult: (state: S) => O
  ): Reducer<I, O> {
    return new Reducer.Base(init, next, stateToResult);
  }

  export function fixed<O>(output: O): Reducer<any, O> {
    return create(
      () => {
        //
      },
      (state, next, index, halt) => {
        halt();
        return state;
      },
      () => output
    );
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
    init: () => T,
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
    init: () => O,
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
  export const sum = createMono(
    () => 0,
    (state, next): number => state + next
  );

  /**
   * A `Reducer` that calculates the product of all given numeric input values.
   * @example
   * ```ts
   * console.log(Stream.range({ start: 1, amount: 5 }).reduce(product))
   * // => 120
   * ```
   */
  export const product = createMono(
    () => 1,
    (state, next, _, halt): number => {
      if (0 === next) halt();
      return state * next;
    }
  );

  /**
   * A `Reducer` that calculates the average of all given numberic input values.
   * @example
   * ```ts
   * console.log(Stream.range({ amount: 5 }).reduce(Reducer.average));
   * // => 2
   * ```
   */
  export const average = createMono(
    () => 0,
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
      () => token,
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
      () => undefined,
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
      () => token,
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
      () => undefined,
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
    return create(
      () => ({ result: '', curSep: '', curStart: start }),
      (state, next) => {
        state.result = state.curStart.concat(
          state.result,
          state.curSep,
          valueToString(next)
        );
        state.curSep = sep;
        state.curStart = '';

        return state;
      },
      (state): string => state.result.concat(end)
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
    <T>(
      pred: (value: T, index: number) => boolean,
      options?: { negate?: boolean }
    ): Reducer<T, number>;
  } = (
    pred?: (value: unknown, index: number) => boolean,
    options: { negate?: boolean } = {}
  ): Reducer<never, number> => {
    if (undefined === pred) {
      return createOutput(
        () => 0,
        (_, __, i): number => i + 1
      );
    }

    const { negate = false } = options;

    return createOutput(
      () => 0,
      (state, next, i): number => {
        if (pred(next, i) !== negate) return state + 1;
        return state;
      }
    );
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
    <T>(
      pred: (value: T, index: number) => boolean,
      options?: { negate?: boolean }
    ): Reducer<T, T | undefined>;
    <T, O>(
      pred: (value: T, index: number) => boolean,
      options: {
        negate?: boolean;
        otherwise: OptLazy<O>;
      }
    ): Reducer<T, T | O>;
  } = <T, O>(
    pred: (value: T, index: number) => boolean,
    options: {
      negate?: boolean;
      otherwise?: OptLazy<O>;
    } = {}
  ) => {
    const { negate = false, otherwise } = options;

    const token = Symbol();

    return create<T, T | O, T | typeof token>(
      () => token,
      (state, next, i, halt): T | typeof token => {
        if (token === state && pred(next, i) !== negate) {
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
      () => token,
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
    <T>(
      pred: (value: T, index: number) => boolean,
      options?: { negate?: boolean }
    ): Reducer<T, T | undefined>;
    <T, O>(
      pred: (value: T, index: number) => boolean,
      options: {
        negate?: boolean;
        otherwise: OptLazy<O>;
      }
    ): Reducer<T, T | O>;
  } = <T, O>(
    pred: (value: T, index: number) => boolean,
    options: {
      negate?: boolean;
      otherwise?: OptLazy<O>;
    } = {}
  ) => {
    const { negate = false, otherwise } = options;
    const token = Symbol();

    return create<T, T | O, T | typeof token>(
      () => token,
      (state, next, i): T | typeof token => {
        if (pred(next, i) !== negate) return next;
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
    pred: (value: T, index: number) => boolean,
    options: { negate?: boolean } = {}
  ): Reducer<T, boolean> {
    const { negate = false } = options;

    return createOutput<T, boolean>(
      () => false,
      (state, next, i, halt): boolean => {
        if (state) return state;

        const satisfies = pred(next, i) !== negate;

        if (satisfies) {
          halt();
        }

        return satisfies;
      }
    );
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
    pred: (value: T, index: number) => boolean,
    options: { negate?: boolean } = {}
  ): Reducer<T, boolean> {
    const { negate = false } = options;

    return createOutput<T, boolean>(
      () => true,
      (state, next, i, halt): boolean => {
        if (!state) return state;

        const satisfies = pred(next, i) !== negate;

        if (!satisfies) {
          halt();
        }

        return satisfies;
      }
    );
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
    options: {
      eq?: Eq<T>;
      negate?: boolean;
    } = {}
  ): Reducer<T, boolean> {
    const { eq = Object.is, negate = false } = options;

    return createOutput<T, boolean>(
      () => false,
      (state, next, _, halt): boolean => {
        if (state) return state;
        const satisfies = eq(next, elem) !== negate;

        if (satisfies) {
          halt();
        }

        return satisfies;
      }
    );
  }

  /**
   * Returns a `Reducer` that takes boolean values and outputs true if all input values are true, and false otherwise.
   * @example
   * ```ts
   * console.log(Stream.of(true, false, true)).reduce(Reducer.and))
   * // => false
   * ```
   */
  export const and = createMono(
    () => true,
    (state, next, _, halt): boolean => {
      if (!state) return state;
      if (!next) halt();
      return next;
    }
  );

  /**
   * Returns a `Reducer` that takes boolean values and outputs true if one or more input values are true, and false otherwise.
   * @example
   * ```ts
   * console.log(Stream.of(true, false, true)).reduce(Reducer.or))
   * // => true
   * ```
   */
  export const or = createMono(
    () => false,
    (state, next, _, halt): boolean => {
      if (state) return state;
      if (next) halt();
      return next;
    }
  );

  /**
   * Returns a `Reducer` that outputs true if no input values are received, false otherwise.
   * @example
   * ```ts
   * console.log(Stream.of(1, 2, 3).reduce(Reducer.isEmpty))
   * // => false
   * ```
   */
  export const isEmpty = createOutput<never, boolean>(
    () => true,
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
    () => false,
    (_, __, ___, halt): true => {
      halt();
      return true;
    }
  );

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
  export function toArray<T>(
    options: { reversed?: boolean } = {}
  ): Reducer<T, T[]> {
    const { reversed = false } = options;

    return create(
      (): T[] => [],
      (state, next): T[] => {
        if (reversed) state.unshift(next);
        else state.push(next);

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

  export type CombineShape<T = unknown> =
    | Reducer<T, unknown>
    | CombineShape<T>[]
    | { [key: string]: CombineShape<T> };

  export type CombineResult<S extends CombineShape> =
    /* tuple */ S extends readonly CombineShape[]
      ? /* is array? */ 0 extends S['length']
        ? /* no support for arrays */ never
        : /* only tuples */ {
            [K in keyof S]: S[K] extends CombineShape
              ? CombineResult<S[K]>
              : never;
          }
      : /* plain object */ S extends { [key: string]: CombineShape }
      ? { [K in keyof S]: CombineResult<S[K]> }
      : /* simple reducer */ S extends Reducer<unknown, infer R>
      ? R
      : never;

  export class InvalidCombineShapeError extends ErrBase.CustomError {
    constructor() {
      super('Invalid reducer combine shape supplied');
    }
  }

  export class ReducerHaltedError extends ErrBase.CustomError {
    constructor() {
      super('A halted reducer cannot receive more values');
    }
  }

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
  export function combine<T, const S extends Reducer.CombineShape<T>>(
    shape: S & Reducer.CombineShape<T>
  ): Reducer<T, Reducer.CombineResult<S>> {
    if (shape instanceof Reducer.Base) {
      return shape as any;
    }

    if (Array.isArray(shape)) {
      return combineArr(
        ...(shape.map((item) => Reducer.combine(item)) as any)
      ) as any;
    }

    if (typeof shape === 'object' && shape !== null) {
      const result: any = {};

      for (const key in shape) {
        result[key] = Reducer.combine((shape as any)[key]);
      }

      return combineObj(result) as any;
    }

    throw new Reducer.InvalidCombineShapeError();
  }
}
