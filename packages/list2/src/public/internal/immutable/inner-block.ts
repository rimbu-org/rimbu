import type { TraverseState } from '@rimbu/common/traverse-state';

import type { ListContext } from '#list/context-module';
import type { CacheMap } from '#list/immutable/cache-map';
import type { InnerTree } from '#list/immutable/inner-tree';
import type { Block, Inner } from '#list/immutable/utils';
import type { InnerBlockBuilder } from '#list/mutable/inner-block-builder';

import {
	append,
	concat,
	last,
	prepend,
	reverseMap,
	splice,
} from '@rimbu/base/arr';
import { throwInvalidStateError } from '@rimbu/base/rimbu-error';
import { IndexRange } from '@rimbu/common/index-range';
import { Stream } from '@rimbu/stream';

import { InnerBase } from '#list/immutable/inner-base';

export class InnerBlock<T> extends InnerBase<T> implements Block<T> {
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
	): InnerBlock<T> {
		if (
			children === this.children &&
			itemsLength === this.itemsLength &&
			level === this.level
		) {
			return this;
		}

		return this.context.innerBlock(children, itemsLength, level);
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

	prependChildDirect(child: Block<T>): InnerBlock<T> {
		const newLength = this.itemsLength + child.itemsLength;

		return this.copy(prepend(this.children, child), newLength);
	}

	prependChild(child: Block<T>): Inner<T, Block<T>> {
		if (this.canAddChild) {
			return this.prependChildDirect(child);
		}

		const newLength = this.itemsLength + child.itemsLength;

		return this.context.innerTree(
			this.copy([child], child.itemsLength),
			this,
			null,
			newLength,
			this.level,
		);
	}

	appendChild(child: Block<T>): Inner<T, Block<T>> {
		const newLength = this.itemsLength + child.itemsLength;

		if (this.nrChildren < this.context.maxBlockSize) {
			return this.copy(append(this.children, child), newLength);
		}

		return this.context.innerTree(
			this,
			this.copy([child], child.itemsLength),
			null,
			newLength,
			this.level,
		);
	}

	concat(other: Inner<T, Block<T>>): Inner<T, Block<T>> {
		if (other.context.isInnerBlock<T>(other)) {
			if (other === this && this.children.length > this.context.minBlockSize) {
				return this.context.innerTree(
					this,
					this,
					null,
					this.itemsLength,
					this.level,
				);
			}

			return this.concatBlock(other);
		}
		if (this.context.isInnerTree<T>(other)) {
			return this.concatTree(other);
		}

		throwInvalidStateError();
	}

	concatInner(inner: Inner<T, Block<T>>): Inner<T, Block<T>> {
		if (inner.context.isInnerBlock<T>(inner)) {
			if (inner === this && this.childrenInMin) {
				return this.context.innerTree(
					this,
					this,
					null,
					this.itemsLength + inner.itemsLength,
					this.level,
				);
			}

			return this.concatBlock(inner);
		}
		if (this.context.isInnerTree<T>(inner)) {
			return this.concatTree(inner);
		}

		throwInvalidStateError();
	}

	concatBlock(innerBlock: InnerBlock<T>): Inner<T, Block<T>> {
		return this.concatChildren(innerBlock)._mutateNormalize();
	}

	concatTree(innerTree: InnerTree<T>): Inner<T, Block<T>> {
		if (
			this.nrChildren + innerTree.left.nrChildren <=
			this.context.maxBlockSize
		) {
			const newLeft = this.concatChildren(innerTree.left)._mutateRebalance();

			return innerTree.copy(newLeft);
		}

		if (innerTree.left.childrenInMin) {
			const newMiddle = innerTree.prependMiddleChild(innerTree.left);

			return innerTree.copy(this, undefined, newMiddle);
		}

		const newLeft = this.concatChildren(innerTree.left)._mutateRebalance();
		if (newLeft.childrenInMax) return innerTree.copy(newLeft);

		const newSecond = newLeft._mutateSplitRight(
			newLeft.nrChildren - this.context.maxBlockSize,
		);
		const newMiddle = innerTree.prependMiddleChild(newSecond);

		return innerTree.copy(newLeft, undefined, newMiddle);
	}

	concatChildren(other: InnerBlock<T>): InnerBlock<T> {
		const newChildren = this.children.concat(other.children);

		return this.copy(newChildren, this.itemsLength + other.itemsLength);
	}

	reversed(cacheMap: CacheMap = this.context.cacheMap()): InnerBlock<T> {
		const cachedThis = cacheMap.get<InnerBlock<T>>(this);
		if (cachedThis !== undefined) return cachedThis;

		const newChildren = reverseMap(this.children, (child) =>
			child.reversed(cacheMap),
		);

		const reversedThis = this.copy(newChildren, this.itemsLength);
		return cacheMap.setAndReturn(this, reversedThis);
	}

	dropFirstChild(): [InnerBlock<T> | null, Block<T>] {
		const firstChild = this.children[0];

		if (this.nrChildren === 1) return [null, firstChild];

		const newChildren = this.children.slice(1);
		const newLength = this.itemsLength - firstChild.itemsLength;
		const newSelf = this.copy(newChildren, newLength);

		return [newSelf, firstChild];
	}

	dropLastChild(): [InnerBlock<T> | null, Block<T>] {
		const lastChild = this.children.at(-1)!;

		if (this.nrChildren === 1) return [null, lastChild];

		const newChildren = this.children.slice(0, -1);
		const newLength = this.itemsLength - lastChild.itemsLength;
		const newSelf = this.copy(newChildren, newLength);

		return [newSelf, lastChild];
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { reversed: boolean; state: TraverseState },
	): void {
		const { reversed, state } = options;

		if (state.halted) return;

		const length = this.children.length;

		if (!reversed) {
			let i = -1;
			const children = this.children;

			while (!state.halted && ++i < length) {
				children[i].forEach(f, options);
			}
		} else {
			let i = length;
			const children = this.children;

			while (!state.halted && --i >= 0) {
				children[i].forEach(f, options);
			}
		}
	}

	takeChildren(childAmount: number): InnerBlock<T> | null {
		if (childAmount <= 0) return null;
		if (childAmount >= this.nrChildren) return this;

		const newChildren = splice(
			this.children,
			childAmount,
			this.context.maxBlockSize,
		);

		const length = newChildren.reduce((l, c): number => l + c.itemsLength, 0);

		return this.copy(newChildren, length);
	}

	dropChildren(childAmount: number): InnerBlock<T> | null {
		if (childAmount <= 0) {
			return this;
		}
		if (childAmount >= this.nrChildren) {
			return null;
		}

		const newChildren = splice(this.children, 0, childAmount);

		const length = newChildren.reduce((l, c): number => l + c.itemsLength, 0);

		return this.copy(newChildren, length);
	}

	takeInternal(amount: number): [InnerBlock<T> | null, Block<T>, number] {
		const [childIndex, inChildIndex] = this.getCoordinates(amount, true, false);

		if (childIndex >= this.nrChildren) {
			throwInvalidStateError();
		}

		const lastChild = this.children[childIndex];
		const newSelf = this.takeChildren(childIndex);

		return [newSelf, lastChild, inChildIndex];
	}

	dropInternal(amount: number): [InnerBlock<T> | null, Block<T>, number] {
		const [childIndex, inChildIndex] = this.getCoordinates(
			amount,
			false,
			false,
		);

		if (childIndex >= this.nrChildren) {
			throwInvalidStateError();
		}

		const firstChild = this.children[childIndex];
		const newSelf = this.dropChildren(childIndex + 1);

		return [newSelf, firstChild, inChildIndex];
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

	createBlockBuilder(): InnerBlockBuilder<T> {
		return this.context.innerBlockBuilderSource(this);
	}

	_mutateRebalance(): InnerBlock<T> {
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

	_mutateNormalize(): Inner<T, Block<T>> {
		if (this.childrenInMax) {
			return this;
		}

		const newRight = this._mutateSplitRight();

		return this.context.innerTree(
			this,
			newRight,
			null,
			this.itemsLength,
			this.level,
		);
	}

	_mutateSplitRight(childIndex = this.nrChildren >>> 1): InnerBlock<T> {
		const rightChildren = this.children.splice(childIndex);
		let rightLength = 0;

		for (let i = 0; i < rightChildren.length; i++) {
			rightLength += rightChildren[i].itemsLength;
		}

		this.itemsLength -= rightLength;

		return this.copy(rightChildren, rightLength);
	}

	_structure(): string {
		return `InnerBlock<${this.itemsLength}>(${this.children.map((c) => c._structure()).join(',')})`;
	}
}
