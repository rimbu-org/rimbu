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

	get(index: number): T {
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

		if (this.left.canAddChild) {
			return this.#copy(
				this.left.prependBlockChild(child),
				undefined,
				undefined,
				newSize,
			);
		}

		// left block full, see if right block can take one from left and add the new value to left
		if (null === this.middle && this.right.canAddChild) {
			const [newLeft, shiftToRightChild] = this.left.dropLastChild();
			const newRight = this.right.prependBlockChild(shiftToRightChild);
			return this.#copy(
				newLeft!.prependBlockChild(child),
				newRight,
				undefined,
				newSize,
			);
		}

		// left block full, see if first middle block can take one from left and add the new child to left
		if (this.middle) {
			let newLeft: InnerBlock<T, C> | null = this.left;

			const newMiddle = this.middle.modifyFirstChild((firstMiddleBlock) => {
				if (!firstMiddleBlock.canAddChild) return firstMiddleBlock;

				const [droppedLeft, shiftToMiddleChild] = this.left.dropLastChild();

				newLeft = droppedLeft;
				return firstMiddleBlock.prependBlockChild(shiftToMiddleChild);
			});

			if (newMiddle !== this.middle) {
				return this.#copy(
					newLeft?.prependBlockChild(child) ??
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

		if (this.right.canAddChild) {
			return this.#copy(
				undefined,
				this.right.appendBlockChild(child),
				undefined,
				newLength,
			);
		}

		// right block full, see if left block can take one from right and add the new value to right
		if (null === this.middle && this.left.canAddChild) {
			const [newRight, shiftToLeftChild] = this.right.dropFirstChild();
			const newLeft = this.left.appendBlockChild(shiftToLeftChild);
			return this.#copy(
				newLeft,
				newRight!.appendBlockChild(child),
				undefined,
				newLength,
			);
		}

		// right block full, see if first middle block can take one from right and add the new child to right
		if (this.middle) {
			let newRight: InnerBlock<T, C> | null = this.right;

			const newMiddle = this.middle.modifyLastChild((lastMiddleBlock) => {
				if (!lastMiddleBlock.canAddChild) return lastMiddleBlock;

				const [droppedRight, shiftToMiddleChild] = this.right.dropFirstChild();

				newRight = droppedRight;
				return lastMiddleBlock.appendBlockChild(shiftToMiddleChild);
			});

			if (newMiddle !== this.middle) {
				return this.#copy(
					undefined,
					newRight?.appendBlockChild(child) ??
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
}
