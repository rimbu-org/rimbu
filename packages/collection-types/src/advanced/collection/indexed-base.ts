import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { Op } from '@rimbu/collection-types/types';

import { Int, throwInvalidStateError } from '@rimbu/base';
import {
	type CollectionEmptyBase,
	CollectionNonEmptyBase,
	type Constructor,
	type EmptyCapability,
	type EmptyConstructor,
} from '@rimbu/collection-types/advanced/collection-base';
import { type ArrayNonEmpty, Err, IndexRange, OptLazy } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

export interface IndexedCollectionEmptyBase<
	E,
	Tp extends Collection.Advanced.TypesBase,
> extends IndexedCollection.Advanced.Api<E, Tp>,
		IndexedCollection.Capability.WithConcat.Api<E, Tp>,
		IndexedCollection.Capability.WithInsertAt.Api<E, Tp>,
		IndexedCollection.Capability.WithPrependAppend.Api<E, Tp>,
		IndexedCollection.Capability.WithRemoveAt.Api<E, Tp>,
		IndexedCollection.Capability.WithSwapAt.Api<E, Tp>,
		IndexedCollection.Capability.WithUpdateAt.Api<E, Tp> {}

/**
 * The capability contributed by {@link WithIndexedCollectionEmptyBase}.
 */
export interface IndexedEmptyCapability extends EmptyCapability {
	_API: IndexedCollectionEmptyBase<this['_E'], this['_TP']>;
}

/**
 * Adds the indexed-collection API to an empty collection base constructor.
 */
export function WithIndexedCollectionEmptyBase<C extends EmptyCapability>(
	Base: EmptyConstructor<C>,
): EmptyConstructor<C & IndexedEmptyCapability>;
export function WithIndexedCollectionEmptyBase<
	TBase extends Constructor<CollectionEmptyBase<E, FAM, Tp>>,
	E,
	FAM extends Collection.Advanced.Family<E> = Collection.Advanced.Family<E>,
	Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
		FAM,
		E
	>,
>(Base: TBase): TBase & Constructor<IndexedCollectionEmptyBase<E, Tp>> {
	return class extends Base {
		streamSlice(): Stream<E> {
			return Stream.empty<E>();
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

		take(): this {
			return this;
		}

		drop(): this {
			return this;
		}

		prepend(element: E): FAM['_NON_EMPTY'] {
			return this.context.of(element);
		}

		append(element: E): FAM['_NON_EMPTY'] {
			return this.context.of(element);
		}

		concat(
			...sources: ArrayNonEmpty<StreamSource.NonEmpty<E>>
		): Tp['_NON_EMPTY'];
		concat(...sources: ArrayNonEmpty<StreamSource<E>>): Tp['_NORMAL'] {
			return this.context.from(...sources);
		}

		insertAt(_index: number, elements: StreamSource<E>): Tp['_NON_EMPTY'] {
			return this.context.from(elements) as Tp['_NON_EMPTY'];
		}

		splitAt(): [this, this] {
			return [this, this];
		}

		slice(): this {
			return this;
		}

		removeAt(): this {
			return this;
		}

		removeAtAndReturn(): Op.WithResult<Tp['_NORMAL'], Tp['_NORMAL'], false> {
			return {
				collection: this,
				hasResult: false,
				result: this,
				hasChanged: false,
			};
		}

		reversed(): this {
			return this;
		}

		setAt(): this {
			return this;
		}

		setAtAndReturn(): Op.WithResult<Tp['_NORMAL'], undefined, false> {
			return {
				collection: this,
				hasResult: false,
				result: undefined,
				hasChanged: false,
			};
		}

		rotateLeft(): this {
			return this;
		}

		repeat(): this {
			return this;
		}

		updateAt(): this {
			return this;
		}

		updateAtAndReturn(): Op.WithResult<
			Tp['_NORMAL'],
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

		swapAt(): this {
			return this;
		}

		swapAtAndReturn(): Op.WithResult<
			Tp['_NORMAL'],
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
	};
}

export abstract class IndexedCollectionNonEmptyBase<
		E,
		FAM extends
			IndexedCollection.Advanced.Family<E> = IndexedCollection.Advanced.Family<E>,
		Tp extends Collection.Advanced.TypesNonEmpty<
			FAM,
			E
		> = Collection.Advanced.TypesNonEmpty<FAM, E>,
	>
	extends CollectionNonEmptyBase<E, FAM, Tp>
	implements IndexedCollection.Advanced.Api<E, Tp>
{
	abstract streamSlice(
		range: IndexRange,
		options?: { reversed?: boolean },
	): Stream<E>;
	abstract at<O>(index: number, otherwise?: OptLazy<O>): E | O;
	abstract first(): E | undefined;
	abstract first<O>(otherwise?: OptLazy<O>): E | O;
	abstract last(): E | undefined;
	abstract last<O>(otherwise?: OptLazy<O>): E | O;

	abstract take<const N extends number>(
		amount: N,
	): 0 extends N ? Tp['_NORMAL'] : Tp['_NON_EMPTY'];
	abstract drop(count: number): Tp['_NORMAL'];

	slice(range: IndexRange): Tp['_NORMAL'] {
		const result = IndexRange.getIndicesFor(range, this.size);

		if (result === 'all') {
			return this;
		}

		if (result === 'empty') return this.context.empty();

		const [start, end] = result;
		const values = this.drop(start).take(end - start + 1);

		return values;
	}

	splitAt<const N extends number>(
		index: N,
	): [0 extends N ? Tp['_NORMAL'] : Tp['_NON_EMPTY'], Tp['_NORMAL']] {
		const left = this.take(index);
		const right = this.drop(index);

		return [left, right];
	}
}

export function defaultFlatMapByConcat<
	E,
	E2,
	Tp extends IndexedCollection.Capability.WithConcat<E> &
		Collection.Advanced.NonEmptyKind<E>,
	C extends Collection.Advanced.Api<E, Tp>,
>(
	col: C,
	f: (element: E) => StreamSource<E2>,
): Collection.Advanced.ReTyped<Tp, E2>['_NORMAL'] {
	const token = Symbol();
	const iterator = col[Symbol.iterator]();

	let result = col.context.empty<E2>();
	let element: E | typeof token;

	while (token !== (element = iterator.fastNext(token))) {
		result = result.concat(f(element));
	}

	return result;
}

export function defaultSpliceAtAndReturn<
	E,
	C extends IndexedCollection.NonEmpty<E, FAM>,
	FAM extends IndexedCollection.Capability.WithSpliceAt<E> &
		IndexedCollection.Capability.WithConcat<E>,
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
	FAM['_NON_EMPTY'],
	[removed: FAM['_NORMAL'], inserted: FAM['_NORMAL']],
	[removed: FAM['_NORMAL'], inserted: FAM['_NORMAL']],
	FAM['_NORMAL']
> {
	const { removeAmount = 0, insert } = options;

	Int.checkAtLeastZero(removeAmount);

	const insertList = col.context.from(insert);

	if (index < 0) {
		index = col.size + index;
		if (index < 0) {
			index = 0;
		}
	}

	if (index >= col.size) {
		return {
			collection: col.concat(insertList),
			hasResult: insertList.nonEmpty(),
			result: [col.context.empty(), insertList],
			hasChanged: insertList.nonEmpty(),
		};
	}

	const [left, remain] = col.splitAt(index);
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

export function defaultRemoveAtAndReturn<
	E,
	C extends IndexedCollection.NonEmpty<E, FAM>,
	FAM extends IndexedCollection.Capability.WithSpliceAt<E>,
>(
	col: C,
	index: number,
	amount = 1,
): Op.DynamicResult<
	FAM['_NON_EMPTY'],
	FAM['_NORMAL'],
	FAM['_NON_EMPTY'],
	FAM['_NORMAL']
> {
	const outcome = col.spliceAtAndReturn(index, {
		removeAmount: amount,
	});

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

export function defaultSwapAtAndReturn<
	E,
	C extends IndexedCollection.NonEmpty<E, FAM>,
	FAM extends IndexedCollection.Capability.WithSwapAt<E> &
		IndexedCollection.Capability.WithUpdateAt<E>,
>(
	col: C,
	index1: number,
	index2: number,
): Op.DynamicResult<
	FAM['_NON_EMPTY'],
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
			: withNewA.collection.setAt(index2, previousA);

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
	C extends IndexedCollection.NonEmpty<E, FAM>,
	FAM extends IndexedCollection.Capability.WithConcat<E> &
		IndexedCollection.Capability.WithSpliceAt<E>,
>(
	col: C,
	size: number,
	fill: E,
	options: { paddingLeftBias?: number | undefined } = {},
): FAM['_NON_EMPTY'] {
	Int.checkAtLeastZero(size);

	if (col.size >= size) return col;

	const diff = size - col.size;

	const { paddingLeftBias = 0 } = options;

	const frac = Math.max(0, Math.min(1.0, paddingLeftBias));
	const frontSize = Math.round(diff * frac);
	const pad = col.context.of(fill).repeat(diff);

	return pad.spliceAt(frontSize, { insert: col });
}

export function defaultRepeat<
	E,
	C extends Collection.NonEmpty<E, FAM>,
	FAM extends IndexedCollection.Capability.WithConcat<E>,
>(col: C, amount: number): FAM['_NORMAL'] {
	Int.checkAtLeastZero(amount);

	if (amount === 0) {
		return col.context.empty();
	}
	if (amount === 1) {
		return col;
	}

	// repeat by doubling: `half` holds 2 * (amount >>> 1) copies
	const half = defaultRepeat<E, C, FAM>(col.concat(col) as C, amount >>> 1);

	return amount % 2 === 0 ? half : col.concat(half);
}

export function defaultReducerByAppend<
	E,
	FAM extends Collection.Capability.WithToBuilder<E> &
		IndexedCollection.Capability.WithPrependAppend<E>,
>(
	context: IndexedCollection.Context<FAM>,
	source?: StreamSource<E>,
): Reducer<E, FAM['_NORMAL']> {
	return Reducer.create(
		() =>
			undefined === source
				? context.builder<E>()
				: context.from(source).toBuilder(),
		(builder, element) => {
			builder.append(element);
			return builder;
		},
		(builder) => builder.build(),
	);
}
