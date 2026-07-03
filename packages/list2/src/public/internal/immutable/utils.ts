import type { IndexRange } from '@rimbu/common/index-range';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Stream } from '@rimbu/stream';

import type { CacheMap } from '#list/immutable/cache-map';
import type { InnerBlock } from '#list/immutable/inner-block';
import type { InnerTree } from '#list/immutable/inner-tree';
import type { BlockBuilder } from '#list/mutable/builder-base';

export interface ListCommon<T> {
	get(index: number): T;
	stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
	streamRange(range: IndexRange, options?: { reversed?: boolean }): Stream<T>;
	toArray(
		options?:
			| { range?: IndexRange | undefined; reversed?: boolean }
			| undefined,
	): T[];
	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options?: { reversed?: boolean; state?: TraverseState } | undefined,
	): void;
	map<T2>(
		mapFun: (value: T, index: number) => T2,
		options?: { reversed?: boolean; indexOffset?: number },
	): ListCommon<T2>;
	mapPure<T2>(
		mapFun: (value: T) => T2,
		options?: { reversed?: boolean } | undefined,
		cacheMap?: CacheMap | undefined,
	): ListCommon<T2>;
	_structure(depth?: number): string;
	_verifyStructure(
		messages?: string[] | undefined,
		enforceMinChildren?: boolean | undefined,
	): string[];
}

export interface Block<T, C = unknown> extends ListCommon<T> {
	readonly _self: Block<T, C>;

	readonly length: number;
	readonly nrChildren: number;
	readonly childrenInMin: boolean;
	readonly childrenInMax: boolean;
	readonly canAddChild: boolean;
	readonly canRemoveChild: boolean;
	updateAt(index: number, update: (current: T) => T): Block<T, C>;
	concatChildren(other: Block<T, C>): this['_self'];
	takeChildren(amount: number): Block<T, C> | null;
	reversed(cacheMap?: CacheMap | undefined): this['_self'];
	createBlockBuilder(): BlockBuilder<T>;
	prependBlockChild(child: C): this['_self'];
	appendBlockChild(child: C): this['_self'];
}

export type Inner<T, C extends Block<T>> = InnerBlock<T, C> | InnerTree<T, C>;
