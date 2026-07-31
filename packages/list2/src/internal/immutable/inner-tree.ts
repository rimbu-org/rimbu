import type { TraverseState } from '@rimbu/common';
import type { List, OpWithResult } from '@rimbu/list';
import type { Stream } from '@rimbu/stream';

import type { ListContext } from '#list/context';
import type { Block, Inner, Self } from '#list/immutable/common';
import type { InnerBlock } from '#list/immutable/inner-block';
import type { InnerTreeBuilder } from '#list/mutable/inner-tree-builder';

import { Int, throwInvalidStateError } from '@rimbu/base';

import { treeGet, treeStream, treeUpdate } from '#list/immutable/tree';
import { SizeTable } from '#list/size-table';

export class InnerTree<T, C extends Self<Block<T>, C>> implements Inner<T, C> {
	declare _self: InnerTree<T, C>;

	constructor(
		readonly context: ListContext<T, true>,
		readonly left: InnerBlock<T, C>,
		readonly right: InnerBlock<T, C>,
		readonly middle: Inner<T, InnerBlock<T, C>> | null,
		readonly size: number,
		readonly level: number,
	) {}

	copy(
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

	#copyAsType<T2, C2 extends Block<T2> & { _self: C2 }>(
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

	_get(index: Int.AtLeastZero): T {
		return treeGet(this, index);
	}

	_update(
		index: Int.AtLeastZero,
		f: (element: T) => T,
	): OpWithResult<InnerTree<T, C>, [oldValue: T, newValue: T], true> {
		return treeUpdate(this as InnerTree<T, C>, index, f);
	}

	forEach(f: (element: T) => void): void {
		this.left.forEach(f);
		this.middle?.forEach(f);
		this.right.forEach(f);
	}

	filter(f: (element: T) => boolean): List<T> {
		return this.left
			.filter(f)
			.concat(this.middle?.filter(f), this.right.filter(f));
	}

	filterIndexed(
		f: (element: T, index: number, halt: () => void) => boolean,
		options: {
			reversed?: boolean | undefined;
			negate?: boolean | undefined;
			state: TraverseState;
		},
	): List<T> {
		const { reversed = false, state } = options;

		if (state.halted) return this.context.empty<T>();

		const first = reversed ? this.right : this.left;
		let result = first.filterIndexed(f, options);

		if (state.halted) return result;

		if (null !== this.middle) {
			result = result.concat(this.middle.filterIndexed(f, options));

			if (state.halted) return result;
		}

		const last = reversed ? this.left : this.right;
		result = result.concat(last.filterIndexed(f, options));

		return result;
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
			return this.copy(
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
			return this.copy(
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
				return this.copy(
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

		return this.copy(
			this.context.innerBlock([child], child.size, this.left.level),
			undefined,
			newMiddle,
			newSize,
		);
	}

	appendChild(child: C): InnerTree<T, C> {
		const newLength = this.size + child.size;

		if (this.right._canAddChild) {
			return this.copy(
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
			return this.copy(
				newLeft,
				newRight?._appendBlockChild(child),
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
				return this.copy(
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

		return this.copy(
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

		return this.copy(newLeft, undefined, undefined, this.size + delta);
	}

	modifyLastChild(f: (child: C) => C): InnerTree<T, C> | undefined {
		const lastChild = this.right.childAt(-1);
		const newLastChild = f(lastChild);

		if (newLastChild === lastChild) return this;

		const delta = newLastChild.size - lastChild.size;
		const newRight = this.right.withChild(-1, newLastChild);

		return this.copy(undefined, newRight, undefined, this.size + delta);
	}

	dropFirstChild(): [Inner<T, C> | null, C] {
		const [newLeft, firstChild] = this.left.dropFirstChild();

		if (null === newLeft) {
			if (null === this.middle) {
				return [this.right, firstChild];
			}

			const [newMiddle, toLeft] = this.middle.dropFirstChild();
			const newSelf = this.copy(
				toLeft,
				undefined,
				newMiddle,
				this.size - firstChild.size,
			);
			//.#normalize();

			return [newSelf, firstChild];
		}

		const newSelf = this.copy(
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
			const newSelf = this.copy(
				undefined,
				toRight,
				newMiddle,
				this.size - lastChild.size,
			);
			//.#normalize();

			return [newSelf, lastChild];
		}

		// set the new right to right
		const newSelf = this.copy(
			undefined,
			newRight,
			undefined,
			this.size - lastChild.size,
		);
		//.#normalize();

		return [newSelf, lastChild];
	}

	takeInternal(
		amount: Int.AtLeastZero,
	): [
		newInner: Inner<T, C> | null,
		lastChild: C,
		lastChildCount: Int.AtLeastZero,
	] {
		const middleAmount = amount - this.left.size;

		if (!Int.isAtLeastOne(middleAmount)) {
			// only left remains
			return this.left.takeInternal(amount);
		}

		if (null === this.middle) {
			// update with take from right, no middle
			const [newRight, up, upAmount] = this.right.takeInternal(middleAmount);

			if (null === newRight) {
				// no right remains
				return [this.left, up, upAmount];
			}

			// combine left with remaining right
			return [this.left.concat(newRight), up, upAmount];
		}

		const rightAmount = middleAmount - this.middle.size;

		if (Int.isAtLeastOne(rightAmount)) {
			const [newRight, up, upAmount] = this.right.takeInternal(rightAmount);

			if (null === newRight) {
				// no right remains, move last middle up
				const [newMiddle, toRight] = this.middle.dropLastChild();
				const newLength =
					this.left.size + toRight.size + (newMiddle?.size ?? 0);
				const newSelf = this.copy(undefined, toRight, newMiddle, newLength);
				//._normalize();

				return [newSelf, up, upAmount];
			}

			// some right remains, update and normalize
			const newSize = this.left.size + newRight.size + this.middle.size;
			const newSelf = this.copy(undefined, newRight, undefined, newSize);
			// ._normalize();

			return [newSelf, up, upAmount];
		}

		// take from middle
		const [newMiddle, upRight] = this.middle.takeInternal(middleAmount);
		const newSize = this.left.size + upRight.size + (newMiddle?.size ?? 0);
		const newSelf = this.copy(undefined, upRight, newMiddle, newSize);
		// ._normalize();
		return newSelf.takeInternal(amount);
	}

	dropInternal(
		amount: Int.AtLeastZero,
	): [
		newInner: Inner<T, C> | null,
		lastChild: C,
		lastChildCount: Int.AtLeastZero,
	] {
		const middleAmount = amount - this.left.size;

		if (null === this.middle) {
			if (!Int.isAtLeastZero(middleAmount)) {
				// drop only from left no middle
				const [newLeft, upLeft, upLeftAmount] = this.left.dropInternal(amount);

				const newSelf =
					null === newLeft ? this.right : newLeft.concat(this.right);

				return [newSelf, upLeft, upLeftAmount];
			} else {
				// drop only from right
				return this.right.dropInternal(middleAmount);
			}
		}

		if (!Int.isAtLeastZero(middleAmount)) {
			// drop only from left with middle
			const [newLeft, upLeft, upLeftAmount] = this.left.dropInternal(amount);

			if (null === newLeft) {
				// all of left gone
				const [newMiddle, toLeft] = this.middle.dropFirstChild();
				const newSize = toLeft.size + this.right.size + (newMiddle?.size ?? 0);
				const newSelf = this.copy(toLeft, undefined, newMiddle, newSize);
				//._normalize();

				return [newSelf, upLeft, upLeftAmount];
			}

			// left remaining
			const newSize = newLeft.size + this.right.size + this.middle.size;
			const newSelf = this.copy(newLeft, undefined, undefined, newSize);

			return [newSelf, upLeft, upLeftAmount];
		}

		const rightAmount = middleAmount - this.middle.size;

		if (Int.isAtLeastZero(rightAmount)) {
			// drop only from right
			return this.right.dropInternal(rightAmount);
		}

		// drop from middle
		const [newMiddle, upLeft, inUpLeft] =
			this.middle.dropInternal(middleAmount);

		const newSize = upLeft.size + this.right.size + (newMiddle?.size ?? 0);
		const newSelf = this.copy(upLeft, undefined, newMiddle, newSize);
		//._normalize();

		return newSelf.dropInternal(inUpLeft);
	}

	prependMiddleBlock(block: InnerBlock<T, C>): Inner<T, InnerBlock<T, C>> {
		return (
			this.middle?.prependChild(block) ??
			this.context.innerBlock([block], block.size, this.level + 1)
		);
	}

	appendMiddleBlock(block: InnerBlock<T, C>): Inner<T, InnerBlock<T, C>> {
		return (
			this.middle?.appendChild(block) ??
			this.context.innerBlock([block], block.size, this.level + 1)
		);
	}

	concat(other: Inner<T, C>): Inner<T, C> {
		return other.prependTree(this);
	}

	prependBlock(leftBlock: InnerBlock<T, C>): Inner<T, C> {
		if (leftBlock.level !== this.level) {
			throwInvalidStateError();
		}

		const newSize = leftBlock.size + this.size;

		if (
			leftBlock._nrChildren + this.right._nrChildren <=
			this.context.maxBlockSize
		) {
			// prepend to left
			const newLeft = leftBlock.concat(this.left) as InnerBlock<T, C>;

			return this.copy(newLeft, undefined, undefined, newSize);
		}

		if (this.left._childrenInMin) {
			// move current left to middle
			const newMiddle = this.prependMiddleBlock(this.right);

			return this.copy(leftBlock, undefined, newMiddle, newSize);
			//._normalize();
		}

		// split new left
		const newLeftChildren = leftBlock.concatChildren(this.left);
		const toMiddleChildren = newLeftChildren.splice(
			newLeftChildren.length - this.context.maxBlockSize,
		);
		const newLeft = this.context.innerBlock<T, C>(
			newLeftChildren,
			leftBlock.size + this.left.size,
			this.level,
		);
		const toMiddle = this.context.innerBlock<T, C>(
			toMiddleChildren,
			toMiddleChildren.reduce((acc, c) => acc + c.size, 0),
			this.level,
		);
		const newMiddle = this.prependMiddleBlock(toMiddle);

		return this.copy(newLeft, undefined, newMiddle, newSize);
		//._normalize();
	}

	prependTree(leftTree: InnerTree<T, C>): Inner<T, C> {
		const newSize = leftTree.size + this.size;
		const jointNrChildren = leftTree.right._nrChildren + this.left._nrChildren;

		// Case 1: Joint is too small (underflow) — must merge with neighbors
		if (jointNrChildren <= this.context.minBlockSize) {
			if (null === this.middle) {
				//this  left + right > maxBlockSize, otherwise would be single block
				const toLeftMiddleChildren = leftTree.right.concatChildren(
					this.left,
					this.right,
				);
				const totalSize =
					leftTree.right.size + this.left.size + this.right.size;

				const newRightChildren = toLeftMiddleChildren.splice(
					this.context.maxBlockSize,
				);

				const leftMiddleSizeTable = SizeTable.fromChildren(
					toLeftMiddleChildren,
					1 << (this.level * this.context.blockSizeBits),
				);
				const leftMiddleSize = leftMiddleSizeTable.totalSize;
				const toLeftMiddle = this.context.innerBlock<T, C>(
					toLeftMiddleChildren,
					leftMiddleSize,
					this.level,
					leftMiddleSizeTable,
				);

				const newRight = this.context.innerBlock<T, C>(
					newRightChildren,
					totalSize - leftMiddleSize,
					this.level,
				);

				const newLeftMiddle = leftTree.prependMiddleBlock(toLeftMiddle);

				return this.copy(leftTree.left, newRight, newLeftMiddle, newSize);
			}

			// this.middle exists, so we can merge joint with middle
			// middle block >= min size, joint length < min size,
			const [newThisMiddle, toJoint] = this.middle.dropFirstChild();
			const jointChildren = leftTree.right.concatChildren(this.left, toJoint);
			const jointNrChildren = jointChildren.length;
			const jointSize = leftTree.right.size + this.left.size + toJoint.size;

			// Case 1a: Joint fits in a single block — merge and push to middle
			if (jointNrChildren <= this.context.maxBlockSize) {
				const joint = this.context.innerBlock<T, C>(
					jointChildren,
					jointSize,
					this.level,
				);

				const m =
					null === newThisMiddle
						? leftTree.appendMiddleBlock(joint)
						: leftTree.appendMiddleBlock(joint).concat(newThisMiddle);

				return this.context.innerTree(
					leftTree.left,
					this.right,
					m,
					newSize,
					this.level,
				);
			}

			// Case 1b: Joint overflows — merge and split into two blocks for middle
			const jointRightChildren = jointChildren.splice(jointNrChildren >> 1);

			const jointLeftSizeTable = SizeTable.fromChildren(
				jointChildren,
				1 << (this.level * this.context.blockSizeBits),
			);
			const jointLeftSize = jointLeftSizeTable.totalSize;
			const jointLeft = this.context.innerBlock<T, C>(
				jointChildren,
				jointLeftSize,
				this.level,
				jointLeftSizeTable,
			);
			const jointRight = this.context.innerBlock<T, C>(
				jointRightChildren,
				jointSize - jointLeftSize,
				this.level,
			);

			const newMiddle =
				null === newThisMiddle
					? leftTree.appendMiddleBlock(jointLeft).appendChild(jointRight)
					: null === leftTree.middle
						? newThisMiddle.appendChild(jointLeft).appendChild(jointRight)
						: leftTree
								.appendMiddleBlock(jointLeft)
								.appendChild(jointRight)
								.concat(newThisMiddle);

			return this.context.innerTree(
				leftTree.left,
				this.right,
				newMiddle,
				newSize,
				this.level,
			);
		}

		// Case 2: Joint fits in a single block — merge and push to middle
		if (jointNrChildren <= this.context.maxBlockSize) {
			const jointChildren = leftTree.right.concatChildren(this.left);
			const joint = this.context.innerBlock<T, C>(
				jointChildren,
				leftTree.right.size + this.left.size,
				this.level,
			);
			const newThisMiddle = this.appendMiddleBlock(joint);
			const newMiddle =
				null === leftTree.middle
					? newThisMiddle
					: leftTree.middle.concat(newThisMiddle);

			return this.context.innerTree(
				leftTree.right,
				this.right,
				newMiddle,
				newSize,
				this.level,
			);
		}

		// Case 3: Both sides already satisfy minBlockSize — push both to middle
		if (leftTree.right._childrenInMin && this.left._childrenInMin) {
			const newLeftMiddle = leftTree
				.appendMiddleBlock(leftTree.right)
				.appendChild(this.left);

			const newMiddle =
				null === this.middle
					? newLeftMiddle
					: newLeftMiddle.concat(this.middle);

			return this.context.innerTree(
				leftTree.left,
				this.right,
				newMiddle,
				newSize,
				this.level,
			);
		}

		// Case 4: Joint overflows — merge and split into two blocks for middle
		const jointChildren = leftTree.right.concatChildren(this.left);
		const jointSize = leftTree.right.size + this.left.size;
		const jointRightChildren = jointChildren.splice(jointChildren.length >> 1);

		const jointLeftSizeTable = SizeTable.fromChildren(
			jointChildren,
			1 << (this.level * this.context.blockSizeBits),
		);
		const jointLeftSize = jointLeftSizeTable.totalSize;
		const jointLeft = this.context.innerBlock<T, C>(
			jointChildren,
			jointLeftSize,
			this.level,
			jointLeftSizeTable,
		);
		const jointRight = this.context.innerBlock<T, C>(
			jointRightChildren,
			jointSize - jointLeftSize,
			this.level,
		);

		const newThisMiddle =
			this.appendMiddleBlock(jointLeft).appendChild(jointRight);
		const newMiddle =
			null === leftTree.middle
				? newThisMiddle
				: leftTree.middle.concat(newThisMiddle);

		return this.context.innerTree(
			leftTree.left,
			this.right,
			newMiddle,
			newSize,
			this.level,
		);
	}

	reversed(): InnerTree<T, C> {
		return this.copy(
			this.right.reversed(),
			this.left.reversed(),
			this.middle?.reversed() ?? null,
			this.size,
			this.level,
		);
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
