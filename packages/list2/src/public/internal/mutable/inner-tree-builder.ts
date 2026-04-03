import type { ListContext } from '#list/context-module';
import type { InnerTree } from '#list/immutable/inner-tree';
import type {
	BlockBuilder,
	InnerBuilder,
	ToImmutable,
} from '#list/mutable/builder-base';
import type { InnerBlockBuilder } from '#list/mutable/inner-block-builder';

import { TreeBuilder } from '#list/mutable/tree-builder';

export class InnerTreeBuilder<T, C extends BlockBuilder<T>>
	extends TreeBuilder<T, C>
	implements InnerBuilder<T, C>
{
	constructor(
		context: ListContext,
		readonly level: number,
		public source?: InnerTree<T, ToImmutable<C>>,
		public _left?: InnerBlockBuilder<T, C>,
		public _right?: InnerBlockBuilder<T, C>,
		public _middle?: InnerBuilder<T, InnerBlockBuilder<T, C>>,
		public length: number = source?.length ?? 0,
	) {
		super(context);
	}

	get left(): InnerBlockBuilder<T, C> {
		return this._left!;
	}

	get right(): InnerBlockBuilder<T, C> {
		return this._right!;
	}

	get middle(): InnerBuilder<T, InnerBlockBuilder<T, C>> | undefined {
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
		this.length = this.source.length;
		this.source = undefined;
	}

	get(index: number): T {
		if (undefined !== this.source) {
			return this.source.get(index);
		}

		return super.get(index);
	}

	prependChild(child: C): void {
		this.prepareMutate();
		this.length += child.length;

		this.left.prependChild(child);
	}

	appendChild(child: C): void {
		this.prepareMutate();
		this.length += child.length;

		this.right.appendChild(child);
	}

	firstChild(): C {
		return this.left.firstChild();
	}

	lastChild(): C {
		return this.right.lastChild();
	}

	dropFirstChild(): C {
		this.prepareMutate();
		const firstChild = this.left.dropFirstChild();
		this.length -= firstChild.length;

		return firstChild;
	}

	dropLastChild(): C {
		this.prepareMutate();
		const lastChild = this.right.dropLastChild();
		this.length -= lastChild.length;

		return lastChild;
	}

	modifyFirstChild(f: (child: C) => number | undefined): number | undefined {
		return this.left.modifyFirstChild(f);
	}

	modifyLastChild(f: (child: C) => number | undefined): number | undefined {
		return this.right.modifyLastChild(f);
	}

	build(): InnerTree<T, ToImmutable<C>> {
		return (
			this.source ??
			this.context.innerTree(
				this.left.build(),
				this.right.build(),
				this.middle?.build() ?? null,
				this.length,
				this.level,
			)
		);
	}

	buildMap<T2>(f: (value: T) => T2): InnerTree<T2, any> {
		return (
			this.source?.map?.(f) ??
			this.context.innerTree(
				this.left.buildMap(f),
				this.right.buildMap(f),
				this.middle?.buildMap?.(f) ?? null,
				this.length,
				this.level,
			)
		);
	}

	normalized(): InnerBuilder<T, C> | undefined {
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

	getChildLength(child: C): number {
		return child.length;
	}

	prependBlockChild(block: InnerBlockBuilder<T, C>, child: C): void {
		block.prependChild(child);
	}

	appendBlockChild(block: InnerBlockBuilder<T, C>, child: C): void {
		block.appendChild(child);
	}

	dropBlockFirstChild(block: InnerBlockBuilder<T, C>): C {
		return block.dropFirstChild();
	}

	dropBlockLastChild(block: InnerBlockBuilder<T, C>): C {
		return block.dropLastChild();
	}
}
