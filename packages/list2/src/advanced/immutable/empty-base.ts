import type { Op } from '@rimbu/collection-types/types';
import type { List } from '@rimbu/list';
import type { StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context';

import { Int } from '@rimbu/base';
import { IndexedCollectionEmptyBase } from '@rimbu/collection-types/advanced/collection/indexed-base';

export class ListEmptyBase<T>
	extends IndexedCollectionEmptyBase<T, List.Advanced.Family<T>>
	implements List<T>
{
	constructor(readonly context: ListContext) {
		super();
	}

	spliceAt(
		_: number,
		options: { insert?: StreamSource<T> } = {},
	): List.NonEmpty<T> {
		const { insert } = options;

		return this.context.from(insert);
	}

	spliceAtAndReturn(
		_: number,
		options: {
			removeAmount?: number | undefined;
			insert: StreamSource.NonEmpty<T>;
		},
	): Op.WithResult<
		List.NonEmpty<T>,
		[removed: List<T>, inserted: List.NonEmpty<T>],
		true
	>;
	spliceAtAndReturn(
		_: number,
		options: {
			removeAmount?: number | undefined;
			insert?: StreamSource<T> | undefined;
		} = {},
	): Op.DynamicResult<
		List<T>,
		[removed: List<T>, inserted: List<T>],
		[removed: List<T>, inserted: List.NonEmpty<T>],
		List.NonEmpty<T>
	> {
		const { insert } = options;

		const inserted = this.context.from(insert);

		if (inserted.nonEmpty()) {
			return {
				collection: inserted,
				hasResult: true,
				result: [this, inserted],
				hasChanged: true,
			};
		}

		return {
			collection: inserted,
			hasResult: false,
			result: [inserted, inserted],
			hasChanged: false,
		};
	}

	padTo(size: number, fill: T): List<T> {
		Int.checkAtLeastZero(size);

		if (size === 0) return this;

		return this.context.of(fill).repeat(size);
	}
}
