import type { HashSet } from '@rimbu/hashed/set';

import type { HashSetContext } from '#set/context';

import { SetCollectionEmptyBase } from '@rimbu/collection-types/advanced/set-base';

export class HashSetEmpty<E = any>
	extends SetCollectionEmptyBase<E, HashSet.Advanced.Family<E>>
	implements HashSet<E>
{
	constructor(readonly context: HashSetContext<E>) {
		super();

		this.addAll = context.from;
	}

	toString(): string {
		return `HashSet()`;
	}
}
