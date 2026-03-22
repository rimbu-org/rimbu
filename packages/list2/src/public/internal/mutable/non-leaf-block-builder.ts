import type { ListContext } from '#list/context-module';
import type { NonLeafBlock } from '#list/immutable/non-leaf-block';
import type { NonLeaf } from '#list/immutable/utils';
import type { ListImpl } from '#list/list-impl';
import type { LeafBlockBuilder } from '#list/mutable/leaf-block-builder';

import { BuilderBase, type NonLeafBuilder } from '#list/mutable/builder-base';

export class NonLeafBlockBuilder<T>
	extends BuilderBase<T>
	implements NonLeafBuilder<T>
{
	constructor(
		context: ListContext,
		readonly level: number,
		public source?: NonLeafBlock<T>,
		public _children?: Array<LeafBlockBuilder<T>>,
		public itemsLength: number = source?.itemsLength ?? 0,
	) {
		super(context);
	}

	get children(): Array<LeafBlockBuilder<T>> {
		return this._children!;
	}

	prepareMutate(): void {
		throw new Error('Method not implemented.');
		// if (undefined === this.source) return;

		// this._children = this.source.children.map((c) => c.createBlockBuilder());
		// this.source = undefined;
	}

	get(index: number): T {
		throw new Error('Method not implemented.');
	}

	appendChild(child: LeafBlockBuilder<T, ListImpl.Types>): void {
		this.itemsLength += child.length;

		this.children.push(child);
	}

	firstLeafBlockBuilder(): LeafBlockBuilder<T, ListImpl.Types> {
		throw new Error('Method not implemented.');
	}

	lastLeafBlockBuilder(): LeafBlockBuilder<T, ListImpl.Types> {
		throw new Error('Method not implemented.');
	}

	build(): NonLeaf<T> {
		throw new Error('Method not implemented.');
	}
}
