import type { Collection } from '@rimbu/collection-types/collection';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { List } from '@rimbu/list';
import type { Reducer } from '@rimbu/stream/reducer';

import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';
import type { ListNonEmptyBase } from '#advanced/immutable/non-empty-base';
import type { Block, Inner, Self } from '#list/immutable/common';
import type {
	BlockBuilder,
	InnerBuilder,
	OuterBuilder,
} from '#list/mutable/common';
import type { SizeTable } from '#list/size-table';

import { defaultReducerByAppend } from '@rimbu/collection-types/advanced/collection/indexed-base';
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

export class ListContext<
	F extends List.Advanced.Family<any> = List.Advanced.Family<any>,
> implements List.Advanced.ContextApi<F>
{
	static createDefault<
		F extends List.Advanced.Family<any> = List.Advanced.Family<any>,
	>(
		blockSizeBits: number,
		createChildrenOps: (blockSizeBits: number) => ChildrenOps,
	): ListContext<F> {
		const result: ListContext<F> = new ListContext(
			blockSizeBits,
			createChildrenOps,
			() => result,
		);

		return result;
	}

	private constructor(
		readonly blockSizeBits: number,
		readonly createChildrenOps: (blockSizeBits: number) => ChildrenOps,
		readonly getDefaultInstance: () => ListContext<F>,
	) {
		this.minBlockSize = 1 << (blockSizeBits - 1);
		this.maxBlockSize = 1 << blockSizeBits;
		this.childrenOps = createChildrenOps(blockSizeBits);
	}

	readonly minBlockSize: number;
	readonly maxBlockSize: number;
	readonly childrenOps: ChildrenOps;

	get defaultContext(): ListContext<F> {
		return this.getDefaultInstance();
	}

	isList<T>(source: unknown): source is List<T> {
		return (
			source instanceof ListEmptyBase ||
			source instanceof OuterBlock ||
			source instanceof OuterTree
		);
	}

	isInContext<T>(source: unknown): source is List<T> {
		return this.isList(source) && source.context === this;
	}

	outerBlockLeftRight<T>(children: OuterChildren<T>): OuterBlock<T> {
		return new OuterBlockLeftRight<T>(this, children);
	}
	outerBlockRightLeft<T>(children: OuterChildren<T>): OuterBlock<T> {
		return new OuterBlockRightLeft<T>(this, children);
	}
	outerTree<T>(
		left: OuterBlock<T>,
		right: OuterBlock<T>,
		middle: Inner<T, OuterBlock<T>> | null,
		size: number,
	): OuterTree<T> {
		return new OuterTree<T>(this, left, right, middle, size);
	}
	innerBlock<T, C extends Self<Block<T>, C>>(
		children: C[],
		size: number,
		level: number,
		sizeTable?: SizeTable | undefined,
	): InnerBlock<T, C> {
		return new InnerBlock<T, C>(this, children, size, level, sizeTable);
	}
	innerTree<T, C extends Self<Block<T>, C>>(
		left: InnerBlock<T, C>,
		right: InnerBlock<T, C>,
		middle: Inner<T, InnerBlock<T, C>> | null,
		size: number,
		level: number,
	): InnerTree<T, C> {
		return new InnerTree<T, C>(this, left, right, middle, size, level);
	}
	outerBlockBuilder<T>(children: OuterChildren<T>): OuterBlockBuilder<T> {
		return new OuterBlockBuilder<T>(this, undefined, children);
	}
	outerBlockBuilderSource<T>(source: OuterBlock<T>): OuterBlockBuilder<T> {
		return new OuterBlockBuilder<T>(this, source);
	}
	outerTreeBuilder<T>(
		left: OuterBlockBuilder<T>,
		right: OuterBlockBuilder<T>,
		middle: InnerBuilder<T, OuterBlockBuilder<T>> | undefined,
		size: number,
	): OuterTreeBuilder<T> {
		return new OuterTreeBuilder<T>(this, undefined, left, right, middle, size);
	}
	outerTreeBuilderSource<T>(source: OuterTree<T>): OuterTreeBuilder<T> {
		return new OuterTreeBuilder<T>(this, source);
	}
	innerBlockBuilder<T, C extends BlockBuilder<T, any>>(
		children: C[],
		size: number,
		level: number,
		sizeTable?: SizeTable | undefined,
	): InnerBlockBuilder<T, C> {
		return new InnerBlockBuilder<T, C>(this, level, undefined, children, size);
	}
	innerBlockBuilderSource<T, C extends BlockBuilder<T>>(
		source: InnerBlock<T, any>,
	): InnerBlockBuilder<T, C> {
		return new InnerBlockBuilder<T, C>(this, source.level, source);
	}
	innerTreeBuilder<T, C extends BlockBuilder<T>>(
		level: number,
		left: InnerBlockBuilder<T, C>,
		right: InnerBlockBuilder<T, C>,
		middle: InnerBuilder<T, InnerBlockBuilder<T, C>> | undefined,
		size: number,
	): InnerTreeBuilder<T, C> {
		return new InnerTreeBuilder<T, C>(
			this,
			level,
			undefined,
			left,
			right,
			middle,
			size,
		);
	}
	innerTreeBuilderSource<T, C extends BlockBuilder<T>>(
		source: InnerTree<T, any>,
	): InnerTreeBuilder<T, C> {
		return new InnerTreeBuilder<T, C>(this, source.level, source);
	}
	isBlockBuilder<T>(source: unknown): source is BlockBuilder<T> {
		return (
			(source instanceof OuterBlockBuilder ||
				source instanceof InnerBlockBuilder) &&
			source.context === this
		);
	}
	builderFrom<T>(
		outerBuilder: OuterBuilder<T>,
	): Collection.Advanced.Types<F, T>['_BUILDER'] {
		return new ListBuilder<T>(this, outerBuilder);
	}

	#_empty: ListEmptyBase<any> | undefined;

	empty = <T extends F['_UPPER_E']>(): Collection.Advanced.Types<
		F,
		T
	>['_NORMAL'] => {
		if (undefined === this.#_empty) {
			this.#_empty = Object.freeze(new ListEmptyBase<T>(this));
		}

		return this.#_empty as any;
	};

	fromSingle = <T extends F['_UPPER_E']>(
		source: StreamSource<T>,
	): Collection.Advanced.Types<F, T>['_NORMAL'] => {
		if (this.isInContext<T>(source) && source.nonEmpty()) {
			return source;
		} else if (!Stream.isEmptyStreamSourceInstance(source)) {
			const builder = this.builder<T>();
			builder.appendAll(source);
			return builder.build();
		}

		return this.empty<T>();
	};

	from = <T extends F['_UPPER_E']>(
		...sources: StreamSource<T>[]
	): Collection.Advanced.Types<F, T>['_NON_EMPTY'] => {
		let result: List.NonEmpty<T> | undefined;

		for (const source of sources) {
			if (this.isInContext<T>(source) && source.nonEmpty()) {
				if (undefined === result) {
					result = source;
				} else {
					result = (result as ListNonEmptyBase<T>)._concat(source);
				}
			} else if (!Stream.isEmptyStreamSourceInstance(source)) {
				const builder =
					undefined === result ? this.builder<T>() : result.toBuilder();
				builder.appendAll(source);
				if (!builder.isEmpty) {
					result = builder.build().assumeNonEmpty();
				}
			}
		}

		if (undefined === result) {
			return this.empty<T>() as List.NonEmpty<T>;
		}

		return result;
	};

	of = <T extends F['_UPPER_E']>(
		...elements: ArrayNonEmpty<T>
	): Collection.Advanced.Types<F, T>['_NON_EMPTY'] => this.from(elements);

	builder = <T extends F['_UPPER_E']>(): Collection.Advanced.Types<
		F,
		T
	>['_BUILDER'] => new ListBuilder<T>(this);

	reducer = <T extends F['_UPPER_E']>(
		source?: StreamSource<T>,
	): Reducer<T, Collection.Advanced.Types<F, T>['_NORMAL']> => {
		return defaultReducerByAppend<T, List.Advanced.Family<T>>(this, source);
	};

	flatten = <E extends F['_UPPER_E']>(
		source: StreamSource<StreamSource<E>>,
	): F['_NON_EMPTY'] => {
		return this.from(source).flatMap((stream) => stream);
	};

	unzip = (
		source: StreamSource<readonly unknown[]>,
		options: { length: number },
	): any => {
		const streams = Stream.unzip(source, options) as Stream<F['_UPPER_E']>[];

		return streams.map(this.fromSingle) as any;
	};

	createContext = (options: { blockSizeBits?: number }): ListContext<F> =>
		new ListContext<F>(
			options.blockSizeBits ?? this.blockSizeBits,
			this.createChildrenOps,
			this.getDefaultInstance,
		);
}
