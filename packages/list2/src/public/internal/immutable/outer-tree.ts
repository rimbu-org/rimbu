import type { IndexRange } from '@rimbu/common/index-range';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { Stream, StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context-module';
import type { CacheMap } from '#list/immutable/cache-map';
import type { OuterBlock } from '#list/immutable/outer-block';
import type { Inner, ListCommon } from '#list/immutable/utils';
import type { ListImpl } from '#list/list-impl';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { TraverseState } from '@rimbu/common/traverse-state';

import { OuterBase } from '#list/immutable/outer-base';
import {
	treeForEach,
	treeGet,
	treeToArray,
	treeToStream,
} from '#list/immutable/tree-base';

export class OuterTree<T>
	extends OuterBase<T>
	implements ListImpl.NonEmpty<T>, ListCommon<T>
{
	constructor(
		context: ListContext,
		readonly left: OuterBlock<T>,
		readonly right: OuterBlock<T>,
		readonly middle: Inner<T, OuterBlock<T>> | null,
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
	): OuterTree<T> {
		if (
			left === this.left &&
			right === this.right &&
			middle === this.middle &&
			length === this.length
		) {
			return this;
		}

		return this.context.outerTree<T>(left, right, middle, length);
	}

	stream(options?: { reversed?: boolean }): Stream.NonEmpty<T> {
		return treeToStream(this, options);
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

	first(): T {
		return this.left.first();
	}

	last(): T {
		return this.right.last();
	}

	prepend(value: T): OuterTree<T> {
		const newLength = this.length + 1;

		if (this.left.canAddChild) {
			return this.copy(
				this.left.prependBlockChild(value),
				this.right,
				this.middle,
				newLength,
			);
		}

		const newMiddle =
			this.middle?.prependChild(this.left) ??
			this.context.innerBlock([this.left], this.left.length, 1);

		return this.copy(
			this.left.copy(this.ops.of([value])),
			this.right,
			newMiddle,
			newLength,
		);
	}

	append(value: T): OuterTree<T> {
		const newLength = this.length + 1;

		if (this.right.canAddChild) {
			return this.copy(
				this.left,
				this.right.append(value) as OuterBlock<T>,
				this.middle,
				newLength,
			);
		}

		const newMiddle =
			this.middle?.appendChild(this.right) ??
			this.context.innerBlock<T, OuterBlock<T>>(
				[this.right],
				this.right.length,
				1,
			);

		return this.copy(
			this.left,
			this.right.copy(this.ops.of([value])),
			newMiddle,
			newLength,
		);
	}

	take(amountInput: number): any {
		const amount = Math.floor(amountInput);
		if (amount === 0) return this.context.empty();
		if (amount >= this.length || -amount > this.length) return this;
		if (amount < 0) return this.drop(this.length + amount);

		const middleAmount = amount - this.left.length;

		if (middleAmount <= 0) return this.left.take(amount);

		if (null === this.middle) {
			return this.copy(
				undefined,
				this.right.takeChildren(middleAmount),
			)._normalize();
		}

		const rightAmount = middleAmount - this.middle.length;

		if (rightAmount > 0) {
			const newRight = this.right.takeChildren(rightAmount);
			return this.copy(undefined, newRight)._normalize();
		}

		const [newMiddle, upRight, inUpRight] =
			this.middle.takeInternal(middleAmount);

		const newRight = upRight.takeChildren(inUpRight);

		return this.copy(undefined, newRight, newMiddle)._normalize();
	}

	drop(amountInput: number): ListImpl<T> {
		const amount = Math.floor(amountInput);
		if (amount === 0) return this;
		if (amount >= this.length || -amount > this.length)
			return this.context.empty();
		if (amount < 0) return this.take(this.length + amount);

		const middleAmount = amount - this.left.length;

		if (middleAmount < 0) {
			const newLeft = this.left.dropChildren(amount);
			return this.copy(newLeft)._normalize();
		}

		if (null === this.middle) {
			return this.right.drop(middleAmount);
		}

		const rightAmount = middleAmount - this.middle.length;

		if (rightAmount >= 0) {
			return this.right.drop(rightAmount);
		}

		const [newMiddle, upLeft, inUpLeft] =
			this.middle.dropInternal(middleAmount);
		const newLeft = upLeft.dropChildren(inUpLeft);

		return this.copy(newLeft, undefined, newMiddle)._normalize();
	}

	reversed(cacheMap: CacheMap = this.context.cacheMap()): OuterTree<T> {
		const cachedThis = cacheMap.get<OuterTree<T>>(this);
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
			if (this.context.isOuterBlock<T>(asList)) {
				return this.concatBlock(asList);
			} else if (this.context.isOuterTree<T>(asList)) {
				return this.concatTree(asList);
			} else {
				throwInvalidStateError();
			}
		}

		return this;
	}

	concatBlock(outerBlock: OuterBlock<T>): ListImpl.NonEmpty<T> {
		if (this.right.length + outerBlock.length <= this.context.maxBlockSize) {
			const newRight = this.right.concatChildren(outerBlock);
			return this.copy(undefined, newRight);
		}

		if (this.right.childrenInMin) {
			const newMiddle = this.appendMiddle(this.right);

			return this.copy(undefined, outerBlock, newMiddle);
		}

		const newRight = this.right.concatChildren(outerBlock);
		const newLast = newRight._mutateSplitRight(this.context.maxBlockSize);
		const newMiddle = this.appendMiddle(newRight);

		return this.copy(undefined, newLast, newMiddle);
	}

	concatTree(outerTree: OuterTree<T>): OuterTree<T> {
		const jointLength = this.right.length + outerTree.left.length;

		if (jointLength < this.context.minBlockSize) {
			if (null === this.middle) {
				// left + right > maxBlockSize
				const joint = this.left
					.concatChildren(this.right)
					.concatChildren(outerTree.left);
				const toMiddle = joint._mutateSplitRight(
					this.ops.length(joint.children) - this.context.maxBlockSize,
				);
				const newMiddle = outerTree.prependMiddle(toMiddle);

				return outerTree.copy(joint, undefined, newMiddle);
			}

			const [newMiddle, toJoint] = this.middle.dropLastChild();
			const joint = toJoint
				.concatChildren(this.right)
				.concatChildren(outerTree.left);

			if (joint.childrenInMax) {
				const m =
					null === newMiddle
						? outerTree.prependMiddle(joint)
						: newMiddle.concat(outerTree.prependMiddle(joint));
				return this.copy(undefined, outerTree.right, m);
			}

			const newOtherLeft = joint._mutateSplitRight();
			const newMiddle2 =
				null === newMiddle
					? outerTree.prependMiddle(newOtherLeft).prependChild(joint)
					: null === outerTree.middle
						? newMiddle.appendChild(joint).appendChild(newOtherLeft)
						: newMiddle
								.appendChild(joint)
								.appendChild(newOtherLeft)
								.concat(outerTree.middle);
			return this.copy(undefined, outerTree.right, newMiddle2);
		}

		if (jointLength <= this.context.maxBlockSize) {
			const joint = this.right.concatChildren(outerTree.left);
			const newThisMiddle = this.appendMiddle(joint);
			const newMiddle =
				null === outerTree.middle
					? newThisMiddle
					: newThisMiddle.concat(outerTree.middle);
			return this.copy(undefined, outerTree.right, newMiddle);
		}

		if (this.right.childrenInMin && outerTree.left.childrenInMin) {
			const newThisMiddle = this.appendMiddle(this.right).appendChild(
				outerTree.left,
			);
			const newMiddle =
				null === outerTree.middle
					? newThisMiddle
					: newThisMiddle.concat(outerTree.middle);

			return this.copy(undefined, outerTree.right, newMiddle);
		}

		const joint = this.right.concatChildren(outerTree.left);
		const jointRight = joint._mutateSplitRight();

		const newThisMiddle = this.appendMiddle(joint).appendChild(jointRight);
		const newMiddle =
			null === outerTree.middle
				? newThisMiddle
				: newThisMiddle.concat(outerTree.middle);

		return this.copy(undefined, outerTree.right, newMiddle);
	}

	prependMiddle(outerBlock: OuterBlock<T>): Inner<T, OuterBlock<T>> {
		return (
			this.middle?.prependChild(outerBlock) ??
			this.context.innerBlock<T, OuterBlock<T>>(
				[outerBlock],
				outerBlock.length,
				1,
			)
		);
	}

	appendMiddle(outerBlock: OuterBlock<T>): Inner<T, OuterBlock<T>> {
		return (
			this.middle?.appendChild(outerBlock) ??
			this.context.innerBlock<T, OuterBlock<T>>(
				[outerBlock],
				outerBlock.length,
				1,
			)
		);
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { reversed?: boolean; state?: TraverseState } | undefined = {},
	): void {
		const { reversed = false, state = TraverseState() } = options;
		treeForEach(this, f, { reversed, state });
	}

	toArray(options?: {
		range?: IndexRange | undefined;
		reversed?: boolean | undefined;
	}): ArrayNonEmpty<T> {
		return treeToArray(this, options) as ArrayNonEmpty<T>;
	}

	_normalize(): ListImpl.NonEmpty<T> {
		if (null === this.middle) {
			if (this.length <= this.context.maxBlockSize) {
				// can merge left and right
				return this.left.concatChildren(this.right);
			}
		} else if (this.context.isInnerBlock<T, OuterBlock<T>>(this.middle)) {
			if (this.length <= this.context.maxBlockSize) {
				// left, middle, and right can be merged into one block
				const firstMiddleChild = this.middle.children[0]!;

				return this.left
					.concatChildren(firstMiddleChild)
					.concatChildren(this.right);
			}

			const firstChild = this.middle.children[0]!;

			if (this.left.length + firstChild.length <= this.context.maxBlockSize) {
				// first middle child can be merged with left
				const result = this.middle.dropFirstChild();
				const newMiddle = result[0];
				const block = result[1];
				return this.copy(this.left.concatChildren(block), undefined, newMiddle);
			}

			const lastChild = this.middle.children.at(-1)!;

			if (this.right.length + lastChild.length <= this.context.maxBlockSize) {
				// last middle child can be merged with right
				const result = this.middle.dropLastChild();
				const newMiddle = result[0];
				const block = result[1];

				return this.copy(
					undefined,
					block.concatChildren(this.right),
					newMiddle,
				);
			}
		}

		return this;
	}

	_structure(): string {
		return `OuterTree<${this.length}>(${this.left._structure()}, ${this.middle?._structure() ?? '<notree>'}, ${this.right._structure()})`;
	}
}
