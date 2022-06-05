import type {
  ArrayNonEmpty,
  AsyncCollectFun,
  AsyncOptLazy,
  AsyncReducer,
  Eq,
  MaybePromise,
  ToJSON,
  TraverseState,
} from '@rimbu/common';
import type {
  AsyncFastIterable,
  AsyncStreamable,
  AsyncStreamSource,
} from '@rimbu/stream/async';
import type { AsyncStreamConstructors } from '@rimbu/stream/async-custom';
import { AsyncStreamConstructorsImpl } from '@rimbu/stream/async-custom';

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
   * @param other - the other stream to compare
   * @param eq - (optional) the equality function
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).equals([1, 2, 3])     // => true
   * await AsyncStream.of(1, 2, 3, 4).equals([1, 2, 3])  // => false
   * ```
   * @note don't use on potentially infinite streams
   * @note O(N)
   */
  equals(other: AsyncStreamSource<T>, eq?: Eq<T>): Promise<boolean>;
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
   * @param state - (optional) the traverse state
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
    state?: TraverseState
  ): Promise<void>;
  /**
   * Performs given function `f` for each element of the Stream, with the optionally given `args` as extra arguments.
   * @typeparam A - the type of the arguments to be passed to the `f` function after each element
   * @param f - the potentially asynchronous function to perform for each element, optionally receiving given extra `args`.
   * @param args - (optional) a list of extra arguments to pass to given `f` for each element
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
   * @param startIndex - (optional) an alternative start index to use
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).indexed().toArray()
   * // => [[0, 1], [1, 2], [2, 3]]
   * ```
   * @note O(1)
   */
  indexed(startIndex?: number): AsyncStream<[number, T]>;
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
    flatMapFun: (
      value: T,
      index: number,
      halt: () => void
    ) => AsyncStreamSource<T2>
  ): AsyncStream<[T, T2]>;
  /**
   * Returns an AsyncStream consisting of the concatenation of AsyncStreamSource elements resulting from applying the given `reducer` to each element.
   * @typeparam R - the resulting element type
   * @param reducer - an async reducer taking elements ot type T as input, and returing an `AsyncStreamSource` of element type R
   *
   * @note O(1)
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3, 4, 5, 6).flatReduceStream(Reducer.windowReducer(2)).toArray()
   * // => [[1, 2, 3], [4, 5, 6]]
   * ```
   */
  flatReduceStream<R>(
    reducer: AsyncReducer<T, AsyncStreamSource<R>>
  ): AsyncStream<R>;
  /**
   * Returns an AsyncStream containing only those elements from this stream for which the given `pred` function returns true.
   * @param pred - a potentially asynchronous function taking an element and its index, and returning true if the element should be included in the resulting stream.
   * @note O(1)
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).filter(async (v, i) => v + i !== 3).toArray()
   * // => [1, 3]
   * ```
   */
  filter(
    pred: (value: T, index: number, halt: () => void) => MaybePromise<boolean>
  ): AsyncStream<T>;
  /**
   * Returns an AsyncStream containing only those elements from this stream for which the given `pred` function returns false.
   * @param pred - a potentially asynchronous function taking an element and its index, and returning false if the element should be included in the resulting stream.
   * @note O(1)
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).filterNot(async (v, i) => v + i !== 3).toArray()
   * // => [2]
   * ```
   */
  filterNot(
    pred: (value: T, index: number, halt: () => void) => MaybePromise<boolean>
  ): AsyncStream<T>;
  /**
   * Returns an AsyncStream containing only those elements from this stream for which the given `pred` function returns true.
   * @typeparam A - the type of the arguments to be passed to the `pred` function after each element
   * @param pred - a potentially asynchronous function taking an element the optionaly given `args`, and returning true if the element should be included in the resulting stream.
   * @param args - (optional) the extra arguments to pass to the given `mapFun`
   * @note O(1)
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).filterPure(Object.is, 2).toArray()
   * // => [2]
   * ```
   */
  filterPure<A extends readonly unknown[]>(
    pred: (value: T, ...args: A) => MaybePromise<boolean>,
    ...args: A
  ): AsyncStream<T>;
  /**
   * Returns an AsyncStream containing only those elements from this stream for which the given `pred` function returns false.
   * @typeparam A - the type of the arguments to be passed to the `pred` function after each element
   * @param pred - a potentially asynchronous function taking an element and the optionally given `args`, and returning false if the element should be included in the resulting stream.
   * @param args - (optional) the extra arguments to pass to the given `mapFun`
   * @note O(1)
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).filterNotPure(Object.is, 2).toArray()
   * // => [1, 3]
   * ```
   */
  filterNotPure<A extends readonly unknown[]>(
    pred: (value: T, ...args: A) => MaybePromise<boolean>,
    ...args: A
  ): AsyncStream<T>;
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
  first(): MaybePromise<T | undefined>;
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
   * @param eq - (optional) the Eq instance to use to test equality
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).countElement(2) // => 1
   * ```
   * @note O(N)
   * @note be careful not to use on infinite streams
   */
  countElement(value: T, eq?: Eq<T>): Promise<number>;
  /**
   * Returns the amount of elements that are not equal according to the given `eq` to the given `value` in the AsyncStream.
   * @param value - the value to compare to
   * @param eq - (optional) the Eq instance to use to test equality
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).countNotElement(2) // => 2
   * ```
   * @note O(N)
   * @note be careful not to use on infinite streams
   */
  countNotElement(value: T, eq?: Eq<T>): Promise<number>;
  /**
   * Returns the first element for which the given `pred` function returns true, or a fallback value otherwise.
   * @typeparam O - the optional value type to return no value was found
   * @param pred - a potentially asynchronous predicate function taking an element and its index
   * @param occurrance - (default: 1) the occurrance number to look for
   * @param otherwise - (default: undefined) an `OptLazy` value to be returned if no value was found
   * @example
   * ```ts
   * const isEven = async (v: number) => v % 2 === 0
   * await AsyncStream.of(1, 2, 3, 4).find(isEven)           // => 2
   * await AsyncStream.of(1, 2, 3, 4).find(isEven, 2)        // => 4
   * await AsyncStream.of(1, 2, 3, 4).find(isEven, 3)        // => undefined
   * await AsyncStream.of(1, 2, 3, 4).find(isEven, 3, 'a')   // => 'a'
   * ```
   * @note O(N)
   */
  find(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    occurrance?: number
  ): Promise<T | undefined>;
  find<O>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    occurrance: number | undefined,
    otherwise: AsyncOptLazy<O>
  ): Promise<T | O>;
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
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).indicesWhere((v, i) => v + i !== 3).toArray()
   * // => [0, 2]
   * ```
   * @note O(N)
   */
  indicesWhere(pred: (value: T) => MaybePromise<boolean>): AsyncStream<number>;
  /**
   * Returns an AsyncStream containing the indicies of the occurrance of the given `searchValue`, according to given `eq` function.
   * @param searchValue - the value to search for
   * @param eq - (optional) the equality function to use
   * @example
   * ```ts
   * await AsyncStream.from('marmot').indicesOf('m').toArray()
   * // => [0, 3]
   * ```
   * @note O(N)
   */
  indicesOf(searchValue: T, eq?: Eq<T>): AsyncStream<number>;
  /**
   * Returns the index of the given `occurrance` instance of the element in the AsyncStream that satisfies given `pred` function,
   * or undefined if no such instance is found.
   * @param pred - a potentially asynchronous predicate function taking an element and its index
   * @param occurrance - (default: 1) the occurrance to search for
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).indexWhere((v, i) => v + i > 2)      // => 1
   * await AsyncStream.of(1, 2, 3).indexWhere(async (v, i) => v + i > 2, 2)   // => 2
   * ```
   * @note O(N)
   */
  indexWhere(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    occurrance?: number
  ): Promise<number | undefined>;
  /**
   * Returns the index of the `occurrance` instance of given `searchValue` in the AsyncStream, using given `eq` function,
   * or undefined if no such value is found.
   * @param searchValue  - the element to search for
   * @param occurrance - (default: 1) the occurrance to search for
   * @param eq - (optional) the equality function to use
   * @example
   * ```ts
   * const source = AsyncStream.from('marmot')
   * await source.indexOf('m')     // => 0
   * await source.indexOf('m', 2)  // => 3
   * await source.indexOf('m', 3)  // => undefined
   * await source.indexOf('q')     // => undefined
   * ```
   * @note O(N)
   */
  indexOf(
    searchValue: T,
    occurrance?: number,
    eq?: Eq<T>
  ): Promise<number | undefined>;
  /**
   * Returns true if any element of the AsyncStream satifies given `pred` function.
   * @param pred - a potentially asynchonous predicate function taking an element and its index
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).some((v, i) => v + i > 10) // => false
   * await AsyncStream.of(1, 2, 3).some(async (v, i) => v + i > 1)  // => true
   * ```
   * @note O(N)
   */
  some(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): Promise<boolean>;
  /**
   * Returns true if every element of the AsyncStream satifies given `pred` function.
   * @param pred - a potentially asynchronous predicate function taking an element and its index
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).every((v, i) => v + i > 10)  // => false
   * await AsyncStream.of(1, 2, 3).every(async (v, i) => v + i < 10)  // => true
   * ```
   * @note O(N)
   */
  every(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): Promise<boolean>;
  /**
   * Returns true if the AsyncStream contains given `amount` instances of given `value`, using given `eq` function.
   * @param value - the value to search for
   * @param amount - (default: 1) the amount of values the Stream should contain
   * @param eq - (optional) the equality function to use
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
  contains(value: T, amount?: number, eq?: Eq<T>): Promise<boolean>;
  /**
   * Returns an AsyncStream that contains the elements of this stream up to the first element that does not satisfy given `pred` function.
   * @param pred - a potentially asynchronous predicate function taking an element and its index
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).takeWhile(async v => v < 3).toArray()
   * // => [1, 2]
   * ```
   * @note O(N)
   */
  takeWhile(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): AsyncStream<T>;
  /**
   * Returns an AsyncStream that contains the elements of this stream starting from the first element that does not satisfy given `pred` function.
   * @param pred - a potentially asynchronous predicate function taking an element and its index
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3).dropWhile(async v => v < 2).toArray()
   * // => [2, 3]
   * ```
   * @note O(N)
   */
  dropWhile(
    pred: (value: T, index: number) => MaybePromise<boolean>
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
  repeat(amount?: number): AsyncStream<T>;
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
   * await AsyncStream.of(5, 1, 3).max()         // => 1
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
    sep?: string;
    start?: string;
    end?: string;
    valueToString?: (value: T) => MaybePromise<string>;
    ifEmpty?: string;
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
    sep?: AsyncStreamSource<T>;
    start?: AsyncStreamSource<T>;
    end?: AsyncStreamSource<T>;
  }): AsyncStream<T>;
  /**
   * Returns an AsyncStream of arrays of stream elements, where each array is filled with elements of this stream up to the next element that
   * satisfies give function `pred`.
   * @param pred - a potentially asynchronous predicate function taking an element and its index
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3, 4).splitWhere(async v => v == 3).toArray()
   * // => [[1, 2], [4]]
   * ```
   * @note O(1)
   */
  splitWhere(
    pred: (value: T, index: number) => MaybePromise<boolean>
  ): AsyncStream<T[]>;
  /**
   * Returns an AsyncStream of arrays of stream elements, where each array is filled with elements of this stream up to the next element that
   * equals given `sepElem` according to the given `eq` function.
   * @param sepElem - the separator element to look for
   * @param eq - (optional) the equality function to use
   * @example
   * ```ts
   * await AsyncStream.from('marmot').splitOn('m').toArray()  // => [[], ['a', 'r'], ['o', 't']]
   * ```
   * @note O(1)
   */
  splitOn(sepElem: T, eq?: Eq<T>): AsyncStream<T[]>;
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
   * @param reducer - the `(Async)Reducer` instance to use to apply to all stream elements.
   * @example
   * ```ts
   * console.log(await AsyncStream.of(1, 2, 4).reduce(Reducer.sum))
   * // => 7
   * console.log(await AsyncStream.of(1, 2, 4).reduce(Reducer.product))
   * // => 8
   * ```
   */
  reduce<R>(reducer: AsyncReducer<T, R>): Promise<R>;
  /**
   * Returns an AsyncStream where the given `(Async)Reducer` is applied to each element in the stream.
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
   *     .reduce(Reducer.product)
   *     .toArray()
   * )
   * // => [1, 2, 8]
   * ```
   */
  reduceStream<R>(reducer: AsyncReducer<T, R>): AsyncStream<R>;
  /**
   * Returns a tuple where each tuple element corresponds to result of applying all AsyncStream elements to the corresponding `(Async)Reducer` instance of
   * the given `reducers`.
   * @typeparam R - the resulting tuple type
   * @param reducers - a non-empty array of `(Async)Reducer` instances to use to apply to all stream elements.
   * @note all reducers are processed in parallel, thus only one traversal is needed
   * @example
   * ```ts
   * console.log(await AsyncStream.of(1, 2, 4).reduceAll(Reducer.sum, Reducer.product))
   * // => [7, 8]
   * ```
   */
  reduceAll<R extends [unknown, unknown, ...unknown[]]>(
    ...reducers: { [K in keyof R]: AsyncReducer<T, R[K]> }
  ): Promise<R>;
  /**
   * Returns an AsyncStream of tuples where each tuple element corresponds to result of applying all stream elements to the corresponding `(Async)Reducer` instance of
   * the given `reducers`. Returns one element per input stream element.
   * @typeparam R - the resulting tuple element type
   * @param reducers - a non-empty array of `(Async)Reducer` instances to use to apply to all stream elements.
   * @note all reducers are processed in parallel, thus only one traversal is needed
   * @example
   * ```ts
   * console.log(
   *   await ASyncStream.of(1, 2, 4)
   *     .reduceAllStream(Reducer.sum, Reducer.product)
   *     .toArray()
   * )
   * // => [[1, 1], [3, 2], [7, 8]]
   * ```
   */
  reduceAllStream<R extends [unknown, unknown, ...unknown[]]>(
    ...reducers: { [K in keyof R]: AsyncReducer<T, R[K]> }
  ): AsyncStream<R>;
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
     * @param startIndex - (optional) an alternative start index to use
     * @example
     * ```ts
     * await AsyncStream.of(1, 2, 3).indexed().toArray()
     * // => [[0, 1], [1, 2], [2, 3]]
     * ```
     * @note O(1)
     */
    indexed(startIndex?: number): AsyncStream.NonEmpty<[number, T]>;
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
     * @param reducer - an async reducer taking elements ot type T as input, and returing an `AsyncStreamSource` of element type R
     *
     * @note O(1)
     * @example
     * ```ts
     * await AsyncStream.of(1, 2, 3, 4, 5, 6).flatReduceStream(Reducer.windowReducer(2)).toArray()
     * // => [[1, 2, 3], [4, 5, 6]]
     * ```
     */
    flatReduceStream<R>(
      reducer: AsyncReducer<T, AsyncStreamSource.NonEmpty<R>>
    ): AsyncStream.NonEmpty<R>;
    flatReduceStream<R>(
      reducer: AsyncReducer<T, AsyncStreamSource<R>>
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
    repeat(amount?: number): AsyncStream.NonEmpty<T>;
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
     * await AsyncStream.of(5, 1, 3).max()         // => 1
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
      sep?: AsyncStreamSource<T>;
      start?: AsyncStreamSource<T>;
      end?: AsyncStreamSource<T>;
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
