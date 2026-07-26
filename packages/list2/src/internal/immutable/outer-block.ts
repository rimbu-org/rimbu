import type { List } from '@rimbu/list';
import type { Stream } from '@rimbu/stream';

import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';
import type { ListContext } from '#list/context';
import type { Block } from '#list/immutable/common';
import type { OuterBlockBuilder } from '#list/mutable/outer-block-builder';

import {
	type ArrayNonEmpty,
	type IndexRange,
	OptLazy,
	type TraverseState,
} from '@rimbu/common';

import { ListNonEmptyBase } from '#advanced/immutable/non-empty-base';

export class OuterBlock<T> extends ListNonEmptyBase<T> implements Block<T, T> {
	declare _self: OuterBlock<T>;

	constructor(
		readonly context: ListContext<T, true>,
		children: OuterChildren<T>,
	) {
		super(context);
		this.#children = this.#ops.guard(children);
	}

	readonly #children: OuterChildren<T>;

	get #ops(): ChildrenOps {
		return this.context.childrenOps;
	}

	get nrChildren() {
		return this.#ops.size(this.#children);
	}

	get childrenInMax(): boolean {
		return this.size <= this.context.maxBlockSize;
	}

	get childrenInMin(): boolean {
		return this.size >= this.context.minBlockSize;
	}

	get canAddChild(): boolean {
		return this.size < this.context.maxBlockSize;
	}

	get canRemoveChild(): boolean {
		return this.size > this.context.minBlockSize;
	}

	get size() {
		return this.#ops.size(this.#children);
	}

	#copy(children: any): OuterBlock<T> {
		if (children === this.#children) return this;
		return this.context.outerBlock(children);
	}

	#copyAsType<T2>(children: OuterChildren<T2>): OuterBlock<T2> {
		if ((children as any) === this.#children)
			return this as unknown as OuterBlock<T2>;
		return this.context.outerBlock(children);
	}

	stream(options?: { reversed?: boolean | undefined }): Stream.NonEmpty<T> {
		return this.#ops.stream(this.#children, options);
	}

	streamSlice(range: IndexRange, options: { reversed?: boolean }): Stream<T> {
		return this.#ops.streamRange(this.#children, range, options);
	}

	at<O>(index: number, otherwise?: OptLazy<O>): T | O {
		const size = this.size;
		if (-index > size || index >= size) {
			return OptLazy(otherwise) as O;
		}
		return this.#ops.at(this.#children, index);
	}

	get(index: number): T {
		return this.#ops.at(this.#children, index);
	}

	first(): T {
		return this.#ops.at(this.#children, 0);
	}

	last(): T {
		return this.#ops.at(this.#children, -1);
	}

	take(count: number): List<T> {
		if (count <= 0) {
			if (count === 0) return this.context.empty();
			if (-count >= this.size) return this;
		} else if (count >= this.size) {
			return this;
		}

		if (count >= 0) {
			return this.#copy(
				this.#ops.toSpliced(this.#children, count, this.size - count),
			);
		}

		return this.#copy(
			this.#ops.toSpliced(this.#children, 0, this.size + count),
		);
	}

	drop(count: number): List<T> {
		if (count <= 0) {
			if (count === 0) return this;
			if (-count >= this.size) return this.context.empty();
		} else if (count >= this.size) {
			return this.context.empty();
		}

		if (count >= 0) {
			return this.#copy(this.#ops.toSpliced(this.#children, 0, count));
		}

		return this.#copy(
			this.#ops.toSpliced(this.#children, this.size + count, -count),
		);
	}

	forEach(f: (element: T) => void): void {
		this.#ops.forEach(this.#children, f);
	}

	filter(f: (element: T) => boolean): List<T> {
		const newChildren = this.#ops.filter(this.#children, f);
		if (newChildren === this.#children) return this;

		if (this.#ops.size(newChildren) === 0) return this.context.empty();

		return this.#copy(newChildren);
	}

	filterIndexed(
		f: (element: T, index: number, halt: () => void) => boolean,
		options: {
			reversed?: boolean | undefined;
			negate?: boolean | undefined;
			state?: TraverseState;
		} = {},
	): List<T> {
		const newChildren = this.#ops.filterIndexed(this.#children, f, options);
		if (newChildren === this.#children) return this;

		if (this.#ops.size(newChildren) === 0) return this.context.empty();

		return this.#copy(newChildren);
	}

	map<T2>(f: (element: T) => T2): OuterBlock<T2> {
		return this.#copyAsType(this.#ops.map(this.#children, f));
	}

	prepend(element: T): List.NonEmpty<T> {
		if (this.canAddChild) {
			return this.prependBlockChild(element);
		}

		return this.context.outerTree<T>(
			this.context.outerBlock(this.#ops.of([element])),
			this,
			null,
			this.size + 1,
		);
	}

	prependBlockChild(child: T): OuterBlock<T> {
		return this.#copy(this.#ops.prepend(this.#children, child));
	}

	append(element: T): List.NonEmpty<T> {
		if (this.canAddChild) {
			return this.appendBlockChild(element);
		}

		return this.context.outerTree(
			this,
			this.context.outerBlock(this.#ops.of([element])),
			null,
			this.size + 1,
		);
	}

	appendBlockChild(child: T): OuterBlock<T> {
		return this.#copy(this.#ops.append(this.#children, child));
	}

	placeAt(): List.NonEmpty<T> {
		return 0 as any;
	}

	toArray(): ArrayNonEmpty<T> {
		return this.#ops.toArray(this.#children);
	}

	copyChildren(): OuterChildren<T> {
		return this.#ops.safeCopy(this.#children);
	}

	dropFirstChild(): [OuterBlock<T>, T] {
		const first = this.first();
		const newChildren = this.#ops.toSpliced(this.#children, 0, 1);
		return [this.#copy(newChildren), first];
	}

	dropLastChild(): [OuterBlock<T>, T] {
		const last = this.last();
		const newChildren = this.#ops.toSpliced(this.#children, -1, 1);
		return [this.#copy(newChildren), last];
	}

	takeChildren(amount: number): OuterBlock<T> {
		if (amount >= 0) {
			return this.#copy(
				this.#ops.toSpliced(this.#children, amount, this.size - amount),
			);
		}
		return this.#copy(
			this.#ops.toSpliced(this.#children, 0, this.size + amount),
		);
	}

	dropChildren(amount: number): OuterBlock<T> {
		if (amount >= 0) {
			return this.#copy(this.#ops.toSpliced(this.#children, 0, amount));
		}
		return this.#copy(
			this.#ops.toSpliced(this.#children, this.size + amount, -amount),
		);
	}

	toBuilder(): OuterBlockBuilder<T> {
		return this.context.outerBlockBuilderSource(this);
	}
}
