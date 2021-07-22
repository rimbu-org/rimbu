import type {
  ArrayNonEmpty,
  AsyncCollectFun,
  AsyncOptLazy,
  AsyncReducer,
  Eq,
  MaybePromise,
  OptLazy,
  ToJSON,
  TraverseState,
} from '@rimbu/common';
import type {
  AsyncFastIterable,
  AsyncStreamable,
  AsyncStreamSource,
} from '../internal';
import * as Constructors from './constructors';

export interface AsyncStream<T>
  extends AsyncFastIterable<T>,
    AsyncStreamable<T> {
  asyncStream(): this;
  equals(other: AsyncStreamSource<T>, eq?: Eq<T>): Promise<boolean>;
  assumeNonEmpty(): AsyncStream.NonEmpty<T>;
  prepend<T2 = T>(value: AsyncOptLazy<T>): AsyncStream.NonEmpty<T | T2>;
  append<T2 = T>(value: AsyncOptLazy<T2>): AsyncStream.NonEmpty<T | T2>;
  forEach(
    f: (value: T, index: number, halt: () => void) => MaybePromise<void>,
    state?: TraverseState
  ): Promise<void>;
  forEachPure<A extends readonly unknown[]>(
    f: (value: T, ...args: A) => MaybePromise<void>,
    ...args: A
  ): Promise<void>;
  indexed(startIndex?: number): AsyncStream<[number, T]>;
  map<T2>(
    mapFun: (value: T, index: number) => MaybePromise<T2>
  ): AsyncStream<T2>;
  mapPure<T2, A extends readonly unknown[]>(
    mapFun: (value: T, ...args: A) => MaybePromise<T2>,
    ...args: A
  ): AsyncStream<T2>;
  flatMap<T2>(
    flatMapFun: (
      value: T,
      index: number,
      halt: () => void
    ) => AsyncStreamSource<T2>
  ): AsyncStream<T2>;
  filter(
    pred: (value: T, index: number, halt: () => void) => MaybePromise<boolean>
  ): AsyncStream<T>;
  filterNot(
    pred: (value: T, index: number, halt: () => void) => MaybePromise<boolean>
  ): AsyncStream<T>;
  filterPure<A extends readonly unknown[]>(
    pred: (value: T, ...args: A) => MaybePromise<boolean>,
    ...args: A
  ): AsyncStream<T>;
  filterNotPure<A extends readonly unknown[]>(
    pred: (value: T, ...args: A) => MaybePromise<boolean>,
    ...args: A
  ): AsyncStream<T>;
  collect<R>(collectFun: AsyncCollectFun<T, R>): AsyncStream<R>;
  first(): MaybePromise<T | undefined>;
  first<O>(otherwise: AsyncOptLazy<O>): Promise<T | O>;
  last(): Promise<T | undefined>;
  last<O>(otherwise: AsyncOptLazy<O>): Promise<T | O>;
  count(): Promise<number>;
  countElement(value: T, eq?: Eq<T>): Promise<number>;
  countNotElement(value: T, eq?: Eq<T>): Promise<number>;
  find(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    occurrance?: number
  ): Promise<T | undefined>;
  find<O>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    occurrance: number | undefined,
    otherwise: AsyncOptLazy<O>
  ): Promise<T | O>;
  elementAt(index: number): Promise<T | undefined>;
  elementAt<O>(index: number, otherwise: AsyncOptLazy<O>): Promise<T | O>;
  indicesWhere(pred: (value: T) => MaybePromise<boolean>): AsyncStream<number>;
  indicesOf(searchValue: T, eq?: Eq<T>): AsyncStream<number>;
  indexWhere(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    occurrance?: number
  ): Promise<number | undefined>;
  indexOf(
    searchValue: T,
    occurrance?: number,
    eq?: Eq<T>
  ): Promise<number | undefined>;
  some(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): Promise<boolean>;
  every(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): Promise<boolean>;
  contains(value: T, amount?: number, eq?: Eq<T>): Promise<boolean>;
  takeWhile(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): AsyncStream<T>;
  dropWhile(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): AsyncStream<T>;
  take(amount: number): AsyncStream<T>;
  drop(amount: number): AsyncStream<T>;
  repeat(amount?: number): AsyncStream<T>;
  concat<T2 extends T = T>(
    ...others: ArrayNonEmpty<AsyncStreamSource.NonEmpty<T2>>
  ): AsyncStream.NonEmpty<T>;
  concat<T2 extends T = T>(
    ...others: ArrayNonEmpty<AsyncStreamSource<T2>>
  ): AsyncStream<T>;
  min(): Promise<T | undefined>;
  min<O>(otherwise: AsyncOptLazy<O>): Promise<T | O>;
  minBy(compare: (v1: T, v2: T) => number): Promise<T | undefined>;
  minBy<O>(
    compare: (v1: T, v2: T) => number,
    otherwise: AsyncOptLazy<O>
  ): Promise<T | O>;
  max(): Promise<T | undefined>;
  max<O>(otherwise: AsyncOptLazy<O>): Promise<T | O>;
  maxBy(compare: (v1: T, v2: T) => number): Promise<T | undefined>;
  maxBy<O>(
    compare: (v1: T, v2: T) => number,
    otherwise: AsyncOptLazy<O>
  ): Promise<T | O>;
  intersperse<T2>(sep: AsyncStreamSource<T2>): AsyncStream<T | T2>;
  join(options?: {
    sep?: string;
    start?: string;
    end?: string;
    valueToString?: (value: T) => MaybePromise<string>;
  }): Promise<string>;
  mkGroup<T2>(options: {
    sep?: AsyncStreamSource<T2>;
    start: AsyncStreamSource.NonEmpty<T2>;
    end?: AsyncStreamSource<T2>;
  }): AsyncStream.NonEmpty<T | T2>;
  mkGroup<T2>(options: {
    sep?: AsyncStreamSource<T2>;
    start?: AsyncStreamSource<T2>;
    end: AsyncStreamSource.NonEmpty<T2>;
  }): AsyncStream.NonEmpty<T | T2>;
  mkGroup<T2>(options: {
    sep?: AsyncStreamSource<T2>;
    start?: AsyncStreamSource<T2>;
    end?: AsyncStreamSource<T2>;
  }): AsyncStream<T | T2>;
  splitWhere(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): AsyncStream<T[]>;
  splitOn(sepElem: T, eq?: Eq<T>): AsyncStream<T[]>;
  fold<R>(
    init: AsyncOptLazy<R>,
    next: (
      current: R,
      value: T,
      index: number,
      halt: () => void
    ) => MaybePromise<R>
  ): Promise<R>;
  foldStream<R>(
    init: AsyncOptLazy<R>,
    next: (
      current: R,
      value: T,
      index: number,
      halt: () => void
    ) => MaybePromise<R>
  ): AsyncStream<R>;
  reduce<R>(reducer: AsyncReducer<T, R>): Promise<R>;
  reduceStream<R>(reducer: AsyncReducer<T, R>): AsyncStream<R>;
  reduceAll<R extends [unknown, unknown, ...unknown[]]>(
    ...reducers: { [K in keyof R]: AsyncReducer<T, R[K]> }
  ): Promise<R>;
  reduceAllStream<R extends [unknown, unknown, ...unknown[]]>(
    ...reducers: { [K in keyof R]: AsyncReducer<T, R[K]> }
  ): AsyncStream<R>;
  toArray(): Promise<T[]>;
  toString(): string;
  toJSON(): Promise<ToJSON<T[], 'AsyncStream'>>;
  flatten<T2 extends T = T>(): T2 extends AsyncStreamSource.NonEmpty<infer S>
    ? AsyncStream<S>
    : T2 extends AsyncStreamSource<infer S>
    ? AsyncStream<S>
    : never;
  zipWith: {
    <I extends readonly [unknown, ...unknown[]], R>(
      zipFun: (value: T, ...values: I) => MaybePromise<R>,
      ...iters: { [K in keyof I]: AsyncStreamSource<I[K]> }
    ): AsyncStream<R>;
  };
  zip: {
    <I extends readonly [unknown, ...unknown[]]>(
      ...iters: { [K in keyof I]: AsyncStreamSource<I[K]> }
    ): AsyncStream<[T, ...I]>;
  };
  zipAllWith: {
    <I extends readonly [unknown, ...unknown[]], O, R>(
      fillValue: AsyncOptLazy<O>,
      zipFun: (
        value: T | O,
        ...values: { [K in keyof I]: I[K] | O }
      ) => MaybePromise<R>,
      ...streams: { [K in keyof I]: AsyncStreamSource.NonEmpty<I[K]> }
    ): AsyncStream.NonEmpty<R>;
    <I extends readonly [unknown, ...unknown[]], O, R>(
      fillValue: OptLazy<O>,
      zipFun: (
        value: T | O,
        ...values: { [K in keyof I]: I[K] | O }
      ) => MaybePromise<R>,
      ...streams: { [K in keyof I]: AsyncStreamSource<I[K]> }
    ): AsyncStream<R>;
  };
  zipAll: {
    <I extends readonly [unknown, ...unknown[]], O>(
      fillValue: AsyncOptLazy<O>,
      ...streams: { [K in keyof I]: AsyncStreamSource.NonEmpty<I[K]> }
    ): AsyncStream.NonEmpty<[T | O, ...{ [K in keyof I]: I[K] | O }]>;
    <I extends readonly [unknown, ...unknown[]], O>(
      fillValue: AsyncOptLazy<O>,
      ...streams: { [K in keyof I]: AsyncStreamSource<I[K]> }
    ): AsyncStream<[T | O, ...{ [K in keyof I]: I[K] | O }]>;
  };
  unzip<L extends number, T2 extends T = T>(
    length: L
  ): T2 extends readonly [unknown, ...unknown[]] & { length: L }
    ? { [K in keyof T2]: AsyncStream<T2[K]> }
    : never;
}

export namespace AsyncStream {
  export interface NonEmpty<T> extends AsyncStream<T> {
    asNormal(): AsyncStream<T>;
    asyncStream(): this;
    indexed(startIndex?: number): AsyncStream.NonEmpty<[number, T]>;
    map<T2 = T>(
      mapFun: (value: T, index: number) => MaybePromise<T2>
    ): AsyncStream.NonEmpty<T2>;
    flatMap<T2 = T>(
      flatMapFun: (value: T, index: number) => AsyncStreamSource.NonEmpty<T2>
    ): AsyncStream.NonEmpty<T2>;
    flatMap<T2 = T>(
      flatMapFun: (
        value: T,
        index: number,
        halt: () => void
      ) => AsyncStreamSource<T2>
    ): AsyncStream<T2>;
    first(): Promise<T>;
    last(): Promise<T>;
    take(amount: number): AsyncStream<T>;
    repeat(amount?: number): AsyncStream.NonEmpty<T>;
    concat<T2 extends T = T>(
      ...others: ArrayNonEmpty<AsyncStreamSource<T2>>
    ): AsyncStream.NonEmpty<T>;
    min(): Promise<T>;
    minBy(compare: (v1: T, v2: T) => number): Promise<T>;
    max(): Promise<T>;
    maxBy(compare: (v1: T, v2: T) => number): Promise<T>;
    intersperse<T2>(sep: AsyncStreamSource<T2>): AsyncStream.NonEmpty<T | T2>;
    mkGroup<T2>(options: {
      sep?: AsyncStreamSource<T2>;
      start?: AsyncStreamSource<T2>;
      end?: AsyncStreamSource<T2>;
    }): AsyncStream.NonEmpty<T | T2>;
    foldStream<R = T>(
      init: AsyncOptLazy<R>,
      next: (current: R, value: T, index: number) => MaybePromise<R>
    ): AsyncStream.NonEmpty<R>;
    foldStream<R = T>(
      init: AsyncOptLazy<R>,
      next: (
        current: R,
        value: T,
        index: number,
        halt: () => void
      ) => MaybePromise<R>
    ): AsyncStream<R>;
    toArray(): Promise<ArrayNonEmpty<T>>;
    flatten<T2 extends T = T>(): T2 extends AsyncStreamSource.NonEmpty<infer S>
      ? AsyncStream.NonEmpty<S>
      : T2 extends AsyncStreamSource<infer S>
      ? AsyncStream<S>
      : never;
    zipWith: {
      <I extends readonly [unknown, ...unknown[]], R>(
        zipFun: (value: T, ...values: I) => R,
        ...iters: { [K in keyof I]: AsyncStreamSource.NonEmpty<I[K]> }
      ): AsyncStream.NonEmpty<R>;
      <I extends readonly [unknown, ...unknown[]], R>(
        zipFun: (value: T, ...values: I) => MaybePromise<R>,
        ...iters: { [K in keyof I]: AsyncStreamSource<I[K]> }
      ): AsyncStream<R>;
    };
    zip: {
      <I extends readonly [unknown, ...unknown[]]>(
        ...iters: { [K in keyof I]: AsyncStreamSource.NonEmpty<I[K]> }
      ): AsyncStream.NonEmpty<[T, ...I]>;
      <I extends readonly [unknown, ...unknown[]]>(
        ...iters: { [K in keyof I]: AsyncStreamSource<I[K]> }
      ): AsyncStream<[T, ...I]>;
    };
    zipAllWith: {
      <I extends readonly [unknown, ...unknown[]], O, R>(
        fillValue: AsyncOptLazy<O>,
        zipFun: (
          value: T | O,
          ...values: { [K in keyof I]: I[K] | O }
        ) => MaybePromise<R>,
        ...streams: { [K in keyof I]: AsyncStreamSource<I[K]> }
      ): AsyncStream.NonEmpty<R>;
    };
    zipAll: {
      <I extends readonly [unknown, ...unknown[]], O>(
        fillValue: AsyncOptLazy<O>,
        ...streams: { [K in keyof I]: AsyncStreamSource<I[K]> }
      ): AsyncStream.NonEmpty<[T | O, ...{ [K in keyof I]: I[K] | O }]>;
    };
    unzip: {
      <L extends number, T2 extends T = T>(length: L): T2 extends readonly [
        unknown,
        ...unknown[]
      ] & { length: L }
        ? { [K in keyof T2]: AsyncStream.NonEmpty<T2[K]> }
        : never;
    };
  }
}

export const AsyncStream = Constructors;
