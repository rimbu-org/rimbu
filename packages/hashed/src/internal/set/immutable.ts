import type { Collection } from '@rimbu/collection-types/collection';
// biome-ignore lint/correctness/noUnusedImports: TypesKey is used as a computed property key, which Biome does not detect
import type { TypesKey } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { HashSet } from '@rimbu/hashed/set';
import type { List } from '@rimbu/list';

import type { HashSetContext } from '#set/context';

import * as Arr from '@rimbu/base/arr';
import * as RimbuError from '@rimbu/base/rimbu-error';
import {
	defaultFlatMapIndexed,
	defaultMapIndexed,
} from '@rimbu/collection-types/advanced/collection-base';
import {
	defaultDifferenceByRemove,
	defaultFlatMapByUnion,
	defaultIntersectByAdd,
	defaultSymDifferenceByRemove,
	defaultUnionByAdd,
	SetCollectionEmptyBase,
	SetCollectionNonEmptyBase,
} from '@rimbu/collection-types/advanced/set-base';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream, type StreamSource } from '@rimbu/stream';

export type HashSetEmptyContext<E> = HashSetContext<E> &
	SetCollectionEmptyBase<E>['context'];

export type HashSetNonEmptyContext<T> = HashSetContext<T> &
	SetCollectionNonEmptyBase<T>['context'];

export class HashSetEmpty<E = any>
	extends SetCollectionEmptyBase<E>
	implements HashSet<E>
{
	declare readonly [TypesKey]: Collection.Advanced.Types<
		HashSet.Advanced.Family<E>,
		E
	>;

	constructor(readonly context: HashSetEmptyContext<E>) {
		super();

		this.addAll = context.from;
	}

	toString(): string {
		return `HashSet()`;
	}
}

export abstract class HashSetNonEmptyBase<T>
	extends SetCollectionNonEmptyBase<T>
	implements HashSet.NonEmpty<T>
{
	declare readonly [TypesKey]: Collection.Advanced.TypesNonEmpty<
		HashSet.Advanced.Family<T>,
		T
	>;

	constructor(readonly context: HashSetNonEmptyContext<T>) {
		super();
	}

	abstract hasInternal(element: T, hash: number): boolean;
	abstract add(element: T): HashSet.NonEmpty<T>;
	abstract remove(element: T): HashSet<T>;

	has = (value: T, inHash?: number): boolean => {
		if (!this.context.hasher.isValid(value)) return false;

		const hash = inHash ?? this.context.hash(value);

		return this.hasInternal(value, hash);
	};

	map<T2 extends this[TypesKey]['_UPPER_E']>(
		f: (element: T) => T2,
	): HashSet.NonEmpty<T2> {
		return this.context.from(this.stream().mapPure(f)) as HashSet.NonEmpty<T2>;
	}

	mapIndexed<T2 extends this[TypesKey]['_UPPER_E']>(
		f: (element: T, index: number) => T2,
		options?: { indexOffset?: number },
	): HashSet.NonEmpty<T2> {
		return defaultMapIndexed<T, T2, HashSet.NonEmpty<T>>(this, f, options);
	}

	removeAll(elements: StreamSource<T>): HashSet<T> {
		const builder = this.toBuilder();
		builder.removeAll(elements);
		if (builder.size === this.size) return this;
		return builder.build();
	}

	flatMap<T2 extends this[TypesKey]['_UPPER_E']>(
		f: (element: T) => StreamSource<T2>,
	): HashSet.NonEmpty<T2> {
		return defaultFlatMapByUnion(this, f) as HashSet.NonEmpty<T2>;
	}

	flatMapIndexed<T2 extends this[TypesKey]['_UPPER_E']>(
		f: (element: T, index: number) => StreamSource<T2>,
		options: { indexOffset?: number | undefined } | undefined,
	): HashSet.NonEmpty<T2> {
		return defaultFlatMapIndexed(this, f, options) as HashSet.NonEmpty<T2>;
	}

	union(other: StreamSource<T>): HashSet.NonEmpty<T> {
		return defaultUnionByAdd(this, other) as HashSet.NonEmpty<T>;
	}

	difference(other: StreamSource<T>): HashSet<T> {
		return defaultDifferenceByRemove(this, other);
	}

	intersection(other: StreamSource<T>): HashSet<T> {
		return defaultIntersectByAdd(this, other);
	}

	symmetricDifference(other: StreamSource<T>): HashSet<T> {
		return defaultSymDifferenceByRemove(this, other);
	}

	addAll(values: StreamSource<T>): HashSet.NonEmpty<T> {
		const builder = this.toBuilder();
		builder.addAll(values);
		return builder.build() as HashSet.NonEmpty<T>;
	}

	filter(
		pred: (value: T, index: number, halt: () => void) => boolean,
		options: { negate?: boolean | undefined } = {},
	): HashSet<T> {
		const builder = this.context.builder<T>();
		builder.addAll(this.stream().filter(pred, options));
		if (builder.size === this.size) return this;
		return builder.build();
	}

	toBuilder(): HashSet.Builder<T> {
		return this.context.createBuilder(this);
	}

	toString(): string {
		return this.stream().join({ start: 'HashSet(', sep: ', ', end: ')' });
	}
}

export type SetEntrySet<T> = HashSetBlock<T> | HashSetCollision<T>;

export class HashSetBlock<T> extends HashSetNonEmptyBase<T> {
	constructor(
		context: HashSetNonEmptyContext<T>,
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

			let newEntries: T[] | null = Arr.copySparse(this.entries);
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
					null === this.entrySets ? [] : Arr.copySparse(this.entrySets);
				newEntrySets[atKeyIndex] = newEntrySet;

				return this.copy(newEntries, newEntrySets, this.size + 1);
			}

			const newEntrySet = this.context.collision(
				this.context.listContext.of(currentValue, value),
			);
			const newEntrySets =
				null === this.entrySets ? [] : Arr.copySparse(this.entrySets);
			newEntrySets[atKeyIndex] = newEntrySet;

			return this.copy(newEntries, newEntrySets, this.size + 1);
		}

		if (null !== this.entrySets && atKeyIndex in this.entrySets) {
			const currentEntrySet = this.entrySets[atKeyIndex];
			const newEntrySet = currentEntrySet.add(value, hash);
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

			const newEntries = Arr.copySparse(this.entries);

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

				const newEntries =
					null === this.entries ? [] : Arr.copySparse(this.entries);
				newEntries[atKeyIndex] = firstValue;

				const newEntrySets = Arr.copySparse(this.entrySets);
				delete newEntrySets[atKeyIndex];

				return this.copy(newEntries, newEntrySets, this.size - 1);
			}

			const newEntrySets = Arr.copySparse(this.entrySets);
			newEntrySets[atKeyIndex] = newEntrySet;

			return this.copy(
				undefined,
				newEntrySets,
				this.size - currentEntrySet.size + newEntrySet.size,
			);
		}

		return this;
	}

	forEach(
		f: (entry: T, index: number, halt: () => void) => void,
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

	toArray(): ArrayNonEmpty<T> {
		const result = new Array(this.size) as ArrayNonEmpty<T>;

		let index = 0;

		if (null !== this.entries) {
			for (const key in this.entries) {
				result[index++] = this.entries[key];
			}
		}

		if (null !== this.entrySets) {
			for (const key in this.entrySets) {
				const entrySetArray = this.entrySets[key].toArray();
				result.copyWithin(index, 0, entrySetArray.length);
				index += entrySetArray.length;
			}
		}

		return result;
	}
}

export class HashSetCollision<T> extends HashSetNonEmptyBase<T> {
	constructor(
		context: HashSetNonEmptyContext<T>,
		readonly entries: List.NonEmpty<T>,
	) {
		super(context);
	}

	get size(): number {
		return this.entries.length;
	}

	copy(entries = this.entries): HashSetCollision<T> {
		if (entries === this.entries) return this;
		return new HashSetCollision(this.context, entries);
	}

	stream(): Stream.NonEmpty<T> {
		return this.entries.stream();
	}

	hasInternal(value: T, _hash: number): boolean {
		if (!this.context.hasher.isValid(value)) return false;
		return this.stream().contains(value, { eq: this.context.eq });
	}

	add(value: T): HashSetCollision<T> {
		const currentIndex = this.stream().indexOf(value, { eq: this.context.eq });

		if (undefined === currentIndex) {
			return this.copy(this.entries.append(value));
		}

		return this.copy(this.entries.with(currentIndex, value));
	}

	remove(value: T, _hash?: number): HashSet<T> {
		if (!this.context.hasher.isValid(value)) return this;

		const currentIndex = this.stream().indexOf(value, { eq: this.context.eq });

		if (undefined === currentIndex) return this;

		const newEntries = this.entries.remove(currentIndex).assumeNonEmpty();
		return this.copy(newEntries);
	}

	forEach(
		f: (entry: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		this.entries.forEach(f, { state });
	}

	toArray(): ArrayNonEmpty<T> {
		return this.entries.toArray();
	}
}
