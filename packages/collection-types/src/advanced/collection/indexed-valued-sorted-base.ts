import type {
	IndexedValuedCollectionEmptyBase,
	IndexedValuedEmptyCapability,
} from '@rimbu/collection-types/advanced/collection/indexed-valued-base';
import type {
	SortedCollectionEmptyBase,
	SortedEmptyCapability,
} from '@rimbu/collection-types/advanced/collection/sorted-base';
import type {
	Constructor,
	EmptyCapability,
	EmptyConstructor,
} from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedValuedSortedCollection } from '@rimbu/collection-types/collection/indexed-valued-sorted';
import type { RelatedTo } from '@rimbu/common/types';

import { IndexedCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/collection/indexed-base';
import { OptLazy } from '@rimbu/common';

export interface IndexedValuedSortedCollectionEmptyBase<
	E,
	Tp extends Collection.Advanced.TypesBase,
> extends IndexedValuedSortedCollection.Advanced.Api<E, Tp>,
		IndexedValuedCollectionEmptyBase<E, Tp>,
		SortedCollectionEmptyBase<E, E, Tp> {}

export interface IndexedValuedSortedEmptyCapability extends EmptyCapability {
	_API: IndexedValuedSortedCollectionEmptyBase<this['_E'], this['_TP']>;
}

export function WithIndexedValuedSortedCollectionEmptyBase<
	C extends EmptyCapability &
		IndexedValuedEmptyCapability &
		SortedEmptyCapability,
>(
	Base: EmptyConstructor<C>,
): EmptyConstructor<C & IndexedValuedSortedEmptyCapability>;
export function WithIndexedValuedSortedCollectionEmptyBase<
	TBase extends Constructor<
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
): TBase & Constructor<IndexedValuedSortedCollectionEmptyBase<E, Tp>> {
	return class extends Base {
		indexOf<O>(_key: E, otherwise?: OptLazy<O>): O {
			return OptLazy(otherwise) as O;
		}
	};
}

export abstract class IndexedValuedSortedNonEmptyBase<
		E,
		FAM extends IndexedValuedSortedCollection.Advanced.Family<E>,
		Tp extends Collection.Advanced.TypesNonEmpty<
			FAM,
			E
		> = Collection.Advanced.TypesNonEmpty<FAM, E>,
	>
	extends IndexedCollectionNonEmptyBase<E, FAM, Tp>
	implements IndexedValuedSortedCollection.Advanced.Api<E, Tp>
{
	abstract has<UE = E>(value: RelatedTo<E, UE>): boolean;
	abstract indexOf<UE, O>(
		key: RelatedTo<E, UE>,
		otherwise?: OptLazy<O>,
	): number | O;
	abstract previous<US, O>(
		search: RelatedTo<E, US>,
		options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> },
	): E | O;
	abstract next<US, O>(
		search: RelatedTo<E, US>,
		options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> },
	): E | O;

	get min() {
		return this.first;
	}

	get max() {
		return this.last;
	}
}
