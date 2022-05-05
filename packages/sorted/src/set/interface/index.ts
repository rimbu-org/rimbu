import type { RSet } from '@rimbu/collection-types/set';
import type { RSetBase } from '@rimbu/collection-types/set-custom';
import type { IndexRange, OptLazy, Range } from '@rimbu/common';
import type { Stream, Streamable } from '@rimbu/stream';

import type { SortedSetCreators } from '@rimbu/sorted/set-custom';

import { createSortedSetContext } from '@rimbu/sorted/set-custom';

/**
 * A type-invariant immutable Set of value type T.
 * In the Set, there are no duplicate values.
 * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [SortedSet API documentation](https://rimbu.org/api/rimbu/ordered/set/SortedSet/interface)
 * @typeparam T - the value type
 * @note
 * - The `SortedSet` keeps the inserted values in sorted order according to the
 * context's `comp` `Comp` instance.
 * @example
 * ```ts
 * const s1 = SortedSet.empty<string>()
 * const s2 = SortedSet.of('a', 'b', 'c')
 * ```
 */
export interface SortedSet<T> extends RSetBase<T, SortedSet.Types> {
  stream(reversed?: boolean): Stream<T>;
  /**
   * Returns a Stream of sorted values of this collection within the given `keyRange`.
   * @param keyRange - the range of values to include in the stream
   * @example
   * ```ts
   * const m = SortedSet.of('b', 'd', 'a', 'c');
   * console.log(m.streamRange({ start: 'b', end: 'c' }).toArray())
   * // => ['b', 'c']
   * ```
   */
  streamRange(range: Range<T>, reversed?: boolean): Stream<T>;
  /**
   * Returns a Stream of sorted values of this collection within the given `range` index range.
   * @param range - the range of values to include in the stream
   * @example
   * ```ts
   * const m = SortedSet.of('b', 'd', 'a', 'c');
   * console.log(m.streamSliceIndex({ start: 1, amount: 2 }).toArray())
   * // => ['b', 'c']
   * ```
   */
  streamSliceIndex(range: IndexRange, reversed?: boolean): Stream<T>;
  /**
   * Returns the minimum value of the SortedSet, or a fallback value (default: undefined)
   * if the SortedSet is empty.
   * @param otherwise - (default: undefined) the fallback value to return if the SortedSet is empty.
   * @example
   * ```ts
   * const m = SortedSet.of('b', 'd', 'a', 'c').asNormal();
   * console.log(m.min())
   * // => 'a'
   * console.log(m.min('q'))
   * // => 'a'
   * console.log(SortedSet.empty().min())
   * // => undefined
   * console.log(SortedSet.empty().min('q'))
   * // => 'q'
   * ```
   */
  min(): T | undefined;
  min<O>(otherwise: OptLazy<O>): T | O;
  /**
   * Returns the maximum value of the SortedSet, or a fallback value (default: undefined)
   * if the SortedSet is empty.
   * @param otherwise - (default: undefined) the fallback value to return if the SortedSet is empty.
   * @example
   * ```ts
   * const m = SortedSet.of('b', 'd', 'a', 'c').asNormal();
   * console.log(m.max())
   * // => 'a'
   * console.log(m.max('q'))
   * // => 'a'
   * console.log(SortedSet.empty().max())
   * // => undefined
   * console.log(SortedSet.empty().max('q'))
   * // => 'q'
   * ```
   */
  max(): T | undefined;
  max<O>(otherwise: OptLazy<O>): T | O;
  /**
   * Returns the value at the given index of the value sort order of the SortedSet, or a fallback value (default: undefined)
   * if the index is out of bounds.
   * @param index - the index in the key sort order
   * @param otherwise - (default: undefined) the fallback value to return if the range is out of bounds.
   *
   * @note negative index values will retrieve the values from the end of the sort order, e.g. -1 is the last value
   * @example
   * ```ts
   * const m = SortedSet.of('b', 'd', 'a', 'c').asNormal();
   * console.log(m.getAtIndex(1))
   * // => 'b'
   * console.log(m.getAtIndex(-1))
   * // => 'd'
   * console.log(m.getAtIndex(10))
   * // => undefined
   * console.log(m.getAtIndex(10, 'q'))
   * // => 'q'
   * ```
   */
  getAtIndex(index: number): T | undefined;
  getAtIndex<O>(index: number, otherwise: OptLazy<O>): T | O;
  /**
   * Returns a SortedSet containing the the first `amount` of value of this SortedSet.
   * @param amount - the amount of elements to keep
   *
   * @note a negative `amount` takes the last values instead of the first, e.g. -2 is the last 2 elements
   * @example
   * ```ts
   * const m = SortedSet.of('b', 'd', 'a', 'c').asNormal();
   * console.log(m.take(2).toArray())
   * // => ['a', 'b']
   * console.log(m.take(-2).toArray())
   * // => ['c', 'd']
   * ```
   */
  take(amount: number): SortedSet<T>;
  /**
   * Returns a SortedSet containing all but the the first `amount` of value of this SortedSet.
   * @param amount - the amount of elements to keep
   *
   * @note a negative `amount` drops the last values instead of the first, e.g. -2 is the last 2 elements
   * @example
   * ```ts
   * const m = SortedSet.of('b', 'd', 'a', 'c').asNormal();
   * console.log(m.drop(2).toArray())
   * // => ['c', 'd']
   * console.log(m.drop(-2).toArray())
   * // => ['a', 'b']
   * ```
   */
  drop(amount: number): SortedSet<T>;
  /**
   * Returns a SortedSet containing only those values that are within the given `range` index range of the value
   * sort order.
   * @param range - an `IndexRange` defining the sort order indices to include.
   * @example
   * ```ts
   * const m = SortedSet.of('b', 'd', 'a', 'c').asNormal();
   * console.log(m.sliceIndex({ start: 1, amount: 2 }).toArray())
   * // => ['b', 'c']
   * ```
   */
  sliceIndex(range: IndexRange): SortedSet<T>;
  /**
   * Returns a SortedSet containing only those values that are within the given `keyRange`.
   * @param range - a `Range` defining the values to include
   * @example
   * ```ts
   * const m = SortedSet.of('b', 'd', 'a', 'c').asNormal();
   * console.log(m.slice({ start: 'b', end: 'c' }).toArray())
   * // => ['b', 'c']
   * ```
   */
  slice(range: Range<T>): SortedSet<T>;
}

export namespace SortedSet {
  /**
   * A non-empty type-invariant immutable Set of value type T.
   * In the Set, there are no duplicate values.
   * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [SortedSet API documentation](https://rimbu.org/api/rimbu/ordered/set/SortedSet/interface)
   * @typeparam T - the value type
   * @note
   * - The `SortedSet` keeps the inserted values in sorted order according to the
   * context's `comp` `Comp` instance.
   * @example
   * ```ts
   * const s1 = SortedSet.empty<string>()
   * const s2 = SortedSet.of('a', 'b', 'c')
   * ```
   */
  export interface NonEmpty<T>
    extends RSetBase.NonEmpty<T, SortedSet.Types>,
      Omit<SortedSet<T>, keyof RSetBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<T> {
    stream(reversed?: boolean): Stream.NonEmpty<T>;
    /**
     * Returns the minimum value of the SortedSet.
     * @example
     * ```ts
     * const m = SortedSet.of('b', 'd', 'a', 'c');
     * console.log(m.min())
     * // => 'a'
     * ```
     */
    min(): T;
    /**
     * Returns the maximum value of the SortedSet.
     * @example
     * ```ts
     * const m = SortedSet.of('b', 'd', 'a', 'c');
     * console.log(m.max())
     * // => 'd'
     * ```
     */
    max(): T;
    take<N extends number>(
      amount: N
    ): 0 extends N ? SortedSet<T> : SortedSet.NonEmpty<T>;
  }

  /**
   * A context instance for a `SortedSet` that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UK - the upper key type bound for which the context can be used
   */
  export interface Context<UT> extends RSetBase.Context<UT, SortedSet.Types> {
    readonly typeTag: 'SortedSet';
  }

  /**
   * A mutable `SortedSet` builder used to efficiently create new immutable instances.
   * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [SortedSet.Builder API documentation](https://rimbu.org/api/rimbu/ordered/set/SortedSet/Builder/interface)
   * @typeparam T - the value type
   */
  export interface Builder<T> extends RSetBase.Builder<T, SortedSet.Types> {
    /**
     * Returns the minimum value of the SortedSet builder, or a fallback value (default: undefined)
     * if the builder is empty.
     * @param otherwise - (default: undefined) the fallback value to return if the SortedSet is empty.
     * @example
     * ```ts
     * const b = SortedSet.of('b', 'd', 'a', 'c').toBuilder();
     * console.log(b.min())
     * // => 'a'
     * console.log(b.min('q'))
     * // => 'a'
     * console.log(SortedSet.empty().min())
     * // => undefined
     * console.log(SortedSet.empty().min('q'))
     * // => 'q'
     * ```
     */
    min(): T | undefined;
    min<O>(otherwise: OptLazy<O>): T | O;
    /**
     * Returns the maximum value of the SortedSet builder, or a fallback value (default: undefined)
     * if the builder is empty.
     * @param otherwise - (default: undefined) the fallback value to return if the SortedSet is empty.
     * @example
     * ```ts
     * const b = SortedSet.of('b', 'd', 'a', 'c').toBuilder();
     * console.log(b.max())
     * // => 'd'
     * console.log(b.max('q'))
     * // => 'd'
     * console.log(SortedSet.empty().max())
     * // => undefined
     * console.log(SortedSet.empty().max('q'))
     * // => 'q'
     * ```
     */
    max(): T | undefined;
    max<O>(otherwise: OptLazy<O>): T | O;
    /**
     * Returns the value at the given index of the value sort order of the SortedSet builder, or a fallback value (default: undefined)
     * if the index is out of bounds.
     * @param index - the index in the key sort order
     * @param otherwise - (default: undefined) the fallback value to return if the range is out of bounds.
     *
     * @note negative index values will retrieve the values from the end of the sort order, e.g. -1 is the last value
     * @example
     * ```ts
     * const b = SortedSet.of('b', 'd', 'a', 'c').toBuilder();
     * console.log(b.getAtIndex(1))
     * // => 'b'
     * console.log(b.getAtIndex(-1))
     * // => 'd'
     * console.log(b.getAtIndex(10))
     * // => undefined
     * console.log(b.getAtIndex(10, 'q'))
     * // => 'q'
     * ```
     */
    getAtIndex(index: number): T | undefined;
    getAtIndex<O>(index: number, otherwise: OptLazy<O>): T | O;
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends RSet.Types {
    readonly normal: SortedSet<this['_T']>;
    readonly nonEmpty: SortedSet.NonEmpty<this['_T']>;
    readonly context: SortedSet.Context<this['_T']>;
    readonly builder: SortedSet.Builder<this['_T']>;
  }
}

const _defaultContext: SortedSet.Context<any> = createSortedSetContext();

export const SortedSet: SortedSetCreators = {
  ..._defaultContext,
  createContext: createSortedSetContext,
  defaultContext<UT>(): SortedSet.Context<UT> {
    return _defaultContext;
  },
};
