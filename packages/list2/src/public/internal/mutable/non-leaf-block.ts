import type { WithElem } from '@rimbu/collection-types/common';
import type { NonLeaf } from '../immutable/utils';

import type { ListContext } from '#list/context';
import type { NonLeafBlock } from '#list/immutable/non-leaf-block';
import type { ListImpl } from '#list/list-impl';
import type { LeafBlockBuilder } from '#list/mutable/leaf-block-builder';

import { BuilderBase, type NonLeafBuilder } from '#list/mutable/builder-base';

export class NonLeafBlockBuilder<T, Tp extends ListImpl.Types = ListImpl.Types>
	extends BuilderBase<T>
	implements NonLeafBuilder<T>
{
	constructor(
		context: ListContext,
		readonly level: number,
		public source?: NonLeafBlock<T>,
		public _children?: Array<WithElem<Tp, Tp>['leafChildren']>,
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
