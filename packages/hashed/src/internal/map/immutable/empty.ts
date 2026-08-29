import type { HashMap } from '@rimbu/hashed/map';

import type { HashMapCollectionContext } from '#map/context';

import { MapCollectionEmptyBase } from '@rimbu/collection-types/advanced/map-base';

export class HashMapEmpty<K = any, V = any>
	extends MapCollectionEmptyBase<K, V, HashMap.Advanced.Family<K, V>>
	implements HashMap<K, V>
{
	constructor(readonly context: HashMapCollectionContext<K>) {
		super();
	}

	toBuilder(): HashMap.Builder<K, V> {
		return this.context.builder();
	}

	toString(): string {
		return `HashMap()`;
	}
}
