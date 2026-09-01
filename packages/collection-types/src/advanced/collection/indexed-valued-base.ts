import type { IndexedCollectionEmptyBase } from '@rimbu/collection-types/advanced/collection/indexed-base';
import type { ValuedCollectionEmptyBase } from '@rimbu/collection-types/advanced/collection/valued-base';
import type { Constructor } from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedValuedCollection } from '@rimbu/collection-types/collection/indexed-valued';

import { OptLazy } from '@rimbu/common';

export interface IndexedValuedCollectionEmptyBase<
	E,
	Tp extends Collection.Advanced.TypesBase,
> extends IndexedValuedCollection.Advanced.Api<E, Tp>,
		IndexedCollectionEmptyBase<E, Tp>,
		ValuedCollectionEmptyBase<E, Tp> {}

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
