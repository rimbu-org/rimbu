import { Token } from '@rimbu/base';
import {
  AsyncOptLazy,
  CollectFun,
  TraverseState,
  type ArrayNonEmpty,
  type AsyncCollectFun,
  type MaybePromise,
} from '@rimbu/common';

import {
  type AsyncTransformer,
  type AsyncFastIterator,
  type AsyncReducer,
  type AsyncStream,
  type AsyncStreamSource,
} from '@rimbu/stream/async';
import {
  closeIters,
  fromAsyncStreamSource,
  type AsyncStreamSourceHelpers,
} from '@rimbu/stream/async-custom';

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

export class AsyncOfFastIterator<T> extends AsyncFastIteratorBase<T> {
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

export class FromResourceFastIterator<T, R> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly open: () => MaybePromise<R>,
    readonly createSource: (resource: R) => MaybePromise<AsyncStreamSource<T>>,
    readonly close: ((resource: R) => MaybePromise<void>) | undefined,
    readonly asyncStreamSourceHelpers: AsyncStreamSourceHelpers
  ) {
    super();

    this.return = async (): Promise<void> => {
      if (close && this.resource) {
        await close(this.resource);
        this.resource = undefined;
      }
      await this.iterator?.return?.();
      (this.return as any) = undefined;
    };
  }

  resource: R | undefined;
  iterator: AsyncFastIterator<T> | undefined;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    if (undefined === this.iterator) {
      const resource = await this.open();
      this.resource = resource;
      const source = await this.createSource(resource);
      this.iterator = this.asyncStreamSourceHelpers
        .fromAsyncStreamSource(source)
        [Symbol.asyncIterator]();
    }

    try {
      return await this.iterator.fastNext(async () => {
        if (undefined !== this.return) {
          await this.return();
        }

        return AsyncOptLazy.toMaybePromise(otherwise!);
      });
    } catch (err) {
      if (undefined !== this.return) {
        await this.return();
      }
      throw err;
    }
  }
}

export class AsyncUnfoldFastIterator<T> extends AsyncFastIteratorBase<T> {
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

export class AsyncZipWithFastIterator<
  I extends readonly unknown[],
  R,
> extends AsyncFastIteratorBase<R> {
  constructor(
    readonly iterables: { [K in keyof I]: AsyncStreamSource<I[K]> },
    readonly zipFun: (...values: I) => MaybePromise<R>,
    readonly asyncStreamSourceHelpers: AsyncStreamSourceHelpers
  ) {
    super();

    this.sources = iterables.map(
      (source): AsyncFastIterator<any> =>
        this.asyncStreamSourceHelpers
          .fromAsyncStreamSource(source)
          [Symbol.asyncIterator]()
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

export class AsyncZipAllWithFastItererator<
  I extends readonly unknown[],
  F,
  R,
> extends AsyncFastIteratorBase<R> {
  constructor(
    readonly fillValue: AsyncOptLazy<F>,
    readonly iters: { [K in keyof I]: AsyncStreamSource<I[K]> },
    readonly zipFun: (
      ...values: { [K in keyof I]: I[K] | F }
    ) => MaybePromise<R>,
    readonly asyncStreamSourceHelpers: AsyncStreamSourceHelpers
  ) {
    super();

    this.sources = iters.map(
      (o): AsyncFastIterator<any> =>
        this.asyncStreamSourceHelpers
          .fromAsyncStreamSource(o)
          [Symbol.asyncIterator]()
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

    if (close !== undefined) {
      this.return = close;
    }
  }

  return?: () => MaybePromise<any>;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const result = this.iterator.next();

    if (result.done) {
      await closeIters(this);
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }
    return result.value;
  }
}

export class FromPromise<T> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly promise: () => Promise<AsyncStreamSource<T>>,
    readonly asyncStreamSourceHelpers: AsyncStreamSourceHelpers,
    close?: () => MaybePromise<void>
  ) {
    super();
    this.return = async (): Promise<void> => {
      if (close) {
        await close();
      }
      if (this.iterator) {
        await this.iterator.return?.();
      }
    };
  }

  iterator: AsyncFastIterator<T> | undefined;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    if (this.iterator === undefined) {
      const source = await this.promise();
      this.iterator = this.asyncStreamSourceHelpers
        .fromAsyncStreamSource(source)
        [Symbol.asyncIterator]();
    }

    return this.iterator.fastNext(otherwise!);
  }
}

export class AsyncPrependFastIterator<T> extends AsyncFastIteratorBase<T> {
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

export class AsyncAppendFastIterator<T> extends AsyncFastIteratorBase<T> {
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

export class AsyncIndexedFastIterator<T> extends AsyncFastIteratorBase<
  [number, T]
> {
  index: number;

  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly startIndex = 0
  ) {
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

export class AsyncMapFastIterator<T, T2> extends AsyncFastIteratorBase<T2> {
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

export class AsyncMapPureFastIterator<
  T,
  A extends readonly unknown[],
  T2,
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

export class AsyncConcatFastIterator<T> extends AsyncFastIteratorBase<T> {
  iterator: AsyncFastIterator<T>;

  constructor(
    readonly source: AsyncStream<T>,
    readonly otherSources: AsyncStreamSource<T>[],
    readonly asyncStreamSourceHelpers: AsyncStreamSourceHelpers
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
    const { asyncStreamSourceHelpers } = this;

    while (done === (value = await this.iterator.fastNext(done))) {
      if (this.sourceIndex >= length) {
        return AsyncOptLazy.toMaybePromise(otherwise!);
      }

      let nextSource: AsyncStreamSource<T> =
        this.otherSources[this.sourceIndex++];

      while (
        asyncStreamSourceHelpers.isEmptyAsyncStreamSourceInstance(nextSource)
      ) {
        if (this.sourceIndex >= length) {
          return AsyncOptLazy.toMaybePromise(otherwise!);
        }
        nextSource = this.otherSources[this.sourceIndex++];
      }

      this.iterator = asyncStreamSourceHelpers
        .fromAsyncStreamSource(nextSource)
        [Symbol.asyncIterator]();
    }

    return value;
  }
}

export class AsyncFilterFastIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly pred: (
      value: T,
      index: number,
      halt: () => void
    ) => MaybePromise<boolean>,
    readonly negate: boolean
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

    const negate = this.negate;

    while (!state.halted && done !== (value = await source.fastNext(done))) {
      const cond = await pred(value, state.nextIndex(), halt);
      if (cond !== negate) return value;
    }

    if (state.halted && done !== value!) {
      await closeIters(this);
    }

    return AsyncOptLazy.toMaybePromise(otherwise!);
  }
}

export class AsyncFilterPureFastIterator<
  T,
  A extends readonly unknown[],
> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly pred: (value: T, ...args: A) => MaybePromise<boolean>,
    readonly args: A,
    readonly negate: boolean
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
    const negate = this.negate;

    while (done !== (value = await source.fastNext(done))) {
      const cond = await pred(value, ...args);
      if (cond !== negate) return value;
    }

    return AsyncOptLazy.toMaybePromise(otherwise!);
  }
}

export class AsyncCollectFastIterator<T, R> extends AsyncFastIteratorBase<R> {
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

export class AsyncDropWhileFastIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly pred: (value: T, index: number) => MaybePromise<boolean>,
    readonly negate: boolean
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
    const negate = this.negate;

    while (done !== (value = await source.fastNext(done))) {
      this.pass = (await this.pred(value, this.index++)) === negate;
      if (this.pass) return value;
    }

    return AsyncOptLazy.toMaybePromise(otherwise!);
  }
}

export class AsyncTakeFastIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly amount: number
  ) {
    super();
    this.return = (): Promise<void> => closeIters(source);
  }

  i = 0;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    if (this.i++ >= this.amount) {
      await closeIters(this);

      (this.return as any) = undefined;

      return AsyncOptLazy.toMaybePromise(otherwise!);
    }

    return this.source.fastNext(otherwise!);
  }
}

export class AsyncDropFastIterator<T> extends AsyncFastIteratorBase<T> {
  remain: number;

  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly amount: number
  ) {
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

export class AsyncRepeatFastIterator<T> extends AsyncFastIteratorBase<T> {
  iterator: AsyncFastIterator<T>;
  remain: number | undefined;

  constructor(
    readonly source: AsyncStream<T>,
    readonly amount?: number
  ) {
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

export class AsyncReduceFastIterator<I, R> extends AsyncFastIteratorBase<R> {
  constructor(
    readonly sourceIterator: AsyncFastIterator<I>,
    readonly reducer: AsyncReducer<I, R>
  ) {
    super();
  }

  #reducerState: any;
  #halted = false;
  #index = -1;

  return = async (): Promise<any> => {
    if (this.#index >= 0 && !this.#halted) {
      await Promise.all([
        closeIters(this.sourceIterator),
        this.reducer.onClose?.(this.#reducerState),
      ]);
    } else {
      await closeIters(this.sourceIterator);
    }
  };

  #halt = (): void => {
    this.#halted = true;
    this.#reducerState = undefined;
  };

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<R | O> {
    try {
      if (this.#index < 0) {
        this.#reducerState = await this.reducer.init(this.#halt);
        this.#index = 0;
      }

      if (this.#halted) {
        return (await AsyncOptLazy.toMaybePromise(otherwise)) as O;
      }

      const done = Symbol('Done');
      const nextInput = await this.sourceIterator.fastNext(done);

      if (done === nextInput) {
        this.#halt();

        return (await AsyncOptLazy.toMaybePromise(otherwise)) as O;
      }

      const index = this.#index++;

      this.#reducerState = await this.reducer.next(
        this.#reducerState,
        nextInput,
        index,
        this.#halt
      );

      return await this.reducer.stateToResult(
        this.#reducerState,
        index,
        this.#halted
      );
    } finally {
      if (this.#halted) {
        this.return?.();
        (this.return as any) = undefined;
      }
    }
  }
}

export class AsyncTransformerFastIterator<
  T,
  R,
> extends AsyncFastIteratorBase<R> {
  constructor(
    readonly sourceIterator: AsyncFastIterator<T>,
    readonly transformer: AsyncTransformer.Accept<T, R>
  ) {
    super();
  }

  #halted = false;
  #index = -1;
  #transformerState: any;
  #currentValues: AsyncFastIterator<R> | undefined;

  #halt = (): void => {
    this.#halted = true;
  };

  return = async (): Promise<any> => {
    if (this.#index >= 0 && !this.#halted) {
      await Promise.all([
        closeIters(this.sourceIterator),
        'onClose' in this.transformer
          ? this.transformer.onClose?.(this.#transformerState)
          : undefined,
      ]);
    } else {
      await closeIters(this.sourceIterator);
    }
  };

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<R | O> {
    try {
      if (this.#index < 0) {
        this.#transformerState = await this.transformer.init(this.#halt);
        this.#index = 0;
        this.#currentValues = undefined;
      }

      if (this.#halted) {
        return AsyncOptLazy.toPromise(otherwise!) as O;
      }

      const done = Symbol('done');
      let nextValue: R | typeof done;

      while (
        undefined === this.#currentValues ||
        done === (nextValue = await this.#currentValues.fastNext(done))
      ) {
        if (this.#halted) {
          return AsyncOptLazy.toPromise(otherwise!) as O;
        }

        const nextSource = await this.sourceIterator.fastNext(done);

        if (done === nextSource) {
          if (this.#halted) {
            return AsyncOptLazy.toPromise(otherwise!) as O;
          }
          this.#halt();
          (this.return as any) = undefined;
        } else {
          this.#transformerState = await this.transformer.next(
            this.#transformerState,
            nextSource,
            this.#index++,
            this.#halt
          );
        }

        const nextValuesSource = await this.transformer.stateToResult(
          this.#transformerState,
          this.#index,
          this.#halted
        );
        this.#currentValues =
          fromAsyncStreamSource(nextValuesSource)[Symbol.asyncIterator]();
      }

      return nextValue;
    } finally {
      if (this.#halted) {
        this.return?.();
        (this.return as any) = undefined;
      }
    }
  }
}
