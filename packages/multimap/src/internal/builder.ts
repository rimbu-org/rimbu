import type { MapCollection } from '@rimbu/collection-types/map';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { OptLazy, RelatedTo } from '@rimbu/common';
import type { MultiMap } from '@rimbu/multimap';
import type { StreamSource } from '@rimbu/stream';

import type { MultiMapContextImpl } from '#multimap/context-factory';

import { CollectionBuilderBase } from '@rimbu/collection-types/advanced/collection-base';
import { OptLazy as unwrapOptLazy } from '@rimbu/common/opt-lazy';
import { Stream } from '@rimbu/stream';

/**
 * The internal key map, `K` → a mutable value set.
 *
 * Deliberately looser than the public `keyMap` view: the concrete backing types
 * come from the context, and threading them through the builder's generic
 * parameters buys no safety that the public API does not already provide.
 */
type KeyMapBuilder<K, V> = MapCollection.Builder<K, SetCollection.Builder<V>>;

export class MultiMapBuilder<K, V>
	extends CollectionBuilderBase<readonly [K, V], MultiMap.Advanced.Family<K, V>>
	implements MultiMap.Builder<K, V>
{
	#size = 0;

	/**
	 * While set, the builder is an untouched view over this instance: no key map
	 * has been materialised and `build` can return it directly. The first
	 * mutation clears it.
	 */
	#source: MultiMap.NonEmpty<K, V> | undefined;

	#keyMap: KeyMapBuilder<K, V> | undefined;

	constructor(
		readonly context: MultiMapContextImpl<K, V>,
		source?: MultiMap.NonEmpty<K, V>,
	) {
		super();
		if (undefined !== source) {
			this.#source = source;
			this.#size = source.size;
		}
	}

	get keyMap(): KeyMapBuilder<K, V> {
		if (undefined === this.#keyMap) {
			this.#keyMap =
				undefined === this.#source
					? (this.context.keyMapContext.builder() as unknown as KeyMapBuilder<
							K,
							V
						>)
					: (this.#source.keyMap
							.mapValues((values) => values.toBuilder())
							.toBuilder() as unknown as KeyMapBuilder<K, V>);
		}

		return this.#keyMap;
	}

	get size(): number {
		return this.#size;
	}

	#invalidate(): void {
		this.#source = undefined;
	}

	getValues = <UK = K>(key: RelatedTo<K, UK>): SetCollection<V> => {
		return (
			this.#source?.getValues(key) ??
			this.keyMap.get(key)?.build() ??
			this.context.keyMapValuesContext.empty()
		);
	};

	has = <UK = K>(key: RelatedTo<K, UK>): boolean => {
		return this.#source?.has(key) ?? this.keyMap.has(key);
	};

	hasEntry = <UK = K>(key: RelatedTo<K, UK>, value: V): boolean => {
		return (
			this.#source?.hasEntry(key, value) ??
			this.keyMap.get(key)?.has(value) ??
			false
		);
	};

	count = <UK = K>(key: RelatedTo<K, UK>): number => {
		return this.getValues(key).size;
	};

	addTo = (key: K, value: V): boolean => {
		this.checkLock();

		let changed = true;

		this.keyMap.modifyAtKey(key, {
			ifNew: {
				create: () => {
					this.#size++;
					const valueBuilder = this.context.keyMapValuesContext.builder();
					valueBuilder.add(value);
					return valueBuilder as SetCollection.Builder<V>;
				},
			},
			ifExists: {
				update: (valueBuilder) => {
					this.#size -= valueBuilder.size;
					changed = valueBuilder.add(value);
					this.#size += valueBuilder.size;
					return valueBuilder;
				},
			},
		});

		if (changed) this.#invalidate();

		return changed;
	};

	addEach = (source: StreamSource<readonly [K, V]>): boolean => {
		this.checkLock();

		return Stream.applyFilter(source, { pred: this.addTo }).count() > 0;
	};

	setEachValue = (key: K, source: StreamSource<V>): boolean => {
		this.checkLock();

		const values = this.context.keyMapValuesContext
			.from(source)
			.toBuilder() as SetCollection.Builder<V>;
		const size = values.size;

		// Setting no values is the same as removing the key: a MultiMap never
		// stores an empty value set.
		if (size <= 0) return !this.#removeKey(key).isEmpty;

		let changed = false;

		this.keyMap.modifyAtKey(key, {
			ifNew: {
				create: () => {
					changed = true;
					this.#size += size;
					this.#invalidate();
					return values;
				},
			},
			ifExists: {
				update: (oldValues) => {
					// Reports *replacement*, not "the contents differ": writing the
					// values a key already has still reports `true`, which is the
					// behaviour this method has always had. Only an absent key
					// reports `false`.
					changed = true;
					this.#size -= oldValues.size;
					this.#size += size;
					this.#invalidate();
					return values;
				},
			},
		});

		return changed;
	};

	addEachValue = (key: K, values: StreamSource<V>): boolean => {
		this.checkLock();

		const valueSet = this.context.keyMapValuesContext.from(values);
		if (!valueSet.nonEmpty()) return false;

		const prevSize = this.#size;

		this.keyMap.modifyAtKey(key, {
			ifNew: {
				create: () => {
					this.#size += valueSet.size;
					this.#invalidate();
					return valueSet.toBuilder() as SetCollection.Builder<V>;
				},
			},
			ifExists: {
				update: (current) => {
					const wasSize = current.size;
					let changed = false;
					valueSet.stream().forEach((v) => {
						if (current.add(v)) changed = true;
					});
					if (changed) {
						this.#size -= wasSize;
						this.#size += current.size;
						this.#invalidate();
					}
					return current;
				},
			},
		});

		return this.#size !== prevSize;
	};

	removeEntry = <UK = K, UV = V>(
		key: RelatedTo<K, UK>,
		value: RelatedTo<V, UV>,
	): boolean => {
		this.checkLock();

		if (!this.context.keyMapContext.isValidKey(key)) return false;

		let changed = false;

		this.keyMap.modifyAtKey(key as K, {
			ifExists: {
				update: (valueBuilder, remove) => {
					if (valueBuilder.remove(value as V)) {
						this.#size--;
						changed = true;
					}
					if (valueBuilder.size <= 0) return remove;
					return valueBuilder;
				},
			},
		});

		if (changed) this.#invalidate();

		return changed;
	};

	removeEntries = <UK = K, UV = V>(
		entries: StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>,
	): boolean => {
		this.checkLock();

		return Stream.applyFilter(entries, { pred: this.removeEntry }).count() > 0;
	};

	#removeKey = <UK = K>(key: RelatedTo<K, UK>): SetCollection<V> => {
		this.checkLock();

		if (!this.context.keyMapContext.isValidKey(key)) {
			return this.context.keyMapValuesContext.empty();
		}

		let removed: SetCollection<V> | undefined;

		const changed = this.keyMap.modifyAtKey(key as K, {
			ifExists: {
				update: (valueBuilder, remove) => {
					removed = valueBuilder.build().assumeNonEmpty();
					this.#size -= valueBuilder.size;
					return remove;
				},
			},
		});

		if (changed) this.#invalidate();

		return removed ?? this.context.keyMapValuesContext.empty();
	};

	/**
	 * Removes the key and hands back the value set stored at it. An **empty set**
	 * means "this key was not present" — the MultiMap counterpart of the
	 * `undefined` a `MapCollection` builder returns.
	 */
	removeKey<UK = K>(key: RelatedTo<K, UK>): SetCollection<V>;
	removeKey<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise: OptLazy<O>,
	): SetCollection<V> | O;
	removeKey<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
	): SetCollection<V> | O {
		const removed = this.#removeKey(key);

		if (undefined === otherwise) return removed;

		return removed.isEmpty ? (unwrapOptLazy(otherwise) as O) : removed;
	}

	removeKeys = <UK = K>(keys: StreamSource<RelatedTo<K, UK>>): boolean => {
		this.checkLock();

		let changed = false;

		Stream.from(keys).forEach((key) => {
			if (!this.#removeKey(key).isEmpty) changed = true;
		});

		return changed;
	};

	buildMapValues = <V2 extends V>(
		mapFun: (value: V, key: K) => V2,
	): MultiMap<K, V2> => {
		const builder = this.context.builder<readonly [K, V2]>();

		this.forEach(([key, value]) => {
			builder.addTo(key, mapFun(value, key));
		});

		return builder.build();
	};

	forEach = (f: (entry: readonly [K, V]) => void): void => {
		// The lock must be held on *both* paths — serving straight from `#source`
		// included — or a mutation inside the callback would go undetected.
		this.startIteration();
		try {
			if (undefined !== this.#source) {
				this.#source.forEach(f);
				return;
			}

			this.keyMap.forEachIndexed(([key, values]) => {
				values.forEach((value) => {
					f([key, value] as const);
				});
			});
		} finally {
			this.endIteration();
		}
	};

	clear = (): void => {
		this.#size = 0;
		this.#source = undefined;
		this.#keyMap = undefined;
	};

	build = (): MultiMap<K, V> => {
		if (undefined !== this.#source) return this.#source;
		if (this.isEmpty) return this.context.empty<readonly [K, V]>();
		return this.context.createNonEmpty(
			this.keyMap
				.buildMapValues((values) => values.build().assumeNonEmpty())
				.assumeNonEmpty() as unknown as MapCollection.NonEmpty<
				K,
				SetCollection.NonEmpty<V>
			>,
			this.size,
		) as unknown as MultiMap<K, V>;
	};
}
