import type { Token } from '@rimbu/base';
import type {
  ArrayNonEmpty,
  IndexRange,
  OptLazy,
  StringNonEmpty,
} from '@rimbu/common';
import type { Stream, StreamSource } from '@rimbu/stream';

export interface StreamConstructors {
  /**
   * Returns an empty Stream of given type T.
   * @typeparam T - the Stream element type
   * @example
   * ```ts
   * Stream.empty<number>().toArray()   // => []
   * ```
   */
  empty<T>(): Stream<T>;
  /**
   * Returns a non-empty Stream containing the given `values`
   * @typeparam T - the Stream element type
   * @param values - the values the Stream should return
   * @example
   * ```ts
   * Stream.of(1, 2, 3).toArray()   // => [1, 2, 3]
   * ```
   */
  of<T>(...values: ArrayNonEmpty<T>): Stream.NonEmpty<T>;
  /**
   * Returns a Stream containing the values in the given `sources` concatenated
   * @typeparam T - the Stream element type
   * @param sources - a non-empty array of `StreamSource` instances containing values
   * @example
   * ```ts
   * Stream.from([1, 2, 3]).toArray()          // => [1, 2, 3]
   * Stream.from('marmot').toArray()           // => ['m', 'a', 'r', 'm', 'o', 't']
   * Stream.from([1, 2, 3], [4, 5]).toArray()  // => [1, 2, 3, 4, 5]
   * ```
   */
  from<T>(
    ...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
  ): Stream.NonEmpty<T>;
  from<T>(...sources: ArrayNonEmpty<StreamSource<T>>): Stream<T>;
  /**
   * Returns a Stream returning elements from the given `array`, taking into account the given options.
   * @typeparam T - the Stream element type
   * @param array - the source of the values for the Stream
   * @param range - (optional) a sub index range of the array
   * @param reversed - (optional) if true reverses the order of the Stream
   * @example
   * ```ts
   * Stream.fromArray([1, 2, 3]).toArray()                       // => [1, 2, 3]
   * Stream.fromArray([1, 2, 3], { start: -2 }).toArray()        // => [1, 2]
   * Stream.fromArray([1, 2, 3], { start: 1 }, true).toArray()   // => [3, 2]
   * ```
   */
  fromArray<T>(
    array: ArrayNonEmpty<T>,
    range?: undefined,
    reversed?: boolean
  ): Stream.NonEmpty<T>;
  fromArray<T>(
    array: readonly T[],
    range?: IndexRange,
    reversed?: boolean
  ): Stream<T>;
  /**
   * Returns a Stream consisting of the object keys from the given `obj` object.
   * @typeparam K - the object key type
   * @param obj - the source object
   * @example
   * ```ts
   * Stream.fromObjectKeys({ a: 1, b: 'b' }).toArray()  // => ['a', 'b']
   * ```
   */
  fromObjectKeys<K extends string | number | symbol>(
    obj: Record<K, any>
  ): Stream<K>;
  /**
   * Returns a Stream consisting of the object values from the given `obj` object.
   * @typeparam V - the object value type
   * @param obj - the source object
   * @example
   * ```ts
   * Stream.fromObjectValues({ a: 1, b: 'b' }).toArray()  // => [1, 'b']
   * ```
   */
  fromObjectValues<V>(obj: Record<any, V> | readonly V[]): Stream<V>;
  /**
   * Returns a Stream consisting of the object entries as tuples from the given `obj` object.
   * @typeparam K - the object key type
   * @typeparam V - the object value type
   * @param obj - the source object
   * @example
   * ```ts
   * Stream.fromObject({ a: 1, b: 'b' }).toArray()   // => [['a', 1], ['b', 'b']]
   * ```
   */
  fromObject<K extends string | number | symbol, V>(
    obj: Record<K, V>
  ): Stream<[K, V]>;
  /**
   * Returns a Stream consisting of the characters from given string `source`, taking into account the given
   * options.
   * @typeparam S - the input string type
   * @param source - the source string
   * @param range - (optional) a sub index range of the string
   * @param reversed - (optional) if true reverses the order of the Stream
   * @example
   * ```ts
   * Stream.fromString('marmot').toArray()                       // => ['m', 'a', 'r', 'm', 'o', 't']
   * Stream.fromString('marmot', { start: -3 }).toArray()        // => ['m', 'o', 't']
   * Stream.fromString('marmot', { amount: 3 }, true).toArray()  // => ['r', 'a', 'm']
   * ```
   */
  fromString<S extends string>(
    source: StringNonEmpty<S>,
    range?: undefined,
    reversed?: boolean
  ): Stream.NonEmpty<string>;
  fromString(
    source: string,
    range?: IndexRange,
    reversed?: boolean
  ): Stream<string>;
  /**
   * Returns a Stream that eternally returns the given `value`.
   * @typeparam T - the element type
   * @param value - the value to return
   * @example
   * ```ts
   * console.log(Stream.always(5).take(4).toArray())
   * => [5, 5, 5, 5]
   * ```
   */
  always<T>(value: T): Stream.NonEmpty<T>;
  /**
   * For a Stream of tuples, supplied each tuple element as an argument to given function `f` for each element of the Stream, with the optionally given `args` as extra arguments.
   * @typeparam T - the Stream element type, should be a tuple
   * @typeparam A - the optional arguments type
   * @param source - a Stream of tuples
   * @param f - the function to perform, receiving each Stream tuple element, and optionally receiving given extra `args`.
   * @param args - (optional) a list of extra arguments to pass to given `f` for each element
   *
   * @note used mostly for performance since a new function is not needed to spread the tuples to arguments
   * @example
   * ```ts
   * Stream.applyForEach([[1, 'a'], [2, 'b']], console.log, 'bongo')
   * // => logs:
   * // 1 a bongo
   * // 2 b bongo
   * ```
   * @note O(N)
   */
  applyForEach<T extends readonly unknown[], A extends readonly unknown[]>(
    source: StreamSource<Readonly<T>>,
    f: (...args: [...T, ...A]) => void,
    ...args: A
  ): void;
  /**
   * For a Stream of tuples in given `source`, returns a Stream with the result of supplying each tuple element as an argument to given `mapFun` function for each element of the Stream,
   * with the optionally given `args` as extra arguments.
   * @typeparam T - the Stream element type, should be a tuple
   * @typeparam A - the optional arguments type
   * @typeparam R - the result Stream element type
   * @param source - a Stream of tuples
   * @param mapFun - a function receiving the tuple elements as arguments, and optionally receiving given extra `args`, and returning the result Stream element.
   * @param args - (optional) extra arguments to pass to given `mapFun` for each element
   *
   * @note used mostly for performance since a new function is not needed to spread the tuples to arguments
   * @example
   * ```ts
   * const s = Stream.applyMap([[1, 'a'], [2, 'b']], List.of, true)
   * console.log(s.toArray())
   * // => [List(1, 'a', true), List(2, 'b', true)]
   * ```
   * @note O(N)
   */
  applyMap<T extends readonly unknown[], A extends readonly unknown[], R>(
    source: StreamSource.NonEmpty<Readonly<T>>,
    mapFun: (...args: [...T, ...A]) => R,
    ...args: A
  ): Stream.NonEmpty<R>;
  applyMap<T extends readonly unknown[], A extends readonly unknown[], R>(
    source: StreamSource<Readonly<T>>,
    mapFun: (...args: [...T, ...A]) => R,
    ...args: A
  ): Stream<R>;
  /**
   * For a Stream of tuples in given `source`, returns a Stream where the result of supplying each tuple element as an argument to given `mapFun` function for each element of the Stream,
   * with the optionally given `args` as extra arguments, is true.
   * @typeparam T - the Stream element type, should be a tuple
   * @typeparam A - the optional arguments type
   * @param source - a Stream of tuples
   * @param pred - a function receiving the tuple elements as arguments, and optionally receiving given extra `args`, and returning true if the element should be included
   * in the result stream.
   * @param args - (optional) extra arguments to pass to given `mapFun` for each element
   *
   * @note used mostly for performance since a new function is not needed to spread the tuples to arguments
   * @example
   * ```ts
   * function sumEq(a: number, b: number, total: number): boolean {
   *   return a + b === total
   * }
   * const s = Stream.applyFilter([[1, 3], [2, 4], [3, 3]], sumEq, 6)
   * console.log(s.toArray())
   * // => [[2, 4], [3, 3]]
   * ```
   * @note O(N)
   */
  applyFilter<T extends readonly unknown[], A extends readonly unknown[]>(
    source: StreamSource<Readonly<T>>,
    pred: (...args: [...T, ...A]) => boolean,
    ...args: A
  ): Stream<T>;
  /**
   * Returns a Stream of numbers within the given `range`, increasing or decreasing with optionally given `delta`.
   * @param range - the range of numbers the Stream can contain
   * @param delta - (default: 1) the difference between a number and the next returned number
   * @example
   * ```ts
   * Stream.range({ amount: 3 }).toArray()              // => [0, 1, 2]
   * Stream.range({ start: 2, amount: 3 }).toArray()    // => [2, 3, 4]
   * Stream.range({ start: 5 }, 2).toArray()            // => [5, 7, 9, .... ]
   * ```
   */
  range(range: IndexRange, delta?: number): Stream<number>;
  /**
   * Returns an infinite Stream containing random numbers between 0 and 1.
   * @example
   * ```ts
   * Stream.random().take(3).toArray()     // => [0.3243..., 0.19524...., 0.78324...]
   * ```
   */
  random(): Stream.NonEmpty<number>;
  /**
   * Returns an infinite Stream containing random integer numbers between given `min` and `max`
   * @param min - the minimum value
   * @param max - the maximum value
   * @example
   * ```ts
   * Stream.randomInt(0, 10).take(3).toArray()    // => [4, 9, 3]
   * ```
   */
  randomInt(min: number, max: number): Stream.NonEmpty<number>;
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
    next: (current: T, index: number, stop: Token) => T | Token
  ): Stream.NonEmpty<T>;
  /**
   * Returns a Stream with the result of applying given `zipFun` to each successive value resulting from the given `sources`.
   * @param sources - the input stream sources
   * @param zipFun - a function taking one element from each given Stream, and returning a result value
   * @example
   * ```ts
   * Stream.zipWith(
   *   [1, 2],
   *   [3, 4, 5],
   *   [true, false]
   * )(
   *   (a, b, c) => c ? a + b : a - b
   * ).toArray()
   * // => [4, -2]
   * ```
   * @note ends the Stream when any of the given streams ends
   */
  zipWith<I extends readonly unknown[]>(
    ...sources: { [K in keyof I]: StreamSource.NonEmpty<I[K]> } & unknown[]
  ): <R>(zipFun: (...values: I) => R) => Stream.NonEmpty<R>;
  zipWith<I extends readonly unknown[]>(
    ...sources: { [K in keyof I]: StreamSource<I[K]> } & unknown[]
  ): <R>(zipFun: (...values: I) => R) => Stream<R>;
  /**
   * Returns a Stream with tuples containing each successive value from the given `sources`.
   * @param sources - the input stream sources
   * @example
   * ```ts
   * Stream.zip([1, 2, 3], [4, 5], ['a', 'b', 'c']).toArray()    // => [[1, 4, 'a'], [2, 5, 'b']]
   * ```
   * @note ends the Stream when any of the given streams ends
   */
  zip<I extends readonly unknown[]>(
    ...sources: { [K in keyof I]: StreamSource.NonEmpty<I[K]> } & unknown[]
  ): Stream.NonEmpty<I>;
  zip<I extends readonly unknown[]>(
    ...sources: { [K in keyof I]: StreamSource<I[K]> } & unknown[]
  ): Stream<I>;
  /**
   * Returns a Stream with the result of applying given `zipFun` to each successive value resulting from the given `sources`, adding
   * given `fillValue` to any Streams that end before all streams have ended.
   * @param sources - the input stream sources
   * @param fillValue - the value to add to streams that end early
   * @param zipFun - a function taking one element from each given Stream, and returning a result value
   * @example
   * ```ts
   * Stream.zipAllWith(
   *   [1, 2],
   *   [3, 4, 5],
   *   [6, 7]
   * )(
   *   0,
   *   (a, b, c) => a + b + c,
   * ).toArray()
   * // => [10, 13, 5]
   * ```
   */
  zipAllWith<I extends readonly unknown[]>(
    ...sources: { [K in keyof I]: StreamSource.NonEmpty<I[K]> } & unknown[]
  ): <O, R>(
    fillValue: OptLazy<O>,
    zipFun: (...values: { [K in keyof I]: I[K] | O }) => R
  ) => Stream.NonEmpty<R>;
  zipAllWith<I extends readonly unknown[]>(
    ...sources: { [K in keyof I]: StreamSource<I[K]> } & unknown[]
  ): <O, R>(
    fillValue: OptLazy<O>,
    zipFun: (...values: { [K in keyof I]: I[K] | O }) => R
  ) => Stream<R>;
  /**
   * Returns a Stream with tuples containing each successive value from the given `sources`, adding given `fillValue` to any Streams
   * that end before all streams have ended.
   * @param fillValue - the value to add to streams that end early
   * @param sources - the input stream sources
   * @example
   * ```ts
   * Stream.zipAll(
   *   0,
   *   [1, 2, 3],
   *   [4, 5],
   *   ['a', 'b', 'c']
   * ).toArray()
   * // => [[1, 4, 'a'], [2, 5, 'b'], [3, 0, 'c']]
   * ```
   */
  zipAll<I extends readonly unknown[], O>(
    fillValue: OptLazy<O>,
    ...sources: { [K in keyof I]: StreamSource.NonEmpty<I[K]> } & unknown[]
  ): Stream.NonEmpty<{ [K in keyof I]: I[K] | O }>;
  zipAll<I extends readonly unknown[], O>(
    fillValue: OptLazy<O>,
    ...sources: { [K in keyof I]: StreamSource<I[K]> } & unknown[]
  ): Stream<{ [K in keyof I]: I[K] | O }>;
  /**
   * Returns a Stream concatenating the given `source` StreamSource containing StreamSources.
   * @example
   * ```ts
   * Stream.flatten(Stream.of([[1, 2], [3], [], [4]])).toArray()  // => [1, 2, 3, 4]
   * Stream.flatten(Stream.of(['ma', 'r', '', 'mot')).toArray()   // => ['m', 'a', 'r', 'm', 'o', 't']
   * ```
   */
  flatten<T extends StreamSource.NonEmpty<unknown>>(
    source: StreamSource.NonEmpty<T>
  ): T extends StreamSource.NonEmpty<infer S> ? Stream.NonEmpty<S> : never;
  flatten<T extends StreamSource<unknown>>(
    source: StreamSource<T>
  ): T extends StreamSource<infer S> ? Stream<S> : never;
  /**
   * Returns an array containing a Stream for each tuple element in this stream.
   * @param length - the stream element tuple length
   * @example
   * ```ts
   * const [a, b] = Stream.unzip(Stream.of([[1, 'a'], [2, 'b']]), 2)
   * a.toArray()   // => [1, 2]
   * b.toArray()   // => ['a', 'b']
   * ```
   */
  unzip<T extends readonly unknown[] & { length: L }, L extends number>(
    source: Stream.NonEmpty<T>,
    length: L
  ): { [K in keyof T]: Stream.NonEmpty<T[K]> };
  unzip<T extends readonly unknown[] & { length: L }, L extends number>(
    source: Stream<T>,
    length: L
  ): { [K in keyof T]: Stream<T[K]> };
}
