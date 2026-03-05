import type { ListContext } from '#list/context';
import type { CacheMap } from '#list/immutable/cache-map';
import type { Block, NonLeaf } from '#list/immutable/utils';

import { append, last, prepend, reverseMap } from '@rimbu/base/arr';
import { throwInvalidStateError } from '@rimbu/base/rimbu-error';

import { NonLeafBase } from '#list/immutable/non-leaf-base';

export class NonLeafBlock<T> extends NonLeafBase<T> implements NonLeaf<T> {
	constructor(
		context: ListContext,
		readonly children: readonly Block<T>[],
		readonly itemsLength: number,
		readonly level: number,
	) {
		super(context);
	}

	get nrChildren(): number {
		return this.children.length;
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

	get(index: number): T {
		const [childIndex, inChildIndex] = this.getCoordinates(index, false, false);

		return this.children[childIndex].get(inChildIndex);
	}

	prependChild(child: NonLeaf<T>): NonLeaf<T> {
		const newLength = this.itemsLength + child.itemsLength;

		if (this.nrChildren < this.context.maxBlockSize) {
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

	appendChild(child: NonLeaf<T>): NonLeaf<T> {
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

	reversed(cacheMap: CacheMap = this.context.cacheMap()): NonLeafBlock<T> {
		const cachedThis = cacheMap.get<NonLeafBlock<T>>(this);
		if (cachedThis !== undefined) return cachedThis;

		const newChildren = reverseMap(this.children, (child) =>
			child.reversed(cacheMap),
		);

		const reversedThis = this.copy(newChildren, this.itemsLength);
		return cacheMap.setAndReturn(this, reversedThis);
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

	_structure(): string {
		return `NonLeafBlock<${this.itemsLength}>(${this.children.map((c) => c._structure()).join(',')})`;
	}
}
