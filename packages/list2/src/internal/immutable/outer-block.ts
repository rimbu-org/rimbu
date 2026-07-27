import type { List } from '@rimbu/list';
import type { Stream } from '@rimbu/stream';

import type { OuterChildren } from '#advanced/children-ops';
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

export abstract class OuterBlock<T>
	extends ListNonEmptyBase<T>
	implements Block<T, T>
{
	declare _self: OuterBlock<T>;

	constructor(readonly context: ListContext<T, true>) {
		super(context);
	}

	abstract get size(): number;
	abstract get(index: number): T;
	abstract stream(options?: {
		reversed?: boolean | undefined;
	}): Stream.NonEmpty<T>;
	abstract streamSlice(
		range: IndexRange,
		options?: { reversed?: boolean | undefined },
	): Stream<T>;
	abstract forEach(f: (element: T) => void): void;
	abstract filter(f: (element: T) => boolean): List<T>;
	abstract filterIndexed(
		f: (element: T, index: number, halt: () => void) => boolean,
		options?: {
			reversed?: boolean | undefined;
			negate?: boolean | undefined;
			state?: TraverseState;
		},
	): List<T>;
	abstract toArray(): ArrayNonEmpty<T>;
	abstract map<T2>(f: (element: T) => T2): OuterBlock<T2>;
	abstract appendBlockChild(child: T): OuterBlock<T>;
	abstract prependBlockChild(child: T): OuterBlock<T>;
	abstract createOuterBlock(element: T): OuterBlock<T>;
	abstract copyChildren(): OuterChildren<T>;
	abstract takeChildren(amount: number): OuterBlock<T>;
	abstract dropChildren(amount: number): OuterBlock<T>;
	abstract concatChildren(children: OuterChildren<T>): OuterChildren<T>;
	abstract prependChildren(children: OuterChildren<T>): OuterChildren<T>;

	get nrChildren(): number {
		return this.size;
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

	at<O>(index: number, otherwise?: OptLazy<O>): T | O {
		const size = this.size;
		if (-index > size || index >= size) {
			return OptLazy(otherwise) as O;
		}
		return this.get(index);
	}

	first(): T {
		return this.get(0);
	}

	last(): T {
		return this.at(-1);
	}

	take(count: number): List<T> {
		if (count <= 0) {
			if (count === 0) return this.context.empty();
			if (-count >= this.size) return this;
		} else if (count >= this.size) {
			return this;
		}

		return this.takeChildren(count);
	}

	drop(count: number): List<T> {
		if (count <= 0) {
			if (count === 0) return this;
			if (-count >= this.size) return this.context.empty();
		} else if (count >= this.size) {
			return this.context.empty();
		}

		return this.dropChildren(count);
	}

	prepend(element: T): List.NonEmpty<T> {
		if (this.canAddChild) {
			return this.prependBlockChild(element);
		}

		return this.context.outerTree<T>(
			this.createOuterBlock(element),
			this,
			null,
			this.size + 1,
		);
	}

	append(element: T): List.NonEmpty<T> {
		if (this.canAddChild) {
			return this.appendBlockChild(element);
		}

		return this.context.outerTree(
			this,
			this.createOuterBlock(element),
			null,
			this.size + 1,
		);
	}

	placeAt(): List.NonEmpty<T> {
		return 0 as any;
	}

	dropFirstChild(): [OuterBlock<T>, T] {
		const first = this.first();
		const newSelf = this.dropChildren(1);
		return [newSelf, first];
	}

	dropLastChild(): [OuterBlock<T>, T] {
		const last = this.last();
		const newSelf = this.dropChildren(-1);
		return [newSelf, last];
	}

	toBuilder(): OuterBlockBuilder<T> {
		return this.context.outerBlockBuilderSource(this);
	}
}
