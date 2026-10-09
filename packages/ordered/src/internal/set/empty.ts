import type { OptLazy, RelatedTo } from '@rimbu/common';
import type { OrderedSet } from '@rimbu/ordered/set';

import type { OrderedSetContext } from '#ordered/set/context';

import { IndexedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/indexed-base';
import { ValuedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/valued-base';
import { CollectionEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { OptLazy as OptLazyValue } from '@rimbu/common/opt-lazy';

const EmptyBase = IndexedCollectionEmpty.WithMixin(
	ValuedCollectionEmpty.WithMixin(CollectionEmpty.Constructor),
);

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

	indexOf<U = T>(_element: RelatedTo<T, U>): number | undefined;
	indexOf<U, O>(_element: RelatedTo<T, U>, otherwise: OptLazy<O>): number | O;
	indexOf<U, O>(
		_element: RelatedTo<T, U>,
		otherwise?: OptLazy<O>,
	): number | O | undefined {
		return OptLazyValue(otherwise);
	}

	placeAt(_index: number, element: T): OrderedSet.NonEmpty<T> {
		return this.context.of(element);
	}

	moveTo(_index: number, _element: T): OrderedSet<T> {
		return this;
	}

	override toString(): string {
		return 'OrderedSet()';
	}
}
