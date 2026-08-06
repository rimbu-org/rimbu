import type {
	Collection,
	ValuedCollection,
} from '@rimbu/collection-types/capabilities';
import type { TypesKey } from '@rimbu/collection-types/types';

export interface SetCollection<T> extends ValuedCollection<T> {
	readonly [TypesKey]: SetCollection.Advanced.Types<T>;
	readonly context: Collection.Advanced.ContextBase<
		SetCollection.Advanced.Types<T>
	>;
}

export namespace SetCollection {
	export interface NonEmpty<T>
		extends SetCollection<T>,
			ValuedCollection.NonEmpty<T> {
		readonly [TypesKey]: SetCollection.Advanced.TypesNonEmpty<T>;
		readonly context: Collection.Advanced.ContextBase<
			SetCollection.Advanced.TypesNonEmpty<T>
		>;
	}

	export interface Builder<T> extends ValuedCollection.Builder<T> {
		readonly [TypesKey]: SetCollection.Advanced.Types<T>;
		readonly context: Collection.Advanced.ContextBase<
			SetCollection.Advanced.Types<T>
		>;
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
