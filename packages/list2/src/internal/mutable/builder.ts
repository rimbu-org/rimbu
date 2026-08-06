// biome-ignore lint/correctness/noUnusedImports: TypesKey is used as a computed property key, which Biome does not detect
import type { TypesKey } from '@rimbu/collection-types/types';
import type { List } from '@rimbu/list';
import type { StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context';
import type { OuterBuilder } from '#list/mutable/common';

import { Int } from '@rimbu/base';
import { CollectionBuilderBase } from '@rimbu/collection-types/advanced/capabilities/base';
import { OptLazy } from '@rimbu/common';
import { Stream } from '@rimbu/stream';

import { CacheMap } from '#list/immutable/cache-map';

export class ListBuilder<T>
	extends CollectionBuilderBase<T>
	implements List.Builder<T>
{
	declare readonly [TypesKey]: List.Advanced.Types<T>;

	constructor(
		readonly context: ListContext<T>,
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
		const result = this.updateAt(index, () => value);
		if (undefined === result) {
			return OptLazy(otherwise) as O;
		}
		return result[0];
	};

	updateAt = (
		index: number,
		f: (element: T) => T,
	): [previous: T, current: T] | undefined => {
		if (
			undefined === this.#outerBuilder ||
			-index > this.size ||
			index >= this.size
		) {
			return undefined;
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

	removeAt = <O>(index: number, otherwise: OptLazy<O>): T | O => {
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
}
