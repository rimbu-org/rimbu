import type { Op } from '@rimbu/collection-types/types';
import type { List } from '@rimbu/list';
import type { StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context';
import type { OuterBlock } from '#list/immutable/outer-block';
import type { OuterTree } from '#list/immutable/outer-tree';

import { throwInvalidStateError } from '@rimbu/base';
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
	): Op.DynamicResult<this['_self'], undefined, T>;
	abstract updateAtAndReturn(
		index: number,
		f: (element: T) => T,
	): Op.DynamicResult<
		this['_self'],
		[previous: undefined, current: undefined],
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
		return this.setAtAndReturn(index, element).collection;
	}

	updateAt(index: number, f: (element: T) => T): this['_self'] {
		return this.updateAtAndReturn(index, f).collection;
	}

	swapAt(indexA: number, indexB: number): this['_self'] {
		return this.swapAtAndReturn(indexA, indexB).collection;
	}

	swapAtAndReturn(
		indexA: number,
		indexB: number,
	): Op.DynamicResult<
		this['_self'],
		[previous1: undefined, previous2: undefined],
		[previous1: T, previous2: T]
	> {
		if (
			indexA >= this.size ||
			-indexA > this.size ||
			indexB >= this.size ||
			-indexB > this.size
		) {
			return {
				collection: this,
				hasResult: false,
				result: [undefined, undefined],
				hasChanged: false,
			};
		}

		if (indexA < 0) indexA = this.size + indexA;
		if (indexB < 0) indexB = this.size + indexB;

		if (indexA === indexB) {
			const current = this.at(indexA) as T;
			return {
				collection: this,
				hasResult: true,
				result: [current, current],
				hasChanged: false,
			};
		}

		const previousB = this.at(indexB) as T;
		const withNewA = this.setAtAndReturn(indexA, previousB);

		if (withNewA.hasResult) {
			const previousA = withNewA.result;
			const isSame = Object.is(previousA, previousB);
			const withSwapped = isSame
				? withNewA.collection
				: withNewA.collection.setAt(indexB, previousA);

			return {
				collection: withSwapped,
				hasResult: true,
				result: [previousA, previousB],
				hasChanged: this !== withSwapped,
			};
		}

		throwInvalidStateError();
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

	spliceAt(
		index: number,
		options: { removeAmount?: number; insert: StreamSource.NonEmpty<T> },
	): List.NonEmpty<T>;
	spliceAt(
		index: number,
		options?: { removeAmount?: number; insert?: StreamSource<T> },
	): List<T> {
		if (undefined === options) {
			return this.take(index);
		}

		if (index >= this.size) {
			return this.concat(options.insert);
		}
		if (index === 0 || -index >= this.size) {
			return this.context.from(options.insert, this);
		}

		// const

		return 0 as any;
	}

	spliceAtAndReturn(
		index: number,
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
		index: number,
		options: {
			removeAmount?: number | undefined;
			insert?: StreamSource<T> | undefined;
		} = {},
	): Op.DynamicResult<
		List.NonEmpty<T>,
		[removed: List<T>, inserted: List<T>],
		[removed: List<T>, inserted: List<T>],
		List<T>
	> {
		// if (undefined === options) {
		const { removeAmount = 0, insert } = options;
		const insertList = this.context.from(insert);

		if (index >= this.size) {
			return {
				collection: this.concat(insertList),
				hasResult: insertList.nonEmpty(),
				result: [this.context.empty(), insertList],
				hasChanged: insertList.nonEmpty(),
			};
		}

		const [left, remain] = this.splitAt(index);
		const [removed, right] = remain.splitAt(removeAmount);

		const collection = left.concat(insertList, right);

		if (removed.nonEmpty() || insertList.nonEmpty()) {
			return {
				collection,
				hasResult: true,
				result: [removed, insertList],
				hasChanged: true,
			};
		}

		if (collection.nonEmpty()) {
			return {
				collection: collection,
				hasResult: false,
				result: [removed, insertList],
				hasChanged: false,
			};
		}

		throwInvalidStateError();
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
