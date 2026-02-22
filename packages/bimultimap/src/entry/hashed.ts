import type { BiMultiMapHashed } from '@rimbu/bimultimap/hashed/interface';
import type { HashSet } from '@rimbu/hashed/set';
import type { Streamable } from '@rimbu/stream';

import type { BiMultiMapBase } from '#bimultimap/base';

import { createBiMultiMapContextModule } from '@rimbu/bimultimap/internal/context-factory';
import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';

/**
 * A type-invariant immutable bi-directional MultiMap where keys and values have a
 * many-to-many mapping. Its keys and values are hashed.
 * See the [BiMultiMap documentation](https://rimbu.org/docs/collections/bimultimap) and the [HashBiMultiMap API documentation](https://rimbu.org/api/rimbu/bimultimap/HashBiMultiMap/interface)
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @example
 * ```ts
 * const h1 = HashBiMultiMap.empty<number, string>()
 * const h2 = HashBiMultiMap.of([1, 'a'], [1, 'b'])
 * ```
 */
export interface HashBiMultiMap<K, V>
	extends BiMultiMapBase<K, V, HashBiMultiMap.Types> {}

export namespace HashBiMultiMap {
	/**
	 * A non-empty type-invariant immutable bi-directional MultiMap where keys and values have a
	 * many-to-many mapping. Its keys and values are hashed.
	 * See the [BiMultiMap documentation](https://rimbu.org/docs/collections/bimultimap) and the [HashBiMultiMap API documentation](https://rimbu.org/api/rimbu/bimultimap/HashBiMultiMap/interface)
	 * @typeparam K - the key type
	 * @typeparam V - the value type
	 */
	export interface NonEmpty<K, V>
		extends BiMultiMapBase.NonEmpty<K, V, HashBiMultiMap.Types>,
			Omit<HashBiMultiMap<K, V>, keyof BiMultiMapBase<any, any, any>>,
			Streamable.NonEmpty<[K, V]> {}

	/**
	 * The HashBiMultiMap's Context instance that serves as a factory for all related immutable instances and builders.
	 * @typeparam UK - the upper type limit for key types for which this context can create instances
	 * @typeparam UV - the upper type limit for value types for which this context can create instances
	 */
	export interface Context<UK, UV>
		extends BiMultiMapBase.Context<UK, UV, HashBiMultiMap.Types> {
		readonly typeTag: 'HashBiMultiMap';
	}

	/**
	 * A mutable `HashBiMultiMap` builder used to efficiently create new immutable instances.
	 * See the [BiMultiMap documentation](https://rimbu.org/docs/collections/bimultimap) and the [HashBiMultiMap.Builder API documentation](https://rimbu.org/api/rimbu/bimultimap/HashBiMultiMap/Builder/interface)
	 * @typeparam K - the key type
	 * @typeparam V - the value type
	 */
	export interface Builder<K, V>
		extends BiMultiMapBase.Builder<K, V, HashBiMultiMap.Types> {}

	/**
	 * Utility interface that provides higher-kinded types for this collection.
	 */
	export interface Types extends BiMultiMapBase.Types {
		readonly context: HashBiMultiMap.Context<this['_K'], this['_V']>;
		readonly normal: HashBiMultiMap<this['_K'], this['_V']>;
		readonly nonEmpty: HashBiMultiMap.NonEmpty<this['_K'], this['_V']>;
		readonly builder: HashBiMultiMap.Builder<this['_K'], this['_V']>;
		readonly keyValueMultiMap: HashMultiMapHashValue<this['_K'], this['_V']>;
		readonly valueKeyMultiMap: HashMultiMapHashValue<this['_V'], this['_K']>;
		readonly keyMultiMapValues: HashSet<this['_V']>;
		readonly valueMultiMapValues: HashSet<this['_K']>;
	}
}

/**
 * @expandType Creators
 */
export const HashBiMultiMap: BiMultiMapHashed.Creators =
	createBiMultiMapContextModule('HashBiMultiMap', {
		get keyValueMultiMapContext() {
			return HashMultiMapHashValue.defaultContext();
		},
		get valueKeyMultiMapContext() {
			return HashMultiMapHashValue.defaultContext();
		},
	}).build();
