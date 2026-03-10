import type { WithElem } from '@rimbu/collection-types/common';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { List } from '@rimbu/list';
import type { Block, NonLeaf } from './immutable/utils';
import type { NonLeafBuilder } from './mutable/builder-base';

import type { ListBase } from '#list/list-base';
import type { ListImpl } from '#list/list-impl';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';
import { Stream, type StreamSource } from '@rimbu/stream';
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
		return new ListEmpty<T>(this);
	}

	of<T>(...values: ArrayNonEmpty<T>): ListImpl.NonEmpty<T> {
		if (values.length <= this.maxBlockSize) {
			return this.leafBlock(this.leafChildrenOps.of(values));
		}

		return this.from(values);
	}

	from<T>(...sources: ArrayNonEmpty<StreamSource<T>>): any {
		if (sources.length === 1) {
			const source = sources[0];
			if (this.isContextList(source)) return source;
		}

		let result: List<T> | null = null;

		let i = -1;
		const length = sources.length;

		while (++i < length) {
			const source = sources[i];

			if (!Stream.isEmptyStreamSourceInstance(source)) {
				if (this.isContextList<T>(source)) {
					if (null === result) result = source;
					else result = result.concat(source);
				} else {
					const builder = this.builder<T>();

					if (Array.isArray(source)) builder.appendArray(source);
					else builder.appendAll(source);

					if (!builder.isEmpty) {
						const build = builder.build();
						if (null === result) result = build;
						else result = result.concat(build);
					}
				}
			}
		}

		if (null === result) return this.empty();
		return result;
	}

	builder<T>(): ListBuilder<T> {
		return new ListBuilder<T>(this);
	}

	isList<T>(source: unknown): source is List<T> {
		return source instanceof ListEmpty || source instanceof LeafBlock;
	}

	isContextList<T>(source: unknown): source is List<T> {
		if (this.isList(source)) {
			return source.context === this;
		}

		return false;
	}

	leafBlock<T>(children: WithElem<Tp, T>['leafChildren']): LeafBlock<T> {
		return new LeafBlock(this, children);
	}

	isLeafBlock<T>(block: List<T> | Block<T>): block is LeafBlock<T> {
		return block instanceof LeafBlock;
	}

	reversedLeafBlock<T>(
		children: WithElem<Tp, T>['leafChildren'],
	): LeafBlock<T> {
		return new ReversedLeafBlock(this, children);
	}

	isReversedLeafBlock<T>(block: LeafBlock<T>): block is ReversedLeafBlock<T> {
		return block instanceof ReversedLeafBlock;
	}

	leafTree<T>(
		left: LeafBlock<T>,
		right: LeafBlock<T>,
		middle: NonLeaf<T> | null,
		length: number,
	): LeafTree<T> {
		return new LeafTree(this, left, right, middle, length);
	}

	isLeafTree<T>(list: List<T>): list is LeafTree<T> {
		return list instanceof LeafTree;
	}

	nonLeafBlock<T>(
		children: readonly Block<T>[],
		itemsLength: number,
		level: number,
	): NonLeafBlock<T> {
		return new NonLeafBlock(this, children, itemsLength, level);
	}

	isNonLeafBlock<T>(source: unknown): source is NonLeafBlock<T> {
		return source instanceof NonLeafBlock;
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

	isNonLeafTree<T>(source: unknown): source is NonLeafTree<T> {
		return source instanceof NonLeafTree;
	}

	createBuilder<T>(source?: List<T>): ListBuilder<T> {
		if (undefined === source || source.isEmpty) return new ListBuilder<T>(this);

		if (source.context !== this) {
			throw new Error('Source list was created with a different context');
		}

		if (this.isLeafBlock<T>(source)) {
			const builder = this.leafBlockBuilderSource(source);
			return new ListBuilder<T>(this, builder);
		}

		if (this.isLeafTree<T>(source)) {
			const builder = this.leafTreeBuilderSource<T>(source);
			return new ListBuilder<T>(this, builder);
		}

		throwInvalidStateError();
	}

	leafBlockBuilderSource<T>(source: LeafBlock<T>): LeafBlockBuilder<T> {
		return new LeafBlockBuilder(this, source);
	}

	leafBlockBuilder<T>(
		children: WithElem<Tp, T>['leafChildren'],
	): LeafBlockBuilder<T> {
		return new LeafBlockBuilder(this, undefined, children);
	}

	leafTreeBuilderSource<T>(source: LeafTree<T>): LeafTreeBuilder<T> {
		return new LeafTreeBuilder(this, source);
	}

	leafTreeBuilder<T>(
		left: LeafBlockBuilder<T>,
		right: LeafBlockBuilder<T>,
		middle?: NonLeafBuilder<T>,
		length?: number,
	): LeafTreeBuilder<T> {
		return new LeafTreeBuilder(this, undefined, left, right, middle, length);
	}

	createNonLeafBuilder<T>(source: NonLeaf<T>): NonLeafBuilder<T> {
		if (this.isNonLeafBlock<T>(source)) {
			return new NonLeafBlockBuilder(this, source.level, source);
		}
		if (this.isNonLeafTree<T>(source)) {
			return new NonLeafTreeBuilder(this, source.level, source);
		}

		throwInvalidStateError();
	}

	nonLeafBlockBuilderSource<T>(
		source: NonLeafBlock<T>,
	): NonLeafBlockBuilder<T> {
		return new NonLeafBlockBuilder(this, source.level, source);
	}

	nonLeafBlockBuilder<T>(
		level: number,
		children: Array<WithElem<Tp, T>['leafChildren']>,
		itemsLength: number,
	): NonLeafBlockBuilder<T> {
		return new NonLeafBlockBuilder(
			this,
			level,
			undefined,
			children,
			itemsLength,
		);
	}

	nonLeafTreeBuilderSource<T>(source: NonLeafTree<T>): NonLeafTreeBuilder<T> {
		return new NonLeafTreeBuilder(this, source.level, source);
	}

	nonLeafTreeBuilder<T>(
		level: number,
		left: NonLeafBlockBuilder<T>,
		right: NonLeafBlockBuilder<T>,
		middle: NonLeafBuilder<T>,
		itemsLength: number,
	): NonLeafTreeBuilder<T> {
		return new NonLeafTreeBuilder(
			this,
			level,
			undefined,
			left,
			right,
			middle,
			itemsLength,
		);
	}

	cacheMap(): CacheMap {
		return new CacheMap();
	}
}
