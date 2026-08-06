// biome-ignore lint/correctness/noUnusedImports: TypesKey is used as a computed property key, which Biome does not detect
import type { Op, TypesKey } from '@rimbu/collection-types/types';
import type { List } from '@rimbu/list';
import type { StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context';

import { Int } from '@rimbu/base';
import { IndexedCollectionEmptyBase } from '@rimbu/collection-types/advanced/capabilities/base';

export class ListEmptyBase<T>
	extends IndexedCollectionEmptyBase<T>
	implements List<T>
{
	declare readonly [TypesKey]: List.Advanced.Types<T>;

	constructor(readonly context: ListContext<T>) {
		super();
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

	insertAt(_: number, values: StreamSource.NonEmpty<T>): List.NonEmpty<T>;
	insertAt(_: number, values: StreamSource<T>): List<T> {
		return this.context.from(values);
	}

	removeAt(): List<T> {
		return this;
	}

	removeAtAndReturn(): Op.WithResult<List<T>, List<T>, false> {
		return {
			collection: this,
			hasResult: false,
			result: this,
			hasChanged: false,
		};
	}

	padTo(size: number, fill: T): List<T> {
		Int.checkAtLeastZero(size);

		if (size === 0) return this;

		return this.context.of(fill).repeat(size);
	}
}
