import type { WithElem } from '@rimbu/collection-types/common';
import type { IndexRange } from '@rimbu/common/index-range';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { Stream, StreamSource } from '@rimbu/stream';
import type { NonLeafBlock } from './immutable/nonleaf/block';
import type { NonLeafTree } from './immutable/nonleaf/tree';
import type { Block, NonLeaf } from './immutable/types';
import type { ListBase } from './list-base';

import { LeafBlock, ReversedLeafBlock } from './immutable/leaf/block';
import { LeafTree } from './immutable/leaf/tree';

export interface ListImpl<T> extends ListBase<T, ListImpl.Types> {}

export namespace ListImpl {
	export interface NonEmpty<T>
		extends ListBase.NonEmpty<T, ListImpl.Types>,
			Omit<ListImpl<T>, keyof ListBase.NonEmpty<any>> {}

	export interface LeafOps<Tp extends ListImpl.Types = ListImpl.Types> {
		get<T, O = never>(
			c: WithElem<Tp, T>['children'],
			index: number,
			otherwise?: OptLazy<O>,
		): WithElem<Tp, T>['_T'] | O;
		of<T>(...values: Array<T>): WithElem<Tp, T>['children'];
		areTheSame(c1: Tp['children'], c2: Tp['children']): boolean;
		length(c: Tp['children']): number;
		stream<T>(
			c: WithElem<Tp, T>['children'],
			options: { reversed?: boolean },
		): Stream.NonEmpty<WithElem<Tp, T>['_T']>;
		streamRange<T>(
			c: WithElem<Tp, T>['children'],
			options: { indexRange: IndexRange; reversed?: boolean },
		): Stream<T>;
		toSpliced<T>(
			c: WithElem<Tp, T>['children'],
			start: number,
			deleteCount: number,
			...items: Array<WithElem<Tp, T>['_T']>
		): WithElem<Tp, T>['children'];
		prepend<T>(
			c: WithElem<Tp, T>['children'],
			value: WithElem<Tp, T>['_T'],
		): WithElem<Tp, T>['children'];
		append<T>(
			c: WithElem<Tp, T>['children'],
			value: WithElem<Tp, T>['_T'],
		): WithElem<Tp, T>['children'];
		toReversed<T>(c: WithElem<Tp, T>['children']): WithElem<Tp, T>['children'];
		with<T>(
			c: WithElem<Tp, T>['children'],
			index: number,
			value: WithElem<Tp, T>['_T'],
		): WithElem<Tp, T>['children'];
		map<T, R>(
			c: WithElem<Tp, T>['children'],
			f: (value: WithElem<Tp, T>['_T'], index: number) => WithElem<Tp, R>['_T'],
			indexOffset?: number | undefined,
		): WithElem<Tp, R>['children'];
		concat<T>(
			c1: WithElem<Tp, T>['children'],
			c2: WithElem<Tp, T>['children'],
		): WithElem<Tp, T>['children'];
	}

	export interface Context<Tp extends ListImpl.Types = ListImpl.Types>
		extends ListBase.Context {
		readonly leafOps: ListImpl.LeafOps;

		readonly blockSizeBits: number;
		readonly minBlockSize: number;
		readonly maxBlockSize: number;

		leafBlock<T>(children: WithElem<Tp, T>['children']): LeafBlock<T>;
		reversedLeaf<T>(
			children: WithElem<Tp, T>['children'],
		): ReversedLeafBlock<T>;
		leafTree<T>(
			left: LeafBlock<T>,
			right: LeafBlock<T>,
			middle: NonLeaf<T> | null,
		): LeafTree<T>;
		nonLeafBlock<T>(
			length: number,
			children: readonly Block<T>[],
			level: number,
		): NonLeafBlock<T>;
		nonLeafTree<T>(
			left: NonLeafBlock<T>,
			right: NonLeafBlock<T>,
			middle: NonLeaf<T> | null,
			level: number,
		): NonLeafTree<T>;
		isLeafBlock<T>(obj: Block<T>): obj is LeafBlock<T>;
		isReversedLeafBlock<T>(obj: Block<T>): obj is ReversedLeafBlock<T>;
		isNonLeafBlock<T>(obj: Block<T> | NonLeaf<T>): obj is NonLeafBlock<T, any>;
		isLeafTree<T>(obj: List<T>): obj is LeafTree<T>;
		isNonLeafTree<T>(obj: NonLeaf<T>): obj is NonLeafTree<T, any>;
	}

	export interface Types extends ListBase.Types {
		readonly context: ListImpl.Context;
		readonly normal: ListImpl<this['_T']>;
		readonly nonEmpty: ListImpl.NonEmpty<this['_T']>;
		readonly childrenTag: { _childTag: true };
		readonly children: this['childrenTag'];
	}
}

export class ListImplContext<Tp extends ListImpl.Types = ListImpl.Types>
	implements ListImpl.Context<Tp>
{
	readonly minBlockSize: number;
	readonly maxBlockSize: number;

	constructor(
		readonly typeTag: string,
		readonly blockSizeBits: number,
		readonly leafOps: ListImpl.LeafOps,
	) {
		this.maxBlockSize = 1 << blockSizeBits;
		this.minBlockSize = this.maxBlockSize >>> 1;
	}
	nonLeafBlock<T, C extends Block<T, C>>(
		length: number,
		children: readonly C[],
		level: number,
	): NonLeafBlock<T, C> {
		throw new Error('Method not implemented.');
	}
	nonLeafTree<T, C extends Block<T, C>>(
		left: NonLeafBlock<T, C>,
		right: NonLeafBlock<T, C>,
		middle: NonLeaf<T, NonLeafBlock<T, C>> | null,
		level: number,
	): NonLeafTree<T, C> {
		throw new Error('Method not implemented.');
	}
	isLeafBlock<T>(obj: Block<T>): obj is LeafBlock<T> {
		return obj instanceof LeafBlock;
	}
	isReversedLeafBlock<T>(obj: Block<T>): obj is ReversedLeafBlock<T> {
		return obj instanceof ReversedLeafBlock;
	}
	isNonLeafBlock<T>(obj: Block<T> | NonLeaf<T>): obj is NonLeafBlock<T, any> {
		throw new Error('Method not implemented.');
	}
	isLeafTree<T>(obj: List<T>): obj is LeafTree<T> {
		throw new Error('Method not implemented.');
	}
	isNonLeafTree<T>(obj: NonLeaf<T>): obj is NonLeafTree<T, any> {
		throw new Error('Method not implemented.');
	}
	empty<T>(): ListBase<T, ListBase.Types> {
		throw new Error('Method not implemented.');
	}
	of<T>(values_0: T, ...values: T[]): ListBase.NonEmpty<T, ListBase.Types> {
		throw new Error('Method not implemented.');
	}
	from<T>(values: StreamSource<T>): ListBase<T, ListBase.Types> {
		throw new Error('Method not implemented.');
	}
	builder<T>(): ListBase.Builder<T, ListBase.Types> {
		throw new Error('Method not implemented.');
	}
	createContext(options?: {
		blockSizeBits?: number;
	}): ListBase.Context<ListBase.Types> {
		throw new Error('Method not implemented.');
	}
	defaultContext(): ListBase.Context<ListBase.Types> {
		throw new Error('Method not implemented.');
	}

	leafBlock<T>(children: WithElem<Tp, T>['children']): LeafBlock<T> {
		return new LeafBlock(this, children);
	}
	reversedLeaf<T>(children: WithElem<Tp, T>['children']): ReversedLeafBlock<T> {
		return new ReversedLeafBlock(this, children);
	}
	leafTree<T>(
		left: LeafBlock<T>,Tag
		right: LeafBlock<T>,
		middle: NonLeaf<T, LeafBlock<T>> | null,
	): LeafTree<T> {
		return new LeafTree(this, left, right, middle);
	}
}
