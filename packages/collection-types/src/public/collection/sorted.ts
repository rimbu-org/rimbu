import type { Collection } from '@rimbu/collection-types/collection';
import type { Comp, OptLazy, Range } from '@rimbu/common';
import type { Stream } from '@rimbu/stream';

export interface SortedCollection<
	S,
	E,
	Tp extends SortedCollection.Advanced.Types<
		S,
		E
	> = SortedCollection.Advanced.Types<S, E>,
> extends Collection<E, Tp> {
	readonly comp: Comp<S>;

	lowerBound(search: S): number;
	upperBound(search: S): number;

	next(
		search: S,
		options?:
			| { inclusive?: boolean | undefined; otherwise?: never }
			| undefined,
	): E | undefined;
	next<O>(
		search: S,
		options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
	): E | O;
	previous(
		search: S,
		options?:
			| { inclusive?: boolean | undefined; otherwise?: never }
			| undefined,
	): E | undefined;
	previous<O>(
		search: S,
		options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
	): E | O;

	streamRange(
		range: Range<S>,
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream<E>;
	sliceRange(range: Range<S>): SortedCollection<S, E>;
}

export declare namespace SortedCollection {
	export interface NonEmpty<
		S,
		E,
		Tp extends SortedCollection.Advanced.TypesNonEmpty<
			S,
			E
		> = SortedCollection.Advanced.TypesNonEmpty<S, E>,
	> extends SortedCollection<S, E, Tp>,
			Collection.NonEmpty<E, Tp> {}

	export interface Builder<
		S,
		E,
		Tp extends SortedCollection.Advanced.Types<
			S,
			E
		> = SortedCollection.Advanced.Types<S, E>,
	> extends Collection.Builder<E, Tp> {
		lowerBound(search: S): number;
		upperBound(search: S): number;

		next(
			search: S,
			options?:
				| { inclusive?: boolean | undefined; otherwise?: never }
				| undefined,
		): E | undefined;
		next<O>(
			search: S,
			options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
		): E | O;
		previous(
			search: S,
			options?:
				| { inclusive?: boolean | undefined; otherwise?: never }
				| undefined,
		): E | undefined;
		previous<O>(
			search: S,
			options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
		): E | O;
	}

	export namespace Advanced {
		export interface FamilyBase<S, E>
			extends Collection.Advanced.FamilyBase<E> {
			_NEW_S: unknown;
		}

		export interface Family<S, E>
			extends Collection.Advanced.Family<E>,
				SortedCollection.Advanced.FamilyBase<S, E> {
			_NORMAL: SortedCollection<S, E>;
			_NON_EMPTY: SortedCollection.NonEmpty<S, E>;
			_BUILDER: SortedCollection.Builder<S, E>;

			_NEW_FAMILY: SortedCollection.Advanced.Family<
				this['_NEW_S'],
				this['_NEW_E']
			>;
		}

		export interface NormalKind<S, E>
			extends Collection.Advanced.NormalKind<E>,
				SortedCollection.Advanced.FamilyBase<S, E> {
			_NEW_TYPES: this['_NEW_FAMILY'] &
				SortedCollection.Advanced.NormalKind<this['_NEW_S'], this['_NEW_E']>;
		}

		export interface NonEmptyKind<S, E>
			extends Collection.Advanced.NonEmptyKind<E>,
				SortedCollection.Advanced.FamilyBase<S, E> {
			_NEW_TYPES: this['_NEW_FAMILY'] &
				SortedCollection.Advanced.NonEmptyKind<this['_NEW_S'], this['_NEW_E']>;
		}

		export type Types<S, E> = SortedCollection.Advanced.Family<S, E> &
			SortedCollection.Advanced.NormalKind<S, E>;

		export type TypesNonEmpty<S, E> = SortedCollection.Advanced.Family<S, E> &
			SortedCollection.Advanced.NonEmptyKind<S, E>;
	}
}
