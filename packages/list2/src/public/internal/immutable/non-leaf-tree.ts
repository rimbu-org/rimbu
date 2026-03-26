import type { IndexRange } from '@rimbu/common/index-range';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Stream } from '@rimbu/stream';

import type { ListContext } from '#list/context-module';
import type { CacheMap } from '#list/immutable/cache-map';
import type { NonLeafBlock } from '#list/immutable/non-leaf-block';
import type { Block, NonLeaf } from '#list/immutable/utils';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';

import { NonLeafBase } from '#list/immutable/non-leaf-base';
import {
	treeForEach,
	treeToArray,
	treeToStream,
} from '#list/immutable/tree-base';

export class NonLeafTree<T> extends NonLeafBase<T> implements NonLeaf<T> {
	constructor(
		context: ListContext,
		readonly left: NonLeafBlock<T>,
		readonly right: NonLeafBlock<T>,
		readonly middle: NonLeaf<T> | null,
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
	): NonLeafTree<T> {
		if (
			left === this.left &&
			right === this.right &&
			middle === this.middle &&
			itemsLength === this.itemsLength &&
			level === this.level
		) {
			return this;
		}

		return this.context.nonLeafTree(left, right, middle, itemsLength, level);
	}

	stream(options?: { reversed?: boolean }): Stream.NonEmpty<T> {
		return treeToStream(this, options);
	}

	get(index: number): T {
		return 0 as any;
	}

	prependChild(child: Block<T>): NonLeafTree<T> {
		throw new Error('Method not implemented.');
	}

	appendChild(child: Block<T>): NonLeafTree<T> {
		throw new Error('Method not implemented.');
	}

	prependMiddleChild(child: Block<T>): NonLeafTree<T> {
		const newLength = this.itemsLength + child.itemsLength;

		if (this.left.children.length < this.context.maxBlockSize) {
			return this.copy(
				this.left.prependChild(child) as NonLeafBlock<T>,
				undefined,
				undefined,
				newLength,
			);
		}

		return this.copy(
			this.left.copy([child], child.itemsLength),
			undefined,
			this.middle
				? this.middle.prependChild(this.left)
				: this.context.nonLeafBlock(
						[this.left],
						this.left.itemsLength,
						this.level + 1,
					),
			newLength,
		);
	}

	appendMiddleChild(child: Block<T>): NonLeafTree<T> {
		const newLength = this.itemsLength + child.itemsLength;

		if (this.right.children.length < this.context.maxBlockSize) {
			return this.copy(
				undefined,
				this.right.appendChild(child) as NonLeafBlock<T>,
				undefined,
				newLength,
			);
		}

		return this.copy(
			undefined,
			this.right.copy([child], child.itemsLength),
			this.middle
				? this.middle.appendChild(this.right)
				: this.context.nonLeafBlock(
						[this.right],
						this.right.itemsLength,
						this.level + 1,
					),
			newLength,
		);
	}

	dropLastChild(): [NonLeaf<T> | null, Block<T>] {
		// drop last from the right block
		const [newRight, lastChild] = this.right.dropLastChild();

		if (null === newRight) {
			if (null === this.middle) {
				// drop right
				return [this.left, lastChild];
			}

			// move last middle to right
			const [newMiddle, toRight] = this.middle.dropLastChild();
			if (!this.context.isNonLeafBlock<T>(toRight)) {
				throwInvalidStateError();
			}
			const newSelf = this.copy(undefined, toRight, newMiddle)._normalize();

			return [newSelf, lastChild];
		}

		// set the new right to right
		const newSelf = this.copy(undefined, newRight)._normalize();

		return [newSelf, lastChild];
	}

	concat(nonLeaf: NonLeaf<T>): NonLeaf<T> {
		if (this.context.isNonLeafBlock<T>(nonLeaf)) {
			return this.concatBlock(nonLeaf);
		}
		if (this.context.isNonLeafTree<T>(nonLeaf)) {
			return this.concatTree(nonLeaf);
		}

		throwInvalidStateError();
	}

	concatNonLeaf(nonLeaf: NonLeaf<T>): NonLeaf<T> {
		if (this.context.isNonLeafBlock<T>(nonLeaf)) {
			return this.concatBlock(nonLeaf);
		}
		if (this.context.isNonLeafTree<T>(nonLeaf)) {
			return this.concatTree(nonLeaf);
		}

		throwInvalidStateError();
	}

	concatBlock(nonLeafBlock: NonLeafBlock<T>): NonLeaf<T> {
		if (nonLeafBlock.level !== this.level) {
			throwInvalidStateError();
		}

		if (
			this.right.nrChildren + nonLeafBlock.nrChildren <=
			this.context.maxBlockSize
		) {
			// append to right
			const newRight = this.right.concatChildren(nonLeafBlock);

			return this.copy(undefined, newRight);
		}

		if (this.right.childrenInMin) {
			// move current right to middle
			const newMiddle = this.appendMiddleChild(this.right);

			return this.copy(undefined, nonLeafBlock, newMiddle)._normalize();
		}

		// split new right
		const newRight = this.right.concatChildren(nonLeafBlock);
		const newLast = newRight._mutateSplitRight(this.context.maxBlockSize);
		const newMiddle = this.appendMiddleChild(newRight);

		return this.copy(undefined, newLast, newMiddle)._normalize();
	}

	concatTree(nonLeafTree: NonLeafTree<T>): NonLeaf<T> {
		if (
			this.right.nrChildren + nonLeafTree.left.nrChildren <=
			this.context.maxBlockSize
		) {
			// merge right and left
			const joint = this.right.concatChildren(nonLeafTree.left);

			const newThisMiddle = this.appendMiddleChild(joint);
			const newMiddle =
				null === nonLeafTree.middle
					? newThisMiddle
					: newThisMiddle.concat(nonLeafTree.middle);

			return this.copy(undefined, nonLeafTree.right, newMiddle)._normalize();
		}

		if (this.right.childrenInMin && nonLeafTree.left.childrenInMin) {
			// append both
			const newThisMiddle = this.appendMiddleChild(this.right).appendChild(
				nonLeafTree.left,
			);
			const newMiddle =
				null === nonLeafTree.middle
					? newThisMiddle
					: newThisMiddle.concat(nonLeafTree.middle);

			return this.copy(undefined, nonLeafTree.right, newMiddle)._normalize();
		}

		// merge and split
		const joint = this.right.concatChildren(nonLeafTree.left);
		const jointRight = joint._mutateSplitRight();

		const newThisMiddle = this.appendMiddleChild(joint).appendChild(jointRight);
		const newMiddle =
			null === nonLeafTree.middle
				? newThisMiddle
				: newThisMiddle.concat(nonLeafTree.middle);

		return this.copy(undefined, nonLeafTree.right, newMiddle)._normalize();
	}

	reversed(cacheMap: CacheMap = this.context.cacheMap()): NonLeafTree<T> {
		const cachedThis = cacheMap.get<NonLeafTree<T>>(this);
		if (cachedThis !== undefined) return cachedThis;

		const newMid = this.middle?.reversed(cacheMap) ?? null;
		const newLeft = this.right.reversed(cacheMap);
		const newRight =
			this.left === this.right ? newLeft : this.left.reversed(cacheMap);

		const reversedThis = this.copy(newLeft, newRight, newMid);
		return cacheMap.setAndReturn(this, reversedThis);
	}

	toArray(
		options?:
			| { range?: IndexRange | undefined; reversed?: boolean }
			| undefined,
	): T[] {
		return treeToArray(this, options);
	}

	_normalize(): NonLeaf<T> {
		if (null === this.middle) {
			if (
				this.left.nrChildren + this.right.nrChildren <=
				this.context.maxBlockSize
			) {
				// can merge left and right
				return this.left.concatChildren(this.right);
			}
		} else if (this.context.isNonLeafBlock<T>(this.middle)) {
			const firstChild = this.middle.children[0];

			if (
				this.left.nrChildren + firstChild.nrChildren <=
				this.context.maxBlockSize
			) {
				// first middle child can be merged with left
				const result = this.middle.dropFirstChild();
				const newMiddle = result[0];
				const block = result[1];

				if (this.context.isNonLeafBlock<T>(block)) {
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

				if (this.context.isNonLeafBlock<T>(block)) {
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
		return `NonLeafTree<${this.itemsLength}>(${this.left._structure()}, ${this.middle?._structure() ?? '<notree>'}, ${this.right._structure()})`;
	}
}
