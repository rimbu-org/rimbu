import type { OptLazy, RelatedTo } from '@rimbu/common';
import type { OrderedMap } from '@rimbu/ordered/map';

import type { OrderedMapContext } from '#ordered/map/context';

import { IndexedKeyedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/indexed-keyed-base';
import { KeyedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { CollectionEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { MapCollectionEmpty } from '@rimbu/collection-types/advanced/map-base';
import { OptLazy as OptLazyValue } from '@rimbu/common/opt-lazy';

const EmptyBase = IndexedKeyedCollectionEmpty.WithMixin(
	MapCollectionEmpty.WithMixin(
		KeyedCollectionEmpty.WithMixin(CollectionEmpty.Constructor),
	),
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

	indexOf<UK = K>(_key: RelatedTo<K, UK>): number | undefined;
	indexOf<UK, O>(_key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
	indexOf<UK, O>(
		_key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
	): number | O | undefined {
		return OptLazyValue(otherwise);
	}

	placeAt(_index: number, element: readonly [K, V]): OrderedMap.NonEmpty<K, V> {
		return this.context.of(element);
	}

	moveTo(_index: number, _key: K): OrderedMap<K, V> {
		return this;
	}

	override toString(): string {
		return 'OrderedMap()';
	}
}
