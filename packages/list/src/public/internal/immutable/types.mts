import type { IndexRange } from '@rimbu/common/index-range';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Update } from '@rimbu/common/update';
import type { Stream } from '@rimbu/stream';

import type { BlockBuilder, NonLeafBuilder } from '#list/builder/types';
import type { ListContext } from '#list/context';
import type { CacheMap } from '#list/immutable/cache-map';

export interface Tree<
  T,
  TS extends Tree<T, TS, TB, C>,
  TB extends Block<T, TB, C>,
  C,
> {
  readonly context: ListContext;
  readonly left: TB;
  readonly middle: NonLeaf<T, TB> | null;
  readonly right: TB;
  readonly length: number;

  copy(left?: TB, right?: TB, middle?: NonLeaf<T, TB> | null): TS;
  prependMiddle(child: TB): NonLeaf<T, TB>;
  appendMiddle(child: TB): NonLeaf<T, TB>;
  getChildLength(child: C): number;
}

export interface NonLeaf<T, C extends Block<any, C> = any> {
  readonly length: number;
  readonly context: ListContext;
  readonly level: number;
  get(index: number): T;
  prepend(child: C): NonLeaf<T, C>;
  append(child: C): NonLeaf<T, C>;
  dropFirst(): [NonLeaf<T, C> | null, C];
  dropLast(): [NonLeaf<T, C> | null, C];
  dropInternal(amount: number): [NonLeaf<T, C> | null, C, number];
  takeInternal(amount: number): [NonLeaf<T, C> | null, C, number];
  concat<T2>(other: NonLeaf<T2, C>): NonLeaf<T | T2, C>;
  updateAt(index: number, update: Update<T>): NonLeaf<T, C>;
  stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
  streamRange(range: IndexRange, options?: { reversed?: boolean }): Stream<T>;
  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    options?: { reversed?: boolean; state?: TraverseState }
  ): void;
  mapPure<T2>(
    mapFun: (value: T) => T2,
    options?: {
      reversed?: boolean;
      cacheMap?: CacheMap;
    }
  ): NonLeaf<T2>;
  map<T2>(
    mapFun: (value: T, index: number) => T2,
    options?: {
      reversed?: boolean;
      indexOffset?: number;
    }
  ): NonLeaf<T2>;
  reversed(cacheMap?: CacheMap): NonLeaf<T, C>;
  toArray(options?: {
    range?: IndexRange | undefined;
    reversed?: boolean;
  }): T[];
  structure(): string;
  createNonLeafBuilder(): NonLeafBuilder<T, BlockBuilder<T>>;
}

import type { OptLazy } from '@rimbu/common/opt-lazy';

export interface Block<T, TS extends Block<T, TS, C> = any, C = any> {
  readonly length: number;
  readonly canAddChild: boolean;
  readonly childrenInMin: boolean;
  children: readonly C[];
  copy(children: C[], length: number): TS;
  concatChildren(other: TS): TS;
  prependInternal(child: C): TS;
  appendInternal(child: C): TS;
  get<O>(index: number, otherwise?: OptLazy<O>): T | O;
  updateAt(index: number, update: Update<T>): TS;
  stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
  streamRange(range: IndexRange, options?: { reversed?: boolean }): Stream<T>;
  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    options?: { reversed?: boolean; state?: TraverseState }
  ): void;
  mapPure<T2>(
    mapFun: (value: T) => T2,
    options?: {
      reversed?: boolean;
      cacheMap?: CacheMap;
    }
  ): Block<T2>;
  map<T2>(
    mapFun: (value: T, index: number) => T2,
    options?: {
      reversed?: boolean;
      indexOffset?: number;
    }
  ): Block<T2>;
  reversed(cache: CacheMap): TS;
  toArray(options?: {
    range?: IndexRange | undefined;
    reversed?: boolean;
  }): T[] | any;
  structure(): string;
  _mutateSplitRight(index?: number): TS;
  createBlockBuilder(): BlockBuilder<T, any>;
}
