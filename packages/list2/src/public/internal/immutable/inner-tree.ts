import type { IndexRange } from '@rimbu/common/index-range';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Stream } from '@rimbu/stream';

import type { ListContext } from '#list/context-module';
import type { CacheMap } from '#list/immutable/cache-map';
import type { InnerBlock } from '#list/immutable/inner-block';
import type { Block, Inner, ListCommon } from '#list/immutable/utils';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';

import {
	treeForEach,
	treeGet,
	treeToArray,
	treeToStream,
} from '#list/immutable/tree-base';

export class InnerTree<T, C extends Block<T>> implements ListCommon<T> {
	constructor(
		readonly context: ListContext,
		readonly left: InnerBlock<T, C>,
		readonly right: InnerBlock<T, C>,
		readonly middle: Inner<T, InnerBlock<T, C>> | null,
		readonly length: number,
		readonly level: number,
		readonly ops = context.outerChildrenOps,
	) {}

	copy(
		left = this.left,
		right = this.right,
		middle = this.middle,
		length = this.length,
		level = this.level,
	): InnerTree<T, C> {
		if (
			left === this.left &&
			right === this.right &&
			middle === this.middle &&
			length === this.length &&
			level === this.level
		) {
			return this;
		}

		return this.context.innerTree(left, right, middle, length, level);
	}

	stream(options?: { reversed?: boolean }): Stream.NonEmpty<T> {
		return treeToStream(this, options);
	}

	get(index: number): T {
		return treeGet(this, index);
	}

	prependChild(child: C): InnerTree<T, C> {
		const newLength = this.length + child.length;

		if (this.left.canAddChild) {
			return this.copy(
				this.left.prependBlockChild(child),
				undefined,
				undefined,
				newLength,
			);
		}

		const newMiddle =
			this.middle?.prependChild(this.left) ??
			this.context.innerBlock<T, InnerBlock<T, C>>(
				[this.left],
				this.left.length,
				this.level + 1,
			);

		return this.copy(
			this.left.copy([child], child.length),
			undefined,
			newMiddle,
			newLength,
		);
	}

	appendChild(child: C): InnerTree<T, C> {
		const newLength = this.length + child.length;

		if (this.right.canAddChild) {
			return this.copy(
				undefined,
				this.right.appendBlockChild(child),
				undefined,
				newLength,
			);
		}

		const newMiddle = this.middle
			? this.middle.appendChild(this.right)
			: this.context.innerBlock<T, InnerBlock<T, C>>(
					[this.right],
					this.right.length,
					this.level + 1,
				);

		return this.copy(
			undefined,
			this.right.copy([child], child.length),
			newMiddle,
			newLength,
		);
	}

	prependMiddleBlock(block: InnerBlock<T, C>): Inner<T, InnerBlock<T, C>> {
		return (
			this.middle?.prependChild(block) ??
			this.context.innerBlock([block], block.length, this.level + 1)
		);
	}

	appendMiddleBlock(block: InnerBlock<T, C>): Inner<T, InnerBlock<T, C>> {
		return (
			this.middle?.appendChild(block) ??
			this.context.innerBlock([block], block.length, this.level + 1)
		);
	}

	dropFirstChild(): [Inner<T, C> | null, C] {
		const [newLeft, firstChild] = this.left.dropFirstChild();

		if (null === newLeft) {
			if (null === this.middle) {
				return [this.right, firstChild];
			}

			const [newMiddle, toLeft] = this.middle.dropFirstChild();
			const newSelf = this.copy(toLeft, undefined, newMiddle)._normalize();

			return [newSelf, firstChild];
		}

		const newSelf = this.copy(newLeft)._normalize();

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
			const newSelf = this.copy(undefined, toRight, newMiddle)._normalize();

			return [newSelf, lastChild];
		}

		// set the new right to right
		const newSelf = this.copy(undefined, newRight)._normalize();

		return [newSelf, lastChild];
	}

	concat(inner: Inner<T, C>): Inner<T, C> {
		if (this.context.isInnerBlock<T, C>(inner)) {
			return this.concatBlock(inner);
		}
		if (this.context.isInnerTree<T, C>(inner)) {
			return this.concatTree(inner);
		}

		throwInvalidStateError();
	}

	concatInner(inner: Inner<T, C>): Inner<T, C> {
		if (this.context.isInnerBlock<T, C>(inner)) {
			return this.concatBlock(inner);
		}
		if (this.context.isInnerTree<T, C>(inner)) {
			return this.concatTree(inner);
		}

		throwInvalidStateError();
	}

	concatBlock(innerBlock: InnerBlock<T, C>): Inner<T, C> {
		if (innerBlock.level !== this.level) {
			throwInvalidStateError();
		}

		if (
			this.right.nrChildren + innerBlock.nrChildren <=
			this.context.maxBlockSize
		) {
			// append to right
			const newRight = this.right.concatChildren(innerBlock);

			return this.copy(undefined, newRight);
		}

		if (this.right.childrenInMin) {
			// move current right to middle
			const newMiddle = this.appendMiddleBlock(this.right);

			return this.copy(undefined, innerBlock, newMiddle)._normalize();
		}

		// split new right
		const newRight = this.right.concatChildren(innerBlock);
		const newLast = newRight._mutateSplitRight(this.context.maxBlockSize);
		const newMiddle = this.appendMiddleBlock(newRight);

		return this.copy(undefined, newLast, newMiddle)._normalize();
	}

	concatTree(innerTree: InnerTree<T, C>): Inner<T, C> {
		if (
			this.right.nrChildren + innerTree.left.nrChildren <=
			this.context.maxBlockSize
		) {
			// merge right and left
			const joint = this.right.concatChildren(innerTree.left);

			const newThisMiddle = this.appendMiddleBlock(joint);
			const newMiddle =
				null === innerTree.middle
					? newThisMiddle
					: newThisMiddle.concat(innerTree.middle);

			return this.copy(undefined, innerTree.right, newMiddle)._normalize();
		}

		if (this.right.childrenInMin && innerTree.left.childrenInMin) {
			// append both
			const newThisMiddle = this.appendMiddleBlock(this.right).appendChild(
				innerTree.left,
			);
			const newMiddle =
				null === innerTree.middle
					? newThisMiddle
					: newThisMiddle.concat(innerTree.middle);

			return this.copy(undefined, innerTree.right, newMiddle)._normalize();
		}

		// merge and split
		const joint = this.right.concatChildren(innerTree.left);
		const jointRight = joint._mutateSplitRight();

		const newThisMiddle = this.appendMiddleBlock(joint).appendChild(jointRight);
		const newMiddle =
			null === innerTree.middle
				? newThisMiddle
				: newThisMiddle.concat(innerTree.middle);

		return this.copy(undefined, innerTree.right, newMiddle)._normalize();
	}

	reversed(cacheMap: CacheMap = this.context.cacheMap()): InnerTree<T, C> {
		const cachedThis = cacheMap.get<InnerTree<T, C>>(this);
		if (cachedThis !== undefined) return cachedThis;

		const newMid = this.middle?.reversed(cacheMap) ?? null;
		const newLeft = this.right.reversed(cacheMap);
		const newRight =
			this.left === this.right ? newLeft : this.left.reversed(cacheMap);

		const reversedThis = this.copy(newLeft, newRight, newMid);
		return cacheMap.setAndReturn(this, reversedThis);
	}

	takeInternal(amount: number): [Inner<T, C> | null, C, number] {
		const middleAmount = amount - this.left.length;

		if (middleAmount <= 0) {
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

		const rightAmount = middleAmount - this.middle.length;

		if (rightAmount > 0) {
			const [newRight, up, upAmount] = this.right.takeInternal(rightAmount);

			if (null === newRight) {
				// no right remains, move last middle up
				const [newMiddle, toRight] = this.middle.dropLastChild();

				const newSelf = this.copy(undefined, toRight, newMiddle)._normalize();

				return [newSelf, up, upAmount];
			}

			// some right remains, update and normalize
			const newSelf = this.copy(undefined, newRight)._normalize();

			return [newSelf, up, upAmount];
		}

		// take from middle
		const [newMiddle, upRight] = this.middle.takeInternal(middleAmount);

		const newSelf = this.copy(undefined, upRight, newMiddle)._normalize();
		return newSelf.takeInternal(amount);
	}

	dropInternal(amount: number): [Inner<T, C> | null, C, number] {
		const middleAmount = amount - this.left.length;

		if (null === this.middle) {
			if (middleAmount < 0) {
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

		if (middleAmount < 0) {
			// drop only from left with middle
			const [newLeft, upLeft, upLeftAmount] = this.left.dropInternal(amount);

			if (null === newLeft) {
				// all of left gone
				const [newMiddle, toLeft] = this.middle.dropFirstChild();
				const newSelf = this.copy(toLeft, undefined, newMiddle)._normalize();

				return [newSelf, upLeft, upLeftAmount];
			}

			// left remaining
			const newSelf = this.copy(newLeft);

			return [newSelf, upLeft, upLeftAmount];
		}

		const rightAmount = middleAmount - this.middle.length;

		if (rightAmount >= 0) {
			// drop only from right
			return this.right.dropInternal(rightAmount);
		}

		// drop from middle
		const [newMiddle, upLeft, inUpLeft] =
			this.middle.dropInternal(middleAmount);

		const newSelf = this.copy(upLeft, undefined, newMiddle)._normalize();

		return newSelf.dropInternal(inUpLeft);
	}

	toArray(
		options?:
			| { range?: IndexRange | undefined; reversed?: boolean }
			| undefined,
	): T[] {
		return treeToArray(this, options);
	}

	_normalize(): Inner<T, C> {
		if (null === this.middle) {
			if (
				this.left.nrChildren + this.right.nrChildren <=
				this.context.maxBlockSize
			) {
				// can merge left and right
				return this.left.concatChildren(this.right);
			}
		} else if (this.context.isInnerBlock<T, C>(this.middle)) {
			const firstChild = this.middle.children[0];

			if (
				this.left.nrChildren + firstChild.nrChildren <=
				this.context.maxBlockSize
			) {
				// first middle child can be merged with left
				const result = this.middle.dropFirstChild();
				const newMiddle = result[0];
				const block = result[1];

				if (this.context.isInnerBlock<T, C>(block)) {
					return this.copy(
						this.left.concatChildren(block),
						undefined,
						newMiddle,
					);
				}

				throwInvalidStateError();
			}

			const lastChild = this.middle.children[this.middle.nrChildren - 1];

			if (
				this.right.nrChildren + lastChild.nrChildren <=
				this.context.maxBlockSize
			) {
				// last middle child can be merged with right
				const result = this.middle.dropLastChild();
				const newMiddle = result[0];
				const block = result[1];

				if (this.context.isInnerBlock<T, C>(block)) {
					return this.copy(
						undefined,
						block.concatChildren(this.right),
						newMiddle,
					);
				}

				throwInvalidStateError();
			}
		}

		return this;
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { reversed: boolean; state: TraverseState },
	): void {
		treeForEach(this, f, options);
	}

	_structure(): string {
		return `InnerTree<${this.length}>(${this.left._structure()}, ${this.middle?._structure() ?? '<notree>'}, ${this.right._structure()})`;
	}
}
