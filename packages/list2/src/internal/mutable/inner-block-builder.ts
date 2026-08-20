import type { ListContext } from '#list/context';
import type { InnerBlock } from '#list/immutable/inner-block';
import type { BlockBuilder, InnerBuilder } from '#list/mutable/common';

import { type Int, throwInvalidUsageError } from '@rimbu/base';

import { CacheMap } from '#list/immutable/cache-map';
import { SizeTable } from '#list/size-table';

export class InnerBlockBuilder<T, C extends BlockBuilder<T>>
	implements InnerBuilder<T, C>, BlockBuilder<T, C>
{
	constructor(
		readonly context: ListContext,
		readonly level: number,
		source?: InnerBlock<T, any>,
		children?: C[],
		size: number = source?.size ?? 0,
	) {
		if (undefined === source && undefined === children) {
			throwInvalidUsageError('Either source or children must be defined');
		}
		if (undefined !== source && undefined !== children) {
			throwInvalidUsageError(
				'Either source or children must be defined, but not both',
			);
		}

		this.#source = source;
		this.#_children = children;
		this.#size = size;
		this.#_sizeTable = source?.cachedSizeTable;
	}

	declare _self: InnerBlockBuilder<T, C>;

	#source?: InnerBlock<T, any> | undefined;
	#_children?: C[] | undefined;
	#size: number;
	#_sizeTable: SizeTable | undefined;

	get #sizeTable(): SizeTable {
		if (undefined === this.#_sizeTable) {
			const maxChildSize = 1 << (this.level * this.context.blockSizeBits);
			this.#_sizeTable = SizeTable.fromChildren(
				this.#children,
				maxChildSize,
				this.size,
			);
		}

		return this.#_sizeTable;
	}

	get #children(): C[] {
		return this.#_children as C[];
	}

	get size(): number {
		return this.#size;
	}

	get nrChildren(): number {
		return this.#source?._nrChildren ?? this.#children.length;
	}

	get canAddChild(): boolean {
		return this.nrChildren < this.context.maxBlockSize;
	}

	get canRemoveChild(): boolean {
		return this.nrChildren > this.context.minBlockSize;
	}

	get notTooManyChildren(): boolean {
		return this.nrChildren <= this.context.maxBlockSize;
	}

	get hasEnoughChildren(): boolean {
		return this.nrChildren >= this.context.minBlockSize;
	}

	#prepareMutate(): void {
		if (undefined === this.#source) return;

		this.#_children = this.#source.mapChildren((child) =>
			child.toNodeBuilder(),
		);
		this.#source = undefined;
	}

	get(index: Int.AtLeastZero): T {
		if (undefined !== this.#source) {
			return this.#source._get(index);
		}

		const [childIndex, inChildIndex] = this.#sizeTable.getCoordinates(index);

		return this.#children[childIndex].get(inChildIndex);
	}

	update(index: number, f: (element: T) => T): [previous: T, current: T] {
		this.#prepareMutate();
		const [childIndex, inChildIndex] = this.#sizeTable.getCoordinates(index);

		return this.#children[childIndex].update(inChildIndex, f);
	}

	getChildSize(child: C): number {
		return child.size;
	}

	forEach(f: (element: T) => void): void {
		if (undefined !== this.#source) {
			this.#source.forEach(f);
			return;
		}
		for (const child of this.#children) {
			child.forEach(f);
		}
	}

	insert(index: Int.AtLeastZero, element: T): void {
		this.#prepareMutate();
		let [childIndex, inChildIndex] = this.#sizeTable.getCoordinates(index);

		if (childIndex >= this.nrChildren) {
			// insert at the end of the block: append to the last child
			childIndex = (this.nrChildren - 1) as Int.AtLeastZero;
			inChildIndex = this.#children[childIndex].size as Int.AtLeastZero;
		}

		this.#size++;

		// insert into child
		const child = this.#children[childIndex];

		child.insert(inChildIndex, element);

		if (child.notTooManyChildren) {
			// child is still valid — update size table from childIndex onward
			this.#_sizeTable = this.#sizeTable.addChildSize(childIndex, 1);
			return;
		}

		// child is too large
		const leftChild = this.#children[childIndex - 1];
		if (leftChild?.canAddChild) {
			// shift to leftChild
			const shiftChild = child.dropFirstChild();
			leftChild.appendChild(shiftChild);

			// Two children changed: childIndex-1 gains shiftChildSize,
			// childIndex changes by +1 (inserted) - shiftChildSize (dropped).
			const shiftChildSize = child.getChildSize(shiftChild);
			this.#_sizeTable = this.#sizeTable
				.addChildSize(childIndex - 1, shiftChildSize)
				.addChildSize(childIndex, 1 - shiftChildSize);
			return;
		}

		const rightChild = this.#children[childIndex + 1];
		if (rightChild?.canAddChild) {
			// shift to rightChild
			const shiftChild = child.dropLastChild();
			rightChild.prependChild(shiftChild);

			const shiftChildSize = child.getChildSize(shiftChild);
			this.#_sizeTable = this.#sizeTable
				.addChildSize(childIndex, 1 - shiftChildSize)
				.addChildSize(childIndex + 1, shiftChildSize);
			return;
		}

		// cannot shift, split child
		const newRightChild = child.splitRight();
		this.#children.splice(childIndex + 1, 0, newRightChild as C);

		this.#_sizeTable = this.#sizeTable.recomputeFromChildren(
			this.#children,
			childIndex,
		);
	}

	remove(index: Int.AtLeastZero): T {
		this.#prepareMutate();
		const [childIndex, inChildIndex] = this.#sizeTable.getCoordinates(index);

		this.#size--;

		// remove from child
		const child = this.#children[childIndex];
		const oldValue = child.remove(inChildIndex);

		if (child.canRemoveChild || this.nrChildren <= 1) {
			// no need to normalize
			this.#_sizeTable = this.#sizeTable.addChildSize(childIndex, -1);
			return oldValue;
		}

		const leftChild = this.#children[childIndex - 1];
		if (undefined !== leftChild) {
			if (
				child.nrChildren + leftChild.nrChildren <=
				this.context.maxBlockSize
			) {
				// merge with left: remove child at childIndex, leftChild grows
				leftChild.appendFrom(child);
				this.#children.splice(childIndex, 1);
				this.#_sizeTable = this.#sizeTable.recomputeFromChildren(
					this.#children,
					childIndex - 1,
				);
				return oldValue;
			}
		}

		const rightChild = this.#children[childIndex + 1];
		if (undefined !== rightChild) {
			if (
				child.nrChildren + rightChild.nrChildren <=
				this.context.maxBlockSize
			) {
				// merge with right: remove child at childIndex, rightChild grows
				rightChild.prependFrom(child);
				this.#children.splice(childIndex, 1);

				this.#_sizeTable = this.#sizeTable.recomputeFromChildren(
					this.#children,
					childIndex,
				);
				return oldValue;
			}
		}

		if (child.hasEnoughChildren) {
			// child has enough children, and left and right more than min, so all good
			this.#_sizeTable = this.#sizeTable.addChildSize(childIndex, -1);
			return oldValue;
		}

		// find sibling with most children (most surplus to redistribute)
		const maxChildren =
			undefined === leftChild
				? rightChild
				: undefined === rightChild
					? leftChild
					: leftChild.nrChildren >= rightChild.nrChildren
						? leftChild
						: rightChild;

		if (maxChildren === leftChild) {
			// rebalance with left: childIndex-1 and childIndex both change
			leftChild.appendFrom(child);
			this.#children[childIndex] = leftChild.splitRight(
				(leftChild.nrChildren + 1) >>> 1,
			) as C;
		} else {
			// rebalance with right: childIndex and childIndex+1 both change
			child.appendFrom(rightChild);
			this.#children[childIndex + 1] = child.splitRight(
				child.nrChildren >>> 1,
			) as C;
		}

		this.#_sizeTable = this.#sizeTable.recomputeFromChildren(
			this.#children,
			maxChildren === leftChild ? childIndex - 1 : childIndex,
		);
		return oldValue;
	}

	prependChild(child: C): void {
		this.#prepareMutate();
		this.#size += child.size;
		this.#children.unshift(child);
		this.#_sizeTable = this.#_sizeTable?.prependChildSize(child.size);
	}

	appendChild(child: C): void {
		this.#prepareMutate();
		this.#size += child.size;
		this.#children.push(child);
		this.#_sizeTable = this.#_sizeTable?.appendChildSize(child.size);
	}

	firstChild(): C {
		this.#prepareMutate();
		return this.#children[0];
	}

	lastChild(): C {
		this.#prepareMutate();
		return this.#children.at(-1)!;
	}

	dropFirstChild(): C {
		this.#prepareMutate();
		const child = this.#children.shift()!;
		this.#size -= child.size;
		this.#_sizeTable = this.#_sizeTable?.dropChildren(1);
		return child;
	}

	dropLastChild(): C {
		this.#prepareMutate();
		const child = this.#children.pop()!;
		this.#size -= child.size;
		this.#_sizeTable = this.#_sizeTable?.takeChildren(this.nrChildren);
		return child;
	}

	modifyFirstChild(f: (child: C) => number | undefined): number | undefined {
		this.#prepareMutate();
		const firstChild = this.#children[0];
		const delta = f(firstChild);
		if (undefined !== delta) {
			this.#size += delta;
		}
		this.#_sizeTable = undefined;
		return delta;
	}

	modifyLastChild(f: (child: C) => number | undefined): number | undefined {
		this.#prepareMutate();
		const lastChild = this.#children[this.#children.length - 1];
		const delta = f(lastChild);
		if (undefined !== delta) {
			this.#size += delta;
		}
		this.#_sizeTable = undefined;
		return delta;
	}

	build(): InnerBlock<T, any> {
		if (this.#source) return this.#source;

		return this.context.innerBlock(
			this.#children.map((c) => c.build()),
			this.#size,
			this.level,
			this.#_sizeTable,
		);
	}

	buildMap<T2>(
		f: (element: T) => T2,
		cacheMap = new CacheMap(),
	): InnerBlock<T2, any> {
		if (this.#source) return this.#source.map(f, cacheMap);

		return this.context.innerBlock(
			this.#children.map((c) => c.buildMap(f, cacheMap)),
			this.#size,
			this.level,
			this.#_sizeTable,
		);
	}

	_verifyStructure(
		errors: string[] = [],
		enforceMinChildren = false,
	): string[] {
		if (undefined !== this.#source) {
			return this.#source._verifyStructure(errors, enforceMinChildren);
		}

		if (enforceMinChildren && !this.hasEnoughChildren) {
			errors.push(
				`InnerBlockBuilder of level ${this.level} has fewer children than allowed: ${this.nrChildren} < ${this.context.minBlockSize}`,
			);
		}
		if (!this.notTooManyChildren) {
			errors.push(
				`InnerBlockBuilder of level ${this.level} has more children than allowed: ${this.nrChildren} > ${this.context.maxBlockSize}`,
			);
		}

		let length = 0;
		for (const child of this.#children) {
			length += child.size;
			child._verifyStructure(errors, true);
		}
		if (length !== this.size) {
			errors.push(
				`InnerBlockBuilder of level ${this.level} has size ${this.size} but sum of child lengths is ${length}.`,
			);
		}

		if (undefined !== this.#_sizeTable) {
			const sizeTable = SizeTable.fromChildren(
				this.#children,
				1 << (this.level * this.context.blockSizeBits),
				this.size,
			);

			if (sizeTable.nrChildren !== this.#_sizeTable.nrChildren) {
				errors.push(
					`InnerBlockBuilder of level ${this.level} has inconsistent size table length: expected ${sizeTable.nrChildren} but found ${this.#_sizeTable.nrChildren}.`,
				);
			}

			for (let i = 0; i < sizeTable.nrChildren; i++) {
				if (sizeTable.sizeChildAt(i) !== this.#_sizeTable.sizeChildAt(i)) {
					errors.push(
						`InnerBlockBuilder of level ${this.level} has inconsistent size table entry ${i}: expected ${sizeTable.sizeChildAt(
							i,
						)} but found ${this.#_sizeTable.sizeChildAt(i)}.`,
					);
				}
			}
		}

		return errors;
	}

	normalized(): InnerBuilder<T, C> | undefined {
		if (this.nrChildren === 0) return undefined;

		if (this.nrChildren <= this.context.maxBlockSize) {
			return this;
		}

		const totalSize = this.#size;
		const newRight = this.splitRight();

		return this.context.innerTreeBuilder(
			this.level,
			this,
			newRight,
			undefined,
			totalSize,
		);
	}

	splitRight(index = this.nrChildren >>> 1): InnerBlockBuilder<T, C> {
		this.#prepareMutate();

		const [newThisSizeTable, rightSizeTable] = this.#sizeTable.split(index);
		this.#_sizeTable = newThisSizeTable;
		this.#size = newThisSizeTable.totalSize;

		const rightChildren = this.#children.splice(index);

		return this.context.innerBlockBuilder(
			rightChildren,
			rightSizeTable.totalSize,
			this.level,
			rightSizeTable,
		);
	}

	prependFrom(other: InnerBlockBuilder<T, C>): void {
		this.#prepareMutate();
		other.#prepareMutate();
		this.#size += other.size;

		if (this.nrChildren === 0) {
			this.#_children = other.#children.slice();
			this.#_sizeTable = other.#_sizeTable;
			return;
		}

		const firstChild = this.#children[0];
		const lastIndex = other.nrChildren - 1;

		// Collect children from `other` that will be prepended as-is (all except
		// possibly the last one which may merge into this.children[0]).
		const toPrepend: C[] = [];
		for (let i = 0; i < other.nrChildren; i++) {
			const child = other.#children[i];
			if (
				i === lastIndex &&
				firstChild.nrChildren + child.nrChildren <= this.context.maxBlockSize
			) {
				// merge boundary children instead of prepending
				firstChild.prependFrom(child);
			} else {
				toPrepend.push(child);
			}
		}

		// Single splice to prepend all collected children in O(n) instead of
		// repeated unshift calls which would be O(n²).
		if (toPrepend.length > 0) {
			this.#children.splice(0, 0, ...toPrepend);
		}

		this.#_sizeTable = undefined;
	}

	appendFrom(other: InnerBlockBuilder<T, C>): void {
		this.#prepareMutate();
		other.#prepareMutate();
		this.#size += other.size;

		if (this.nrChildren === 0) {
			this.#_children = other.#children.slice();
			this.#_sizeTable = other.#_sizeTable;
			return;
		}

		// Snapshot other's children before iterating in case other === this.
		const otherChildren =
			other === this ? this.#children.slice() : other.#children;
		const nrOtherChildren = otherChildren.length;

		const lastChild = this.#children.at(-1)!;
		for (let i = 0; i < nrOtherChildren; i++) {
			const child = otherChildren[i];
			if (
				i === 0 &&
				lastChild.nrChildren + child.nrChildren <= this.context.maxBlockSize
			) {
				// can merge with last child
				lastChild.appendFrom(child);
			} else {
				this.#children.push(child);
			}
		}

		this.#_sizeTable = undefined;
	}
}
