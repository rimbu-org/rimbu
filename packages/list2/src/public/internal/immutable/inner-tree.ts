import type { IndexRange } from '@rimbu/common/index-range';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Stream } from '@rimbu/stream';

import type { ListContext } from '#list/context-module';
import type { CacheMap } from '#list/immutable/cache-map';
import type { InnerBlock } from '#list/immutable/inner-block';
import type { Block, Inner } from '#list/immutable/utils';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';

import { InnerBase } from '#list/immutable/inner-base';
import {
	treeForEach,
	treeToArray,
	treeToStream,
} from '#list/immutable/tree-base';

export class InnerTree<T> extends InnerBase<T> implements Inner<T> {
	constructor(
		context: ListContext,
		readonly left: InnerBlock<T>,
		readonly right: InnerBlock<T>,
		readonly middle: Inner<T> | null,
		readonly itemsLength: number,
		readonly level: number,
	) {
		super(context);
	}

	copy(
		left = this.left,
		right = this.right,
		middle = this.middle,
		itemsLength = this.itemsLength,
		level = this.level,
	): InnerTree<T> {
		if (
			left === this.left &&
			right === this.right &&
			middle === this.middle &&
			itemsLength === this.itemsLength &&
			level === this.level
		) {
			return this;
		}

		return this.context.innerTree(left, right, middle, itemsLength, level);
	}

	stream(options?: { reversed?: boolean }): Stream.NonEmpty<T> {
		return treeToStream(this, options);
	}

	get(index: number): T {
		return 0 as any;
	}

	prependChild(child: Block<T>): InnerTree<T> {
		throw new Error('Method not implemented.');
	}

	appendChild(child: Block<T>): InnerTree<T> {
		throw new Error('Method not implemented.');
	}

	prependMiddleChild(child: Block<T>): InnerTree<T> {
		const newLength = this.itemsLength + child.itemsLength;

		if (this.left.children.length < this.context.maxBlockSize) {
			return this.copy(
				this.left.prependChild(child) as InnerBlock<T>,
				undefined,
				undefined,
				newLength,
			);
		}

		const newMiddle = this.middle
			? this.middle.prependChild(this.left)
			: this.context.innerBlock<T>(
					[this.left],
					this.left.itemsLength,
					this.level + 1,
				);

		return this.copy(
			this.left.copy([child], child.itemsLength),
			undefined,
			newMiddle,
			newLength,
		);
	}

	appendMiddleChild(child: Block<T>): InnerTree<T> {
		const newLength = this.itemsLength + child.itemsLength;

		if (this.right.children.length < this.context.maxBlockSize) {
			return this.copy(
				undefined,
				this.right.appendChild(child) as InnerBlock<T>,
				undefined,
				newLength,
			);
		}

		const newMiddle = this.middle
			? this.middle.appendChild(this.right)
			: this.context.innerBlock(
					[this.right],
					this.right.itemsLength,
					this.level + 1,
				);

		return this.copy(
			undefined,
			this.right.copy([child], child.itemsLength),
			newMiddle,
			newLength,
		);
	}

	dropFirstChild(): [Inner<T> | null, Block<T>] {
		const [newLeft, firstChild] = this.left.dropFirstChild();

		if (null === newLeft) {
			if (null === this.middle) {
				return [this.right, firstChild];
			}

			const [newMiddle, toLeft] = this.middle.dropFirstChild();
			if (!this.context.isInnerBlock<T>(toLeft)) {
				throwInvalidStateError();
			}
			const newSelf = this.copy(toLeft, undefined, newMiddle)._normalize();

			return [newSelf, firstChild];
		}

		const newSelf = this.copy(newLeft)._normalize();

		return [newSelf, firstChild];
	}

	dropLastChild(): [Inner<T> | null, Block<T>] {
		// drop last from the right block
		const [newRight, lastChild] = this.right.dropLastChild();

		if (null === newRight) {
			if (null === this.middle) {
				// drop right
				return [this.left, lastChild];
			}

			// move last middle to right
			const [newMiddle, toRight] = this.middle.dropLastChild();
			if (!this.context.isInnerBlock<T>(toRight)) {
				throwInvalidStateError();
			}
			const newSelf = this.copy(undefined, toRight, newMiddle)._normalize();

			return [newSelf, lastChild];
		}

		// set the new right to right
		const newSelf = this.copy(undefined, newRight)._normalize();

		return [newSelf, lastChild];
	}

	concat(inner: Inner<T>): Inner<T> {
		if (this.context.isInnerBlock<T>(inner)) {
			return this.concatBlock(inner);
		}
		if (this.context.isInnerTree<T>(inner)) {
			return this.concatTree(inner);
		}

		throwInvalidStateError();
	}

	concatInner(inner: Inner<T>): Inner<T> {
		if (this.context.isInnerBlock<T>(inner)) {
			return this.concatBlock(inner);
		}
		if (this.context.isInnerTree<T>(inner)) {
			return this.concatTree(inner);
		}

		throwInvalidStateError();
	}

	concatBlock(innerBlock: InnerBlock<T>): Inner<T> {
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
			const newMiddle = this.appendMiddleChild(this.right);

			return this.copy(undefined, innerBlock, newMiddle)._normalize();
		}

		// split new right
		const newRight = this.right.concatChildren(innerBlock);
		const newLast = newRight._mutateSplitRight(this.context.maxBlockSize);
		const newMiddle = this.appendMiddleChild(newRight);

		return this.copy(undefined, newLast, newMiddle)._normalize();
	}

	concatTree(innerTree: InnerTree<T>): Inner<T> {
		if (
			this.right.nrChildren + innerTree.left.nrChildren <=
			this.context.maxBlockSize
		) {
			// merge right and left
			const joint = this.right.concatChildren(innerTree.left);

			const newThisMiddle = this.appendMiddleChild(joint);
			const newMiddle =
				null === innerTree.middle
					? newThisMiddle
					: newThisMiddle.concat(innerTree.middle);

			return this.copy(undefined, innerTree.right, newMiddle)._normalize();
		}

		if (this.right.childrenInMin && innerTree.left.childrenInMin) {
			// append both
			const newThisMiddle = this.appendMiddleChild(this.right).appendChild(
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

		const newThisMiddle = this.appendMiddleChild(joint).appendChild(jointRight);
		const newMiddle =
			null === innerTree.middle
				? newThisMiddle
				: newThisMiddle.concat(innerTree.middle);

		return this.copy(undefined, innerTree.right, newMiddle)._normalize();
	}

	reversed(cacheMap: CacheMap = this.context.cacheMap()): InnerTree<T> {
		const cachedThis = cacheMap.get<InnerTree<T>>(this);
		if (cachedThis !== undefined) return cachedThis;

		const newMid = this.middle?.reversed(cacheMap) ?? null;
		const newLeft = this.right.reversed(cacheMap);
		const newRight =
			this.left === this.right ? newLeft : this.left.reversed(cacheMap);

		const reversedThis = this.copy(newLeft, newRight, newMid);
		return cacheMap.setAndReturn(this, reversedThis);
	}

	takeInternal(amount: number): [Inner<T> | null, Block<T>, number] {
		const middleAmount = amount - this.left.itemsLength;

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

		const rightAmount = middleAmount - this.middle.itemsLength;

		if (rightAmount > 0) {
			const [newRight, up, upAmount] = this.right.takeInternal(rightAmount);
			if (!this.context.isInnerBlock<T>(newRight)) {
				throwInvalidStateError();
			}

			if (null === newRight) {
				// no right remains, move last middle up
				const [newMiddle, toRight] = this.middle.dropLastChild();

				if (!this.context.isInnerBlock<T>(toRight)) {
					throwInvalidStateError();
				}
				const newSelf = this.copy(undefined, toRight, newMiddle)._normalize();

				return [newSelf, up, upAmount];
			}

			// some right remains, update and normalize
			const newSelf = this.copy(undefined, newRight)._normalize();

			return [newSelf, up, upAmount];
		}

		// take from middle
		const [newMiddle, upRight] = this.middle.takeInternal(middleAmount);
		if (!this.context.isInnerBlock<T>(upRight)) {
			throwInvalidStateError();
		}

		const newSelf = this.copy(undefined, upRight, newMiddle)._normalize();
		return newSelf.takeInternal(amount);
	}

	dropInternal(amount: number): [Inner<T> | null, Block<T>, number] {
		const middleAmount = amount - this.left.itemsLength;

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
				if (!this.context.isInnerBlock<T>(toLeft)) {
					throwInvalidStateError();
				}
				const newSelf = this.copy(toLeft, undefined, newMiddle)._normalize();

				return [newSelf, upLeft, upLeftAmount];
			}

			// left remaining
			const newSelf = this.copy(newLeft);

			return [newSelf, upLeft, upLeftAmount];
		}

		const rightAmount = middleAmount - this.middle.itemsLength;

		if (rightAmount >= 0) {
			// drop only from right
			return this.right.dropInternal(rightAmount);
		}

		// drop from middle
		const [newMiddle, upLeft, inUpLeft] =
			this.middle.dropInternal(middleAmount);

		if (!this.context.isInnerBlock<T>(upLeft)) {
			throwInvalidStateError();
		}
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

	_normalize(): Inner<T> {
		if (null === this.middle) {
			if (
				this.left.nrChildren + this.right.nrChildren <=
				this.context.maxBlockSize
			) {
				// can merge left and right
				return this.left.concatChildren(this.right);
			}
		} else if (this.context.isInnerBlock<T>(this.middle)) {
			const firstChild = this.middle.children[0];

			if (
				this.left.nrChildren + firstChild.nrChildren <=
				this.context.maxBlockSize
			) {
				// first middle child can be merged with left
				const result = this.middle.dropFirstChild();
				const newMiddle = result[0];
				const block = result[1];

				if (this.context.isInnerBlock<T>(block)) {
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

				if (this.context.isInnerBlock<T>(block)) {
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
		return `InnerTree<${this.itemsLength}>(${this.left._structure()}, ${this.middle?._structure() ?? '<notree>'}, ${this.right._structure()})`;
	}
}
