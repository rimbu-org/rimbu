import { RimbuError } from '@rimbu/base';
import {
  AsyncOptLazy,
  CollectFun,
  Eq,
  ErrBase,
  type AsyncCollectFun,
  type MaybePromise,
} from '@rimbu/common';
import {
  AsyncStream,
  Reducer,
  Stream,
  type AsyncFastIterator,
  type AsyncStreamSource,
} from '@rimbu/stream';
import {
  AsyncStreamConstructorsImpl,
  fromAsyncStreamSource,
} from '@rimbu/stream/async-custom';
import { createAsyncState } from '@rimbu/stream/custom';

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

const NONE = Symbol('none');

/**
 * Combines multiple (asynchronous) reducers in an array of the same input type into a single reducer that
 * forwards each incoming value to all reducers, and when output is requested will return an array containing
 * the corresponding output of each reducer.
 */
function combineArr<T, R extends readonly [unknown, unknown, ...unknown[]]>(
  ...reducers: { [K in keyof R]: AsyncReducer.Accept<T, R[K]> } & AsyncReducer<
    T,
    unknown
  >[]
): AsyncReducer<T, R> {
  return AsyncReducer.create<
    T,
    any,
    Array<{ state: any; index: number; halted: boolean }>
  >(
    async (initHalt) => {
      const combinedStates = [] as Array<{
        state: any;
        index: number;
        halted: boolean;
      }>;

      let remainingCount = reducers.length;

      let reducerIndex = -1;

      while (++reducerIndex < reducers.length) {
        const reducer = reducers[reducerIndex];

        const reducerState = await createAsyncState(
          { halted: false, index: 0 },
          async (baseState) => ({
            state: await reducer.init(() => {
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
    async (combinedState, elem, _, halt) => {
      let remainingCount = reducers.length;
      let reducerIndex = -1;

      while (++reducerIndex < reducers.length) {
        const reducerState = combinedState[reducerIndex];

        if (reducerState.halted) {
          remainingCount--;
          continue;
        }

        const reducer = reducers[reducerIndex];

        reducerState.state = await reducer.next(
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
    (combinedState) =>
      Promise.all(
        Stream.from(combinedState).map((reducerState, index) =>
          reducers[index].stateToResult(
            reducerState.state,
            reducerState.index,
            reducerState.halted
          )
        )
      ),
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
      onClose: async (state, err) => {
        await Promise.all(
          reducers.map((reducer) => {
            if ('onClose' in reducer) {
              return reducer.onClose?.(state, err);
            }
          })
        );
      },
    }
  );
}

/**
 * Combines multiple (asynchronous) reducers in an object's values of the same input type into a single reducer that
 * forwards each incoming value to all reducers, and when output is requested will return an object containing
 * the corresponding output of each reducer at the matching object property.
 */
function combineObj<T, R extends { readonly [key: string]: unknown }>(
  reducerObj: {
    readonly [K in keyof R]: AsyncReducer.Accept<T, R[K]>;
  } & Record<string, AsyncReducer.Accept<T, unknown>>
): AsyncReducer<T, R> {
  return AsyncReducer.create<
    T,
    R,
    Record<string, { state: any; index: number; halted: boolean }>
  >(
    async (initHalt) => {
      const combinedState = {} as Record<
        string,
        { state: any; index: number; halted: boolean }
      >;

      let haltedBalance = 0;

      await Promise.all(
        Stream.fromObject(
          reducerObj as Record<string, AsyncReducer.Accept<T, unknown>>
        ).mapPure(async ([key, reducer]) => {
          haltedBalance--;

          const reducerState = await createAsyncState(
            { halted: false, index: 0 },
            async (baseState) => ({
              state: await reducer.init(() => {
                baseState.halted = true;
                haltedBalance++;
              }),
            })
          );

          combinedState[key] = reducerState;
        })
      );

      if (haltedBalance === 0) {
        initHalt();
      }

      return combinedState;
    },
    async (combinedState, elem, _, halt) => {
      let haltedBalance = 0;

      await Promise.all(
        Stream.fromObject(combinedState).mapPure(
          async ([key, reducerState]) => {
            if (reducerState.halted) {
              return;
            }

            haltedBalance--;

            const reducer = reducerObj[key];

            reducerState.state = await reducer.next(
              reducerState.state,
              elem,
              reducerState.index++,
              () => {
                reducerState.halted = true;
                haltedBalance++;
              }
            );
          }
        )
      );

      if (haltedBalance === 0) {
        halt();
      }

      return combinedState;
    },
    async (combinedState) => {
      const result: R = {} as any;

      await Promise.all(
        Stream.fromObject(combinedState).mapPure(
          async ([key, reducerState]) => {
            const reducer = reducerObj[key];
            (result as any)[key] = await reducer.stateToResult(
              reducerState.state,
              reducerState.index,
              reducerState.halted
            );
          }
        )
      );

      return result;
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
      onClose: async (state, err) => {
        await Promise.all(
          Stream.fromObjectValues(reducerObj).mapPure((reducer) => {
            if ('onClose' in reducer) {
              reducer.onClose?.(state, err);
            }
          })
        );
      },
    }
  );
}

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
    cloneState: (state: S) => S;
  }

  /**
   * A base class that can be used to easily create `AsyncReducer` instances.
   * @typeparam I - the input value type
   * @typeparam O - the output value type
   * @typeparam S - the internal state type
   */
  export class Base<I, O, S> implements AsyncReducer.Impl<I, O, S> {
    constructor(
      readonly init: (initHalt: () => void) => MaybePromise<S>,
      readonly next: (
        state: S,
        elem: I,
        index: number,
        halt: () => void
      ) => MaybePromise<S>,
      readonly stateToResult: (
        state: S,
        index: number,
        halted: boolean
      ) => MaybePromise<O>,
      readonly options?: AsyncReducer.Options<S> | undefined
    ) {}

    get onClose():
      | ((state: S, error?: unknown) => MaybePromise<void>)
      | undefined {
      return this.options?.onClose;
    }

    get cloneState(): (state: S) => S {
      return this.options?.cloneState ?? identity;
    }

    filterInput(
      pred: (
        value: I,
        index: number,
        halt: () => void
      ) => MaybePromise<boolean>,
      options: { negate?: boolean | undefined } = {}
    ): any {
      const { negate = false } = options;

      return create<I, any>(
        async (initHalt) => ({ index: 0, state: await this.init(initHalt) }),
        async (combinedState, elem, index, halt) => {
          if ((await pred(elem, index, halt)) !== negate) {
            combinedState.state = await this.next(
              combinedState.state,
              elem,
              combinedState.index++,
              halt
            );
          }

          return combinedState;
        },
        async (combinedState) =>
          await this.stateToResult(
            combinedState.state,
            combinedState.index,
            combinedState.halted
          ),
        {
          ...this.options,
          cloneState: (combinedState) => ({
            ...combinedState,
            state: this.cloneState(combinedState.state),
          }),
          onClose: async (combinedState, err) => {
            await this.options?.onClose?.(combinedState.state, err);
          },
        }
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
        this.options
      );
    }

    flatMapInput<I2>(
      flatMapFun: (
        value: I2,
        index: number
      ) => MaybePromise<AsyncStreamSource<I>>
    ): AsyncReducer<I2, O> {
      return create<I2, O, { state: S; index: number }>(
        async (initHalt) => ({
          index: 0,
          state: await this.init(initHalt),
        }),
        async (combinedState, elem, index, halt) => {
          const elems = await flatMapFun(elem, index);

          const iter = AsyncStream.from(elems)[Symbol.asyncIterator]();
          const done = Symbol();
          let value: I | typeof done;
          let halted = false;

          while (!halted && done !== (value = await iter.fastNext(done))) {
            combinedState.state = await this.next(
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
          onClose: (combinedState, err) =>
            this.options?.onClose?.(combinedState.state, err),
        }
      );
    }

    collectInput<I2>(collectFun: AsyncCollectFun<I2, I>): AsyncReducer<I2, O> {
      return create<I2, O, { state: S; index: number }>(
        async (initHalt) => ({
          index: 0,
          state: await this.init(initHalt),
        }),
        async (combinedState, elem, index, halt) => {
          const nextElem = await collectFun(elem, index, CollectFun.Skip, halt);

          if (CollectFun.Skip !== nextElem) {
            combinedState.state = await this.next(
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
          onClose: (combinedState, err) =>
            this.options?.onClose?.(combinedState.state, err),
        }
      );
    }

    mapOutput<O2>(
      mapFun: (value: O, index: number, halted: boolean) => MaybePromise<O2>
    ): AsyncReducer<I, O2> {
      return create(
        this.init,
        this.next,
        async (state, index, halted): Promise<O2> =>
          mapFun(await this.stateToResult(state, index, halted), index, halted),
        this.options
      );
    }

    takeOutput(amount: number): AsyncReducer<I, O> {
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
      pred: (value: O, index: number) => MaybePromise<boolean>,
      options: { negate?: boolean } = {}
    ): AsyncReducer<I, O> {
      const { negate = false } = options;

      return create(
        this.init,
        async (state, next, index, halt) => {
          const nextState = await this.next(state, next, index, halt);

          const nextOutput = await this.stateToResult(nextState, index, false);

          if ((await pred(nextOutput, index)) !== negate) {
            halt();
          }

          return nextState;
        },
        this.stateToResult,
        this.options
      );
    }

    takeInput(amount: number): AsyncReducer<I, O> {
      if (amount <= 0) {
        return create(this.init, identity, this.stateToResult, this.options);
      }

      return this.filterInput((_, i, halt): boolean => {
        if (i >= amount - 1) {
          halt();
        }

        return i < amount;
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

    chain<O2 extends O>(
      nextReducers: AsyncStreamSource<
        AsyncOptLazy<AsyncReducer.Accept<I, O2>, [O2]>
      >
    ): AsyncReducer<I, O2> {
      return AsyncReducer.create(
        async (
          initHalt
        ): Promise<{
          activeReducerState: {
            index: number;
            halted: boolean;
            state: any;
          };
          activeReducer: AsyncReducer.Accept<I, O2>;
          iterator: AsyncFastIterator<
            AsyncOptLazy<AsyncReducer.Accept<I, O2>, [O2]>
          >;
        }> => {
          let activeReducer: AsyncReducer.Accept<I, O2> = this as any;

          let activeReducerState = await createAsyncState(
            {
              index: 0,
              halted: false,
            },
            async (baseState) => ({
              state: await activeReducer.init(() => {
                baseState.halted = true;
              }),
            })
          );

          const iterator =
            fromAsyncStreamSource(nextReducers)[Symbol.asyncIterator]();

          if (activeReducerState.halted) {
            let output = await activeReducer.stateToResult(
              activeReducerState.state,
              activeReducerState.index,
              activeReducerState.halted
            );

            do {
              const creator = await iterator.fastNext();

              if (undefined === creator) {
                initHalt();

                return {
                  activeReducer,
                  activeReducerState,
                  iterator,
                };
              }
              activeReducer = await AsyncOptLazy.toMaybePromise(
                creator,
                output as O2
              );

              activeReducerState = await createAsyncState(
                {
                  index: 0,
                  halted: false,
                },
                async (baseState) => ({
                  state: await activeReducer.init(() => {
                    baseState.halted = true;
                  }),
                })
              );
              output = await activeReducer.stateToResult(
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
        async (combinedState, input, _, halt) => {
          const { iterator } = combinedState;

          combinedState.activeReducerState.state =
            await combinedState.activeReducer.next(
              combinedState.activeReducerState.state,
              input,
              combinedState.activeReducerState.index++,
              () => {
                combinedState.activeReducerState.halted = true;
              }
            );

          while (combinedState.activeReducerState.halted) {
            const output = await combinedState.activeReducer.stateToResult(
              combinedState.activeReducerState.state,
              combinedState.activeReducerState.index,
              combinedState.activeReducerState.halted
            );
            const creator = await iterator.fastNext();

            if (undefined === creator) {
              halt();

              return combinedState;
            }

            combinedState.activeReducer = await AsyncOptLazy.toMaybePromise(
              creator,
              output
            );
            combinedState.activeReducerState = await createAsyncState(
              {
                index: 0,
                halted: false,
              },
              async (baseState) => ({
                state: await combinedState.activeReducer.init(() => {
                  baseState.halted = true;
                }),
              })
            );
          }

          return combinedState;
        },
        async ({ activeReducer, activeReducerState }) =>
          await activeReducer.stateToResult(
            activeReducerState.state,
            activeReducerState.index,
            activeReducerState.halted
          ),
        {
          ...this.options,
          onClose: async (combinedState, err) => {
            if ('onClose' in combinedState.activeReducer) {
              await combinedState.activeReducer.onClose?.(
                combinedState.activeReducerState.state,
                err
              );
            }
          },
          cloneState: () => {
            throw Error('cloneState for operation not yet supported');
          },
        }
      );
    }
  }

  export interface Options<S> {
    onClose?: ((state: S, error?: unknown) => MaybePromise<void>) | undefined;
    cloneState?: ((state: S) => S) | undefined;
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
    init: (initHalt: () => void) => MaybePromise<S>,
    next: (
      current: S,
      next: I,
      index: number,
      halt: () => void
    ) => MaybePromise<S>,
    stateToResult: (
      state: S,
      index: number,
      halted: boolean
    ) => MaybePromise<O>,
    options?: Options<S>
  ): AsyncReducer<I, O> {
    return new AsyncReducer.Base(
      init,
      next,
      stateToResult,
      options
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
   * @typeparam T - the overall value type
   */
  export function createMono<T>(
    init: (initHalt: () => void) => MaybePromise<T>,
    next: (
      current: T,
      next: T,
      index: number,
      halt: () => void
    ) => MaybePromise<T>,
    stateToResult?: (
      state: T,
      index: number,
      halted: boolean
    ) => MaybePromise<T>,
    options?: Options<T>
  ): AsyncReducer<T> {
    return create(init, next, stateToResult ?? identity, options);
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
   */
  export function createOutput<I, O = I>(
    init: (initHalt: () => void) => MaybePromise<O>,
    next: (
      current: O,
      next: I,
      index: number,
      halt: () => void
    ) => MaybePromise<O>,
    stateToResult?: (
      state: O,
      index: number,
      halted: boolean
    ) => MaybePromise<O>,
    options?: Options<O>
  ): AsyncReducer<I, O> {
    return create(init, next, stateToResult ?? identity, options);
  }

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
  export function fold<T, R>(
    init: AsyncOptLazy<R>,
    next: (
      current: R,
      value: T,
      index: number,
      halt: () => void
    ) => MaybePromise<R>,
    options?: Options<R>
  ): AsyncReducer<T, R> {
    return AsyncReducer.createOutput(
      () => AsyncOptLazy.toMaybePromise(init),
      next,
      undefined,
      options
    );
  }

  /**
   * Returns an `AsyncReducer` from a given `Reducer` or `AsyncReducer` instance.
   * @param reducer - the input reducer to convert
   * @typeparam I - the input element type
   * @typeparam O - the output element type
   */
  export function from<I, O>(
    reducer: AsyncReducer.Accept<I, O>
  ): AsyncReducer<I, O> {
    if (reducer instanceof AsyncReducer.Base) {
      return reducer;
    }

    return AsyncReducer.create(
      reducer.init,
      reducer.next,
      reducer.stateToResult as any
    );
  }

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
    <T>(
      compFun: (v1: T, v2: T) => MaybePromise<number>
    ): AsyncReducer<T, T | undefined>;
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
      () => token,
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
   * @typeparam O - the fallback value type
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
      () => undefined,
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
    <T>(
      compFun: (v1: T, v2: T) => MaybePromise<number>
    ): AsyncReducer<T, T | undefined>;
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
      () => token,
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
   * @typeparam O - the fallback value type
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
      () => undefined,
      (state, next): number =>
        undefined !== state && state > next ? state : next,
      (state): MaybePromise<number | O> =>
        state ?? AsyncOptLazy.toMaybePromise(otherwise!)
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
    return create<T, T | O, T | typeof NONE>(
      () => NONE,
      (_, next, __, halt): T => {
        halt();
        return next;
      },
      (state): MaybePromise<T | O> =>
        NONE === state ? AsyncOptLazy.toMaybePromise(otherwise!) : state
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
    return create<T, T | O, T | typeof NONE>(
      () => NONE,
      (_, next): T => next,
      (state): MaybePromise<T | O> =>
        NONE === state ? AsyncOptLazy.toMaybePromise(otherwise!) : state
    );
  };

  /**
   * Returns an AsyncReducer that only produces an output value when having receives exactly one
   * input value, otherwise will return the `otherwise` value or undefined.
   * @param otherwise - the fallback value to return when more or less than one value is received.
   * @typeparam T - the element type
   * @typeparam O - the fallback value type
   */
  export const single: {
    <T>(): AsyncReducer<T, T | undefined>;
    <T, O>(otherwise: AsyncOptLazy<O>): AsyncReducer<T, T | O>;
  } = <T, O>(otherwise?: AsyncOptLazy<O>): AsyncReducer<T, T | O> => {
    return create<T, T | O, T | undefined>(
      () => undefined,
      (state, next, index, halt): T => {
        if (index > 1) {
          halt();
        }
        return next;
      },
      (state, index): MaybePromise<T | O> =>
        index !== 1 ? AsyncOptLazy.toMaybePromise(otherwise!) : state!
    );
  };

  /**
   * Returns an `AsyncReducer` that ouputs false as long as no input value satisfies given `pred`, true otherwise.
   * @typeparam T - the element type
   * @param pred - a potentiall async function taking an input value and its index, and returning true if the value satisfies the predicate
   * @param options - (optional) an object containing the following properties:<br/>
   * - negate: (default: false) when true will invert the given predicate
   */
  export function some<T>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: { negate?: boolean | undefined } = {}
  ): AsyncReducer<T, boolean> {
    return nonEmpty.filterInput(pred, options);
  }

  /**
   * Returns an `AsyncReducer` that ouputs true as long as all input values satisfy the given `pred`, false otherwise.
   * @typeparam T - the element type
   * @param pred - a potentially async function taking an input value and its index, and returning true if the value satisfies the predicate
   * @param options - (optional) an object containing the following properties:<br/>
   * - negate: (default: false) when true will invert the given predicate
   */
  export function every<T>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: { negate?: boolean | undefined } = {}
  ): AsyncReducer<T, boolean> {
    const { negate = false } = options;

    return isEmpty.filterInput(pred, { negate: !negate });
  }

  /**
   * Returns an `AsyncReducer` that ouputs true when the received elements match the given `other` async stream source according to the `eq` instance, false otherwise.
   * @typeparam T - the element type
   * @param other - an async stream source containg elements to match against
   * @param options - (optional) an object containing the following properties:<br/>
   * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
   * - negate: (default: false) when true will invert the given predicate
   */
  export function equals<T>(
    other: AsyncStreamSource<T>,
    options: { eq?: Eq<T> | undefined; negate?: boolean | undefined } = {}
  ): AsyncReducer<T, boolean> {
    const { eq = Eq.objectIs, negate = false } = options;

    const sliceStream = fromAsyncStreamSource(other);
    const done = Symbol();

    return AsyncReducer.create<
      T,
      boolean,
      { iter: AsyncFastIterator<T>; nextSeq: T | typeof done; result: boolean }
    >(
      async () => {
        const iter = sliceStream[Symbol.asyncIterator]();

        const nextSeq = await iter.fastNext(done);

        return { iter, nextSeq, result: false };
      },
      async (state, next, _, halt) => {
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

        state.nextSeq = await state.iter.fastNext(done);

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
   * An `AsyncReducer` that outputs true if no input values are received, false otherwise.
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.isEmpty))
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
   * An `AsyncReducer` that outputs true if one or more input values are received, false otherwise.
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.nonEmpty))
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
   * Returns a `AsyncReducer` that returns true if the first input values match the given `slice` values repeated `amount` times. Otherwise,
   * returns false.
   * @param slice - a async sequence of elements to match against
   * @param options - (optional) an object containing the following properties:<br/>
   * - amount: (detaulf: 1) the amount of elements to find
   * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
   */
  export function startsWithSlice<T>(
    slice: AsyncStreamSource<T>,
    options: { eq?: Eq<T> | undefined; amount?: number } = {}
  ): AsyncReducer<T, boolean> {
    const sliceStream = fromAsyncStreamSource(slice);
    const done = Symbol();
    const { eq = Eq.objectIs, amount = 1 } = options;

    return AsyncReducer.create<
      T,
      boolean,
      {
        sliceIter: AsyncFastIterator<T>;
        sliceValue: T | typeof done;
        remain: number;
      }
    >(
      async (initHalt) => {
        const sliceIter = sliceStream[Symbol.asyncIterator]();
        const sliceValue = await sliceIter.fastNext(done);

        if (done === sliceValue || amount <= 0) {
          initHalt();
          return { sliceIter, sliceValue, remain: 0 };
        }

        return {
          sliceIter,
          sliceValue,
          remain: amount,
        };
      },
      async (state, next, _, halt) => {
        if (done === state.sliceValue) {
          RimbuError.throwInvalidStateError();
        }

        if (eq(next, state.sliceValue)) {
          state.sliceValue = await state.sliceIter.fastNext(done);

          if (done === state.sliceValue) {
            state.remain--;
            if (state.remain <= 0) {
              halt();
            } else {
              state.sliceIter = sliceStream[Symbol.asyncIterator]();
              state.sliceValue = await state.sliceIter.fastNext(done);
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
   * Returns an `AsyncReducer` that returns true if the last input values match the given `slice` values repeated `amount` times. Otherwise,
   * returns false.
   * @param slice - a async sequence of elements to match against
   * @param options - (optional) an object containing the following properties:<br/>
   * - amount: (detaulf: 1) the amount of elements to find
   * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
   */
  export function endsWithSlice<T>(
    slice: AsyncStreamSource<T>,
    options: { eq?: Eq<T> | undefined; amount?: number } = {}
  ): AsyncReducer<T, boolean> {
    const sliceStream = AsyncStreamConstructorsImpl.from(slice);
    const done = Symbol();

    const startsWithSliceReducer = AsyncReducer.startsWithSlice(slice, options);

    return AsyncReducer.create(
      async (initHalt) => {
        const sliceIter = sliceStream[Symbol.asyncIterator]();
        const sliceValue = await sliceIter.fastNext(done);

        if (done === sliceValue) {
          initHalt();
        }

        const startsWithSliceState = await createAsyncState(
          {
            index: 0,
            halted: false,
          },
          async (baseState) => {
            return {
              state: await startsWithSliceReducer.init(() => {
                baseState.halted = true;
              }),
            };
          }
        );

        return new Set([startsWithSliceState]);
      },
      async (combinedStateSet, nextValue) => {
        await Promise.all(
          Stream.from(combinedStateSet).mapPure(
            async (startsWithSliceState) => {
              if (startsWithSliceState.halted) {
                combinedStateSet.delete(startsWithSliceState);
              } else {
                startsWithSliceState.state = await startsWithSliceReducer.next(
                  startsWithSliceState.state,
                  nextValue,
                  startsWithSliceState.index++,
                  () => {
                    startsWithSliceState.halted = true;
                  }
                );
              }
            }
          )
        );

        const startsWithSliceState = await createAsyncState(
          {
            index: 0,
            halted: false,
          },
          async (baseState) => ({
            state: await startsWithSliceReducer.init(() => {
              baseState.halted = true;
            }),
          })
        );

        startsWithSliceState.state = await startsWithSliceReducer.next(
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
      async (combinedState) =>
        combinedState.size === 0 ||
        (await AsyncStream.from(combinedState).some(
          async (startsWithSliceState) =>
            await startsWithSliceReducer.stateToResult(
              startsWithSliceState.state,
              startsWithSliceState.index,
              startsWithSliceState.halted
            )
        )),
      {
        cloneState: () => {
          throw Error('cloneState for operation not yet supported');
        },
      }
    );
  }

  /**
   * Returns an `AsyncReducer` that returns true if the input values contain the given `slice` sequence `amount` times. Otherwise,
   * returns false.
   * @param slice - a async sequence of elements to match against
   * @param options - (optional) an object containing the following properties:<br/>
   * - amount: (detaulf: 1) the amount of elements to find
   * - eq: (default: Eq.objectIs) the `Eq` instance to use to compare elements
   */
  export function containsSlice<T>(
    slice: AsyncStreamSource<T>,
    options: { eq?: Eq<T> | undefined; amount?: number | undefined } = {}
  ): AsyncReducer<T, boolean> {
    const { eq, amount = 1 } = options;

    return AsyncReducer.pipe(
      endsWithSlice(slice, { eq }),
      Reducer.contains(true, { amount })
    );
  }

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
  export const partition: {
    <T, T2 extends T, RT, RF = RT>(
      pred: (value: T, index: number) => value is T2,
      options: {
        collectorTrue: AsyncReducer.Accept<T2, RT>;
        collectorFalse: AsyncReducer.Accept<Exclude<T, T2>, RF>;
      }
    ): AsyncReducer<T, [true: RT, false: RF]>;
    <T, T2 extends T>(
      pred: (value: T, index: number) => value is T2,
      options?: {
        collectorTrue?: undefined;
        collectorFalse?: undefined;
      }
    ): AsyncReducer<T, [true: T2[], false: Exclude<T, T2>[]]>;
    <T, RT, RF = RT>(
      pred: (value: T, index: number) => MaybePromise<boolean>,
      options: {
        collectorTrue: AsyncReducer.Accept<T, RT>;
        collectorFalse: AsyncReducer.Accept<T, RF>;
      }
    ): AsyncReducer<T, [true: RT, false: RF]>;
    <T>(
      pred: (value: T, index: number) => MaybePromise<boolean>,
      options?: {
        collectorTrue?: undefined;
        collectorFalse?: undefined;
      }
    ): AsyncReducer<T, [true: T[], false: T[]]>;
  } = <T, RT, RF = RT>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: {
      collectorTrue?: any;
      collectorFalse?: any;
    } = {}
  ): AsyncReducer<T, [true: RT, false: RF]> => {
    const {
      collectorTrue = Reducer.toArray() as AsyncReducer.Accept<T, RT>,
      collectorFalse = Reducer.toArray() as AsyncReducer.Accept<T, RF>,
    } = options;

    return AsyncReducer.create<
      T,
      [RT, RF],
      [
        { index: number; halted: boolean; state: any },
        { index: number; halted: boolean; state: any },
      ]
    >(
      async (initHalt) => {
        const trueState = await createAsyncState(
          {
            index: 0,
            halted: false,
          },
          async (baseState) => ({
            state: await collectorTrue.init(() => {
              baseState.halted = true;
            }),
          })
        );
        const falseState = await createAsyncState(
          {
            index: 0,
            halted: false,
          },
          async (baseState) => ({
            state: await collectorFalse.init(() => {
              baseState.halted = true;
            }),
          })
        );

        if (trueState.halted && falseState.halted) {
          initHalt();
        }

        return [trueState, falseState] as const;
      },
      async (combinedState, value, index, halt) => {
        const [trueState, falseState] = combinedState;
        const [state, collector, otherState] = (await pred(value, index))
          ? [trueState, collectorTrue, falseState]
          : [falseState, collectorFalse, trueState];

        if (!state.halted) {
          state.state = await collector.next(
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

        return Promise.all([
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
        ]) as Promise<[RT, RF]>;
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
  export const groupBy: {
    <T, K, R, T2 extends readonly [K, T] = [K, T]>(
      valueToKey: (value: T, index: number) => MaybePromise<K>,
      options: {
        collector: AsyncReducer.Accept<[K, T] | T2, R>;
      }
    ): AsyncReducer<T, R>;
    <T, K>(
      valueToKey: (value: T, index: number) => MaybePromise<K>,
      options?: {
        collector?: undefined;
      }
    ): AsyncReducer<T, Map<K, T[]>>;
  } = <T, K, R>(
    valueToKey: (value: T, index: number) => MaybePromise<K>,
    options: {
      collector?: AsyncReducer.Accept<readonly [K, T], R> | undefined;
    } = {}
  ): AsyncReducer<T, R> => {
    const {
      collector = Reducer.toJSMultiMap() as AsyncReducer.Accept<
        readonly [K, T],
        R
      >,
    } = options;

    return AsyncReducer.create(
      collector.init,
      async (state, value, index, halt) => {
        const key = await valueToKey(value, index);
        return await collector.next(state, [key, value], index, halt);
      },
      collector.stateToResult,
      { cloneState: collector.cloneState }
    );
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
  export const race: {
    <T, R, O>(
      reducers: AsyncReducer.Accept<T, R>[],
      otherwise: AsyncOptLazy<O>
    ): AsyncReducer<T, R | O>;
    <T, R>(
      reducers: AsyncReducer.Accept<T, R>[]
    ): AsyncReducer<T, R | undefined>;
  } = <T, R, O>(
    reducers: AsyncReducer.Accept<T, R>[],
    otherwise?: AsyncOptLazy<O>
  ) => {
    const reducersStream = AsyncStream.from(reducers);

    return AsyncReducer.create<
      T,
      R | O,
      {
        reducerStates: Array<
          readonly [reducer: AsyncReducer.Accept<T, R>, { state: any }]
        >;
        doneReducerWithState:
          | readonly [reducer: AsyncReducer.Accept<T, R>, { state: any }]
          | undefined;
      }
    >(
      async (initHalt) => {
        let doneReducerWithState:
          | readonly [AsyncReducer.Accept<T, R>, { state: any }]
          | undefined = undefined;

        const reducerStates = await reducersStream
          .collect(async (reducer, _, __, halt) => {
            let halted = false;

            const state = await reducer.init(() => {
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
      async (combinedState, next, index, halt) => {
        await Promise.any(
          Stream.from(combinedState.reducerStates).mapPure(
            async ([reducer, reducerState]) => {
              reducerState.state = await reducer.next(
                reducerState.state,
                next,
                index,
                () => {
                  if (combinedState.doneReducerWithState) {
                    throw Error('');
                  } else {
                    combinedState.doneReducerWithState = [
                      reducer,
                      reducerState,
                    ];
                  }
                  halt();
                }
              );

              if (!combinedState.doneReducerWithState) {
                throw Error('');
              }
            }
          )
        ).catch(() => {});

        return combinedState;
      },
      (combinedState, index, halted) => {
        if (undefined === combinedState.doneReducerWithState) {
          return AsyncOptLazy.toMaybePromise(otherwise!);
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

  export class ReducerClosedError extends ErrBase.CustomError {
    constructor() {
      super('A closed async reducer cannot perform more actions');
    }
  }

  export class ReducerNotInitializedError extends ErrBase.CustomError {
    constructor() {
      super('The async reducer instance was not yet initialized');
    }
  }

  /**
   * Returns an `AsyncReducer` that combines multiple input `reducers` according to the given "shape" by providing input values to all of them and collecting the outputs in the shape.
   * @typeparam T - the input value type for all the reducers
   * @typeparam S - the desired result shape type
   * @param shape - a shape defining where reducer outputs will be located in the result. It can consist of a single reducer, an array of shapes, or an object with string keys and shapes as values.
   */
  export function combine<T, const S extends AsyncReducer.CombineShape<T>>(
    shape: S & AsyncReducer.CombineShape<T>
  ): AsyncReducer<T, AsyncReducer.CombineResult<S>> {
    if (shape instanceof AsyncReducer.Base) {
      return shape as any;
    }
    if (shape instanceof Reducer.Base) {
      return AsyncReducer.from(shape) as any;
    }

    if (Array.isArray(shape)) {
      return combineArr(
        ...(shape.map((item) => AsyncReducer.combine(item as any)) as any)
      ) as any;
    }

    if (typeof shape === 'object' && shape !== null) {
      const result: any = {};

      for (const key in shape) {
        result[key] = AsyncReducer.combine((shape as any)[key]);
      }

      return combineObj(result) as any;
    }

    throw new AsyncReducer.InvalidCombineShapeError();
  }

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
   * AsyncStream
   *  .from(Stream.of(1, 2, 3))
   *  .reduce(
   *    AsyncReducer.pipe(Reducer.product, Reducer.sum)
   *  )
   * // => 9
   * ```
   */
  export const pipe: {
    <I, O1, O2>(
      reducer1: AsyncReducer.Accept<I, O1>,
      reducer2: AsyncReducer.Accept<O1, O2>
    ): AsyncReducer<I, O2>;
    <I, O1, O2, O3>(
      reducer1: AsyncReducer.Accept<I, O1>,
      reducer2: AsyncReducer.Accept<O1, O2>,
      reducer3: AsyncReducer.Accept<O2, O3>
    ): AsyncReducer<I, O3>;
    <I, O1, O2, O3, O4>(
      reducer1: AsyncReducer.Accept<I, O1>,
      reducer2: AsyncReducer.Accept<O1, O2>,
      reducer3: AsyncReducer.Accept<O2, O3>,
      reducer4: AsyncReducer.Accept<O2, O4>
    ): AsyncReducer<I, O4>;
    <I, O1, O2, O3, O4, O5>(
      reducer1: AsyncReducer.Accept<I, O1>,
      reducer2: AsyncReducer.Accept<O1, O2>,
      reducer3: AsyncReducer.Accept<O2, O3>,
      reducer4: AsyncReducer.Accept<O2, O4>,
      reducer5: AsyncReducer.Accept<O2, O5>
    ): AsyncReducer<I, O5>;
  } = (...nextReducers: AsyncReducer.Accept<any, any>[]): any => {
    if (nextReducers.length < 2) {
      RimbuError.throwInvalidUsageError(
        'Reducer.pipe should have at least two arguments'
      );
    }

    const [current, next, ...others] = nextReducers as AsyncReducer.Accept<
      any,
      any
    >[];

    if (others.length > 0) {
      return AsyncReducer.pipe(
        current,
        (AsyncReducer.pipe as any)(next, ...others)
      );
    }

    return AsyncReducer.create(
      async (initHalt) => ({
        currentState: await createAsyncState(
          {
            halted: false,
          },
          async (baseState) => ({
            state: await current.init(() => {
              initHalt();
              baseState.halted = true;
            }),
          })
        ),
        nextState: await createAsyncState(
          {
            index: 0,
            halted: false,
          },
          async (baseState) => ({
            state: await next.init(() => {
              initHalt();
              baseState.halted = true;
            }),
          })
        ),
      }),
      async (combinedState, item, index, halt) => {
        const { currentState, nextState } = combinedState;

        currentState.state = await current.next(
          currentState.state,
          item,
          index,
          () => {
            currentState.halted = true;
            halt();
          }
        );
        nextState.state = await next.next(
          nextState.state,
          await current.stateToResult(
            currentState.state,
            index,
            currentState.halted
          ),
          nextState.index++,
          () => {
            nextState.halted = true;
            halt();
          }
        );

        return combinedState;
      },
      async (combinedState, index, halted) => {
        if (halted && index === 0) {
          combinedState.nextState.state = await next.next(
            combinedState.nextState.state,
            await current.stateToResult(
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

        return await next.stateToResult(
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
