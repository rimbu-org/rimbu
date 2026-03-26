import type { ListContext } from '#list/context-module';
import type { InnerTree } from '#list/immutable/inner-tree';
import type { InnerBlockBuilder } from '#list/mutable/inner-block-builder';

import {
	type BlockBuilder,
	type InnerBuilder,
	TreeBuilderBase,
} from '#list/mutable/builder-base';

export class InnerTreeBuilder<T>
	extends TreeBuilderBase<T, BlockBuilder<T>>
	implements InnerBuilder<T>
{
	constructor(
		context: ListContext,
		readonly level: number,
		public source?: InnerTree<T>,
		public _left?: InnerBlockBuilder<T>,
		public _right?: InnerBlockBuilder<T>,
		public _middle?: InnerBuilder<T, InnerBlockBuilder<T>>,
		public itemsLength: number = source?.itemsLength ?? 0,
	) {
		super(context);
	}

	get left(): InnerBlockBuilder<T> {
		return this._left!;
	}

	get right(): InnerBlockBuilder<T> {
		return this._right!;
	}

	get middle(): InnerBuilder<T> | undefined {
		return this._middle;
	}

	prepareMutate(): void {
		if (undefined === this.source) return;

		this._left = this.context.innerBlockBuilderSource(this.source.left);
		this._right = this.context.innerBlockBuilderSource(this.source.right);
		this._middle =
			null === this.source.middle
				? undefined
				: this.context.createInnerBuilder(this.source.middle);
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

	build(): InnerTree<T> {
		return (
			this.source ??
			this.context.innerTree(
				this.left.build(),
				this.right.build(),
				this.middle?.build() ?? null,
				this.itemsLength,
				this.level,
			)
		);
	}

	normalized(): InnerBuilder<T> | undefined {
		if (undefined !== this.middle) {
			// middle, nothing to normalize
			return this;
		}

		// no middle

		if (
			this.left.nrChildren + this.right.nrChildren <=
			this.context.maxBlockSize
		) {
			// combine left and right
			this.left.appendItems(this.right);

			return this.left;
		}

		return this;
	}

	getChildLength(child: BlockBuilder<T>): number {
		return child.itemsLength;
	}

	prependBlockChild(block: InnerBlockBuilder<T>, child: BlockBuilder<T>): void {
		block.prependChild(child);
	}

	appendBlockChild(block: InnerBlockBuilder<T>, child: BlockBuilder<T>): void {
		block.appendChild(child);
	}

	dropBlockFirstChild(block: InnerBlockBuilder<T>): BlockBuilder<T> {
		return block.dropFirstChild();
	}

	dropBlockLastChild(block: InnerBlockBuilder<T>): BlockBuilder<T> {
		return block.dropLastChild();
	}
}
