import type { IndexedCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/collection/indexed-base';
import type { IndexedValuedCollectionEmptyBase } from '@rimbu/collection-types/advanced/collection/indexed-valued-base';
import type { SortedCollectionEmptyBase } from '@rimbu/collection-types/advanced/collection/sorted-base';
import type {
	AbstractConstructor,
	ApiMixin,
} from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedValuedCollection } from '@rimbu/collection-types/collection/indexed-valued';
import type { IndexedValuedSortedCollection } from '@rimbu/collection-types/collection/indexed-valued-sorted';
import type { SortedCollection } from '@rimbu/collection-types/collection/sorted';

import { OptLazy } from '@rimbu/common';

export interface IndexedValuedSortedCollectionEmptyBase<
	E,
	Tp extends Collection.Advanced.TypesBase,
> extends IndexedValuedSortedCollection.Advanced.Api<E, Tp>,
		IndexedValuedCollectionEmptyBase<E, Tp>,
		SortedCollectionEmptyBase<E, E, Tp> {}

export interface IndexedValuedSortedEmptyMixin extends ApiMixin {
	_S: this['_E'];
	_API: IndexedValuedSortedCollectionEmptyBase<this['_E'], this['_TP']>;
}

export function WithIndexedValuedSortedCollectionEmptyBase<
	TBase extends AbstractConstructor<
		IndexedValuedCollectionEmptyBase<E, Tp> &
			SortedCollectionEmptyBase<E, E, Tp>
	>,
	E,
	FAM extends Collection.Advanced.Family<E> = Collection.Advanced.Family<E>,
	Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
		FAM,
		E
	>,
>(
	Base: TBase,
): TBase & AbstractConstructor<IndexedValuedSortedCollectionEmptyBase<E, Tp>> {
	abstract class Result extends Base {
		indexOf<O>(_key: E, otherwise?: OptLazy<O>): O {
			return OptLazy(otherwise) as O;
		}
	}

	return Result;
}

export interface IndexedValuedSortedNonEmptyBase<
	E,
	Tp extends Collection.Advanced.TypesNonEmpty<
		IndexedValuedSortedCollection.Advanced.Family<E>,
		E
	> = Collection.Advanced.TypesNonEmpty<
		IndexedValuedSortedCollection.Advanced.Family<E>,
		E
	>,
> extends IndexedValuedSortedCollection.Advanced.Api<E, Tp>,
		IndexedCollectionNonEmptyBase<E, Tp> {}

export interface IndexedValuedSortedNonEmptyMixin extends ApiMixin {
	_API: IndexedValuedSortedNonEmptyBase<this['_E'], this['_TP']>;

	_TP: Collection.Advanced.TypesNonEmpty<
		IndexedValuedSortedCollection.Advanced.Family<this['_E']>,
		this['_E']
	>;
}

export function WithIndexedValuedSortedNonEmptyBase<
	TBase extends AbstractConstructor<IndexedCollectionNonEmptyBase<E, Tp>>,
	E,
	FAM extends IndexedValuedCollection.Advanced.Family<E> &
		SortedCollection.Advanced.Family<E, E>,
	Tp extends Collection.Advanced.TypesNonEmpty<
		FAM,
		E
	> = Collection.Advanced.TypesNonEmpty<FAM, E>,
>(
	Base: TBase,
): TBase & AbstractConstructor<IndexedValuedSortedNonEmptyBase<E, Tp>> {
	abstract class Result extends Base {
		abstract has<UE>(value: UE): boolean;
		abstract indexOf<UE, O>(key: UE, otherwise?: OptLazy<O>): number | O;
		abstract previous<US, O>(
			search: US,
			options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> },
		): E | O;
		abstract next<US, O>(
			search: US,
			options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> },
		): E | O;
		get min() {
			return this.first;
		}
		get max() {
			return this.last;
		}
	}

	return Result;
}
