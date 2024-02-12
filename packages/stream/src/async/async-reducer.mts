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
  Reducer,
  Stream,
  type AsyncFastIterator,
  type AsyncStreamSource,
} from '@rimbu/stream';
import {
  AsyncStreamConstructorsImpl,
  fromAsyncStreamSource,
} from '../async-custom/async-stream-custom.mjs';

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
  ...reducers: { [K in keyof R]: AsyncReducer.Accept<T, R[K]> } & AsyncReducer<
    T,
    unknown
  >[]
): AsyncReducer<T, R> {
  return AsyncReducer.create<T, any, AsyncReducer.Instance<T, unknown>[]>(
    async (initHalt) => {
      let allHalted = true;

      const result = await Promise.all(
        reducers.map(async (reducer) => {
          const instance = await AsyncReducer.from(reducer).compile();

          allHalted = allHalted && instance.halted;

          return instance;
        })
      );

      if (allHalted) {
        initHalt();
      }

      return result;
    },
    async (state, elem, index, halt) => {
      let allHalted = true;

      await Promise.all(
        Stream.from(state).mapPure(async (reducer) => {
          if (reducer.halted) return;

          await reducer.next(elem);

          allHalted = allHalted && reducer.halted;
        })
      );

      if (allHalted) {
        halt();
      }

      return state;
    },
    (state) =>
      Promise.all(
        Stream.from(state).mapPure((reducerInstance) =>
          reducerInstance.getOutput()
        )
      ),
    async (state, err) => {
      await Promise.all(
        Stream.from(state).mapPure((reducer) => reducer.onClose(err))
      );
    }
  );
}

function combineObj<T, R extends { readonly [key: string]: unknown }>(
  reducerObj: {
    readonly [K in keyof R]: AsyncReducer.Accept<T, R[K]>;
  } & Record<string, AsyncReducer.Accept<T, unknown>>
): AsyncReducer<T, R> {
  return AsyncReducer.create(
    async (initHalt) => {
      const result: Record<string, AsyncReducer.Instance<T, any>> = {};

      let allHalted = true;

      await Promise.all(
        Stream.fromObject(
          reducerObj as Record<string, AsyncReducer.Accept<T, unknown>>
        ).mapPure(async ([key, reducer]) => {
          const instance = await AsyncReducer.from(reducer).compile();
          result[key] = instance;

          allHalted = allHalted && instance.halted;
        })
      );

      if (allHalted) {
        initHalt();
      }

      return result;
    },
    async (state, elem, index, halt) => {
      let allHalted = true;

      await Promise.all(
        Stream.fromObjectValues(state).mapPure(async (reducerInstance) => {
          if (!reducerInstance.halted) {
            await reducerInstance.next(elem);

            allHalted = allHalted && reducerInstance.halted;
          }
        })
      );

      if (allHalted) {
        halt();
      }

      return state;
    },
    async (state) => {
      const result: any = {};

      await Promise.all(
        Stream.fromObject(state).mapPure(async ([key, reducerInstance]) => {
          result[key] = await reducerInstance.getOutput();
        })
      );

      return result;
    },
    async (state, err) => {
      await Promise.all(
        Stream.fromObjectValues(state).mapPure((reducerInstance) =>
          reducerInstance.onClose(err)
        )
      );
    }
  );
}

export namespace AsyncReducer {
  export type Accept<I, O> = AsyncReducer<I, O> | Reducer<I, O>;

  export interface Impl<I, O, S> {
    /**
     * The initial state value for the reducer algorithm.
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
    takeOutput(amount: number): AsyncReducer<I, O>;
    takeOutputUntil(
      pred: (value: O, index: number) => MaybePromise<boolean>,
      options?: { negate?: boolean }
    ): AsyncReducer<I, O>;
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
    pipe<O1>(nextReducer1: AsyncReducer.Accept<O, O1>): AsyncReducer<I, O1>;
    pipe<O1, O2>(
      nextReducer1: AsyncReducer.Accept<O, O1>,
      nextReducer2: AsyncReducer.Accept<O1, O2>
    ): AsyncReducer<I, O2>;
    pipe<O1, O2, O3>(
      nextReducer1: AsyncReducer.Accept<O, O1>,
      nextReducer2: AsyncReducer.Accept<O1, O2>,
      nextReducer3: AsyncReducer.Accept<O2, O3>
    ): AsyncReducer<I, O3>;
    pipe<O1, O2, O3, O4>(
      nextReducer1: AsyncReducer.Accept<O, O1>,
      nextReducer2: AsyncReducer.Accept<O1, O2>,
      nextReducer3: AsyncReducer.Accept<O2, O3>,
      nextReducer4: AsyncReducer.Accept<O3, O4>
    ): AsyncReducer<I, O4>;
    pipe<O1, O2, O3, O4, O5>(
      nextReducer1: AsyncReducer.Accept<O, O1>,
      nextReducer2: AsyncReducer.Accept<O1, O2>,
      nextReducer3: AsyncReducer.Accept<O2, O3>,
      nextReducer4: AsyncReducer.Accept<O3, O4>,
      nextReducer5: AsyncReducer.Accept<O4, O5>
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
      nextReducer1: AsyncOptLazy<AsyncReducer.Accept<I, O1>, [O]>
    ): AsyncReducer<I, O1>;
    chain<O1, O2>(
      nextReducer1: AsyncOptLazy<AsyncReducer.Accept<I, O1>, [O]>,
      nextReducer2: AsyncOptLazy<AsyncReducer.Accept<I, O2>, [O1]>
    ): AsyncReducer<I, O2>;
    chain<O1, O2, O3>(
      nextReducer1: AsyncOptLazy<AsyncReducer.Accept<I, O1>, [O]>,
      nextReducer2: AsyncOptLazy<AsyncReducer.Accept<I, O2>, [O1]>,
      nextReducer3: AsyncOptLazy<AsyncReducer.Accept<I, O3>, [O2]>
    ): AsyncReducer<I, O3>;
    chain<O1, O2, O3, O4>(
      nextReducer1: AsyncOptLazy<AsyncReducer.Accept<I, O1>, [O]>,
      nextReducer2: AsyncOptLazy<AsyncReducer.Accept<I, O2>, [O1]>,
      nextReducer3: AsyncOptLazy<AsyncReducer.Accept<I, O3>, [O2]>,
      nextReducer4: AsyncOptLazy<AsyncReducer.Accept<I, O4>, [O3]>
    ): AsyncReducer<I, O4>;
    chain<O1, O2, O3, O4, O5>(
      nextReducer1: AsyncOptLazy<AsyncReducer.Accept<I, O1>, [O]>,
      nextReducer2: AsyncOptLazy<AsyncReducer.Accept<I, O2>, [O1]>,
      nextReducer3: AsyncOptLazy<AsyncReducer.Accept<I, O3>, [O2]>,
      nextReducer4: AsyncOptLazy<AsyncReducer.Accept<I, O4>, [O3]>,
      nextReducer5: AsyncOptLazy<AsyncReducer.Accept<I, O5>, [O4]>
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
    compile(): Promise<AsyncReducer.Instance<I, O>>;
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
      readonly onClose?: (state: S, error?: unknown) => MaybePromise<void>
    ) {}

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
        async (state, index, halted): Promise<O2> =>
          mapFun(await this.stateToResult(state, index, halted)),
        this.onClose
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
          this.onClose
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
        this.onClose
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

    pipe<O2>(
      ...nextReducers: AsyncReducer.Accept<O, O2>[]
    ): AsyncReducer<I, O2> {
      if (nextReducers.length <= 0) {
        return this as any;
      }

      const [nextReducer, ...others] = nextReducers as AsyncReducer.Accept<
        any,
        any
      >[];

      if (others.length > 0) {
        return (this.pipe(nextReducer).pipe as any)(...others);
      }

      return AsyncReducer.create(
        async (inithalt) => {
          const thisInstance = await this.compile();
          const nextInstance = await AsyncReducer.from(nextReducer).compile();

          if (thisInstance.halted || nextInstance.halted) {
            inithalt();
          }

          return {
            thisInstance,
            nextInstance,
          };
        },
        async (state, next, index, halt) => {
          const { thisInstance, nextInstance } = state;

          await thisInstance.next(next);
          await nextInstance.next(await thisInstance.getOutput());

          if (thisInstance.halted || nextInstance.halted) {
            halt();
          }

          return state;
        },
        async (state, index, halted) => {
          if (halted && index === 0) {
            await state.nextInstance.next(await state.thisInstance.getOutput());
          }

          return state.nextInstance.getOutput();
        },
        async (state, err) => {
          await Promise.all([
            state.thisInstance.onClose(err),
            state.nextInstance.onClose(err),
          ]);
        }
      );
    }

    chain(
      ...nextReducers: AsyncOptLazy<AsyncReducer.Accept<I, any>, [any]>[]
    ): AsyncReducer<I, O> {
      return AsyncReducer.create(
        async () => ({
          activeIndex: -1,
          activeInstance: (await this.compile()) as AsyncReducer.Instance<I, O>,
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
            state.activeInstance = await AsyncReducer.from(
              nextReducer
            ).compile();
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

    async compile(): Promise<AsyncReducer.Instance<I, O>> {
      const instance = new AsyncReducer.InstanceImpl(this);
      await instance.initialize();
      return instance;
    }
  }

  export interface Instance<I, O> {
    get halted(): boolean;
    get index(): number;
    halt(): void;
    next(value: I): MaybePromise<void>;
    getOutput(): MaybePromise<O>;
    onClose(err?: unknown): Promise<void>;
  }

  export class InstanceImpl<I, O, S> implements AsyncReducer.Instance<I, O> {
    constructor(readonly reducer: AsyncReducer.Impl<I, O, S>) {}

    #state: S | undefined;
    #index = 0;
    #initialized = false;
    #halted = false;
    #closed = false;

    async initialize(): Promise<void> {
      if (this.#closed) {
        throw new AsyncReducer.ReducerClosedError();
      }

      this.#state = await this.reducer.init(this.halt);
      this.#initialized = true;
    }

    halt = (): void => {
      if (this.#closed) {
        throw new AsyncReducer.ReducerClosedError();
      }

      this.#halted = true;
    };

    get halted(): boolean {
      return this.#halted;
    }

    get index(): number {
      return this.#index;
    }

    next = async (value: I): Promise<void> => {
      if (!this.#initialized) {
        throw new AsyncReducer.ReducerNotInitializedError();
      }
      if (this.#closed) {
        throw new AsyncReducer.ReducerClosedError();
      }
      if (this.#halted) {
        throw new AsyncReducer.ReducerHaltedError();
      }

      this.#state = await this.reducer.next(
        this.#state!,
        value,
        this.#index++,
        this.halt
      );
    };

    async getOutput(): Promise<O> {
      if (!this.#initialized) {
        throw new AsyncReducer.ReducerNotInitializedError();
      }

      return this.reducer.stateToResult(this.#state!, this.index, this.halted);
    }

    async onClose(err?: unknown): Promise<void> {
      if (this.#closed) {
        throw new AsyncReducer.ReducerClosedError();
      }

      this.#closed = true;

      await this.reducer.onClose?.(this.#state!, err);
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
    onClose?: (state: O, error?: unknown) => MaybePromise<void>
  ): AsyncReducer<I, O> {
    return create(init, next, stateToResult ?? identity, onClose);
  }

  export function fold<T, R>(
    init: AsyncOptLazy<R>,
    next: (
      current: R,
      value: T,
      index: number,
      halt: () => void
    ) => MaybePromise<R>
  ): AsyncReducer<T, R> {
    return AsyncReducer.createOutput(
      () => AsyncOptLazy.toMaybePromise(init),
      next
    );
  }

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
    return create<T, T | O, T | undefined>(
      () => undefined,
      (state, next, _, halt): T => {
        halt();
        return next;
      },
      (state, index): MaybePromise<T | O> =>
        index <= 0 ? AsyncOptLazy.toMaybePromise(otherwise!) : state!
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
    return create<T, T | O, T | undefined>(
      () => undefined,
      (_, next): T => next,
      (state, index): MaybePromise<T | O> =>
        index <= 0 ? AsyncOptLazy.toMaybePromise(otherwise!) : state!
    );
  };

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

  export function some<T>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: { negate?: boolean } = {}
  ): AsyncReducer<T, boolean> {
    return nonEmpty.filterInput(pred, options);
  }

  export function every<T>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: { negate?: boolean } = {}
  ): AsyncReducer<T, boolean> {
    const { negate = false } = options;

    return isEmpty.filterInput(pred, { negate: !negate });
  }

  export function equals<T>(
    other: AsyncStreamSource<T>,
    options: { eq?: Eq<T>; negate?: boolean } = {}
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
      (state, index, halted) => !halted && done === state.nextSeq
    );
  }

  /**
   * Returns an `AsyncReducer` that outputs true if no input values are received, false otherwise.
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
   * Returns an `AsyncReducer` that outputs true if one or more input values are received, false otherwise.
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
      (state) => state.remain <= 0
    );
  }

  export function endsWithSlice<T>(
    slice: AsyncStreamSource<T>,
    options: { eq?: Eq<T> | undefined; amount?: number } = {}
  ): AsyncReducer<T, boolean> {
    const sliceStream = AsyncStreamConstructorsImpl.from(slice);
    const done = Symbol();

    const newReducerSpec = AsyncReducer.startsWithSlice(slice, options);

    return AsyncReducer.create<
      T,
      boolean,
      Set<AsyncReducer.Instance<T, boolean>>
    >(
      async (initHalt) => {
        const sliceIter = sliceStream[Symbol.asyncIterator]();
        const sliceValue = await sliceIter.fastNext(done);

        if (done === sliceValue) {
          initHalt();
        }

        return new Set([await newReducerSpec.compile()]);
      },
      async (state, nextValue) => {
        for (const instance of state) {
          if (instance.halted) {
            state.delete(instance);
          } else {
            await instance.next(nextValue);
          }
        }

        const newReducerInstance = await newReducerSpec.compile();
        await newReducerInstance.next(nextValue);

        state.add(newReducerInstance);

        return state;
      },
      (state) =>
        state.size === 0 ||
        AsyncStreamConstructorsImpl.from(state).some((instance) =>
          instance.getOutput()
        )
    );
  }

  export function containsSlice<T>(
    slice: AsyncStreamSource<T>,
    options: { eq?: Eq<T> | undefined; amount?: number } = {}
  ): AsyncReducer<T, boolean> {
    const { eq, amount = 1 } = options;

    return endsWithSlice(slice, { eq }).pipe(
      Reducer.contains(true, { amount })
    );
  }

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

    return AsyncReducer.create(
      () =>
        Promise.all([
          AsyncReducer.from(collectorTrue).compile(),
          AsyncReducer.from(collectorFalse).compile(),
        ]),
      async (state, value, index) => {
        const instanceIndex = (await pred(value, index)) ? 0 : 1;

        await state[instanceIndex].next(value);

        return state;
      },
      (state) =>
        Promise.all(
          Stream.from(state).mapPure((v) => v.getOutput())
        ) as Promise<[RT, RF]>
    );
  };

  export const groupBy: {
    <T, K, R>(
      valueToKey: (value: T, index: number) => MaybePromise<K>,
      options: {
        collector: AsyncReducer.Accept<[K, T], R>;
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
      collector?: AsyncReducer.Accept<[K, T], R> | undefined;
    } = {}
  ): AsyncReducer<T, R> => {
    const {
      collector = Reducer.toJSMultiMap() as AsyncReducer.Accept<[K, T], R>,
    } = options;

    return AsyncReducer.create(
      () => AsyncReducer.from(collector).compile(),
      async (state, value, index) => {
        const key = await valueToKey(value, index);
        await state.next([key, value]);
        return state;
      },
      (state) => state.getOutput()
    );
  };

  export const race: {
    <T, R, O>(
      reducers: AsyncReducer.Accept<T, R>[],
      otherwise: AsyncOptLazy<O>
    ): AsyncReducer<T, R | O>;
    <T, R>(reducers: AsyncReducer.Accept<T, R>[]): AsyncReducer<
      T,
      R | undefined
    >;
  } = <T, R, O>(
    reducers: AsyncReducer.Accept<T, R>[],
    otherwise?: AsyncOptLazy<O>
  ) => {
    return AsyncReducer.create<
      T,
      R | O,
      {
        instances: AsyncReducer.Instance<T, R>[];
        doneInstance: AsyncReducer.Instance<T, R> | undefined;
      }
    >(
      async (initHalt) => {
        const instances = await Promise.all(
          Stream.from(reducers).mapPure((reducer) =>
            AsyncReducer.from(reducer).compile()
          )
        );
        const doneInstance = instances.find((instance) => instance.halted);

        if (undefined !== doneInstance) {
          initHalt();
        }

        return { instances, doneInstance };
      },
      async (state, next, _, halt) => {
        for (const instance of state.instances) {
          await instance.next(next);

          if (instance.halted) {
            state.doneInstance = instance;
            halt();
            return state;
          }
        }

        return state;
      },
      (state) =>
        state.doneInstance === undefined
          ? AsyncOptLazy.toMaybePromise(otherwise!)
          : state.doneInstance.getOutput()
    );
  };

  export type CombineShape<T = unknown> =
    | AsyncReducer.Accept<T, unknown>
    | AsyncReducer.CombineShape<T>[]
    | { [key: string]: AsyncReducer.CombineShape<T> };

  export type CombineResult<S extends AsyncReducer.CombineShape<any>> =
    /* tuple */ S extends readonly AsyncReducer.CombineShape[]
      ? /* is array? */ 0 extends S['length']
        ? /* no support for arrays */ never
        : /* only tuples */ {
            [K in keyof S]: S[K] extends AsyncReducer.CombineShape
              ? AsyncReducer.CombineResult<S[K]>
              : never;
          }
      : /* plain object */ S extends {
          [key: string]: AsyncReducer.CombineShape;
        }
      ? { [K in keyof S]: AsyncReducer.CombineResult<S[K]> }
      : /* simple reducer */ S extends AsyncReducer.Accept<unknown, infer R>
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
}
