import type { HashMap } from '@rimbu/hashed/map';

import type { HashMapCollectionContext } from '#map/context';

import { KeyedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { CollectionEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { MapCollectionEmpty } from '@rimbu/collection-types/advanced/map-base';

const HashMapEmptyBase = MapCollectionEmpty.WithMixin(
	KeyedCollectionEmpty.WithMixin(CollectionEmpty.Constructor),
);

export class HashMapEmpty<K = any, V = any>
	extends HashMapEmptyBase<K, V, HashMap.Advanced.Family<K, V>>
	implements HashMap<K, V>
{
	constructor(readonly context: HashMapCollectionContext<K>) {
		super(context);
	}

	toBuilder(): HashMap.Builder<K, V> {
		return this.context.builder();
	}

	toString(): string {
		return `HashMap()`;
	}
}
