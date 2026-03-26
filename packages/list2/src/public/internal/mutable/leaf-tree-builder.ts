import type { ListContext } from '#list/context-module';
import type { LeafTree } from '#list/immutable/leaf-tree';
import type { ListImpl } from '#list/list-impl';
import type { LeafBlockBuilder } from '#list/mutable/leaf-block-builder';

import {
	type LeafBuilder,
	type NonLeafBuilder,
	TreeBuilderBase,
} from '#list/mutable/builder-base';

export class LeafTreeBuilder<T>
	extends TreeBuilderBase<T, T>
	implements LeafBuilder<T>
{
	constructor(
		context: ListContext,
		public source?: LeafTree<T>,
		public _left?: LeafBlockBuilder<T>,
		public _right?: LeafBlockBuilder<T>,
		public _middle?: NonLeafBuilder<T, LeafBlockBuilder<T>>,
		public length: number = source?.length ?? 0,
	) {
		super(context);
	}

	get itemsLength(): number {
		return this.length;
	}

	get level(): number {
		return 0;
	}

	prepareMutate(): void {
		if (undefined === this.source) return;

		this._left = this.context.leafBlockBuilderSource(this.source.left);
		this._right = this.context.leafBlockBuilderSource(this.source.right);
		this._middle =
			null === this.source.middle
				? undefined
				: this.context.createNonLeafBuilder(this.source.middle);
		this.length = this.source.length;
		this.source = undefined;
	}

	get left(): LeafBlockBuilder<T> {
		return this._left!;
	}

	set left(value: LeafBlockBuilder<T>) {
		this._left = value;
	}

	get right(): LeafBlockBuilder<T> {
		return this._right!;
	}

	set right(value: LeafBlockBuilder<T>) {
		this._right = value;
	}

	get middle(): NonLeafBuilder<T, LeafBlockBuilder<T>> | undefined {
		return this._middle;
	}

	set middle(value: NonLeafBuilder<T, LeafBlockBuilder<T>> | undefined) {
		this._middle = value;
	}

	get(index: number): T {
		if (undefined !== this.source) {
			return this.source.get(index);
		}

		return super.get(index);
	}

	normalized(): LeafBuilder<T> {
		if (this.length <= this.context.maxBlockSize) {
			// can collapse into block
			this.left.appendItems(this.right);
			return this.left;
		}

		if (undefined !== this.middle) {
			if (
				this.middle.itemsLength + this.left.length <=
				this.context.maxBlockSize
			) {
				// can merge middle with left
				this.left.appendItems(this.middle.firstChild());
				this.middle = undefined;
			} else if (
				this.middle.itemsLength + this.right.length <=
				this.context.maxBlockSize
			) {
				// can merge middle with right
				const newRight = this.middle.lastChild();
				newRight.appendItems(this.right);
				this.right = newRight;
				this.middle = undefined;
			}
		}

		return this;
	}

	build(): ListImpl<T, ListImpl.Types> {
		throw new Error('Not implemented yet');
	}

	getChildLength(): number {
		return 1;
	}

	prependBlockChild(block: LeafBlockBuilder<T>, child: T): void {
		block.prepend(child);
	}

	appendBlockChild(block: LeafBlockBuilder<T>, child: T): void {
		block.append(child);
	}

	dropBlockFirstChild(block: LeafBlockBuilder<T>): T {
		return block.dropFirst();
	}

	dropBlockLastChild(block: LeafBlockBuilder<T>): T {
		return block.dropLast();
	}
}
