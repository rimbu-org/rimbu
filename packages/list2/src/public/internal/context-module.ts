import type { WithElem } from '@rimbu/collection-types/common';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { Block, NonLeaf } from './immutable/utils';
import type { NonLeafBuilder } from './mutable/builder-base';

import type { ListBase } from '#list/list-base';
import type { ListImpl } from '#list/list-impl';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';
import { Module } from '@rimbu/common/module';
import { Stream, type StreamSource } from '@rimbu/stream';

import { CacheMap } from '#list/immutable/cache-map';
import { ListEmpty } from '#list/immutable/empty';
import { LeafBlock } from '#list/immutable/leaf-block';
import { LeafTree } from '#list/immutable/leaf-tree';
import { NonLeafBlock } from '#list/immutable/non-leaf-block';
import { NonLeafTree } from '#list/immutable/non-leaf-tree';
import { ReversedLeafBlock } from '#list/immutable/reversed-leaf-block';
import { ListBuilder } from '#list/mutable/builder';
import { LeafBlockBuilder } from '#list/mutable/leaf-block-builder';
import { LeafTreeBuilder } from '#list/mutable/leaf-tree-builder';
import { NonLeafBlockBuilder } from '#list/mutable/non-leaf-block-builder';
import { NonLeafTreeBuilder } from '#list/mutable/non-leaf-tree-builder';

interface ImmutableFactory<Tp extends ListImpl.Types = ListImpl.Types> {
	leafBlock<T>(children: WithElem<Tp, T>['leafChildren']): LeafBlock<T>;
	isLeafBlock<T>(block: ListBase<T> | Block<T>): block is LeafBlock<T>;
	reversedLeafBlock<T>(children: WithElem<Tp, T>['leafChildren']): LeafBlock<T>;
	isReversedLeafBlock<T>(block: LeafBlock<T>): block is ReversedLeafBlock<T>;
	leafTree<T>(
		left: LeafBlock<T>,
		right: LeafBlock<T>,
		middle: NonLeaf<T> | null,
		length: number,
	): LeafTree<T>;
	nonLeafBlock<T>(
		children: Block<T>[],
		itemsLength: number,
		level: number,
	): NonLeafBlock<T>;
	isNonLeafBlock<T>(source: unknown): source is NonLeafBlock<T>;
	nonLeafTree<T>(
		left: NonLeafBlock<T>,
		right: NonLeafBlock<T>,
		middle: NonLeaf<T> | null,
		itemsLength: number,
		level: number,
	): NonLeafTree<T>;
	isNonLeafTree<T>(source: unknown): source is NonLeafTree<T>;
	isLeafTree<T>(list: ListBase<T>): list is LeafTree<T>;
	isList<T>(source: unknown): source is ListBase<T, Tp>;
	isContextList<T>(source: unknown): source is ListImpl<T, Tp>;
}

interface BuilderFactory<Tp extends ListImpl.Types = ListImpl.Types> {
	createBuilder<T>(source?: ListBase<T>): ListBuilder<T>;
	leafBlockBuilderSource<T>(source: LeafBlock<T>): LeafBlockBuilder<T>;
	leafBlockBuilder<T>(
		children: WithElem<Tp, T>['leafChildren'],
	): LeafBlockBuilder<T>;
	isLeafBlockBuilder<T>(source: unknown): source is LeafBlockBuilder<T>;
	leafTreeBuilderSource<T>(source: LeafTree<T>): LeafTreeBuilder<T>;
	leafTreeBuilder<T>(
		left: LeafBlockBuilder<T>,
		right: LeafBlockBuilder<T>,
		middle?: NonLeafBuilder<T>,
		length?: number,
	): LeafTreeBuilder<T>;
	isLeafTreeBuilder<T>(source: unknown): source is LeafTreeBuilder<T>;
	createNonLeafBuilder<T>(source: NonLeaf<T>): NonLeafBuilder<T>;
	nonLeafBlockBuilderSource<T>(source: NonLeafBlock<T>): NonLeafBlockBuilder<T>;
	nonLeafBlockBuilder<T>(
		level: number,
		children: Array<LeafBlockBuilder<T>>,
		itemsLength: number,
	): NonLeafBlockBuilder<T>;
	nonLeafTreeBuilderSource<T>(source: NonLeafTree<T>): NonLeafTreeBuilder<T>;
	nonLeafTreeBuilder<T>(
		level: number,
		left: NonLeafBlockBuilder<T>,
		right: NonLeafBlockBuilder<T>,
		middle: NonLeafBuilder<T>,
		itemsLength: number,
	): NonLeafTreeBuilder<T>;
}

export interface ListContextBase<Tp extends ListImpl.Types = ListImpl.Types>
	extends ListBase.Context<Tp>,
		ImmutableFactory<Tp>,
		BuilderFactory<Tp> {
	cacheMap(): CacheMap;
}

export interface ListContext<Tp extends ListImpl.Types = ListImpl.Types>
	extends ListContextBase<Tp> {
	readonly leafChildrenOps: ListImpl.LeafChildrenOps<Tp>;
}

// function createListContextModule<
// 	Tp extends ListImpl.Types = ListImpl.Types,
// 	C extends ListContext<Tp> = ListContext<Tp>,
// >(
// 	options: { blockSizeBits?: number | undefined } | undefined = {},
// 	createLeafChildrenOps: (options: {
// 		blockSizeBits: number;
// 	}) => ListImpl.LeafChildrenOps<Tp>,
// ): (mod: C) => Module.Definition<ListContext<Tp>> {
// 	const { blockSizeBits = 2 } = options;

// 	const immutableModule = Module.createPartial<{
// 		defines: ImmutableFactory;
// 		requires: ListContext<Tp>;
// 	}>((mod) => ({
// 		leafBlock<T>(children: WithElem<Tp, T>['leafChildren']): LeafBlock<T> {
// 			return new LeafBlock(mod, children);
// 		},
// 		isLeafBlock<T>(block: ListBase<T> | Block<T>): block is LeafBlock<T> {
// 			return block instanceof LeafBlock;
// 		},
// 		reversedLeafBlock<T>(
// 			children: WithElem<Tp, T>['leafChildren'],
// 		): LeafBlock<T> {
// 			return new ReversedLeafBlock(mod, children);
// 		},
// 		isReversedLeafBlock<T>(block: LeafBlock<T>): block is ReversedLeafBlock<T> {
// 			return block instanceof ReversedLeafBlock;
// 		},
// 		leafTree<T>(
// 			left: LeafBlock<T>,
// 			right: LeafBlock<T>,
// 			middle: NonLeaf<T> | null,
// 			length: number,
// 		): LeafTree<T> {
// 			return new LeafTree(mod, left, right, middle, length);
// 		},
// 		isLeafTree<T>(list: ListBase<T>): list is LeafTree<T> {
// 			return list instanceof LeafTree;
// 		},
// 		nonLeafBlock<T>(
// 			children: Block<T>[],
// 			itemsLength: number,
// 			level: number,
// 		): NonLeafBlock<T> {
// 			return new NonLeafBlock(mod, children, itemsLength, level);
// 		},
// 		isNonLeafBlock<T>(source: unknown): source is NonLeafBlock<T> {
// 			return source instanceof NonLeafBlock;
// 		},
// 		nonLeafTree<T>(
// 			left: NonLeafBlock<T>,
// 			right: NonLeafBlock<T>,
// 			middle: NonLeaf<T> | null,
// 			itemsLength: number,
// 			level: number,
// 		): NonLeafTree<T> {
// 			return new NonLeafTree(mod, left, right, middle, itemsLength, level);
// 		},
// 		isNonLeafTree<T>(source: unknown): source is NonLeafTree<T> {
// 			return source instanceof NonLeafTree;
// 		},
// 		isList<T>(source: unknown): source is ListBase<T> {
// 			return source instanceof ListEmpty || source instanceof LeafBlock;
// 		},
// 		isContextList<T>(source: unknown): source is ListImpl<T> {
// 			if (mod.isList(source)) {
// 				return source.context === mod;
// 			}

// 			return false;
// 		},
// 	}));

// 	const builderModule = Module.createPartial<{
// 		defines: BuilderFactory<Tp>;
// 		requires: ListContext<Tp>;
// 	}>((mod) => ({
// 		createBuilder<T>(source?: ListBase<T>): ListBuilder<T> {
// 			if (undefined === source || source.isEmpty)
// 				return new ListBuilder<T>(mod);

// 			if (source.context !== mod) {
// 				throw new Error('Source list was created with a different context');
// 			}

// 			if (mod.isLeafBlock<T>(source)) {
// 				const builder = mod.leafBlockBuilderSource(source);
// 				return new ListBuilder<T>(mod, builder);
// 			}

// 			if (mod.isLeafTree<T>(source)) {
// 				const builder = mod.leafTreeBuilderSource<T>(source);
// 				return new ListBuilder<T>(mod, builder);
// 			}

// 			throwInvalidStateError();
// 		},
// 		leafBlockBuilderSource<T>(source: LeafBlock<T>): LeafBlockBuilder<T> {
// 			return new LeafBlockBuilder(mod, source);
// 		},
// 		leafBlockBuilder<T>(
// 			children: WithElem<Tp, T>['leafChildren'],
// 		): LeafBlockBuilder<T> {
// 			return new LeafBlockBuilder(mod, undefined, children);
// 		},
// 		isLeafBlockBuilder<T>(source: unknown): source is LeafBlockBuilder<T> {
// 			return source instanceof LeafBlockBuilder;
// 		},
// 		leafTreeBuilderSource<T>(source: LeafTree<T>): LeafTreeBuilder<T> {
// 			return new LeafTreeBuilder(mod, source);
// 		},
// 		leafTreeBuilder<T>(
// 			left: LeafBlockBuilder<T>,
// 			right: LeafBlockBuilder<T>,
// 			middle?: NonLeafBuilder<T>,
// 			length?: number,
// 		): LeafTreeBuilder<T> {
// 			return new LeafTreeBuilder(mod, undefined, left, right, middle, length);
// 		},
// 		isLeafTreeBuilder<T>(source: unknown): source is LeafTreeBuilder<T> {
// 			return source instanceof LeafTreeBuilder;
// 		},
// 		createNonLeafBuilder<T>(source: NonLeaf<T>): NonLeafBuilder<T> {
// 			if (mod.isNonLeafBlock<T>(source)) {
// 				return new NonLeafBlockBuilder(mod, source.level, source);
// 			}
// 			if (mod.isNonLeafTree<T>(source)) {
// 				return new NonLeafTreeBuilder(mod, source.level, source);
// 			}

// 			throwInvalidStateError();
// 		},
// 		nonLeafBlockBuilderSource<T>(
// 			source: NonLeafBlock<T>,
// 		): NonLeafBlockBuilder<T> {
// 			return new NonLeafBlockBuilder(mod, source.level, source);
// 		},
// 		nonLeafBlockBuilder<T>(
// 			level: number,
// 			children: Array<WithElem<Tp, T>['leafChildren']>,
// 			itemsLength: number,
// 		): NonLeafBlockBuilder<T> {
// 			return new NonLeafBlockBuilder(
// 				mod,
// 				level,
// 				undefined,
// 				children,
// 				itemsLength,
// 			);
// 		},
// 		nonLeafTreeBuilderSource<T>(source: NonLeafTree<T>): NonLeafTreeBuilder<T> {
// 			return new NonLeafTreeBuilder(mod, source.level, source);
// 		},
// 		nonLeafTreeBuilder<T>(
// 			level: number,
// 			left: NonLeafBlockBuilder<T>,
// 			right: NonLeafBlockBuilder<T>,
// 			middle: NonLeafBuilder<T>,
// 			itemsLength: number,
// 		): NonLeafTreeBuilder<T> {
// 			return new NonLeafTreeBuilder(
// 				mod,
// 				level,
// 				undefined,
// 				left,
// 				right,
// 				middle,
// 				itemsLength,
// 			);
// 		},
// 	}));

// 	return Module.createPartial<{ defines: ListContext<Tp>; requires: C }>(
// 		(mod) => ({
// 			...immutableModule(mod),
// 			...builderModule(mod),
// 			minBlockSize: 1 << (blockSizeBits - 1),
// 			maxBlockSize: 1 << blockSizeBits,
// 			createContext: (options) =>
// 				createListContextModule(options, createLeafChildrenOps).build(),
// 			empty: Module.lazy(() => Object.freeze(new ListEmpty<any>(mod))),
// 			of: <T>(...values: ArrayNonEmpty<T>): ListImpl.NonEmpty<T> => {
// 				if (values.length <= mod.maxBlockSize) {
// 					return mod.leafBlock<T>(mod.leafChildrenOps.of(values));
// 				}

// 				return mod.from(values).assumeNonEmpty();
// 			},
// 			from: <T>(...sources: ArrayNonEmpty<StreamSource<T>>): ListImpl<T> => {
// 				if (sources.length === 1) {
// 					const source = sources[0];
// 					if (mod.isContextList<T>(source)) return source;
// 				}

// 				let result: ListImpl<T> | null = null;

// 				let i = -1;
// 				const length = sources.length;

// 				while (++i < length) {
// 					const source = sources[i];

// 					if (!Stream.isEmptyStreamSourceInstance(source)) {
// 						if (mod.isContextList<T>(source)) {
// 							if (null === result) result = source;
// 							else result = result.concat(source);
// 						} else {
// 							const builder = mod.builder<T>();

// 							if (Array.isArray(source)) builder.appendArray(source);
// 							else builder.appendAll(source);

// 							if (!builder.isEmpty) {
// 								const build = builder.build();
// 								if (null === result) result = build;
// 								else result = result.concat(build);
// 							}
// 						}
// 					}
// 				}

// 				if (null === result) return mod.empty();
// 				return result;
// 			},
// 			builder: 0 as any,
// 			leafChildrenOps: Module.lazyGetter(() =>
// 				createLeafChildrenOps({ blockSizeBits }),
// 			),
// 			cacheMap() {
// 				return new CacheMap();
// 			},
// 		}),
// 	);
// }

export function createContextModule<
	C extends ListContext<Tp>,
	Tp extends ListImpl.Types = ListImpl.Types,
>(
	options: { blockSizeBits?: number | undefined } | undefined = {},
): (mod: C) => Module.Definition<ListContextBase<Tp>> {
	const { blockSizeBits = 2 } = options;

	const immutableModule = Module.createPartial<{
		defines: ImmutableFactory<Tp>;
		requires: ListContext<Tp>;
	}>((mod) => ({
		leafBlock<T>(children: WithElem<Tp, T>['leafChildren']): LeafBlock<T> {
			return new LeafBlock(mod, children);
		},
		isLeafBlock<T>(block: ListBase<T> | Block<T>): block is LeafBlock<T> {
			return block instanceof LeafBlock;
		},
		reversedLeafBlock<T>(
			children: WithElem<Tp, T>['leafChildren'],
		): LeafBlock<T> {
			return new ReversedLeafBlock(mod, children);
		},
		isReversedLeafBlock<T>(block: LeafBlock<T>): block is ReversedLeafBlock<T> {
			return block instanceof ReversedLeafBlock;
		},
		leafTree<T>(
			left: LeafBlock<T>,
			right: LeafBlock<T>,
			middle: NonLeaf<T> | null,
			length: number,
		): LeafTree<T> {
			return new LeafTree(mod, left, right, middle, length);
		},
		isLeafTree<T>(list: ListBase<T>): list is LeafTree<T> {
			return list instanceof LeafTree;
		},
		nonLeafBlock<T>(
			children: Block<T>[],
			itemsLength: number,
			level: number,
		): NonLeafBlock<T> {
			return new NonLeafBlock(mod, children, itemsLength, level);
		},
		isNonLeafBlock<T>(source: unknown): source is NonLeafBlock<T> {
			return source instanceof NonLeafBlock;
		},
		nonLeafTree<T>(
			left: NonLeafBlock<T>,
			right: NonLeafBlock<T>,
			middle: NonLeaf<T> | null,
			itemsLength: number,
			level: number,
		): NonLeafTree<T> {
			return new NonLeafTree(mod, left, right, middle, itemsLength, level);
		},
		isNonLeafTree<T>(source: unknown): source is NonLeafTree<T> {
			return source instanceof NonLeafTree;
		},
		isList<T>(source: unknown): source is ListBase<T, Tp> {
			return source instanceof ListEmpty || source instanceof LeafBlock;
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

			if (mod.isLeafBlock<T>(source)) {
				const builder = mod.leafBlockBuilderSource(source);
				return new ListBuilder<T>(mod, builder);
			}

			if (mod.isLeafTree<T>(source)) {
				const builder = mod.leafTreeBuilderSource<T>(source);
				return new ListBuilder<T>(mod, builder);
			}

			throwInvalidStateError();
		},
		leafBlockBuilderSource<T>(source: LeafBlock<T>): LeafBlockBuilder<T> {
			return new LeafBlockBuilder(mod, source);
		},
		leafBlockBuilder<T>(
			children: WithElem<Tp, T>['leafChildren'],
		): LeafBlockBuilder<T> {
			return new LeafBlockBuilder(mod, undefined, children);
		},
		isLeafBlockBuilder<T>(source: unknown): source is LeafBlockBuilder<T> {
			return source instanceof LeafBlockBuilder;
		},
		leafTreeBuilderSource<T>(source: LeafTree<T>): LeafTreeBuilder<T> {
			return new LeafTreeBuilder(mod, source);
		},
		leafTreeBuilder<T>(
			left: LeafBlockBuilder<T>,
			right: LeafBlockBuilder<T>,
			middle?: NonLeafBuilder<T>,
			length?: number,
		): LeafTreeBuilder<T> {
			return new LeafTreeBuilder(mod, undefined, left, right, middle, length);
		},
		isLeafTreeBuilder<T>(source: unknown): source is LeafTreeBuilder<T> {
			return source instanceof LeafTreeBuilder;
		},
		createNonLeafBuilder<T>(source: NonLeaf<T>): NonLeafBuilder<T> {
			if (mod.isNonLeafBlock<T>(source)) {
				return new NonLeafBlockBuilder(mod, source.level, source);
			}
			if (mod.isNonLeafTree<T>(source)) {
				return new NonLeafTreeBuilder(mod, source.level, source);
			}

			throwInvalidStateError();
		},
		nonLeafBlockBuilderSource<T>(
			source: NonLeafBlock<T>,
		): NonLeafBlockBuilder<T> {
			return new NonLeafBlockBuilder(mod, source.level, source);
		},
		nonLeafBlockBuilder<T>(
			level: number,
			children: Array<LeafBlockBuilder<T>>,
			itemsLength: number,
		): NonLeafBlockBuilder<T> {
			return new NonLeafBlockBuilder(
				mod,
				level,
				undefined,
				children,
				itemsLength,
			);
		},
		nonLeafTreeBuilderSource<T>(source: NonLeafTree<T>): NonLeafTreeBuilder<T> {
			return new NonLeafTreeBuilder(mod, source.level, source);
		},
		nonLeafTreeBuilder<T>(
			level: number,
			left: NonLeafBlockBuilder<T>,
			right: NonLeafBlockBuilder<T>,
			middle: NonLeafBuilder<T>,
			itemsLength: number,
		): NonLeafTreeBuilder<T> {
			return new NonLeafTreeBuilder(
				mod,
				level,
				undefined,
				left,
				right,
				middle,
				itemsLength,
			);
		},
	}));

	return Module.createPartial<{ defines: ListContextBase<Tp>; requires: C }>(
		(mod) => ({
			...immutableModule(mod),
			...builderModule(mod),
			blockSizeBits,
			minBlockSize: 1 << (blockSizeBits - 1),
			maxBlockSize: 1 << blockSizeBits,
			empty: Module.lazy(() => Object.freeze(new ListEmpty<any>(mod))),
			of: <T>(...values: ArrayNonEmpty<T>): any => {
				if (values.length <= mod.maxBlockSize) {
					return mod.leafBlock<T>(mod.leafChildrenOps.of(values));
				}

				return mod.from<T>(values);
			},
			from: <T>(...sources: ArrayNonEmpty<StreamSource<T>>): any => {
				if (sources.length === 1) {
					const source = sources[0];
					if (mod.isContextList<T>(source)) return source;
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
			cacheMap() {
				return new CacheMap();
			},
		}),
	);
}
