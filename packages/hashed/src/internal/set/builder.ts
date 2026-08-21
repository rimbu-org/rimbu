import type { Collection } from '@rimbu/collection-types/collection';
// biome-ignore lint/correctness/noUnusedImports: TypesKey is used as a computed property key, which Biome does not detect
import type { TypesKey } from '@rimbu/collection-types/types';
import type { HashSet } from '@rimbu/hashed/set';

import type { HashSetContext } from '#set/context';
import type { HashSetBlock, HashSetCollision } from '#set/immutable';

import * as Arr from '@rimbu/base/arr';
import * as RimbuError from '@rimbu/base/rimbu-error';
import { SetCollectionBuilderBase } from '@rimbu/collection-types/advanced/set-base';
import { List } from '@rimbu/list';
import { Stream, type StreamSource } from '@rimbu/stream';

export type SetBlockBuilderEntry<T> =
	| HashSetBlockBuilder<T>
	| HashSetCollisionBuilder<T>;

export type HashSetBuilderContext<T> = HashSetContext<T> &
	SetCollectionBuilderBase<T>['context'];

export class HashSetBlockBuilder<T>
	extends SetCollectionBuilderBase<T>
	implements HashSet.Builder<T>
{
	declare readonly [TypesKey]: Collection.Advanced.Types<
		HashSet.Advanced.Family<T>,
		T
	>;

	constructor(
		readonly context: HashSetBuilderContext<T>,
		public source?: undefined | HashSetBlock<T>,
		public _entries?: undefined | T[],
		public _entrySets?: undefined | SetBlockBuilderEntry<T>[],
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
					null === this.source.entries
						? []
						: Arr.copySparse(this.source.entries);
			} else {
				this._entries = [];
			}
		}

		if (undefined === this._entrySets) {
			if (undefined !== this.source && null !== this.source.entrySets) {
				this._entrySets = Arr.mapSparse(
					this.source.entrySets,
					(entrySet): SetBlockBuilderEntry<T> => {
						if (this.context.isHashSetBlock(entrySet)) {
							return new HashSetBlockBuilder(this.context, entrySet);
						}
						return new HashSetCollisionBuilder(this.context, entrySet);
					},
				);
			} else {
				this._entrySets = [];
			}
		}
	}

	get entries(): T[] {
		this.prepareMutate();

		return this._entries!;
	}

	get entrySets(): SetBlockBuilderEntry<T>[] {
		this.prepareMutate();

		return this._entrySets!;
	}

	has = (value: T): boolean => {
		if (undefined !== this.source) return this.source.has(value);

		if (!this.context.hasher.isValid(value)) return false;

		return this.hasInternal(value);
	};

	hasInternal(value: T, hash = this.context.hash(value)): boolean {
		if (undefined !== this.source) return this.source.hasInternal(value, hash);

		const keyIndex = this.context.getKeyIndex(this.level, hash);

		if (keyIndex in this.entries) {
			return this.context.eq(value, this.entries[keyIndex]);
		}

		if (keyIndex in this.entrySets) {
			const currentEntrySet = this.entrySets[keyIndex];
			return currentEntrySet.hasInternal(value, hash);
		}

		return false;
	}

	add = (value: T): boolean => {
		this.checkLock();

		return this.addInternal(value);
	};

	clear = (): void => {
		this.checkLock();

		this.source = undefined;
		this._entries = undefined;
		this._entrySets = undefined;
		this.size = 0;
	};

	addAll = (source: StreamSource<T>): boolean => {
		this.checkLock();

		return Stream.from(source).filterPure({ pred: this.add }).count() > 0;
	};

	addInternal(value: T, hash = this.context.hash(value)): boolean {
		const keyIndex = this.context.getKeyIndex(this.level, hash);

		if (keyIndex in this.entries) {
			const currentEntry = this.entries[keyIndex];

			if (this.context.eq(value, currentEntry)) return false;

			this.source = undefined;

			this.size++;

			delete this.entries[keyIndex];

			if (this.level < this.context.maxDepth) {
				const newEntrySet = new HashSetBlockBuilder<T>(
					this.context,
					undefined,
					undefined,
					undefined,
					0,
					this.level + 1,
				);
				newEntrySet.addInternal(currentEntry);
				newEntrySet.addInternal(value, hash);

				this.entrySets[keyIndex] = newEntrySet;
				return true;
			}

			const newEntries = List.builder<T>();
			newEntries.append(currentEntry);
			newEntries.append(value);

			const newEntrySet = new HashSetCollisionBuilder<T>(
				this.context,
				undefined,
				newEntries,
			);
			this.entrySets[keyIndex] = newEntrySet;
			return true;
		}

		if (keyIndex in this.entrySets) {
			const currentEntrySet = this.entrySets[keyIndex];
			const preSize = currentEntrySet.size;
			const changed = currentEntrySet.addInternal(value, hash);

			if (changed) this.source = undefined;

			this.size += currentEntrySet.size - preSize;
			return changed;
		}

		this.source = undefined;

		this.size++;
		this.entries[keyIndex] = value;
		return true;
	}

	remove = (value: T): boolean => {
		this.checkLock();

		if (!this.context.hasher.isValid(value)) return false;

		return this.removeInternal(value);
	};

	removeAll = (values: StreamSource<T>): boolean => {
		return Stream.from(values).filterPure({ pred: this.remove }).count() > 0;
	};

	removeInternal(value: T, hash = this.context.hash(value)): boolean {
		const index = this.context.getKeyIndex(this.level, hash);

		if (index in this.entries) {
			// potential match in entries
			const currentValue = this.entries[index];

			if (!this.context.eq(value, currentValue)) return false;

			// exact match
			this.source = undefined;

			this.size--;
			delete this.entries[index];
			return true;
		}

		if (index in this.entrySets) {
			// potential match in entrysets
			const entrySet = this.entrySets[index];
			const preSize = entrySet.size;

			if (!entrySet.removeInternal(value, hash)) {
				return false;
			}

			this.source = undefined;

			this.size += entrySet.size - preSize;

			if (entrySet.size > 1) return true;

			// single entry needs to be pulled up

			let first: T = undefined as any;

			if (this.context.isHashSetBlockBuilder(entrySet)) {
				for (const i in entrySet.entries) {
					first = entrySet.entries[i];
					break;
				}
			} else {
				first = entrySet.entries.at(0, RimbuError.throwInvalidStateError);
			}

			delete this.entrySets[index];

			// if the sparse emptySets array is empty, set it to an empty array
			let hasEntrySets = false;
			for (const _ in this.entrySets) {
				hasEntrySets = true;
				break;
			}

			if (!hasEntrySets) {
				this.entrySets.length = 0;
			}

			this.entries[index] = first;
			return true;
		}

		return false;
	}

	forEach = (f: (value: T) => void): void => {
		this._lock++;

		if (undefined !== this.source) {
			this.source.forEach(f);
		} else {
			this._entries?.forEach(f);

			if (undefined !== this._entrySets) {
				for (const entrySet of this._entrySets) {
					entrySet.forEach(f);
				}
			}
		}

		this._lock--;
	};

	build = (): HashSet<T> => {
		if (this.size === 0) return this.context.empty<T>();

		return this.buildNE();
	};

	buildNE(): HashSetBlock<T> {
		if (undefined !== this.source) return this.source;

		const entries =
			this.entries.length === 0 ? null : Arr.copySparse(this.entries);

		const entrySets =
			this.entrySets.length === 0
				? null
				: Arr.mapSparse(this.entrySets, (entrySet) => entrySet.buildNE());

		return this.context.block(entries, entrySets, this.size, this.level);
	}
}

export class HashSetCollisionBuilder<T> {
	constructor(
		readonly context: HashSetBuilderContext<T>,
		public source?: undefined | HashSetCollision<T>,
		public _entries?: undefined | List.Builder<T>,
	) {
		// super();
	}

	get entries(): List.Builder<T> {
		if (undefined === this._entries) {
			if (undefined !== this.source) {
				this._entries = this.source.entries.toBuilder();
			} else {
				this._entries = this.context.listContext.builder();
			}
		}

		return this._entries!;
	}

	get size(): number {
		if (undefined !== this.source) return this.source.size;

		return this.entries.length;
	}

	hasInternal(value: T, hash?: number): boolean {
		if (undefined !== this.source) return this.source.has(value, hash);

		let result = false;
		this.entries.forEach((v, _, halt): void => {
			if (this.context.eq(v, value)) {
				result = true;
				halt();
			}
		});
		return result;
	}

	addInternal(value: T): boolean {
		let index = -1;
		this.entries.forEach((v, i, halt): void => {
			if (this.context.eq(v, value)) {
				index = i;
				halt();
			}
		});

		if (index < 0) {
			this.source = undefined;

			this.entries.append(value);
			return true;
		}

		const token = Symbol();
		const oldValue = this.entries.set(index, value, token);

		const changed = token === oldValue || !this.context.eq(oldValue, value);

		if (changed) this.source = undefined;

		return changed;
	}

	removeInternal(value: T): boolean {
		let index = -1;

		this.entries.forEach((v, i, halt): void => {
			if (this.context.eq(v, value)) {
				index = i;
				halt();
			}
		});

		if (index < 0) return false;

		this.source = undefined;

		this.entries.remove(index);
		return true;
	}

	forEach(f: (value: T) => void): void {
		this.entries.forEach(f);
	}

	buildNE(): HashSetCollision<T> {
		return (
			this.source ??
			this.context.collision(this.entries.build().assumeNonEmpty())
		);
	}
}
