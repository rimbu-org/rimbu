import type { Stream } from '@rimbu/stream';

import type { ListContext } from '#list/context';
import type { Inner } from '#list/immutable/common';
import type { OuterBlock } from '#list/immutable/outer-block';

import {
	type ArrayNonEmpty,
	type IndexRange,
	OptLazy,
	TraverseState,
} from '@rimbu/common';

import { ListNonEmptyBase } from '#advanced/immutable/non-empty-base';
import { treeGet } from '#list/immutable/tree';

export class OuterTree<T> extends ListNonEmptyBase<T> {
	constructor(
		readonly context: ListContext<T, true>,
		readonly left: OuterBlock<T>,
		readonly right: OuterBlock<T>,
		readonly middle: Inner<T, OuterBlock<T>> | null,
		readonly size: number,
	) {
		super(context);
	}

	copy(
		left = this.left,
		right = this.right,
		middle = this.middle,
		size = this.size,
	): OuterTree<T> {
		if (
			left === this.left &&
			right === this.right &&
			middle === this.middle &&
			size === this.size
		) {
			return this;
		}

		return this.context.outerTree(left, right, middle, size);
	}

	copy2<T2>(
		left: OuterBlock<T2>,
		right: OuterBlock<T2>,
		middle: Inner<T2, OuterBlock<T2>> | null,
		size = this.size,
	): OuterTree<T2> {
		return this.context.outerTree(left, right, middle, size);
	}

	stream(): Stream.NonEmpty<T> {
		return this.left.stream().concat(
			// this.middle?.stream(),
			this.right.stream(),
		);
	}

	streamSlice(
		range: IndexRange,
		options?: { reversed?: boolean | undefined },
	): Stream<T> {
		return 0 as any;
	}

	at<O>(index: number, otherwise?: OptLazy<O>): T | O {
		const size = this.size;
		if (-index > size || index >= size) {
			return OptLazy(otherwise) as O;
		}

		return this.get(index);
	}

	get(index: number): T {
		return treeGet(this, index);
	}

	first(): T {
		return this.left.first();
	}

	last(): T {
		return this.right.last();
	}

	prepend(element: T): OuterTree<T> {
		return 0 as any;
	}

	append(element: T): OuterTree<T> {
		return 0 as any;
	}

	placeAt(index: number, element: T): OuterTree<T> {
		return 0 as any;
	}

	take(count: number): OuterTree<T> {
		return 0 as any;
	}

	drop(count: number): OuterTree<T> {
		return 0 as any;
	}

	forEach(f: (element: T) => void): void {
		this.left.forEach(f);
		// this.middle?.forEach((block) => {
		// 	block.forEach(f);
		// });
		this.right.forEach(f);
	}

	forEachIndexed(
		f: (element: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;
		this.left.forEachIndexed(f, { state });
		if (state.halted) return;
		// this.middle.
		if (state.halted) return;
		this.right.forEachIndexed(f, { state });
	}

	filter(f: (element: T) => boolean): OuterTree<T> {
		return 0 as any;
	}

	filterIndexed(
		f: (element: T, index: number, halt: () => void) => boolean,
	): OuterTree<T> {
		return 0 as any;
	}

	map<T2>(f: (element: T) => T2): OuterTree<T2> {
		return this.copy2(this.left.map(f), this.right.map(f), null, this.size);
	}

	toArray(): ArrayNonEmpty<T> {
		return this.left.toArray().concat(
			// this.middle,
			this.right.toArray(),
		) as ArrayNonEmpty<T>;
	}
}
