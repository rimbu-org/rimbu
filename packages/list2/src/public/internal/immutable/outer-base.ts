import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { ArrayNonEmpty, SuperOf } from '@rimbu/common/types';
import type { Stream, StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context-module';
import type { ListImpl } from '#list/list-impl';
import type { ListBuilder } from '#list/mutable/builder';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';
import { NonEmptyBase } from '@rimbu/collection-types/common/empty-base';
import { Comp } from '@rimbu/common/comp';
import { IndexRange } from '@rimbu/common/index-range';

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

	sort<TC = T>(
		comp: Comp<SuperOf<TC, T>> = Comp.defaultInstance,
		options: { inverse?: boolean } = {},
	): ListImpl.NonEmpty<T> {
		const { inverse = false } = options;
		const { compare }: Comp<T> = comp as unknown as Comp<T>;

		const builder = this.toBuilder();

		function partition(left: number, right: number): number {
			if (left >= right) {
				return left + 1;
			}

			const pivot = builder.get(left, throwInvalidStateError);

			while (true) {
				if (inverse) {
					while (compare(builder.get(left), pivot) > 0) {
						left++;
					}
					while (compare(builder.get(right), pivot) < 0) {
						right--;
					}
				} else {
					while (compare(builder.get(left), pivot) < 0) {
						left++;
					}
					while (compare(builder.get(right), pivot) > 0) {
						right--;
					}
				}

				if (left >= right) {
					return left + 1;
				}

				builder.updateAt(left, (oldI) => {
					let storeJ: T;

					builder.updateAt(right, (oldJ) => {
						storeJ = oldJ;
						return oldI;
					});

					return storeJ!;
				});
			}
		}

		function quickSort(left: number, right: number): void {
			if (left < right) {
				const pivotIndex = partition(left, right);

				quickSort(left, pivotIndex - 1);
				quickSort(pivotIndex, right);
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
