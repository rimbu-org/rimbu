import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';

export interface MapCollection<
	K,
	V,
	Tp extends MapCollection.Advanced.Types<K, V> = MapCollection.Advanced.Types<
		K,
		V
	>,
> extends KeyedCollection<K, V, Tp> {}

export declare namespace MapCollection {
	export interface NonEmpty<
		K,
		V,
		Tp extends MapCollection.Advanced.TypesNonEmpty<
			K,
			V
		> = MapCollection.Advanced.TypesNonEmpty<K, V>,
	> extends MapCollection<K, V, Tp>,
			KeyedCollection.NonEmpty<K, V, Tp> {}

	export interface Builder<
		K,
		V,
		Tp extends MapCollection.Advanced.Types<
			K,
			V
		> = MapCollection.Advanced.Types<K, V>,
	> extends KeyedCollection.Builder<K, V, Tp> {}

	export namespace Advanced {
		// The package declares its family ONCE; both variants are derived.
		export interface Family<K, V>
			extends KeyedCollection.Advanced.Family<K, V> {
			_NORMAL: MapCollection<K, V>;
			_NON_EMPTY: MapCollection.NonEmpty<K, V>;

			_NEW_FAMILY: MapCollection.Advanced.Family<
				this['_NEW_K'],
				this['_NEW_V']
			>;
		}

		export type Types<K, V> = MapCollection.Advanced.Family<K, V> &
			KeyedCollection.Advanced.NormalKind<K, V>;

		export type TypesNonEmpty<K, V> = MapCollection.Advanced.Family<K, V> &
			KeyedCollection.Advanced.NonEmptyKind<K, V>;
	}
}
