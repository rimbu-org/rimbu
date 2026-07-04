import type { Streamable } from '@rimbu/stream';

import type { BiMultiMapBase } from '#bimultimap/base';
import type { BiMultiMapGeneric } from '#bimultimap/generic';

import { createBiMultiMapContextModule } from '#bimultimap/context-factory';

/**
 * A type-invariant immutable bi-directional MultiMap where keys and values have a
 * many-to-many mapping.
 * See the [BiMultiMap documentation](https://rimbu.org/docs/collections/bimultimap) and the [BiMultiMap API documentation](https://rimbu.org/api/rimbu/bimultimap/BiMultiMap/interface)
 * @typeparam K - the key type
 * @typeparam V - the value type
 */
export interface BiMultiMap<K, V>
	extends BiMultiMapBase<K, V, BiMultiMap.Types> {}

export namespace BiMultiMap {
	/**
	 * A non-empty type-invariant immutable bi-directional MultiMap where keys and values have a
	 * many-to-many mapping.
	 * See the [BiMultiMap documentation](https://rimbu.org/docs/collections/bimultimap) and the [BiMultiMap API documentation](https://rimbu.org/api/rimbu/bimultimap/BiMultiMap/interface)
	 * @typeparam K - the key type
	 * @typeparam V - the value type
	 */
	export interface NonEmpty<K, V>
		extends BiMultiMapBase.NonEmpty<K, V, BiMultiMap.Types>,
			Omit<BiMultiMap<K, V>, keyof BiMultiMapBase.NonEmpty<any, any, any>>,
			Streamable.NonEmpty<[K, V]> {}

	/**
	 * The BiMultiMap's Context instance that serves as a factory for all related immutable instances and builders.
	 * @typeparam UK - the upper key type for which the context can create instances
	 * @typeparam UV - the upper value type for which the context can create instances
	 */
	export interface Context<UK, UV>
		extends BiMultiMapBase.Context<UK, UV, BiMultiMap.Types> {}

	/**
	 * A mutable `BiMultiMap` builder used to efficiently create new immutable instances.
	 * See the [BiMultiMap documentation](https://rimbu.org/docs/collections/bimultimap) and the [BiMultiMap.Builder API documentation](https://rimbu.org/api/rimbu/bimultimap/BiMultiMap/Builder/interface)
	 * @typeparam K - the key type
	 * @typeparam V - the value type
	 */
	export interface Builder<K, V>
		extends BiMultiMapBase.Builder<K, V, BiMultiMap.Types> {}

	/**
	 * Utility interface that provides higher-kinded types for this collection.
	 */
	export interface Types extends BiMultiMapBase.Types {
		readonly context: BiMultiMap.Context<this['_K'], this['_V']>;
		readonly normal: BiMultiMap<this['_K'], this['_V']>;
		readonly nonEmpty: BiMultiMap.NonEmpty<this['_K'], this['_V']>;
		readonly builder: BiMultiMap.Builder<this['_K'], this['_V']>;
	}
}

/**
 * @expandType Creators
 */
export const BiMultiMap: BiMultiMapGeneric.Creators =
	Object.freeze<BiMultiMapGeneric.Creators>({
		createContext: (options) =>
			createBiMultiMapContextModule('BiMultiMap', options).build(),
	});
