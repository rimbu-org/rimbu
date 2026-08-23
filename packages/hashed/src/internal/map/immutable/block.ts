import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common/types';
import type { HashMap } from '@rimbu/hashed/map';

import type { HashMapContext } from '#map/context';
import type { HashMapCollision } from '#map/immutable/collision';

import * as RimbuError from '@rimbu/base/rimbu-error';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream } from '@rimbu/stream';

import { HashMapNonEmptyBase } from '#map/immutable/non-empty';

export type MapEntrySet<K, V> = HashMapBlock<K, V> | HashMapCollision<K, V>;

export class HashMapBlock<K, V> extends HashMapNonEmptyBase<K, V> {
	constructor(
		readonly context: HashMapContext<K>,
		readonly entries: readonly (readonly [K, V])[] | null,
		readonly entrySets: readonly MapEntrySet<K, V>[] | null,
		readonly size: number,
		readonly level: number,
	) {
		super();
	}

	copy(
		entries = this.entries,
		entrySets = this.entrySets,
		size = this.size,
	): HashMapBlock<K, V> {
		if (
			entries === this.entries &&
			entrySets === this.entrySets &&
			size === this.size
		) {
			return this;
		}
		return new HashMapBlock(this.context, entries, entrySets, size, this.level);
	}

	stream(): Stream.NonEmpty<readonly [K, V]> {
		if (null !== this.entries) {
			if (null === this.entrySets)
				return Stream.fromObjectValues(this.entries) as Stream.NonEmpty<[K, V]>;

			return Stream.fromObjectValues(this.entries).concat(
				Stream.fromObjectValues(this.entrySets).flatMap(
					(entrySet: MapEntrySet<K, V>): Stream.NonEmpty<readonly [K, V]> =>
						entrySet.stream(),
				),
			) as Stream.NonEmpty<readonly [K, V]>;
		}

		if (null === this.entrySets) RimbuError.throwInvalidStateError();

		return Stream.fromObjectValues(this.entrySets).flatMap(
			(entrySet: MapEntrySet<K, V>): Stream.NonEmpty<readonly [K, V]> =>
				entrySet.stream(),
		) as Stream.NonEmpty<readonly [K, V]>;
	}

	get<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
		hash?: number,
	): V | O {
		if (!this.context.hasher.isValid(key)) return OptLazy(otherwise) as O;
		const keyHash = hash ?? this.context.hash(key);

		const atKeyIndex = this.context.getKeyIndex(this.level, keyHash);

		if (null !== this.entries && atKeyIndex in this.entries) {
			const entry = this.entries[atKeyIndex];
			if (this.context.eq(entry[0], key)) return entry[1];
			return OptLazy(otherwise) as O;
		}

		if (null !== this.entrySets && atKeyIndex in this.entrySets) {
			const entrySet = this.entrySets[atKeyIndex];
			return entrySet.get(key, otherwise, keyHash);
		}

		return OptLazy(otherwise) as O;
	}

	add(
		entry: readonly [K, V],
		hash = this.context.hash(entry[0]),
	): HashMapBlock<K, V> {
		const atKeyIndex = this.context.getKeyIndex(this.level, hash);

		if (null !== this.entries && atKeyIndex in this.entries) {
			const currentEntry = this.entries[atKeyIndex];

			if (this.context.eq(entry[0], currentEntry[0])) {
				if (Object.is(entry[1], currentEntry[1])) return this;

				const newEntries = this.entries.slice();
				newEntries[atKeyIndex] = entry;
				return this.copy(newEntries);
			}

			let newEntries: (readonly [K, V])[] | null = this.entries.slice();
			delete newEntries[atKeyIndex];

			let isEmpty = true;
			for (const _ in newEntries) {
				isEmpty = false;
				break;
			}
			if (isEmpty) newEntries = null;

			if (this.level < this.context.maxDepth) {
				const newEntrySet = this.context
					.block<K, V>(null, null, 0, this.level + 1)
					.add(currentEntry)
					.add(entry, hash);

				const newEntrySets =
					null === this.entrySets ? [] : this.entrySets.slice();
				newEntrySets[atKeyIndex] = newEntrySet;

				return this.copy(newEntries, newEntrySets, this.size + 1);
			}

			const newEntrySet = this.context.collision<K, V>(
				this.context.listContext.of(currentEntry, entry),
			);
			const newEntrySets =
				null === this.entrySets ? [] : this.entrySets.slice();
			newEntrySets[atKeyIndex] = newEntrySet;

			return this.copy(newEntries, newEntrySets, this.size + 1);
		}

		if (null !== this.entrySets && atKeyIndex in this.entrySets) {
			const currentEntrySet = this.entrySets[atKeyIndex];
			const newEntrySet = currentEntrySet.add(entry, hash);
			if (newEntrySet === currentEntrySet) return this;

			const newEntrySets = this.entrySets.slice();
			newEntrySets[atKeyIndex] = newEntrySet;

			return this.copy(
				undefined,
				newEntrySets,
				this.size + newEntrySet.size - currentEntrySet.size,
			);
		}

		const newEntries = null === this.entries ? [] : this.entries.slice();
		newEntries[atKeyIndex] = entry;

		return this.copy(newEntries, undefined, this.size + 1);
	}

	modifyAt(
		atKey: K,
		options: ModifyOptions<V>,
		atKeyHash = this.context.hash(atKey),
	): HashMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;

		const { ifNew, ifExists } = options;
		const atKeyIndex = this.context.getKeyIndex(this.level, atKeyHash);

		if (null !== this.entries && atKeyIndex in this.entries) {
			const currentEntry = this.entries[atKeyIndex];

			if (this.context.eq(atKey, currentEntry[0])) {
				// exact key match
				if (undefined === ifExists) return this;
				const { set, update } = ifExists;
				const currentValue = currentEntry[1];
				const token = Symbol();
				const newValue =
					update !== undefined ? update(currentValue, token) : set;

				if (Object.is(newValue, currentValue)) return this;

				const newEntries = this.entries.slice();

				if (token === newValue) {
					delete newEntries[atKeyIndex];

					for (const _ in newEntries) {
						return this.copy(newEntries, undefined, this.size - 1);
					}

					if (this.size === 1) return this.context.empty();

					return this.copy(null, undefined, this.size - 1);
				}

				newEntries[atKeyIndex] = [atKey, newValue as V];
				return this.copy(newEntries);
			}

			// no exact match, but key collision
			if (undefined === ifNew) return this;

			const { set, create } = ifNew;
			const token = Symbol();
			const newValue = create !== undefined ? create(token) : set;

			if (token === newValue) return this;

			let newEntries: (readonly [K, V])[] | null = this.entries.slice();
			delete newEntries[atKeyIndex];

			let isEmpty = true;
			for (const _ in newEntries) {
				isEmpty = false;
				break;
			}
			if (isEmpty) newEntries = null;

			if (this.level < this.context.maxDepth) {
				// create next level block
				const newEntrySet = this.context
					.block(null, null, 0, this.level + 1)
					.add(currentEntry)
					.set(atKey, newValue) as unknown as MapEntrySet<K, V>;

				const newEntrySets =
					null === this.entrySets ? [] : this.entrySets.slice();
				newEntrySets[atKeyIndex] = newEntrySet;

				return this.copy(newEntries, newEntrySets, this.size + 1);
			}

			// create collision
			const newEntry: [K, V] = [atKey, newValue as V];
			const newEntrySet = this.context.collision<K, V>(
				this.context.listContext.of(currentEntry, newEntry),
			);
			const newEntrySets =
				null === this.entrySets ? [] : this.entrySets.slice();
			newEntrySets[atKeyIndex] = newEntrySet;

			return this.copy(newEntries, newEntrySets, this.size + 1);
		}

		if (null !== this.entrySets && atKeyIndex in this.entrySets) {
			// key is in entrySet
			const currentEntrySet = this.entrySets[atKeyIndex];
			const newEntrySet: MapEntrySet<K, V> = currentEntrySet.modifyAt(
				atKey,
				options,
				atKeyHash,
			) as any;

			if (newEntrySet === currentEntrySet) return this;

			if (newEntrySet.size === 1) {
				let firstEntry: readonly [K, V] | undefined;

				if (this.context.isHashMapBlock<K, V>(newEntrySet)) {
					for (const key in newEntrySet.entries!) {
						firstEntry = newEntrySet.entries![key];
						break;
					}
				} else {
					firstEntry = newEntrySet.entries.first();
				}

				const newEntries = null === this.entries ? [] : this.entries.slice();
				newEntries[atKeyIndex] = firstEntry!;

				const newEntrySets = this.entrySets.slice();
				delete newEntrySets[atKeyIndex];

				return this.copy(newEntries, newEntrySets, this.size - 1);
			}

			const newEntrySets = this.entrySets.slice();
			newEntrySets[atKeyIndex] = newEntrySet;

			return this.copy(
				undefined,
				newEntrySets,
				this.size + newEntrySet.size - currentEntrySet.size,
			);
		}

		if (undefined === ifNew) return this;

		const { set, create } = ifNew;
		const token = Symbol();
		const newValue = create !== undefined ? create(token) : set;

		if (token === newValue) return this;

		const newEntry: [K, V] = [atKey, newValue as V];
		const newEntries = null === this.entries ? [] : this.entries.slice();
		newEntries[atKeyIndex] = newEntry;

		return this.copy(newEntries, undefined, this.size + 1);
	}

	forEach(f: (entry: readonly [K, V]) => void): void {
		this.entries?.forEach(f);

		this.entrySets?.forEach((entrySet) => {
			entrySet.forEach(f);
		});
	}

	mapValues<V2>(mapFun: (value: V, key: K) => V2): HashMap.NonEmpty<K, V2> {
		const newEntries =
			null === this.entries
				? null
				: this.entries.map((e): [K, V2] => [e[0], mapFun(e[1], e[0])]);
		const newEntrySets =
			null === this.entrySets
				? null
				: this.entrySets.map(
						(es: MapEntrySet<K, V>): MapEntrySet<K, V2> =>
							es.mapValues(mapFun) as MapEntrySet<K, V2>,
					);

		return new HashMapBlock<K, V2>(
			this.context,
			newEntries,
			newEntrySets,
			this.size,
			this.level,
		);
	}

	toArray(): ArrayNonEmpty<[K, V]> {
		let result: (readonly [K, V])[] = [];

		if (null !== this.entries) {
			result = this.entries.filter(() => true);
		}
		if (null !== this.entrySets) {
			this.entrySets.forEach((entrySet) => {
				result = result.concat(entrySet.toArray());
			});
		}

		return result as ArrayNonEmpty<[K, V]>;
	}
}
