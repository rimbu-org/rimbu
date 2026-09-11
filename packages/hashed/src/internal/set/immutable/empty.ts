import type { HashSet } from '@rimbu/hashed/set';

import { ValuedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/valued-base';
import { CollectionEmpty } from '@rimbu/collection-types/advanced/collection-base';

const SetEmpty = ValuedCollectionEmpty.WithMixin(CollectionEmpty.Constructor);

export class HashSetEmpty<E>
	extends SetEmpty<E, HashSet.Advanced.Family<E>>
	implements HashSet<E>
{
	toString(): string {
		return `HashSet()`;
	}
}
