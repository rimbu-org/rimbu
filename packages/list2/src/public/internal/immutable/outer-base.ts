import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { ArrayNonEmpty, SuperOf } from '@rimbu/common/types';
import type { Update } from '@rimbu/common/update';

import type { ListContext } from '#list/context-module';
import type { ListImpl } from '#list/list-impl';
import type { ListBuilder } from '#list/mutable/builder';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';
import { NonEmptyBase } from '@rimbu/collection-types/common/empty-base';
import { Comp } from '@rimbu/common/comp';
import { IndexRange } from '@rimbu/common/index-range';
import { Stream, type StreamSource } from '@rimbu/stream';

export abstract class OuterBase<T>
	extends NonEmptyBase<T>
	implements ListImpl.NonEmpty<T>
{
	declare _NonEmptyType: ListImpl.NonEmpty<T>;

	constructor(
		readonly context: ListContext,
		readonly ops = context.outerChildrenOps,
	) {
		super();
	}

	abstract readonly length: number;
	abstract stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
	abstract get<O>(index: number, otherwise?: OptLazy<O>): T | O;
	abstract updateAt(
		index: number,
		update: Update<T>,
	): ListImpl.NonEmpty<T, ListImpl.Types>;
	abstract first(): T;
	abstract last(): T;
	abstract prepend(value: T): ListImpl.NonEmpty<T>;
	abstract append(value: T): ListImpl.NonEmpty<T>;
	abstract take(count: number): ListImpl.NonEmpty<T>;
	abstract drop(count: number): ListImpl<T>;
	abstract reversed(): ListImpl.NonEmpty<T>;
	abstract concat(
		sources_0: StreamSource.NonEmpty<T>,
		...sources: StreamSource.NonEmpty<T>[]
	): ListImpl.NonEmpty<T>;
	abstract concat(
		sources_0: StreamSource<T>,
		...sources: StreamSource<T>[]
	): ListImpl<T>;
	abstract forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options?: { reversed?: boolean; state?: TraverseState } | undefined,
	): void;
	abstract map<T2>(
		mapFun: (value: T, index: number) => T2,
		options?: { reversed?: boolean },
	): OuterBase<T2>;
	abstract toArray(
		options?:
			| { range?: IndexRange | undefined; reversed?: boolean | undefined }
			| undefined,
	): ArrayNonEmpty<T>;
	abstract _structure(): string;

	slice(range: IndexRange, options: { reversed?: boolean } = {}): ListImpl<T> {
		const { reversed = false } = options;

		const result = IndexRange.getIndicesFor(range, this.length);

		if (result === 'all') {
			if (reversed) return this.reversed();
			return this;
		}
		if (result === 'empty') return this.context.empty();

		const [start, end] = result;
		const values = this.drop(start).take(end - start + 1);

		if (!reversed) return values;
		return values.reversed();
	}

	splice({
		index = 0,
		remove = 0,
		insert,
	}: {
		index?: number;
		remove?: number;
		insert?: StreamSource<T>;
	} = {}): ListImpl<T> | any {
		if (index < 0) {
			return this.splice({ index: this.length + index, remove, insert });
		}

		if (undefined === insert) {
			if (remove <= 0) return this;
			return this.take(index).concat(this.drop(index + remove));
		}

		if (remove <= 0 && Stream.isEmptyStreamSourceInstance(insert)) return this;

		return this.take(index).concat(insert, this.drop(index + remove));
	}

	insert(index: number, values: StreamSource<T>): ListImpl<T> | any {
		return this.splice({ index, insert: values });
	}

	remove(index: number, options: { amount?: number } = {}): ListImpl<T> {
		const { amount = 1 } = options;

		return this.splice({ index, remove: amount });
	}

	repeat(amount: number): ListImpl.NonEmpty<T> {
		if (amount <= -1) return this.reversed().repeat(-amount);
		if (amount <= 1) return this;

		const doubleTimes = amount >>> 1;
		const doubleResult = this.concat(this).repeat(doubleTimes);

		const remainTimes = amount % 2;
		if (remainTimes === 0) return doubleResult;
		return doubleResult.concat(this);
	}

	sort<TC = T>(
		comp: Comp<SuperOf<TC, T>> = Comp.defaultInstance,
		options: { inverse?: boolean } = {},
	): ListImpl.NonEmpty<T> {
		const { inverse = false } = options;
		const { compare }: Comp<T> = comp as unknown as Comp<T>;

		const builder = this.toBuilder();

		function partition(left: number, right: number): number {
			const pivot = builder.get(
				Math.floor((left + right) / 2),
				throwInvalidStateError,
			);
			let leftIndex = left - 1;
			let rightIndex = right + 1;

			while (true) {
				if (inverse) {
					do {
						leftIndex++;
					} while (compare(builder.get(leftIndex), pivot) > 0);

					do {
						rightIndex--;
					} while (compare(builder.get(rightIndex), pivot) < 0);
				} else {
					do {
						leftIndex++;
					} while (compare(builder.get(leftIndex), pivot) < 0);

					do {
						rightIndex--;
					} while (compare(builder.get(rightIndex), pivot) > 0);
				}

				if (leftIndex >= rightIndex) {
					return rightIndex;
				}

				builder.updateAt(leftIndex, (oldLeftValue) => {
					let newLeftValue: T;

					builder.updateAt(rightIndex, (oldRightValue) => {
						newLeftValue = oldRightValue;
						return oldLeftValue;
					});

					return newLeftValue!;
				});
			}
		}

		function quickSort(left: number, right: number): void {
			if (left < right) {
				const pivotIndex = partition(left, right);

				quickSort(left, pivotIndex);
				quickSort(pivotIndex + 1, right);
			}
		}

		quickSort(0, this.length - 1);

		return builder.build().assumeNonEmpty();
	}

	toBuilder(): ListBuilder<T> {
		return this.context.createBuilder<T>(this);
	}

	toString(): string {
		return this.stream()
			.join({ sep: ', ', start: 'List(', end: ')' })
			.toString();
	}
}
