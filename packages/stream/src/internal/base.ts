import type { CollectFun } from '@rimbu/common/collect';
import type { ArrayNonEmpty, ToJSON } from '@rimbu/common/types';
import type { FastIterator, Stream, StreamSource } from '@rimbu/stream';

import * as RimbuError from '@rimbu/base/rimbu-error';
import { Comp } from '@rimbu/common/comp';
import { Eq } from '@rimbu/common/eq';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Reducer } from '@rimbu/stream/reducer';
import { Transformer } from '@rimbu/stream/transformer';

import { StreamFactory } from '#stream/factory';
import {
	AlwaysIterator,
	AppendIterator,
	ArrayIterator,
	ArrayReverseIterator,
	CollectIterator,
	ConcatIterator,
	DropIterator,
	DropWhileIterator,
	FilterApplyIterator,
	FilterIterator,
	FilterPureIterator,
	IndexedIterator,
	MapApplyIterator,
	MapIterator,
	MapPureIterator,
	PrependIterator,
	RangeDownIterator,
	RangeUpIterator,
	ReducerFastIterator,
	RepeatIterator,
	TakeIterator,
	TransformerFastIterator,
} from '#stream/fast-iterator-base';
import { FastIteratorFactory } from '#stream/fast-iterator-factory';

/**
 * A reusable base implementation for `Stream` that provides all high-level operations
 * in terms of a `FastIterator` returned from `[Symbol.iterator]`.
 *
 * Custom stream implementations in `@rimbu/stream/custom` extend this class.
 * @typeparam T - the element type
 */
export abstract class StreamBase<T> implements Stream<T> {
	abstract [Symbol.iterator](): FastIterator<T>;

	stream(): this {
		return this;
	}

	equals(
		other: StreamSource<T>,
		{ eq = Eq.objectIs, negate = false }: { eq?: Eq<T>; negate?: boolean } = {},
	): boolean {
		const it1 = this[Symbol.iterator]();
		const it2 = StreamFactory().fromStreamSource(other)[Symbol.iterator]();
		const done = Symbol('Done');

		while (true) {
			const v1 = it1.fastNext(done);
			const v2 = it2.fastNext(done);

			if (done === v1 || done === v2) {
				return Object.is(v1, v2);
			}

			if (eq(v1, v2) === negate) {
				return false;
			}
		}
	}

	assumeNonEmpty(): Stream.NonEmpty<T> {
		return this as unknown as Stream.NonEmpty<T>;
	}

	asNormal(): Stream<T> {
		return this;
	}

	prepend(value: OptLazy<T>): Stream.NonEmpty<T> {
		return new PrependStream<T>(this, value).assumeNonEmpty();
	}

	append(value: OptLazy<T>): Stream.NonEmpty<T> {
		return new AppendStream<T>(this, value).assumeNonEmpty();
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		const done = Symbol('Done');
		let value: T | typeof done;
		const iterator = this[Symbol.iterator]();

		const { halt } = state;

		while (!state.halted && done !== (value = iterator.fastNext(done))) {
			f(value, state.nextIndex(), halt);
		}
	}

	forEachPure<A extends readonly unknown[]>(
		f: (value: T, ...args: A) => void,
		...args: A
	): void {
		const done = Symbol('Done');
		let value: T | typeof done;
		const iterator = this[Symbol.iterator]();

		while (done !== (value = iterator.fastNext(done))) {
			f(value, ...args);
		}
	}

	indexed(options: { startIndex?: number } = {}): Stream<[number, T]> {
		const { startIndex = 0 } = options;

		return new IndexedStream(this, startIndex);
	}

	filter(
		pred: (value: T, index: number, halt: () => void) => boolean,
		options: { negate?: boolean | undefined } = {},
	): any {
		const { negate = false } = options;

		return new FilterStream(this, pred, negate) as any;
	}

	filterPure<A extends readonly unknown[]>(
		options: {
			pred: (value: T, ...args: A) => boolean;
			negate?: boolean | undefined;
		},
		...args: A
	): any {
		const { pred, negate = false } = options;

		return new FilterPureStream(this, pred, args, negate) as any;
	}

	withOnly<F extends T>(values: F[]): Stream<F> {
		if (values.length <= 0) {
			return StreamFactory().empty();
		}

		const set = new Set<T>(values);

		return this.filterPure({ pred: (v) => set.has(v) });
	}

	without<F extends T>(values: F[]): any {
		if (values.length <= 0) {
			return this as any;
		}

		const set = new Set<T>(values);

		return this.filterPure({ pred: (v) => set.has(v), negate: true });
	}

	map<T2>(mapFun: (value: T, index: number) => T2): Stream<T2> {
		return new MapStream<T, T2>(this, mapFun);
	}

	mapPure<T2, A extends readonly unknown[]>(
		mapFun: (value: T, ...args: A) => T2,
		...args: A
	): Stream<T2> {
		return new MapPureStream<T, A, T2>(this, mapFun, args);
	}

	collect<R>(collectFun: CollectFun<T, R>): Stream<R> {
		return new CollectStream<T, R>(this, collectFun);
	}

	flatMap<T2>(
		flatMapFun: (value: T, index: number, halt: () => void) => StreamSource<T2>,
	): Stream<T2> {
		return this.transform(Transformer.flatMap(flatMapFun));
	}

	flatZip<T2>(
		flatMapFun: (value: T, index: number, halt: () => void) => StreamSource<T2>,
	): Stream<[T, T2]> {
		return this.transform(Transformer.flatZip(flatMapFun));
	}

	transform<R>(transformer: Transformer<T, R>): Stream<R> {
		return new TransformerStream(this, transformer);
	}

	first<O>(otherwise?: OptLazy<O>): T | O {
		return this[Symbol.iterator]().fastNext(otherwise as OptLazy<O>);
	}

	last<O>(otherwise?: OptLazy<O>): T | O {
		const done = Symbol('Done');
		let value: T | typeof done;
		let lastValue: T | typeof done = done;
		const iterator = this[Symbol.iterator]();

		while (done !== (value = iterator.fastNext(done))) {
			lastValue = value;
		}

		if (done === lastValue) {
			return OptLazy(otherwise) as O;
		}

		return lastValue;
	}

	single<O>(otherwise?: OptLazy<O>): T | O {
		const iterator = this[Symbol.iterator]();
		const done = Symbol('Done');

		const value = iterator.fastNext(done);

		if (done !== value) {
			if (done === iterator.fastNext(done)) {
				return value;
			}
		}

		return OptLazy(otherwise!);
	}

	count(): number {
		let result = 0;

		const done = Symbol('Done');
		const iterator = this[Symbol.iterator]();

		while (done !== iterator.fastNext(done)) {
			result++;
		}

		return result;
	}

	countElement(
		value: T,
		options: { eq?: Eq<T>; negate?: boolean } = {},
	): number {
		const { eq = Eq.objectIs, negate = false } = options;

		let result = 0;

		const done = Symbol('Done');
		const iterator = this[Symbol.iterator]();
		let current: T | typeof done;

		while (done !== (current = iterator.fastNext(done))) {
			if (eq(value, current) !== negate) {
				result++;
			}
		}

		return result;
	}

	find<O>(
		pred: (value: T, index: number) => boolean,
		options: {
			occurrence?: number | undefined;
			negate?: boolean | undefined;
			otherwise?: OptLazy<O>;
		} = {},
	): T | O {
		const { occurrence = 1, negate = false, otherwise } = options;

		if (occurrence <= 0) {
			return OptLazy(otherwise) as O;
		}

		const done = Symbol('Done');
		const iterator = this[Symbol.iterator]();
		let value: T | typeof done;
		let remain = occurrence;
		let index = 0;

		while (done !== (value = iterator.fastNext(done))) {
			if (pred(value, index++) !== negate && --remain <= 0) {
				return value;
			}
		}

		return OptLazy(otherwise) as O;
	}

	at<O>(index: number, otherwise?: OptLazy<O>): T | O {
		if (index < 0) {
			return OptLazy(otherwise) as O;
		}

		const done = Symbol('Done');
		const iterator = this[Symbol.iterator]();
		let value: T | typeof done;
		let i = 0;

		while (i <= index && done !== (value = iterator.fastNext(done))) {
			if (i === index) {
				return value;
			}
			i++;
		}

		return OptLazy(otherwise) as O;
	}

	indicesWhere(
		pred: (value: T) => boolean,
		options: { negate?: boolean } = {},
	): Stream<number> {
		return this.transform(Transformer.indicesWhere(pred, options));
	}

	indicesOf(
		searchValue: T,
		options: { eq?: Eq<T>; negate?: boolean } = {},
	): Stream<number> {
		return this.transform(Transformer.indicesOf(searchValue, options));
	}

	indexWhere(
		pred: (value: T, index: number) => boolean,
		options: {
			occurrence?: number;
			negate?: boolean;
		} = {},
	): number | undefined {
		const { occurrence = 1, negate = false } = options;

		if (occurrence <= 0) {
			return undefined;
		}

		const done = Symbol('Done');
		let value: T | typeof done;
		const iterator = this[Symbol.iterator]();
		let index = 0;
		let occ = 0;

		while (done !== (value = iterator.fastNext(done))) {
			const i = index++;

			if (pred(value, i) !== negate) {
				occ++;
				if (occ >= occurrence) {
					return i;
				}
			}
		}

		return undefined;
	}

	indexOf(
		searchValue: T,
		options: {
			occurrence?: number | undefined;
			eq?: Eq<T> | undefined;
			negate?: boolean | undefined;
		} = {},
	): number | undefined {
		const { occurrence = 1 } = options;

		if (occurrence <= 0) {
			return undefined;
		}

		const { eq = Eq.objectIs, negate = false } = options;

		const done = Symbol('Done');
		let value: T | typeof done;
		const iterator = this[Symbol.iterator]();
		let index = 0;
		let occ = 0;

		while (done !== (value = iterator.fastNext(done))) {
			const i = index++;

			if (eq(value, searchValue) !== negate) {
				occ++;

				if (occ >= occurrence) {
					return i;
				}
			}
		}

		return undefined;
	}

	some(
		pred: (value: T, index: number) => boolean,
		options: { negate?: boolean } = {},
	): boolean {
		return undefined !== this.indexWhere(pred, options);
	}

	every(
		pred: (value: T, index: number) => boolean,
		options: { negate?: boolean } = {},
	): boolean {
		const { negate = false } = options;

		return undefined === this.indexWhere(pred, { negate: !negate });
	}

	contains(
		searchValue: T,
		options: { amount?: number; eq?: Eq<T>; negate?: boolean } = {},
	): boolean {
		const { amount = 1 } = options;

		if (amount <= 0) {
			return true;
		}

		const { eq, negate } = options;

		return (
			undefined !==
			this.indexOf(searchValue, { occurrence: amount, eq, negate })
		);
	}

	containsSlice(
		source: StreamSource.NonEmpty<T>,
		options: { eq?: Eq<T>; amount?: number } = {},
	): boolean {
		return this.reduce(Reducer.containsSlice(source, options));
	}

	takeWhile(
		pred: (value: T, index: number) => boolean,
		options: { negate?: boolean } = {},
	): Stream<T> {
		const { negate = false } = options;

		return this.filter((value, index, halt) => {
			const result = pred(value, index) !== negate;

			if (!result) {
				halt();
			}

			return result;
		});
	}

	dropWhile(
		pred: (value: T, index: number) => boolean,
		options: { negate?: boolean } = {},
	): Stream<T> {
		const { negate = false } = options;

		return new DropWhileStream<T>(this, pred, negate);
	}

	take(amount: number): Stream<T> {
		if (amount <= 0) {
			return StreamFactory().empty();
		}

		return new TakeStream<T>(this, amount);
	}

	drop(amount: number): Stream<T> {
		if (amount <= 0) {
			return this;
		}

		return new DropStream<T>(this, amount);
	}

	repeat(amount?: number): Stream<T> {
		if (undefined !== amount && amount <= 1) {
			return this;
		}

		return new FromStream<T>(() => new RepeatIterator<T>(this, amount));
	}

	concat(...others: ArrayNonEmpty<StreamSource<T>>): Stream.NonEmpty<T> {
		if (others.every(StreamFactory().isEmptyStreamSourceInstance)) {
			return this.assumeNonEmpty();
		}

		return new ConcatStream<T>(this, others).assumeNonEmpty();
	}

	min<O>(otherwise?: OptLazy<O>): T | O {
		return this.minBy(Comp.defaultInstance.compare, otherwise);
	}

	minBy<O>(compare: (v1: T, v2: T) => number, otherwise?: OptLazy<O>): T | O {
		const done = Symbol('Done');
		const iterator = this[Symbol.iterator]();
		let result: T | typeof done = iterator.fastNext(done);

		if (done === result) return OptLazy(otherwise) as O;

		let value: T | typeof done;
		while (done !== (value = iterator.fastNext(done))) {
			if (compare(value, result) < 0) result = value;
		}

		return result;
	}

	max<O>(otherwise?: OptLazy<O>): T | O {
		return this.maxBy(Comp.defaultInstance.compare, otherwise);
	}

	maxBy<O>(compare: (v1: T, v2: T) => number, otherwise?: OptLazy<O>): T | O {
		const done = Symbol('Done');
		const iterator = this[Symbol.iterator]();
		let result: T | typeof done = iterator.fastNext(done);

		if (done === result) return OptLazy(otherwise) as O;

		let value: T | typeof done;
		while (done !== (value = iterator.fastNext(done))) {
			if (compare(value, result) > 0) result = value;
		}

		return result;
	}

	intersperse(sep: StreamSource<T>): Stream<T> {
		if (StreamFactory().isEmptyStreamSourceInstance(sep)) {
			return this;
		}

		return this.transform(Transformer.intersperse(sep));
	}

	join({
		sep = '',
		start = '',
		end = '',
		valueToString = String,
		ifEmpty = undefined,
	} = {}): string {
		const done = Symbol('Done');
		const iterator = this[Symbol.iterator]();
		let value: T | typeof done = iterator.fastNext(done);

		if (done === value) {
			if (undefined !== ifEmpty) {
				return ifEmpty;
			}

			return start.concat(end);
		}

		let result = start.concat(valueToString(value));

		while (done !== (value = iterator.fastNext(done))) {
			result = result.concat(sep, valueToString(value));
		}

		return result.concat(end);
	}

	joinStream({
		sep = StreamFactory().empty() as StreamSource<T>,
		start = StreamFactory().empty() as StreamSource<T>,
		end = StreamFactory().empty() as StreamSource<T>,
	} = {}): any {
		return StreamFactory()
			.fromStreamSource(start)
			.concat(this.intersperse(sep), end);
	}

	splitWhere<R>(
		pred: (value: T, index: number) => boolean,
		options: {
			negate?: boolean | undefined;
			collector?: Reducer<T, R> | undefined;
		} = {},
	): Stream<R> {
		return this.transform(Transformer.splitWhere(pred, options));
	}

	splitOn<R>(
		sepElem: T,
		options: {
			eq?: Eq<T> | undefined;
			negate?: boolean | undefined;
			collector?: Reducer<T, R> | undefined;
		} = {},
	): Stream<R> {
		return this.transform(Transformer.splitOn(sepElem, options));
	}

	splitOnSlice<R>(
		sepSeq: StreamSource<T>,
		options: {
			eq?: Eq<T> | undefined;
			collector?: Reducer<T, R> | undefined;
		} = {},
	): Stream<R> {
		return this.transform(Transformer.splitOnSlice(sepSeq, options));
	}

	distinctPrevious(options: { eq?: Eq<T>; negate?: boolean } = {}): Stream<T> {
		return this.transform(Transformer.distinctPrevious(options));
	}

	window<R>(
		windowSize: number,
		options: {
			skipAmount?: number | undefined;
			collector?: Reducer<T, R> | undefined;
		} = {},
	): Stream<R> {
		return this.transform(Transformer.window(windowSize, options as any));
	}

	fold<R>(
		init: OptLazy<R>,
		next: (current: R, value: T, index: number, halt: () => void) => R,
	): R {
		return this.reduce(Reducer.fold(init, next));
	}

	foldStream<R>(
		init: OptLazy<R>,
		next: (current: R, value: T, index: number, halt: () => void) => R,
	): Stream<R> {
		return this.reduceStream(Reducer.fold(init, next));
	}

	reduce<const S extends Reducer.CombineShape<T>>(
		shape: S & Reducer.CombineShape<T>,
	): any {
		const reducerInstance = Reducer.combine(
			shape as any,
		).compile() as Reducer.Instance<T, Reducer.CombineResult<S>>;

		const done = Symbol('Done');
		let value: T | typeof done;
		const iter = this[Symbol.iterator]();

		while (!reducerInstance.halted && done !== (value = iter.fastNext(done))) {
			reducerInstance.next(value);
		}

		return reducerInstance.getOutput();
	}

	reduceStream<const S extends Reducer.CombineShape<T>>(
		shape: S & Reducer.CombineShape<T>,
	): Stream<Reducer.CombineResult<S>> {
		const reducer = Reducer.combine(shape as any) as Reducer<
			T,
			Reducer.CombineResult<S>
		>;

		return new ReducerStream(this, reducer);
	}

	groupBy<K>(valueToKey: (value: T, index: number) => K): any {
		return (options: any = {}) => this.reduce(Reducer.groupBy(valueToKey, options));
	}

	toArray(): T[] {
		const iterator = this[Symbol.iterator]();
		const result: T[] = [];
		const done = Symbol('Done');
		let value: T | typeof done;

		while (done !== (value = iterator.fastNext(done))) {
			result.push(value);
		}

		return result;
	}

	toString(): string {
		return `Stream(...<potentially empty>)`;
	}

	toJSON(): ToJSON<T[], 'Stream'> {
		return {
			dataType: 'Stream',
			value: this.toArray(),
		};
	}
}

export class FromStream<T> extends StreamBase<T> {
	[Symbol.iterator]: () => FastIterator<T> = undefined as any;

	constructor(createIterator: () => FastIterator<T>) {
		super();
		this[Symbol.iterator] = createIterator;
	}
}

class PrependStream<T> extends StreamBase<T> {
	constructor(
		readonly source: Stream<T>,
		readonly item: OptLazy<T>,
	) {
		super();
	}

	#copy<T2>(source: Stream<T2>, item: OptLazy<T2>): PrependStream<T2> {
		return new PrependStream<T2>(source, item);
	}

	[Symbol.iterator](): FastIterator<T> {
		return new PrependIterator<T>(this.source[Symbol.iterator](), this.item);
	}

	first(): T {
		return OptLazy(this.item);
	}

	last(): T {
		return this.source.last(this.item);
	}

	count(): number {
		return this.source.count() + 1;
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		f(OptLazy(this.item), state.nextIndex(), state.halt);

		if (state.halted) return;

		this.source.forEach(f, { state });
	}

	mapPure<T2, A extends readonly unknown[]>(
		mapFun: (value: T, ...args: A) => T2,
		...args: A
	): Stream<T2> {
		return this.#copy(this.source.mapPure(mapFun, ...args), () =>
			mapFun(OptLazy(this.item), ...args),
		);
	}

	take(amount: number): Stream<T> {
		if (amount <= 0) {
			return StreamFactory().empty();
		}

		if (amount === 1) {
			return StreamFactory().of(OptLazy(this.item));
		}

		return this.#copy(this.source.take(amount - 1), this.item);
	}

	drop(amount: number): Stream<T> {
		if (amount <= 0) {
			return this;
		}

		if (amount === 1) {
			return this.source;
		}

		return this.source.drop(amount - 1);
	}

	minBy<O>(compare: (v1: T, v2: T) => number): T | O {
		const token = Symbol();
		const result = this.source.minBy(compare, token);
		const itemValue = OptLazy(this.item);

		if (token === result) {
			return itemValue;
		}

		return compare(result, itemValue) <= 0 ? result : itemValue;
	}

	maxBy<O>(compare: (v1: T, v2: T) => number): T | O {
		const token = Symbol();
		const result = this.source.maxBy(compare, token);
		const itemValue = OptLazy(this.item);

		if (token === result) {
			return itemValue;
		}

		return compare(result, itemValue) > 0 ? result : itemValue;
	}

	toArray(): T[] {
		const result = this.source.toArray();
		result.unshift(OptLazy(this.item));
		return result;
	}
}

class AppendStream<T> extends StreamBase<T> {
	constructor(
		readonly source: Stream<T>,
		readonly item: OptLazy<T>,
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<T> {
		return new AppendIterator<T>(this.source[Symbol.iterator](), this.item);
	}

	first(): T {
		return this.source.first(this.item);
	}

	last(): T {
		return OptLazy(this.item);
	}

	count(): number {
		return this.source.count() + 1;
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		this.source.forEach(f, { state });

		if (state.halted) return;

		f(OptLazy(this.item), state.nextIndex(), state.halt);
	}

	mapPure<T2, A extends readonly unknown[]>(
		mapFun: (value: T, ...args: A) => T2,
		...args: A
	): Stream<T2> {
		return new AppendStream(this.source.mapPure(mapFun, ...args), () =>
			mapFun(OptLazy(this.item), ...args),
		);
	}

	minBy<O>(compare: (v1: T, v2: T) => number): T | O {
		const token = Symbol();
		const result = this.source.minBy(compare, token);
		const itemValue = OptLazy(this.item);

		if (token === result) {
			return itemValue;
		}

		return compare(result, itemValue) <= 0 ? result : itemValue;
	}

	maxBy<O>(compare: (v1: T, v2: T) => number): T | O {
		const token = Symbol();
		const result = this.source.maxBy(compare, token);
		const itemValue = OptLazy(this.item);

		if (token === result) {
			return itemValue;
		}

		return compare(result, itemValue) > 0 ? result : itemValue;
	}

	toArray(): T[] {
		const result = this.source.toArray();
		result.push(OptLazy(this.item));
		return result;
	}
}

class MapStream<T, T2> extends StreamBase<T2> {
	constructor(
		readonly source: Stream<T>,
		readonly mapFun: (value: T, index: number) => T2,
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<T2> {
		return new MapIterator<T, T2>(this.source[Symbol.iterator](), this.mapFun);
	}

	first<O>(otherwise?: OptLazy<O>): T2 | O {
		const done = Symbol('Done');
		const value = this.source.first(done);
		if (done === value) return OptLazy(otherwise) as O;
		return this.mapFun(value, 0);
	}

	last<O>(otherwise?: OptLazy<O>): T2 | O {
		const done = Symbol('Done');
		const value = this.source.last(done);
		if (done === value) return OptLazy(otherwise) as O;
		return this.mapFun(value, 0);
	}

	count(): number {
		return this.source.count();
	}

	at<O>(index: number, otherwise?: OptLazy<O>): T2 | O {
		const done = Symbol('Done');
		const value = this.source.at(index, done);
		if (done === value) return OptLazy(otherwise) as O;
		return this.mapFun(value, index);
	}

	map<T3>(mapFun: (value: T2, index: number) => T3): Stream<T3> {
		return new MapStream<T, T3>(this.source, (value, index) =>
			mapFun(this.mapFun(value, index), index),
		);
	}

	take(amount: number): Stream<T2> {
		if (amount <= 0) {
			return StreamFactory().empty();
		}

		return new MapStream(this.source.take(amount), this.mapFun);
	}

	drop(amount: number): Stream<T2> {
		if (amount <= 0) {
			return this;
		}

		return new MapStream(this.source.drop(amount), this.mapFun);
	}
}

class MapPureStream<
	T,
	A extends readonly unknown[],
	T2,
> extends StreamBase<T2> {
	constructor(
		readonly source: Stream<T>,
		readonly mapFun: (value: T, ...args: A) => T2,
		readonly args: A,
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<T2> {
		return new MapPureIterator<T, A, T2>(
			this.source[Symbol.iterator](),
			this.mapFun,
			this.args,
		);
	}

	first<O>(otherwise?: OptLazy<O>): T2 | O {
		const done = Symbol('Done');
		const value = this.source.first(done);
		if (done === value) return OptLazy(otherwise) as O;
		return this.mapFun(value, ...this.args);
	}

	last<O>(otherwise?: OptLazy<O>): T2 | O {
		const done = Symbol('Done');
		const value = this.source.last(done);
		if (done === value) return OptLazy(otherwise) as O;
		return this.mapFun(value, ...this.args);
	}

	count(): number {
		return this.source.count();
	}

	at<O>(index: number, otherwise?: OptLazy<O>): T2 | O {
		const done = Symbol('Done');
		const value = this.source.at(index, done);
		if (done === value) return OptLazy(otherwise) as O;
		return this.mapFun(value, ...this.args);
	}

	mapPure<T3, A2 extends readonly unknown[]>(
		mapFun: (value: T2, ...args: A2) => T3,
		...args: A2
	): Stream<T3> {
		return new MapPureStream<T, A2, T3>(
			this.source,
			(value, ...args) => mapFun(this.mapFun(value, ...this.args), ...args),
			args,
		);
	}

	take(amount: number): Stream<T2> {
		if (amount <= 0) {
			return StreamFactory().empty();
		}

		return new MapPureStream(this.source.take(amount), this.mapFun, this.args);
	}

	drop(amount: number): Stream<T2> {
		if (amount <= 0) {
			return this;
		}

		return new MapPureStream(this.source.drop(amount), this.mapFun, this.args);
	}
}

class ConcatStream<T> extends StreamBase<T> {
	constructor(
		readonly source: Stream<T>,
		readonly otherSources: StreamSource<T>[],
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<T> {
		return new ConcatIterator<T>(this.source, this.otherSources);
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		this.source.forEach(f, { state });

		let sourceIndex = -1;
		const sources = this.otherSources;
		const length = sources.length;

		while (!state.halted && ++sourceIndex < length) {
			const source = sources[sourceIndex];

			if (!StreamFactory().isEmptyStreamSourceInstance(source)) {
				StreamFactory().fromStreamSource(source).forEach(f, { state });
			}
		}
	}

	forEachPure<A extends readonly unknown[]>(
		f: (value: T, ...args: A) => void,
		...args: A
	): void {
		this.source.forEachPure(f, ...args);

		let sourceIndex = -1;
		const sources = this.otherSources;
		const length = sources.length;

		while (++sourceIndex < length) {
			const source = sources[sourceIndex];

			if (!StreamFactory().isEmptyStreamSourceInstance(source)) {
				StreamFactory()
					.fromStreamSource(source)
					.forEachPure(f, ...args);
			}
		}
	}

	last<O>(otherwise?: OptLazy<O>): T | O {
		const sources = this.otherSources;
		let sourceIndex = sources.length;

		while (--sourceIndex >= 0) {
			const source = sources[sourceIndex];

			if (!StreamFactory().isEmptyStreamSourceInstance(source)) {
				const done = Symbol('Done');
				const value = StreamFactory().fromStreamSource(source).last(done);
				if (done !== value) return value;
			}
		}

		return this.source.last(otherwise!);
	}

	count(): number {
		let result = this.source.count();

		const sources = this.otherSources;
		const length = sources.length;
		let sourceIndex = -1;

		while (++sourceIndex < length) {
			const source = sources[sourceIndex];
			if (!StreamFactory().isEmptyStreamSourceInstance(source)) {
				result += StreamFactory().fromStreamSource(source).count();
			}
		}

		return result;
	}

	filterPure<A extends readonly unknown[]>(
		options: {
			pred: (value: T, ...args: A) => boolean;
			negate?: boolean | undefined;
		},
		...args: A
	): any {
		return new ConcatStream(
			this.source.filterPure(options, ...args),
			this.otherSources.map((source) =>
				StreamFactory()
					.fromStreamSource(source)
					.filterPure(options, ...args),
			),
		) as any;
	}

	mapPure<T2, A extends readonly unknown[]>(
		mapFun: (value: T, ...args: A) => T2,
		...args: A
	): Stream<T2> {
		return new ConcatStream(
			this.source.mapPure(mapFun, ...args),
			this.otherSources.map((source) =>
				StreamFactory()
					.fromStreamSource(source)
					.mapPure(mapFun, ...args),
			),
		);
	}

	concat<T2>(...others2: StreamSource<T2>[]): any {
		return new ConcatStream<T | T2>(
			this.source as any,
			(this.otherSources as StreamSource<T | T2>[]).concat(others2 as any),
		);
	}

	toArray(): T[] {
		let result: T[] = this.source.toArray();

		let sourceIndex = -1;
		const sources = this.otherSources;
		const length = sources.length;

		while (++sourceIndex < length) {
			const source = sources[sourceIndex];

			if (!StreamFactory().isEmptyStreamSourceInstance(source)) {
				result = result.concat(
					StreamFactory().fromStreamSource(source).toArray(),
				);
			}
		}

		return result;
	}
}

class IndexedStream<T> extends StreamBase<[number, T]> {
	constructor(
		readonly source: Stream<T>,
		readonly startIndex: number,
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<[number, T]> {
		return new IndexedIterator<T>(
			this.source[Symbol.iterator](),
			this.startIndex,
		);
	}

	first<O>(otherwise?: OptLazy<O> | undefined): [number, T] | O {
		const token = Symbol();
		const sourceFirst = this.source.first(token);

		if (token === sourceFirst) {
			return OptLazy(otherwise) as O;
		}

		return [0, sourceFirst];
	}

	count(): number {
		return this.source.count();
	}

	at<O>(
		index: number,
		otherwise?: OptLazy<O> | undefined,
	): [number, T] | O {
		const token = Symbol();
		const atSource = this.source.at(index, token);

		if (token === atSource) {
			return OptLazy(otherwise) as O;
		}

		return [index, atSource];
	}

	take(amount: number): Stream<[number, T]> {
		if (amount <= 0) {
			return StreamFactory().empty();
		}

		return new IndexedStream(this.source.take(amount), this.startIndex);
	}

	toArray(): Array<[number, T]> {
		let index = this.startIndex;
		const iterator = this.source[Symbol.iterator]();
		const result: Array<[number, T]> = [];
		const done = Symbol('Done');
		let value: T | typeof done;

		while (done !== (value = iterator.fastNext(done))) {
			result.push([index++, value]);
		}

		return result;
	}
}

class FilterStream<T> extends StreamBase<T> {
	constructor(
		readonly source: Stream<T>,
		readonly pred: (value: T, index: number, halt: () => void) => boolean,
		readonly negate = false,
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<T> {
		return new FilterIterator<T>(
			this.source[Symbol.iterator](),
			this.pred,
			this.negate,
		);
	}

	filterPure<A extends readonly unknown[]>(
		options: {
			pred: (value: T, ...args: A) => boolean;
			negate?: boolean | undefined;
		},
		...args: A
	): Stream<never> {
		const { pred, negate = false } = options;
		const { pred: thisPred, negate: thisNegate } = this;

		return new FilterStream(
			this.source,
			(value, index, halt) =>
				thisPred(value, index, halt) !== thisNegate &&
				pred(value, ...args) !== negate,
			false,
		) as any;
	}

	mapPure<T2, A extends readonly unknown[]>(
		mapFun: (value: T, ...args: A) => T2,
		...args: A
	): Stream<T2> {
		const { pred, negate } = this;

		return new CollectStream(this.source, (value, index, skip, halt) =>
			pred(value, index, halt) !== negate ? mapFun(value, ...args) : skip,
		);
	}
}

class FilterPureStream<T, A extends readonly unknown[]> extends StreamBase<T> {
	constructor(
		readonly source: Stream<T>,
		readonly pred: (value: T, ...args: A) => boolean,
		readonly args: A,
		readonly negate = false,
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<T> {
		return new FilterPureIterator<T, A>(
			this.source[Symbol.iterator](),
			this.pred,
			this.args,
			this.negate,
		);
	}

	filterPure<A extends readonly unknown[]>(
		options: {
			pred: (value: T, ...args: A) => boolean;
			negate?: boolean | undefined;
		},
		...args: A
	): Stream<never> {
		const { pred, negate = false } = options;

		const thisPred = this.pred;
		const thisArgs = this.args;
		const thisNegate = this.negate;

		return new FilterPureStream(
			this.source,
			(value, ...args) => {
				return (
					thisPred(value, ...thisArgs) !== thisNegate &&
					pred(value, ...args) !== negate
				);
			},
			args,
			false,
		) as any;
	}

	mapPure<T2, A extends readonly unknown[]>(
		mapFun: (value: T, ...args: A) => T2,
		...args: A
	): Stream<T2> {
		const { pred, negate, args: thisArgs } = this;

		return new CollectStream(this.source, (value, _, skip) =>
			pred(value, ...thisArgs) !== negate ? mapFun(value, ...args) : skip,
		);
	}
}

class CollectStream<T, R> extends StreamBase<R> {
	constructor(
		readonly source: Stream<T>,
		readonly collectFun: CollectFun<T, R>,
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<R> {
		return new CollectIterator<T, R>(
			this.source[Symbol.iterator](),
			this.collectFun,
		);
	}

	filterPure<A extends readonly unknown[]>(
		options: {
			pred: (value: R, ...args: A) => boolean;
			negate?: boolean | undefined;
		},
		...args: A
	): any {
		const { pred, negate = false } = options;
		const { collectFun } = this;

		return new CollectStream(this.source, (value, index, skip, halt) => {
			const result = collectFun(value, index, skip, halt);

			if (skip === result || pred(result, ...args) === negate) {
				return skip;
			}

			return result;
		}) as any;
	}

	mapPure<T2, A extends readonly unknown[]>(
		mapFun: (value: R, ...args: A) => T2,
		...args: A
	): Stream<T2> {
		const { collectFun } = this;

		return new CollectStream(this.source, (value, index, skip, halt) => {
			const result = collectFun(value, index, skip, halt);

			if (skip === result) {
				return skip;
			}

			return mapFun(result, ...args);
		});
	}
}

class DropWhileStream<T> extends StreamBase<T> {
	constructor(
		readonly source: Stream<T>,
		readonly pred: (value: T, index: number) => boolean,
		readonly negate: boolean,
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<T> {
		return new DropWhileIterator<T>(
			this.source[Symbol.iterator](),
			this.pred,
			this.negate,
		);
	}
}

class TakeStream<T> extends StreamBase<T> {
	constructor(
		readonly source: Stream<T>,
		readonly amount: number,
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<T> {
		return new TakeIterator<T>(this.source[Symbol.iterator](), this.amount);
	}

	take(amount: number): Stream<T> {
		if (amount <= 0) {
			return StreamFactory().empty();
		}

		if (amount >= this.amount) {
			return this;
		}

		return this.source.take(amount);
	}
}

class DropStream<T> extends StreamBase<T> {
	constructor(
		readonly source: Stream<T>,
		readonly amount: number,
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<T> {
		return new DropIterator<T>(this.source[Symbol.iterator](), this.amount);
	}

	drop(amount: number): Stream<T> {
		if (amount <= 0) {
			return this;
		}

		return this.source.drop(this.amount + amount);
	}
}

class SlowIteratorAdapter<T> implements FastIterator<T> {
	constructor(readonly source: Iterator<T>) {}

	next(): IteratorResult<T> {
		return this.source.next();
	}

	fastNext<O>(otherwise?: OptLazy<O>): T | O {
		const result = this.source.next();

		if (result.done) {
			return OptLazy(otherwise) as O;
		}

		return result.value;
	}
}

export class FromIterable<T> extends StreamBase<T> {
	constructor(readonly iterable: Iterable<T>) {
		super();
	}

	[Symbol.iterator](): FastIterator<T> {
		const iterator = this.iterable[Symbol.iterator]();

		if (FastIteratorFactory.isFastIterator(iterator)) return iterator;

		return new SlowIteratorAdapter<T>(iterator);
	}
}

export const EmptyStreamToken = Symbol('EmptyStreamToken');

export class EmptyStream<T = any> extends StreamBase<T> implements Stream<T> {
	[Symbol.iterator](): FastIterator<T> {
		return FastIteratorFactory._emptyFastIteratorInstance;
	}

	[EmptyStreamToken] = true;

	stream(): this {
		return this;
	}
	assumeNonEmpty(): never {
		RimbuError.throwEmptyCollectionAssumedNonEmptyError();
	}
	equals(other: StreamSource<T>): boolean {
		const done = Symbol('Done');

		return (
			done ===
			StreamFactory().fromStreamSource(other)[Symbol.iterator]().fastNext(done)
		);
	}
	prepend(value: OptLazy<T>): Stream.NonEmpty<T> {
		return StreamFactory().of(OptLazy(value));
	}
	append(value: OptLazy<T>): Stream.NonEmpty<T> {
		return StreamFactory().of(OptLazy(value));
	}
	forEach(): void {
		//
	}
	forEachPure(): void {
		//
	}
	indexed(): Stream<[number, T]> {
		return this as any;
	}
	map<T2>(): Stream<T2> {
		return this as any;
	}
	mapPure<T2>(): Stream<T2> {
		return this as any;
	}
	flatMap<T2>(): Stream<T2> {
		return this as any;
	}
	flatZip<T2>(): Stream<[T, T2]> {
		return this as any;
	}
	transform<R>(transformer: Transformer<T, R>): Stream<R> {
		return StreamFactory().fromStreamSource(transformer.compile().getOutput());
	}
	filter(): any {
		return this;
	}
	filterPure(): any {
		return this;
	}
	withOnly(): any {
		return this;
	}
	without(): any {
		return this;
	}
	collect<R>(): Stream<R> {
		return this as any;
	}
	first<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}
	last<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}
	single<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}
	count(): 0 {
		return 0;
	}
	countElement(): 0 {
		return 0;
	}
	find<O>(
		pred: (value: any, index: number) => boolean,
		options: { otherwise?: OptLazy<O>; occurrence?: number | undefined } = {},
	): O {
		const { otherwise } = options;

		return OptLazy(otherwise) as O;
	}
	at<O>(index: number, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}
	indicesWhere(): Stream<number> {
		return this as any;
	}
	indicesOf(): Stream<number> {
		return this as any;
	}
	indexWhere(): undefined {
		return undefined;
	}
	indexOf(): undefined {
		return undefined;
	}
	some(): false {
		return false;
	}
	every(): true {
		return true;
	}
	contains(): false {
		return false;
	}
	containsSlice(): false {
		return false;
	}
	takeWhile(): Stream<T> {
		return this;
	}
	dropWhile(): Stream<T> {
		return this;
	}
	take(): Stream<T> {
		return this;
	}
	drop(): Stream<T> {
		return this;
	}
	repeat(): Stream<T> {
		return this;
	}
	concat<T2>(...others: ArrayNonEmpty<StreamSource<T2>>): any {
		if (others.every(StreamFactory().isEmptyStreamSourceInstance)) return this;
		const [source1, source2, ...sources] = others;

		if (undefined === source2) return source1;

		return StreamFactory()
			.fromStreamSource(source1)
			.concat(source2, ...sources);
	}
	min<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}
	minBy<O>(compare: any, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}
	max<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}
	maxBy<O>(compare: any, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}
	intersperse(): Stream<T> {
		return this;
	}
	join({ start = '', end = '', ifEmpty = undefined } = {}): string {
		if (undefined !== ifEmpty) return ifEmpty;
		return start.concat(end);
	}
	joinStream({
		start = StreamFactory().empty() as StreamSource<T>,
		end = StreamFactory().empty() as StreamSource<T>,
	} = {}): Stream.NonEmpty<T> {
		return StreamFactory().fromStreamSource(start).concat(end) as any;
	}
	splitOn<R>(): Stream<R> {
		return this as any;
	}
	splitWhere<R>(): Stream<R> {
		return this as any;
	}
	splitOnSlice<R>(): Stream<R> {
		return this as any;
	}
	distinctPrevious(): Stream<T> {
		return this;
	}
	window<R>(): Stream<R> {
		return this as any;
	}
	fold<R>(init: OptLazy<R>): R {
		return OptLazy(init);
	}
	foldStream<R>(): Stream<R> {
		return this as any;
	}
	reduce(shape: any): any {
		const reducer = Reducer.combine(shape);
		const instance = reducer.compile();

		return instance.getOutput();
	}
	reduceStream(): any {
		return this;
	}
	toArray(): [] {
		return [];
	}
	toString(): string {
		return `Stream(<empty>)`;
	}
	toJSON(): ToJSON<T[], 'Stream'> {
		return {
			dataType: 'Stream',
			value: [],
		};
	}
}

export class ArrayStream<T> extends StreamBase<T> {
	readonly length: number;

	constructor(
		readonly array: readonly T[],
		readonly startIndex = 0,
		readonly endIndex = array.length - 1,
		readonly reversed = false,
	) {
		super();
		this.length = endIndex - startIndex + 1;
	}

	[Symbol.iterator](): FastIterator<T> {
		if (!this.reversed) {
			return new ArrayIterator(this.array, this.startIndex, this.endIndex);
		}
		return new ArrayReverseIterator(this.array, this.startIndex, this.endIndex);
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		const startIndex = this.startIndex;
		const endIndex = this.endIndex;
		const array = this.array;
		const { halt } = state;

		if (!this.reversed) {
			let i = this.startIndex - 1;
			while (!state.halted && ++i <= endIndex) {
				f(array[i], state.nextIndex(), halt);
			}
		} else {
			let i = endIndex + 1;
			while (!state.halted && --i >= startIndex) {
				f(array[i], state.nextIndex(), halt);
			}
		}
	}

	first<O>(otherwise?: OptLazy<O>): T | O {
		if (this.length <= 0) {
			return OptLazy(otherwise) as O;
		}

		if (!this.reversed) {
			return this.array[this.startIndex];
		}

		return this.array[this.endIndex];
	}

	last<O>(otherwise?: OptLazy<O>): T | O {
		if (this.length <= 0) {
			return OptLazy(otherwise) as O;
		}

		if (!this.reversed) {
			return this.array[this.endIndex];
		}

		return this.array[this.startIndex];
	}

	count(): number {
		return this.endIndex - this.startIndex + 1;
	}

	find<O>(
		pred: (value: T, index: number) => boolean,
		options: {
			occurrence?: number | undefined;
			negate?: boolean | undefined;
			otherwise?: OptLazy<O>;
		} = {},
	): T | O {
		const { occurrence = 1, negate = false, otherwise } = options;

		const startIndex = this.startIndex;
		const endIndex = this.endIndex;
		const array = this.array;
		let remain = occurrence;
		let index = 0;

		if (!this.reversed) {
			let i = startIndex - 1;

			while (++i <= endIndex) {
				const value = array[i];
				if (pred(value, index++) !== negate && --remain <= 0) return value;
			}
		} else {
			let i = endIndex + 1;

			while (--i >= startIndex) {
				const value = array[i];
				if (pred(value, index++) !== negate && --remain <= 0) return value;
			}
		}

		return OptLazy(otherwise) as O;
	}

	at<O>(index: number, otherwise?: OptLazy<O>): T | O {
		if (index < 0 || index >= this.length) {
			return OptLazy(otherwise) as O;
		}

		if (!this.reversed) {
			return this.array[index + this.startIndex];
		}

		return this.array[this.endIndex - index];
	}

	indexOf(
		searchValue: T,
		options: {
			occurrence?: number | undefined;
			eq?: Eq<T> | undefined;
			negate?: boolean | undefined;
		} = {},
	): number | undefined {
		const { occurrence = 1 } = options;

		if (occurrence <= 0) return undefined;

		const { eq = Object.is, negate = false } = options;

		let remain = occurrence;

		const startIndex = this.startIndex;
		const endIndex = this.endIndex;
		const array = this.array;

		if (!this.reversed) {
			let i = startIndex - 1;
			while (++i <= endIndex) {
				if (eq(array[i], searchValue) !== negate && --remain <= 0)
					return i - startIndex;
			}
		} else {
			let i = endIndex + 1;
			while (--i >= startIndex) {
				if (eq(array[i], searchValue) !== negate && --remain <= 0)
					return endIndex - i;
			}
		}

		return undefined;
	}

	take(amount: number): Stream<T> {
		if (amount <= 0) return StreamFactory().empty();

		if (amount >= this.length) return this;

		if (!this.reversed) {
			return new ArrayStream(
				this.array,
				this.startIndex,
				this.startIndex + amount - 1,
				this.reversed,
			);
		}

		return new ArrayStream(
			this.array,
			this.endIndex - (amount - 1),
			this.endIndex,
			this.reversed,
		);
	}

	drop(amount: number): Stream<T> {
		if (amount <= 0) return this;

		if (amount >= this.length) return StreamFactory().empty();

		if (!this.reversed) {
			return new ArrayStream(
				this.array,
				this.startIndex + amount,
				this.endIndex,
				this.reversed,
			);
		}

		return new ArrayStream(
			this.array,
			this.startIndex,
			this.endIndex - amount,
			this.reversed,
		);
	}

	toArray(): T[] {
		const array = this.array;

		if (typeof array === 'string') {
			return super.toArray();
		}

		if (this.reversed) {
			// use normal iterator
			return super.toArray();
		}

		return array.slice(this.startIndex, this.endIndex + 1);
	}
}

export class AlwaysStream<T> extends StreamBase<T> {
	constructor(readonly value: T) {
		super();
	}

	[Symbol.iterator](): FastIterator<T> {
		return new AlwaysIterator(this.value);
	}

	first(): T {
		return this.value;
	}

	append(): Stream.NonEmpty<T> {
		return this as any;
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		const value = this.value;

		while (!state.halted) {
			f(value, state.nextIndex(), state.halt);
		}
	}

	at(): T {
		return this.value;
	}

	repeat(): Stream<T> {
		return this as any;
	}

	concat<T2>(): Stream.NonEmpty<T | T2> {
		return this.assumeNonEmpty() as any;
	}

	min(): T {
		return this.value;
	}

	minBy(): T {
		return this.value;
	}

	max(): T {
		return this.value;
	}

	maxBy(): T {
		return this.value;
	}
}

export class MapApplyStream<
	T extends readonly unknown[],
	A extends readonly unknown[],
	R,
> extends StreamBase<R> {
	constructor(
		readonly source: StreamSource<T>,
		readonly f: (...args: [...T, ...A]) => R,
		readonly args: A,
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<R> {
		return new MapApplyIterator(this.source, this.f, this.args);
	}

	mapPure<T2, A extends readonly unknown[]>(
		mapFun: (value: R, ...args: A) => T2,
		...args: A
	): Stream<T2> {
		const { f, args: thisArgs } = this;

		return new MapApplyStream(
			this.source,
			(...args2) => mapFun(f(...args2), ...args),
			thisArgs,
		);
	}
}

export class FilterApplyStream<
	T extends readonly unknown[],
	A extends readonly unknown[],
> extends StreamBase<T> {
	constructor(
		readonly source: StreamSource<T>,
		readonly pred: (...args: [...T, ...A]) => boolean,
		readonly args: A,
		readonly negate = false,
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<T> {
		return new FilterApplyIterator(
			this.source,
			this.pred,
			this.args,
			this.negate,
		);
	}
}

export class RangeStream extends StreamBase<number> {
	constructor(
		readonly start: number,
		readonly end?: number,
		readonly delta: number = 1,
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<number> {
		if (this.delta >= 0) {
			return new RangeUpIterator(this.start, this.end, this.delta);
		}
		return new RangeDownIterator(this.start, this.end, this.delta);
	}
}

class ReducerStream<T, R = T> extends StreamBase<R> {
	constructor(
		readonly source: Stream<T>,
		readonly reducer: Reducer<T, R>,
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<R> {
		return new ReducerFastIterator<T, R>(
			this.source[Symbol.iterator](),
			this.reducer.compile(),
		);
	}
}

class TransformerStream<T, R = T> extends StreamBase<R> {
	constructor(
		readonly source: Stream<T>,
		readonly transformer: Transformer<T, R>,
	) {
		super();
	}

	[Symbol.iterator](): FastIterator<R> {
		return new TransformerFastIterator<T, R>(
			this.source[Symbol.iterator](),
			this.transformer.compile(),
		);
	}
}
