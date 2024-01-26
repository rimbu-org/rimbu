import type { IndexRange, OptLazy, TraverseState, Update } from '../../../common/mod.ts';
import type { Stream } from '../../../stream/mod.ts';

import type { BlockBuilder, CacheMap } from '../../../list/custom/index.ts';

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
