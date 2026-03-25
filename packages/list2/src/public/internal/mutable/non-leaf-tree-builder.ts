import type { ListContext } from '#list/context-module';
import type { NonLeafTree } from '#list/immutable/non-leaf-tree';
import type { NonLeaf } from '#list/immutable/utils';
import type { NonLeafBlockBuilder } from '#list/mutable/non-leaf-block-builder';

import {
	type BlockBuilder,
	type NonLeafBuilder,
	TreeBuilderBase,
} from '#list/mutable/builder-base';

export class NonLeafTreeBuilder<T>
	extends TreeBuilderBase<T, BlockBuilder<T>>
	implements NonLeafBuilder<T>
{
	constructor(
		context: ListContext,
		readonly level: number,
		public source?: NonLeafTree<T>,
		public _left?: NonLeafBlockBuilder<T>,
		public _right?: NonLeafBlockBuilder<T>,
		public _middle?: NonLeafBuilder<T, NonLeafBlockBuilder<T>>,
		public itemsLength: number = source?.itemsLength ?? 0,
	) {
		super(context);
	}

	get left(): NonLeafBlockBuilder<T> {
		return this._left!;
	}

	get right(): NonLeafBlockBuilder<T> {
		return this._right!;
	}

	get middle(): NonLeafBuilder<T> | undefined {
		return this._middle;
	}

	prepareMutate(): void {
		if (undefined === this.source) return;

		this._left = this.context.nonLeafBlockBuilderSource(this.source.left);
		this._right = this.context.nonLeafBlockBuilderSource(this.source.right);
		this._middle =
			null === this.source.middle
				? undefined
				: this.context.createNonLeafBuilder(this.source.middle);
		this.itemsLength = this.source.itemsLength;
		this.source = undefined;
	}

	get(index: number): T {
		if (undefined !== this.source) {
			return this.source.get(index);
		}

		return super.get(index);
	}

	prependChild(child: BlockBuilder<T>): void {
		this.prepareMutate();
		this.itemsLength += child.itemsLength;

		this.left.prependChild(child);
	}

	appendChild(child: BlockBuilder<T>): void {
		this.prepareMutate();
		this.itemsLength += child.itemsLength;

		this.right.appendChild(child);
	}

	firstChild(): BlockBuilder<T> {
		return this.left.firstChild();
	}

	lastChild(): BlockBuilder<T> {
		return this.right.lastChild();
	}

	dropFirstChild(): BlockBuilder<T> {
		this.prepareMutate();
		const firstChild = this.left.dropFirstChild();
		this.itemsLength -= firstChild.itemsLength;

		return firstChild;
	}

	modifyFirstChild(
		f: (child: BlockBuilder<T>) => number | undefined,
	): number | undefined {
		return this.left.modifyFirstChild(f);
	}

	modifyLastChild(
		f: (child: BlockBuilder<T>) => number | undefined,
	): number | undefined {
		return this.right.modifyLastChild(f);
	}

	build(): NonLeaf<T> {
		throw new Error('Method not implemented.');
	}

	normalized(): NonLeafBuilder<T> | undefined {
		throw new Error('Method not implemented.');
	}

	getChildLength(child: BlockBuilder<T>): number {
		return child.itemsLength;
	}

	prependBlockChild(
		block: NonLeafBlockBuilder<T>,
		child: BlockBuilder<T>,
	): void {
		block.prependChild(child);
	}

	appendBlockChild(
		block: NonLeafBlockBuilder<T>,
		child: BlockBuilder<T>,
	): void {
		block.appendChild(child);
	}

	dropBlockFirstChild(block: NonLeafBlockBuilder<T>): BlockBuilder<T> {
		return block.dropFirstChild();
	}

	dropBlockLastChild(block: NonLeafBlockBuilder<T>): BlockBuilder<T> {
		return block.dropLastChild();
	}
}
