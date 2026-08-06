import type { ValuedCollection } from '@rimbu/collection-types/capabilities';

export interface SetCollection<
	T,
	Tp extends SetCollection.Advanced.Types<T> = SetCollection.Advanced.Types<T>,
> extends ValuedCollection<T, Tp> {}

export namespace SetCollection {
	export interface NonEmpty<
		T,
		Tp extends
			SetCollection.Advanced.TypesNonEmpty<T> = SetCollection.Advanced.TypesNonEmpty<T>,
	> extends SetCollection<T, Tp>,
			ValuedCollection.NonEmpty<T, Tp> {}

	export interface Builder<
		T,
		Tp extends
			SetCollection.Advanced.Types<T> = SetCollection.Advanced.Types<T>,
	> extends ValuedCollection.Builder<T, Tp> {}

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
