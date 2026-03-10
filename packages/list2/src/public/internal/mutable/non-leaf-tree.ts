import type { ListContext } from '#list/context';
import type { NonLeafTree } from '#list/immutable/non-leaf-tree';
import type { NonLeaf } from '#list/immutable/utils';
import type { ListImpl } from '#list/list-impl';
import type { LeafBlockBuilder } from '#list/mutable/leaf-block-builder';
import type { NonLeafBlockBuilder } from '#list/mutable/non-leaf-block';

import { BuilderBase, type NonLeafBuilder } from '#list/mutable/builder-base';

export class NonLeafTreeBuilder<T>
	extends BuilderBase<T>
	implements NonLeafBuilder<T>
{
	constructor(
		context: ListContext,
		readonly level: number,
		public source?: NonLeafTree<T>,
		public _left?: NonLeafBlockBuilder<T>,
		public _right?: NonLeafBlockBuilder<T>,
		public _middle?: NonLeafBuilder<T>,
		public itemsLength: number = source?.itemsLength ?? 0,
	) {
		super(context);
	}

	get(index: number): T {
		throw new Error('Method not implemented.');
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
