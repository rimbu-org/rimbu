import type { ModifyOptions } from '@rimbu/collection-types/advanced/common';
import type { IndexRange } from '@rimbu/common/index-range';
import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common/types';
import type { SortedMap } from '@rimbu/sorted/map';

import type { ContextImpl } from '#map/context-factory';

import * as Arr from '@rimbu/base/arr';
import * as RimbuError from '@rimbu/base/rimbu-error';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream } from '@rimbu/stream';

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
} from '#sorted/base';
import { SortedIndex } from '#sorted/sorted-index';

export class SortedMapInner<K, V> extends SortedMapNode<K, V> {
	constructor(
		readonly context: ContextImpl<K>,
		public entries: readonly (readonly [K, V])[],
		public children: readonly SortedMapNode<K, V>[],
		readonly size: number,
	) {
		super();
	}

	get mutateChildren(): SortedMapNode<K, V>[] {
		return this.children as SortedMapNode<K, V>[];
	}

	copy(
		entries: readonly (readonly [K, V])[] = this.entries,
		children: readonly SortedMapNode<K, V>[] = this.children,
		size: number = this.size,
	): SortedMapInner<K, V> {
		if (
			entries === this.entries &&
			children === this.children &&
			size === this.size
		)
			return this;
		return this.context.inner(entries, children, size);
	}

	stream(
		options: { reversed?: boolean } = {},
	): Stream.NonEmpty<readonly [K, V]> {
		const token = Symbol();
		return Stream.zipAll(
			token,
			Stream.fromArray(this.children, options),
			Stream.fromArray(this.entries, options),
		).flatMap(([child, e]): Stream.NonEmpty<readonly [K, V]> => {
			if (token === child) RimbuError.throwInvalidStateError();
			if (token === e) return child.stream(options);
			return child.stream(options).append(e);
		}) as Stream.NonEmpty<readonly [K, V]>;
	}

	streamSliceIndex(
		range: IndexRange,
		options: { reversed?: boolean } = {},
	): Stream<readonly [K, V]> {
		const { reversed = false } = options;
		return innerStreamSliceIndex<readonly [K, V]>(this, range, reversed);
	}

	min(): readonly [K, V] {
		return this.children[0].min();
	}

	max(): readonly [K, V] {
		return this.children.at(-1)!.max();
	}

	get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O {
		if (!this.context.isValidKey(key)) return OptLazy(otherwise) as O;

		const index = this.context.findIndex(key, this.entries);

		if (index >= 0) return this.entries[index][1];

		const childIndex = SortedIndex.next(index);
		const child = this.children[childIndex];

		return child.get(key, otherwise);
	}

	at<O>(index: number, otherwise?: OptLazy<O>): readonly [K, V] | O {
		return this.atIndex(index, otherwise);
	}

	findIndex<O>(key: K, otherwise?: OptLazy<O>): number | O {
		if (!this.context.comp.isComparable(key)) return OptLazy(otherwise!);

		const index = this.context.findIndex(key, this.entries);
		if (index >= 0)
			return (
				this.children.slice(0, index + 1).reduce((x, y) => x + y.size, 0) +
				index
			);
		const childIndex = SortedIndex.next(index);
		const child = this.children[childIndex];
		const index$ = child.findIndex(key);
		if (undefined !== index$) {
			return (
				index$ +
				(Stream.fromArray(this.children, {
					range: { amount: childIndex },
				}).fold(0, (x, y) => x + y.size) -
					index -
					1)
			);
		}

		return OptLazy(otherwise!);
	}

	atIndex<O>(index: number, otherwise?: OptLazy<O>): readonly [K, V] | O {
		return innerGetAtIndex<readonly [K, V], O>(this, index, otherwise);
	}

	forEach(
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		let i = -1;
		const entryLength = this.entries.length;
		const { halt } = state;

		while (!state.halted && i < entryLength) {
			if (i >= 0) f(this.entries[i], state.nextIndex(), halt);
			else {
				const childIndex = SortedIndex.next(i);
				this.children[childIndex].forEach(f, { state });
			}
			i = SortedIndex.next(i);
		}
	}

	mapValues<V2>(mapFun: (value: V, key: K) => V2): SortedMapInner<K, V2> {
		const newEntries = this.entries.map((entry): [K, V2] => {
			const newValue = mapFun(entry[1], entry[0]);
			return [entry[0], newValue];
		});
		const newChildren = this.children.map(
			(child): SortedMapNode<K, V2> => child.mapValues(mapFun),
		);

		return this.context.inner(newEntries, newChildren, this.size);
	}

	toArray(): ArrayNonEmpty<readonly [K, V]> {
		let i = -1;
		let result: (readonly [K, V])[] = [];

		while (i < this.entries.length) {
			if (i >= 0) result.push(this.entries[i]);
			else {
				const childIndex = SortedIndex.next(i);
				result = result.concat(this.children[childIndex].toArray());
			}
			i = SortedIndex.next(i);
		}

		return result as ArrayNonEmpty<[K, V]>;
	}

	// internal methods

	getInsertIndexOf(key: K): number {
		let index = 0;

		for (let i = 0; i < this.entries.length; i++) {
			const comp = this.context.comp.compare(key, this.entries[i][0]);
			const child = this.children[i];

			if (comp < 0) {
				const insertIndex = child.getInsertIndexOf(key);

				if (insertIndex < 0) return -index + insertIndex;
				return index + insertIndex;
			}

			index += child.size + 1;

			if (comp === 0) return index - 1;
		}

		const insertIndex = this.children.at(-1)!.getInsertIndexOf(key);

		if (insertIndex < 0) return -index + insertIndex;
		return index + insertIndex;
	}

	addInternal(entry: readonly [K, V]): SortedMapInner<K, V> {
		const entryIndex = this.context.findIndex(entry[0], this.entries);

		if (entryIndex >= 0) {
			const newEntries = Arr.update(
				this.entries,
				entryIndex,
				(currentEntry): readonly [K, V] => {
					if (Object.is(currentEntry[1], entry[1])) return currentEntry;
					return entry;
				},
			);

			return this.copy(newEntries);
		}

		const childIndex = SortedIndex.next(entryIndex);
		const child = this.children[childIndex];

		const newChild = child.addInternal(entry);
		if (newChild === child) return this;

		const newSize = this.size + newChild.size - child.size;

		if (newChild.entries.length <= this.context.maxEntries) {
			// no need to shift
			const newChildren = Arr.set(this.children, childIndex, newChild);
			return this.copy(undefined, newChildren, newSize);
		}

		return this.normalizeDownsizeChild(childIndex, newChild, newSize);
	}

	modifyAtInternal(key: K, options: ModifyOptions<V>): SortedMapInner<K, V> {
		const { ifExists } = options;
		const entryIndex = this.context.findIndex(key, this.entries);

		if (entryIndex >= 0) {
			if (undefined === ifExists) return this;

			const { set, update } = ifExists;
			if (undefined === set && undefined === update) return this;

			const currentEntry = this.entries[entryIndex];
			const currentValue = currentEntry[1];
			const token = Symbol();

			const newValue =
				update !== undefined ? update(currentValue, token) : set!;

			if (Object.is(newValue, currentValue)) return this;

			if (token === (newValue as unknown)) {
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

			// update inner entry
			const newEntry: [K, V] = [key, newValue as V];
			const newEntries = Arr.set(this.entries, entryIndex, newEntry);
			return this.copy(newEntries);
		}

		const childIndex = SortedIndex.next(entryIndex);
		const child = this.children[childIndex];

		const newChild = child.modifyAtInternal(key, options);
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

	takeInternal(amount: number): SortedMapNode<K, V> {
		return innerTakeInternal<SortedMapInner<K, V>, readonly [K, V]>(
			this,
			amount,
		);
	}

	dropInternal(amount: number): SortedMapNode<K, V> {
		return innerDropInternal<SortedMapInner<K, V>, readonly [K, V]>(
			this,
			amount,
		);
	}

	deleteMin(): [readonly [K, V], SortedMapInner<K, V>] {
		return innerDeleteMin<SortedMapInner<K, V>, readonly [K, V]>(this);
	}

	deleteMax(): [readonly [K, V], SortedMapInner<K, V>] {
		return innerDeleteMax<SortedMapInner<K, V>, readonly [K, V]>(this);
	}

	mutateSplitRight(index?: number): [readonly [K, V], SortedMapInner<K, V>] {
		return innerMutateSplitRight<SortedMapInner<K, V>, readonly [K, V]>(
			this,
			index,
		);
	}

	mutateGiveToLeft(
		left: SortedMapInner<K, V>,
		toLeft: readonly [K, V],
	): [readonly [K, V], SortedMapInner<K, V>] {
		return innerMutateGiveToLeft(this, left, toLeft);
	}

	mutateGiveToRight(
		right: SortedMapInner<K, V>,
		toRight: readonly [K, V],
	): [readonly [K, V], SortedMapInner<K, V>] {
		return innerMutateGiveToRight(this, right, toRight);
	}

	mutateGetFromLeft(
		left: SortedMapInner<K, V>,
		toMe: readonly [K, V],
	): [readonly [K, V], SortedMapInner<K, V>] {
		return innerMutateGetFromLeft(this, left, toMe);
	}

	mutateGetFromRight(
		right: SortedMapInner<K, V>,
		toMe: readonly [K, V],
	): [readonly [K, V], SortedMapInner<K, V>] {
		return innerMutateGetFromRight(this, right, toMe);
	}

	mutateJoinLeft(left: SortedMapInner<K, V>, entry: readonly [K, V]): void {
		innerMutateJoinLeft(this, left, entry);
	}

	mutateJoinRight(right: SortedMapInner<K, V>, entry: readonly [K, V]): void {
		innerMutateJoinRight(this, right, entry);
	}

	normalizeDownsizeChild(
		childIndex: number,
		newChild: SortedMapNode<K, V>,
		newSize: number,
	): SortedMapInner<K, V> {
		return innerNormalizeDownsizeChild<SortedMapInner<K, V>, readonly [K, V]>(
			this,
			childIndex,
			newChild,
			newSize,
		);
	}

	normalizeIncreaseChild(
		childIndex: number,
		newChild: SortedMapNode<K, V>,
		newSize: number,
	): SortedMapInner<K, V> {
		return innerNormalizeIncreaseChild<SortedMapInner<K, V>, readonly [K, V]>(
			this,
			childIndex,
			newChild,
			newSize,
		);
	}

	normalize(): SortedMap<K, V> {
		if (this.entries.length === 0) return this.children[0].normalize();

		// @ts-expect-error
		if (this.entries.length <= this.context.maxEntries) return this;

		const size = this.size;
		const [upEntry, rightNode] = this.mutateSplitRight();

		// @ts-expect-error
		return this.copy([upEntry], [this, rightNode], size);
	}
}
