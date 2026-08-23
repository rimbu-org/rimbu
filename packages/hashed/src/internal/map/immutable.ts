import type { Op } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common/types';
import type { HashMap } from '@rimbu/hashed/map';
import type { List } from '@rimbu/list';

import type { HashMapContext } from '#map/context';

import * as RimbuError from '@rimbu/base/rimbu-error';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import {
	MapCollectionEmptyBase,
	MapCollectionNonEmptyBase,
} from '@rimbu/collection-types/advanced/map-base';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream, type StreamSource } from '@rimbu/stream';

export class HashMapEmpty<K = any, V = any>
	extends MapCollectionEmptyBase<K, V, HashMap.Advanced.Family<K, V>>
	implements HashMap<K, V>
{
	constructor(readonly context: HashMapContext<K>) {
		super();
	}

	toBuilder(): HashMap.Builder<K, V> {
		return this.context.builder();
	}

	toString(): string {
		return `HashMap()`;
	}
}

export abstract class HashMapNonEmptyBase<K, V>
	extends MapCollectionNonEmptyBase<K, V, HashMap.Advanced.Family<K, V>>
	implements HashMap.NonEmpty<K, V>
{
	abstract readonly context: HashMapContext<K>;
	abstract add(entry: readonly [K, V], hash?: number): HashMap.NonEmpty<K, V>;
	abstract modifyAt(
		atKey: K,
		options: ModifyOptions<V>,
		atKeyHash?: number,
	): HashMap<K, V>;

	set(key: K, value: V): HashMap.NonEmpty<K, V> {
		return this.add([key, value]);
	}

	addAll(entries: StreamSource<readonly [K, V]>): HashMap.NonEmpty<K, V> {
		if (Stream.isEmptyStreamSourceInstance(entries)) return this;

		const builder = this.toBuilder();
		builder.addAll(entries);
		return builder.build().assumeNonEmpty();
	}

	removeKeys<UK>(keys: StreamSource<RelatedTo<K, UK>>): HashMap<K, V> {
		if (Stream.isEmptyStreamSourceInstance(keys)) return this;

		const builder = this.toBuilder();
		builder.removeKeys(keys);
		return builder.build();
	}

	updateAt<UK>(
		key: RelatedTo<K, UK>,
		update: (value: V) => V,
	): HashMap.NonEmpty<K, V> {
		if (!this.context.isValidKey(key)) return this;
		return this.modifyAt(key, {
			ifExists: { update },
		}).assumeNonEmpty();
	}

	updateAtAndReturn<UK>(
		key: RelatedTo<K, UK>,
		update: (value: V) => V,
	): Op.DynamicResult<
		HashMap.NonEmpty<K, V>,
		[previous: undefined, current: undefined],
		[previous: V, current: V],
		HashMap.NonEmpty<K, V>
	> {
		const token = Symbol();
		let oldValue: V | typeof token = token;
		let newValue: V | undefined;

		const newMap = this.modifyAt(key, {
			ifExists: {
				update: (value: V, _remove) => {
					oldValue = value;
					newValue = update(value);
					return newValue;
				},
			},
		});

		if (token === oldValue) {
			return {
				collection: this,
				hasResult: false,
				result: [undefined, undefined],
				hasChanged: false,
			};
		}

		// modifyAt may have returned this if no change
		const hasChanged = newMap !== this;
		return {
			collection: newMap as HashMap.NonEmpty<K, V>,
			hasResult: true,
			result: [oldValue as V, newValue as V],
			hasChanged,
		};
	}

	removeKey<UK>(key: RelatedTo<K, UK>): HashMap<K, V> {
		if (!this.context.hasher.isValid(key)) return this;
		return this.modifyAt(key, {
			ifExists: { update: (_, remove) => remove },
		});
	}

	removeKeyAndReturn<UK>(
		key: RelatedTo<K, UK>,
	): Op.DynamicResult<HashMap.NonEmpty<K, V>, undefined, V, HashMap<K, V>>;
	removeKeyAndReturn<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise: OptLazy<O>,
	): Op.DynamicResult<HashMap.NonEmpty<K, V>, O, V, HashMap<K, V>>;
	removeKeyAndReturn<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
	): Op.DynamicResult<HashMap.NonEmpty<K, V>, O | undefined, V, HashMap<K, V>> {
		if (!this.context.hasher.isValid(key)) {
			return {
				collection: this,
				hasResult: false,
				result: OptLazy(otherwise) as O,
				hasChanged: false,
			};
		}

		const token = Symbol();
		let currentValue: V | typeof token = token;

		const newMap = this.modifyAt(key, {
			ifExists: {
				update: (value, remove) => {
					currentValue = value;
					return remove;
				},
			},
		});

		if (token === currentValue) {
			return {
				collection: this,
				hasResult: false,
				result: OptLazy(otherwise) as O,
				hasChanged: false,
			};
		}

		return {
			collection: newMap as HashMap<K, V>,
			hasResult: true,
			result: currentValue as V,
			hasChanged: true,
		};
	}

	filter(
		pred: (entry: readonly [K, V], index: number, halt: () => void) => boolean,
		options: { negate?: boolean } = {},
	): HashMap<K, V> {
		const builder = this.context.builder<K, V>();

		builder.setAll(this.stream().filter(pred, options));

		if (builder.size === this.size) return this;

		return builder.build();
	}

	recompose<K2 extends K, V2>(
		f: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource.NonEmpty<readonly [K2, V2]>,
	): HashMap.NonEmpty<K2, V2>;
	recompose<K2 extends K, V2>(
		f: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource<readonly [K2, V2]>,
	): HashMap<K2, V2>;
	recompose<K2 extends K, V2>(
		f: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource<readonly [K2, V2]>,
	): HashMap<K2, V2> {
		return this.context.from(f(this.stream()));
	}

	toBuilder(): HashMap.Builder<K, V> {
		return this.context.createBuilder<K, V>(this);
	}

	toString(): string {
		return this.stream().join({
			start: 'HashMap(',
			sep: ', ',
			end: ')',
			valueToString: (entry) => `${entry[0]} -> ${entry[1]}`,
		});
	}

	map: any;
	mapIndexed: any;
	flatMap: any;
	flatMapIndexed: any;

	// map<W extends readonly [any, any]>(
	// 	f: (entry: readonly [K, V]) => W,
	// ): HashMap<W[0], W[1]> {
	// 	return this.context.from(this.stream().map(f));
	// }

	// flatMap<W extends readonly [any, any]>(
	// 	f: (entry: readonly [K, V]) => StreamSource<W>,
	// ): HashMap<W[0], W[1]> {
	// 	const builder = this.context.builder<W[0], W[1]>();
	// 	this.stream().forEach((entry) => {
	// 		const result = f(entry);
	// 		builder.setAll(Stream.from(result).map((e) => e));
	// 	});
	// 	return builder.build();
	// }
}

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

	// at is legacy, now get
	// at<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>, hash?: number): V | O {
	// 	return this.get(key , otherwise , hash ) ;
	// }

	setEntry(
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
					.block<V>(null, null, 0, this.level + 1)
					.setEntry(currentEntry)
					.setEntry(entry, hash) as unknown as MapEntrySet<K, V>;

				const newEntrySets =
					null === this.entrySets ? [] : this.entrySets.slice();
				newEntrySets[atKeyIndex] = newEntrySet;

				return this.copy(newEntries, newEntrySets, this.size + 1);
			}

			const newEntrySet = this.context.collision<V>(
				this.context.listContext.of(currentEntry, entry),
			);
			const newEntrySets =
				null === this.entrySets ? [] : this.entrySets.slice();
			newEntrySets[atKeyIndex] = newEntrySet;

			return this.copy(newEntries, newEntrySets, this.size + 1);
		}

		if (null !== this.entrySets && atKeyIndex in this.entrySets) {
			const currentEntrySet = this.entrySets[atKeyIndex];
			const newEntrySet = currentEntrySet.setEntry(entry, hash) as MapEntrySet<
				K,
				V
			>;
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

	// keep addEntry as private helper for block creation (used by context)
	addEntry(
		entry: readonly [K, V],
		hash = this.context.hash(entry[0]),
	): HashMapBlock<K, V> {
		return this.setEntry(entry, hash);
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
					.setEntry(currentEntry)
					.set(atKey, newValue) as unknown as MapEntrySet<K, V>;

				const newEntrySets =
					null === this.entrySets ? [] : this.entrySets.slice();
				newEntrySets[atKeyIndex] = newEntrySet;

				return this.copy(newEntries, newEntrySets, this.size + 1);
			}

			// create collision
			const newEntry: [K, V] = [atKey, newValue as V];
			const newEntrySet = this.context.collision<V>(
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
			);

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

export class HashMapCollision<K, V> extends HashMapNonEmptyBase<K, V> {
	constructor(
		readonly context: HashMapContext<K>,
		readonly entries: List.NonEmpty<readonly [K, V]>,
	) {
		super();
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

	mutate: any;

	modifyAt(
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

	mapValues<V2>(mapFun: (value: V, key: K) => V2): HashMap.NonEmpty<K, V2> {
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
