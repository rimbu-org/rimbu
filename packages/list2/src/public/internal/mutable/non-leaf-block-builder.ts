import type { ListContext } from '#list/context-module';
import type { NonLeafBlock } from '#list/immutable/non-leaf-block';
import type { NonLeaf } from '#list/immutable/utils';

import {
	type BlockBuilder,
	BuilderBase,
	type NonLeafBuilder,
} from '#list/mutable/builder-base';

export class NonLeafBlockBuilder<T>
	extends BuilderBase
	implements NonLeafBuilder<T>, BlockBuilder<T>
{
	constructor(
		context: ListContext,
		readonly level: number,
		public source?: NonLeafBlock<T>,
		public _children?: Array<BlockBuilder<T>>,
		public itemsLength: number = source?.itemsLength ?? 0,
	) {
		super(context);
	}

	get children(): Array<BlockBuilder<T>> {
		return this._children!;
	}

	get nrChildren(): number {
		return this.children.length;
	}

	get canAddChild(): boolean {
		return this.nrChildren < this.context.maxBlockSize;
	}

	prepareMutate(): void {
		if (undefined === this.source) return;

		this._children = this.source.children.map((c) => c.createBlockBuilder());
		this.source = undefined;
	}

	get(index: number): T {
		throw new Error('Method not implemented.');
	}

	prependChild(child: BlockBuilder<T>): void {
		this.itemsLength += child.itemsLength;

		this.children.unshift(child);
	}

	appendChild(child: BlockBuilder<T>): void {
		this.itemsLength += child.itemsLength;

		this.children.push(child);
	}

	firstChild(): BlockBuilder<T> {
		return this.children[0];
	}

	lastChild(): BlockBuilder<T> {
		return this.children.at(-1)!;
	}

	dropFirstChild(): BlockBuilder<T> {
		const child = this.children.shift()!;
		this.itemsLength -= child.itemsLength;

		return child;
	}

	dropLastChild(): BlockBuilder<T> {
		const child = this.children.pop()!;
		this.itemsLength -= child.itemsLength;

		return child;
	}

	modifyFirstChild(
		f: (child: BlockBuilder<T>) => number | undefined,
	): number | undefined {
		const delta = f(this.firstChild());
		if (undefined !== delta) {
			this.itemsLength += delta;
		}

		return delta;
	}

	modifyLastChild(
		f: (child: BlockBuilder<T>) => number | undefined,
	): number | undefined {
		const delta = f(this.lastChild());
		if (undefined !== delta) {
			this.itemsLength += delta;
		}

		return delta;
	}

	build(): NonLeaf<T> {
		throw new Error('Method not implemented.');
	}

	splitRight(index = this.nrChildren >>> 1): NonLeafBlockBuilder<T> {
		const rightChildren = this.children.splice(index);
		const oldLength = this.itemsLength;
		this.itemsLength = 0;
		for (let i = 0; i < this.nrChildren; i++) {
			this.itemsLength += this.children[i].itemsLength;
		}
		const rightLength = oldLength - this.itemsLength;

		return this.context.nonLeafBlockBuilder(
			this.level,
			rightChildren,
			rightLength,
		);
	}

	normalized(): NonLeafBuilder<T> | undefined {
		if (this.nrChildren === 0) {
			// empty
			return undefined;
		}

		const context = this.context;

		const maxBlockSize = context.maxBlockSize;

		if (this.nrChildren > maxBlockSize) {
			// too many children, needs to split
			const middleLength = this.itemsLength;

			const result = context.nonLeafTreeBuilder(
				this.level,
				this,
				this.splitRight(),
				undefined,
				middleLength,
			);

			return result;
		}

		// already normalized
		return this;
	}

	prependItems(other: BlockBuilder<T>): void {
		this.prepareMutate();
		this.itemsLength += other.itemsLength;
		this.children.unshift(other);
	}

	appendItems(other: BlockBuilder<T>): void {
		this.prepareMutate();
		this.itemsLength += other.itemsLength;
		this.children.push(other);
	}
}
