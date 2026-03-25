import type { IndexRange } from '@rimbu/common/index-range';
import type { Stream } from '@rimbu/stream';
import type { BlockBuilder } from '../mutable/builder-base';

import type { ListContext } from '#list/context-module';
import type { CacheMap } from '#list/immutable/cache-map';

export interface ListCommon<T> {
	get(index: number): T;
	stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
	toArray(
		options?:
			| { range?: IndexRange | undefined; reversed?: boolean }
			| undefined,
	): T[];
	_structure(): string;
}

export interface Block<T> extends ListCommon<T> {
	readonly itemsLength: number;
	get nrChildren(): number;
	get childrenInMin(): boolean;
	get childrenInMax(): boolean;
	concatChildren(other: Block<T>): Block<T>;
	reversed(cacheMap?: CacheMap | undefined): Block<T>;
	createBlockBuilder(): BlockBuilder<T>;
}

export interface NonLeaf<T> extends ListCommon<T> {
	readonly context: ListContext;
	readonly itemsLength: number;
	prependChild(child: Block<T>): NonLeaf<T>;
	appendChild(child: Block<T>): NonLeaf<T>;
	dropLastChild(): [NonLeaf<T> | null, Block<T>];
	concatNonLeaf(nonLeaf: NonLeaf<T>): NonLeaf<T>;
	reversed(cacheMap?: CacheMap | undefined): NonLeaf<T>;
}

export type Tree<N, TM> = TM & {
	readonly left: N;
	readonly right: N;
	readonly middle: TM | null;
};
