import type { RelatedTo } from '@rimbu/common/types';
import type { HashMap } from '@rimbu/hashed/map';

import type { HashMapContext } from '#map/context';
import type { HashMapBlock, MapEntrySet } from '#map/immutable/block';

import * as RimbuError from '@rimbu/base/rimbu-error';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { MapCollectionBuilderBase } from '@rimbu/collection-types/advanced/map-base';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { List } from '@rimbu/list';
import { Stream, type StreamSource } from '@rimbu/stream';

import { HashMapCollisionBuilder } from '#map/mutable/collision-builder';

export type MapBlockBuilderEntry<K, V> =
	| HashMapBlockBuilder<K, V>
	| HashMapCollisionBuilder<K, V>;

export class HashMapBlockBuilder<K, V>
	extends MapCollectionBuilderBase<K, V>
	implements HashMap.Builder<K, V>
{
	constructor(
		readonly context: HashMapContext<K>,
		public source?: undefined | HashMapBlock<K, V>,
		public _entries?: undefined | (readonly [K, V])[],
		public _entrySets?: undefined | MapBlockBuilderEntry<K, V>[],
		public size = source?.size ?? 0,
		public level = source?.level ?? 0,
	) {
		super();
	}

	_lock = 0;

	checkLock(): void {
		if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
	}

	prepareMutate(): void {
		if (undefined === this._entries) {
			if (undefined !== this.source) {
				this._entries =
					null === this.source.entries ? [] : this.source.entries.slice();
			} else {
				this._entries = [];
			}
		}

		if (undefined === this._entrySets) {
			if (undefined !== this.source) {
				this._entrySets =
					null === this.source.entrySets
						? []
						: (this.source.entrySets.map(
								(entrySet): MapBlockBuilderEntry<K, V> => {
									if (this.context.isHashMapBlock(entrySet)) {
										return new HashMapBlockBuilder(this.context, entrySet);
									}
									return new HashMapCollisionBuilder(this.context, entrySet);
								},
							) ?? []);
			} else {
				this._entrySets = [];
			}
		}
	}

	get entries(): (readonly [K, V])[] {
		this.prepareMutate();

		return this._entries!;
	}

	get entrySets(): MapBlockBuilderEntry<K, V>[] {
		this.prepareMutate();

		return this._entrySets!;
	}

	get = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
		if (undefined !== this.source) return this.source.get(key, otherwise);

		if (!this.context.hasher.isValid(key)) return OptLazy(otherwise) as O;

		const keyHash = this.context.hash(key);

		const keyIndex = this.context.getKeyIndex(this.level, keyHash);

		if (keyIndex in this.entries) {
			const currentEntry = this.entries[keyIndex]!;

			if (this.context.eq(key, currentEntry[0])) return currentEntry[1];
			return OptLazy(otherwise) as O;
		}

		if (keyIndex in this.entrySets) {
			const currentEntrySet = this.entrySets[keyIndex]!;
			return currentEntrySet.get(key, otherwise, keyHash);
		}

		return OptLazy(otherwise) as O;
	};

	has = <UK>(key: RelatedTo<K, UK>): boolean => {
		const token = Symbol();
		return token !== this.get(key, token);
	};

	set = (key: K, value: V): boolean => {
		return this.add([key, value]);
	};

	add = (entry: readonly [K, V]): boolean => {
		this.checkLock();

		if (!this.context.hasher.isValid(entry[0])) {
			return false;
		}

		return this.addInternal(entry);
	};

	addAll = (entries: StreamSource<readonly [K, V]>): boolean => {
		this.checkLock();

		if (Stream.isEmptyStreamSourceInstance(entries)) return false;

		return Stream.from(entries).filterPure({ pred: this.add }).count() > 0;
	};

	addInternal(
		entry: readonly [K, V],
		hash = this.context.hash(entry[0]),
	): boolean {
		const keyIndex = this.context.getKeyIndex(this.level, hash);

		if (keyIndex in this.entries) {
			const currentEntry = this.entries[keyIndex]!;

			if (this.context.eq(entry[0], currentEntry[0])) {
				if (Object.is(entry[1], currentEntry[1])) return false;

				this.source = undefined;

				this.entries[keyIndex] = entry;
				return true;
			}

			this.source = undefined;

			this.size++;

			delete this.entries[keyIndex];

			if (this.level < this.context.maxDepth) {
				const newEntrySet = new HashMapBlockBuilder<K, V>(
					this.context,
					undefined,
					undefined,
					undefined,
					0,
					this.level + 1,
				);
				newEntrySet.addInternal(currentEntry);
				newEntrySet.addInternal(entry, hash);

				this.entrySets[keyIndex] = newEntrySet;
				return true;
			}

			const newEntries = List.builder<readonly [K, V]>();
			newEntries.append(currentEntry);
			newEntries.append(entry);

			const newEntrySet = new HashMapCollisionBuilder<K, V>(
				this.context,
				undefined,
				newEntries,
			);
			this.entrySets[keyIndex] = newEntrySet;
			return true;
		}

		if (keyIndex in this.entrySets) {
			const currentEntrySet = this.entrySets[keyIndex]!;
			const preSize = currentEntrySet.size;
			const changed = currentEntrySet.addInternal(entry, hash);

			if (changed) this.source = undefined;

			this.size += currentEntrySet.size - preSize;
			return changed;
		}

		this.source = undefined;

		this.size++;
		this.entries[keyIndex] = entry;
		return true;
	}

	modifyAt = (
		key: K,
		options: ModifyOptions<V>,
		keyHash = this.context.hash(key),
	): boolean => {
		this.checkLock();

		if (checkEmptyModifyOptions(options)) return false;
		const { ifNew, ifExists } = options;

		const keyIndex = this.context.getKeyIndex(this.level, keyHash);

		if (keyIndex in this.entries) {
			// potential match in entries

			const currentEntry = this.entries[keyIndex]!;
			const [currentKey, currentValue] = currentEntry;

			if (this.context.eq(key, currentKey)) {
				// exact match
				if (undefined === ifExists) return false;
				const { set, update } = ifExists;
				const token = Symbol();
				const newValue =
					update !== undefined ? update(currentValue, token) : set!;

				if (Object.is(newValue, currentValue)) {
					return false;
				}

				this.source = undefined;

				if (token === newValue) {
					this.size--;
					delete this.entries[keyIndex];
					return true;
				}

				// replace current value
				const newEntry: [K, V] = [key, newValue as V];
				this.entries[keyIndex] = newEntry;
				return true;
			}

			if (undefined === ifNew) return false;

			const { set, create } = ifNew;

			// no match, replace entry with entryset containing both entries
			const token = Symbol();
			const newValue = create !== undefined ? create(token) : set;

			if (token === newValue) return false;

			this.source = undefined;

			this.size++;

			delete this.entries[keyIndex];

			const newEntrySet: MapBlockBuilderEntry<K, V> =
				this.level < this.context.maxDepth
					? new HashMapBlockBuilder(
							this.context,
							undefined,
							undefined,
							undefined,
							0,
							this.level + 1,
						)
					: new HashMapCollisionBuilder(this.context);

			newEntrySet.addInternal(currentEntry);
			newEntrySet.addInternal([key, newValue], keyHash);

			this.entrySets[keyIndex] = newEntrySet;
			return true;
		}

		if (keyIndex in this.entrySets) {
			// potential match in entrysets
			const entrySet = this.entrySets[keyIndex]!;
			const preSize = entrySet.size;
			const result = entrySet.modifyAt(key, options, keyHash);

			if (result) this.source = undefined;

			this.size += entrySet.size - preSize;

			if (entrySet.size > 1) return result;

			// single entry needs to be pulled up

			let first: readonly [K, V];

			if (this.context.isHashMapBlock(entrySet)) {
				for (const index in entrySet.entries) {
					first = entrySet.entries[index];
					break;
				}
			} else {
				first = entrySet.entries.at(0, RimbuError.throwInvalidStateError);
			}

			delete this.entrySets[keyIndex];
			this.entries[keyIndex] = first;
			return true;
		}

		if (undefined === ifNew) return false;

		const { set, create } = ifNew;

		// no matching entry or entrySet
		const token = Symbol();
		const newValue = create !== undefined ? create(token) : set;

		if (token === newValue) return false;

		this.source = undefined;
		this.size++;
		this.entries[keyIndex] = [key, newValue];
		return true;
	};

	updateAt = <UK>(key: RelatedTo<K, UK>, update: (value: V) => V): boolean => {
		let changed = false;
		this.modifyAt(key as K, {
			ifExists: {
				update: (value: V, _remove) => {
					const newValue = update(value);
					if (!Object.is(newValue, value)) changed = true;
					return newValue;
				},
			},
		});
		return changed;
	};

	removeKey = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
		this.checkLock();

		if (!this.context.hasher.isValid(key)) return OptLazy(otherwise) as O;

		let removedValue!: V;
		let found = false;

		this.modifyAt(key, {
			ifExists: {
				update: (currentValue, remove) => {
					removedValue = currentValue;
					found = true;
					return remove;
				},
			},
		});

		if (!found) return OptLazy(otherwise) as O;

		return removedValue!;
	};

	removeKeys = <UK>(keys: StreamSource<RelatedTo<K, UK>>): boolean => {
		this.checkLock();

		if (Stream.isEmptyStreamSourceInstance(keys)) return false;

		const notFound = Symbol();

		return (
			Stream.from(keys)
				.mapPure(this.removeKey, notFound)
				.countElement(notFound, { negate: true }) > 0
		);
	};

	forEach = (f: (entry: readonly [K, V]) => void): void => {
		this._lock++;

		try {
			if (this.isEmpty) return;
			if (undefined !== this.source) {
				this.source.forEach(f);
				return;
			}

			this._entries?.forEach(f);

			this._entrySets?.forEach((entrySet) => {
				entrySet.forEach(f);
			});
		} finally {
			this._lock--;
		}
	};

	build = (): HashMap<K, V> => {
		if (this.size === 0) return this.context.empty();

		return this.buildNE() as HashMap<K, V>;
	};

	buildNE(): HashMapBlock<K, V> {
		if (undefined !== this.source) return this.source;

		const entries = this.entries.length === 0 ? null : this.entries.slice();
		const entrySets =
			this.entrySets.length === 0
				? null
				: this.entrySets.map((entrySet) => entrySet.buildNE());

		return this.context.block(entries, entrySets, this.size, this.level);
	}

	buildMapValues = <V2>(f: (value: V, key: K) => V2): HashMap<K, V2> => {
		if (this.size === 0) {
			return this.context.empty() as unknown as HashMap<K, V2>;
		}
		if (undefined !== this.source) return this.source.mapValues(f);

		const entries =
			this.entries.length === 0
				? null
				: this.entries.map((e): readonly [K, V2] => [e[0], f(e[1], e[0])]);

		const entrySets =
			this.entrySets.length === 0
				? null
				: this.entrySets.map(
						(entrySet): MapEntrySet<K, V2> =>
							entrySet.buildMapValues(f) as MapEntrySet<K, V2>,
					);

		return this.context.block(entries, entrySets, this.size, this.level);
	};

	// clear is required by CollectionBuilderBase
	clear(): void {
		this.checkLock();
		this.source = undefined;
		this._entries = undefined;
		this._entrySets = undefined;
		this.size = 0;
	}
}
