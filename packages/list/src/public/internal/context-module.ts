import type { WithElem } from '@rimbu/collection-types/common';
import type { ArrayNonEmpty } from '@rimbu/common/types';

import type { Block, Inner } from '#list/immutable/utils';
import type { ListBase } from '#list/list-base';
import type { ListImpl } from '#list/list-impl';
import type {
	BlockBuilder,
	InnerBuilder,
	ToImmutable,
} from '#list/mutable/builder-base';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';
import { Module } from '@rimbu/common/module';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';
import { OuterBase } from './immutable/outer-base';

import { CacheMap } from '#list/immutable/cache-map';
import { ListEmpty } from '#list/immutable/empty';
import { InnerBlock } from '#list/immutable/inner-block';
import { InnerTree } from '#list/immutable/inner-tree';
import { OuterBlock } from '#list/immutable/outer-block';
import { OuterTree } from '#list/immutable/outer-tree';
import { ReversedOuterBlock } from '#list/immutable/reversed-outer-block';
import { ListBuilder } from '#list/mutable/builder';
import { InnerBlockBuilder } from '#list/mutable/inner-block-builder';
import { InnerTreeBuilder } from '#list/mutable/inner-tree-builder';
import { OuterBlockBuilder } from '#list/mutable/outer-block-builder';
import { OuterTreeBuilder } from '#list/mutable/outer-tree-builder';

interface ImmutableFactory<Tp extends ListImpl.Types = ListImpl.Types> {
	outerBlock<T>(children: WithElem<Tp, T>['outerChildren']): OuterBlock<T>;
	isOuterBlock<T>(block: ListBase<T> | Block<T>): block is OuterBlock<T>;
	reversedOuterBlock<T>(
		children: WithElem<Tp, T>['outerChildren'],
	): OuterBlock<T>;
	outerTree<T>(
		left: OuterBlock<T>,
		right: OuterBlock<T>,
		middle: Inner<T, OuterBlock<T>> | null,
		length: number,
	): OuterTree<T>;
	innerBlock<T, C extends Block<T>>(
		children: C[],
		length: number,
		level: number,
		sizes?: number[] | null,
	): InnerBlock<T, C>;
	isInnerBlock<T, C extends Block<T>>(
		source: unknown,
	): source is InnerBlock<T, C>;
	innerTree<T, C extends Block<T>>(
		left: InnerBlock<T, C>,
		right: InnerBlock<T, C>,
		middle: Inner<T, InnerBlock<T, C>> | null,
		length: number,
		level: number,
	): InnerTree<T, C>;
	isInnerTree<T, C extends Block<T>>(
		source: unknown,
	): source is InnerTree<T, C>;
	isOuterTree<T>(list: ListBase<T>): list is OuterTree<T>;
	isList<T>(source: unknown): source is ListBase<T, Tp>;
	isContextList<T>(source: unknown): source is ListImpl<T, Tp>;
}

interface BuilderFactory<Tp extends ListImpl.Types = ListImpl.Types> {
	createBuilder<T>(source?: ListBase<T>): ListBuilder<T>;
	outerBlockBuilderSource<T>(source: OuterBlock<T>): OuterBlockBuilder<T>;
	outerBlockBuilder<T>(
		children: WithElem<Tp, T>['outerChildren'],
	): OuterBlockBuilder<T>;
	isOuterBlockBuilder<T>(source: unknown): source is OuterBlockBuilder<T>;
	outerTreeBuilderSource<T>(source: OuterTree<T>): OuterTreeBuilder<T>;
	outerTreeBuilder<T>(
		left: OuterBlockBuilder<T>,
		right: OuterBlockBuilder<T>,
		middle: InnerBuilder<T, OuterBlockBuilder<T>> | undefined,
		length: number,
	): OuterTreeBuilder<T>;
	isOuterTreeBuilder<T>(source: unknown): source is OuterTreeBuilder<T>;
	createInnerBuilder<T, C extends BlockBuilder<T>>(
		source: Inner<T, Block<T>>,
	): InnerBuilder<T, C>;
	innerBlockBuilderSource<T, C extends BlockBuilder<T>>(
		source: InnerBlock<T, ToImmutable<C>>,
	): InnerBlockBuilder<T, C>;
	innerBlockBuilder<T, C extends BlockBuilder<T>>(
		level: number,
		children: Array<C>,
		length: number,
	): InnerBlockBuilder<T, C>;
	isInnerBlockBuilder<T, C extends BlockBuilder<T>>(
		source: unknown,
	): source is InnerBlockBuilder<T, C>;
	innerTreeBuilderSource<T, C extends BlockBuilder<T>>(
		source: InnerTree<T, ToImmutable<C>>,
	): InnerTreeBuilder<T, C>;
	innerTreeBuilder<T, C extends BlockBuilder<T>>(
		level: number,
		left: InnerBlockBuilder<T, C>,
		right: InnerBlockBuilder<T, C>,
		middle: InnerBuilder<T, InnerBlockBuilder<T, C>> | undefined,
		length: number,
	): InnerTreeBuilder<T, C>;
	isInnerTreeBuilder<T, C extends BlockBuilder<T>>(
		source: unknown,
	): source is InnerTreeBuilder<T, C>;
}

export interface ListContextBase<Tp extends ListImpl.Types = ListImpl.Types>
	extends ListBase.Context<Tp>,
		ImmutableFactory<Tp>,
		BuilderFactory<Tp> {
	cacheMap(): CacheMap;
}

export interface ListContext<Tp extends ListImpl.Types = ListImpl.Types>
	extends ListContextBase<Tp> {
	readonly outerChildrenOps: ListImpl.OuterChildrenOps<Tp>;
}

export function createContextModule<
	C extends ListContext<Tp>,
	Tp extends ListImpl.Types = ListImpl.Types,
>(
	options: { blockSizeBits?: number | undefined } | undefined = {},
): (mod: C) => Module.Definition<ListContextBase<Tp>> {
	const { blockSizeBits = 5 } = options;

	const immutableModule = Module.createPartial<{
		defines: ImmutableFactory<Tp>;
		requires: ListContext<Tp>;
	}>((mod) => ({
		outerBlock<T>(children: WithElem<Tp, T>['outerChildren']): OuterBlock<T> {
			return new OuterBlock(mod, children);
		},
		isOuterBlock<T>(block: ListBase<T> | Block<T>): block is OuterBlock<T> {
			return block instanceof OuterBlock;
		},
		reversedOuterBlock<T>(
			children: WithElem<Tp, T>['outerChildren'],
		): OuterBlock<T> {
			return new ReversedOuterBlock(mod, children);
		},
		outerTree<T>(
			left: OuterBlock<T>,
			right: OuterBlock<T>,
			middle: Inner<T, OuterBlock<T>> | null,
			length: number,
		): OuterTree<T> {
			return new OuterTree(mod, left, right, middle, length);
		},
		isOuterTree<T>(list: ListBase<T>): list is OuterTree<T> {
			return list instanceof OuterTree;
		},
		innerBlock<T, C extends Block<T>>(
			children: C[],
			length: number,
			level: number,
			sizes?: number[] | null,
		): InnerBlock<T, C> {
			return new InnerBlock(mod, children, length, level, undefined, sizes);
		},
		isInnerBlock<T, C extends Block<T>>(
			source: unknown,
		): source is InnerBlock<T, C> {
			return source instanceof InnerBlock;
		},
		innerTree<T, C extends Block<T>>(
			left: InnerBlock<T, C>,
			right: InnerBlock<T, C>,
			middle: Inner<T, InnerBlock<T, C>> | null,
			length: number,
			level: number,
		): InnerTree<T, C> {
			return new InnerTree(mod, left, right, middle, length, level);
		},
		isInnerTree<T, C extends Block<T>>(
			source: unknown,
		): source is InnerTree<T, C> {
			return source instanceof InnerTree;
		},
		isList<T>(source: unknown): source is ListBase<T, Tp> {
			return source instanceof ListEmpty || source instanceof OuterBase;
		},
		isContextList<T>(source: unknown): source is ListImpl<T, Tp> {
			if (mod.isList(source)) {
				return source.context === mod;
			}

			return false;
		},
	}));

	const builderModule = Module.createPartial<{
		defines: BuilderFactory<Tp>;
		requires: ListContext<Tp>;
	}>((mod) => ({
		createBuilder<T>(source?: ListBase<T>): ListBuilder<T> {
			if (undefined === source || source.isEmpty)
				return new ListBuilder<T>(mod);

			if (source.context !== mod) {
				throw new Error('Source list was created with a different context');
			}

			if (mod.isOuterBlock<T>(source)) {
				const builder = mod.outerBlockBuilderSource(source);
				return new ListBuilder<T>(mod, builder);
			}

			if (mod.isOuterTree<T>(source)) {
				const builder = mod.outerTreeBuilderSource<T>(source);
				return new ListBuilder<T>(mod, builder);
			}

			throwInvalidStateError();
		},
		outerBlockBuilderSource<T>(source: OuterBlock<T>): OuterBlockBuilder<T> {
			return new OuterBlockBuilder(mod, source);
		},
		outerBlockBuilder<T>(
			children: WithElem<Tp, T>['outerChildren'],
		): OuterBlockBuilder<T> {
			return new OuterBlockBuilder(mod, undefined, children);
		},
		isOuterBlockBuilder<T>(source: unknown): source is OuterBlockBuilder<T> {
			return source instanceof OuterBlockBuilder;
		},
		outerTreeBuilderSource<T>(source: OuterTree<T>): OuterTreeBuilder<T> {
			return new OuterTreeBuilder(mod, source);
		},
		outerTreeBuilder<T>(
			left: OuterBlockBuilder<T>,
			right: OuterBlockBuilder<T>,
			middle?: InnerBuilder<T, OuterBlockBuilder<T>>,
			length?: number,
		): OuterTreeBuilder<T> {
			return new OuterTreeBuilder(mod, undefined, left, right, middle, length);
		},
		isOuterTreeBuilder<T>(source: unknown): source is OuterTreeBuilder<T> {
			return source instanceof OuterTreeBuilder;
		},
		createInnerBuilder<T, C extends BlockBuilder<T>>(
			source: Inner<T, any>,
		): InnerBuilder<T, C> {
			if (mod.isInnerBlock<T, any>(source)) {
				return new InnerBlockBuilder(mod, source.level, source) as any;
			}
			if (mod.isInnerTree<T, any>(source)) {
				return new InnerTreeBuilder(mod, source.level, source) as any;
			}

			throwInvalidStateError();
		},
		innerBlockBuilderSource<T, C extends BlockBuilder<T>>(
			source: InnerBlock<T, ToImmutable<C>>,
		): InnerBlockBuilder<T, C> {
			return new InnerBlockBuilder(mod, source.level, source);
		},
		innerBlockBuilder<T, C extends BlockBuilder<T>>(
			level: number,
			children: Array<C>,
			length: number,
		): InnerBlockBuilder<T, C> {
			return new InnerBlockBuilder(mod, level, undefined, children, length);
		},
		isInnerBlockBuilder<T, C extends BlockBuilder<T>>(
			source: unknown,
		): source is InnerBlockBuilder<T, C> {
			return source instanceof InnerBlockBuilder;
		},
		innerTreeBuilderSource<T, C extends BlockBuilder<T>>(
			source: InnerTree<T, ToImmutable<C>>,
		): InnerTreeBuilder<T, C> {
			return new InnerTreeBuilder(mod, source.level, source);
		},
		innerTreeBuilder<T, C extends BlockBuilder<T>>(
			level: number,
			left: InnerBlockBuilder<T, C>,
			right: InnerBlockBuilder<T, C>,
			middle: InnerBuilder<T, InnerBlockBuilder<T, C>> | undefined,
			length: number,
		): InnerTreeBuilder<T, C> {
			return new InnerTreeBuilder(
				mod,
				level,
				undefined,
				left,
				right,
				middle,
				length,
			);
		},
		isInnerTreeBuilder<T, C extends BlockBuilder<T>>(
			source: unknown,
		): source is InnerTreeBuilder<T, C> {
			return source instanceof InnerTreeBuilder;
		},
	}));

	return Module.createPartial<{ defines: ListContextBase<Tp>; requires: C }>(
		(mod) => ({
			...immutableModule(mod),
			...builderModule(mod),
			blockSizeBits,
			minBlockSize: 1 << (blockSizeBits - 1),
			maxBlockSize: 1 << blockSizeBits,
			empty: Module.lazy(() => Object.freeze(new ListEmpty(mod))),
			of: <T>(...values: ArrayNonEmpty<T>): any => {
				if (values.length <= mod.maxBlockSize) {
					return mod.outerBlock<T>(mod.outerChildrenOps.of(values));
				}

				return mod.from<T>(values);
			},
			from: <T>(...sources: ArrayNonEmpty<StreamSource<T>>): any => {
				if (sources.length === 1) {
					const source = sources[0];
					if (mod.isContextList<T>(source)) {
						return source;
					}
				}

				let result: ListImpl<T, Tp> | null = null;

				let i = -1;
				const length = sources.length;

				while (++i < length) {
					const source = sources[i];

					if (!Stream.isEmptyStreamSourceInstance(source)) {
						if (mod.isContextList<T>(source)) {
							if (null === result) result = source;
							else result = result.concat(source) as ListImpl<T, Tp>;
						} else {
							const builder = mod.builder<T>();

							if (Array.isArray(source)) builder.appendArray(source);
							else builder.appendAll(source);

							if (!builder.isEmpty) {
								const build = builder.build() as ListImpl<T, Tp>;
								if (null === result) result = build;
								else result = result.concat(build) as ListImpl<T, Tp>;
							}
						}
					}
				}

				if (null === result) return mod.empty<T>() as ListImpl<T, Tp>;
				return result;
			},
			builder: () => mod.createBuilder(),
			reducer: <T>(source?: StreamSource<T>): Reducer<T, ListImpl<T, Tp>> => {
				return Reducer.create(
					() =>
						undefined === source
							? mod.builder<T>()
							: mod.from(source).toBuilder(),
					(builder, value) => {
						builder.append(value);
						return builder;
					},
					(builder) => builder.build() as ListImpl<T, Tp>,
				);
			},
			unzip: (source: any, options: { length: number }): any => {
				const streams = Stream.unzip(source, options) as any as Stream<any>[];

				return Stream.from(streams).mapPure(mod.from) as any;
			},
			flatten: (source: any): any => mod.from(source).flatMap((s: any) => s),
			cacheMap() {
				return new CacheMap();
			},
		}),
	);
}
