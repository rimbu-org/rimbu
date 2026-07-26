import type { List } from '@rimbu/list';

import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';
import type { Block, Inner } from '#list/immutable/common';
import type { BlockBuilder, InnerBuilder } from '#list/mutable/common';
import type { SizeTable } from '#list/size-table';

import { type ArrayNonEmpty, Module } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';
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

export interface ListContext<T, IsNonEmpty extends boolean = boolean>
	extends List.Context<T, IsNonEmpty> {
	readonly __types: List.Context<T, IsNonEmpty>['__types'] & {
		_outerChildren: OuterChildren<T>;
	};
	readonly minBlockSize: number;
	readonly maxBlockSize: number;
	readonly childrenOps: ChildrenOps;
	isList<T>(source: unknown): source is List<T>;
	isInContext<T>(source: unknown): source is List<T>;
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
	innerBlockBuilder<T, C extends BlockBuilder<T>>(
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
		isList: <T>(source: unknown): source is List<T> =>
			source instanceof ListEmptyBase ||
			source instanceof OuterBlock ||
			source instanceof OuterTree,
		isInContext: <T>(source: unknown): source is List<T> => {
			return mod.isList(source) && source.context === mod;
		},
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
		innerBlockBuilder: <T, C extends BlockBuilder<T>>(
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
		from: <T>(...sources: StreamSource<T>[]): List.NonEmpty<T> => {
			if (sources.length === 1) {
				const source = sources[0];
				if (mod.isInContext<T>(source)) {
					return source as List.NonEmpty<T>;
				}
			}

			let result: List.NonEmpty<T> | null = null;

			let i = -1;
			const length = sources.length;

			while (++i < length) {
				const source = sources[i];

				if (!Stream.isEmptyStreamSourceInstance(source)) {
					// if (mod.isContextList<T>(source)) {
					// 	if (null === result) result = source;
					// 	else result = result.concat(source);
					// } else {
					const builder = mod.builder<T>();

					// if (Array.isArray(source)) builder.appendArray(source);
					// else builder.appendAll(source);
					builder.appendAll(source);

					if (!builder.isEmpty) {
						const build = builder.build();
						if (null === result) result = build.assumeNonEmpty();
						// else result = result.concat(build);
					}
					// }
				}
			}

			if (null === result) return mod.empty<T>() as List.NonEmpty<T>;
			return result as List.NonEmpty<T>;
		},
		builder: <T>() => new ListBuilder<T>(mod as unknown as ListContext<T>),
	})).build();
}
