import type { RMap } from '@rimbu/collection-types';
import type { TraverseState } from '@rimbu/common';
import type { RelatedTo } from '@rimbu/common/types';
import type { OrderedMap } from '@rimbu/ordered/map';
import type { SortedMap } from '@rimbu/sorted';

import type { OrderedMapBase } from '#map/base';
import type { ContextImpl } from '#map/context-factory';
import type { OrderedMapNonEmpty } from '#map/non-empty';

import * as RimbuError from '@rimbu/base/rimbu-error';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream, type StreamSource } from '@rimbu/stream';

import { Indicator } from '#ordered/common/ordered-indicator';

export class OrderedMapBuilder<K, V> implements OrderedMapBase.Builder<K, V> {
	constructor(
		readonly context: ContextImpl<K>,
		public source?: OrderedMapNonEmpty<K, V>,
	) {}

	_keyMapBuilder?: RMap.Builder<K, [V, Indicator]>;
	_indicatorMapBuilder?: SortedMap.Builder<Indicator, [K, V]>;

	_lock = false;

	checkLock(): void {
		if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
	}

	prepareMutate(): void {
		if (
			undefined === this._keyMapBuilder ||
			undefined === this._indicatorMapBuilder
		) {
			if (undefined !== this.source) {
				this._keyMapBuilder = this.source.keyIndicatorMap.toBuilder();
				this._indicatorMapBuilder = this.source.indicatorKeyMap.toBuilder();
			} else if (undefined === this._keyMapBuilder) {
				this._keyMapBuilder = this.context.keyMapContext.builder();
				this._indicatorMapBuilder = this.context.indicatorMapContext.builder();
			}
		}
	}

	get keyMapBuilder(): RMap.Builder<K, [V, Indicator]> {
		this.prepareMutate();
		return this._keyMapBuilder!;
	}

	get indicatorMapBuilder(): SortedMap.Builder<Indicator, [K, V]> {
		this.prepareMutate();
		return this._indicatorMapBuilder!;
	}

	get size(): number {
		return this.source?.size ?? this.keyMapBuilder.size;
	}

	get isEmpty(): boolean {
		return this.size === 0;
	}

	hasKey = <UK>(key: RelatedTo<K, UK>): boolean => {
		return this.source?.hasKey(key) ?? this.keyMapBuilder.hasKey(key);
	};

	at = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
		if (undefined !== this.source) return this.source.at(key, otherwise!);

		const entry = this.keyMapBuilder.at(key);
		if (undefined === entry) return OptLazy(otherwise!);

		return entry[0];
	};

	set = (key: K, value: V): boolean => {
		return this.addEntry([key, value]);
	};

	#nextIndicator(): Indicator {
		const lastIndicator = this.indicatorMapBuilder.max();
		if (undefined === lastIndicator) return Indicator.INIT_INDICATOR;
		return Indicator.after(lastIndicator[0]);
	}

	addEntry = (entry: readonly [K, V]): boolean => {
		this.checkLock();

		const [key, value] = entry;

		let oldIndicator: Indicator | undefined;
		let newEntry: [V, Indicator] | undefined;

		const modified = this.keyMapBuilder.modifyAt(key, {
			ifNew: {
				create: () => {
					newEntry = [value, this.#nextIndicator()];
					return newEntry;
				},
			},
			ifExists: {
				update: (entry) => {
					const [currentValue, currentIndicator] = entry;
					if (Object.is(currentValue, value)) return entry;

					oldIndicator = currentIndicator;
					newEntry = [value, this.#nextIndicator()];
					return newEntry;
				},
			},
		});

		if (!modified) {
			return false;
		}

		if (undefined !== oldIndicator) {
			this.indicatorMapBuilder.removeKey(oldIndicator);
		}

		if (undefined !== newEntry) {
			this.indicatorMapBuilder.set(newEntry[1], [key, newEntry[0]]);
		}

		return true;
	};

	addEntries = (entries: StreamSource<readonly [K, V]>): boolean => {
		this.checkLock();

		return Stream.from(entries).filterPure({ pred: this.addEntry }).count() > 0;
	};

	removeKey = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
		this.checkLock();

		if (!this.context.isValidKey(key)) {
			return OptLazy(otherwise) as O;
		}

		const removeResult = this.keyMapBuilder.removeKey(key);

		if (undefined === removeResult) {
			return OptLazy(otherwise) as O;
		}

		this.source = undefined;
		const [removedValue, removedIndicator] = removeResult;

		this.indicatorMapBuilder.removeKey(removedIndicator);

		return removedValue;
	};

	removeKeys = <UK>(keys: StreamSource<RelatedTo<K, UK>>): boolean => {
		this.checkLock();

		const notFound = Symbol();

		return (
			Stream.from(keys)
				.mapPure(this.removeKey, notFound)
				.countElement(notFound, { negate: true }) > 0
		);
	};

	updateAt = <O>(
		key: K,
		update: (value: V) => V,
		otherwise?: OptLazy<O>,
	): V | O => {
		let oldValue: V;
		let found = false;

		this.modifyAt(key, {
			ifExists: {
				update: (value): V => {
					oldValue = value;
					found = true;
					return update(value);
				},
			},
		});

		if (!found) return OptLazy(otherwise) as O;

		this.source = undefined;

		return oldValue!;
	};

	modifyAt = (key: K, options: ModifyOptions<V>): boolean => {
		this.checkLock();

		if (checkEmptyModifyOptions(options)) return false;

		const { ifNew, ifExists } = options;

		const modifyOptions: ModifyOptions<[V, Indicator]> = {};

		let previousIndicator: Indicator | undefined;
		let newEntry: [V, Indicator] | undefined;

		if (undefined !== ifNew) {
			modifyOptions.ifNew = {
				create: (skip) => {
					const { set, create } = ifNew;

					if (undefined !== create) {
						const newValue = create(skip);
						if (skip === newValue) return skip;
						newEntry = [newValue as V, this.#nextIndicator()];
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
					const [currentValue] = currentEntry;

					const { set, update } = ifExists;

					if (undefined !== update) {
						const newValue = update(currentValue, remove);
						if (remove === newValue) return remove;
						if (Object.is(currentValue, newValue)) return currentEntry;

						newEntry = [newValue as V, this.#nextIndicator()];
						return newEntry;
					}

					if (Object.is(currentValue, set)) return currentEntry;

					newEntry = [set!, this.#nextIndicator()];
					return newEntry;
				},
			};
		}

		const changed = this.keyMapBuilder.modifyAt(key, modifyOptions);

		if (!changed) return false;

		this.source = undefined;

		if (undefined !== previousIndicator) {
			this.indicatorMapBuilder.removeKey(previousIndicator);
		}

		if (undefined !== newEntry) {
			this.indicatorMapBuilder.set(newEntry[1], [key, newEntry[0]]);
		}

		return true;
	};

	forEach = (
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
		options?: { reversed?: boolean; state?: TraverseState },
	): void => {
		this._lock = true;

		if (undefined !== this.source) this.source.forEach(f, options);
		else {
			this.indicatorMapBuilder.forEach(([_, entry], index, halt): void => {
				f(entry, index, halt);
			}, options);
		}

		this._lock = false;
	};

	buildMapValues = <V2>(f: (value: V, key: K) => V2): OrderedMap<K, V2> => {
		if (undefined !== this.source) return this.source.mapValues<V2>(f) as any;

		if (this.size === 0) return this.context.empty();

		const keyMap = this.keyMapBuilder
			.buildMapValues(
				([value, indicator], key) =>
					[f(value, key), indicator] as [V2, Indicator],
			)
			.assumeNonEmpty();
		const indicatorMap = this.indicatorMapBuilder
			.buildMapValues(([key, value]) => [key, f(value, key)] as [K, V2])
			.assumeNonEmpty();

		return this.context.createNonEmpty<K, V2>(keyMap, indicatorMap) as any;
	};

	build = (): OrderedMap<K, V> => {
		if (undefined !== this.source) return this.source as any;
		if (this.size === 0) return this.context.empty();

		const keyMap = this.keyMapBuilder.build().assumeNonEmpty();
		const indicatorMap = this.indicatorMapBuilder.build().assumeNonEmpty();

		return this.context.createNonEmpty<K, V>(keyMap, indicatorMap) as any;
	};
}
