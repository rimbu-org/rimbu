import type {
	IndexedCollectionEmpty,
	IndexedCollectionNonEmpty,
} from '@rimbu/collection-types/advanced/collection/indexed-base';
import type {
	SortedApiMixin,
	SortedCollectionEmpty,
} from '@rimbu/collection-types/advanced/collection/sorted-base';
import type {
	AbstractConstructor,
	ApiMixin,
} from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { IndexedSortedCollection } from '@rimbu/collection-types/collection/indexed-sorted';
import type { SortedCollection } from '@rimbu/collection-types/collection/sorted';

import { OptLazy } from '@rimbu/common';

export namespace IndexedSortedCollectionEmpty {
	export interface Base<E, S, Tp extends Collection.Advanced.TypesBase>
		extends IndexedSortedCollection.Advanced.Api<E, S, Tp>,
			IndexedCollectionEmpty.Base<E, Tp>,
			SortedCollectionEmpty.Base<E, S, Tp> {}

	export interface IndexedSortedEmptyMixin extends SortedApiMixin {
		_API: Base<this['_E'], this['_S'], this['_TP']>;
	}

	export function WithMixin<C extends ApiMixin>(
		Base: ApiMixin.AbstractEmptyConstructor<C>,
	): SortedApiMixin.AbstractEmptyConstructor<C & IndexedSortedEmptyMixin>;
	export function WithMixin<
		TBase extends AbstractConstructor<
			IndexedCollectionEmpty.Base<E, Tp> & SortedCollectionEmpty.Base<E, S, Tp>
		>,
		E,
		S,
		FAM extends
			Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
		Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
			FAM,
			E
		>,
	>(Base: TBase): TBase & AbstractConstructor<Base<E, S, Tp>> {
		abstract class Result extends Base {
			indexOf<O>(_: E, otherwise?: OptLazy<O>): O {
				return OptLazy(otherwise) as O;
			}

			lowerBound(): 0 {
				return 0;
			}

			upperBound(): 0 {
				return 0;
			}

			get min() {
				return this.first;
			}

			get max() {
				return this.last;
			}
		}

		return Result;
	}
}

export namespace IndexedSortedCollectionNonEmpty {
	/**
	 * The part of the indexed-sorted collection non-empty API that
	 * {@link WithMixin} implements itself.
	 *
	 * `IndexedSortedCollection.Advanced.Api` is deliberately *not* inherited even
	 * though it is the natural supertype: it declares `previous`, `next`,
	 * `indexOf`, `lowerBound` and `upperBound`, which this mixin requires rather
	 * than provides.
	 */
	export interface Implemented<
		E,
		S,
		Tp extends Collection.Advanced.TypesNonEmpty<
			Collection.Advanced.Family<E>,
			E
		>,
	> extends SortedCollection.Capability.WithMinMax.Api<E, Tp> {}

	/**
	 * The members that {@link WithMixin} leaves abstract, and that an extending
	 * class must therefore implement.
	 *
	 * A requirement must be declared abstract *exactly once* across the exposed
	 * composition. TypeScript drops the obligation when the same member is
	 * declared abstract by two different constituents of an intersection, so this
	 * class states only the requirements this mixin *introduces*. The seed
	 * ({@link CollectionNonEmpty.Base}) owns `context`, `size`, `stream`,
	 * `forEach`, `filter` and `toArray`.
	 */
	declare abstract class RequiredClass<
		E,
		S,
		Tp extends Collection.Advanced.TypesNonEmpty<
			Collection.Advanced.Family<E>,
			E
		>,
	> implements
			SortedCollection.Capability.WithNeighbor.Api<E, S, Tp>,
			IndexedSortedCollection.Capability.WithIndexOf.Api<E, S, Tp>,
			IndexedSortedCollection.Capability.WithBounds.Api<E, S, Tp>
	{
		abstract previous<O>(
			search: S,
			options?:
				| { inclusive?: boolean | undefined; otherwise?: OptLazy<O> }
				| undefined,
		): E | O;
		abstract next<O>(
			search: S,
			options?:
				| { inclusive?: boolean | undefined; otherwise?: OptLazy<O> }
				| undefined,
		): E | O;
		abstract indexOf(search: S): number;
		abstract lowerBound(search: S): number;
		abstract upperBound(search: S): number;
	}

	export type Required<
		E,
		S,
		Tp extends Collection.Advanced.TypesNonEmpty<
			Collection.Advanced.Family<E>,
			E
		>,
	> = RequiredClass<E, S, Tp>;

	export interface ApiBase<
		E,
		S,
		Tp extends Collection.Advanced.TypesNonEmpty<
			Collection.Advanced.Family<E>,
			E
		>,
	> extends Implemented<E, S, Tp>,
			RequiredClass<E, S, Tp> {}

	export interface Mixin extends SortedApiMixin {
		_API: ApiBase<this['_E'], this['_S'], this['_TP']>;

		_TP: Collection.Advanced.TypesNonEmpty<
			Collection.Advanced.Family<this['_E']>,
			this['_E']
		>;
	}

	export function WithMixin<C extends ApiMixin>(
		Base: ApiMixin.AbstractNonEmptyConstructor<C>,
	): SortedApiMixin.AbstractNonEmptyConstructor<C & Mixin>;
	export function WithMixin<
		TBase extends AbstractConstructor<
			IndexedCollection.Advanced.Api<E, Tp> &
				IndexedCollectionNonEmpty.ApiBase<E, Tp>
		>,
		E,
		S,
		Tp extends Collection.Advanced.TypesNonEmpty<
			IndexedSortedCollection.Advanced.Family<E, S>,
			E
		> = Collection.Advanced.TypesNonEmpty<
			IndexedSortedCollection.Advanced.Family<E, S>,
			E
		>,
	>(Base: TBase): TBase & AbstractConstructor<ApiBase<E, S, Tp>> {
		// the members below are declared abstract here only so that this mixin can
		// use them; the type that extenders see is derived from RequiredClass,
		// which is what makes them a visible obligation
		abstract class Result extends Base implements ApiBase<E, S, Tp> {
			abstract previous<O>(
				search: S,
				options?:
					| { inclusive?: boolean | undefined; otherwise?: OptLazy<O> }
					| undefined,
			): E | O;
			abstract next<O>(
				search: S,
				options?:
					| { inclusive?: boolean | undefined; otherwise?: OptLazy<O> }
					| undefined,
			): E | O;
			abstract indexOf(search: S): number;
			abstract lowerBound(search: S): number;
			abstract upperBound(search: S): number;

			get min() {
				return this.first;
			}

			get max() {
				return this.last;
			}
		}

		return Result;
	}
}
