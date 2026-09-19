import type { RelatedTo } from '@rimbu/common';
import type { ProximityMap } from '@rimbu/proximity';
import type { NearestKeyMatch } from '@rimbu/proximity/key-matching';

import type { ProximityMapContext } from '#proximity/context';

import { KeyedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { CollectionEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { MapCollectionEmpty } from '@rimbu/collection-types/advanced/map-base';
import { OptLazy } from '@rimbu/common/opt-lazy';

const EmptyBase = MapCollectionEmpty.WithMixin(
	KeyedCollectionEmpty.WithMixin(CollectionEmpty.Constructor),
);

/**
 * Concrete empty implementation of {@link ProximityMap}.<br/>
 * <br/>
 * It represents an empty `ProximityMap` instance for a given context and efficiently
 * creates non-empty maps when elements are added.
 *
 * @typeparam K - the key type
 * @typeparam V - the value type
 */
export class ProximityMapEmpty<K = any, V = any>
	extends EmptyBase<K, V, ProximityMap.Advanced.Family<K, V>>
	implements ProximityMap<K, V>
{
	constructor(readonly context: ProximityMapContext<K>) {
		super(context);
	}

	getNearest<UK = K>(key: RelatedTo<K, UK>): V | undefined;
	getNearest<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
	getNearest<UK, O>(
		_key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
	): V | O | undefined {
		return OptLazy(otherwise);
	}

	getNearestMatch<UK = K>(
		key: RelatedTo<K, UK>,
	): NearestKeyMatch<K, V> | undefined;
	getNearestMatch<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise: OptLazy<O>,
	): NearestKeyMatch<K, V> | O;
	getNearestMatch<UK, O>(
		_key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
	): NearestKeyMatch<K, V> | O | undefined {
		return OptLazy(otherwise);
	}

	override toString(): string {
		return `${this.context.typeTag}()`;
	}
}
