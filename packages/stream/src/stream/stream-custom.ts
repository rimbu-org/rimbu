import {
  ArrayNonEmpty,
  CollectFun,
  Comp,
  Eq,
  OptLazy,
  Reducer,
  ToJSON,
  TraverseState,
} from '@rimbu/common';
import { FastIterator, Stream, StreamSource } from '../internal';

/**
 * A base class for `FastIterator` instances, that takes implements the default `next`
 * function based on the abstract `fastNext` function.
 */
export abstract class FastIteratorBase<T> implements FastIterator<T> {
  abstract fastNext<O>(otherwise?: OptLazy<O>): T | O;

  next(): IteratorResult<T> {
    const done = Symbol('Done');
    const value = this.fastNext(done);
    if (done === value) return FastIterator.fixedDone;
    return { value, done: false };
  }
}

export abstract class StreamBase<T> implements Stream<T> {
  abstract [Symbol.iterator](): FastIterator<T>;

  stream(): this {
    return this;
  }

  equals(other: StreamSource<T>, eq: Eq<T> = Eq.objectIs): boolean {
    const it1 = this[Symbol.iterator]();
    const it2 = Stream.from(other)[Symbol.iterator]();

    const done = Symbol('Done');
    while (true) {
      const v1 = it1.fastNext(done);
      const v2 = it2.fastNext(done);
      if (done === v1 || done === v2) return Object.is(v1, v2);
      if (!eq(v1, v2)) return false;
    }
  }

  assumeNonEmpty(): Stream.NonEmpty<T> {
    return this as unknown as Stream.NonEmpty<T>;
  }

  asNormal(): Stream<T> {
    return this;
  }

  prepend<T2>(value: OptLazy<T>): Stream.NonEmpty<T | T2> {
    return new PrependStream<T | T2>(this, value) as any;
  }

  append<T2>(value: OptLazy<T2>): Stream.NonEmpty<T | T2> {
    return new AppendStream<T | T2>(this, value) as any;
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state = TraverseState()
  ): void {
    if (state.halted) return;

    const done = Symbol('Done');
    let value: T | typeof done;
    const iterator = this[Symbol.iterator]();

    const { halt } = state;

    while (!state.halted && done !== (value = iterator.fastNext(done))) {
      f(value, state.nextIndex(), halt);
    }
  }

  forEachPure<A extends readonly unknown[]>(
    f: (value: T, ...args: A) => void,
    ...args: A
  ): void {
    const done = Symbol('Done');
    let value: T | typeof done;
    const iterator = this[Symbol.iterator]();

    while (done !== (value = iterator.fastNext(done))) {
      f(value, ...args);
    }
  }

  indexed(startIndex = 0): Stream<[number, T]> {
    return new IndexedStream(this, startIndex);
  }

  map<T2>(mapFun: (value: T, index: number) => T2): Stream<T2> {
    return new MapStream(this, mapFun);
  }

  mapPure<T2, A extends readonly unknown[]>(
    mapFun: (value: T, ...args: A) => T2,
    ...args: A
  ): Stream<T2> {
    return new MapPureStream(this, mapFun, args);
  }

  flatMap<T2>(
    flatMapFun: (value: T, index: number, halt: () => void) => StreamSource<T2>
  ): Stream<T2> {
    return new FlatMapStream(this, flatMapFun);
  }

  filter(
    pred: (value: T, index: number, halt: () => void) => boolean
  ): Stream<T> {
    return new FilterStream(this, pred);
  }

  filterNot(
    pred: (value: T, index: number, halt: () => void) => boolean
  ): Stream<T> {
    return new FilterStream(this, pred, true);
  }

  filterPure<A extends readonly unknown[]>(
    pred: (value: T, ...args: A) => boolean,
    ...args: A
  ): Stream<T> {
    return new FilterPureStream(this, pred, args);
  }

  filterNotPure<A extends readonly unknown[]>(
    pred: (value: T, ...args: A) => boolean,
    ...args: A
  ): Stream<T> {
    return new FilterPureStream(this, pred, args, true);
  }

  collect<R>(collectFun: CollectFun<T, R>): Stream<R> {
    return new CollectStream(this, collectFun);
  }

  first<O>(otherwise?: OptLazy<O>): T | O {
    return this[Symbol.iterator]().fastNext(otherwise!);
  }

  last<O>(otherwise?: OptLazy<O>): T | O {
    const done = Symbol('Done');
    let value: T | typeof done;
    let lastValue: T | typeof done = done;
    const iterator = this[Symbol.iterator]();

    while (done !== (value = iterator.fastNext(done))) {
      lastValue = value;
    }

    if (done === lastValue) return OptLazy(otherwise) as O;
    return lastValue;
  }

  count(): number {
    let result = 0;

    const done = Symbol('Done');
    const iterator = this[Symbol.iterator]();

    while (done !== iterator.fastNext(done)) result++;

    return result;
  }

  countElement(value: T, eq: Eq<T> = Eq.objectIs): number {
    let result = 0;

    const done = Symbol('Done');
    const iterator = this[Symbol.iterator]();
    let current: T | typeof done;

    while (done !== (current = iterator.fastNext(done))) {
      if (eq(value, current)) result++;
    }

    return result;
  }

  countNotElement(value: T, eq: Eq<T> = Eq.objectIs): number {
    let result = 0;

    const done = Symbol('Done');
    const iterator = this[Symbol.iterator]();
    let current: T | typeof done;

    while (done !== (current = iterator.fastNext(done))) {
      if (!eq(value, current)) result++;
    }

    return result;
  }

  find<O>(
    pred: (value: T, index: number) => boolean,
    occurrance = 1,
    otherwise?: OptLazy<O>
  ): T | O {
    if (occurrance <= 0) return OptLazy(otherwise) as O;

    const done = Symbol('Done');
    const iterator = this[Symbol.iterator]();
    let value: T | typeof done;
    let remain = occurrance;
    let index = 0;

    while (done !== (value = iterator.fastNext(done))) {
      if (pred(value, index++) && --remain <= 0) return value;
    }

    return OptLazy(otherwise) as O;
  }

  elementAt<O>(index: number, otherwise?: OptLazy<O>): T | O {
    if (index < 0) return OptLazy(otherwise) as O;

    const done = Symbol('Done');
    const iterator = this[Symbol.iterator]();
    let value: T | typeof done;
    let i = 0;

    while (done !== (value = iterator.fastNext(done))) {
      if (i === index) return value;
      if (i > index) return OptLazy(otherwise) as O;
      i++;
    }

    return OptLazy(otherwise) as O;
  }

  indicesWhere(pred: (value: T) => boolean): Stream<number> {
    return new IndicesWhereStream(this, pred);
  }

  indicesOf(searchValue: T, eq: Eq<T> = Eq.objectIs): Stream<number> {
    return new IndicesOfStream(this, searchValue, eq);
  }

  indexWhere(
    pred: (value: T, index: number) => boolean,
    occurrance = 1
  ): number | undefined {
    if (occurrance <= 0) return undefined;

    const done = Symbol('Done');
    let value: T | typeof done;
    const iterator = this[Symbol.iterator]();
    let index = 0;
    let occ = 0;

    while (done !== (value = iterator.fastNext(done))) {
      const i = index++;

      if (pred(value, i)) {
        occ++;
        if (occ >= occurrance) return i;
      }
    }

    return undefined;
  }

  indexOf(
    searchValue: T,
    occurrance = 1,
    eq: Eq<T> = Eq.objectIs
  ): number | undefined {
    if (occurrance <= 0) return undefined;

    const done = Symbol('Done');
    let value: T | typeof done;
    const iterator = this[Symbol.iterator]();
    let index = 0;
    let occ = 0;

    while (done !== (value = iterator.fastNext(done))) {
      const i = index++;

      if (eq(value, searchValue)) {
        occ++;
        if (occ >= occurrance) return i;
      }
    }

    return undefined;
  }

  some(pred: (value: T, index: number) => boolean): boolean {
    return undefined !== this.indexWhere(pred);
  }

  every(pred: (value: T, index: number) => boolean): boolean {
    const iterator = this[Symbol.iterator]();
    const done = Symbol('Done');
    let value: T | typeof done;
    let index = 0;

    while (done !== (value = iterator.fastNext(done))) {
      if (!pred(value, index++)) return false;
    }

    return true;
  }

  contains(searchValue: T, amount = 1, eq?: Eq<T>): boolean {
    if (amount <= 0) return true;

    return undefined !== this.indexOf(searchValue, amount, eq);
  }

  takeWhile(pred: (value: T, index: number) => boolean): Stream<T> {
    return new TakeWhileStream(this, pred);
  }

  dropWhile(pred: (value: T, index: number) => boolean): Stream<T> {
    return new DropWhileStream(this, pred);
  }

  take(amount: number): Stream<T> {
    if (amount <= 0) return Stream.empty();

    return new TakeStream(this, amount);
  }

  drop(amount: number): Stream<T> {
    if (amount <= 0) return this;

    return new DropStream(this, amount);
  }

  repeat(amount?: number): Stream<T> {
    if (undefined !== amount && amount <= 1) return this;

    return new FromStream(() => new RepeatIterator(this, amount));
  }

  concat<T2 extends T = T>(
    ...others: ArrayNonEmpty<StreamSource<T2>>
  ): Stream.NonEmpty<T> {
    if (others.every(StreamSource.isEmptyInstance)) return this as any;

    return new ConcatStream(this, others) as any;
  }

  min<O>(otherwise?: OptLazy<O>): T | O {
    return this.minBy(Comp.defaultComp().compare, otherwise);
  }

  minBy<O>(compare: (v1: T, v2: T) => number, otherwise?: OptLazy<O>): T | O {
    const done = Symbol('Done');
    const iterator = this[Symbol.iterator]();
    let result: T | typeof done = iterator.fastNext(done);

    if (done === result) return OptLazy(otherwise) as O;

    let value: T | typeof done;
    while (done !== (value = iterator.fastNext(done))) {
      if (compare(value, result) < 0) result = value;
    }

    return result;
  }

  max<O>(otherwise?: OptLazy<O>): T | O {
    return this.maxBy(Comp.defaultComp().compare, otherwise);
  }

  maxBy<O>(compare: (v1: T, v2: T) => number, otherwise?: OptLazy<O>): T | O {
    const done = Symbol('Done');
    const iterator = this[Symbol.iterator]();
    let result: T | typeof done = iterator.fastNext(done);

    if (done === result) return OptLazy(otherwise) as O;

    let value: T | typeof done;
    while (done !== (value = iterator.fastNext(done))) {
      if (compare(value, result) > 0) result = value;
    }

    return result;
  }

  intersperse<O>(sep: StreamSource<O>): Stream<T | O> {
    if (StreamSource.isEmptyInstance(sep)) return this as any;

    const sepStream = Stream.from(sep);

    return new IntersperseStream(this, sepStream);
  }

  join({
    sep = '',
    start = '',
    end = '',
    valueToString = String,
  } = {}): string {
    const done = Symbol('Done');
    const iterator = this[Symbol.iterator]();
    let value: T | typeof done = iterator.fastNext(done);

    if (done === value) return start.concat(end);

    let result = start.concat(valueToString(value));

    while (done !== (value = iterator.fastNext(done))) {
      result = result.concat(sep, valueToString(value));
    }

    return result.concat(end);
  }

  mkGroup<O>({
    sep = Stream.empty<O>() as StreamSource<O>,
    start = Stream.empty<O>() as StreamSource<O>,
    end = Stream.empty<O>() as StreamSource<O>,
  } = {}): any {
    return Stream.from<T | O>(start, this.intersperse(sep), end);
  }

  splitWhere(pred: (value: T, index: number) => boolean): Stream<T[]> {
    return new SplitWhereStream(this, pred);
  }

  splitOn(sepElem: T, eq: Eq<T> = Eq.objectIs): Stream<T[]> {
    return new SplitOnStream(this, sepElem, eq);
  }

  fold<R>(
    init: Reducer.Init<R>,
    next: (current: R, value: T, index: number, halt: () => void) => R
  ): R {
    return this.reduce(Reducer.createOutput(init, next));
  }

  foldStream<R>(
    init: Reducer.Init<R>,
    next: (current: R, value: T, index: number, halt: () => void) => R
  ): Stream<R> {
    return this.reduceStream(Reducer.createOutput(init, next));
  }

  reduce<O>(reducer: Reducer<T, O>): O {
    let halted = false;

    function halt(): void {
      halted = true;
    }

    let index = 0;
    const next = reducer.next;
    let state = Reducer.Init(reducer.init);
    const done = Symbol('Done');
    let value: T | typeof done;
    const iter = this[Symbol.iterator]();

    while (!halted && done !== (value = iter.fastNext(done))) {
      state = next(state, value, index++, halt);
    }

    return reducer.stateToResult(state);
  }

  reduceStream<O>(reducer: Reducer<T, O>): Stream<O> {
    return new ReduceStream(this, reducer);
  }

  reduceAll(...reducers: any): any {
    const state = reducers.map((d: any): unknown => Reducer.Init(d.init));

    const iteratorsDone: ((() => void) | null)[] = state.map(
      (_: any, i: any): (() => void) =>
        (): void => {
          iteratorsDone[i] = null;
        }
    );

    const iter = this[Symbol.iterator]();
    const length = reducers.length;

    const done = Symbol('Done');
    let value: T | typeof done;
    let index = 0;

    while (done !== (value = iter.fastNext(done))) {
      let i = -1;
      let anyNotDone = false;

      while (++i < length) {
        const halt = iteratorsDone[i];
        if (null !== halt) {
          anyNotDone = true;
          state[i] = reducers[i].next(state[i], value, index, halt);
        }
      }
      if (!anyNotDone) break;
      index++;
    }

    return state.map((s: any, i: any): unknown => reducers[i].stateToResult(s));
  }

  reduceAllStream(...reducers: any): any {
    return new ReduceAllStream(this, reducers);
  }

  toArray(): T[] {
    const iterator = this[Symbol.iterator]();
    const result: T[] = [];
    const done = Symbol('Done');
    let value: T | typeof done;

    while (done !== (value = iterator.fastNext(done))) {
      result.push(value);
    }

    return result;
  }

  toString(): string {
    return `Stream(...<potentially empty>)`;
  }

  toJSON(): ToJSON<T[], 'Stream'> {
    return {
      dataType: 'Stream',
      value: this.toArray(),
    };
  }

  flatten(): any {
    return this.flatMap((s: any) => s);
  }

  zipWith<I extends readonly [unknown, ...unknown[]], R>(
    zipFun: (value: T, ...values: I) => R,
    ...iters: { [K in keyof I]: StreamSource<I[K]> }
  ): any {
    if (iters.some(StreamSource.isEmptyInstance)) return Stream.empty();

    return new FromStream(
      (): FastIterator<R> => new ZipWithIterator([this, ...iters], zipFun)
    );
  }

  zip(...iters: any): any {
    return this.zipWith(Array, ...(iters as [any, ...any[]]));
  }

  zipAllWith<I extends readonly [unknown, ...unknown[]], O, R>(
    fillValue: OptLazy<O>,
    zipFun: (value: T, ...values: { [K in keyof I]: I[K] | O }) => R,
    ...streams: { [K in keyof I]: StreamSource<I[K]> }
  ): any {
    return new FromStream(
      (): FastIterator<any> =>
        new ZipAllWithItererator(fillValue, [this, ...streams], zipFun as any)
    );
  }

  zipAll<I extends readonly [unknown, ...unknown[]], O>(
    fillValue: OptLazy<O>,
    ...streams: { [K in keyof I]: StreamSource<I[K]> }
  ): any {
    return this.zipAllWith(
      fillValue,
      Array,
      ...(streams as any as [any, ...any[]])
    );
  }

  unzip<L extends number>(length: L): any {
    if (StreamSource.isEmptyInstance(this)) {
      return Stream.of(Stream.empty()).repeat(length).toArray();
    }

    const result: Stream<unknown>[] = [];
    let i = -1;

    while (++i < length) {
      const index = i;
      result[i] = this.map((t: any): unknown => t[index]);
    }

    return result;
  }
}

export class FromStream<T> extends StreamBase<T> {
  [Symbol.iterator]: () => FastIterator<T>;

  constructor(readonly createIterator: () => FastIterator<T>) {
    super();
    this[Symbol.iterator] = createIterator;
  }
}

class PrependIterator<T> extends FastIteratorBase<T> {
  constructor(readonly source: FastIterator<T>, readonly item: OptLazy<T>) {
    super();
  }

  prependDone = false;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    if (this.prependDone) return this.source.fastNext(otherwise!);
    this.prependDone = true;
    return OptLazy(this.item);
  }
}

class PrependStream<T> extends StreamBase<T> {
  constructor(readonly source: Stream<T>, readonly item: OptLazy<T>) {
    super();
  }

  [Symbol.iterator](): FastIterator<T> {
    return new PrependIterator(this.source[Symbol.iterator](), this.item);
  }

  first(): T {
    return OptLazy(this.item);
  }

  last(): T {
    return this.source.last(this.item);
  }

  count(): number {
    return this.source.count() + 1;
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state = TraverseState()
  ): void {
    if (state.halted) return;

    f(OptLazy(this.item), state.nextIndex(), state.halt);

    if (state.halted) return;

    this.source.forEach(f, state);
  }
}

class AppendIterator<T> extends FastIteratorBase<T> {
  constructor(readonly source: FastIterator<T>, readonly item: OptLazy<T>) {
    super();
  }

  appendDone = false;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    if (this.appendDone) return OptLazy(otherwise) as O;

    const done = Symbol('Done');

    const value = this.source.fastNext(done);

    if (done !== value) return value;

    this.appendDone = true;
    return OptLazy(this.item);
  }
}

class AppendStream<T> extends StreamBase<T> {
  constructor(readonly source: Stream<T>, readonly item: OptLazy<T>) {
    super();
  }

  [Symbol.iterator](): FastIterator<T> {
    return new AppendIterator(this.source[Symbol.iterator](), this.item);
  }

  first(): T {
    return this.source.first(this.item);
  }

  last(): T {
    return OptLazy(this.item);
  }

  count(): number {
    return this.source.count() + 1;
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state = TraverseState()
  ): void {
    if (state.halted) return;

    this.source.forEach(f, state);

    if (state.halted) return;

    f(OptLazy(this.item), state.nextIndex(), state.halt);
  }
}

class IndexedIterator<T> extends FastIteratorBase<[number, T]> {
  index: number;

  constructor(readonly source: FastIterator<T>, readonly startIndex = 0) {
    super();
    this.index = startIndex;
  }

  fastNext<O>(otherwise?: OptLazy<O>): [number, T] | O {
    const done = Symbol('Done');
    const value = this.source.fastNext(done);

    if (done === value) return OptLazy(otherwise) as O;

    return [this.index++, value];
  }
}

class IndexedStream<T> extends StreamBase<[number, T]> {
  constructor(readonly source: Stream<T>, readonly startIndex: number) {
    super();
  }

  [Symbol.iterator](): FastIterator<[number, T]> {
    return new IndexedIterator<T>(
      this.source[Symbol.iterator](),
      this.startIndex
    );
  }

  count(): number {
    return this.source.count();
  }
}

class MapIterator<T, T2> extends FastIteratorBase<T2> {
  constructor(
    readonly source: FastIterator<T>,
    readonly mapFun: (value: T, index: number) => T2
  ) {
    super();
  }

  readonly state = TraverseState();

  fastNext<O>(otherwise?: OptLazy<O>): T2 | O {
    const state = this.state;

    if (state.halted) return OptLazy(otherwise) as O;

    const done = Symbol('Done');
    const next = this.source.fastNext(done);

    if (done === next) return OptLazy(otherwise) as O;

    return this.mapFun(next, state.nextIndex());
  }
}

class MapStream<T, T2> extends StreamBase<T2> {
  constructor(
    readonly source: Stream<T>,
    readonly mapFun: (value: T, index: number) => T2
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<T2> {
    return new MapIterator(this.source[Symbol.iterator](), this.mapFun);
  }

  first<O>(otherwise?: OptLazy<O>): T2 | O {
    const done = Symbol('Done');
    const value = this.source.first(done);
    if (done === value) return OptLazy(otherwise) as O;
    return this.mapFun(value, 0);
  }

  last<O>(otherwise?: OptLazy<O>): T2 | O {
    const done = Symbol('Done');
    const value = this.source.last(done);
    if (done === value) return OptLazy(otherwise) as O;
    return this.mapFun(value, 0);
  }

  count(): number {
    return this.source.count();
  }

  elementAt<O>(index: number, otherwise?: OptLazy<O>): T2 | O {
    const done = Symbol('Done');
    const value = this.source.elementAt(index, done);
    if (done === value) return OptLazy(otherwise) as O;
    return this.mapFun(value, index);
  }

  map<T3>(mapFun: (value: T2, index: number) => T3): Stream<T3> {
    return new MapStream(this.source, (value, index) =>
      mapFun(this.mapFun(value, index), index)
    );
  }
}

class MapPureIterator<
  T,
  A extends readonly unknown[],
  T2
> extends FastIteratorBase<T2> {
  constructor(
    readonly source: FastIterator<T>,
    readonly mapFun: (value: T, ...args: A) => T2,
    readonly args: A
  ) {
    super();
  }

  fastNext<O>(otherwise?: OptLazy<O>): T2 | O {
    const done = Symbol('Done');
    const next = this.source.fastNext(done);

    if (done === next) return OptLazy(otherwise) as O;

    return this.mapFun(next, ...this.args);
  }
}

class MapPureStream<
  T,
  A extends readonly unknown[],
  T2
> extends StreamBase<T2> {
  constructor(
    readonly source: Stream<T>,
    readonly mapFun: (value: T, ...args: A) => T2,
    readonly args: A
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<T2> {
    return new MapPureIterator(
      this.source[Symbol.iterator](),
      this.mapFun,
      this.args
    );
  }

  first<O>(otherwise?: OptLazy<O>): T2 | O {
    const done = Symbol('Done');
    const value = this.source.first(done);
    if (done === value) return OptLazy(otherwise) as O;
    return this.mapFun(value, ...this.args);
  }

  last<O>(otherwise?: OptLazy<O>): T2 | O {
    const done = Symbol('Done');
    const value = this.source.last(done);
    if (done === value) return OptLazy(otherwise) as O;
    return this.mapFun(value, ...this.args);
  }

  count(): number {
    return this.source.count();
  }

  elementAt<O>(index: number, otherwise?: OptLazy<O>): T2 | O {
    const done = Symbol('Done');
    const value = this.source.elementAt(index, done);
    if (done === value) return OptLazy(otherwise) as O;
    return this.mapFun(value, ...this.args);
  }
}

class FlatMapIterator<T, T2> extends FastIteratorBase<T2> {
  iterator: FastIterator<T>;

  constructor(
    readonly source: Stream<T>,
    readonly flatMapFun: (
      value: T,
      index: number,
      halt: () => void
    ) => StreamSource<T2>
  ) {
    super();
    this.iterator = this.source[Symbol.iterator]();
  }

  readonly state = TraverseState();

  done = false;
  currentIterator: null | FastIterator<T2> = null;

  fastNext<O>(otherwise?: OptLazy<O>): T2 | O {
    const state = this.state;

    if (state.halted || this.done) return OptLazy(otherwise) as O;

    const done = Symbol('Done');

    let nextValue: T2 | typeof done = done;

    while (
      null === this.currentIterator ||
      done === (nextValue = this.currentIterator.fastNext(done))
    ) {
      const nextIter = this.iterator.fastNext(done);

      if (done === nextIter) {
        this.done = true;
        return OptLazy(otherwise) as O;
      }

      const nextSource = this.flatMapFun(
        nextIter,
        state.nextIndex(),
        state.halt
      );

      this.currentIterator = Stream.from(nextSource)[Symbol.iterator]();
    }

    return nextValue;
  }
}

class FlatMapStream<T, T2> extends StreamBase<T2> {
  constructor(
    readonly source: Stream<T>,
    readonly flatmapFun: (
      value: T,
      index: number,
      halt: () => void
    ) => StreamSource<T2>
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<T2> {
    return new FlatMapIterator<T, T2>(this.source, this.flatmapFun);
  }
}

class ConcatIterator<T> extends FastIteratorBase<T> {
  iterator: FastIterator<T>;

  constructor(
    readonly source: Stream<T>,
    readonly otherSources: StreamSource<T>[]
  ) {
    super();

    this.iterator = source[Symbol.iterator]();
  }

  sourceIndex = 0;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const done = Symbol('Done');
    let value: T | typeof done;
    const length = this.otherSources.length;

    while (done === (value = this.iterator.fastNext(done))) {
      if (this.sourceIndex >= length) return OptLazy(otherwise) as O;

      let nextSource: StreamSource<T> = this.otherSources[this.sourceIndex++];

      while (StreamSource.isEmptyInstance(nextSource)) {
        if (this.sourceIndex >= length) return OptLazy(otherwise) as O;
        nextSource = this.otherSources[this.sourceIndex++];
      }

      this.iterator = Stream.from(nextSource)[Symbol.iterator]();
    }

    return value;
  }
}

class ConcatStream<T> extends StreamBase<T> {
  constructor(
    readonly source: Stream<T>,
    readonly otherSources: StreamSource<T>[]
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<T> {
    return new ConcatIterator(this.source, this.otherSources);
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state = TraverseState()
  ): void {
    if (state.halted) return;

    this.source.forEach(f, state);

    let sourceIndex = -1;
    const sources = this.otherSources;
    const length = sources.length;

    while (!state.halted && ++sourceIndex < length) {
      const source = sources[sourceIndex];

      if (!StreamSource.isEmptyInstance(source)) {
        Stream.from(source).forEach(f, state);
      }
    }
  }

  last<O>(otherwise?: OptLazy<O>): T | O {
    const sources = this.otherSources;
    let sourceIndex = sources.length;

    while (--sourceIndex >= 0) {
      const source = sources[sourceIndex];

      if (!StreamSource.isEmptyInstance(source)) {
        const done = Symbol('Done');
        const value = Stream.from(source).last(done);
        if (done !== value) return value;
      }
    }

    return this.source.last(otherwise!);
  }

  count(): number {
    let result = this.source.count();

    const sources = this.otherSources;
    const length = sources.length;
    let sourceIndex = -1;

    while (++sourceIndex < length) {
      const source = sources[sourceIndex];
      if (!StreamSource.isEmptyInstance(source)) {
        result += Stream.from(source).count();
      }
    }

    return result;
  }

  concat(...others2: StreamSource<T>[]): any {
    return new ConcatStream(this.source, this.otherSources.concat(others2));
  }

  toArray(): T[] {
    let result: T[] = this.source.toArray();

    let sourceIndex = -1;
    const sources = this.otherSources;
    const length = sources.length;

    while (++sourceIndex < length) {
      const source = sources[sourceIndex];

      if (!StreamSource.isEmptyInstance(source)) {
        result = result.concat(Stream.from(source).toArray());
      }
    }

    return result;
  }
}

class FilterIterator<T> extends FastIteratorBase<T> {
  constructor(
    readonly source: FastIterator<T>,
    readonly pred: (value: T, index: number, halt: () => void) => boolean,
    readonly invert: boolean
  ) {
    super();
  }

  readonly state = TraverseState();

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const state = this.state;
    if (state.halted) return OptLazy(otherwise) as O;

    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const pred = this.pred;
    const halt = state.halt;

    if (this.invert) {
      while (!state.halted && done !== (value = source.fastNext(done))) {
        if (!pred(value, state.nextIndex(), halt)) return value;
      }
    } else {
      while (!state.halted && done !== (value = source.fastNext(done))) {
        if (pred(value, state.nextIndex(), halt)) return value;
      }
    }

    return OptLazy(otherwise) as O;
  }
}

class FilterStream<T> extends StreamBase<T> {
  constructor(
    readonly source: Stream<T>,
    readonly pred: (value: T, index: number, halt: () => void) => boolean,
    readonly invert = false
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<T> {
    return new FilterIterator(
      this.source[Symbol.iterator](),
      this.pred,
      this.invert
    );
  }

  filter(
    pred: (value: T, index: number, halt: () => void) => boolean
  ): Stream<T> {
    return new FilterStream(
      this.source,
      (v, i, halt) => this.pred(v, i, halt) && pred(v, i, halt)
    );
  }
}

class FilterPureIterator<
  T,
  A extends readonly unknown[]
> extends FastIteratorBase<T> {
  constructor(
    readonly source: FastIterator<T>,
    readonly pred: (value: T, ...args: A) => boolean,
    readonly args: A,
    readonly invert: boolean
  ) {
    super();
  }

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const pred = this.pred;
    const args = this.args;

    if (this.invert) {
      while (done !== (value = source.fastNext(done))) {
        if (!pred(value, ...args)) return value;
      }
    } else {
      while (done !== (value = source.fastNext(done))) {
        if (pred(value, ...args)) return value;
      }
    }

    return OptLazy(otherwise) as O;
  }
}

class FilterPureStream<T, A extends readonly unknown[]> extends StreamBase<T> {
  constructor(
    readonly source: Stream<T>,
    readonly pred: (value: T, ...args: A) => boolean,
    readonly args: A,
    readonly invert = false
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<T> {
    return new FilterPureIterator(
      this.source[Symbol.iterator](),
      this.pred,
      this.args,
      this.invert
    );
  }
}

class CollectIterator<T, R> extends FastIteratorBase<R> {
  constructor(
    readonly source: FastIterator<T>,
    readonly collectFun: CollectFun<T, R>
  ) {
    super();
  }

  readonly state = TraverseState();

  fastNext<O>(otherwise?: OptLazy<O>): R | O {
    const state = this.state;
    if (state.halted) return OptLazy(otherwise) as O;

    const { halt } = state;

    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const collectFun = this.collectFun;

    while (!state.halted && done !== (value = source.fastNext(done))) {
      const result = collectFun(
        value,
        state.nextIndex(),
        CollectFun.Skip,
        halt
      );
      if (CollectFun.Skip === result) continue;

      return result as R;
    }

    return OptLazy(otherwise as O);
  }
}

class CollectStream<T, R> extends StreamBase<R> {
  constructor(
    readonly source: Stream<T>,
    readonly collectFun: CollectFun<T, R>
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<R> {
    return new CollectIterator(this.source[Symbol.iterator](), this.collectFun);
  }
}

class IndicesWhereIterator<T> extends FastIteratorBase<number> {
  constructor(
    readonly source: FastIterator<T>,
    readonly pred: (value: T) => boolean
  ) {
    super();
  }

  index = 0;

  fastNext<O>(otherwise?: OptLazy<O>): number | O {
    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const pred = this.pred;

    while (done !== (value = source.fastNext(done))) {
      if (pred(value)) return this.index++;
      this.index++;
    }

    return OptLazy(otherwise) as O;
  }
}

class IndicesWhereStream<T> extends StreamBase<number> {
  constructor(
    readonly source: Stream<T>,
    readonly pred: (value: T) => boolean
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<number> {
    return new IndicesWhereIterator(this.source[Symbol.iterator](), this.pred);
  }
}

class IndicesOfIterator<T> extends FastIteratorBase<number> {
  constructor(
    readonly source: FastIterator<T>,
    readonly searchValue: T,
    readonly eq: Eq<T>
  ) {
    super();
  }

  index = 0;

  fastNext<O>(otherwise?: OptLazy<O>): number | O {
    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const searchValue = this.searchValue;
    const eq = this.eq;

    while (done !== (value = source.fastNext(done))) {
      if (eq(searchValue, value)) return this.index++;
      this.index++;
    }

    return OptLazy(otherwise) as O;
  }
}

class IndicesOfStream<T> extends StreamBase<number> {
  constructor(
    readonly source: Stream<T>,
    readonly searchValue: T,
    readonly eq: Eq<T>
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<number> {
    return new IndicesOfIterator(
      this.source[Symbol.iterator](),
      this.searchValue,
      this.eq
    );
  }
}

class TakeWhileIterator<T> extends FastIteratorBase<T> {
  constructor(
    readonly source: FastIterator<T>,
    readonly pred: (value: T, index: number) => boolean
  ) {
    super();
  }

  isDone = false;
  index = 0;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const done = Symbol('Done');
    if (this.isDone) return OptLazy(otherwise) as O;

    const next = this.source.fastNext(done);

    if (done === next) {
      this.isDone = true;
      return OptLazy(otherwise) as O;
    }

    if (this.pred(next, this.index++)) return next;

    this.isDone = true;
    return OptLazy(otherwise) as O;
  }
}

class TakeWhileStream<T> extends StreamBase<T> {
  constructor(
    readonly source: Stream<T>,
    readonly pred: (value: T, index: number) => boolean
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<T> {
    return new TakeWhileIterator(this.source[Symbol.iterator](), this.pred);
  }
}

class DropWhileIterator<T> extends FastIteratorBase<T> {
  constructor(
    readonly source: FastIterator<T>,
    readonly pred: (value: T, index: number) => boolean
  ) {
    super();
  }

  pass = false;
  index = 0;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const source = this.source;
    if (this.pass) return source.fastNext(otherwise!);

    const done = Symbol('Done');
    let value: T | typeof done;

    while (done !== (value = source.fastNext(done))) {
      this.pass = !this.pred(value, this.index++);
      if (this.pass) return value;
    }

    return OptLazy(otherwise) as O;
  }
}

class DropWhileStream<T> extends StreamBase<T> {
  constructor(
    readonly source: Stream<T>,
    readonly pred: (value: T, index: number) => boolean
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<T> {
    return new DropWhileIterator(this.source[Symbol.iterator](), this.pred);
  }
}

class TakeIterator<T> extends FastIteratorBase<T> {
  constructor(readonly source: FastIterator<T>, readonly amount: number) {
    super();
  }

  i = 0;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    if (this.i++ >= this.amount) return OptLazy(otherwise) as O;

    return this.source.fastNext(otherwise!);
  }
}

class TakeStream<T> extends StreamBase<T> {
  constructor(readonly source: Stream<T>, readonly amount: number) {
    super();
  }

  [Symbol.iterator](): FastIterator<T> {
    return new TakeIterator(this.source[Symbol.iterator](), this.amount);
  }

  take(amount: number): Stream<T> {
    if (amount === this.amount) return this;
    return this.source.take(amount);
  }
}

class DropIterator<T> extends FastIteratorBase<T> {
  remain: number;

  constructor(readonly source: FastIterator<T>, readonly amount: number) {
    super();

    this.remain = amount;
  }

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const source = this.source;
    if (this.remain <= 0) return source.fastNext(otherwise!);

    const done = Symbol('Done');
    let value: T | typeof done;

    while (done !== (value = source.fastNext(done))) {
      if (this.remain-- <= 0) return value;
    }

    return OptLazy(otherwise) as O;
  }
}

class DropStream<T> extends StreamBase<T> {
  constructor(readonly source: Stream<T>, readonly amount: number) {
    super();
  }

  [Symbol.iterator](): FastIterator<T> {
    return new DropIterator(this.source[Symbol.iterator](), this.amount);
  }

  drop(amount: number): Stream<T> {
    if (amount <= 0) return this;
    return this.source.drop(this.amount + amount);
  }
}

class RepeatIterator<T> extends FastIteratorBase<T> {
  iterator: FastIterator<T>;
  remain?: number;

  constructor(readonly source: Stream<T>, readonly amount?: number) {
    super();

    this.iterator = source[Symbol.iterator]();
    this.remain = amount;
  }

  isEmpty = true;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const done = Symbol('Done');
    let value = this.iterator.fastNext(done);

    if (done !== value) {
      this.isEmpty = false;
      return value;
    }

    if (this.isEmpty) return OptLazy(otherwise) as O;

    if (undefined !== this.remain) {
      this.remain--;

      if (this.remain <= 0) return OptLazy(otherwise) as O;
    }

    this.iterator = this.source[Symbol.iterator]();
    value = this.iterator.fastNext(done);
    if (done === value) return OptLazy(otherwise) as O;

    return value;
  }
}

class IntersperseIterator<T, S> extends FastIteratorBase<T | S> {
  constructor(readonly source: FastIterator<T>, readonly sepStream: Stream<S>) {
    super();
  }

  sepIterator: FastIterator<S> | undefined;
  nextValue!: T;
  isInitialized = false;

  fastNext<O>(otherwise?: OptLazy<O>): T | S | O {
    const done = Symbol('Done');

    if (undefined !== this.sepIterator) {
      const sepNext = this.sepIterator.fastNext(done);
      if (done !== sepNext) return sepNext;
      this.sepIterator = undefined;
    }

    if (this.isInitialized) {
      const newNextValue = this.source.fastNext(done);
      if (done === newNextValue) {
        this.isInitialized = false;
        return this.nextValue;
      }
      const currentNextValue = this.nextValue;
      this.nextValue = newNextValue;
      this.sepIterator = this.sepStream[Symbol.iterator]();
      return currentNextValue;
    }

    const nextValue = this.source.fastNext(done);
    if (done === nextValue) return OptLazy(otherwise) as O;

    const newNextValue = this.source.fastNext(done);
    if (done === newNextValue) return nextValue;

    this.nextValue = newNextValue;
    this.isInitialized = true;
    this.sepIterator = this.sepStream[Symbol.iterator]();
    return nextValue;
  }
}

class IntersperseStream<T, S> extends StreamBase<T | S> {
  constructor(readonly source: Stream<T>, readonly sepStream: Stream<S>) {
    super();
  }

  [Symbol.iterator](): FastIterator<T | S> {
    return new IntersperseIterator(
      this.source[Symbol.iterator](),
      this.sepStream
    );
  }
}

class SplitWhereIterator<T> extends FastIteratorBase<T[]> {
  constructor(
    readonly source: FastIterator<T>,
    readonly pred: (value: T, index: number) => boolean
  ) {
    super();
  }

  index = 0;

  fastNext<O>(otherwise?: OptLazy<O>): T[] | O {
    const result: T[] = [];

    const source = this.source;
    const done = Symbol('Done');
    let value: T | typeof done;
    const pred = this.pred;

    const startIndex = this.index;

    while (done !== (value = source.fastNext(done))) {
      if (pred(value, this.index++)) return result;
      result.push(value);
    }

    if (startIndex === this.index) return OptLazy(otherwise) as O;

    return result;
  }
}

class SplitWhereStream<T> extends StreamBase<T[]> {
  constructor(
    readonly source: Stream<T>,
    readonly pred: (value: T, index: number) => boolean
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<T[]> {
    return new SplitWhereIterator(this.source[Symbol.iterator](), this.pred);
  }
}

class SplitOnIterator<T> extends FastIteratorBase<T[]> {
  constructor(
    readonly source: FastIterator<T>,
    readonly sepElem: T,
    readonly eq: Eq<T>
  ) {
    super();
  }

  fastNext<O>(otherwise?: OptLazy<O>): T[] | O {
    const result: T[] = [];

    const source = this.source;
    const done = Symbol('Done');
    let value: T | typeof done;
    let processed = false;
    const eq = this.eq;
    const sepElem = this.sepElem;

    while (done !== (value = source.fastNext(done))) {
      processed = true;
      if (eq(value, sepElem)) return result;
      result.push(value);
    }

    if (!processed) return OptLazy(otherwise) as O;

    return result;
  }
}

class SplitOnStream<T> extends StreamBase<T[]> {
  constructor(
    readonly source: Stream<T>,
    readonly sepElem: T,
    readonly eq: Eq<T>
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<T[]> {
    return new SplitOnIterator(
      this.source[Symbol.iterator](),
      this.sepElem,
      this.eq
    );
  }
}

class ReduceIterator<I, R> extends FastIteratorBase<R> {
  state: unknown;

  constructor(
    readonly source: FastIterator<I>,
    readonly reducer: Reducer<I, R>
  ) {
    super();

    this.state = Reducer.Init(reducer.init);
  }

  halted = false;
  index = 0;

  halt = (): void => {
    this.halted = true;
  };

  fastNext<O>(otherwise?: OptLazy<O>): R | O {
    if (this.halted) return OptLazy(otherwise) as O;
    const done = Symbol('Done');
    const value = this.source.fastNext(done);

    if (done === value) return OptLazy(otherwise) as O;

    const reducer = this.reducer;
    this.state = reducer.next(this.state, value, this.index++, this.halt);

    return reducer.stateToResult(this.state);
  }
}

class ReduceStream<I, R> extends StreamBase<R> {
  constructor(readonly source: Stream<I>, readonly reducerDef: Reducer<I, R>) {
    super();
  }

  [Symbol.iterator](): FastIterator<R> {
    return new ReduceIterator(this.source[Symbol.iterator](), this.reducerDef);
  }
}

class ReduceAllIterator<I, R> extends FastIteratorBase<R> {
  readonly state: unknown[];
  readonly done: ((() => void) | null)[];

  constructor(
    readonly source: FastIterator<I>,
    readonly reducers: Reducer<I, any>[]
  ) {
    super();

    this.state = reducers.map((d: any): unknown => Reducer.Init(d.init));
    this.done = this.state.map((_: any, i: any): (() => void) => (): void => {
      this.done[i] = null;
    });
  }

  halted = false;
  index = 0;
  isDone = false;

  fastNext<O>(otherwise?: OptLazy<O>): R | O {
    if (this.halted || this.isDone) return OptLazy(otherwise) as O;

    const done = Symbol('Done');
    const value = this.source.fastNext(done);

    if (done === value) return OptLazy(otherwise) as O;

    const reducers = this.reducers;
    const length = reducers.length;
    let i = -1;
    let anyNotDone = false;

    while (++i < length) {
      const halt = this.done[i];
      if (null !== halt) {
        anyNotDone = true;
        const reducer = reducers[i];
        this.state[i] = reducer.next(this.state[i], value, this.index, halt);
      }
    }
    this.isDone = !anyNotDone;
    if (!anyNotDone) return OptLazy(otherwise) as O;
    this.index++;

    return this.state.map((s, i) =>
      reducers[i].stateToResult(s)
    ) as unknown as O;
  }
}

class ReduceAllStream<I, R> extends StreamBase<R> {
  constructor(
    readonly source: Stream<I>,
    readonly reducers: Reducer<I, any>[]
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<R> {
    return new ReduceAllIterator(this.source[Symbol.iterator](), this.reducers);
  }
}

class SlowIteratorAdapter<T> implements FastIterator<T> {
  constructor(readonly source: Iterator<T>) {}

  next(): IteratorResult<T> {
    return this.source.next();
  }

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const result = this.source.next();
    if (result.done) return OptLazy(otherwise) as O;
    return result.value;
  }
}

export class FromIterable<T> extends StreamBase<T> {
  constructor(readonly iterable: Iterable<T>) {
    super();
  }

  [Symbol.iterator](): FastIterator<T> {
    const iterator = this.iterable[Symbol.iterator]();

    if (FastIterator.isFastIterator(iterator)) return iterator;

    return new SlowIteratorAdapter(iterator);
  }
}

class ZipWithIterator<
  I extends readonly unknown[],
  R
> extends FastIteratorBase<R> {
  constructor(
    readonly iterables: { [K in keyof I]: StreamSource<I[K]> },
    readonly zipFun: (...values: I) => R
  ) {
    super();

    this.sources = iterables.map(
      (source): FastIterator<any> => Stream.from(source)[Symbol.iterator]()
    );
  }

  readonly sources: FastIterator<any>[];

  fastNext<O>(otherwise?: OptLazy<O>): R | O {
    const result = [];

    let sourceIndex = -1;
    const sources = this.sources;

    const done = Symbol('Done');

    while (++sourceIndex < sources.length) {
      const value = sources[sourceIndex].fastNext(done);

      if (done === value) return OptLazy(otherwise) as O;

      result.push(value);
    }

    return (this.zipFun as any)(...result);
  }
}

class ZipAllWithItererator<
  I extends readonly unknown[],
  F,
  R
> extends FastIteratorBase<R> {
  constructor(
    readonly fillValue: OptLazy<F>,
    readonly iters: { [K in keyof I]: StreamSource<I[K]> },
    readonly zipFun: (...values: { [K in keyof I]: I[K] | F }) => R
  ) {
    super();

    this.sources = iters.map(
      (o): FastIterator<any> => Stream.from(o)[Symbol.iterator]()
    );
  }

  readonly sources: FastIterator<any>[];
  allDone = false;

  fastNext<O>(otherwise?: OptLazy<O>): R | O {
    if (this.allDone) return OptLazy(otherwise) as O;

    const result = [];

    let sourceIndex = -1;
    const sources = this.sources;

    const done = Symbol('Done');
    let anyNotDone = false;
    const fillValue = this.fillValue;

    while (++sourceIndex < sources.length) {
      const value = sources[sourceIndex].fastNext(done);

      if (done === value) {
        result.push(OptLazy(fillValue));
      } else {
        anyNotDone = true;
        result.push(value);
      }
    }

    if (!anyNotDone) {
      this.allDone = true;
      return OptLazy(otherwise) as O;
    }

    return (this.zipFun as any)(...result);
  }
}
