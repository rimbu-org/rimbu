import type { List, OpWithChangeResult } from '@rimbu/list';
import type { StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context';
import type { OuterBlock } from '#list/immutable/outer-block';
import type { OuterTree } from '#list/immutable/outer-tree';

import { IndexedCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/capabilities/base';
import { type ArrayNonEmpty, IndexRange } from '@rimbu/common';

export abstract class ListNonEmptyBase<T>
	extends IndexedCollectionNonEmptyBase<T>
	implements List.NonEmpty<T>
{
	declare _self: ListNonEmptyBase<T>;

	constructor(readonly context: ListContext<T, true>) {
		super();
	}

	abstract setAtAndReturn(
		index: number,
		element: T,
	): OpWithChangeResult<this['_self'], T | undefined, T>;
	abstract updateAtAndReturn(
		index: number,
		f: (element: T) => T,
	): OpWithChangeResult<
		this['_self'],
		[previous: T | undefined, current: T | undefined],
		[previous: T, current: T]
	>;
	abstract filter(f: (element: T) => boolean): List<T>;
	abstract filterIndexed(
		f: (element: T, index: number, halt: () => void) => boolean,
	): List<T>;
	abstract map<T2>(f: (element: T) => T2): List.NonEmpty<T2>;
	abstract prepend(element: T): List.NonEmpty<T>;
	abstract append(element: T): List.NonEmpty<T>;
	abstract concat(...sources: ArrayNonEmpty<StreamSource<T>>): List.NonEmpty<T>;
	abstract placeAt(index: number, element: T): List.NonEmpty<T>;
	abstract reversed(): List.NonEmpty<T>;

	abstract _prependBlock(leftBlock: OuterBlock<T>): List.NonEmpty<T>;
	abstract _prependTree(leftTree: OuterTree<T>): List.NonEmpty<T>;

	setAt(index: number, element: T): this['_self'] {
		const [newThis] = this.setAtAndReturn(index, element);
		return newThis;
	}

	updateAt(index: number, f: (element: T) => T): this['_self'] {
		const [newThis] = this.updateAtAndReturn(index, f);
		return newThis;
	}

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
