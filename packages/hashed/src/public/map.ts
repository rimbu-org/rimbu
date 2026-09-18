import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { Eq } from '@rimbu/common';
import type { Hasher } from '@rimbu/hashed';
import type { List } from '@rimbu/list';

import { HashMapCollectionContext } from '#map/context';

export interface HashMap<K, V>
	extends HashMap.Advanced.Api<
		K,
		V,
		Collection.Advanced.Types<HashMap.Advanced.Family<K, V>, readonly [K, V]>
	> {}

export namespace HashMap {
	export interface NonEmpty<K, V>
		extends Advanced.Api<
			K,
			V,
			Collection.Advanced.TypesNonEmpty<Advanced.Family<K, V>, readonly [K, V]>
		> {}

	export interface Builder<K, V>
		extends Advanced.BuilderApi<
			K,
			V,
			Collection.Advanced.Types<Advanced.Family<K, V>, readonly [K, V]>
		> {}

	export interface Context<UK>
		extends Advanced.ContextApi<UK, HashMap.Advanced.Family<UK, any>> {}

	export namespace Advanced {
		export interface Api<
			K,
			V,
			Tp extends Collection.Advanced.Types<
				KeyedCollection.Advanced.Family<K, V>,
				readonly [K, V]
			>,
		> extends MapCollection.Advanced.Api<K, V, Tp> {}

		export interface BuilderApi<
			K,
			V,
			Tp extends Collection.Advanced.Types<
				KeyedCollection.Advanced.FamilyBase<K, V>,
				readonly [K, V]
			>,
		> extends MapCollection.Advanced.BuilderApi<K, V, Tp> {}

		export interface ContextApi<
			UK,
			FAM extends KeyedCollection.Advanced.Family<UK, any>,
		> extends MapCollection.Advanced.ContextApi<FAM> {
			readonly blockSizeBits: number;
			readonly hasher: Hasher<UK>;
			readonly eq: Eq<UK>;
		}

		export interface KeyedContextApi<
			UK,
			FAM extends KeyedCollection.Advanced.Family<UK, any>,
		> extends MapCollection.Advanced.KeyedContextApi<FAM> {
			createContext<K>(options: {
				hasher?: Hasher<K> | undefined;
				eq?: Eq<K> | undefined;
				blockSizeBits?: number | undefined;
				listContext?: List.Context | undefined;
			}): Context<K>;
		}

		export interface Family<K, V> extends MapCollection.Advanced.Family<K, V> {
			_NORMAL: HashMap<K, V>;
			_NON_EMPTY: HashMap.NonEmpty<K, V>;
			_BUILDER: HashMap.Builder<K, V>;
			_CONTEXT: HashMap.Context<K>;
			_KEYED_CONTEXT: KeyedContextApi<K, this['_FAM']>;

			_UPPER_E: readonly [K, any];

			_FAM: Family<K, V>;
			_NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
		}

		export type DefaultFactory = KeyedContextApi<any, Family<any, any>>;
	}
}

export const HashMap: HashMap.Advanced.DefaultFactory =
	HashMapCollectionContext.createDefault().keyedContext;
