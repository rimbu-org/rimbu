import type { HashMap } from '@rimbu/hashed/map';

import type { HashMapCollectionContext } from '#map/context';

import { WithKeyedCollectionEmptyBase } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { CollectionEmptyConstructor } from '@rimbu/collection-types/advanced/collection-base';
import { WithMapCollectionEmptyBase } from '@rimbu/collection-types/advanced/map-base';

const HashMapEmptyBase = WithMapCollectionEmptyBase(
	WithKeyedCollectionEmptyBase(CollectionEmptyConstructor),
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
