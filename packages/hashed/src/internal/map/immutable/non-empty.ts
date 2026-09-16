import type { ModifyOptions } from '@rimbu/collection-types/advanced/common';
import type { HashMap } from '@rimbu/hashed/map';

import type { HashMapCollectionContext } from '#map/context';

import { KeyedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { MapCollectionNonEmpty } from '@rimbu/collection-types/advanced/map-base';

const NonEmptyBase = MapCollectionNonEmpty.WithMixin(
	KeyedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor),
);

export abstract class HashMapNonEmptyBase<K, V>
	extends NonEmptyBase<K, V, HashMap.Advanced.Family<K, V>>
	implements HashMap.NonEmpty<K, V>
{
	abstract readonly context: HashMapCollectionContext<K>;

	abstract add(entry: readonly [K, V], hash?: number): HashMap.NonEmpty<K, V>;

	abstract modifyAtKey(
		atKey: K,
		options: ModifyOptions<V>,
		atKeyHash?: number,
	): HashMap<K, V>;

	abstract mapValues<V2>(f: (value: V, key: K) => V2): HashMap.NonEmpty<K, V2>;

	toBuilder(): HashMap.Builder<K, V> {
		return this.context.createBuilder<K, V>(this);
	}

	toString(): string {
		return this.stream().join({
			start: 'HashMap(',
			sep: ', ',
			end: ')',
			valueToString: (entry) => `${entry[0]} -> ${entry[1]}`,
		});
	}
}
