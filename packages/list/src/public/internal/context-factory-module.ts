import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { List } from '@rimbu/list';

import type {
	BlockBuilder,
	LeafBuilder,
	NonLeafBuilder,
} from '#list/builder/types';
import type {
	BuilderFactory,
	ContextFactory,
	ImmutableFactory,
} from '#list/context-factory';
import type { Block, NonLeaf } from '#list/immutable/types';
import type { ListCreators } from '#private/list-factory';

import * as RimbuError from '@rimbu/base/rimbu-error';
import { Module } from '@rimbu/common/module';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { GenBuilder } from '#list/builder/generic';
import { LeafBlockBuilder } from '#list/builder/leaf/block';
import { LeafTreeBuilder } from '#list/builder/leaf/tree';
import { NonLeafBlockBuilder } from '#list/builder/nonleaf/block';
import { NonLeafTreeBuilder } from '#list/builder/nonleaf/tree';
import { CacheMap } from '#list/immutable/cache-map';
import { Empty } from '#list/immutable/empty';
import { LeafBlock, ReversedLeafBlock } from '#list/immutable/leaf/block';
import { LeafTree } from '#list/immutable/leaf/tree';
import { NonLeafBlock } from '#list/immutable/nonleaf/block';
import { NonLeafTree } from '#list/immutable/nonleaf/tree';

const DEFAULT_BLOCK_SIZE_BITS = 5;
const MIN_BLOCK_SIZE_BITS = 2;

export function createContextFactoryModule(
	options: { blockSizeBits?: number | undefined } = {},
	_defaultContextInstance: ContextFactory | undefined = undefined,
): Module<ContextFactory> {
	const immutableFactory = Module.createPartial<{
		defines: ImmutableFactory;
		requires: ContextFactory;
	}>((mod) => ({
		leafBlock: <T>(children: readonly T[]): LeafBlock<T> =>
			new LeafBlock(mod, children),
		reversedLeaf: <T>(children: readonly T[]): ReversedLeafBlock<T> =>
			new ReversedLeafBlock(mod, children),
		leafTree: <T>(
			left: LeafBlock<T>,
			right: LeafBlock<T>,
			middle: NonLeaf<T, LeafBlock<T>> | null,
		): LeafTree<T> => new LeafTree(mod, left, right, middle),
		nonLeafBlock: <T, C extends Block<T, C>>(
			length: number,
			children: readonly C[],
			level: number,
		): NonLeafBlock<T, C> => {
			return new NonLeafBlock(mod, length, children, level);
		},
		nonLeafTree: <T, C extends Block<T, C>>(
			left: NonLeafBlock<T, C>,
			right: NonLeafBlock<T, C>,
			middle: NonLeaf<T, NonLeafBlock<T, C>> | null,
			level: number,
		): NonLeafTree<T, C> => {
			return new NonLeafTree(mod, left, right, middle, level);
		},
		isLeafBlock: <T>(obj: List<T> | Block<T>): obj is LeafBlock<T> => {
			return obj instanceof LeafBlock;
		},
		isReversedLeafBlock: <T>(
			obj: List<T> | Block<T>,
		): obj is ReversedLeafBlock<T> => {
			return obj instanceof ReversedLeafBlock;
		},
		isNonLeafBlock: <T>(
			obj: List<T> | Block<T> | NonLeaf<T>,
		): obj is NonLeafBlock<T, any> => {
			return obj instanceof NonLeafBlock;
		},
		isLeafTree: <T>(obj: List<T>): obj is LeafTree<T> => {
			return obj instanceof LeafTree;
		},
		isNonLeafTree: <T>(obj: NonLeaf<T>): obj is NonLeafTree<T, any> => {
			return obj instanceof NonLeafTree;
		},
	}));

	const builderFactory = Module.createPartial<{
		defines: BuilderFactory;
		requires: ContextFactory;
	}>((mod) => ({
		builder: <T>(): GenBuilder<T> => {
			return new GenBuilder<T>(mod);
		},
		createBuilder: <T>(source?: List<T>): GenBuilder<T> => {
			if (undefined === source || source.isEmpty) return new GenBuilder<T>(mod);

			const context = source.context as ContextFactory;

			if (context.isLeafBlock(source)) {
				const builder = mod.leafBlockBuilderSource<T>(source);
				return new GenBuilder<T>(mod, builder);
			}

			if (context.isLeafTree(source)) {
				const builder = mod.leafTreeBuilderSource<T>(source);
				return new GenBuilder<T>(mod, builder);
			}

			RimbuError.throwInvalidStateError();
		},
		leafBlockBuilderSource: <T>(source: LeafBlock<T>): LeafBlockBuilder<T> => {
			return new LeafBlockBuilder(mod, source);
		},
		leafBlockBuilder: <T>(children: T[]): LeafBlockBuilder<T> => {
			return new LeafBlockBuilder(mod, undefined, children);
		},
		leafTreeBuilderSource: <T>(source: LeafTree<T>): LeafTreeBuilder<T> => {
			return new LeafTreeBuilder(mod, source);
		},
		leafTreeBuilder: <T>(
			left: LeafBlockBuilder<T>,
			right: LeafBlockBuilder<T>,
			middle?: NonLeafBuilder<T, LeafBlockBuilder<T>>,
			length?: number,
		): LeafTreeBuilder<T> => {
			return new LeafTreeBuilder(mod, undefined, left, right, middle, length);
		},
		nonLeafBlockBuilderSource: <T, C extends BlockBuilder<T>>(
			source: NonLeafBlock<T, any>,
		): NonLeafBlockBuilder<T, C> => {
			return new NonLeafBlockBuilder(mod, source.level, source);
		},
		nonLeafBlockBuilder: <T, C extends BlockBuilder<T>>(
			level: number,
			children: C[],
			length: number,
		): NonLeafBlockBuilder<T, C> => {
			return new NonLeafBlockBuilder(mod, level, undefined, children, length);
		},
		nonLeafTreeBuilderSource: <T, C extends BlockBuilder<T>>(
			source: NonLeafTree<T, any>,
		): NonLeafTreeBuilder<T, C> => {
			return new NonLeafTreeBuilder(mod, source.level, source);
		},
		nonLeafTreeBuilder: <T, C extends BlockBuilder<T>>(
			level: number,
			left: NonLeafBlockBuilder<T, C>,
			right: NonLeafBlockBuilder<T, C>,
			middle?: NonLeafBuilder<T, NonLeafBlockBuilder<T, C>>,
			length?: number,
		): NonLeafTreeBuilder<T, C> => {
			return new NonLeafTreeBuilder(
				mod,
				level,
				undefined,
				left,
				right,
				middle,
				length,
			);
		},
		isLeafBlockBuilder: <T>(
			obj: LeafBuilder<T>,
		): obj is LeafBlockBuilder<T> => {
			return obj instanceof LeafBlockBuilder;
		},
		isLeafTreeBuilder: <T>(obj: LeafBuilder<T>): obj is LeafTreeBuilder<T> => {
			return obj instanceof LeafTreeBuilder;
		},
		isNonLeafBlockBuilder: <T>(
			obj: NonLeafBuilder<T, any>,
		): obj is NonLeafBlockBuilder<T, any> => {
			return obj instanceof NonLeafBlockBuilder;
		},
	}));

	const listCreators = Module.createPartial<{
		defines: Omit<ListCreators, 'builder' | 'defaultContext'>;
		requires: ContextFactory;
	}>((mod) => ({
		empty: Module.lazy(() => Object.freeze(new Empty(mod))),
		of: <T>(...values: ArrayNonEmpty<T>): List.NonEmpty<T> => {
			if (values.length <= mod.maxBlockSize) {
				return mod.leafBlock<T>(values);
			}
			return mod.from(values);
		},
		from: <T>(...sources: ArrayNonEmpty<StreamSource<T>>): any => {
			if (sources.length === 1) {
				const source = sources[0];
				if ((source as any).context === mod) return source;
			}

			let result: List<T> | null = null;

			let i = -1;
			const length = sources.length;

			while (++i < length) {
				const source = sources[i];

				if (!Stream.isEmptyStreamSourceInstance(source)) {
					if ((source as any).context === mod) {
						if (null === result) result = source as any as List<T>;
						else result = result.concat<T>(source);
					} else {
						const builder = mod.builder<T>();

						if (Array.isArray(source)) builder.appendArray(source);
						else builder.appendAll(source);

						if (!builder.isEmpty) {
							const build = builder.build();
							if (null === result) result = build;
							else result = result.concat<T>(build);
						}
					}
				}
			}

			if (null === result) return mod.empty();
			return result;
		},
		fromString: (...sources: ArrayNonEmpty<string>): any => {
			return mod.from(...sources);
		},
		flatten: (source: any): any => mod.from(source).flatMap((s: any) => s),
		unzip: (source: any, options: { length: number }): any => {
			const streams = Stream.unzip(source, options) as any as Stream<any>[];

			return Stream.from(streams).mapPure(mod.from) as any;
		},
		builder: <T>(): GenBuilder<T> => new GenBuilder<T>(mod),
		reducer: <T>(source?: StreamSource<T>): Reducer<T, List<T>> => {
			return Reducer.create(
				() =>
					undefined === source
						? mod.builder<T>()
						: mod.from(source).toBuilder(),
				(builder, value) => {
					builder.append(value);
					return builder;
				},
				(builder) => builder.build(),
			);
		},
		createContext: (options) =>
			createContextFactoryModule(options, mod).build(),
	}));

	const { blockSizeBits = DEFAULT_BLOCK_SIZE_BITS } = options;

	if (blockSizeBits < MIN_BLOCK_SIZE_BITS) {
		RimbuError.throwInvalidUsageError(
			'List: blockSizeBits should be at least 2',
		);
	}

	return Module.create<ContextFactory>((mod) => ({
		...immutableFactory(mod),
		...builderFactory(mod),
		...listCreators(mod),

		defaultContext: Module.lazy(() => _defaultContextInstance ?? mod),
		_types: undefined as any,
		typeTag: 'List',

		blockSizeBits: blockSizeBits,
		maxBlockSize: 1 << blockSizeBits,
		minBlockSize: 1 << (blockSizeBits - 1),

		createCacheMap: (): CacheMap => new CacheMap(),
	}));
}
