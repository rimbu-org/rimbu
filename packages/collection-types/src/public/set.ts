import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';

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
		// The package declares its family ONCE; both kinds are derived.
		export interface Family<T> extends ValuedCollection.Advanced.Family<T> {
			_NORMAL: SetCollection<T>;
			_NON_EMPTY: SetCollection.NonEmpty<T>;

			_NEW_FAMILY: SetCollection.Advanced.Family<this['_NEW_E']>;
		}

		export type Types<T> = SetCollection.Advanced.Family<T> &
			ValuedCollection.Advanced.NormalKind<T>;

		export type TypesNonEmpty<T> = SetCollection.Advanced.Family<T> &
			ValuedCollection.Advanced.NonEmptyKind<T>;
	}
}
