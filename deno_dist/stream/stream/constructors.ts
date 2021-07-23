import { RimbuError, Token } from '../../base/mod.ts';
import {
  ArrayNonEmpty,
  Eq,
  ErrBase,
  IndexRange,
  OptLazy,
  Range,
  Reducer,
  StringNonEmpty,
  TraverseState,
} from '../../common/mod.ts';
import { FastIterator, Stream, StreamSource } from '../internal.ts';
import {
  FastIteratorBase,
  FromIterable,
  FromStream,
  StreamBase,
} from './stream-custom.ts';

class EmptyStream<T = any> extends StreamBase<T> implements Stream<T> {
  [Symbol.iterator](): FastIterator<T> {
    return FastIterator.emptyFastIterator;
  }

  assumeNonEmpty(): never {
    RimbuError.throwEmptyCollectionAssumedNonEmptyError();
  }

  forEach(): void {
    //
  }

  indexed(): Stream<[number, T]> {
    return this as any;
  }
  map<T2>(): Stream<T2> {
    return this as any;
  }
  mapPure<T2>(): Stream<T2> {
    return this as any;
  }
  flatMap<T2>(): Stream<T2> {
    return this as any;
  }
  filter(): Stream<T> {
    return this;
  }
  filterNot(): Stream<T> {
    return this;
  }
  filterPure(): Stream<T> {
    return this;
  }
  filterNotPure(): Stream<T> {
    return this;
  }
  collect<R>(): Stream<R> {
    return this as any;
  }
  first<O>(otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }
  last<O>(otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }
  count(): 0 {
    return 0;
  }
  countElement(): 0 {
    return 0;
  }
  countNotElement(): 0 {
    return 0;
  }
  find<O>(
    pred: (value: any, index: number) => boolean,
    occurrance?: number,
    otherwise?: OptLazy<O>
  ): O {
    return OptLazy(otherwise) as O;
  }
  elementAt<O>(index: number, otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }
  indicesWhere(): Stream<number> {
    return this as any;
  }
  indicesOf(): Stream<number> {
    return this as any;
  }
  indexWhere(): undefined {
    return undefined;
  }
  indexOf(): undefined {
    return undefined;
  }
  some(): false {
    return false;
  }
  every(): true {
    return true;
  }
  contains(): false {
    return false;
  }
  takeWhile(): Stream<T> {
    return this;
  }
  dropWhile(): Stream<T> {
    return this;
  }
  take(): Stream<T> {
    return this;
  }
  drop(): Stream<T> {
    return this;
  }
  repeat(): Stream<T> {
    return this;
  }
  concat<T2 extends T = T>(...others: ArrayNonEmpty<StreamSource<T2>>): any {
    if (others.every(StreamSource.isEmptyInstance)) return this;
    const [source1, source2, ...sources] = others;

    if (undefined === source2) return source1;

    return Stream.from(source1, source2, ...sources);
  }
  min<O>(otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }
  minBy<O>(compare: any, otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }
  max<O>(otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }
  maxBy<O>(compare: any, otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }
  intersperse(): Stream<T> {
    return this;
  }
  join({ start = '', end = '' } = {}): string {
    return start.concat(end);
  }
  mkGroup<O>({
    start = Stream.empty<O>() as StreamSource<O>,
    end = Stream.empty<O>() as StreamSource<O>,
  } = {}): Stream.NonEmpty<O> {
    return Stream.from(start, end) as any;
  }
  fold<R>(init: Reducer.Init<R>): R {
    return Reducer.Init(init);
  }
  foldStream<R>(): Stream<R> {
    return this as any;
  }
  reduce<O>(reducer: Reducer<T, O>): O {
    return reducer.stateToResult(Reducer.Init(reducer.init));
  }
  reduceStream(): any {
    return this;
  }
  reduceAll(...reducers: any): any {
    return reducers.map((p: any) => p.stateToResult(Reducer.Init(p.init)));
  }
  reduceAllStream(): Stream<any> {
    return this;
  }
  toArray(): [] {
    return [];
  }
  toString(): string {
    return `Stream(<empty>)`;
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

const _empty: Stream<any> = new EmptyStream();

function isStream(obj: any): obj is Stream<any> {
  return obj instanceof StreamBase;
}

const fromStreamSource: {
  <T>(source: StreamSource.NonEmpty<T>): Stream.NonEmpty<T>;
  <T>(source: StreamSource<T>): Stream<T>;
} = <T>(source: StreamSource<T>): any => {
  if (StreamSource.isEmptyInstance(source)) return Stream.empty();
  if (isStream(source)) return source;
  if (typeof source === 'object' && `stream` in source) return source.stream();

  if (Array.isArray(source)) {
    if (source.length <= 0) return Stream.empty();
    return new ArrayStream(source);
  }

  return new FromIterable(source);
};

/**
 * Returns an empty Stream of given type T.
 * @typeparam T - the Stream element type
 * @example
 * Stream.empty<number>().toArray()   // => []
 */
export function empty<T>(): Stream<T> {
  return _empty;
}

/**
 * Returns a non-empty Stream containing the given `values`
 * @typeparam T - the Stream element type
 * @param values - the values the Stream should return
 * @example
 * Stream.of(1, 2, 3).toArray()   // => [1, 2, 3]
 */
export function of<T>(...values: ArrayNonEmpty<T>): Stream.NonEmpty<T> {
  return from(values) as any;
}

/**
 * Returns a Stream containing the values in the given `sources` concatenated
 * @typeparam T - the Stream element type
 * @param sources - a non-empty array of `StreamSource` instances containing values
 * @example
 * Stream.from([1, 2, 3]).toArray()          // => [1, 2, 3]
 * Stream.from('marmot').toArray()           // => ['m', 'a', 'r', 'm', 'o', 't']
 * Stream.from([1, 2, 3], [4, 5]).toArray()  // => [1, 2, 3, 4, 5]
 */
export const from: {
  <T>(...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>): Stream.NonEmpty<T>;
  <T>(...sources: ArrayNonEmpty<StreamSource<T>>): Stream<T>;
} = <T>(...sources: ArrayNonEmpty<StreamSource<T>>): any => {
  const [first, ...rest] = sources;
  if (rest.length <= 0) {
    return fromStreamSource(first);
  }

  const [rest1, ...restOther] = rest;
  return fromStreamSource(first).concat(rest1, ...restOther);
};

/**
 * Returns a Stream returning elements from the given `array`, taking into account the given options.
 * @typeparam T - the Stream element type
 * @param array - the source of the values for the Stream
 * @param range - (optional) a sub index range of the array
 * @param reversed - (optional) if true reverses the order of the Stream
 * @example
 * Stream.fromArray([1, 2, 3]).toArray()                       // => [1, 2, 3]
 * Stream.fromArray([1, 2, 3], { start: -2 }).toArray()        // => [1, 2]
 * Stream.fromArray([1, 2, 3], { start: 1 }, true).toArray()   // => [3, 2]
 */

export const fromArray: {
  <T>(
    array: ArrayNonEmpty<T>,
    range?: undefined,
    reversed?: boolean
  ): Stream.NonEmpty<T>;
  <T>(array: readonly T[], range?: IndexRange, reversed?: boolean): Stream<T>;
} = <T>(array: readonly T[], range?: IndexRange, reversed = false): any => {
  if (array.length === 0) return Stream.empty();

  if (undefined === range) {
    return new ArrayStream(array, undefined, undefined, reversed);
  }

  const result = IndexRange.getIndicesFor(range, array.length);

  if (result === 'empty') {
    return Stream.empty();
  }
  if (result === 'all') {
    return new ArrayStream(array, undefined, undefined, reversed);
  }
  return new ArrayStream(array, result[0], result[1], reversed);
};

/**
 * Returns a Stream consisting of the object entries as tuples from the given `obj` object.
 * @typeparam K - the object key type
 * @typeparam V - the object value type
 * @param obj - the source object
 * @example
 * Stream.fromObject({ a: 1, b: 'b' }).toArray()   // => [['a', 1], ['b', 'b']]
 */
export function fromObject<K extends string | number | symbol, V>(
  obj: Record<K, V>
): Stream<[K, V]> {
  return fromArray(Object.entries(obj) as [K, V][]);
}

/**
 * Returns a Stream consisting of the object keys from the given `obj` object.
 * @typeparam K - the object key type
 * @param obj - the source object
 * @example
 * Stream.fromObjectKeys({ a: 1, b: 'b' }).toArray()  // => ['a', 'b']
 */
export function fromObjectKeys<K extends string | number | symbol>(
  obj: Record<K, any>
): Stream<K> {
  return fromArray(Object.keys(obj) as K[]);
}

/**
 * Returns a Stream consisting of the object values from the given `obj` object.
 * @typeparam V - the object value type
 * @param obj - the source object
 * @example
 * Stream.fromObjectValues({ a: 1, b: 'b' }).toArray()  // => [1, 'b']
 */
export function fromObjectValues<V>(
  obj: Record<any, V> | readonly V[]
): Stream<V> {
  return fromArray(Object.values(obj));
}

/**
 * Returns a Stream consisting of the characters from given string `source`, taking into account the given
 * options.
 * @typeparam S - the input string type
 * @param source - the source string
 * @param range - (optional) a sub index range of the string
 * @param reversed - (optional) if true reverses the order of the Stream
 * @example
 * Stream.fromString('marmot').toArray()                       // => ['m', 'a', 'r', 'm', 'o', 't']
 * Stream.fromString('marmot', { start: -3 }).toArray()        // => ['m', 'o', 't']
 * Stream.fromString('marmot', { amount: 3 }, true).toArray()  // => ['r', 'a', 'm']
 */
export const fromString: {
  <S extends string>(
    source: StringNonEmpty<S>,
    range?: undefined,
    reversed?: boolean
  ): Stream.NonEmpty<string>;
  (source: string, range?: IndexRange, reversed?: boolean): Stream<string>;
} = (source: string, range?: IndexRange, reversed = false) => {
  return fromArray(source as any, range, reversed) as any;
};

export function always<T>(value: T): Stream.NonEmpty<T> {
  return new AlwaysStream(value) as any;
}

/**
 * For a Stream of tuples, supplied each tuple element as an argument to given function `f` for each element of the Stream, with the optionally given `args` as extra arguments.
 * @typeparam T - the Stream element type, should be a tuple
 * @typeparam A - the optional arguments type
 * @param source - a Stream of tuples
 * @param f - the function to perform, receiving each Stream tuple element, and optionally receiving given extra `args`.
 * @param args - (optional) a list of extra arguments to pass to given `f` for each element
 * @note used mostly for performance since a new function is not needed to spread the tuples to arguments
 * @example
 * Stream.applyForEach([[1, 'a'], [2, 'b']], console.log, 'bongo')
 * // => logs:
 * // 1 a bongo
 * // 2 b bongo
 * @note O(N)
 */
export function applyForEach<
  T extends readonly unknown[],
  A extends readonly unknown[]
>(
  source: StreamSource<Readonly<T>>,
  f: (...args: [...T, ...A]) => void,
  ...args: A
): void {
  const iter = Stream.from(source)[Symbol.iterator]();

  const done = Symbol();
  let values: T | typeof done;
  while (done !== (values = iter.fastNext(done))) {
    f(...values, ...args);
  }
}

/**
 * For a Stream of tuples in given `source`, returns a Stream with the result of supplying each tuple element as an argument to given `mapFun` function for each element of the Stream,
 * with the optionally given `args` as extra arguments.
 * @typeparam T - the Stream element type, should be a tuple
 * @typeparam A - the optional arguments type
 * @typeparam R - the result Stream element type
 * @param source - a Stream of tuples
 * @param mapFun - a function receiving the tuple elements as arguments, and optionally receiving given extra `args`, and returning the result Stream element.
 * @param args - (optional) extra arguments to pass to given `mapFun` for each element
 * @note used mostly for performance since a new function is not needed to spread the tuples to arguments
 * @example
 * const s = Stream.applyMap([[1, 'a'], [2, 'b']], List.of, true)
 * console.log(s.toArray())
 * // => [List(1, 'a', true), List(2, 'b', true)]
 * @note O(N)
 */
export const applyMap: {
  <T extends readonly unknown[], A extends readonly unknown[], R>(
    source: StreamSource.NonEmpty<Readonly<T>>,
    mapFun: (...args: [...T, ...A]) => R,
    ...args: A
  ): Stream.NonEmpty<R>;
  <T extends readonly unknown[], A extends readonly unknown[], R>(
    source: StreamSource<Readonly<T>>,
    mapFun: (...args: [...T, ...A]) => R,
    ...args: A
  ): Stream<R>;
} = <T extends readonly unknown[], A extends readonly unknown[], R>(
  source: StreamSource<Readonly<T>>,
  mapFun: (...args: [...T, ...A]) => R,
  ...args: A
) => new MapApplyStream(source, mapFun, args) as any;

/**
 * For a Stream of tuples in given `source`, returns a Stream where the result of supplying each tuple element as an argument to given `mapFun` function for each element of the Stream,
 * with the optionally given `args` as extra arguments, is true.
 * @typeparam T - the Stream element type, should be a tuple
 * @typeparam A - the optional arguments type
 * @param source - a Stream of tuples
 * @param pred - a function receiving the tuple elements as arguments, and optionally receiving given extra `args`, and returning true if the element should be included
 * in the result stream.
 * @param args - (optional) extra arguments to pass to given `mapFun` for each element
 * @note used mostly for performance since a new function is not needed to spread the tuples to arguments
 * @example
 * function sumEq(a: number, b: number, total: number): boolean {
 *   return a + b === total
 * }
 * const s = Stream.applyFilter([[1, 3], [2, 4], [3, 3]], sumEq, 6)
 * console.log(s.toArray())
 * // => [[2, 4], [3, 3]]
 * @note O(N)
 */
export function applyFilter<
  T extends readonly unknown[],
  A extends readonly unknown[]
>(
  source: StreamSource<Readonly<T>>,
  pred: (...args: [...T, ...A]) => boolean,
  ...args: A
): Stream<T> {
  return new FilterApplyStream(source, pred, args);
}

/**
 * For a Stream of tuples in given `source`, returns a Stream where the result of supplying each tuple element as an argument to given `mapFun` function for each element of the Stream,
 * with the optionally given `args` as extra arguments, is false.
 * @typeparam T - the Stream element type, should be a tuple
 * @typeparam A - the optional arguments type
 * @param source - a Stream of tuples
 * @param pred - a function receiving the tuple elements as arguments, and optionally receiving given extra `args`, and returning false if the element should be included
 * in the result stream.
 * @param args - (optional) extra arguments to pass to given `mapFun` for each element
 * @note used mostly for performance since a new function is not needed to spread the tuples to arguments
 * @example
 * function sumEq(a: number, b: number, total: number): boolean {
 *   return a + b === total
 * }
 * const s = Stream.applyFilterNot([[1, 3], [2, 4], [3, 3]], sumEq, 6)
 * console.log(s.toArray())
 * // => [[1, 3]]
 * @note O(N)
 */
export function applyFilterNot<
  T extends readonly unknown[],
  A extends readonly unknown[]
>(
  source: StreamSource<T>,
  pred: (...args: [...T, ...A]) => boolean,
  ...args: A
): Stream<T> {
  return new FilterApplyStream(source, pred, args, true);
}

/**
 * Returns a Stream of numbers within the given `range`, increasing or decreasing with optionally given `delta`.
 * @param range - the range of numbers the Stream can contain
 * @param delta - (default: 1) the difference between a number and the next returned number
 * @example
 * Stream.range({ amount: 3 }).toArray()              // => [0, 1, 2]
 * Stream.range({ start: 2, amount: 3 }).toArray()    // => [2, 3, 4]
 * Stream.range({ start: 5 }, 2).toArray()            // => [5, 7, 9, .... ]
 */
export function range(range: IndexRange, delta = 1): Stream<number> {
  if (undefined !== range.amount) {
    if (range.amount <= 0) return Stream.empty();

    let startIndex = 0;
    if (undefined !== range.start) {
      if (Array.isArray(range.start)) {
        startIndex = range.start[0];
        if (!range.start[1]) startIndex++;
      } else startIndex = range.start;
    }
    const endIndex = startIndex + range.amount - 1;

    return new RangeStream(startIndex, endIndex, delta);
  }

  const { start, end } = Range.getNormalizedRange(range);
  let startIndex = 0;
  let endIndex: number | undefined = undefined;
  if (undefined !== start) {
    startIndex = start[0];
    if (!start[1]) startIndex++;
  }
  if (undefined !== end) {
    endIndex = end[0];
    if (!end[1]) endIndex--;
  }

  if (undefined !== endIndex) {
    if (delta > 0 && endIndex < startIndex) return Stream.empty();
    else if (delta < 0 && startIndex <= endIndex) return Stream.empty();
  }

  return new RangeStream(startIndex, endIndex, delta);
}

/**
 * Returns an infinite Stream containing random numbers between 0 and 1.
 * @example
 * Stream.random().take(3).toArray()     // => [0.3243..., 0.19524...., 0.78324...]
 */
export function random(): Stream.NonEmpty<number> {
  return new FromStream(
    (): FastIterator<number> => new RandomIterator()
  ) as unknown as Stream.NonEmpty<number>;
}

/**
 * Returns an infinite Stream containing random integer numbers between given `min` and `max`
 * @param min - the minimum value
 * @param max - the maximum value
 * @example
 * Stream.randomInt(0, 10).take(3).toArray()    // => [4, 9, 3]
 */
export function randomInt(min: number, max: number): Stream.NonEmpty<number> {
  if (min >= max) ErrBase.msg('min should be smaller than max');

  return new FromStream(
    (): FastIterator<number> => new RandomIntIterator(min, max)
  ) as unknown as Stream.NonEmpty<number>;
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
  next: (current: T, index: number, stop: Token) => T | Token
): Stream.NonEmpty<T> {
  return new FromStream(
    (): FastIterator<T> => new UnfoldIterator<T>(init, next)
  ) as unknown as Stream.NonEmpty<T>;
}

class ArrayIterator<T> extends FastIteratorBase<T> {
  i: number;

  constructor(
    readonly array: readonly T[],
    readonly startIndex: number,
    readonly endIndex: number
  ) {
    super();
    this.i = startIndex;
  }

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    if (this.i > this.endIndex) return OptLazy(otherwise) as O;
    return this.array[this.i++];
  }
}

class ArrayReverseIterator<T> extends FastIteratorBase<T> {
  i: number;

  constructor(
    readonly array: readonly T[],
    readonly startIndex: number,
    endIndex: number
  ) {
    super();
    this.i = endIndex;
  }

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    if (this.i < this.startIndex) return OptLazy(otherwise) as O;
    return this.array[this.i--];
  }
}

class ArrayStream<T> extends StreamBase<T> {
  readonly length: number;

  constructor(
    readonly array: readonly T[],
    readonly startIndex = 0,
    readonly endIndex = array.length - 1,
    readonly reversed = false
  ) {
    super();
    this.length = endIndex - startIndex + 1;
  }

  [Symbol.iterator](): FastIterator<T> {
    if (!this.reversed) {
      return new ArrayIterator(this.array, this.startIndex, this.endIndex);
    }
    return new ArrayReverseIterator(this.array, this.startIndex, this.endIndex);
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state = TraverseState()
  ): void {
    const startIndex = this.startIndex;
    const endIndex = this.endIndex;
    const array = this.array;
    const { halt } = state;

    if (!this.reversed) {
      let i = this.startIndex - 1;
      while (!state.halted && ++i <= endIndex) {
        f(array[i], state.nextIndex(), halt);
      }
    } else {
      let i = endIndex + 1;
      while (!state.halted && --i >= startIndex) {
        f(array[i], state.nextIndex(), halt);
      }
    }
  }

  first<O>(otherwise?: OptLazy<O>): T | O {
    if (this.length <= 0) return OptLazy(otherwise) as O;

    if (!this.reversed) return this.array[this.startIndex];
    return this.array[this.endIndex];
  }

  last<O>(otherwise?: OptLazy<O>): T | O {
    if (this.length <= 0) return OptLazy(otherwise) as O;

    if (!this.reversed) return this.array[this.endIndex];
    return this.array[this.startIndex];
  }

  count(): number {
    return this.endIndex - this.startIndex + 1;
  }

  find<O>(
    pred: (value: T, index: number) => boolean,
    occurrance = 1,
    otherwise?: OptLazy<O>
  ): T | O {
    const startIndex = this.startIndex;
    const endIndex = this.endIndex;
    const array = this.array;
    let remain = occurrance;
    let index = 0;

    if (!this.reversed) {
      let i = startIndex - 1;

      while (++i <= endIndex) {
        const value = array[i];
        if (pred(value, index++) && --remain <= 0) return value;
      }
    } else {
      let i = endIndex + 1;

      while (--i >= startIndex) {
        const value = array[i];
        if (pred(value, index++) && --remain <= 0) return value;
      }
    }

    return OptLazy(otherwise) as O;
  }

  elementAt<O>(index: number, otherwise?: OptLazy<O>): T | O {
    if (index < 0 || index >= this.length) return OptLazy(otherwise) as O;

    if (!this.reversed) return this.array[index + this.startIndex];

    return this.array[this.endIndex - index];
  }

  some(pred: (value: T, index: number) => boolean): boolean {
    const startIndex = this.startIndex;
    const endIndex = this.endIndex;
    const array = this.array;
    let index = 0;

    if (!this.reversed) {
      let i = this.startIndex - 1;
      while (++i <= endIndex) {
        const value = array[i];
        if (pred(value, index++)) return true;
      }
    } else {
      let i = this.endIndex + 1;
      while (--i >= startIndex) {
        const value = array[i];
        if (pred(value, index++)) return true;
      }
    }

    return false;
  }

  every(pred: (value: T, index: number) => boolean): boolean {
    const startIndex = this.startIndex;
    const endIndex = this.endIndex;
    const array = this.array;
    let index = 0;

    if (!this.reversed) {
      let i = startIndex - 1;

      while (++i <= endIndex) {
        const value = array[i];
        if (!pred(value, index++)) return false;
      }
    } else {
      let i = endIndex + 1;

      while (--i >= startIndex) {
        const value = array[i];
        if (!pred(value, index++)) return false;
      }
    }

    return true;
  }

  indexOf(
    searchValue: T,
    occurrance = 1,
    eq: Eq<T> = Object.is
  ): number | undefined {
    if (occurrance <= 0) return undefined;

    let remain = occurrance;

    const startIndex = this.startIndex;
    const endIndex = this.endIndex;
    const array = this.array;

    if (!this.reversed) {
      let i = startIndex - 1;
      while (++i <= endIndex) {
        if (eq(array[i], searchValue) && --remain <= 0) return i - startIndex;
      }
    } else {
      let i = endIndex + 1;
      while (--i >= startIndex) {
        if (eq(array[i], searchValue) && --remain <= 0) return endIndex - i;
      }
    }

    return undefined;
  }

  contains(searchValue: T, amount = 1, eq: Eq<T> = Object.is): boolean {
    if (amount <= 0) return true;

    return undefined !== this.indexOf(searchValue, amount, eq);
  }

  take(amount: number): Stream<T> {
    if (amount <= 0) return Stream.empty();

    if (amount >= this.length) return this;

    if (!this.reversed) {
      return new ArrayStream(
        this.array,
        this.startIndex,
        this.startIndex + amount - 1,
        this.reversed
      );
    }

    return new ArrayStream(
      this.array,
      this.endIndex - (amount - 1),
      this.endIndex,
      this.reversed
    );
  }

  drop(amount: number): Stream<T> {
    if (amount <= 0) return this;

    if (amount >= this.length) return Stream.empty();

    if (!this.reversed) {
      return new ArrayStream(
        this.array,
        this.startIndex + amount,
        this.endIndex,
        this.reversed
      );
    }

    return new ArrayStream(
      this.array,
      this.startIndex,
      this.endIndex - amount,
      this.reversed
    );
  }

  toArray(): T[] {
    const array = this.array;

    if (typeof array === 'string') {
      return super.toArray();
    }

    if (this.reversed) return super.toArray();
    return array.slice(this.startIndex, this.endIndex + 1);
  }
}

class AlwaysStream<T> extends StreamBase<T> {
  constructor(readonly value: T) {
    super();
  }

  [Symbol.iterator](): FastIterator<T> {
    return new AlwaysIterator(this.value);
  }

  first(): T {
    return this.value;
  }

  append(): Stream.NonEmpty<T> {
    return this as any;
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state?: TraverseState
  ): void {
    const s = state ?? TraverseState();
    const value = this.value;

    while (!s.halted) {
      f(value, s.nextIndex(), s.halt);
    }
  }

  last(): T {
    return this.value;
  }

  elementAt(): T {
    return this.value;
  }

  repeat(): Stream<T> {
    return this;
  }

  concat<T2 extends T>(): Stream.NonEmpty<T2> {
    return this as any;
  }

  min(): T {
    return this.value;
  }

  minBy(): T {
    return this.value;
  }

  max(): T {
    return this.value;
  }

  maxBy(): T {
    return this.value;
  }
}

class AlwaysIterator<T> extends FastIteratorBase<T> {
  constructor(readonly value: T) {
    super();
  }

  fastNext(): T {
    return this.value;
  }
}

class MapApplyIterator<
  T extends readonly unknown[],
  A extends readonly unknown[],
  R
> extends FastIteratorBase<R> {
  constructor(
    source: StreamSource<T>,
    readonly f: (...args: [...T, ...A]) => R,
    readonly args: A
  ) {
    super();
    this.iter = Stream.from(source)[Symbol.iterator]();
  }

  iter: FastIterator<T>;

  fastNext<O>(otherwise?: OptLazy<O>): R | O {
    const done = Symbol();
    const next = this.iter.fastNext(done);
    const args = this.args;

    if (done === next) return OptLazy(otherwise)!;
    return this.f(...next, ...args);
  }
}

class MapApplyStream<
  T extends readonly unknown[],
  A extends readonly unknown[],
  R
> extends StreamBase<R> {
  constructor(
    readonly source: StreamSource<T>,
    readonly f: (...args: [...T, ...A]) => R,
    readonly args: A
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<R> {
    return new MapApplyIterator(this.source, this.f, this.args);
  }
}

class FilterApplyIterator<
  T extends readonly unknown[],
  A extends readonly unknown[]
> extends FastIteratorBase<T> {
  constructor(
    source: StreamSource<T>,
    readonly pred: (...args: [...T, ...A]) => boolean,
    readonly args: A,
    readonly invert: boolean
  ) {
    super();
    this.iter = Stream.from(source)[Symbol.iterator]();
  }

  iter: FastIterator<T>;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const done = Symbol();
    let next: T | typeof done;

    const pred = this.pred;
    const iter = this.iter;
    const args = this.args;

    if (this.invert) {
      while (done !== (next = iter.fastNext(done))) {
        if (!pred(...next, ...args)) return next;
      }
    } else {
      while (done !== (next = iter.fastNext(done))) {
        if (pred(...next, ...args)) return next;
      }
    }

    return OptLazy(otherwise)!;
  }
}

class FilterApplyStream<
  T extends readonly unknown[],
  A extends readonly unknown[]
> extends StreamBase<T> {
  constructor(
    readonly source: StreamSource<T>,
    readonly pred: (...args: [...T, ...A]) => boolean,
    readonly args: A,
    readonly invert = false
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<T> {
    return new FilterApplyIterator(
      this.source,
      this.pred,
      this.args,
      this.invert
    );
  }
}

class RangeUpIterator extends FastIteratorBase<number> {
  state: number;

  constructor(
    readonly start = 0,
    readonly end: number | undefined,
    readonly delta: number
  ) {
    super();

    this.state = start;
  }

  fastNext<O>(otherwise?: OptLazy<O>): number | O {
    if (undefined !== this.end) {
      if (this.state > this.end) {
        return OptLazy(otherwise) as O;
      }
    }
    const currentState = this.state;
    this.state += this.delta;
    return currentState;
  }
}

class RangeDownIterator extends FastIteratorBase<number> {
  state: number;

  constructor(
    readonly start = 0,
    readonly end: number | undefined,
    readonly delta: number
  ) {
    super();

    this.state = start;
  }

  fastNext<O>(otherwise?: OptLazy<O>): number | O {
    if (undefined !== this.end) {
      if (this.state < this.end) {
        return OptLazy(otherwise) as O;
      }
    }
    const currentState = this.state;
    this.state += this.delta;
    return currentState;
  }
}

class RangeStream extends StreamBase<number> {
  constructor(
    readonly start: number,
    readonly end?: number,
    readonly delta: number = 1
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<number> {
    if (this.delta >= 0) {
      return new RangeUpIterator(this.start, this.end, this.delta);
    }
    return new RangeDownIterator(this.start, this.end, this.delta);
  }
}

class RandomIterator extends FastIteratorBase<number> {
  fastNext(): number {
    return Math.random();
  }
}

class RandomIntIterator extends FastIteratorBase<number> {
  readonly width: number;

  constructor(readonly min: number, readonly max: number) {
    super();

    this.width = max - min;
  }

  fastNext(): number {
    return this.min + Math.round(Math.random() * this.width);
  }
}

class UnfoldIterator<T> extends FastIteratorBase<T> {
  constructor(
    init: T,
    readonly getNext: (current: T, index: number, stop: Token) => T | Token
  ) {
    super();
    this.current = init;
  }

  current: T | Token;
  index = 0;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const current = this.current;

    if (Token === current) return OptLazy(otherwise) as O;

    if (this.index === 0) {
      this.index++;
      return current;
    }

    const next = this.getNext(current, this.index++, Token);
    this.current = next;

    if (Token === next) return OptLazy(otherwise) as O;

    return next;
  }
}
