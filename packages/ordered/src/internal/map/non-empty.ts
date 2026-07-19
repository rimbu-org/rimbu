import type { RMap } from '@rimbu/collection-types';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type {
	ArrayNonEmpty,
	RelatedTo,
	WithValueResult,
} from '@rimbu/common/types';
import type { OrderedMap } from '@rimbu/ordered/map';
import type { SortedMap } from '@rimbu/sorted';

import type { OrderedMapBase } from '#map/base';
import type { ContextImpl } from '#map/context-factory';

import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { NonEmptyBase } from '@rimbu/collection-types/advanced/common/empty-base';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream, type StreamSource } from '@rimbu/stream';

import { Indicator } from '#ordered/common/ordered-indicator';

export class OrderedMapNonEmpty<K, V>
	extends NonEmptyBase<[K, V]>
	implements OrderedMapBase.NonEmpty<K, V>
{
	declare _NonEmptyType: OrderedMap.NonEmpty<K, V>;

	constructor(
		readonly context: ContextImpl<K>,
		readonly keyIndicatorMap: RMap.NonEmpty<K, [V, Indicator]>,
		readonly indicatorKeyMap: SortedMap.NonEmpty<Indicator, [K, V]>,
	) {
		super();
	}

	copy(
		keyIndicatorMap = this.keyIndicatorMap,
		indicatorKeyMap = this.indicatorKeyMap,
	): OrderedMapNonEmpty<K, V> {
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

	stream(): Stream.NonEmpty<[K, V]> {
		return this.indicatorKeyMap.streamValues();
	}

	streamKeys(): Stream.NonEmpty<K> {
		return this.stream().map((entry) => entry[0]);
	}

	streamValues(): Stream.NonEmpty<V> {
		return this.stream().map((entry) => entry[1]);
	}

	hasKey<UK>(key: RelatedTo<K, UK>): boolean {
		return this.keyIndicatorMap.hasKey(key);
	}

	at<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O {
		const result = this.keyIndicatorMap.at(key);
		if (undefined === result) {
			return OptLazy(otherwise!);
		}
		return result[0];
	}

	#nextIndicator(): Indicator {
		const lastIndicator = this.indicatorKeyMap.maxKey();
		return Indicator.after(lastIndicator);
	}

	set(key: K, value: V): OrderedMap.NonEmpty<K, V> {
		let oldIndicator: Indicator | undefined;
		let newIndicator: Indicator | undefined;

		const newKeyIndicatorMap = this.keyIndicatorMap.modifyAt(key, {
			ifNew: {
				create: () => {
					return [value, this.#nextIndicator()];
				},
			},
			ifExists: {
				update: (currentEntry) => {
					const [currentValue, currentIndicator] = currentEntry;
					if (Object.is(currentValue, value)) return currentEntry;

					const nextIndicator = this.#nextIndicator();
					oldIndicator = currentIndicator;
					newIndicator = nextIndicator;

					return [value, newIndicator];
				},
			},
		});

		if (undefined === oldIndicator || undefined === newIndicator) return this;

		const newIndicatorKeyMap = this.indicatorKeyMap
			.removeKey(oldIndicator)
			.set(newIndicator, [key, value]);

		return this.copy(newKeyIndicatorMap.assumeNonEmpty(), newIndicatorKeyMap);
	}

	addEntry(entry: readonly [K, V]): OrderedMap.NonEmpty<K, V> {
		return this.set(entry[0], entry[1]);
	}

	addEntries(
		entries: StreamSource<readonly [K, V]>,
	): OrderedMap.NonEmpty<K, V> {
		if (Stream.isEmptyStreamSourceInstance(entries)) {
			return this;
		}

		const builder = this.toBuilder();
		builder.addEntries(entries);
		return builder.build().assumeNonEmpty();
	}

	removeKey<UK>(key: RelatedTo<K, UK>): OrderedMap<K, V> {
		const [newKeyIndicatorMap, removedEntry, wasRemoved] =
			this.keyIndicatorMap.removeKeyAndGet(key);

		if (!wasRemoved) return this;
		if (!newKeyIndicatorMap.nonEmpty()) return this.context.empty();

		const [_, removedIndicator] = removedEntry;
		const newIndicatorKeyMap = this.indicatorKeyMap.removeKey(removedIndicator);

		return this.copy(newKeyIndicatorMap, newIndicatorKeyMap.assumeNonEmpty());
	}

	removeKeys<UK>(keys: StreamSource<RelatedTo<K, UK>>): OrderedMap<K, V> {
		if (Stream.isEmptyStreamSourceInstance(keys)) return this;

		const builder = this.toBuilder();
		builder.removeKeys(keys);
		return builder.build();
	}

	removeKeyAndGet<UK>(
		key: RelatedTo<K, UK>,
	): WithValueResult<OrderedMap<K, V>, V, OrderedMap.NonEmpty<K, V>> {
		const [newKeyIndicatorMap, removedEntry, wasRemoved] =
			this.keyIndicatorMap.removeKeyAndGet(key);

		if (!wasRemoved) return [this, undefined, false];
		if (!newKeyIndicatorMap.nonEmpty()) {
			return [this.context.empty(), removedEntry[0], true];
		}

		const [removedValue, removedIndicator] = removedEntry;
		const newIndicatorKeyMap = this.indicatorKeyMap.removeKey(removedIndicator);

		return [
			this.copy(newKeyIndicatorMap, newIndicatorKeyMap.assumeNonEmpty()),
			removedValue,
			true,
		];
	}

	modifyAt(key: K, options: ModifyOptions<V>): OrderedMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;

		const { ifNew, ifExists } = options;

		const modifyOptions: ModifyOptions<[V, Indicator]> = {};

		let previousIndicator: Indicator | undefined;
		let newEntry: [V, Indicator] | undefined;

		if (undefined !== ifNew) {
			modifyOptions.ifNew = {
				create: (skip) => {
					const { set, create } = ifNew;

					if (undefined !== create) {
						const result = create(skip);
						if (skip === result) return skip;

						newEntry = [result as V, this.#nextIndicator()];
						return newEntry;
					}

					newEntry = [set!, this.#nextIndicator()];
					return newEntry;
				},
			};
		}
		if (undefined !== ifExists) {
			modifyOptions.ifExists = {
				update: (currentEntry, remove) => {
					const { set, update } = ifExists;

					const [currentValue, currentIndicator] = currentEntry;
					previousIndicator = currentIndicator;

					if (undefined !== update) {
						const result = update(currentValue, remove);
						if (remove === result) return remove;
						if (Object.is(currentValue, result)) return currentEntry;

						newEntry = [result as V, this.#nextIndicator()];
						return newEntry;
					}

					if (Object.is(currentValue, set)) return currentEntry;

					newEntry = [set!, this.#nextIndicator()];
					return newEntry;
				},
			};
		}

		const newKeyIndicatorMap = this.keyIndicatorMap.modifyAt(
			key,
			modifyOptions,
		);

		if (newKeyIndicatorMap === this.keyIndicatorMap) return this;
		if (!newKeyIndicatorMap.nonEmpty()) return this.context.empty();

		let newIndicatorKeyMap = this.indicatorKeyMap;

		if (undefined !== previousIndicator) {
			newIndicatorKeyMap = newIndicatorKeyMap
				.removeKey(previousIndicator)
				.assumeNonEmpty();
		}
		if (undefined !== newEntry) {
			const [newValue, newIndicator] = newEntry;
			newIndicatorKeyMap = newIndicatorKeyMap.set(newIndicator, [
				key,
				newValue,
			]);
		}

		return this.copy(newKeyIndicatorMap, newIndicatorKeyMap);
	}

	forEach(
		f: (entry: [K, V], index: number, halt: () => void) => void,
		options: { reversed?: boolean; state?: TraverseState } = {},
	): void {
		this.indicatorKeyMap.forEach(([_, entry], index, halt) => {
			f(entry, index, halt);
		}, options);
	}

	filter(
		pred: (entry: [K, V], index: number, halt: () => void) => boolean,
		options: { negate?: boolean } = {},
	): OrderedMap<K, V> {
		const { negate = false } = options;

		const builder = this.context.builder<K, V>();

		builder.addEntries(this.stream().filter(pred, { negate }));

		if (builder.size === this.size) return this;

		return builder.build();
	}

	transform<V2, K2 extends K>(
		transformFun: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource<[K2, V2]>,
	): any {
		return this.context.from(transformFun(this.stream()));
	}

	mapValues<V2>(mapFun: (value: V, key: K) => V2): any {
		return this.context.createNonEmpty<K, V2>(
			this.keyIndicatorMap.mapValues(([value, indicator], key) => [
				mapFun(value, key),
				indicator,
			]),
			this.indicatorKeyMap.mapValues(([key, value]) => [
				key,
				mapFun(value, key),
			]),
		);
	}

	updateAt<UK>(key: RelatedTo<K, UK>, update: (value: V) => V): any {
		if (!this.context.isValidKey(key)) return this;

		return this.modifyAt(key, { ifExists: { update } });
	}

	updateAtAndGet<U>(
		key: RelatedTo<K, U>,
		update: (value: V) => V,
	): WithValueResult<OrderedMap.NonEmpty<K, V>, V> {
		const token = Symbol();
		let oldValue: V | typeof token = token;

		const newMap = this.updateAt(key, (value) => {
			oldValue = value;
			return update(value);
		});

		if (token === oldValue) return [this, undefined, false];
		return [newMap, oldValue, true];
	}

	toArray(): ArrayNonEmpty<[K, V]> {
		return this.stream().toArray();
	}

	toBuilder(): OrderedMap.Builder<K, V> {
		return this.context.createBuilder(this);
	}

	toString(): string {
		return this.stream().join({
			start: 'OrderedMap(',
			sep: ', ',
			end: ')',
			valueToString: (entry) => `${entry[0]} -> ${entry[1]}`,
		});
	}

	toJSON(): any {}
}
