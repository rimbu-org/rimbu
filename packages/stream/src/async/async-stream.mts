import type {
  ArrayNonEmpty,
  AsyncCollectFun,
  AsyncOptLazy,
  Eq,
  MaybePromise,
  ToJSON,
  TraverseState,
} from '@rimbu/common';

import type {
  AsyncFastIterable,
  AsyncStreamSource,
  AsyncStreamable,
  AsyncTransformer,
  AsyncReducer,
} from '@rimbu/stream/async';
import { type AsyncStreamConstructors } from '@rimbu/stream/async-custom';

import { AsyncStreamConstructorsImpl } from '../async-custom/async-stream-custom.mjs';

/**
 * A possibly infinite asynchronous sequence of elements of type T.
 * See the [Stream documentation](https://rimbu.org/docs/collections/stream) and the [AsyncStream API documentation](https://rimbu.org/api/rimbu/stream/async/AsyncStream/interface)
 * @typeparam T - the element type
 * @example
 * ```ts
 * const s1 = AsyncStream.empty<number>()
 * const s2 = AsyncStream.of(1, 3, 2)
 * const s3 = AsyncStream.from(Stream.range({ start: 10, amount: 15 }))
 * ```
 */
export interface AsyncStream<T>
  extends AsyncFastIterable<T>,
    AsyncStreamable<T> {
  /**
   * Returns an async stream of elements of type T.
   * @example
   * ```ts
   * AsyncStream.of(1, 2, 3).asyncStream()
   * // => returns itself
   * ```
   */
  asyncStream(): this;
  /**
   * Returns true if the sequence of elements in this stream are equal to the sequence in the `other` stream according to the provided `eq` function.
   * @param other - the other async stream to compare
   * @param options - (optional) object specifying the following properties<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
   * - negate: (default: false) when true will negate the `eq` function
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).equals([1, 2, 3])     // => true
   * await AsyncStream.of(1, 2, 3, 4).equals([1, 2, 3])  // => false
   * ```
   * @note don't use on potentially infinite streams
   * @note O(N)
   */
  equals(
    other: AsyncStreamSource<T>,
    options?: { eq?: Eq<T> | undefined; negate?: boolean | undefined }
  ): Promise<boolean>;
  /**
   * Returns the stream as a non-empty instance.
   * @throws RimbuError.EmptyCollectionAssumedNonEmptyError if the stream is known to be empty.
   * @example
   * ```ts
   * AsyncStream.from(Stream.range({ amount: 100 })).assumeNonEmpty()
   * // => type: AsyncStream.NonEmpty<number>
   * ```
   * @note the function does not actually check if the stream is empty, so treat with extra care
   * @note O(1)
   */
  assumeNonEmpty(): AsyncStream.NonEmpty<T>;
  /**
   * Returns the current stream preceded by the given `value`
   * @param value - the value to prepend
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).prepend(0).toArray()
   * // => [0, 1, 2, 3]
   * ```
   * @note O(1)
   */
  prepend(value: AsyncOptLazy<T>): AsyncStream.NonEmpty<T>;
  /**
   * Returns the current stream succeeded by the given `value`
   * @param value - the value to append
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).append(4).toArray()
   * // => [1, 2, 3, 4]
   * ```
   * @note O(1)
   */
  append(value: AsyncOptLazy<T>): AsyncStream.NonEmpty<T>;
  /**
   * Performs given function `f` for each element of the Stream, using given `state` as initial traversal state.
   * @param f - the potentially asynchronous function to perform for each element, receiving:<br/>
   * - value: the next element<br/>
   * - index: the index of the element<br/>
   * - halt: a function that, if called, ensures that no new elements are passed
   * @param options - (optional) object specifying the following properties<br/>
   * - state: (optional) the traverse state
   * @note if f is an async function, each call will be awaited consecutively
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).forEach(async (v, i, halt) => {
   *  console.log(v);
   *  if (i >= 1) halt();
   * })
   * // => 1, 2
   * ```
   * @note O(N)
   */
  forEach(
    f: (value: T, index: number, halt: () => void) => MaybePromise<void>,
    options?: { state?: TraverseState | undefined }
  ): Promise<void>;
  /**
   * Performs given function `f` for each element of the Stream, with the optionally given `args` as extra arguments.
   * @typeparam A - the type of the arguments to be passed to the `f` function after each element
   * @param f - the potentially asynchronous function to perform for each element, optionally receiving given extra `args`.
   * @param args - a list of extra arguments to pass to given `f` for each element when needed
   * @typeparam A - the type of the extra arguments to pass
   * @note if f is an async function, each call will be awaited consecutively
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).forEachPure(console.log, 'sheep')
   * // => logs:
   * // 1 sheep
   * // 2 sheep
   * // 3 sheep
   * ```
   * @note O(N)
   */
  forEachPure<A extends readonly unknown[]>(
    f: (value: T, ...args: A) => MaybePromise<void>,
    ...args: A
  ): Promise<void>;
  /**
   * Returns an AsyncStream where each element in this stream is paired with its index
   * @param options - (optional) object specifying the following properties<br/>
   * - startIndex: (optional) an alternative start index to use
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).indexed().toArray()
   * // => [[0, 1], [1, 2], [2, 3]]
   * ```
   * @note O(1)
   */
  indexed(options?: {
    startIndex?: number | undefined;
  }): AsyncStream<[number, T]>;
  /**
   * Returns an AsyncStream where `mapFun` is applied to each element.
   * @typeparam T2 - the resulting element type
   * @param mapFun - a potentially asynchronous function taking an element and its index, and returning some new element
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).map(async (v, i) => `[${i}]: ${v}`).toArray()
   * // => ['[0]: 1', '[1]: 2', '[2]: 3']
   * ```
   * @note O(1)
   */
  map<T2>(
    mapFun: (value: T, index: number) => MaybePromise<T2>
  ): AsyncStream<T2>;
  /**
   * Returns an AsyncStream where the given `mapFun` is applied to each value in the stream, with optionally
   * as extra arguments the given `args`.
   * @typeparam T2 - the result value type
   * @typeparam A - the type of arguments to be supplied to the mapFun after each element
   * @param mapFun - a potentially asynchronous function taking an element and the given args, and returning the resulting stream value
   * @param args - (optional) the extra arguments to pass to the given `mapFun` when needed
   * @note is mostly aimed to increase performance so that an extra function is not required
   * @note can be used on function that really expect 1 argument, since the normal map will also pass more arguments
   * @example
   * ```ts
   * const s = AsyncStream.of({ a: 1 }, { a: 2, c: { d: true } })
   * const s2 = s.mapPure(JSON.stringify, ['a'], 5)
   * // when stream is evaluated, will call JSON.stringify on each stream element with the given extra arguments
   * console.log(await s2.toArray())
   * // => ["{\n \"a\": 1\n}", "{\n \"a\": 2\n}"]
   * ```
   */
  mapPure<T2, A extends readonly unknown[]>(
    mapFun: (value: T, ...args: A) => MaybePromise<T2>,
    ...args: A
  ): AsyncStream<T2>;
  /**
   * Returns an AsyncStream consisting of the concatenation of `flatMapFun` applied to each element.
   * @typeparam T2 - the resulting element type
   * @param flatMapFun - a potentially asynchronous function receiving the inputs described below and returning a `StreamSource` of new elements<br/>
   * - value: the next element<br/>
   * - index: the index of the element<br/>
   * - halt: a function that, if called, ensures that no new elements are passed
   * @note O(1)
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).flatMap(async (v, i, halt) => {
   *   if (i >= 1) halt();
   *   return [v, i, v + i]
   * }).toArray()
   * // => [1, 0, 1, 2, 1, 3]
   * ```
   */
  flatMap<T2>(
    flatMapFun: (
      value: T,
      index: number,
      halt: () => void
    ) => AsyncStreamSource<T2>
  ): AsyncStream<T2>;
  /**
   * Returns an AsyncStream consisting of the concatenation of `flatMapFun` applied to each element, zipped with the element that was provided to the function.
   * @typeparam T2 - the result element type
   * @param flatMapFun - a function receiving the inputs described below and returning an `AsyncStreamSource` of new elements<br/>
   * - value: the next element<br/>
   * - index: the index of the element<br/>
   * - halt: a function that, if called, ensures that no new elements are passed
   * @note O(1)
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).flatZip((v, i, halt) => {
   *   if (i >= 1) halt();
   *   return [v, i, v + i]
   * }).toArray()
   * // => [[1, 1], [1, 0], [1, 1], [2, 2], [2, 1], [2, 3]]
   * ```
   */
  flatZip<T2>(
    flatMapFun: (
      value: T,
      index: number,
      halt: () => void
    ) => AsyncStreamSource<T2>
  ): AsyncStream<[T, T2]>;
  /**
   * Returns an AsyncStream consisting of the concatenation of AsyncStreamSource elements resulting from applying the given `reducer` to each element.
   * @typeparam R - the resulting element type
   * @param transformer - an async reducer taking elements ot type T as input, and returing an `AsyncStreamSource` of element type R
   * @note O(1)
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3, 4, 5, 6).transform(AsyncTransformer.window(3)).toArray()
   * // => [[1, 2, 3], [4, 5, 6]]
   * ```
   */
  transform<R, T2 extends T = T>(
    transformer: AsyncTransformer.Accept<T | T2, R>
  ): AsyncStream<R>;
  /**
   * Returns an AsyncStream containing only those elements from this stream for which the given `pred` function returns true.
   * @param pred - a potentially asynchronous function taking an element and its index, and returning true if the element should be included in the resulting stream.
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @note if the predicate is a type guard, the return type is automatically inferred
   * @note O(1)
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).filter(async (v, i) => v + i !== 3).toArray()
   * // => [1, 3]
   * await AsyncStream.of(1, 2, 3).filter(async (v, i) => v + i !== 3, { negate: true }).toArray()
   * // => [2]
   * ```
   */
  filter<TF extends T>(
    pred: (value: T, index: number, halt: () => void) => value is TF,
    options?: { negate?: false | undefined }
  ): AsyncStream<TF>;
  filter<TF extends T>(
    pred: (value: T, index: number, halt: () => void) => value is TF,
    options: { negate: true }
  ): AsyncStream<Exclude<T, TF>>;
  filter(
    pred: (value: T, index: number, halt: () => void) => MaybePromise<boolean>,
    options?: { negate?: boolean | undefined }
  ): AsyncStream<T>;
  /**
   * Returns an AsyncStream containing only those elements from this stream for which the given `pred` function returns true.
   * @typeparam A - the type of the arguments to be passed to the `pred` function after each element
   * @param options - object specifying the following properties<br/>
   * - pred: a potentially asynchronous function taking an element the optionaly given `args`, and returning true if the element should be included in the resulting stream.<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @param args - (optional) the extra arguments to pass to the given `mapFun`
   * @note if the predicate is a type guard, the return type is automatically inferred
   * @note O(1)
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).filterPure({ pred: Object.is }, 2).toArray()
   * // => [2]
   * await AsyncStream.of(1, 2, 3).filterPure({ pred: Object.is, negate: true }, 2).toArray()
   * // => [1, 3]
   * ```
   */
  filterPure<A extends readonly unknown[], TF extends T>(
    options: {
      pred: (value: T, ...args: A) => value is TF;
      negate?: false | undefined;
    },
    ...args: A
  ): AsyncStream<T>;
  filterPure<A extends readonly unknown[], TF extends T>(
    options: {
      pred: (value: T, ...args: A) => value is TF;
      negate: true;
    },
    ...args: A
  ): AsyncStream<Exclude<T, TF>>;
  filterPure<A extends readonly unknown[]>(
    options: {
      pred: (value: T, ...args: A) => MaybePromise<boolean>;
      negate?: boolean | undefined;
    },
    ...args: A
  ): AsyncStream<T>;
  /**
   * Returns an AsyncStream containing only those elements that are in the given `values` array.
   * @typeparam F - a subtype of T to indicate the resulting element type
   * @param values - an array of values to include
   */
  withOnly<F extends T>(values: F[]): AsyncStream<F>;
  /**
   * Returns an AsyncStream containing all elements except the elements in the given `values` array.
   * @typeparam F - a subtype of T to indicate the resulting element type
   * @param values - an array of values to exclude
   */
  without<F extends T>(
    values: F[]
  ): AsyncStream<T extends Exclude<T, F> ? T : Exclude<T, F>>;
  /**
   * Returns an AsyncStream containing the resulting elements from applying the given `collectFun` to each element in this Stream.
   * @typeparam R - the resulting element type
   * @param collectFun - a potentially asynchronous function taking the parameters below and returning a new element or a skip token<br/>
   * - value: the next element<br/>
   * - index: the element index<br/>
   * - skip: an element that can be returned if the current element should be skipped<br/>
   * - halt: a function that, if called, ensures that no new elements are passed
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).collect(async (v, i, skip, halt) => {
   *   if (i === 0) return skip;
   *   if (i === 1) halt();
   *   return String(v)
   * }).toArray();
   * // => ['1']
   * ```
   * @note O(1)
   */
  collect<R>(collectFun: AsyncCollectFun<T, R>): AsyncStream<R>;
  /**
   * Returns the first element of the AsyncStream, or a fallback value (default undefined) if the stream is empty.
   * @typeparam O - the optional value type to return if the stream is empty
   * @param otherwise - (default: undefined) an `AsyncOptLazy` value to be returned if the stream is empty.
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).first()      // => 1
   * await AsyncStream.empty<number>().first()  // => undefined
   * await AsyncStream.empty<number>().first(0) // => 0
   * await AsyncStream.empty<number>().first(async () => 0) // => 0
   * ```
   * @note O(1)
   */
  first(): Promise<T | undefined>;
  first<O>(otherwise: AsyncOptLazy<O>): Promise<T | O>;
  /**
   * Returns the last element of the AsyncStream, or a fallback value (default undefined) if the stream is empty.
   * @typeparam O - the optional value type to return if the stream is empty
   * @param otherwise - (default: undefined) an `AsyncOptLazy` value to be returned if the stream is empty.
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).last()      // => 3
   * await AsyncStream.empty<number>().last()  // => undefined
   * await AsyncStream.empty<number>().last(0) // => 0
   * await AsyncStream.empty<number>().last(async () => 0) // => 0
   * ```
   * @note O(N)
   */
  last(): Promise<T | undefined>;
  last<O>(otherwise: AsyncOptLazy<O>): Promise<T | O>;
  /**
   * Returns the first element of the Stream if it only has one element, or a fallback value if the Stream does not have exactly one value.
   * @typeparam O - the optional value to return if the stream does not have exactly one value.
   * @param otherwise - (default: undefined) an `OptLazy` value to return if the Stream does not have exactly one value.
   * @example
   * ```ts
   * await AsyncStream.empty<number>().single()  // => undefined
   * await AsyncStream.of(1, 2, 3).single()      // => undefined
   * await AsyncStream.of(1).single()            // => 1
   * await AsyncStream.of(1, 2, 3).single(0)     // => 0
   * ```
   */
  single(): Promise<T | undefined>;
  single<O>(otherwise: AsyncOptLazy<O>): Promise<T | O>;
  /**
   * Returns the amount of elements in the AsyncStream.
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).count() // => 3
   * ```
   * @note O(N) for most types of Stream
   * @note be careful not to use on infinite streams
   */
  count(): Promise<number>;
  /**
   * Returns the amount of elements that are equal according to the given `eq` to the given `value` in the AsyncStream.
   * @param value - the value to compare to
   * @param options - (optional) object specifying the following properties<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
   * - negate: (default: false) when true will negate the given Eq function
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).countElement(2) // => 1
   * await AsyncStream.of(1, 2, 3).countElement(2, { negate: true }) // => 2
   * ```
   * @note O(N)
   * @note be careful not to use on infinite streams
   */
  countElement(
    value: T,
    options?: { eq?: Eq<T> | undefined; negate?: boolean | undefined }
  ): Promise<number>;
  /**
   * Returns the first element for which the given `pred` function returns true, or a fallback value otherwise.
   * @typeparam O - the optional value type to return no value was found
   * @param pred - a potentially asynchronous predicate function taking an element and its index
   * @param options - (optional) object specifying the following properties<br/>
   * - occurrance: (default: 1) the occurrance number to look for<br/>
   * - otherwise: (default: undefined) an `OptLazy` value to be returned if the Stream is empty
   * @note if the predicate is a type guard, the return type is automatically inferred
   * @example
   * ```ts
   * const isEven = async (v: number) => v % 2 === 0
   * await AsyncStream.of(1, 2, 3, 4).find(isEven)           // => 2
   * await AsyncStream.of(1, 2, 3, 4).find(isEven, { occurrance: 2 })        // => 4
   * await AsyncStream.of(1, 2, 3, 4).find(isEven, { occurrance: 3 })        // => undefined
   * await AsyncStream.of(1, 2, 3, 4).find(isEven, { occurrance: 3, otherwise: 'a' })
   * // => 'a'
   * ```
   * @note O(N)
   */
  find<O, TF extends T>(
    pred: (value: T, index: number) => value is TF,
    options?: {
      occurrance?: number | undefined;
      negate?: false | undefined;
      otherwise: AsyncOptLazy<O>;
    }
  ): Promise<TF | O>;
  find<O, TF extends T>(
    pred: (value: T, index: number) => value is TF,
    options: {
      occurrance?: number | undefined;
      negate: true;
      otherwise: AsyncOptLazy<O>;
    }
  ): Promise<Exclude<T, TF> | O>;
  find<TF extends T>(
    pred: (value: T, index: number) => value is TF,
    options?: {
      occurrance?: number | undefined;
      negate?: false | undefined;
      otherwise?: undefined;
    }
  ): Promise<T | undefined>;
  find<TF extends T>(
    pred: (value: T, index: number) => value is TF,
    options: {
      occurrance?: number | undefined;
      negate: true;
      otherwise?: undefined;
    }
  ): Promise<Exclude<T, TF> | undefined>;
  find<O>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options?: {
      occurrance?: number | undefined;
      negate?: boolean | undefined;
      otherwise: AsyncOptLazy<O>;
    }
  ): Promise<T | O>;
  find(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options?: {
      occurrance?: number | undefined;
      negate?: boolean | undefined;
      otherwise?: undefined;
    }
  ): Promise<T | undefined>;
  /**
   * Returns the element in the AsyncStream at the given index, or a fallback value (default undefined) otherwise.
   * @typeparam O - the optional value type to return if the index is out of bounds
   * @param index - the index of the element to retrieve
   * @param otherwise - (optional) an `AsyncOptLazy` value to be returned if the index is out of bounds
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).elementAt(1)        // => 2
   * await AsyncStream.of(1, 2, 3).elementAt(5)        // => undefined
   * await AsyncStream.of(1, 2, 3).elementAt(5, 'a')   // => 'a'
   * await AsyncStream.of(1, 2, 3).elementAt(5, async () => 'a')   // => 'a'
   * ```
   * @note O(N) for most types of Stream
   */
  elementAt(index: number): Promise<T | undefined>;
  elementAt<O>(index: number, otherwise: AsyncOptLazy<O>): Promise<T | O>;
  /**
   * Returns an AsyncStream containing the indices of the elements for which the given `pred` function returns true.
   * @param pred - a potentially asynchronous predicate function taking an element
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).indicesWhere((v, i) => v + i !== 3).toArray()
   * // => [0, 2]
   * ```
   * @note O(N)
   */
  indicesWhere(
    pred: (value: T) => MaybePromise<boolean>,
    options?: { negate?: boolean | undefined }
  ): AsyncStream<number>;
  /**
   * Returns an AsyncStream containing the indicies of the occurrance of the given `searchValue`, according to given `eq` function.
   * @param searchValue - the value to search for
   * @param options - (optional) object specifying the following properties<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
   * - negate: (default: false) when true will negate the given Eq function
   * @example
   * ```ts
   * await AsyncStream.from('marmot').indicesOf('m').toArray()
   * // => [0, 3]
   * ```
   * @note O(N)
   */
  indicesOf(
    searchValue: T,
    options?: { eq?: Eq<T> | undefined; negate?: boolean | undefined }
  ): AsyncStream<number>;
  /**
   * Returns the index of the given `occurrance` instance of the element in the AsyncStream that satisfies given `pred` function,
   * or undefined if no such instance is found.
   * @param pred - a potentially asynchronous predicate function taking an element and its index
   * @param options - (optional) object specifying the following properties<br/>
   * - occurrance: (default: 1) the occurrance to search for<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).indexWhere((v, i) => v + i > 2)      // => 1
   * await AsyncStream.of(1, 2, 3).indexWhere(async (v, i) => v + i > 2, { occurrance: 2 })   // => 2
   * ```
   * @note O(N)
   */
  indexWhere(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options?: { occurrance?: number | undefined; negate?: boolean | undefined }
  ): Promise<number | undefined>;
  /**
   * Returns the index of the `occurrance` instance of given `searchValue` in the AsyncStream, using given `eq` function,
   * or undefined if no such value is found.
   * @param searchValue  - the element to search for
   * @param options - (optional) object specifying the following properties<br/>
   * - occurrance - (default: 1) the occurrance to search for<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
   * - negate: (default: false) when true will negate the given Eq function
   * @example
   * ```ts
   * const source = AsyncStream.from('marmot')
   * await source.indexOf('m')     // => 0
   * await source.indexOf('m', { occurrance: 2 })  // => 3
   * await source.indexOf('m', { occurrance: 3 })  // => undefined
   * await source.indexOf('q')     // => undefined
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
  ): Promise<number | undefined>;
  /**
   * Returns true if any element of the AsyncStream satifies given `pred` function.
   * @param pred - a potentially asynchonous predicate function taking an element and its index
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).some((v, i) => v + i > 10) // => false
   * await AsyncStream.of(1, 2, 3).some(async (v, i) => v + i > 1)  // => true
   * ```
   * @note O(N)
   */
  some(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options?: { negate?: boolean | undefined }
  ): Promise<boolean>;
  /**
   * Returns true if every element of the AsyncStream satifies given `pred` function.
   * @param pred - a potentially asynchronous predicate function taking an element and its index
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).every((v, i) => v + i > 10)  // => false
   * await AsyncStream.of(1, 2, 3).every(async (v, i) => v + i < 10)  // => true
   * ```
   * @note O(N)
   */
  every(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options?: { negate?: boolean | undefined }
  ): Promise<boolean>;
  /**
   * Returns true if the AsyncStream contains given `amount` instances of given `value`, using given `eq` function.
   * @param value - the value to search for
   * @param options - (optional) object specifying the following properties<br/>
   * = amount: (default: 1) the amount of values the Stream should contain<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * const source = Stream.from('marmot')
   * await source.contains('m')    // => true
   * await source.contains('m', 2) // => true
   * await source.contains('m', 3) // => false
   * await source.contains('q')    // => false
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
  ): Promise<boolean>;
  /**
   * Returns true if this stream contains the same sequence of elements as the given `source`,
   * false otherwise.
   * @param source - a non-empty async stream source containing the element sequence to find
   * @param options - (optional) object specifying the following properties<br/>
   * - eq: (default: `Eq.objectIs`) the function to use to test element equality
   * - negate: (default: false) when true will negate the given Eq function
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3, 4, 5).containsSlice([2, 3, 4])
   * // => true
   * await AsyncStream.of(1, 2, 3, 4, 5).containsSlice([4, 3, 2])
   * // => false
   * ```
   */
  containsSlice(
    source: AsyncStreamSource.NonEmpty<T>,
    options?: { eq?: Eq<T> | undefined; amount?: number | undefined }
  ): Promise<boolean>;
  /**
   * Returns an AsyncStream that contains the elements of this stream up to the first element that does not satisfy given `pred` function.
   * @param pred - a potentially asynchronous predicate function taking an element and its index
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).takeWhile(async v => v < 3).toArray()
   * // => [1, 2]
   * ```
   * @note O(N)
   */
  takeWhile(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options?: { negate?: boolean | undefined }
  ): AsyncStream<T>;
  /**
   * Returns an AsyncStream that contains the elements of this stream starting from the first element that does not satisfy given `pred` function.
   * @param pred - a potentially asynchronous predicate function taking an element and its index
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).dropWhile(async v => v < 2).toArray()
   * // => [2, 3]
   * ```
   * @note O(N)
   */
  dropWhile(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options?: { negate?: boolean | undefined }
  ): AsyncStream<T>;
  /**
   * Returns an AsyncStream that contains the elements of this stream up to a maximum of `amount` elements.
   * @param amount - the maximum amount of elements to return from the resulting Stream
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).take(2).toArray()   // => [1, 2]
   * ```
   * @note O(N)
   */
  take(amount: number): AsyncStream<T>;
  /**
   * Returns an AsyncStream that skips the first `amount` elements of this stream and returns the rest.
   * @param amount - the amount of elements to skip
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).drop(1).toArray()   // => [2, 3]
   * ```
   * @note O(N)
   */
  drop(amount: number): AsyncStream<T>;
  /**
   * Returns an AsyncStream that returns the elements from this stream given `amount` of times.
   * @param amount - (default: undefined) the amount of times to return this Stream
   * @example
   * ```ts
   * const source = AsyncStream.of(1, 2, 3)
   * source.repeat()              // => AsyncStream(1, 2, 3, 1, 2, 3, 1, 2, ...)
   * await source.repeat(1).toArray()   // => [1, 2, 3]
   * await source.repeat(3).toArray()   // => [1, 2, 3, 1, 2, 3, 1, 2, 3]
   * await source.repeat(-3).toArray()  // => [1, 2, 3]
   * ```
   * @note amount = undefined means that the AsyncStream is repeated indefintely
   * @note amount = 1 means that the Stream is not repeated
   * @note amount < 1 will be normalized to amount = 1
   * @note O(1)
   */
  repeat(amount?: number | undefined): AsyncStream<T>;
  /**
   * Returns an AsyncStream containing the elements of this stream followed by all elements produced by the `others` array of AsyncStreamSources.
   * @typeparam T2 - the element type of the stream to concatenate
   * @param others - a series of AsyncStreamSources to concatenate.
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).concat([4, 5], () => [6, 7]).toArray()
   * // [1, 2, 3, 4, 5, 6, 7]
   * ```
   * @note O(1)
   */
  concat<T2 = T>(
    ...others: ArrayNonEmpty<AsyncStreamSource.NonEmpty<T2>>
  ): AsyncStream.NonEmpty<T | T2>;
  concat<T2 = T>(
    ...others: ArrayNonEmpty<AsyncStreamSource<T2>>
  ): AsyncStream<T | T2>;
  /**
   * Returns the mimimum element of the AsyncStream according to a default compare function, or the provided `otherwise` fallback value if the
   * stream is empty.
   * @typeparam O - the optional value type to return if the stream is empty
   * @param otherwise - (default: undefined) the value to return if the stream is empty
   * @example
   * ```ts
   * await AsyncStream.of(5, 1, 3).min()         // => 1
   * await AsyncStream.empty<number>().min()     // => undefined
   * await AsyncStream.empty<number>().min('a')  // => 'a'
   * await AsyncStream.empty<number>().min(async () => 'a')  // => 'a'
   * ```
   * @note O(N)
   */
  min(): Promise<T | undefined>;
  min<O>(otherwise: AsyncOptLazy<O>): Promise<T | O>;
  /**
   * Returns the mimimum element of the AsyncStream according to the provided `compare` function, or the provided `otherwise` fallback value
   * if the stream is empty.
   * @typeparam O - the optional value type to return if the stream is empty
   * @param otherwise - (default: undefined) the value to return if the Stream is empty
   * @example
   * ```ts
   * function compareLength(a: string, b: string): number { return b.length - a.length };
   * await AsyncStream.of('abc', 'a', 'ab').minBy(compareLength)   // => 'a'
   * await AsyncStream.empty<string>().minBy(compareLength)        // => undefined
   * await AsyncStream.empty<string>().minBy(compareLength, 'a')   // => 'a'
   * ```
   * @note O(N)
   */
  minBy(compare: (v1: T, v2: T) => number): Promise<T | undefined>;
  minBy<O>(
    compare: (v1: T, v2: T) => number,
    otherwise: AsyncOptLazy<O>
  ): Promise<T | O>;
  /**
   * Returns the maximum element of the AsyncStream according to a default compare function, or the provided `otherwise` fallback value if the
   * stream is empty.
   * @typeparam O - the optional value type to return if the stream is empty
   * @param otherwise - (default: undefined) the value to return if the Stream is empty
   * @example
   * ```ts
   * await AsyncStream.of(5, 1, 3).max()         // => 5
   * await AsyncStream.empty<number>().max()     // => undefined
   * await AsyncStream.empty<number>().max('a')  // => 'a'
   * ```
   * @note O(N)
   */
  max(): Promise<T | undefined>;
  max<O>(otherwise: AsyncOptLazy<O>): Promise<T | O>;
  /**
   * Returns the maximum element of the AsyncStream according to the provided `compare` function, or the provided `otherwise` fallback value
   * if the stream is empty.
   * @typeparam O - the optional value type to return if the stream is empty
   * @param otherwise - (default: undefined) the value to return if the Stream is empty
   * @example
   * ```ts
   * function compareLength(a: string, b: string): number { return b.length - a.length };
   * await AsyncStream.of('abc', 'a', 'ab').maxBy(compareLength)   // => 'abc'
   * await AsyncStream.empty<string>().maxBy(compareLength)        // => undefined
   * await AsyncStream.empty<string>().maxBy(compareLength, 'a')   // => 'a'
   * ```
   * @note O(N)
   */
  maxBy(compare: (v1: T, v2: T) => number): Promise<T | undefined>;
  maxBy<O>(
    compare: (v1: T, v2: T) => number,
    otherwise: AsyncOptLazy<O>
  ): Promise<T | O>;
  /**
   * Returns an AsyncStream with all elements from the given `sep` AsyncStreamSource between two elements of this stream.
   * @param sep - the AsyncStreamSource to insert between each element of this Stream
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).intersperse("ab").toArray()
   * // => [1, 'a', 'b', 2, 'a', 'b', 3]
   * ```
   * @note O(1)
   */
  intersperse(sep: AsyncStreamSource<T>): AsyncStream<T>;
  /**
   * Returns a string resulting from converting each element to string with `options.valueToString`, interspersed with `options.sep`, starting with
   * `options.start` and ending with `options.end`.
   * @param options - (optional) object specifying the following properties<br/>
   * - sep: (optional) a seperator to insert between each Stream element<br/>
   * - start: (optional) a start string to prepend at the start<br/>
   * - end: (optional) an end string to append at the end<br/>
   * - valueToString: (default: String) a potentially asynchronous function converting a Stream element to a string<br/>
   * - ifEmpty: (optional) a string to return instead of the start and end tag if the stream is empty
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).join({ start: '<', sep: ', ', end: '>' })
   * // => '<1, 2, 3>'
   * ```
   * @note O(N)
   */
  join(options?: {
    sep?: string | undefined;
    start?: string | undefined;
    end?: string | undefined;
    valueToString?: ((value: T) => MaybePromise<string>) | undefined;
    ifEmpty?: string | undefined;
  }): Promise<string>;
  /**
   * Returns an AsyncStream starting with `options.sep`, then returning the elements of this Stream interspersed with `options.sep`, and ending with
   * `options.end`.
   * @param options - object specifying the following properties<br/>
   * - sep: (optional) a seperator StreamSource to insert between each Stream element<br/>
   * - start: (optional) a start StreamSource to prepend<br/>
   * - end: (optional) an end StreamSource to append
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).mkGroup({ start: '<<', sep: '-', end: '>>' }).toArray()
   * // => ['<', '<', 1, '-', 2, '-', 3, '>', '>']
   * ```
   * @note O(N)
   */
  mkGroup(options: {
    sep?: AsyncStreamSource<T> | undefined;
    start?: AsyncStreamSource<T> | undefined;
    end?: AsyncStreamSource<T> | undefined;
  }): AsyncStream<T>;
  /**
   * Returns an AsyncStream of collections of stream elements, where each array is filled with elements of this stream up to the next element that
   * satisfies give function `pred`.
   * @param pred - a potentially asynchronous predicate function taking an element and its index
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   * - collector: (default: `AsyncArray.toArray()`) the async reducer to use to collect the resulting values
   * @typeparam R - the result type of the collector and the resulting stream element type
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3, 4).splitWhere(async v => v == 3).toArray()
   * // => [[1, 2], [4]]
   * ```
   * @note O(1)
   */
  splitWhere<R, T2 extends T = T>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: {
      negate?: boolean | undefined;
      collector: AsyncReducer.Accept<T | T2, R>;
    }
  ): AsyncStream<R>;
  splitWhere(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options?: { negate?: boolean | undefined; collector?: undefined }
  ): AsyncStream<T[]>;
  /**
   * Returns an AsyncStream of collections of stream elements, where each array is filled with elements of this stream up to the next element that
   * equals given `sepElem` according to the given `eq` function.
   * @param sepElem - the separator element to look for
   * @param options - (optional) object specifying the following properties<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
   * - negate: (default: false) when true will negate the given Eq function
   * - collector: (default: `AsyncArray.toArray()`) the async reducer to use to collect the resulting values
   * @typeparam R - the result type of the collector and the resulting stream element type
   * @example
   * ```ts
   * await AsyncStream.from('marmot').splitOn('m').toArray()  // => [[], ['a', 'r'], ['o', 't']]
   * ```
   * @note O(1)
   */
  splitOn<R, T2 extends T = T>(
    sepElem: T,
    options?: {
      eq?: Eq<T> | undefined;
      negate?: boolean | undefined;
      collector: AsyncReducer.Accept<T | T2, R>;
    }
  ): AsyncStream<R>;
  splitOn(
    sepElem: T,
    options?: {
      eq?: Eq<T> | undefined;
      negate?: boolean | undefined;
      collector?: undefined;
    }
  ): AsyncStream<T[]>;
  /**
   * Returns an AsyncStream of collections of stream elements, where each array is filled with elements of this stream up to the next sequence of elements that
   * matches given `sepSeq` ordered elements with the given `eq` function.
   * @param sepSlice - an `AsyncStreamSource` contaning the sequence to find
   * @param options - (optional) object specifying the following properties<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
   * - collector: (default: `AsyncArray.toArray()`) the async reducer to use to collect the resulting values
   * @typeparam R - the result type of the collector and the resulting stream element type
   * @example
   * ```ts
   * await AsyncStream.from('marmalade').splitSeq('ma').toArray()  // => [[], ['r'], ['l', 'a', 'd', 'e']]
   * ```
   * @note O(1)
   */
  splitOnSlice<R, T2 extends T = T>(
    sepSlice: AsyncStreamSource<T>,
    options: {
      eq?: Eq<T> | undefined;
      collector: AsyncReducer.Accept<T | T2, R>;
    }
  ): AsyncStream<R>;
  splitOnSlice(
    sepSlice: AsyncStreamSource<T>,
    options?: { eq?: Eq<T> | undefined; collector?: undefined }
  ): AsyncStream<T[]>;
  /**
   * Returns an AsyncStream containing non-repetitive elements of the source stream, where repetitive elements
   * are compared using the optionally given `eq` equality function.
   * @param options - (optional) object specifying the following properties<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * await AsyncStream.of(1, 1, 2, 2, 3, 1).distinctPrevious().toArray()
   * // => [1, 2, 3, 1]
   * ```
   */
  distinctPrevious(options?: {
    eq?: Eq<T> | undefined;
    negate?: boolean | undefined;
  }): AsyncStream<T>;
  /**
   * Returns an AsyncStream containing `windows` of `windowSize` consecutive elements of the source stream, with each
   * window starting `skipAmount` elements after the previous one.
   * @typeparam R - the collector reducer result type
   * @param windowSize - the size in elements of the windows
   * @param options - (optional) object specifying the following properties<br/>
   * - skipAmount: (default: `windowSize`) the amount of elements to skip to start the next window
   * - collector: (default: `AsyncArray.toArray()`) the async reducer to use to collect the window values
   * @example
   * ```ts
   * await Stream.of(1, 2, 3, 4, 5, 6, 7).window(3).toArray()
   * // => [[1, 2, 3], [4, 5, 6]]
   * await Stream.of(1, 2, 3, 4, 5).window(3, 1).toArray()
   * // => [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
   * await Stream.of(1, 2, 3, 4).window(2, 2, AsyncReducer.toJSSet()).toArray()
   * // => [Set(1, 2), Set(3, 4)]
   * ```
   */
  window<R, T2 extends T = T>(
    windowSize: number,
    options: {
      skipAmount?: number | undefined;
      collector: AsyncReducer.Accept<T | T2, R>;
    }
  ): AsyncStream<R>;
  window(
    windowSize: number,
    options?: { skipAmount?: number | undefined; collector?: undefined }
  ): AsyncStream<T[]>;
  /**
   * Returns a promise resolving to a tuple of which the first element is the result of collecting the elements for which the given `predicate` is true, and
   * the second one the result of collecting the other elements. Own reducers can be provided as collectors, by default the values are
   * collected into an array.
   * @param pred - a potentially async predicate receiving the value and its index
   * @param options - (optional) an object containing the following properties:<br/>
   * - collectorTrue: (default: Reducer.toArray()) a reducer that collects the values for which the predicate is true<br/>
   * - collectorFalse: (default: Reducer.toArray()) a reducer that collects the values for which the predicate is false
   * @typeparam T - the input element type
   * @typeparam RT - the reducer result type for the `collectorTrue` value
   * @typeparam RF - the reducer result type for the `collectorFalse` value
   * @note if the predicate is a type guard, the return type is automatically inferred
   */
  partition<T2 extends T, RT, RF = RT>(
    pred: (value: T, index: number) => value is T2,
    options: {
      collectorTrue: AsyncReducer.Accept<T2, RT>;
      collectorFalse: AsyncReducer.Accept<Exclude<T, T2>, RF>;
    }
  ): Promise<[true: RT, false: RF]>;
  partition<T2 extends T>(
    pred: (value: T, index: number) => value is T2,
    options?: {
      collectorTrue?: undefined;
      collectorFalse?: undefined;
    }
  ): Promise<[true: T2[], false: Exclude<T, T2>[]]>;
  partition<RT, RF = RT, T2 extends T = T>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: {
      collectorTrue: AsyncReducer.Accept<T | T2, RT>;
      collectorFalse: AsyncReducer.Accept<T | T2, RF>;
    }
  ): Promise<[true: RT, false: RF]>;
  partition(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options?: {
      collectorTrue?: undefined;
      collectorFalse?: undefined;
    }
  ): Promise<[true: T[], false: T[]]>;
  /**
   * Returns a promise resolving to the result of applying the `valueToKey` function to calculate a key for each value, and feeding the tuple of the key and the value to the
   * `collector` reducer, and finally returning its result. If no collector is given, the default collector will return a JS multimap
   * of the type `Map<K, V[]>`.
   * @param valueToKey - potentially async function taking a value and its index, and returning the corresponding key
   * @param options - (optional) an object containing the following properties:<br/>
   * - collector: (default: Reducer.toArray()) a reducer that collects the incoming tuple of key and value, and provides the output
   * @typeparam T - the input value type
   * @typeparam K - the key type
   * @typeparam R - the collector output type
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).groupBy((v) => v % 2)
   * // => Map {0 => [2], 1 => [1, 3]}
   * ```
   */
  groupBy<K, R, T2 extends readonly [K, T] = [K, T]>(
    valueToKey: (value: T, index: number) => MaybePromise<K>,
    options: {
      collector: AsyncReducer.Accept<[K, T] | T2, R>;
    }
  ): Promise<R>;
  groupBy<K>(
    valueToKey: (value: T, index: number) => MaybePromise<K>,
    options?: {
      collector?: undefined;
    }
  ): Promise<Map<K, T[]>>;
  /**
   * Returns the value resulting from applying the given the given `next` function to a current state (initially the given `init` value),
   * and the next stream value, and returning the new state. When all elements are processed, the resulting state is returned.
   * @typeparam R - the resulting type
   * @param init - the initial result/state value
   * @param next - a potentially asynchronous function taking the parameters below and returning the new result/state value<br/>
   * - current: the current result/state value, initially `init`.<br/>
   * - value: the next Stream value<br/>
   * - index: the index of the given value<br/>
   * - halt: a function that, if called, ensures that no new elements are passed
   * @example
   * ```ts
   * console.log(await AsyncStream.empty<number>().fold(5, async (current, value) => current + value))
   * // => 5
   * console.log(await AsyncStream.of(1, 2, 3).fold(() => 5, (current, value) => current + value))
   * // => 11  (= 5 + 1 + 2 + 3)
   * ```
   */
  fold<R>(
    init: AsyncOptLazy<R>,
    next: (
      current: R,
      value: T,
      index: number,
      halt: () => void
    ) => MaybePromise<R>
  ): Promise<R>;
  /**
   * Returns an AsyncStream containing the values resulting from applying the given the given `next` function to a current state (initially the given `init` value),
   * and the next stream value, and returning the new state.
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
   *   await AsyncStream.empty<number>()
   *     .foldStream(5, async (current, value) => current + value)
   *     .toArray()
   * )
   * // => []
   * console.log(
   *   await AsyncStream.of(1, 2, 3)
   *     .foldStream(() => 5, (current, value) => current + value)
   *     .toArray()
   * )
   * // => [6, 8, 11]
   * ```
   */
  foldStream<R>(
    init: AsyncOptLazy<R>,
    next: (
      current: R,
      value: T,
      index: number,
      halt: () => void
    ) => MaybePromise<R>
  ): AsyncStream<R>;
  /**
   * Applies the given `(Async)Reducer` to each element in the AsyncStream, and returns the final result.
   * @typeparam R - the resulting type
   * @typeparam S - a shape defining a combined reducer definition
   * @param reducer - the `(Async)Reducer` instance to use to apply to all stream elements.
   * @example
   * ```ts
   * console.log(await AsyncStream.of(1, 2, 4).reduce(Reducer.sum))
   * // => 7
   * console.log(await AsyncStream.of(1, 2, 4).reduce(Reducer.product))
   * // => 8
   * ```
   */
  reduce<R, T2 extends T = T>(
    reducer: AsyncReducer.Accept<T | T2, R>
  ): Promise<R>;
  /**
   * Applies the given combined `(Async)Reducer` to each element in the AsyncStream, and returns the final result.
   * @typeparam S - a shape defining a combined reducer definition
   * @param shape - the `(Async)Reducer` combined instance to use to apply to all stream elements.
   * @example
   * ```ts
   * console.log(await AsyncStream.of(1, 2, 4).reduce([AsyncReducer.sum, { prod: AsyncReducer.product }]))
   * // => [7, { prod: 8 }]
   * ```
   */
  reduce<const S extends AsyncReducer.CombineShape<T>>(
    shape: S & AsyncReducer.CombineShape<T>
  ): Promise<AsyncReducer.CombineResult<S>>;
  /**
   * Returns an AsyncStream where the given `AsyncReducer` is applied to each element in the stream.
   * @typeparam R - the resulting element type
   * @param reducer - the `(Async)Reducer` instance to use to apply to all stream elements.
   * @example
   * ```ts
   * console.log(
   *   await AsyncStream.of(1, 2, 4)
   *     .reduceStream(Reducer.sum)
   *     .toArray()
   * )
   * // => [1, 3, 7]
   * console.log(
   *   await AsyncStream.of(1, 2, 4)
   *     .reduceStream(Reducer.product)
   *     .toArray()
   * )
   * // => [1, 2, 8]
   * ```
   */
  reduceStream<R, T2 extends T = T>(
    reducer: AsyncReducer.Accept<T | T2, R>
  ): AsyncStream<R>;
  /**
   * Returns an AsyncStream where the given shape containing `AsyncReducers` is applied to each element in the stream.
   * @typeparam S - the reducer shape type
   * @param shape - the reducer shape containing instances of AsyncReducers to use to apply to all stream elements.
   * @example
   * ```ts
   * console.log(
   *   await AsyncStream.of(1, 2, 4)
   *     .reduceStream([Reducer.sum, { prod: AsyncReducer.product }])
   *     .toArray()
   * )
   * // => [[1, { prod: 1 }], [3, { prod: 2 }], [7, { prod: 9 }]]
   * ```
   */
  reduceStream<const S extends AsyncReducer.CombineShape<T>>(
    shape: S & AsyncReducer.CombineShape<T>
  ): AsyncStream<AsyncReducer.CombineResult<S>>;
  /**
   * Returns an Array containing all elements in the AsyncStream.
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).toArray()   // => [1, 2, 3]
   * ```
   */
  toArray(): Promise<T[]>;
  /**
   * Returns a string representation of the AsyncStream.
   * @note to avoid issues with potentially infinite stream, this method does not list the stream elements. To do this, use `join`.
   * @example
   * ```ts
   * AsyncStream.of(1, 2, 3).toString()   // => 'AsyncStream(...<potentially empty>)'
   * ```
   */
  toString(): string;
  /**
   * Returns a JSON representation of the AsyncStream.
   * @note take care not to call on infinite Streams
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).toJSON()   // => { dataType: 'AsyncStream', value: [1, 2, 3] }
   * ```
   */
  toJSON(): Promise<ToJSON<T[], 'AsyncStream'>>;
}

export namespace AsyncStream {
  /**
   * A non-empty and possibly infinite asynchronous sequence of elements of type T.
   * See the [Stream documentation](https://rimbu.org/docs/collections/stream) and the [AsyncStream API documentation](https://rimbu.org/api/rimbu/stream/async/AsyncStream/interface)
   * @typeparam T - the element type
   * @example
   * ```ts
   * const s1 = AsyncStream.empty<number>()
   * const s2 = AsyncStream.of(1, 3, 2)
   * const s3 = AsyncStream.from(Stream.range({ start: 10, amount: 15 }))
   * ```
   */
  export interface NonEmpty<T> extends AsyncStream<T> {
    /**
     * Returns this collection typed as a 'possibly empty' collection.
     * @example
     * ```ts
     * AsyncStream.of(0, 1, 2).asNormal();  // type: AsyncStream<number>
     * ```
     */
    asNormal(): AsyncStream<T>;
    /**
     * Returns a non-empty async stream of elements of type T.
     * @example
     * ```ts
     * AsyncStream.of(1, 2, 3).asyncStream()
     * // => returns itself
     * ```
     */
    asyncStream(): this;
    /**
     * Returns a non-empty AsyncStream where each element in this stream is paired with its index
     * @param options - (optional) object specifying the following properties<br/>
     * - startIndex: (optional) an alternative start index to use
     * @example
     * ```ts
     * await AsyncStream.of(1, 2, 3).indexed().toArray()
     * // => [[0, 1], [1, 2], [2, 3]]
     * ```
     * @note O(1)
     */
    indexed(options?: {
      startIndex?: number | undefined;
    }): AsyncStream.NonEmpty<[number, T]>;
    /**
     * Returns a non-empty AsyncStream where `mapFun` is applied to each element.
     * @typeparam T2 - the result element type
     * @param mapFun - a potentially asynchronous function taking an element and its index, and returning some new element
     * @example
     * ```ts
     * await AsyncStream.of(1, 2, 3).map(async (v, i) => `[${i}]: ${v}`).toArray()
     * // => ['[0]: 1', '[1]: 2', '[2]: 3']
     * ```
     * @note O(1)
     */
    map<T2>(
      mapFun: (value: T, index: number) => MaybePromise<T2>
    ): AsyncStream.NonEmpty<T2>;
    /**
     * Returns a non-empty AsyncStream where the given `mapFun` is applied to each value in the stream, with optionally
     * as extra arguments the given `args`.
     * @typeparam T2 - the result value type
     * @typeparam A - the type of the arguments to be passed to the `mapFun` function after each element
     * @param mapFun - a potentially asynchronous function taking an element and the given args, and returning the resulting stream value
     * @param args - (optional) the extra arguments to pass to the given `mapFun`
     * @note is mostly aimed to increase performance so that an extra function is not required
     * @note can be used on function that really expect 1 argument, since the normal map will also pass more arguments
     * @example
     * ```ts
     * const s = AsyncStream.of({ a: 1 }, { a: 2, c: { d: true } })
     * const s2 = s.mapPure(JSON.stringify, ['a'], 5)
     * // when stream is evaluated, will call JSON.stringify on each stream element with the given extra arguments
     * console.log(await s2.toArray())
     * // => ["{\n \"a\": 1\n}", "{\n \"a\": 2\n}"]
     * ```
     */
    mapPure<T2, A extends readonly unknown[]>(
      mapFun: (value: T, ...args: A) => MaybePromise<T2>,
      ...args: A
    ): AsyncStream.NonEmpty<T2>;
    /**
     * Returns an AsyncStream consisting of the concatenation of `flatMapFun` applied to each element.
     * @typeparam T2 - the result value type
     * @param flatMapFun - a potentially asynchronous function receiving the inputs described below and returning a `StreamSource` of new elements<br/>
     * - value: the next element<br/>
     * - index: the index of the element<br/>
     * - halt: a function that, if called, ensures that no new elements are passed
     * @note O(1)
     * @example
     * ```ts
     * await AsyncStream.of(1, 2, 3).flatMap(async (v, i, halt) => {
     *   if (i >= 1) halt();
     *   return [v, i, v + i]
     * }).toArray()
     * // => [1, 0, 1, 2, 1, 3]
     * ```
     */
    flatMap<T2>(
      flatMapFun: (value: T, index: number) => AsyncStreamSource.NonEmpty<T2>
    ): AsyncStream.NonEmpty<T2>;
    flatMap<T2>(
      flatMapFun: (
        value: T,
        index: number,
        halt: () => void
      ) => AsyncStreamSource<T2>
    ): AsyncStream<T2>;
    /**
     * Returns an AsyncStream consisting of the concatenation of `flatMapFun` applied to each element, zipped with the element that was provided to the function.
     * @typeparam T2 - the result element type
     * @param flatMapFun - a function receiving the inputs described below and returning a `StreamSource` of new elements<br/>
     * - value: the next element<br/>
     * - index: the index of the element<br/>
     * - halt: a function that, if called, ensures that no new elements are passed
     *
     * @note O(1)
     * @example
     * ```ts
     * await AsyncStream.of(1, 2, 3).flatZip((v, i, halt) => {
     *   if (i >= 1) halt();
     *   return [v, i, v + i]
     * }).toArray()
     * // => [[1, 1], [1, 0], [1, 1], [2, 2], [2, 1], [2, 3]]
     * ```
     */
    flatZip<T2>(
      flatMapFun: (value: T, index: number) => AsyncStreamSource.NonEmpty<T2>
    ): AsyncStream.NonEmpty<[T, T2]>;
    flatZip<T2>(
      flatMapFun: (
        value: T,
        index: number,
        halt: () => void
      ) => AsyncStreamSource<T2>
    ): AsyncStream<[T, T2]>;
    /**
     * Returns an AsyncStream consisting of the concatenation of AsyncStreamSource elements resulting from applying the given `reducer` to each element.
     * @typeparam R - the resulting element type
     * @param transformer - an async reducer taking elements ot type T as input, and returing an `AsyncStreamSource` of element type R.
     * @note O(1)
     * @example
     * ```ts
     * await AsyncStream.of(1, 2, 3, 4, 5, 6).transform(AsyncTransformer.window(3)).toArray()
     * // => [[1, 2, 3], [4, 5, 6]]
     * ```
     */
    transform<R, T2 extends T = T>(
      transformer: AsyncTransformer.AcceptNonEmpty<T | T2, R>
    ): AsyncStream.NonEmpty<R>;
    transform<R, T2 extends T = T>(
      transformer: AsyncTransformer.Accept<T | T2, R>
    ): AsyncStream<R>;
    /**
     * Returns the first element of the AsyncStream.
     * @example
     * ```ts
     * await AsyncStream.of(1, 2, 3).first()      // => 1
     * ```
     * @note O(1)
     */
    first(): Promise<T>;
    /**
     * Returns the last element of the AsyncStream.
     * @example
     * ```ts
     * await AsyncStream.of(1, 2, 3).last()      // => 3
     * ```
     * @note O(N)
     */
    last(): Promise<T>;
    /**
     * Returns a non-empty AsyncStream that returns the elements from this stream given `amount` of times.
     * @param amount - (default: undefined) the amount of times to return this Stream
     * @example
     * ```ts
     * const source = AsyncStream.of(1, 2, 3)
     * source.repeat()              // => AsyncStream(1, 2, 3, 1, 2, 3, 1, 2, ...)
     * await source.repeat(1).toArray()   // => [1, 2, 3]
     * await source.repeat(3).toArray()   // => [1, 2, 3, 1, 2, 3, 1, 2, 3]
     * await source.repeat(-3).toArray()  // => [1, 2, 3]
     * ```
     * @note amount = undefined means that the AsyncStream is repeated indefintely
     * @note amount = 1 means that the Stream is not repeated
     * @note amount < 1 will be normalized to amount = 1
     * @note O(1)
     */
    repeat(amount?: number | undefined): AsyncStream.NonEmpty<T>;
    /**
     * Returns a non-empty AsyncStream containing the elements of this stream followed by all elements produced by the `others` array of AsyncStreamSources.
     * @typeparam T2 - the result value type
     * @param others - a series of AsyncStreamSources to concatenate.
     * @example
     * ```ts
     * await AsyncStream.of(1, 2, 3).concat([4, 5], () => [6, 7]).toArray()
     * // [1, 2, 3, 4, 5, 6, 7]
     * ```
     * @note O(1)
     */
    concat<T2 = T>(
      ...others: ArrayNonEmpty<AsyncStreamSource<T>>
    ): AsyncStream.NonEmpty<T | T2>;
    /**
     * Returns the mimimum element of the AsyncStream according to a default compare function.
     * @example
     * ```ts
     * await AsyncStream.of(5, 1, 3).min()         // => 1
     * ```
     * @note O(N)
     */
    min(): Promise<T>;
    /**
     * Returns the mimimum element of the AsyncStream according to the provided `compare` function.
     * @example
     * ```ts
     * function compareLength(a: string, b: string): number { return b.length - a.length };
     * await AsyncStream.of('abc', 'a', 'ab').minBy(compareLength)   // => 'a'
     * ```
     * @note O(N)
     */
    minBy(compare: (v1: T, v2: T) => number): Promise<T>;
    /**
     * Returns the maximum element of the AsyncStream according to a default compare function.
     * @example
     * ```ts
     * await AsyncStream.of(5, 1, 3).max()         // => 5
     * ```
     * @note O(N)
     */
    max(): Promise<T>;
    /**
     * Returns the maximum element of the AsyncStream according to the provided `compare` function.
     * @example
     * ```ts
     * function compareLength(a: string, b: string): number { return b.length - a.length };
     * await AsyncStream.of('abc', 'a', 'ab').maxBy(compareLength)   // => 'abc'
     * ```
     * @note O(N)
     */
    maxBy(compare: (v1: T, v2: T) => number): Promise<T>;
    /**
     * Returns a non-empty AsyncStream with all elements from the given `sep` AsyncStreamSource between two elements of this stream.
     * @param sep - the AsyncStreamSource to insert between each element of this Stream
     * @example
     * ```ts
     * await AsyncStream.of(1, 2, 3).intersperse("ab").toArray()
     * // => [1, 'a', 'b', 2, 'a', 'b', 3]
     * ```
     * @note O(1)
     */
    intersperse(sep: AsyncStreamSource<T>): AsyncStream.NonEmpty<T>;
    /**
     * Returns a non-empty AsyncStream starting with `options.sep`, then returning the elements of this Stream interspersed with `options.sep`, and ending with
     * `options.end`.
     * @param options - object specifying the following properties<br/>
     * - sep: (optional) a seperator StreamSource to insert between each Stream element<br/>
     * - start: (optional) a start StreamSource to prepend<br/>
     * - end: (optional) an end StreamSource to append
     * @example
     * ```ts
     * await AsyncStream.of(1, 2, 3).mkGroup({ start: '<<', sep: '-', end: '>>' }).toArray()
     * // => ['<', '<', 1, '-', 2, '-', 3, '>', '>']
     * ```
     * @note O(N)
     */
    mkGroup(options: {
      sep?: AsyncStreamSource<T> | undefined;
      start?: AsyncStreamSource<T> | undefined;
      end?: AsyncStreamSource<T> | undefined;
    }): AsyncStream.NonEmpty<T>;
    /**
     * Returns a non-empty AsyncStream containing non-repetitive elements of the source stream, where repetitive elements
     * are compared using the optionally given `eq` equality function.
     * @param options - (optional) object specifying the following properties<br/>
     * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
     * - negate: (default: false) when true will negate the given predicate
     * @example
     * ```ts
     * await AsyncStream.of(1, 1, 2, 2, 3, 1).distinctPrevious().toArray()
     * // => [1, 2, 3, 1]
     * ```
     */
    distinctPrevious(options?: {
      eq?: Eq<T> | undefined;
      negate?: boolean | undefined;
    }): AsyncStream.NonEmpty<T>;
    /**
     * Returns an AsyncStream containing the values resulting from applying the given the given `next` function to a current state (initially the given `init` value),
     * and the next stream value, and returning the new state.
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
     *   await AsyncStream.empty<number>()
     *     .foldStream(5, async (current, value) => current + value)
     *     .toArray()
     * )
     * // => []
     * console.log(
     *   await AsyncStream.of(1, 2, 3)
     *     .foldStream(() => 5, (current, value) => current + value)
     *     .toArray()
     * )
     * // => [6, 8, 11]
     * ```
     */
    foldStream<R>(
      init: AsyncOptLazy<R>,
      next: (current: R, value: T, index: number) => MaybePromise<R>
    ): AsyncStream.NonEmpty<R>;
    foldStream<R>(
      init: AsyncOptLazy<R>,
      next: (
        current: R,
        value: T,
        index: number,
        halt: () => void
      ) => MaybePromise<R>
    ): AsyncStream<R>;
    /**
     * Returns a non-empty Array containing all elements in the AsyncStream.
     * @example
     * ```ts
     * await AsyncStream.of(1, 2, 3).toArray()   // => [1, 2, 3]
     * ```
     */
    toArray(): Promise<ArrayNonEmpty<T>>;
  }
}

export const AsyncStream: AsyncStreamConstructors = AsyncStreamConstructorsImpl;
