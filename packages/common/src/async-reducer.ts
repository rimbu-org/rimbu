import {
  AsyncCollectFun,
  AsyncOptLazy,
  CollectFun,
  MaybePromise,
} from './internal';

export type AsyncReducer<I, O = I> = AsyncReducer.Impl<I, O, unknown>;

function identity<T>(value: T): T {
  return value;
}

export namespace AsyncReducer {
  export interface Impl<I, O, S> {
    readonly init: AsyncOptLazy<S>;
    next(state: S, elem: I, index: number, halt: () => void): MaybePromise<S>;
    stateToResult(state: S): MaybePromise<O>;
    filterInput(
      pred: (value: I, index: number, halt: () => void) => MaybePromise<boolean>
    ): AsyncReducer<I, O>;
    mapInput<I2>(
      mapFun: (value: I2, index: number) => MaybePromise<I>
    ): AsyncReducer<I2, O>;
    collectInput<I2>(collectFun: AsyncCollectFun<I2, I>): AsyncReducer<I2, O>;
    mapOutput<O2>(mapFun: (value: O) => MaybePromise<O2>): AsyncReducer<I, O2>;
    takeInput(amount: number): AsyncReducer<I, O>;
    dropInput(amount: number): AsyncReducer<I, O>;
    sliceInput(from?: number, amount?: number): AsyncReducer<I, O>;
  }

  export class Base<I, O, S> implements AsyncReducer.Impl<I, O, S> {
    constructor(
      readonly init: AsyncOptLazy<S>,
      readonly next: (
        state: S,
        elem: I,
        index: number,
        halt: () => void
      ) => MaybePromise<S>,
      readonly stateToResult: (state: S) => MaybePromise<O>
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
        (state): MaybePromise<O> => this.stateToResult(state.state)
      );
    }

    mapInput<I2>(
      mapFun: (value: I2, index: number) => MaybePromise<I>
    ): AsyncReducer<I2, O> {
      return create(
        this.init,
        async (state, elem, index, halt): Promise<S> =>
          this.next(state, await mapFun(elem, index), index, halt),
        this.stateToResult
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
        (state): MaybePromise<O> => this.stateToResult(state.state)
      );
    }

    mapOutput<O2>(mapFun: (value: O) => MaybePromise<O2>): AsyncReducer<I, O2> {
      return create(
        this.init,
        this.next,
        async (state): Promise<O2> => mapFun(await this.stateToResult(state))
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

  export function create<I, O = I, S = O>(
    init: AsyncOptLazy<S>,
    next: (
      current: S,
      next: I,
      index: number,
      halt: () => void
    ) => MaybePromise<S>,
    stateToResult: (state: S) => MaybePromise<O>
  ): AsyncReducer<I, O> {
    return new AsyncReducer.Base(init, next, stateToResult);
  }

  export function createMono<T>(
    init: AsyncOptLazy<T>,
    next: (
      current: T,
      next: T,
      index: number,
      halt: () => void
    ) => MaybePromise<T>,
    stateToResult?: (state: T) => MaybePromise<T>
  ): AsyncReducer<T> {
    return create(init, next, stateToResult ?? identity);
  }

  export function createOutput<I, O = I>(
    init: AsyncOptLazy<O>,
    next: (
      current: O,
      next: I,
      index: number,
      halt: () => void
    ) => MaybePromise<O>,
    stateToResult?: (state: O) => MaybePromise<O>
  ): AsyncReducer<I, O> {
    return create(init, next, stateToResult ?? identity);
  }
}
