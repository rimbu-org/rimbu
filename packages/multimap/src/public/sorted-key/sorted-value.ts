import type { Stream, Streamable } from '@rimbu/stream';

import type { SortedMultiMapSortedValueCreators } from '#multimap/creators';
import type { MultiMapBase } from '#multimap/types';

import { SortedMap } from '@rimbu/sorted/map';
import { SortedSet } from '@rimbu/sorted/set';

import { createMultiMapContextModule } from '#multimap/context-factory';

/**
 * A type-invariant immutable MultiMap of key type K, and value type V.
 * In the MultiMap, each key has at least one value.
 * See the [MultiMap documentation](https://rimbu.org/docs/collections/multimap) and the [SortedMultiMapSortedValue API documentation](https://rimbu.org/api/rimbu/multimap/SortedMultiMapSortedValue/interface)
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @note
 * - The `SortedMultiMapSortedValue` uses the contexts' `SortedMap` `keyContext` to hash
 * the keys
 * - The `SortedMultiMapSortedValue` uses the contexts' `SortedSet` `valueContext` to collect
 * the values for each key.
 * @example
 * ```ts
 * import { SortedMultiMapSortedValue } from '@rimbu/multimap/sorted-key/sorted-value';
 * const m1 = SortedMultiMapSortedValue.empty<number, string>()
 * const m2 = SortedMultiMapSortedValue.of([1, 'a'], [1, 'b'], [2, 'a'])
 * console.log(m2.toArray()); // => [ [ 1, "a" ], [ 1, "b" ], [ 2, "a" ] ]
 * ```
 */
export interface SortedMultiMapSortedValue<K, V>
	extends MultiMapBase<K, V, SortedMultiMapSortedValue.Types> {}

export namespace SortedMultiMapSortedValue {
	/**
	 * A non-empty type-invariant immutable MultiMap of key type K, and value type V.
	 * In the MultiMap, each key has at least one value.
	 * See the [MultiMap documentation](https://rimbu.org/docs/collections/multimap) and the [SortedMultiMapSortedValue API documentation](https://rimbu.org/api/rimbu/multimap/SortedMultiMapSortedValue/interface)
	 * @typeparam K - the key type
	 * @typeparam V - the value type
	 * @note
	 * - The `SortedMultiMapSortedValue` uses the contexts' `SortedMap` `keyContext` to hash
	 * the keys
	 * - The `SortedMultiMapSortedValue` uses the contexts' `SortedSet` `valueContext` to collect
	 * the values for each key.
	 * @example
	 * ```ts
	 * import { SortedMultiMapSortedValue } from '@rimbu/multimap/sorted-key/sorted-value';
	 * const m1 = SortedMultiMapSortedValue.empty<number, string>()
	 * const m2 = SortedMultiMapSortedValue.of([1, 'a'], [1, 'b'], [2, 'a'])
	 * console.log(m2.toArray()); // => [ [ 1, "a" ], [ 1, "b" ], [ 2, "a" ] ]
	 * ```
	 */
	export interface NonEmpty<K, V>
		extends MultiMapBase.NonEmpty<K, V, SortedMultiMapSortedValue.Types>,
			Omit<
				SortedMultiMapSortedValue<K, V>,
				keyof MultiMapBase.NonEmpty<any, any, any>
			>,
			Streamable.NonEmpty<[K, V]> {
		stream(): Stream.NonEmpty<[K, V]>;
	}

	/**
	 * A context instance for an `SortedMultiMapSortedValue` that acts as a factory for every instance of this
	 * type of collection.
	 * @typeparam UK - the upper key type bound for which the context can be used
	 * @typeparam UV - the upper value type bound for which the context can be used
	 */
	export interface Context<UK, UV>
		extends MultiMapBase.Context<UK, UV, SortedMultiMapSortedValue.Types> {
		readonly typeTag: 'SortedMultiMapSortedValue';

		/**
		 * The `SortedMap` context used to create HashMaps to the key to value maps.
		 */
		readonly keyMapContext: SortedMap.Context<UK>;
		/**
		 * The `SortedSet` context used to create HashSets for the value sets.
		 */
		readonly keyMapValuesContext: SortedSet.Context<UV>;
	}

	/**
	 * A mutable `SortedMultiMapSortedValue` builder used to efficiently create new immutable instances.
	 * See the [MultiMap documentation](https://rimbu.org/docs/collections/multimap) and the [SortedMultiMapSortedValue.Builder API documentation](https://rimbu.org/api/rimbu/multimap/SortedMultiMapSortedValue/Builder/interface)
	 * @typeparam K - the key type
	 * @typeparam V - the value type
	 */
	export interface Builder<K, V>
		extends MultiMapBase.Builder<K, V, SortedMultiMapSortedValue.Types> {}

	/**
	 * Utility interface that provides higher-kinded types for this collection.
	 */
	export interface Types extends MultiMapBase.Types {
		readonly normal: SortedMultiMapSortedValue<this['_K'], this['_V']>;
		readonly nonEmpty: SortedMultiMapSortedValue.NonEmpty<
			this['_K'],
			this['_V']
		>;
		readonly context: SortedMultiMapSortedValue.Context<this['_K'], this['_V']>;
		readonly builder: SortedMultiMapSortedValue.Builder<this['_K'], this['_V']>;
		readonly keyMap: SortedMap<this['_K'], SortedSet.NonEmpty<this['_V']>>;
		readonly keyMapNonEmpty: SortedMap.NonEmpty<
			this['_K'],
			SortedSet.NonEmpty<this['_V']>
		>;
		readonly keyMapContext: SortedMap.Context<this['_K']>;
		readonly keyMapValuesContext: SortedSet.Context<this['_V']>;
		readonly keyMapValues: SortedSet<this['_V']>;
		readonly keyMapValuesNonEmpty: SortedSet.NonEmpty<this['_V']>;
	}
}

/**
 * @expandType SortedMultiMapSortedValueCreators
 */
export const SortedMultiMapSortedValue: SortedMultiMapSortedValueCreators =
	createMultiMapContextModule('SortedMultiMapSortedValue', {
		get keyMapContext() {
			return SortedMap.defaultContext();
		},
		get keyMapValuesContext() {
			return SortedSet.defaultContext();
		},
	}).build();
