import type { IndexRange } from '@rimbu/common/index-range';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { Stream, StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context';
import type { ListImpl } from '#list/list-impl';
import type { ListBuilder } from '#list/mutable/builder';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';
import { NonEmptyBase } from '@rimbu/collection-types/common/empty-base';
import { Comp } from '@rimbu/common/comp';

export abstract class LeafBase<T>
	extends NonEmptyBase<T>
	implements ListImpl.NonEmpty<T>
{
	declare _NonEmptyType: ListImpl.NonEmpty<T>;

	constructor(
		readonly context: ListContext,
		readonly ops = context.leafChildrenOps,
	) {
		super();
	}

	abstract readonly length: number;
	abstract get<O>(index: number, otherwise?: OptLazy<O>): T | O;
	abstract prepend(value: T): ListImpl.NonEmpty<T>;
	abstract append(value: T): ListImpl.NonEmpty<T>;
	abstract take(count: number): ListImpl<T>;
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
	abstract toArray(
		options?:
			| { range?: IndexRange | undefined; reversed?: boolean | undefined }
			| undefined,
	): ArrayNonEmpty<T>;
	abstract _structure(): string;

	stream(): Stream.NonEmpty<T> {
		throw new Error('Method not implemented.');
	}

	first(): T {
		return this.get(0, throwInvalidStateError);
	}

	last(): T {
		return this.get(-1, throwInvalidStateError);
	}

	sort(
		comp: Comp<T> = Comp.defaultInstance,
		options: { inverse?: boolean } = {},
	): ListImpl.NonEmpty<T> {
		const { inverse = false } = options;

		const builder = this.toBuilder();

		function partition(left: number, right: number): number {
			if (left >= right) {
				return left + 1;
			}

			const pivot = builder.get(left, throwInvalidStateError);

			while (true) {
				if (inverse) {
					while (comp.compare(builder.get(left), pivot) > 0) {
						left++;
					}
					while (comp.compare(builder.get(right), pivot) < 0) {
						right--;
					}
				} else {
					while (comp.compare(builder.get(left), pivot) < 0) {
						left++;
					}
					while (comp.compare(builder.get(right), pivot) > 0) {
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
}
