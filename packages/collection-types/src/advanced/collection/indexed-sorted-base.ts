import type {
	IndexedCollectionEmptyBase,
	IndexedCollectionNonEmptyBase,
} from '@rimbu/collection-types/advanced/collection/indexed-base';
import type {
	SortedApiMixin,
	SortedCollectionEmptyBase,
} from '@rimbu/collection-types/advanced/collection/sorted-base';
import type {
	AbstractConstructor,
	ApiMixin,
} from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedSortedCollection } from '@rimbu/collection-types/collection/indexed-sorted';

import { OptLazy } from '@rimbu/common';

export interface IndexedSortedCollectionEmptyBase<
	E,
	S,
	Tp extends Collection.Advanced.TypesBase,
> extends IndexedSortedCollection.Advanced.Api<E, S, Tp>,
		IndexedCollectionEmptyBase<E, Tp>,
		SortedCollectionEmptyBase<E, S, Tp> {}

export interface IndexedSortedEmptyMixin extends SortedApiMixin {
	_API: IndexedSortedCollectionEmptyBase<this['_E'], this['_S'], this['_TP']>;
}

export function WithIndexedSortedCollectionEmptyBase<C extends ApiMixin>(
	Base: ApiMixin.AbstractEmptyConstructor<C>,
): SortedApiMixin.AbstractEmptyConstructor<C & IndexedSortedEmptyMixin>;
export function WithIndexedSortedCollectionEmptyBase<
	TBase extends AbstractConstructor<
		IndexedCollectionEmptyBase<E, Tp> & SortedCollectionEmptyBase<E, S, Tp>
	>,
	E,
	S,
	FAM extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
		FAM,
		E
	>,
>(
	Base: TBase,
): TBase & AbstractConstructor<IndexedSortedCollectionEmptyBase<E, S, Tp>> {
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

export interface IndexedSortedCollectionNonEmptyBase<
	E,
	S,
	Tp extends Collection.Advanced.TypesNonEmpty<
		Collection.Advanced.Family<E>,
		E
	>,
> extends IndexedSortedCollection.Advanced.Api<E, S, Tp> {}

export interface IndexedSortedNonEmptyMixin extends SortedApiMixin {
	_API: IndexedSortedCollectionNonEmptyBase<
		this['_E'],
		this['_S'],
		this['_TP']
	>;

	_TP: Collection.Advanced.TypesNonEmpty<
		Collection.Advanced.Family<this['_E']>,
		this['_E']
	>;
}

export function WithIndexedSortedCollectionNonEmptyBase<C extends ApiMixin>(
	Base: ApiMixin.AbstractNonEmptyConstructor<C>,
): SortedApiMixin.AbstractNonEmptyConstructor<C & IndexedSortedNonEmptyMixin>;
export function WithIndexedSortedCollectionNonEmptyBase<
	TBase extends AbstractConstructor<IndexedCollectionNonEmptyBase<E, Tp>>,
	E,
	S,
	Tp extends Collection.Advanced.TypesNonEmpty<
		IndexedSortedCollection.Advanced.Family<E, S>,
		E
	> = Collection.Advanced.TypesNonEmpty<
		IndexedSortedCollection.Advanced.Family<E, S>,
		E
	>,
>(
	Base: TBase,
): TBase & AbstractConstructor<IndexedSortedCollectionNonEmptyBase<E, S, Tp>> {
	abstract class Result extends Base {
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
