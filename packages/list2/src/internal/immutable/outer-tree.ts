import type { List } from '@rimbu/list';
import type { Stream, StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context';
import type { Inner, Tree } from '#list/immutable/common';
import type { OuterBlock } from '#list/immutable/outer-block';

import { Int } from '@rimbu/base';
import {
	type ArrayNonEmpty,
	type IndexRange,
	OptLazy,
	TraverseState,
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

		Int.checkIsNatural(index);

		return this._get(index);
	}

	_get(index: Int.Natural): T {
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

		if (this.left._canAddChild) {
			return this.#copy(
				this.left._prependBlockChild(element),
				this.right,
				this.middle,
				newSize,
			);
		}

		// left block full, see if right block can take one from left and add the new value to left
		if (null === this.middle && this.right._canAddChild) {
			const [newLeft, shiftToRightChild] = this.left._dropLastChild();
			const newRight = this.right._prependBlockChild(shiftToRightChild);
			return this.#copy(
				newLeft._prependBlockChild(element),
				newRight,
				undefined,
				newSize,
			);
		}

		// left block full, see if first middle block can take one from left and add the new value to left
		if (this.middle) {
			const newMiddle = this.middle.modifyFirstChild((block) => {
				if (!block._canAddChild) return block;

				return block._prependBlockChild(this.left.last());
			});

			if (newMiddle !== this.middle) {
				const newLeft = this.left
					._dropChildren(-1 as Int)
					._prependBlockChild(element);
				return this.#copy(newLeft, undefined, newMiddle, newSize);
			}
		}

		// no middle or first middle block full, shift whole left to middle and add new value to left
		const newMiddle =
			this.middle?.prependChild(this.left) ??
			this.context.innerBlock([this.left], this.left.size, 1);

		return this.#copy(
			this.context.outerBlockLeftRight(this.#ops.of([element])),
			this.right,
			newMiddle,
			newSize,
		);
	}

	append(element: T): OuterTree<T> {
		const newLength = this.size + 1;

		if (this.right._canAddChild) {
			return this.#copy(
				this.left,
				this.right._appendBlockChild(element),
				this.middle,
				newLength,
			);
		}

		// right block full, see if left block can take one from right and add the new value to right
		if (null === this.middle && this.left._canAddChild) {
			const [newRight, shiftToLeftChild] = this.right._dropFirstChild();
			const newLeft = this.left._appendBlockChild(shiftToLeftChild);
			return this.#copy(
				newLeft,
				newRight._appendBlockChild(element),
				undefined,
				newLength,
			);
		}

		// right block full, see if first middle block can take one from right and add the new value to right
		if (this.middle) {
			const newMiddle = this.middle.modifyLastChild((lastMiddleBlock) => {
				if (!lastMiddleBlock._canAddChild) return lastMiddleBlock;

				return lastMiddleBlock._appendBlockChild(this.right.first());
			});

			if (newMiddle !== this.middle) {
				const newRight = this.right
					._dropChildren(1 as Int)
					._appendBlockChild(element);
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
			this.context.outerBlockLeftRight(this.#ops.of([element])),
			newMiddle,
			newLength,
		);
	}

	placeAt(index: number, element: T): OuterBlock<T> {
		Int.checkIsNatural(index);

		return 0 as any;

		// if (index >= this.size) {
		// 	return this.append(element);
		// }
		// if (-index > this.size) {
		// 	return this.prepend(element);
		// }
		// return this.set
	}

	take(count: number): List<T> {
		if (count === 0) return this.context.empty();
		if (count >= this.size || -count > this.size) return this;

		if (count < 0) {
			count = this.size + count;
		}

		Int.checkIsNatural(count);

		const middleCount = count - this.left.size;

		if (!Int.isPos(middleCount)) return this.left.take(count);

		if (null === this.middle) {
			return this.#copy(
				undefined,
				this.right._takeChildren(middleCount),
				undefined,
				count,
			);
			//._normalize();
		}

		const rightCount = middleCount - this.middle.size;

		if (Int.isPos(rightCount)) {
			const newRight = this.right._takeChildren(rightCount);
			return this.#copy(undefined, newRight, undefined, count);
			//._normalize();
		}

		const [newMiddle, upRight, inUpRight] =
			this.middle.takeInternal(middleCount);

		const newRight = upRight._takeChildren(inUpRight);

		return this.#copy(undefined, newRight, newMiddle, count);
		//._normalize();
	}

	drop(count: number): List<T> {
		if (count === 0) return this;
		if (count >= this.size || -count > this.size) return this.context.empty();
		if (count < 0) {
			count = this.size + count;
		}

		Int.checkIsNatural(count);

		const newSize = this.size - count;

		const middleCount = count - this.left.size;

		if (!Int.isNatural(middleCount)) {
			const newLeft = this.left._dropChildren(count);
			return this.#copy(newLeft, undefined, undefined, newSize);
			//._normalize();
		}

		if (null === this.middle) {
			return this.right.drop(middleCount);
		}

		const rightcount = middleCount - this.middle.size;

		if (rightcount >= 0) {
			return this.right.drop(rightcount);
		}

		const [newMiddle, upLeft, inUpLeft] = this.middle.dropInternal(middleCount);
		const newLeft = upLeft._dropChildren(inUpLeft);

		return this.#copy(newLeft, undefined, newMiddle, newSize);
		//._normalize();
	}

	forEach(f: (element: T) => void): void {
		this.left.forEach(f);
		this.middle?.forEach(f);
		this.right.forEach(f);
	}

	filter(f: (element: T) => boolean): List<T> {
		const result = this.left
			.filter(f)
			.concat(this.middle?.filter(f), this.right.filter(f));

		if (result.size === this.size) return this;
		return result;
	}

	filterIndexed(
		f: (element: T, index: number, halt: () => void) => boolean,
		options: {
			reversed?: boolean | undefined;
			negate?: boolean | undefined;
			state?: TraverseState;
		} = {},
	): List<T> {
		const { reversed = false, state = TraverseState() } = options;

		if (state.halted) return this.context.empty();

		const newOptions = { ...options, state };

		const first = reversed ? this.right : this.left;

		let result = first.filterIndexed(f, newOptions);

		if (state.halted) return result;

		if (null !== this.middle) {
			result = result.concat(this.middle.filterIndexed(f, newOptions));

			if (state.halted) return result;
		}

		const last = reversed ? this.left : this.right;

		result = result.concat(last.filterIndexed(f, newOptions));

		if (result.size === this.size) return this;

		return result;
	}

	map<T2>(f: (element: T) => T2): OuterTree<T2> {
		return this.#copyAsType(
			this.left.map(f),
			this.right.map(f),
			this.middle?.map(f) ?? null,
			this.size,
		);
	}

	concat(...sources: ArrayNonEmpty<StreamSource<T>>): List.NonEmpty<T> {
		const asList = this.context.from(...sources);

		if (!asList.nonEmpty()) {
			return this;
		}

		return (asList as ListNonEmptyBase<T>)._prependTree(this);
	}

	toArray(): ArrayNonEmpty<T> {
		return ([] as T[]).concat(
			this.left.toArray(),
			this.middle?.toArray() ?? [],
			this.right.toArray(),
		) as ArrayNonEmpty<T>;
	}

	_prependBlock(leftBlock: OuterBlock<T>): OuterTree<T> {
		const newSize = this.size + leftBlock.size;

		// Case 1: Left block can be merged with current left block
		if (this.left.size + leftBlock.size <= this.context.maxBlockSize) {
			const newLeftChildren = leftBlock._concatChildren(
				this.left._copyChildren(),
			);
			const newLeftBlock = this.context.outerBlockLeftRight(newLeftChildren);
			return this.#copy(newLeftBlock, undefined, undefined, newSize);
		}

		// Case 2: Tree Left block can be merged with current middle block
		if (this.left._childrenInMin) {
			const newMiddle = this._prependMiddle(this.left);

			return this.#copy(leftBlock, undefined, newMiddle, newSize);
		}

		// Case 3: Left block can be merged with current left block and split into two blocks for middle
		const jointChildren = leftBlock._concatChildren(this.left._copyChildren());
		const [newLeftChildren, toMiddleChildren] = this.#ops.mutateSplice(
			jointChildren,
			-this.context.maxBlockSize,
		);

		const newLeft = this.context.outerBlockLeftRight(newLeftChildren);
		const toMiddle = this.context.outerBlockLeftRight(toMiddleChildren);

		const newMiddle = this._prependMiddle(toMiddle);

		return this.#copy(newLeft, undefined, newMiddle, newSize);
	}

	_prependTree(leftTree: OuterTree<T>): OuterTree<T> {
		const newSize = this.size + leftTree.size;
		const jointLength = leftTree.right.size + this.left.size;

		// Case 1: Joint is too small (underflow) — must merge with neighbors
		if (jointLength < this.context.minBlockSize) {
			if (null === this.middle) {
				//this  left + right > maxBlockSize, otherwise would be single block
				const jointChildren = leftTree.right._concatChildren(
					this.left._concatChildren(this.right._copyChildren()),
				);
				const [toLeftMiddleChildren, newRightChildren] = this.#ops.mutateSplice(
					jointChildren,
					this.context.maxBlockSize,
				);
				const toLeftMiddle =
					this.context.outerBlockLeftRight(toLeftMiddleChildren);
				const newRight = this.context.outerBlockLeftRight(newRightChildren);
				const newLeftMiddle = leftTree._prependMiddle(toLeftMiddle);

				return this.context.outerTree(
					leftTree.left,
					newRight,
					newLeftMiddle,
					newSize,
				);
			}

			// this.middle exists, so we can merge joint with middle
			// middle block >= min size, joint length < min size,
			const [newThisMiddle, toJoint] = this.middle.dropFirstChild();
			const jointChildren = leftTree.right._concatChildren(
				this.left._concatChildren(toJoint._copyChildren()),
			);
			const jointNrChildren = this.#ops.size(jointChildren);

			// Case 1a: Joint fits in a single block — merge and push to middle
			if (jointNrChildren <= this.context.maxBlockSize) {
				const joint = this.context.outerBlockLeftRight(jointChildren);

				const m =
					null === newThisMiddle
						? leftTree._appendMiddle(joint)
						: leftTree._appendMiddle(joint).concat(newThisMiddle);

				return this.context.outerTree(leftTree.left, this.right, m, newSize);
			}

			// Case 1b: Joint overflows — merge and split into two blocks for middle
			const [jointLeftChildren, jointRightChildren] = this.#ops.mutateSplice(
				jointChildren,
				jointNrChildren >> 1,
			);

			const jointLeft = this.context.outerBlockLeftRight(jointLeftChildren);
			const jointRight = this.context.outerBlockLeftRight(jointRightChildren);

			const newMiddle =
				null === newThisMiddle
					? leftTree._appendMiddle(jointLeft).appendChild(jointRight)
					: null === leftTree.middle
						? newThisMiddle.appendChild(jointLeft).appendChild(jointRight)
						: leftTree
								._appendMiddle(jointLeft)
								.appendChild(jointRight)
								.concat(newThisMiddle);

			return this.context.outerTree(
				leftTree.left,
				this.right,
				newMiddle,
				newSize,
			);
		}

		// Case 2: Joint fits in a single block — merge and push to middle
		if (jointLength <= this.context.maxBlockSize) {
			const jointChildren = leftTree.right._concatChildren(
				this.left._copyChildren(),
			);
			const joint = this.context.outerBlockLeftRight(jointChildren);
			const newThisMiddle = this._appendMiddle(joint);
			const newMiddle =
				null === leftTree.middle
					? newThisMiddle
					: leftTree.middle.concat(newThisMiddle);

			return this.context.outerTree(
				leftTree.right,
				this.right,
				newMiddle,
				newSize,
			);
		}

		// Case 3: Both sides already satisfy minBlockSize — push both to middle
		if (leftTree.right._childrenInMin && this.left._childrenInMin) {
			const newLeftMiddle = leftTree
				._appendMiddle(leftTree.right)
				.appendChild(this.left);

			const newMiddle =
				null === this.middle
					? newLeftMiddle
					: newLeftMiddle.concat(this.middle);

			return this.context.outerTree(
				leftTree.left,
				this.right,
				newMiddle,
				newSize,
			);
		}

		// Case 4: Joint overflows — merge and split into two blocks for middle
		const jointChildren = leftTree.right._concatChildren(
			this.left._copyChildren(),
		);
		const [jointLeftChildren, jointRightChildren] = this.#ops.mutateSplice(
			jointChildren,
			jointLength >> 1,
		);

		const jointLeft = this.context.outerBlockLeftRight(jointLeftChildren);
		const jointRight = this.context.outerBlockLeftRight(jointRightChildren);

		const newThisMiddle = this._appendMiddle(jointLeft).appendChild(jointRight);
		const newMiddle =
			null === leftTree.middle
				? newThisMiddle
				: leftTree.middle.concat(newThisMiddle);

		return this.context.outerTree(
			leftTree.left,
			this.right,
			newMiddle,
			newSize,
		);
	}

	_prependMiddle(block: OuterBlock<T>): Inner<T, OuterBlock<T>> {
		return (
			this.middle?.prependChild(block) ??
			this.context.innerBlock<T, OuterBlock<T>>([block], block.size, 1)
		);
	}

	_appendMiddle(block: OuterBlock<T>): Inner<T, OuterBlock<T>> {
		return (
			this.middle?.appendChild(block) ??
			this.context.innerBlock<T, OuterBlock<T>>([block], block.size, 1)
		);
	}
}
