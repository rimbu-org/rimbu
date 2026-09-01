import type { HashSet } from '@rimbu/hashed/set';

import { WithValuedCollectionEmptyBase } from '@rimbu/collection-types/advanced/collection/valued-base';
import { CollectionEmptyCtor } from '@rimbu/collection-types/advanced/collection-base';

const HashSetEmptyBase = WithValuedCollectionEmptyBase(CollectionEmptyCtor);

export class HashSetEmpty<E = any>
	extends HashSetEmptyBase<E, HashSet.Advanced.Family<E>>
	implements HashSet<E>
{
	toString(): string {
		return `HashSet()`;
	}
}
