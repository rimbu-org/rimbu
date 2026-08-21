import type { OptLazy, RelatedTo } from '@rimbu/common';
import type { Stream } from '@rimbu/stream';
import type { Collection } from '../collection';

export type KeyedCollection<
	K,
	V,
	F extends Collection.Advanced.FamilyBase<
		readonly [K, V]
	> = Collection.Advanced.Family<readonly [K, V]>,
> = Collection.Advanced.Types<
	F & KeyedCollection.Advanced.Family<K, V>,
	readonly [K, V]
>['_NORMAL'];

export namespace KeyedCollection {
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
			extends Collection.Advanced.Api<readonly [K, V], Tp> {
			streamKeys(): Tp['_IS_NON_EMPTY'] extends true
				? Stream.NonEmpty<K>
				: Stream<K>;
			streamValues(): Tp['_IS_NON_EMPTY'] extends true
				? Stream.NonEmpty<V>
				: Stream<V>;

			get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
			get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;

			has<UK = K>(key: RelatedTo<K, UK>): boolean;
		}

		export interface BuilderApi<K, V, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.BuilderApi<readonly [K, V], Tp> {
			get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
			get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;

			has<UK = K>(key: RelatedTo<K, UK>): boolean;
		}

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends Collection.Advanced.ContextApi<F> {}

		export interface Family<K, V>
			extends Collection.Advanced.Family<readonly [K, V]> {
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

			_NEW_K: unknown;
			_NEW_V: unknown;
			_NEW_E: readonly [this['_NEW_K'], this['_NEW_V']];

			_FAM: Family<K, V>;
			_NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
		}
	}
}
