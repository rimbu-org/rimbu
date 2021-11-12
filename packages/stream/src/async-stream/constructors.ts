import { RimbuError, Token } from '@rimbu/base';
import {
  ArrayNonEmpty,
  AsyncOptLazy,
  AsyncReducer,
  MaybePromise,
  Reducer,
} from '@rimbu/common';
import {
  AsyncFastIterator,
  AsyncStream,
  AsyncStreamSource,
  Stream,
} from '../internal';
import {
  AsyncFastIteratorBase,
  AsyncFromStream,
  AsyncStreamBase,
} from './async-stream-custom';
import { closeIters } from './utils';

class AsyncOfIterator<T> extends AsyncFastIteratorBase<T> {
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

class AsyncOfStream<T> extends AsyncStreamBase<T> {
  constructor(readonly values: ArrayNonEmpty<AsyncOptLazy<T>>) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return new AsyncOfIterator(this.values);
  }
}

export function of<T>(
  ...values: ArrayNonEmpty<AsyncOptLazy<T>>
): AsyncStream.NonEmpty<T> {
  return new AsyncOfStream(values) as any;
}

export const from: {
  <T>(
    ...sources: ArrayNonEmpty<AsyncStreamSource.NonEmpty<T>>
  ): AsyncStream.NonEmpty<T>;
  <T>(...sources: ArrayNonEmpty<AsyncStreamSource<T>>): AsyncStream<T>;
} = <T>(...sources: ArrayNonEmpty<AsyncStreamSource<T>>): any => {
  const [first, ...rest] = sources;

  if (rest.length <= 0) {
    return fromAsyncStreamSource(first);
  }

  const [rest1, ...restOther] = rest;

  return fromAsyncStreamSource(first).concat(rest1, ...restOther);
};

export const fromResource: {
  <T, R>(
    open: () => MaybePromise<R>,
    createSource: (resource: R) => AsyncStreamSource.NonEmpty<T>,
    close: (resource: R) => MaybePromise<void>
  ): AsyncStream.NonEmpty<T>;
  <T, R>(
    open: () => MaybePromise<R>,
    createSource: (resource: R) => MaybePromise<AsyncStreamSource<T>>,
    close: (resource: R) => MaybePromise<void>
  ): AsyncStream<T>;
} = (open, createSource, close): any => {
  return new FromResource(open, createSource, close);
};

/**
 * Returns an AsyncStream concatenating the given `source` AsyncStreamSource containing StreamSources.
 * @param source - a StreamSource containing nested StreamSources
 * @example
 * await AsyncStream.flatten(AsyncStream.of([[1, 2], [3], [], [4]])).toArray()  // => [1, 2, 3, 4]
 * await AsyncStream.flatten(AsyncStream.of(['ma', 'r', '', 'mot')).toArray()   // => ['m', 'a', 'r', 'm', 'o', 't']
 */
export const flatten: {
  <T extends AsyncStreamSource.NonEmpty<unknown>>(
    source: AsyncStreamSource.NonEmpty<T>
  ): T extends AsyncStreamSource.NonEmpty<infer S>
    ? AsyncStream.NonEmpty<S>
    : never;
  <T extends AsyncStreamSource<unknown>>(
    source: AsyncStreamSource<T>
  ): T extends AsyncStreamSource<infer S> ? AsyncStream<S> : never;
} = (source: any) => AsyncStream.from(source).flatMap((s: any) => s);

/**
 * Returns an array containing an AsyncStream for each tuple element resulting from given `source` AsyncStream.
 * @param source - a Stream containing tuple elements
 * @param length - the tuple length
 * @example
 * const [a, b] = AsyncStream.unzip(AsyncStream.of([[1, 'a'], [2, 'b']]), 2)
 * await a.toArray()   // => [1, 2]
 * await b.toArray()   // => ['a', 'b']
 */
export const unzip: {
  <T extends readonly unknown[] & { length: L }, L extends number>(
    source: AsyncStream.NonEmpty<T>,
    length: L
  ): { [K in keyof T]: AsyncStream.NonEmpty<T[K]> };
  <T extends readonly unknown[] & { length: L }, L extends number>(
    source: AsyncStream<T>,
    length: L
  ): { [K in keyof T]: AsyncStream<T[K]> };
} = (source, length) => {
  if (AsyncStreamSource.isEmptyInstance(source)) {
    return Stream.of(AsyncStream.empty()).repeat(length).toArray();
  }

  const result: AsyncStream<unknown>[] = [];
  let i = -1;

  while (++i < length) {
    const index = i;
    result[i] = source.map((t: any): unknown => t[index]);
  }

  return result as any;
};

function isAsyncStream(obj: any): obj is AsyncStream<any> {
  return obj instanceof AsyncStreamBase;
}

const fromAsyncStreamSource: {
  <T>(source: AsyncStreamSource.NonEmpty<T>): AsyncStream.NonEmpty<T>;
  <T>(source: AsyncStreamSource<T>): AsyncStream<T>;
} = <T>(source: AsyncStreamSource<T>): any => {
  if (isAsyncStream(source)) return source;
  if (AsyncStreamSource.isEmptyInstance(source)) return AsyncStream.empty();

  return new FromSource(source);
};

class AsyncEmptyStream<T = any>
  extends AsyncStreamBase<T>
  implements AsyncStream<T>
{
  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    return AsyncFastIterator.emptyAsyncFastIterator;
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
  concat<T2 extends T = T>(
    ...others: ArrayNonEmpty<AsyncStreamSource<T2>>
  ): any {
    if (others.every(AsyncStreamSource.isEmptyInstance)) return this;
    const [source1, source2, ...sources] = others;

    if (undefined === source2) return source1;

    return AsyncStream.from(source1, source2, ...sources);
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
  async join({ start = '', end = '' } = {}): Promise<string> {
    return start.concat(end);
  }
  mkGroup<O>({
    start = AsyncStream.empty<O>() as AsyncStreamSource<O>,
    end = AsyncStream.empty<O>() as AsyncStreamSource<O>,
  } = {}): AsyncStream.NonEmpty<O> {
    return AsyncStream.from(start, end) as any;
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
  flatten(): any {
    return this;
  }
  zipWith(): any {
    return this;
  }
  zip(): any {
    return this;
  }
}

const _empty: AsyncStream<any> = new AsyncEmptyStream();

export function empty<T>(): AsyncStream<T> {
  return _empty;
}

class FromAsyncIterator<T> implements AsyncFastIterator<T> {
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

class FromIterator<T> extends AsyncFastIteratorBase<T> {
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

class FromPromise<T> extends AsyncFastIteratorBase<T> {
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
      this.iterator = AsyncStream.from(source)[Symbol.asyncIterator]() as any;
    }

    return this.iterator!.fastNext(otherwise!);
  }
}

function asyncStreamSourceToIterator<T>(
  source: AsyncStreamSource<T>,
  close?: () => MaybePromise<void>
): AsyncFastIterator<T> {
  if (source instanceof Function) {
    return new FromPromise(source as any, close);
  }

  if (AsyncStreamSource.isEmptyInstance(source)) {
    return AsyncFastIterator.emptyAsyncFastIterator;
  }

  if (typeof source === 'string') {
    return new FromIterator((source as any)[Symbol.iterator](), close);
  }

  if (typeof source === 'object') {
    if (Symbol.asyncIterator in source) {
      const iterator = (source as AsyncIterable<T>)[Symbol.asyncIterator]();

      if (AsyncFastIterator.isAsyncFastIterator(iterator)) {
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

class FromSource<T> extends AsyncStreamBase<T> {
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

class FromResourceIterator<T, R> extends AsyncFastIteratorBase<T> {
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
      this.iterator = AsyncStream.from(source)[Symbol.asyncIterator]();
    }

    return this.iterator.fastNext(async () => {
      await this.return?.();

      return AsyncOptLazy.toMaybePromise(otherwise!);
    });
  }
}

class FromResource<T, R> extends AsyncStreamBase<T> {
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

export function always<T>(value: AsyncOptLazy<T>): AsyncStream.NonEmpty<T> {
  return AsyncStream.of(value).repeat();
}

/**
 * Returns a possibly infinite Stream starting with given `init` value, followed by applying given `next` function to the previous value.
 * @param init - an initial value
 * @param next - a function taking the last value, its index, and a stop token, and returning a new value or a stop token
 * @example
 * Stream.unfold(2, v => v * v).take(4).toArray()   // => [2, 4, 16, 256]
 */
export function unfold<T>(
  init: T,
  next: (current: T, index: number, stop: Token) => MaybePromise<T | Token>
): AsyncStream.NonEmpty<T> {
  return new AsyncFromStream(
    (): AsyncFastIterator<T> => new AsyncUnfoldIterator<T>(init, next)
  ) as unknown as AsyncStream.NonEmpty<T>;
}

class AsyncUnfoldIterator<T> extends AsyncFastIteratorBase<T> {
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
