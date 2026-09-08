import type { HashSet } from '@rimbu/hashed/set';

import { WithValuedCollectionEmptyBase } from '@rimbu/collection-types/advanced/collection/valued-base';
import { CollectionEmptyConstructor } from '@rimbu/collection-types/advanced/collection-base';

const SetEmpty = WithValuedCollectionEmptyBase(CollectionEmptyConstructor);

export class HashSetEmpty<E>
	extends SetEmpty<E, HashSet.Advanced.Family<E>>
	implements HashSet<E>
{
	toString(): string {
		return `HashSet()`;
	}
}
