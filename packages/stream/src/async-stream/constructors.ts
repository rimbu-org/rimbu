import { RimbuError, Token } from '@rimbu/base';
import { ArrayNonEmpty, OptLazy, Reducer } from '@rimbu/common';
import {
  AsyncFastIterator,
  AsyncOptLazy,
  AsyncStream,
  AsyncStreamable,
  AsyncStreamSource,
  FastIterator,
  Stream,
  StreamSource,
} from '../internal';
import {
  AsyncFastIteratorBase,
  AsyncFromStream,
  AsyncStreamBase,
} from './async-stream-custom';
import type { MaybePromise } from './utils';

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
  fold<R>(init: Reducer.Init<R>): R {
    return Reducer.Init(init);
  }
  foldStream<R>(): AsyncStream<R> {
    return this as any;
  }
  async reduce<O>(reducer: Reducer<T, O>): Promise<O> {
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
  constructor(readonly source: AsyncIterator<T>) {}

  next(): Promise<IteratorResult<T>> {
    return this.source.next();
  }

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const result = await this.source.next();
    if (result.done) return AsyncOptLazy.toPromise(otherwise!);
    return result.value;
  }
}

class FromIterator<T> extends AsyncFastIteratorBase<T> {
  constructor(readonly iterator: Iterator<T>) {
    super();
  }

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    const result = this.iterator.next();
    if (result.done) return AsyncOptLazy.toPromise(otherwise!);
    return result.value;
  }
}

class FromPromise<T> extends AsyncFastIteratorBase<T> {
  constructor(readonly promise: Promise<StreamSource<T>>) {
    super();
  }

  iterator: FastIterator<T> | undefined;

  async fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T | O> {
    if (this.iterator === undefined) {
      const source = await this.promise;
      this.iterator = Stream.from(source)[Symbol.iterator]();
    }

    return this.iterator.fastNext(otherwise!);
  }
}

function asyncStreamSourceToIterator<T>(
  source:
    | AsyncStreamable<T>
    | StreamSource<T>
    | AsyncIterable<T>
    | AsyncGenerator<T>
    | Promise<StreamSource<T>>
): AsyncFastIterator<T> {
  if (AsyncStreamSource.isEmptyInstance(source)) {
    return AsyncFastIterator.emptyAsyncFastIterator;
  }

  if (Symbol.asyncIterator in source) {
    const iterator = (source as AsyncIterable<T>)[Symbol.asyncIterator]();

    if (`fastNext` in iterator) {
      return iterator as AsyncFastIterator<T>;
    }

    return new FromAsyncIterator(iterator);
  }

  if (`asyncStream` in source) {
    return asyncStreamSourceToIterator(
      (source as AsyncStreamable<T>).asyncStream()
    );
  }

  if (Symbol.iterator in source) {
    return new FromIterator((source as any)[Symbol.iterator]());
  }

  if (source instanceof Promise) {
    return new FromPromise(source);
  }

  throw Error('unknown async stream source');
}

class FromSource<T> extends AsyncStreamBase<T> {
  constructor(readonly source: AsyncStreamSource<T>) {
    super();
  }

  [Symbol.asyncIterator](): AsyncFastIterator<T> {
    const source = OptLazy(this.source);
    return asyncStreamSourceToIterator(source);
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
