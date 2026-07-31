import type { TraverseState } from '@rimbu/common';
import type { List, OpWithResult } from '@rimbu/list';

import type { ListContext } from '#list/context';
import type { Block, Inner, Self } from '#list/immutable/common';
import type { InnerTree } from '#list/immutable/inner-tree';
import type { InnerBlockBuilder } from '#list/mutable/inner-block-builder';

import { type Int, throwInvalidStateError } from '@rimbu/base';
import { Stream } from '@rimbu/stream';

import { SizeTable } from '#list/size-table';

export class InnerBlock<T, C extends Self<Block<T>, C>>
	implements Inner<T, C>, Block<T>
{
	declare _self: InnerBlock<T, C>;

	constructor(
		readonly context: ListContext<T, true>,
		children: C[],
		readonly size: number,
		readonly level: number,
		sizeTable?: SizeTable | undefined,
	) {
		this.#children = Object.freeze(children) as C[];
		this.#_sizeTable = sizeTable;
	}

	readonly #children: C[];

	#_sizeTable: SizeTable | undefined;

	get sizeTable(): SizeTable {
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

	get cachedSizeTable(): SizeTable | undefined {
		return this.#_sizeTable;
	}

	get _nrChildren() {
		return this.#children.length;
	}

	get _canAddChild(): boolean {
		return this._nrChildren < this.context.maxBlockSize;
	}

	get _canRemoveChild(): boolean {
		return this._nrChildren > this.context.minBlockSize;
	}

	get _childrenInMin(): boolean {
		return this._nrChildren <= this.context.minBlockSize;
	}

	get _childrenInMax(): boolean {
		return this._nrChildren >= this.context.maxBlockSize;
	}

	#copy(
		children = this.#children,
		size = this.size,
		sizeTable?: SizeTable,
	): InnerBlock<T, C> {
		if (children === this.#children) {
			return this;
		}

		// Pass undefined for sizes so the constructor recomputes it.
		return this.context.innerBlock(children, size, this.level, sizeTable);
	}

	#copyAsType<T2, C2 extends Self<Block<T2>, C2>>(
		children: C2[],
		size = this.size,
		sizeTable?: SizeTable,
	) {
		return this.context.innerBlock<T2, C2>(
			children,
			size,
			this.level,
			sizeTable,
		);
	}

	stream(options: { reversed?: boolean } = {}): Stream.NonEmpty<T> {
		return Stream.fromArray(this.#children, options)
			.assumeNonEmpty()
			.flatMap((child) => child.stream(options));
	}

	_get(index: Int.AtLeastZero): T {
		const [childIndex, inChildIndex] = this.sizeTable.getCoordinates(index);

		return this.#children[childIndex]._get(inChildIndex);
	}

	_update(
		index: Int.AtLeastZero,
		f: (element: T) => T,
	): OpWithResult<InnerBlock<T, C>, [previous: T, current: T], true> {
		const [childIndex, inChildIndex] = this.sizeTable.getCoordinates(index);
		const [newChildren, hasResult, result, hasChanged] = this.#children[
			childIndex
		]._update(inChildIndex, f);

		const newBlock = hasChanged
			? this.#copy(this.#children.with(childIndex, newChildren))
			: this;

		return [newBlock, hasResult, result, hasChanged];
	}

	_prependBlockChild(child: C): InnerBlock<T, C> {
		const newSize = this.size + child.size;

		const newChildren = this.#children.slice();
		newChildren.unshift(child);

		let newSizeTable = this.#_sizeTable;

		if (undefined !== newSizeTable) {
			newSizeTable = newSizeTable.prependChildSize(child.size);
		}

		return this.#copy(newChildren, newSize, newSizeTable);
	}

	_appendBlockChild(child: C): InnerBlock<T, C> {
		const newSize = this.size + child.size;

		const newChildren = this.#children.slice();
		newChildren.push(child);

		let newSizeTable = this.#_sizeTable;

		if (undefined !== newSizeTable) {
			newSizeTable = newSizeTable.appendChildSize(child.size);
		}

		return this.#copy(newChildren, newSize, newSizeTable);
	}

	forEach(f: (element: T) => void): void {
		for (const child of this.#children) {
			child.forEach(f);
		}
	}

	map<T2>(f: (element: T) => T2): InnerBlock<T2, any> {
		return this.#copyAsType(
			this.#children.map((child) => child.map(f)),
			this.size,
			this.#_sizeTable,
		);
	}

	mapChildren<C2>(f: (child: C) => C2): C2[] {
		return this.#children.map(f);
	}

	filter(f: (element: T) => boolean): List<T> {
		let result: List<T> = this.context.empty<T>();

		for (const child of this.#children) {
			const filteredChild = child.filter(f);
			result = result.concat(filteredChild);
		}

		return result;
	}

	filterIndexed(
		f: (element: T, index: number, halt: () => void) => boolean,
		options: {
			reversed?: boolean | undefined;
			negate?: boolean | undefined;
			state: TraverseState;
		},
	): List<T> {
		const { reversed = false, state } = options;

		let result: List<T> = this.context.empty<T>();

		if (state?.halted) return result;

		if (reversed) {
			for (let i = this.#children.length - 1; i >= 0; i--) {
				const child = this.#children[i];
				const filteredChild = child.filterIndexed(f, options);
				result = result.concat(filteredChild);

				if (state?.halted) break;
			}
		} else {
			for (const child of this.#children) {
				const filteredChild = child.filterIndexed(f, options);
				result = result.concat(filteredChild);

				if (state?.halted) break;
			}
		}

		return result;
	}

	childAt(index: number): C {
		return this.#children.at(index) as C;
	}

	withChild(index: number, child: C): InnerBlock<T, C> {
		const oldChild = this.childAt(index);
		const newChildren = this.#children.with(index, child);
		return this.#copy(newChildren, this.size - oldChild.size + child.size);
	}

	prependChild(child: C): InnerBlock<T, C> {
		return this._prependBlockChild(child);
	}

	appendChild(child: C): InnerBlock<T, C> {
		return this._appendBlockChild(child);
	}

	dropFirstChild(): [InnerBlock<T, C> | null, C] {
		const firstChild = this.#children[0];

		if (this._nrChildren === 1) return [null, firstChild];

		const newChildren = this.#children.slice(1);
		const newSize = this.size - firstChild.size;
		const newSelf = this.#copy(newChildren, newSize);
		return [newSelf, firstChild];
	}

	dropLastChild(): [InnerBlock<T, C> | null, C] {
		const lastChild = this.#children[this.#children.length - 1];

		if (this._nrChildren === 1) return [null, lastChild];

		const newChildren = this.#children.slice(0, -1);
		const newSize = this.size - lastChild.size;
		const newSelf = this.#copy(newChildren, newSize);
		return [newSelf, lastChild];
	}

	modifyFirstChild(f: (child: C) => C): InnerBlock<T, C> {
		const firstChild = this.#children[0];
		const newFirstChild = f(firstChild);
		if (newFirstChild === firstChild) {
			return this;
		}
		const newChildren = [newFirstChild].concat(this.#children.slice(1));
		const newSize = this.size - firstChild.size + newFirstChild.size;

		return this.#copy(newChildren, newSize);
	}

	modifyLastChild(f: (child: C) => C): InnerBlock<T, C> {
		const lastChild = this.#children.at(-1)!;
		const newLastChild = f(lastChild);
		if (newLastChild === lastChild) {
			return this;
		}
		const newChildren = this.#children.slice(0, -1).concat(newLastChild);
		const newLength = this.size - lastChild.size + newLastChild.size;

		return this.#copy(newChildren, newLength);
	}

	concatChildren(...other: InnerBlock<T, C>[]): C[] {
		return this.#children.concat(...other.map((o) => o.#children));
	}

	concat(other: Inner<T, C>): Inner<T, C> {
		return other.prependBlock(this);
	}

	takeInternal(
		amount: Int.AtLeastZero,
	): [
		newInner: InnerBlock<T, C> | null,
		lastChild: C,
		lastChildCount: Int.AtLeastZero,
	] {
		const [childIndex, inChildIndex] = this.sizeTable.getCoordinates(amount, {
			forTake: true,
		});

		if (childIndex >= this._nrChildren) {
			throwInvalidStateError();
		}

		const lastChild = this.#children[childIndex];
		const newSelf = this.takeChildren(childIndex);

		return [newSelf, lastChild, inChildIndex];
	}

	dropInternal(
		amount: Int.AtLeastZero,
	): [
		newInner: InnerBlock<T, C> | null,
		lastChild: C,
		lastChildCount: Int.AtLeastZero,
	] {
		const [childIndex, inChildIndex] = this.sizeTable.getCoordinates(amount, {
			forTake: true,
			noEmptyLast: false,
		});

		if (childIndex >= this._nrChildren) {
			throwInvalidStateError();
		}

		const lastChild = this.#children[childIndex];
		const newSelf = this.takeChildren(childIndex);

		return [newSelf, lastChild, inChildIndex];
	}

	takeChildren(childAmount: number): InnerBlock<T, C> | null {
		if (childAmount <= 0) return null;
		if (childAmount >= this._nrChildren) return this;

		const newChildren = this.#children.toSpliced(
			childAmount,
			this.context.maxBlockSize,
		);

		const newSizeTable =
			this.#_sizeTable?.dropChildren(childAmount) ??
			// need to compute anyway to get new total size
			SizeTable.fromChildren(
				newChildren,
				1 << (this.level * this.context.blockSizeBits),
			);

		return this.#copy(newChildren, newSizeTable.totalSize, newSizeTable);
	}

	dropChildren(childAmount: number): InnerBlock<T, C> | null {
		if (childAmount <= 0) return null;
		if (childAmount >= this._nrChildren) return this;

		const newChildren = this.#children.slice(childAmount);

		const newSizeTable =
			this.#_sizeTable?.dropChildren(childAmount) ??
			// need to compute anyway to get new total size
			SizeTable.fromChildren(newChildren, this.context.maxBlockSize);

		return this.#copy(newChildren, newSizeTable.totalSize, newSizeTable);
	}

	prependBlock(leftBlock: InnerBlock<T, C>): Inner<T, C> {
		const newSize = leftBlock.size + this.size;

		const totalNrChildren = leftBlock._nrChildren + this._nrChildren;

		if (totalNrChildren <= this.context.maxBlockSize) {
			const newChildren = leftBlock.#children.concat(this.#children);

			return this.context.innerBlock(newChildren, newSize, this.level);
		}

		return this.context.innerTree(leftBlock, this, null, newSize, this.level);
	}

	prependTree(leftTree: InnerTree<T, C>): Inner<T, C> {
		const newSize = leftTree.size + this.size;

		const jointNrChildren = leftTree.right._nrChildren + this._nrChildren;
		// Case 1: Joint is small enough to merge into a single block
		if (jointNrChildren <= this.context.maxBlockSize) {
			const newLeftRightChildren = leftTree.right.concat(this) as InnerBlock<
				T,
				C
			>;
			return this.context.innerTree(
				leftTree.left,
				newLeftRightChildren,
				leftTree.middle,
				newSize,
				this.level,
			);
		}

		// Case 2: Joint is too large to merge into a single block, but can be merged into the middle of the tree
		if (leftTree.right._childrenInMin) {
			const newLeftMiddle =
				leftTree.middle?.appendChild(leftTree.right) ??
				this.context.innerBlock(
					[leftTree.right],
					leftTree.right.size,
					this.level + 1,
				);

			return this.context.innerTree(
				leftTree.left,
				this,
				newLeftMiddle,
				newSize,
				this.level + 1,
			);
		}

		// Case 3: Need to join and split the joint into a new block, and add it to the middle of the tree
		const toMiddleChildren = leftTree.right.#children.concat(this.#children);
		const newRightChildren = toMiddleChildren.splice(this.context.maxBlockSize);

		const maxChildSize = 1 << (this.level * this.context.blockSizeBits);
		const newRightSizeTable = SizeTable.fromChildren(
			newRightChildren,
			maxChildSize,
		);
		const newRightSize = newRightSizeTable.totalSize;

		const toMiddle = this.context.innerBlock<T, C>(
			toMiddleChildren,
			newSize - newRightSize,
			this.level,
		);
		const newRight = this.context.innerBlock<T, C>(
			newRightChildren,
			newRightSize,
			this.level,
			newRightSizeTable,
		);

		const newMiddle =
			leftTree.middle?.appendChild(toMiddle) ??
			this.context.innerBlock([toMiddle], toMiddle.size, this.level + 1);

		return this.context.innerTree(
			leftTree.left,
			newRight,
			newMiddle,
			newSize,
			this.level,
		);
	}

	reversed(): InnerBlock<T, C> {
		return this.#copy(
			this.#children.map((child) => child.reversed()),
			this.size,
		);
	}

	toBuilder(): InnerBlockBuilder<T, any> {
		return this.context.innerBlockBuilderSource(this);
	}

	toArray(): T[] {
		return this.#children.flatMap((child) => child.toArray());
	}
}
