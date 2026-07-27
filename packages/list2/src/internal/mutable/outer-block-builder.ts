import type { OuterChildren } from '#advanced/children-ops';
import type { ListContext } from '#list/context';
import type { OuterBlock } from '#list/immutable/outer-block';
import type { BlockBuilder, OuterBuilder } from '#list/mutable/common';

import { throwInvalidUsageError } from '@rimbu/base';
import { OptLazy } from '@rimbu/common';
export class OuterBlockBuilder<T>
	implements OuterBuilder<T>, BlockBuilder<T, T>
{
	constructor(
		readonly context: ListContext<T>,
		source?: OuterBlock<T>,
		children?: OuterChildren<T>,
	) {
		if (undefined === source && undefined === children) {
			throwInvalidUsageError('Either source or children must be defined');
		}
		if (undefined !== source && undefined !== children) {
			throwInvalidUsageError(
				'Either source or children must be defined, but not both',
			);
		}

		this.#source = source;
		this.#_children = children;
	}

	#source: OuterBlock<T> | undefined;
	#_children: OuterChildren<T> | undefined;

	get #ops() {
		return this.context.childrenOps;
	}

	get #children(): OuterChildren<T> {
		return this.#_children as OuterChildren<T>;
	}

	set #children(value: OuterChildren<T>) {
		this.#_children = value;
	}

	get size(): number {
		return this.#source?.size ?? this.context.childrenOps.size(this.#children);
	}

	get nrChildren(): number {
		return this.size;
	}

	get canAddChild(): boolean {
		return this.nrChildren < this.context.maxBlockSize;
	}

	get canRemoveChild(): boolean {
		return this.nrChildren > this.context.minBlockSize;
	}

	get childrenInMax(): boolean {
		return this.nrChildren <= this.context.maxBlockSize;
	}

	get childrenInMin(): boolean {
		return this.nrChildren >= this.context.minBlockSize;
	}

	#prepareMutate(): void {
		if (undefined === this.#source) return;

		this.#_children = this.#source.copyChildren();
		this.#source = undefined;
	}

	#copy(children: OuterChildren<T>): OuterBlockBuilder<T> {
		return this.context.outerBlockBuilder(children);
	}

	at<O>(index: number, otherwise?: OptLazy<O>): T | O {
		const size = this.size;
		if (index >= size || -index > size) {
			return OptLazy(otherwise) as O;
		}

		if (index < 0) {
			index = size + index;
		}

		return this.get(index);
	}

	get(index: number): T {
		if (undefined !== this.#source) {
			return this.#source.get(index);
		}

		return this.#ops.at(this.#children, index);
	}

	prepend(element: T): void {
		this.#prepareMutate();
		this.#children = this.#ops.mutatePrepend(this.#children, element);
	}

	append(element: T): void {
		this.#prepareMutate();
		this.#children = this.#ops.mutateAppend(this.#children, element);
	}

	dropFirstChild(): T {
		this.#prepareMutate();
		const [newChildren, dropped] = this.#ops.mutateDropFirst(this.#children);
		this.#children = newChildren;
		return dropped;
	}

	dropLastChild(): T {
		this.#prepareMutate();
		const [newChildren, dropped] = this.#ops.mutateDropLast(this.#children);
		this.#children = newChildren;
		return dropped;
	}

	forEach(f: (value: T) => void): void {
		if (undefined !== this.#source) {
			this.#source.forEach(f);
			return;
		}

		this.#ops.forEach(this.#children, f);
	}

	build(): OuterBlock<T> {
		return (
			this.#source ??
			this.context.outerBlockLeftRight(this.#ops.safeCopy(this.#children))
		);
	}

	buildMap<T2>(f: (value: T) => T2): OuterBlock<T2> {
		return (
			this.#source?.map(f) ??
			this.context.outerBlockLeftRight(this.#ops.map(this.#children, f))
		);
	}

	normalized(): OuterBuilder<T> | undefined {
		const length = this.size;

		if (length <= 0) {
			// block is empty
			return undefined;
		}

		if (length <= this.context.maxBlockSize) {
			// block is normal
			return this;
		}

		// need to split block and create tree
		const newRight = this.splitRight();
		return this.context.outerTreeBuilder(this, newRight, undefined, length);
	}

	splitRight(index = this.size >>> 1): OuterBlockBuilder<T> {
		this.#prepareMutate();

		const [newChildren, rightChildren] = this.#ops.mutateSplice(
			this.#children,
			index,
		);
		this.#children = newChildren;
		return this.#copy(rightChildren);
	}

	prependItems(other: OuterBlockBuilder<T>): void {
		this.#prepareMutate();

		if (undefined !== other.#source) {
			this.#children = other.#source.concatChildren(this.#children);
		} else {
			this.#children = this.#ops.concat(other.#children, this.#children);
		}
	}

	appendItems(other: OuterBlockBuilder<T>): void {
		this.#prepareMutate();

		if (undefined !== other.#source) {
			this.#children = other.#source.prependChildren(this.#children);
		} else {
			this.#children = this.#ops.concat(this.#children, other.#children);
		}
	}
}
