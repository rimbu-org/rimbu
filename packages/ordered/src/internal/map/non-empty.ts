import type { ModifyOptions } from '@rimbu/collection-types/advanced/common';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { ArrayNonEmpty, OptLazy, RelatedTo } from '@rimbu/common';
import type { OrderedMap } from '@rimbu/ordered/map';
import type { SortedMap } from '@rimbu/sorted/map';
import type { Stream } from '@rimbu/stream';

import type { OrderedMapContext } from '#ordered/map/context';

import { KeyedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { checkEmptyModifyOptions } from '@rimbu/collection-types/advanced/common';
import { MapCollectionNonEmpty } from '@rimbu/collection-types/advanced/map-base';
import { OptLazy as OptLazyValue } from '@rimbu/common/opt-lazy';

import { Indicator } from '#ordered/common/ordered-indicator';

const NonEmptyBase = MapCollectionNonEmpty.WithMixin(
	KeyedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor),
);

/**
 * Concrete non-empty implementation of {@link OrderedMap.NonEmpty}.<br/>
 * <br/>
 * Entries are stored in two maps: a key map holding `[value, indicator]` and a
 * sorted indicator map holding `[key, value]`. The sorted map defines the
 * insertion order and is the source of iteration. Updating an existing key's
 * value keeps its position; adding a new key appends it.
 *
 * @typeparam K - the key type
 * @typeparam V - the value type
 */
export class OrderedMapNonEmpty<K, V>
	extends NonEmptyBase<K, V, OrderedMap.Advanced.Family<K, V>>
	implements OrderedMap.NonEmpty<K, V>
{
	constructor(
		readonly context: OrderedMapContext<K>,
		readonly keyIndicatorMap: MapCollection.NonEmpty<
			K,
			readonly [V, Indicator]
		>,
		readonly indicatorKeyMap: SortedMap.NonEmpty<Indicator, readonly [K, V]>,
	) {
		super(context);
	}

	copy(
		keyIndicatorMap = this.keyIndicatorMap,
		indicatorKeyMap = this.indicatorKeyMap,
	): OrderedMap.NonEmpty<K, V> {
		if (
			keyIndicatorMap === this.keyIndicatorMap &&
			indicatorKeyMap === this.indicatorKeyMap
		) {
			return this;
		}

		return this.context.createNonEmpty<K, V>(keyIndicatorMap, indicatorKeyMap);
	}

	get size(): number {
		return this.keyIndicatorMap.size;
	}

	#nextIndicator(): Indicator {
		return Indicator.after(this.indicatorKeyMap.max()[0]);
	}

	stream(): Stream.NonEmpty<readonly [K, V]> {
		return this.indicatorKeyMap.streamValues();
	}

	get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
	get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
	get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O | undefined {
		const entry = this.keyIndicatorMap.get(key as K);
		if (undefined === entry) return OptLazyValue(otherwise);

		return entry[0];
	}

	add(entry: readonly [K, V]): OrderedMap.NonEmpty<K, V> {
		const [key, value] = entry;

		let appendedIndicator: Indicator | undefined;
		let inPlaceIndicator: Indicator | undefined;

		const newKeyIndicatorMap = this.keyIndicatorMap.modifyAtKey(key, {
			ifNew: {
				create: () => {
					appendedIndicator = this.#nextIndicator();
					return [value, appendedIndicator] as const;
				},
			},
			ifExists: {
				update: (current) => {
					const [currentValue, currentIndicator] = current;
					if (Object.is(currentValue, value)) return current;

					inPlaceIndicator = currentIndicator;
					return [value, currentIndicator] as const;
				},
			},
		});

		if (newKeyIndicatorMap === this.keyIndicatorMap) return this;
		if (!newKeyIndicatorMap.nonEmpty()) return this;

		let newIndicatorKeyMap = this.indicatorKeyMap;

		if (undefined !== appendedIndicator) {
			newIndicatorKeyMap = newIndicatorKeyMap.set(appendedIndicator, [
				key,
				value,
			]);
		} else if (undefined !== inPlaceIndicator) {
			newIndicatorKeyMap = newIndicatorKeyMap.set(inPlaceIndicator, [
				key,
				value,
			]);
		}

		return this.copy(newKeyIndicatorMap.assumeNonEmpty(), newIndicatorKeyMap);
	}

	modifyAtKey(atKey: K, options: ModifyOptions<V>): OrderedMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;

		const { ifNew, ifExists } = options;

		const modifyOptions: ModifyOptions<readonly [V, Indicator]> = {};

		let appendedIndicator: Indicator | undefined;
		let appendedValue: V | undefined;
		let inPlaceIndicator: Indicator | undefined;
		let inPlaceValue: V | undefined;
		let removedIndicator: Indicator | undefined;

		if (undefined !== ifNew) {
			modifyOptions.ifNew = {
				create: (skip) => {
					const { set, create } = ifNew;

					if (undefined !== create) {
						const result = create(skip);
						if (skip === result) return skip;

						appendedIndicator = this.#nextIndicator();
						appendedValue = result as V;
						return [result as V, appendedIndicator] as const;
					}

					appendedIndicator = this.#nextIndicator();
					appendedValue = set;
					return [set, appendedIndicator] as const;
				},
			};
		}

		if (undefined !== ifExists) {
			modifyOptions.ifExists = {
				update: (current, remove) => {
					const [currentValue, currentIndicator] = current;
					const { set, update } = ifExists;

					if (undefined !== update) {
						const result = update(currentValue, remove);
						if (remove === result) {
							removedIndicator = currentIndicator;
							return remove;
						}
						if (Object.is(currentValue, result)) return current;

						inPlaceIndicator = currentIndicator;
						inPlaceValue = result as V;
						return [result as V, currentIndicator] as const;
					}

					if (Object.is(currentValue, set)) return current;

					inPlaceIndicator = currentIndicator;
					inPlaceValue = set;
					return [set, currentIndicator] as const;
				},
			};
		}

		const newKeyIndicatorMap = this.keyIndicatorMap.modifyAtKey(
			atKey,
			modifyOptions,
		);

		if (newKeyIndicatorMap === this.keyIndicatorMap) return this;
		if (!newKeyIndicatorMap.nonEmpty()) return this.context.empty();

		let newIndicatorKeyMap = this.indicatorKeyMap;

		if (undefined !== removedIndicator) {
			newIndicatorKeyMap = newIndicatorKeyMap
				.removeKey(removedIndicator)
				.assumeNonEmpty();
		}

		if (undefined !== appendedIndicator) {
			newIndicatorKeyMap = newIndicatorKeyMap.set(appendedIndicator, [
				atKey,
				appendedValue as V,
			]);
		} else if (undefined !== inPlaceIndicator) {
			newIndicatorKeyMap = newIndicatorKeyMap.set(inPlaceIndicator, [
				atKey,
				inPlaceValue as V,
			]);
		}

		return this.copy(newKeyIndicatorMap.assumeNonEmpty(), newIndicatorKeyMap);
	}

	mapValues<V2>(mapFun: (value: V, key: K) => V2): OrderedMap.NonEmpty<K, V2> {
		return this.context
			.createNonEmpty<K, V2>(
				this.keyIndicatorMap.mapValues(([value, indicator], key) => {
					return [mapFun(value, key), indicator] as const;
				}),
				this.indicatorKeyMap.mapValues(([key, value]) => {
					return [key, mapFun(value, key)] as const;
				}),
			)
			.assumeNonEmpty();
	}

	forEach(f: (entry: readonly [K, V]) => void): void {
		this.indicatorKeyMap.forEach(([, entry]) => {
			f(entry);
		});
	}

	toArray(): ArrayNonEmpty<readonly [K, V]> {
		return this.stream().toArray();
	}

	toBuilder(): OrderedMap.Builder<K, V> {
		return this.context.createBuilder<K, V>(this);
	}

	toString(): string {
		return this.stream().join({
			start: 'OrderedMap(',
			sep: ', ',
			end: ')',
			valueToString: (entry) => `${entry[0]} -> ${entry[1]}`,
		});
	}
}
