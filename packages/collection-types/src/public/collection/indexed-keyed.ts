import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { OptLazy, RelatedTo } from '@rimbu/common';
import type { Stream } from '@rimbu/stream';

export interface IndexedKeyedCollection<
	K,
	V,
	Tp extends IndexedKeyedCollection.Advanced.Types<
		K,
		V
	> = IndexedKeyedCollection.Advanced.Types<K, V>,
> extends IndexedCollection<readonly [K, V], Tp>,
		KeyedCollection<K, V, Tp> {
	indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
	indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
}

export declare namespace IndexedKeyedCollection {
	export interface NonEmpty<
		K,
		V,
		Tp extends IndexedKeyedCollection.Advanced.TypesNonEmpty<
			K,
			V
		> = IndexedKeyedCollection.Advanced.TypesNonEmpty<K, V>,
	> extends IndexedKeyedCollection<K, V, Tp>,
			IndexedCollection.NonEmpty<readonly [K, V], Tp>,
			KeyedCollection.NonEmpty<K, V, Tp> {
		indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
		indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
	}

	export interface Builder<
		K,
		V,
		Tp extends IndexedKeyedCollection.Advanced.Types<
			K,
			V
		> = IndexedKeyedCollection.Advanced.Types<K, V>,
	> extends IndexedCollection.Builder<readonly [K, V], Tp>,
			KeyedCollection.Builder<K, V, Tp> {
		indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
		indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
	}

	export namespace Advanced {
		export interface Family<K, V>
			extends IndexedCollection.Advanced.Family<readonly [K, V]>,
				KeyedCollection.Advanced.Family<K, V> {
			_NORMAL: IndexedKeyedCollection<K, V>;
			_NON_EMPTY: IndexedKeyedCollection.NonEmpty<K, V>;
			_BUILDER: IndexedKeyedCollection.Builder<K, V>;

			_NEW_FAMILY: IndexedKeyedCollection.Advanced.Family<
				this['_NEW_K'],
				this['_NEW_V']
			>;
		}

		export interface NormalVariant<K, V>
			extends IndexedCollection.Advanced.NormalVariant<readonly [K, V]>,
				KeyedCollection.Advanced.NormalVariant<K, V> {
			_stream: IndexedCollection.Advanced.NormalVariant<
				readonly [K, V]
			>['_stream'];

			_streamKeys: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream<K>;
			_streamValues: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream<V>;

			_NEW_TYPES: this['_NEW_FAMILY'] &
				IndexedKeyedCollection.Advanced.NormalVariant<
					this['_NEW_K'],
					this['_NEW_V']
				>;
		}

		export interface NonEmptyVariant<K, V>
			extends IndexedCollection.Advanced.NonEmptyVariant<readonly [K, V]>,
				KeyedCollection.Advanced.NonEmptyVariant<K, V> {
			_stream: IndexedCollection.Advanced.NonEmptyVariant<
				readonly [K, V]
			>['_stream'];

			_streamKeys: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream.NonEmpty<K>;
			_streamValues: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream.NonEmpty<V>;

			_NEW_TYPES: this['_NEW_FAMILY'] &
				IndexedKeyedCollection.Advanced.NonEmptyVariant<
					this['_NEW_K'],
					this['_NEW_V']
				>;
		}

		export type Types<K, V> = IndexedKeyedCollection.Advanced.Family<K, V> &
			IndexedKeyedCollection.Advanced.NormalVariant<K, V>;

		export type TypesNonEmpty<K, V> = IndexedKeyedCollection.Advanced.Family<
			K,
			V
		> &
			IndexedKeyedCollection.Advanced.NonEmptyVariant<K, V>;
	}
}
