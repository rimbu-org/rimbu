import type { Collection } from '@rimbu/collection-types/collection';
import type { RelatedTo } from '@rimbu/common';

export interface ValuedCollection<
	T,
	Tp extends
		ValuedCollection.Advanced.Types<T> = ValuedCollection.Advanced.Types<T>,
> extends Collection<T, Tp> {
	has<UT = T>(value: RelatedTo<T, UT>): boolean;
}

export declare namespace ValuedCollection {
	export interface NonEmpty<
		T,
		Tp extends
			ValuedCollection.Advanced.TypesNonEmpty<T> = ValuedCollection.Advanced.TypesNonEmpty<T>,
	> extends ValuedCollection<T, Tp>,
			Collection.NonEmpty<T, Tp> {}

	export interface Builder<
		T,
		Tp extends
			ValuedCollection.Advanced.Types<T> = ValuedCollection.Advanced.Types<T>,
	> extends Collection.Builder<T, Tp> {
		has<UT = T>(value: RelatedTo<T, UT>): boolean;
	}

	export namespace Advanced {
		export interface Family<T> extends Collection.Advanced.Family<T> {
			_NORMAL: ValuedCollection<T>;
			_NON_EMPTY: ValuedCollection.NonEmpty<T>;
			_BUILDER: ValuedCollection.Builder<T>;

			_NEW_FAMILY: ValuedCollection.Advanced.Family<this['_NEW_E']>;
		}

		export interface NormalKind<T> extends Collection.Advanced.NormalKind<T> {
			_NEW_TYPES: this['_NEW_FAMILY'] &
				ValuedCollection.Advanced.NormalKind<this['_NEW_E']>;
		}

		export interface NonEmptyKind<T>
			extends Collection.Advanced.NonEmptyKind<T> {
			_NEW_TYPES: this['_NEW_FAMILY'] &
				ValuedCollection.Advanced.NonEmptyKind<this['_NEW_E']>;
		}

		export type Types<T> = ValuedCollection.Advanced.Family<T> &
			ValuedCollection.Advanced.NormalKind<T>;

		export type TypesNonEmpty<T> = ValuedCollection.Advanced.Family<T> &
			ValuedCollection.Advanced.NonEmptyKind<T>;
	}
}
