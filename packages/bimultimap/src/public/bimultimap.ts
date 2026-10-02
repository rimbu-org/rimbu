import type { BiMultiMapCollection } from '@rimbu/bimultimap/advanced/bimultimap-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { MultiMap } from '@rimbu/multimap';

import { BiMultiMapContextImpl } from '#bimultimap/context-factory';

/**
 * An immutable bidirectional many-to-many map: every key is associated with one
 * or more values, and every value with one or more keys.
 *
 * A BiMultiMap is a keyed collection whose elements are `readonly [K, V]`
 * entries, stored as two `MultiMap`s in lockstep — `keyValueMultiMap`
 * (key → values) and `valueKeyMultiMap` (value → keys) — which are exact inverses
 * of one another.
 *
 * `HashBiMultiMap` and `SortedBiMultiMap` are no longer distinct *types*. They
 * are now {@link BiMultiMap.Context} instances differing only in which map backs
 * each direction, so the collection type is chosen once and the backing is chosen
 * at the context:
 *
 * ```ts
 * import { BiMultiMap } from '@rimbu/bimultimap';
 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
 * import { SortedMultiMapSortedValue } from '@rimbu/multimap/sorted-key/sorted-value';
 *
 * const Mixed = BiMultiMap.createContext({
 *   keyValueMultiMapContext: HashMultiMapHashValue,
 *   valueKeyMultiMapContext: SortedMultiMapSortedValue,
 * });
 * ```
 */
export interface BiMultiMap<K, V>
	extends BiMultiMapCollection.Advanced.Api<
		K,
		V,
		Collection.Advanced.Types<BiMultiMap.Advanced.Family<K, V>, readonly [K, V]>
	> {}

export namespace BiMultiMap {
	/**
	 * The non-empty variant.
	 *
	 * Because any entry implies an entry in *each* direction, both backing maps
	 * are non-empty here — there is no asymmetric case to represent.
	 */
	export interface NonEmpty<K, V>
		extends BiMultiMapCollection.Advanced.Api<
			K,
			V,
			Collection.Advanced.TypesNonEmpty<
				BiMultiMap.Advanced.Family<K, V>,
				readonly [K, V]
			>
		> {
		readonly keyValueMultiMap: MultiMap.NonEmpty<K, V>;
		readonly valueKeyMultiMap: MultiMap.NonEmpty<V, K>;

		/**
		 * The non-empty result is itself non-empty: swapping the directions of a
		 * collection that has at least one entry still has at least one.
		 */
		invert(): BiMultiMap.NonEmpty<V, K>;
	}

	export interface Builder<K, V>
		extends BiMultiMapCollection.Advanced.BuilderApi<
			K,
			V,
			Collection.Advanced.Types<
				BiMultiMap.Advanced.Family<K, V>,
				readonly [K, V]
			>
		> {}

	export interface Context<UK, UV>
		extends BiMultiMap.Advanced.ContextApi<
			UK,
			UV,
			BiMultiMap.Advanced.Family<UK, UV>
		> {}

	export namespace Advanced {
		export interface Api<
			K,
			V,
			Tp extends Collection.Advanced.Types<
				KeyedCollection.Advanced.FamilyBase<K, V>,
				readonly [K, V]
			>,
		> extends BiMultiMapCollection.Advanced.Api<K, V, Tp> {}

		export interface BuilderApi<
			K,
			V,
			Tp extends Collection.Advanced.Types<
				KeyedCollection.Advanced.FamilyBase<K, V>,
				readonly [K, V]
			>,
		> extends BiMultiMapCollection.Advanced.BuilderApi<K, V, Tp> {}

		export interface ContextApi<
			UK,
			UV,
			FAM extends BiMultiMapCollection.Advanced.FamilyBase<UK, UV>,
		> extends BiMultiMapCollection.Advanced.ContextApi<UK, UV, FAM> {
			createContext<K2, V2>(options?: {
				keyValueMultiMapContext?: MultiMap.Context<K2, V2> | undefined;
				valueKeyMultiMapContext?: MultiMap.Context<V2, K2> | undefined;
			}): BiMultiMap.Context<K2, V2>;
		}

		/**
		 * The concrete family: `BiMultiMapCollection.Advanced.Family` with the four
		 * API slots narrowed from the generic `Api`/`BuilderApi`/`ContextApi` to
		 * the concrete `BiMultiMap` types.
		 *
		 * Everything else — which capabilities are claimed, `_UPPER_K`/`_UPPER_V`,
		 * `_INVARIANT` and `_REMOVED_AT_KEY` — is inherited unchanged. See
		 * `BiMultiMapCollection.Advanced.Family` for why only the non-invariant
		 * capabilities appear in the family `extends` clause.
		 */
		export interface Family<K, V>
			extends BiMultiMapCollection.Advanced.Family<K, V> {
			_NORMAL: BiMultiMap<K, V>;
			_NON_EMPTY: BiMultiMap.NonEmpty<K, V>;
			_BUILDER: BiMultiMap.Builder<K, V>;
			_CONTEXT: BiMultiMap.Context<K, V>;
			_KEYED_CONTEXT: BiMultiMap.Context<K, V>;

			_FAM: Family<K, V>;
			_NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
		}

		export type DefaultFactory = ContextApi<any, any, Family<any, any>>;
	}
}

export const BiMultiMap: BiMultiMap.Advanced.DefaultFactory =
	BiMultiMapContextImpl.createDefault();
