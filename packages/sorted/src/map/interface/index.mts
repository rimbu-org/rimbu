import type { RMapBase } from '@rimbu/collection-types/map-custom';
import type { Stream, Streamable } from '@rimbu/stream';
import type { Comp, IndexRange, OptLazy, Range } from '@rimbu/common';

import type { SortedMapCreators } from '@rimbu/sorted/map-custom';

import { createSortedMapContext } from '@rimbu/sorted/map-custom';

/**
 * A type-invariant immutable Map of key type K, and value type V.
 * In the Map, each key has exactly one value, and the Map cannot contain
 * duplicate keys.
 * See the [Map documentation](https://rimbu.org/docs/collections/map) and the [SortedMap API documentation](https://rimbu.org/api/rimbu/sorted/map/SortedMap/interface)
 * @note
 * - The `SortedMap` keeps the inserted keys in sorted order according to the
 * context's `comp` `Comp` instance.
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @example
 * ```ts
 * const m1 = SortedMap.empty<number, string>()
 * const m2 = SortedMap.of([1, 'a'], [2, 'b'])
 * ```
 */
export interface SortedMap<K, V> extends RMapBase<K, V, SortedMap.Types> {
  stream(reversed?: boolean): Stream<readonly [K, V]>;
  streamKeys(reversed?: boolean): Stream<K>;
  streamValues(reversed?: boolean): Stream<V>;
  /**
   * Returns a Stream of sorted entries of this collection within the given `keyRange`.
   * @param keyRange - the range of keys to include in the stream
   * @example
   * ```ts
   * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]);
   * console.log(m.streamRange({ start: 'b', end: 'c' }).toArray())
   * // => ['b', 'c']
   * ```
   */
  streamRange(keyRange: Range<K>, reversed?: boolean): Stream<readonly [K, V]>;
  /**
   * Returns a Stream of sorted entries of this collection within the given `range` index range.
   * @param range - the range of keys to include in the stream
   * @example
   * ```ts
   * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]);
   * console.log(m.streamSliceIndex({ start: 1, amount: 2 }).toArray())
   * // => [['b', 2], ['c', 3]]
   * ```
   */
  streamSliceIndex(
    range: IndexRange,
    reversed?: boolean
  ): Stream<readonly [K, V]>;
  /**
   * Returns the entry with the minimum key of the SortedMap, or a fallback value (default: undefined)
   * if the SortedMap is empty.
   * @param otherwise - (default: undefined) the fallback value to return if the SortedMap is empty.
   * @example
   * ```ts
   * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
   * console.log(m.min())
   * // => ['a', 1]
   * console.log(m.min('q'))
   * // => ['a', 1]
   * console.log(SortedMap.empty().min())
   * // => undefined
   * console.log(SortedMap.empty().min('q'))
   * // => 'q'
   * ```
   */
  min(): readonly [K, V] | undefined;
  min<O>(otherwise: OptLazy<O>): readonly [K, V] | O;
  /**
   * Returns the minimum key of the SortedMap, or a fallback value (default: undefined)
   * if the SortedMap is empty.
   * @param otherwise - (default: undefined) the fallback value to return if the SortedMap is empty.
   * @example
   * ```ts
   * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
   * console.log(m.minKey())
   * // => 'a'
   * console.log(m.minKey('q'))
   * // => 'a'
   * console.log(SortedMap.empty().minKey())
   * // => undefined
   * console.log(SortedMap.empty().minKey('q'))
   * // => 'q'
   * ```
   */
  minKey(): K | undefined;
  minKey<O>(otherwise: OptLazy<O>): K | O;
  /**
   * Returns the value associated with the minimum key of the SortedMap, or a fallback value (default: undefined)
   * if the SortedMap is empty.
   * @param otherwise - (default: undefined) the fallback value to return if the SortedMap is empty.
   * @example
   * ```ts
   * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
   * console.log(m.minValue())
   * // => 1
   * console.log(m.minValue('q'))
   * // => 1
   * console.log(SortedMap.empty().minValue())
   * // => undefined
   * console.log(SortedMap.empty().minValue('q'))
   * // => 'q'
   * ```
   */
  minValue(): V | undefined;
  minValue<O>(otherwise: OptLazy<O>): V | O;
  /**
   * Returns the entry with the maximum key of the SortedMap, or a fallback value (default: undefined)
   * if the SortedMap is empty.
   * @param otherwise - (default: undefined) the fallback value to return if the SortedMap is empty.
   * @example
   * ```ts
   * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
   * console.log(m.max())
   * // => ['d', 4]
   * console.log(m.max('q'))
   * // => ['d', 4]
   * console.log(SortedMap.empty().max())
   * // => undefined
   * console.log(SortedMap.empty().max('q'))
   * // => 'q'
   * ```
   */
  max(): readonly [K, V] | undefined;
  max<O>(otherwise: OptLazy<O>): readonly [K, V] | O;
  /**
   * Returns the maximum key of the SortedMap, or a fallback value (default: undefined)
   * if the SortedMap is empty.
   * @param otherwise - (default: undefined) the fallback value to return if the SortedMap is empty.
   * @example
   * ```ts
   * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
   * console.log(m.maxKey())
   * // => 'a'
   * console.log(m.maxKey('q'))
   * // => 'a'
   * console.log(SortedMap.empty().maxKey())
   * // => undefined
   * console.log(SortedMap.empty().maxKey('q'))
   * // => 'q'
   * ```
   */
  maxKey(): K | undefined;
  maxKey<O>(otherwise: OptLazy<O>): K | O;
  /**
   * Returns the value associated with the maximum key of the SortedMap, or a fallback value (default: undefined)
   * if the SortedMap is empty.
   * @param otherwise - (default: undefined) the fallback value to return if the SortedMap is empty.
   * @example
   * ```ts
   * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
   * console.log(m.maxValue())
   * // => 4
   * console.log(m.maxValue('q'))
   * // => 4
   * console.log(SortedMap.empty().maxValue())
   * // => undefined
   * console.log(SortedMap.empty().maxValue('q'))
   * // => 'q'
   * ```
   */
  maxValue(): V | undefined;
  maxValue<O>(otherwise: OptLazy<O>): V | O;
  /**
   * Returns the entry with its key at the given index of the key sort order of the SortedMap, or a fallback value (default: undefined)
   * if the index is out of bounds.
   * @param index - the index in the key sort order
   * @param otherwise - (default: undefined) the fallback value to return if the range is out of bounds.
   *
   * @note negative index values will retrieve the values from the end of the sort order, e.g. -1 is the last value
   * @example
   * ```ts
   * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
   * console.log(m.getAtIndex(1))
   * // => ['b', 2]
   * console.log(m.getAtIndex(-1))
   * // => ['d', 4]
   * console.log(m.getAtIndex(10))
   * // => undefined
   * console.log(m.getAtIndex(10, 'q'))
   * // => 'q'
   * ```
   */
  getAtIndex(index: number): readonly [K, V] | undefined;
  getAtIndex<O>(index: number, otherwise: OptLazy<O>): readonly [K, V] | O;
  /**
   * Returns the key at the given index of the key sort order of the SortedMap, or a fallback value (default: undefined)
   * if the index is out of bounds.
   * @param index - the index in the key sort order
   * @param otherwise - (default: undefined) the fallback value to return if the range is out of bounds.
   *
   * @note negative index values will retrieve the values from the end of the sort order, e.g. -1 is the last value
   * @example
   * ```ts
   * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
   * console.log(m.getKeyAtIndex(1))
   * // => 'b'
   * console.log(m.getKeyAtIndex(-1))
   * // => 'd'
   * console.log(m.getKeyAtIndex(10))
   * // => undefined
   * console.log(m.getKeyAtIndex(10, 'q'))
   * // => 'q'
   * ```
   */
  getKeyAtIndex(index: number): K | undefined;
  getKeyAtIndex<O>(index: number, otherwise: OptLazy<O>): K | O;
  /**
   * Returns the value associated with the key at the given index of the key sort order of the SortedMap, or a fallback value (default: undefined)
   * if the index is out of bounds.
   * @param index - the index in the key sort order
   * @param otherwise - (default: undefined) the fallback value to return if the range is out of bounds.
   *
   * @note negative index values will retrieve the values from the end of the sort order, e.g. -1 is the last value
   * @example
   * ```ts
   * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
   * console.log(m.getValueAtIndex(1))
   * // => 2
   * console.log(m.getValueAtIndex(-1))
   * // => 4
   * console.log(m.getValueAtIndex(10))
   * // => undefined
   * console.log(m.getValueAtIndex(10, 'q'))
   * // => 'q'
   * ```
   */
  getValueAtIndex(index: number): V | undefined;
  getValueAtIndex<O>(index: number, otherwise: OptLazy<O>): V | O;
  /**
   * Returns a SortedMap containing the the first `amount` of elements of this SortedMap.
   * @param amount - the amount of elements to keep
   *
   * @note a negative `amount` takes the last elements instead of the first, e.g. -2 is the last 2 elements
   * @example
   * ```ts
   * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
   * console.log(m.take(2).toArray())
   * // => [['a', 1], ['b', 2]]
   * console.log(m.take(-2).toArray())
   * // => [['c', ], ['d', 4]]
   * ```
   */
  take(amount: number): SortedMap<K, V>;
  /**
   * Returns a SortedMap containing all but the the first `amount` of elements of this SortedMap.
   * @param amount - the amount of elements to drop
   *
   * @note a negative `amount` drops the last elements instead of the first, e.g. -2 is the last 2 elements
   * @example
   * ```ts
   * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
   * console.log(m.drop(2).toArray())
   * // => [['c', ], ['d', 4]]
   * console.log(m.drop(-2).toArray())
   * // => [['a', 1], ['b', 2]]
   * ```
   */
  drop(amount: number): SortedMap<K, V>;
  /**
   * Returns a SortedMap containing only those entries that are within the given `range` index range of they key
   * sort order.
   * @param range - an `IndexRange` defining the sort order indices to include.
   * @example
   * ```ts
   * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
   * console.log(m.sliceIndex({ start: 1, amount: 2 }).toArray())
   * // => [['b', 2], ['c', 3]]
   * ```
   */
  sliceIndex(range: IndexRange): SortedMap<K, V>;
  /**
   * Returns a SortedMap containing only those entries whose keys are within the given `keyRange`.
   * @param keyRange - a `Range` defining the keys to include
   * @example
   * ```ts
   * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
   * console.log(m.slice({ start: 'b', end: 'c' }).toArray())
   * // => [['b', 2], ['c', 3]]
   * ```
   */
  slice(keyRange: Range<K>): SortedMap<K, V>;
}

export namespace SortedMap {
  /**
   * A non-empty type-invariant immutable Map of key type K, and value type V.
   * In the Map, each key has exactly one value, and the Map cannot contain
   * duplicate keys.
   * See the [Map documentation](https://rimbu.org/docs/collections/map) and the [SortedMap API documentation](https://rimbu.org/api/rimbu/sorted/map/SortedMap/interface)
   * @note
   * - The `SortedMap` keeps the inserted keys in sorted order according to the
   * context's `comp` instance.
   * @typeparam K - the key type
   * @typeparam V - the value type
   * @example
   * ```ts
   * const m1 = SortedMap.empty<number, string>()
   * const m2 = SortedMap.of([1, 'a'], [2, 'b'])
   * ```
   */
  export interface NonEmpty<K, V>
    extends RMapBase.NonEmpty<K, V, SortedMap.Types>,
      Omit<SortedMap<K, V>, keyof RMapBase.NonEmpty<any, any, any>>,
      Streamable.NonEmpty<readonly [K, V]> {
    stream(reversed?: boolean): Stream.NonEmpty<readonly [K, V]>;
    streamKeys(reversed?: boolean): Stream.NonEmpty<K>;
    streamValues(reversed?: boolean): Stream.NonEmpty<V>;
    /**
     * Returns the entry with the minimum key of the SortedMap.
     * @example
     * ```ts
     * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]);
     * console.log(m.min())
     * // => ['a', 1]
     * ```
     */
    min(): readonly [K, V];
    /**
     * Returns the minimum key of the SortedMap.
     * @example
     * ```ts
     * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]);
     * console.log(m.minKey())
     * // => 'a'
     * ```
     */
    minKey(): K;
    /**
     * Returns the value associated with the minimum key of the SortedMap.
     * @example
     * ```ts
     * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
     * console.log(m.minValue())
     * // => 1
     * ```
     */
    minValue(): V;
    /**
     * Returns the entry with the maximum key of the SortedMap.
     * @example
     * ```ts
     * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
     * console.log(m.max())
     * // => ['d', 4]
     * ```
     */
    max(): readonly [K, V];
    /**
     * Returns the maximum key of the SortedMap.
     * @example
     * ```ts
     * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
     * console.log(m.maxKey())
     * // => 'a'
     * ```
     */
    maxKey(): K;
    /**
     * Returns the value associated with the maximum key of the SortedMap.
     * @example
     * ```ts
     * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
     * console.log(m.maxValue())
     * // => 4
     * ```
     */
    maxValue(): V;
    take<N extends number>(
      amount: N
    ): 0 extends N ? SortedMap<K, V> : SortedMap.NonEmpty<K, V>;
  }

  /**
   * A context instance for a HashMap that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UK - the upper key type bound for which the context can be used
   */
  export interface Context<UK> extends RMapBase.Context<UK, SortedMap.Types> {
    readonly typeTag: 'SortedMap';

    /**
     * A `Comp` instance used to sort the map keys.
     */
    readonly comp: Comp<UK>;
  }

  /**
   * A mutable `SortedMap` builder used to efficiently create new immutable instances.
   * See the [Map documentation](https://rimbu.org/docs/collections/map) and the [SortedMap.Builder API documentation](https://rimbu.org/api/rimbu/sorted/map/SortedMap/Builder/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends RMapBase.Builder<K, V, SortedMap.Types> {
    /**
     * Returns the entry with the minimum key of the SortedMap Builder, or a fallback value (default: undefined)
     * if the builder is empty.
     * @param otherwise - (default: undefined) the fallback value to return if the SortedMap is empty.
     * @example
     * ```ts
     * const b = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).toBuilder();
     * console.log(b.min())
     * // => ['a', 1]
     * console.log(b.min('q'))
     * // => ['a', 1]
     * console.log(SortedMap.builder().min())
     * // => undefined
     * console.log(SortedMap.builder().min('q'))
     * // => 'q'
     * ```
     */
    min(): readonly [K, V] | undefined;
    min<O>(otherwise: OptLazy<O>): readonly [K, V] | O;
    /**
     * Returns the entry with the maximum key of the SortedMap Builder, or a fallback value (default: undefined)
     * if the builder is empty.
     * @param otherwise - (default: undefined) the fallback value to return if the SortedMap is empty.
     * @example
     * ```ts
     * const b = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).toBuilder();
     * console.log(b.max())
     * // => ['a', 1]
     * console.log(b.max('q'))
     * // => ['a', 1]
     * console.log(SortedMap.builder().max())
     * // => undefined
     * console.log(SortedMap.builder().max('q'))
     * // => 'q'
     * ```
     */
    max(): readonly [K, V] | undefined;
    max<O>(otherwise: OptLazy<O>): readonly [K, V] | O;
    /**
     * Returns the entry with its key at the given index of the key sort order of the SortedMap builder, or a fallback value (default: undefined)
     * if the index is out of bounds.
     * @param index - the index in the key sort order
     * @param otherwise - (default: undefined) the fallback value to return if the range is out of bounds.
     *
     * @note negative index values will retrieve the values from the end of the sort order, e.g. -1 is the last value
     * @example
     * ```ts
     * const b = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).toBuilder();
     * console.log(b.getAtIndex(1))
     * // => ['b', 2]
     * console.log(b.getAtIndex(-1))
     * // => ['d', 4]
     * console.log(b.getAtIndex(10))
     * // => undefined
     * console.log(b.getAtIndex(10, 'q'))
     * // => 'q'
     * ```
     */
    getAtIndex(index: number): readonly [K, V] | undefined;
    getAtIndex<O>(index: number, otherwise: OptLazy<O>): readonly [K, V] | O;
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends RMapBase.Types {
    readonly normal: SortedMap<this['_K'], this['_V']>;
    readonly nonEmpty: SortedMap.NonEmpty<this['_K'], this['_V']>;
    readonly context: SortedMap.Context<this['_K']>;
    readonly builder: SortedMap.Builder<this['_K'], this['_V']>;
  }
}

const _defaultContext: SortedMap.Context<any> = createSortedMapContext();

export const SortedMap: SortedMapCreators = Object.freeze({
  ..._defaultContext,
  createContext: createSortedMapContext,
  defaultContext<UK>(): SortedMap.Context<UK> {
    return _defaultContext;
  },
});
