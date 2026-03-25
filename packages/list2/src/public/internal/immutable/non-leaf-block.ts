import type { NonLeafBlockBuilder } from '../mutable/non-leaf-block-builder';

import type { ListContext } from '#list/context-module';
import type { CacheMap } from '#list/immutable/cache-map';
import type { NonLeafTree } from '#list/immutable/non-leaf-tree';
import type { Block, NonLeaf } from '#list/immutable/utils';

import { append, concat, last, prepend, reverseMap } from '@rimbu/base/arr';
import { throwInvalidStateError } from '@rimbu/base/rimbu-error';
import { IndexRange } from '@rimbu/common/index-range';
import { Stream } from '@rimbu/stream';

import { NonLeafBase } from '#list/immutable/non-leaf-base';

export class NonLeafBlock<T> extends NonLeafBase<T> implements Block<T> {
	constructor(
		context: ListContext,
		readonly children: Block<T>[],
		public itemsLength: number,
		readonly level: number,
	) {
		super(context);
	}

	get nrChildren(): number {
		return this.children.length;
	}

	get childrenInMax(): boolean {
		return this.children.length <= this.context.maxBlockSize;
	}

	get childrenInMin(): boolean {
		return this.children.length >= this.context.minBlockSize;
	}

	get canAddChild(): boolean {
		return this.children.length < this.context.maxBlockSize;
	}

	copy(
		children = this.children,
		itemsLength = this.itemsLength,
		level = this.level,
	): NonLeafBlock<T> {
		if (
			children === this.children &&
			itemsLength === this.itemsLength &&
			level === this.level
		) {
			return this;
		}

		return this.context.nonLeafBlock(children, itemsLength, level);
	}

	stream(options: { reversed?: boolean } = {}): Stream.NonEmpty<T> {
		return Stream.fromArray(this.children, options)
			.assumeNonEmpty()
			.flatMap((child) => child.stream(options));
	}

	get(index: number): T {
		const [childIndex, inChildIndex] = this.getCoordinates(index, false, false);

		return this.children[childIndex].get(inChildIndex);
	}

	prependChild(child: Block<T>): NonLeaf<T> {
		const newLength = this.itemsLength + child.itemsLength;

		if (this.canAddChild) {
			return this.copy(prepend(this.children, child), newLength);
		}

		return this.context.nonLeafTree(
			this.copy([child], child.itemsLength),
			this,
			null,
			newLength,
			this.level,
		);
	}

	appendChild(child: Block<T>): NonLeaf<T> {
		const newLength = this.itemsLength + child.itemsLength;

		if (this.nrChildren < this.context.maxBlockSize) {
			return this.copy(append(this.children, child), newLength);
		}

		return this.context.nonLeafTree(
			this,
			this.copy([child], child.itemsLength),
			null,
			newLength,
			this.level,
		);
	}

	concatNonLeaf(nonLeaf: NonLeaf<T>): NonLeaf<T> {
		if (nonLeaf.context.isNonLeafBlock<T>(nonLeaf)) {
			if (nonLeaf === this && this.childrenInMin) {
				return this.context.nonLeafTree(
					this,
					this,
					null,
					this.itemsLength + nonLeaf.itemsLength,
					this.level,
				);
			}

			return this.concatBlock(nonLeaf);
		}
		if (this.context.isNonLeafTree<T>(nonLeaf)) {
			return this.concatTree(nonLeaf);
		}

		throwInvalidStateError();
	}

	concatBlock(nonLeafBlock: NonLeafBlock<T>): NonLeaf<T> {
		return this.concatChildren(nonLeafBlock)._mutateNormalize();
	}

	concatTree(nonLeafTree: NonLeafTree<T>): NonLeaf<T> {
		if (
			this.nrChildren + nonLeafTree.left.nrChildren <=
			this.context.maxBlockSize
		) {
			const newLeft = this.concatChildren(nonLeafTree.left)._mutateRebalance();

			return nonLeafTree.copy(newLeft);
		}

		if (nonLeafTree.left.childrenInMin) {
			const newMiddle = nonLeafTree.prependMiddleChild(nonLeafTree.left);

			return nonLeafTree.copy(this, undefined, newMiddle);
		}

		const newLeft = this.concatChildren(nonLeafTree.left)._mutateRebalance();
		if (newLeft.childrenInMax) return nonLeafTree.copy(newLeft);

		const newSecond = newLeft._mutateSplitRight(
			newLeft.nrChildren - this.context.maxBlockSize,
		);
		const newMiddle = nonLeafTree.prependMiddleChild(newSecond);

		return nonLeafTree.copy(newLeft, undefined, newMiddle);
	}

	concatChildren(other: NonLeafBlock<T>): NonLeafBlock<T> {
		const newChildren = this.children.concat(other.children);

		return this.copy(newChildren, this.itemsLength + other.itemsLength);
	}

	reversed(cacheMap: CacheMap = this.context.cacheMap()): NonLeafBlock<T> {
		const cachedThis = cacheMap.get<NonLeafBlock<T>>(this);
		if (cachedThis !== undefined) return cachedThis;

		const newChildren = reverseMap(this.children, (child) =>
			child.reversed(cacheMap),
		);

		const reversedThis = this.copy(newChildren, this.itemsLength);
		return cacheMap.setAndReturn(this, reversedThis);
	}

	dropFirstChild(): [NonLeafBlock<T> | null, Block<T>] {
		const firstChild = this.children[0];

		if (this.nrChildren === 1) return [null, firstChild];

		const newChildren = this.children.slice(1);
		const newLength = this.itemsLength - firstChild.itemsLength;
		const newSelf = this.copy(newChildren, newLength);

		return [newSelf, firstChild];
	}

	dropLastChild(): [NonLeafBlock<T> | null, Block<T>] {
		const lastChild = this.children.at(-1)!;

		if (this.nrChildren === 1) return [null, lastChild];

		const newChildren = this.children.slice(0, -1);
		const newLength = this.itemsLength - lastChild.itemsLength;
		const newSelf = this.copy(newChildren, newLength);

		return [newSelf, lastChild];
	}

	toArray(
		options: { range?: IndexRange | undefined; reversed?: boolean } = {},
	): T[] {
		const { range, reversed = false } = options;

		let start = 0;
		let end = this.itemsLength - 1;

		if (undefined !== range) {
			const indexRange = IndexRange.getIndicesFor(range, this.itemsLength);
			if (indexRange === 'empty') return [];
			if (indexRange !== 'all') {
				start = indexRange[0];
				end = indexRange[1];
			}
		}

		const [startChildIndex, inStartChildIndex] = this.getCoordinates(
			start,
			false,
			true,
		);
		const [endChildIndex, inEndChildIndex] = this.getCoordinates(
			end,
			false,
			true,
		);

		const children = this.children;

		if (startChildIndex === endChildIndex) {
			const child = children[startChildIndex];

			return child.toArray({
				range: {
					start: inStartChildIndex,
					end: inEndChildIndex,
				},
				reversed,
			});
		}

		const firstArray = children[startChildIndex].toArray({
			range: {
				start: inStartChildIndex,
			},
			reversed,
		});

		const lastArray = children[endChildIndex].toArray({
			range: { end: inEndChildIndex },
			reversed,
		});

		if (reversed) {
			let result: readonly T[] = lastArray;

			for (
				let childIndex = endChildIndex - 1;
				childIndex > startChildIndex;
				childIndex--
			) {
				result = concat(
					result,
					children[childIndex].toArray({ reversed: true }),
				);
			}

			return concat(result, firstArray) as T[];
		}

		let result: readonly T[] = firstArray;

		for (
			let childIndex = startChildIndex + 1;
			childIndex < endChildIndex;
			childIndex++
		) {
			result = concat(result, children[childIndex].toArray());
		}

		return concat(result, lastArray) as T[];
	}

	getCoordinates(
		index: number,
		forTake: boolean,
		noEmptyLast: boolean,
	): [number, number] {
		const offSet = forTake ? 1 : 0;
		let indexWithOffset = index - offSet;

		const nrChildren = this.nrChildren;
		const length = this.itemsLength;
		const children = this.children;

		if (indexWithOffset >= length) {
			// return the end
			if (noEmptyLast) {
				return [nrChildren - 1, last(children).itemsLength - 1];
			}

			return [nrChildren, 0];
		}

		const levelBits = this.context.blockSizeBits << (this.level - 1);
		const blockSize = 1 << levelBits;

		const regularSize = nrChildren * blockSize;

		if (length === regularSize) {
			// regular blocks, calculate coordinates
			const childIndex = indexWithOffset >>> levelBits;

			const mask = blockSize - 1;
			const inChildIndex = indexWithOffset & mask;
			return [childIndex, inChildIndex + offSet];
		}

		// not regular, need to search per child
		if (indexWithOffset <= length >>> 1) {
			// search from left to right
			for (let childIndex = 0; childIndex < nrChildren; childIndex++) {
				const childLength = children[childIndex].itemsLength;

				if (indexWithOffset < childLength) {
					return [childIndex, indexWithOffset + offSet];
				}

				indexWithOffset -= childLength;
			}
		} else {
			// search right to left
			let i = length - indexWithOffset;
			for (let childIndex = nrChildren - 1; childIndex >= 0; childIndex--) {
				const childLength = children[childIndex].itemsLength;

				if (i <= childLength) {
					return [childIndex, childLength - i + offSet];
				}

				i -= childLength;
			}
		}

		throwInvalidStateError();
	}

	createBlockBuilder(): NonLeafBlockBuilder<T> {
		return this.context.nonLeafBlockBuilderSource(this);
	}

	_mutateRebalance(): NonLeafBlock<T> {
		let i = 0;

		const children = this.children;

		while (i < children.length - 1) {
			const child = children[i];
			const rightChild = children[i + 1];

			if (
				child.nrChildren + rightChild.nrChildren <=
				this.context.maxBlockSize
			) {
				const newChild = child.concatChildren(rightChild);
				this.children.splice(i, 2, newChild);
			} else i++;
		}

		return this;
	}

	_mutateNormalize(): NonLeaf<T> {
		if (this.childrenInMax) {
			return this;
		}

		const newRight = this._mutateSplitRight();

		return this.context.nonLeafTree(
			this,
			newRight,
			null,
			this.itemsLength,
			this.level,
		);
	}

	_mutateSplitRight(childIndex = this.nrChildren >>> 1): NonLeafBlock<T> {
		const rightChildren = this.children.splice(childIndex);
		let rightLength = 0;

		for (let i = 0; i < rightChildren.length; i++) {
			rightLength += rightChildren[i].itemsLength;
		}

		this.itemsLength -= rightLength;

		return this.copy(rightChildren, rightLength);
	}

	_structure(): string {
		return `NonLeafBlock<${this.itemsLength}>(${this.children.map((c) => c._structure()).join(',')})`;
	}
}
