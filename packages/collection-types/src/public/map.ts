import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';

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
}
