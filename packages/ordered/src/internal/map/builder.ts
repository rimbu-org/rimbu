import type { MapCollection } from '@rimbu/collection-types/map';
import type { OptLazy, RelatedTo } from '@rimbu/common';
import type { OrderedBulkOptions, OrderedMap } from '@rimbu/ordered/map';
import type { SortedMap } from '@rimbu/sorted/map';
import type { StreamSource } from '@rimbu/stream';

import type { OrderedMapContext } from '#ordered/map/context';
import type { OrderedMapNonEmpty } from '#ordered/map/non-empty';

import { CollectionBuilderBase } from '@rimbu/collection-types/advanced/collection-base';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { OptLazy as OptLazyValue } from '@rimbu/common/opt-lazy';
import { Stream } from '@rimbu/stream';

import { Indicator } from '#ordered/common/ordered-indicator';

/**
 * Mutable builder used to efficiently construct new immutable {@link OrderedMap}
 * instances.<br/>
 * <br/>
 * The builder keeps a key map builder holding `[value, indicator]` and a sorted
 * indicator map builder holding `[key, value]`. `build` wraps the two built maps
 * into an immutable `OrderedMap`.
 *
 * @typeparam K - the key type
 * @typeparam V - the value type
 */
export class OrderedMapBuilder<K, V>
	extends CollectionBuilderBase<
		readonly [K, V],
		OrderedMap.Advanced.Family<K, V>
	>
	implements OrderedMap.Builder<K, V>
{
	#source: OrderedMap.NonEmpty<K, V> | undefined;
	_keyMapBuilder: MapCollection.Builder<K, readonly [V, Indicator]> | undefined;
	_indicatorMapBuilder:
		| SortedMap.Builder<Indicator, readonly [K, V]>
		| undefined;

	constructor(
		readonly context: OrderedMapContext<K>,
		source?: OrderedMap.NonEmpty<K, V>,
	) {
		super();
		this.#source = source;
	}

	#prepareMutate(): void {
		if (
			undefined === this._keyMapBuilder ||
			undefined === this._indicatorMapBuilder
		) {
			if (undefined !== this.#source) {
				const source = this.#source as unknown as OrderedMapNonEmpty<K, V>;
				this._keyMapBuilder =
					source.keyIndicatorMap.toBuilder() as unknown as MapCollection.Builder<
						K,
						readonly [V, Indicator]
					>;
				this._indicatorMapBuilder =
					source.indicatorKeyMap.toBuilder() as unknown as SortedMap.Builder<
						Indicator,
						readonly [K, V]
					>;
			} else {
				this._keyMapBuilder = this.context.keyMapContext.keyedContext.builder<
					K,
					readonly [V, Indicator]
				>() as unknown as MapCollection.Builder<K, readonly [V, Indicator]>;
				this._indicatorMapBuilder =
					this.context.indicatorMapContext.keyedContext.builder<
						Indicator,
						readonly [K, V]
					>() as unknown as SortedMap.Builder<Indicator, readonly [K, V]>;
			}
		}
	}

	get keyMapBuilder(): MapCollection.Builder<K, readonly [V, Indicator]> {
		this.#prepareMutate();
		return this._keyMapBuilder!;
	}

	get indicatorMapBuilder(): SortedMap.Builder<Indicator, readonly [K, V]> {
		this.#prepareMutate();
		return this._indicatorMapBuilder!;
	}

	get size(): number {
		if (undefined !== this.#source) return this.#source.size;
		if (undefined === this._keyMapBuilder) return 0;
		return this._keyMapBuilder.size;
	}

	#resetFrom(map: OrderedMap<K, V>): void {
		this._keyMapBuilder = undefined;
		this._indicatorMapBuilder = undefined;

		this.#source = map.nonEmpty()
			? (map as unknown as OrderedMapNonEmpty<K, V>)
			: undefined;
	}

	indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
	indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
	indexOf<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
	): number | O | undefined {
		return this.build().indexOf(key as K, otherwise as any);
	}

	at<O>(index: number, otherwise?: OptLazy<O>): readonly [K, V] | O {
		return this.build().at(index, otherwise as any) as readonly [K, V] | O;
	}

	first<O>(otherwise?: OptLazy<O>): readonly [K, V] | O {
		return this.at(0, otherwise as any);
	}

	last<O>(otherwise?: OptLazy<O>): readonly [K, V] | O {
		return this.at(-1, otherwise as any);
	}

	prepend = (element: readonly [K, V]): void => {
		this.checkLock();
		this.#resetFrom(this.build().prepend(element));
	};

	append = (element: readonly [K, V]): void => {
		this.checkLock();
		this.#resetFrom(this.build().append(element));
	};

	prependEach = (source: StreamSource<readonly [K, V]>): void => {
		this.checkLock();

		const items = Stream.from(source).toArray();
		if (items.length === 0) return;

		let current = this.build();
		for (let i = items.length - 1; i >= 0; i--) {
			current = current.prepend(items[i]);
		}

		this.#resetFrom(current);
	};

	appendEach = (source: StreamSource<readonly [K, V]>): void => {
		this.checkLock();

		let current = this.build();
		let changed = false;

		for (const item of Stream.from(source)) {
			current = current.append(item);
			changed = true;
		}

		if (changed) this.#resetFrom(current);
	};

	placeAt = (index: number, element: readonly [K, V]): void => {
		this.checkLock();
		this.#resetFrom(this.build().placeAt(index, element));
	};

	moveTo = (index: number, key: K): boolean => {
		this.checkLock();

		const current = this.build();
		const next = current.moveTo(index, key);
		if (next === current) return false;

		this.#resetFrom(next);

		return true;
	};

	swapAt = (index1: number, index2: number): boolean => {
		this.checkLock();

		const current = this.build();
		const next = current.swapAt(index1, index2);
		if (next === current) return false;

		this.#resetFrom(next);

		return true;
	};

	removeAt = (index: number, otherwise?: any): any => {
		this.checkLock();

		const current = this.build();
		const entry = current.at(index);
		if (undefined === entry) return OptLazyValue(otherwise);

		this.#resetFrom(current.removeAt(index));

		return entry;
	};

	removeAmountAt = (index: number, amount: number, collector?: any): any => {
		this.checkLock();

		const current = this.build();
		const next = current.removeAt(index, amount);
		if (next === current) {
			return collector === undefined
				? false
				: Stream.empty<readonly [K, V]>().reduce(collector);
		}

		if (collector !== undefined) {
			const collected = current
				.slice({ start: index, amount })
				.stream()
				.reduce(collector);
			this.#resetFrom(next);
			return collected;
		}

		this.#resetFrom(next);

		return true;
	};

	removeAllAt = (indices: StreamSource<number>, collector?: any): any => {
		this.checkLock();

		const current = this.build();
		const sorted = Stream.from(indices)
			.toArray()
			.slice()
			.sort((a: number, b: number) => b - a);

		let next = current;
		let changed = false;
		const collected: (readonly [K, V])[] = [];

		for (const index of sorted) {
			const entry = next.at(index);
			if (undefined === entry) continue;
			collected.push(entry);
			next = next.removeAt(index);
			changed = true;
		}

		if (!changed) {
			return collector === undefined
				? false
				: Stream.empty<readonly [K, V]>().reduce(collector);
		}

		this.#resetFrom(next);

		if (collector !== undefined) {
			return Stream.from(collected).reduce(collector);
		}

		return true;
	};

	get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
	get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
	get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O | undefined {
		if (undefined !== this.#source) {
			return this.#source.get(key, otherwise as any);
		}

		const entry = this.keyMapBuilder.get(key as K);
		if (undefined === entry) return OptLazyValue(otherwise);

		return entry[0];
	}

	has = <UK = K>(key: RelatedTo<K, UK>): boolean => {
		if (undefined !== this.#source) return this.#source.has(key);
		return this.keyMapBuilder.has(key);
	};

	#nextIndicator(): Indicator {
		const last = this.indicatorMapBuilder.max();
		if (undefined === last) return Indicator.INIT_INDICATOR;
		return Indicator.after(last[0]);
	}

	set = (key: K, value: V): boolean => {
		return this.add([key, value]);
	};

	add = (entry: readonly [K, V]): boolean => {
		this.checkLock();

		const [key, value] = entry;

		let appendedIndicator: Indicator | undefined;
		let inPlaceIndicator: Indicator | undefined;

		const changed = this.keyMapBuilder.modifyAtKey(key, {
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

		if (!changed) return false;

		this.#source = undefined;

		if (undefined !== appendedIndicator) {
			this.indicatorMapBuilder.set(appendedIndicator, [key, value]);
		} else if (undefined !== inPlaceIndicator) {
			this.indicatorMapBuilder.set(inPlaceIndicator, [key, value]);
		}

		return true;
	};

	addEach = (
		entries: StreamSource<readonly [K, V]>,
		options?: OrderedBulkOptions,
	): boolean => {
		this.checkLock();

		const position = options?.position ?? 'preserve';

		if (position !== 'preserve') {
			const current = this.build();
			const next = current.addEach(entries, options);
			if (next === current) return false;

			this.#resetFrom(next);

			return true;
		}

		let changed = false;
		const iter = Stream.from(entries)[Symbol.iterator]();
		const done = Symbol();
		let entry: readonly [K, V] | typeof done;

		while (done !== (entry = iter.fastNext(done))) {
			if (this.add(entry)) changed = true;
		}

		return changed;
	};

	removeKey = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
		this.checkLock();

		const token = Symbol();
		const entry = this.keyMapBuilder.removeKey(key, token);

		if (token === entry) return OptLazyValue(otherwise) as O;

		this.#source = undefined;
		this.indicatorMapBuilder.removeKey(entry[1]);

		return entry[0];
	};

	removeKeys = <UK>(keys: StreamSource<RelatedTo<K, UK>>): boolean => {
		this.checkLock();

		let changed = false;
		const iter = Stream.from(keys)[Symbol.iterator]();
		const token = Symbol();
		let key: RelatedTo<K, UK> | typeof token;

		while (token !== (key = iter.fastNext(token))) {
			if (token !== this.removeKey(key, token)) changed = true;
		}

		return changed;
	};

	modifyAtKey = (key: K, options: ModifyOptions<V>): boolean => {
		this.checkLock();

		if (checkEmptyModifyOptions(options)) return false;

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

		const changed = this.keyMapBuilder.modifyAtKey(key, modifyOptions);

		if (!changed) return false;

		this.#source = undefined;

		if (undefined !== removedIndicator) {
			this.indicatorMapBuilder.removeKey(removedIndicator);
		}
		if (undefined !== appendedIndicator) {
			this.indicatorMapBuilder.set(appendedIndicator, [
				key,
				appendedValue as V,
			]);
		} else if (undefined !== inPlaceIndicator) {
			this.indicatorMapBuilder.set(inPlaceIndicator, [key, inPlaceValue as V]);
		}

		return true;
	};

	updateAtKey = <UK, O>(
		key: RelatedTo<K, UK>,
		update: (value: V) => V,
		otherwise?: OptLazy<O>,
	): [V | O, V | O] => {
		let result: [V, V] | undefined;

		const changed = this.modifyAtKey(key as K, {
			ifExists: {
				update: (value, _remove) => {
					const newValue = update(value);
					result = [value, newValue];

					return newValue;
				},
			},
		});

		if (changed) this.#source = undefined;

		if (undefined !== result) return result;

		const otherwiseValue = OptLazyValue(otherwise) as O;

		return [otherwiseValue, otherwiseValue];
	};

	forEach = (f: (entry: readonly [K, V]) => void): void => {
		this.startIteration();

		try {
			if (undefined !== this.#source) {
				this.#source.forEach(f);
				return;
			}

			this.indicatorMapBuilder.forEach(([, entry]) => {
				f(entry);
			});
		} finally {
			this.endIteration();
		}
	};

	buildMapValues = <V2>(f: (value: V, key: K) => V2): OrderedMap<K, V2> => {
		if (undefined !== this.#source) return this.#source.mapValues(f);
		if (this.size === 0) return this.context.empty();

		const keyMap = this.keyMapBuilder.buildMapValues(
			([value, indicator], key) => [f(value, key), indicator] as const,
		);
		const indicatorMap = this.indicatorMapBuilder.buildMapValues(
			([key, value]) => [key, f(value, key)] as const,
		);

		return this.context.createNonEmpty<K, V2>(
			keyMap.assumeNonEmpty(),
			indicatorMap.assumeNonEmpty(),
		);
	};

	build = (): OrderedMap<K, V> => {
		if (undefined !== this.#source) return this.#source;
		if (this.size === 0) return this.context.empty();

		return this.context.createNonEmpty<K, V>(
			this.keyMapBuilder.build().assumeNonEmpty(),
			this.indicatorMapBuilder.build().assumeNonEmpty(),
		);
	};

	clear = (): void => {
		this.checkLock();
		this.#source = undefined;
		this._keyMapBuilder = undefined;
		this._indicatorMapBuilder = undefined;
	};
}
