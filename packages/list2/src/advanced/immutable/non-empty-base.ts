import type { Op } from '@rimbu/collection-types/types';
import type { List } from '@rimbu/list';

import type { ListContext } from '#list/context';
import type { OuterBlock } from '#list/immutable/outer-block';
import type { OuterTree } from '#list/immutable/outer-tree';
import type { OuterBuilder } from '#list/mutable/common';

import { Int } from '@rimbu/base';
import {
	defaultFlatMapByConcat,
	defaultPadTo,
	defaultRemoveAtAndReturn,
	defaultRepeat,
	defaultSpliceAtAndReturn,
	defaultSwapAtAndReturn,
	WithIndexedCollectionNonEmptyBase,
} from '@rimbu/collection-types/advanced/collection/indexed-base';
import {
	CollectionNonEmptyConstructor,
	defaultFlatMapIndexed,
	defaultMapIndexed,
} from '@rimbu/collection-types/advanced/collection-base';
import { type ArrayNonEmpty, IndexRange } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

const NonEmptyBase = WithIndexedCollectionNonEmptyBase(
	CollectionNonEmptyConstructor,
);

export abstract class ListNonEmptyBase<T>
	extends NonEmptyBase<T, List.Advanced.Family<T>>
	implements List.NonEmpty<T>
{
	declare _self: ListNonEmptyBase<T>;

	constructor(readonly context: ListContext) {
		super(context);
	}

	abstract stream(options?: {
		reversed?: boolean | undefined;
	}): Stream.NonEmpty<T>;
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
	abstract filter(
		f: (element: T) => boolean,
		options?: { negate?: boolean | undefined } | undefined,
	): List<T>;
	abstract map<T2>(f: (element: T) => T2): List.NonEmpty<T2>;
	abstract prepend(element: T): List.NonEmpty<T>;
	abstract append(element: T): List.NonEmpty<T>;
	abstract reversed(): List.NonEmpty<T>;

	abstract toNodeBuilder(): OuterBuilder<T>;

	abstract _streamSlice(
		start: number,
		end: number,
		options?: { reversed?: boolean | undefined },
	): Stream<T>;
	abstract _concat(sources: List.NonEmpty<T>): List.NonEmpty<T>;
	abstract _prependBlock(leftBlock: OuterBlock<T>): List.NonEmpty<T>;
	abstract _prependTree(leftTree: OuterTree<T>): List.NonEmpty<T>;

	streamSlice(
		range: IndexRange,
		options: { reversed?: boolean | undefined } = {},
	): Stream<T> {
		const indices = IndexRange.getIndicesFor(range, this.size);

		if (indices === 'empty') return Stream.empty();
		if (indices === 'all') return this.stream(options);

		const [start, end] = indices;

		return this._streamSlice(start, end, options);
	}

	setAt(index: number, element: T): this['_self'] {
		return this.setAtAndReturn(index, element).collection;
	}

	updateAt(index: number, f: (element: T) => T): this['_self'] {
		return this.updateAtAndReturn(index, f).collection;
	}

	swapAt(indexA: number, indexB: number): List.NonEmpty<T> {
		return this.swapAtAndReturn(indexA, indexB).collection;
	}

	swapAtAndReturn(
		indexA: number,
		indexB: number,
	): Op.DynamicResult<
		List.NonEmpty<T>,
		[previous1: undefined, previous2: undefined],
		[previous1: T, previous2: T]
	> {
		return defaultSwapAtAndReturn<T, List.NonEmpty<T>, List.Advanced.Family<T>>(
			this,
			indexA,
			indexB,
		);
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
		return defaultSpliceAtAndReturn<
			T,
			List.NonEmpty<T>,
			List.Advanced.Family<T>
		>(this, index, options);
	}

	concat(...sources: ArrayNonEmpty<StreamSource<T>>): List.NonEmpty<T> {
		let result: List.NonEmpty<T> = this;

		for (const source of sources) {
			const asList = this.context.from(source);

			if (asList.nonEmpty()) {
				result = (result as ListNonEmptyBase<T>)._concat(asList);
			}
		}

		return result;
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
		return defaultRemoveAtAndReturn<
			T,
			List.NonEmpty<T>,
			List.Advanced.Family<T>
		>(this, index, amount);
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
		return defaultRepeat<T, List.NonEmpty<T>, List.Advanced.Family<T>>(
			this,
			amount,
		) as List.NonEmpty<T>;
	}

	mapIndexed<T2>(
		f: (element: T, index: number) => T2,
		options: { indexOffset?: number } = {},
	): List.NonEmpty<T2> {
		return defaultMapIndexed<T, T2, List.NonEmpty<T>, List.Advanced.Family<T>>(
			this,
			f,
			options,
		);
	}

	flatMap<T2>(f: (element: T) => StreamSource.NonEmpty<T2>): List.NonEmpty<T2>;
	flatMap<T2>(f: (element: T) => StreamSource<T2>): List<T2> {
		return defaultFlatMapByConcat(this, f) as List.NonEmpty<T2>;
	}

	flatMapIndexed<T2>(
		f: (element: T, index: number) => StreamSource<T2>,
		options: { indexOffset?: number } = {},
	): List.NonEmpty<T2> {
		return defaultFlatMapIndexed(this, f, options) as List.NonEmpty<T2>;
	}

	padTo(
		size: number,
		fill: T,
		options?: { paddingLeftBias?: number | undefined } | undefined,
	): List.NonEmpty<T> {
		return defaultPadTo<T, List.NonEmpty<T>, List.Advanced.Family<T>>(
			this,
			size,
			fill,
			options,
		);
	}

	mutate(f: (builder: List.Builder<T>) => void): List<T> {
		const builder = this.toBuilder();
		f(builder);
		return builder.build();
	}

	toBuilder(): List.Builder<T> {
		return this.context.builderFrom(this.toNodeBuilder());
	}
}
