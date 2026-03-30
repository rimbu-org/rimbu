import type { IndexRange } from '@rimbu/common/index-range';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Stream } from '@rimbu/stream';

import type { ListContext } from '#list/context-module';
import type { CacheMap } from '#list/immutable/cache-map';
import type { BlockBuilder } from '#list/mutable/builder-base';

export interface ListCommon<T> {
	get(index: number): T;
	stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
	toArray(
		options?:
			| { range?: IndexRange | undefined; reversed?: boolean }
			| undefined,
	): T[];
	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options?: { reversed?: boolean; state?: TraverseState } | undefined,
	): void;
	_structure(): string;
}

export interface Block<T> extends ListCommon<T> {
	readonly itemsLength: number;
	get nrChildren(): number;
	get childrenInMin(): boolean;
	get childrenInMax(): boolean;
	get canAddChild(): boolean;
	concatChildren(other: Block<T>): Block<T>;
	takeChildren(amount: number): Block<T> | null;
	reversed(cacheMap?: CacheMap | undefined): Block<T>;
	createBlockBuilder(): BlockBuilder<T>;
}

export interface Inner<T, C> extends ListCommon<T> {
	readonly context: ListContext;
	readonly itemsLength: number;
	prependChild(child: C): Inner<T, C>;
	appendChild(child: C): Inner<T, C>;
	dropFirstChild(): [Inner<T, C> | null, C];
	dropLastChild(): [Inner<T, C> | null, C];
	concatInner(inner: Inner<T, C>): Inner<T, C>;
	reversed(cacheMap?: CacheMap | undefined): Inner<T, C>;
	takeInternal(amount: number): [Inner<T, C> | null, C, number];
	dropInternal(amount: number): [Inner<T, C> | null, C, number];
}

export type Tree<N, TM> = TM & {
	readonly left: N;
	readonly right: N;
	readonly middle: TM | null;
};
