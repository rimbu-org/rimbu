import type { IndexRange } from '@rimbu/common/index-range';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Update } from '@rimbu/common/update';
import type { Stream } from '@rimbu/stream';
import type { ListImpl } from '../impl';

import type { BlockBuilder, NonLeafBuilder } from '#list/builder/types';
import type { CacheMap } from '#list/immutable/cache-map';

export interface Tree<T, C extends Block<T>> {
	readonly context: ListImpl.Context;
	readonly left: C;
	readonly middle: NonLeaf<T, C> | null;
	readonly right: C;
	readonly length: number;

	copy(left?: C, right?: C, middle?: NonLeaf<T, C> | null): Tree<T, C>;
	prependMiddle(child: C): NonLeaf<T, C>;
	appendMiddle(child: C): NonLeaf<T, C>;
	getChildLength(child: C): number;
}

export interface NonLeaf<T, C> {
	readonly length: number;
	readonly context: ListImpl.Context;
	readonly level: number;
	get(index: number): T;
	prepend(child: C): NonLeaf<T, C>;
	append(child: C): NonLeaf<T, C>;
	dropFirst(): [NonLeaf<T, C> | null, C];
	dropLast(): [NonLeaf<T, C> | null, C];
	dropInternal(amount: number): [NonLeaf<T, C> | null, C, number];
	takeInternal(amount: number): [NonLeaf<T, C> | null, C, number];
	concat<T2>(other: NonLeaf<T2, Block<T2>>): NonLeaf<T | T2, Block<T | T2>>;
	updateAt(index: number, update: Update<T>): NonLeaf<T, C>;
	stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
	streamRange(range: IndexRange, options?: { reversed?: boolean }): Stream<T>;
	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options?: { reversed?: boolean; state?: TraverseState },
	): void;
	mapPure<T2>(
		mapFun: (value: T) => T2,
		options?: {
			reversed?: boolean;
			cacheMap?: CacheMap;
		},
	): NonLeaf<T2, Block<T2>>;
	map<T2>(
		mapFun: (value: T, index: number) => T2,
		options?: {
			reversed?: boolean;
			indexOffset?: number;
		},
	): NonLeaf<T2, Block<T2>>;
	reversed(cacheMap?: CacheMap): NonLeaf<T, C>;
	toArray(options?: {
		range?: IndexRange | undefined;
		reversed?: boolean;
	}): T[];
	structure(): string;
	createNonLeafBuilder(): NonLeafBuilder<T, BlockBuilder<T>>;
}

// export interface Block<T, Tp extends ListImpl.Types = ListImpl.Types> {
// 	readonly length: number;
// 	readonly canAddChild: boolean;
// 	readonly childrenInMin: boolean;
// 	children: WithElem<Tp, T>['children'];
// 	copy(children: WithElem<Tp, T>['children'], length: number): TS;
// 	concatChildren(other: TS): TS;
// 	prependInternal(child: C): TS;
// 	appendInternal(child: C): TS;
// 	get<O>(index: number, otherwise?: OptLazy<O>): T | O;
// 	updateAt(index: number, update: Update<T>): TS;
// 	stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
// 	streamRange(range: IndexRange, options?: { reversed?: boolean }): Stream<T>;
// 	forEach(
// 		f: (value: T, index: number, halt: () => void) => void,
// 		options?: { reversed?: boolean; state?: TraverseState },
// 	): void;
// 	mapPure<T2>(
// 		mapFun: (value: T) => T2,
// 		options?: {
// 			reversed?: boolean;
// 			cacheMap?: CacheMap;
// 		},
// 	): Block<T2>;
// 	map<T2>(
// 		mapFun: (value: T, index: number) => T2,
// 		options?: {
// 			reversed?: boolean;
// 			indexOffset?: number;
// 		},
// 	): Block<T2>;
// 	reversed(cache: CacheMap): TS;
// 	toArray(options?: {
// 		range?: IndexRange | undefined;
// 		reversed?: boolean;
// 	}): T[] | any;
// 	structure(): string;
// 	_mutateSplitRight(index?: number): TS;
// 	createBlockBuilder(): BlockBuilder<T, any>;
// }
