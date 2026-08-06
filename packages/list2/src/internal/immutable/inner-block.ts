import type { Op } from '@rimbu/collection-types/types';
import type { List } from '@rimbu/list';

import type { ListContext } from '#list/context';
import type { Block, Inner, Self } from '#list/immutable/common';
import type { InnerTree } from '#list/immutable/inner-tree';
import type { InnerBlockBuilder } from '#list/mutable/inner-block-builder';

import { type Int, throwInvalidStateError } from '@rimbu/base';
import { Stream } from '@rimbu/stream';

import { CacheMap } from '#list/immutable/cache-map';
import { SizeTable } from '#list/size-table';

export class InnerBlock<T, C extends Self<Block<T>, C>>
	implements Inner<T, C>, Block<T>
{
	declare _self: InnerBlock<T, C>;

	constructor(
		readonly context: ListContext<T>,
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

	get _hasEnoughChildren(): boolean {
		return this._nrChildren >= this.context.minBlockSize;
	}

	get _notTooManyChildren(): boolean {
		return this._nrChildren <= this.context.maxBlockSize;
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

	_streamSlice(
		start: number,
		end: number,
		options: { reversed?: boolean | undefined } = {},
	): Stream<T> {
		const [startChildIndex, inStartChildIndex] =
			this.sizeTable.getCoordinates(start);
		const [endChildIndex, inEndChildIndex] = this.sizeTable.getCoordinates(end);

		if (startChildIndex === endChildIndex) {
			const child = this.#children[startChildIndex];

			return child._streamSlice(inStartChildIndex, inEndChildIndex, options);
		}

		const { reversed = false } = options;

		const startChild = this.#children[startChildIndex];
		const endChild = this.#children[endChildIndex];
		const childStream = Stream.fromArray(this.#children, {
			range: { start: startChildIndex, end: endChildIndex },
			reversed,
		});

		return childStream.flatMap((child: Block<T>): Stream<T> => {
			if (child === startChild)
				return child._streamSlice(
					inStartChildIndex,
					startChild.size - 1,
					options,
				);
			if (child === endChild)
				return child._streamSlice(0, inEndChildIndex, options);
			return child.stream(options);
		});
	}

	_get(index: Int.AtLeastZero): T {
		const [childIndex, inChildIndex] = this.sizeTable.getCoordinates(index);

		return this.#children[childIndex]._get(inChildIndex);
	}

	_update(
		index: Int.AtLeastZero,
		f: (element: T) => T,
	): Op.WithResult<InnerBlock<T, C>, [previous: T, current: T], true> {
		const [childIndex, inChildIndex] = this.sizeTable.getCoordinates(index);
		const outcome = this.#children[childIndex]._update(inChildIndex, f);

		const collection = outcome.hasChanged
			? this.#copy(this.#children.with(childIndex, outcome.collection))
			: this;

		return { ...outcome, collection };
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

	map<T2>(
		f: (element: T) => T2,
		cacheMap = new CacheMap(),
	): InnerBlock<T2, any> {
		return (
			cacheMap.get(this) ??
			cacheMap.setAndReturn(
				this,
				this.#copyAsType(
					this.#children.map((child) => child.map(f, cacheMap)),
					this.size,
					this.#_sizeTable,
				),
			)
		);
	}

	mapChildren<C2>(f: (child: C) => C2): C2[] {
		return this.#children.map(f);
	}

	filter(
		f: (element: T) => boolean,
		options?: { negate?: boolean | undefined },
		cacheMap = new CacheMap(),
	): List<T> {
		const cached = cacheMap.get<List<T>>(this);
		if (cached) return cached;

		let result: List<T> = this.context.empty<T>();

		for (const child of this.#children) {
			const filteredChild = child.filter(f, options, cacheMap);
			result = result.concat(filteredChild);
		}

		return cacheMap.setAndReturn(this, result);
	}

	childAt(index: number): C {
		return this.#children.at(index) as C;
	}

	withChild(index: number, child: C): InnerBlock<T, C> {
		const oldChild = this.childAt(index);
		const newChildren = this.#children.with(index, child);
		return this.#copy(newChildren, this.size - oldChild.size + child.size);
	}

	prependChild(child: C): Inner<T, C> {
		if (this._canAddChild) {
			return this._prependBlockChild(child);
		}

		const newSize = this.size + child.size;

		return this.context.innerTree(
			this.context.innerBlock([child], child.size, this.level),
			this,
			null,
			newSize,
			this.level,
		);
	}

	appendChild(child: C): Inner<T, C> {
		if (this._canAddChild) {
			return this._appendBlockChild(child);
		}

		const newSize = this.size + child.size;

		return this.context.innerTree(
			this,
			this.context.innerBlock([child], child.size, this.level),
			null,
			newSize,
			this.level,
		);
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
		const lastChild = this.#children.at(-1)!;

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
		amount: Int.AtLeastOne,
	): [
		newInner: InnerBlock<T, C> | null,
		lastChild: C,
		indexInLastChild: Int.AtLeastZero,
	] {
		const [childIndex, inChildIndex] =
			this.sizeTable.getCoordinatesForTake(amount);

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
		firstChild: C,
		indexInFirstChild: Int.AtLeastZero,
	] {
		const [childIndex, indexInFirstChild] =
			this.sizeTable.getCoordinates(amount);

		if (childIndex >= this._nrChildren) {
			throwInvalidStateError();
		}

		const firstChild = this.#children[childIndex];
		const newSelf = this.dropChildren(childIndex + 1);

		return [newSelf, firstChild, indexInFirstChild];
	}

	takeChildren(childAmount: number): InnerBlock<T, C> | null {
		if (childAmount <= 0) return null;
		if (childAmount >= this._nrChildren) return this;

		const newChildren = this.#children.toSpliced(
			childAmount,
			this.context.maxBlockSize,
		);

		const newSizeTable =
			this.#_sizeTable?.takeChildren(childAmount) ??
			// need to compute anyway to get new total size
			SizeTable.fromChildren(
				newChildren,
				1 << (this.level * this.context.blockSizeBits),
			);

		return this.#copy(newChildren, newSizeTable.totalSize, newSizeTable);
	}

	dropChildren(childAmount: number): InnerBlock<T, C> | null {
		if (childAmount <= 0) return this;
		if (childAmount >= this._nrChildren) return null;

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
		if (leftTree.right._hasEnoughChildren) {
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
		const newChildren = new Array(this._nrChildren);
		let newChildrenIndex = newChildren.length - 1;

		for (const child of this.#children) {
			newChildren[newChildrenIndex--] = child.reversed();
		}

		return this.#copy(newChildren, this.size);
	}

	toNodeBuilder(): InnerBlockBuilder<T, any> {
		return this.context.innerBlockBuilderSource(this);
	}

	toArray(): T[] {
		return this.#children.flatMap((child) => child.toArray());
	}

	_verifyStructure(
		messages: string[] = [],
		enforceMinChildren = false,
	): string[] {
		if (enforceMinChildren && !this._hasEnoughChildren) {
			messages.push(
				`InnerBlock of level ${this.level} has fewer children than allowed: ${this._nrChildren} < ${this.context.minBlockSize}`,
			);
		}
		if (!this._notTooManyChildren) {
			messages.push(
				`InnerBlock of level ${this.level} has more children than allowed: ${this._nrChildren} > ${this.context.maxBlockSize}`,
			);
		}

		let length = 0;
		for (const child of this.#children) {
			length += child.size;
			child._verifyStructure(messages, true);
		}
		if (length !== this.size) {
			messages.push(
				`InnerBlock of level ${this.level} has size ${this.size} but sum of child lengths is ${length}.`,
			);
		}

		const sizeTable = SizeTable.fromChildren(
			this.#children,
			1 << (this.level * this.context.blockSizeBits),
			this.size,
		);

		// Verify size table consistency.
		if (undefined !== this.#_sizeTable) {
			if (sizeTable.nrChildren !== this.#_sizeTable.nrChildren) {
				messages.push(
					`InnerBlock of level ${this.level} has inconsistent size table length: expected ${sizeTable.nrChildren} but found ${this.#_sizeTable.nrChildren}.`,
				);
			}

			for (let i = 0; i < sizeTable.nrChildren; i++) {
				if (sizeTable.sizeChildAt(i) !== this.#_sizeTable.sizeChildAt(i)) {
					messages.push(
						`InnerBlock of level ${this.level} has inconsistent size table entry ${i}: expected ${sizeTable.sizeChildAt(
							i,
						)} but found ${this.#_sizeTable.sizeChildAt(i)}.`,
					);
				}
			}
		} else {
			if (sizeTable.totalSize !== this.size) {
				messages.push(
					`InnerBlock of level ${this.level} has inconsistent size table total size: expected ${sizeTable.totalSize} but found ${this.size}.`,
				);
			}
		}

		return messages;
	}
}
