// biome-ignore lint/correctness/noUnusedImports: TypesKey is used as a computed property key, which Biome does not detect
import type { Op } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty, RelatedTo, ToJSON } from '@rimbu/common/types';
import type { HashMap } from '@rimbu/hashed/map';
import type { List } from '@rimbu/list';

import type { HashMapContext } from '#map/context';

import * as Entry from '@rimbu/base/entry';
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
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream, type StreamSource } from '@rimbu/stream';

export type HashMapEmptyContext<K, V> = HashMapContext<K> &
	MapCollectionEmptyBase<K, V>['context'];

export type HashMapNonEmptyContext<K, V> = HashMapContext<K> &
	MapCollectionNonEmptyBase<K, V>['context'];

export type HashMapBuilderContext<K, V> = HashMapContext<K> &
	MapCollectionEmptyBase<K, V>['context'];

export class HashMapEmpty<K = any, V = any>
	extends MapCollectionEmptyBase<K, V>
	implements HashMap<K, V>
{
	// declare readonly [TypesKey]: HashMap.Advanced.Family<K, V>;

	constructor(readonly context: HashMapEmptyContext<K, V>) {
		super();
	}

	set(key: K, value: V): HashMap.NonEmpty<K, V> {
		return this.context.emptyBlock<V>().set(key, value);
	}

	add(entry: readonly [K, V]): HashMap.NonEmpty<K, V> {
		return this.context.emptyBlock<V>().addEntry(entry);
	}

	addAll(
		entries: StreamSource.NonEmpty<readonly [K, V]>,
	): HashMap.NonEmpty<K, V>;
	addAll(entries: StreamSource<readonly [K, V]>): HashMap<K, V> {
		return this.context.from(entries) as HashMap.NonEmpty<K, V>;
	}

	removeKeyAndReturn<UK, O>(
		_: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
	): Op.WithResult<this, O, false> {
		return {
			collection: this,
			hasResult: false,
			result: OptLazy(otherwise) as O,
			hasChanged: false,
		};
	}

	// removeKeyAndGet is legacy, now removeKeyAndReturn
	// removeKeyAndGet(): WithValueResult<HashMap<K, V>, V> {
	// 	return [this, undefined, false];
	// }

	removeKey<UK>(_: RelatedTo<K, UK>): this {
		return this;
	}

	removeKeys<UK>(_: StreamSource<RelatedTo<K, UK>>): this {
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
		return this;
	}

	// transform is legacy, now recompose
	// transform<V2, K2 extends K>(
	// 	transformFun: (stream: Stream<readonly [K, V]>) => StreamSource<[K2, V2]>,
	// ): HashMap<K2, V2> {
	// 	return this.context.from(transformFun(this.stream()));
	// }

	recompose<K2 extends K, V2>(
		f: (stream: Stream<readonly [K, V]>) => StreamSource<readonly [K2, V2]>,
	): HashMap<K2, V2> {
		return this.context.from(f(this.stream())) as HashMap<K2, V2>;
	}

	updateAt(): this {
		return this;
	}

	updateAtAndReturn<UK>(
		_: RelatedTo<K, UK>,
		__: (value: V) => V,
	): Op.WithResult<this, [previous: undefined, current: undefined], false> {
		return {
			collection: this,
			hasResult: false,
			result: [undefined, undefined],
			hasChanged: false,
		};
	}

	// updateAtAndGet is legacy, now updateAtAndReturn
	// updateAtAndGet(): WithValueResult<HashMap.NonEmpty<K, V>, V, HashMap<K, V>> {
	// 	return [this, undefined, false];
	// }

	toBuilder(): HashMap.Builder<K, V> {
		return this.context.builder();
	}

	toString(): string {
		return `HashMap()`;
	}

	toJSON(): ToJSON<(readonly [K, V])[]> {
		return {
			dataType: 'HashMap',
			value: [],
		};
	}

	// not used in new base, but keep for stream
	stream(): Stream<readonly [K, V]> {
		return Stream.empty();
	}

	forEach(): void {}

	filter(): this {
		return this;
	}
}

export abstract class HashMapNonEmptyBase<K, V>
	extends MapCollectionNonEmptyBase<K, V>
	implements HashMap.NonEmpty<K, V>
{
	abstract get context(): HashMapNonEmptyContext<K, V>;
	abstract get size(): number;
	abstract get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O;
	// at is legacy
	// abstract at<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O;
	abstract setEntry(
		entry: readonly [K, V],
		hash?: number,
	): HashMap.NonEmpty<K, V>;
	// addEntry is legacy internal helper, keep as alias for setEntry
	// abstract addEntry(entry: readonly [K, V], hash?: number): HashMap.NonEmpty<K, V>;
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
	abstract stream(): Stream.NonEmpty<readonly [K, V]>;

	mapIndexed: any;
	flatMapIndexed: any;

	asNormal(): this {
		return this;
	}

	streamKeys(): Stream.NonEmpty<K> {
		return this.stream().map(Entry.first);
	}

	streamValues(): Stream.NonEmpty<V> {
		return this.stream().map(Entry.second);
	}

	// hasKey is legacy, now has
	// hasKey<U>(key: RelatedTo<K, U>): boolean {
	// 	const token = Symbol();
	// 	return token !== this.at(key, token);
	// }

	has<UK>(key: RelatedTo<K, UK>): boolean {
		const token = Symbol();
		return token !== this.get(key, token as any);
	}

	// at legacy
	// at<U, O>(key: RelatedTo<K, U>, otherwise?: OptLazy<O>): V | O {
	// 	return this.get(key, otherwise);
	// }

	set(key: K, value: V): HashMap.NonEmpty<K, V> {
		return this.setEntry([key, value]);
	}

	// addEntry legacy
	// addEntry(entry: readonly [K, V]): HashMap.NonEmpty<K, V> {
	// 	return this.setEntry(entry);
	// }

	setAll(entries: StreamSource<readonly [K, V]>): HashMap.NonEmpty<K, V> {
		if (Stream.isEmptyStreamSourceInstance(entries)) return this;

		const builder = this.toBuilder();
		(builder as any).setAll(entries);
		return builder.build().assumeNonEmpty();
	}

	// addEntries is legacy, now setAll
	// addEntries(entries: StreamSource<readonly [K, V]>): HashMap.NonEmpty<K, V> {
	// 	if (Stream.isEmptyStreamSourceInstance(entries)) return this;
	// 	const builder = this.toBuilder();
	// 	builder.addEntries(entries);
	// 	return builder.build().assumeNonEmpty();
	// }

	removeKeys<UK>(keys: StreamSource<RelatedTo<K, UK>>): HashMap<K, V> {
		if (Stream.isEmptyStreamSourceInstance(keys)) return this;

		const builder = this.toBuilder();
		builder.removeKeys(keys as any);
		return builder.build();
	}

	updateAt<UK>(
		key: RelatedTo<K, UK>,
		update: (value: V) => V,
	): HashMap.NonEmpty<K, V> {
		if (!this.context.isValidKey(key as any)) return this;
		return this.modifyAt(key as any, {
			ifExists: { update },
		}).assumeNonEmpty();
	}

	// updateAtAndGet is legacy, now updateAtAndReturn
	// updateAtAndGet<UK>(
	// 	key: RelatedTo<K, UK>,
	// 	update: (value: V) => V,
	// ): WithValueResult<HashMap.NonEmpty<K, V>, V> {
	// 	const token = Symbol();
	// 	let oldValue: V | typeof token = token;
	// 	const newMap = this.updateAt(key, (value) => {
	// 		oldValue = value;
	// 		return update(value);
	// 	});
	// 	if (token === oldValue) return [this, undefined, false];
	// 	return [newMap, oldValue, true];
	// }

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

		const newMap = this.modifyAt(key as any, {
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
		if (!this.context.hasher.isValid(key as any)) return this;
		return this.modifyAt(key as any, {
			ifExists: { update: (_, remove) => remove as any },
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
		if (!this.context.hasher.isValid(key as any)) {
			return {
				collection: this,
				hasResult: false,
				result: OptLazy(otherwise) as O,
				hasChanged: false,
			} as any;
		}

		const token = Symbol();
		let currentValue: V | typeof token = token;

		const newMap = this.modifyAt(key as any, {
			ifExists: {
				update: (value, remove) => {
					currentValue = value;
					return remove as any;
				},
			},
		});

		if (token === currentValue) {
			return {
				collection: this,
				hasResult: false,
				result: OptLazy(otherwise) as O,
				hasChanged: false,
			} as any;
		}

		return {
			collection: newMap as HashMap<K, V>,
			hasResult: true,
			result: currentValue as V,
			hasChanged: true,
		} as any;
	}

	// removeKeyAndGet is legacy, now removeKeyAndReturn
	// removeKeyAndGet<UK>(
	// 	key: RelatedTo<K, UK>,
	// ): WithValueResult<HashMap<K, V>, V, HashMap.NonEmpty<K, V>> {
	// 	if (!this.context.hasher.isValid(key)) return [this, undefined, false];
	// 	const token = Symbol();
	// 	let currentValue: V | typeof token = token;
	// 	const newMap = this.modifyAt(key, {
	// 		ifExists: {
	// 			update: (value, remove) => {
	// 				currentValue = value;
	// 				return remove;
	// 			},
	// 		},
	// 	});
	// 	if (token === currentValue) return [this, undefined, false];
	// 	return [newMap, currentValue, true];
	// }

	filter(
		pred: (entry: readonly [K, V], index: number, halt: () => void) => boolean,
		options: { negate?: boolean } = {},
	): HashMap<K, V> {
		const builder = this.context.builder<K, V>();

		(builder as any).setAll(this.stream().filter(pred, options));

		if (builder.size === this.size) return this;

		return builder.build();
	}

	// transform is legacy, now recompose
	// transform<V2, K2 extends K>(
	// 	transformFun: (
	// 		stream: Stream.NonEmpty<readonly [K, V]>,
	// 	) => StreamSource<[K2, V2]>,
	// ): HashMap.NonEmpty<K2, V2> {
	// 	return this.context.from(transformFun(this.stream())) as any;
	// }

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
		return this.context.from(f(this.stream()) as any) as any;
	}

	// keep transform as alias for backwards compat, commented
	// transform<V2, K2 extends K>(
	// 	transformFun: (stream: Stream.NonEmpty<readonly [K, V]>) => StreamSource<[K2, V2]>,
	// ): HashMap.NonEmpty<K2, V2> {
	// 	return this.recompose(transformFun as any) as any;
	// }

	toBuilder(): HashMap.Builder<K, V> {
		return this.context.createBuilder<K, V>(this as any);
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
			dataType: 'HashMap',
			value: this.toArray(),
		};
	}

	// Collection's map/flatMap for entries
	map<W extends readonly [any, any]>(
		f: (entry: readonly [K, V]) => W,
	): HashMap<W[0], W[1]> {
		return this.context.from(this.stream().map(f as any) as any) as any;
	}

	flatMap<W extends readonly [any, any]>(
		f: (entry: readonly [K, V]) => StreamSource<W>,
	): HashMap<W[0], W[1]> {
		const builder = this.context.builder<W[0], W[1]>();
		this.stream().forEach((entry) => {
			const result = f(entry);
			(builder as any).setAll(Stream.from(result as any).map((e) => e as any));
		});
		return builder.build() as any;
	}
}

export type MapEntrySet<K, V> = HashMapBlock<K, V> | HashMapCollision<K, V>;

export class HashMapBlock<K, V> extends HashMapNonEmptyBase<K, V> {
	constructor(
		readonly context: HashMapNonEmptyContext<K, V>,
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
		if (!this.context.hasher.isValid(key as any))
			return OptLazy(otherwise) as O;
		const keyHash = hash ?? this.context.hash(key as any);

		const atKeyIndex = this.context.getKeyIndex(this.level, keyHash);

		if (null !== this.entries && atKeyIndex in this.entries) {
			const entry = this.entries[atKeyIndex];
			if (this.context.eq(entry[0], key as any)) return entry[1];
			return OptLazy(otherwise) as O;
		}

		if (null !== this.entrySets && atKeyIndex in this.entrySets) {
			const entrySet = this.entrySets[atKeyIndex];
			return entrySet.get(key as any, otherwise as any, keyHash) as any;
		}

		return OptLazy(otherwise) as O;
	}

	// at is legacy, now get
	// at<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>, hash?: number): V | O {
	// 	return this.get(key as any, otherwise as any, hash as any) as any;
	// }

	setEntry(
		entry: readonly [K, V],
		hash = this.context.hash(entry[0] as any),
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
					.setEntry(currentEntry as any)
					.setEntry(entry as any, hash) as unknown as MapEntrySet<K, V>;

				const newEntrySets =
					null === this.entrySets ? [] : this.entrySets.slice();
				newEntrySets[atKeyIndex] = newEntrySet;

				return this.copy(newEntries, newEntrySets, this.size + 1);
			}

			const newEntrySet = this.context.collision<V>(
				this.context.listContext.of(currentEntry as any, entry as any) as any,
			);
			const newEntrySets =
				null === this.entrySets ? [] : this.entrySets.slice();
			newEntrySets[atKeyIndex] = newEntrySet as any;

			return this.copy(newEntries, newEntrySets, this.size + 1);
		}

		if (null !== this.entrySets && atKeyIndex in this.entrySets) {
			const currentEntrySet = this.entrySets[atKeyIndex];
			const newEntrySet = (currentEntrySet as any).setEntry(
				entry,
				hash,
			) as MapEntrySet<K, V>;
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

	// addEntry is legacy internal, now setEntry, keep for internal HAMT logic but comment public
	// addEntry(entry: readonly [K, V], hash = this.context.hash(entry[0])): HashMapBlock<K, V> {
	// 	return this.setEntry(entry, hash);
	// }

	// keep addEntry as private helper for block creation (used by context)
	addEntry(
		entry: readonly [K, V],
		hash = this.context.hash(entry[0] as any),
	): HashMapBlock<K, V> {
		return this.setEntry(entry, hash);
	}

	modifyAt(
		atKey: K,
		options: ModifyOptions<V>,
		atKeyHash = this.context.hash(atKey as any),
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
					update !== undefined ? update(currentValue, token as any) : set;

				if (Object.is(newValue, currentValue as any)) return this;

				const newEntries = this.entries.slice();

				if (token === newValue) {
					delete newEntries[atKeyIndex];

					for (const _ in newEntries) {
						return this.copy(newEntries, undefined, this.size - 1);
					}

					if (this.size === 1) return this.context.empty();

					return this.copy(null as any, undefined, this.size - 1);
				}

				newEntries[atKeyIndex] = [atKey, newValue as V];
				return this.copy(newEntries);
			}

			// no exact match, but key collision
			if (undefined === ifNew) return this;

			const { set, create } = ifNew;
			const token = Symbol();
			const newValue = create !== undefined ? create(token as any) : set;

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
					.setEntry(currentEntry as any)
					.set(atKey as any, newValue as any) as unknown as MapEntrySet<K, V>;

				const newEntrySets =
					null === this.entrySets ? [] : this.entrySets.slice();
				newEntrySets[atKeyIndex] = newEntrySet;

				return this.copy(newEntries, newEntrySets, this.size + 1);
			}

			// create collision
			const newEntry: [K, V] = [atKey, newValue as V];
			const newEntrySet = this.context.collision<V>(
				this.context.listContext.of(
					currentEntry as any,
					newEntry as any,
				) as any,
			);
			const newEntrySets =
				null === this.entrySets ? [] : this.entrySets.slice();
			newEntrySets[atKeyIndex] = newEntrySet as any;

			return this.copy(newEntries, newEntrySets, this.size + 1);
		}

		if (null !== this.entrySets && atKeyIndex in this.entrySets) {
			// key is in entrySet
			const currentEntrySet = this.entrySets[atKeyIndex];
			const newEntrySet: MapEntrySet<K, V> = (currentEntrySet as any).modifyAt(
				atKey,
				options as any,
				atKeyHash,
			) as any;

			if (newEntrySet === currentEntrySet) return this;

			if (newEntrySet.size === 1) {
				let firstEntry: readonly [K, V] | undefined;

				if (this.context.isHashMapBlock<K, V>(newEntrySet as any)) {
					for (const key in (newEntrySet as any).entries!) {
						firstEntry = (newEntrySet as any).entries![key];
						break;
					}
				} else {
					firstEntry = (newEntrySet as any).entries.first();
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
		const newValue = create !== undefined ? create(token as any) : set;

		if (token === newValue) return this;

		const newEntry: [K, V] = [atKey, newValue as V];
		const newEntries = null === this.entries ? [] : this.entries.slice();
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
				f(this.entries[key]!, state.nextIndex(), halt);
				if (state.halted) return;
			}
		}
		if (null !== this.entrySets) {
			for (const key in this.entrySets) {
				this.entrySets[key]!.forEach(f, { state });
				if (state.halted) return;
			}
		}
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
							(es as any).mapValues(mapFun) as MapEntrySet<K, V2>,
					);

		return new HashMapBlock<K, V2>(
			this.context as any,
			newEntries as any,
			newEntrySets as any,
			this.size,
			this.level,
		);
	}

	toArray(): ArrayNonEmpty<[K, V]> {
		let result: (readonly [K, V])[] = [];

		if (null !== this.entries) {
			result = Stream.fromObjectValues(this.entries as any).toArray() as any;
		}
		if (null !== this.entrySets) {
			Stream.fromObjectValues(this.entrySets as any).forEach(
				(entrySet: MapEntrySet<K, V>): void => {
					result = result.concat(entrySet.toArray() as any);
				},
			);
		}

		return result as ArrayNonEmpty<[K, V]>;
	}
}

export class HashMapCollision<K, V> extends HashMapNonEmptyBase<K, V> {
	constructor(
		readonly context: HashMapNonEmptyContext<K, V>,
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
		keyHash?: number,
	): V | O {
		if (!this.context.hasher.isValid(key as any))
			return OptLazy(otherwise) as O;

		const token = Symbol();
		const stream = this.stream();
		const foundEntry = stream.find(
			(entry): boolean => this.context.eq(entry[0], key as any),
			{
				otherwise: token,
			} as const,
		);

		if (token === foundEntry) return OptLazy(otherwise) as O;

		return (foundEntry as any)[1];
	}

	// at is legacy, now get
	// at<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>, keyHash?: number): V | O {
	// 	return this.get(key as any, otherwise as any, keyHash as any) as any;
	// }

	setEntry(entry: readonly [K, V], _hash?: number): HashMapCollision<K, V> {
		const currentIndex = this.stream().indexWhere((currentEntry): boolean =>
			this.context.eq(currentEntry[0], entry[0]),
		);

		if (undefined === currentIndex) {
			return this.copy(this.entries.append(entry as any) as any);
		}

		return this.copy(
			this.entries.updateAt(currentIndex, (currentEntry): readonly [K, V] => {
				if (Object.is(currentEntry[1], entry[1])) return currentEntry;
				return entry;
			}) as any,
		);
	}

	// addEntry is legacy, now setEntry
	// addEntry(entry: readonly [K, V], hash?: number): HashMapCollision<K, V> {
	// 	return this.setEntry(entry, hash);
	// }

	addEntry(entry: readonly [K, V], hash?: number): HashMapCollision<K, V> {
		return this.setEntry(entry, hash);
	}

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
			const newValue = create !== undefined ? create(token as any) : set;

			if (token === newValue) return this;

			const newEntries = this.entries.append([atKey, newValue as V] as any);
			return this.copy(newEntries as any);
		}

		if (undefined === ifExists) return this;
		const { set, update } = ifExists;

		const currentEntry = this.entries.at(
			currentIndex,
			RimbuError.throwInvalidStateError,
		);
		const currentValue = currentEntry[1];
		const token = Symbol();
		const newValue =
			update !== undefined ? update(currentValue, token as any) : set;

		if (token === newValue) {
			const newEntries = this.entries
				.remove(currentIndex)
				.assumeNonEmpty() as any;
			// if last entry removed, this collision would be empty, but collision is always non-empty; caller will handle collapsing
			// For consistency with block logic, if size would become 0, we need to return empty? But collision size 1 removal handled by caller.
			// Here we just return copy; if newEntries is empty, it would throw, but that case is handled by block's collapse logic.
			if ((newEntries as any).length === 0) return this.context.empty() as any;
			return this.copy(newEntries as any);
		}

		if (Object.is(newValue, currentValue)) return this;

		const newEntry: [K, V] = [atKey, newValue as V];
		const newEntries = this.entries.with(currentIndex, newEntry as any);
		return this.copy(newEntries as any);
	}

	forEach(
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		this.entries.forEach(f as any, { state });
	}

	mapValues<V2>(mapFun: (value: V, key: K) => V2): HashMap.NonEmpty<K, V2> {
		const newEntries = this.entries.map((e): readonly [K, V2] => [
			e[0],
			mapFun(e[1], e[0]),
		]);
		return new HashMapCollision(this.context as any, newEntries as any);
	}

	toArray(): ArrayNonEmpty<readonly [K, V]> {
		return this.entries.toArray() as any;
	}
}
