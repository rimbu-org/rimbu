import type {
	CollectionEmptyBase,
	Constructor,
	EmptyCapability,
	EmptyConstructor,
} from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { SortedCollection } from '@rimbu/collection-types/collection/sorted';

import { OptLazy } from '@rimbu/common';

// export class SortedCollectionEmptyBase<
// 		E,
// 		FAM extends SortedCollection.Advanced.Family<E, E>,
// 		Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
// 			FAM,
// 			E
// 		>,
// 	>
// 	extends CollectionEmptyBase<E, FAM, Tp>
// 	implements SortedCollection.Advanced.Api<E, E, Tp>
// {
// 	min<O>(otherwise?: OptLazy<O>): O {
// 		return OptLazy(otherwise) as O;
// 	}

// 	max<O>(otherwise?: OptLazy<O>): O {
// 		return OptLazy(otherwise) as O;
// 	}
// 	previous<O>(otherwise?: OptLazy<O>): O {
// 		return OptLazy(otherwise) as O;
// 	}
// 	next<O>(otherwise?: OptLazy<O>): O {
// 		return OptLazy(otherwise) as O;
// 	}
// }

export interface SortedCollectionEmptyBase<
	E,
	S,
	Tp extends Collection.Advanced.TypesBase,
> extends SortedCollection.Advanced.Api<E, S, Tp> {}

/**
 * The capability contributed by {@link WithSortedCollectionEmptyBase}.
 */
export interface SortedEmptyCap extends EmptyCapability {
	_API: SortedCollectionEmptyBase<this['_E'], this['_E'], this['_TP']>;
}

/**
 * Adds the sorted-collection API to an empty collection base constructor.
 */
export function WithSortedCollectionEmptyBase<C extends EmptyCapability>(
	Base: EmptyConstructor<C>,
): EmptyConstructor<C & SortedEmptyCap>;
export function WithSortedCollectionEmptyBase<
	TBase extends Constructor<CollectionEmptyBase<E, FAM, Tp>>,
	E,
	FAM extends Collection.Advanced.Family<E> = Collection.Advanced.Family<E>,
	Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
		FAM,
		E
	>,
>(Base: TBase): TBase & Constructor<SortedCollectionEmptyBase<E, E, Tp>> {
	return class extends Base {
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
	};
}
