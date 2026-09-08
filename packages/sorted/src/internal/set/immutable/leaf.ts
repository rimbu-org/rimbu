import type { IndexRange } from '@rimbu/common/index-range';
import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common/types';
import type { SortedSet } from '@rimbu/sorted/set';
import type { SortedSetContext } from './context';

import * as Arr from '@rimbu/base/arr';
import * as RimbuError from '@rimbu/base/rimbu-error';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream } from '@rimbu/stream';
import { SortedSetNode } from './node';

import {
	innerDeleteMax,
	innerDeleteMin,
	innerDropInternal,
	innerGetAtIndex,
	innerMutateGetFromLeft,
	innerMutateGetFromRight,
	innerMutateGiveToLeft,
	innerMutateGiveToRight,
	innerMutateJoinLeft,
	innerMutateJoinRight,
	innerMutateSplitRight,
	innerNormalizeDownsizeChild,
	innerNormalizeIncreaseChild,
	innerStreamSliceIndex,
	innerTakeInternal,
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
		super();
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

	// streamSliceIndex(
	// 	range: IndexRange,
	// 	options: { reversed?: boolean } = {},
	// ): Stream<T> {
	// 	const { reversed = false } = options;

	// 	return Stream.fromArray(this.entries, { range, reversed });
	// }

	// min(): T {
	// 	return this.entries[0];
	// }

	// max(): T {
	// 	return this.entries.at(-1)!;
	// }

	has<U>(value: RelatedTo<T, U>): boolean {
		if (!this.context.comp.isComparable(value)) return false;
		return this.context.findIndex(value, this.entries) >= 0;
	}

	findIndex<O>(value: T, otherwise?: OptLazy<O>): number | O {
		if (!this.context.comp.isComparable(value)) return OptLazy(otherwise!);
		const index = this.context.findIndex(value, this.entries);
		return index < 0 ? OptLazy(otherwise!) : index;
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

export class SortedSetInner<T> extends SortedSetNode<T> {
	constructor(
		readonly context: SortedSetContext<T>,
		public entries: readonly T[],
		public children: readonly SortedSetNode<T>[],
		public size: number,
	) {
		super();
	}

	get mutateChildren(): SortedSetNode<T>[] {
		return this.children as SortedSetNode<T>[];
	}

	copy(
		entries: readonly T[] = this.entries,
		children: readonly SortedSetNode<T>[] = this.children,
		size: number = this.size,
	): SortedSetInner<T> {
		if (
			entries === this.entries &&
			children === this.children &&
			size === this.size
		)
			return this;
		return this.context.inner(entries, children, size);
	}

	stream(options: { reversed?: boolean } = {}): Stream.NonEmpty<T> {
		const token = Symbol();

		return Stream.zipAll(
			token,
			Stream.fromArray(this.children, options),
			Stream.fromArray(this.entries, options),
		).flatMap(([child, e]): Stream.NonEmpty<T> => {
			if (token === child) RimbuError.throwInvalidStateError();
			if (token === e) return child.stream(options);
			return child.stream(options).append(e);
		}) as Stream.NonEmpty<T>;
	}

	streamSliceIndex(
		range: IndexRange,
		options: { reversed?: boolean } = {},
	): Stream<T> {
		const { reversed = false } = options;

		return innerStreamSliceIndex<T>(this, range, reversed);
	}

	has<U>(value: RelatedTo<T, U>): boolean {
		if (!this.context.comp.isComparable(value)) return false;

		const index = this.context.findIndex(value, this.entries);

		if (index >= 0) return true;

		const childIndex = SortedIndex.next(index);
		const child = this.children[childIndex];

		return child.has<U>(value);
	}

	findIndex<O>(value: T, otherwise?: OptLazy<O>): number | O {
		if (!this.context.comp.isComparable(value)) return OptLazy(otherwise!);

		const index = this.context.findIndex(value, this.entries);
		if (index >= 0)
			return (
				Stream.fromArray(this.children, {
					range: { amount: index + 1 },
				}).fold(0, (x, y) => x + y.size) + index
			);
		const childIndex = SortedIndex.next(index);
		const child = this.children[childIndex];
		const index$ = child.findIndex(value);
		if (undefined !== index$) {
			return (
				index$ +
				(this.children.slice(0, childIndex).reduce((x, y) => x + y.size, 0) -
					index -
					1)
			);
		}

		return OptLazy(otherwise!);
	}

	at<O>(index: number, otherwise?: OptLazy<O>): T | O {
		return innerGetAtIndex<T, O>(this, index, otherwise);
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		let i = -1;

		const { halt } = state;

		while (!state.halted && i < this.entries.length) {
			if (i >= 0) f(this.entries[i], state.nextIndex(), halt);
			else {
				const childIndex = SortedIndex.next(i);
				this.children[childIndex].forEach(f, { state });
			}
			i = SortedIndex.next(i);
		}
	}

	toArray(): ArrayNonEmpty<T> {
		let i = -1;
		let result: T[] = [];

		while (i < this.entries.length) {
			if (i >= 0) result.push(this.entries[i]);
			else {
				const childIndex = SortedIndex.next(i);
				result = result.concat(this.children[childIndex].toArray());
			}
			i = SortedIndex.next(i);
		}

		return result as ArrayNonEmpty<T>;
	}

	// internal methods

	getInsertIndexOf(value: T): number {
		let index = 0;

		for (let i = 0; i < this.entries.length; i++) {
			const comp = this.context.comp.compare(value, this.entries[i]);
			const child = this.children[i];

			if (comp < 0) {
				const insertIndex = child.getInsertIndexOf(value);

				if (insertIndex < 0) return -index + insertIndex;
				return index + insertIndex;
			}

			index += child.size + 1;

			if (comp === 0) return index - 1;
		}

		const insertIndex = this.children.at(-1)!.getInsertIndexOf(value);

		if (insertIndex < 0) return -index + insertIndex;
		return index + insertIndex;
	}

	deleteMin(): [T, SortedSetInner<T>] {
		return innerDeleteMin<SortedSetInner<T>, T>(this);
	}

	deleteMax(): [T, SortedSetInner<T>] {
		return innerDeleteMax<SortedSetInner<T>, T>(this);
	}

	mutateSplitRight(index?: number): [T, SortedSetInner<T>] {
		return innerMutateSplitRight<SortedSetInner<T>, T>(this, index);
	}

	mutateGiveToLeft(left: SortedSetInner<T>, toLeft: T): [T, SortedSetInner<T>] {
		return innerMutateGiveToLeft(this, left, toLeft);
	}

	mutateGiveToRight(
		right: SortedSetInner<T>,
		toRight: T,
	): [T, SortedSetInner<T>] {
		return innerMutateGiveToRight(this, right, toRight);
	}

	mutateGetFromLeft(left: SortedSetInner<T>, toMe: T): [T, SortedSetInner<T>] {
		return innerMutateGetFromLeft(this, left, toMe);
	}

	mutateGetFromRight(
		right: SortedSetInner<T>,
		toMe: T,
	): [T, SortedSetInner<T>] {
		return innerMutateGetFromRight(this, right, toMe);
	}

	mutateJoinLeft(left: SortedSetInner<T>, entry: T): void {
		innerMutateJoinLeft(this, left, entry);
	}

	mutateJoinRight(right: SortedSetInner<T>, entry: T): void {
		innerMutateJoinRight(this, right, entry);
	}

	normalizeDownsizeChild(
		childIndex: number,
		newChild: SortedSetNode<T>,
		newSize: number,
	): SortedSetInner<T> {
		return innerNormalizeDownsizeChild<SortedSetInner<T>, T>(
			this,
			childIndex,
			newChild,
			newSize,
		);
	}

	normalizeIncreaseChild(
		childIndex: number,
		newChild: SortedSetNode<T>,
		newSize: number,
	): SortedSetInner<T> {
		return innerNormalizeIncreaseChild<SortedSetInner<T>, T>(
			this,
			childIndex,
			newChild,
			newSize,
		);
	}

	addInternal(value: T): SortedSetInner<T> {
		const entryIndex = this.context.findIndex(value, this.entries);

		if (entryIndex >= 0) {
			const newEntries = Arr.set(this.entries, entryIndex, value);
			return this.copy(newEntries);
		}

		const childIndex = SortedIndex.next(entryIndex);
		const child = this.children[childIndex];

		const newChild = child.addInternal(value);
		if (newChild === child) return this;

		const newSize = this.size + newChild.size - child.size;

		if (newChild.entries.length <= this.context.maxEntries) {
			// no need to shift
			const newChildren = Arr.set(this.children, childIndex, newChild);
			return this.copy(undefined, newChildren, newSize);
		}

		return this.normalizeDownsizeChild(childIndex, newChild, newSize);
	}

	removeInternal(value: T): SortedSetNode<T> {
		const entryIndex = this.context.findIndex(value, this.entries);

		if (entryIndex >= 0) {
			const currentValue = this.entries[entryIndex];

			if (!Object.is(currentValue, value)) return this;

			// remove inner entry
			const leftChild = this.children[entryIndex];
			const rightChild = this.children[entryIndex + 1];

			if (leftChild.entries.length >= rightChild.entries.length) {
				const [max, newLeft] = leftChild.deleteMax();
				const newEntries = Arr.set(this.entries, entryIndex, max);
				const newSelf = this.copy(newEntries);
				return newSelf.normalizeIncreaseChild(
					entryIndex,
					newLeft,
					this.size - 1,
				);
			}

			const [min, newRight] = rightChild.deleteMin();
			const newEntries = Arr.set(this.entries, entryIndex, min);
			const newSelf = this.copy(newEntries);
			return newSelf.normalizeIncreaseChild(
				entryIndex + 1,
				newRight,
				this.size - 1,
			);
		}

		const childIndex = SortedIndex.next(entryIndex);
		const child = this.children[childIndex];

		const newChild = child.removeInternal(value);
		const newSize = this.size + newChild.size - child.size;

		if (newChild.entries.length < this.context.minEntries) {
			return this.normalizeIncreaseChild(childIndex, newChild, newSize);
		}
		if (newChild.entries.length > this.context.maxEntries) {
			return this.normalizeDownsizeChild(childIndex, newChild, newSize);
		}

		const newChildren = Arr.set(this.children, childIndex, newChild);
		return this.copy(
			undefined,
			newChildren,
			this.size + newChild.size - child.size,
		);
	}

	takeInternal(amount: number): SortedSetNode<T> {
		return innerTakeInternal<SortedSetInner<T>, T>(this, amount);
	}

	dropInternal(amount: number): SortedSetNode<T> {
		return innerDropInternal<SortedSetInner<T>, T>(this, amount);
	}

	normalize(): SortedSet<T> {
		if (this.entries.length === 0) return this.children[0].normalize();

		if (this.entries.length <= this.context.maxEntries) return this;

		const size = this.size;
		const [upEntry, rightNode] = this.mutateSplitRight();

		return this.copy([upEntry], [this, rightNode], size);
	}
}
