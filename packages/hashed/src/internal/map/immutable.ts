import type {
	ArrayNonEmpty,
	RelatedTo,
	ToJSON,
	WithValueResult,
} from '@rimbu/common/types';
import type { HashMap } from '@rimbu/hashed/map';
import type { List } from '@rimbu/list';

import type { ContextImpl } from '#map/context-factory';

import * as Arr from '@rimbu/base/arr';
import * as Entry from '@rimbu/base/entry';
import * as RimbuError from '@rimbu/base/rimbu-error';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import {
	EmptyBase,
	NonEmptyBase,
} from '@rimbu/collection-types/advanced/common/empty-base';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream, type StreamSource } from '@rimbu/stream';

export class HashMapEmpty<K = any, V = any>
	extends EmptyBase
	implements HashMap<K, V>
{
	declare _NonEmptyType: HashMap.NonEmpty<K, V>;

	constructor(readonly context: ContextImpl<K>) {
		super();
	}

	streamKeys(): Stream<K> {
		return Stream.empty();
	}

	streamValues(): Stream<V> {
		return Stream.empty();
	}

	get<_, O>(_: K, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	hasKey(): false {
		return false;
	}

	set(key: K, value: V): HashMap.NonEmpty<K, V> {
		return this.context.emptyBlock<V>().set(key, value);
	}

	addEntry(entry: readonly [K, V]): HashMap.NonEmpty<K, V> {
		return this.context.emptyBlock<V>().addEntry(entry);
	}

	addEntries(entries: StreamSource<readonly [K, V]>): HashMap.NonEmpty<K, V> {
		return this.context.from(entries) as HashMap.NonEmpty<K, V>;
	}

	removeKeyAndGet(): WithValueResult<HashMap<K, V>, V> {
		return [this, undefined, false];
	}

	removeKey(): HashMap<K, V> {
		return this;
	}

	removeKeys(): HashMap<K, V> {
		return this;
	}

	modifyAt(atKey: K, options: ModifyOptions<V>): HashMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;

		const { ifNew } = options;
		if (undefined === ifNew) return this;

		const { set, create } = ifNew;
		const token = Symbol();
		const newValue = create !== undefined ? create(token) : set;

		if (token === newValue) return this;
		return this.set(atKey, newValue);
	}

	mapValues<V2>(): HashMap<K, V2> {
		return this as any;
	}

	transform<V2, K2 extends K>(
		transformFun: (stream: Stream<readonly [K, V]>) => StreamSource<[K2, V2]>,
	): HashMap<K2, V2> {
		return this.context.from(transformFun(this.stream()));
	}

	updateAt(): HashMap<K, V> {
		return this;
	}

	updateAtAndGet(): WithValueResult<HashMap.NonEmpty<K, V>, V, HashMap<K, V>> {
		return [this, undefined, false];
	}

	toBuilder(): HashMap.Builder<K, V> {
		return this.context.builder();
	}

	toString(): string {
		return `HashMap()`;
	}

	toJSON(): ToJSON<(readonly [K, V])[]> {
		return {
			dataType: this.context.typeTag,
			value: [],
		};
	}
}

export abstract class HashMapNonEmptyBase<K, V>
	extends NonEmptyBase<readonly [K, V]>
	implements HashMap.NonEmpty<K, V>
{
	declare _NonEmptyType: HashMap.NonEmpty<K, V>;

	abstract get context(): ContextImpl<K>;
	abstract get size(): number;
	abstract get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O;
	abstract addEntry(
		entry: readonly [K, V],
		hash?: number,
	): HashMap.NonEmpty<K, V>;
	abstract forEach(
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
		options?: { state?: TraverseState },
	): void;
	abstract modifyAt(
		atKey: K,
		options: ModifyOptions<V>,
		atKeyHash?: number,
	): HashMap<K, V>;
	abstract mapValues<V2>(
		mapFun: (value: V, key: K) => V2,
	): HashMap.NonEmpty<K, V2>;
	abstract toArray(): ArrayNonEmpty<readonly [K, V]>;

	asNormal(): this {
		return this;
	}

	streamKeys(): Stream.NonEmpty<K> {
		return this.stream().map(Entry.first);
	}

	streamValues(): Stream.NonEmpty<V> {
		return this.stream().map(Entry.second);
	}

	hasKey<U>(key: RelatedTo<K, U>): boolean {
		const token = Symbol();
		return token !== this.get(key, token);
	}

	set(key: K, value: V): HashMap.NonEmpty<K, V> {
		return this.addEntry([key, value]);
	}

	addEntries(entries: StreamSource<readonly [K, V]>): HashMap.NonEmpty<K, V> {
		if (Stream.isEmptyStreamSourceInstance(entries)) return this;

		const builder = this.toBuilder();
		builder.addEntries(entries);
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

	updateAtAndGet<UK>(
		key: RelatedTo<K, UK>,
		update: (value: V) => V,
	): WithValueResult<HashMap.NonEmpty<K, V>, V> {
		const token = Symbol();
		let oldValue: V | typeof token = token;

		const newMap = this.updateAt(key, (value) => {
			oldValue = value;
			return update(value);
		});

		if (token === oldValue) return [this, undefined, false];
		return [newMap, oldValue, true];
	}

	removeKey<UK>(key: RelatedTo<K, UK>): HashMap<K, V> {
		if (!this.context.hasher.isValid(key)) return this;
		return this.modifyAt(key, {
			ifExists: { update: (_, remove) => remove },
		});
	}

	removeKeyAndGet<UK>(
		key: RelatedTo<K, UK>,
	): WithValueResult<HashMap<K, V>, V, HashMap.NonEmpty<K, V>> {
		if (!this.context.hasher.isValid(key)) return [this, undefined, false];

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

		if (token === currentValue) return [this, undefined, false];
		return [newMap, currentValue, true];
	}

	filter(
		pred: (entry: readonly [K, V], index: number, halt: () => void) => boolean,
		options: { negate?: boolean } = {},
	): HashMap<K, V> {
		const builder = this.context.builder<K, V>();

		builder.addEntries(this.stream().filter(pred, options));

		if (builder.size === this.size) return this;

		return builder.build();
	}

	transform<V2, K2 extends K>(
		transformFun: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource<[K2, V2]>,
	): HashMap.NonEmpty<K2, V2> {
		return this.context.from(transformFun(this.stream())) as any;
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

	toJSON(): ToJSON<(readonly [K, V])[]> {
		return {
			dataType: this.context.typeTag,
			value: this.toArray(),
		};
	}
}

export type MapEntrySet<K, V> = HashMapBlock<K, V> | HashMapCollision<K, V>;

export class HashMapBlock<K, V> extends HashMapNonEmptyBase<K, V> {
	constructor(
		readonly context: ContextImpl<K>,
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

	addEntry(
		entry: readonly [K, V],
		hash = this.context.hash(entry[0]),
	): HashMapBlock<K, V> {
		const atKeyIndex = this.context.getKeyIndex(this.level, hash);

		if (null !== this.entries && atKeyIndex in this.entries) {
			const currentEntry = this.entries[atKeyIndex];

			if (this.context.eq(entry[0], currentEntry[0])) {
				if (Object.is(entry[1], currentEntry[1])) return this;

				const newEntries = Arr.copySparse(this.entries);
				newEntries[atKeyIndex] = entry;
				return this.copy(newEntries);
			}

			let newEntries: (readonly [K, V])[] | null = Arr.copySparse(this.entries);
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
					.addEntry(currentEntry)
					.addEntry(entry, hash);

				const newEntrySets =
					null === this.entrySets ? [] : Arr.copySparse(this.entrySets);
				newEntrySets[atKeyIndex] = newEntrySet as MapEntrySet<K, V>;

				return this.copy(newEntries, newEntrySets, this.size + 1);
			}

			const newEntrySet = this.context.collision<V>(
				this.context.listContext.of(currentEntry, entry),
			);
			const newEntrySets =
				null === this.entrySets ? [] : Arr.copySparse(this.entrySets);
			newEntrySets[atKeyIndex] = newEntrySet;

			return this.copy(newEntries, newEntrySets, this.size + 1);
		}

		if (null !== this.entrySets && atKeyIndex in this.entrySets) {
			const currentEntrySet = this.entrySets[atKeyIndex];
			const newEntrySet = currentEntrySet.addEntry(entry, hash) as MapEntrySet<
				K,
				V
			>;
			if (newEntrySet === currentEntrySet) return this;

			const newEntrySets = Arr.copySparse(this.entrySets);
			newEntrySets[atKeyIndex] = newEntrySet;

			return this.copy(
				undefined,
				newEntrySets,
				this.size + newEntrySet.size - currentEntrySet.size,
			);
		}

		const newEntries =
			null === this.entries ? [] : Arr.copySparse(this.entries);
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

				const newEntries = Arr.copySparse(this.entries);

				if (token === newValue) {
					delete newEntries[atKeyIndex];

					for (const _ in newEntries) {
						return this.copy(newEntries, undefined, this.size - 1);
					}

					if (this.size === 1) return this.context.empty();

					return this.copy(null, undefined, this.size - 1);
				}

				newEntries[atKeyIndex] = [atKey, newValue];
				return this.copy(newEntries);
			}

			// no exact match, but key collision
			if (undefined === ifNew) return this;

			const { set, create } = ifNew;
			const token = Symbol();
			const newValue = create !== undefined ? create(token) : set;

			if (token === newValue) return this;

			let newEntries: (readonly [K, V])[] | null = Arr.copySparse(this.entries);
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
					.addEntry(currentEntry)
					.set(atKey, newValue) as MapEntrySet<K, V>;

				const newEntrySets =
					null === this.entrySets ? [] : Arr.copySparse(this.entrySets);
				newEntrySets[atKeyIndex] = newEntrySet;

				return this.copy(newEntries, newEntrySets, this.size + 1);
			}

			// create collision
			const newEntry: [K, V] = [atKey, newValue];
			const newEntrySet = this.context.collision<V>(
				this.context.listContext.of(currentEntry, newEntry),
			);
			const newEntrySets =
				null === this.entrySets ? [] : Arr.copySparse(this.entrySets);
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

				const newEntries =
					null === this.entries ? [] : Arr.copySparse(this.entries);
				newEntries[atKeyIndex] = firstEntry!;

				const newEntrySets = Arr.copySparse(this.entrySets);
				delete newEntrySets[atKeyIndex];

				return this.copy(newEntries, newEntrySets, this.size - 1);
			}

			const newEntrySets = Arr.copySparse(this.entrySets);
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

		const newEntry: [K, V] = [atKey, newValue];
		const newEntries =
			null === this.entries ? [] : Arr.copySparse(this.entries);
		newEntries[atKeyIndex] = newEntry;

		return this.copy(newEntries, undefined, this.size + 1);
	}

	forEach(
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		const { halt } = state;

		if (null !== this.entries) {
			for (const key in this.entries) {
				f(this.entries[key], state.nextIndex(), halt);
				if (state.halted) return;
			}
		}
		if (null !== this.entrySets) {
			for (const key in this.entrySets) {
				this.entrySets[key].forEach(f, { state });
				if (state.halted) return;
			}
		}
	}

	mapValues<V2>(mapFun: (value: V, key: K) => V2): HashMap.NonEmpty<K, V2> {
		const newEntries =
			null === this.entries
				? null
				: Arr.mapSparse(this.entries, (e): [K, V2] => [
						e[0],
						mapFun(e[1], e[0]),
					]);
		const newEntrySets =
			null === this.entrySets
				? null
				: Arr.mapSparse(
						this.entrySets,
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
			result = Stream.fromObjectValues(this.entries).toArray();
		}
		if (null !== this.entrySets) {
			Stream.fromObjectValues(this.entrySets).forEach(
				(entrySet: MapEntrySet<K, V>): void => {
					result = result.concat(entrySet.toArray());
				},
			);
		}

		return result as ArrayNonEmpty<[K, V]>;
	}
}

export class HashMapCollision<K, V> extends HashMapNonEmptyBase<K, V> {
	constructor(
		readonly context: ContextImpl<K>,
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

	get<U, O>(
		key: RelatedTo<K, U>,
		otherwise?: OptLazy<O>,
		keyHash?: number,
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

	addEntry(entry: readonly [K, V], hash?: number): HashMapCollision<K, V> {
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

	modifyAt(
		atKey: K,
		options: ModifyOptions<V>,
		atKeyHash?: number,
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

			const newEntries = this.entries.append([atKey, newValue]);
			return this.copy(newEntries);
		}

		if (undefined === ifExists) return this;
		const { set, update } = ifExists;

		const currentEntry = this.entries.get(
			currentIndex,
			RimbuError.throwInvalidStateError,
		);
		const currentValue = currentEntry[1];
		const token = Symbol();
		const newValue = update !== undefined ? update(currentValue, token) : set;

		if (token === newValue) {
			const newEntries = this.entries.remove(currentIndex).assumeNonEmpty();
			return this.copy(newEntries);
		}

		if (Object.is(newValue, currentValue)) return this;

		const newEntry: [K, V] = [atKey, newValue];
		const newEntries = this.entries.with(currentIndex, newEntry);
		return this.copy(newEntries);
	}

	forEach(
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		this.entries.forEach(f, { state });
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
