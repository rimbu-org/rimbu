import type { Op } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { List } from '@rimbu/list';
import type { StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context';

import { IndexedCollectionEmptyBase } from '@rimbu/collection-types/advanced/capabilities/base';

export class ListEmptyBase<T>
	extends IndexedCollectionEmptyBase<T>
	implements List<T>
{
	constructor(readonly context: ListContext<T>) {
		super();
	}

	get #ops() {
		return this.context.childrenOps;
	}

	prepend(element: T): List.NonEmpty<T> {
		return this.context.outerBlockLeftRight(this.#ops.of([element]));
	}

	append(element: T): List.NonEmpty<T> {
		return this.context.outerBlockLeftRight(this.#ops.of([element]));
	}

	spliceAt(
		_: number,
		options: { insert?: StreamSource<T> } = {},
	): List.NonEmpty<T> {
		const { insert } = options;

		return this.context.from(insert) as List.NonEmpty<T>;
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
				result: [this.context.empty(), inserted],
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

	concat(...sources: ArrayNonEmpty<StreamSource<T>>): List.NonEmpty<T> {
		if (sources.length === 0) return this as any;

		return this.context.from(...sources) as any;
	}
}
