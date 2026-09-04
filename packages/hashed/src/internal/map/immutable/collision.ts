import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common/types';
import type { HashMap } from '@rimbu/hashed/map';
import type { List } from '@rimbu/list';
import type { Stream } from '@rimbu/stream';

import type { HashMapCollectionContext } from '#map/context';

import * as RimbuError from '@rimbu/base/rimbu-error';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { OptLazy } from '@rimbu/common/opt-lazy';

import { HashMapNonEmptyBase } from '#map/immutable/non-empty';

export class HashMapCollision<K, V> extends HashMapNonEmptyBase<K, V> {
	constructor(
		readonly context: HashMapCollectionContext<K>,
		readonly entries: List.NonEmpty<readonly [K, V]>,
	) {
		super(context);
	}

	get size(): number {
		return this.entries.length;
	}

	copy(entries = this.entries): HashMapCollision<K, V> {
		if (entries === this.entries) return this;
		return new HashMapCollision(this.context, entries);
	}

	stream(): Stream.NonEmpty<readonly [K, V]> {
		return this.entries.stream();
	}

	get<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
		_keyHash?: number,
	): V | O {
		if (!this.context.hasher.isValid(key)) return OptLazy(otherwise) as O;

		const token = Symbol();
		const stream = this.stream();
		const foundEntry = stream.find(
			(entry): boolean => this.context.eq(entry[0], key),
			{
				otherwise: token,
			} as const,
		);

		if (token === foundEntry) return OptLazy(otherwise) as O;

		return foundEntry[1];
	}

	addInternal(entry: readonly [K, V], _hash?: number): HashMapCollision<K, V> {
		const currentIndex = this.stream().indexWhere((currentEntry): boolean =>
			this.context.eq(currentEntry[0], entry[0]),
		);

		if (undefined === currentIndex) {
			return this.copy(this.entries.append(entry));
		}

		return this.copy(
			this.entries.updateAt(currentIndex, (currentEntry): readonly [K, V] => {
				if (Object.is(currentEntry[1], entry[1])) return currentEntry;
				return entry;
			}),
		);
	}

	add(entry: readonly [K, V], hash?: number): HashMapCollision<K, V> {
		return this.addInternal(entry, hash);
	}

	modifyAtKey(
		atKey: K,
		options: ModifyOptions<V>,
		_atKeyHash?: number,
	): HashMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;

		const { ifNew, ifExists } = options;

		const currentIndex = this.stream().indexWhere((entry): boolean =>
			this.context.eq(entry[0], atKey),
		);

		if (undefined === currentIndex) {
			if (undefined === ifNew) return this;

			const { set, create } = ifNew;
			const token = Symbol();
			const newValue = create !== undefined ? create(token) : set;

			if (token === newValue) return this;

			const newEntries = this.entries.append([atKey, newValue as V]);
			return this.copy(newEntries);
		}

		if (undefined === ifExists) return this;
		const { set, update } = ifExists;

		const currentEntry = this.entries.at(
			currentIndex,
			RimbuError.throwInvalidStateError,
		);
		const currentValue = currentEntry[1];
		const token = Symbol();
		const newValue = update !== undefined ? update(currentValue, token) : set;

		if (token === newValue) {
			const newEntries = this.entries.remove(currentIndex).assumeNonEmpty();
			// if last entry removed, this collision would be empty, but collision is always non-empty; caller will handle collapsing
			// For consistency with block logic, if size would become 0, we need to return empty? But collision size 1 removal handled by caller.
			// Here we just return copy; if newEntries is empty, it would throw, but that case is handled by block's collapse logic.
			if (newEntries.length === 0) return this.context.empty();
			return this.copy(newEntries);
		}

		if (Object.is(newValue, currentValue)) return this;

		const newEntry: [K, V] = [atKey, newValue as V];
		const newEntries = this.entries.with(currentIndex, newEntry);
		return this.copy(newEntries);
	}

	forEach(f: (entry: readonly [K, V]) => void): void {
		this.entries.forEach(f);
	}

	mapValues<V2>(mapFun: (value: V, key: K) => V2): HashMapCollision<K, V2> {
		const newEntries = this.entries.map((e): readonly [K, V2] => [
			e[0],
			mapFun(e[1], e[0]),
		]);
		return new HashMapCollision(this.context, newEntries);
	}

	toArray(): ArrayNonEmpty<readonly [K, V]> {
		return this.entries.toArray();
	}
}
