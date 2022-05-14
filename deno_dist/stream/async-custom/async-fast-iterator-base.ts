import { Token } from '../../base/mod.ts';
import {
  ArrayNonEmpty,
  AsyncCollectFun,
  AsyncOptLazy,
  AsyncReducer,
  CollectFun,
  Eq,
  MaybePromise,
  TraverseState,
} from '../../common/mod.ts';

import {
  closeIters,
  fromAsyncStreamSource,
  isEmptyAsyncStreamSourceInstance,
} from '../../stream/async-custom/index.ts';
import type {
  AsyncFastIterator,
  AsyncStream,
  AsyncStreamSource,
} from '../../stream/async/index.ts';

export const fixedDoneAsyncIteratorResult = Object.freeze(
  Promise.resolve(
    Object.freeze({
      done: true,
      value: undefined,
    }) as IteratorResult<any>
  )
);

export function isAsyncFastIterator<T>(
  iterator: AsyncIterator<T>
): iterator is AsyncFastIterator<T> {
  return `fastNext` in iterator;
}

export const emptyAsyncFastIterator: AsyncFastIterator<any> = Object.freeze({
  fastNext<O>(otherwise?: AsyncOptLazy<O>): MaybePromise<O> {
    return AsyncOptLazy.toMaybePromise(otherwise!);
  },
  next(): Promise<IteratorResult<any>> {
    return fixedDoneAsyncIteratorResult;
  },
});

export abstract class AsyncFastIteratorBase<T> implements AsyncFastIterator<T> {
  abstract fastNext<O>(otherwise?: AsyncOptLazy<O>): MaybePromise<T | O>;
  return?: () => Promise<any>;

  async next(): Promise<IteratorResult<T>> {
    const done = Symbol('Done');
    const value = await this.fastNext(done);
    if (done === value) return fixedDoneAsyncIteratorResult;
    return { value, done: false };
  }
}

export class AsyncOfIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(readonly values: ArrayNonEmpty<AsyncOptLazy<T>>) {
    super();
  }

  index = 0;

  fastNext<O>(otherwise?: AsyncOptLazy<O>): MaybePromise<T | O> {
    const index = this.index;
    const values = this.values;

    if (index >= values.length) return AsyncOptLazy.toMaybePromise(otherwise!);

    return AsyncOptLazy.toMaybePromise(values[this.index++]);
  }
}

export class FromResourceIterator<T, R> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly open: () => MaybePromise<R>,
    readonly createSource: (resource: R) => MaybePromise<AsyncStreamSource<T>>,
    readonly close: (resource: R) => MaybePromise<void>
  ) {
    super();

    this.return = async (): Promise<void> => {
      if (this.resource) await close(this.resource);
      await this.iterator?.return?.();
    };
  }

  resource?: R;
  iterator?: AsyncFastIterator<T>;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    if (undefined === this.iterator) {
      const resource = await this.open();
      this.resource = resource;
      const source = await this.createSource(resource);
      this.iterator = fromAsyncStreamSource(source)[Symbol.asyncIterator]();
    }

    return this.iterator.fastNext(async () => {
      await this.return?.();

      return AsyncOptLazy.toMaybePromise(otherwise!);
    });
  }
}

export class AsyncUnfoldIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(
    init: T,
    readonly getNext: (
      current: T,
      index: number,
      stop: Token
    ) => MaybePromise<T | Token>
  ) {
    super();
    this.current = init;
  }

  current: T | Token;
  index = 0;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const current = this.current;

    if (Token === current) return AsyncOptLazy.toMaybePromise(otherwise!);

    if (this.index === 0) {
      this.index++;
      return current;
    }

    const next = await this.getNext(current, this.index++, Token);
    this.current = next;

    if (Token === next) return AsyncOptLazy.toMaybePromise(otherwise!);

    return next;
  }
}

export class AsyncZipWithIterator<
  I extends readonly unknown[],
  R
> extends AsyncFastIteratorBase<R> {
  constructor(
    readonly iterables: { [K in keyof I]: AsyncStreamSource<I[K]> },
    readonly zipFun: (...values: I) => MaybePromise<R>
  ) {
    super();

    this.sources = iterables.map(
      (source): AsyncFastIterator<any> =>
        fromAsyncStreamSource(source)[Symbol.asyncIterator]()
    );

    this.sourcesToClose = new Set(this.sources);

    this.return = (): Promise<void> => closeIters(...this.sourcesToClose);
  }

  readonly sources: AsyncFastIterator<any>[];
  readonly sourcesToClose: Set<AsyncFastIterator<any>>;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<R | O> {
    const sources = this.sources;

    const done = Symbol('Done');

    const result = await Promise.all(
      sources.map((source) =>
        source.fastNext(() => {
          this.sourcesToClose.delete(source);
          return done;
        })
      )
    );

    if (this.sourcesToClose.size !== sources.length) {
      await closeIters(this);
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    return (this.zipFun as any)(...result);
  }
}

export class AsyncZipAllWithItererator<
  I extends readonly unknown[],
  F,
  R
> extends AsyncFastIteratorBase<R> {
  constructor(
    readonly fillValue: AsyncOptLazy<F>,
    readonly iters: { [K in keyof I]: AsyncStreamSource<I[K]> },
    readonly zipFun: (
      ...values: { [K in keyof I]: I[K] | F }
    ) => MaybePromise<R>
  ) {
    super();

    this.sources = iters.map(
      (o): AsyncFastIterator<any> =>
        fromAsyncStreamSource(o)[Symbol.asyncIterator]()
    );

    this.sourcesToClose = new Set(this.sources);

    this.return = (): Promise<void> => closeIters(...this.sourcesToClose);
  }

  readonly sources: AsyncFastIterator<any>[];

  readonly sourcesToClose: Set<AsyncFastIterator<any>>;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<R | O> {
    if (this.sourcesToClose.size === 0) {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    const sources = this.sources;

    const fillValue = this.fillValue;

    const result = await Promise.all(
      sources.map((source) => {
        if (this.sourcesToClose.has(source)) {
          return source.fastNext(() => {
            this.sourcesToClose.delete(source);
            return AsyncOptLazy.toMaybePromise(fillValue);
          });
        }

        return AsyncOptLazy.toMaybePromise(fillValue);
      })
    );

    if (this.sourcesToClose.size === 0) {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    return (this.zipFun as any)(...result);
  }
}

export class FromAsyncIterator<T> implements AsyncFastIterator<T> {
  constructor(
    readonly source: AsyncIterator<T>,
    close?: () => MaybePromise<void>
  ) {
    if (source.return && close) {
      this.return = (): Promise<any> =>
        Promise.all([source.return?.(), close?.()]);
    } else if (source.return) {
      this.return = (): Promise<any> | undefined => source.return?.();
    } else if (close) {
      this.return = close;
    }
  }

  return?: () => MaybePromise<any>;

  next(): Promise<IteratorResult<T>> {
    return this.source.next();
  }

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const result = await this.source.next();
    if (result.done) {
      await closeIters(this);
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }
    return result.value;
  }
}

export class FromIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly iterator: Iterator<T>,
    close?: () => MaybePromise<void>
  ) {
    super();
    this.return = close;
  }

  return?: () => MaybePromise<any>;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const result = this.iterator.next();

    if (result.done) {
      await closeIters(this);
      return AsyncOptLazy.toPromise(otherwise!);
    }
    return result.value;
  }
}

export class FromPromise<T> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly promise: () => Promise<AsyncStreamSource<T>>,
    close?: () => MaybePromise<void>
  ) {
    super();
    this.return = async (): Promise<void> => {
      if (close) await close?.();
      if (this.iterator) await this.iterator.return?.();
    };
  }

  iterator: AsyncFastIterator<T> | undefined;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    if (this.iterator === undefined) {
      const source = await this.promise();
      this.iterator = fromAsyncStreamSource(source)[
        Symbol.asyncIterator
      ]() as any;
    }

    return this.iterator!.fastNext(otherwise!);
  }
}

export class AsyncPrependIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly item: AsyncOptLazy<T>
  ) {
    super();

    this.return = async (): Promise<void> => {
      if (this.prependDone) return closeIters(this.source);
    };
  }

  prependDone = false;

  fastNext<O>(otherwise?: AsyncOptLazy<O>): MaybePromise<T | O> {
    if (this.prependDone) {
      return this.source.fastNext(otherwise!);
    }

    this.prependDone = true;
    return AsyncOptLazy.toMaybePromise(this.item);
  }
}

export class AsyncAppendIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly item: AsyncOptLazy<T>
  ) {
    super();

    this.return = async (): Promise<void> => {
      if (!this.appendDone) return closeIters(source);
    };
  }

  appendDone = false;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    if (this.appendDone) return AsyncOptLazy.toMaybePromise(otherwise!);

    const done = Symbol('Done');

    const value = await this.source.fastNext(done);

    if (done !== value) return value;

    this.appendDone = true;

    return AsyncOptLazy.toMaybePromise(this.item);
  }
}

export class AsyncIndexedIterator<T> extends AsyncFastIteratorBase<
  [number, T]
> {
  index: number;

  constructor(readonly source: AsyncFastIterator<T>, readonly startIndex = 0) {
    super();
    this.index = startIndex;
    this.return = (): Promise<void> => closeIters(source);
  }

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<[number, T] | O> {
    const done = Symbol('Done');
    const value = await this.source.fastNext(done);

    if (done === value) {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    return [this.index++, value];
  }
}

export class AsyncMapIterator<T, T2> extends AsyncFastIteratorBase<T2> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly mapFun: (value: T, index: number) => MaybePromise<T2>
  ) {
    super();
    this.return = (): Promise<void> => closeIters(source);
  }

  readonly state = TraverseState();

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T2 | O> {
    const state = this.state;

    const done = Symbol('Done');
    const next = await this.source.fastNext(done);

    if (done === next) {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    return this.mapFun(next, state.nextIndex());
  }
}

export class AsyncMapPureIterator<
  T,
  A extends readonly unknown[],
  T2
> extends AsyncFastIteratorBase<T2> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly mapFun: (value: T, ...args: A) => MaybePromise<T2>,
    readonly args: A
  ) {
    super();
    this.return = (): Promise<void> => closeIters(source);
  }

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T2 | O> {
    const done = Symbol('Done');
    const next = await this.source.fastNext(done);

    if (done === next) return AsyncOptLazy.toMaybePromise(otherwise!);

    return this.mapFun(next, ...this.args);
  }
}

export class AsyncFlatMapIterator<T, T2> extends AsyncFastIteratorBase<T2> {
  iterator: AsyncFastIterator<T>;

  constructor(
    readonly source: AsyncStream<T>,
    readonly flatMapFun: (
      value: T,
      index: number,
      halt: () => void
    ) => AsyncStreamSource<T2>
  ) {
    super();
    this.iterator = this.source[Symbol.asyncIterator]();
    this.return = (): Promise<void> =>
      closeIters(this.currentIterator, this.iterator);
  }

  readonly state = TraverseState();

  done = false;
  currentIterator: null | AsyncFastIterator<T2> = null;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T2 | O> {
    const state = this.state;

    if (state.halted || this.done) {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    const done = Symbol('Done');

    let nextValue: T2 | typeof done;

    while (
      null === this.currentIterator ||
      done === (nextValue = await this.currentIterator.fastNext(done))
    ) {
      const nextIter = await this.iterator.fastNext(done);

      if (done === nextIter) {
        this.done = true;
        return AsyncOptLazy.toMaybePromise(otherwise!);
      }

      const nextSource = this.flatMapFun(
        nextIter,
        state.nextIndex(),
        state.halt
      );

      const currentIterator =
        fromAsyncStreamSource(nextSource)[Symbol.asyncIterator]();

      this.currentIterator = currentIterator;
    }

    return nextValue;
  }
}

export class AsyncConcatIterator<T> extends AsyncFastIteratorBase<T> {
  iterator: AsyncFastIterator<T>;

  constructor(
    readonly source: AsyncStream<T>,
    readonly otherSources: AsyncStreamSource<T>[]
  ) {
    super();

    this.iterator = source[Symbol.asyncIterator]();
    this.return = (): Promise<void> => closeIters(this.iterator);
  }

  sourceIndex = 0;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const done = Symbol('Done');
    let value: T | typeof done;
    const length = this.otherSources.length;

    while (done === (value = await this.iterator.fastNext(done))) {
      if (this.sourceIndex >= length) {
        return AsyncOptLazy.toMaybePromise(otherwise!);
      }

      let nextSource: AsyncStreamSource<T> =
        this.otherSources[this.sourceIndex++];

      while (isEmptyAsyncStreamSourceInstance(nextSource)) {
        if (this.sourceIndex >= length) {
          return AsyncOptLazy.toMaybePromise(otherwise!);
        }
        nextSource = this.otherSources[this.sourceIndex++];
      }

      this.iterator = fromAsyncStreamSource(nextSource)[Symbol.asyncIterator]();
    }

    return value;
  }
}

export class AsyncIntersperseIterator<T, S> extends AsyncFastIteratorBase<
  T | S
> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly sepStream: AsyncStream<S>
  ) {
    super();
    this.return = async (): Promise<void> => {
      if (!this.isDone) return closeIters(this.sepIterator, this.source);
    };
  }

  sepIterator: AsyncFastIterator<S> | undefined;
  nextValue!: T;
  isInitialized = false;
  isDone = false;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | S | O> {
    if (this.isDone) {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    const done = Symbol('Done');

    if (undefined !== this.sepIterator) {
      const sepNext = await this.sepIterator.fastNext(done);

      if (done !== sepNext) return sepNext;

      this.sepIterator = undefined;
    }

    if (this.isInitialized) {
      const newNextValue = await this.source.fastNext(done);
      if (done === newNextValue) {
        this.isDone = true;
        return this.nextValue;
      }
      const currentNextValue = this.nextValue;
      this.nextValue = newNextValue;
      this.sepIterator = this.sepStream[Symbol.asyncIterator]();

      return currentNextValue;
    }

    const nextValue = await this.source.fastNext(done);
    if (done === nextValue) {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    const newNextValue = await this.source.fastNext(done);
    if (done === newNextValue) {
      return nextValue;
    }

    this.nextValue = newNextValue;
    this.isInitialized = true;
    this.sepIterator = this.sepStream[Symbol.asyncIterator]();

    return nextValue;
  }
}

export class AsyncFilterIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly pred: (
      value: T,
      index: number,
      halt: () => void
    ) => MaybePromise<boolean>,
    readonly invert: boolean
  ) {
    super();
    this.return = (): Promise<void> => closeIters(source);
  }

  readonly state = TraverseState();

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const state = this.state;
    if (state.halted) {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const pred = this.pred;
    const halt = state.halt;

    const invert = this.invert;

    while (!state.halted && done !== (value = await source.fastNext(done))) {
      const cond = await pred(value, state.nextIndex(), halt);
      if (cond !== invert) return value;
    }

    if (state.halted && done !== value!) {
      await closeIters(this);
    }

    return AsyncOptLazy.toMaybePromise(otherwise!);
  }
}

export class AsyncFilterPureIterator<
  T,
  A extends readonly unknown[]
> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly pred: (value: T, ...args: A) => MaybePromise<boolean>,
    readonly args: A,
    readonly invert: boolean
  ) {
    super();

    this.return = (): Promise<void> => closeIters(source);
  }

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const pred = this.pred;
    const args = this.args;
    const invert = this.invert;

    while (done !== (value = await source.fastNext(done))) {
      const cond = await pred(value, ...args);
      if (cond !== invert) return value;
    }

    return AsyncOptLazy.toMaybePromise(otherwise!);
  }
}

export class AsyncCollectIterator<T, R> extends AsyncFastIteratorBase<R> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly collectFun: AsyncCollectFun<T, R>
  ) {
    super();
    this.return = (): Promise<void> => closeIters(source);
  }

  readonly state = TraverseState();

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<R | O> {
    const state = this.state;

    if (state.halted) {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    const { halt } = state;

    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const collectFun = this.collectFun;

    try {
      while (!state.halted && done !== (value = await source.fastNext(done))) {
        const result = await collectFun(
          value,
          state.nextIndex(),
          CollectFun.Skip,
          halt
        );
        if (CollectFun.Skip === result) continue;

        return result as R;
      }

      return AsyncOptLazy.toMaybePromise(otherwise!);
    } finally {
      if (state.halted && done !== value!) {
        await closeIters(this);
      }
    }
  }
}

export class AsyncIndicesWhereIterator<
  T
> extends AsyncFastIteratorBase<number> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly pred: (value: T) => MaybePromise<boolean>
  ) {
    super();
    this.return = (): Promise<void> => closeIters(source);
  }

  index = 0;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<number | O> {
    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const pred = this.pred;

    while (done !== (value = await source.fastNext(done))) {
      const cond = await pred(value);
      if (cond) {
        return this.index++;
      }
      this.index++;
    }

    return AsyncOptLazy.toMaybePromise(otherwise!);
  }
}

export class AsyncIndicesOfIterator<T> extends AsyncFastIteratorBase<number> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly searchValue: T,
    readonly eq: Eq<T>
  ) {
    super();
    this.return = (): Promise<void> => closeIters(source);
  }

  index = 0;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<number | O> {
    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const searchValue = this.searchValue;
    const eq = this.eq;

    while (done !== (value = await source.fastNext(done))) {
      if (eq(searchValue, value)) return this.index++;
      this.index++;
    }

    return AsyncOptLazy.toMaybePromise(otherwise!);
  }
}

export class AsyncTakeWhileIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly pred: (value: T, index: number) => MaybePromise<boolean>
  ) {
    super();
    this.return = (): Promise<void> => closeIters(source);
  }

  isDone = false;
  index = 0;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    if (this.isDone) return AsyncOptLazy.toMaybePromise(otherwise!);

    const done = Symbol('Done');

    const next = await this.source.fastNext(done);

    if (done === next) {
      this.isDone = true;
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    if (await this.pred(next, this.index++)) return next;

    this.isDone = true;
    await closeIters(this);
    return AsyncOptLazy.toMaybePromise(otherwise!);
  }
}

export class AsyncDropWhileIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly pred: (value: T, index: number) => MaybePromise<boolean>
  ) {
    super();
    this.return = (): Promise<void> => closeIters(source);
  }

  pass = false;
  index = 0;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const source = this.source;
    if (this.pass) return source.fastNext(otherwise!);

    const done = Symbol('Done');
    let value: T | typeof done;

    while (done !== (value = await source.fastNext(done))) {
      this.pass = !(await this.pred(value, this.index++));
      if (this.pass) return value;
    }

    return AsyncOptLazy.toMaybePromise(otherwise!);
  }
}

export class AsyncTakeIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(readonly source: AsyncFastIterator<T>, readonly amount: number) {
    super();
    this.return = (): Promise<void> => closeIters(source);
  }

  i = 0;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    if (this.i++ >= this.amount) {
      await closeIters(this);
      this.return = undefined;

      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    return this.source.fastNext(otherwise!);
  }
}

export class AsyncDropIterator<T> extends AsyncFastIteratorBase<T> {
  remain: number;

  constructor(readonly source: AsyncFastIterator<T>, readonly amount: number) {
    super();

    this.return = (): Promise<void> => closeIters(source);

    this.remain = amount;
  }

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const source = this.source;
    if (this.remain <= 0) return source.fastNext(otherwise!);

    const done = Symbol('Done');
    let value: T | typeof done;

    while (done !== (value = await source.fastNext(done))) {
      if (this.remain-- <= 0) {
        return value;
      }
    }

    return AsyncOptLazy.toMaybePromise(otherwise!);
  }
}

export class AsyncRepeatIterator<T> extends AsyncFastIteratorBase<T> {
  iterator: AsyncFastIterator<T>;
  remain?: number;

  constructor(readonly source: AsyncStream<T>, readonly amount?: number) {
    super();

    this.iterator = source[Symbol.asyncIterator]();
    this.return = (): Promise<void> => closeIters(this.iterator);

    this.remain = amount;
  }

  isEmpty = true;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const done = Symbol('Done');

    const iterator = this.iterator;

    let value = await iterator.fastNext(done);

    if (done !== value) {
      this.isEmpty = false;
      return value;
    }

    if (this.isEmpty) {
      return AsyncOptLazy.toMaybePromise(otherwise!) as O;
    }

    if (undefined !== this.remain) {
      this.remain--;

      if (this.remain <= 0) {
        return AsyncOptLazy.toMaybePromise(otherwise!);
      }
    }

    this.iterator = this.source[Symbol.asyncIterator]();

    value = await this.iterator.fastNext(done);

    if (done === value) {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    return value;
  }
}

export class AsyncSplitWhereIterator<T> extends AsyncFastIteratorBase<T[]> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly pred: (value: T, index: number) => MaybePromise<boolean>
  ) {
    super();
    this.return = (): Promise<void> => closeIters(source);
  }

  index = 0;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T[] | O> {
    const startIndex = this.index;

    if (startIndex < 0) {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    const result: T[] = [];

    const source = this.source;
    const done = Symbol('Done');
    let value: T | typeof done;
    const pred = this.pred;

    while (done !== (value = await source.fastNext(done))) {
      if (await pred(value, this.index++)) return result;
      result.push(value);
    }

    this.return = undefined;

    if (startIndex === this.index) {
      this.index = -1;
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    this.index = -1;
    return result;
  }
}

export class AsyncFoldIterator<I, R> extends AsyncFastIteratorBase<R> {
  constructor(
    readonly source: AsyncFastIterator<I>,
    readonly init: AsyncOptLazy<R>,
    readonly getNext: (
      current: R,
      value: I,
      index: number,
      halt: () => void
    ) => MaybePromise<R>
  ) {
    super();

    this.return = (): Promise<void> => closeIters(source);
  }

  current?: R;
  isInitialized = false;

  state = TraverseState();

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<R | O> {
    if (!this.isInitialized) {
      this.current = await AsyncOptLazy.toMaybePromise(this.init);
      this.isInitialized = true;
    }

    const state = this.state;
    if (state.halted) {
      await closeIters(this);
      this.return = undefined;

      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    const done = Symbol('done');
    const value = await this.source.fastNext(done);

    if (done === value) {
      this.return = undefined;
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    this.current = await this.getNext(
      this.current!,
      value,
      state.nextIndex(),
      state.halt
    );

    return this.current;
  }
}

export class AsyncSplitOnIterator<T> extends AsyncFastIteratorBase<T[]> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly sepElem: T,
    readonly eq: Eq<T>
  ) {
    super();
    this.return = (): Promise<void> => closeIters(source);
  }

  isDone = false;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T[] | O> {
    if (this.isDone) {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    const result: T[] = [];

    const source = this.source;
    const done = Symbol('Done');
    let value: T | typeof done;
    let processed = false;
    const eq = this.eq;
    const sepElem = this.sepElem;

    while (done !== (value = await source.fastNext(done))) {
      processed = true;
      if (eq(value, sepElem)) return result;
      result.push(value);
    }

    this.return = undefined;
    this.isDone = true;

    if (!processed) return AsyncOptLazy.toMaybePromise(otherwise!);

    return result;
  }
}

export class AsyncReduceIterator<I, R> extends AsyncFastIteratorBase<R> {
  state: unknown;

  constructor(
    readonly source: AsyncFastIterator<I>,
    readonly reducer: AsyncReducer<I, R>
  ) {
    super();

    this.return = (): Promise<void> => closeIters(source);
  }

  readonly traverseState = TraverseState();
  isInitialized = false;
  isDone = false;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<R | O> {
    if (this.isDone) {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    const done = Symbol('Done');
    const value = await this.source.fastNext(done);

    if (done === value) {
      this.isDone = true;
      this.return = undefined;
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    const reducer = this.reducer;

    if (!this.isInitialized) {
      this.state = await AsyncOptLazy.toMaybePromise(reducer.init);
      this.isInitialized = true;
    }

    const traverseState = this.traverseState;

    try {
      this.state = await reducer.next(
        this.state,
        value,
        traverseState.nextIndex(),
        traverseState.halt
      );
    } catch (err) {
      this.isDone = true;
      await closeIters(this);
      this.return = undefined;
      await reducer.onClose?.(this.state, err);
      throw err;
    }

    if (traverseState.halted) {
      this.isDone = true;
      await closeIters(this);
      this.return = undefined;
      await reducer.onClose?.(this.state);
    }

    return reducer.stateToResult(this.state);
  }
}

export class AsyncReduceAllIterator<I, R> extends AsyncFastIteratorBase<R> {
  state?: unknown[];
  readonly reducersToClose: Set<AsyncReducer<any>>;

  constructor(
    readonly source: AsyncFastIterator<I>,
    readonly reducers: AsyncReducer<I, any>[]
  ) {
    super();

    this.reducersToClose = new Set(reducers);

    this.return = async (): Promise<void> => {
      await closeIters(source);

      const state = this.state;

      if (state) {
        await Promise.all(
          [...this.reducersToClose].map((reducer, index) =>
            reducer.onClose?.(state[index], this.err)
          )
        );
      }
    };
  }

  index = 0;
  isDone = false;
  err: any;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<R | O> {
    const reducers = this.reducers;

    if (undefined === this.state) {
      this.state = await Promise.all(
        reducers.map((d: any): unknown => AsyncOptLazy.toMaybePromise(d.init))
      );
    }

    if (this.isDone) {
      await closeIters(this);
      this.return = undefined;
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    const done = Symbol('Done');
    const value = await this.source.fastNext(done);

    if (done === value) {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    const state = this.state;

    this.state = await Promise.all(
      reducers.map((red, i) => {
        const st = state[i];
        if (!this.reducersToClose.has(red)) return st;

        try {
          return red.next(st, value, this.index, async () => {
            this.reducersToClose.delete(red);
            await red.onClose?.(st);
            return st;
          });
        } catch (e) {
          this.err = e;
        }
      })
    );

    this.index++;

    this.isDone = this.reducersToClose.size === 0 || undefined !== this.err;

    if (this.isDone) {
      await closeIters(this);
      this.return = undefined;
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    return Promise.all(
      this.state.map((s, i) => reducers[i].stateToResult(s))
    ) as any;
  }
}
