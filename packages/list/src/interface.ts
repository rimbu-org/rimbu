import type { CustomBase } from '@rimbu/collection-types';
import type {
  ArrayNonEmpty,
  CollectFun,
  IndexRange,
  OmitStrong,
  OptLazy,
  Reducer,
  StringNonEmpty,
  SuperOf,
  ToJSON,
  TraverseState,
  Update,
} from '@rimbu/common';
import type {
  FastIterable,
  Stream,
  Streamable,
  StreamSource,
} from '@rimbu/stream';
import { ListContext } from './list-custom';

/**
 * A random accessible immutable sequence of values of type T.
 * @typeparam T - the value type
 * @example
 * const l1 = List.empty<string>()
 * const l2 = List.of(1, 3, 2)
 */
export interface List<T> extends FastIterable<T> {
  /**
   * The list context that acts as a factory for all related list instances.
   */
  readonly context: List.Context;
  /**
   * Returns the number of values in the collecction
   * @example
   * List.empty().length      // => 0
   * List.of(0, 1, 2).length  // => 3
   */
  readonly length: number;
  /**
   * Returns true if the collection is empty
   * @example
   * List.empty().isEmpty      // => true
   * List.of(0, 1, 2).isEmpty  // => false
   */
  readonly isEmpty: boolean;
  /**
   * Returns true if there is at least one value in the collection, and instructs the compiler to treat the collection
   * as a .NonEmpty type.
   * @example
   * const m: List<number> = List.of(1, 2, 2)
   * m.stream().first(0)     // compiler allows fallback value since the Stream may be empty
   * if (m.nonEmpty()) {
   *   m.stream().first(0)   // compiler error: fallback value not allowed since Stream is not empty
   * }
   */
  nonEmpty(): this is List.NonEmpty<T>;
  /**
   * Returns the same collection typed as non-empty.
   * @throws `RimbuError.EmptyCollectionAssumedNonEmptyError` if the collection is empty
   * @example
   * List.empty().assumeNonEmpty()           // => throws RimbuError.EmptyCollectionAssumedNonEmptyError
   * List.from([0, 1, 2]).assumeNonEmpty()   // => List.NonEmpty(0, 1, 2)
   */
  assumeNonEmpty(): List.NonEmpty<T>;
  /**
   * Returns a Stream containing the values in order of the List, or in reverse order if `reversed` is true.
   * @param reversed - (default: false) if true reverses the order of the elements
   * @example
   * List.of(0, 1, 2).stream().toArray()      // => [0, 1, 2]
   * List.of(0, 1, 2).stream(true).toArray()  // => [2, 1, 0]
   */
  stream(reversed?: boolean): Stream<T>;
  /**
   * Returns a Stream containing the values contained in the given index `range`, in order of the List,
   * or in reverse order if `reversed` is true.
   * @param range - the index range to include from the list
   * @param reversed - (default: false) if true reverses the order of the included elements
   * @example
   * List.of(0, 1, 2, 3, 4).streamRange({ start: 1, end: 2 }).toArray()             // => [0, 1, 2]
   * List.of(0, 1, 2, 3, 4).streamRange({ start: 1, amount: 2 }, true).toArray()    // => [2, 1]
   */
  streamRange(range: IndexRange, reversed?: boolean): Stream<T>;
  /**
   * Returns the first value of the List, or the `otherwise` value if the list is empty.
   * @param otherwise - (default: undefined) an `OptLazy` value to return if the List is empty
   * @example
   * List.empty().first()                  // => undefined
   * List.empty().first('other')           // => 'other'
   * List.from([0, 1, 2]).first('other')   // => 0
   * @note O(1)
   */
  first(): T | undefined;
  first<O>(otherwise: OptLazy<O>): T | O;
  /**
   * Returns the last value of the List, or the `otherwise` value if the list is empty.
   * @param otherwise - (default: undefined) an `OptLazy` value to return if the List is empty
   * @example
   * List.empty().last()                  // => undefined
   * List.empty().last('other')           // => 'other'
   * List.from([0, 1, 2]).last('other')   // => 2
   * @note O(1)
   */
  last(): T | undefined;
  last<O>(otherwise: OptLazy<O>): T | O;
  /**
   * Returns the value in the List at the given `index`.
   * @param index - the element index
   * @param otherwise - (default: undefined) an `OptLazy` value to return if the index is out of bounds
   * @note a negative `index` will be treated as follows:
   * * -1: the last value in the list
   * * -2: the second-last value in the list
   * * ...etc
   * @example
   * List.of(0, 1, 2).get(5)             // => undefined
   * List.of(0, 1, 2).get(5, 'other')    // => 'other'
   * List.of(0, 1, 2).get(1, 'other')    // => 1
   * List.of(0, 1, 2).get(-1)            // => 2
   * @note O(logB(N)) for block size B
   */
  get(index: number): T | undefined;
  get<O>(index: number, otherwise: OptLazy<O>): T | O;
  /**
   * Returns the List with the given `value` added to the start.
   * @param value - the value to prepend
   * @example
   * List.of(0, 1, 2).prepend(-10)  // => List(-10, 0, 1, 2)
   * @note O(logB(N)) for block size B - mostly o(1)
   */
  prepend(value: T): List.NonEmpty<T>;
  /**
   * Returns the List with the given `value` added to the end.
   * @param value - the value to append.
   * @example
   * List.of(0, 1, 2).append(-10)  // => List(0, 1, 2, -10)
   * @note O(logB(N)) for block size B - mostly o(1)
   */
  append(value: T): List.NonEmpty<T>;
  /**
   * Returns a List containing the first (or last) given `amount` values of this List.
   * @param amount - the desired amount of values of to include
   * @note a negative `index` will be treated as follows:
   * * -1: the last element in the list
   * * -2: the second-last element in the list
   * * ...etc
   * @example
   * List.of(0, 1, 2, 3).take(2)    // => List(0, 1)
   * List.of(0, 1, 2, 3).take(10)   // => List(0, 1, 2, 3)
   * List.of(0, 1, 2, 3).take(-2)   // => List(2, 3)
   * @note O(logB(N)) for block size B
   */
  take(amount: number): List<T>;
  /**
   * Returns a List skipping the first given `amount` elements of this List.
   * @param amount - the desired amount of values of to include
   * @note a negative `index` will be treated as follows:
   * * -1: the last element in the list
   * * -2: the second-last element in the list
   * * ...etc
   * @example
   * List.of(0, 1, 2, 3).drop(2)    // => List(2, 3)
   * List.of(0, 1, 2, 3).drop(10)   // => List()
   * List.of(0, 1, 2, 3).drop(-2)   // => List(0, 1)
   * @note O(logB(N)) for block size B
   */
  drop(amount: number): List<T>;
  /**
   * Returns the List containing the values within the given index `range`, potentially
   * reversed in order if `reversed` is true.
   * @param range - the index range to include
   * @param reversed - (default: false) if true reverses the order of the elements
   * @note a negative `index` will be treated as follows:
   * * -1: the last element in the list
   * * -2: the second-last element in the list
   * * ...etc
   * @example
   * List.of(0, 1, 2, 3).slice({ start: 1, amount: 2 })        // -> List(1, 2)
   * List.of(0, 1, 2, 3).slice({ start: -2, amount: 2 }, true) // -> List(3, 2)
   * @note O(logB(N)) for block size B
   */
  slice(range: IndexRange, reversed?: boolean): List<T>;
  /**
   * Returns the List, where at the given `index` the `remove` amount of values are replaced by the values
   * from the optionally given `insert` `StreamSource`.
   * @param options - object containing the following
   * * index: the index at which to replace values
   * * remove: (default: 0) the amount of values to remove
   * * insert: (default: []) a `StreamSource` of values to insert
   * @note a negative `index` will be treated as follows:
   * * -1: the last element in the list
   * * -2: the second-last element in the list
   * * ...etc
   * @example
   * List.of(0, 1, 2, 3).splice({ index: 2, remove: 1 })                    // -> List(0, 1, 3)
   * List.of(0, 1, 2, 3).splice({ index: 1, remove: 2, insert: [10, 11] })  // -> List(0, 10, 11, 3)
   * @note O(logB(N)) for block size B
   */
  splice(options: {
    index: number;
    remove?: number;
    insert: StreamSource.NonEmpty<T>;
  }): List.NonEmpty<T>;
  splice(options: {
    index: number;
    remove?: number;
    insert?: StreamSource<T>;
  }): List<T>;
  /**
   * Returns the List with the given `values` inserted at the given `index`.
   * @param index - the index at which to insert the values
   * @param values - a `StreamSource` of values to insert
   * @note a negative `index` will be treated as follows:
   * * -1: the last element in the list
   * * -2: the second-last element in the list
   * * ...etc
   * @example
   * List.of(0, 1, 2, 3).insert(2, [10, 11])   // -> List(0, 1, 10, 11, 2, 3)
   * List.of(0, 1, 2, 3).insert(-1, [10, 11])  // -> List(0, 1, 2, 1, 11, 3)
   * @note O(logB(N)) for block size B
   */
  insert(index: number, values: StreamSource.NonEmpty<T>): List.NonEmpty<T>;
  insert(index: number, values: StreamSource<T>): List<T>;
  /**
   * Returns the List with the given `amount` of values removed at the given `index`.
   * @param index - the index at which to remove values
   * @param amount - the amount of elements to remove
   * @note a negative `index` will be treated as follows:
   * * -1: the last element in the list
   * * -2: the second-last element in the list
   * * ...etc
   * @example
   * List.of(0, 1, 2, 3).remove(1, 2)  // -> List(0, 3)
   * List.of(0, 1, 2, 3).remove(-2, 1) // -> List(0, 1, 3)
   * @note O(logB(N)) for block size B
   */
  remove(index: number, amount?: number): List<T>;
  /**
   * Returns the List succeeded by the values from all given `StreamSource` instances given in `sources`.
   * @param sources - an array of `StreamSource` instances containing values to be added to the list
   * @note this operation is most efficient when the given sources are instances of List from the same context.
   * @example
   * List.of(0, 1, 2).concat([10, 11])                      // -> List(0, 1, 2, 10, 11)
   * List.of(0, 1, 2).concat([10, 11], new Set([12, 13]))   // -> List(0, 1, 2, 10, 11, 12, 13)
   * @note O(logB(N)) for block size B
   */
  concat(...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>): List.NonEmpty<T>;
  concat(...sources: ArrayNonEmpty<StreamSource<T>>): List<T>;
  /**
   * Returns a List that contains this List the given `amount` of times.
   * @param amount - the amount of times to repeat the values in this List
   * @note if the given amount <= -1, the reverse List is repeated
   * @note if the given amount is 0 or 1, the List itself is returned
   * @example
   * List.of(0, 1, 2).repeat(2)   // -> List(0, 1, 2, 0, 1, 2)
   * List.of(0, 1, 2).repeat(0)   // -> List(0, 1, 2)
   * @note O(logB(N)) for block size B
   */
  repeat(amount: number): List<T>;
  /**
   * Returns the List where the elements are shifted to right by `shiftRoundAmount` position, and the elements at the end are placed at the beginning.
   * @param shiftRightAmount - the amount of values to shift the elements to the right
   * @note if the `shiftRightAmount` is negative, the elements will be shifted to the left.
   * @example
   * List.of(0, 1, 2, 3).rotate(2)   // -> List(2, 3, 0, 1)
   * List.of(0, 1, 2, 3).rotate(-1)  // -> List(1, 2, 3, 0)
   * @note O(logB(N)) for block size B
   */
  rotate(shiftRightAmount: number): List<T>;
  /**
   * Returns the List where, if given `length` is larger than the List length, the given `fill` value is added to the start and/or end
   * of the List according to the `positionPercentage` such that the result length is equal to `length`.
   * @param length - the target length of the resulting list
   * @param fill - the element used to fill up empty space in the resulting List
   * @param positionPercentage - a percentage indicating how much of the filling elements should be on the left
   * side of the current List
   * @example
   * List.of(0, 1).padTo(4, 10)       // -> List(0, 1, 10, 10)
   * List.of(0, 1).padTo(4, 10, 50)   // -> List(10, 0, 1, 10)
   * List.of(0, 1).padTo(4, 10, 100)  // -> List(0, 1, 10, 10)
   * List.of(0, 1, 2).padTo(2, 10)    // -> List(0, 1, 2)
   * @note O(logB(N)) for block size B
   */
  padTo(length: number, fill: T, positionPercentage?: number): List<T>;
  /**
   * Returns the List where at the given `index` the value is replaced or updated by the given `update`.
   * @param index - the index at which to update the value
   * @param update - a new value or function taking the current value and returning a new value
   * @note a negative `index` will be treated as follows:
   * * -1: the last element in the list
   * * -2: the second-last element in the list
   * * ...etc
   * @example
   * List.of(0, 1, 2).updateAt(1, 10)            // -> List(0, 10, 2)
   * List.of(0, 1, 2).updateAt(1, v => v + 1)    // -> List(0, 2, 2)
   * List.of(0, 1, 2).updateAt(-1, 10)           // -> List(0, 1, 10)
   * @note O(logB(N)) for block size B
   */
  updateAt(index: number, update: Update<T>): List<T>;
  /**
   * Returns a List containing only those values within optionally given `range` that satisfy given `pred` predicate.
   * If `reversed` is true, the order of the values is reversed.
   * @param pred - a predicate function receiving:
   * * `value`: the next value
   * * `index`: the value index
   * * `halt`: a function that, when called, ensures no next elements are passed
   * @param range - (optional) the range of the list to include in the filtering process
   * @param reversed - (default: false) if true reverses the elements within the given range
   * @example
   * List.of(0, 1, 2, 3).filter(v => v < 2)           // -> List(0, 1)
   * List.of(0, 1, 2, 3).filter((v, _, halt) => {
   *   if (v > 1) halt();
   *   return v;
   * })                                               // -> List(0, 1, 2)
   * List.of(0, 1, 2, 3)
   *   .filter((_, i) => i > 1, undefined, true)      // -> List(1, 0)
   */
  filter(
    pred: (value: T, index: number, halt: () => void) => boolean,
    range?: IndexRange,
    reversed?: boolean
  ): List<T>;
  /**
   * Returns a List containing the values resulting from applying given `collectFun` to each value in this List.
   * @param collectFun - a function receiving
   * * `value`: the next value
   * * `index`: the value index
   * * `skip`: a token that, when returned, will not add a value to the resulting collection
   * * `halt`: a function that, when called, ensures no next elements are passed
   * @param range - (optional) the range of the list to include in the filtering process
   * @param reversed - (default: false) if true reverses the elements within the given range
   * @example
   * List.of(0, 1, 2, 3).collect(v => v > 1)
   * // => List(false, false, true, true)
   * List.of(0, 1, 2, 3).collect((v, i, skip) => v === 1 ? skip : v * 2)
   * // => List(0, 4, 6)
   * List.of(0, 1, 2, 3).collect((v, i, skip, halt) => {
   *   if (v > 1) halt()
   *   return v * 2
   * })
   * // => List(0, 2)
   */
  collect<T2>(
    collectFun: CollectFun<T, T2>,
    range?: IndexRange,
    reversed?: boolean
  ): List<T2>;
  /**
   * Performs given function `f` for each value of the List.
   * @param f - the function to perform for each element, receiving:
   * * `value`: the next value
   * * `index`: the index of the value
   * * `halt`: a function that, if called, ensures that no new elements are passed
   * @example
   * List.of(0, 1, 2, 3).forEach((value, i, halt) => {
   *  console.log(value * 2);
   *  if (i >= 1) halt();
   * })
   * // => logs 0  2
   * @note O(N)
   */
  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state?: TraverseState
  ): void;
  /**
   * Returns a List containing the result of applying given `mapFun` to each value in this List.
   * If `reversed` is true, the order of the values is reversed.
   * @param mapFun - a function receiving a value and its index, and returning a new value
   * @param reversed - (default: false) if true, reverses the order of the values
   */
  map<T2>(
    mapFun: (value: T, index: number) => T2,
    reversed?: boolean
  ): List<T2>;
  /**
   * Returns a List containing the joined results of applying given `flatMapFun` to each value in this List.
   *
   * @param flatMapFun - a function taking the next value and its index, and returning a `StreamSource`
   * of value to include in the resulting collection
   * @param range - (optional) the range of the list to include in the filtering process
   * @param reversed - (default: false) if true reverses the elements within the given range
   */
  flatMap<T2>(
    flatMapFun: (value: T, index: number) => StreamSource<T2>,
    range?: IndexRange,
    reversed?: boolean
  ): List<T2>;
  /**
   * Returns the List in reversed order.
   * @example
   * List.of(0, 1, 2).reversed()  // -> List(2, 1, 0)
   * @note O(logB(n)) for block size B
   */
  reversed(): List<T>;
  /**
   * Returns an array containing the values within given `range` (default: all) in this collection.
   * If `reversed` is true, reverses the order of the values.
   * @param range - (optional) the range of the list to include in the filtering process
   * @param reversed - (default: false) if true reverses the elements within the given range
   * @example
   * List.of(0, 1, 2, 3).toArray()                      // => [0, 1, 2, 3]
   * List.of(0, 1, 2, 3).toArray({ amount: 2 })         // => [0, 1]
   * List.of(0, 1, 2, 3).toArray({ amount: 2 }, true)   // => [1, 0]
   * @note O(logB(N)) for block size B
   * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
   */
  toArray(range?: IndexRange, reversed?: boolean): T[];
  /**
   * Returns a builder object containing the values of this collection.
   * @example
   * const builder: List.Builder<number> = List.of(0, 1, 2, 3).toBuilder()
   */
  toBuilder(): List.Builder<T>;
  /**
   * Returns a string representation of this collection.
   * @example
   * List.of(0, 1, 2, 3).toString()   // => List(0, 1, 2, 3)
   */
  toString(): string;
  /**
   * Returns a JSON representation of this collection.
   * @example
   * List.of(0, 1, 2, 3).toJSON()   // => { dataType: 'List', value: [0, 1, 2, 3] }
   */
  toJSON(): ToJSON<T[], this['context']['typeTag']>;

  /**
   * Returns the same `List` with a wider value type T2, if T2
   * is a super type of T.
   * @typeparam T2 - a super type of T
   * @example
   * const m = List.of(1, 2, 3)
   * m.extendType<number | string>()
   * // type: List.NonEmpty<number | string>
   */
  extendType<T2>(): List<SuperOf<T2, T>>;
  /**
   * Returns an array of Lists, where each list contains the values of the corresponding index of tuple T.
   * @param length - the length of the tuples in type T
   * @example
   * const m = List.of([1, 'a'], [2, 'b'])
   * m.unzip(2)  // => [List.NonEmpty<number>, List.NonEmpty<string>]
   */
  unzip<L extends number, T2 extends T = T>(
    length: L
  ): T2 extends readonly [unknown, ...unknown[]] & { length: L }
    ? { [K in keyof T2]: List<T2[K]> }
    : never;
  /**
   * Returns, if T is a valid `StreamSource`, the result of concatenating all
   * streamable elements of this List.
   * @example
   * const m = List.of([1, 2], [3, 4, 5])
   * m.flatten().toArray() // => [1, 2, 3, 4, 5]
   */
  flatten<T2 = T>(): T2 extends StreamSource.NonEmpty<infer S>
    ? List<S>
    : T2 extends StreamSource<infer S>
    ? List<S>
    : never;
}

export namespace List {
  export interface NonEmpty<T> extends List<T>, Streamable.NonEmpty<T> {
    /**
     * Returns false since this collection is known to be non-empty.
     * @example
     * List(0, 1, 2).isEmpty   // => false
     */
    isEmpty: false;
    /**
     * Returns true since this collection is known to be non-empty
     * @example
     * List.of(0, 1, 2).nonEmpty()   // => true
     */
    nonEmpty(): true;
    /**
     * Returns a self reference since this collection is known to be non-empty.
     * @example
     * const m = List.of(0, 1, 2);
     * m === m.assumeNonEmpty()  // => true
     */
    assumeNonEmpty(): this;
    /**
     * Returns this collection typed as a 'possibly empty' collection.
     * @example
     * List.of(0, 1, 2).asNormal();  // type: List<number>
     */
    asNormal(): List<T>;
    /**
     * Returns a non-empty Stream containing the values in order of the List, or in reverse order if `reversed` is true.
     * @param reversed - (default: false) if true reverses the order of the elements
     * @example
     * List.of(0, 1, 2).stream().toArray()      // => [0, 1, 2]
     * List.of(0, 1, 2).stream(true).toArray()  // => [2, 1, 0]
     */
    stream(reversed?: boolean): Stream.NonEmpty<T>;
    /**
     * Returns the first value of the List.
     * @example
     * List.of(0, 1, 2).first()   // => 0
     * @note O(1)
     */
    first(): T;
    /**
     * Returns the last value of the List.
     * @example
     * List.of(0, 1, 2).last()   // => 2
     * @note O(1)
     */
    last(): T;
    /**
     * Returns a List containing the first (or last) given `amount` values of this List.
     * @param amount - the desired amount of values of to include
     * @note a negative `index` will be treated as follows:
     * * -1: the last element in the list
     * * -2: the second-last element in the list
     * * ...etc
     * @example
     * List.of(0, 1, 2, 3).take(2)    // => List(0, 1)
     * List.of(0, 1, 2, 3).take(10)   // => List(0, 1, 2, 3)
     * List.of(0, 1, 2, 3).take(-2)   // => List(2, 3)
     * @note O(logB(N)) for block size B
     */
    take<N extends number>(amount: N): 0 extends N ? List<T> : List.NonEmpty<T>;
    /**
     * Returns the non-empty List succeeded by the values from all given `StreamSource` instances given in `sources`.
     * @param sources - an array of `StreamSource` instances containing values to be added to the list
     * @note this operation is most efficient when the given sources are instances of List from the same context.
     * @example
     * List.of(0, 1, 2).concat([10, 11])                      // -> List(0, 1, 2, 10, 11)
     * List.of(0, 1, 2).concat([10, 11], new Set([12, 13]))   // -> List(0, 1, 2, 10, 11, 12, 13)
     * @note O(logB(N)) for block size B
     */
    concat(...sources: ArrayNonEmpty<StreamSource<T>>): List.NonEmpty<T>;
    /**
     * Returns, for a List of `StreamSource` instances of type T, a List of type T containing the concatenation
     * of all nested sources.
     * @example
     * List.of([1, 2], [3, 4]).flatten()   // => List(1, 2, 3, 4)
     */
    /**
     * Returns a non-empty List that contains this List the given `amount` of times.
     * @param amount - the amount of times to repeat the values in this List
     * @note if the given amount <= 1, the List itself is returned
     * @example
     * List.of(0, 1, 2).repeat(2)   // -> List(0, 1, 2, 0, 1, 2)
     * List.of(0, 1, 2).repeat(0)   // -> List(0, 1, 2)
     * @note O(logB(N)) for block size B
     */
    repeat(amount: number): List.NonEmpty<T>;
    /**
     * Returns the non-empty List where the first given `shiftAmount` of values are removed from this List, and are appended at the end.
     * @param shiftAmount - the amount of values to rotate
     * @note if the `shiftAmount` is negative, the last `shiftAmount` values will be removed from the List and will be prepended.
     * @example
     * List.of(0, 1, 2, 3).rotate(2)   // -> List(2, 3, 0, 1)
     * List.of(0, 1, 2, 3).rotate(-1)  // -> List(1, 2, 3, 0)
     * @note O(logB(N)) for block size B
     */
    rotate(shiftAmount: number): List.NonEmpty<T>;
    /**
     * Returns the non-empty List where, if given `length` is larger than the List length, the given `fill` value is added to the start and/or end
     * of the List according to the `positionPercentage` such that the result length is equal to `length`.
     * @param length - the target length of the resulting list
     * @param fill - the element used to fill up empty space in the resulting List
     * @param positionPercentage - (optional) a percentage indicating how much of the filling elements should be on the left
     * side of the current List
     * @example
     * List.of(0, 1).padTo(4, 10)       // -> List(0, 1, 10, 10)
     * List.of(0, 1).padTo(4, 10, 50)   // -> List(10, 0, 1, 10)
     * List.of(0, 1).padTo(4, 10, 100)  // -> List(0, 1, 10, 10)
     * List.of(0, 1, 2).padTo(2, 10)    // -> List(0, 1, 2)
     * @note O(logB(N)) for block size B
     */
    padTo(
      length: number,
      fill: T,
      positionPercentage?: number
    ): List.NonEmpty<T>;
    /**
     * Returns the non-empty List where at the given `index` the value is replaced or updated by the given `update`.
     * @param index - the index at which to update the value
     * @param update - a new value or function taking the current value and returning a new value
     * @note a negative `index` will be treated as follows:
     * * -1: the last element in the list
     * * -2: the second-last element in the list
     * * ...etc
     * @example
     * List.of(0, 1, 2).updateAt(1, 10)            // -> List(0, 10, 2)
     * List.of(0, 1, 2).updateAt(1, v => v + 1)    // -> List(0, 2, 2)
     * List.of(0, 1, 2).updateAt(-1, 10)           // -> List(0, 1, 10)
     * @note O(logB(N)) for block size B
     */
    updateAt(index: number, update: Update<T>): List.NonEmpty<T>;
    /**
     * Returns the non-empty List with the given `values` inserted at the given `index`.
     * @param index - the index at which to insert the values
     * @param values - a `StreamSource` of values to insert
     * @note a negative `index` will be treated as follows:
     * * -1: the last element in the list
     * * -2: the second-last element in the list
     * * ...etc
     * @example
     * List.of(0, 1, 2, 3).insert(2, [10, 11])   // -> List(0, 1, 10, 11, 2, 3)
     * List.of(0, 1, 2, 3).insert(-1, [10, 11])  // -> List(0, 1, 2, 1, 11, 3)
     * @note O(logB(N)) for block size B
     */
    insert(index: number, values: StreamSource<T>): List.NonEmpty<T>;
    /**
     * Returns a non-empty List containing the result of applying given `mapFun` to each value in this List.
     * If `reversed` is true, the order of the values is reversed.
     * @param mapFun - a function receiving a value and its index, and returning a new value
     * @param reversed - (default: false) if true, reverses the order of the values
     */
    map<T2>(
      mapFun: (value: T, index: number) => T2,
      reversed?: boolean
    ): List.NonEmpty<T2>;
    /**
     * Returns a List containing the joined results of applying given `flatMapFun` to each value in this List.
     * @param flatMapFun - a function taking the next value and its index, and returning a `StreamSource`
     * of value to include in the resulting collection
     * @param range - (optional) the range of the list to include in the filtering process
     * @param reversed - (default: false) if true reverses the elements within the given range
     */
    flatMap<T2>(
      flatMapFun: (value: T, index: number) => StreamSource.NonEmpty<T2>,
      range?: undefined,
      reversed?: boolean
    ): List.NonEmpty<T2>;
    flatMap<T2>(
      flatMapFun: (value: T, index: number) => StreamSource<T2>,
      range?: IndexRange,
      reversed?: boolean
    ): List<T2>;
    /**
     * Returns the List, where at the given `index` the `remove` amount of values are replaced by the values
     * from the optionally given `insert` `StreamSource`.
     * @param options - object containing the following
     * * index: the index at which to replace values
     * * remove: (default: 0) the amount of values to remove
     * * insert: (default: []) a `StreamSource` of values to insert
     * @note a negative `index` will be treated as follows:
     * * -1: the last element in the list
     * * -2: the second-last element in the list
     * * ...etc
     * @example
     * List.of(0, 1, 2, 3).splice({ index: 2, remove: 1 })                    // -> List(0, 1, 3)
     * List.of(0, 1, 2, 3).splice({ index: 1, remove: 2, insert: [10, 11] })  // -> List(0, 10, 11, 3)
     * @note O(logB(N)) for block size B
     */
    splice(options: {
      index: number;
      remove?: number;
      insert: StreamSource.NonEmpty<T>;
    }): List.NonEmpty<T>;
    splice(options: {
      index: number;
      remove?: number;
      insert?: StreamSource<T>;
    }): List<T>;
    /**
     * Returns the non-empty List in reversed order.
     * @example
     * List.of(0, 1, 2).reversed()  // -> List(2, 1, 0)
     * @note O(logB(n)) for block size B
     */
    reversed(): List.NonEmpty<T>;
    /**
     * Returns an array containing the values within given `range` (default: all) in this collection.
     * If `reversed` is true, reverses the order of the values.
     * @param range - (optional) the range of the list to include in the filtering process
     * @param reversed - (default: false) if true reverses the elements within the given range
     * @example
     * List.of(0, 1, 2, 3).toArray()                      // => [0, 1, 2, 3]
     * List.of(0, 1, 2, 3).toArray({ amount: 2 })         // => [0, 1]
     * List.of(0, 1, 2, 3).toArray({ amount: 2 }, true)   // => [1, 0]
     * @note O(logB(N)) for block size B
     * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
     */
    toArray(range?: undefined, reversed?: boolean): ArrayNonEmpty<T>;
    toArray(range?: IndexRange, reversed?: boolean): T[];
    /**
     * Returns the same `List` with a wider value type T2, if T2
     * is a super type of T.
     * @typeparam T2 - a super type of T
     * @example
     * const m = List.of(1, 2, 3)
     * m.extendType<number | string>()
     * // type: List.NonEmpty<number | string>
     */
    extendType<T2>(): List.NonEmpty<SuperOf<T2, T>>;
    /**
     * Returns an array of Lists, where each list contains the values of the corresponding index of tuple T.
     * @param length - the length of the tuples in type T
     * @example
     * const m = List.of([1, 'a'], [2, 'b'])
     * m.unzip(2)  // => [List.NonEmpty<number>, List.NonEmpty<string>]
     */
    unzip<L extends number, T2 extends T = T>(
      length: L
    ): T2 extends readonly [unknown, ...unknown[]] & { length: L }
      ? { [K in keyof T2]: List.NonEmpty<T2[K]> }
      : never;
    flatten<T2 extends T = T>(): T2 extends StreamSource.NonEmpty<infer S>
      ? List.NonEmpty<S>
      : T2 extends StreamSource<infer S>
      ? List<S>
      : never;
  }

  export interface Builder<T> {
    /**
     * Returns the amount of values in the builder.
     * @example
     * List.of(1, 2, 3).toBuilder().size
     * // => 3
     */
    readonly length: number;
    /**
     * Returns true if there are no values in the builder.
     * @example
     * List.of(1, 2, 3).toBuilder().isEmpty
     * // => false
     */
    readonly isEmpty: boolean;
    /**
     * Returns the value in the List builder at the given `index`.
     * @param index - the element index
     * @param otherwise - (default: undefined) an `OptLazy` value to return if the index is out of bounds
     * @note a negative `index` will be treated as follows:
     * * -1: the last value in the list
     * * -2: the second-last value in the list
     * * ...etc
     * @example
     * const m = List.of(0, 1, 2).toBuilder()
     * m.get(5)             // => undefined
     * m.get(5, 'other')    // => 'other'
     * m.get(1, 'other')    // => 1
     * m.get(-1)            // => 2
     * @note O(logB(N)) for block size B
     */
    get(index: number): T | undefined;
    get<O>(index: number, otherwise: OptLazy<O>): T | O;
    /**
     * Updates the element at the given `index` with the given `update` value or function.
     * @param index - the index of the element to update
     * @param update - the new value or function taking the current value and returning a new value
     * @param otherwise - (default: undefined) the `OptLazy` value to return if there is no element at given index
     * @returns the old value at the given index, or the `otherwise` value if the index is out of bounds
     * @note a negative `index` will be treated as follows:
     * * -1: the last element in the list
     * * -2: the second-last element in the list
     * * ...etc
     * @example
     * const m = List.of(1, 2, 3).toBuilder()
     * m.updateAt(0, 10)       // => 1
     * m.updateAt(1, 10, 'a')  // => 2
     * m.updateAt(10, 0)       // => undefined
     * m.updateAt(10, 0, 'a')  // => 'a'
     * @note O(logB(N)) for block size B
     */
    updateAt(index: number, update: Update<T>): T | undefined;
    updateAt<O>(index: number, update: Update<T>, otherwise: OptLazy<O>): T | O;
    /**
     * Sets the element at the given `index` to the given `value`.
     * @param index - the index of the element to set.
     * @param value - the new value to set.
     * @param otherwise - (default: undefined) the `OptLazy` value to return if there is no element at given index
     * @returns the old value at the given index, or the `otherwise` value if the index is out of bounds
     * @note a negative `index` will be treated as follows:
     * * -1: the last element in the list
     * * -2: the second-last element in the list
     * * ...etc
     * @example
     * const m = List.of(1, 2, 3).toBuilder()
     * m.set(0, 10)       // => 1
     * m.set(1, 10, 'a')  // => 2
     * m.set(10, 0)       // => undefined
     * m.set(10, 0, 'a')  // => 'a'
     * @note O(logB(N)) for block size B
     */
    set(index: number, value: T): T | undefined;
    set<O>(index: number, value: T, otherwise: OptLazy<O>): T | O;
    /**
     * Adds the given `value` to the start of the builder values.
     * @param value - the value to prepend
     * @example
     * const m = List.of(1, 2, 3).toBuilder()
     * m.prepend(10)
     * m.build().toArray()
     * // => [10, 1, 2, 3]
     * @note O(logB(N)) for block size B - mosly o(1)
     */
    prepend(value: T): void;
    /**
     * Adds the given `value` to the end of the builder values.
     * @param value - the value to append
     * @example
     * const m = List.of(1, 2, 3).toBuilder()
     * m.append(10)
     * m.build().toArray()
     * // => [1, 2, 3, 10]
     * @note O(logB(N)) for block size B - mosly o(1)
     */
    append(value: T): void;
    /**
     * Adds all given `values` at the end of the builder values
     * @param values - a `StreamSource` containing values to add
     * @example
     * const m = List.of(1, 2, 3).toBuilder()
     * m.appendAll([10, 11])
     * m.build().toArray()
     * // => [1, 2, 3, 10, 11]
     */
    appendAll(values: StreamSource<T>): void;
    /**
     * Inserts the given `value` at the given `index` in the builder.
     * @param index - the index at which to insert the value
     * @param value - the value to insert
     * @note a negative `index` will be treated as follows:
     * * -1: the last value in the list
     * * -2: the second-last value in the list
     * * ...etc
     * @example
     * const m = List.of(1, 2, 3).toBuilder()
     * m.insert(1, 10)
     * m.build().toArray()
     * // => [1, 10, 2, 3]
     */
    insert(index: number, value: T): void;
    /**
     * Removes the value at the given `index` in the builder.
     * @param index - the index at which to remove a value
     * @param otherwise - (default: undefined) the value to return if the index is out of bounds
     * @returns the removed value, or the `otherwise` value if the index is out of bounds
     * @example
     * const m = List.of(1, 2, 3).toBuilder()
     * m.remove(10)       // => undefined
     * m.remove(10, 'a')  // => 'a'
     * m.remove(1)        // => 2
     * m.remove(0, 'a')   // => 1
     */
    remove(index: number): T | undefined;
    remove<O>(index: number, otherwise: OptLazy<O>): T | O;
    /**
     * Performs given function `f` for each value of the List builder.
     * @param f - the function to perform for each element, receiving:
     * * `value`: the next value
     * * `index`: the index of the value
     * * `halt`: a function that, if called, ensures that no new elements are passed
     * @throws RibuError.ModifiedBuilderWhileLoopingOverItError if the builder is modified while
     * looping over it
     * @example
     * List.of(0, 1, 2, 3).toBuilder().forEach((value, i, halt) => {
     *  console.log(value * 2);
     *  if (i >= 1) halt();
     * })
     * // => logs 0  2
     * @note O(N)
     */
    forEach(
      f: (value: T, index: number, halt: () => void) => void,
      state?: TraverseState
    ): void;
    /**
     * Returns an immutable instance containing the values in this builder.
     * @example
     * const m = List.of(1, 2, 3).toBuilder()
     * const m2: List<number> = m.build()
     * m.toArray()
     * // => [1, 2, 3]
     */
    build(): List<T>;
    /**
     * Returns an immutable instance containing the result of applying given `mapFun` to each value in the builder.
     * @example
     * const m = List.of(1, 2, 3).toBuilder()
     * const m2: List<number> = m.buildMap(v => String(v))
     * m.toArray()
     * // => ['1', '2', '3']
     */
    buildMap<T2 = T>(mapFun: (value: T) => T2): List<T2>;
  }

  /**
   * A context instance for `List` that acts as a factory for every instance of this
   * type of collection.
   */
  export interface Context {
    readonly _types: List.Types;

    readonly typeTag: 'List';

    /**
     * Returns the (singleton) empty List for this context with given value type.
     * @example
     * List.empty<number>()    // => List<number>
     * List.empty<string>()    // => List<string>
     */
    empty<T>(): List<T>;
    /**
     * Returns an immutable set of this type and context, containing the given `values`.
     * @param values - a non-empty array of values
     * @example
     * List.of(1, 2, 3).toArray()   // => [1, 2, 3]
     */
    of<T>(...values: ArrayNonEmpty<T>): List.NonEmpty<T>;
    /**
     * Returns an immutable set of this collection type and context, containing the given values in `source`.
     * @param source - a `StreamSource` of values
     * @example
     * List.from([1, 2, 3], [4, 5]).toArray()
     * // => [1, 2, 3, 4, 5]
     */
    from<T>(
      ...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
    ): List.NonEmpty<T>;
    from<T>(...sources: ArrayNonEmpty<StreamSource<T>>): List<T>;
    /**
     * Returns a List of characters from the given strings in `sources`.
     * @param sources - a non-empty array containing strings
     * @example
     * List.fromString('abc').toArray()   // => ['a', 'b', 'c']
     */
    fromString<S extends string>(
      ...sources: ArrayNonEmpty<StringNonEmpty<S>>
    ): List.NonEmpty<string>;
    fromString(...sources: ArrayNonEmpty<string>): List<string>;
    /**
     * Returns an empty List Builder based on this context.
     * @example
     * List.builder<number>()   // => List.Builder<number>
     */
    builder<T>(): List.Builder<T>;
    /**
     * Returns a `Reducer` that appends received items to a List and returns the List as a result. When a `source` is given,
     * the reducer will first create a List from the source, and then append elements to it.
     * @param source - (optional) an initial source of elements to append to
     * @example
     * const someList = List.of(1, 2, 3);
     * const result = Stream.range({ start: 20, amount: 5 }).reduce(List.reducer(someList))
     * result.toArray()   // => [1, 2, 3, 20, 21, 22, 23, 24]
     * @note uses a List builder under the hood. If the given `source` is a List in the same context, it will directly call `.toBuilder()`.
     */
    reducer<T>(source?: StreamSource<T>): Reducer<T, List<T>>;
  }

  export interface Types extends CustomBase.Elem {
    normal: List<this['_T']>;
    nonEmpty: List.NonEmpty<this['_T']>;
    limitElem: false;
  }
}

function createContext(options?: { blockSizeBits?: number }): List.Context {
  return new ListContext(options?.blockSizeBits ?? 5);
}

const _defaultContext: List.Context = createContext();

const _contextHelpers = {
  /**
   * Returns a new `List.Context` instance using the provided options.
   * @param options - (optional) an object containing the following properties:
   * * blockSizeBits - (default: 5) the power of 2 to to `blockSizeBits` to use as block size for all `List` instances that are created from the context.
   */
  createContext,
  /**
   * Returns the default `List.Context` instance.
   */
  defaultContext(): List.Context {
    return _defaultContext;
  },
};

type Export = OmitStrong<List.Context, '_types'> & typeof _contextHelpers;

export const List: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
