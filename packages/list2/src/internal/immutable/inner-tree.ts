import type { Stream } from '@rimbu/stream';

import type { ListContext } from '#list/context';
import type { Block, Inner } from '#list/immutable/common';
import type { InnerBlock } from '#list/immutable/inner-block';
import type { InnerTreeBuilder } from '#list/mutable/inner-tree-builder';

import { treeGet, treeStream } from '#list/immutable/tree';
export class InnerTree<T, C extends Block<T>> implements Inner<T, C> {
	constructor(
		readonly context: ListContext<T, true>,
		readonly left: InnerBlock<T, C>,
		readonly right: InnerBlock<T, C>,
		readonly middle: Inner<T, InnerBlock<T, C>> | null,
		readonly size: number,
		readonly level: number,
	) {}

	#copy(
		left = this.left,
		right = this.right,
		middle = this.middle,
		size = this.size,
		level = this.level,
	): InnerTree<T, C> {
		if (
			left === this.left &&
			right === this.right &&
			middle === this.middle &&
			size === this.size &&
			level === this.level
		) {
			return this;
		}

		return this.context.innerTree(left, right, middle, size, level);
	}

	#copyAsType<T2, C2 extends Block<T2>>(
		left: InnerBlock<T2, C2>,
		right: InnerBlock<T2, C2>,
		middle: Inner<T2, InnerBlock<T2, C2>> | null,
		size = this.size,
		level = this.level,
	): InnerTree<T2, C2> {
		return this.context.innerTree(left, right, middle, size, level);
	}

	stream(options?: { reversed?: boolean }): Stream.NonEmpty<T> {
		return treeStream(this, options);
	}

	_get(index: number): T {
		return treeGet(this, index);
	}

	forEach(f: (element: T) => void): void {
		this.left.forEach(f);
		this.middle?.forEach(f);
		this.right.forEach(f);
	}

	map<T2>(f: (element: T) => T2): InnerTree<T2, any> {
		return this.#copyAsType(
			this.left.map(f),
			this.right.map(f),
			this.middle?.map(f) ?? null,
			this.size,
			this.level,
		);
	}

	prependChild(child: C): InnerTree<T, C> {
		const newSize = this.size + child.size;

		if (this.left._canAddChild) {
			return this.#copy(
				this.left._prependBlockChild(child),
				undefined,
				undefined,
				newSize,
			);
		}

		// left block full, see if right block can take one from left and add the new value to left
		if (null === this.middle && this.right._canAddChild) {
			const [newLeft, shiftToRightChild] = this.left.dropLastChild();
			const newRight = this.right._prependBlockChild(shiftToRightChild);
			return this.#copy(
				newLeft!._prependBlockChild(child),
				newRight,
				undefined,
				newSize,
			);
		}

		// left block full, see if first middle block can take one from left and add the new child to left
		if (this.middle) {
			let newLeft: InnerBlock<T, C> | null = this.left;

			const newMiddle = this.middle.modifyFirstChild((firstMiddleBlock) => {
				if (!firstMiddleBlock._canAddChild) return firstMiddleBlock;

				const [droppedLeft, shiftToMiddleChild] = this.left.dropLastChild();

				newLeft = droppedLeft;
				return firstMiddleBlock._prependBlockChild(shiftToMiddleChild);
			});

			if (newMiddle !== this.middle) {
				return this.#copy(
					newLeft?._prependBlockChild(child) ??
						this.context.innerBlock([child], child.size, this.level),
					undefined,
					newMiddle,
					newSize,
				);
			}
		}

		// no middle of first middle block full, shift whole left to middle and add new child to left
		const newMiddle =
			this.middle?.prependChild(this.left) ??
			this.context.innerBlock<T, InnerBlock<T, C>>(
				[this.left],
				this.left.size,
				this.level + 1,
			);

		return this.#copy(
			this.context.innerBlock([child], child.size, this.left.level),
			undefined,
			newMiddle,
			newSize,
		);
	}

	appendChild(child: C): InnerTree<T, C> {
		const newLength = this.size + child.size;

		if (this.right._canAddChild) {
			return this.#copy(
				undefined,
				this.right._appendBlockChild(child),
				undefined,
				newLength,
			);
		}

		// right block full, see if left block can take one from right and add the new value to right
		if (null === this.middle && this.left._canAddChild) {
			const [newRight, shiftToLeftChild] = this.right.dropFirstChild();
			const newLeft = this.left._appendBlockChild(shiftToLeftChild);
			return this.#copy(
				newLeft,
				newRight!._appendBlockChild(child),
				undefined,
				newLength,
			);
		}

		// right block full, see if first middle block can take one from right and add the new child to right
		if (this.middle) {
			let newRight: InnerBlock<T, C> | null = this.right;

			const newMiddle = this.middle.modifyLastChild((lastMiddleBlock) => {
				if (!lastMiddleBlock._canAddChild) return lastMiddleBlock;

				const [droppedRight, shiftToMiddleChild] = this.right.dropFirstChild();

				newRight = droppedRight;
				return lastMiddleBlock._appendBlockChild(shiftToMiddleChild);
			});

			if (newMiddle !== this.middle) {
				return this.#copy(
					undefined,
					newRight?._appendBlockChild(child) ??
						this.context.innerBlock([child], child.size, this.level),
					newMiddle,
					newLength,
				);
			}
		}

		// no middle or last middle block full, shift whole right to middle and add new child to right
		const newMiddle =
			this.middle?.appendChild(this.right) ??
			this.context.innerBlock<T, InnerBlock<T, C>>(
				[this.right],
				this.right.size,
				this.level + 1,
			);

		return this.#copy(
			undefined,
			this.context.innerBlock([child], child.size, this.right.level),
			newMiddle,
			newLength,
		);
	}

	modifyFirstChild(f: (child: C) => C): InnerTree<T, C> | undefined {
		const firstChild = this.left.childAt(0);
		const newFirstChild = f(firstChild);

		if (newFirstChild === firstChild) return this;

		const delta = newFirstChild.size - firstChild.size;
		const newLeft = this.left.withChild(0, newFirstChild);

		return this.#copy(newLeft, undefined, undefined, this.size + delta);
	}

	modifyLastChild(f: (child: C) => C): InnerTree<T, C> | undefined {
		const lastChild = this.right.childAt(-1);
		const newLastChild = f(lastChild);

		if (newLastChild === lastChild) return this;

		const delta = newLastChild.size - lastChild.size;
		const newRight = this.right.withChild(-1, newLastChild);

		return this.#copy(undefined, newRight, undefined, this.size + delta);
	}

	dropFirstChild(): [Inner<T, C> | null, C] {
		const [newLeft, firstChild] = this.left.dropFirstChild();

		if (null === newLeft) {
			if (null === this.middle) {
				return [this.right, firstChild];
			}

			const [newMiddle, toLeft] = this.middle.dropFirstChild();
			const newSelf = this.#copy(
				toLeft,
				undefined,
				newMiddle,
				this.size - firstChild.size,
			);
			//.#normalize();

			return [newSelf, firstChild];
		}

		const newSelf = this.#copy(
			newLeft,
			undefined,
			undefined,
			this.size - firstChild.size,
		);
		//.#normalize();

		return [newSelf, firstChild];
	}

	dropLastChild(): [Inner<T, C> | null, C] {
		// drop last from the right block
		const [newRight, lastChild] = this.right.dropLastChild();

		if (null === newRight) {
			if (null === this.middle) {
				// drop right
				return [this.left, lastChild];
			}

			// move last middle to right
			const [newMiddle, toRight] = this.middle.dropLastChild();
			const newSelf = this.#copy(
				undefined,
				toRight,
				newMiddle,
				this.size - lastChild.size,
			);
			//.#normalize();

			return [newSelf, lastChild];
		}

		// set the new right to right
		const newSelf = this.#copy(
			undefined,
			newRight,
			undefined,
			this.size - lastChild.size,
		);
		//.#normalize();

		return [newSelf, lastChild];
	}

	concat(other: Inner<T, C>): Inner<T, C> {
		return other.prependTree(this);
	}

	prependBlock(leftBlock: InnerBlock<T, C>): Inner<T, C> {
		return 0 as any;
	}

	prependTree(leftTree: InnerTree<T, C>): Inner<T, C> {
		return 0 as any;
	}

	toArray(): T[] {
		return ([] as T[]).concat(
			this.left.toArray(),
			this.middle?.toArray() ?? [],
			this.right.toArray(),
		);
	}

	toBuilder(): InnerTreeBuilder<T, any> {
		return this.context.innerTreeBuilderSource(this);
	}

	// #normalize(): Inner<T, C> {
	// 	if (null === this.middle) {
	// 		if (
	// 			this.left._nrChildren + this.right._nrChildren <=
	// 			this.context.maxBlockSize
	// 		) {
	// 			// can merge left and right
	// 			return this.left.concat(this.right);
	// 		}

	// 		return this;
	// 	}

	// 	const normalized1 = this.middle.normalizeWith

	// 	this.middle.modifyFirstChild((firstMiddleBlock) => {
	// 		if (
	// 			this.left._nrChildren + firstMiddleBlock._nrChildren >=
	// 			this.context.maxBlockSize
	// 		) {
	// 			return;
	// 		}

	// 	});

	// 	if (this.context.isInnerBlock<T, C>(this.middle)) {
	// 		const firstChild = this.middle.children[0];

	// 		if (
	// 			this.left.nrChildren + firstChild.nrChildren <=
	// 			this.context.maxBlockSize
	// 		) {
	// 			// first middle child can be merged with left
	// 			const [newMiddle, block] = this.middle.dropFirstChild();

	// 			if (this.context.isInnerBlock<T, C>(block)) {
	// 				return this.copy(
	// 					this.left.concatChildren(block),
	// 					undefined,
	// 					newMiddle,
	// 				)._normalize();
	// 			}

	// 			throwInvalidStateError();
	// 		}

	// 		const lastChild = this.middle.children[this.middle.nrChildren - 1];

	// 		if (
	// 			this.right.nrChildren + lastChild.nrChildren <=
	// 			this.context.maxBlockSize
	// 		) {
	// 			// last middle child can be merged with right
	// 			const [newMiddle, block] = this.middle.dropLastChild();

	// 			if (this.context.isInnerBlock<T, C>(block)) {
	// 				return this.copy(
	// 					undefined,
	// 					block.concatChildren(this.right),
	// 					newMiddle,
	// 				)._normalize();
	// 			}

	// 			throwInvalidStateError();
	// 		}
	// 	}

	// 	return this;
	// }
}
