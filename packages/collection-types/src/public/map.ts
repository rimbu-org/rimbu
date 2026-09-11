import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { Op } from '@rimbu/collection-types/types';
import type { OptLazy, RelatedTo } from '@rimbu/common';

export type MapCollection<
	K,
	V,
	F extends Collection.Advanced.FamilyBase<
		readonly [K, V]
	> = Collection.Advanced.Family<readonly [K, V]>,
> = MapCollection.Advanced.ExtendFamily<K, V, F>['_NORMAL'];

export declare namespace MapCollection {
	export type NonEmpty<
		K,
		V,
		F extends Collection.Advanced.FamilyBase<
			readonly [K, V]
		> = Collection.Advanced.Family<readonly [K, V]>,
	> = Advanced.ExtendFamily<K, V, F>['_NON_EMPTY'];

	export type Context<
		F extends Collection.Advanced.FamilyBase<
			readonly [any, any]
		> = Collection.Advanced.Family<readonly [any, any]>,
	> = Advanced.ExtendFamily<any, any, F>['_CONTEXT'];

	export type Builder<
		K,
		V,
		F extends Collection.Advanced.FamilyBase<
			readonly [K, V]
		> = Collection.Advanced.Family<readonly [K, V]>,
	> = Advanced.ExtendFamily<K, V, F>['_BUILDER'];

	export namespace Advanced {
		export type ExtendFamily<
			K,
			V,
			F extends Collection.Advanced.FamilyBase<
				readonly [K, V]
			> = Collection.Advanced.Family<readonly [K, V]>,
		> = F & Family<K, V>;

		export interface Api<
			K,
			V,
			Tp extends Collection.Advanced.Types<
				KeyedCollection.Advanced.FamilyBase<K, V>,
				readonly [K, V]
			>,
		> extends KeyedCollection.Advanced.Api<K, V, Tp>,
				Collection.Capability.WithAdd.Api<readonly [K, V], Tp>,
				Collection.Capability.WithAddAll.Api<readonly [K, V], Tp>,
				Collection.Capability.WithMutate.Api<readonly [K, V], Tp>,
				Collection.Capability.WithToBuilder.Api<readonly [K, V], Tp>,
				KeyedCollection.Capability.WithFlatMap.Api<K, V, Tp>,
				KeyedCollection.Capability.WithFlatMapIndexed.Api<K, V, Tp>,
				KeyedCollection.Capability.WithMap.Api<K, V, Tp>,
				KeyedCollection.Capability.WithMapIndexed.Api<K, V, Tp>,
				KeyedCollection.Capability.WithMapValues.Api<K, V, Tp>,
				KeyedCollection.Capability.WithRecompose.Api<K, V, Tp>,
				KeyedCollection.Capability.WithRemoveKey.Api<K, V, Tp>,
				KeyedCollection.Capability.WithRemoveKeys.Api<K, V, Tp> {}

		export interface BuilderApi<K, V, Tp extends Collection.Advanced.TypesBase>
			extends KeyedCollection.Advanced.BuilderApi<K, V, Tp>,
				Collection.Capability.WithAdd.BuilderApi<readonly [K, V], Tp>,
				Collection.Capability.WithAddAll.BuilderApi<readonly [K, V], Tp>,
				KeyedCollection.Capability.WithRemoveKey.BuilderApi<K, V, Tp>,
				KeyedCollection.Capability.WithRemoveKeys.BuilderApi<K, V, Tp> {}

		export interface ContextApi<
			F extends KeyedCollection.Advanced.Family<any, any>,
		> extends KeyedCollection.Advanced.ContextApi<F> {}

		export interface KeyedContextApi<
			F extends KeyedCollection.Advanced.Family<any, any>,
		> extends KeyedCollection.Advanced.KeyedContextApi<F>,
				KeyedCollection.Capability.WithMerge.KeyedContextApi<F> {}

		export interface Family<K, V>
			extends KeyedCollection.Advanced.Family<K, V> {
			_NORMAL: Api<K, V, this['_TYPES']>;
			_NON_EMPTY: Api<K, V, this['_TYPES_NON_EMPTY']>;
			_BUILDER: BuilderApi<K, V, this['_TYPES']>;
			_CONTEXT: ContextApi<this['_FAM']>;
			_KEYED_CONTEXT: KeyedContextApi<this['_FAM']>;

			_FAM: Family<K, V>;
			_NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
		}
	}

	export namespace Capability {
		export interface WithSet<K, V>
			extends KeyedCollection.Advanced.FamilyBase<K, V> {
			_NORMAL: WithSet.Api<K, V, this['_TYPES']>;
			_NON_EMPTY: WithSet.Api<K, V, this['_TYPES_NON_EMPTY']>;
			_BUILDER: WithSet.BuilderApi<K, V, this['_TYPES']>;

			_FAM: WithSet<K, V>;
			_NEW_FAMILY: WithSet<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithSet {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				set(key: K, value: V): Tp['_NON_EMPTY'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				set(key: K, value: V): boolean;
			}
		}

		export interface WithUpdateAtKey<K, V>
			extends KeyedCollection.Advanced.FamilyBase<K, V> {
			_NORMAL: WithUpdateAtKey.Api<K, V, this['_TYPES']>;
			_NON_EMPTY: WithUpdateAtKey.Api<K, V, this['_TYPES_NON_EMPTY']>;
			_BUILDER: WithUpdateAtKey.BuilderApi<K, V, this['_TYPES']>;

			_FAM: WithUpdateAtKey<K, V>;
			_NEW_FAMILY: WithUpdateAtKey<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithUpdateAtKey {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				updateAtKey<UK = K>(
					key: RelatedTo<K, UK>,
					update: (value: V) => V,
				): Tp['_SELF'];

				updateAtKeyAndReturn<UK = K>(
					key: RelatedTo<K, UK>,
					update: (value: V) => V,
				): Op.DynamicResult<
					Tp['_SELF'],
					[previous: undefined, current: undefined],
					[previous: V, current: V],
					Tp['_NON_EMPTY']
				>;
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				updateAtKey<UK = K>(
					key: RelatedTo<K, UK>,
					f: (value: V) => V,
				): [previous: V | undefined, current: V | undefined];
				updateAtKey<UK, O>(
					key: RelatedTo<K, UK>,
					f: (value: V) => V,
					otherwise: OptLazy<O>,
				): [previous: V | O, current: V | O];
			}
		}

		export interface WithModifyAtKey<K, V>
			extends KeyedCollection.Advanced.FamilyBase<K, V> {
			_NORMAL: WithModifyAtKey.Api<K, V, this['_TYPES']>;
			_NON_EMPTY: WithModifyAtKey.Api<K, V, this['_TYPES_NON_EMPTY']>;
			_BUILDER: WithModifyAtKey.BuilderApi<K, V, this['_TYPES']>;

			_FAM: WithModifyAtKey<K, V>;
			_NEW_FAMILY: WithModifyAtKey<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithModifyAtKey {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				modifyAtKey(
					atKey: K,
					options: {
						ifNew?:
							| { set: V; create?: undefined }
							| {
									set?: undefined;
									create: <SKIP extends symbol>(skip: SKIP) => V | typeof skip;
							  }
							| undefined;
						ifExists?:
							| { set: V; update?: undefined }
							| {
									set?: never;
									update: <REMOVE extends symbol>(
										current: V,
										remove: REMOVE,
									) => V | REMOVE;
							  }
							| undefined;
					},
				): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				modifyAtKey(
					atKey: K,
					options: {
						ifNew?:
							| { set: V; create?: undefined }
							| {
									set?: undefined;
									create: <SKIP extends symbol>(skip: SKIP) => V | typeof skip;
							  }
							| undefined;
						ifExists?:
							| { set: V; update?: undefined }
							| {
									set?: undefined;
									update: <REMOVE extends symbol>(
										current: V,
										remove: REMOVE,
									) => V | REMOVE;
							  }
							| undefined;
					},
				): boolean;
			}
		}
	}
}
