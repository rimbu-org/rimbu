import type { ModifyOptions } from '@rimbu/collection-types/advanced/common';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { Op } from '@rimbu/collection-types/types';
import type {
	ArrayNonEmpty,
	IndexRange,
	OptLazy,
	RelatedTo,
} from '@rimbu/common';
import type { OrderedMap } from '@rimbu/ordered/map';
import type { SortedMap } from '@rimbu/sorted/map';
import type { Stream } from '@rimbu/stream';

import type { OrderedMapContext } from '#ordered/map/context';

import { IndexedKeyedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/indexed-keyed-base';
import { KeyedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { checkEmptyModifyOptions } from '@rimbu/collection-types/advanced/common';
import { MapCollectionNonEmpty } from '@rimbu/collection-types/advanced/map-base';
import { OptLazy as OptLazyValue } from '@rimbu/common/opt-lazy';

import { Indicator } from '#ordered/common/ordered-indicator';

const NonEmptyBase = IndexedKeyedCollectionNonEmpty.WithMixin(
	MapCollectionNonEmpty.WithMixin(
		KeyedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor),
	),
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

	#fromIndicatorMap(
		indicatorKeyMap: SortedMap<Indicator, readonly [K, V]>,
	): OrderedMap<K, V> {
		if (indicatorKeyMap.isEmpty) return this.context.empty<readonly [K, V]>();

		const keyIndicatorMap = this.context.keyMapContext.from(
			indicatorKeyMap
				.stream()
				.map(
					([indicator, entry]) => [entry[0], [entry[1], indicator]] as const,
				),
		);

		return this.context.createNonEmpty(
			keyIndicatorMap.assumeNonEmpty() as MapCollection.NonEmpty<
				K,
				readonly [V, Indicator]
			>,
			indicatorKeyMap.assumeNonEmpty(),
		);
	}

	#indexOfKey(key: K): number {
		const existing = this.keyIndicatorMap.get(key);
		if (undefined === existing) return -1;

		return this.indicatorKeyMap.indexOf(existing[1]) ?? -1;
	}

	#rebuild(entries: readonly (readonly [K, V])[]): OrderedMap<K, V> {
		if (entries.length === 0) return this.context.empty<readonly [K, V]>();

		return this.context.from(
			entries as ArrayNonEmpty<readonly [K, V]>,
		) as unknown as OrderedMap<K, V>;
	}

	#sameEntries(
		one: readonly (readonly [K, V])[],
		other: readonly (readonly [K, V])[],
	): boolean {
		if (one.length !== other.length) return false;

		for (let i = 0; i < one.length; i++) {
			if (!Object.is(one[i][0], other[i][0])) return false;
			if (!Object.is(one[i][1], other[i][1])) return false;
		}

		return true;
	}

	#normalizeIndex(index: number, finalSize: number): number {
		let dest = Math.trunc(index);
		if (dest < 0) dest = finalSize + dest;
		if (dest < 0) dest = 0;
		if (dest > finalSize - 1) dest = finalSize - 1;

		return dest;
	}

	indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
	indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
	indexOf<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
	): number | O | undefined {
		const index = this.#indexOfKey(key as K);

		return index < 0 ? (OptLazyValue(otherwise) as O) : index;
	}

	at<O>(index: number, otherwise?: OptLazy<O>): readonly [K, V] | O {
		const entry = this.indicatorKeyMap.at(index);

		return undefined === entry ? (OptLazyValue(otherwise) as O) : entry[1];
	}

	streamSlice(
		range: IndexRange,
		options?: { reversed?: boolean | undefined },
	): Stream<readonly [K, V]> {
		return this.indicatorKeyMap
			.streamSlice(range, options)
			.map(([, entry]) => entry);
	}

	take(amount: number): OrderedMap<K, V> | any {
		return this.#fromIndicatorMap(this.indicatorKeyMap.take(amount));
	}

	drop(amount: number): OrderedMap<K, V> {
		return this.#fromIndicatorMap(this.indicatorKeyMap.drop(amount));
	}

	slice(range: IndexRange): OrderedMap<K, V> {
		return this.#fromIndicatorMap(this.indicatorKeyMap.slice(range));
	}

	splitAt(amount: number): any {
		return [this.take(amount), this.drop(amount)];
	}

	prepend(element: readonly [K, V]): OrderedMap.NonEmpty<K, V> {
		return this.placeAt(0, element);
	}

	append(element: readonly [K, V]): OrderedMap.NonEmpty<K, V> {
		return this.placeAt(-1, element);
	}

	placeAt(index: number, element: readonly [K, V]): OrderedMap.NonEmpty<K, V> {
		const entries = this.toArray().slice() as (readonly [K, V])[];
		const existing = this.#indexOfKey(element[0]);
		if (existing >= 0) entries.splice(existing, 1);

		const finalSize = entries.length + 1;
		entries.splice(this.#normalizeIndex(index, finalSize), 0, element);

		if (this.#sameEntries(this.toArray(), entries)) return this;

		return this.#rebuild(entries).assumeNonEmpty();
	}

	moveTo(index: number, key: K): OrderedMap.NonEmpty<K, V> {
		const existing = this.#indexOfKey(key);
		if (existing < 0) return this;

		const entries = this.toArray().slice() as (readonly [K, V])[];
		const [removed] = entries.splice(existing, 1);
		const finalSize = entries.length + 1;
		entries.splice(this.#normalizeIndex(index, finalSize), 0, removed);

		if (this.#sameEntries(this.toArray(), entries)) return this;

		return this.#rebuild(entries).assumeNonEmpty();
	}

	removeAt(index: number, amount?: number | undefined): OrderedMap<K, V> {
		const size = this.size;
		let at = Math.trunc(index);
		if (at < 0) at = size + at;
		if (at < 0 || at >= size) return this;

		const amt = amount === undefined ? 1 : Math.trunc(amount);
		if (amt <= 0) return this;

		const count = Math.min(amt, size - at);
		const removedIndicators: Indicator[] = [];
		const removedKeys: K[] = [];

		for (let i = 0; i < count; i++) {
			const entry = this.indicatorKeyMap.at(at + i);
			if (undefined === entry) break;
			removedIndicators.push(entry[0]);
			removedKeys.push(entry[1][0]);
		}

		if (removedIndicators.length === 0) return this;

		const indicatorKeyMap = this.indicatorKeyMap.removeKeys(removedIndicators);
		if (!indicatorKeyMap.nonEmpty()) return this.context.empty();

		const keyIndicatorMap = this.keyIndicatorMap.removeKeys(removedKeys);

		return this.context.createNonEmpty(
			keyIndicatorMap.assumeNonEmpty(),
			indicatorKeyMap.assumeNonEmpty(),
		);
	}

	removeAtAndReturn(
		index: number,
		amount?: number | undefined,
	): Op.DynamicResult<
		OrderedMap.NonEmpty<K, V>,
		OrderedMap<K, V>,
		OrderedMap.NonEmpty<K, V>,
		OrderedMap<K, V>
	> {
		const removed = this.slice({ start: index, amount: amount ?? 1 });

		if (!removed.nonEmpty()) {
			return {
				collection: this,
				hasResult: false,
				result: removed,
				hasChanged: false,
			};
		}

		const next = this.removeAt(index, amount);

		return {
			collection: next,
			hasResult: true,
			result: removed.assumeNonEmpty(),
			hasChanged: next !== this,
		};
	}

	swapAt(index1: number, index2: number): OrderedMap.NonEmpty<K, V> {
		const size = this.size;
		let one = Math.trunc(index1);
		let other = Math.trunc(index2);
		if (one < 0) one = size + one;
		if (other < 0) other = size + other;
		if (one < 0 || one >= size || other < 0 || other >= size) return this;
		if (one === other) return this;

		const entries = this.toArray().slice() as (readonly [K, V])[];
		[entries[one], entries[other]] = [entries[other], entries[one]];

		return this.#rebuild(entries).assumeNonEmpty();
	}

	swapAtAndReturn(
		index1: number,
		index2: number,
	): Op.DynamicResult<
		OrderedMap.NonEmpty<K, V>,
		[previous1: undefined, previous2: undefined],
		[previous1: readonly [K, V], previous2: readonly [K, V]],
		OrderedMap.NonEmpty<K, V>
	> {
		const size = this.size;
		let one = Math.trunc(index1);
		let other = Math.trunc(index2);
		if (one < 0) one = size + one;
		if (other < 0) other = size + other;

		if (one < 0 || one >= size || other < 0 || other >= size) {
			return {
				collection: this,
				hasResult: false,
				result: [undefined, undefined],
				hasChanged: false,
			};
		}

		const first = this.indicatorKeyMap.at(one)?.[1];
		const second = this.indicatorKeyMap.at(other)?.[1];
		if (first === undefined || second === undefined) {
			return {
				collection: this,
				hasResult: false,
				result: [undefined, undefined],
				hasChanged: false,
			};
		}

		const collection = this.swapAt(index1, index2);

		return {
			collection,
			hasResult: true,
			result: [first, second],
			hasChanged: collection !== this,
		};
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
