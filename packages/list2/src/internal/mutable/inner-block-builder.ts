import type { ListContext } from '#list/context';
import type { InnerBlock } from '#list/immutable/inner-block';
import type { BlockBuilder, InnerBuilder } from '#list/mutable/common';

import { type Int, throwInvalidUsageError } from '@rimbu/base';

import { SizeTable } from '#list/size-table';

export class InnerBlockBuilder<T, C extends BlockBuilder<T>>
	implements InnerBuilder<T, C>, BlockBuilder<T, C>
{
	constructor(
		readonly context: ListContext<T>,
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

	get childrenInMax(): boolean {
		return this.nrChildren <= this.context.maxBlockSize;
	}

	get childrenInMin(): boolean {
		return this.nrChildren >= this.context.minBlockSize;
	}

	#prepareMutate(): void {
		if (undefined === this.#source) return;

		this.#_children = this.#source.mapChildren((child) => child.toBuilder());
		this.#source = undefined;
	}

	get(index: Int.AtLeastZero): T {
		if (undefined !== this.#source) {
			return this.#source._get(index);
		}

		const [childIndex, inChildIndex] = this.#sizeTable.getCoordinates(index);

		return this.#children[childIndex].get(inChildIndex);
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

	insert(index: Int.AtLeastZero, element: T): void {}

	remove(index: Int.AtLeastZero): T {
		return 0 as any;
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
		this.#_sizeTable = this.#_sizeTable?.dropChildren(-1);
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

	buildMap<T2>(f: (value: T) => T2): InnerBlock<T2, any> {
		if (this.#source) return this.#source.map(f);

		return this.context.innerBlock(
			this.#children.map((c) => c.buildMap(f)),
			this.#size,
			this.level,
			this.#_sizeTable,
		);
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

		const rightChildren = this.#children.splice(index);

		this.#_sizeTable =
			this.#_sizeTable?.dropChildren(index) ??
			SizeTable.fromChildren(this.#children, this.context.maxBlockSize);

		const newThisSize = this.#sizeTable.totalSize;
		const rightSize = this.size - newThisSize;
		this.#size = newThisSize;

		return this.context.innerBlockBuilder(rightChildren, rightSize, this.level);
	}

	prependFrom(other: InnerBlockBuilder<T, C>): void {
		this.#prepareMutate();
		other.#prepareMutate();
		this.#size += other.size;

		if (this.nrChildren === 0) {
			this.#_children = other.#children.slice();
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
	}

	appendFrom(other: InnerBlockBuilder<T, C>): void {
		this.#prepareMutate();
		other.#prepareMutate();
		this.#size += other.size;

		if (this.nrChildren === 0) {
			this.#_children = other.#children.slice();
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
	}
}
