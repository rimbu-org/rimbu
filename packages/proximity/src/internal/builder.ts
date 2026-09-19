import type { ModifyOptions } from '@rimbu/collection-types/advanced/common';
import type { RelatedTo } from '@rimbu/common';
import type { HashMap } from '@rimbu/hashed/map';
import type { ProximityMap } from '@rimbu/proximity';
import type { NearestKeyMatch } from '@rimbu/proximity/key-matching';
import type { StreamSource } from '@rimbu/stream';

import type { ProximityMapContext } from '#proximity/context';

import { CollectionBuilderBase } from '@rimbu/collection-types/advanced/collection-base';
import { OptLazy } from '@rimbu/common/opt-lazy';

import { wrapHashMap } from '#proximity/wrapping';

/**
 * Mutable builder used to efficiently construct new immutable {@link ProximityMap} instances.<br/>
 * <br/>
 * The builder stores entries in an internal `HashMap.Builder` and only wraps the result
 * into a `ProximityMap` when {@link ProximityMapBuilder.build | build} (or
 * {@link ProximityMapBuilder.buildMapValues | buildMapValues}) is called.
 *
 * Unlike the immutable collection, whose `get` is exact-key, the builder exposes both
 * the exact-key `get`/`has` and the distance-based
 * {@link ProximityMapBuilder.getNearest | getNearest}, consistently with the
 * immutable API.
 *
 * @typeparam K - the key type
 * @typeparam V - the value type
 */
export class ProximityMapBuilder<K, V>
	extends CollectionBuilderBase<
		readonly [K, V],
		ProximityMap.Advanced.Family<K, V>
	>
	implements ProximityMap.Builder<K, V>
{
	private readonly internalBuilder: HashMap.Builder<K, V>;

	constructor(
		readonly context: ProximityMapContext<K>,
		private source?: ProximityMap.NonEmpty<K, V>,
	) {
		super();

		this.internalBuilder = context.hashMapContext.builder<readonly [K, V]>();

		if (undefined !== source) {
			this.internalBuilder.addAll(source);
		}
	}

	get size(): number {
		return this.internalBuilder.size;
	}

	get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
	get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
	get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O | undefined {
		return undefined !== this.source
			? this.source.get(key, otherwise)
			: this.internalBuilder.get(key, otherwise);
	}

	has = <UK = K>(key: RelatedTo<K, UK>): boolean => {
		if (undefined !== this.source) return this.source.has(key);
		return this.internalBuilder.has(key);
	};

	forEach = (f: (entry: readonly [K, V]) => void): void => {
		this.internalBuilder.forEach(f);
	};

	add = (entry: readonly [K, V]): boolean => {
		const hasChanged = this.internalBuilder.add(entry);

		if (hasChanged) {
			this.source = undefined;
		}

		return hasChanged;
	};

	set = (key: K, value: V): boolean => {
		return this.add([key, value]);
	};

	addAll = (entries: StreamSource<readonly [K, V]>): boolean => {
		const hasChanged = this.internalBuilder.addAll(entries);

		if (hasChanged) {
			this.source = undefined;
		}

		return hasChanged;
	};

	modifyAtKey = (key: K, options: ModifyOptions<V>): boolean => {
		const hasChanged = this.internalBuilder.modifyAtKey(key, options);

		if (hasChanged) {
			this.source = undefined;
		}

		return hasChanged;
	};

	updateAtKey = <UK, O>(
		key: RelatedTo<K, UK>,
		update: (value: V) => V,
		otherwise?: OptLazy<O>,
	): [V | O, V | O] => {
		let result: [V, V] | undefined;

		const hasChanged = this.internalBuilder.modifyAtKey(key as K, {
			ifExists: {
				update: (value: V, _remove) => {
					const newValue = update(value);
					result = [value, newValue];

					return newValue;
				},
			},
		});

		if (hasChanged) {
			this.source = undefined;
		}

		if (undefined !== result) return result;

		const otherwiseValue = OptLazy(otherwise) as O;

		return [otherwiseValue, otherwiseValue];
	};

	removeKey = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
		const token = Symbol();
		const value = this.internalBuilder.removeKey(key, token);

		if (token === value) return OptLazy(otherwise) as O;

		this.source = undefined;

		return value;
	};

	removeKeys = <UK>(keys: StreamSource<RelatedTo<K, UK>>): boolean => {
		const hasChanged = this.internalBuilder.removeKeys(keys);

		if (hasChanged) {
			this.source = undefined;
		}

		return hasChanged;
	};

	#nearestMatch(key: K): NearestKeyMatch<K, V> | undefined {
		const distanceFunction = this.context.distanceFunction;

		let bestEntry: readonly [K, V] | undefined;
		let bestDistance = Number.POSITIVE_INFINITY;

		this.forEach((entry) => {
			if (0 === bestDistance) return;

			const currentDistance = distanceFunction(entry[0], key);

			if (0 === currentDistance) {
				bestEntry = entry;
				bestDistance = 0;
				return;
			}

			if (currentDistance < bestDistance) {
				bestEntry = entry;
				bestDistance = currentDistance;
			}
		});

		return undefined === bestEntry
			? undefined
			: {
					key: bestEntry[0],
					value: bestEntry[1],
					distance: bestDistance,
				};
	}

	getNearest<UK = K>(key: RelatedTo<K, UK>): V | undefined;
	getNearest<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
	getNearest<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
	): V | O | undefined {
		const match = this.#nearestMatch(key as K);

		return undefined === match ? OptLazy(otherwise) : match.value;
	}

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
		const match = this.#nearestMatch(key as K);

		return undefined === match ? OptLazy(otherwise) : match;
	}

	clear = (): void => {
		this.checkLock();
		this.internalBuilder.clear();
		this.source = undefined;
	};

	build = (): ProximityMap<K, V> => {
		if (undefined !== this.source) return this.source;

		return wrapHashMap(this.context, this.internalBuilder.build());
	};

	buildMapValues = <V2>(
		mapFun: (value: V, key: K) => V2,
	): ProximityMap<K, V2> => {
		if (undefined !== this.source) return this.source.mapValues(mapFun);

		return wrapHashMap(
			this.context,
			this.internalBuilder.buildMapValues(mapFun),
		);
	};
}
