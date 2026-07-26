import type { Stream } from '@rimbu/stream';

import type { ListContext } from '#list/context';
import type { Inner, Tree } from '#list/immutable/common';
import type { OuterBlock } from '#list/immutable/outer-block';

import { type ArrayNonEmpty, type IndexRange, OptLazy } from '@rimbu/common';

import { ListNonEmptyBase } from '#advanced/immutable/non-empty-base';
import { treeGet, treeStream } from '#list/immutable/tree';

export class OuterTree<T>
	extends ListNonEmptyBase<T>
	implements Tree<T, OuterBlock<T>>
{
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

	stream(options?: { reversed?: boolean | undefined }): Stream.NonEmpty<T> {
		return treeStream(this, options);
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
		this.middle?.forEach(f);
		this.right.forEach(f);
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
		const result: T[] = [];
		this.forEach((v) => result.push(v));
		return result as ArrayNonEmpty<T>;
	}
}
