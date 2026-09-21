import type {
	BiMapBase,
	BiMapBuilderBase,
} from '@rimbu/bimap/advanced/bimap-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { MapCollection } from '@rimbu/collection-types/map';

import { BiMapCollectionContext } from '#bimap/context';

export interface BiMap<K, V>
	extends BiMap.Advanced.Api<
		K,
		V,
		Collection.Advanced.Types<BiMap.Advanced.Family<K, V>, readonly [K, V]>
	> {}

export namespace BiMap {
	export interface NonEmpty<K, V>
		extends BiMap.Advanced.Api<
			K,
			V,
			Collection.Advanced.TypesNonEmpty<
				BiMap.Advanced.Family<K, V>,
				readonly [K, V]
			>
		> {
		readonly keyValueMap: MapCollection.NonEmpty<K, V>;
		readonly valueKeyMap: MapCollection.NonEmpty<V, K>;
	}

	export interface Builder<K, V>
		extends BiMap.Advanced.BuilderApi<
			K,
			V,
			Collection.Advanced.Types<BiMap.Advanced.Family<K, V>, readonly [K, V]>
		> {}

	export interface Context<UK, UV>
		extends BiMap.Advanced.ContextApi<UK, UV, BiMap.Advanced.Family<UK, UV>> {}

	export namespace Advanced {
		export interface Api<
			K,
			V,
			Tp extends Collection.Advanced.Types<
				KeyedCollection.Advanced.FamilyBase<K, V>,
				readonly [K, V]
			>,
		> extends BiMapBase<K, V, Tp> {}

		export interface BuilderApi<
			K,
			V,
			Tp extends Collection.Advanced.Types<
				KeyedCollection.Advanced.FamilyBase<K, V>,
				readonly [K, V]
			>,
		> extends BiMapBuilderBase<K, V, Tp> {}

		export interface ContextApi<
			UK,
			UV,
			FAM extends KeyedCollection.Advanced.Family<UK, UV>,
		> extends MapCollection.Advanced.ContextApi<FAM> {
			readonly typeTag: 'BiMap';
			readonly keyValueContext: MapCollection.Context<
				MapCollection.Advanced.Family<UK, any>
			>;
			readonly valueKeyContext: MapCollection.Context<
				MapCollection.Advanced.Family<UV, any>
			>;
			isValidValue(value: unknown): boolean;
		}

		export interface KeyedContextApi<
			UK,
			UV,
			FAM extends KeyedCollection.Advanced.Family<UK, UV>,
		> extends MapCollection.Advanced.KeyedContextApi<FAM> {
			createContext<K, V>(options?: {
				keyValueContext?:
					| MapCollection.Context<MapCollection.Advanced.Family<K, any>>
					| undefined;
				valueKeyContext?:
					| MapCollection.Context<MapCollection.Advanced.Family<V, any>>
					| undefined;
			}): BiMap.Context<K, V>;

			// `_UPPER_E` is narrowed to `readonly [K, V]` (Q20/Q25), so the
			// inherited `WithMerge` return types — which recurse through
			// `_UPPER_V` — cannot be structurally satisfied. BiMap does not claim
			// the merge surface; restate it loosely rather than drop the
			// `MapCollection.Advanced.Family` relation.
			mergeAllWith: (...args: any[]) => any;
			mergeAll: (...args: any[]) => any;
			mergeWith: (...args: any[]) => any;
			merge: (...args: any[]) => any;
		}

		export interface Family<K, V> extends MapCollection.Advanced.Family<K, V> {
			_NORMAL: BiMap<K, V>;
			_NON_EMPTY: BiMap.NonEmpty<K, V>;
			_BUILDER: BiMap.Builder<K, V>;
			_CONTEXT: BiMap.Context<K, V>;
			_KEYED_CONTEXT: KeyedContextApi<K, V, this['_FAM']>;

			_VALUE_KEYED_CONTEXT: unknown;
			_UPPER_E: readonly [K, V];

			_FAM: Family<K, V>;
			_NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
		}

		export type DefaultFactory = KeyedContextApi<any, any, Family<any, any>>;
	}
}

export const BiMap: BiMap.Advanced.DefaultFactory =
	BiMapCollectionContext.createDefault().keyedContext;
