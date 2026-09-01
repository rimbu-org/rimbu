import type { HashSet } from '@rimbu/hashed/set';

import { WithIndexedCollectionEmptyBase } from '@rimbu/collection-types/advanced/collection/indexed-base';
import { WithValuedCollectionEmptyBase } from '@rimbu/collection-types/advanced/collection/valued-base';
import { CollectionEmptyBase } from '@rimbu/collection-types/advanced/collection-base';

const M = WithIndexedCollectionEmptyBase(CollectionEmptyBase)<number>;
const H2 = WithValuedCollectionEmptyBase(
	WithIndexedCollectionEmptyBase(CollectionEmptyBase),
);

export class HashSetEmpty<E = any>
	// extends CollectionEmptyBase<E, HashSet.Advanced.Family<E>>
	// extends WithIndexedCollectionEmptyBase(CollectionEmptyBase)<
	// 	E,
	// 	HashSet.Advanced.Family<E>
	// >
	extends WithValuedCollectionEmptyBase(
		WithIndexedCollectionEmptyBase(CollectionEmptyBase),
	)<E, HashSet.Advanced.Family<E>>
	// extends WithIndexedValuedSortedCollectionEmptyBase(
	// 	WithSortedCollectionEmptyBase(
	// 		WithIndexedValuedCollectionEmptyBase(CollectionEmptyBase),
	// 	),
	// )
	implements HashSet<E>
{
	toString(): string {
		return `HashSet()`;
	}
}
