import type { List } from '@rimbu/list';

import type { ListContext } from '#list/context';
import type { OuterBlock } from '#list/immutable/outer-block';

import { IndexedCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/capabilities/base';
import { IndexRange } from '@rimbu/common';

export abstract class ListNonEmptyBase<T>
	extends IndexedCollectionNonEmptyBase<T>
	implements List.NonEmpty<T>
{
	constructor(readonly context: ListContext<T, true>) {
		super();
	}

	abstract filter(f: (element: T) => boolean): List<T>;
	abstract filterIndexed(
		f: (element: T, index: number, halt: () => void) => boolean,
	): List<T>;
	abstract map<T2>(f: (element: T) => T2): List.NonEmpty<T2>;
	abstract prepend(element: T): List.NonEmpty<T>;
	abstract append(element: T): List.NonEmpty<T>;
	abstract placeAt(index: number, element: T): List.NonEmpty<T>;

	abstract _prependBlock(block: OuterBlock<T>): List.NonEmpty<T>;

	slice(range: IndexRange): List<T> {
		const result = IndexRange.getIndicesFor(range, this.size);

		if (result === 'all') {
			return this;
		}

		if (result === 'empty') return this.context.empty();

		const [start, end] = result;
		const values = this.drop(start).take(end - start + 1);

		return values;
	}

	mapIndexed<T2>(
		f: (element: T, index: number) => T2,
		options: { indexOffset?: number } = {},
	): List.NonEmpty<T2> {
		const { indexOffset = 0 } = options;

		let index = indexOffset;
		return this.map((e) => f(e, index++));
	}
}
