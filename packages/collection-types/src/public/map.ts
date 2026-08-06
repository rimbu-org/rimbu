import type { KeyedCollection } from '@rimbu/collection-types/capabilities';

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
		export interface Types<K, V> extends KeyedCollection.Advanced.Types<K, V> {
			_NORMAL: MapCollection<K, V>;
			_NON_EMPTY: MapCollection.NonEmpty<K, V>;
			_NEW_TYPES: MapCollection.Advanced.Types<this['_NEW_K'], this['_NEW_V']>;
		}

		export interface TypesNonEmpty<K, V>
			extends KeyedCollection.Advanced.TypesNonEmpty<K, V> {
			_NORMAL: MapCollection<K, V>;
			_NON_EMPTY: MapCollection.NonEmpty<K, V>;
			_NEW_TYPES: MapCollection.Advanced.TypesNonEmpty<
				this['_NEW_K'],
				this['_NEW_V']
			>;
		}
	}
}
