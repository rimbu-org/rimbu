import type { List } from '@rimbu/list';
import type { StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context';
import type { OuterBuilder } from '#list/mutable/common';

import { Int } from '@rimbu/base';
import { CollectionBuilderBase } from '@rimbu/collection-types/advanced/collection-base';
import { OptLazy } from '@rimbu/common';
import { Stream } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { CacheMap } from '#list/immutable/cache-map';

export class ListBuilder<T>
	extends CollectionBuilderBase<T>
	implements List.Builder<T>
{
	constructor(
		readonly context: ListContext,
		outerBuilder?: OuterBuilder<T>,
	) {
		super();
		this.#outerBuilder = outerBuilder;
	}

	get #ops() {
		return this.context.childrenOps;
	}

	#outerBuilder: OuterBuilder<T> | undefined;

	get size(): number {
		return this.#outerBuilder?.size ?? 0;
	}

	get isEmpty(): boolean {
		return 0 === this.size;
	}

	at = <O>(index: number, otherwise?: OptLazy<O>): T | O => {
		const size = this.size;
		if (undefined === this.#outerBuilder || -index > size || index >= size) {
			return OptLazy(otherwise) as O;
		}

		if (index < 0) index = size + index;

		Int.checkAtLeastZero(index);

		return this.#outerBuilder.get(index);
	};

	first = <O>(otherwise?: OptLazy<O>): T | O => {
		if (undefined === this.#outerBuilder) {
			return OptLazy(otherwise) as O;
		}
		return this.#outerBuilder.get(0 as Int.AtLeastZero);
	};

	last = <O>(otherwise?: OptLazy<O>): T | O => {
		if (undefined === this.#outerBuilder) {
			return OptLazy(otherwise) as O;
		}
		return this.#outerBuilder.get((this.size - 1) as Int.AtLeastZero);
	};

	setAt = <O>(index: number, value: T, otherwise?: OptLazy<O>): T | O => {
		const notFound = Symbol();
		const [previous] = this.updateAt(index, () => value, notFound);

		if (notFound === previous) {
			return OptLazy(otherwise) as O;
		}

		return previous;
	};

	updateAt = <O>(
		index: number,
		f: (element: T) => T,
		otherwise?: OptLazy<O>,
	): [previous: T | O, current: T | O] => {
		if (
			undefined === this.#outerBuilder ||
			-index > this.size ||
			index >= this.size
		) {
			const otherwiseValue = OptLazy(otherwise) as O;
			return [otherwiseValue, otherwiseValue];
		}

		if (index < 0) index = this.size + index;

		Int.checkAtLeastZero(index);

		return this.#outerBuilder.update(index, f);
	};

	swapAt = (
		index1: number,
		index2: number,
	): [newValueAtIndex1: T, newValueAtIndex2: T] | undefined => {
		if (
			undefined === this.#outerBuilder ||
			-index1 > this.size ||
			index1 >= this.size ||
			-index2 > this.size ||
			index2 >= this.size
		) {
			return undefined;
		}

		if (index1 < 0) index1 = this.size + index1;
		if (index2 < 0) index2 = this.size + index2;

		Int.checkAtLeastZero(index1);
		Int.checkAtLeastZero(index2);

		return this.#outerBuilder.update(index2, (value2) => {
			const [value1] = this.#outerBuilder!.update(index1, () => value2);
			return value1;
		});
	};

	prepend = (element: T): void => {
		this.checkLock();

		if (undefined === this.#outerBuilder) {
			this.#outerBuilder = this.context.outerBlockBuilder<T>(
				this.#ops.of([element]),
			);
			return;
		}

		this.#outerBuilder.prepend(element);
		this.#outerBuilder = this.#outerBuilder.normalized();
	};

	append = (element: T): void => {
		this.checkLock();

		if (undefined === this.#outerBuilder) {
			this.#outerBuilder = this.context.outerBlockBuilder<T>(
				this.#ops.of([element]),
			);
			return;
		}

		this.#outerBuilder.append(element);
		this.#outerBuilder = this.#outerBuilder.normalized();
	};

	prependAll = (elements: StreamSource<T>): void => {
		this.checkLock();

		const token = Symbol();
		const iterator = Stream.from(elements)[Symbol.iterator]();
		let next: T | typeof token;
		while ((next = iterator.fastNext(token)) !== token) {
			this.prepend(next);
		}
	};

	appendAll = (elements: StreamSource<T>): void => {
		this.checkLock();

		// if (Array.isArray(values)) {
		// 	this.appendArray(values);
		// 	return;
		// }

		const token = Symbol();
		const iterator = Stream.from(elements)[Symbol.iterator]();
		let next: T | typeof token;
		while ((next = iterator.fastNext(token)) !== token) {
			this.append(next);
		}
	};

	insertAt = (index: number, value: T): void => {
		this.checkLock();

		if (undefined === this.#outerBuilder || index >= this.size) {
			this.append(value);
			return;
		}
		if (index === 0 || index <= -this.size) {
			this.prepend(value);
			return;
		}

		if (index < 0) index = this.size + index;

		Int.checkAtLeastOne(index);

		this.#outerBuilder.insert(index, value);
		this.#outerBuilder = this.#outerBuilder.normalized();
	};

	insertAllAt = (index: number, values: StreamSource<T>): void => {
		const done = Symbol();
		const iter = Stream.from(values)[Symbol.iterator]();
		let next: T | typeof done;
		while (done !== (next = iter.fastNext(done))) {
			this.insertAt(index, next);
			index++;
		}
	};

	removeAt = <O>(index: number, otherwise?: OptLazy<O>): T | O => {
		this.checkLock();

		if (
			undefined === this.#outerBuilder ||
			index >= this.size ||
			-index > this.size
		) {
			return OptLazy(otherwise) as O;
		}

		if (index < 0) index = this.size + index;

		Int.checkAtLeastZero(index);

		const result = this.#outerBuilder.remove(index);
		this.#outerBuilder = this.#outerBuilder.normalized();

		return result;
	};

	removeAmountAt = <R>(
		index: number,
		amount: number,
		collector: Reducer<T, R> = Reducer.nonEmpty as Reducer<T, R>,
	): R => {
		const symbol = Symbol();

		const removed = collector.compile();

		for (let i = 0; i < amount; i++) {
			const value = this.removeAt(index, symbol);
			if (symbol === value) break;
			removed.next(value);
		}

		return removed.getOutput();
	};

	removeAllAt = <R>(
		indices: StreamSource<number>,
		collector: Reducer<T, R> = Reducer.nonEmpty as Reducer<T, R>,
	): R => {
		const removed = collector.compile();

		const iter = Stream.from(indices)[Symbol.iterator]();
		let index: number | undefined;
		const symbol = Symbol();

		while (undefined !== (index = iter.fastNext())) {
			const value = this.removeAt(index, symbol);
			if (symbol !== value) {
				removed.next(value);
			}
		}

		return removed.getOutput();
	};

	clear = (): void => {
		this.checkLock();
		this.#outerBuilder = undefined;
	};

	forEach = (f: (value: T) => void): void => {
		if (undefined === this.#outerBuilder) return;

		this.startIteration();

		try {
			this.#outerBuilder.forEach(f);
		} finally {
			this.endIteration();
		}
	};

	build = (): List<T> => {
		if (undefined === this.#outerBuilder) {
			return this.context.empty();
		}

		return this.#outerBuilder.build();
	};

	buildMap = <T2>(f: (element: T) => T2): List<T2> => {
		if (undefined === this.#outerBuilder) {
			return this.context.empty();
		}

		return this.#outerBuilder.buildMap(f, new CacheMap());
	};

	_verifyStructure(
		errors: string[] = [],
		enforceMinChildren = false,
	): string[] {
		if (undefined !== this.#outerBuilder) {
			return this.#outerBuilder._verifyStructure(errors, enforceMinChildren);
		}

		return errors;
	}
}
