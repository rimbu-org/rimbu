import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { MultiMapCollection } from '@rimbu/multimap/advanced/multimap-base';

import { MultiMapContextImpl } from '#multimap/context-factory';

/**
 * An immutable map where each key is associated with **one or more** values.
 *
 * A MultiMap is a keyed collection whose elements are `readonly [K, V]` entries.
 * It is deliberately **not** a `MapCollection`: a key holds a *set* of values,
 * not a single one, so `getValues` returns a `SetCollection<V>` where a map's
 * `get` would return `V | undefined`, and `addTo(key, value)` appends where a
 * map's `set` replaces.
 *
 * The four historical variants (`HashMultiMapHashValue` and friends) are no
 * longer distinct types. They are now {@link MultiMap.Context} instances
 * differing only in which map backs the keys and which set backs the values, so
 * the collection type is chosen once and the backing is chosen at the context:
 *
 * ```ts
 * import { MultiMap } from '@rimbu/multimap';
 * import { HashMap } from '@rimbu/hashed/map';
 * import { SortedSet } from '@rimbu/sorted/set';
 *
 * const Sorted = MultiMap.createContext({
 *   keyMapContext: HashMap.collectionContext,
 *   keyMapValuesContext: SortedSet.collectionContext,
 * });
 * ```
 */
export interface MultiMap<K, V>
	extends MultiMapCollection.Advanced.Api<
		K,
		V,
		Collection.Advanced.Types<MultiMap.Advanced.Family<K, V>, readonly [K, V]>
	> {}

export namespace MultiMap {
	/**
	 * The non-empty variant: the compiler knows there is at least one entry, so
	 * `stream`/`toArray` are non-empty and the value-set-backed reads
	 * (`keyMap`, `streamKeys`, `streamValues`, `filter`, …) are refined.
	 */
	export interface NonEmpty<K, V>
		extends MultiMapCollection.Advanced.Api<
			K,
			V,
			Collection.Advanced.TypesNonEmpty<
				MultiMap.Advanced.Family<K, V>,
				readonly [K, V]
			>
		> {
		/**
		 * A non-empty MultiMap holds at least one key, so its backing key map is
		 * non-empty too.
		 */
		readonly keyMap: MapCollection.NonEmpty<K, SetCollection.NonEmpty<V>>;
	}

	export interface Builder<K, V>
		extends MultiMapCollection.Advanced.BuilderApi<
			K,
			V,
			Collection.Advanced.Types<MultiMap.Advanced.Family<K, V>, readonly [K, V]>
		> {}

	export interface Context<UK, UV>
		extends MultiMap.Advanced.ContextApi<
			UK,
			UV,
			MultiMap.Advanced.Family<UK, UV>
		> {}

	export namespace Advanced {
		export interface Api<
			K,
			V,
			Tp extends Collection.Advanced.Types<
				KeyedCollection.Advanced.FamilyBase<K, V>,
				readonly [K, V]
			>,
		> extends MultiMapCollection.Advanced.Api<K, V, Tp> {}

		export interface BuilderApi<
			K,
			V,
			Tp extends Collection.Advanced.Types<
				KeyedCollection.Advanced.FamilyBase<K, V>,
				readonly [K, V]
			>,
		> extends MultiMapCollection.Advanced.BuilderApi<K, V, Tp> {}

		export interface ContextApi<
			UK,
			UV,
			FAM extends MultiMapCollection.Advanced.FamilyBase<UK, UV>,
		> extends MultiMapCollection.Advanced.ContextApi<UK, UV, FAM> {
			createContext<K2, V2>(options?: {
				keyMapContext?:
					| MapCollection.Context<MapCollection.Advanced.Family<K2, any>>
					| undefined;
				keyMapValuesContext?:
					| SetCollection.Context<SetCollection.Advanced.Family<V2>>
					| undefined;
			}): MultiMap.Context<K2, V2>;
		}

		/**
		 * The concrete family: `MultiMapCollection.Advanced.Family` with the four
		 * API slots narrowed from the generic `Api`/`BuilderApi`/`ContextApi` to
		 * the concrete `MultiMap` types.
		 *
		 * Everything else — which capabilities are claimed, `_UPPER_K`/`_UPPER_V`,
		 * `_INVARIANT` and `_REMOVED_AT_KEY` — is inherited unchanged. See
		 * `MultiMapCollection.Advanced.Family` for why only the non-invariant keyed
		 * capabilities appear in the family `extends` clause.
		 */
		export interface Family<K, V>
			extends MultiMapCollection.Advanced.Family<K, V> {
			_NORMAL: MultiMap<K, V>;
			_NON_EMPTY: MultiMap.NonEmpty<K, V>;
			_BUILDER: MultiMap.Builder<K, V>;
			_CONTEXT: MultiMap.Context<K, V>;
			_KEYED_CONTEXT: MultiMap.Context<K, V>;

			_FAM: Family<K, V>;
			_NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
		}

		export type DefaultFactory = ContextApi<any, any, Family<any, any>>;
	}
}

export const MultiMap: MultiMap.Advanced.DefaultFactory =
	MultiMapContextImpl.createDefault();
