import type { ModifyOptions } from '@rimbu/collection-types/advanced/common';
import type { IndexRange } from '@rimbu/common/index-range';
import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common/types';
import type { SortedMap } from '@rimbu/sorted/map';

import type { ContextImpl } from '#map/context-factory';

import * as Arr from '@rimbu/base/arr';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream } from '@rimbu/stream';

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

export class SortedMapLeaf<K, V> extends SortedMapNode<K, V> {
	constructor(
		readonly context: ContextImpl<K>,
		public entries: readonly (readonly [K, V])[],
	) {
		super();
	}

	copy(entries: readonly (readonly [K, V])[]): SortedMapLeaf<K, V> {
		if (entries === this.entries) return this;
		return this.context.leaf(entries);
	}

	get size(): number {
		return this.entries.length;
	}

	stream(
		options: { reversed?: boolean } = {},
	): Stream.NonEmpty<readonly [K, V]> {
		return Stream.fromArray(this.entries, options) as Stream.NonEmpty<[K, V]>;
	}

	streamSliceIndex(
		range: IndexRange,
		options: { reversed?: boolean } = {},
	): Stream<readonly [K, V]> {
		const { reversed = false } = options;

		return Stream.fromArray(this.entries, { range, reversed });
	}

	min(): readonly [K, V] {
		return this.entries[0];
	}

	max(): readonly [K, V] {
		return this.entries.at(-1)!;
	}

	get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O {
		if (!this.context.isValidKey(key)) return OptLazy(otherwise) as O;

		const index = this.context.findIndex(key, this.entries);

		if (index < 0) return OptLazy(otherwise) as O;

		return this.entries[index][1];
	}

	at<O>(index: number, otherwise?: OptLazy<O>): readonly [K, V] | O {
		return this.atIndex(index, otherwise);
	}

	findIndex<O>(key: K, otherwise?: OptLazy<O>): number | O {
		if (!this.context.comp.isComparable(key)) return OptLazy(otherwise!);
		const index = this.context.findIndex(key, this.entries);
		return index < 0 ? OptLazy(otherwise!) : index;
	}

	atIndex<O>(index: number, otherwise?: OptLazy<O>): readonly [K, V] | O {
		if (index >= this.size || -index > this.size)
			return OptLazy(otherwise) as O;
		if (index < 0) return this.atIndex(this.size + index, otherwise);

		return this.entries[index];
	}

	forEach(
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		Arr.forEach(this.entries, f, state);
	}

	mapValues<V2>(mapFun: (value: V, key: K) => V2): SortedMapLeaf<K, V2> {
		const newEntries = this.entries.map(([key, value]): [K, V2] => {
			const newValue = mapFun(value, key);
			return [key, newValue];
		});

		return this.context.leaf(newEntries);
	}

	toArray(): ArrayNonEmpty<[K, V]> {
		return this.entries.slice() as ArrayNonEmpty<[K, V]>;
	}

	// internal methods

	getInsertIndexOf(key: K): number {
		return this.context.findIndex(key, this.entries);
	}

	addInternal(entry: readonly [K, V]): SortedMapNode<K, V> {
		const index = this.context.findIndex(entry[0], this.entries);

		if (index >= 0) {
			const currentEntry = this.entries[index];
			if (Object.is(currentEntry[1], entry[1])) return this;

			const newEntries = Arr.set(this.entries, index, entry);
			return this.copy(newEntries);
		}

		const insertIndex = SortedIndex.next(index);
		const newEntries = Arr.insert(this.entries, insertIndex, entry);
		return this.copy(newEntries);
	}

	modifyAtInternal(key: K, options: ModifyOptions<V>): SortedMapNode<K, V> {
		const { ifNew, ifExists } = options;
		const entryIndex = this.context.findIndex(key, this.entries);

		if (entryIndex >= 0) {
			if (undefined === ifExists) return this;

			const { set, update } = ifExists;
			const currentEntry = this.entries[entryIndex];
			const currentValue = currentEntry[1];
			const token = Symbol();
			const newValue = update !== undefined ? update(currentValue, token) : set;

			if (Object.is(newValue, currentValue)) return this;

			if (token === newValue) {
				const newEntries = this.mutateEntries.toSpliced(entryIndex, 1);
				return this.copy(newEntries);
			}

			const newEntries = Arr.set(this.entries, entryIndex, [key, newValue] as [
				K,
				V,
			]);
			return this.copy(newEntries);
		}

		if (undefined === ifNew) return this;
		const { set, create } = ifNew;
		const token = Symbol();
		const newValue = create !== undefined ? create(token) : set;

		if (token === newValue) return this;

		const insertIndex = SortedIndex.next(entryIndex);
		const newEntries = Arr.insert(this.entries, insertIndex, [
			key,
			newValue,
		] as [K, V]);

		return this.copy(newEntries);
	}

	takeInternal(amount: number): SortedMapLeaf<K, V> {
		return this.context.leaf(this.entries.slice(0, amount));
	}

	dropInternal(amount: number): SortedMapLeaf<K, V> {
		return this.context.leaf(this.entries.slice(amount));
	}

	deleteMin(): [readonly [K, V], SortedMapLeaf<K, V>] {
		return leafDeleteMin<SortedMapLeaf<K, V>, readonly [K, V]>(this);
	}

	deleteMax(): [readonly [K, V], SortedMapLeaf<K, V>] {
		return leafDeleteMax<SortedMapLeaf<K, V>, readonly [K, V]>(this);
	}

	mutateSplitRight(index?: number): [readonly [K, V], SortedMapLeaf<K, V>] {
		return leafMutateSplitRight<SortedMapLeaf<K, V>, readonly [K, V]>(
			this,
			index,
		);
	}

	mutateGiveToLeft(
		left: SortedMapLeaf<K, V>,
		toLeft: readonly [K, V],
	): [readonly [K, V], SortedMapLeaf<K, V>] {
		return leafMutateGiveToLeft(this, left, toLeft);
	}

	mutateGiveToRight(
		right: SortedMapLeaf<K, V>,
		toRight: readonly [K, V],
	): [readonly [K, V], SortedMapLeaf<K, V>] {
		return leafMutateGiveToRight(this, right, toRight);
	}

	mutateGetFromLeft(
		left: SortedMapLeaf<K, V>,
		toMe: readonly [K, V],
	): [readonly [K, V], SortedMapLeaf<K, V>] {
		return leafMutateGetFromLeft(this, left, toMe);
	}

	mutateGetFromRight(
		right: SortedMapLeaf<K, V>,
		toMe: readonly [K, V],
	): [readonly [K, V], SortedMapLeaf<K, V>] {
		return leafMutateGetFromRight(this, right, toMe);
	}

	mutateJoinLeft(left: SortedMapLeaf<K, V>, entry: readonly [K, V]): void {
		leafMutateJoinLeft(this, left, entry);
	}

	mutateJoinRight(right: SortedMapLeaf<K, V>, entry: readonly [K, V]): void {
		leafMutateJoinRight(this, right, entry);
	}

	normalize(): SortedMap<K, V> {
		if (this.entries.length === 0) return this.context.empty();
		// @ts-expect-error
		if (this.entries.length <= this.context.maxEntries) return this;
		const size = this.size;
		const [upEntry, rightNode] = this.mutateSplitRight();
		// @ts-expect-error
		return this.context.inner([upEntry], [this, rightNode], size);
	}
}
