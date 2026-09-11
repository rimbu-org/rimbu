import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { OptLazy, RelatedTo } from '@rimbu/common';

export type IndexedKeyedCollection<
	K,
	V,
	F extends Collection.Advanced.FamilyBase<
		readonly [K, V]
	> = Collection.Advanced.Family<readonly [K, V]>,
> = IndexedKeyedCollection.Advanced.ExtendFamily<K, V, F>['_NORMAL'];

export declare namespace IndexedKeyedCollection {
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
			extends IndexedCollection.Advanced.Api<readonly [K, V], Tp>,
				KeyedCollection.Advanced.Api<K, V, Tp> {
			indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
			indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
		}

		export interface BuilderApi<K, V, Tp extends Collection.Advanced.TypesBase>
			extends IndexedCollection.Advanced.BuilderApi<readonly [K, V], Tp>,
				KeyedCollection.Advanced.BuilderApi<K, V, Tp> {
			indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
			indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
		}

		export interface ContextApi<
			F extends IndexedCollection.Advanced.Family<any> &
				KeyedCollection.Advanced.Family<any, any>,
		> extends IndexedCollection.Advanced.ContextApi<F>,
				KeyedCollection.Advanced.ContextApi<F> {}

		export interface Family<K, V>
			extends IndexedCollection.Advanced.Family<readonly [K, V]>,
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
