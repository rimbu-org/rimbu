import { RimbuError } from '@rimbu/base';
import { CollectFun, Eq, ErrBase, OptLazy } from '@rimbu/common';
import { Stream, type FastIterator, type StreamSource } from '@rimbu/stream';
import { createState } from '@rimbu/stream/custom';

/**
 * A `Reducer` is a stand-alone calculation that takes input values of type I, and, when requested, produces an output value of type O.
 * @typeparam I - the input value type
 * @typeparam O - the output value type
 */
export type Reducer<I, O = I> = Reducer.Impl<I, O, unknown>;

function identity<T>(value: T): T {
  return value;
}

const NONE = Symbol('none');

/**
 * Combines multiple reducers in an object's values of the same input type into a single reducer that
 * forwards each incoming value to all reducers, and when output is requested will return an object containing
 * the corresponding output of each reducer at the matching object property.
 */
function combineObj<T, R extends { readonly [key: string]: unknown }>(
  reducerObj: { readonly [K in keyof R]: Reducer<T, R[K]> } & Record<
    string,
    Reducer<T, unknown>
  >
): Reducer<T, R> {
  return Reducer.create(
    (initHalt) => {
      const combinedState = {} as Record<
        string,
        { state: any; index: number; halted: boolean }
      >;

      let haltedBalance = 0;

      for (const key in reducerObj) {
        haltedBalance--;

        const reducer = reducerObj[key];

        const reducerState = createState(
          {
            halted: false,
            index: 0,
          },
          (baseState) => ({
            state: reducer.init(() => {
              baseState.halted = true;
              haltedBalance++;
            }),
          })
        );

        combinedState[key] = reducerState;
      }

      if (haltedBalance === 0) {
        initHalt();
      }

      return combinedState;
    },
    (combinedState, elem, _, halt) => {
      let haltedBalance = 0;

      for (const key in reducerObj) {
        const reducerState = combinedState[key];

        if (reducerState.halted) {
          continue;
        }

        haltedBalance--;

        const reducer = reducerObj[key];

        reducerState.state = reducer.next(
          reducerState.state,
          elem,
          reducerState.index++,
          () => {
            reducerState.halted = true;
            haltedBalance++;
          }
        );
      }

      if (haltedBalance === 0) {
        halt();
      }

      return combinedState;
    },
    (combinedState) => {
      const result: Record<string, any> = {};

      for (const key in reducerObj) {
        const reducer = reducerObj[key];
        const reducerState = combinedState[key];

        result[key] = reducer.stateToResult(
          reducerState.state,
          reducerState.index,
          reducerState.halted
        );
      }

      return result as R;
    },
    {
      cloneState: (state) => {
        const clonedState: Record<string, any> = {};

        for (const key in reducerObj) {
          clonedState[key] = {
            ...state[key],
            state: reducerObj[key].cloneState(state[key].state),
          };
        }

        return clonedState;
      },
    }
  );
}

/**
 * Combines multiple reducers in an array of the same input type into a single reducer that
 * forwards each incoming value to all reducers, and when output is requested will return an array containing
 * the corresponding output of each reducer.
 */
function combineArr<T, R extends readonly [unknown, unknown, ...unknown[]]>(
  ...reducers: { [K in keyof R]: Reducer<T, R[K]> } & Reducer<T, unknown>[]
): Reducer<T, R> {
  return Reducer.create(
    (initHalt) => {
      const combinedStates = [] as Array<{
        state: any;
        index: number;
        halted: boolean;
      }>;

      let remainingCount = reducers.length;

      let reducerIndex = -1;

      while (++reducerIndex < reducers.length) {
        const reducer = reducers[reducerIndex];

        const reducerState = createState(
          {
            halted: false,
            index: 0,
          },
          (baseState) => ({
            state: reducer.init(() => {
              baseState.halted = true;
              remainingCount--;
            }),
          })
        );

        combinedStates.push(reducerState);
      }

      if (remainingCount === 0) {
        initHalt();
      }

      return combinedStates;
    },
    (combinedState, elem, _, halt) => {
      let remainingCount = reducers.length;
      let reducerIndex = -1;

      while (++reducerIndex < reducers.length) {
        const reducerState = combinedState[reducerIndex];

        if (reducerState.halted) {
          remainingCount--;
          continue;
        }

        const reducer = reducers[reducerIndex];

        reducerState.state = reducer.next(
          reducerState.state,
          elem,
          reducerState.index++,
          () => {
            reducerState.halted = true;
            remainingCount--;
          }
        );
      }

      if (remainingCount === 0) {
        halt();
      }

      return combinedState;
    },
    (combinedState) => {
      const result: any[] = [];

      let reducerIndex = -1;

      while (++reducerIndex < reducers.length) {
        const reducer = reducers[reducerIndex];
        const reducerState = combinedState[reducerIndex];

        result.push(
          reducer.stateToResult(
            reducerState.state,
            reducerState.index,
            reducerState.halted
          )
        );
      }

      return result as any as R;
    },
    {
      cloneState: (combinedState) => {
        const clonedState: any[] = [];

        let reducerIndex = -1;

        while (++reducerIndex < reducers.length) {
          clonedState.push({
            ...combinedState[reducerIndex],
            state: reducers[reducerIndex].cloneState(
              combinedState[reducerIndex].state
            ),
          });
        }

        return clonedState;
      },
    }
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
     * @example
     * ```ts
     * Reducer.sum.filterInput(v => v > 10)
     * // this reducer will only sum values larger than 10
     * ```
     */
    filterInput<IF extends I>(
      pred: (value: I, index: number, halt: () => void) => value is IF,
      options?: { negate?: false | undefined }
    ): Reducer<IF, O>;
    filterInput<IF extends I>(
      pred: (value: I, index: number, halt: () => void) => value is IF,
      options: { negate: true }
    ): Reducer<Exclude<I, IF>, O>;
    filterInput(
      pred: (value: I, index: number, halt: () => void) => boolean,
      options?: { negate?: boolean | undefined }
    ): Reducer<I, O>;
    /**
     * Returns a `Reducer` instance that converts its input values using given `mapFun` before passing them to this reducer.
     * @param mapFun - a function that returns a new value to pass to the reducer based on the following inputs:<br/>
     * - value: the current input value<br/>
     * - index: the current input index
     * @typeparam I2 - the resulting reducer input type
     * @example
     * ```ts
     * Reducer.sum.mapInput(v => v * 2)
     * // this reducer will double all input values before summing them
     * ```
     */
    mapInput: <I2>(mapFun: (value: I2, index: number) => I) => Reducer<I2, O>;
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
     * @param collectFun - a function receiving<br/>
     * - `value`: the next value<br/>
     * - `index`: the value index<br/>
     * - `skip`: a token that, when returned, will not add a value to the resulting collection<br/>
     * - `halt`: a function that, when called, ensures no next elements are passed
     * @typeparam I2 - the resulting reducer input type
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
     * @typeparam O2 - the new output type
     * @example
     * ```ts
     * Reducer.sum.mapOutput(String)
     * // this reducer will convert all its results to string before returning them
     * ```
     */
    mapOutput<O2>(
      mapFun: (value: O, index: number, halted: boolean) => O2
    ): Reducer<I, O2>;
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
     * Returns an 'AsyncReducer` instance that produces at most `amount` values.
     * @param amount - the maximum amount of values to produce.
     */
    takeOutput(amount: number): Reducer<I, O>;
    /**
     * Returns a 'Reducer` instance that produces until the given `pred` predicate returns true for
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
      options?: { negate?: boolean }
    ): Reducer<I, O>;
    /**
     * Returns a reducer that applies this reducer and then the `nextReducers` sequentially on halting of each reducer.
     * It provides the last output value of the active reducer.
     * @param nextReducers - an number of reducers consuming and producing the same types as the current reducer.
     * @example
     * ```ts
     * const result = Stream.range({ amount: 6 })
     *  .reduce(
     *    Reducer.sum
     *      .takeInput(3)
     *      .chain(
     *        [v => v > 10 ? Reducer.product : Reducer.sum]
     *      )
     *    )
     * console.log(result)
     * // => 21
     * ```
     */
    chain<O2 extends O>(
      nextReducers: StreamSource<OptLazy<Reducer<I, O2>, [O2]>>
    ): Reducer<I, O2>;
    cloneState: (state: S) => S;
  }

  /**
   * A base class that can be used to easily create `Reducer` instances.
   * @typeparam I - the input value type
   * @typeparam O - the output value type
   * @typeparam S - the internal state type
   */
  export class Base<I, O, S> implements Reducer.Impl<I, O, S> {
    constructor(
      readonly init: (initHalt: () => void) => S,
      readonly next: (state: S, elem: I, index: number, halt: () => void) => S,
      readonly stateToResult: (state: S, index: number, halted: boolean) => O,
      readonly options: Reducer.Options<S> = {}
    ) {}

    get cloneState(): (state: S) => S {
      return this.options?.cloneState ?? identity;
    }

    filterInput(
      pred: (value: I, index: number, halt: () => void) => boolean,
      options: { negate?: boolean | undefined } = {}
    ): any {
      const { negate = false } = options;

      return create<I, O, { state: S; index: number }>(
        (initHalt) => ({
          index: 0,
          state: this.init(initHalt),
        }),
        (combinedState, elem, index, halt) => {
          if (pred(elem, index, halt) !== negate) {
            combinedState.state = this.next(
              combinedState.state,
              elem,
              combinedState.index++,
              halt
            );
          }

          return combinedState;
        },
        (combinedState, _, halted) =>
          this.stateToResult(combinedState.state, combinedState.index, halted),
        {
          ...this.options,
          cloneState: (combinedState) => ({
            ...combinedState,
            state: this.cloneState(combinedState.state),
          }),
        }
      );
    }

    mapInput<I2>(mapFun: (value: I2, index: number) => I): Reducer<I2, O> {
      return create(
        this.init,
        (state, elem, index, halt): S =>
          this.next(state, mapFun(elem, index), index, halt),
        this.stateToResult,
        this.options
      );
    }

    flatMapInput<I2>(
      flatMapFun: (value: I2, index: number) => StreamSource<I>
    ): Reducer<I2, O> {
      return create<I2, O, { state: S; index: number }>(
        (initHalt) => ({
          index: 0,
          state: this.init(initHalt),
        }),
        (combinedState, elem, index, halt) => {
          const elems = flatMapFun(elem, index);

          const iter = Stream.from(elems)[Symbol.iterator]();
          const done = Symbol();
          let value: I | typeof done;
          let halted = false;

          while (!halted && done !== (value = iter.fastNext(done))) {
            combinedState.state = this.next(
              combinedState.state,
              value,
              combinedState.index++,
              () => {
                halted = true;
                halt();
              }
            );
          }

          return combinedState;
        },
        (combinedState, _, halted) =>
          this.stateToResult(combinedState.state, combinedState.index, halted),
        {
          ...this.options,
          cloneState: (combinedState) => {
            const state = this.cloneState(combinedState.state);
            return { ...combinedState, state };
          },
        }
      );
    }

    collectInput<I2>(collectFun: CollectFun<I2, I>): Reducer<I2, O> {
      return create<I2, O, { state: S; index: number }>(
        (initHalt) => ({
          index: 0,
          state: this.init(initHalt),
        }),
        (combinedState, elem, index, halt) => {
          const nextElem = collectFun(elem, index, CollectFun.Skip, halt);

          if (CollectFun.Skip !== nextElem) {
            combinedState.state = this.next(
              combinedState.state,
              nextElem,
              combinedState.index++,
              halt
            );
          }

          return combinedState;
        },
        (combinedState, _, halted) =>
          this.stateToResult(combinedState.state, combinedState.index, halted),
        {
          ...this.options,
          cloneState: (combinedState) => {
            const state = this.cloneState(combinedState.state);
            return { ...combinedState, state };
          },
        }
      );
    }

    mapOutput<O2>(
      mapFun: (value: O, index: number, halted: boolean) => O2
    ): Reducer<I, O2> {
      return create(
        this.init,
        this.next,
        (state, index, halted): O2 =>
          mapFun(this.stateToResult(state, index, halted), index, halted),
        this.options
      );
    }

    takeOutput(amount: number): Reducer<I, O> {
      if (amount <= 0) {
        return create(
          (initHalt) => {
            initHalt();
            return this.init(initHalt);
          },
          this.next,
          this.stateToResult,
          this.options
        );
      }

      return create(
        this.init,
        (state, next, index, halt) => {
          if (index >= amount - 1) {
            halt();
          }
          return this.next(state, next, index, halt);
        },
        this.stateToResult,
        this.options
      );
    }

    takeOutputUntil(
      pred: (value: O, index: number) => boolean,
      options: { negate?: boolean } = {}
    ): Reducer<I, O> {
      const { negate = false } = options;

      return create(
        this.init,
        (state, next, index, halt) => {
          const nextState = this.next(state, next, index, halt);
          const nextOutput = this.stateToResult(nextState, index, false);

          if (pred(nextOutput, index) !== negate) {
            halt();
          }

          return nextState;
        },
        this.stateToResult,
        this.options
      );
    }

    takeInput(amount: number): Reducer<I, O> {
      if (amount <= 0) {
        return create(
          (initHalt) => {
            initHalt();
            return this.init(initHalt);
          },
          identity,
          this.stateToResult,
          this.options
        );
      }

      return this.filterInput((_, i, halt): boolean => {
        if (i >= amount - 1) {
          halt();
        }

        return i < amount;
      });
    }

    dropInput(amount: number): Reducer<I, O> {
      if (amount <= 0) {
        return this as Reducer<I, O>;
      }

      return this.filterInput((_, i): boolean => i >= amount);
    }

    sliceInput(from = 0, amount?: number): Reducer<I, O> {
      if (undefined === amount) return this.dropInput(from);
      if (amount <= 0) return create(this.init, identity, this.stateToResult);
      if (from <= 0) return this.takeInput(amount);

      return this.takeInput(amount).dropInput(from);
    }

    chain<O2 extends O>(
      nextReducers: StreamSource<OptLazy<Reducer<I, O2>, [O2]>>
    ): Reducer<I, O2> {
      return Reducer.create(
        (
          initHalt
        ): {
          activeReducerState: {
            index: number;
            halted: boolean;
            state: any;
          };
          activeReducer: Reducer.Impl<I, O2, any>;
          iterator: FastIterator<OptLazy<Reducer<I, O2>, [O2]>>;
        } => {
          let activeReducer: Reducer.Impl<I, O2, any> = this as any;

          let activeReducerState = createState(
            { index: 0, halted: false },
            (baseState) => ({
              state: activeReducer.init(() => {
                baseState.halted = true;
              }),
            })
          );

          const iterator = Stream.from(nextReducers)[Symbol.iterator]();

          if (activeReducerState.halted) {
            let output = activeReducer.stateToResult(
              activeReducerState.state,
              activeReducerState.index,
              activeReducerState.halted
            );

            do {
              const creator = iterator.fastNext();

              if (undefined === creator) {
                initHalt();

                return {
                  activeReducer,
                  activeReducerState,
                  iterator,
                };
              }
              activeReducer = OptLazy(creator, output as O2);

              activeReducerState = createState(
                {
                  index: 0,
                  halted: false,
                },
                (baseState) => ({
                  state: activeReducer.init(() => {
                    baseState.halted = true;
                  }),
                })
              );
              output = activeReducer.stateToResult(
                activeReducerState.state,
                0,
                false
              );
            } while (activeReducerState.halted);
          }

          return {
            activeReducer,
            activeReducerState,
            iterator,
          };
        },
        (combinedState, input, _, halt) => {
          const { iterator } = combinedState;

          combinedState.activeReducerState.state =
            combinedState.activeReducer.next(
              combinedState.activeReducerState.state,
              input,
              combinedState.activeReducerState.index++,
              () => {
                combinedState.activeReducerState.halted = true;
              }
            );

          while (combinedState.activeReducerState.halted) {
            const output = combinedState.activeReducer.stateToResult(
              combinedState.activeReducerState.state,
              combinedState.activeReducerState.index,
              combinedState.activeReducerState.halted
            );
            const creator = iterator.fastNext();

            if (undefined === creator) {
              halt();

              return combinedState;
            }

            combinedState.activeReducer = OptLazy(creator, output);
            combinedState.activeReducerState = createState(
              {
                index: 0,
                halted: false,
              },
              (baseState) => ({
                state: combinedState.activeReducer.init(() => {
                  baseState.halted = true;
                }),
              })
            );
          }

          return combinedState;
        },
        ({ activeReducer, activeReducerState }) =>
          activeReducer.stateToResult(
            activeReducerState.state,
            activeReducerState.index,
            activeReducerState.halted
          ),
        {
          ...this.options,
          cloneState: () => {
            throw Error('cloneState for operation not yet supported');
          },
        }
      );
    }
  }

  export interface Options<S> {
    cloneState?: ((state: S) => S) | undefined;
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
    init: (initHalt: () => void) => S,
    next: (current: S, next: I, index: number, halt: () => void) => S,
    stateToResult: (state: S, index: number, halted: boolean) => O,
    options?: Reducer.Options<S> | undefined
  ): Reducer<I, O> {
    return new Reducer.Base<I, O, any>(init, next, stateToResult, options);
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
    init: (initHalt: () => void) => T,
    next: (current: T, next: T, index: number, halt: () => void) => T,
    stateToResult?: (state: T, index: number, halted: boolean) => T,
    options?: Reducer.Options<T> | undefined
  ): Reducer<T> {
    return create(init, next, stateToResult ?? identity, options);
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
    init: (initHalt: () => void) => O,
    next: (current: O, next: I, index: number, halt: () => void) => O,
    stateToResult?: (state: O, index: number, halted: boolean) => O,
    options?: Options<O> | undefined
  ): Reducer<I, O> {
    return create(init, next, stateToResult ?? identity, options);
  }

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
  export function fold<T, R>(
    init: OptLazy<R>,
    next: (current: R, value: T, index: number, halt: () => void) => R,
    options?: Reducer.Options<R> | undefined
  ): Reducer<T, R> {
    return Reducer.createOutput(() => OptLazy(init), next, undefined, options);
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
   * @typeparam T - the element type
   * @typeparam O - the fallback value type
   * @example
   * ```ts
   * const stream = Stream.of('abc', 'a', 'abcde', 'ab')
   * console.log(stream.minBy((s1, s2) => s1.length - s2.length))
   * // 'a'
   * ```
   */
  export const minBy: {
    <T>(compFun: (v1: T, v2: T) => number): Reducer<T, T | undefined>;
    <T, O>(
      compFun: (v1: T, v2: T) => number,
      otherwise: OptLazy<O>
    ): Reducer<T, T | O>;
  } = <T, O>(compFun: (v1: T, v2: T) => number, otherwise?: OptLazy<O>) => {
    const token = Symbol();

    return create<T, T | O, T | typeof token>(
      () => token,
      (state, next): T => {
        if (token === state) {
          return next;
        }

        return compFun(state, next) < 0 ? state : next;
      },
      (state): T | O => (token === state ? OptLazy(otherwise!) : state)
    );
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
   * @typeparam T - the element type
   * @typeparam O - the fallback value type
   * @example
   * ```ts
   * const stream = Stream.of('abc', 'a', 'abcde', 'ab')
   * console.log(stream.maxBy((s1, s2) => s1.length - s2.length))
   * // 'abcde'
   * ```
   */
  export const maxBy: {
    <T>(compFun: (v1: T, v2: T) => number): Reducer<T, T | undefined>;
    <T, O>(
      compFun: (v1: T, v2: T) => number,
      otherwise: OptLazy<O>
    ): Reducer<T, T | O>;
  } = <T, O>(
    compFun: (v1: T, v2: T) => number,
    otherwise?: OptLazy<O>
  ): Reducer<T, T | O> => {
    const token = Symbol();

    return create<T, T | O, T | typeof token>(
      () => token,
      (state, next): T => {
        if (token === state) {
          return next;
        }
        return compFun(state, next) > 0 ? state : next;
      },
      (state): T | O => (token === state ? OptLazy(otherwise!) : state)
    );
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
   * @typeparam T - the input element type
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
      () => '',
      (state, next, index) => {
        const valueString = valueToString(next);

        if (index <= 0) {
          return start.concat(valueString);
        }

        return state.concat(sep, valueToString(next));
      },
      (state): string => state.concat(end)
    );
  }

  /**
   * A `Reducer` that remembers the amount of input items provided.
   * @example
   * ```ts
   * const stream = Stream.range({ amount: 10 })
   * console.log(stream.reduce(Reducer.count))
   * // => 10
   * ```
   */
  export const count: Reducer<any, number> = create<any, number, undefined>(
    () => undefined,
    identity,
    (_, index) => index
  );

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
    return create<T, T | O, T | typeof NONE>(
      () => NONE,
      (_, next, __, halt): T => {
        halt();
        return next;
      },
      (state): T | O => (NONE === state ? OptLazy(otherwise!) : state)
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
    return create<T, T | O, T | typeof NONE>(
      () => NONE,
      (_, next): T => next,
      (state): T | O => (NONE === state ? OptLazy(otherwise!) : state)
    );
  };

  /**
   * Returns a Reducer that only produces an output value when having receives exactly one
   * input value, otherwise will return the `otherwise` value or undefined.
   * @param otherwise - the fallback value to return when more or less than one value is received.
   * @typeparam T - the element type
   * @typeparam O - the fallback value type
   */
  export const single: {
    <T>(): Reducer<T, T | undefined>;
    <T, O>(otherwise: OptLazy<O>): Reducer<T, T | O>;
  } = <T, O>(otherwise?: OptLazy<O>): Reducer<T, T | O> => {
    return create<T, T | O, T | undefined>(
      () => undefined,
      (_, next, index, halt): T => {
        if (index > 1) {
          halt();
        }

        return next;
      },
      (state, index): T | O => (index !== 1 ? OptLazy(otherwise!) : state!)
    );
  };

  /**
   * Returns a `Reducer` that ouputs false as long as no input value satisfies given `pred`, true otherwise.
   * @typeparam T - the element type
   * @param pred - a function taking an input value and its index, and returning true if the value satisfies the predicate
   * @param options - (optional) an object containing the following properties:<br/>
   * - negate: (default: false) when true will invert the given predicate
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
    return nonEmpty.filterInput(pred, options);
  }

  /**
   * Returns a `Reducer` that ouputs true as long as all input values satisfy the given `pred`, false otherwise.
   * @typeparam T - the element type
   * @param pred - a function taking an input value and its index, and returning true if the value satisfies the predicate
   * @param options - (optional) an object containing the following properties:<br/>
   * - negate: (default: false) when true will invert the given predicate
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

    return isEmpty.filterInput(pred, { negate: !negate });
  }

  /**
   * Returns a `Reducer` that ouputs true when the received elements match the given `other` stream source according to the `eq` instance, false otherwise.
   * @typeparam T - the element type
   * @param other - a stream source containg elements to match against
   * @param options - (optional) an object containing the following properties:<br/>
   * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
   * - negate: (default: false) when true will invert the given predicate
   */
  export function equals<T>(
    other: StreamSource<T>,
    options: { eq?: Eq<T>; negate?: boolean } = {}
  ): Reducer<T, boolean> {
    const { eq = Eq.objectIs, negate = false } = options;

    const sliceStream = Stream.from(other);
    const done = Symbol();

    return Reducer.create<
      T,
      boolean,
      { iter: FastIterator<T>; nextSeq: T | typeof done; result: boolean }
    >(
      () => {
        const iter = sliceStream[Symbol.iterator]();

        const nextSeq = iter.fastNext(done);

        return { iter, nextSeq, result: false };
      },
      (state, next, _, halt) => {
        if (done === state.nextSeq) {
          halt();
          state.result = false;
          return state;
        }

        if (eq(next, state.nextSeq) === negate) {
          halt();
          state.result = false;
          return state;
        }

        state.nextSeq = state.iter.fastNext(done);

        if (done === state.nextSeq) {
          state.result = true;
        }

        return state;
      },
      (state, _, halted) => !halted && done === state.nextSeq,
      {
        cloneState: () => {
          throw Error('cloneState for operation not yet supported');
        },
      }
    );
  }

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
  export function contains<T, T2 extends T = T>(
    elem: T2,
    options: {
      amount?: number;
      eq?: Eq<T | T2>;
      negate?: boolean;
    } = {}
  ): Reducer<T, boolean> {
    const { amount = 1, eq = Object.is, negate = false } = options;

    return Reducer.create<T, boolean, number>(
      (initHalt) => {
        if (amount <= 0) {
          initHalt();
        }

        return amount;
      },
      (state, next, _, halt): number => {
        const satisfies = eq(next, elem) !== negate;

        if (!satisfies) {
          return state;
        }

        const newRemain = state - 1;

        if (newRemain <= 0) {
          halt();
        }

        return newRemain;
      },
      (state) => state <= 0
    );
  }

  /**
   * Returns a `Reducer` that returns true if the first input values match the given `slice` values repeated `amount` times. Otherwise,
   * returns false.
   * @param slice - a sequence of elements to match against
   * @param options - (optional) an object containing the following properties:<br/>
   * - amount: (detaulf: 1) the amount of elements to find
   * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
   */
  export function startsWithSlice<T>(
    slice: StreamSource<T>,
    options: { eq?: Eq<T> | undefined; amount?: number } = {}
  ): Reducer<T, boolean> {
    const sliceStream = Stream.from(slice);
    const done = Symbol();
    const { eq = Eq.objectIs, amount = 1 } = options;

    return Reducer.create<
      T,
      boolean,
      {
        sliceIter: FastIterator<T>;
        sliceValue: T | typeof done;
        remain: number;
      }
    >(
      (initHalt) => {
        const sliceIter = sliceStream[Symbol.iterator]();
        const sliceValue = sliceIter.fastNext(done);

        if (done === sliceValue || amount <= 0) {
          initHalt();
          return { sliceIter, sliceValue, remain: 0 };
        }

        return {
          sliceIter,
          sliceValue: sliceValue,
          remain: amount,
        };
      },
      (state, next, _, halt) => {
        if (done === state.sliceValue) {
          RimbuError.throwInvalidStateError();
        }

        if (eq(next, state.sliceValue)) {
          state.sliceValue = state.sliceIter.fastNext(done);

          if (done === state.sliceValue) {
            state.remain--;
            if (state.remain <= 0) {
              halt();
            } else {
              state.sliceIter = sliceStream[Symbol.iterator]();
              state.sliceValue = state.sliceIter.fastNext(done);
            }
          }
        } else {
          halt();
        }

        return state;
      },
      (state) => state.remain <= 0,
      {
        cloneState: () => {
          throw Error('cloneState for operation not yet supported');
        },
      }
    );
  }

  /**
   * Returns a `Reducer` that returns true if the last input values match the given `slice` values repeated `amount` times. Otherwise,
   * returns false.
   * @param slice - a sequence of elements to match against
   * @param options - (optional) an object containing the following properties:<br/>
   * - amount: (detaulf: 1) the amount of elements to find
   * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
   */
  export function endsWithSlice<T>(
    slice: StreamSource<T>,
    options: { eq?: Eq<T> | undefined; amount?: number } = {}
  ): Reducer<T, boolean> {
    const sliceStream = Stream.from(slice);
    const done = Symbol();

    const startsWithSliceReducer = Reducer.startsWithSlice(
      slice,
      options
    ) as Reducer.Impl<T, boolean, any>;

    return Reducer.create<
      T,
      boolean,
      Set<{ index: number; halted: boolean; state: any }>
    >(
      (initHalt) => {
        const sliceIter = sliceStream[Symbol.iterator]();
        const sliceValue = sliceIter.fastNext(done);

        if (done === sliceValue) {
          initHalt();
        }

        const startsWithSliceState = createState(
          {
            index: 0,
            halted: false,
          },
          (baseState) => {
            return {
              state: startsWithSliceReducer.init(() => {
                baseState.halted = true;
              }),
            };
          }
        );

        return new Set([startsWithSliceState]);
      },
      (combinedStateSet, nextValue) => {
        for (const startsWithSliceState of combinedStateSet) {
          if (startsWithSliceState.halted) {
            combinedStateSet.delete(startsWithSliceState);
          } else {
            startsWithSliceState.state = startsWithSliceReducer.next(
              startsWithSliceState.state,
              nextValue,
              startsWithSliceState.index++,
              () => {
                startsWithSliceState.halted = true;
              }
            );
          }
        }

        const startsWithSliceState = createState(
          {
            index: 0,
            halted: false,
          },
          (baseState) => ({
            state: startsWithSliceReducer.init(() => {
              baseState.halted = true;
            }),
          })
        );

        startsWithSliceState.state = startsWithSliceReducer.next(
          startsWithSliceState.state,
          nextValue,
          startsWithSliceState.index++,
          () => {
            startsWithSliceState.halted = true;
          }
        );

        combinedStateSet.add(startsWithSliceState);

        return combinedStateSet;
      },
      (combinedState) =>
        combinedState.size === 0 ||
        Stream.from(combinedState).some((startsWithSliceState) =>
          startsWithSliceReducer.stateToResult(
            startsWithSliceState.state,
            startsWithSliceState.index,
            startsWithSliceState.halted
          )
        ),
      {
        cloneState: () => {
          throw Error('cloneState for operation not yet supported');
        },
      }
    );
  }

  /**
   * Returns a `Reducer` that returns true if the input values contain the given `slice` sequence `amount` times. Otherwise,
   * returns false.
   * @param slice - a sequence of elements to match against
   * @param options - (optional) an object containing the following properties:<br/>
   * - amount: (detaulf: 1) the amount of elements to find
   * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
   */
  export function containsSlice<T>(
    slice: StreamSource<T>,
    options: { eq?: Eq<T> | undefined; amount?: number } = {}
  ): Reducer<T, boolean> {
    const { eq, amount = 1 } = options;

    return Reducer.pipe(
      endsWithSlice(slice, { eq }),
      Reducer.contains(true, { amount })
    );
  }

  /**
   * A `Reducer` that takes boolean values and outputs true if all input values are true, and false otherwise.
   * @example
   * ```ts
   * console.log(Stream.of(true, false, true)).reduce(Reducer.and))
   * // => false
   * ```
   */
  export const and = createMono(
    () => true,
    (_, next, __, halt): boolean => {
      if (!next) {
        halt();
      }

      return next;
    }
  );

  /**
   * A `Reducer` that takes boolean values and outputs true if one or more input values are true, and false otherwise.
   * @example
   * ```ts
   * console.log(Stream.of(true, false, true)).reduce(Reducer.or))
   * // => true
   * ```
   */
  export const or = createMono(
    () => false,
    (_, next, __, halt): boolean => {
      if (next) {
        halt();
      }

      return next;
    }
  );

  /**
   * A `Reducer` that outputs true if no input values are received, false otherwise.
   * @example
   * ```ts
   * console.log(Stream.of(1, 2, 3).reduce(Reducer.isEmpty))
   * // => false
   * ```
   */
  export const isEmpty = createOutput<any, boolean>(
    () => true,
    (_, __, ___, halt): false => {
      halt();
      return false;
    }
  );

  /**
   * A `Reducer` that outputs true if one or more input values are received, false otherwise.
   * @example
   * ```ts
   * console.log(Stream.of(1, 2, 3).reduce(Reducer.nonEmpty))
   * // => true
   * ```
   */
  export const nonEmpty = createOutput<any, boolean>(
    () => false,
    (_, __, ___, halt): true => {
      halt();
      return true;
    }
  );

  /**
   * Returns a `Reducer` that always outputs the given `value`, and does not accept input values.
   */
  export function constant<T>(value: OptLazy<T>): Reducer<any, T> {
    return Reducer.create<any, T, void>(
      (initHalt) => {
        initHalt();
      },
      identity,
      () => OptLazy(value)
    );
  }

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
  export const partition: {
    <T, T2 extends T, RT, RF = RT>(
      pred: (value: T, index: number) => value is T2,
      options: {
        collectorTrue: Reducer<T2, RT>;
        collectorFalse: Reducer<Exclude<T, T2>, RF>;
      }
    ): Reducer<T, [true: RT, false: RF]>;
    <T, T2 extends T>(
      pred: (value: T, index: number) => value is T2,
      options?: {
        collectorTrue?: undefined;
        collectorFalse?: undefined;
      }
    ): Reducer<T, [true: T2[], false: Exclude<T, T2>[]]>;
    <T, RT, RF = RT>(
      pred: (value: T, index: number) => boolean,
      options: {
        collectorTrue: Reducer<T, RT>;
        collectorFalse: Reducer<T, RF>;
      }
    ): Reducer<T, [true: RT, false: RF]>;
    <T>(
      pred: (value: T, index: number) => boolean,
      options?: {
        collectorTrue?: undefined;
        collectorFalse?: undefined;
      }
    ): Reducer<T, [true: T[], false: T[]]>;
  } = <T, RT, RF = RT>(
    pred: (value: T, index: number) => boolean,
    options: any = {}
  ): any => {
    const collectorTrue: Reducer<T, RT> =
      options.collectorTrue ?? Reducer.toArray();
    const collectorFalse: Reducer<T, RF> =
      options.collectorFalse ?? Reducer.toArray();

    return Reducer.create<
      T,
      [RT, RF],
      [
        { index: number; halted: boolean; state: any },
        { index: number; halted: boolean; state: any },
      ]
    >(
      (initHalt) => {
        const trueState = createState(
          {
            index: 0,
            halted: false,
          },
          (baseState) => ({
            state: collectorTrue.init(() => {
              baseState.halted = true;
            }),
          })
        );
        const falseState = createState(
          {
            index: 0,
            halted: false,
          },
          (baseState) => ({
            state: collectorFalse.init(() => {
              baseState.halted = true;
            }),
          })
        );

        if (trueState.halted && falseState.halted) {
          initHalt();
        }

        return [trueState, falseState] as const;
      },
      (combinedState, value, index, halt) => {
        const [trueState, falseState] = combinedState;
        const [state, collector, otherState] = pred(value, index)
          ? [trueState, collectorTrue, falseState]
          : [falseState, collectorFalse, trueState];

        if (!state.halted) {
          state.state = collector.next(
            state.state,
            value,
            state.index++,
            () => {
              state.halted = true;
              if (otherState.halted) {
                halt();
              }
            }
          );
        } else if (otherState.halted) {
          halt();
        }

        return combinedState;
      },
      (combinedState) => {
        const [trueState, falseState] = combinedState;
        return [
          collectorTrue.stateToResult(
            trueState.state,
            trueState.index,
            trueState.halted
          ),
          collectorFalse.stateToResult(
            falseState.state,
            falseState.index,
            falseState.halted
          ),
        ] as const;
      },
      {
        cloneState: ([trueCombinedState, falseCombinedState]) => [
          {
            ...trueCombinedState,
            state: collectorTrue.cloneState(trueCombinedState.state),
          },
          {
            ...falseCombinedState,
            state: collectorFalse.cloneState(falseCombinedState.state),
          },
        ],
      }
    );
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
  export const groupBy: {
    <T, K, R, T2 extends readonly [K, T] = [K, T]>(
      valueToKey: (value: T, index: number) => K,
      options: {
        collector: Reducer<[K, T] | T2, R>;
      }
    ): Reducer<T, R>;
    <T, K>(
      valueToKey: (value: T, index: number) => K,
      options?: {
        collector?: undefined;
      }
    ): Reducer<T, Map<K, T[]>>;
  } = <T, K, R>(
    valueToKey: (value: T, index: number) => K,
    options: {
      collector?: Reducer<readonly [K, T], R> | undefined;
    } = {}
  ): Reducer<T, R> => {
    const {
      collector = Reducer.toJSMultiMap() as Reducer<readonly [K, T], R>,
    } = options;

    return Reducer.create(
      collector.init,
      (state, value, index, halt) => {
        const key = valueToKey(value, index);
        return collector.next(state, [key, value], index, halt);
      },
      collector.stateToResult,
      { cloneState: collector.cloneState }
    );
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
  export const race: {
    <T, R, O>(
      reducers: StreamSource<Reducer<T, R>>,
      otherwise: OptLazy<O>
    ): Reducer<T, R | O>;
    <T, R>(reducers: StreamSource<Reducer<T, R>>): Reducer<T, R | undefined>;
  } = <T, R, O>(
    reducers: StreamSource<Reducer.Impl<T, R, any>>,
    otherwise?: OptLazy<O>
  ) => {
    const reducersStream = Stream.from(reducers);

    return Reducer.create<
      T,
      R | O,
      {
        reducerStates: Array<readonly [reducer: Reducer<T, R>, { state: any }]>;
        doneReducerWithState:
          | readonly [reducer: Reducer<T, R>, { state: any }]
          | undefined;
      }
    >(
      (initHalt) => {
        let doneReducerWithState:
          | readonly [Reducer<T, R>, { state: any }]
          | undefined = undefined;

        const reducerStates = reducersStream
          .collect((reducer, _, __, halt) => {
            let halted = false;

            const state = reducer.init(() => {
              halted = true;
              halt();
              initHalt();
            });

            const result = [reducer, { state }] as const;

            if (halted) {
              doneReducerWithState = result;
            }

            return result;
          })
          .toArray();

        return { reducerStates, doneReducerWithState };
      },
      (combinedState, next, index, halt) => {
        for (const [reducer, reducerState] of combinedState.reducerStates) {
          reducerState.state = reducer.next(
            reducerState.state,
            next,
            index,
            () => {
              combinedState.doneReducerWithState = [reducer, reducerState];
              halt();
            }
          );

          if (combinedState.doneReducerWithState) {
            break;
          }
        }

        return combinedState;
      },
      (combinedState, index, halted) => {
        if (undefined === combinedState.doneReducerWithState) {
          return OptLazy(otherwise)!;
        }

        const [reducer, reducerState] = combinedState.doneReducerWithState;

        return reducer.stateToResult(reducerState.state, index, halted);
      },
      {
        cloneState: (combinedState) => {
          const { doneReducerWithState } = combinedState;
          let clonedDoneReducerWithState: typeof doneReducerWithState =
            undefined;

          if (undefined !== doneReducerWithState) {
            const [reducer, reducerState] = doneReducerWithState;

            clonedDoneReducerWithState = [
              reducer,
              { state: reducer.cloneState(reducerState.state) },
            ];
          }
          return {
            reducerStates: combinedState.reducerStates.map(
              ([reducer, { state }]) => [
                reducer,
                { state: reducer.cloneState(state) },
              ]
            ),
            doneReducerWithState: clonedDoneReducerWithState,
          };
        },
      }
    );
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
      (state): T[] => state.slice(),
      {
        cloneState: (state) => state.slice(),
      }
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
  export function toJSMap<K, V>(): Reducer<readonly [K, V], Map<K, V>> {
    return create(
      (): Map<K, V> => new Map(),
      (state, next): Map<K, V> => {
        state.set(next[0], next[1]);
        return state;
      },
      (state): Map<K, V> => new Map(state),
      {
        cloneState: (state) => new Map(state),
      }
    );
  }

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
  export function toJSMultiMap<K, V>(): Reducer<readonly [K, V], Map<K, V[]>> {
    return create(
      (): Map<K, V[]> => new Map(),
      (state, [key, value]) => {
        const entry = state.get(key);
        if (undefined === entry) {
          state.set(key, [value]);
        } else {
          entry.push(value);
        }
        return state;
      },
      (state) => new Map(state),
      {
        cloneState: (state) => new Map(state),
      }
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
      (s): Set<T> => new Set(s),
      {
        cloneState: (state) => new Set(state),
      }
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
    readonly [K, V],
    Record<K, V>
  > {
    return create(
      () => ({}) as Record<K, V>,
      (state, entry) => {
        state[entry[0]] = entry[1];
        return state;
      },
      (state) => ({ ...state }),
      {
        cloneState: (state) => ({ ...state }),
      }
    );
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
  export const pipe: {
    <I, O1, O2>(
      reducer1: Reducer<I, O1>,
      reducer2: Reducer<O1, O2>
    ): Reducer<I, O2>;
    <I, O1, O2, O3>(
      reducer1: Reducer<I, O1>,
      reducer2: Reducer<O1, O2>,
      reducer3: Reducer<O2, O3>
    ): Reducer<I, O3>;
    <I, O1, O2, O3, O4>(
      reducer1: Reducer<I, O1>,
      reducer2: Reducer<O1, O2>,
      reducer3: Reducer<O2, O3>,
      reducer4: Reducer<O2, O4>
    ): Reducer<I, O4>;
    <I, O1, O2, O3, O4, O5>(
      reducer1: Reducer<I, O1>,
      reducer2: Reducer<O1, O2>,
      reducer3: Reducer<O2, O3>,
      reducer4: Reducer<O2, O4>,
      reducer5: Reducer<O2, O5>
    ): Reducer<I, O5>;
  } = (...nextReducers: Reducer<any, any>[]): any => {
    if (nextReducers.length < 2) {
      RimbuError.throwInvalidUsageError(
        'Reducer.pipe should have at least two arguments'
      );
    }

    const [current, next, ...others] = nextReducers as Reducer<any, any>[];

    if (others.length > 0) {
      return Reducer.pipe(current, (Reducer.pipe as any)(next, ...others));
    }

    return Reducer.create(
      (initHalt) => ({
        currentState: {
          halted: false,
          state: current.init(initHalt),
        },
        nextState: {
          index: 0,
          halted: false,
          state: next.init(initHalt),
        },
      }),
      (combinedState, item, index, halt) => {
        const { currentState, nextState } = combinedState;

        currentState.state = current.next(
          currentState.state,
          item,
          index,
          () => {
            currentState.halted = true;
            halt();
          }
        );
        nextState.state = next.next(
          nextState.state,
          current.stateToResult(currentState.state, index, currentState.halted),
          nextState.index++,
          () => {
            nextState.halted = true;
            halt();
          }
        );

        return combinedState;
      },
      (combinedState, index, halted) => {
        if (halted && index === 0) {
          combinedState.nextState.state = next.next(
            combinedState.nextState.state,
            current.stateToResult(
              combinedState.currentState.state,
              index,
              combinedState.currentState.halted
            ),
            combinedState.nextState.index,
            () => {
              combinedState.nextState.halted = true;
            }
          );
        }

        return next.stateToResult(
          combinedState.nextState.state,
          combinedState.nextState.index,
          combinedState.nextState.halted
        );
      },
      {
        cloneState: (combinedState) => ({
          currentState: {
            ...combinedState.currentState,
            state: current.cloneState(combinedState.currentState.state),
          },
          nextState: {
            ...combinedState.nextState,
            state: next.cloneState(combinedState.nextState.state),
          },
        }),
      }
    );
  };
}
