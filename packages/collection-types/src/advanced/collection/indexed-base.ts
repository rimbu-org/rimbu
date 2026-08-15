// import type { Collection } from '@rimbu/collection-types/collection';
// import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
// import type { Op, TypesKey } from '@rimbu/collection-types/types';

// import { Int, throwInvalidStateError } from '@rimbu/base';
// import {
// 	CollectionEmptyBase,
// 	CollectionNonEmptyBase,
// } from '@rimbu/collection-types/advanced/collection-base';
// import { Err, IndexRange, OptLazy } from '@rimbu/common';
// import { Stream, type StreamSource } from '@rimbu/stream';

// export abstract class IndexedCollectionEmptyBase<E>
// 	extends CollectionEmptyBase<E>
// 	implements
// 		IndexedCollection<E>,
// 		IndexedCollection.Capability.WithPrependAppend.API<E>,
// 		IndexedCollection.Capability.WithRepeat.API<E>,
// 		IndexedCollection.Capability.WithRemoveAt.API<E>,
// 		IndexedCollection.Capability.WithReversed.API<E>,
// 		IndexedCollection.Capability.WithRotate.API<E>,
// 		IndexedCollection.Capability.WithSwapAt.API<E>,
// 		IndexedCollection.Capability.WithUpdateAt.API<E>
// {
// 	declare readonly [TypesKey]: IndexedCollection.Advanced.Types<E>;

// 	abstract readonly context: Collection.Advanced.ContextBase<
// 		IndexedCollection.Advanced.Types<E>
// 	>;

// 	streamSlice(): Stream<E> {
// 		return Stream.empty<E>();
// 	}

// 	at<O>(otherwise?: OptLazy<O>): O {
// 		return OptLazy(otherwise) as O;
// 	}

// 	first<O>(otherwise?: OptLazy<O>): O {
// 		return OptLazy(otherwise) as O;
// 	}

// 	last<O>(otherwise?: OptLazy<O>): O {
// 		return OptLazy(otherwise) as O;
// 	}

// 	take(): this[TypesKey]['_NORMAL'] {
// 		return this;
// 	}

// 	drop(): this[TypesKey]['_NORMAL'] {
// 		return this;
// 	}

// 	prepend(element: E): this[TypesKey]['_NON_EMPTY'] {
// 		return this.context.of(element);
// 	}

// 	append(element: E): this[TypesKey]['_NON_EMPTY'] {
// 		return this.context.of(element);
// 	}

// 	splitAt(): [this[TypesKey]['_NORMAL'], this[TypesKey]['_NORMAL']] {
// 		return [this, this];
// 	}

// 	slice(): this[TypesKey]['_NORMAL'] {
// 		return this;
// 	}

// 	removeAt(): this[TypesKey]['_NORMAL'] {
// 		return this;
// 	}

// 	reversed(): this[TypesKey]['_NORMAL'] {
// 		return this;
// 	}

// 	setAt(): this[TypesKey]['_NORMAL'] {
// 		return this;
// 	}

// 	setAtAndReturn(): Op.WithResult<this[TypesKey]['_NORMAL'], undefined, false> {
// 		return {
// 			collection: this,
// 			hasResult: false,
// 			result: undefined,
// 			hasChanged: false,
// 		};
// 	}

// 	rotateLeft(): this[TypesKey]['_NORMAL'] {
// 		return this;
// 	}

// 	repeat(): this[TypesKey]['_NORMAL'] {
// 		return this;
// 	}

// 	updateAt(): this[TypesKey]['_NORMAL'] {
// 		return this;
// 	}

// 	updateAtAndReturn(): Op.WithResult<
// 		this[TypesKey]['_NORMAL'],
// 		[previous: undefined, current: undefined],
// 		false
// 	> {
// 		return {
// 			collection: this,
// 			hasResult: false,
// 			result: [undefined, undefined],
// 			hasChanged: false,
// 		};
// 	}

// 	swapAt(): this[TypesKey]['_NORMAL'] {
// 		return this;
// 	}

// 	swapAtAndReturn(): Op.WithResult<
// 		this[TypesKey]['_NORMAL'],
// 		[previous1: undefined, previous2: undefined],
// 		false
// 	> {
// 		return {
// 			collection: this,
// 			hasResult: false,
// 			result: [undefined, undefined],
// 			hasChanged: false,
// 		};
// 	}
// }

// export abstract class IndexedCollectionNonEmptyBase<E>
// 	extends CollectionNonEmptyBase<E>
// 	implements IndexedCollection.NonEmpty<E>
// {
// 	declare readonly [TypesKey]: IndexedCollection.Advanced.TypesNonEmpty<E>;

// 	abstract readonly context: Collection.Advanced.ContextBase<
// 		IndexedCollection.Advanced.TypesNonEmpty<E>
// 	>;

// 	abstract streamSlice(
// 		range: IndexRange,
// 		options?: { reversed?: boolean },
// 	): Stream<E>;
// 	abstract at<O>(index: number, otherwise?: OptLazy<O>): E | O;
// 	abstract first<O>(otherwise?: OptLazy<O>): E | O;
// 	abstract last<O>(otherwise?: OptLazy<O>): E | O;

// 	abstract take(count: number): this[TypesKey]['_NORMAL'];
// 	abstract drop(count: number): this[TypesKey]['_NORMAL'];

// 	slice(range: IndexRange): this[TypesKey]['_NORMAL'] {
// 		const result = IndexRange.getIndicesFor(range, this.size);

// 		if (result === 'all') {
// 			return this;
// 		}

// 		if (result === 'empty') return this.context.empty();

// 		const [start, end] = result;
// 		const values = this.drop(start).take(end - start + 1);

// 		return values;
// 	}

// 	splitAt(
// 		index: number,
// 	): [this[TypesKey]['_NORMAL'], this[TypesKey]['_NORMAL']] {
// 		const left = this.take(index);
// 		const right = this.drop(index);

// 		return [left, right];
// 	}
// }

// export function defaultFlatMapByConcat<
// 	E,
// 	E2 extends C[TypesKey]['_UPPER_E'],
// 	C extends Collection.Advanced.WithCapabilities<
// 		IndexedCollection<E>,
// 		IndexedCollection.Capability.WithConcat<E>
// 	>,
// >(
// 	col: C,
// 	f: (element: E) => StreamSource<E2>,
// ): Collection.Advanced.Retyped<C[TypesKey], E2>['_NORMAL'] {
// 	const token = Symbol();
// 	const iterator = col[Symbol.iterator]();

// 	let result = col.context.empty<E2>();
// 	let element: E | typeof token;

// 	while (token !== (element = iterator.fastNext(token))) {
// 		result = result.concat(f(element));
// 	}

// 	return result;
// }

// export function defaultFlatMapIndexed<
// 	E,
// 	E2 extends C[TypesKey]['_UPPER_E'],
// 	C extends Collection.Advanced.WithCapabilities<
// 		IndexedCollection<E>,
// 		IndexedCollection.Capability.WithConcat<E>
// 	>,
// >(
// 	col: C,
// 	f: (element: E, index: number) => StreamSource<E2>,
// 	options: { indexOffset?: number | undefined } = {},
// ): Collection.Advanced.Retyped<C[TypesKey], E2>['_NORMAL'] {
// 	const { indexOffset = 0 } = options;
// 	let index = indexOffset;

// 	return defaultFlatMapByConcat<E, E2, C>(col, (element) =>
// 		f(element, index++),
// 	);
// }

// export function defaultSpliceAtAndReturn<
// 	E,
// 	C extends Collection.Advanced.WithCapabilities<
// 		IndexedCollection.NonEmpty<E>,
// 		IndexedCollection.Capability.WithSpliceAt.NonEmpty<E> &
// 			IndexedCollection.Capability.WithConcat<E>
// 	>,
// >(
// 	col: C,
// 	index: number,
// 	options:
// 		| {
// 				removeAmount?: number | undefined;
// 				insert?: StreamSource<E> | undefined;
// 		  }
// 		| undefined = {},
// ): Op.DynamicResult<
// 	C[TypesKey]['_NON_EMPTY'],
// 	[removed: C[TypesKey]['_NORMAL'], inserted: C[TypesKey]['_NORMAL']],
// 	[removed: C[TypesKey]['_NORMAL'], inserted: C[TypesKey]['_NORMAL']],
// 	C[TypesKey]['_NORMAL']
// > {
// 	const { removeAmount = 0, insert } = options;

// 	Int.checkAtLeastZero(removeAmount);

// 	const insertList = col.context.from(insert);

// 	if (index < 0) {
// 		index = col.size + index;
// 		if (index < 0) {
// 			index = 0;
// 		}
// 	}

// 	if (index >= col.size) {
// 		return {
// 			collection: col.concat(insertList),
// 			hasResult: insertList.nonEmpty(),
// 			result: [col.context.empty(), insertList],
// 			hasChanged: insertList.nonEmpty(),
// 		};
// 	}

// 	const [left, remain] = col.splitAt(index);
// 	const [removed, right] = remain.splitAt(removeAmount);

// 	const collection = left.concat(insertList, right);

// 	if (removed.nonEmpty() || insertList.nonEmpty()) {
// 		return {
// 			collection,
// 			hasResult: true,
// 			result: [removed, insertList],
// 			hasChanged: true,
// 		};
// 	}

// 	if (collection.nonEmpty()) {
// 		return {
// 			collection: collection,
// 			hasResult: false,
// 			result: [removed, insertList],
// 			hasChanged: false,
// 		};
// 	}

// 	throwInvalidStateError();
// }

// export function defaultRemoveAtAndReturn<
// 	E,
// 	C extends Collection.Advanced.WithCapabilities<
// 		IndexedCollection.NonEmpty<E>,
// 		IndexedCollection.Capability.WithSpliceAt<E>
// 	>,
// >(
// 	col: C,
// 	index: number,
// 	amount = 1,
// ): Op.DynamicResult<
// 	C[TypesKey]['_NON_EMPTY'],
// 	C[TypesKey]['_NORMAL'],
// 	C[TypesKey]['_NON_EMPTY'],
// 	C[TypesKey]['_NORMAL']
// > {
// 	const outcome = col.spliceAtAndReturn(index, {
// 		removeAmount: amount,
// 	});

// 	const [removed] = outcome.result;

// 	if (removed.nonEmpty()) {
// 		return {
// 			collection: outcome.collection,
// 			hasResult: true,
// 			result: removed,
// 			hasChanged: true,
// 		};
// 	}

// 	return {
// 		collection: col,
// 		hasResult: false,
// 		result: removed,
// 		hasChanged: false,
// 	};
// }

// export function defaultSwapAtAndReturn<
// 	E,
// 	C extends Collection.Advanced.WithCapabilities<
// 		IndexedCollection.NonEmpty<E>,
// 		IndexedCollection.Capability.WithSwapAt<E> &
// 			IndexedCollection.Capability.WithUpdateAt<E>
// 	>,
// >(
// 	col: C,
// 	index1: number,
// 	index2: number,
// ): Op.DynamicResult<
// 	C[TypesKey]['_NON_EMPTY'],
// 	[previous1: undefined, previous2: undefined],
// 	[previous1: E, previous2: E]
// > {
// 	Int.check(index1);
// 	Int.check(index2);

// 	if (
// 		index1 >= col.size ||
// 		-index1 > col.size ||
// 		index2 >= col.size ||
// 		-index2 > col.size
// 	) {
// 		return {
// 			collection: col,
// 			hasResult: false,
// 			result: [undefined, undefined],
// 			hasChanged: false,
// 		};
// 	}

// 	if (index1 < 0) index1 = col.size + index1;
// 	if (index2 < 0) index2 = col.size + index2;

// 	if (index1 === index2) {
// 		const current = col.at(index1, Err);

// 		return {
// 			collection: col,
// 			hasResult: true,
// 			result: [current, current],
// 			hasChanged: false,
// 		};
// 	}

// 	const previousB = col.at(index2, Err);
// 	const withNewA = col.setAtAndReturn(index1, previousB);

// 	if (withNewA.hasResult) {
// 		const previousA = withNewA.result;
// 		const isSame = Object.is(previousA, previousB);
// 		const withSwapped = isSame
// 			? withNewA.collection
// 			: withNewA.collection.setAt(index2, previousA);

// 		return {
// 			collection: withSwapped,
// 			hasResult: true,
// 			result: [previousA, previousB],
// 			hasChanged: col !== withSwapped,
// 		};
// 	}

// 	throwInvalidStateError();
// }

// export function defaultPadTo<
// 	E,
// 	C extends Collection.Advanced.WithCapabilities<
// 		IndexedCollection.NonEmpty<E>,
// 		IndexedCollection.Capability.WithRepeat<E> &
// 			IndexedCollection.Capability.WithSpliceAt<E>
// 	>,
// >(
// 	col: C,
// 	size: number,
// 	fill: E,
// 	options: { paddingLeftBias?: number | undefined } = {},
// ): C[TypesKey]['_SELF'] {
// 	Int.checkAtLeastZero(size);

// 	if (col.size >= size) return col;

// 	const diff = size - col.size;

// 	const { paddingLeftBias = 0 } = options;

// 	const frac = Math.max(0, Math.min(1.0, paddingLeftBias));
// 	const frontSize = Math.round(diff * frac);
// 	const pad = col.context.of(fill).repeat(diff);

// 	return pad.spliceAt(frontSize, { insert: col });
// }

// export function defaultRepeat<
// 	E,
// 	C extends Collection.Advanced.WithCapabilities<
// 		IndexedCollection<E>,
// 		IndexedCollection.Capability.WithConcat<E>
// 	>,
// >(col: C, amount: number): C[TypesKey]['_NORMAL'] {
// 	Int.checkAtLeastZero(amount);

// 	if (amount === 0) {
// 		return col.context.empty();
// 	}
// 	if (amount === 1) {
// 		return col;
// 	}

// 	// repeat by doubling: `half` holds 2 * (amount >>> 1) copies
// 	const half = defaultRepeat(col.concat(col), amount >>> 1);

// 	return amount % 2 === 0 ? half : col.concat(half);
// }
