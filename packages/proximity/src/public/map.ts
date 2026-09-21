import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { OptLazy, RelatedTo } from '@rimbu/common';
import type { HashMap } from '@rimbu/hashed/map';
import type { DistanceFunction } from '@rimbu/proximity/distance-function';
import type { NearestKeyMatch } from '@rimbu/proximity/key-matching';

import { ProximityMapContext } from '#proximity/context';

/**
 * A type-invariant immutable Map of key type K, and value type V.
 * In the Map, each key has exactly one value, and the Map cannot contain
 * duplicate keys.
 * See the [Map documentation](https://rimbu.org/docs/collections/map) and the
 * [ProximityMap API documentation](https://rimbu.org/api/rimbu/proximity/map/ProximityMap/interface)
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @note
 * The `get` and `has` methods perform **exact-key** lookup, like any other map.
 * To find the value whose key is closest to a search key, use
 * {@link ProximityMap.Advanced.Api.getNearest | getNearest}, which performs a
 * linear scan of all the keys using the context's `DistanceFunction`; optimized
 * distance functions can greatly improve efficiency by preventing a full scan.
 * @example
 * ```ts
 * import { ProximityMap } from '@rimbu/proximity';
 * const m1 = ProximityMap.empty<number, string>()
 * const m2 = ProximityMap.of([1, 'a'], [2, 'b'])
 * ```
 */
export interface ProximityMap<K, V>
	extends ProximityMap.Advanced.Api<
		K,
		V,
		Collection.Advanced.Types<
			ProximityMap.Advanced.Family<K, V>,
			readonly [K, V]
		>
	> {}

export namespace ProximityMap {
	/**
	 * A **non-empty** type-invariant immutable Map of key type K, and value type V.
	 * In the Map, each key has exactly one value, and the Map cannot contain
	 * duplicate keys.<br/>
	 * See the [Map documentation](https://rimbu.org/docs/collections/map) and the
	 * [ProximityMap API documentation](https://rimbu.org/api/rimbu/proximity/map/ProximityMap/interface)
	 * @typeparam K - the key type
	 * @typeparam V - the value type
	 * @example
	 * ```ts
	 * import { ProximityMap } from '@rimbu/proximity';
	 * const m1 = ProximityMap.empty<number, string>()
	 * const m2 = ProximityMap.of([1, 'a'], [2, 'b'])
	 * ```
	 */
	export interface NonEmpty<K, V>
		extends Advanced.Api<
			K,
			V,
			Collection.Advanced.TypesNonEmpty<Advanced.Family<K, V>, readonly [K, V]>
		> {}

	/**
	 * A context instance for a `ProximityMap` that acts as a factory
	 * for every instance of this type of collection.
	 *
	 * @typeparam UK - the upper key type bound for which the context can be used
	 */
	export interface Context<UK>
		extends Advanced.ContextApi<UK, ProximityMap.Advanced.Family<UK, any>> {}

	/**
	 * A mutable `ProximityMap` builder used to efficiently create new immutable instances.
	 * See the [Map documentation](https://rimbu.org/docs/collections/map) and the
	 * [ProximityMap.Builder API documentation](https://rimbu.org/api/rimbu/proximity/map/ProximityMap/Builder/interface)
	 * @typeparam K - the key type
	 * @typeparam V - the value type
	 */
	export interface Builder<K, V>
		extends Advanced.BuilderApi<
			K,
			V,
			Collection.Advanced.Types<Advanced.Family<K, V>, readonly [K, V]>
		> {}

	export namespace Advanced {
		export interface Api<
			K,
			V,
			Tp extends Collection.Advanced.Types<
				KeyedCollection.Advanced.FamilyBase<K, V>,
				readonly [K, V]
			>,
		> extends MapCollection.Advanced.Api<K, V, Tp> {
			/**
			 * Returns the value associated with the key closest to `key`, as measured
			 * by the context's `DistanceFunction`; returns `undefined` when no key has
			 * a finite distance to `key`.
			 *
			 * Performs a linear scan of all keys unless a distance of `0` is found.
			 * @param key - the key used as a reference to find the closest key
			 * @example
			 * ```ts
			 * import { ProximityMap } from '@rimbu/proximity';
			 * const m = ProximityMap.of<[number, string]>([1, 'a'], [5, 'b'])
			 * m.getNearest(3) // 'a'
			 * ```
			 */
			getNearest<UK = K>(key: RelatedTo<K, UK>): V | undefined;
			/**
			 * Returns the value associated with the key closest to `key`, or
			 * `otherwise` when no key has a finite distance to `key`.
			 * @param key - the key used as a reference to find the closest key
			 * @param otherwise - the value to return when no closest key exists
			 * @example
			 * ```ts
			 * import { ProximityMap } from '@rimbu/proximity';
			 * const m = ProximityMap.empty<number, string>()
			 * m.getNearest(3, 'none') // 'none'
			 * ```
			 */
			getNearest<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;

			/**
			 * Returns the {@link NearestKeyMatch} describing the key closest to `key`,
			 * including its value and distance; returns `undefined` when no key has a
			 * finite distance to `key`.
			 * @param key - the key used as a reference to find the closest key
			 * @example
			 * ```ts
			 * import { ProximityMap } from '@rimbu/proximity';
			 * const m = ProximityMap.of<[number, string]>([1, 'a'], [5, 'b'])
			 * m.getNearestMatch(4) // { key: 5, value: 'b', distance: 1 }
			 * ```
			 */
			getNearestMatch<UK = K>(
				key: RelatedTo<K, UK>,
			): NearestKeyMatch<K, V> | undefined;
			/**
			 * Returns the {@link NearestKeyMatch} describing the key closest to `key`,
			 * or `otherwise` when no key has a finite distance to `key`.
			 * @param key - the key used as a reference to find the closest key
			 * @param otherwise - the value to return when no closest key exists
			 * @example
			 * ```ts
			 * import { ProximityMap } from '@rimbu/proximity';
			 * const m = ProximityMap.empty<number, string>()
			 * m.getNearestMatch(3, 'none') // 'none'
			 * ```
			 */
			getNearestMatch<UK, O>(
				key: RelatedTo<K, UK>,
				otherwise: OptLazy<O>,
			): NearestKeyMatch<K, V> | O;
		}

		export interface BuilderApi<
			K,
			V,
			Tp extends Collection.Advanced.Types<
				KeyedCollection.Advanced.FamilyBase<K, V>,
				readonly [K, V]
			>,
		> extends MapCollection.Advanced.BuilderApi<K, V, Tp> {
			/**
			 * Returns the value associated with the key closest to `key`, as measured
			 * by the context's `DistanceFunction`, or `otherwise` when no key has a
			 * finite distance to `key`.
			 * @param key - the key used as a reference to find the closest key
			 * @param otherwise - the value to return when no closest key exists
			 */
			getNearest<UK = K>(key: RelatedTo<K, UK>): V | undefined;
			getNearest<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
			/**
			 * Returns the {@link NearestKeyMatch} describing the key closest to `key`,
			 * or `otherwise` when no key has a finite distance to `key`.
			 * @param key - the key used as a reference to find the closest key
			 * @param otherwise - the value to return when no closest key exists
			 */
			getNearestMatch<UK = K>(
				key: RelatedTo<K, UK>,
			): NearestKeyMatch<K, V> | undefined;
			getNearestMatch<UK, O>(
				key: RelatedTo<K, UK>,
				otherwise: OptLazy<O>,
			): NearestKeyMatch<K, V> | O;
		}

		export interface ContextApi<
			UK,
			FAM extends KeyedCollection.Advanced.Family<UK, any>,
		> extends MapCollection.Advanced.ContextApi<FAM> {
			readonly typeTag: 'ProximityMap';

			/**
			 * The function used to compute the distance between stored keys and any
			 * research key.
			 */
			readonly distanceFunction: DistanceFunction<UK>;

			/**
			 * The context used by the internal HashMap.
			 */
			readonly hashMapContext: HashMap.Context<UK>;
		}

		export interface KeyedContextApi<
			UK,
			FAM extends KeyedCollection.Advanced.Family<UK, any>,
		> extends MapCollection.Advanced.KeyedContextApi<FAM> {
			/**
			 * Returns a new `ProximityMap` context based on the given `options`.
			 * @param options - (optional) the distance function and internal HashMap
			 * context to use
			 */
			createContext<K>(options?: {
				distanceFunction?: DistanceFunction<K> | undefined;
				hashMapContext?: HashMap.Context<K> | undefined;
			}): Context<K>;
		}

		export interface Family<K, V> extends MapCollection.Advanced.Family<K, V> {
			_NORMAL: ProximityMap<K, V>;
			_NON_EMPTY: ProximityMap.NonEmpty<K, V>;
			_BUILDER: ProximityMap.Builder<K, V>;
			_CONTEXT: ProximityMap.Context<K>;
			_KEYED_CONTEXT: KeyedContextApi<K, this['_FAM']>;

			_UPPER_E: readonly [K, any];

			_FAM: Family<K, V>;
			_NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
		}

		export type DefaultFactory = KeyedContextApi<any, Family<any, any>>;
	}
}

export const ProximityMap: ProximityMap.Advanced.DefaultFactory =
	ProximityMapContext.createDefault().keyedContext;
