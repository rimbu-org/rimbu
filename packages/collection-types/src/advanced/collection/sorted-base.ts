import type {
	AbstractConstructor,
	ApiMixin,
	CollectionEmptyBase,
} from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { SortedCollection } from '@rimbu/collection-types/collection/sorted';

import { OptLazy } from '@rimbu/common';

export interface SortedCollectionEmptyBase<
	E,
	S,
	Tp extends Collection.Advanced.TypesBase,
> extends SortedCollection.Advanced.Api<E, S, Tp> {}

export interface SortedEmptyMixin extends ApiMixin {
	_S: unknown;
	_API: SortedCollectionEmptyBase<this['_E'], this['_S'], this['_TP']>;
}

/**
 * Adds the sorted-collection API to an empty collection base constructor.
 */
export function WithSortedCollectionEmptyBase<C extends ApiMixin>(
	Base: ApiMixin.AbstractEmptyConstructor<C>,
): ApiMixin.AbstractEmptyConstructor<C & SortedEmptyMixin>;
export function WithSortedCollectionEmptyBase<
	TBase extends AbstractConstructor<CollectionEmptyBase<E, Tp>>,
	E,
	S,
	FAM extends Collection.Advanced.Family<E> = Collection.Advanced.Family<E>,
	Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
		FAM,
		E
	>,
>(
	Base: TBase,
): TBase & AbstractConstructor<SortedCollectionEmptyBase<E, S, Tp>> {
	abstract class Result extends Base {
		min<O>(otherwise?: OptLazy<O>): O {
			return OptLazy(otherwise) as O;
		}

		max<O>(otherwise?: OptLazy<O>): O {
			return OptLazy(otherwise) as O;
		}
		previous<O>(otherwise?: OptLazy<O>): O {
			return OptLazy(otherwise) as O;
		}
		next<O>(otherwise?: OptLazy<O>): O {
			return OptLazy(otherwise) as O;
		}
	}

	return Result;
}
