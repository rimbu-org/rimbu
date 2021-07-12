import {
  ArrayNonEmpty,
  CollectFun,
  Eq,
  Reducer,
  ToJSON,
  TraverseState,
} from '@rimbu/common';
import {
  AsyncFastIterator,
  AsyncOptLazy,
  AsyncStream,
  AsyncStreamSource,
  MaybePromise,
} from '../internal';

export abstract class AsyncFastIteratorBase<T> implements AsyncFastIterator<T> {
  abstract fastNext<O>(otherwise?: AsyncOptLazy<O>): MaybePromise<T | O>;

  async next(): Promise<IteratorResult<T>> {
    const done = Symbol('Done');
    const value = await this.fastNext(done);
    if (done === value) return AsyncFastIterator.fixedDone;
    return { value, done: false };
  }
}

export abstract class AsyncStreamBase<T> implements AsyncStream<T> {
  abstract [Symbol.asyncIterator](): AsyncFastIterator<T>;

  asyncStream(): this {
    return this;
  }

  async equals(
    other: AsyncStreamSource<T>,
    eq: Eq<T> = Eq.objectIs
  ): Promise<boolean> {
    const it1 = this[Symbol.asyncIterator]();
    const it2 = AsyncStream.from(other)[Symbol.asyncIterator]();

    const done = Symbol('Done');

    while (true) {
      const [v1, v2] = await Promise.all([
        it1.fastNext(done),
        it2.fastNext(done),
      ] as const);
      if (done === v1 || done === v2) return Object.is(v1, v2);
      if (!eq(v1, v2)) return false;
    }
  }

  assumeNonEmpty(): AsyncStream.NonEmpty<T> {
    return this as unknown as AsyncStream.NonEmpty<T>;
  }

  asNormal(): AsyncStream<T> {
    return this;
  }

  prepend<T2 = T>(value: AsyncOptLazy<T>): AsyncStream.NonEmpty<T | T2> {
    return new AsyncPrependStream<T | T2>(this, value) as any;
  }

  append<T2 = T>(value: AsyncOptLazy<T2>): AsyncStream.NonEmpty<T | T2> {
    return new AsyncAppendStream<T | T2>(this, value) as any;
  }

  async forEach(
    f: (value: T, index: number, halt: () => void) => MaybePromise<void>,
    state = TraverseState()
  ): Promise<void> {
    if (state.halted) return;

    const done = Symbol('Done');
    let value: T | typeof done;
    const iterator = this[Symbol.asyncIterator]();

    const { halt } = state;

    while (!state.halted && done !== (value = await iterator.fastNext(done))) {
      await f(value, state.nextIndex(), halt);
    }
  }

  async forEachPure<A extends readonly unknown[]>(
    f: (value: T, ...args: A) => MaybePromise<void>,
    ...args: A
  ): Promise<void> {
    const done = Symbol('Done');
    let value: T | typeof done;
    const iterator = this[Symbol.asyncIterator]();

    while (done !== (value = await iterator.fastNext(done))) {
      await f(value, ...args);
    }
  }

  indexed(startIndex = 0): AsyncStream<[number, T]> {
    return new AsyncIndexedStream(this, startIndex);
  }

  map<T2>(
    mapFun: (value: T, index: number) => MaybePromise<T2>
  ): AsyncStream<T2> {
    return new AsyncMapStream(this, mapFun);
  }

  mapPure<T2, A extends readonly unknown[]>(
    mapFun: (value: T, ...args: A) => MaybePromise<T2>,
    ...args: A
  ): AsyncStream<T2> {
    return new AsyncMapPureStream(this, mapFun, args);
  }

  flatMap<T2>(
    flatMapFun: (
      value: T,
      index: number,
      halt: () => void
    ) => AsyncStreamSource<T2>
  ): AsyncStream<T2> {
    return new AsyncFlatMapStream(this, flatMapFun);
  }

  filter(
    pred: (value: T, index: number, halt: () => void) => MaybePromise<boolean>
  ): AsyncStream<T> {
    return new AsyncFilterStream(this, pred);
  }

  filterNot(
    pred: (value: T, index: number, halt: () => void) => MaybePromise<boolean>
  ): AsyncStream<T> {
    return new AsyncFilterStream(this, pred, true);
  }
  filterPure<A extends readonly unknown[]>(
    pred: (value: T, ...args: A) => MaybePromise<boolean>,
    ...args: A
  ): AsyncStream<T> {
    throw new Error('Method not implemented.');
  }
  filterNotPure<A extends readonly unknown[]>(
    pred: (value: T, ...args: A) => MaybePromise<boolean>,
    ...args: A
  ): AsyncStream<T> {
    throw new Error('Method not implemented.');
  }
  collect<R>(collectFun: CollectFun<T, R>): AsyncStream<R> {
    throw new Error('Method not implemented.');
  }
  first<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    throw new Error('Method not implemented.');
  }
  last<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    throw new Error('Method not implemented.');
  }
  count(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  countElement(value: T, eq?: Eq<T>): Promise<number> {
    throw new Error('Method not implemented.');
  }
  countNotElement(value: T, eq?: Eq<T>): Promise<number> {
    throw new Error('Method not implemented.');
  }
  find<O>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    occurrance?: number,
    otherwise?: AsyncOptLazy<O>
  ): Promise<T | O> {
    throw new Error('Method not implemented.');
  }
  elementAt<O>(index: number, otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    throw new Error('Method not implemented.');
  }
  indicesWhere(pred: (value: T) => MaybePromise<boolean>): AsyncStream<number> {
    throw new Error('Method not implemented.');
  }
  indicesOf(searchValue: T, eq?: Eq<T>): AsyncStream<number> {
    throw new Error('Method not implemented.');
  }
  indexWhere(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    occurrance?: number
  ): Promise<number | undefined> {
    throw new Error('Method not implemented.');
  }
  indexOf(
    searchValue: T,
    occurrance?: number,
    eq?: Eq<T>
  ): Promise<number | undefined> {
    throw new Error('Method not implemented.');
  }
  some(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  every(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  contains(value: T, amount?: number, eq?: Eq<T>): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  takeWhile(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): AsyncStream<T> {
    throw new Error('Method not implemented.');
  }
  dropWhile(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): AsyncStream<T> {
    throw new Error('Method not implemented.');
  }
  take(amount: number): AsyncStream<T> {
    throw new Error('Method not implemented.');
  }
  drop(amount: number): AsyncStream<T> {
    throw new Error('Method not implemented.');
  }
  repeat(amount?: number): AsyncStream<T> {
    throw new Error('Method not implemented.');
  }
  concat<T2 extends T>(...others: ArrayNonEmpty<AsyncStreamSource<T2>>): any {
    return new AsyncConcatStream(this, others);
  }
  min<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    throw new Error('Method not implemented.');
  }
  minBy<O>(
    compare: (v1: T, v2: T) => MaybePromise<number>,
    otherwise?: AsyncOptLazy<O>
  ): Promise<T | O> {
    throw new Error('Method not implemented.');
  }
  max<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    throw new Error('Method not implemented.');
  }
  maxBy<O>(
    compare: (v1: T, v2: T) => MaybePromise<number>,
    otherwise?: AsyncOptLazy<O>
  ): Promise<T | O> {
    throw new Error('Method not implemented.');
  }
  intersperse<T2>(sep: AsyncStreamSource<T2>): AsyncStream<T | T2> {
    throw new Error('Method not implemented.');
  }
  join(options?: {
    sep?: string | undefined;
    start?: string | undefined;
    end?: string | undefined;
    valueToString?: ((value: T) => MaybePromise<string>) | undefined;
  }): Promise<string> {
    throw new Error('Method not implemented.');
  }
  mkGroup<T2>(options: {
    sep?: AsyncStreamSource<T2> | undefined;
    start?: AsyncStreamSource<T2>;
    end?: AsyncStreamSource<T2> | undefined;
  }): AsyncStream.NonEmpty<T | T2> {
    throw new Error('Method not implemented.');
  }
  splitWhere(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): AsyncStream<T[]> {
    throw new Error('Method not implemented.');
  }
  splitOn(sepElem: T, eq?: Eq<T>): AsyncStream<T[]> {
    throw new Error('Method not implemented.');
  }
  fold<R>(
    init: AsyncOptLazy<R>,
    next: (
      current: R,
      value: T,
      index: number,
      halt: () => void
    ) => MaybePromise<R>
  ): Promise<R> {
    throw new Error('Method not implemented.');
  }
  foldStream<R>(
    init: AsyncOptLazy<R>,
    next: (
      current: R,
      value: T,
      index: number,
      halt: () => void
    ) => MaybePromise<R>
  ): AsyncStream<R> {
    throw new Error('Method not implemented.');
  }
  reduce<R>(reducer: Reducer<T, R>): Promise<R> {
    throw new Error('Method not implemented.');
  }
  reduceStream<R>(reducer: Reducer<T, R>): AsyncStream<R> {
    throw new Error('Method not implemented.');
  }
  reduceAll<R extends [unknown, unknown, ...unknown[]]>(
    ...reducers: { [K in keyof R]: Reducer<T, R[K]> }
  ): Promise<R> {
    throw new Error('Method not implemented.');
  }
  reduceAllStream<R extends [unknown, unknown, ...unknown[]]>(
    ...reducers: { [K in keyof R]: Reducer<T, R[K]> }
  ): AsyncStream<R> {
    throw new Error('Method not implemented.');
  }
  async toArray(): Promise<T[]> {
    const iterator = this[Symbol.asyncIterator]();
    const result: T[] = [];
    const done = Symbol('Done');
    let value: T | typeof done;

    while (done !== (value = await iterator.fastNext(done))) {
      result.push(value);
    }

    return result;
  }
  toString(): string {
    throw new Error('Method not implemented.');
  }
  async toJSON(): Promise<ToJSON<T[], 'AsyncStream'>> {
    return {
      dataType: 'AsyncStream',
      value: [],
    };
  }
  flatten<T2 extends T = T>(): T2 extends AsyncStreamSource.NonEmpty<infer S>
    ? AsyncStream<S>
    : T2 extends AsyncStreamSource<infer S>
    ? AsyncStream<S>
    : never {
    throw new Error('Method not implemented.');
  }
  zipWith(): any {
    throw new Error('Method not implemented.');
  }
  zip(): any {
    throw new Error('Method not implemented.');
  }
  zipAllWith(): any {
    throw new Error('Method not implemented.');
  }
  zipAll(): any {
    throw new Error('Method not implemented.');
  }
  unzip(): any {
    throw new Error('Method not implemented.');
  }
  //   zipWith<I extends readonly [unknown, ...unknown[]], R>(zipFun: (value: T, ...values: I) => R, ...iters: { [K in keyof I]: AsyncStreamSource<I[K]>; }) => AsyncStream<R> {

  //   }
  //   zip <I extends readonly [unknown, ...unknown[]]>(...iters: { [K in keyof I]: AsyncStreamSource<I[K]>; }) => AsyncStream<[T, ...I]> {

  //   }
  //   zipAllWith: { <I extends readonly [unknown, ...unknown[]], O, R>(fillValue: AsyncOptLazy<O>, zipFun: (value: T | O, ...values: { [K in keyof I]: O | I[K]; }) => R, ...streams: { [K in keyof I]: StreamSource.NonEmpty<I[K]>; }): AsyncStream.NonEmpty<...>; <I extends readonly [...], O, R>(fillValue: OptLazy<...>, zipFun: (value: T | O, ...values: { [K in keyof I]: O | I[K]; }) => R, ...streams: { [K in keyof I]: StreamSource<...>; }): AsyncStream<...>; } = null as any;
  //   zipAll: { <I extends readonly [unknown, ...unknown[]], O>(fillValue: AsyncOptLazy<O>, ...streams: { [K in keyof I]: AsyncStreamSource.NonEmpty<I[K]>; }): AsyncStream.NonEmpty<[T | O, ...{ [K in keyof I]: O | I[K]; }]>; <I extends readonly [...], O>(fillValue: AsyncOptLazy<...>, ...streams: { [K in keyof I]: AsyncStreamSource<...>; }): AsyncStream<...>; };
  //   unzip<L extends number, T2 extends T = T>(length: L): T2 extends readonly [unknown, ...unknown[]] & { length: L; } ? { [K in keyof T2]: AsyncStream<T2[K]>; } : never {
  //       throw new Error('Method not implemented.');
  //   }
}

class AsyncPrependStream<T> extends AsyncStreamBase<T> {
  constructor(readonly source: AsyncStream<T>, readonly item: AsyncOptLazy<T>) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncPrependIterator(
      this.source[Symbol.asyncIterator](),
      this.item
    );
  }

  async first(): Promise<T> {
    return AsyncOptLazy.toMaybePromise(this.item);
  }

  async last(): Promise<T> {
    return this.source.last(this.item);
  }

  async count(): Promise<number> {
    return (await this.source.count()) + 1;
  }
}

class AsyncPrependIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly item: AsyncOptLazy<T>
  ) {
    super();
  }

  prependDone = false;

  fastNext<O>(otherwise?: AsyncOptLazy<O>): MaybePromise<T | O> {
    if (this.prependDone) return this.source.fastNext(otherwise!);
    this.prependDone = true;
    return AsyncOptLazy.toMaybePromise(this.item);
  }
}

class AsyncAppendStream<T> extends AsyncStreamBase<T> {
  constructor(readonly source: AsyncStream<T>, readonly item: AsyncOptLazy<T>) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncAppendIterator(
      this.source[Symbol.asyncIterator](),
      this.item
    );
  }

  first(): Promise<T> {
    return this.source.first(this.item);
  }

  async last(): Promise<T> {
    return AsyncOptLazy.toMaybePromise(this.item);
  }

  async count(): Promise<number> {
    return (await this.source.count()) + 1;
  }
}

class AsyncAppendIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly item: AsyncOptLazy<T>
  ) {
    super();
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

class AsyncIndexedStream<T> extends AsyncStreamBase<[number, T]> {
  constructor(readonly source: AsyncStream<T>, readonly startIndex: number) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<[number, T]> {
    return new AsyncIndexedIterator<T>(
      this.source[Symbol.asyncIterator](),
      this.startIndex
    );
  }

  count(): Promise<number> {
    return this.source.count();
  }
}

class AsyncIndexedIterator<T> extends AsyncFastIteratorBase<[number, T]> {
  index: number;

  constructor(readonly source: AsyncFastIterator<T>, readonly startIndex = 0) {
    super();
    this.index = startIndex;
  }

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<[number, T] | O> {
    const done = Symbol('Done');
    const value = await this.source.fastNext(done);

    if (done === value) return AsyncOptLazy.toMaybePromise(otherwise!);

    return [this.index++, value];
  }
}

class AsyncMapStream<T, T2> extends AsyncStreamBase<T2> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly mapFun: (value: T, index: number) => MaybePromise<T2>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T2> {
    return new AsyncMapIterator(
      this.source[Symbol.asyncIterator](),
      this.mapFun
    );
  }

  async first<O>(otherwise?: AsyncOptLazy<O>): Promise<T2 | O> {
    const done = Symbol('Done');
    const value = await this.source.first(done);
    if (done === value) return AsyncOptLazy.toMaybePromise(otherwise!);
    return this.mapFun(value, 0);
  }

  async last<O>(otherwise?: AsyncOptLazy<O>): Promise<T2 | O> {
    const done = Symbol('Done');
    const value = await this.source.last(done);
    if (done === value) return AsyncOptLazy.toMaybePromise(otherwise!);
    return this.mapFun(value, 0);
  }

  async count(): Promise<number> {
    return this.source.count();
  }

  async elementAt<O>(
    index: number,
    otherwise?: AsyncOptLazy<O>
  ): Promise<T2 | O> {
    const done = Symbol('Done');
    const value = await this.source.elementAt(index, done);
    if (done === value) return AsyncOptLazy.toMaybePromise(otherwise!);
    return this.mapFun(value, index);
  }

  map<T3>(
    mapFun: (value: T2, index: number) => MaybePromise<T3>
  ): AsyncStream<T3> {
    return new AsyncMapStream(this.source, async (value, index) =>
      mapFun(await this.mapFun(value, index), index)
    );
  }
}

class AsyncMapIterator<T, T2> extends AsyncFastIteratorBase<T2> {
  constructor(
    readonly source: AsyncFastIterator<T>,
    readonly mapFun: (value: T, index: number) => MaybePromise<T2>
  ) {
    super();
  }

  readonly state = TraverseState();

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T2 | O> {
    const state = this.state;

    if (state.halted) return AsyncOptLazy.toMaybePromise(otherwise!);

    const done = Symbol('Done');
    const next = await this.source.fastNext(done);

    if (done === next) return AsyncOptLazy.toMaybePromise(otherwise!);

    return this.mapFun(next, state.nextIndex());
  }
}

class AsyncMapPureStream<
  T,
  A extends readonly unknown[],
  T2
> extends AsyncStreamBase<T2> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly mapFun: (value: T, ...args: A) => MaybePromise<T2>,
    readonly args: A
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T2> {
    return new AsyncMapPureIterator(
      this.source[Symbol.asyncIterator](),
      this.mapFun,
      this.args
    );
  }

  async first<O>(otherwise?: AsyncOptLazy<O>): Promise<T2 | O> {
    const done = Symbol('Done');
    const value = await this.source.first(done);
    if (done === value) return AsyncOptLazy.toMaybePromise(otherwise!);
    return this.mapFun(value, ...this.args);
  }

  async last<O>(otherwise?: AsyncOptLazy<O>): Promise<T2 | O> {
    const done = Symbol('Done');
    const value = await this.source.last(done);
    if (done === value) return AsyncOptLazy.toMaybePromise(otherwise!);
    return this.mapFun(value, ...this.args);
  }

  async count(): Promise<number> {
    return this.source.count();
  }

  async elementAt<O>(
    index: number,
    otherwise?: AsyncOptLazy<O>
  ): Promise<T2 | O> {
    const done = Symbol('Done');
    const value = await this.source.elementAt(index, done);
    if (done === value) return AsyncOptLazy.toMaybePromise(otherwise!);
    return this.mapFun(value, ...this.args);
  }
}

class AsyncMapPureIterator<
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
  }

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T2 | O> {
    const done = Symbol('Done');
    const next = await this.source.fastNext(done);

    if (done === next) return AsyncOptLazy.toMaybePromise(otherwise!);

    return this.mapFun(next, ...this.args);
  }
}

class AsyncFlatMapStream<T, T2> extends AsyncStreamBase<T2> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly flatmapFun: (
      value: T,
      index: number,
      halt: () => void
    ) => AsyncStreamSource<T2>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T2> {
    return new AsyncFlatMapIterator<T, T2>(this.source, this.flatmapFun);
  }
}

class AsyncFlatMapIterator<T, T2> extends AsyncFastIteratorBase<T2> {
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
  }

  readonly state = TraverseState();

  done = false;
  currentIterator: null | AsyncFastIterator<T2> = null;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T2 | O> {
    const state = this.state;

    if (state.halted || this.done)
      return AsyncOptLazy.toMaybePromise(otherwise!);

    const done = Symbol('Done');

    let nextValue: T2 | typeof done = done;

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

      this.currentIterator =
        AsyncStream.from(nextSource)[Symbol.asyncIterator]();
    }

    return nextValue;
  }
}

class AsyncConcatIterator<T> extends AsyncFastIteratorBase<T> {
  iterator: AsyncFastIterator<T>;

  constructor(
    readonly source: AsyncStream<T>,
    readonly otherSources: AsyncStreamSource<T>[]
  ) {
    super();

    this.iterator = source[Symbol.asyncIterator]();
  }

  sourceIndex = 0;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>) {
    const done = Symbol('Done');
    let value: T | typeof done;
    const length = this.otherSources.length;

    while (done === (value = await this.iterator.fastNext(done))) {
      if (this.sourceIndex >= length)
        return AsyncOptLazy.toMaybePromise(otherwise!);

      let nextSource: AsyncStreamSource<T> =
        this.otherSources[this.sourceIndex++];

      while (AsyncStreamSource.isEmptyInstance(nextSource)) {
        if (this.sourceIndex >= length) {
          return AsyncOptLazy.toMaybePromise(otherwise!);
        }
        nextSource = this.otherSources[this.sourceIndex++];
      }

      this.iterator = AsyncStream.from(nextSource)[Symbol.asyncIterator]();
    }

    return value;
  }
}

class AsyncConcatStream<T> extends AsyncStreamBase<T> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly others: AsyncStreamSource<T>[]
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncConcatIterator(this.source, this.others);
  }
}

class AsyncFilterIterator<T> extends AsyncFastIteratorBase<T> {
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
  }

  readonly state = TraverseState();

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const state = this.state;
    if (state.halted) return AsyncOptLazy.toMaybePromise(otherwise!);

    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const pred = this.pred;
    const halt = state.halt;

    if (this.invert) {
      while (!state.halted && done !== (value = await source.fastNext(done))) {
        const cond = await pred(value, state.nextIndex(), halt);
        if (!cond) return value;
      }
    } else {
      while (!state.halted && done !== (value = await source.fastNext(done))) {
        const cond = await pred(value, state.nextIndex(), halt);
        if (cond) return value;
      }
    }

    return AsyncOptLazy.toMaybePromise(otherwise!);
  }
}

class AsyncFilterStream<T> extends AsyncStreamBase<T> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly pred: (
      value: T,
      index: number,
      halt: () => void
    ) => MaybePromise<boolean>,
    readonly invert = false
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncFilterIterator(
      this.source[Symbol.asyncIterator](),
      this.pred,
      this.invert
    );
  }

  filter(
    pred: (value: T, index: number, halt: () => void) => MaybePromise<boolean>
  ): AsyncStream<T> {
    return new AsyncFilterStream(
      this.source,
      async (v, i, halt) =>
        (await this.pred(v, i, halt)) && (await pred(v, i, halt))
    );
  }
}
