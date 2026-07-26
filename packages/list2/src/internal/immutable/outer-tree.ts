import type { Stream } from '@rimbu/stream';

import type { ListContext } from '#list/context';
import type { Inner, Tree } from '#list/immutable/common';
import type { OuterBlock } from '#list/immutable/outer-block';

import {
	type ArrayNonEmpty,
	type IndexRange,
	OptLazy,
	type TraverseState,
} from '@rimbu/common';

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

	#copy(
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

	#copyAsType<T2>(
		left: OuterBlock<T2>,
		right: OuterBlock<T2>,
		middle: Inner<T2, OuterBlock<T2>> | null,
		size = this.size,
	): OuterTree<T2> {
		return this.context.outerTree(left, right, middle, size);
	}

	get #ops() {
		return this.context.childrenOps;
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

		if (index < 0) {
			index = size + index;
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
		const newSize = this.size + 1;

		if (this.left.canAddChild) {
			return this.#copy(
				this.left.prependBlockChild(element),
				this.right,
				this.middle,
				newSize,
			);
		}

		// left block full, see if right block can take one from left and add the new value to left
		if (null === this.middle && this.right.canAddChild) {
			const [newLeft, shiftToRightChild] = this.left.dropLastChild();
			const newRight = this.right.prependBlockChild(shiftToRightChild);
			return this.#copy(
				newLeft.prependBlockChild(element),
				newRight,
				undefined,
				newSize,
			);
		}

		// left block full, see if first middle block can take one from left and add the new value to left
		if (this.middle) {
			const newMiddle = this.middle.modifyFirstChild((block) => {
				if (!block.canAddChild) return block;

				return block.prependBlockChild(this.left.last());
			});

			if (newMiddle !== this.middle) {
				const newLeft = this.left.dropChildren(-1).prependBlockChild(element);
				return this.#copy(newLeft, undefined, newMiddle, newSize);
			}
		}

		// no middle or first middle block full, shift whole left to middle and add new value to left
		const newMiddle =
			this.middle?.prependChild(this.left) ??
			this.context.innerBlock([this.left], this.left.size, 1);

		return this.#copy(
			this.context.outerBlock(this.#ops.of([element])),
			this.right,
			newMiddle,
			newSize,
		);
	}

	append(element: T): OuterTree<T> {
		const newLength = this.size + 1;

		if (this.right.canAddChild) {
			return this.#copy(
				this.left,
				this.right.appendBlockChild(element),
				this.middle,
				newLength,
			);
		}

		// right block full, see if left block can take one from right and add the new value to right
		if (null === this.middle && this.left.canAddChild) {
			const [newRight, shiftToLeftChild] = this.right.dropFirstChild();
			const newLeft = this.left.appendBlockChild(shiftToLeftChild);
			return this.#copy(
				newLeft,
				newRight.appendBlockChild(element),
				undefined,
				newLength,
			);
		}

		// right block full, see if first middle block can take one from right and add the new value to right
		if (this.middle) {
			const newMiddle = this.middle.modifyLastChild((lastMiddleBlock) => {
				if (!lastMiddleBlock.canAddChild) return lastMiddleBlock;

				return lastMiddleBlock.appendBlockChild(this.right.first());
			});

			if (newMiddle !== this.middle) {
				const newRight = this.right.dropChildren(1).appendBlockChild(element);
				return this.#copy(undefined, newRight, newMiddle, newLength);
			}
		}

		// no middle or first middle block full, shift whole right to middle and add new value to right
		const newMiddle =
			this.middle?.appendChild(this.right) ??
			this.context.innerBlock<T, OuterBlock<T>>(
				[this.right],
				this.right.size,
				1,
			);

		return this.#copy(
			undefined,
			this.context.outerBlock(this.#ops.of([element])),
			newMiddle,
			newLength,
		);
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
		// const result = this.left
		// 	.filter(f)
		// 	.concat(this.middle?.filter(f), this.right.filter(f));
	}

	filterIndexed(
		f: (element: T, index: number, halt: () => void) => boolean,
		options: {
			reversed?: boolean | undefined;
			negate?: boolean | undefined;
			state?: TraverseState;
		} = {},
	): OuterTree<T> {
		// const { reversed = false } = options;

		// if (reversed) {
		//     return this.right.filterIndexed(f, options).concat(
		//         this.middle?.filterIndexed(f, options),
		//         this.left.filterIndexed(f, options)
		//     );
		// }

		// return this.left.filterIndexed(f, options).concat(
		//     this.middle?.filterIndexed(f, options),
		//     this.right.filterIndexed(f, options)
		// );
		return 0 as any;
	}

	map<T2>(f: (element: T) => T2): OuterTree<T2> {
		return this.#copyAsType(
			this.left.map(f),
			this.right.map(f),
			this.middle?.map(f) ?? null,
			this.size,
		);
	}

	toArray(): ArrayNonEmpty<T> {
		return ([] as T[]).concat(
			this.left.toArray(),
			this.middle?.toArray() ?? [],
			this.right.toArray(),
		) as ArrayNonEmpty<T>;
	}
}
