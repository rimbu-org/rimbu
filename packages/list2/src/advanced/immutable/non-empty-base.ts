import type { Op } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { List } from '@rimbu/list';
import type { StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context';
import type { OuterBlock } from '#list/immutable/outer-block';
import type { OuterTree } from '#list/immutable/outer-tree';
import type { OuterBuilder } from '#list/mutable/common';

import { Int, throwInvalidStateError } from '@rimbu/base';
import { IndexedCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/capabilities/base';

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
	abstract reversed(): List.NonEmpty<T>;

	abstract toNodeBuilder(): OuterBuilder<T>;

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

	spliceAt(
		index: number,
		options: { removeAmount?: number; insert: StreamSource.NonEmpty<T> },
	): List.NonEmpty<T>;
	spliceAt(
		index: number,
		options:
			| {
					removeAmount?: number | undefined;
					insert?: StreamSource<T> | undefined;
			  }
			| undefined,
	): List<T> {
		return this.spliceAtAndReturn(index, options as any).collection;
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
		options:
			| {
					removeAmount?: number | undefined;
					insert?: StreamSource<T> | undefined;
			  }
			| undefined = {},
	): Op.DynamicResult<
		List.NonEmpty<T>,
		[removed: List<T>, inserted: List<T>],
		[removed: List<T>, inserted: List<T>],
		List<T>
	> {
		// if (undefined === options) {
		const { removeAmount = 0, insert } = options;

		Int.checkAtLeastZero(removeAmount);

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

	insertAt(index: number, values: StreamSource.NonEmpty<T>): List.NonEmpty<T>;
	insertAt(index: number, values: StreamSource<T>): List<T> {
		return this.spliceAt(index, { insert: values as StreamSource.NonEmpty<T> });
	}

	removeAt(index: number, amount = 1): List<T> {
		return this.spliceAt(index, { removeAmount: amount } as any);
	}

	removeAtAndReturn(
		index: number,
		amount = 1,
	): Op.DynamicResult<List.NonEmpty<T>, List<T>, List.NonEmpty<T>, List<T>> {
		const outcome = this.spliceAtAndReturn(index, {
			removeAmount: amount,
		} as any);

		const [removed] = outcome.result;

		if (removed.nonEmpty()) {
			return {
				collection: outcome.collection,
				hasResult: true,
				result: removed,
				hasChanged: true,
			};
		}

		return {
			collection: this,
			hasResult: false,
			result: removed,
			hasChanged: false,
		};
	}

	rotateLeft(amount: number): List.NonEmpty<T> {
		Int.check(amount);
		const normalizedAmount = amount % this.size;
		if (normalizedAmount === 0) return this;

		return this.drop(normalizedAmount)
			.concat(this.take(normalizedAmount))
			.assumeNonEmpty();
	}

	repeat(amount: number): List.NonEmpty<T> {
		Int.checkAtLeastZero(amount);

		if (amount <= 0) {
			return this.context.empty() as List.NonEmpty<T>;
		}
		if (amount === 1) {
			return this;
		}

		const nextRepeat = amount >>> 1;
		const remain = amount % 2;

		return this.context
			.from(
				this.concat(this).repeat(nextRepeat),
				remain === 0 ? undefined : this,
			)
			.assumeNonEmpty();
	}

	mapIndexed<T2>(
		f: (element: T, index: number) => T2,
		options: { indexOffset?: number } = {},
	): List.NonEmpty<T2> {
		const { indexOffset = 0 } = options;

		let index = indexOffset;
		return this.map((e) => f(e, index++));
	}

	toBuilder(): List.Builder<T> {
		return this.context.builderFrom(this.toNodeBuilder());
	}
}
