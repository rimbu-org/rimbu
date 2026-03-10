import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { Stream, StreamSource } from '@rimbu/stream';
import type { ListBuilder } from '../mutable/builder';

import type { ListContext } from '#list/context';
import type { ListImpl } from '#list/list-impl';

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

		function partition(_left: number, _right: number): number {
			const pivot = builder.get(_left, throwInvalidStateError);

			let left = _left - 1;
			let right = _right + 1;

			while (true) {
				left++;
				right--;

				if (inverse) {
					while (comp.compare(builder.get(left), pivot) > 0) {}
					while (comp.compare(builder.get(right), pivot) < 0) {}
				} else {
					while (comp.compare(builder.get(left), pivot) < 0) {}
					while (comp.compare(builder.get(right), pivot) > 0) {}
				}

				if (left >= right) {
					break;
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

			return left + 1;
		}

		function quickSort(left: number, right: number): void {
			if (left < right) {
				const pivotIndex = partition(left, right);

				quickSort(left, pivotIndex - 1);
				quickSort(pivotIndex, right);
			}
		}

		quickSort(0, this.length - 1);

		return builder.build();
	}

	toBuilder(): ListBuilder<T> {
		return this.context.createBuilder<T>(this);
	}
}
