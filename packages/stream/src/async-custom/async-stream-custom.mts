import { RimbuError, type Token } from '@rimbu/base';
import {
  AsyncOptLazy,
  Comp,
  Eq,
  TraverseState,
  type ArrayNonEmpty,
  type AsyncCollectFun,
  type MaybePromise,
  type ToJSON,
} from '@rimbu/common';

import { Transformer, type StreamSource } from '@rimbu/stream';
import {
  AsyncReducer,
  AsyncTransformer,
  type AsyncFastIterator,
  type AsyncStream,
  type AsyncStreamSource,
} from '@rimbu/stream/async';
import {
  AsyncAppendFastIterator,
  AsyncCollectFastIterator,
  AsyncConcatFastIterator,
  AsyncDropFastIterator,
  AsyncDropWhileFastIterator,
  AsyncFilterFastIterator,
  AsyncFilterPureFastIterator,
  AsyncIndexedFastIterator,
  AsyncMapFastIterator,
  AsyncMapPureFastIterator,
  AsyncOfFastIterator,
  AsyncPrependFastIterator,
  AsyncReduceFastIterator,
  AsyncRepeatFastIterator,
  AsyncTakeFastIterator,
  AsyncTransformerFastIterator,
  AsyncUnfoldFastIterator,
  AsyncZipAllWithFastItererator,
  AsyncZipWithFastIterator,
  FromAsyncIterator,
  FromIterator,
  FromPromise,
  FromResourceFastIterator,
  closeIters,
  emptyAsyncFastIterator,
  isAsyncFastIterator,
  type AsyncStreamConstructors,
} from '@rimbu/stream/async-custom';
import {
  StreamConstructorsImpl,
  isEmptyStreamSourceInstance,
} from '@rimbu/stream/custom';

export abstract class AsyncStreamBase<T> implements AsyncStream<T> {
  abstract [Symbol.asyncIterator](): AsyncFastIterator<T>;

  asyncStream(): this {
    return this;
  }

  async equals(
    other: AsyncStreamSource<T>,
    options: { eq?: Eq<T>; negate?: boolean } = {}
  ): Promise<boolean> {
    const { eq = Eq.objectIs, negate = false } = options;

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

      if (eq(v1, v2) === negate) {
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
    options: { state?: TraverseState } = {}
  ): Promise<void> {
    const { state = TraverseState() } = options;

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
    } finally {
      if (done !== value!) {
        await closeIters(iterator);
      }
    }
  }

  indexed(options: { startIndex?: number } = {}): AsyncStream<[number, T]> {
    const { startIndex = 0 } = options;

    return new AsyncIndexedStream<T>(this, startIndex);
  }

  filter(
    pred: (value: T, index: number, halt: () => void) => MaybePromise<boolean>,
    options: { negate?: boolean | undefined } = {}
  ): any {
    const { negate = false } = options;

    return new AsyncFilterStream<T>(this, pred, negate);
  }

  filterPure<A extends readonly unknown[]>(
    options: {
      pred: (value: T, ...args: A) => MaybePromise<boolean>;
      negate?: boolean | undefined;
    },
    ...args: A
  ): any {
    const { pred, negate = false } = options;

    return new AsyncFilterPureStream<T, A>(this, pred, args, negate);
  }

  withOnly<F extends T>(values: F[]): AsyncStream<F> {
    if (values.length <= 0) {
      return this as any;
    }

    const set = new Set<T>(values);

    return this.filterPure({ pred: (v) => set.has(v) });
  }

  without<F extends T>(values: F[]): any {
    if (values.length <= 0) {
      return this as any;
    }

    const set = new Set<T>(values);

    return this.filterPure({ pred: (v) => set.has(v), negate: true });
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

  collect<R>(collectFun: AsyncCollectFun<T, R>): AsyncStream<R> {
    return new AsyncCollectStream<T, R>(this, collectFun);
  }

  flatMap<T2>(
    flatMapFun: (
      value: T,
      index: number,
      halt: () => void
    ) => AsyncStreamSource<T2>
  ): AsyncStream<T2> {
    return this.transform(AsyncTransformer.flatMap(flatMapFun));
  }

  flatZip<T2>(
    flatMapFun: (
      value: T,
      index: number,
      halt: () => void
    ) => AsyncStreamSource<T2>
  ): AsyncStream<[T, T2]> {
    return this.transform(AsyncTransformer.flatZip(flatMapFun));
  }

  transform<R>(transformer: AsyncTransformer.Accept<T, R>): AsyncStream<R> {
    return new AsyncTransformerStream(this, transformer);
  }

  async first<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const done = Symbol('done');
    const iter = this[Symbol.asyncIterator]();

    let value: T | typeof done = done;

    try {
      value = await iter.fastNext(done);

      if (done === value) {
        return AsyncOptLazy.toPromise(otherwise!);
      }

      return value;
    } finally {
      if (done !== value) {
        await closeIters(iter);
      }
    }
  }

  async last<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const done = Symbol('Done');
    const iterator = this[Symbol.asyncIterator]();

    try {
      let value: T | typeof done = done;
      let lastValue: T | typeof done = done;

      while (done !== (value = await iterator.fastNext(done))) {
        lastValue = value;
      }

      if (done === lastValue) {
        return AsyncOptLazy.toPromise(otherwise!);
      }

      return lastValue;
    } catch (err) {
      await closeIters(iterator);
      throw err;
    }
  }

  async single<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const iterator = this[Symbol.asyncIterator]();
    const done = Symbol('Done');

    let value: T | typeof done = done;

    try {
      value = await iterator.fastNext(done);

      if (done !== value) {
        const resultValue = value;

        if (done === (value = await iterator.fastNext(done))) {
          return resultValue;
        }
      }

      return AsyncOptLazy.toPromise(otherwise!);
    } finally {
      if (done !== value) {
        await closeIters(iterator);
      }
    }
  }

  async count(): Promise<number> {
    let result = 0;

    const done = Symbol('Done');
    const iterator = this[Symbol.asyncIterator]();

    try {
      while (done !== (await iterator.fastNext(done))) {
        result++;
      }

      return result;
    } catch (err) {
      await closeIters(iterator);
      throw err;
    }
  }

  async countElement(
    value: T,
    options: { eq?: Eq<T>; negate?: boolean } = {}
  ): Promise<number> {
    const { eq = Eq.objectIs, negate = false } = options;

    const done = Symbol('Done');
    const iterator = this[Symbol.asyncIterator]();

    try {
      let result = 0;
      let current: T | typeof done;

      while (done !== (current = await iterator.fastNext(done))) {
        if (eq(value, current) !== negate) {
          result++;
        }
      }

      return result;
    } catch (err) {
      await closeIters(iterator);
      throw err;
    }
  }

  async find<O>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: {
      occurrance?: number | undefined;
      negate?: boolean | undefined;
      otherwise?: AsyncOptLazy<O>;
    } = {}
  ): Promise<T | O> {
    const { occurrance = 1, negate = false, otherwise } = options;

    if (occurrance <= 0) return AsyncOptLazy.toPromise(otherwise!);

    const done = Symbol('Done');
    const iterator = this[Symbol.asyncIterator]();
    let value: T | typeof done;
    let remain = occurrance;
    let index = 0;

    try {
      while (done !== (value = await iterator.fastNext(done))) {
        const cond = await pred(value, index++);
        if (cond !== negate && --remain <= 0) {
          return value;
        }
      }

      return AsyncOptLazy.toPromise(otherwise!);
    } finally {
      if (done !== value!) {
        await closeIters(iterator);
      }
    }
  }

  async elementAt<O>(
    index: number,
    otherwise?: AsyncOptLazy<O>
  ): Promise<T | O> {
    if (index < 0) return AsyncOptLazy.toPromise(otherwise!);

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

      return AsyncOptLazy.toPromise(otherwise!);
    } finally {
      if (done !== value!) {
        await closeIters(iterator);
      }
    }
  }

  indicesWhere(
    pred: (value: T) => MaybePromise<boolean>,
    options: { negate?: boolean } = {}
  ): AsyncStream<number> {
    return this.transform(AsyncTransformer.indicesWhere(pred, options));
  }

  indicesOf(
    searchValue: T,
    options: { eq?: Eq<T>; negate?: boolean } = {}
  ): AsyncStream<number> {
    return this.transform(Transformer.indicesOf(searchValue, options));
  }

  async indexWhere(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: { occurrance?: number; negate?: boolean } = {}
  ): Promise<number | undefined> {
    const { occurrance = 1, negate = false } = options;

    if (occurrance <= 0) {
      return undefined;
    }

    const done = Symbol('Done');
    let value: T | typeof done;
    const iterator = this[Symbol.asyncIterator]();
    let index = 0;
    let occ = 0;

    try {
      while (done !== (value = await iterator.fastNext(done))) {
        const i = index++;

        const cond = await pred(value, i);

        if (cond === !negate) {
          occ++;
          if (occ >= occurrance) {
            return i;
          }
        }
      }

      return undefined;
    } finally {
      if (done !== value!) {
        await closeIters(iterator);
      }
    }
  }

  async indexOf(
    searchValue: T,
    options: {
      occurrance?: number | undefined;
      eq?: Eq<T> | undefined;
      negate?: boolean | undefined;
    } = {}
  ): Promise<number | undefined> {
    const { occurrance = 1, eq = Eq.objectIs, negate = false } = options;

    if (occurrance <= 0) return undefined;

    const done = Symbol('Done');
    let value: T | typeof done;
    const iterator = this[Symbol.asyncIterator]();
    let index = 0;
    let occ = 0;

    try {
      while (done !== (value = await iterator.fastNext(done))) {
        const i = index++;

        if (eq(value, searchValue) !== negate) {
          occ++;
          if (occ >= occurrance) {
            return i;
          }
        }
      }

      return undefined;
    } finally {
      if (done !== value!) {
        await closeIters(iterator);
      }
    }
  }

  async some(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: { negate?: boolean } = {}
  ): Promise<boolean> {
    return undefined !== (await this.indexWhere(pred, options));
  }

  async every(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: { negate?: boolean } = {}
  ): Promise<boolean> {
    const { negate = false } = options;

    return undefined === (await this.indexWhere(pred, { negate: !negate }));
  }

  async contains(
    searchValue: T,
    options: { amount?: number; eq?: Eq<T>; negate?: boolean } = {}
  ): Promise<boolean> {
    const { amount = 1 } = options;

    if (amount <= 0) {
      return true;
    }

    const { eq = Eq.objectIs, negate = false } = options;

    return (
      undefined !==
      (await this.indexOf(searchValue, { occurrance: amount, eq, negate }))
    );
  }

  async containsSlice(
    source: AsyncStreamSource.NonEmpty<T>,
    options: { eq?: Eq<T>; amount?: number } = {}
  ): Promise<boolean> {
    return (this as AsyncStream<T>).reduce(
      AsyncReducer.containsSlice(source, options)
    );
  }

  takeWhile(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: { negate?: boolean } = {}
  ): AsyncStream<T> {
    const { negate = false } = options;

    return this.filter(async (value, index, halt) => {
      const result = (await pred(value, index)) !== negate;

      if (!result) {
        halt();
      }

      return result;
    });
  }

  dropWhile(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: { negate?: boolean } = {}
  ): AsyncStream<T> {
    const { negate = false } = options;

    return new AsyncDropWhileStream(this, pred, negate);
  }

  take(amount: number): AsyncStream<T> {
    if (amount <= 0) {
      return emptyAsyncStream;
    }

    return new AsyncTakeStream<T>(this, amount);
  }

  drop(amount: number): AsyncStream<T> {
    if (amount <= 0) {
      return this;
    }

    return new AsyncDropStream<T>(this, amount);
  }

  repeat(amount?: number): AsyncStream<T> {
    if (undefined !== amount && amount <= 1) {
      return this;
    }

    return new AsyncFromStream<T>(
      () => new AsyncRepeatFastIterator<T>(this, amount)
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

      if (done === result) return AsyncOptLazy.toPromise(otherwise!);

      while (done !== (value = await iterator.fastNext(done))) {
        if (compare(value, result) < 0) result = value;
      }

      return result;
    } catch (err) {
      await closeIters(iterator);
      throw err;
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

    try {
      let result: T | typeof done = await iterator.fastNext(done);

      if (done === result) {
        return AsyncOptLazy.toPromise(otherwise!);
      }

      let value: T | typeof done;

      while (done !== (value = await iterator.fastNext(done))) {
        if (compare(value, result) > 0) result = value;
      }

      return result;
    } catch (err) {
      await closeIters(iterator);
      throw err;
    }
  }

  intersperse(sep: AsyncStreamSource<T>): AsyncStream<T> {
    if (isEmptyAsyncStreamSourceInstance(sep)) {
      return this;
    }

    return this.transform(AsyncTransformer.intersperse(sep));
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
    } catch (err) {
      await closeIters(iterator);
      throw err;
    }
  }

  mkGroup({
    sep = emptyAsyncStream as AsyncStreamSource<T>,
    start = emptyAsyncStream as AsyncStreamSource<T>,
    end = emptyAsyncStream as AsyncStreamSource<T>,
  } = {}): any {
    return fromAsyncStreamSource(start).concat(this.intersperse(sep), end);
  }

  splitWhere<R>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: {
      negate?: boolean | undefined;
      collector?: AsyncReducer.Accept<T, R> | undefined;
    } = {}
  ): AsyncStream<R> {
    return this.transform(AsyncTransformer.splitWhere(pred, options));
  }

  splitOn<R>(
    sepElem: T,
    options: {
      eq?: Eq<T> | undefined;
      negate?: boolean | undefined;
      collector?: AsyncReducer.Accept<T, R> | undefined;
    } = {}
  ): AsyncStream<R> {
    return this.transform(AsyncTransformer.splitOn(sepElem, options));
  }

  splitOnSlice<R>(
    sepSlice: AsyncStreamSource<T>,
    options: {
      eq?: Eq<T> | undefined;
      collector?: AsyncReducer.Accept<T, R> | undefined;
    } = {}
  ): AsyncStream<R> {
    return this.transform(AsyncTransformer.splitOnSlice(sepSlice, options));
  }

  distinctPrevious(
    options: { eq?: Eq<T> | undefined; negate?: boolean | undefined } = {}
  ): AsyncStream<T> {
    return this.transform(Transformer.distinctPrevious(options));
  }

  window<R>(
    windowSize: number,
    options: {
      skipAmount?: number | undefined;
      collector?: AsyncReducer.Accept<T, R> | undefined;
    } = {}
  ): AsyncStream<R> {
    return this.transform(AsyncTransformer.window(windowSize, options as any));
  }

  partition(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: {
      collectorTrue?: any;
      collectorFalse?: any;
    } = {}
  ): Promise<[any, any]> {
    return (this as AsyncStream<T>).reduce<[any, any]>(
      AsyncReducer.partition(pred, options)
    );
  }

  groupBy<K, R>(
    valueToKey: (value: T, index: number) => MaybePromise<K>,
    options: {
      collector?: AsyncReducer.Accept<readonly [K, T], R> | undefined;
    } = {}
  ): Promise<R> {
    return (this as AsyncStream<T>).reduce(
      AsyncReducer.groupBy<T, K, R>(valueToKey, options as any)
    );
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
    return (this as AsyncStream<T>).reduce(AsyncReducer.fold(init, next));
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
    return (this as AsyncStream<T>).reduceStream(AsyncReducer.fold(init, next));
  }

  async reduce<const S extends AsyncReducer.CombineShape<T>>(
    shape: S & AsyncReducer.CombineShape<T>
  ): Promise<AsyncReducer.CombineResult<S>> {
    const reducer = AsyncReducer.combine<T, S>(shape);
    let iter: AsyncFastIterator<T> | undefined;
    let reducerState: unknown;

    try {
      let halted = false;
      const halt = (): void => {
        halted = true;
      };

      reducerState = await reducer.init(halt);

      if (halted) {
        return await reducer.stateToResult(reducerState, 0, halted);
      }

      const done = Symbol('Done');
      iter = this[Symbol.asyncIterator]();
      let index = 0;
      let value: T | typeof done;

      while (!halted && done !== (value = await iter.fastNext(done))) {
        reducerState = await reducer.next(reducerState, value, index++, halt);
      }

      return await reducer.stateToResult(reducerState, index, halted);
    } finally {
      await closeIters(iter);
      if ('onClose' in reducer) {
        await reducer.onClose?.(reducerState);
      }
    }
  }

  reduceStream<const S extends AsyncReducer.CombineShape<T>>(
    shape: S & AsyncReducer.CombineShape<T>
  ): AsyncStream<AsyncReducer.CombineResult<S>> {
    const reducer = AsyncReducer.combine<T, S>(shape) as AsyncReducer<
      T,
      AsyncReducer.CombineResult<S>
    >;

    return new AsyncReduceStream(this, reducer);
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
    } catch (err) {
      await closeIters(iterator);
      throw err;
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
  [Symbol.asyncIterator]: () => AsyncFastIterator<T> = undefined as any;

  constructor(createIterator: () => AsyncFastIterator<T>) {
    super();
    this[Symbol.asyncIterator] = createIterator;
  }
}

class AsyncPrependStream<T> extends AsyncStreamBase<T> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly item: AsyncOptLazy<T>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncPrependFastIterator<T>(
      this.source[Symbol.asyncIterator](),
      this.item
    );
  }

  async first(): Promise<T> {
    return AsyncOptLazy.toPromise(this.item);
  }

  async last(): Promise<T> {
    return this.source.last(this.item);
  }

  async count(): Promise<number> {
    return (await this.source.count()) + 1;
  }

  async forEach(
    f: (value: T, index: number, halt: () => void) => MaybePromise<void>,
    options: { state?: TraverseState } = {}
  ): Promise<void> {
    const { state = TraverseState() } = options;

    if (state.halted) return;

    await f(
      await AsyncOptLazy.toMaybePromise(this.item),
      state.nextIndex(),
      state.halt
    );

    if (state.halted) return;

    await this.source.forEach(f, { state });
  }

  mapPure<T2, A extends readonly unknown[]>(
    mapFun: (value: T, ...args: A) => MaybePromise<T2>,
    ...args: A
  ): AsyncStream<T2> {
    return new AsyncPrependStream(
      this.source.mapPure(mapFun, ...args),
      async () => mapFun(await AsyncOptLazy.toMaybePromise(this.item), ...args)
    );
  }

  take(amount: number): AsyncStream<T> {
    if (amount <= 0) {
      return emptyAsyncStream;
    }

    if (amount === 1) {
      return AsyncStreamConstructorsImpl.of(this.item);
    }

    return new AsyncPrependStream(this.source.take(amount - 1), this.item);
  }

  drop(amount: number): AsyncStream<T> {
    if (amount <= 0) {
      return this;
    }

    if (amount === 1) {
      return this.source;
    }

    return this.source.drop(amount - 1);
  }

  async minBy<O>(compare: (v1: T, v2: T) => number): Promise<T | O> {
    const token = Symbol();
    const result = await this.source.minBy(compare, token);
    const itemValue = await AsyncOptLazy.toMaybePromise(this.item);

    if (token === result) {
      return itemValue;
    }

    return compare(result, itemValue) <= 0 ? result : itemValue;
  }

  async maxBy<O>(compare: (v1: T, v2: T) => number): Promise<T | O> {
    const token = Symbol();
    const result = await this.source.maxBy(compare, token);
    const itemValue = await AsyncOptLazy.toMaybePromise(this.item);

    if (token === result) {
      return itemValue;
    }

    return compare(result, itemValue) > 0 ? result : itemValue;
  }

  async toArray(): Promise<T[]> {
    const result = await this.source.toArray();
    result.unshift(await AsyncOptLazy.toMaybePromise(this.item));
    return result;
  }
}

class AsyncAppendStream<T> extends AsyncStreamBase<T> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly item: AsyncOptLazy<T>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncAppendFastIterator<T>(
      this.source[Symbol.asyncIterator](),
      this.item
    );
  }

  first(): Promise<T> {
    return this.source.first(this.item);
  }

  last(): Promise<T> {
    return AsyncOptLazy.toPromise(this.item);
  }

  async count(): Promise<number> {
    return (await this.source.count()) + 1;
  }

  async forEach(
    f: (value: T, index: number, halt: () => void) => MaybePromise<void>,
    options: { state?: TraverseState } = {}
  ): Promise<void> {
    const { state = TraverseState() } = options;

    if (state.halted) return;

    await this.source.forEach(f, { state });

    if (state.halted) return;

    await f(
      await AsyncOptLazy.toMaybePromise(this.item),
      state.nextIndex(),
      state.halt
    );
  }

  mapPure<T2, A extends readonly unknown[]>(
    mapFun: (value: T, ...args: A) => MaybePromise<T2>,
    ...args: A
  ): AsyncStream<T2> {
    return new AsyncAppendStream(
      this.source.mapPure(mapFun, ...args),
      async () => mapFun(await AsyncOptLazy.toMaybePromise(this.item), ...args)
    );
  }

  async minBy<O>(compare: (v1: T, v2: T) => number): Promise<T | O> {
    const token = Symbol();
    const result = await this.source.minBy(compare, token);
    const itemValue = await AsyncOptLazy.toMaybePromise(this.item);

    if (token === result) {
      return itemValue;
    }

    return compare(result, itemValue) <= 0 ? result : itemValue;
  }

  async maxBy<O>(compare: (v1: T, v2: T) => number): Promise<T | O> {
    const token = Symbol();
    const result = await this.source.maxBy(compare, token);
    const itemValue = await AsyncOptLazy.toMaybePromise(this.item);

    if (token === result) {
      return itemValue;
    }

    return compare(result, itemValue) > 0 ? result : itemValue;
  }

  async toArray(): Promise<T[]> {
    const result = await this.source.toArray();
    result.push(await AsyncOptLazy.toMaybePromise(this.item));
    return result;
  }
}

class AsyncIndexedStream<T> extends AsyncStreamBase<[number, T]> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly startIndex: number
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<[number, T]> {
    return new AsyncIndexedFastIterator<T>(
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
    return new AsyncMapFastIterator(
      this.source[Symbol.asyncIterator](),
      this.mapFun
    );
  }

  async first<O>(otherwise?: AsyncOptLazy<O>): Promise<T2 | O> {
    const done = Symbol('Done');
    const value = await this.source.first(done);
    if (done === value) return AsyncOptLazy.toPromise(otherwise!);
    return this.mapFun(value, 0);
  }

  async last<O>(otherwise?: AsyncOptLazy<O>): Promise<T2 | O> {
    const done = Symbol('Done');
    const value = await this.source.last(done);
    if (done === value) return AsyncOptLazy.toPromise(otherwise!);
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
    if (done === value) return AsyncOptLazy.toPromise(otherwise!);
    return this.mapFun(value, index);
  }

  map<T3>(
    mapFun: (value: T2, index: number) => MaybePromise<T3>
  ): AsyncStream<T3> {
    return new AsyncMapStream<T, T3>(this.source, async (value, index) =>
      mapFun(await this.mapFun(value, index), index)
    );
  }

  take(amount: number): AsyncStream<T2> {
    if (amount <= 0) {
      return emptyAsyncStream;
    }

    return new AsyncMapStream(this.source.take(amount), this.mapFun);
  }

  drop(amount: number): AsyncStream<T2> {
    if (amount <= 0) {
      return this;
    }

    return new AsyncMapStream(this.source.drop(amount), this.mapFun);
  }
}

class AsyncMapPureStream<
  T,
  A extends readonly unknown[],
  T2,
> extends AsyncStreamBase<T2> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly mapFun: (value: T, ...args: A) => MaybePromise<T2>,
    readonly args: A
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T2> {
    return new AsyncMapPureFastIterator<T, A, T2>(
      this.source[Symbol.asyncIterator](),
      this.mapFun,
      this.args
    );
  }

  async first<O>(otherwise?: AsyncOptLazy<O>): Promise<T2 | O> {
    const done = Symbol('Done');
    const value = await this.source.first(done);
    if (done === value) return AsyncOptLazy.toPromise(otherwise!);
    return this.mapFun(value, ...this.args);
  }

  async last<O>(otherwise?: AsyncOptLazy<O>): Promise<T2 | O> {
    const done = Symbol('Done');
    const value = await this.source.last(done);
    if (done === value) return AsyncOptLazy.toPromise(otherwise!);
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
    if (done === value) return AsyncOptLazy.toPromise(otherwise!);
    return this.mapFun(value, ...this.args);
  }

  mapPure<T3, A2 extends readonly unknown[]>(
    mapFun: (value: T2, ...args: A2) => MaybePromise<T3>,
    ...args: A2
  ): AsyncStream<T3> {
    return new AsyncMapPureStream<T, A2, T3>(
      this.source,
      async (value, ...args) =>
        mapFun(await this.mapFun(value, ...this.args), ...args),
      args
    );
  }

  take(amount: number): AsyncStream<T2> {
    if (amount <= 0) {
      return emptyAsyncStream;
    }

    return new AsyncMapPureStream(
      this.source.take(amount),
      this.mapFun,
      this.args
    );
  }

  drop(amount: number): AsyncStream<T2> {
    if (amount <= 0) {
      return this;
    }

    return new AsyncMapPureStream(
      this.source.drop(amount),
      this.mapFun,
      this.args
    );
  }
}

class AsyncConcatStream<T> extends AsyncStreamBase<T> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly otherSources: AsyncStreamSource<T>[]
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncConcatFastIterator(
      this.source,
      this.otherSources,
      asyncStreamSourceHelpers
    );
  }

  async forEach(
    f: (value: T, index: number, halt: () => void) => MaybePromise<void>,
    options: { state?: TraverseState } = {}
  ): Promise<void> {
    const { state = TraverseState() } = options;

    if (state.halted) return;

    await this.source.forEach(f, { state });

    let sourceIndex = -1;
    const sources = this.otherSources;
    const length = sources.length;

    while (!state.halted && ++sourceIndex < length) {
      const source = sources[sourceIndex];

      if (!isEmptyAsyncStreamSourceInstance(source)) {
        await fromAsyncStreamSource(source).forEach(f, { state });
      }
    }
  }

  async forEachPure<A extends readonly unknown[]>(
    f: (value: T, ...args: A) => MaybePromise<void>,
    ...args: A
  ): Promise<void> {
    await this.source.forEachPure(f, ...args);

    let sourceIndex = -1;
    const sources = this.otherSources;
    const length = sources.length;

    while (++sourceIndex < length) {
      const source = sources[sourceIndex];

      if (!isEmptyAsyncStreamSourceInstance(source)) {
        await fromAsyncStreamSource(source).forEachPure(f, ...args);
      }
    }
  }

  async last<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const sources = this.otherSources;
    let sourceIndex = sources.length;

    while (--sourceIndex >= 0) {
      const source = sources[sourceIndex];

      if (!isEmptyAsyncStreamSourceInstance(source)) {
        const done = Symbol('Done');
        const value = await fromAsyncStreamSource(source).last(done);
        if (done !== value) return value;
      }
    }

    return this.source.last(otherwise!);
  }

  async count(): Promise<number> {
    let result = await this.source.count();

    const sources = this.otherSources;
    const length = sources.length;
    let sourceIndex = -1;

    while (++sourceIndex < length) {
      const source = sources[sourceIndex];
      if (!isEmptyAsyncStreamSourceInstance(source)) {
        result += await fromAsyncStreamSource(source).count();
      }
    }

    return result;
  }

  filterPure<A extends readonly unknown[]>(
    options: {
      pred: (value: T, ...args: A) => MaybePromise<boolean>;
      negate?: boolean | undefined;
    },
    ...args: A
  ): any {
    return new AsyncConcatStream(
      this.source.filterPure(options, ...args),
      this.otherSources.map((source) =>
        fromAsyncStreamSource(source).filterPure(options, ...args)
      )
    );
  }

  mapPure<T2, A extends readonly unknown[]>(
    mapFun: (value: T, ...args: A) => MaybePromise<T2>,
    ...args: A
  ): AsyncStream<T2> {
    return new AsyncConcatStream(
      this.source.mapPure(mapFun, ...args),
      this.otherSources.map((source) =>
        fromAsyncStreamSource(source).mapPure(mapFun, ...args)
      )
    );
  }

  concat<T2>(...others2: AsyncStreamSource<T2>[]): any {
    return new AsyncConcatStream<T | T2>(
      this.source,
      (this.otherSources as AsyncStreamSource<T | T2>[]).concat(others2)
    );
  }

  async toArray(): Promise<T[]> {
    let result: T[] = await this.source.toArray();

    let sourceIndex = -1;
    const sources = this.otherSources;
    const length = sources.length;

    while (++sourceIndex < length) {
      const source = sources[sourceIndex];

      if (!isEmptyAsyncStreamSourceInstance(source)) {
        result = result.concat(await fromAsyncStreamSource(source).toArray());
      }
    }

    return result;
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
    readonly negate = false
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncFilterFastIterator<T>(
      this.source[Symbol.asyncIterator](),
      this.pred,
      this.negate
    );
  }

  filterPure<A extends readonly unknown[]>(
    options: {
      pred: (value: T, ...args: A) => MaybePromise<boolean>;
      negate?: boolean | undefined;
    },
    ...args: A
  ): any {
    const { pred, negate = false } = options;
    const { pred: thisPred, negate: thisNegate } = this;

    return new AsyncFilterStream(
      this.source,
      async (value, index, halt) =>
        (await thisPred(value, index, halt)) !== thisNegate &&
        (await pred(value, ...args)) !== negate
    );
  }

  mapPure<T2, A extends readonly unknown[]>(
    mapFun: (value: T, ...args: A) => MaybePromise<T2>,
    ...args: A
  ): AsyncStream<T2> {
    const { pred, negate } = this;

    return new AsyncCollectStream(
      this.source,
      async (value, index, skip, halt) =>
        (await pred(value, index, halt)) !== negate
          ? mapFun(value, ...args)
          : skip
    );
  }
}

class AsyncFilterPureStream<
  T,
  A extends readonly unknown[],
> extends AsyncStreamBase<T> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly pred: (value: T, ...args: A) => MaybePromise<boolean>,
    readonly args: A,
    readonly negate = false
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncFilterPureFastIterator<T, A>(
      this.source[Symbol.asyncIterator](),
      this.pred,
      this.args,
      this.negate
    );
  }

  filterPure<A extends readonly unknown[]>(
    options: {
      pred: (value: T, ...args: A) => MaybePromise<boolean>;
      negate?: boolean | undefined;
    },
    ...args: A
  ): any {
    const { pred, negate = false } = options;

    const thisPred = this.pred;
    const thisArgs = this.args;
    const thisNegate = this.negate;

    return new AsyncFilterPureStream(
      this.source,
      async (value, ...args) => {
        return (
          (await thisPred(value, ...thisArgs)) !== thisNegate &&
          (await pred(value, ...args)) !== negate
        );
      },
      args
    );
  }

  mapPure<T2, A extends readonly unknown[]>(
    mapFun: (value: T, ...args: A) => MaybePromise<T2>,
    ...args: A
  ): AsyncStream<T2> {
    const { pred, negate, args: thisArgs } = this;

    return new AsyncCollectStream(this.source, async (value, _, skip) =>
      (await pred(value, ...thisArgs)) !== negate
        ? mapFun(value, ...args)
        : skip
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
    return new AsyncCollectFastIterator<T, R>(
      this.source[Symbol.asyncIterator](),
      this.collectFun
    );
  }

  filterPure<A extends readonly unknown[]>(
    options: {
      pred: (value: R, ...args: A) => MaybePromise<boolean>;
      negate?: boolean | undefined;
    },
    ...args: A
  ): any {
    const { pred, negate = false } = options;
    const { collectFun } = this;

    return new AsyncCollectStream(
      this.source,
      async (value, index, skip, halt) => {
        const result = await collectFun(value, index, skip, halt);

        if (skip === result || (await pred(result, ...args)) === negate) {
          return skip;
        }

        return result;
      }
    );
  }

  mapPure<T2, A extends readonly unknown[]>(
    mapFun: (value: R, ...args: A) => MaybePromise<T2>,
    ...args: A
  ): AsyncStream<T2> {
    const { collectFun } = this;

    return new AsyncCollectStream(
      this.source,
      async (value, index, skip, halt) => {
        const result = await collectFun(value, index, skip, halt);

        if (skip === result) {
          return skip;
        }

        return mapFun(result, ...args);
      }
    );
  }
}

class AsyncDropWhileStream<T> extends AsyncStreamBase<T> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly pred: (value: T, index: number) => MaybePromise<boolean>,
    readonly negate: boolean
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncDropWhileFastIterator<T>(
      this.source[Symbol.asyncIterator](),
      this.pred,
      this.negate
    );
  }
}

class AsyncTakeStream<T> extends AsyncStreamBase<T> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly amount: number
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncTakeFastIterator<T>(
      this.source[Symbol.asyncIterator](),
      this.amount
    );
  }

  take(amount: number): AsyncStream<T> {
    if (amount <= 0) {
      return emptyAsyncStream;
    }

    if (amount >= this.amount) {
      return this;
    }

    return this.source.take(amount);
  }
}

class AsyncDropStream<T> extends AsyncStreamBase<T> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly amount: number
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncDropFastIterator<T>(
      this.source[Symbol.asyncIterator](),
      this.amount
    );
  }

  drop(amount: number): AsyncStream<T> {
    if (amount <= 0) {
      return this;
    }

    return this.source.drop(this.amount + amount);
  }
}

class AsyncReduceStream<I, R = I> extends AsyncStreamBase<R> {
  constructor(
    readonly source: AsyncStream<I>,
    readonly reducer: AsyncReducer<I, R>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<R> {
    return new AsyncReduceFastIterator<I, R>(
      this.source[Symbol.asyncIterator](),
      this.reducer
    );
  }
}

export class AsyncTransformerStream<T, R = T> extends AsyncStreamBase<R> {
  constructor(
    readonly source: AsyncStream<T>,
    readonly transformer: AsyncTransformer.Accept<T, R>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<R> {
    return new AsyncTransformerFastIterator<T, R>(
      this.source[Symbol.asyncIterator](),
      this.transformer
    );
  }
}

export class AsyncOfStream<T> extends AsyncStreamBase<T> {
  constructor(readonly values: ArrayNonEmpty<AsyncOptLazy<T>>) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncOfFastIterator<T>(this.values);
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

  asyncStream(): this {
    return this;
  }

  async equals(other: AsyncStreamSource<T>): Promise<boolean> {
    if (other === this) return true;

    const done = Symbol('done');

    return (
      done ===
      fromAsyncStreamSource(other)[Symbol.asyncIterator]().fastNext(done)
    );
  }

  prepend(value: AsyncOptLazy<T>): AsyncStream.NonEmpty<T> {
    return AsyncStreamConstructorsImpl.of(value);
  }

  append(value: AsyncOptLazy<T>): AsyncStream.NonEmpty<T> {
    return AsyncStreamConstructorsImpl.of(value);
  }

  assumeNonEmpty(): never {
    RimbuError.throwEmptyCollectionAssumedNonEmptyError();
  }
  async forEach(): Promise<void> {
    //
  }
  async forEachPure(): Promise<void> {
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
  flatZip<T2>(): AsyncStream<[T, T2]> {
    return this as any;
  }
  transform<R>(transformer: AsyncTransformer<T, R>): AsyncStream<R> {
    return fromAsyncStreamSource<R>(async () => {
      let halted = false;
      const state = await transformer.init(() => {
        halted = true;
      });

      return await transformer.stateToResult(state, 0, halted);
    });
  }
  filter(): any {
    return this;
  }
  filterPure(): any {
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
  single<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
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
    options: { otherwise?: AsyncOptLazy<O> } = {}
  ): Promise<O> {
    const { otherwise } = options;

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
  async containsSlice(): Promise<false> {
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
    return undefined !== ifEmpty ? ifEmpty : start.concat(end);
  }
  mkGroup({
    start = emptyAsyncStream as AsyncStreamSource<T>,
    end = emptyAsyncStream as AsyncStreamSource<T>,
  } = {}): AsyncStream.NonEmpty<T> {
    return fromAsyncStreamSource(start).concat(end) as any;
  }
  splitOn<R>(): AsyncStream<R> {
    return this as any;
  }
  splitWhere<R>(): AsyncStream<R> {
    return this as any;
  }
  splitOnSlice<R>(): AsyncStream<R> {
    return this as any;
  }
  distinctPrevious(): AsyncStream<T> {
    return this;
  }
  window<R>(): AsyncStream<R> {
    return this as any;
  }
  fold<R>(init: AsyncOptLazy<R>): Promise<R> {
    return AsyncOptLazy.toPromise(init);
  }
  foldStream<R>(): AsyncStream<R> {
    return this as any;
  }
  async reduce(shape: any): Promise<any> {
    const reducer = AsyncReducer.combine(shape);
    let halted = false;
    const initState = await reducer.init(() => {
      halted = true;
    });

    return await reducer.stateToResult(initState, 0, halted);
  }
  reduceStream(): any {
    return this;
  }
  async toArray(): Promise<[]> {
    return [];
  }
  toString(): string {
    return `AsyncStream(<empty>)`;
  }
  async toJSON(): Promise<ToJSON<T[], 'AsyncStream'>> {
    return {
      dataType: 'AsyncStream',
      value: [],
    };
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
    readonly close?: (resource: R) => MaybePromise<void>
  ) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new FromResourceFastIterator(
      this.open,
      this.createSource,
      this.close,
      asyncStreamSourceHelpers
    );
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
    return new FromPromise(source as any, asyncStreamSourceHelpers, close);
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

// prettier-ignore
export const fromAsyncStreamSource: {
  <T>(source: AsyncStreamSource.NonEmpty<T>): AsyncStream.NonEmpty<T>;
  <T>(source: AsyncStreamSource<T>): AsyncStream<T>;
} = <T,>(source: AsyncStreamSource<T>): any => {
  if (undefined === source) return emptyAsyncStream;
  if (isAsyncStream(source)) return source;
  if (isEmptyAsyncStreamSourceInstance(source)) return emptyAsyncStream;

  return new FromSource(source);
};

const asyncStreamSourceHelpers = {
  fromAsyncStreamSource,
  isEmptyAsyncStreamSourceInstance,
};

export type AsyncStreamSourceHelpers = typeof asyncStreamSourceHelpers;

export const AsyncStreamConstructorsImpl: AsyncStreamConstructors =
  Object.freeze<AsyncStreamConstructors>({
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
    fromResource(options): any {
      const { open, createSource, close } = options;
      return new FromResource(open, createSource, close);
    },
    zipWith(...sources): any {
      return (zipFun: any): any => {
        if (sources.some(isEmptyAsyncStreamSourceInstance)) {
          return emptyAsyncStream;
        }

        return new AsyncFromStream(
          () =>
            new AsyncZipWithFastIterator(
              sources,
              zipFun,
              asyncStreamSourceHelpers
            )
        );
      };
    },
    zip(...sources): any {
      return AsyncStreamConstructorsImpl.zipWith(...(sources as any))(Array);
    },
    zipAllWith(...sources): any {
      return (fillValue: any, zipFun: any): any => {
        if (sources.every(isEmptyAsyncStreamSourceInstance)) {
          return emptyAsyncStream;
        }

        return new AsyncFromStream(
          (): AsyncFastIterator<any> =>
            new AsyncZipAllWithFastItererator(
              fillValue,
              sources,
              zipFun,
              asyncStreamSourceHelpers
            )
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
      return fromAsyncStreamSource(source).flatMap((s: any) => s);
    },
    unzip(source, options) {
      const { length } = options;

      if (isEmptyAsyncStreamSourceInstance(source)) {
        return StreamConstructorsImpl.of(emptyAsyncStream)
          .repeat(length)
          .toArray();
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
        (): AsyncFastIterator<T> => new AsyncUnfoldFastIterator<T>(init, next)
      ) as unknown as AsyncStream.NonEmpty<T>;
    },
  });
