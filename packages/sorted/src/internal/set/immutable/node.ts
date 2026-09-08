import type { IndexRange } from '@rimbu/common/index-range';
import type { RelatedTo } from '@rimbu/common/types';
import type { SortedSet } from '@rimbu/sorted/set';
import type { Stream, StreamSource } from '@rimbu/stream';

import { WithIndexedCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/collection/indexed-base';
import { WithIndexedSortedCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/collection/indexed-sorted-base';
import { WithValuedCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/collection/valued-base';
import {
	CollectionNonEmptyConstructor,
	defaultAddAll,
} from '@rimbu/collection-types/advanced/collection-base';
import { WithSetCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/set-base';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Range } from '@rimbu/common/range';

import { SortedIndex } from '#sorted/sorted-index';

const NonEmptyBase = WithIndexedSortedCollectionNonEmptyBase(
	WithSetCollectionNonEmptyBase(
		WithIndexedCollectionNonEmptyBase(
			WithValuedCollectionNonEmptyBase(CollectionNonEmptyConstructor),
		),
	),
);

export abstract class SortedSetNode<T>
	extends NonEmptyBase<T, T, SortedSet.Advanced.Family<T>>
	implements SortedSet.NonEmpty<T>
{
	// abstract get context(): SortedSetContext<T>;
	// abstract get size(): number;
	// abstract stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
	// abstract streamSliceIndex(
	// 	range: IndexRange,
	// 	options?: { reversed?: boolean },
	// ): Stream<T>;
	// abstract forEach(
	// 	f: (value: T, index: number, halt: () => void) => void,
	// 	options?: { state?: TraverseState },
	// ): void;
	// abstract has<U>(value: RelatedTo<T, U>): boolean;
	// abstract findIndex(value: T): number | undefined;
	// abstract min(): T;
	// abstract max(): T;
	// abstract toArray(): ArrayNonEmpty<T>;

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

	// asNormal(): this {
	// 	return this;
	// }

	lowerBound(value: T): number {
		const index = this.getInsertIndexOf(value);
		return index >= 0 ? index : -index - 1;
	}

	upperBound(value: T): number {
		const index = this.getInsertIndexOf(value);
		return index >= 0 ? index + 1 : -index - 1;
	}

	next<O>(
		value: T,
		options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> } = {},
	): T | O {
		const { inclusive = false, otherwise } = options;
		if (!this.context.comp.isComparable(value)) return OptLazy(otherwise) as O;

		const index = this.getInsertIndexOf(value);
		const atIndex = index >= 0 ? (inclusive ? index : index + 1) : -index - 1;

		return this.at(atIndex, otherwise!);
	}

	previous<O>(
		value: T,
		options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> } = {},
	): T | O {
		const { inclusive = false, otherwise } = options;
		if (!this.context.comp.isComparable(value)) return OptLazy(otherwise) as O;

		const index = this.getInsertIndexOf(value);
		const atIndex =
			index >= 0 ? (inclusive ? index : index - 1) : -index - 1 - 1;

		if (atIndex < 0) return OptLazy(otherwise) as O;
		return this.at(atIndex, otherwise as OptLazy<O>) as T | O;
	}

	getSliceRange(range: Range<T>): { startIndex: number; endIndex: number } {
		const { start, end } = Range.getNormalizedRange(range);
		let startIndex = 0;
		let endIndex = this.size - 1;

		if (undefined !== start) {
			const [startValue, startInclude] = start;
			startIndex = this.getInsertIndexOf(startValue);

			if (startIndex < 0) startIndex = SortedIndex.next(startIndex);
			else if (!startInclude) startIndex++;
		}
		if (undefined !== end) {
			const [endValue, endInclude] = end;
			endIndex = this.getInsertIndexOf(endValue);

			if (endIndex < 0) endIndex = SortedIndex.prev(endIndex);
			else if (!endInclude) endIndex--;
		}

		return { startIndex, endIndex };
	}

	streamRange(range: Range<T>, options?: { reversed?: boolean }): Stream<T> {
		const { startIndex, endIndex } = this.getSliceRange(range);

		return this.streamSliceIndex(
			{
				start: [startIndex, true],
				end: [endIndex, true],
			},
			options,
		);
	}

	add(value: T): SortedSet.NonEmpty<T> {
		return this.addInternal(value).normalize().assumeNonEmpty();
	}

	addAll(values: StreamSource<T>): SortedSet.NonEmpty<T> {
		return defaultAddAll<
			T,
			SortedSet.NonEmpty<T>,
			SortedSet.Advanced.Family<T>
		>(this, values);
	}

	remove<U>(value: RelatedTo<T, U>): SortedSet<T> {
		if (!this.context.comp.isComparable(value)) return this;
		return this.removeInternal(value).normalize();
	}

	take(amount: number): SortedSet<T> | any {
		if (amount === 0) return this.context.empty();
		if (amount >= this.size || -amount > this.size) return this;
		if (amount < 0) return this.drop(this.size + amount);

		return this.takeInternal(amount).normalize();
	}

	drop(amount: number): SortedSet<T> {
		if (amount === 0) return this;
		if (amount >= this.size || -amount > this.size) return this.context.empty();
		if (amount < 0) return this.take(this.size + amount);

		return this.dropInternal(amount).normalize();
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

	// toBuilder(): SortedSet.Builder<T> {
	// 	return this.context.createBuilder(this);
	// }

	// toString(): string {
	// 	return this.stream().join({ start: 'SortedSet(', sep: ', ', end: ')' });
	// }
}
