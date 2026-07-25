import type { ValuedCollection } from '@rimbu/collection-types/capabilities';

export interface SetCollection<T> extends ValuedCollection<T> {
	readonly context: {
		__types: SetCollection.Types<T>;
	};
}

export namespace SetCollection {
	export interface NonEmpty<T> extends ValuedCollection<T> {
		readonly context: {
			__types: SetCollection.Types.NonEmpty<T>;
		};
	}

	export interface Builder<T> extends ValuedCollection.Builder<T> {
		readonly context: {
			__types: SetCollection.Types<T>;
		};
	}

	export interface Types<T> extends ValuedCollection.Types<T> {
		_NORMAL: SetCollection<T>;
		_NON_EMPTY: SetCollection.NonEmpty<T>;
		_NEW_TYPES: SetCollection.Types<this['_NEW_E']>;
	}

	export namespace Types {
		export interface NonEmpty<T> extends ValuedCollection.Types.NonEmpty<T> {
			_NORMAL: SetCollection<T>;
			_NON_EMPTY: SetCollection.NonEmpty<T>;
			_NEW_TYPES: SetCollection.Types.NonEmpty<this['_NEW_E']>;
		}
	}
}
