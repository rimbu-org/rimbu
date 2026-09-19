import type { OrderedSet } from '@rimbu/ordered/set';

import type { OrderedSetContext } from '#ordered/set/context';

import { ValuedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/valued-base';
import { CollectionEmpty } from '@rimbu/collection-types/advanced/collection-base';

const EmptyBase = ValuedCollectionEmpty.WithMixin(CollectionEmpty.Constructor);

/**
 * Concrete empty implementation of {@link OrderedSet}.<br/>
 * <br/>
 * It represents an empty `OrderedSet` instance for a given context and
 * efficiently creates non-empty sets when elements are added.
 *
 * @typeparam T - the element type
 */
export class OrderedSetEmpty<T = any>
	extends EmptyBase<T, OrderedSet.Advanced.Family<T>>
	implements OrderedSet<T>
{
	constructor(readonly context: OrderedSetContext<T>) {
		super(context);
	}

	override toString(): string {
		return 'OrderedSet()';
	}
}
