import type { ValuedCollection } from '@rimbu/collection-types/capabilities';

export interface SetCollection<T> extends ValuedCollection<T> {
	readonly context: {
		__types: SetCollection.Advanced.Types<T>;
	};
}

export namespace SetCollection {
	export interface NonEmpty<T>
		extends SetCollection<T>,
			ValuedCollection.NonEmpty<T> {
		readonly context: {
			__types: SetCollection.Advanced.TypesNonEmpty<T>;
		};
	}

	export interface Builder<T> extends ValuedCollection.Builder<T> {
		readonly context: {
			__types: SetCollection.Advanced.Types<T>;
		};
	}

	export namespace Advanced {
		export interface Types<T> extends ValuedCollection.Advanced.Types<T> {
			_NORMAL: SetCollection<T>;
			_NON_EMPTY: SetCollection.NonEmpty<T>;
			_NEW_TYPES: SetCollection.Advanced.Types<this['_NEW_E']>;
		}

		export interface TypesNonEmpty<T>
			extends ValuedCollection.Advanced.TypesNonEmpty<T> {
			_NORMAL: SetCollection<T>;
			_NON_EMPTY: SetCollection.NonEmpty<T>;
			_NEW_TYPES: SetCollection.Advanced.TypesNonEmpty<this['_NEW_E']>;
		}
	}
}
