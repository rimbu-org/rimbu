import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { Op } from '@rimbu/collection-types/types';
import type { RelatedTo } from '@rimbu/common';
import type { StreamSource } from '@rimbu/stream';

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

		export interface Api<K, V, Tp extends Collection.Advanced.TypesBase>
			extends KeyedCollection.Advanced.Api<K, V, Tp> {}

		export interface BuilderApi<K, V, Tp extends Collection.Advanced.TypesBase>
			extends KeyedCollection.Advanced.BuilderApi<K, V, Tp> {}

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends KeyedCollection.Advanced.ContextApi<F> {}

		export interface Family<K, V>
			extends KeyedCollection.Advanced.Family<K, V> {
			_NORMAL: Api<
				K,
				V,
				Collection.Advanced.Types<this['_FAM'], readonly [K, V]>
			>;
			_NON_EMPTY: Api<
				K,
				V,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], readonly [K, V]>
			>;
			_BUILDER: BuilderApi<
				K,
				V,
				Collection.Advanced.Types<this['_FAM'], readonly [K, V]>
			>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_FAM: Family<K, V>;
			_NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
		}
	}

	export namespace Capability {
		export interface WithSet<K, V> extends Advanced.Family<K, V> {
			_NORMAL: WithSet.Api<
				K,
				V,
				Collection.Advanced.Types<this['_FAM'], readonly [K, V]>
			>;
			_NON_EMPTY: WithSet.Api<
				K,
				V,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], readonly [K, V]>
			>;
			_BUILDER: WithSet.BuilderApi<
				K,
				V,
				Collection.Advanced.Types<this['_FAM'], readonly [K, V]>
			>;

			_FAM: WithSet<K, V>;
			_NEW_FAMILY: WithSet<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithSet {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<K, V, Tp> {
				set(key: K, value: V): Tp['_NON_EMPTY'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> extends Advanced.BuilderApi<K, V, Tp> {
				set(key: K, value: V): boolean;
			}
		}

		export interface WithUpdateAt<K, V> extends Advanced.Family<K, V> {
			_NORMAL: WithUpdateAt.Api<
				K,
				V,
				Collection.Advanced.Types<this['_FAM'], readonly [K, V]>
			>;
			_NON_EMPTY: WithUpdateAt.Api<
				K,
				V,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], readonly [K, V]>
			>;
			_BUILDER: WithUpdateAt.BuilderApi<
				K,
				V,
				Collection.Advanced.Types<this['_FAM'], readonly [K, V]>
			>;

			_FAM: WithUpdateAt<K, V>;
			_NEW_FAMILY: WithUpdateAt<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithUpdateAt {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<K, V, Tp> {
				updateAt<UK = K>(
					key: RelatedTo<K, UK>,
					update: (value: V) => V,
				): Tp['_SELF'];

				updateAtAndReturn<UK = K>(
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
			> extends Advanced.BuilderApi<K, V, Tp> {
				updateAt<UK = K>(
					key: RelatedTo<K, UK>,
					update: (value: V) => V,
				): boolean;
			}
		}

		export interface WithModifyAt<K, V> extends Advanced.Family<K, V> {
			_NORMAL: WithModifyAt.Api<
				K,
				V,
				Collection.Advanced.Types<this['_FAM'], readonly [K, V]>
			>;
			_NON_EMPTY: WithModifyAt.Api<
				K,
				V,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], readonly [K, V]>
			>;
			_BUILDER: WithModifyAt.BuilderApi<
				K,
				V,
				Collection.Advanced.Types<this['_FAM'], readonly [K, V]>
			>;

			_FAM: WithModifyAt<K, V>;
			_NEW_FAMILY: WithModifyAt<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithModifyAt {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<K, V, Tp> {
				modifyAt(
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
			> extends Advanced.BuilderApi<K, V, Tp> {
				modifyAt(
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

	export interface WithRecompose<K, V> extends Advanced.Family<K, V> {
		_NORMAL: WithRecompose.Api<
			K,
			V,
			Collection.Advanced.Types<this['_FAM'], readonly [K, V]>
		>;
		_NON_EMPTY: WithRecompose.Api<
			K,
			V,
			Collection.Advanced.TypesNonEmpty<this['_FAM'], readonly [K, V]>
		>;

		_FAM: WithRecompose<K, V>;
		_NEW_FAMILY: WithRecompose<this['_NEW_K'], this['_NEW_V']>;
	}

	export namespace WithRecompose {
		export interface Api<K, V, Tp extends Collection.Advanced.TypesBase>
			extends Advanced.Api<K, V, Tp> {
			recompose<K2 extends K, V2>(
				f: (
					stream: Tp['_AS_STREAM'],
				) => StreamSource.NonEmpty<readonly [K2, V2]>,
			): Collection.Advanced.ReTyped<Tp, readonly [K2, V2]>['_SELF'];
			recompose<K2 extends K, V2>(
				f: (stream: Tp['_AS_STREAM']) => StreamSource<readonly [K2, V2]>,
			): Collection.Advanced.ReTyped<Tp, readonly [K2, V2]>['_NORMAL'];
		}
	}
}
