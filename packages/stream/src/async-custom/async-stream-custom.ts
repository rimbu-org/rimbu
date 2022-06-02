import {
  ArrayNonEmpty,
  AsyncCollectFun,
  AsyncOptLazy,
  AsyncReducer,
  Comp,
  Eq,
  MaybePromise,
  Reducer,
  ToJSON,
  TraverseState,
} from '@rimbu/common';
import { RimbuError, Token } from '@rimbu/base';

import type {
  AsyncFastIterator,
  AsyncStream,
  AsyncStreamSource,
} from '@rimbu/stream/async';
import {
  closeIters,
  emptyAsyncFastIterator,
  FromAsyncIterator,
  FromIterator,
  FromPromise,
  isAsyncFastIterator,
  FromResourceIterator,
  AsyncUnfoldIterator,
  AsyncZipWithIterator,
  AsyncZipAllWithItererator,
  AsyncAppendIterator,
  AsyncCollectIterator,
  AsyncConcatIterator,
  AsyncDropIterator,
  AsyncSplitWhereIterator,
  AsyncDropWhileIterator,
  AsyncFilterIterator,
  AsyncFilterPureIterator,
  AsyncFlatMapIterator,
  AsyncFoldIterator,
  AsyncIndexedIterator,
  AsyncIndicesOfIterator,
  AsyncIndicesWhereIterator,
  AsyncIntersperseIterator,
  AsyncMapIterator,
  AsyncMapPureIterator,
  AsyncOfIterator,
  AsyncPrependIterator,
  AsyncReduceAllIterator,
  AsyncReduceIterator,
  AsyncRepeatIterator,
  AsyncSplitOnIterator,
  AsyncStreamConstructors,
  AsyncTakeIterator,
  AsyncTakeWhileIterator,
} from '@rimbu/stream/async-custom';
import { Stream } from '@rimbu/stream';
import type { StreamSource } from '@rimbu/stream';
import { isEmptyStreamSourceInstance } from '@rimbu/stream/custom';

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
    const it2 = fromAsyncStreamSource(other)[Symbol.asyncIterator]();

    const done = Symbol('Done');

    while (true) {
      const [v1, v2] = await Promise.all([
        it1.fastNext(done),
        it2.fastNext(done),
      ] as const);

      if (done === v1) {
        if (done === v2) return true;
        await closeIters(it2);
        return false;
      }
      if (done === v2) {
        await closeIters(it1);
        return false;
      }

      if (!eq(v1, v2)) {
        await closeIters(it1, it2);
        return false;
      }
    }
  }

  assumeNonEmpty(): AsyncStream.NonEmpty<T> {
    return this as unknown as AsyncStream.NonEmpty<T>;
  }

  asNormal(): AsyncStream<T> {
    return this;
  }

  prepend(value: AsyncOptLazy<T>): AsyncStream.NonEmpty<T> {
    return new AsyncPrependStream<T>(this, value).assumeNonEmpty();
  }

  append(value: AsyncOptLazy<T>): AsyncStream.NonEmpty<T> {
    return new AsyncAppendStream<T>(this, value).assumeNonEmpty();
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

    try {
      while (
        !state.halted &&
        done !== (value = await iterator.fastNext(done))
      ) {
        await f(value, state.nextIndex(), halt);
      }
    } finally {
      if (done !== value!) await closeIters(iterator);
    }
  }

  async forEachPure<A extends readonly unknown[]>(
    f: (value: T, ...args: A) => MaybePromise<void>,
    ...args: A
  ): Promise<void> {
    const done = Symbol('Done');
    let value: T | typeof done;
    const iterator = this[Symbol.asyncIterator]();

    try {
      while (done !== (value = await iterator.fastNext(done))) {
        await f(value, ...args);
      }
    } catch (e) {
      await closeIters(iterator);
      throw e;
    }
  }

  indexed(startIndex = 0): AsyncStream<[number, T]> {
    return new AsyncIndexedStream<T>(this, startIndex);
  }

  map<T2>(
    mapFun: (value: T, index: number) => MaybePromise<T2>
  ): AsyncStream<T2> {
    return new AsyncMapStream<T, T2>(this, mapFun);
  }

  mapPure<T2, A extends readonly unknown[]>(
    mapFun: (value: T, ...args: A) => MaybePromise<T2>,
    ...args: A
  ): AsyncStream<T2> {
    return new AsyncMapPureStream<T, A, T2>(this, mapFun, args);
  }

  flatMap<T2>(
    flatMapFun: (
      value: T,
      index: number,
      halt: () => void
    ) => AsyncStreamSource<T2>
  ): AsyncStream<T2> {
    return new AsyncFlatMapStream<T, T2>(this, flatMapFun);
  }

  filter(
    pred: (value: T, index: number, halt: () => void) => MaybePromise<boolean>
  ): AsyncStream<T> {
    return new AsyncFilterStream<T>(this, pred);
  }

  filterNot(
    pred: (value: T, index: number, halt: () => void) => MaybePromise<boolean>
  ): AsyncStream<T> {
    return new AsyncFilterStream<T>(this, pred, true);
  }

  filterPure<A extends readonly unknown[]>(
    pred: (value: T, ...args: A) => MaybePromise<boolean>,
    ...args: A
  ): AsyncStream<T> {
    return new AsyncFilterPureStream<T, A>(this, pred, args);
  }

  filterNotPure<A extends readonly unknown[]>(
    pred: (value: T, ...args: A) => MaybePromise<boolean>,
    ...args: A
  ): AsyncStream<T> {
    return new AsyncFilterPureStream<T, A>(this, pred, args, true);
  }

  collect<R>(collectFun: AsyncCollectFun<T, R>): AsyncStream<R> {
    return new AsyncCollectStream<T, R>(this, collectFun);
  }

  async first<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const done = Symbol('done');
    const iter = this[Symbol.asyncIterator]();

    const value = await iter.fastNext(done);

    if (done === value) {
      return AsyncOptLazy.toMaybePromise(otherwise!);
    }
    await closeIters(iter);
    return value;
  }

  async last<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const done = Symbol('Done');
    let value: T | typeof done;
    let lastValue: T | typeof done = done;
    const iterator = this[Symbol.asyncIterator]();

    while (done !== (value = await iterator.fastNext(done))) {
      lastValue = value;
    }

    if (done === lastValue) return AsyncOptLazy.toMaybePromise(otherwise!);

    return lastValue;
  }

  async count(): Promise<number> {
    let result = 0;

    const done = Symbol('Done');
    const iterator = this[Symbol.asyncIterator]();

    try {
      while (done !== (await iterator.fastNext(done))) result++;

      return result;
    } catch (e) {
      await closeIters(iterator);
      throw e;
    }
  }

  async countElement(value: T, eq = Eq.objectIs): Promise<number> {
    let result = 0;

    const done = Symbol('Done');
    const iterator = this[Symbol.asyncIterator]();
    let current: T | typeof done;

    try {
      while (done !== (current = await iterator.fastNext(done))) {
        if (eq(value, current)) result++;
      }

      return result;
    } finally {
      if (done !== current!) await closeIters(iterator);
    }
  }

  async countNotElement(value: T, eq = Eq.objectIs): Promise<number> {
    let result = 0;

    const done = Symbol('Done');
    const iterator = this[Symbol.asyncIterator]();
    let current: T | typeof done;

    try {
      while (done !== (current = await iterator.fastNext(done))) {
        if (!eq(value, current)) result++;
      }

      return result;
    } finally {
      if (done !== current!) await closeIters(iterator);
    }
  }

  async find<O>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    occurrance = 1,
    otherwise?: AsyncOptLazy<O>
  ): Promise<T | O> {
    if (occurrance <= 0) return AsyncOptLazy.toMaybePromise(otherwise!);

    const done = Symbol('Done');
    const iterator = this[Symbol.asyncIterator]();
    let value: T | typeof done;
    let remain = occurrance;
    let index = 0;

    try {
      while (done !== (value = await iterator.fastNext(done))) {
        const cond = await pred(value, index++);
        if (cond && --remain <= 0) {
          return value;
        }
      }

      return AsyncOptLazy.toMaybePromise(otherwise!);
    } finally {
      if (done !== value!) await closeIters(iterator);
    }
  }

  async elementAt<O>(
    index: number,
    otherwise?: AsyncOptLazy<O>
  ): Promise<T | O> {
    if (index < 0) return AsyncOptLazy.toMaybePromise(otherwise!);

    const done = Symbol('Done');
    const iterator = this[Symbol.asyncIterator]();
    let value: T | typeof done;
    let i = 0;

    try {
      while (i <= index && done !== (value = await iterator.fastNext(done))) {
        if (i === index) {
          return value;
        }
        i++;
      }

      return AsyncOptLazy.toMaybePromise(otherwise!);
    } finally {
      if (done !== value!) await closeIters(iterator);
    }
  }

  indicesWhere(pred: (value: T) => MaybePromise<boolean>): AsyncStream<number> {
    return new AsyncIndicesWhereStream<T>(this, pred);
  }

  indicesOf(searchValue: T, eq: Eq<T> = Eq.objectIs): AsyncStream<number> {
    return new AsyncIndicesOfStream<T>(this, searchValue, eq);
  }

  async indexWhere(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    occurrance = 1
  ): Promise<number | undefined> {
    if (occurrance <= 0) return undefined;

    const done = Symbol('Done');
    let value: T | typeof done;
    const iterator = this[Symbol.asyncIterator]();
    let index = 0;
    let occ = 0;

    try {
      while (done !== (value = await iterator.fastNext(done))) {
        const i = index++;

        const cond = await pred(value, i);

        if (cond) {
          occ++;
          if (occ >= occurrance) {
            return i;
          }
        }
      }

      return undefined;
    } finally {
      if (done !== value!) await closeIters(iterator);
    }
  }

  async indexOf(
    searchValue: T,
    occurrance = 1,
    eq: Eq<T> = Eq.objectIs
  ): Promise<number | undefined> {
    if (occurrance <= 0) return undefined;

    const done = Symbol('Done');
    let value: T | typeof done;
    const iterator = this[Symbol.asyncIterator]();
    let index = 0;
    let occ = 0;

    try {
      while (done !== (value = await iterator.fastNext(done))) {
        const i = index++;

        if (eq(value, searchValue)) {
          occ++;
          if (occ >= occurrance) {
            return i;
          }
        }
      }

      return undefined;
    } finally {
      if (done !== value!) await closeIters(iterator);
    }
  }

  async some(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): Promise<boolean> {
    return undefined !== (await this.indexWhere(pred));
  }

  async every(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): Promise<boolean> {
    const iterator = this[Symbol.asyncIterator]();
    const done = Symbol('Done');
    let value: T | typeof done;
    let index = 0;

    try {
      while (done !== (value = await iterator.fastNext(done))) {
        const cond = await pred(value, index++);
        if (!cond) {
          return false;
        }
      }

      return true;
    } finally {
      if (done !== value!) await closeIters(iterator);
    }
  }

  async contains(searchValue: T, amount = 1, eq?: Eq<T>): Promise<boolean> {
    if (amount <= 0) return true;

    return undefined !== (await this.indexOf(searchValue, amount, eq));
  }

  takeWhile(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): AsyncStream<T> {
    return new AsyncTakeWhileStream(this, pred);
  }

  dropWhile(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): AsyncStream<T> {
    return new AsyncDropWhileStream(this, pred);
  }

  take(amount: number): AsyncStream<T> {
    if (amount <= 0) return emptyAsyncStream;

    return new AsyncTakeStream<T>(this, amount);
  }

  drop(amount: number): AsyncStream<T> {
    if (amount <= 0) return this;

    return new AsyncDropStream<T>(this, amount);
  }

  repeat(amount?: number): AsyncStream<T> {
    if (undefined !== amount && amount <= 1) {
      return this;
    }

    return new AsyncFromStream<T>(
      () => new AsyncRepeatIterator<T>(this, amount)
    );
  }

  concat(...others: ArrayNonEmpty<AsyncStreamSource<T>>): any {
    if (others.every(isEmptyAsyncStreamSourceInstance)) return this;

    return new AsyncConcatStream<T>(this, others);
  }

  min<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    return this.minBy(Comp.defaultComp().compare, otherwise);
  }

  async minBy<O>(
    compare: (v1: T, v2: T) => number,
    otherwise?: AsyncOptLazy<O>
  ): Promise<T | O> {
    const done = Symbol('Done');
    const iterator = this[Symbol.asyncIterator]();

    let result: T | typeof done;
    let value: T | typeof done;

    try {
      result = await iterator.fastNext(done);

      if (done === result) return AsyncOptLazy.toMaybePromise(otherwise!);

      while (done !== (value = await iterator.fastNext(done))) {
        if (compare(value, result) < 0) result = value;
      }

      return result;
    } finally {
      if (done !== result! && done !== value!) await closeIters(iterator);
    }
  }

  max<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    return this.maxBy(Comp.defaultComp().compare, otherwise);
  }

  async maxBy<O>(
    compare: (v1: T, v2: T) => number,
    otherwise?: AsyncOptLazy<O>
  ): Promise<T | O> {
    const done = Symbol('Done');
    const iterator = this[Symbol.asyncIterator]();

    let result: T | typeof done;
    let value: T | typeof done;

    try {
      result = await iterator.fastNext(done);

      if (done === result) return AsyncOptLazy.toMaybePromise(otherwise!);

      while (done !== (value = await iterator.fastNext(done))) {
        if (compare(value, result) > 0) result = value;
      }

      return result;
    } finally {
      if (done !== result! && done !== value!) await closeIters(iterator);
    }
  }

  intersperse(sep: AsyncStreamSource<T>): AsyncStream<T> {
    if (isEmptyAsyncStreamSourceInstance(sep)) return this;

    const sepStream = fromAsyncStreamSource(sep);

    return new AsyncIntersperseStream<T>(this, sepStream);
  }

  async join({
    sep = '',
    start = '',
    end = '',
    valueToString = String,
    ifEmpty = undefined,
  } = {}): Promise<string> {
    const done = Symbol('Done');
    const iterator = this[Symbol.asyncIterator]();

    let value: T | typeof done = await iterator.fastNext(done);

    try {
      if (done === value) {
        if (undefined !== ifEmpty) return ifEmpty;

        return start.concat(end);
      }

      let result = start.concat(valueToString(value));

      while (done !== (value = await iterator.fastNext(done))) {
        result = result.concat(sep, valueToString(value));
      }

      return result.concat(end);
    } finally {
      if (done !== value!) await closeIters(iterator);
    }
  }

  mkGroup({
    sep = emptyAsyncStream as AsyncStreamSource<T>,
    start = emptyAsyncStream as AsyncStreamSource<T>,
    end = emptyAsyncStream as AsyncStreamSource<T>,
  } = {}): any {
    return fromAsyncStreamSource(start).concat(this.intersperse(sep), end);
  }

  splitWhere(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): AsyncStream<T[]> {
    return new AsyncSplitWhereStream<T>(this, pred);
  }

  splitOn(sepElem: T, eq: Eq<T> = Eq.objectIs): AsyncStream<T[]> {
    return new AsyncSplitOnStream<T>(this, sepElem, eq);
  }

  async fold<R>(
    init: AsyncOptLazy<R>,
    next: (
      current: R,
      value: T,
      index: number,
      halt: () => void
    ) => MaybePromise<R>
  ): Promise<R> {
    let current = await AsyncOptLazy.toMaybePromise(init);

    const state = TraverseState();
    const done = Symbol('done');
    const iterator = this[Symbol.asyncIterator]();
    let value: T | typeof done;

    try {
      while (
        !state.halted &&
        done !== (value = await iterator.fastNext(done))
      ) {
        current = await next(current, value, state.nextIndex(), state.halt);
      }

      return current;
    } finally {
      if (done !== value!) await closeIters(iterator);
    }
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
    return new AsyncFromStream(
      (): AsyncFastIterator<R> =>
        new AsyncFoldIterator(this[Symbol.asyncIterator](), init, next)
    );
  }

  async reduce<R>(reducer: AsyncReducer<T, R>): Promise<R> {
    const traverseState = TraverseState();

    const next = reducer.next;
    let state = await AsyncOptLazy.toMaybePromise(reducer.init);
    const done = Symbol('Done');
    let value: T | typeof done;
    const iter = this[Symbol.asyncIterator]();

    try {
      while (
        !traverseState.halted &&
        done !== (value = await iter.fastNext(done))
      ) {
        state = await next(
          state,
          value,
          traverseState.nextIndex(),
          traverseState.halt
        );
      }
    } catch (err) {
      await reducer.onClose?.(state, err);
      throw err;
    } finally {
      if (done !== value!) await closeIters(iter);
    }

    await reducer.onClose?.(state);

    return reducer.stateToResult(state);
  }

  reduceStream<R>(reducer: AsyncReducer<T, R>): AsyncStream<R> {
    return new AsyncReduceStream(this, reducer);
  }

  async reduceAll<R extends [unknown, unknown, ...unknown[]]>(
    ...reducers: { [K in keyof R]: AsyncReducer<T, R[K]> }
  ): Promise<any> {
    let state = await Promise.all(
      reducers.map((d: any): unknown => AsyncOptLazy.toMaybePromise(d.init))
    );

    const reducersToClose = new Set(reducers);

    const iter = this[Symbol.asyncIterator]();

    const done = Symbol('Done');
    let value: T | typeof done;
    let index = 0;
    let err: any;

    try {
      while (done !== (value = await iter.fastNext(done))) {
        const v = value;

        state = await Promise.all(
          reducers.map((red, i) => {
            const st = state[i];

            if (!reducersToClose.has(red)) return st;

            return red.next(st, v, index, async () => {
              reducersToClose.delete(red);
              await red.onClose?.(st);
              return st;
            });
          })
        );

        if (reducersToClose.size === 0) {
          break;
        }
        index++;
      }

      return await Promise.all(
        state.map((s: any, i: any): unknown => reducers[i].stateToResult(s))
      );
    } catch (e) {
      err = e;
    } finally {
      if (done !== value!) await closeIters(iter);
      await Promise.all(
        [...reducersToClose].map((r, i) => r.onClose?.(state[i], err))
      );
    }
    if (err) throw err;
  }

  reduceAllStream<R extends [unknown, unknown, ...unknown[]]>(
    ...reducers: { [K in keyof R]: AsyncReducer<T, R[K]> }
  ): any {
    return new AsyncReduceAllStream(this, reducers);
  }

  async toArray(): Promise<T[]> {
    const iterator = this[Symbol.asyncIterator]();
    const result: T[] = [];
    const done = Symbol('Done');
    let value: T | typeof done;

    try {
      while (done !== (value = await iterator.fastNext(done))) {
        result.push(value);
      }

      return result;
    } finally {
      if (done !== value!) await closeIters(iterator);
    }
  }

  toString(): string {
    return `AsyncStream(...<potentially empty>)`;
  }

  async toJSON(): Promise<ToJSON<T[], 'AsyncStream'>> {
    return {
      dataType: 'AsyncStream',
      value: await this.toArray(),
    };
  }
}

export class AsyncFromStream<T> extends AsyncStreamBase<T> {
  [Symbol.asyncIterator]: () => AsyncFastIterator<T>;

  constructor(readonly createIterator: () => AsyncFastIterator<T>) {
    super();
    this[Symbol.asyncIterator] = createIterator;
  }
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

class AsyncIntersperseStream<T> extends AsyncStreamBase<T> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly sepStream: AsyncStream<T>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncIntersperseIterator(
      this.source[Symbol.asyncIterator](),
      this.sepStream
    );
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

class AsyncFilterPureStream<
  T,
  A extends readonly unknown[]
> extends AsyncStreamBase<T> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly pred: (value: T, ...args: A) => MaybePromise<boolean>,
    readonly args: A,
    readonly invert = false
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncFilterPureIterator(
      this.source[Symbol.asyncIterator](),
      this.pred,
      this.args,
      this.invert
    );
  }
}

class AsyncCollectStream<T, R> extends AsyncStreamBase<R> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly collectFun: AsyncCollectFun<T, R>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<R> {
    return new AsyncCollectIterator(
      this.source[Symbol.asyncIterator](),
      this.collectFun
    );
  }
}

class AsyncIndicesWhereStream<T> extends AsyncStreamBase<number> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly pred: (value: T) => MaybePromise<boolean>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<number> {
    return new AsyncIndicesWhereIterator(
      this.source[Symbol.asyncIterator](),
      this.pred
    );
  }
}

class AsyncIndicesOfStream<T> extends AsyncStreamBase<number> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly searchValue: T,
    readonly eq: Eq<T>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<number> {
    return new AsyncIndicesOfIterator(
      this.source[Symbol.asyncIterator](),
      this.searchValue,
      this.eq
    );
  }
}

class AsyncTakeWhileStream<T> extends AsyncStreamBase<T> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly pred: (value: T, index: number) => MaybePromise<boolean>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncTakeWhileIterator(
      this.source[Symbol.asyncIterator](),
      this.pred
    );
  }
}

class AsyncDropWhileStream<T> extends AsyncStreamBase<T> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly pred: (value: T, index: number) => MaybePromise<boolean>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncDropWhileIterator(
      this.source[Symbol.asyncIterator](),
      this.pred
    );
  }
}

class AsyncTakeStream<T> extends AsyncStreamBase<T> {
  constructor(readonly source: AsyncStream<T>, readonly amount: number) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncTakeIterator(
      this.source[Symbol.asyncIterator](),
      this.amount
    );
  }

  take(amount: number): AsyncStream<T> {
    if (amount === this.amount) return this;
    return this.source.take(amount);
  }
}

class AsyncDropStream<T> extends AsyncStreamBase<T> {
  constructor(readonly source: AsyncStream<T>, readonly amount: number) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncDropIterator(
      this.source[Symbol.asyncIterator](),
      this.amount
    );
  }

  drop(amount: number): AsyncStream<T> {
    if (amount <= 0) return this;
    return this.source.drop(this.amount + amount);
  }
}

class AsyncSplitWhereStream<T> extends AsyncStreamBase<T[]> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly pred: (value: T, index: number) => MaybePromise<boolean>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T[]> {
    return new AsyncSplitWhereIterator(
      this.source[Symbol.asyncIterator](),
      this.pred
    );
  }
}

class AsyncSplitOnStream<T> extends AsyncStreamBase<T[]> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly sepElem: T,
    readonly eq: Eq<T>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T[]> {
    return new AsyncSplitOnIterator(
      this.source[Symbol.asyncIterator](),
      this.sepElem,
      this.eq
    );
  }
}

class AsyncReduceStream<I, R> extends AsyncStreamBase<R> {
  constructor(
    readonly source: AsyncStream<I>,
    readonly reducerDef: AsyncReducer<I, R>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<R> {
    return new AsyncReduceIterator(
      this.source[Symbol.asyncIterator](),
      this.reducerDef
    );
  }
}

class AsyncReduceAllStream<I, R> extends AsyncStreamBase<R> {
  constructor(
    readonly source: AsyncStream<I>,
    readonly reducers: AsyncReducer<I, any>[]
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<R> {
    return new AsyncReduceAllIterator(
      this.source[Symbol.asyncIterator](),
      this.reducers
    );
  }
}

export class AsyncOfStream<T> extends AsyncStreamBase<T> {
  constructor(readonly values: ArrayNonEmpty<AsyncOptLazy<T>>) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncOfIterator(this.values);
  }
}

export function isAsyncStream(obj: any): obj is AsyncStream<any> {
  return obj instanceof AsyncStreamBase;
}

class AsyncEmptyStream<T = any>
  extends AsyncStreamBase<T>
  implements AsyncStream<T>
{
  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return emptyAsyncFastIterator;
  }

  assumeNonEmpty(): never {
    RimbuError.throwEmptyCollectionAssumedNonEmptyError();
  }

  async forEach(): Promise<void> {
    //
  }

  indexed(): AsyncStream<[number, T]> {
    return this as any;
  }

  map<T2>(): AsyncStream<T2> {
    return this as any;
  }

  mapPure<T2>(): AsyncStream<T2> {
    return this as any;
  }

  flatMap<T2>(): AsyncStream<T2> {
    return this as any;
  }
  filter(): AsyncStream<T> {
    return this;
  }
  filterNot(): AsyncStream<T> {
    return this;
  }
  filterPure(): AsyncStream<T> {
    return this;
  }
  filterNotPure(): AsyncStream<T> {
    return this;
  }
  collect<R>(): AsyncStream<R> {
    return this as any;
  }
  first<O>(otherwise?: AsyncOptLazy<O>): Promise<O> {
    return AsyncOptLazy.toPromise(otherwise!);
  }
  last<O>(otherwise?: AsyncOptLazy<O>): Promise<O> {
    return AsyncOptLazy.toPromise(otherwise!);
  }
  async count(): Promise<0> {
    return 0;
  }
  async countElement(): Promise<0> {
    return 0;
  }
  async countNotElement(): Promise<0> {
    return 0;
  }
  find<O>(
    pred: (value: any, index: number) => boolean,
    occurrance?: number,
    otherwise?: AsyncOptLazy<O>
  ): Promise<O> {
    return AsyncOptLazy.toPromise(otherwise!);
  }
  elementAt<O>(index: number, otherwise?: AsyncOptLazy<O>): Promise<O> {
    return AsyncOptLazy.toPromise(otherwise!);
  }
  indicesWhere(): AsyncStream<number> {
    return this as any;
  }
  indicesOf(): AsyncStream<number> {
    return this as any;
  }
  async indexWhere(): Promise<undefined> {
    return undefined;
  }
  async indexOf(): Promise<undefined> {
    return undefined;
  }
  async some(): Promise<false> {
    return false;
  }
  async every(): Promise<true> {
    return true;
  }
  async contains(): Promise<false> {
    return false;
  }
  takeWhile(): AsyncStream<T> {
    return this;
  }
  dropWhile(): AsyncStream<T> {
    return this;
  }
  take(): AsyncStream<T> {
    return this;
  }
  drop(): AsyncStream<T> {
    return this;
  }
  repeat(): AsyncStream<T> {
    return this;
  }
  concat(...others: ArrayNonEmpty<AsyncStreamSource<T>>): any {
    if (others.every(isEmptyAsyncStreamSourceInstance)) return this;
    const [source1, source2, ...sources] = others;

    if (undefined === source2) return source1;

    return fromAsyncStreamSource(source1).concat(source2, ...sources);
  }
  min<O>(otherwise?: AsyncOptLazy<O>): Promise<O> {
    return AsyncOptLazy.toPromise(otherwise!);
  }
  minBy<O>(compare: any, otherwise?: AsyncOptLazy<O>): Promise<O> {
    return AsyncOptLazy.toPromise(otherwise!);
  }
  max<O>(otherwise?: AsyncOptLazy<O>): Promise<O> {
    return AsyncOptLazy.toPromise(otherwise!);
  }
  maxBy<O>(compare: any, otherwise?: AsyncOptLazy<O>): Promise<O> {
    return AsyncOptLazy.toPromise(otherwise!);
  }
  intersperse(): AsyncStream<T> {
    return this;
  }
  async join({
    start = '',
    end = '',
    ifEmpty = undefined,
  } = {}): Promise<string> {
    if (undefined !== ifEmpty) return ifEmpty;

    return start.concat(end);
  }
  mkGroup({
    start = emptyAsyncStream as AsyncStreamSource<T>,
    end = emptyAsyncStream as AsyncStreamSource<T>,
  } = {}): AsyncStream.NonEmpty<T> {
    return fromAsyncStreamSource(start).concat(end) as any;
  }
  fold<R>(init: AsyncOptLazy<R>): Promise<R> {
    return AsyncOptLazy.toPromise(init);
  }
  foldStream<R>(): AsyncStream<R> {
    return this as any;
  }
  async reduce<O>(reducer: AsyncReducer<T, O>): Promise<O> {
    return reducer.stateToResult(Reducer.Init(reducer.init));
  }
  reduceStream(): any {
    return this;
  }
  async reduceAll(...reducers: any): Promise<any> {
    return reducers.map((p: any) => p.stateToResult(Reducer.Init(p.init)));
  }
  reduceAllStream(): AsyncStream<any> {
    return this;
  }
  async toArray(): Promise<[]> {
    return [];
  }
  toString(): string {
    return `AsyncStream(<empty>)`;
  }
}

export class FromSource<T> extends AsyncStreamBase<T> {
  constructor(
    readonly source: AsyncStreamSource<T>,
    readonly close?: () => MaybePromise<void>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return asyncStreamSourceToIterator(this.source, this.close);
  }
}

export class FromResource<T, R> extends AsyncStreamBase<T> {
  constructor(
    readonly open: () => MaybePromise<R>,
    readonly createSource: (resource: R) => MaybePromise<AsyncStreamSource<T>>,
    readonly close: (resource: R) => MaybePromise<void>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new FromResourceIterator(this.open, this.createSource, this.close);
  }
}

export const emptyAsyncStream: AsyncStream<any> = Object.freeze(
  new AsyncEmptyStream()
);

export function isEmptyAsyncStreamSourceInstance(
  source: AsyncStreamSource<any>
): boolean {
  return (
    source === emptyAsyncStream ||
    isEmptyStreamSourceInstance(source as StreamSource<any>)
  );
}

export function asyncStreamSourceToIterator<T>(
  source: AsyncStreamSource<T>,
  close?: () => MaybePromise<void>
): AsyncFastIterator<T> {
  if (source instanceof Function) {
    return new FromPromise(source as any, close);
  }

  if (isEmptyAsyncStreamSourceInstance(source)) {
    return emptyAsyncFastIterator;
  }

  if (typeof source === 'string') {
    return new FromIterator((source as any)[Symbol.iterator](), close);
  }

  if (typeof source === 'object') {
    if (Symbol.asyncIterator in source) {
      const iterator = (source as AsyncIterable<T>)[Symbol.asyncIterator]();

      if (isAsyncFastIterator(iterator)) {
        if (undefined === close) {
          return iterator as AsyncFastIterator<T>;
        }
        if (undefined === iterator.return) {
          (iterator as any).return = close;

          return iterator;
        }

        const oldReturn = iterator.return;

        (iterator as any).return = (): Promise<any> =>
          Promise.all([oldReturn, close]);

        return iterator;
      }

      return new FromAsyncIterator(iterator, close);
    }

    if (`asyncStream` in source) {
      return asyncStreamSourceToIterator((source as any).asyncStream(), close);
    }

    if (Symbol.iterator in source) {
      return new FromIterator((source as any)[Symbol.iterator](), close);
    }
  }

  throw Error('unknown async stream source');
}

export const fromAsyncStreamSource: {
  <T>(source: AsyncStreamSource.NonEmpty<T>): AsyncStream.NonEmpty<T>;
  <T>(source: AsyncStreamSource<T>): AsyncStream<T>;
} = <T>(source: AsyncStreamSource<T>): any => {
  if (undefined === source) return emptyAsyncStream;
  if (isAsyncStream(source)) return source;
  if (isEmptyAsyncStreamSourceInstance(source)) return emptyAsyncStream;

  return new FromSource(source);
};

export const AsyncStreamConstructorsImpl: AsyncStreamConstructors =
  Object.freeze({
    of(...values) {
      return new AsyncOfStream(values) as any;
    },
    from(...sources): any {
      const [first, ...rest] = sources;

      if (rest.length <= 0) {
        return fromAsyncStreamSource(first);
      }

      const [rest1, ...restOther] = rest;

      return fromAsyncStreamSource(first).concat(rest1, ...restOther);
    },
    fromResource(open, createSource, close): any {
      return new FromResource(open, createSource, close);
    },
    zipWith(...sources): any {
      return (zipFun: any): any => {
        if (sources.some(isEmptyAsyncStreamSourceInstance)) {
          return emptyAsyncStream;
        }

        return new AsyncFromStream(
          () => new AsyncZipWithIterator(sources, zipFun)
        );
      };
    },
    zip(...sources): any {
      return AsyncStreamConstructorsImpl.zipWith(...sources)(Array);
    },
    zipAllWith(...sources): any {
      return (fillValue: any, zipFun: any): any => {
        if (sources.every(isEmptyAsyncStreamSourceInstance)) {
          return emptyAsyncStream;
        }

        return new AsyncFromStream(
          (): AsyncFastIterator<any> =>
            new AsyncZipAllWithItererator(fillValue, sources, zipFun)
        );
      };
    },
    zipAll(fillValue, ...sources): any {
      return AsyncStreamConstructorsImpl.zipAllWith(...(sources as any))(
        fillValue,
        Array
      );
    },
    flatten(source: any) {
      return AsyncStreamConstructorsImpl.from(source).flatMap((s: any) => s);
    },
    unzip(source, length) {
      if (isEmptyAsyncStreamSourceInstance(source)) {
        return Stream.of(emptyAsyncStream).repeat(length).toArray();
      }

      const result: AsyncStream<unknown>[] = [];
      let i = -1;

      while (++i < length) {
        const index = i;
        result[i] = source.map((t: any): unknown => t[index]);
      }

      return result as any;
    },
    empty<T>(): AsyncStream<T> {
      return emptyAsyncStream;
    },
    always<T>(value: AsyncOptLazy<T>): AsyncStream.NonEmpty<T> {
      return AsyncStreamConstructorsImpl.of(value).repeat();
    },
    unfold<T>(
      init: T,
      next: (current: T, index: number, stop: Token) => MaybePromise<T | Token>
    ): AsyncStream.NonEmpty<T> {
      return new AsyncFromStream(
        (): AsyncFastIterator<T> => new AsyncUnfoldIterator<T>(init, next)
      ) as unknown as AsyncStream.NonEmpty<T>;
    },
  });
