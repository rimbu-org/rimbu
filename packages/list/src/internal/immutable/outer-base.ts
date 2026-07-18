import type { CollectFun } from '@rimbu/common/collect';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type {
	ArrayNonEmpty,
	SuperOf,
	WithValueResult,
} from '@rimbu/common/types';

import type { ListContext } from '#list/context-module';
import type { ListImpl } from '#list/list-impl';
import type { ListBuilder } from '#list/mutable/builder';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';
import { NonEmptyBase } from '@rimbu/collection-types/advanced/common/empty-base';
import { Comp } from '@rimbu/common/comp';
import { IndexRange } from '@rimbu/common/index-range';
import { Stream, type StreamSource } from '@rimbu/stream';

const DONE = Symbol('Done');

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
	abstract streamRange(
		range: IndexRange,
		options?: { reversed?: boolean },
	): Stream<T>;
	abstract get<O>(index: number, otherwise?: OptLazy<O>): T | O;
	at(index: number): T | undefined {
		return this.get(index);
	}
	abstract updateAt(
		index: number,
		update: (current: T) => T,
	): ListImpl.NonEmpty<T, ListImpl.Types>;
	with(index: number, value: T): ListImpl.NonEmpty<T, ListImpl.Types> {
		return this.updateAt(index, () => value);
	}
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
	abstract mapPure<T2>(
		mapFun: (value: T) => T2,
		options?: { reversed?: boolean },
	): OuterBase<T2>;
	abstract toArray(
		options?:
			| { range?: IndexRange | undefined; reversed?: boolean | undefined }
			| undefined,
	): ArrayNonEmpty<T>;
	abstract _structure(): string;

	updateAtAndGet(
		index: number,
		update: (current: T) => T,
	): WithValueResult<ListImpl.NonEmpty<T>, T> {
		const token = Symbol();
		let oldValue: T | typeof token = token;

		const newThis = this.updateAt(index, (current) => {
			oldValue = current;
			return update(current);
		});

		if (token === oldValue) {
			return [this, undefined, false];
		}

		return [newThis, oldValue, true];
	}

	withAndGet(
		index: number,
		value: T,
	): WithValueResult<ListImpl.NonEmpty<T>, T> {
		return this.updateAtAndGet(index, () => value);
	}

	filter(
		pred: (value: T, index: number, halt: () => void) => boolean,
		options: {
			range?: IndexRange | undefined;
			reversed?: boolean | undefined;
			negate?: boolean | undefined;
		} = {},
	): any {
		const { range, reversed = false, negate = false } = options;

		const stream =
			undefined === range
				? this.stream({ reversed })
				: this.streamRange(range, { reversed });

		const result: ListImpl<T> = this.context.from(
			stream.filter(pred, { negate }),
		);

		if (result.length !== this.length) {
			return result;
		}

		return this;
	}

	collect<T2>(
		collectFun: CollectFun<T, T2>,
		options: {
			range?: IndexRange;
			reversed?: boolean;
		} = {},
	): ListImpl<T2> {
		const { range, reversed = false } = options;

		const stream =
			undefined === range
				? this.stream({ reversed })
				: this.streamRange(range, { reversed });

		return this.context.from(stream.collect(collectFun));
	}

	flatMap<T2>(
		flatMapFun: (value: T, index: number) => StreamSource<T2>,
		options: {
			range?: IndexRange | undefined;
			reversed?: boolean;
		} = {},
	): ListImpl<T2> | any {
		const { range, reversed = false } = options;

		let result = this.context.empty<T2>();

		const stream =
			undefined === range
				? this.stream({ reversed })
				: this.streamRange(range, { reversed });
		const iterator = stream[Symbol.iterator]();

		let index = 0;
		let value: T | typeof DONE;

		while (DONE !== (value = iterator.fastNext(DONE))) {
			result = result.concat(flatMapFun(value, index++));
		}

		return result;
	}

	transform<T2>(
		transformFun: (stream: Stream.NonEmpty<T>) => StreamSource<T2>,
	): any {
		return this.context.from(transformFun(this.stream()));
	}

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

	splice(options: {
		index?: number | undefined;
		remove?: number | undefined;
		insert?: StreamSource<T> | undefined;
	}): ListImpl<T> | any {
		const { index = 0, remove = 0, insert } = options;

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

	spliceAndGet(options: {
		index?: number | undefined;
		remove?: number | undefined;
		insert?: StreamSource<T> | undefined;
	}): WithValueResult<
		ListImpl.NonEmpty<T>,
		ListImpl.NonEmpty<T>,
		ListImpl.NonEmpty<T>
	> {
		const { index = 0, remove = 0, insert } = options;

		if (index < 0) {
			return this.spliceAndGet({ index: this.length + index, remove, insert });
		}

		if (undefined === insert) {
			if (remove <= 0) return [this, undefined, false];

			const left = this.take(index);
			const removed = this.slice({ start: index, amount: remove });
			const right = this.drop(index + remove);
			const result = left.concat(right);

			if (removed.nonEmpty()) {
				return [result, removed, true];
			}
			return [result, undefined, false];
		}

		if (remove <= 0 && Stream.isEmptyStreamSourceInstance(insert))
			return [this, undefined, false];

		const left = this.take(index);
		const removed = this.slice({ start: index, amount: remove });
		const right = this.drop(index + remove);
		const result = left.concat(insert, right);

		if (removed.nonEmpty()) {
			return [result, removed, true];
		}
		return [result, undefined, false];
	}

	insert(index: number, values: StreamSource<T>): ListImpl<T> | any {
		return this.splice({ index, insert: values });
	}

	remove(index: number, options: { amount?: number } = {}): ListImpl<T> {
		const { amount = 1 } = options;

		return this.splice({ index, remove: amount });
	}

	removeAndGet(
		index: number,
		options: { amount?: number | undefined } = {},
	): WithValueResult<ListImpl<T>, ListImpl.NonEmpty<T>, ListImpl.NonEmpty<T>> {
		if (index < 0) {
			return this.removeAndGet(this.length + index);
		}

		const { amount = 1 } = options;

		return this.spliceAndGet({ index, remove: amount });
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

	rotate(shiftRightAmount: number): ListImpl.NonEmpty<T> {
		let normalizedAmount = shiftRightAmount % this.length;

		if (normalizedAmount === 0) return this;

		if (normalizedAmount < 0) normalizedAmount += this.length;

		return this.take(-normalizedAmount)
			.concat(this.drop(-normalizedAmount))
			.assumeNonEmpty();
	}

	padTo(
		length: number,
		fill: T,
		options: { positionPercentage?: number } = {},
	): ListImpl.NonEmpty<T> {
		const { positionPercentage = 0 } = options;

		if (this.length >= length) return this;

		const diff = length - this.length;
		const frac = Math.max(0, Math.min(100, positionPercentage)) / 100;
		const frontSize = Math.round(diff * frac);
		const pad = this.context.outerBlock<T>(this.ops.of([fill])).repeat(diff);
		return pad.splice({ index: frontSize, insert: this }).assumeNonEmpty();
	}

	sorted<TC = T>(
		comp: Comp<SuperOf<TC, T>> = Comp.defaultInstance,
		options: { inverse?: boolean } = {},
	): ListImpl.NonEmpty<T> {
		const { inverse = false } = options;
		const { compare }: Comp<T> = comp as unknown as Comp<T>;

		const builder = this.toBuilder();

		function partition(left: number, right: number): number {
			const pivot = builder.at(
				Math.floor((left + right) / 2),
				throwInvalidStateError,
			);
			let leftIndex = left - 1;
			let rightIndex = right + 1;

			while (true) {
				if (inverse) {
					do {
						leftIndex++;
					} while (compare(builder.at(leftIndex), pivot) > 0);

					do {
						rightIndex--;
					} while (compare(builder.at(rightIndex), pivot) < 0);
				} else {
					do {
						leftIndex++;
					} while (compare(builder.at(leftIndex), pivot) < 0);

					do {
						rightIndex--;
					} while (compare(builder.at(rightIndex), pivot) > 0);
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
