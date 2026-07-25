import type { KeyedCollection } from '@rimbu/collection-types/capabilities';

export interface MapCollection<K, V> extends KeyedCollection<K, V> {
	readonly context: {
		__types: MapCollection.Types<K, V>;
	};
}

export namespace MapCollection {
	export interface NonEmpty<K, V> extends MapCollection<K, V> {
		readonly context: {
			__types: MapCollection.Types.NonEmpty<K, V>;
		};
	}

	export interface Builder<K, V> extends KeyedCollection.Builder<K, V> {
		readonly context: {
			__types: MapCollection.Types<K, V>;
		};
	}

	export interface Types<K, V> extends KeyedCollection.Types<K, V> {
		_NORMAL: MapCollection<K, V>;
		_NON_EMPTY: MapCollection.NonEmpty<K, V>;
		_NEW_TYPES: MapCollection.Types<this['_NEW_K'], this['_NEW_V']>;
	}

	export namespace Types {
		export interface NonEmpty<K, V>
			extends KeyedCollection.Types.NonEmpty<K, V> {
			_NORMAL: MapCollection<K, V>;
			_NON_EMPTY: MapCollection.NonEmpty<K, V>;
			_NEW_TYPES: MapCollection.Types.NonEmpty<this['_NEW_K'], this['_NEW_V']>;
		}
	}
}
