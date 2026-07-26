import type { ListContext } from '#list/context';
import type { Block, Inner } from '#list/immutable/common';
import type { InnerBlockBuilder } from '#list/mutable/inner-block-builder';

import { Stream } from '@rimbu/stream';

import {
	computeSizeTable,
	safeCopySizeTable,
	type SizeTable,
} from '#list/size-table';

export class InnerBlock<T, C extends Block<T>>
	implements Inner<T, C>, Block<T, C>
{
	constructor(
		readonly context: ListContext<T, true>,
		children: C[],
		readonly size: number,
		readonly level: number,
		sizeTable?: SizeTable | undefined,
	) {
		this.#children = Object.freeze(children) as C[];
		this.#_computedSizeTable = safeCopySizeTable(sizeTable);
	}

	declare _self: InnerBlock<T, C>;

	#children: C[];

	#_computedSizeTable: SizeTable | undefined;

	get #sizeTable(): SizeTable {
		if (undefined === this.#_computedSizeTable) {
			this.#_computedSizeTable = computeSizeTable(
				this.#children,
				this.size,
				this.context.blockSizeBits,
				this.level,
			);
		}

		return this.#_computedSizeTable;
	}

	// Returns a safe copy of the computed size table if computed for builders.
	get computedSizeTable(): SizeTable | undefined {
		return this.#_computedSizeTable;
	}

	get nrChildren() {
		return this.#children.length;
	}

	get canAddChild(): boolean {
		return this.nrChildren < this.context.maxBlockSize;
	}

	get canRemoveChild(): boolean {
		return this.nrChildren > this.context.minBlockSize;
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

	#copyAsType<T2, C2 extends Block<T2>>(
		children: C2[],
		size = this.size,
		sizeTable = this.#_computedSizeTable,
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

	get(index: number): T {
		const [childIndex, inChildIndex] = this.#getCoordinates(
			index,
			false,
			false,
		);

		return this.#children[childIndex].get(inChildIndex);
	}

	prependBlockChild(child: C): InnerBlock<T, C> {
		const newSize = this.size + child.size;

		const newChildren = this.#children.slice();
		newChildren.unshift(child);

		let newSizeTable = this.#_computedSizeTable;
		if (undefined !== newSizeTable && 'regular' !== newSizeTable) {
			newSizeTable = newSizeTable.slice();
			newSizeTable.unshift(child.size);
		}

		return this.#copy(newChildren, newSize, newSizeTable);
	}

	appendBlockChild(child: C): InnerBlock<T, C> {
		const newSize = this.size + child.size;

		const newChildren = this.#children.slice();
		newChildren.push(child);

		let newSizeTable = this.#_computedSizeTable;
		if (undefined !== newSizeTable && 'regular' !== newSizeTable) {
			newSizeTable = newSizeTable.slice();
			newSizeTable.push(newSize);
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
			this.#_computedSizeTable,
		);
	}

	mapChildren<C2>(f: (child: C) => C2): C2[] {
		return this.#children.map(f);
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
		return this.prependBlockChild(child);
	}

	appendChild(child: C): InnerBlock<T, C> {
		return this.appendBlockChild(child);
	}

	dropFirstChild(): [InnerBlock<T, C> | null, C] {
		const firstChild = this.#children[0];

		if (this.nrChildren === 1) return [null, firstChild];

		const newChildren = this.#children.slice(1);
		const newSize = this.size - firstChild.size;
		const newSelf = this.#copy(newChildren, newSize);
		return [newSelf, firstChild];
	}

	dropLastChild(): [InnerBlock<T, C> | null, C] {
		const lastChild = this.#children[this.#children.length - 1];

		if (this.nrChildren === 1) return [null, lastChild];

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

	toBuilder(): InnerBlockBuilder<T, any> {
		return this.context.innerBlockBuilderSource(this);
	}

	toArray(): T[] {
		return this.#children.flatMap((child) => child.toArray());
	}

	#getCoordinates(
		index: number,
		forTake: boolean,
		noEmptyLast: boolean,
	): [number, number] {
		const offset = forTake ? 1 : 0;
		const indexWithOffset = index - offset;

		const nrChildren = this.nrChildren;
		const size = this.size;
		const children = this.#children;

		if (indexWithOffset >= size) {
			// return the end
			if (noEmptyLast) {
				return [nrChildren - 1, children.at(-1)!.size - 1];
			}

			return [nrChildren, 0];
		}

		// Fast path: regular block — all children have the same full subtree size.
		if (this.#sizeTable === 'regular') {
			const levelBits = this.context.blockSizeBits * this.level;
			const blockSize = 1 << levelBits;
			const childIndex = indexWithOffset >>> levelBits;
			const inChildIndex = (indexWithOffset & (blockSize - 1)) + offset;
			return [childIndex, inChildIndex];
		}

		// Irregular block — binary search on cumulative size table.
		const sizeTable = this.#sizeTable;
		let lo = 0;
		let hi = nrChildren - 1;

		while (lo < hi) {
			const mid = (lo + hi) >>> 1;
			if (sizeTable[mid] <= indexWithOffset) {
				lo = mid + 1;
			} else {
				hi = mid;
			}
		}

		const childIndex = lo;
		const prevSize = childIndex > 0 ? sizeTable[childIndex - 1] : 0;
		const inChildIndex = indexWithOffset - prevSize + offset;
		return [childIndex, inChildIndex];
	}
}
