import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { SortedCollection } from '@rimbu/collection-types/collection/sorted';

export type SortedKeyed<
	K,
	V,
	F extends Collection.Advanced.FamilyBase<
		readonly [K, V]
	> = Collection.Advanced.Family<readonly [K, V]>,
> = SortedKeyed.Advanced.ExtendFamily<K, V, F>['_NORMAL'];

export namespace SortedKeyed {
	export type NonEmpty<
		K,
		V,
		F extends Collection.Advanced.FamilyBase<
			readonly [K, V]
		> = Collection.Advanced.Family<readonly [K, V]>,
	> = Advanced.ExtendFamily<K, V, F>['_NON_EMPTY'];

	export namespace Advanced {
		export type ExtendFamily<
			K,
			V,
			F extends Collection.Advanced.FamilyBase<
				readonly [K, V]
			> = Collection.Advanced.Family<readonly [K, V]>,
		> = F & Family<K, V>;

		export interface Api<K, V, Tp extends Collection.Advanced.TypesBase>
			extends SortedCollection.Advanced.Api<readonly [K, V], K, Tp>,
				KeyedCollection.Advanced.Api<K, V, Tp> {}

		export interface BuilderApi<K, V, Tp extends Collection.Advanced.TypesBase>
			extends SortedCollection.Advanced.BuilderApi<readonly [K, V], K, Tp>,
				KeyedCollection.Advanced.BuilderApi<K, V, Tp> {}

		export interface ContextApi<
			F extends SortedCollection.Advanced.Family<any, any> &
				KeyedCollection.Advanced.Family<any, any>,
		> extends KeyedCollection.Advanced.ContextApi<F> {}

		export interface Family<K, V>
			extends SortedCollection.Advanced.Family<readonly [K, V], K>,
				KeyedCollection.Advanced.Family<K, V> {
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

			_UPPER_E: readonly [K, V];
			_NEW_E: readonly [unknown, unknown];

			_FAM: Family<K, V>;
			_NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
		}
	}
}
