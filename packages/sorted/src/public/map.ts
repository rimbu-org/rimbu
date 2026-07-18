import type { RMapBase } from '@rimbu/collection-types/advanced/map/base';
import type { Comp } from '@rimbu/common/comp';
import type { IndexRange } from '@rimbu/common/index-range';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { Range } from '@rimbu/common/range';
import type { Stream, Streamable } from '@rimbu/stream';

import type { SortedMapCreators } from '#map/creators';

import { createSortedMapContextModule } from '#map/context-factory';

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
 * import { SortedMap } from '@rimbu/sorted';
 *
 * const m1 = SortedMap.empty<number, string>()
 * const m2 = SortedMap.of([1, 'a'], [2, 'b'])
 * ```
 */
export interface SortedMap<K, V> extends RMapBase<K, V, SortedMap.Types> {
	stream(options?: { reversed?: boolean }): Stream<readonly [K, V]>;
	streamKeys(options?: { reversed?: boolean }): Stream<K>;
	streamValues(options?: { reversed?: boolean }): Stream<V>;
	/**
	 * Returns a Stream of sorted entries of this collection within the given `keyRange`.
	 * @param keyRange - the range of keys to include in the stream
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - reversed: (default: false) when true reverses the stream element order
	 * @example
	 * ```ts
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]);
	 * console.log(m.streamRange({ start: 'b', end: 'c' }).toArray())
	 * // => [ [ "b", 2 ], [ "c", 3 ] ]
	 * ```
	 */
	streamRange(
		keyRange: Range<K>,
		options?: { reversed?: boolean },
	): Stream<readonly [K, V]>;
	/**
	 * Returns a Stream of sorted entries of this collection within the given `range` index range.
	 * @param range - the range of keys to include in the stream
	 * @example
	 * ```ts
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]);
	 * console.log(m.streamSliceIndex({ start: 1, amount: 2 }).toArray())
	 * // => [ [ "b", 2 ], [ "c", 3 ] ]
	 * ```
	 */
	streamSliceIndex(
		range: IndexRange,
		options?: { reversed?: boolean },
	): Stream<readonly [K, V]>;
	/**
	 * Returns the entry with the minimum key of the SortedMap, or a fallback value (default: undefined)
	 * if the SortedMap is empty.
	 * @param otherwise - (default: undefined) the fallback value to return if the SortedMap is empty.
	 * @example
	 * ```ts
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
	 * console.log(m.min())
	 * // => [ "a", 1 ]
	 * console.log(m.min('q'))
	 * // => [ "a", 1 ]
	 * console.log(SortedMap.empty().min())
	 * // => undefined
	 * console.log(SortedMap.empty().min('q'))
	 * // => q
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
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
	 * console.log(m.minKey())
	 * // => a
	 * console.log(m.minKey('q'))
	 * // => a
	 * console.log(SortedMap.empty().minKey())
	 * // => undefined
	 * console.log(SortedMap.empty().minKey('q'))
	 * // => q
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
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
	 * console.log(m.minValue())
	 * // => 1
	 * console.log(m.minValue('q'))
	 * // => 1
	 * console.log(SortedMap.empty().minValue())
	 * // => undefined
	 * console.log(SortedMap.empty().minValue('q'))
	 * // => q
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
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
	 * console.log(m.max())
	 * // => [ "d", 4 ]
	 * console.log(m.max('q'))
	 * // => [ "d", 4 ]
	 * console.log(SortedMap.empty().max())
	 * // => undefined
	 * console.log(SortedMap.empty().max('q'))
	 * // => q
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
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
	 * console.log(m.maxKey())
	 * // => d
	 * console.log(m.maxKey('q'))
	 * // => d
	 * console.log(SortedMap.empty().maxKey())
	 * // => undefined
	 * console.log(SortedMap.empty().maxKey('q'))
	 * // => q
	 * ```
	 */
	maxKey(): K | undefined;
	maxKey<O>(otherwise: OptLazy<O>): K | O;
	/**
	 * Returns the index of the given key in the SortedMap, or a fallback value (default: undefined)
	 * if the key is not present.
	 * @param key - the key to find the index for
	 * @param otherwise - (default: undefined) the fallback value to return if the key is not present.
	 * @example
	 * ```ts
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]);
	 * console.log(m.findIndex('c'))
	 * // => 2
	 * console.log(m.findIndex('q'))
	 * // => undefined
	 * console.log(m.findIndex('q', -1))
	 * // => -1
	 * ```
	 */
	findIndex(key: K): number | undefined;
	findIndex<O>(key: K, otherwise: OptLazy<O>): number | O;
	/**
	 * Returns the index of the first entry in the SortedMap whose key is greater than or equal to
	 * the given key, i.e. the index where the given key would be inserted to preserve sorted order.
	 * If the given key is greater than all keys in the SortedMap, the SortedMap's size is returned.
	 * @param key - the key to find the lower bound index for
	 * @example
	 * ```ts
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]);
	 * console.log(m.lowerBound('c'))
	 * // => 2
	 * console.log(m.lowerBound('q'))
	 * // => 4
	 * ```
	 */
	lowerBound(key: K): number;
	/**
	 * Returns the index of the first entry in the SortedMap whose key is strictly greater than
	 * the given key, i.e. the index just after the entries with the given key.
	 * If the given key is greater than or equal to all keys in the SortedMap, the SortedMap's size is returned.
	 * @param key - the key to find the upper bound index for
	 * @example
	 * ```ts
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]);
	 * console.log(m.upperBound('c'))
	 * // => 3
	 * console.log(m.upperBound('q'))
	 * // => 4
	 * ```
	 */
	upperBound(key: K): number;
	/**
	 * Returns the entry with the smallest key strictly greater than the given key, or a fallback value
	 * (default: undefined) if no such key exists.
	 * @param key - the key to find the next entry for
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - inclusive: (default: false) when true, returns the entry with the given key if present
	 * instead of the entry with the next greater key
	 * @param otherwise - (default: undefined) the fallback value to return if no next entry exists.
	 * @example
	 * ```ts
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]);
	 * console.log(m.nextEntry('b'))
	 * // => [ "c", 3 ]
	 * console.log(m.nextEntry('c'))
	 * // => [ "d", 4 ]
	 * console.log(m.nextEntry('c', { inclusive: true }))
	 * // => [ "c", 3 ]
	 * console.log(m.nextEntry('q'))
	 * // => undefined
	 * ```
	 */
	nextEntry(
		key: K,
		options?:
			| { inclusive?: boolean | undefined; otherwise?: never }
			| undefined,
	): readonly [K, V] | undefined;
	nextEntry<O>(
		key: K,
		options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
	): readonly [K, V] | O;
	/**
	 * Returns the entry with the largest key strictly less than the given key, or a fallback value
	 * (default: undefined) if no such key exists.
	 * @param key - the key to find the previous entry for
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - inclusive: (default: false) when true, returns the entry with the given key if present
	 * instead of the entry with the previous smaller key
	 * @param otherwise - (default: undefined) the fallback value to return if no previous entry exists.
	 * @example
	 * ```ts
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]);
	 * console.log(m.previousEntry('d'))
	 * // => [ "c", 3 ]
	 * console.log(m.previousEntry('c'))
	 * // => [ "b", 2 ]
	 * console.log(m.previousEntry('c', { inclusive: true }))
	 * // => [ "c", 3 ]
	 * console.log(m.previousEntry('a'))
	 * // => undefined
	 * ```
	 */
	previousEntry(
		key: K,
		options?:
			| { inclusive?: boolean | undefined; otherwise?: never }
			| undefined,
	): readonly [K, V] | undefined;
	previousEntry<O>(
		key: K,
		options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
	): readonly [K, V] | O;
	/**
	 * Returns the value associated with the maximum key of the SortedMap, or a fallback value (default: undefined)
	 * if the SortedMap is empty.
	 * @param otherwise - (default: undefined) the fallback value to return if the SortedMap is empty.
	 * @example
	 * ```ts
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
	 * console.log(m.maxValue())
	 * // => 4
	 * console.log(m.maxValue('q'))
	 * // => 4
	 * console.log(SortedMap.empty().maxValue())
	 * // => undefined
	 * console.log(SortedMap.empty().maxValue('q'))
	 * // => q
	 * ```
	 */
	maxValue(): V | undefined;
	maxValue<O>(otherwise: OptLazy<O>): V | O;
	/**
	 * Returns the entry with its key at the given index of the key sort order of the SortedMap, or a fallback value (default: undefined)
	 * if the index is out of bounds.
	 * @param index - the index in the key sort order
	 * @param otherwise - (default: undefined) the fallback value to return if the index is out of bounds.
	 *
	 * @note negative index values will retrieve the values from the end of the sort order, e.g. -1 is the last value
	 * @example
	 * ```ts
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
	 * console.log(m.atIndex(1))
	 * // => [ "b", 2 ]
	 * console.log(m.atIndex(-1))
	 * // => [ "d", 4 ]
	 * console.log(m.atIndex(10))
	 * // => undefined
	 * console.log(m.atIndex(10, 'q'))
	 * // => q
	 * ```
	 */
	atIndex(index: number): readonly [K, V] | undefined;
	atIndex<O>(index: number, otherwise: OptLazy<O>): readonly [K, V] | O;
	/**
	 * Returns a SortedMap containing the first `amount` of elements of this SortedMap.
	 * @param amount - the amount of elements to keep
	 *
	 * @note a negative `amount` takes the last elements instead of the first, e.g. -2 is the last 2 elements
	 * @example
	 * ```ts
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
	 * console.log(m.take(2).toArray())
	 * // => [ [ "a", 1 ], [ "b", 2 ] ]
	 * console.log(m.take(-2).toArray())
	 * // => [ [ "c", 3 ], [ "d", 4 ] ]
	 * ```
	 */
	take(amount: number): SortedMap<K, V>;
	/**
	 * Returns a SortedMap containing all but the first `amount` of elements of this SortedMap.
	 * @param amount - the amount of elements to drop
	 *
	 * @note a negative `amount` drops the last elements instead of the first, e.g. -2 is the last 2 elements
	 * @example
	 * ```ts
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
	 * console.log(m.drop(2).toArray())
	 * // => [ [ "c", 3 ], [ "d", 4 ] ]
	 * console.log(m.drop(-2).toArray())
	 * // => [ [ "a", 1 ], [ "b", 2 ] ]
	 * ```
	 */
	drop(amount: number): SortedMap<K, V>;
	/**
	 * Returns a SortedMap containing only those entries that are within the given `range` index range of they key
	 * sort order.
	 * @param range - an `IndexRange` defining the sort order indices to include.
	 * @example
	 * ```ts
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
	 * console.log(m.sliceIndex({ start: 1, amount: 2 }).toArray())
	 * // => [ [ "b", 2 ], [ "c", 3 ] ]
	 * ```
	 */
	sliceIndex(range: IndexRange): SortedMap<K, V>;
	/**
	 * Returns a SortedMap containing only those entries whose keys are within the given `keyRange`.
	 * @param keyRange - a `Range` defining the keys to include
	 * @example
	 * ```ts
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
	 * console.log(m.slice({ start: 'b', end: 'c' }).toArray())
	 * // => [ [ "b", 2 ], [ "c", 3 ] ]
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
	 * import { SortedMap } from '@rimbu/sorted';
	 *
	 * const m1 = SortedMap.empty<number, string>()
	 * const m2 = SortedMap.of([1, 'a'], [2, 'b'])
	 * ```
	 */
	export interface NonEmpty<K, V>
		extends RMapBase.NonEmpty<K, V, SortedMap.Types>,
			Omit<SortedMap<K, V>, keyof RMapBase.NonEmpty<any, any, any>>,
			Streamable.NonEmpty<readonly [K, V]> {
		stream(options?: { reversed?: boolean }): Stream.NonEmpty<readonly [K, V]>;
		streamKeys(options?: { reversed?: boolean }): Stream.NonEmpty<K>;
		streamValues(options?: { reversed?: boolean }): Stream.NonEmpty<V>;
		/**
		 * Returns the entry with the minimum key of the SortedMap.
		 * @example
		 * ```ts
		 * import { SortedMap } from '@rimbu/sorted';
		 *
		 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]);
		 * console.log(m.min())
		 * // => [ "a", 1 ]
		 * ```
		 */
		min(): readonly [K, V];
		/**
		 * Returns the minimum key of the SortedMap.
		 * @example
		 * ```ts
		 * import { SortedMap } from '@rimbu/sorted';
		 *
		 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]);
		 * console.log(m.minKey())
		 * // => a
		 * ```
		 */
		minKey(): K;
		/**
		 * Returns the value associated with the minimum key of the SortedMap.
		 * @example
		 * ```ts
		 * import { SortedMap } from '@rimbu/sorted';
		 *
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
		 * import { SortedMap } from '@rimbu/sorted';
		 *
		 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
		 * console.log(m.max())
		 * // => [ "d", 4 ]
		 * ```
		 */
		max(): readonly [K, V];
		/**
		 * Returns the maximum key of the SortedMap.
		 * @example
		 * ```ts
		 * import { SortedMap } from '@rimbu/sorted';
		 *
		 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
		 * console.log(m.maxKey())
		 * // => d
		 * ```
		 */
		maxKey(): K;
		/**
		 * Returns the value associated with the maximum key of the SortedMap.
		 * @example
		 * ```ts
		 * import { SortedMap } from '@rimbu/sorted';
		 *
		 * const m = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).asNormal();
		 * console.log(m.maxValue())
		 * // => 4
		 * ```
		 */
		maxValue(): V;
		take<N extends number>(
			amount: N,
		): 0 extends N ? SortedMap<K, V> : SortedMap.NonEmpty<K, V>;
	}

	/**
	 * A context instance for a SortedMap that acts as a factory for every instance of this
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
		 * import { SortedMap } from '@rimbu/sorted';
		 *
		 * const b = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).toBuilder();
		 * console.log(b.min())
		 * // => [ "a", 1 ]
		 * console.log(b.min('q'))
		 * // => [ "a", 1 ]
		 * console.log(SortedMap.builder().min())
		 * // => undefined
		 * console.log(SortedMap.builder().min('q'))
		 * // => q
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
		 * import { SortedMap } from '@rimbu/sorted';
		 *
		 * const b = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).toBuilder();
		 * console.log(b.max())
		 * // => [ "d", 4 ]
		 * console.log(b.max('q'))
		 * // => [ "d", 4 ]
		 * console.log(SortedMap.builder().max())
		 * // => undefined
		 * console.log(SortedMap.builder().max('q'))
		 * // => q
		 * ```
		 */
		max(): readonly [K, V] | undefined;
		max<O>(otherwise: OptLazy<O>): readonly [K, V] | O;
		/**
		 * Returns the entry with its key at the given index of the key sort order of the SortedMap builder, or a fallback value (default: undefined)
		 * if the index is out of bounds.
		 * @param index - the index in the key sort order
		 * @param otherwise - (default: undefined) the fallback value to return if the index is out of bounds.
		 *
		 * @note negative index values will retrieve the values from the end of the sort order, e.g. -1 is the last value
		 * @example
		 * ```ts
		 * import { SortedMap } from '@rimbu/sorted';
		 *
		 * const b = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).toBuilder();
		 * console.log(b.atIndex(1))
		 * // => [ "b", 2 ]
		 * console.log(b.atIndex(-1))
		 * // => [ "d", 4 ]
		 * console.log(b.atIndex(10))
		 * // => undefined
		 * console.log(b.atIndex(10, 'q'))
		 * // => q
		 * ```
		 */
		atIndex(index: number): readonly [K, V] | undefined;
		atIndex<O>(index: number, otherwise: OptLazy<O>): readonly [K, V] | O;
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

/**
 * @expandType SortedMapCreators
 */
export const SortedMap: SortedMapCreators =
	createSortedMapContextModule().build();
