import { RimbuError, Token } from '@rimbu/base';
import {
  ArrayNonEmpty,
  AsyncOptLazy,
  AsyncReducer,
  MaybePromise,
  Reducer,
} from '@rimbu/common';
import type { AsyncStream } from '@rimbu/stream/async';
import type { AsyncFastIterator, AsyncStreamSource } from '@rimbu/stream/async';
import {
  AsyncFastIteratorBase,
  AsyncFromStream,
  AsyncStreamBase,
  closeIters,
  emptyAsyncFastIterator,
  isAsyncFastIterator,
  isEmptyAsyncStreamSourceInstance,
} from '@rimbu/stream/async-custom';
import { StreamConstructorsImpl } from '@rimbu/stream/custom';

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

function isAsyncStream(obj: any): obj is AsyncStream<any> {
  return obj instanceof AsyncStreamBase;
}

const fromAsyncStreamSource: {
  <T>(source: AsyncStreamSource.NonEmpty<T>): AsyncStream.NonEmpty<T>;
  <T>(source: AsyncStreamSource<T>): AsyncStream<T>;
} = <T>(source: AsyncStreamSource<T>): any => {
  if (undefined === source) return AsyncStreamConstructorsImpl.empty();
  if (isAsyncStream(source)) return source;
  if (isEmptyAsyncStreamSourceInstance(source))
    return AsyncStreamConstructorsImpl.empty();

  return new FromSource(source);
};

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

    return AsyncStreamConstructorsImpl.from(source1, source2, ...sources);
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
    start = AsyncStreamConstructorsImpl.empty<T>() as AsyncStreamSource<T>,
    end = AsyncStreamConstructorsImpl.empty<T>() as AsyncStreamSource<T>,
  } = {}): AsyncStream.NonEmpty<T> {
    return AsyncStreamConstructorsImpl.from(start, end) as any;
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

const _empty: AsyncStream<any> = new AsyncEmptyStream();

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
      this.iterator = AsyncStreamConstructorsImpl.from(source)[
        Symbol.asyncIterator
      ]() as any;
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
      this.iterator =
        AsyncStreamConstructorsImpl.from(source)[Symbol.asyncIterator]();
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

class AsyncZipWithIterator<
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
        AsyncStreamConstructorsImpl.from(source)[Symbol.asyncIterator]()
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

class AsyncZipAllWithItererator<
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
        AsyncStreamConstructorsImpl.from(o)[Symbol.asyncIterator]()
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

export interface AsyncStreamConstructors {
  of<T>(...values: ArrayNonEmpty<AsyncOptLazy<T>>): AsyncStream.NonEmpty<T>;
  from<T>(
    ...sources: ArrayNonEmpty<AsyncStreamSource.NonEmpty<T>>
  ): AsyncStream.NonEmpty<T>;
  from<T>(...sources: ArrayNonEmpty<AsyncStreamSource<T>>): AsyncStream<T>;
  fromResource<T, R>(
    open: () => MaybePromise<R>,
    createSource: (resource: R) => AsyncStreamSource.NonEmpty<T>,
    close: (resource: R) => MaybePromise<void>
  ): AsyncStream.NonEmpty<T>;
  fromResource<T, R>(
    open: () => MaybePromise<R>,
    createSource: (resource: R) => MaybePromise<AsyncStreamSource<T>>,
    close: (resource: R) => MaybePromise<void>
  ): AsyncStream<T>;
  /** Returns an AsyncStream with the result of applying given `zipFun` to each successive value resulting from the given `sources`.
   * @param sources - the input async stream sources
   * @param zipFun - a potentially asynchronous function taking one element from each given Stream, and returning a result value
   * @example
   * ```ts
   * await AsyncStream.zipWith(
   *   [1, 2],
   *   [3, 4, 5],
   *   [true, false]
   * )(
   *   async (a, b, c) => c ? a + b : a - b,
   * ).toArray()
   * // => [4, -2]
   * ```
   * @note ends the AsyncStream when any of the given streams ends
   */
  zipWith<I extends readonly unknown[]>(
    ...sources: { [K in keyof I]: AsyncStreamSource.NonEmpty<I[K]> } & unknown[]
  ): <R>(zipFun: (...values: I) => R) => AsyncStream.NonEmpty<R>;
  zipWith<I extends readonly unknown[]>(
    ...sources: { [K in keyof I]: AsyncStreamSource<I[K]> } & unknown[]
  ): <R>(zipFun: (...values: I) => R) => AsyncStream<R>;
  /**
   * Returns an AsyncStream with tuples containing each successive value from the given `sources`.
   * @param sources - the input async stream sources
   * @example
   * ```ts
   * await AsyncStream.zip(
   *   [1, 2, 3],
   *   [4, 5],
   *   ['a', 'b', 'c']
   * ).toArray()
   * // => [[1, 4, 'a'], [2, 5, 'b']]
   * ```
   * @note ends the AsyncStream when any of the given streams ends
   */
  zip<I extends readonly unknown[]>(
    ...sources: { [K in keyof I]: AsyncStreamSource.NonEmpty<I[K]> } & unknown[]
  ): AsyncStream.NonEmpty<I>;
  zip<I extends readonly unknown[]>(
    ...sources: { [K in keyof I]: AsyncStreamSource<I[K]> } & unknown[]
  ): AsyncStream<I>;
  /**
   * Returns an AsyncStream with the result of applying given `zipFun` to each successive value resulting from the given `sources`, adding
   * given `fillValue` to any Streams that end before all streams have ended.
   * @param sources - the input async stream sources
   * @param fillValue - the `AsyncOptLazyz value to add to streams that end early
   * @param zipFun - a potentially asynchronous function taking one element from each given Stream, and returning a result value
   * @example
   * ```ts
   * await AsyncStream.zipAllWith(
   *   [1, 2],
   *   [3, 4, 5],
   *   [6, 7]
   * )(
   *   async () => 0,
   *   async (a, b, c) => a + b + c,
   * ).toArray()
   * // => [10, 13, 5]
   * ```
   */
  zipAllWith<I extends readonly unknown[]>(
    ...sources: { [K in keyof I]: AsyncStreamSource.NonEmpty<I[K]> } & unknown[]
  ): <O, R>(
    fillValue: AsyncOptLazy<O>,
    zipFun: (...values: { [K in keyof I]: I[K] | O }) => MaybePromise<R>
  ) => AsyncStream.NonEmpty<R>;
  zipAllWith<I extends readonly unknown[]>(
    ...sources: { [K in keyof I]: AsyncStreamSource<I[K]> } & unknown[]
  ): <O, R>(
    fillValue: AsyncOptLazy<O>,
    zipFun: (...values: { [K in keyof I]: I[K] | O }) => MaybePromise<R>
  ) => AsyncStream<R>;

  /**
   * Returns an AsyncStream with tuples containing each successive value from the given `sources`, adding given `fillValue` to any streams
   * that end before all streams have ended.
   * @param fillValue - the `AsyncOptLazy` value to add to streams that end early
   * @param sources - the input async stream sources
   * @example
   * ```ts
   * await AsyncStream.zipAll(
   *   0,
   *   [1, 2, 3],
   *   [4, 5],
   *   ['a', 'b', 'c']
   * ).toArray()
   * // => [[1, 4, 'a'], [2, 5, 'b'], [3, 0, 'c']]
   * ```
   * @note ends the AsyncStream when any of the given streams ends
   */
  zipAll<I extends readonly unknown[], O>(
    fillValue: AsyncOptLazy<O>,
    ...sources: { [K in keyof I]: AsyncStreamSource.NonEmpty<I[K]> } & unknown[]
  ): AsyncStream.NonEmpty<{ [K in keyof I]: I[K] | O }>;
  zipAll<I extends readonly unknown[], O>(
    fillValue: AsyncOptLazy<O>,
    ...sources: { [K in keyof I]: AsyncStreamSource<I[K]> } & unknown[]
  ): AsyncStream<{ [K in keyof I]: I[K] | O }>;
  /**
   * Returns an AsyncStream concatenating the given `source` AsyncStreamSource containing StreamSources.
   * @param source - a StreamSource containing nested StreamSources
   * @example
   * ```ts
   * await AsyncStream.flatten(AsyncStream.of([[1, 2], [3], [], [4]])).toArray()  // => [1, 2, 3, 4]
   * await AsyncStream.flatten(AsyncStream.of(['ma', 'r', '', 'mot')).toArray()   // => ['m', 'a', 'r', 'm', 'o', 't']
   * ```
   */
  flatten<T extends AsyncStreamSource.NonEmpty<unknown>>(
    source: AsyncStreamSource.NonEmpty<T>
  ): T extends AsyncStreamSource.NonEmpty<infer S>
    ? AsyncStream.NonEmpty<S>
    : never;
  flatten<T extends AsyncStreamSource<unknown>>(
    source: AsyncStreamSource<T>
  ): T extends AsyncStreamSource<infer S> ? AsyncStream<S> : never;
  /**
   * Returns an array containing an AsyncStream for each tuple element resulting from given `source` AsyncStream.
   * @param source - a Stream containing tuple elements
   * @param length - the tuple length
   * @example
   * ```ts
   * const [a, b] = AsyncStream.unzip(AsyncStream.of([[1, 'a'], [2, 'b']]), 2)
   * await a.toArray()   // => [1, 2]
   * await b.toArray()   // => ['a', 'b']
   * ```
   */
  unzip<T extends readonly unknown[] & { length: L }, L extends number>(
    source: AsyncStream.NonEmpty<T>,
    length: L
  ): { [K in keyof T]: AsyncStream.NonEmpty<T[K]> };
  unzip<T extends readonly unknown[] & { length: L }, L extends number>(
    source: AsyncStream<T>,
    length: L
  ): { [K in keyof T]: AsyncStream<T[K]> };
  empty<T>(): AsyncStream<T>;
  always<T>(value: AsyncOptLazy<T>): AsyncStream.NonEmpty<T>;
  /**
   * Returns a possibly infinite Stream starting with given `init` value, followed by applying given `next` function to the previous value.
   * @param init - an initial value
   * @param next - a function taking the last value, its index, and a stop token, and returning a new value or a stop token
   * @example
   * ```ts
   * Stream.unfold(2, v => v * v).take(4).toArray()   // => [2, 4, 16, 256]
   * ```
   */
  unfold<T>(
    init: T,
    next: (current: T, index: number, stop: Token) => MaybePromise<T | Token>
  ): AsyncStream.NonEmpty<T>;
}

export const AsyncStreamConstructorsImpl: AsyncStreamConstructors = {
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
        return AsyncStreamConstructorsImpl.empty();
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
        return AsyncStreamConstructorsImpl.empty();
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
      return StreamConstructorsImpl.of(AsyncStreamConstructorsImpl.empty())
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
    return _empty;
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
};
