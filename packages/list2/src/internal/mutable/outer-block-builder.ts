import type { OptLazy } from '@rimbu/common';

import type { OuterChildren } from '#advanced/children-ops';
import type { ListContext } from '#list/context';
import type { OuterBlock } from '#list/immutable/outer-block';
import type { BlockBuilder, OuterBuilder } from '#list/mutable/common';

import { throwInvalidUsageError } from '@rimbu/base';

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
		if (undefined !== this.#source) {
			return this.#source.at(index, otherwise);
		}

		return this.#ops.at(this.#children, index, otherwise);
	}

	get(index: number): T {
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
			this.context.outerBlock(this.#ops.safeCopy(this.#children))
		);
	}

	buildMap<T2>(f: (value: T) => T2): OuterBlock<T2> {
		return (
			this.#source?.map(f) ??
			this.context.outerBlock(this.#ops.map(this.#children, f))
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
}
