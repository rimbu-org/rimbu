// @ts-nocheck
import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { Eq } from '@rimbu/common';
import type { Hasher } from '@rimbu/hashed';
import type { List } from '@rimbu/list';

import { HashMapContext } from '#map/context';

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
		export type Api<
			K,
			V,
			Tp extends Collection.Advanced.TypesBase,
		> = Collection.Capability.WithAdd.Api<E, Tp> &
			Collection.Capability.WithFlatMap.Api<readonly [K, V], Tp> &
			Collection.Capability.WithMap.Api<readonly [K, V], Tp> &
			Collection.Capability.WithMutate.Api<readonly [K, V], Tp> &
			Collection.Capability.WithRecompose.Api<readonly [K, V], Tp> &
			Collection.Capability.WithToBuilder.Api<readonly [K, V], Tp> &
			KeyedCollection.Advanced.Api<K, V, Tp> &
			KeyedCollection.Capability.WithRemove.Api<K, V, Tp> &
			KeyedCollection.Capability.WithMapValues.Api<K, V, Tp> &
			MapCollection.Advanced.Api<K, V, Tp> &
			MapCollection.Capability.WithSet.Api<K, V, Tp> &
			MapCollection.Capability.WithUpdateAt.Api<K, V, Tp> &
			MapCollection.Capability.WithModifyAt.Api<K, V, Tp> &
			MapCollection.WithRecompose.Api<K, V, Tp>;

		export type BuilderApi<
			K,
			V,
			Tp extends Collection.Advanced.TypesBase,
		> = Collection.Capability.WithAdd.BuilderApi<E, Tp> &
			KeyedCollection.Advanced.BuilderApi<K, V, Tp> &
			MapCollection.Advanced.BuilderApi<K, V, Tp> &
			KeyedCollection.Capability.WithRemove.BuilderApi<K, V, Tp> &
			MapCollection.Capability.WithSet.BuilderApi<K, V, Tp> &
			MapCollection.Capability.WithUpdateAt.BuilderApi<K, V, Tp> &
			MapCollection.Capability.WithModifyAt.BuilderApi<K, V, Tp>;

		export interface ContextApi<
			UK,
			F extends Collection.Advanced.FamilyBase<readonly [UK, any]>,
		> extends MapCollection.Advanced.ContextApi<F>,
				Collection.Capability.WithReducer.ContextApi<F> {
			readonly blockSizeBits: number;
			readonly hasher: Hasher<UK>;
			readonly eq: Eq<UK>;
		}

		export interface Family<K, V> extends MapCollection.Advanced.Family<K, V> {
			_NORMAL: HashMap<K, V>;
			_NON_EMPTY: HashMap.NonEmpty<K, V>;
			_BUILDER: HashMap.Builder<K, V>;
			_CONTEXT: HashMap.Context<K>;

			_UPPER_K: K;
			_UPPER_V: V;
			_INVARIANT: (entry: readonly [K, V]) => readonly [K, V];

			_FAM: Family<K, V>;
			_NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
		}

		export type DefaultFactory = Pick<
			Context<any>,
			'builder' | 'empty' | 'from' | 'of' | 'reducer'
		> & {
			createContext<K>(options: {
				hasher?: Hasher<K> | undefined;
				eq?: Eq<K> | undefined;
				blockSizeBits?: number | undefined;
				listContext?: List.Context | undefined;
			}): Context<K>;
		};
	}
}

export const HashMap: HashMap.Advanced.DefaultFactory =
	new HashMapContext() as any;
