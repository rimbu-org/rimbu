import type { List } from '@rimbu/list';
import type { StreamSource } from '@rimbu/stream';

import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';
import type { Block, Inner } from '#list/immutable/common';
import type { BlockBuilder, InnerBuilder } from '#list/mutable/common';
import type { SizeTable } from '#list/size-table';

import { type ArrayNonEmpty, Module } from '@rimbu/common';
import { InnerBlockBuilder } from './mutable/inner-block-builder';
import { InnerTreeBuilder } from './mutable/inner-tree-builder';

import { ListEmptyBase } from '#advanced/immutable/empty-base';
import { InnerBlock } from '#list/immutable/inner-block';
import { InnerTree } from '#list/immutable/inner-tree';
import { OuterBlock } from '#list/immutable/outer-block';
import { OuterTree } from '#list/immutable/outer-tree';
import { OuterBlockBuilder } from '#list/mutable/outer-block-builder';
import { OuterTreeBuilder } from '#list/mutable/outer-tree-builder';

export interface ListContext<T, IsNonEmpty extends boolean = boolean>
	extends List.Context<T, IsNonEmpty> {
	readonly __types: List.Context<T, IsNonEmpty>['__types'] & {
		_outerChildren: OuterChildren<T>;
	};
	readonly minBlockSize: number;
	readonly maxBlockSize: number;
	readonly childrenOps: ChildrenOps;
	outerBlock<T>(children: OuterChildren<T>): OuterBlock<T>;
	outerTree<T>(
		left: OuterBlock<T>,
		right: OuterBlock<T>,
		middle: Inner<T, OuterBlock<T>> | null,
		size: number,
	): OuterTree<T>;
	innerBlock<T, C extends Block<T>>(
		children: C[],
		size: number,
		level: number,
		sizeTable?: SizeTable | undefined,
	): InnerBlock<T, C>;
	innerTree<T, C extends Block<T>>(
		left: InnerBlock<T, C>,
		right: InnerBlock<T, C>,
		middle: Inner<T, InnerBlock<T, C>> | null,
		size: number,
		level: number,
	): InnerTree<T, C>;
	outerBlockBuilder<T>(children: OuterChildren<T>): OuterBlockBuilder<T>;
	outerBlockBuilderSource<T>(source: OuterBlock<T>): OuterBlockBuilder<T>;
	outerTreeBuilder<T>(
		left: OuterBlockBuilder<T>,
		right: OuterBlockBuilder<T>,
		middle: InnerBuilder<T, OuterBlockBuilder<T>> | undefined,
		size: number,
	): OuterTreeBuilder<T>;
	innerBlockBuilderC<T, C extends BlockBuilder<T>>(
		children: C[],
		size: number,
		level: number,
		sizeTable?: SizeTable | undefined,
	): InnerBlockBuilder<T, C>;
	innerBlockBuilderSource<T, C extends BlockBuilder<T>>(
		source: InnerBlock<T, any>,
	): InnerBlockBuilder<T, C>;
	innerTreeBuilderSource<T, C extends BlockBuilder<T>>(
		source: InnerTree<T, any>,
	): InnerTreeBuilder<T, C>;
}

export function createListContextModule<UT>(options: {
	blockSizeBits: number;
	childrenOps: ChildrenOps;
}): ListContext<UT> {
	const { blockSizeBits = 5, childrenOps } = options;

	return Module.create<ListContext<UT>>((mod) => ({
		__types: undefined as any,
		blockSizeBits,
		minBlockSize: 1 << (blockSizeBits - 1),
		maxBlockSize: 1 << blockSizeBits,
		childrenOps,
		outerBlock: <T>(children: OuterChildren<T>) =>
			new OuterBlock<T>(mod as unknown as ListContext<T>, children),
		outerTree: <T>(
			left: OuterBlock<T>,
			right: OuterBlock<T>,
			middle: Inner<T, OuterBlock<T>> | null,
			size: number,
		) =>
			new OuterTree<T>(
				mod as unknown as ListContext<T>,
				left,
				right,
				middle,
				size,
			),
		innerBlock: <T, C extends Block<T>>(
			children: C[],
			size: number,
			level: number,
			sizeTable?: SizeTable | undefined,
		) =>
			new InnerBlock<T, C>(
				mod as unknown as ListContext<T>,
				children,
				size,
				level,
				sizeTable,
			),
		innerTree: <T, C extends Block<T>>(
			left: InnerBlock<T, C>,
			right: InnerBlock<T, C>,
			middle: Inner<T, InnerBlock<T, C>> | null,
			size: number,
			level: number,
		) =>
			new InnerTree<T, C>(
				mod as unknown as ListContext<T>,
				left,
				right,
				middle,
				size,
				level,
			),
		outerBlockBuilder: <T>(children: OuterChildren<T>) =>
			new OuterBlockBuilder<T>(
				mod as unknown as ListContext<T>,
				undefined,
				children,
			),
		outerBlockBuilderSource: <T>(source: OuterBlock<T>) =>
			new OuterBlockBuilder<T>(mod as unknown as ListContext<T>, source),
		outerTreeBuilder: <T>(
			left: OuterBlockBuilder<T>,
			right: OuterBlockBuilder<T>,
			middle: InnerBuilder<T, OuterBlockBuilder<T>> | undefined,
			size: number,
		) =>
			new OuterTreeBuilder<T>(
				mod as unknown as ListContext<T>,
				undefined,
				left,
				right,
				middle,
				size,
			),
		innerBlockBuilderC: <T, C extends BlockBuilder<T>>(
			children: C[],
			size: number,
			level: number,
			sizeTable?: SizeTable | undefined,
		) =>
			new InnerBlockBuilder<T, C>(
				mod as unknown as ListContext<T>,
				level,
				undefined,
				children,
				size,
				sizeTable,
			),
		innerBlockBuilderSource: <T, C extends BlockBuilder<T>>(
			source: InnerBlock<T, any>,
		) =>
			new InnerBlockBuilder<T, C>(
				mod as unknown as ListContext<T>,
				source.level,
				source,
			),
		innerTreeBuilderSource: <T, C extends BlockBuilder<T>>(
			source: InnerTree<T, any>,
		) =>
			new InnerTreeBuilder<T, C>(
				mod as unknown as ListContext<T>,
				source.level,
				source,
			),
		empty: Module.lazy(
			<T>() => new ListEmptyBase<T>(mod as unknown as ListContext<T>),
		),
		of: <T>(...elements: ArrayNonEmpty<T>): List.NonEmpty<T> => {
			if (elements.length <= mod.maxBlockSize) {
				return mod.outerBlock(childrenOps.of(elements));
			}

			return mod.from<T>(elements);
		},
		from: <T>(...values: StreamSource<T>[]): List.NonEmpty<T> => {
			return 0 as any;
		},
	})).build();
}
