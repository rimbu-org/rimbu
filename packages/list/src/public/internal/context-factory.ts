import type { List } from '@rimbu/list';

import type { GenBuilder } from '#list/builder/generic';
import type { LeafBlockBuilder } from '#list/builder/leaf/block';
import type { LeafTreeBuilder } from '#list/builder/leaf/tree';
import type { NonLeafBlockBuilder } from '#list/builder/nonleaf/block';
import type { NonLeafTreeBuilder } from '#list/builder/nonleaf/tree';
import type {
	BlockBuilder,
	LeafBuilder,
	NonLeafBuilder,
} from '#list/builder/types';
import type { CacheMap } from '#list/immutable/cache-map';
import type { LeafBlock, ReversedLeafBlock } from '#list/immutable/leaf/block';
import type { LeafTree } from '#list/immutable/leaf/tree';
import type { NonLeafBlock } from '#list/immutable/nonleaf/block';
import type { NonLeafTree } from '#list/immutable/nonleaf/tree';
import type { Block, NonLeaf } from '#list/immutable/types';
import type { ListCreators } from '#private/list-factory';

export interface ImmutableFactory {
	_emptyInstance: List<any>;
	leafBlock<T>(children: readonly T[]): LeafBlock<T>;
	reversedLeaf<T>(children: readonly T[]): ReversedLeafBlock<T>;
	leafTree<T>(
		left: LeafBlock<T>,
		right: LeafBlock<T>,
		middle: NonLeaf<T, LeafBlock<T>> | null,
	): LeafTree<T>;
	nonLeafBlock<T, C extends Block<T, C>>(
		length: number,
		children: readonly C[],
		level: number,
	): NonLeafBlock<T, C>;
	nonLeafTree<T, C extends Block<T, C>>(
		left: NonLeafBlock<T, C>,
		right: NonLeafBlock<T, C>,
		middle: NonLeaf<T, NonLeafBlock<T, C>> | null,
		level: number,
	): NonLeafTree<T, C>;
	isLeafBlock<T>(obj: List<T> | Block<T>): obj is LeafBlock<T>;
	isReversedLeafBlock<T>(obj: List<T> | Block<T>): obj is ReversedLeafBlock<T>;
	isNonLeafBlock<T>(
		obj: List<T> | Block<T> | NonLeaf<T>,
	): obj is NonLeafBlock<T, any>;
	isLeafTree<T>(obj: List<T>): obj is LeafTree<T>;
	isNonLeafTree<T>(obj: NonLeaf<T>): obj is NonLeafTree<T, any>;
}

export interface BuilderFactory {
	builder<T>(): GenBuilder<T>;
	createBuilder<T>(source?: List<T>): GenBuilder<T>;
	leafBlockBuilderSource<T>(source: LeafBlock<T>): LeafBlockBuilder<T>;
	leafBlockBuilder<T>(children: T[]): LeafBlockBuilder<T>;
	leafTreeBuilderSource<T>(source: LeafTree<T>): LeafTreeBuilder<T>;
	leafTreeBuilder<T>(
		left: LeafBlockBuilder<T>,
		right: LeafBlockBuilder<T>,
		middle?: NonLeafBuilder<T, LeafBlockBuilder<T>>,
		length?: number,
	): LeafTreeBuilder<T>;
	nonLeafBlockBuilderSource<T, C extends BlockBuilder<T>>(
		source: NonLeafBlock<T, any>,
	): NonLeafBlockBuilder<T, C>;
	nonLeafBlockBuilder<T, C extends BlockBuilder<T>>(
		level: number,
		children: C[],
		length: number,
	): NonLeafBlockBuilder<T, C>;
	nonLeafTreeBuilderSource<T, C extends BlockBuilder<T>>(
		source: NonLeafTree<T, any>,
	): NonLeafTreeBuilder<T, C>;
	nonLeafTreeBuilder<T, C extends BlockBuilder<T>>(
		level: number,
		left: NonLeafBlockBuilder<T, C>,
		right: NonLeafBlockBuilder<T, C>,
		middle?: NonLeafBuilder<T, NonLeafBlockBuilder<T, C>>,
		length?: number,
	): NonLeafTreeBuilder<T, C>;
	isLeafBlockBuilder<T>(obj: LeafBuilder<T>): obj is LeafBlockBuilder<T>;
	isLeafTreeBuilder<T>(obj: LeafBuilder<T>): obj is LeafTreeBuilder<T>;
	isNonLeafBlockBuilder<T>(
		obj: NonLeafBuilder<T, any>,
	): obj is NonLeafBlockBuilder<T, any>;
}

export interface ContextFactory
	extends ImmutableFactory,
		BuilderFactory,
		Omit<ListCreators, 'builder'> {
	_types: List.Types;
	typeTag: 'List';
	maxBlockSize: number;
	minBlockSize: number;
	blockSizeBits: number;
	createCacheMap(): CacheMap;
}
