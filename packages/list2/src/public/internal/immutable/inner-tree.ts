import type { IndexRange } from '@rimbu/common/index-range';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Update } from '@rimbu/common/update';
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
	treeToStreamRange,
	treeUpdate,
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

	copy2<T2, C2 extends Block<T2>>(
		left: InnerBlock<T2, C2>,
		right: InnerBlock<T2, C2>,
		middle: Inner<T2, InnerBlock<T2, C2>> | null,
		length = this.length,
		level = this.level,
	): InnerTree<T2, C2> {
		return this.context.innerTree(left, right, middle, length, level);
	}

	stream(options?: { reversed?: boolean }): Stream.NonEmpty<T> {
		return treeToStream(this, options);
	}

	streamRange(
		range: IndexRange,
		options: { reversed?: boolean } = {},
	): Stream<T> {
		return treeToStreamRange<T>(this, range, options);
	}

	get(index: number): T {
		return treeGet(this, index);
	}

	updateAt(index: number, update: Update<T>): InnerTree<T, C> {
		return treeUpdate<T, InnerTree<T, C>>(this, index, update);
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

		// left block full, see if right block can take one from left and add the new value to left
		if (null === this.middle && this.right.canAddChild) {
			const [newLeft, shiftToRightChild] = this.left.dropLastChild();
			const newRight = this.right.prependBlockChild(shiftToRightChild);
			return this.copy(
				newLeft!.prependBlockChild(child),
				newRight,
				undefined,
				newLength,
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
				return this.copy(
					newLeft?.prependBlockChild(child) ??
						this.context.innerBlock([child], child.length, this.level),
					undefined,
					newMiddle,
					newLength,
				);
			}
		}

		// no middle of first middle block full, shift whole left to middle and add new child to left
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

		// right block full, see if left block can take one from right and add the new value to right
		if (null === this.middle && this.left.canAddChild) {
			const [newRight, shiftToLeftChild] = this.right.dropFirstChild();
			const newLeft = this.left.appendBlockChild(shiftToLeftChild);
			return this.copy(
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
				return this.copy(
					undefined,
					newRight?.appendBlockChild(child) ??
						this.context.innerBlock([child], child.length, this.level),
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
			const newSelf = this.copy(
				toLeft,
				undefined,
				newMiddle,
				this.length - firstChild.length,
			)._normalize();

			return [newSelf, firstChild];
		}

		const newSelf = this.copy(
			newLeft,
			undefined,
			undefined,
			this.length - firstChild.length,
		)._normalize();

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
				this.length - lastChild.length,
			)._normalize();

			return [newSelf, lastChild];
		}

		// set the new right to right
		const newSelf = this.copy(
			undefined,
			newRight,
			undefined,
			this.length - lastChild.length,
		)._normalize();

		return [newSelf, lastChild];
	}

	modifyFirstChild(f: (child: C) => C): Inner<T, C> {
		const firstChild = this.left.children[0];
		const newFirstChild = f(firstChild);
		if (newFirstChild === firstChild) {
			return this;
		}
		const delta = newFirstChild.length - firstChild.length;
		const newLeft = this.left.copy(
			this.left.children.toSpliced(0, 1, newFirstChild),
			this.left.length + delta,
		);

		return this.copy(newLeft, undefined, undefined, this.length + delta);
	}

	modifyLastChild(f: (child: C) => C): Inner<T, C> {
		const lastChild = this.right.children.at(-1)!;
		const newLastChild = f(lastChild);
		if (newLastChild === lastChild) {
			return this;
		}
		const delta = newLastChild.length - lastChild.length;
		const newRight = this.right.copy(
			this.right.children.toSpliced(-1, 1, newLastChild),
			this.right.length + delta,
		);

		return this.copy(undefined, newRight, undefined, this.length + delta);
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

		const newLength = this.length + innerBlock.length;

		if (
			this.right.nrChildren + innerBlock.nrChildren <=
			this.context.maxBlockSize
		) {
			// append to right
			const newRight = this.right.concatChildren(innerBlock);

			return this.copy(undefined, newRight, undefined, newLength);
		}

		if (this.right.childrenInMin) {
			// move current right to middle
			const newMiddle = this.appendMiddleBlock(this.right);

			return this.copy(
				undefined,
				innerBlock,
				newMiddle,
				newLength,
			)._normalize();
		}

		// split new right
		const newRight = this.right.concatChildren(innerBlock);
		const newLast = newRight._mutateSplitRight(this.context.maxBlockSize);
		const newMiddle = this.appendMiddleBlock(newRight);

		return this.copy(undefined, newLast, newMiddle, newLength)._normalize();
	}

	concatTree(innerTree: InnerTree<T, C>): Inner<T, C> {
		const newLength = this.length + innerTree.length;

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

			return this.copy(
				undefined,
				innerTree.right,
				newMiddle,
				newLength,
			)._normalize();
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

			return this.copy(
				undefined,
				innerTree.right,
				newMiddle,
				newLength,
			)._normalize();
		}

		// merge and split
		const joint = this.right.concatChildren(innerTree.left);
		const jointRight = joint._mutateSplitRight();

		const newThisMiddle = this.appendMiddleBlock(joint).appendChild(jointRight);
		const newMiddle =
			null === innerTree.middle
				? newThisMiddle
				: newThisMiddle.concat(innerTree.middle);

		return this.copy(
			undefined,
			innerTree.right,
			newMiddle,
			newLength,
		)._normalize();
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
				const newLength =
					this.left.length + toRight.length + (newMiddle?.length ?? 0);
				const newSelf = this.copy(
					undefined,
					toRight,
					newMiddle,
					newLength,
				)._normalize();

				return [newSelf, up, upAmount];
			}

			// some right remains, update and normalize
			const newLength = this.left.length + newRight.length + this.middle.length;
			const newSelf = this.copy(
				undefined,
				newRight,
				undefined,
				newLength,
			)._normalize();

			return [newSelf, up, upAmount];
		}

		// take from middle
		const [newMiddle, upRight] = this.middle.takeInternal(middleAmount);
		const newLength =
			this.left.length + upRight.length + (newMiddle?.length ?? 0);
		const newSelf = this.copy(
			undefined,
			upRight,
			newMiddle,
			newLength,
		)._normalize();
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
				const newLength =
					toLeft.length + this.right.length + (newMiddle?.length ?? 0);
				const newSelf = this.copy(
					toLeft,
					undefined,
					newMiddle,
					newLength,
				)._normalize();

				return [newSelf, upLeft, upLeftAmount];
			}

			// left remaining
			const newLength = newLeft.length + this.right.length + this.middle.length;
			const newSelf = this.copy(newLeft, undefined, undefined, newLength);

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

		const newLength =
			upLeft.length + this.right.length + (newMiddle?.length ?? 0);
		const newSelf = this.copy(
			upLeft,
			undefined,
			newMiddle,
			newLength,
		)._normalize();

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

	map<T2, C2 extends Block<T2>>(
		mapFun: (value: T, index: number) => T2,
		options: { reversed?: boolean; indexOffset?: number } = {},
	): InnerTree<T2, C2> {
		const { reversed = false, indexOffset = 0 } = options;

		let offset = indexOffset;

		const left = this.left;
		const middle = this.middle;
		const right = this.right;

		if (reversed) {
			const newLeft = right.map<T2, C2>(mapFun, {
				reversed: true,
				indexOffset: offset,
			});
			offset += right.length;

			const newMiddle =
				null === middle
					? null
					: middle.map<T2, InnerBlock<T2, C2>>(mapFun, {
							reversed: true,
							indexOffset: offset,
						});
			if (null !== middle) offset += middle.length;

			const newRight = left.map<T2, C2>(mapFun, {
				reversed: true,
				indexOffset: offset,
			});

			return this.copy2<T2, C2>(newLeft, newRight, newMiddle);
		}

		const newLeft = left.map<T2, C2>(mapFun, { indexOffset: offset });
		offset += left.length;

		const newMiddle =
			null === middle
				? null
				: middle.map<T2, InnerBlock<T2, C2>>(mapFun, { indexOffset: offset });
		if (null !== middle) offset += middle.length;

		const newRight = right.map<T2, C2>(mapFun, { indexOffset: offset });

		return this.copy2(newLeft, newRight, newMiddle);
	}

	_structure(depth: number): string {
		const space = '  '.repeat(depth);
		const nextDepth = depth + 2;
		return `\
${space}InnerTree(lev:${this.level}, len${this.length})
${space}  left: (len:${this.left.length}, children:${this.left.nrChildren})
${this.left._structure(nextDepth)}
${space}  middle: (len:${this.middle?.length ?? '-'})
${this.middle?._structure(nextDepth) ?? `${space}    <notree>`}
${space}  right: (len:${this.right.length}, children:${this.right.nrChildren})
${this.right._structure(nextDepth)}\
`;
	}

	_verifyStructure(messages: string[] = []): string[] {
		if (this.left.level !== this.level) {
			messages.push(
				`InnerTree has left block with wrong level: ${this.left.level} != ${this.level}`,
			);
		}
		if (this.right.level !== this.level) {
			messages.push(
				`InnerTree has right block with wrong level: ${this.right.level} != ${this.level}`,
			);
		}
		if (this.middle && this.middle.level !== this.level + 1) {
			messages.push(
				`InnerTree has middle with wrong level: ${this.middle.level} != ${this.level + 1}`,
			);
		}
		if (null === this.middle) {
			if (
				this.left.nrChildren + this.right.nrChildren <=
				this.context.maxBlockSize
			) {
				messages.push(
					`InnerTree can merge left and right, they have too few children: ${this.left.nrChildren} + ${this.right.nrChildren} <= ${this.context.maxBlockSize}`,
				);
			}
		} else {
			// this.middle.modifyFirstChild((firstMiddle) => {
			// 	if (
			// 		this.left.nrChildren + firstMiddle.nrChildren <=
			// 		this.context.maxBlockSize
			// 	) {
			// 		messages.push(
			// 			`InnerTree can merge left and first middle, they have too few children: ${this.left.nrChildren} + ${firstMiddle.nrChildren} <= ${this.context.maxBlockSize}`,
			// 		);
			// 	}
			// 	return firstMiddle;
			// });
			// this.middle.modifyLastChild((lastMiddle) => {
			// 	if (
			// 		this.right.nrChildren + lastMiddle.nrChildren <=
			// 		this.context.maxBlockSize
			// 	) {
			// 		messages.push(
			// 			`InnerTree can merge right and last middle, they have too few children: ${this.right.nrChildren} + ${lastMiddle.nrChildren} <= ${this.context.maxBlockSize}`,
			// 		);
			// 	}
			// 	return lastMiddle;
			// });
		}

		this.left._verifyStructure(messages, true);
		this.middle?._verifyStructure(messages, false);
		this.right._verifyStructure(messages, true);

		return messages;
	}
}
