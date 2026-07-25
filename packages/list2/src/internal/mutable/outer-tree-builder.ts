import type { List } from '@rimbu/list';

import type { ListContext } from '#list/context';
import type { OuterTree } from '#list/immutable/outer-tree';
import type { InnerBuilder, OuterBuilder } from '#list/mutable/common';
import type { OuterBlockBuilder } from '#list/mutable/outer-block-builder';

import { throwInvalidStateError } from '@rimbu/base';
import { OptLazy } from '@rimbu/common/opt-lazy';

export class OuterTreeBuilder<T> implements OuterBuilder<T> {
	constructor(
		readonly context: ListContext<T>,
		source?: OuterTree<T>,
		_left?: OuterBlockBuilder<T>,
		_right?: OuterBlockBuilder<T>,
		_middle?: InnerBuilder<T, OuterBlockBuilder<T>>,
		size: number = source?.size ?? 0,
	) {
		this.#source = source;
		this.#_left = _left;
		this.#_right = _right;
		this.#_middle = _middle;
		this.#size = size;
	}

	#source: OuterTree<T> | undefined;
	#_left: OuterBlockBuilder<T> | undefined;
	#_right: OuterBlockBuilder<T> | undefined;
	#_middle: InnerBuilder<T, OuterBlockBuilder<T>> | undefined;

	#size: number;

	get size(): number {
		return this.#size;
	}

	get #left(): OuterBlockBuilder<T> {
		return this.#_left!;
	}

	get #right(): OuterBlockBuilder<T> {
		return this.#_right!;
	}

	get #middle(): InnerBuilder<T, OuterBlockBuilder<T>> | undefined {
		return this.#_middle;
	}

	#prepareMutate(): void {
		if (undefined === this.#source) return;

		this.#_left = this.context.outerBlockBuilderSource(this.#source.left);
		this.#_right = this.context.outerBlockBuilderSource(this.#source.right);
		this.#_middle =
			null === this.#source.middle
				? undefined
				: this.#source.middle.toBuilder();
		this.#source = undefined;
	}

	at<O>(index: number, otherwise?: OptLazy<O> | undefined): O | T {
		if (undefined !== this.#source) {
			return this.#source.at(index, otherwise);
		}

		const size = this.size;
		if (index >= size || -index > size) {
			return OptLazy(otherwise) as O;
		}
		if (index < 0) {
			index = size - index;
		}

		const middleIndex = index - this.#left.size;

		if (middleIndex < 0) {
			// index is in left part
			return this.#left.at(index);
		}

		const rightIndex = middleIndex - (this.#middle?.length ?? 0);

		if (rightIndex >= 0) {
			// index is in right part
			return this.#right.at(rightIndex);
		}

		if (undefined === this.#middle) {
			throwInvalidStateError();
		}

		// index is in middle part
		return this.#middle.get(middleIndex);
	}

	prepend(value: T): void {
		this.#prepareMutate();

		throw new Error('Method not implemented.');
	}

	append(value: T): void {
		this.#prepareMutate();

		throw new Error('Method not implemented.');
	}

	forEach(f: (element: T) => void): void {
		throw new Error('Method not implemented.');
	}

	build(): List<T> {
		throw new Error('Method not implemented.');
	}

	buildMap<T2>(f: (value: T) => T2): List<T2> {
		throw new Error('Method not implemented.');
	}

	normalized(): OuterBuilder<T> | undefined {
		throw new Error('Method not implemented.');
	}
}
