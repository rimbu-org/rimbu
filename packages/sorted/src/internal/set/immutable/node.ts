import type { RelatedTo } from '@rimbu/common/types';
import type { SortedSet } from '@rimbu/sorted/set';
import type { StreamSource } from '@rimbu/stream';

import { WithIndexedCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/collection/indexed-base';
import { WithIndexedSortedCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/collection/indexed-sorted-base';
import { WithValuedCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/collection/valued-base';
import {
	CollectionNonEmptyConstructor,
	defaultAddAll,
} from '@rimbu/collection-types/advanced/collection-base';
import { WithSetCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/set-base';
import { OptLazy } from '@rimbu/common/opt-lazy';

const NonEmptyBase = WithSetCollectionNonEmptyBase(
	WithIndexedSortedCollectionNonEmptyBase(
		WithIndexedCollectionNonEmptyBase(
			WithValuedCollectionNonEmptyBase(CollectionNonEmptyConstructor),
		),
	),
);

export abstract class SortedSetNode<T>
	extends NonEmptyBase<T, SortedSet.Advanced.Family<T>>
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

		return this.at(atIndex, otherwise);
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
		return this.at(atIndex, otherwise);
	}

	// getSliceRange(range: Range<T>): { startIndex: number; endIndex: number } {
	// 	const { start, end } = Range.getNormalizedRange(range);
	// 	let startIndex = 0;
	// 	let endIndex = this.size - 1;

	// 	if (undefined !== start) {
	// 		const [startValue, startInclude] = start;
	// 		startIndex = this.getInsertIndexOf(startValue);

	// 		if (startIndex < 0) startIndex = SortedIndex.next(startIndex);
	// 		else if (!startInclude) startIndex++;
	// 	}
	// 	if (undefined !== end) {
	// 		const [endValue, endInclude] = end;
	// 		endIndex = this.getInsertIndexOf(endValue);

	// 		if (endIndex < 0) endIndex = SortedIndex.prev(endIndex);
	// 		else if (!endInclude) endIndex--;
	// 	}

	// 	return { startIndex, endIndex };
	// }

	// streamRange(range: Range<T>, options?: { reversed?: boolean }): Stream<T> {
	// 	const { startIndex, endIndex } = this.getSliceRange(range);

	// 	return this.streamSliceIndex(
	// 		{
	// 			start: [startIndex, true],
	// 			end: [endIndex, true],
	// 		},
	// 		options,
	// 	);
	// }

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

	// removeAll<U>(values: StreamSource<RelatedTo<T, U>>): SortedSet<T> {
	// 	if (Stream.isEmptyStreamSourceInstance(values)) return this;

	// 	const builder = this.toBuilder();
	// 	builder.removeAll(values);
	// 	return builder.build();
	// }

	// filter(
	// 	pred: (value: T, index: number, halt: () => void) => boolean,
	// 	options: { negate?: boolean | undefined } = {},
	// ): any {
	// 	const builder = this.context.builder();

	// 	builder.addAll(this.stream().filter(pred, options));

	// 	if (builder.size === this.size) return this;
	// 	return builder.build();
	// }

	// transform<T2 extends T>(
	// 	transformFun: (stream: Stream.NonEmpty<T>) => StreamSource<T2>,
	// ): any {
	// 	return this.context.from(transformFun(this.stream()));
	// }

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

	// sliceIndex(range: IndexRange): SortedSet<T> {
	// 	const indexRange = IndexRange.getIndicesFor(range, this.size);

	// 	if (indexRange === 'empty') return this.context.empty();
	// 	if (indexRange === 'all') return this;

	// 	const [start, end] = indexRange;

	// 	return this.drop(start).take(end - start + 1);
	// }

	// slice(range: any): SortedSet<T> {
	// 	// if range has 'amount', it's definitely IndexRange (positional)
	// 	if (range && typeof range === 'object' && 'amount' in range) {
	// 		return this.sliceIndex(range as IndexRange);
	// 	}
	// 	// otherwise treat as Range<T> (comparator)
	// 	const { startIndex, endIndex } = this.getSliceRange(range as Range<T>);

	// 	return this.sliceIndex({
	// 		start: [startIndex, true],
	// 		end: [endIndex, true],
	// 	});
	// }

	// get comp(): any {
	// 	return this.context.comp;
	// }

	// at(index: number, otherwise?: OptLazy<any>): any {
	// 	return this.atIndex(index, otherwise);
	// }

	// // @ts-expect-error
	// indexOf(value: T, otherwise?: OptLazy<any>): any {
	// 	return (this as any).findIndex(value, otherwise);
	// }

	// streamSlice(range: any, options?: any): Stream<T> {
	// 	return this.streamSliceIndex(range, options);
	// }

	// forEachIndexed(f: any, options?: any): void {
	// 	return this.forEach(f as any, options as any);
	// }

	// filterIndexed(pred: any, options?: any): any {
	// 	return this.filter(pred as any, options as any);
	// }

	// first(..._args: any[]): any {
	// 	return (this as any).min(..._args);
	// }

	// last(..._args: any[]): any {
	// 	return (this as any).max(..._args);
	// }

	// splitAt(..._args: any[]): any {
	// 	const [amount] = _args;
	// 	return [this.take(amount), this.drop(amount)];
	// }

	// removeAt(index: number, amount?: number | undefined): SortedSet<T> {
	// 	const sz = (this as any).size as number;
	// 	let idx = index;
	// 	if (idx < 0) idx = sz + idx;
	// 	if (idx < 0 || idx >= sz) return this as any;
	// 	const amt = amount === undefined ? 1 : amount;
	// 	if (amt <= 0) return this as any;
	// 	if (amt >= sz && idx === 0) return (this as any).context.empty();
	// 	// remove by iterative value removal
	// 	let result: SortedSet<T> = this as any;
	// 	for (let i = 0; i < amt; i++) {
	// 		const v = (result as any).at(idx);
	// 		if (undefined === v) break;
	// 		result = result.remove(v);
	// 		// idx stays same, next element shifts into position
	// 		if ((result as any).size <= idx && amt > 1) break;
	// 	}
	// 	return result;
	// }

	// removeAtAndReturn(index: number, amount?: number | undefined): any {
	// 	const removed = (this as any).slice({
	// 		start: index,
	// 		amount: amount ?? 1,
	// 	} as any);
	// 	const next = (this as any).removeAt(index, amount);
	// 	// DynamicResult: if removed empty? keep simple
	// 	return [next, removed] as any;
	// }

	// intersection(other: StreamSource<T>): SortedSet<T> {
	// 	return (this as any).intersect(other);
	// }

	// symmetricDifference(other: StreamSource<T>): SortedSet<T> {
	// 	return (this as any).symDifference(other);
	// }

	// union(other: StreamSource<T>): SortedSet<T> | any {
	// 	if (other === this) return this;
	// 	if (Stream.isEmptyStreamSourceInstance(other)) return this;

	// 	const builder = this.toBuilder();
	// 	builder.addAll(other);
	// 	return builder.build();
	// }

	// difference(other: StreamSource<T>): SortedSet<T> {
	// 	if (other === this) return this.context.empty();
	// 	if (Stream.isEmptyStreamSourceInstance(other)) return this;

	// 	const builder = this.toBuilder();
	// 	builder.removeAll(other);
	// 	return builder.build();
	// }

	// intersect(other: StreamSource<T>): SortedSet<T> {
	// 	if (other === this) return this;
	// 	if (Stream.isEmptyStreamSourceInstance(other)) return this.context.empty();

	// 	const builder = this.context.builder();
	// 	const otherIter = Stream.from(other)[Symbol.iterator]();
	// 	const done = Symbol('Done');

	// 	if (this.context.isSortedSetNode(other)) {
	// 		const thisIt = this[Symbol.iterator]();
	// 		let thisValue: T | typeof done = thisIt.fastNext(done);
	// 		let otherValue: T | typeof done = otherIter.fastNext(done);
	// 		const comp = this.context.comp;

	// 		while (true) {
	// 			if (done === thisValue || done === otherValue) {
	// 				break;
	// 			}

	// 			const result = comp.compare(thisValue, otherValue);
	// 			if (result === 0) builder.add(thisValue);
	// 			if (result <= 0) thisValue = thisIt.fastNext(done);
	// 			if (result >= 0) otherValue = otherIter.fastNext(done);
	// 		}
	// 	} else {
	// 		let value: T | typeof done;

	// 		while (done !== (value = otherIter.fastNext(done))) {
	// 			if (this.has(value)) builder.add(value);
	// 		}
	// 	}

	// 	if (builder.size === this.size) return this;

	// 	return builder.build();
	// }

	// symDifference(other: StreamSource<T>): SortedSet<T> {
	// 	if (other === this) return this.context.empty();

	// 	if (Stream.isEmptyStreamSourceInstance(other)) return this;

	// 	const builder = this.toBuilder();

	// 	Stream.from(other)
	// 		.filterPure({ pred: builder.remove, negate: true })
	// 		.forEach(builder.add);

	// 	return builder.build();
	// }

	// toBuilder(): SortedSet.Builder<T> {
	// 	return this.context.createBuilder(this);
	// }

	// toString(): string {
	// 	return this.stream().join({ start: 'SortedSet(', sep: ', ', end: ')' });
	// }

	// toJSON(): ToJSON<T[]> {
	// 	return {
	// 		dataType: this.context.typeTag,
	// 		value: this.toArray(),
	// 	};
	// }
}
