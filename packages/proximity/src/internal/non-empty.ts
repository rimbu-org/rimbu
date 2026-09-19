import type { ModifyOptions } from '@rimbu/collection-types/advanced/common';
import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common';
import type { HashMap } from '@rimbu/hashed/map';
import type { ProximityMap } from '@rimbu/proximity';
import type { NearestKeyMatch } from '@rimbu/proximity/key-matching';
import type { Stream, StreamSource } from '@rimbu/stream';

import type { ProximityMapContext } from '#proximity/context';

import { KeyedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { MapCollectionNonEmpty } from '@rimbu/collection-types/advanced/map-base';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { findNearestKeyMatch } from '@rimbu/proximity/key-matching';

import { wrapHashMap } from '#proximity/wrapping';

const NonEmptyBase = MapCollectionNonEmpty.WithMixin(
	KeyedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor),
);

const toStringBeginning = /^[^(]+/;

/**
 * Concrete non-empty implementation of {@link ProximityMap.NonEmpty}.<br/>
 * <br/>
 * It stores entries in a non-empty `HashMap` and delegates all exact-key
 * operations to it; the configured distance function is applied only by
 * {@link ProximityMapNonEmpty.getNearest} and
 * {@link ProximityMapNonEmpty.getNearestMatch}.
 *
 * @typeparam K - the key type
 * @typeparam V - the value type
 */
export class ProximityMapNonEmpty<K, V>
	extends NonEmptyBase<K, V, ProximityMap.Advanced.Family<K, V>>
	implements ProximityMap.NonEmpty<K, V>
{
	constructor(
		readonly context: ProximityMapContext<K>,
		private readonly internalMap: HashMap.NonEmpty<K, V>,
	) {
		super(context);
	}

	private plugInternalMap(
		newInternalMap: HashMap.NonEmpty<K, V>,
	): ProximityMap.NonEmpty<K, V>;
	private plugInternalMap(newInternalMap: HashMap<K, V>): ProximityMap<K, V>;
	private plugInternalMap(newInternalMap: HashMap<K, V>): ProximityMap<K, V> {
		if (newInternalMap === this.internalMap) {
			return this;
		}

		return wrapHashMap(this.context, newInternalMap);
	}

	get size(): number {
		return this.internalMap.size;
	}

	stream(): Stream.NonEmpty<readonly [K, V]> {
		return this.internalMap.stream();
	}

	get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
	get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
	get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O | undefined {
		if (undefined === otherwise) return this.internalMap.get(key as K);

		return this.internalMap.get(key as K, otherwise);
	}

	has = <UK = K>(key: RelatedTo<K, UK>): boolean => {
		return this.internalMap.has(key);
	};

	streamKeys = (): Stream.NonEmpty<K> => {
		return this.internalMap.streamKeys();
	};

	streamValues = (): Stream.NonEmpty<V> => {
		return this.internalMap.streamValues();
	};

	add(entry: readonly [K, V]): ProximityMap.NonEmpty<K, V> {
		return wrapHashMap(this.context, this.internalMap.add(entry));
	}

	removeKey<UK = K>(key: RelatedTo<K, UK>): ProximityMap<K, V> {
		return this.plugInternalMap(this.internalMap.removeKey(key));
	}

	removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): ProximityMap<K, V> {
		return this.plugInternalMap(this.internalMap.removeKeys(keys));
	}

	modifyAtKey(atKey: K, options: ModifyOptions<V>): ProximityMap<K, V> {
		return this.plugInternalMap(this.internalMap.modifyAtKey(atKey, options));
	}

	mapValues<V2>(
		mapFun: (value: V, key: K) => V2,
	): ProximityMap.NonEmpty<K, V2> {
		return wrapHashMap(this.context, this.internalMap.mapValues(mapFun));
	}

	/**
	 * Returns the value associated with the key closest to `key`, as measured by
	 * the context's `DistanceFunction`.
	 */
	getNearest<UK = K>(key: RelatedTo<K, UK>): V | undefined;
	getNearest<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
	getNearest<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
	): V | O | undefined {
		const match = findNearestKeyMatch(
			this.context.distanceFunction,
			key as K,
			this.internalMap,
		);

		return undefined === match ? OptLazy(otherwise) : match.value;
	}

	/**
	 * Returns the {@link NearestKeyMatch} describing the key closest to `key`.
	 */
	getNearestMatch<UK = K>(
		key: RelatedTo<K, UK>,
	): NearestKeyMatch<K, V> | undefined;
	getNearestMatch<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise: OptLazy<O>,
	): NearestKeyMatch<K, V> | O;
	getNearestMatch<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
	): NearestKeyMatch<K, V> | O | undefined {
		const match = findNearestKeyMatch(
			this.context.distanceFunction,
			key as K,
			this.internalMap,
		);

		return undefined === match ? OptLazy(otherwise) : match;
	}

	forEach(f: (entry: readonly [K, V]) => void): void {
		this.internalMap.forEach(f);
	}

	toArray(): ArrayNonEmpty<readonly [K, V]> {
		return this.internalMap.toArray();
	}

	toBuilder(): ProximityMap.Builder<K, V> {
		return this.context.createBuilder<K, V>(this);
	}

	toString(): string {
		return this.internalMap
			.toString()
			.replace(toStringBeginning, this.context.typeTag);
	}
}
