import type {
	Collection,
	IndexedCollection,
	IndexedKeyedCollection,
	IndexedValuedCollection,
	KeyedCollection,
	ValuedCollection,
} from '@rimbu/collection-types/capabilities';
import type { Op, TypesKey } from '@rimbu/collection-types/types';
import type { FastIterator } from '@rimbu/stream/stream-types';

import {
	EmptyCollectionAssumedNonEmptyError,
	Int,
	throwInvalidStateError,
	throwModifiedBuilderWhileLoopingOverItError,
} from '@rimbu/base';
import {
	type ArrayNonEmpty,
	CollectFun,
	Err,
	IndexRange,
	OptLazy,
	TraverseState,
} from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

export abstract class CollectionEmptyBase<T>
	implements
		Collection<T>,
		Collection.Capability.WithCollect<T>,
		Collection.Capability.WithConcat<T>,
		Collection.Capability.WithFilter<T>,
		Collection.Capability.WithMap<T>,
		Collection.Capability.WithMutate<T>,
		Collection.Capability.WithRecompose<T>
{
	declare readonly [TypesKey]: Collection.Advanced.Types<T>;

	abstract readonly context: Collection.Advanced.ContextBase<
		Collection.Advanced.Types<T>
	>;

	[Symbol.iterator](): FastIterator<T> {
		return Stream.empty<T>()[Symbol.iterator]();
	}

	get isEmpty(): true {
		return true;
	}

	get size(): 0 {
		return 0;
	}

	nonEmpty(): this is this[TypesKey]['_NON_EMPTY'] {
		return false;
	}

	assumeNonEmpty(): never {
		throw new EmptyCollectionAssumedNonEmptyError();
	}

	concat(
		...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
	): this[TypesKey]['_NON_EMPTY'];
	concat(
		...sources: ArrayNonEmpty<StreamSource<T>>
	): this[TypesKey]['_NORMAL'] {
		return this.context.from(...sources) as this[TypesKey]['_NON_EMPTY'];
	}

	flatMap(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	stream(): Stream<T> {
		return Stream.empty<T>();
	}

	forEach(): void {}

	forEachIndexed(): void {}

	filter(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	collect<E2>(): (this[TypesKey] & {
		_NEW_E: E2;
	})['_NEW_TYPES']['_NORMAL'] {
		return this;
	}

	recompose<E2>(
		f: (stream: Stream<T>) => StreamSource<E2>,
	): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'] {
		return this.context.from(f(Stream.empty()));
	}

	mutate(
		f: (builder: this[TypesKey]['_BUILDER']) => void,
	): this[TypesKey]['_NORMAL'] {
		const builder = this.context.builder<T>();
		f(builder);
		return builder.build();
	}

	map<T2>(): (this[TypesKey] & {
		_NEW_E: T2;
	})['_NEW_TYPES']['_NORMAL'] {
		return this;
	}

	toArray(): [] {
		return [];
	}

	toBuilder(): this[TypesKey]['_BUILDER'] {
		return this.context.builder();
	}
}

export abstract class CollectionNonEmptyBase<T>
	implements
		Collection.NonEmpty<T>,
		Collection.Capability.WithMutate<T>,
		Collection.Capability.WithRecompose<T>
{
	declare readonly [TypesKey]: Collection.Advanced.TypesNonEmpty<T>;

	abstract readonly context: Collection.Advanced.ContextBase<
		Collection.Advanced.TypesNonEmpty<T>
	>;

	abstract get size(): number;
	abstract stream(): Stream.NonEmpty<T>;
	abstract forEach(f: (value: T) => void): void;
	abstract toArray(): ArrayNonEmpty<T>;
	abstract toBuilder(): this[TypesKey]['_BUILDER'];

	[Symbol.iterator](): FastIterator<T> {
		return this.stream()[Symbol.iterator]();
	}

	get isEmpty(): false {
		return false;
	}

	nonEmpty(): this is this[TypesKey]['_NON_EMPTY'] {
		return true;
	}

	assumeNonEmpty(): this[TypesKey]['_NON_EMPTY'] {
		return this;
	}

	asNormal(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	forEachIndexed(
		f: (value: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		const haltSymbol = Symbol();

		try {
			this.forEach((value) => {
				f(value, state.nextIndex(), state.halt);

				if (state.halted) {
					throw haltSymbol;
				}
			});
		} catch (err) {
			if (haltSymbol !== err) {
				throw err;
			}
		}
	}

	recompose<T2 extends this[TypesKey]['_UPPER_E']>(
		f: (stream: Stream.NonEmpty<T>) => StreamSource.NonEmpty<T2>,
	): (this[TypesKey] & { _NEW_E: T2 })['_NEW_TYPES']['_NON_EMPTY'];
	recompose<T2 extends this[TypesKey]['_UPPER_E']>(
		f: (stream: Stream.NonEmpty<T>) => StreamSource<T2>,
	): (this[TypesKey] & { _NEW_E: T2 })['_NEW_TYPES']['_NON_EMPTY'] {
		return this.context.from(f(this.stream())) as any;
	}

	mutate(
		f: (builder: this[TypesKey]['_BUILDER']) => void,
	): this[TypesKey]['_NORMAL'] {
		const builder = this.toBuilder();
		f(builder);
		return builder.build();
	}
}

export abstract class CollectionBuilderBase<T>
	implements Collection.Builder<T>
{
	declare readonly [TypesKey]: Collection.Advanced.Types<T>;

	abstract readonly context: Collection.Advanced.ContextBase<
		Collection.Advanced.Types<T>
	>;

	abstract get size(): number;
	abstract clear(): void;
	abstract forEach(f: (value: T) => void): void;
	abstract build(): this[TypesKey]['_NORMAL'];

	#iterationDepth = 0;

	checkLock(): void {
		if (this.#iterationDepth) {
			throwModifiedBuilderWhileLoopingOverItError();
		}
	}

	startIteration(): void {
		this.#iterationDepth++;
	}

	endIteration(): void {
		this.#iterationDepth--;
	}

	get isEmpty(): boolean {
		return 0 === this.size;
	}

	forEachIndexed(
		f: (value: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		const haltSymbol = Symbol();

		try {
			this.forEach((value) => {
				f(value, state.nextIndex(), state.halt);

				if (state.halted) {
					throw haltSymbol;
				}
			});
		} catch (err) {
			if (haltSymbol !== err) {
				throw err;
			}
		}
	}
}

export abstract class IndexedCollectionEmptyBase<T>
	extends CollectionEmptyBase<T>
	implements
		IndexedCollection<T>,
		IndexedCollection.Capability.WithCollectIndexed<T>,
		IndexedCollection.Capability.WithFlatMapIndexed<T>,
		IndexedCollection.Capability.WithFilterIndexed<T>,
		IndexedCollection.Capability.WithMapIndexed<T>,
		IndexedCollection.Capability.WithPrependAppend<T>,
		IndexedCollection.Capability.WithRepeat<T>,
		IndexedCollection.Capability.WithRemoveAt<T>,
		IndexedCollection.Capability.WithReversed<T>,
		IndexedCollection.Capability.WithRotate<T>,
		IndexedCollection.Capability.WithSwapAt<T>,
		IndexedCollection.Capability.WithUpdateAt<T>
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

export abstract class ValuedCollectionEmptyBase<T>
	extends CollectionEmptyBase<T>
	implements ValuedCollection<T>
{
	declare readonly [TypesKey]: ValuedCollection.Advanced.Types<T>;

	abstract readonly context: Collection.Advanced.ContextBase<
		ValuedCollection.Advanced.Types<T>
	>;

	has(): false {
		return false;
	}
}

export abstract class ValuedCollectionNonEmptyBase<T>
	extends CollectionNonEmptyBase<T>
	implements ValuedCollection.NonEmpty<T>
{
	declare readonly [TypesKey]: ValuedCollection.Advanced.TypesNonEmpty<T>;

	abstract readonly context: Collection.Advanced.ContextBase<
		ValuedCollection.Advanced.TypesNonEmpty<T>
	>;

	abstract has(value: T): boolean;
}

export abstract class KeyedCollectionEmptyBase<K, V>
	extends CollectionEmptyBase<readonly [K, V]>
	implements
		KeyedCollection<K, V>,
		KeyedCollection.Capability.WithMapValues<K, V>
{
	declare readonly [TypesKey]: KeyedCollection.Advanced.Types<K, V>;

	abstract readonly context: Collection.Advanced.ContextBase<
		KeyedCollection.Advanced.Types<K, V>
	>;

	get<O>(_: K, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	has(): false {
		return false;
	}

	streamKeys(): Stream<K> {
		return Stream.empty<K>();
	}

	streamValues(): Stream<V> {
		return Stream.empty<V>();
	}

	mapValues<V2>(): (this[TypesKey] & {
		_NEW_V: V2;
	})['_NEW_TYPES']['_SELF'] {
		return this as any;
	}
}

function first<T>(tuple: readonly [T, unknown]): T {
	return tuple[0];
}

function second<T>(tuple: readonly [unknown, T]): T {
	return tuple[1];
}

export abstract class KeyedCollectionNonEmptyBase<K, V>
	extends CollectionNonEmptyBase<readonly [K, V]>
	implements KeyedCollection.NonEmpty<K, V>
{
	declare readonly [TypesKey]: KeyedCollection.Advanced.TypesNonEmpty<K, V>;

	abstract readonly context: Collection.Advanced.ContextBase<
		KeyedCollection.Advanced.TypesNonEmpty<K, V>
	>;

	abstract get<UK, O>(key: UK, otherwise?: OptLazy<O>): O | V;

	has(key: K): boolean {
		const none = Symbol();
		return none !== this.get(key, none);
	}

	streamKeys(): Stream.NonEmpty<K> {
		return this.stream().map(first);
	}

	streamValues(): Stream.NonEmpty<V> {
		return this.stream().map(second);
	}
}

export abstract class IndexedValuedCollectionEmptyBase<T>
	extends IndexedCollectionEmptyBase<T>
	implements IndexedValuedCollection<T>
{
	declare readonly [TypesKey]: IndexedValuedCollection.Advanced.Types<T>;

	abstract readonly context: Collection.Advanced.ContextBase<
		IndexedValuedCollection.Advanced.Types<T>
	>;

	has(): false {
		return false;
	}

	indexOf<O>(_: T, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}
}

export abstract class IndexedValuedCollectionNonEmptyBase<T>
	extends IndexedCollectionNonEmptyBase<T>
	implements IndexedValuedCollection.NonEmpty<T>
{
	declare readonly [TypesKey]: IndexedValuedCollection.Advanced.TypesNonEmpty<T>;

	abstract readonly context: Collection.Advanced.ContextBase<
		IndexedValuedCollection.Advanced.TypesNonEmpty<T>
	>;

	abstract has(value: T): boolean;
	abstract indexOf<O>(value: T, otherwise?: OptLazy<O>): number | O;
}

export abstract class IndexedKeyedCollectionEmptyBase<K, V>
	extends IndexedCollectionEmptyBase<readonly [K, V]>
	implements IndexedKeyedCollection<K, V>
{
	declare readonly [TypesKey]: IndexedKeyedCollection.Advanced.Types<K, V>;

	abstract readonly context: Collection.Advanced.ContextBase<
		IndexedKeyedCollection.Advanced.Types<K, V>
	>;

	get<O>(_: K, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	has(): false {
		return false;
	}

	indexOf<O>(_: K, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	streamKeys(): Stream<K> {
		return Stream.empty<K>();
	}

	streamValues(): Stream<V> {
		return Stream.empty<V>();
	}
}

export abstract class IndexedKeyedCollectionNonEmptyBase<K, V>
	extends IndexedCollectionNonEmptyBase<readonly [K, V]>
	implements IndexedKeyedCollection.NonEmpty<K, V>
{
	declare readonly [TypesKey]: IndexedKeyedCollection.Advanced.TypesNonEmpty<
		K,
		V
	>;

	abstract readonly context: Collection.Advanced.ContextBase<
		IndexedKeyedCollection.Advanced.TypesNonEmpty<K, V>
	>;
	abstract get<UK, O>(key: UK, otherwise?: OptLazy<O>): O | V;

	has(key: K): boolean {
		const none = Symbol();
		return none !== this.get(key, none);
	}

	abstract indexOf<UK, O>(key: UK, otherwise?: OptLazy<O>): number | O;

	streamKeys(): Stream.NonEmpty<K> {
		return this.stream().map(first);
	}

	streamValues(): Stream.NonEmpty<V> {
		return this.stream().map(second);
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

export function defaultRepeat<
	E,
	C extends Collection<E> &
		Collection.Capability.WithConcat<E> & {
			[TypesKey]: { _SELF: C };
		},
>(col: C, amount: number): C[TypesKey]['_NORMAL'] {
	Int.checkAtLeastZero(amount);

	if (amount === 0) {
		return col.context.empty();
	}
	if (amount === 1) {
		return col;
	}

	// repeat by doubling: `half` holds 2 * (amount >>> 1) copies
	const half = defaultRepeat(col.concat(col), amount >>> 1);

	return amount % 2 === 0 ? half : col.concat(half);
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

export function defaultFlatMap<
	E,
	C extends Collection<E> &
		Collection.Capability.WithConcat<E> & {
			[TypesKey]: { _SELF: C };
		},
>(col: C, f: (element: E) => StreamSource<E>): C[TypesKey]['_NORMAL'] {
	const token = Symbol();
	const iterator = col[Symbol.iterator]();

	let result = col.context.empty<E>() as C;
	let element: E | typeof token;

	while (token !== (element = iterator.fastNext(token))) {
		result = result.concat(f(element));
	}

	return result;
}

export function defaultFlatMapIndexed<
	E,
	C extends Collection<E> &
		Collection.Capability.WithConcat<E> & {
			[TypesKey]: { _SELF: C };
		},
>(
	col: C,
	f: (element: E, index: number) => StreamSource<E>,
	options: { indexOffset?: number | undefined } = {},
): C[TypesKey]['_NORMAL'] {
	const { indexOffset = 0 } = options;
	let index = indexOffset;

	return defaultFlatMap<E, C>(col, (element) => f(element, index++));
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

export interface DefaultPadToTypes<E>
	extends IndexedCollection.Advanced.TypesNonEmpty<E> {
	_NON_EMPTY: IndexedCollection.NonEmpty<E> &
		IndexedCollection.Capability.WithRepeat<E>;

	_NEW_TYPES: DefaultPadToTypes<this['_NEW_E']>;
}

export function defaultPadTo<
	E,
	C extends IndexedCollection.NonEmpty<E, DefaultPadToTypes<E>> &
		IndexedCollection.Capability.WithSpliceAt<E>,
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
	const pad = col.context.of(fill).repeat(diff) as C;

	return pad.spliceAt(frontSize, { insert: col });
}
