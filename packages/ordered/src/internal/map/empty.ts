import type { OrderedMap } from '@rimbu/ordered/map';

import type { OrderedMapContext } from '#ordered/map/context';

import { KeyedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { CollectionEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { MapCollectionEmpty } from '@rimbu/collection-types/advanced/map-base';

const EmptyBase = MapCollectionEmpty.WithMixin(
	KeyedCollectionEmpty.WithMixin(CollectionEmpty.Constructor),
);

/**
 * Concrete empty implementation of {@link OrderedMap}.<br/>
 * <br/>
 * It represents an empty `OrderedMap` instance for a given context and
 * efficiently creates non-empty maps when entries are added.
 *
 * @typeparam K - the key type
 * @typeparam V - the value type
 */
export class OrderedMapEmpty<K = any, V = any>
	extends EmptyBase<K, V, OrderedMap.Advanced.Family<K, V>>
	implements OrderedMap<K, V>
{
	constructor(readonly context: OrderedMapContext<K>) {
		super(context);
	}

	override toString(): string {
		return 'OrderedMap()';
	}
}
