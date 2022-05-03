import type {
  ArrayNonEmpty,
  CollectFun,
  Eq,
  OptLazy,
  Reducer,
  ToJSON,
  TraverseState,
} from '@rimbu/common';
import type { StreamConstructors } from '@rimbu/stream/custom';
import { StreamConstructorsImpl } from '@rimbu/stream/custom';
import type { FastIterable, Streamable, StreamSource } from '@rimbu/stream';

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
   * @param eq - (optional) the equality function
   * @example
   * ```ts
   * Stream.of(1, 2, 3).equals([1, 2, 3])     // => true
   * Stream.of(1, 2, 3, 4).equals([1, 2, 3])  // => false
   * ```
   * @note don't use on potentially infinite streams
   * @note O(N)
   */
  equals(other: StreamSource<T>, eq?: Eq<T>): boolean;
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
   * @param state - (optional) the traverse state
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
    state?: TraverseState
  ): void;
  /**
   * Performs given function `f` for each element of the Stream, with the optionally given `args` as extra arguments.
   * @param f - the function to perform for each element, optionally receiving given extra `args`.
   * @param args - (optional) a list of extra arguments to pass to given `f` for each element
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
   * @param startIndex - (optional) an alternative start index to use
   * @example
   * ```ts
   * Stream.of(1, 2, 3).indexed().toArray()
   * // => [[0, 1], [1, 2], [2, 3]]
   * ```
   * @note O(1)
   */
  indexed(startIndex?: number): Stream<[number, T]>;
  /**
   * Returns a Stream where `mapFun` is applied to each element.
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
   * Returns a Stream containing only those elements from this Stream for which the given `pred` function returns true.
   * @param pred - a function taking an element and its index, and returning true if the element should be included in the resulting Stream.
   *
   * @note O(1)
   * @example
   * ```ts
   * Stream.of(1, 2, 3).filter((v, i) => v + i !== 3).toArray()
   * // => [1, 3]
   * ```
   */
  filter(
    pred: (value: T, index: number, halt: () => void) => boolean
  ): Stream<T>;
  /**
   * Returns a Stream containing only those elements from this Stream for which the given `pred` function returns false.
   * @param pred - a function taking an element and its index, and returning false if the element should be included in the resulting Stream.
   *
   * @note O(1)
   * @example
   * ```ts
   * Stream.of(1, 2, 3).filterNot((v, i) => v + i !== 3).toArray()
   * // => [2]
   * ```
   */
  filterNot(
    pred: (value: T, index: number, halt: () => void) => boolean
  ): Stream<T>;
  /**
   * Returns a Stream containing only those elements from this Stream for which the given `pred` function returns true.
   * @param pred - a function taking an element the optionaly given `args`, and returning true if the element should be included in the resulting Stream.
   * @param args - (optional) the extra arguments to pass to the given `mapFun`
   *
   * @note O(1)
   * @example
   * ```ts
   * Stream.of(1, 2, 3).filterPure(Object.is, 2).toArray()
   * // => [2]
   * ```
   */
  filterPure<A extends readonly unknown[]>(
    pred: (value: T, ...args: A) => boolean,
    ...args: A
  ): Stream<T>;
  /**
   * Returns a Stream containing only those elements from this Stream for which the given `pred` function returns false.
   * @param pred - a function taking an element and the optionally given `args`, and returning false if the element should be included in the resulting Stream.
   * @param args - (optional) the extra arguments to pass to the given `mapFun`
   *
   * @note O(1)
   * @example
   * ```ts
   * Stream.of(1, 2, 3).filterNotPure(Object.is, 2).toArray()
   * // => [1, 3]
   * ```
   */
  filterNotPure<A extends readonly unknown[]>(
    pred: (value: T, ...args: A) => boolean,
    ...args: A
  ): Stream<T>;
  /**
   * Returns a Stream containing the resulting elements from applying the given `collectFun` to each element in this Stream.
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
   * @param otherwise - (default: undefined) an `OptLazy` value to be returned if the Stream is empty.
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
   * @param eq - (optional) the Eq instance to use to test equality
   * @example
   * ```ts
   * Stream.of(1, 2, 3).countElement(2) // => 1
   * ```
   * @note O(N) for most types of Stream
   * @note be careful not to use on infinite streams
   */
  countElement(value: T, eq?: Eq<T>): number;
  /**
   * Returns the amount of elements that are not equal according to the given `eq` to the given `value` in the Stream.
   * @param value - the value to compare to
   * @param eq - (optional) the Eq instance to use to test equality
   * @example
   * ```ts
   * Stream.of(1, 2, 3).countNotElement(2) // => 2
   * ```
   * @note O(N) for most types of Stream
   * @note be careful not to use on infinite streams
   */
  countNotElement(value: T, eq?: Eq<T>): number;
  /**
   * Returns the first element for which the given `pred` function returns true, or a fallback value otherwise.
   * @param pred - a predicate function taking an element and its index
   * @param occurrance - (default: 1) the occurrance number to look for
   * @param otherwise - (default: undefined) an `OptLazy` value to be returned if the Stream is empty
   * @example
   * ```ts
   * const isEven = (v: number) => v % 2 === 0
   * Stream.of(1, 2, 3, 4).find(isEven)           // => 2
   * Stream.of(1, 2, 3, 4).find(isEven, 2)        // => 4
   * Stream.of(1, 2, 3, 4).find(isEven, 3)        // => undefined
   * Stream.of(1, 2, 3, 4).find(isEven, 3, 'a')   // => 'a'
   * ```
   * @note O(N) for most types of Stream
   */
  find(
    pred: (value: T, index: number) => boolean,
    occurrance?: number
  ): T | undefined;
  find<O>(
    pred: (value: T, index: number) => boolean,
    occurrance: number | undefined,
    otherwise: OptLazy<O>
  ): T | O;
  /**
   * Returns the element in the Stream at the given index, or a fallback value (default undefined) otherwise.
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
   * @example
   * ```ts
   * Stream.of(1, 2, 3).indicesWhere((v, i) => v + i !== 3).toArray()
   * // => [0, 2]
   * ```
   * @note O(N)
   */
  indicesWhere(pred: (value: T) => boolean): Stream<number>;
  /**
   * Returns a Stream containing the indicies of the occurrance of the given `searchValue`, according to given `eq` function.
   * @param searchValue - the value to search for
   * @param eq - (optional) the equality function to use
   * @example
   * ```ts
   * Stream.from('marmot').indicesOf('m').toArray()
   * // => [0, 3]
   * ```
   * @note O(N)
   */
  indicesOf(searchValue: T, eq?: Eq<T>): Stream<number>;
  /**
   * Returns the index of the given `occurrance` instance of the element in the Stream that satisfies given `pred` function,
   * or undefined if no such instance is found.
   * @param pred - a predicate function taking an element and its index
   * @param occurrance - (default: 1) the occurrance to search for
   * @example
   * ```ts
   * Stream.of(1, 2, 3).indexWhere((v, i) => v + i > 2)      // => 1
   * Stream.of(1, 2, 3).indexWhere((v, i) => v + i > 2, 2)   // => 2
   * ```
   * @note O(N)
   */
  indexWhere(
    pred: (value: T, index: number) => boolean,
    occurrance?: number
  ): number | undefined;
  /**
   * Returns the index of the `occurrance` instance of given `searchValue` in the Stream, using given `eq` function,
   * or undefined if no such value is found.
   * @param searchValue  - the element to search for
   * @param occurrance - (default: 1) the occurrance to search for
   * @param eq - (optional) the equality function to use
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
  indexOf(searchValue: T, occurrance?: number, eq?: Eq<T>): number | undefined;
  /**
   * Returns true if any element of the Stream satifies given `pred` function.
   * @param pred - a predicate function taking an element and its index
   * @example
   * ```ts
   * Stream.of(1, 2, 3).some((v, i) => v + i > 10) // => false
   * Stream.of(1, 2, 3).some((v, i) => v + i > 1)  // => true
   * ```
   * @note O(N)
   */
  some(pred: (value: T, index: number) => boolean): boolean;
  /**
   * Returns true if every element of the Stream satifies given `pred` function.
   * @param pred - a predicate function taking an element and its index
   * @example
   * ```ts
   * Stream.of(1, 2, 3).every((v, i) => v + i > 10)  // => false
   * Stream.of(1, 2, 3).every((v, i) => v + i < 10)  // => true
   * ```
   * @note O(N)
   */
  every(pred: (value: T, index: number) => boolean): boolean;
  /**
   * Returns true if the Stream contains given `amount` instances of given `value`, using given `eq` function.
   * @param value - the value to search for
   * @param amount - (default: 1) the amount of values the Stream should contain
   * @param eq - (optional) the equality function to use
   * @example
   * ```ts
   * Stream.from('marmot').contains('m')    // => true
   * Stream.from('marmot').contains('m', 2) // => true
   * Stream.from('marmot').contains('m', 3) // => false
   * Stream.from('marmot').contains('q')    // => false
   * ```
   * @note O(N)
   */
  contains(value: T, amount?: number, eq?: Eq<T>): boolean;
  /**
   * Returns a Stream that contains the elements of this Stream up to the first element that does not satisfy given `pred` function.
   * @param pred - a predicate function taking an element and its index
   * @example
   * ```ts
   * Stream.of(1, 2, 3).takeWhile(v => v < 3).toArray()
   * // => [1, 2]
   * ```
   * @note O(N)
   */
  takeWhile(pred: (value: T, index: number) => boolean): Stream<T>;
  /**
   * Returns a Stream that contains the elements of this Stream starting from the first element that does not satisfy given `pred` function.
   * @param pred - a predicate function taking an element and its index
   * @example
   * ```ts
   * Stream.of(1, 2, 3).dropWhile(v => v < 2).toArray()
   * // => [2, 3]
   * ```
   * @note O(N)
   */
  dropWhile(pred: (value: T, index: number) => boolean): Stream<T>;
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
  repeat(amount?: number): Stream<T>;
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
    ...others: ArrayNonEmpty<StreamSource.NonEmpty<T2>>
  ): Stream.NonEmpty<T | T2>;
  concat<T2 = T>(...others: ArrayNonEmpty<StreamSource<T2>>): Stream<T | T2>;
  /**
   * Returns the mimimum element of the Stream according to a default compare function, or the provided `otherwise` fallback value if the
   * Stream is empty.
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
   * @param otherwise - (default: undefined) the value to return if the Stream is empty
   * @example
   * ```ts
   * Stream.of(5, 1, 3).max()         // => 1
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
    sep?: string;
    start?: string;
    end?: string;
    valueToString?: (value: T) => string;
    ifEmpty?: string;
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
    sep?: StreamSource<T>;
    start?: StreamSource<T>;
    end?: StreamSource<T>;
  }): Stream<T>;
  /**
   * Returns a Stream of arrays of Stream elements, where each array is filled with elements of this Stream up to the next element that
   * satisfies give function `pred`.
   * @param pred - a predicate function taking an element and its index
   * @example
   * ```ts
   * Stream.of(1, 2, 3, 4).splitWhere(v => v == 3).toArray()  // => [[1, 2], [4]]
   * ```
   * @note O(1)
   */
  splitWhere(pred: (value: T, index: number) => boolean): Stream<T[]>;
  /**
   * Returns a Stream of arrays of Stream elements, where each array is filled with elements of this Stream up to the next element that
   * equals given `sepElem` according to the given `eq` function.
   * @param sepElem - the separator element to look for
   * @param eq - (optional) the equality function to use
   * @example
   * ```ts
   * Stream.from('marmot').splitOn('m').toArray()  // => [[], ['a', 'r'], ['o', 't']]
   * ```
   * @note O(1)
   */
  splitOn(sepElem: T, eq?: Eq<T>): Stream<T[]>;
  /**
   * Returns the value resulting from applying the given the given `next` function to a current state (initially the given `init` value),
   * and the next Stream value, and returning the new state. When all elements are processed, the resulting state is returned.
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
   * @param reducer - the `Reducer` instance to use to apply to all Stream elements.
   * @example
   * ```ts
   * console.log(Stream.of(1, 2, 4).reduce(Reducer.sum))
   * // => 7
   * console.log(Stream.of(1, 2, 4).reduce(Reducer.product))
   * // => 8
   * ```
   */
  reduce<R>(reducer: Reducer<T, R>): R;
  /**
   * Returns a Stream where the given `reducer` is applied to each element in the Stream.
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
   *     .reduce(Reducer.product)
   *     .toArray()
   * )
   * // => [1, 2, 8]
   * ```
   */
  reduceStream<R>(reducer: Reducer<T, R>): Stream<R>;
  /**
   * Returns a tuple where each tuple element corresponds to result of applying all Stream elements to the corresponding `Reducer` instance of
   * the given `reducers`.
   * @param reducers - a non-empty array of `Reducer` instances to use to apply to all Stream elements.
   *
   * @note all reducers are processed in parallel, thus only one traversal is needed
   * @example
   * ```ts
   * console.log(Stream.of(1, 2, 4).reduceAll(Reducer.sum, Reducer.product))
   * // => [7, 8]
   * ```
   */
  reduceAll<R extends [unknown, unknown, ...unknown[]]>(
    ...reducers: { [K in keyof R]: Reducer<T, R[K]> }
  ): R;
  /**
   * Returns a Stream of tuples where each tuple element corresponds to result of applying all Stream elements to the corresponding `Reducer` instance of
   * the given `reducers`. Returns one element per input Stream element.
   * @param reducers - a non-empty array of `Reducer` instances to use to apply to all Stream elements.
   *
   * @note all reducers are processed in parallel, thus only one traversal is needed
   * @example
   * ```ts
   * console.log(
   *   Stream.of(1, 2, 4)
   *     .reduceAllStream(Reducer.sum, Reducer.product)
   *     .toArray()
   * )
   * // => [[1, 1], [3, 2], [7, 8]]
   * ```
   */
  reduceAllStream<R extends [unknown, unknown, ...unknown[]]>(
    ...reducers: { [K in keyof R]: Reducer<T, R[K]> }
  ): Stream<R>;
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
     * @param startIndex - (optional) an alternative start index to use
     * @example
     * ```ts
     * Stream.of(1, 2, 3).indexed().toArray()
     * // => [[0, 1], [1, 2], [2, 3]]
     * ```
     * @note O(1)
     */
    indexed(startIndex?: number): Stream.NonEmpty<[number, T]>;
    /**
     * Returns a non-empty Stream where `mapFun` is applied to each element.
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
     * @typeparam T2 - the result value type
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
    repeat(amount?: number): Stream.NonEmpty<T>;
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
     * Stream.of(5, 1, 3).max()         // => 1
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
      sep?: StreamSource<T>;
      start?: StreamSource<T>;
      end?: StreamSource<T>;
    }): Stream.NonEmpty<T>;
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
