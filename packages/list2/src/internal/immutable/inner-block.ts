import type { TraverseState } from '@rimbu/common';
import type { List } from '@rimbu/list';

import type { ListContext } from '#list/context';
import type { Block, Inner } from '#list/immutable/common';
import type { InnerTree } from '#list/immutable/inner-tree';
import type { InnerBlockBuilder } from '#list/mutable/inner-block-builder';

import { Stream } from '@rimbu/stream';

import {
	computeSizeTable,
	getInnerBlockCoordinates,
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
		this.#computedSizeTable = sizeTable;
	}

	readonly #children: C[];

	// Stores a safe copy of the given size table if provided. Otherwise, stores the computed size table on demand.
	#_computedSizeTable: SizeTable | undefined;

	get #sizeTable(): SizeTable {
		if (undefined === this.#_computedSizeTable) {
			const sizeTable = computeSizeTable(
				this.#children,
				this.size,
				this.context.blockSizeBits,
				this.level,
			);
			this.#computedSizeTable = sizeTable;
		}

		return this.#_computedSizeTable!;
	}

	set #computedSizeTable(sizeTable: SizeTable | undefined) {
		this.#_computedSizeTable = Object.freeze(sizeTable) as
			| SizeTable
			| undefined;
	}

	// Returns a the computed size table if already computed for builders.
	get computedSizeTable(): SizeTable | undefined {
		return this.#_computedSizeTable;
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

	_get(index: number): T {
		const [childIndex, inChildIndex] = getInnerBlockCoordinates({
			index,
			size: this.size,
			nrChildren: this._nrChildren,
			sizeTable: this.#sizeTable,
			blockSizeBits: this.context.blockSizeBits,
			level: this.level,
		});

		return this.#children[childIndex]._get(inChildIndex);
	}

	_prependBlockChild(child: C): InnerBlock<T, C> {
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

	_appendBlockChild(child: C): InnerBlock<T, C> {
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

	concat(other: Inner<T, C>): Inner<T, C> {
		return other.prependBlock(this);
	}

	prependBlock(leftBlock: InnerBlock<T, C>): Inner<T, C> {
		return 0 as any;
	}

	prependTree(leftTree: InnerTree<T, C>): Inner<T, C> {
		return 0 as any;
	}

	toBuilder(): InnerBlockBuilder<T, any> {
		return this.context.innerBlockBuilderSource(this);
	}

	toArray(): T[] {
		return this.#children.flatMap((child) => child.toArray());
	}
}
