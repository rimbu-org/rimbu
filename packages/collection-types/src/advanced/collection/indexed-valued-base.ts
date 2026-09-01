import type {
	IndexedCollectionEmptyBase,
	IndexedEmptyCap,
} from '@rimbu/collection-types/advanced/collection/indexed-base';
import type {
	ValuedCollectionEmptyBase,
	ValuedEmptyCap,
} from '@rimbu/collection-types/advanced/collection/valued-base';
import type {
	Constructor,
	EmptyCapability,
	EmptyConstructor,
} from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedValuedCollection } from '@rimbu/collection-types/collection/indexed-valued';

import { OptLazy } from '@rimbu/common';

export interface IndexedValuedCollectionEmptyBase<
	E,
	Tp extends Collection.Advanced.TypesBase,
> extends IndexedValuedCollection.Advanced.Api<E, Tp>,
		IndexedCollectionEmptyBase<E, Tp>,
		ValuedCollectionEmptyBase<E, Tp> {}

/**
 * The capability contributed by {@link WithIndexedValuedCollectionEmptyBase}.
 */
export interface IndexedValuedEmptyCap extends EmptyCapability {
	_API: IndexedValuedCollectionEmptyBase<this['_E'], this['_TP']>;
}

/**
 * Adds the indexed-valued-collection API to an empty collection base
 * constructor. The base must already carry the indexed and valued
 * capabilities, since this capability's API surface extends both.
 */
export function WithIndexedValuedCollectionEmptyBase<
	C extends EmptyCapability & IndexedEmptyCap & ValuedEmptyCap,
>(Base: EmptyConstructor<C>): EmptyConstructor<C & IndexedValuedEmptyCap>;
export function WithIndexedValuedCollectionEmptyBase<
	TBase extends Constructor<
		IndexedCollectionEmptyBase<E, Tp> & ValuedCollectionEmptyBase<E, Tp>
	>,
	E,
	FAM extends Collection.Advanced.Family<E> = Collection.Advanced.Family<E>,
	Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
		FAM,
		E
	>,
>(Base: TBase): TBase & Constructor<IndexedValuedCollectionEmptyBase<E, Tp>> {
	return class extends Base {
		indexOf<O>(_: E, otherwise?: OptLazy<O>): O {
			return OptLazy(otherwise) as O;
		}
	};
}
