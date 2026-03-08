import type { WithElem } from '@rimbu/collection-types/common';
import type { Block, NonLeaf } from './immutable/utils';

import type { ListBase } from '#list/list-base';
import type { ListImpl } from '#list/list-impl';

import { CacheMap } from './immutable/cache-map';
import { ListEmpty } from './immutable/empty';
import { LeafBlock } from './immutable/leaf-block';
import { LeafTree } from './immutable/leaf-tree';
import { NonLeafBlock } from './immutable/non-leaf-block';
import { NonLeafTree } from './immutable/non-leaf-tree';
import { ReversedLeafBlock } from './immutable/reversed-leaf-block';
import { ListBuilder } from './mutable/builder';
import { LeafBlockBuilder } from './mutable/leaf-block-builder';
import { LeafTreeBuilder } from './mutable/leaf-tree-builder';
import { NonLeafBlockBuilder } from './mutable/non-leaf-block';
import { NonLeafTreeBuilder } from './mutable/non-leaf-tree';

export class ListContext<Tp extends ListImpl.Types = ListImpl.Types>
	implements ListBase.Context<Tp>
{
	constructor(
		readonly blockSizeBits: number,
		readonly createLLeafChildrenOps: (options: {
			blockSizeBits: number;
		}) => ListImpl.LeafChildrenOps<Tp>,
		readonly maxBlockSize = 1 << blockSizeBits,
		readonly minBlockSize = this.maxBlockSize >>> 1,
	) {
		this.leafChildrenOps = createLLeafChildrenOps({ blockSizeBits });
	}

	readonly leafChildrenOps: ListImpl.LeafChildrenOps<Tp>;

	createContext(): ListContext {
		return this;
	}

	empty<T>(): ListImpl<T> {
		return new ListEmpty(this);
	}

	builder<T>(): ListBuilder<T> {
		return new ListBuilder<T>(this);
	}

	leafBlock<T>(children: WithElem<Tp, T>['leafChildren']): LeafBlock<T> {
		return new LeafBlock(this, children);
	}

	reversedLeafBlock<T>(
		children: WithElem<Tp, T>['leafChildren'],
	): LeafBlock<T> {
		return new ReversedLeafBlock(this, children);
	}

	leafTree<T>(
		left: LeafBlock<T>,
		right: LeafBlock<T>,
		middle: NonLeaf<T> | null,
		length: number,
	): LeafTree<T> {
		return new LeafTree(this, left, right, middle, length);
	}

	nonLeafBlock<T>(
		children: readonly Block<T>[],
		itemsLength: number,
		level: number,
	): NonLeafBlock<T> {
		return new NonLeafBlock(this, children, itemsLength, level);
	}

	nonLeafTree<T>(
		left: NonLeafBlock<T>,
		right: NonLeafBlock<T>,
		middle: NonLeaf<T> | null,
		itemsLength: number,
		level: number,
	): NonLeafTree<T> {
		return new NonLeafTree(this, left, right, middle, itemsLength, level);
	}

	leafBlockBuilder<T>(
		children: WithElem<Tp, T>['leafChildren'],
	): LeafBlockBuilder<T> {
		return new LeafBlockBuilder(this, undefined, children);
	}

	leafTreeBuilder<T>(source?: LeafTree<T>): LeafTreeBuilder<T> {
		return new LeafTreeBuilder(this, source);
	}

	nonLeafBlockBuilder<T>(): NonLeafBlockBuilder<T> {
		return new NonLeafBlockBuilder(this);
	}

	nonLeafTreeBuilder<T>(): NonLeafTreeBuilder<T> {
		return new NonLeafTreeBuilder(this);
	}

	isReversedLeafBlock<T>(block: LeafBlock<T>): block is ReversedLeafBlock<T> {
		return block instanceof ReversedLeafBlock;
	}

	cacheMap(): CacheMap {
		return new CacheMap();
	}
}
