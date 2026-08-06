import type { Collection } from '@rimbu/collection-types/collection';
import type { TypesKey } from '@rimbu/collection-types/types';
import type { OptLazy, RelatedTo } from '@rimbu/common';
import type { Stream } from '@rimbu/stream';

export interface KeyedCollection<
	K,
	V,
	Tp extends KeyedCollection.Advanced.Types<
		K,
		V
	> = KeyedCollection.Advanced.Types<K, V>,
> extends Collection<readonly [K, V], Tp> {
	get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
	get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
	has<UK = K>(key: RelatedTo<K, UK>): boolean;

	streamKeys: this[TypesKey]['_streamKeys'];
	streamValues: this[TypesKey]['_streamValues'];
}

export declare namespace KeyedCollection {
	export interface NonEmpty<
		K,
		V,
		Tp extends KeyedCollection.Advanced.TypesNonEmpty<
			K,
			V
		> = KeyedCollection.Advanced.TypesNonEmpty<K, V>,
	> extends KeyedCollection<K, V, Tp>,
			Collection.NonEmpty<readonly [K, V], Tp> {}

	export interface Builder<
		K,
		V,
		Tp extends KeyedCollection.Advanced.Types<
			K,
			V
		> = KeyedCollection.Advanced.Types<K, V>,
	> extends Collection.Builder<readonly [K, V], Tp> {
		get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
		get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
		has<UK = K>(key: RelatedTo<K, UK>): boolean;
	}

	export namespace Advanced {
		export interface FamilyBase<K, V>
			extends Collection.Advanced.FamilyBase<readonly [K, V]> {
			_NEW_K: unknown;
			_NEW_V: unknown;
		}

		export interface Family<K, V>
			extends Collection.Advanced.Family<readonly [K, V]>,
				KeyedCollection.Advanced.FamilyBase<K, V> {
			_NORMAL: KeyedCollection<K, V>;
			_NON_EMPTY: KeyedCollection.NonEmpty<K, V>;
			_BUILDER: KeyedCollection.Builder<K, V>;

			_NEW_FAMILY: KeyedCollection.Advanced.Family<
				this['_NEW_K'],
				this['_NEW_V']
			>;
		}

		export interface NormalVariant<K, V>
			extends Collection.Advanced.NormalVariant<readonly [K, V]>,
				KeyedCollection.Advanced.FamilyBase<K, V> {
			_streamKeys: () => Stream<K>;
			_streamValues: () => Stream<V>;

			_NEW_TYPES: this['_NEW_FAMILY'] &
				KeyedCollection.Advanced.NormalVariant<this['_NEW_K'], this['_NEW_V']>;
		}

		export interface NonEmptyVariant<K, V>
			extends Collection.Advanced.NonEmptyVariant<readonly [K, V]>,
				KeyedCollection.Advanced.FamilyBase<K, V> {
			_streamKeys: () => Stream.NonEmpty<K>;
			_streamValues: () => Stream.NonEmpty<V>;

			_NEW_TYPES: this['_NEW_FAMILY'] &
				KeyedCollection.Advanced.NonEmptyVariant<
					this['_NEW_K'],
					this['_NEW_V']
				>;
		}

		export type Types<K, V> = KeyedCollection.Advanced.Family<K, V> &
			KeyedCollection.Advanced.NormalVariant<K, V>;

		export type TypesNonEmpty<K, V> = KeyedCollection.Advanced.Family<K, V> &
			KeyedCollection.Advanced.NonEmptyVariant<K, V>;
	}

	export namespace Capability {
		export interface WithMapValues<K, V> extends KeyedCollection<K, V> {
			mapValues<V2>(
				f: (value: V, key: K, index: number) => V2,
			): (this[TypesKey] & { _NEW_V: V2 })['_NEW_TYPES']['_SELF'];
		}
	}
}
