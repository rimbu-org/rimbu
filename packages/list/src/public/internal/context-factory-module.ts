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
import { StreamFactory } from '@rimbu/stream/internal/factory';
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

const createImmutableFactory = Module.createPartial<
	ImmutableFactory,
	ContextFactory
>((mod) => ({
	_emptyInstance: Module.lazy(() => Object.freeze(new Empty(mod) as List<any>)),
	leafBlock: Module.factory(
		<T>(children: readonly T[]): LeafBlock<T> => new LeafBlock(mod, children),
	),
	reversedLeaf: Module.factory(
		<T>(children: readonly T[]): ReversedLeafBlock<T> =>
			new ReversedLeafBlock(mod, children),
	),
	leafTree: Module.factory(
		<T>(
			left: LeafBlock<T>,
			right: LeafBlock<T>,
			middle: NonLeaf<T, LeafBlock<T>> | null,
		): LeafTree<T> => new LeafTree(mod, left, right, middle),
	),
	nonLeafBlock: Module.factory(
		<T, C extends Block<T, C>>(
			length: number,
			children: readonly C[],
			level: number,
		): NonLeafBlock<T, C> => {
			return new NonLeafBlock(mod, length, children, level);
		},
	),
	nonLeafTree: Module.factory(
		<T, C extends Block<T, C>>(
			left: NonLeafBlock<T, C>,
			right: NonLeafBlock<T, C>,
			middle: NonLeaf<T, NonLeafBlock<T, C>> | null,
			level: number,
		): NonLeafTree<T, C> => {
			return new NonLeafTree(mod, left, right, middle, level);
		},
	),
	isLeafBlock: Module.factory(
		<T>(obj: List<T> | Block<T>): obj is LeafBlock<T> => {
			return obj instanceof LeafBlock;
		},
	),
	isReversedLeafBlock: Module.factory(
		<T>(obj: List<T> | Block<T>): obj is ReversedLeafBlock<T> => {
			return obj instanceof ReversedLeafBlock;
		},
	),
	isNonLeafBlock: Module.factory(
		<T>(obj: List<T> | Block<T> | NonLeaf<T>): obj is NonLeafBlock<T, any> => {
			return obj instanceof NonLeafBlock;
		},
	),
	isLeafTree: Module.factory(<T>(obj: List<T>): obj is LeafTree<T> => {
		return obj instanceof LeafTree;
	}),
	isNonLeafTree: Module.factory(
		<T>(obj: NonLeaf<T>): obj is NonLeafTree<T, any> => {
			return obj instanceof NonLeafTree;
		},
	),
}));

const createBuilderFactory = Module.createPartial<
	BuilderFactory,
	ContextFactory
>((mod) => ({
	builder: Module.factory(<T>(): GenBuilder<T> => {
		return new GenBuilder<T>(mod);
	}),
	createBuilder: Module.factory(<T>(source?: List<T>): GenBuilder<T> => {
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
	}),
	leafBlockBuilderSource: Module.factory(
		<T>(source: LeafBlock<T>): LeafBlockBuilder<T> => {
			return new LeafBlockBuilder(mod, source);
		},
	),
	leafBlockBuilder: Module.factory(<T>(children: T[]): LeafBlockBuilder<T> => {
		return new LeafBlockBuilder(mod, undefined, children);
	}),
	leafTreeBuilderSource: Module.factory(
		<T>(source: LeafTree<T>): LeafTreeBuilder<T> => {
			return new LeafTreeBuilder(mod, source);
		},
	),
	leafTreeBuilder: Module.factory(
		<T>(
			left: LeafBlockBuilder<T>,
			right: LeafBlockBuilder<T>,
			middle?: NonLeafBuilder<T, LeafBlockBuilder<T>>,
			length?: number,
		): LeafTreeBuilder<T> => {
			return new LeafTreeBuilder(mod, undefined, left, right, middle, length);
		},
	),
	nonLeafBlockBuilderSource: Module.factory(
		<T, C extends BlockBuilder<T>>(
			source: NonLeafBlock<T, any>,
		): NonLeafBlockBuilder<T, C> => {
			return new NonLeafBlockBuilder(mod, source.level, source);
		},
	),
	nonLeafBlockBuilder: Module.factory(
		<T, C extends BlockBuilder<T>>(
			level: number,
			children: C[],
			length: number,
		): NonLeafBlockBuilder<T, C> => {
			return new NonLeafBlockBuilder(mod, level, undefined, children, length);
		},
	),
	nonLeafTreeBuilderSource: Module.factory(
		<T, C extends BlockBuilder<T>>(
			source: NonLeafTree<T, any>,
		): NonLeafTreeBuilder<T, C> => {
			return new NonLeafTreeBuilder(mod, source.level, source);
		},
	),
	nonLeafTreeBuilder: Module.factory(
		<T, C extends BlockBuilder<T>>(
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
	),
	isLeafBlockBuilder: Module.factory(
		<T>(obj: LeafBuilder<T>): obj is LeafBlockBuilder<T> => {
			return obj instanceof LeafBlockBuilder;
		},
	),
	isLeafTreeBuilder: Module.factory(
		<T>(obj: LeafBuilder<T>): obj is LeafTreeBuilder<T> => {
			return obj instanceof LeafTreeBuilder;
		},
	),
	isNonLeafBlockBuilder: Module.factory(
		<T>(obj: NonLeafBuilder<T, any>): obj is NonLeafBlockBuilder<T, any> => {
			return obj instanceof NonLeafBlockBuilder;
		},
	),
}));

const createListCreators = Module.createPartial<
	Omit<ListCreators, 'builder'>,
	ContextFactory
>((mod) => ({
	empty: Module.factory(<T>() => mod._emptyInstance as List<T>),
	of: Module.factory(<T>(...values: ArrayNonEmpty<T>): List.NonEmpty<T> => {
		if (values.length <= mod.maxBlockSize) {
			return mod.leafBlock<T>(values);
		}
		return mod.from(values);
	}),
	from: Module.factory(<T>(...sources: ArrayNonEmpty<StreamSource<T>>): any => {
		if (sources.length === 1) {
			const source = sources[0];
			if ((source as any).context === mod) return source;
		}

		let result: List<T> | null = null;

		let i = -1;
		const length = sources.length;

		while (++i < length) {
			const source = sources[i];

			if (!StreamFactory().isEmptyStreamSourceInstance(source)) {
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
	}),
	fromString: Module.factory((...sources: ArrayNonEmpty<string>): any => {
		return mod.from(...sources);
	}),
	flatten: Module.factory((source: any): any =>
		mod.from(source).flatMap((s: any) => s),
	),
	unzip: Module.factory((source: any, options: { length: number }): any => {
		const streams = Stream.unzip(source, options) as any as Stream<any>[];

		return Stream.from(streams).mapPure(mod.from) as any;
	}),
	builder: Module.factory(<T>(): GenBuilder<T> => {
		return new GenBuilder<T>(mod);
	}),
	reducer: Module.factory(
		<T>(source?: StreamSource<T>): Reducer<T, List<T>> => {
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
	),
	createContext: Module.factory((options) =>
		createContextFactoryModule(options).build(),
	),
	defaultContext: Module.factory(() => mod),
}));

const DEFAULT_BLOCK_SIZE_BITS = 5;
const MIN_BLOCK_SIZE_BITS = 2;

export function createContextFactoryModule(
	options: { blockSizeBits?: number | undefined } = {},
): Module<ContextFactory> {
	const { blockSizeBits = DEFAULT_BLOCK_SIZE_BITS } = options;

	if (blockSizeBits < MIN_BLOCK_SIZE_BITS) {
		RimbuError.throwInvalidUsageError(
			'List: blockSizeBits should be at least 2',
		);
	}

	return Module.create<ContextFactory>((mod) => ({
		...createImmutableFactory(mod),
		...createBuilderFactory(mod),
		...createListCreators(mod),

		_types: Module.constant(undefined as any),
		typeTag: Module.constant('List' as const),
		blockSizeBits: Module.constant(blockSizeBits),
		maxBlockSize: Module.constant(1 << blockSizeBits),
		minBlockSize: Module.constant(1 << (blockSizeBits - 1)),

		createCacheMap: Module.factory((): CacheMap => {
			return new CacheMap();
		}),
	}));
}
