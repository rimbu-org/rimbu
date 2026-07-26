import type { ListContext } from '#list/context';
import type { InnerBlock } from '#list/immutable/inner-block';
import type { BlockBuilder, InnerBuilder } from '#list/mutable/common';

import { throwInvalidUsageError } from '@rimbu/base';

export class InnerBlockBuilder<T, C extends BlockBuilder<T>>
	implements InnerBuilder<T, C>, BlockBuilder<T, C>
{
	constructor(
		readonly context: ListContext<T>,
		readonly level: number,
		source?: InnerBlock<T, any>,
		children?: C[],
		size: number = source?.size ?? 0,
		sizeTable = source?.computedSizeTable,
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
		// this.#_computedSizeTable = sizeTable;
	}

	#source?: InnerBlock<T, any> | undefined;
	#_children?: C[] | undefined;
	// #_computedSizeTable?: SizeTable | undefined;
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
		throw new Error('Method not implemented.');
	}

	appendItems(other: InnerBlockBuilder<T, C>): void {
		throw new Error('Method not implemented.');
	}
}
