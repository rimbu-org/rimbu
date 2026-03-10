import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context';
import type { CacheMap } from '#list/immutable/cache-map';
import type { LeafBlock } from '#list/immutable/leaf-block';
import type { NonLeaf } from '#list/immutable/utils';
import type { ListImpl } from '#list/list-impl';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';
import { OptLazy } from '@rimbu/common/opt-lazy';

import { LeafBase } from '#list/immutable/leaf-base';
import { treeGet } from '#list/immutable/tree-base';

export class LeafTree<T> extends LeafBase<T> implements ListImpl.NonEmpty<T> {
	constructor(
		context: ListContext,
		readonly left: LeafBlock<T>,
		readonly right: LeafBlock<T>,
		readonly middle: NonLeaf<T> | null,
		readonly length: number,
	) {
		super(context);
	}

	get itemsLength() {
		return this.length;
	}

	copy(
		left = this.left,
		right = this.right,
		middle = this.middle,
		length = this.length,
	): LeafTree<T> {
		if (
			left === this.left &&
			right === this.right &&
			middle === this.middle &&
			length === this.length
		) {
			return this;
		}

		return this.context.leafTree(left, right, middle, length);
	}

	get<O>(index: number, otherwise?: OptLazy<O>): T | O {
		if (index >= this.length || -index > this.length) {
			return OptLazy(otherwise) as O;
		}
		if (index < 0) {
			return this.get(this.length + index, otherwise);
		}

		return treeGet<T>(this, index);
	}

	prepend(value: T): LeafTree<T> {
		const newLength = this.length + 1;

		if (this.left.canAddChild) {
			return this.copy(
				this.left.prependChild(value),
				this.right,
				this.middle,
				newLength,
			);
		}

		return this.copy(
			this.left.copy(this.ops.of([value])),
			this.right,
			this.middle?.prependChild(this.left) ??
				this.context.nonLeafBlock<T>([this.left], this.left.length, 1),
			newLength,
		);
	}

	append(value: T): LeafTree<T> {
		const newLength = this.length + 1;

		if (this.right.canAddChild) {
			return this.copy(
				this.left,
				this.right.append(value) as LeafBlock<T>,
				this.middle,
				newLength,
			);
		}

		return this.copy(
			this.left,
			this.right.copy(this.ops.of([value])),
			this.middle?.appendChild(this.right) ??
				this.context.nonLeafBlock<T>([this.right], this.right.length, 1),
			newLength,
		);
	}

	take(amount: number): ListImpl.NonEmpty<T> {
		return 0 as any;
	}

	drop(amount: number): ListImpl<T> {
		return 0 as any;
	}

	reversed(cacheMap: CacheMap = this.context.cacheMap()): LeafTree<T> {
		const cachedThis = cacheMap.get<LeafTree<T>>(this);
		if (cachedThis !== undefined) return cachedThis;

		const newMid = this.middle?.reversed(cacheMap) ?? null;
		const newLeft = this.right.reversed(cacheMap);
		const newRight =
			this.left === this.right ? newLeft : this.left.reversed(cacheMap);

		const reversedThis = this.copy(newLeft, newRight, newMid);
		return cacheMap.setAndReturn(this, reversedThis);
	}

	concat(...sources: ArrayNonEmpty<StreamSource<T>>): ListImpl.NonEmpty<T> {
		const asList = this.context.from(...sources) as ListImpl<T>;

		if (asList.nonEmpty()) {
			if (this.context.isLeafBlock<T>(asList)) {
				return this.concatBlock(asList);
			} else if (this.context.isLeafTree<T>(asList)) {
				return this.concatTree(asList);
			} else {
				throwInvalidStateError();
			}
		}

		return this;
	}

	concatBlock(leafBlock: LeafBlock<T>): ListImpl.NonEmpty<T> {
		if (this.right.length + leafBlock.length <= this.context.maxBlockSize) {
			const newRight = this.right.concatChildren(leafBlock);
			return this.copy(undefined, newRight);
		}

		if (this.right.childrenInMin) {
			const newMiddle = this.appendMiddle(this.right);

			return this.copy(undefined, leafBlock, newMiddle);
		}

		const newRight = this.right.concatChildren(leafBlock);
		const newLast = newRight._mutateSplitRight(this.context.maxBlockSize);
		const newMiddle = this.appendMiddle(newRight);

		return this.copy(undefined, newLast, newMiddle);
	}

	concatTree(leafTree: LeafTree<T>): LeafTree<T> {
		const jointLength = this.right.length + leafTree.left.length;

		if (jointLength < this.context.minBlockSize) {
			if (null === this.middle) {
				// left + right > maxBlockSize
				const joint = this.left
					.concatChildren(this.right)
					.concatChildren(leafTree.left);
				const toMiddle = joint._mutateSplitRight(
					this.ops.length(joint.children) - this.context.maxBlockSize,
				);
				const newMiddle = leafTree.prependMiddle(toMiddle);

				return leafTree.copy(joint, undefined, newMiddle);
			}

			const [newMiddle, toJoint] = this.middle.dropLastChild();
			if (!this.context.isLeafBlock<T>(toJoint)) {
				throwInvalidStateError();
			}
			const joint = toJoint
				.concatChildren(this.right)
				.concatChildren(leafTree.left);

			if (joint.childrenInMax) {
				const m =
					null === newMiddle
						? leafTree.prependMiddle(joint)
						: newMiddle.concatNonLeaf(leafTree.prependMiddle(joint));
				return this.copy(undefined, leafTree.right, m);
			}

			const newOtherLeft = joint._mutateSplitRight();
			const newMiddle2 =
				null === newMiddle
					? leafTree.prependMiddle(newOtherLeft).prependChild(joint)
					: null === leafTree.middle
						? newMiddle.appendChild(joint).appendChild(newOtherLeft)
						: newMiddle
								.appendChild(joint)
								.appendChild(newOtherLeft)
								.concatNonLeaf(leafTree.middle);
			return this.copy(undefined, leafTree.right, newMiddle2);
		}

		if (jointLength <= this.context.maxBlockSize) {
			const joint = this.right.concatChildren(leafTree.left);
			const newThisMiddle = this.appendMiddle(joint);
			const newMiddle =
				null === leafTree.middle
					? newThisMiddle
					: newThisMiddle.concatNonLeaf(leafTree.middle);
			return this.copy(undefined, leafTree.right, newMiddle);
		}

		if (this.right.childrenInMin && leafTree.left.childrenInMin) {
			const newThisMiddle = this.appendMiddle(this.right).appendChild(
				leafTree.left,
			);
			const newMiddle =
				null === leafTree.middle
					? newThisMiddle
					: newThisMiddle.concatNonLeaf(leafTree.middle);

			return this.copy(undefined, leafTree.right, newMiddle);
		}

		const joint = this.right.concatChildren(leafTree.left);
		const jointRight = joint._mutateSplitRight();

		const newThisMiddle = this.appendMiddle(joint).appendChild(jointRight);
		const newMiddle =
			null === leafTree.middle
				? newThisMiddle
				: newThisMiddle.concatNonLeaf(leafTree.middle);

		return this.copy(undefined, leafTree.right, newMiddle);
	}

	prependMiddle(leafBlock: LeafBlock<T>): NonLeaf<T> {
		return (
			this.middle?.prependChild(leafBlock) ??
			this.context.nonLeafBlock<T>([leafBlock], leafBlock.length, 1)
		);
	}

	appendMiddle(leafBlock: LeafBlock<T>): NonLeaf<T> {
		return (
			this.middle?.appendChild(leafBlock) ??
			this.context.nonLeafBlock<T>([leafBlock], leafBlock.length, 1)
		);
	}

	_structure(): string {
		return `LeafTree<${this.length}>(${this.left._structure()}, ${this.middle?._structure() ?? '<notree>'}, ${this.right._structure()})`;
	}
}
