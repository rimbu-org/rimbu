import type { IndexRange } from '@rimbu/common/index-range';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { Range } from '@rimbu/common/range';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { RelatedTo } from '@rimbu/common/types';
import type { SortedSet } from '@rimbu/sorted/set';
import type { Stream } from '@rimbu/stream';

import type { ContextImpl } from '#set/context';

import { IndexedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/indexed-base';
import { IndexedSortedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/indexed-sorted-base';
import { ValuedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/valued-base';
import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { SetCollectionNonEmpty } from '@rimbu/collection-types/advanced/set-base';

import { SortedNode } from '#sorted/base';

const NonEmptyBase = IndexedSortedCollectionNonEmpty.WithMixin(
	SetCollectionNonEmpty.WithMixin(
		IndexedCollectionNonEmpty.WithMixin(
			ValuedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor),
		),
	),
);

export abstract class SortedSetNode<T>
	extends NonEmptyBase<T, T, SortedSet.Advanced.Family<T>>
	implements SortedSet.NonEmpty<T>
{
	abstract get size(): number;
	abstract stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
	abstract forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options?: { state?: TraverseState },
	): void;

	abstract entries: readonly T[];

	/**
	 * Mutable view of {@link entries} used by the shared B-tree mutation
	 * helpers. Callers always re-wrap the node through `copy`, so the in-place
	 * edits never escape.
	 */
	get mutateEntries(): T[] {
		return this.entries as T[];
	}

	abstract at<O>(index: number, otherwise?: OptLazy<O>): T | O;
	abstract atIndex<O>(index: number, otherwise?: OptLazy<O>): T | O;

	// internal methods
	abstract addInternal(value: T): SortedSetNode<T>;
	abstract removeInternal(value: T): SortedSetNode<T>;
	abstract getInsertIndexOf(value: T): number;
	abstract normalize(): SortedSet<T>;
	abstract takeInternal(amount: number): SortedSetNode<T>;
	abstract dropInternal(amount: number): SortedSetNode<T>;
	abstract streamSliceIndex(
		range: IndexRange,
		options?: { reversed?: boolean },
	): Stream<T>;
	abstract findIndex<O>(value: T, otherwise?: OptLazy<O>): number | O;
	abstract deleteMin(): [T, SortedSetNode<T>];
	abstract deleteMax(): [T, SortedSetNode<T>];
	abstract mutateSplitRight(index?: number): [T, SortedSetNode<T>];
	abstract mutateGiveToLeft(
		left: SortedSetNode<T>,
		toLeft: T,
	): [T, SortedSetNode<T>];
	abstract mutateGiveToRight(
		right: SortedSetNode<T>,
		toRight: T,
	): [T, SortedSetNode<T>];
	abstract mutateGetFromLeft(
		left: SortedSetNode<T>,
		toMe: T,
	): [T, SortedSetNode<T>];
	abstract mutateGetFromRight(
		right: SortedSetNode<T>,
		toMe: T,
	): [T, SortedSetNode<T>];
	abstract mutateJoinLeft(left: SortedSetNode<T>, entry: T): void;
	abstract mutateJoinRight(right: SortedSetNode<T>, entry: T): void;

	filter(
		pred: (element: T) => boolean,
		options: { negate?: boolean | undefined } = {},
	): SortedSet<T> {
		const builder = this.context.builder<T>();
		builder.addAll(this.stream().filter(pred, options));

		if (builder.size === this.size) return this;

		return builder.build();
	}

	map<T2>(f: (value: T) => T2): SortedSet.NonEmpty<T2> {
		return this.context.from(this.stream().map(f)) as SortedSet.NonEmpty<T2>;
	}

	lowerBound(value: T): number {
		return SortedNode.lowerBound(this, value);
	}

	upperBound(value: T): number {
		return SortedNode.upperBound(this, value);
	}

	next<O>(
		value: T,
		options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> } = {},
	): T | O {
		return SortedNode.next(this, value, options);
	}

	previous<O>(
		value: T,
		options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> } = {},
	): T | O {
		return SortedNode.previous(this, value, options);
	}

	getSliceRange(range: Range<T>): { startIndex: number; endIndex: number } {
		return SortedNode.getSliceRange(this, range);
	}

	streamRange(range: Range<T>, options?: { reversed?: boolean }): Stream<T> {
		return SortedNode.streamRange(this, range, options);
	}

	add(value: T): SortedSet.NonEmpty<T> {
		return this.addInternal(value).normalize().assumeNonEmpty();
	}

	remove<U>(value: RelatedTo<T, U>): SortedSet<T> {
		if (!this.context.comp.isComparable(value)) return this;
		return this.removeInternal(value).normalize();
	}

	take(amount: number): SortedSet<T> | any {
		return SortedNode.take(this, amount);
	}

	drop(amount: number): SortedSet<T> {
		return SortedNode.drop(this, amount);
	}

	indexOf(value: T, otherwise?: OptLazy<any>): any {
		return (this as any).findIndex(value, otherwise);
	}

	streamSlice(range: IndexRange, options?: { reversed?: boolean }): Stream<T> {
		return this.streamSliceIndex(range, options);
	}

	removeAt(index: number, amount?: number | undefined): SortedSet<T> {
		const sz = (this as any).size as number;
		let idx = index;
		if (idx < 0) idx = sz + idx;
		if (idx < 0 || idx >= sz) return this as any;
		const amt = amount === undefined ? 1 : amount;
		if (amt <= 0) return this as any;
		if (amt >= sz && idx === 0) return (this as any).context.empty();
		// remove by iterative value removal
		let result: SortedSet<T> = this as any;
		for (let i = 0; i < amt; i++) {
			const v = (result as any).at(idx);
			if (undefined === v) break;
			result = result.remove(v);
			// idx stays same, next element shifts into position
			if ((result as any).size <= idx && amt > 1) break;
		}
		return result;
	}

	removeAtAndReturn(index: number, amount?: number | undefined): any {
		const removed = (this as any).slice({
			start: index,
			amount: amount ?? 1,
		} as any);
		const next = (this as any).removeAt(index, amount);
		// DynamicResult: if removed empty? keep simple
		return [next, removed] as any;
	}

	sliceIndex(range: IndexRange): SortedSet<T> {
		return SortedNode.sliceIndex(this, range);
	}

	slice(range: IndexRange | Range<T>): SortedSet<T> {
		return SortedNode.slice(this, range);
	}

	toBuilder(): SortedSet.Builder<T> {
		return (this.context as unknown as ContextImpl<T>).createBuilder(this);
	}

	toString(): string {
		return this.stream().join({ start: 'SortedSet(', sep: ', ', end: ')' });
	}
}
