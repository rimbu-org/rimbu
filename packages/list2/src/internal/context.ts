import type { List } from '@rimbu/list';

import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';
import type { ListNonEmptyBase } from '#advanced/immutable/non-empty-base';
import type { Block, Inner, Self } from '#list/immutable/common';
import type {
	BlockBuilder,
	InnerBuilder,
	OuterBuilder,
} from '#list/mutable/common';
import type { SizeTable } from '#list/size-table';

import { type ArrayNonEmpty, Module } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';
import { OuterBlockLeftRight } from './immutable/outer-block-left-right';
import { OuterBlockRightLeft } from './immutable/outer-block-right-left';
import { ListBuilder } from './mutable/builder';
import { InnerBlockBuilder } from './mutable/inner-block-builder';
import { InnerTreeBuilder } from './mutable/inner-tree-builder';

import { ListEmptyBase } from '#advanced/immutable/empty-base';
import { InnerBlock } from '#list/immutable/inner-block';
import { InnerTree } from '#list/immutable/inner-tree';
import { OuterBlock } from '#list/immutable/outer-block';
import { OuterTree } from '#list/immutable/outer-tree';
import { OuterBlockBuilder } from '#list/mutable/outer-block-builder';
import { OuterTreeBuilder } from '#list/mutable/outer-tree-builder';

export interface ListContext<T> extends List.Context<T> {
	readonly minBlockSize: number;
	readonly maxBlockSize: number;
	readonly childrenOps: ChildrenOps;
	isList<T>(source: unknown): source is List<T>;
	isInContext<T>(source: unknown): source is List<T>;
	outerBlockLeftRight<T>(children: OuterChildren<T>): OuterBlock<T>;
	outerBlockRightLeft<T>(children: OuterChildren<T>): OuterBlock<T>;
	outerTree<T>(
		left: OuterBlock<T>,
		right: OuterBlock<T>,
		middle: Inner<T, OuterBlock<T>> | null,
		size: number,
	): OuterTree<T>;
	innerBlock<T, C extends Self<Block<T>, C>>(
		children: C[],
		size: number,
		level: number,
		sizeTable?: SizeTable | undefined,
	): InnerBlock<T, C>;
	innerTree<T, C extends Self<Block<T>, C>>(
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
	outerTreeBuilderSource<T>(source: OuterTree<T>): OuterTreeBuilder<T>;
	innerBlockBuilder<T, C extends BlockBuilder<T, any>>(
		children: C[],
		size: number,
		level: number,
		sizeTable?: SizeTable | undefined,
	): InnerBlockBuilder<T, C>;
	innerBlockBuilderSource<T, C extends BlockBuilder<T>>(
		source: InnerBlock<T, any>,
	): InnerBlockBuilder<T, C>;
	innerTreeBuilder<T, C extends BlockBuilder<T>>(
		level: number,
		left: InnerBlockBuilder<T, C>,
		right: InnerBlockBuilder<T, C>,
		middle: InnerBuilder<T, InnerBlockBuilder<T, C>> | undefined,
		size: number,
	): InnerTreeBuilder<T, C>;
	innerTreeBuilderSource<T, C extends BlockBuilder<T>>(
		source: InnerTree<T, any>,
	): InnerTreeBuilder<T, C>;
	builderFrom(outerBuilder: OuterBuilder<T>): List.Builder<T>;
}

export function createListContextModule<UT>(options: {
	blockSizeBits: number;
	childrenOps: ChildrenOps;
}): ListContext<UT> {
	const { blockSizeBits = 5, childrenOps } = options;

	return Module.create<ListContext<UT>>((mod) => ({
		blockSizeBits,
		minBlockSize: 1 << (blockSizeBits - 1),
		maxBlockSize: 1 << blockSizeBits,
		childrenOps,
		createContext: (options: { blockSizeBits?: number }) =>
			createListContextModule<UT>({
				blockSizeBits: options.blockSizeBits ?? blockSizeBits,
				childrenOps,
			}),
		isList: <T>(source: unknown): source is List<T> =>
			source instanceof ListEmptyBase ||
			source instanceof OuterBlock ||
			source instanceof OuterTree,
		isInContext: <T>(source: unknown): source is List<T> => {
			return mod.isList(source) && source.context === mod;
		},
		outerBlockLeftRight: <T>(children: OuterChildren<T>) =>
			new OuterBlockLeftRight<T>(mod as unknown as ListContext<T>, children),
		outerBlockRightLeft: <T>(children: OuterChildren<T>) =>
			new OuterBlockRightLeft<T>(mod as unknown as ListContext<T>, children),
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
		innerBlock: <T, C extends Self<Block<T>, C>>(
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
		innerTree: <T, C extends Self<Block<T>, C>>(
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
		outerTreeBuilderSource: <T>(source: OuterTree<T>) =>
			new OuterTreeBuilder<T>(mod as unknown as ListContext<T>, source),
		innerBlockBuilder: <T, C extends BlockBuilder<T>>(
			children: C[],
			size: number,
			level: number,
		) =>
			new InnerBlockBuilder<T, C>(
				mod as unknown as ListContext<T>,
				level,
				undefined,
				children,
				size,
			),
		innerBlockBuilderSource: <T, C extends BlockBuilder<T>>(
			source: InnerBlock<T, any>,
		) =>
			new InnerBlockBuilder<T, C>(
				mod as unknown as ListContext<T>,
				source.level,
				source,
			),
		innerTreeBuilder: <T, C extends BlockBuilder<T>>(
			level: number,
			left: InnerBlockBuilder<T, C>,
			right: InnerBlockBuilder<T, C>,
			middle: InnerBuilder<T, InnerBlockBuilder<T, C>> | undefined,
			size: number,
		) =>
			new InnerTreeBuilder<T, C>(
				mod as unknown as ListContext<T>,
				level,
				undefined,
				left,
				right,
				middle,
				size,
			),
		innerTreeBuilderSource: <T, C extends BlockBuilder<T>>(
			source: InnerTree<T, any>,
		) =>
			new InnerTreeBuilder<T, C>(
				mod as unknown as ListContext<T>,
				source.level,
				source,
			),
		builderFrom: <T>(outerBuilder: OuterBuilder<T>) =>
			new ListBuilder<T>(mod as unknown as ListContext<T>, outerBuilder),
		empty: Module.lazy(
			<T>() => new ListEmptyBase<T>(mod as unknown as ListContext<T>),
		),
		of: <T>(...elements: ArrayNonEmpty<T>): List.NonEmpty<T> => {
			if (elements.length <= mod.maxBlockSize) {
				return mod.outerBlockLeftRight(childrenOps.of(elements));
			}

			return mod.from<T>(elements);
		},
		from: <T>(...sources: StreamSource<T>[]): List.NonEmpty<T> => {
			let result: List.NonEmpty<T> | undefined;

			for (const source of sources) {
				if (mod.isInContext<T>(source) && source.nonEmpty()) {
					if (undefined === result) {
						result = source;
					} else {
						result = (result as ListNonEmptyBase<T>)._concat(source);
					}
				} else if (!Stream.isEmptyStreamSourceInstance(source)) {
					const builder =
						undefined === result ? mod.builder<T>() : result.toBuilder();
					builder.appendAll(source);
					if (!builder.isEmpty) {
						result = builder.build().assumeNonEmpty();
					}
				}
			}

			if (undefined === result) {
				return mod.empty<T>() as List.NonEmpty<T>;
			}

			return result;
		},
		builder: <T>() => new ListBuilder<T>(mod as unknown as ListContext<T>),
	})).build();
}
