import type {
  ArrayNonEmpty,
  CollectFun,
  Eq,
  OptLazy,
  ToJSON,
  TraverseState,
} from '@rimbu/common';

import {
  type StreamConstructors,
  StreamConstructorsImpl,
} from '../custom/index.mjs';
import type {
  FastIterable,
  Streamable,
  StreamSource,
  Transformer,
  Reducer,
} from './index.mjs';

/**
 * A possibly infinite sequence of elements of type T.
 * See the [Stream documentation](https://rimbu.org/docs/collections/stream) and the [Stream API documentation](https://rimbu.org/api/rimbu/stream/Stream/interface)
 * @typeparam T - the element type
 * @example
 * ```ts
 * const s1 = Stream.empty<number>()
 * const s2 = Stream.of(1, 3, 2)
 * const s3 = Stream.range({ start: 10, amount: 15 })
 * ```
 */
export interface Stream<T> extends FastIterable<T>, Streamable<T> {
  /**
   * Returns a stream of elements of type T.
   * @example
   * ```ts
   * Stream.of(1, 2, 3).stream()
   * // => returns itself
   * ```
   */
  stream(): this;
  /**
   * Returns true if the sequence of elements in this stream are equal to the sequence in the `other` stream according to the provided `eq` function.
   * @param other - the other stream to compare
   * @param options - (optional) object specifying the following properties<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
   * - negate: (default: false) when true will negate the `eq` function
   * @example
   * ```ts
   * Stream.of(1, 2, 3).equals([1, 2, 3])     // => true
   * Stream.of(1, 2, 3, 4).equals([1, 2, 3])  // => false
   * ```
   * @note don't use on potentially infinite streams
   * @note O(N)
   */
  equals(
    other: StreamSource<T>,
    options?: { eq?: Eq<T> | undefined; negate?: boolean | undefined }
  ): boolean;
  /**
   * Returns the stream as a non-empty instance.
   * @throws RimbuError.EmptyCollectionAssumedNonEmptyError if the stream is known to be empty.
   * @example
   * ```ts
   * Stream.range({ amount: 100 }).assumeNonEmpty()
   * // => type: Stream.NonEmpty<number>
   * ```
   * @note the function does not actually check if the stream is empty, so treat with extra care
   * @note O(1)
   */
  assumeNonEmpty(): Stream.NonEmpty<T>;
  /**
   * Returns the current stream preceded by the given `value`
   * @param value - the value to prepend
   * @example
   * ```ts
   * Stream.of(1, 2, 3).prepend(0).toArray()
   * // => [0, 1, 2, 3]
   * ```
   * @note O(1)
   */
  prepend(value: OptLazy<T>): Stream.NonEmpty<T>;
  /**
   * Returns the current stream succeeded by the given `value`
   * @param value - the value to append
   * @example
   * ```ts
   * Stream.of(1, 2, 3).append(4).toArray()
   * // => [1, 2, 3, 4]
   * ```
   * @note O(1)
   */
  append(value: OptLazy<T>): Stream.NonEmpty<T>;
  /**
   * Performs given function `f` for each element of the Stream, using given `state` as initial traversal state.
   * @param f - the function to perform for each element, receiving:<br/>
   * - value: the next element<br/>
   * - index: the index of the element<br/>
   * - halt: a function that, if called, ensures that no new elements are passed
   * @param options - (optional) object specifying the following properties<br/>
   * - state: (optional) the traverse state
   * @example
   * ```ts
   * Stream.of(1, 2, 3).forEach((v, i, halt) => {
   *  console.log(v);
   *  if (i >= 1) halt();
   * })
   * // => 1, 2
   * ```
   * @note O(N)
   */
  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    options?: { state?: TraverseState | undefined }
  ): void;
  /**
   * Performs given function `f` for each element of the Stream, with the optionally given `args` as extra arguments.
   * @typeparam A - the type of the arguments to be passed to the `f` function after each element
   * @param f - the function to perform for each element, optionally receiving given extra `args`.
   * @param args - a list of extra arguments to pass to given `f` for each element when needed
   * @typeparam A - the type of the extra arguments to pass
   * @example
   * ```ts
   * Stream.of(1, 2, 3).forEachPure(console.log, 'sheep')
   * // => logs:
   * // 1 sheep
   * // 2 sheep
   * // 3 sheep
   * ```
   * @note O(N)
   */
  forEachPure<A extends readonly unknown[]>(
    f: (value: T, ...args: A) => void,
    ...args: A
  ): void;
  /**
   * Returns a Stream where each element in this Stream is paired with its index
   * @param options - (optional) object specifying the following properties<br/>
   * - startIndex: (optional) an alternative start index to use
   * @example
   * ```ts
   * Stream.of(1, 2, 3).indexed().toArray()
   * // => [[0, 1], [1, 2], [2, 3]]
   * ```
   * @note O(1)
   */
  indexed(options?: { startIndex?: number | undefined }): Stream<[number, T]>;
  /**
   * Returns a Stream where `mapFun` is applied to each element.
   * @typeparam T2 - the resulting element type
   * @param mapFun - a function taking an element and its index, and returning some new element
   * @example
   * ```ts
   * Stream.of(1, 2, 3).map((v, i) => `[${i}]: ${v}`).toArray()
   * // => ['[0]: 1', '[1]: 2', '[2]: 3']
   * ```
   * @note O(1)
   */
  map<T2>(mapFun: (value: T, index: number) => T2): Stream<T2>;
  /**
   * Returns a Stream where the given `mapFun` is applied to each value in the stream, with optionally
   * as extra arguments the given `args`.
   * @typeparam T2 - the result value type
   * @typeparam A - the type of arguments to be supplied to the mapFun after each element
   * @param mapFun - a function taking an element and the given args, and returning the resulting stream value
   * @param args - (optional) the extra arguments to pass to the given `mapFun`
   *
   * @note is mostly aimed to increase performance so that an extra function is not required
   * @note can be used on function that really expect 1 argument, since the normal map will also pass more arguments
   * @example
   * ```ts
   * const s = Stream.of({ a: 1 }, { a: 2, c: { d: true } })
   * const s2 = s.mapPure(JSON.stringify, ['a'], 5)
   * // when stream is evaluated, will call JSON.stringify on each stream element with the given extra arguments
   * console.log(s2.toArray())
   * // => ["{\n \"a\": 1\n}", "{\n \"a\": 2\n}"]
   * ```
   */
  mapPure<T2, A extends readonly unknown[]>(
    mapFun: (value: T, ...args: A) => T2,
    ...args: A
  ): Stream<T2>;
  /**
   * Returns a Stream consisting of the concatenation of `flatMapFun` applied to each element.
   * @typeparam T2 - the resulting element type
   * @param flatMapFun - a function receiving the inputs described below and returning a `StreamSource` of new elements<br/>
   * - value: the next element<br/>
   * - index: the index of the element<br/>
   * - halt: a function that, if called, ensures that no new elements are passed
   *
   * @note O(1)
   * @example
   * ```ts
   * Stream.of(1, 2, 3).flatMap((v, i, halt) => {
   *   if (i >= 1) halt();
   *   return [v, i, v + i]
   * }).toArray()
   * // => [1, 0, 1, 2, 1, 3]
   * ```
   */
  flatMap<T2>(
    flatMapFun: (value: T, index: number, halt: () => void) => StreamSource<T2>
  ): Stream<T2>;
  /**
   * Returns a Stream consisting of the concatenation of `flatMapFun` applied to each element, zipped with the element that was provided to the function.
   * @typeparam T2 - the result element type
   * @param flatMapFun - a function receiving the inputs described below and returning a `StreamSource` of new elements<br/>
   * - value: the next element<br/>
   * - index: the index of the element<br/>
   * - halt: a function that, if called, ensures that no new elements are passed
   *
   * @note O(1)
   * @example
   * ```ts
   * Stream.of(1, 2, 3).flatZip((v, i, halt) => {
   *   if (i >= 1) halt();
   *   return [v, i, v + i]
   * }).toArray()
   * // => [[1, 1], [1, 0], [1, 1], [2, 2], [2, 1], [2, 3]]
   * ```
   */
  flatZip<T2>(
    flatMapFun: (value: T, index: number, halt: () => void) => StreamSource<T2>
  ): Stream<[T, T2]>;
  /**
   * Returns a Stream consisting of the concatenation of StreamSource elements resulting from applying the given `reducer` to each element.
   * @typeparam R - the resulting element type
   * @param transformer - a reducer taking elements ot type T as input, and returing a `StreamSource` of element type R
   * @note O(1)
   * @example
   * ```ts
   * Stream.of(1, 2, 3, 4, 5, 6)
   *   .transform(Transformer.window(3))
   *   .toArray()
   * // => [[1, 2, 3], [4, 5, 6]]
   * ```
   */
  transform<R, T2 extends T = T>(
    transformer: Transformer<T | T2, R>
  ): Stream<R>;
  /**
   * Returns a Stream containing only those elements from this Stream for which the given `pred` function returns true.
   * @param pred - a function taking an element and its index, and returning true if the element should be included in the resulting Stream.
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   *
   * @note O(1)
   * @example
   * ```ts
   * Stream.of(1, 2, 3).filter((v, i) => v + i !== 3).toArray()
   * // => [1, 3]
   * Stream.of(1, 2, 3).filter((v, i) => v + i !== 3, { negate: true }).toArray()
   * // => [2]
   * ```
   */
  filter<TF extends T>(
    pred: (value: T, index: number, halt: () => void) => value is TF,
    options?: { negate?: false | undefined }
  ): Stream<TF>;
  filter<TF extends T>(
    pred: (value: T, index: number, halt: () => void) => value is TF,
    options: { negate: true }
  ): Stream<Exclude<T, TF>>;
  filter(
    pred: (value: T, index: number, halt: () => void) => boolean,
    options?: {
      negate?: boolean | undefined;
    }
  ): Stream<T>;
  /**
   * Returns a Stream containing only those elements from this Stream for which the given `pred` function returns true.
   * @typeparam A - the arguments to be supplied to the `pred` function after each element
   * @param options - object specifying the following properties<br/>
   * - pred: a function taking an element the optionaly given `args`, and returning true if the element should be included in the resulting Stream.<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @param args - the extra arguments to pass to the given `mapFun`
   *
   * @note O(1)
   * @example
   * ```ts
   * Stream.of(1, 2, 3).filterPure({ pred: Object.is }, 2).toArray()
   * // => [2]
   * Stream.of(1, 2, 3).filterPure({ pred: Object.is, negate: true }, 2).toArray()
   * // => [1, 3]
   * ```
   */
  filterPure<A extends readonly unknown[], TF extends T>(options: {
    pred: (value: T, ...args: A) => value is TF;
    negate?: false | undefined;
  }): Stream<TF>;
  filterPure<A extends readonly unknown[], TF extends T>(options: {
    pred: (value: T, ...args: A) => value is TF;
    negate: true;
  }): Stream<Exclude<T, TF>>;
  filterPure<A extends readonly unknown[]>(
    options: {
      pred: (value: T, ...args: A) => boolean;
      negate?: boolean | undefined;
    },
    ...args: A
  ): Stream<T>;
  /**
   * Returns a Stream containing only those elements that are in the given `values` array.
   * @typeparam F - a subtype of T to indicate the resulting element type
   * @param values - an array of values to include
   */
  withOnly<F extends T>(values: F[]): Stream<F>;
  /**
   * Returns a Stream containing all elements except the elements in the given `values` array.
   * @typeparam F - a subtype of T to indicate the resulting element type
   * @param values - an array of values to exclude
   */
  without<F extends T>(
    values: F[]
  ): Stream<T extends Exclude<T, F> ? T : Exclude<T, F>>;
  /**
   * Returns a Stream containing the resulting elements from applying the given `collectFun` to each element in this Stream.
   * @typeparam R - the result element type
   * @param collectFun - a function taking the parameters below and returning a new element or a skip token<br/>
   * - value: the next element<br/>
   * - index: the element index<br/>
   * - skip: an element that can be returned if the current element should be skipped<br/>
   * - halt: a function that, if called, ensures that no new elements are passed
   * @example
   * ```ts
   * Stream.of(1, 2, 3).collect((v, i, skip, halt) => {
   *   if (i === 0) return skip;
   *   if (i === 1) halt();
   *   return String(v)
   * }).toArray();
   * // => ['1']
   * ```
   * @note O(1)
   */
  collect<R>(collectFun: CollectFun<T, R>): Stream<R>;
  /**
   * Returns the first element of the Stream, or a fallback value (default undefined) if the Stream is empty.
   * @typeparam O - the optional value type to return if the stream is empty
   * @param otherwise - (default: undefined) an `OptLazy` value to be returned if the Stream is empty.
   * @example
   * ```ts
   * Stream.of(1, 2, 3).first()      // => 1
   * Stream.empty<number>().first()  // => undefined
   * Stream.empty<number>().first(0) // => 0
   * ```
   * @note O(1)
   */
  first(): T | undefined;
  first<O>(otherwise: OptLazy<O>): T | O;
  /**
   * Returns the last element of the Stream, or a fallback value (default undefined) if the Stream is empty.
   * @typeparam O - the optional value type to return if the stream is empty
   * @param otherwise - (default: undefined) an `OptLazy` value to return if the Stream is empty.
   * @example
   * ```ts
   * Stream.of(1, 2, 3).last()      // => 3
   * Stream.empty<number>().last()  // => undefined
   * Stream.empty<number>().last(0) // => 0
   * ```
   * @note O(N) for most types of Stream
   */
  last(): T | undefined;
  last<O>(otherwise: OptLazy<O>): T | O;
  /**
   * Returns the first element of the Stream if it only has one element, or a fallback value if the Stream does not have exactly one value.
   * @typeparam O - the optional value to return if the stream does not have exactly one value.
   * @param otherwise - (default: undefined) an `OptLazy` value to return if the Stream does not have exactly one value.
   * @example
   * ```ts
   * Stream.empty<number>().single()  // => undefined
   * Stream.of(1, 2, 3).single()      // => undefined
   * Stream.of(1).single()            // => 1
   * Stream.of(1, 2, 3).single(0)     // => 0
   * ```
   */
  single(): T | undefined;
  single<O>(otherwise: OptLazy<O>): T | O;
  /**
   * Returns the amount of elements in the Stream.
   * @example
   * ```ts
   * Stream.of(1, 2, 3).count() // => 3
   * ```
   * @note O(N) for most types of Stream
   * @note be careful not to use on infinite streams
   */
  count(): number;
  /**
   * Returns the amount of elements that are equal according to the given `eq` to the given `value` in the Stream.
   * @param value - the value to compare to
   * @param options - (optional) object specifying the following properties<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
   * - negate: (default: false) when true will negate the given Eq function
   * @example
   * ```ts
   * Stream.of(1, 2, 3).countElement(2) // => 1
   * Stream.of(1, 2, 3).countElement(2, { negate: true }) // => 2
   * ```
   * @note O(N) for most types of Stream
   * @note be careful not to use on infinite streams
   */
  countElement(
    value: T,
    options?: { eq?: Eq<T> | undefined; negate?: boolean | undefined }
  ): number;
  /**
   * Returns the first element for which the given `pred` function returns true, or a fallback value otherwise.
   * @typeparam O - the optional value type to return if no match is found
   * @param pred - a predicate function taking an element and its index
   * @param options - (optional) object specifying the following properties<br/>
   * - occurrance: (default: 1) the occurrance number to look for<br/>
   * - otherwise: (default: undefined) an `OptLazy` value to be returned if the Stream is empty
   * @example
   * ```ts
   * const isEven = (v: number) => v % 2 === 0
   * Stream.of(1, 2, 3, 4).find(isEven)           // => 2
   * Stream.of(1, 2, 3, 4).find(isEven, { occurrance: 2 })        // => 4
   * Stream.of(1, 2, 3, 4).find(isEven, { occurrance: 3 })        // => undefined
   * Stream.of(1, 2, 3, 4).find(isEven, { occurrance: 3, otherwise: 'a' })
   * // => 'a'
   * ```
   * @note O(N) for most types of Stream
   */
  find<O, TF extends T>(
    pred: (value: T, index: number) => value is TF,
    options: {
      occurrance?: number | undefined;
      negate?: false | undefined;
      otherwise: OptLazy<O>;
    }
  ): TF | O;
  find<O, TF extends T>(
    pred: (value: T, index: number) => value is TF,
    options: {
      occurrance?: number | undefined;
      negate: true;
      otherwise: OptLazy<O>;
    }
  ): Exclude<T, TF> | O;
  find<TF extends T>(
    pred: (value: T, index: number) => value is TF,
    options?: {
      occurrance?: number | undefined;
      negate?: false | undefined;
      otherwise?: undefined;
    }
  ): TF | undefined;
  find<TF extends T>(
    pred: (value: T, index: number) => value is TF,
    options?: {
      occurrance?: number | undefined;
      negate: true;
      otherwise?: undefined;
    }
  ): Exclude<T, TF> | undefined;
  find<O>(
    pred: (value: T, index: number) => boolean,
    options: {
      occurrance?: number | undefined;
      negate?: boolean | undefined;
      otherwise: OptLazy<O>;
    }
  ): T | O;
  find(
    pred: (value: T, index: number) => boolean,
    options?: {
      occurrance?: number | undefined;
      negate?: boolean | undefined;
      otherwise?: undefined;
    }
  ): T | undefined;
  /**
   * Returns the element in the Stream at the given index, or a fallback value (default undefined) otherwise.
   * @typeparam O - the optional value type to return if no match is found
   * @param index - the index of the element to retrieve
   * @param otherwise - (optional) an `OptLazy` value to be returned if the element does not exist
   * @example
   * ```ts
   * Stream.of(1, 2, 3).elementAt(1)        // => 2
   * Stream.of(1, 2, 3).elementAt(5)        // => undefined
   * Stream.of(1, 2, 3).elementAt(5, 'a')   // => 'a'
   * ```
   * @note O(N) for most types of Stream
   */
  elementAt(index: number): T | undefined;
  elementAt<O>(index: number, otherwise: OptLazy<O>): T | O;
  /**
   * Returns a Stream containing the indices of the elements for which the given `pred` function returns true.
   * @param pred - a predicate function taking an element
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * Stream.of(1, 2, 3).indicesWhere((v, i) => v + i !== 3).toArray()
   * // => [0, 2]
   * ```
   * @note O(N)
   */
  indicesWhere(
    pred: (value: T) => boolean,
    options?: { negate?: boolean | undefined }
  ): Stream<number>;
  /**
   * Returns a Stream containing the indicies of the occurrance of the given `searchValue`, according to given `eq` function.
   * @param searchValue - the value to search for
   * @param options - (optional) object specifying the following properties<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
   * - negate: (default: false) when true will negate the given Eq function
   * @example
   * ```ts
   * Stream.from('marmot').indicesOf('m').toArray()
   * // => [0, 3]
   * ```
   * @note O(N)
   */
  indicesOf(
    searchValue: T,
    options?: { eq?: Eq<T> | undefined; negate?: boolean | undefined }
  ): Stream<number>;
  /**
   * Returns the index of the given `occurrance` instance of the element in the Stream that satisfies given `pred` function,
   * or undefined if no such instance is found.
   * @param pred - a predicate function taking an element and its index
   * @param options - (optional) object specifying the following properties<br/>
   * - occurrance: (default: 1) the occurrance to search for<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * Stream.of(1, 2, 3).indexWhere((v, i) => v + i > 2)      // => 1
   * Stream.of(1, 2, 3).indexWhere((v, i) => v + i > 2, 2)   // => 2
   * ```
   * @note O(N)
   */
  indexWhere(
    pred: (value: T, index: number) => boolean,
    options?: { occurrance?: number | undefined; negate?: boolean | undefined }
  ): number | undefined;
  /**
   * Returns the index of the `occurrance` instance of given `searchValue` in the Stream, using given `eq` function,
   * or undefined if no such value is found.
   * @param searchValue  - the element to search for
   * @param options - (optional) object specifying the following properties<br/>
   * - occurrance: (default: 1) the occurrance to search for<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
   * - negate: (default: false) when true will negate the given Eq function
   * @example
   * ```ts
   * const source = Stream.from('marmot')
   * source.indexOf('m')     // => 0
   * source.indexOf('m', 2)  // => 3
   * source.indexOf('m', 3)  // => undefined
   * source.indexOf('q')     // => undefined
   * ```
   * @note O(N)
   */
  indexOf(
    searchValue: T,
    options?: {
      occurrance?: number | undefined;
      eq?: Eq<T> | undefined;
      negate?: boolean | undefined;
    }
  ): number | undefined;
  /**
   * Returns true if any element of the Stream satifies given `pred` function.
   * @param pred - a predicate function taking an element and its index
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * Stream.of(1, 2, 3).some((v, i) => v + i > 10) // => false
   * Stream.of(1, 2, 3).some((v, i) => v + i > 1)  // => true
   * ```
   * @note O(N)
   */
  some(
    pred: (value: T, index: number) => boolean,
    options?: { negate?: boolean | undefined }
  ): boolean;
  /**
   * Returns true if every element of the Stream satifies given `pred` function.
   * @param pred - a predicate function taking an element and its index
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * Stream.of(1, 2, 3).every((v, i) => v + i > 10)  // => false
   * Stream.of(1, 2, 3).every((v, i) => v + i < 10)  // => true
   * ```
   * @note O(N)
   */
  every(
    pred: (value: T, index: number) => boolean,
    options?: { negate?: boolean | undefined }
  ): boolean;
  /**
   * Returns true if the Stream contains given `amount` instances of given `value`, using given `eq` function.
   * @param value - the value to search for
   * @param options - (optional) object specifying the following properties<br/>
   * = amount: (default: 1) the amount of values the Stream should contain<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * Stream.from('marmot').contains('m')                // => true
   * Stream.from('marmot').contains('m', { amount: 2 }) // => true
   * Stream.from('marmot').contains('m', { amount: 3 }) // => false
   * Stream.from('marmot').contains('q')                // => false
   * ```
   * @note O(N)
   */
  contains(
    value: T,
    options?: {
      amount?: number | undefined;
      eq?: Eq<T> | undefined;
      negate?: boolean | undefined;
    }
  ): boolean;
  /**
   * Returns true if this stream contains the same sequence of elements as the given `source`,
   * false otherwise.
   * @param source - a non-empty stream source containing the element sequence to find
   * @param options - (optional) object specifying the following properties<br/>
   * - eq: (default: `Eq.objectIs`) the function to use to test element equality
   * @example
   * ```ts
   * Stream.of(1, 2, 3, 4, 5).containsSlice([2, 3, 4])
   * // => true
   * Stream.of(1, 2, 3, 4, 5).containsSlice([4, 3, 2])
   * // => false
   * ```
   */
  containsSlice(
    source: StreamSource.NonEmpty<T>,
    options?: { eq?: Eq<T> | undefined; amount?: number | undefined }
  ): boolean;
  /**
   * Returns a Stream that contains the elements of this Stream up to the first element that does not satisfy given `pred` function.
   * @param pred - a predicate function taking an element and its index
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * Stream.of(1, 2, 3).takeWhile(v => v < 3).toArray()
   * // => [1, 2]
   * ```
   * @note O(N)
   */
  takeWhile(
    pred: (value: T, index: number) => boolean,
    options?: { negate?: boolean | undefined }
  ): Stream<T>;
  /**
   * Returns a Stream that contains the elements of this Stream starting from the first element that does not satisfy given `pred` function.
   * @param pred - a predicate function taking an element and its index
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * Stream.of(1, 2, 3).dropWhile(v => v < 2).toArray()
   * // => [2, 3]
   * ```
   * @note O(N)
   */
  dropWhile(
    pred: (value: T, index: number) => boolean,
    options?: { negate?: boolean | undefined }
  ): Stream<T>;
  /**
   * Returns a stream that contains the elements of this Stream up to a maximum of `amount` elements.
   * @param amount - the maximum amount of elements to return from the resulting Stream
   * @example
   * ```ts
   * Stream.of(1, 2, 3).take(2).toArray()   // => [1, 2]
   * ```
   * @note O(N) for most types of Stream
   */
  take(amount: number): Stream<T>;
  /**
   * Returns a stream that skips the first `amount` elements of this Stream and returns the rest.
   * @param amount - the amount of elements to skip
   * @example
   * ```ts
   * Stream.of(1, 2, 3).drop(1).toArray()   // => [2, 3]
   * ```
   * @note O(N) for most types of Stream
   */
  drop(amount: number): Stream<T>;
  /**
   * Returns a Stream that returns the elements from this Stream given `amount` of times.
   * @param amount - (default: undefined) the amount of times to return this Stream
   * @example
   * ```ts
   * Stream.of(1, 2, 3).repeat()              // => Stream(1, 2, 3, 1, 2, 3, 1, 2, ...)
   * Stream.of(1, 2, 3).repeat(1).toArray()   // => [1, 2, 3]
   * Stream.of(1, 2, 3).repeat(3).toArray()   // => [1, 2, 3, 1, 2, 3, 1, 2, 3]
   * Stream.of(1, 2, 3).repeat(-3).toArray()  // => [1, 2, 3]
   * ```
   * @note amount = undefined means that the Stream is repeated indefintely
   * @note amount = 1 means that the Stream is not repeated
   * @note amount < 1 will be normalized to amount = 1
   * @note O(1)
   */
  repeat(amount?: number | undefined): Stream<T>;
  /**
   * Returns a Stream containing the elements of this Stream followed by all elements produced by the `others` array of StreamSources.
   * @typeparam T2 - the element type of the stream to concatenate
   * @param others - a series of StreamSources to concatenate.
   * @example
   * ```ts
   * Stream.of(1, 2, 3).concat([4, 5], [6, 7]).toArray()
   * // [1, 2, 3, 4, 5, 6, 7]
   * ```
   * @note O(1)
   */
  concat<T2 = T>(
    ...others: ArrayNonEmpty<StreamSource.NonEmpty<T2>>
  ): Stream.NonEmpty<T | T2>;
  concat<T2 = T>(...others: ArrayNonEmpty<StreamSource<T2>>): Stream<T | T2>;
  /**
   * Returns the mimimum element of the Stream according to a default compare function, or the provided `otherwise` fallback value if the
   * Stream is empty.
   * @typeparam O - the optional value type to return if no match is found
   * @param otherwise - (default: undefined) the value to return if the Stream is empty
   * @example
   * ```ts
   * Stream.of(5, 1, 3).min()         // => 1
   * Stream.empty<number>().min()     // => undefined
   * Stream.empty<number>().min('a')  // => 'a'
   * ```
   * @note O(N)
   */
  min(): T | undefined;
  min<O>(otherwise: OptLazy<O>): T | O;
  /**
   * Returns the mimimum element of the Stream according to the provided `compare` function, or the provided `otherwise` fallback value
   * if the Stream is empty.
   * @typeparam O - the optional value type to return if no match is found
   * @param otherwise - (default: undefined) the value to return if the Stream is empty
   * @example
   * ```ts
   * function compareLength(a: string, b: string): number { return b.length - a.length };
   * Stream.of('abc', 'a', 'ab').minBy(compareLength)   // => 'a'
   * Stream.empty<string>().minBy(compareLength)        // => undefined
   * Stream.empty<string>().minBy(compareLength, 'a')   // => 'a'
   * ```
   * @note O(N)
   */
  minBy(compare: (v1: T, v2: T) => number): T | undefined;
  minBy<O>(compare: (v1: T, v2: T) => number, otherwise: OptLazy<O>): T | O;
  /**
   * Returns the maximum element of the Stream according to a default compare function, or the provided `otherwise` fallback value if the
   * Stream is empty.
   * @typeparam O - the optional value type to return if no match is found
   * @param otherwise - (default: undefined) the value to return if the Stream is empty
   * @example
   * ```ts
   * Stream.of(5, 1, 3).max()         // => 5
   * Stream.empty<number>().max()     // => undefined
   * Stream.empty<number>().max('a')  // => 'a'
   * ```
   * @note O(N)
   */
  max(): T | undefined;
  max<O>(otherwise: OptLazy<O>): T | O;
  /**
   * Returns the maximum element of the Stream according to the provided `compare` function, or the provided `otherwise fallback value
   * if the Stream is empty.
   * @typeparam O - the optional value type to return if no match is found
   * @param otherwise - (default: undefined) the value to return if the Stream is empty
   * @example
   * ```ts
   * function compareLength(a: string, b: string): number { return b.length - a.length };
   * Stream.of('abc', 'a', 'ab').maxBy(compareLength)   // => 'abc'
   * Stream.empty<string>().maxBy(compareLength)        // => undefined
   * Stream.empty<string>().maxBy(compareLength, 'a')   // => 'a'
   * ```
   * @note O(N)
   */
  maxBy(compare: (v1: T, v2: T) => number): T | undefined;
  maxBy<O>(compare: (v1: T, v2: T) => number, otherwise: OptLazy<O>): T | O;
  /**
   * Returns a Stream with all elements from the given `sep` StreamSource between two elements of this Stream.
   * @param sep - the StreamSource to insert between each element of this Stream
   * @example
   * ```ts
   * Stream.of(1, 2, 3).intersperse("ab").toArray()
   * // => [1, 'a', 'b', 2, 'a', 'b', 3]
   * ```
   * @note O(1)
   */
  intersperse(sep: StreamSource<T>): Stream<T>;
  /**
   * Returns a string resulting from converting each element to string with `options.valueToString`, interspersed with `options.sep`, starting with
   * `options.start` and ending with `options.end`.
   * @param options - (optional) object specifying the following properties<br/>
   * - sep: (optional) a seperator to insert between each Stream element<br/>
   * - start: (optional) a start string to prepend at the start<br/>
   * - end: (optional) an end string to append at the end<br/>
   * - valueToString: (default: String) a function converting a Stream element to a string<br/>
   * - ifEmpty: (optional) a string to return instead of the start and end tag if the stream is empty
   * @example
   * ```ts
   * Stream.of(1, 2, 3).join({ start: '<', sep: ', ', end: '>' })
   * // => '<1, 2, 3>'
   * ```
   * @note O(N)
   */
  join(options?: {
    sep?: string | undefined;
    start?: string | undefined;
    end?: string | undefined;
    valueToString?: ((value: T) => string) | undefined;
    ifEmpty?: string | undefined;
  }): string;
  /**
   * Returns a Stream starting with `options.sep`, then returning the elements of this Stream interspersed with `options.sep`, and ending with
   * `options.end`.
   * @param options - object specifying the following properties<br/>
   * - sep: (optional) a seperator StreamSource to insert between each Stream element<br/>
   * - start: (optional) a start StreamSource to prepend<br/>
   * - end: (optional) an end StreamSource to append
   * @example
   * ```ts
   * Stream.of(1, 2, 3).mkGroup({ start: '<<', sep: '-', end: '>>' }).toArray()
   * // => ['<', '<', 1, '-', 2, '-', 3, '>', '>']
   * ```
   * @note O(N)
   */
  mkGroup(options: {
    sep?: StreamSource<T> | undefined;
    start?: StreamSource<T> | undefined;
    end?: StreamSource<T> | undefined;
  }): Stream<T>;
  /**
   * Returns a Stream of collections of Stream elements, where each collection is filled with elements of this Stream up to the next element that
   * satisfies give function `pred`.
   * @param pred - a predicate function taking an element and its index
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   * - collector: (default: `Reducer.toArray()`) the reducer to use to collect the window values
   * @typeparam R - the result type of the collector and the resulting stream element type
   * @example
   * ```ts
   * Stream.of(1, 2, 3, 4).splitWhere(v => v == 3).toArray()  // => [[1, 2], [4]]
   * ```
   * @note O(1)
   */
  splitWhere<R, T2 extends T = T>(
    pred: (value: T, index: number) => boolean,
    options: { negate?: boolean | undefined; collector: Reducer<T | T2, R> }
  ): Stream<R>;
  splitWhere(
    pred: (value: T, index: number) => boolean,
    options?: { negate?: boolean | undefined; collector?: undefined }
  ): Stream<T[]>;
  /**
   * Returns a Stream of collections of Stream elements, where each collection is filled with elements of this Stream up to the next element that
   * equals given `sepElem` according to the given `eq` function.
   * @param sepElem - the separator element to look for
   * @param options - (optional) object specifying the following properties<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
   * - negate: (default: false) when true will negate the given Eq function
   * - collector: (default: `Reducer.toArray()`) the reducer to use to collect the window values
   * @typeparam R - the result type of the collector and the resulting stream element type
   * @example
   * ```ts
   * Stream.from('marmot').splitOn('m').toArray()  // => [[], ['a', 'r'], ['o', 't']]
   * ```
   * @note O(1)
   */
  splitOn<R, T2 extends T = T>(
    sepElem: T,
    options: {
      eq?: Eq<T> | undefined;
      negate?: boolean | undefined;
      collector: Reducer<T | T2, R>;
    }
  ): Stream<R>;
  splitOn(
    sepElem: T,
    options?: {
      eq?: Eq<T> | undefined;
      negate?: boolean | undefined;
      collector?: undefined;
    }
  ): Stream<T[]>;
  /**
   * Returns a Stream of collections of Stream elements, where each collection is filled with elements of this Stream up to the next sequence of elements that
   * equal the given `sepSeq` sequence of elements according to the given `eq` function.
   * @param sepSlice - a sequence of elements that serves as a separator
   * @param options - (optional) object specifying the following properties<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
   * - collector: (default: `Reducer.toArray()`) the reducer to use to collect the window values
   * @typeparam R - the result type of the collector and the resulting stream element type
   * @example
   * ```ts
   * Stream.from('marmot').splitOnSlice('mo').toArray()  // => [['m', 'a', 'r'], ['t']]
   * ```
   * @note O(1)
   */
  splitOnSlice<R, T2 extends T = T>(
    sepSlice: StreamSource<T>,
    options: { eq?: Eq<T> | undefined; collector: Reducer<T | T2, R> }
  ): Stream<R>;
  splitOnSlice(
    sepSlice: StreamSource<T>,
    options?: { eq?: Eq<T> | undefined; collector?: undefined }
  ): Stream<T[]>;
  /**
   * Returns a Stream containing non-repetitive elements of the source stream, where repetitive elements
   * are compared using the optionally given `eq` equality function.
   * @param options - (optional) object specifying the following properties<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * Stream.of(1, 1, 2, 2, 3, 1).distinctPrevious().toArray()
   * // => [1, 2, 3, 1]
   * ```
   */
  distinctPrevious(options?: {
    eq?: Eq<T> | undefined;
    negate?: boolean | undefined;
  }): Stream<T>;
  /**
   * Returns a Stream containing `windows` of `windowSize` consecutive elements of the source stream, with each
   * window starting `skipAmount` elements after the previous one.
   * @typeparam R - the collector reducer result type
   * @param windowSize - the size in elements of the windows
   * @param options - (optional) object specifying the following properties<br/>
   * - skipAmount: (default: `windowSize`) the amount of elements to skip to start the next window
   * - collector: (default: `Reducer.toArray()`) the reducer to use to collect the window values
   * @example
   * ```ts
   * console.log(Stream.of(1, 2, 3, 4, 5, 6, 7).window(3).toArray())
   * // => [[1, 2, 3], [4, 5, 6]]
   * console.log(Stream.of(1, 2, 3, 4, 5).window(3, 1).toArray())
   * // => [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
   * console.log(Stream.of(1, 2, 3, 4).window(2, 2, Reducer.toJSSet()).toArray())
   * // => [Set(1, 2), Set(3, 4)]
   * ```
   */
  window<R, T2 extends T = T>(
    windowSize: number,
    options: {
      skipAmount?: number | undefined;
      collector: Reducer<T | T2, R>;
    }
  ): Stream<R>;
  window(
    windowSize: number,
    options?: { skipAmount?: number | undefined; collector?: undefined }
  ): Stream<T[]>;
  /**
   * Returns a tuple of which the first element is the result of collecting the elements for which the given `predicate` is true, and
   * the second one the result of collecting the other elements. Own reducers can be provided as collectors, by default the values are
   * collected into an array.
   * @param pred - a predicate receiving the value and its index
   * @param options - (optional) an object containing the following properties:<br/>
   * - collectorTrue: (default: Reducer.toArray()) a reducer that collects the values for which the predicate is true<br/>
   * - collectorFalse: (default: Reducer.toArray()) a reducer that collects the values for which the predicate is false
   * @typeparam T - the input element type
   * @typeparam RT - the reducer result type for the `collectorTrue` value
   * @typeparam RF - the reducer result type for the `collectorFalse` value
   * @note if the predicate is a type guard, the return type is automatically inferred
   */
  partition<T2 extends T, RT, RF>(
    pred: (value: T, index: number) => value is T2,
    options: {
      collectorTrue: Reducer<T2, RT>;
      collectorFalse: Reducer<Exclude<T, T2>, RF>;
    }
  ): [true: RT, false: RF];
  partition<T2 extends T>(
    pred: (value: T, index: number) => value is T2,
    options?: {
      collectorTrue?: undefined;
      collectorFalse?: undefined;
    }
  ): [true: T2[], false: Exclude<T, T2>[]];
  partition<RT, RF, T2 extends T = T>(
    pred: (value: T, index: number) => boolean,
    options: {
      collectorTrue: Reducer<T | T2, RT>;
      collectorFalse: Reducer<T | T2, RF>;
    }
  ): [true: RT, false: RF];
  partition(
    pred: (value: T, index: number) => boolean,
    options?: {
      collectorTrue?: undefined;
      collectorFalse?: undefined;
    }
  ): [true: T[], false: T[]];
  /**
   * Returns the result of applying the `valueToKey` function to calculate a key for each value, and feeding the tuple of the key and the value to the
   * `collector` reducer, and finally returning its result. If no collector is given, the default collector will return a JS multimap
   * of the type `Map<K, V[]>`.
   * @param valueToKey - function taking a value and its index, and returning the corresponding key
   * @param options - (optional) an object containing the following properties:<br/>
   * - collector: (default: Reducer.toArray()) a reducer that collects the incoming tuple of key and value, and provides the output
   * @typeparam T - the input value type
   * @typeparam K - the key type
   * @typeparam R - the collector output type
   * @example
   * ```ts
   * Stream.of(1, 2, 3).groupBy((v) => v % 2)
   * // => Map {0 => [2], 1 => [1, 3]}
   * ```
   */
  groupBy<K, R, T2 extends readonly [K, T] = [K, T]>(
    valueToKey: (value: T, index: number) => K,
    options: {
      collector: Reducer<[K, T] | T2, R>;
    }
  ): R;
  groupBy<K>(
    valueToKey: (value: T, index: number) => K,
    options?: {
      collector?: undefined;
    }
  ): Map<K, T[]>;
  /**
   * Returns the value resulting from applying the given the given `next` function to a current state (initially the given `init` value),
   * and the next Stream value, and returning the new state. When all elements are processed, the resulting state is returned.
   * @typeparam R - the resulting element type
   * @param init - the initial result/state value
   * @param next - a function taking the parameters below and returning the new result/state value<br/>
   * - current: the current result/state value, initially `init`.<br/>
   * - value: the next Stream value<br/>
   * - index: the index of the given value<br/>
   * - halt: a function that, if called, ensures that no new elements are passed
   * @example
   * ```ts
   * console.log(Stream.empty<number>().fold(5, (current, value) => current + value))
   * // => 5
   * console.log(Stream.of(1, 2, 3).fold(5, (current, value) => current + value))
   * // => 11  (= 5 + 1 + 2 + 3)
   * ```
   */
  fold<R>(
    init: OptLazy<R>,
    next: (current: R, value: T, index: number, halt: () => void) => R
  ): R;
  /**
   * Returns a Stream containing the values resulting from applying the given the given `next` function to a current state (initially the given `init` value),
   * and the next Stream value, and returning the new state.
   * @typeparam R - the resulting element type
   * @param init - the initial result/state value
   * @param next - a function taking the parameters below and returning the new result/state value<br/>
   * - current: the current result/state value, initially `init`.<br/>
   * - value: the next Stream value<br/>
   * - index: the index of the given value<br/>
   * - halt: a function that, if called, ensures that no new elements are passed
   * @example
   * ```ts
   * console.log(
   *   Stream.empty<number>()
   *     .foldStream(5, (current, value) => current + value)
   *     .toArray()
   * )
   * // => []
   * console.log(
   *   Stream.of(1, 2, 3)
   *     .foldStream(5, (current, value) => current + value)
   *     .toArray()
   * )
   * // => [6, 8, 11]
   * ```
   */
  foldStream<R>(
    init: OptLazy<R>,
    next: (current: R, value: T, index: number, halt: () => void) => R
  ): Stream<R>;
  /**
   * Applies the given `reducer` to each element in the Stream, and returns the final result.
   * @typeparam R - the result type
   * @param reducer - the `Reducer` instance to use to apply to all Stream elements.
   * @example
   * ```ts
   * console.log(Stream.of(1, 2, 4).reduce(Reducer.sum))
   * // => 7
   * console.log(Stream.of(1, 2, 4).reduce(Reducer.product))
   * // => 8
   * ```
   */
  reduce<R, T2 = T>(reducer: Reducer<T | T2, R>): R;
  /**
   * Applies the given combined `Reducer` to each element in the Stream, and returns the final result.
   * @typeparam S - a shape defining a combined reducer definition
   * @param shape - the `Reducer` combined instance to use to apply to all stream elements.
   * @example
   * ```ts
   * console.log(Stream.of(1, 2, 4).reduce([Reducer.sum, { prod: Reducer.product }]))
   * // => [7, { prod: 8 }]
   * ```
   */
  reduce<const S extends Reducer.CombineShape<T>>(
    shape: S & Reducer.CombineShape<T>
  ): Reducer.CombineResult<S>;
  /**
   * Returns a Stream where the given `reducer` is applied to each element in the Stream.
   * @typeparam R - the resulting element type
   * @param reducer - the `Reducer` instance to use to apply to all Stream elements.
   * @example
   * ```ts
   * console.log(
   *   Stream.of(1, 2, 4)
   *     .reduceStream(Reducer.sum)
   *     .toArray()
   * )
   * // => [1, 3, 7]
   * console.log(
   *   Stream.of(1, 2, 4)
   *     .reduceStream(Reducer.product)
   *     .toArray()
   * )
   * // => [1, 2, 8]
   * ```
   */
  reduceStream<R, T2 = T>(reducer: Reducer<T | T2, R>): Stream<R>;
  /**
   * Returns a Stream where the given shape containing `Reducers` is applied to each element in the stream.
   * @typeparam S - the reducer shape type
   * @param shape - the reducer shape containing instances of Reducers to use to apply to all stream elements.
   * @example
   * ```ts
   * console.log(
   *   Stream.of(1, 2, 4)
   *     .reduceStream([Reducer.sum, { prod: Reducer.product }])
   *     .toArray()
   * )
   * // => [[1, { prod: 1 }], [3, { prod: 2 }], [7, { prod: 8 }]]
   * ```
   */
  reduceStream<const S extends Reducer.CombineShape<T>>(
    shape: S & Reducer.CombineShape<T>
  ): Stream<Reducer.CombineResult<S>>;
  /**
   * Returns an Array containing all elements in the Stream.
   * @example
   * ```ts
   * Stream.of(1, 2, 3).toArray()   // => [1, 2, 3]
   * ```
   */
  toArray(): T[];
  /**
   * Returns a string representation of the Stream.
   * @note to avoid issues with potentially infinite stream, this method does not list the Stream elements. To do this, use `join`.
   * @example
   * ```ts
   * Stream.of(1, 2, 3).toString()   // => 'Stream(...<potentially empty>)'
   * ```
   */
  toString(): string;
  /**
   * Returns a JSON representation of the Stream.
   * @note take care not to call on infinite Streams
   * @example
   * ```ts
   * Stream.of(1, 2, 3).toJSON()   // => { dataType: 'Stream', value: [1, 2, 3] }
   * ```
   */
  toJSON(): ToJSON<T[], 'Stream'>;
}

export namespace Stream {
  /**
   * A non-empty and possibly infinite sequence of elements of type T.
   * See the [Stream documentation](https://rimbu.org/docs/collections/stream) and the [Stream API documentation](https://rimbu.org/api/rimbu/stream/Stream/interface)
   * @typeparam T - the element type
   */
  export interface NonEmpty<T> extends Stream<T>, Streamable.NonEmpty<T> {
    /**
     * Returns this collection typed as a 'possibly empty' collection.
     * @example
     * ```ts
     * Stream.of(0, 1, 2).asNormal();  // type: Stream<number>
     * ```
     */
    asNormal(): Stream<T>;
    /**
     * Returns a non-empty stream of elements of type T.
     * @example
     * ```ts
     * Stream.of(1, 2, 3).stream()
     * // => returns itself
     * ```
     */
    stream(): this;
    /**
     * Returns a non-empty Stream where each element in this Stream is paired with its index
     * @param options - (optional) object specifying the following properties<br/>
     * - startIndex: (optional) an alternative start index to use
     * @example
     * ```ts
     * Stream.of(1, 2, 3).indexed().toArray()
     * // => [[0, 1], [1, 2], [2, 3]]
     * ```
     * @note O(1)
     */
    indexed(options?: {
      startIndex?: number | undefined;
    }): Stream.NonEmpty<[number, T]>;
    /**
     * Returns a non-empty Stream where `mapFun` is applied to each element.
     * @typeparam T2 - the result value type
     * @param mapFun - a function taking an element and its index, and returning some new element
     * @example
     * ```ts
     * Stream.of(1, 2, 3).map((v, i) => `[${i}]: ${v}`).toArray()
     * // => ['[0]: 1', '[1]: 2', '[2]: 3']
     * ```
     * @note O(1)
     */
    map<T2>(mapFun: (value: T, index: number) => T2): Stream.NonEmpty<T2>;
    /**
     * Returns a non-empty tream where the given `mapFun` is applied to each value in the stream, with optionally
     * as extra arguments the given `args`.
     * @typeparam T2 - the result element type
     * @typeparam A - the type of the arguments to be passed to the `mapFun` function after each element
     * @param mapFun - a function taking an element and the given args, and returning the resulting stream value
     * @param args - (optional) the extra arguments to pass to the given `mapFun`
     *
     * @note is mostly aimed to increase performance so that an extra function is not required
     * @note can be used on function that really expect 1 argument, since the normal map will also pass more arguments
     * @example
     * ```ts
     * const s = Stream.of({ a: 1 }, { a: 2, c: { d: true } })
     * const s2 = s.mapPure(JSON.stringify, ['a'], 5)
     * // when stream is evaluated, will call JSON.stringify on each stream element with the given extra arguments
     * console.log(s2.toArray())
     * // => ["{\n \"a\": 1\n}", "{\n \"a\": 2\n}"]
     * ```
     */
    mapPure<T2, A extends readonly unknown[]>(
      mapFun: (value: T, ...args: A) => T2,
      ...args: A
    ): Stream.NonEmpty<T2>;
    /**
     * Returns a Stream consisting of the concatenation of `flatMapFun` applied to each element.
     * @typeparam T2 - the result element type
     * @param flatMapFun - a function receiving the inputs described below and returning a `StreamSource` of new elements<br/>
     * - value: the next element<br/>
     * - index: the index of the element<br/>
     * - halt: a function that, if called, ensures that no new elements are passed
     *
     * @note O(1)
     * @example
     * ```ts
     * Stream.of(1, 2, 3).flatMap((v, i, halt) => {
     *   if (i >= 1) halt();
     *   return [v, i, v + i]
     * }).toArray()
     * // => [1, 0, 1, 2, 1, 3]
     * ```
     */
    flatMap<T2>(
      flatMapFun: (value: T, index: number) => StreamSource.NonEmpty<T2>
    ): Stream.NonEmpty<T2>;
    flatMap<T2>(
      flatMapFun: (
        value: T,
        index: number,
        halt: () => void
      ) => StreamSource<T2>
    ): Stream<T2>;
    /**
     * Returns a Stream consisting of the concatenation of `flatMapFun` applied to each element, zipped with the element that was provided to the function.
     * @typeparam T2 - the result element type
     * @param flatMapFun - a function receiving the inputs described below and returning a `StreamSource` of new elements<br/>
     * - value: the next element<br/>
     * - index: the index of the element<br/>
     * - halt: a function that, if called, ensures that no new elements are passed
     *
     * @note O(1)
     * @example
     * ```ts
     * Stream.of(1, 2, 3).flatZip((v, i, halt) => {
     *   if (i >= 1) halt();
     *   return [v, i, v + i]
     * }).toArray()
     * // => [[1, 1], [1, 0], [1, 1], [2, 2], [2, 1], [2, 3]]
     * ```
     */
    flatZip<T2>(
      flatMapFun: (value: T, index: number) => StreamSource.NonEmpty<T2>
    ): Stream.NonEmpty<[T, T2]>;
    flatZip<T2>(
      flatMapFun: (
        value: T,
        index: number,
        halt: () => void
      ) => StreamSource<T2>
    ): Stream<[T, T2]>;
    /**
     * Returns a Stream consisting of the concatenation of StreamSource elements resulting from applying the given `reducer` to each element.
     * @typeparam R - the resulting element type
     * @param transformer - a reducer taking elements ot type T as input, and returing a `StreamSource` of element type R
     * @note O(1)
     * @example
     * ```ts
     * Stream.of(1, 2, 3, 4, 5, 6)
     *   .transform(Transformer.window(3))
     *   .toArray()
     * // => [[1, 2, 3], [4, 5, 6]]
     * ```
     */
    transform<R, T2 extends T = T>(
      transformer: Transformer.NonEmpty<T | T2, R>
    ): Stream.NonEmpty<R>;
    transform<R, T2 extends T = T>(
      transformer: Transformer<T | T2, R>
    ): Stream<R>;
    /**
     * Returns the first element of the Stream.
     * @example
     * ```ts
     * Stream.of(1, 2, 3).first()      // => 1
     * ```
     * @note O(1)
     */
    first(): T;
    /**
     * Returns the last element of the Stream.
     * @example
     * ```ts
     * Stream.of(1, 2, 3).last()      // => 3
     * ```
     * @note O(N) for most types of Stream
     */
    last(): T;
    /**
     * Returns a non-empty Stream that returns the elements from this Stream given `amount` of times.
     * @param amount - (default: undefined) the amount of times to return this Stream
     * @example
     * ```ts
     * Stream.of(1, 2, 3).repeat()              // => Stream(1, 2, 3, 1, 2, 3, 1, 2, ...)
     * Stream.of(1, 2, 3).repeat(1).toArray()   // => [1, 2, 3]
     * Stream.of(1, 2, 3).repeat(3).toArray()   // => [1, 2, 3, 1, 2, 3, 1, 2, 3]
     * Stream.of(1, 2, 3).repeat(-3).toArray()  // => [1, 2, 3]
     * ```
     * @note amount = undefined means that the Stream is repeated indefintely
     * @note amount = 1 means that the Stream is not repeated
     * @note amount < 1 will be normalized to amount = 1
     * @note O(1)
     */
    repeat(amount?: number | undefined): Stream.NonEmpty<T>;
    /**
     * Returns a Stream containing the elements of this Stream followed by all elements produced by the `others` array of StreamSources.
     * @param others - a series of StreamSources to concatenate.
     * @example
     * ```ts
     * Stream.of(1, 2, 3).concat([4, 5], [6, 7]).toArray()
     * // [1, 2, 3, 4, 5, 6, 7]
     * ```
     * @note O(1)
     */
    concat<T2 = T>(
      ...others: ArrayNonEmpty<StreamSource<T2>>
    ): Stream.NonEmpty<T | T2>;
    /**
     * Returns the mimimum element of the Stream according to a default compare function.
     * @example
     * ```ts
     * Stream.of(5, 1, 3).min()         // => 1
     * ```
     * @note O(N)
     */
    min(): T;
    /**
     * Returns the mimimum element of the Stream according to the provided `compare` function.
     * @example
     * ```ts
     * function compareLength(a: string, b: string): number { return b.length - a.length };
     * Stream.of('abc', 'a', 'ab').minBy(compareLength)   // => 'a'
     * ```
     * @note O(N)
     */
    minBy(compare: (v1: T, v2: T) => number): T;
    /**
     * Returns the maximum element of the Stream according to a default compare function.
     * @example
     * ```ts
     * Stream.of(5, 1, 3).max()         // => 5
     * ```
     * @note O(N)
     */
    max(): T;
    /**
     * Returns the maximum element of the Stream according to the provided `compare` function.
     * @example
     * ```ts
     * function compareLength(a: string, b: string): number { return b.length - a.length };
     * Stream.of('abc', 'a', 'ab').maxBy(compareLength)   // => 'abc'
     * ```
     * @note O(N)
     */
    maxBy(compare: (v1: T, v2: T) => number): T;
    /**
     * Returns a non-empty Stream with all elements from the given `sep` StreamSource between two elements of this Stream.
     * @param sep - the StreamSource to insert between each element of this Stream
     * @example
     * ```ts
     * Stream.of(1, 2, 3).intersperse("ab").toArray()
     * // => [1, 'a', 'b', 2, 'a', 'b', 3]
     * ```
     * @note O(1)
     */
    intersperse(sep: StreamSource<T>): Stream.NonEmpty<T>;
    /**
     * Returns a non-empty Stream starting with `options.sep`, then returning the elements of this Stream interspersed with `options.sep`, and ending with
     * `options.end`.
     * @param options - object specifying the following properties<br/>
     * - sep: (optional) a seperator StreamSource to insert between each Stream element<br/>
     * - start: (optional) a start StreamSource to prepend<br/>
     * - end: (optional) an end StreamSource to append
     * @example
     * ```ts
     * Stream.of(1, 2, 3).mkGroup({ start: '<<', sep: '-', end: '>>' }).toArray()
     * // => ['<', '<', 1, '-', 2, '-', 3, '>', '>']
     * ```
     * @note O(N)
     */
    mkGroup(options: {
      sep?: StreamSource<T> | undefined;
      start?: StreamSource<T> | undefined;
      end?: StreamSource<T> | undefined;
    }): Stream.NonEmpty<T>;
    /**
     * Returns a non-empty Stream containing non-repetitive elements of the source stream, where repetitive elements
     * are compared using the optionally given `eq` equality function.
     * @param options - (optional) object specifying the following properties<br/>
     * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
     * - negate: (default: false) when true will negate the given predicate
     * @example
     * ```ts
     * Stream.of(1, 1, 2, 2, 3, 1).distinctPrevious().toArray()
     * // => [1, 2, 3, 1]
     * ```
     */
    distinctPrevious(options?: {
      eq?: Eq<T> | undefined;
      negate?: boolean | undefined;
    }): Stream.NonEmpty<T>;
    /**
     * Returns a Stream containing the values resulting from applying the given the given `next` function to a current state (initially the given `init` value),
     * and the next Stream value, and returning the new state.
     * @typeparam R - the resulting element type
     * @param init - the initial result/state value
     * @param next - a function taking the parameters below and returning the new result/state value<br/>
     * - current: the current result/state value, initially `init`.<br/>
     * - value: the next Stream value<br/>
     * - index: the index of the given value<br/>
     * - halt: a function that, if called, ensures that no new elements are passed
     * @example
     * ```ts
     * console.log(
     *   Stream.empty<number>()
     *     .foldStream(5, (current, value) => current + value)
     *     .toArray()
     * )
     * // => []
     * console.log(
     *   Stream.of(1, 2, 3)
     *     .foldStream(5, (current, value) => current + value)
     *     .toArray()
     * )
     * // => [6, 8, 11]
     * ```
     */
    foldStream<R>(
      init: OptLazy<R>,
      next: (current: R, value: T, index: number) => R
    ): Stream.NonEmpty<R>;
    foldStream<R>(
      init: OptLazy<R>,
      next: (current: R, value: T, index: number, halt: () => void) => R
    ): Stream<R>;
    /**
     * Returns a non-empty Array containing all elements in the Stream.
     * @example
     * ```ts
     * Stream.of(1, 2, 3).toArray()   // => [1, 2, 3]
     * ```
     */
    toArray(): ArrayNonEmpty<T>;
  }
}

export const Stream: StreamConstructors = StreamConstructorsImpl;
