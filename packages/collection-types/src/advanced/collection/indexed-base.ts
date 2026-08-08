import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { Op, TypesKey } from '@rimbu/collection-types/types';

import { Int, throwInvalidStateError } from '@rimbu/base';
import {
	CollectionEmptyBase,
	CollectionNonEmptyBase,
	defaultFlatMap,
} from '@rimbu/collection-types/advanced/collection-base';
import { CollectFun, Err, IndexRange, OptLazy } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

export abstract class IndexedCollectionEmptyBase<T>
	extends CollectionEmptyBase<T>
	implements
		IndexedCollection<T>,
		IndexedCollection.Capability.WithCollectIndexed.API<T>,
		IndexedCollection.Capability.WithFlatMapIndexed.API<T>,
		IndexedCollection.Capability.WithFilterIndexed.API<T>,
		IndexedCollection.Capability.WithMapIndexed.API<T>,
		IndexedCollection.Capability.WithPrependAppend.API<T>,
		IndexedCollection.Capability.WithRepeat.API<T>,
		IndexedCollection.Capability.WithRemoveAt.API<T>,
		IndexedCollection.Capability.WithReversed.API<T>,
		IndexedCollection.Capability.WithRotate.API<T>,
		IndexedCollection.Capability.WithSwapAt.API<T>,
		IndexedCollection.Capability.WithUpdateAt.API<T>
{
	declare readonly [TypesKey]: IndexedCollection.Advanced.Types<T>;

	abstract readonly context: Collection.Advanced.ContextBase<
		IndexedCollection.Advanced.Types<T>
	>;

	streamSlice(): Stream<T> {
		return Stream.empty<T>();
	}

	at<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	first<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	last<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	take(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	drop(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	prepend(element: T): this[TypesKey]['_NON_EMPTY'] {
		return this.context.of(element);
	}

	append(element: T): this[TypesKey]['_NON_EMPTY'] {
		return this.context.of(element);
	}

	splitAt(): [this[TypesKey]['_NORMAL'], this[TypesKey]['_NORMAL']] {
		return [this, this];
	}

	slice(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	mapIndexed<T2>(): (this[TypesKey] & {
		_NEW_E: T2;
	})['_NEW_TYPES']['_NORMAL'] {
		return this;
	}

	flatMapIndexed<T2>(): (this[TypesKey] & {
		_NEW_E: T2;
	})['_NEW_TYPES']['_NORMAL'] {
		return this;
	}

	filterIndexed(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	collectIndexed<E2>(): (this[TypesKey] & {
		_NEW_E: E2;
	})['_NEW_TYPES']['_NORMAL'] {
		return this;
	}

	removeAt(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	reversed(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	setAt(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	setAtAndReturn(): Op.WithResult<this[TypesKey]['_NORMAL'], undefined, false> {
		return {
			collection: this,
			hasResult: false,
			result: undefined,
			hasChanged: false,
		};
	}

	rotateLeft(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	repeat(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	updateAt(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	updateAtAndReturn(): Op.WithResult<
		this[TypesKey]['_NORMAL'],
		[previous: undefined, current: undefined],
		false
	> {
		return {
			collection: this,
			hasResult: false,
			result: [undefined, undefined],
			hasChanged: false,
		};
	}

	swapAt(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	swapAtAndReturn(): Op.WithResult<
		this[TypesKey]['_NORMAL'],
		[previous1: undefined, previous2: undefined],
		false
	> {
		return {
			collection: this,
			hasResult: false,
			result: [undefined, undefined],
			hasChanged: false,
		};
	}
}

export abstract class IndexedCollectionNonEmptyBase<T>
	extends CollectionNonEmptyBase<T>
	implements IndexedCollection.NonEmpty<T>
{
	declare readonly [TypesKey]: IndexedCollection.Advanced.TypesNonEmpty<T>;

	abstract readonly context: Collection.Advanced.ContextBase<
		IndexedCollection.Advanced.TypesNonEmpty<T>
	>;

	abstract streamSlice(
		range: IndexRange,
		options?: { reversed?: boolean },
	): Stream<T>;
	abstract at<O>(index: number, otherwise?: OptLazy<O>): T | O;
	abstract first<O>(otherwise?: OptLazy<O>): T | O;
	abstract last<O>(otherwise?: OptLazy<O>): T | O;

	abstract take(count: number): this[TypesKey]['_NORMAL'];
	abstract drop(count: number): this[TypesKey]['_NORMAL'];

	slice(range: IndexRange): this[TypesKey]['_NORMAL'] {
		const result = IndexRange.getIndicesFor(range, this.size);

		if (result === 'all') {
			return this;
		}

		if (result === 'empty') return this.context.empty();

		const [start, end] = result;
		const values = this.drop(start).take(end - start + 1);

		return values;
	}

	splitAt(
		index: number,
	): [this[TypesKey]['_NORMAL'], this[TypesKey]['_NORMAL']] {
		const left = this.take(index);
		const right = this.drop(index);

		return [left, right];
	}
}

export function defaultFilterIndexed<
	E,
	C extends Collection.Capability.WithFilter<E>,
>(
	col: C,
	pred: (element: E, index: number) => boolean,
	options: {
		negate?: boolean | undefined;
		indexOffset?: number | undefined;
	} = {},
): C[TypesKey]['_NORMAL'] {
	const { negate = false, indexOffset = 0 } = options;
	let index = indexOffset;
	return negate
		? col.filter((element) => !pred(element, index++))
		: col.filter((element) => pred(element, index++));
}

export function defaultCollect<
	E,
	E2,
	C extends IndexedCollection.Capability.WithBuilderWithAppendPrepend<E>,
>(
	col: C,
	collectFun: (
		element: E,
		skip: CollectFun.Skip,
		halt: () => void,
	) => E2 | CollectFun.Skip,
): (C[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'] {
	const builder = col.context.builder<E2>();

	const token = Symbol();
	const iterator = col[Symbol.iterator]();

	let element: E | typeof token;
	let halted = false;

	function halt() {
		halted = true;
	}

	while (token !== (element = iterator.fastNext(token))) {
		const nextValue = collectFun(element, CollectFun.Skip, halt);
		if (CollectFun.Skip !== nextValue) {
			builder.append(nextValue);
		}

		if (halted) break;
	}

	return builder.build();
}

export function defaultCollectIndexed<
	E,
	E2,
	C extends Collection.Capability.WithCollect<E>,
>(
	col: C,
	collectFun: (
		element: E,
		index: number,
		skip: CollectFun.Skip,
		halt: () => void,
	) => E2 | CollectFun.Skip,
	options: { indexOffset?: number | undefined } = {},
): (C[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'] {
	const { indexOffset = 0 } = options;
	let index = indexOffset;

	return col.collect((element, skip, halt) =>
		collectFun(element, index++, skip, halt),
	);
}

export function defaultFlatMapIndexed<
	E,
	E2,
	C extends Collection.Capability.WithConcat<E>,
>(
	col: C,
	f: (element: E, index: number) => StreamSource<E2>,
	options: { indexOffset?: number | undefined } = {},
): (C[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'] {
	const { indexOffset = 0 } = options;
	let index = indexOffset;

	return defaultFlatMap<E, E2, C>(col, (element) => f(element, index++));
}

export function defaultMapIndexed<
	E,
	E2,
	C extends Collection.Capability.WithMap<E>,
>(
	col: C,
	mapFun: (element: E, index: number) => E2,
	options: { indexOffset?: number | undefined } = {},
): (C[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'] {
	const { indexOffset = 0 } = options;
	let index = indexOffset;

	return col.map((element) => mapFun(element, index++));
}

export interface DefaultSpliceAtAndReturnTypes<E>
	extends IndexedCollection.Advanced.TypesNonEmpty<E> {
	_NORMAL: IndexedCollection<E> & Collection.Capability.WithConcat<E>;
}

export function defaultSpliceAtAndReturn<
	E,
	C extends IndexedCollection.NonEmpty<E, DefaultSpliceAtAndReturnTypes<E>> &
		Collection.Capability.WithConcat<E>,
>(
	col: C,
	index: number,
	options:
		| {
				removeAmount?: number | undefined;
				insert?: StreamSource<E> | undefined;
		  }
		| undefined = {},
): Op.DynamicResult<
	C[TypesKey]['_NON_EMPTY'],
	[removed: C[TypesKey]['_NORMAL'], inserted: C[TypesKey]['_NORMAL']],
	[removed: C[TypesKey]['_NORMAL'], inserted: C[TypesKey]['_NORMAL']],
	C[TypesKey]['_NORMAL']
> {
	const { removeAmount = 0, insert } = options;

	Int.checkAtLeastZero(removeAmount);

	const insertList = col.context.from(insert);

	if (index >= col.size) {
		return {
			collection: col.concat(insertList),
			hasResult: insertList.nonEmpty(),
			result: [col.context.empty() as C, insertList as C],
			hasChanged: insertList.nonEmpty(),
		};
	}

	const [left, remain] = col.splitAt(index);
	const [removed, right] = remain.splitAt(removeAmount);

	const collection = left.concat(insertList, right) as C;

	if (removed.nonEmpty() || insertList.nonEmpty()) {
		return {
			collection,
			hasResult: true,
			result: [removed as C, insertList as C],
			hasChanged: true,
		};
	}

	if (collection.nonEmpty()) {
		return {
			collection: collection,
			hasResult: false,
			result: [removed as C, insertList as C],
			hasChanged: false,
		};
	}

	throwInvalidStateError();
}

export function defaultRemoveAtAndReturn<
	E,
	C extends IndexedCollection.NonEmpty<E> &
		IndexedCollection.Capability.WithSpliceAt<E>,
>(
	col: C,
	index: number,
	amount = 1,
): Op.DynamicResult<
	C[TypesKey]['_NON_EMPTY'],
	C[TypesKey]['_NORMAL'],
	C[TypesKey]['_NON_EMPTY'],
	C[TypesKey]['_NORMAL']
> {
	const outcome = col.spliceAtAndReturn(index, {
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
		collection: col,
		hasResult: false,
		result: removed,
		hasChanged: false,
	};
}

export interface DefaultSwapAtAndReturnTypes<E>
	extends IndexedCollection.Advanced.TypesNonEmpty<E> {
	_NON_EMPTY: IndexedCollection.NonEmpty<E> &
		IndexedCollection.Capability.WithUpdateAt<E> &
		IndexedCollection.Capability.WithSwapAt<E>;
}

export function defaultSwapAtAndReturn<
	E,
	C extends IndexedCollection.NonEmpty<E, DefaultSwapAtAndReturnTypes<E>> &
		IndexedCollection.Capability.WithUpdateAt<E> &
		IndexedCollection.Capability.WithSwapAt<E>,
>(
	col: C,
	index1: number,
	index2: number,
): Op.DynamicResult<
	C[TypesKey]['_NON_EMPTY'],
	[previous1: undefined, previous2: undefined],
	[previous1: E, previous2: E]
> {
	Int.check(index1);
	Int.check(index2);

	if (
		index1 >= col.size ||
		-index1 > col.size ||
		index2 >= col.size ||
		-index2 > col.size
	) {
		return {
			collection: col,
			hasResult: false,
			result: [undefined, undefined],
			hasChanged: false,
		};
	}

	if (index1 < 0) index1 = col.size + index1;
	if (index2 < 0) index2 = col.size + index2;

	if (index1 === index2) {
		const current = col.at(index1, Err);

		return {
			collection: col,
			hasResult: true,
			result: [current, current],
			hasChanged: false,
		};
	}

	const previousB = col.at(index2, Err);
	const withNewA = col.setAtAndReturn(index1, previousB);

	if (withNewA.hasResult) {
		const previousA = withNewA.result;
		const isSame = Object.is(previousA, previousB);
		const withSwapped = isSame
			? withNewA.collection
			: (withNewA.collection.setAt(
					index2,
					previousA,
				) as C[TypesKey]['_NON_EMPTY']);

		return {
			collection: withSwapped,
			hasResult: true,
			result: [previousA, previousB],
			hasChanged: col !== withSwapped,
		};
	}

	throwInvalidStateError();
}

export function defaultPadTo<
	E,
	C extends IndexedCollection.NonEmpty<
		E,
		IndexedCollection.Capability.WithRepeat.TypesNonEmpty<E> &
			IndexedCollection.Capability.WithSpliceAt.TypesNonEmpty<E>
	>,
>(
	col: C,
	size: number,
	fill: E,
	options: { paddingLeftBias?: number | undefined } = {},
) {
	Int.checkAtLeastZero(size);

	if (col.size >= size) return col;

	const diff = size - col.size;

	const { paddingLeftBias = 0 } = options;

	const frac = Math.max(0, Math.min(1.0, paddingLeftBias));
	const frontSize = Math.round(diff * frac);
	const pad = col.context.of(fill).repeat(diff);

	return pad.spliceAt(frontSize, { insert: col });
}
