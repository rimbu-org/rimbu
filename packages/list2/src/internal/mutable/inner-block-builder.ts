import type { ListContext } from '#list/context';
import type { InnerBlock } from '#list/immutable/inner-block';
import type { BlockBuilder, InnerBuilder } from '#list/mutable/common';

import { throwInvalidUsageError } from '@rimbu/base';

import { computeSizeTable, type SizeTable } from '#list/size-table';

export class InnerBlockBuilder<T, C extends BlockBuilder<T>>
	implements InnerBuilder<T, C>, BlockBuilder<T, C>
{
	constructor(
		readonly context: ListContext<T>,
		readonly level: number,
		source?: InnerBlock<T, any>,
		children?: C[],
		size: number = source?.size ?? 0,
		computedSizeTable = source?.computedSizeTable,
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
		this.#_computedSizeTable = computedSizeTable;
	}

	#source?: InnerBlock<T, any> | undefined;
	#_children?: C[] | undefined;
	#_computedSizeTable?: SizeTable | undefined;
	#size: number;

	get #children(): C[] {
		return this.#_children as C[];
	}

	get size(): number {
		return this.#size;
	}

	get nrChildren(): number {
		return this.#source?.nrChildren ?? this.#children.length;
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

	get #sizeTable(): SizeTable {
		if (undefined === this.#_computedSizeTable) {
			const sizeTable = computeSizeTable(
				this.#children,
				this.size,
				this.context.blockSizeBits,
				this.level,
			);
			this.#_computedSizeTable = sizeTable;
		}

		return this.#_computedSizeTable!;
	}

	#prepareMutate(): void {
		if (undefined === this.#source) return;

		this.#_children = this.#source.mapChildren((child) => child.toBuilder());
		this.#source = undefined;
	}

	get(index: number): T {
		if (undefined !== this.#source) {
			return this.#source.get(index);
		}

		const children = this.#children;
		const n = children.length;
		let offset = 0;

		for (let i = 0; i < n; i++) {
			const child = children[i];
			const childSize = child.size;
			if (index < offset + childSize) {
				return child.get(index - offset);
			}
			offset += childSize;
		}

		return children[n - 1].get(children[n - 1].size - 1);
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

	prependChild(child: C): void {
		this.#prepareMutate();
		this.#size += child.size;
		this.#children.unshift(child);
	}

	appendChild(child: C): void {
		this.#prepareMutate();
		this.#size += child.size;
		this.#children.push(child);
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
		return child;
	}

	dropLastChild(): C {
		this.#prepareMutate();
		const child = this.#children.pop()!;
		this.#size -= child.size;
		return child;
	}

	modifyFirstChild(f: (child: C) => number | undefined): number | undefined {
		this.#prepareMutate();
		const firstChild = this.#children[0];
		const delta = f(firstChild);
		if (undefined !== delta) {
			this.#size += delta;
		}
		return delta;
	}

	modifyLastChild(f: (child: C) => number | undefined): number | undefined {
		this.#prepareMutate();
		const lastChild = this.#children[this.#children.length - 1];
		const delta = f(lastChild);
		if (undefined !== delta) {
			this.#size += delta;
		}
		return delta;
	}

	build(): InnerBlock<T, any> {
		if (this.#source) return this.#source;

		return this.context.innerBlock(
			this.#children.map((c) => c.build()),
			this.#size,
			this.level,
		);
	}

	normalized(): InnerBlockBuilder<T, C> | undefined {
		if (this.nrChildren === 0) return undefined;

		if (this.nrChildren <= this.context.maxBlockSize) {
			return this;
		}

		const totalSize = this.#size;
		const newRight = this.splitRight();
		return this.context.innerTreeBuilderSource(
			this.context.innerTree(
				this.build() as any,
				newRight.build() as any,
				null,
				totalSize,
				this.level,
			) as any,
		) as any;
	}

	splitRight(index = this.nrChildren >>> 1): InnerBlockBuilder<T, C> {
		this.#prepareMutate();
		const rightChildren = this.#children.splice(index);
		let rightSize = 0;
		for (const child of rightChildren) {
			rightSize += child.size;
		}
		this.#size -= rightSize;

		return this.context.innerBlockBuilder(
			rightChildren as C[],
			rightSize,
			this.level,
		);
	}

	prependItems(other: InnerBlockBuilder<T, C>): void {
		this.#prepareMutate();
		other.#prepareMutate();
		this.#size += other.size;

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
				firstChild.prependItems(child);
			} else {
				toPrepend.push(child);
			}
		}

		// Single splice to prepend all collected children in O(n) instead of
		// repeated unshift calls which would be O(n²).
		if (toPrepend.length > 0) {
			this.#children.splice(0, 0, ...toPrepend);
		}

		this.#_computedSizeTable = undefined;
	}

	appendItems(other: InnerBlockBuilder<T, C>): void {
		this.#prepareMutate();
		other.#prepareMutate();
		this.#size += other.size;

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
				lastChild.appendItems(child);
			} else {
				this.#children.push(child);
			}
		}

		this.#_computedSizeTable = undefined;
	}
}
