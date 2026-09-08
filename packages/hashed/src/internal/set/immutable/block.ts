import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { HashSet } from '@rimbu/hashed/set';

import type { HashSetContext } from '#set/context';
import type { HashSetCollision } from '#set/immutable/collision';

import * as RimbuError from '@rimbu/base/rimbu-error';
import { Stream } from '@rimbu/stream';

import { HashSetNonEmptyBase } from '#set/immutable/non-empty';

export type SetEntrySet<T> = HashSetBlock<T> | HashSetCollision<T>;

export class HashSetBlock<T> extends HashSetNonEmptyBase<T> {
	constructor(
		context: HashSetContext<T>,
		readonly entries: readonly T[] | null,
		readonly entrySets: readonly SetEntrySet<T>[] | null,
		readonly size: number,
		readonly level: number,
	) {
		super(context);
	}

	copy(
		entries = this.entries,
		entrySets = this.entrySets,
		size = this.size,
	): HashSetBlock<T> {
		if (
			entries === this.entries &&
			entrySets === this.entrySets &&
			size === this.size
		) {
			return this;
		}
		return new HashSetBlock(this.context, entries, entrySets, size, this.level);
	}

	stream(): Stream.NonEmpty<T> {
		if (null !== this.entries) {
			if (null === this.entrySets) {
				return Stream.fromObjectValues(this.entries) as Stream.NonEmpty<T>;
			}

			return Stream.fromObjectValues(this.entries).concat(
				Stream.fromObjectValues(this.entrySets).flatMap(
					(entrySet): Stream.NonEmpty<T> => entrySet.stream(),
				),
			) as Stream.NonEmpty<T>;
		}

		if (null === this.entrySets) {
			RimbuError.throwInvalidStateError();
		}

		return Stream.fromObjectValues(this.entrySets).flatMap(
			(entrySet): Stream.NonEmpty<T> => entrySet.stream(),
		) as Stream.NonEmpty<T>;
	}

	hasInternal(value: T, hash: number): boolean {
		const atKeyIndex = this.context.getKeyIndex(this.level, hash);

		if (null !== this.entries && atKeyIndex in this.entries) {
			const entry = this.entries[atKeyIndex];
			return this.context.eq(entry, value);
		}

		if (null !== this.entrySets && atKeyIndex in this.entrySets) {
			const entrySet = this.entrySets[atKeyIndex];
			return entrySet.hasInternal(value, hash);
		}

		return false;
	}

	add(value: T, hash = this.context.hash(value)): HashSetBlock<T> {
		const atKeyIndex = this.context.getKeyIndex(this.level, hash);

		if (null !== this.entries && atKeyIndex in this.entries) {
			const currentValue = this.entries[atKeyIndex];
			if (this.context.eq(value, currentValue)) return this;

			let newEntries: T[] | null = this.entries.slice();
			delete newEntries[atKeyIndex];

			let isEmpty = true;
			/* eslint-disable @typescript-eslint/no-unused-vars */
			for (const _ in newEntries) {
				isEmpty = false;
				break;
			}
			if (isEmpty) newEntries = null;

			if (this.level < this.context.maxDepth) {
				const newEntrySet = this.context
					.block<T>(null, null, 0, this.level + 1)
					.add(currentValue)
					.add(value, hash);

				const newEntrySets =
					null === this.entrySets ? [] : this.entrySets.slice();
				newEntrySets[atKeyIndex] = newEntrySet;

				return this.copy(newEntries, newEntrySets, this.size + 1);
			}

			const newEntrySet = this.context.collision(
				this.context.listContext.of(currentValue, value),
			);
			const newEntrySets =
				null === this.entrySets ? [] : this.entrySets.slice();
			newEntrySets[atKeyIndex] = newEntrySet;

			return this.copy(newEntries, newEntrySets, this.size + 1);
		}

		if (null !== this.entrySets && atKeyIndex in this.entrySets) {
			const currentEntrySet = this.entrySets[atKeyIndex];
			const newEntrySet = currentEntrySet.add(value, hash);
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
		newEntries[atKeyIndex] = value;

		return this.copy(newEntries, undefined, this.size + 1);
	}

	remove(value: T, hash?: number): HashSet<T> {
		if (!this.context.hasher.isValid(value)) return this;

		const valueHash = hash ?? this.context.hash(value);

		const atKeyIndex = this.context.getKeyIndex(this.level, valueHash);

		if (null !== this.entries && atKeyIndex in this.entries) {
			const currentValue = this.entries[atKeyIndex];

			if (!this.context.eq(currentValue, value)) return this;

			if (this.size === 1) return this.context.empty();

			const newEntries = this.entries.slice();

			delete newEntries[atKeyIndex];

			for (const _ in newEntries) {
				return this.copy(newEntries, undefined, this.size - 1);
			}

			return this.copy(null, undefined, this.size - 1);
		}

		if (null !== this.entrySets && atKeyIndex in this.entrySets) {
			// key is in entrySet
			const currentEntrySet = this.entrySets[atKeyIndex];
			const newEntrySet = currentEntrySet.remove(value, hash) as SetEntrySet<T>;

			if (newEntrySet === currentEntrySet) return this;

			if (newEntrySet.size === 1) {
				let firstValue: T = undefined as any;

				if (this.context.isHashSetBlock(newEntrySet)) {
					for (const key in newEntrySet.entries!) {
						firstValue = newEntrySet.entries![key];
						break;
					}
				} else {
					firstValue = newEntrySet.entries.first();
				}

				const newEntries = null === this.entries ? [] : this.entries.slice();
				newEntries[atKeyIndex] = firstValue;

				const newEntrySets = this.entrySets.slice();
				delete newEntrySets[atKeyIndex];

				return this.copy(newEntries, newEntrySets, this.size - 1);
			}

			const newEntrySets = this.entrySets.slice();
			newEntrySets[atKeyIndex] = newEntrySet;

			return this.copy(
				undefined,
				newEntrySets,
				this.size - currentEntrySet.size + newEntrySet.size,
			);
		}

		return this;
	}

	forEach(f: (entry: T) => void): void {
		this.entries?.forEach(f);

		this.entrySets?.forEach((entrySet) => {
			entrySet.forEach(f);
		});
	}

	map<T2>(f: (value: T) => T2): HashSetBlock<T2> {
		return new HashSetBlock<T2>(
			this.context as unknown as HashSetContext<T2>,
			this.entries?.map(f) ?? null,
			this.entrySets?.map((entrySet) => entrySet.map(f)) ?? null,
			this.size,
			this.level,
		);
	}

	toArray(): ArrayNonEmpty<T> {
		let result = this.entries?.filter(() => true) ?? [];

		if (null !== this.entrySets) {
			for (const key in this.entrySets) {
				const entrySetArray = this.entrySets[key].toArray();
				result = result.concat(entrySetArray);
			}
		}

		return result as ArrayNonEmpty<T>;
	}
}
