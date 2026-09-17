import type { IndexRange } from '@rimbu/common/index-range';
import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common/types';
import type { SortedSet } from '@rimbu/sorted/set';

import type { SortedSetContext } from '#set/context';

import * as Arr from '@rimbu/base/arr';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream } from '@rimbu/stream';

import { SortedSetNode } from '#set/immutable/node';
import {
	leafDeleteMax,
	leafDeleteMin,
	leafMutateGetFromLeft,
	leafMutateGetFromRight,
	leafMutateGiveToLeft,
	leafMutateGiveToRight,
	leafMutateJoinLeft,
	leafMutateJoinRight,
	leafMutateSplitRight,
} from '#sorted/base';
import { SortedIndex } from '#sorted/sorted-index';

export class SortedSetLeaf<T> extends SortedSetNode<T> {
	constructor(
		readonly context: SortedSetContext<T>,
		public entries: readonly T[],
	) {
		super(context);
	}

	copy(entries: readonly T[]): SortedSetLeaf<T> {
		if (entries === this.entries) return this;
		return this.context.leaf(entries);
	}

	get size(): number {
		return this.entries.length;
	}

	stream(options: { reversed?: boolean } = {}): Stream.NonEmpty<T> {
		return Stream.fromArray(this.entries, options) as Stream.NonEmpty<T>;
	}

	streamSlice(
		range: IndexRange,
		options: { reversed?: boolean } = {},
	): Stream<T> {
		const { reversed = false } = options;

		return Stream.fromArray(this.entries, { range, reversed });
	}

	// min(): T {
	// 	return this.entries[0];
	// }

	// max(): T {
	// 	return this.entries.at(-1)!;
	// }

	has = <U>(value: RelatedTo<T, U>): boolean => {
		if (!this.context.comp.isComparable(value)) return false;
		return this.context.findIndex(value, this.entries) >= 0;
	};

	indexOf<US = T>(value: RelatedTo<T, US>): number | undefined;
	indexOf<US, O>(value: RelatedTo<T, US>, otherwise: OptLazy<O>): number | O;
	indexOf<US, O>(value: RelatedTo<T, US>, otherwise?: OptLazy<O>): number | O {
		if (!this.context.comp.isComparable(value)) return OptLazy(otherwise) as O;
		const index = this.context.findIndex(value, this.entries);
		return index < 0 ? (OptLazy(otherwise) as O) : index;
	}

	at<O>(index: number, otherwise?: OptLazy<O>): T | O {
		if (index >= this.size || -index > this.size) {
			return OptLazy(otherwise) as O;
		}
		if (index < 0) {
			return this.at(this.size + index, otherwise);
		}

		return this.entries[index];
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		Arr.forEach(this.entries, f, state);
	}

	toArray(): ArrayNonEmpty<T> {
		return this.entries.slice() as ArrayNonEmpty<T>;
	}

	// internal methods

	getInsertIndexOf(value: T): number {
		return this.context.findIndex(value, this.entries);
	}

	addInternal(value: T): SortedSetNode<T> {
		const index = this.context.findIndex(value, this.entries);

		if (index >= 0) {
			const newEntries = Arr.set(this.entries, index, value);
			return this.copy(newEntries);
		}

		const insertIndex = SortedIndex.next(index);
		const newEntries = Arr.insert(this.entries, insertIndex, value);
		return this.copy(newEntries);
	}

	removeInternal(value: T): SortedSetNode<T> {
		const entryIndex = this.context.findIndex(value, this.entries);

		if (entryIndex < 0) return this;

		const currentValue = this.entries[entryIndex];

		if (this.context.comp.compare(currentValue, value) !== 0) return this;

		const newEntries = this.entries.toSpliced(entryIndex, 1);
		return this.copy(newEntries);
	}

	takeInternal(amount: number): SortedSetLeaf<T> {
		return this.context.leaf(this.entries.slice(0, amount));
	}

	dropInternal(amount: number): SortedSetLeaf<T> {
		return this.context.leaf(this.entries.slice(amount));
	}

	deleteMin(): [T, SortedSetLeaf<T>] {
		return leafDeleteMin<SortedSetLeaf<T>, T>(this);
	}

	deleteMax(): [T, SortedSetLeaf<T>] {
		return leafDeleteMax<SortedSetLeaf<T>, T>(this);
	}

	mutateSplitRight(index?: number): [T, SortedSetLeaf<T>] {
		return leafMutateSplitRight<SortedSetLeaf<T>, T>(this, index);
	}

	mutateGiveToLeft(left: SortedSetLeaf<T>, toLeft: T): [T, SortedSetLeaf<T>] {
		return leafMutateGiveToLeft(this, left, toLeft);
	}

	mutateGiveToRight(
		right: SortedSetLeaf<T>,
		toRight: T,
	): [T, SortedSetLeaf<T>] {
		return leafMutateGiveToRight(this, right, toRight);
	}

	mutateGetFromLeft(left: SortedSetLeaf<T>, toMe: T): [T, SortedSetLeaf<T>] {
		return leafMutateGetFromLeft(this, left, toMe);
	}

	mutateGetFromRight(right: SortedSetLeaf<T>, toMe: T): [T, SortedSetLeaf<T>] {
		return leafMutateGetFromRight(this, right, toMe);
	}

	mutateJoinLeft(left: SortedSetLeaf<T>, entry: T): void {
		leafMutateJoinLeft(this, left, entry);
	}

	mutateJoinRight(right: SortedSetLeaf<T>, entry: T): void {
		leafMutateJoinRight(this, right, entry);
	}

	normalize(): SortedSet<T> {
		if (this.entries.length === 0) return this.context.empty();
		if (this.entries.length <= this.context.maxEntries) return this;
		const size = this.size;
		const [upEntry, rightNode] = this.mutateSplitRight();
		return this.context.inner([upEntry], [this, rightNode], size);
	}
}
