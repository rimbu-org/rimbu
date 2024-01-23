import {
  AsyncOptLazy,
  type AsyncCollectFun,
  type MaybePromise,
  CollectFun,
  type Eq,
  ErrBase,
} from '../../common/mod.ts';
import { Stream, type AsyncStreamSource, type Reducer } from '../../stream/mod.ts';
import { fromAsyncStreamSource } from '../async-custom/async-stream-custom.ts';

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

function combineArr<T, R extends readonly [unknown, unknown, ...unknown[]]>(
  ...reducers: { [K in keyof R]: AsyncReducer<T, R[K]> } & AsyncReducer<
    T,
    unknown
  >[]
): AsyncReducer<T, R> {
  return AsyncReducer.create<T, any, AsyncReducer.Instance<T, unknown>[]>(
    () => reducers.map((reducer) => reducer.compile()),
    async (state, elem, index, halt) => {
      let anyNotHalted = false;

      await Promise.all(
        Stream.from(state).map(async (reducer) => {
          if (reducer.halted) return;

          await reducer.next(elem);

          if (!reducer.halted) {
            anyNotHalted = true;
          }
        })
      );

      if (!anyNotHalted) {
        halt();
      }

      return state;
    },
    (state) =>
      Promise.all(
        Stream.from(state).map((reducerInstance) => reducerInstance.getOutput())
      ),
    async (state, err) => {
      await Promise.all(
        Stream.from(state).map((reducer) => reducer.onClose(err))
      );
    }
  );
}

function combineObj<T, R extends { readonly [key: string]: unknown }>(
  reducerObj: { readonly [K in keyof R]: AsyncReducer<T, R[K]> } & Record<
    string,
    AsyncReducer<T, unknown>
  >
): AsyncReducer<T, R> {
  return AsyncReducer.create(
    () => {
      const result: Record<string, AsyncReducer.Instance<T, any>> = {};

      for (const key in reducerObj) {
        result[key] = reducerObj[key].compile();
      }

      return result;
    },
    async (state, elem, index, halt) => {
      let anyNotHalted = false;

      await Promise.all(
        Stream.fromObjectValues(state).map(async (reducerInstance) => {
          if (!reducerInstance.halted) {
            await reducerInstance.next(elem);
            anyNotHalted = anyNotHalted || !reducerInstance.halted;
          }
        })
      );

      if (!anyNotHalted) {
        halt();
      }

      return state;
    },
    async (state) => {
      const result: any = {};

      await Promise.all(
        Stream.fromObject(state).map(async ([key, reducerInstance]) => {
          result[key] = await reducerInstance.getOutput();
        })
      );

      return result;
    },
    async (state, err) => {
      await Promise.all(
        Stream.fromObjectValues(state).map((reducerInstance) =>
          reducerInstance.onClose(err)
        )
      );
    }
  );
}

export namespace AsyncReducer {
  export interface Impl<I, O, S> {
    /**
     * The initial state value for the reducer algorithm.
     */
    readonly init: () => MaybePromise<S>;
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
     * Returns an `AsyncReducer` instance that converts its input values using given `flatMapFun` before passing them to the reducer.
     * @param flatMapFun - a potentially asynchronous function that returns am arbitrary number of new values to pass to the reducer based on the following inputs:<br/>
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
    flatMapInput<I2>(
      flatMapFun: (
        value: I2,
        index: number
      ) => MaybePromise<AsyncStreamSource<I>>
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
    mapOutput<O2>(mapFun: (value: O) => MaybePromise<O2>): AsyncReducer<I, O2>;
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
    sliceInput(from?: number, amount?: number): AsyncReducer<I, O>;
    /**
     * Returns an `AsyncReducer` instance that first applies this reducer, and then applies the given `next` reducer to each output produced
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
     * AsyncStream
     *  .from(Stream.of(1, 2, 3))
     *  .reduce(
     *    AsyncReducer.product
     *      .pipe(AsyncReducer.sum)
     *  )
     * // => 9
     * ```
     */
    pipe<O1>(nextReducer1: AsyncReducer<O, O1>): AsyncReducer<I, O1>;
    pipe<O1, O2>(
      nextReducer1: AsyncReducer<O, O1>,
      nextReducer2: AsyncReducer<O1, O2>
    ): AsyncReducer<I, O2>;
    pipe<O1, O2, O3>(
      nextReducer1: AsyncReducer<O, O1>,
      nextReducer2: AsyncReducer<O1, O2>,
      nextReducer3: AsyncReducer<O2, O3>
    ): AsyncReducer<I, O3>;
    pipe<O1, O2, O3, O4>(
      nextReducer1: AsyncReducer<O, O1>,
      nextReducer2: AsyncReducer<O1, O2>,
      nextReducer3: AsyncReducer<O2, O3>,
      nextReducer4: AsyncReducer<O3, O4>
    ): AsyncReducer<I, O4>;
    pipe<O1, O2, O3, O4, O5>(
      nextReducer1: AsyncReducer<O, O1>,
      nextReducer2: AsyncReducer<O1, O2>,
      nextReducer3: AsyncReducer<O2, O3>,
      nextReducer4: AsyncReducer<O3, O4>,
      nextReducer5: AsyncReducer<O4, O5>
    ): AsyncReducer<I, O5>;
    /**
     * Returns a reducer that applies the given `nextReducers` sequentially after this reducer
     * has halted, and moving on to the next provided reducer until it is halted. Optionally, it provides the last output
     * value of the previous reducer.
     * @param nextReducers - an number of reducers consuming and producing the same types as the current reducer.
     * @example
     * ```ts
     * const result = await AsyncStream.range({ amount: 6 })
     *  .reduce(
     *    AsyncReducer.sum
     *      .takeInput(3)
     *      .chain(
     *        v => v > 10 ? AsyncReducer.product : AsyncReducer.sum
     *      )
     *    )
     * console.log(result)
     * // => 21
     * ```
     */
    chain<O1>(
      nextReducer1: AsyncOptLazy<AsyncReducer<I, O1>, [O]>
    ): AsyncReducer<I, O1>;
    chain<O1, O2>(
      nextReducer1: AsyncOptLazy<AsyncReducer<I, O1>, [O]>,
      nextReducer2: AsyncOptLazy<AsyncReducer<I, O2>, [O1]>
    ): AsyncReducer<I, O2>;
    chain<O1, O2, O3>(
      nextReducer1: AsyncOptLazy<AsyncReducer<I, O1>, [O]>,
      nextReducer2: AsyncOptLazy<AsyncReducer<I, O2>, [O1]>,
      nextReducer3: AsyncOptLazy<AsyncReducer<I, O3>, [O2]>
    ): AsyncReducer<I, O3>;
    chain<O1, O2, O3, O4>(
      nextReducer1: AsyncOptLazy<AsyncReducer<I, O1>, [O]>,
      nextReducer2: AsyncOptLazy<AsyncReducer<I, O2>, [O1]>,
      nextReducer3: AsyncOptLazy<AsyncReducer<I, O3>, [O2]>,
      nextReducer4: AsyncOptLazy<AsyncReducer<I, O4>, [O3]>
    ): AsyncReducer<I, O4>;
    chain<O1, O2, O3, O4, O5>(
      nextReducer1: AsyncOptLazy<AsyncReducer<I, O1>, [O]>,
      nextReducer2: AsyncOptLazy<AsyncReducer<I, O2>, [O1]>,
      nextReducer3: AsyncOptLazy<AsyncReducer<I, O3>, [O2]>,
      nextReducer4: AsyncOptLazy<AsyncReducer<I, O4>, [O3]>,
      nextReducer5: AsyncOptLazy<AsyncReducer<I, O5>, [O4]>
    ): AsyncReducer<I, O5>;
    /**
     * Returns a 'runnable' instance of the current reducer specification. This instance maintains its own state
     * and indices, so that the instance only needs to be provided the input values, and output values can be
     * retrieved when needed. The state is kept private.
     * @example
     * ```ts
     * const reducer = AsyncReducer.sum.mapOutput(v => v * 2);
     * const instance = reducer.compile();
     * await instance.next(3);
     * await instance.next(5);
     * console.log(await instance.getOutput());
     * // => 16
     * ```
     */
    compile(): AsyncReducer.Instance<I, O>;
  }

  /**
   * A base class that can be used to easily create `AsyncReducer` instances.
   * @typeparam I - the input value type
   * @typeparam O - the output value type
   * @typeparam S - the internal state type
   */
  export class Base<I, O, S> implements AsyncReducer.Impl<I, O, S> {
    constructor(
      readonly init: () => MaybePromise<S>,
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
      pred: (
        value: I,
        index: number,
        halt: () => void
      ) => MaybePromise<boolean>,
      options: { negate?: boolean } = {}
    ): AsyncReducer<I, O> {
      const { negate = false } = options;

      return create(
        () => this.compile(),
        async (state, elem, index, halt) => {
          if ((await pred(elem, index, halt)) !== negate) {
            await state.next(elem);

            if (state.halted) {
              halt();
            }
          }

          return state;
        },
        (state) => state.getOutput(),
        (state, err) => state.onClose(err)
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

    flatMapInput<I2>(
      flatMapFun: (
        value: I2,
        index: number
      ) => MaybePromise<AsyncStreamSource<I>>
    ): AsyncReducer<I2, O> {
      return create<I2, O, AsyncReducer.Instance<I, O>>(
        () => this.compile(),
        async (state, elem, index, halt) => {
          if (state.halted) {
            halt();
            return state;
          }

          const elems = await flatMapFun(elem, index);

          const iter = fromAsyncStreamSource(elems)[Symbol.asyncIterator]();
          const done = Symbol();
          let value: I | typeof done;

          while (done !== (value = await iter.fastNext(done))) {
            await state.next(value);

            if (state.halted) {
              halt();
              break;
            }
          }

          return state;
        },
        (state) => state.getOutput(),
        (state, err) => state.onClose(err)
      );
    }

    collectInput<I2>(collectFun: AsyncCollectFun<I2, I>): AsyncReducer<I2, O> {
      return create(
        () => this.compile(),
        async (state, elem, index, halt) => {
          const nextElem = await collectFun(elem, index, CollectFun.Skip, halt);

          if (CollectFun.Skip !== nextElem) {
            await state.next(nextElem);
            if (state.halted) {
              halt();
            }
          }

          return state;
        },
        (state) => state.getOutput(),
        (state, err) => state.onClose(err)
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
        return create(this.init, identity, this.stateToResult, this.onClose);
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

    pipe<O2>(...nextReducers: AsyncReducer<O, O2>[]): AsyncReducer<I, O2> {
      if (nextReducers.length <= 0) {
        return this as any;
      }

      const [nextReducer, ...others] = nextReducers as AsyncReducer<any, any>[];

      if (others.length > 0) {
        return (this.pipe(nextReducer).pipe as any)(...others);
      }

      return AsyncReducer.create(
        () => ({
          thisInstance: this.compile(),
          nextInstance: nextReducer.compile(),
        }),
        async (state, next, index, halt) => {
          const { thisInstance, nextInstance } = state;

          await thisInstance.next(next);
          await nextInstance.next(await thisInstance.getOutput());

          if (thisInstance.halted || nextInstance.halted) {
            halt();
          }

          return state;
        },
        (state) => state.nextInstance.getOutput(),
        async (state, err) => {
          await Promise.all([
            state.thisInstance.onClose(err),
            state.nextInstance.onClose(err),
          ]);
        }
      );
    }

    chain(
      ...nextReducers: AsyncOptLazy<AsyncReducer<I, any>, [any]>[]
    ): AsyncReducer<I, O> {
      return AsyncReducer.create(
        () => ({
          activeIndex: -1,
          activeInstance: this.compile() as AsyncReducer.Instance<I, O>,
        }),
        async (state, next, index, halt) => {
          while (state.activeInstance.halted) {
            if (state.activeIndex >= nextReducers.length - 1) {
              return state;
            }

            const nextReducer = await AsyncOptLazy.toMaybePromise(
              nextReducers[++state.activeIndex],
              await state.activeInstance.getOutput()
            );
            state.activeInstance = nextReducer.compile();
          }

          await state.activeInstance.next(next);

          if (
            state.activeInstance.halted &&
            state.activeIndex >= nextReducers.length - 1
          ) {
            halt();
          }

          return state;
        },
        (state) => state.activeInstance.getOutput(),
        (state, err) => state.activeInstance.onClose(err)
      );
    }

    compile(): AsyncReducer.Instance<I, O> {
      return new AsyncReducer.InstanceImpl(this);
    }
  }

  export interface Instance<I, O> {
    get halted(): boolean;
    get index(): number;
    next(value: I): MaybePromise<void>;
    getOutput(): MaybePromise<O>;
    onClose(err?: unknown): Promise<void>;
  }

  export class InstanceImpl<I, O, S> implements AsyncReducer.Instance<I, O> {
    constructor(readonly reducer: AsyncReducer.Impl<I, O, S>) {}

    #initialized = false;
    #_state: S | undefined;
    #index = 0;
    #halted = false;
    #closed = false;

    async #getState(): Promise<S> {
      if (!this.#initialized) {
        this.#_state = await this.reducer.init();
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

    next = async (value: I): Promise<void> => {
      if (this.#halted) {
        throw new AsyncReducer.ReducerHaltedError();
      }

      this.#state = await this.reducer.next(
        await this.#getState(),
        value,
        this.#index++,
        this.#halt
      );
    };

    async getOutput(): Promise<O> {
      return this.reducer.stateToResult(await this.#getState());
    }

    async onClose(err?: unknown): Promise<void> {
      if (this.#closed) {
        throw Error('already closed');
      }

      this.#closed = true;

      await this.reducer.onClose?.(await this.#getState(), err);
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
    init: () => MaybePromise<S>,
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
    init: () => MaybePromise<T>,
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
    init: () => MaybePromise<O>,
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
    <T>(
      pred: (value: T, index: number) => MaybePromise<boolean>,
      options?: { negate?: boolean }
    ): AsyncReducer<T, number>;
  } = (
    pred?: (value: any, index: number) => MaybePromise<boolean>,
    options: { negate?: boolean } = {}
  ): AsyncReducer<never, number> => {
    if (undefined === pred)
      return createOutput(
        () => 0,
        (_, __, i): number => i + 1
      );

    const { negate = false } = options;

    return createOutput(
      () => 0,
      async (state, next, i): Promise<number> => {
        if ((await pred(next, i)) !== negate) return state + 1;
        return state;
      }
    );
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
    <T>(
      pred: (value: T, index: number) => MaybePromise<boolean>,
      options?: { negate?: boolean }
    ): AsyncReducer<T, T | undefined>;
    <T, O>(
      pred: (value: T, index: number) => MaybePromise<boolean>,
      options?: { negate?: boolean; otherwise: AsyncOptLazy<O> }
    ): AsyncReducer<T, T | O>;
  } = <T, O>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: { negate?: boolean; otherwise?: AsyncOptLazy<O> } = {}
  ) => {
    const token = Symbol();
    const { negate = false, otherwise } = options;

    return create<T, T | O, T | typeof token>(
      () => token,
      async (state, next, i, halt): Promise<T | typeof token> => {
        if (token === state && (await pred(next, i)) !== negate) {
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
      () => token,
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
    <T>(
      pred: (value: T, index: number) => MaybePromise<boolean>,
      options?: { negate?: boolean }
    ): AsyncReducer<T, T | undefined>;
    <T, O>(
      pred: (value: T, index: number) => MaybePromise<boolean>,
      options: { negate?: boolean; otherwise: AsyncOptLazy<O> }
    ): AsyncReducer<T, T | O>;
  } = <T, O>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: { negate?: boolean; otherwise?: AsyncOptLazy<O> } = {}
  ) => {
    const { negate = false, otherwise } = options;
    const token = Symbol();

    return create<T, T | O, T | typeof token>(
      () => token,
      async (state, next, i): Promise<T | typeof token> => {
        if ((await pred(next, i)) !== negate) return next;
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
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: { negate?: boolean } = {}
  ): AsyncReducer<T, boolean> {
    const { negate = false } = options;

    return createOutput<T, boolean>(
      () => false,
      async (state, next, i, halt): Promise<boolean> => {
        if (state) return state;
        const satisfies = (await pred(next, i)) !== negate;

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
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: { negate?: boolean } = {}
  ): AsyncReducer<T, boolean> {
    const { negate = false } = options;

    return createOutput<T, boolean>(
      () => true,
      async (state, next, i, halt): Promise<boolean> => {
        if (!state) return state;

        const satisfies = (await pred(next, i)) !== negate;

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
    options: { eq?: Eq<T>; negate?: boolean } = {}
  ): AsyncReducer<T, boolean> {
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
   * Returns an `AsyncReducer` that takes boolean values and outputs true if all input values are true, and false otherwise.
   * @example
   * ```ts
   * await AsyncStream.of(true, false, true)).reduce(AsyncReducer.and))
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
   * Returns an `AsyncReducer` that takes boolean values and outputs true if one or more input values are true, and false otherwise.
   * @example
   * ```ts
   * await AsyncStream.of(true, false, true)).reduce(AsyncReducer.or))
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
   * Returns an `AsyncReducer` that outputs true if no input values are received, false otherwise.
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.isEmpty))
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
   * Returns an `AsyncReducer` that outputs true if one or more input values are received, false otherwise.
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.nonEmpty))
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
   * Returns an `AsyncReducer` that collects received input values in an array, and returns a copy of that array as an output value when requested.
   * @typeparam T - the element type
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.toArray()))
   * // => [1, 2, 3]
   * ```
   */
  export function toArray<T>(
    options: { reversed?: boolean } = {}
  ): AsyncReducer<T, T[]> {
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

  export type CombineShape<T = unknown> =
    | AsyncReducer<T, unknown>
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
      : /* simple reducer */ S extends AsyncReducer<unknown, infer R>
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
  export function combine<T, const S extends AsyncReducer.CombineShape<T>>(
    shape: S & AsyncReducer.CombineShape<T>
  ): AsyncReducer<T, AsyncReducer.CombineResult<S>> {
    if (shape instanceof AsyncReducer.Base) {
      return shape as any;
    }

    if (Array.isArray(shape)) {
      return combineArr(
        ...(shape.map((item) => AsyncReducer.combine(item)) as any)
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
}
