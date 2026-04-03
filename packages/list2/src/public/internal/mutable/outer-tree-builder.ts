import type { ListContext } from '#list/context-module';
import type { OuterTree } from '#list/immutable/outer-tree';
import type { InnerBuilder, OuterBuilder } from '#list/mutable/builder-base';
import type { OuterBlockBuilder } from '#list/mutable/outer-block-builder';

import { TreeBuilder } from '#list/mutable/tree-builder';

export class OuterTreeBuilder<T>
	extends TreeBuilder<T, T>
	implements OuterBuilder<T>
{
	constructor(
		context: ListContext,
		public source?: OuterTree<T>,
		public _left?: OuterBlockBuilder<T>,
		public _right?: OuterBlockBuilder<T>,
		public _middle?: InnerBuilder<T, OuterBlockBuilder<T>>,
		public length: number = source?.length ?? 0,
	) {
		super(context);
	}

	get level(): number {
		return 0;
	}

	prepareMutate(): void {
		if (undefined === this.source) return;

		this._left = this.context.outerBlockBuilderSource(this.source.left);
		this._right = this.context.outerBlockBuilderSource(this.source.right);
		this._middle =
			null === this.source.middle
				? undefined
				: this.context.createInnerBuilder<T, OuterBlockBuilder<T>>(
						this.source.middle,
					);
		this.length = this.source.length;
		this.source = undefined;
	}

	get left(): OuterBlockBuilder<T> {
		return this._left!;
	}

	set left(value: OuterBlockBuilder<T>) {
		this._left = value;
	}

	get right(): OuterBlockBuilder<T> {
		return this._right!;
	}

	set right(value: OuterBlockBuilder<T>) {
		this._right = value;
	}

	get middle(): InnerBuilder<T, OuterBlockBuilder<T>> | undefined {
		return this._middle;
	}

	set middle(value: InnerBuilder<T, OuterBlockBuilder<T>> | undefined) {
		this._middle = value;
	}

	get(index: number): T {
		if (undefined !== this.source) {
			return this.source.get(index);
		}

		return super.get(index);
	}

	normalized(): OuterBuilder<T> {
		if (this.length <= this.context.maxBlockSize) {
			// can collapse into block
			this.left.appendItems(this.right);
			return this.left;
		}

		if (undefined !== this.middle) {
			if (this.middle.length + this.left.length <= this.context.maxBlockSize) {
				// can merge middle with left
				this.left.appendItems(this.middle.firstChild());
				this.middle = undefined;
			} else if (
				this.middle.length + this.right.length <=
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

	build(): OuterTree<T> {
		return (
			this.source ??
			this.context.outerTree<T>(
				this.left.build(),
				this.right.build(),
				this.middle?.build() ?? null,
				this.length,
			)
		);
	}

	buildMap<T2>(f: (value: T) => T2): OuterTree<T2> {
		return (
			this.source?.map(f) ??
			this.context.outerTree(
				this.left.buildMap(f),
				this.right.buildMap(f),
				this.middle?.buildMap?.(f) ?? null,
				this.length,
			)
		);
	}

	getChildLength(): number {
		return 1;
	}

	prependBlockChild(block: OuterBlockBuilder<T>, child: T): void {
		block.prepend(child);
	}

	appendBlockChild(block: OuterBlockBuilder<T>, child: T): void {
		block.append(child);
	}

	dropBlockFirstChild(block: OuterBlockBuilder<T>): T {
		return block.dropFirstChild();
	}

	dropBlockLastChild(block: OuterBlockBuilder<T>): T {
		return block.dropLastChild();
	}
}
