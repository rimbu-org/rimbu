import type { List } from '@rimbu/list';
import type { StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context';
import type { OuterBuilder } from '#list/mutable/common';

import { CollectionBuilderBase } from '@rimbu/collection-types/advanced/capabilities/base';
import { OptLazy } from '@rimbu/common';
import { Stream } from '@rimbu/stream';

export class ListBuilder<T>
	extends CollectionBuilderBase<T>
	implements List.Builder<T>
{
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

	at<O>(index: number, otherwise?: OptLazy<O>): T | O {
		if (undefined === this.#outerBuilder) {
			return OptLazy(otherwise) as O;
		}

		return this.#outerBuilder.at(index, otherwise);
	}

	first<O>(otherwise?: OptLazy<O>): T | O {
		if (undefined === this.#outerBuilder) {
			return OptLazy(otherwise) as O;
		}
		return this.#outerBuilder.at(0, otherwise);
	}

	last<O>(otherwise?: OptLazy<O>): T | O {
		if (undefined === this.#outerBuilder) {
			return OptLazy(otherwise) as O;
		}
		return this.#outerBuilder.at(-1, otherwise);
	}

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

	clear(): void {
		this.checkLock();
		this.#outerBuilder = undefined;
	}

	forEach = (f: (value: T) => void): void => {
		if (undefined === this.#outerBuilder) return;

		this.startIteration();

		try {
			this.#outerBuilder.forEach(f);
		} finally {
			this.endIteration();
		}
	};

	build(): List<T> {
		if (undefined === this.#outerBuilder) {
			return this.context.empty();
		}

		return this.#outerBuilder.build();
	}
}
