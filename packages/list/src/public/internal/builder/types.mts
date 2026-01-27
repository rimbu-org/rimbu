import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Update } from '@rimbu/common/update';

import type { List } from '@rimbu/list';

import type { NonLeafBlockBuilder } from '#list/builder/nonleaf/block';
import type { NonLeafTreeBuilder } from '#list/builder/nonleaf/tree';
import type { NonLeaf } from '#list/immutable/types';

export interface BuilderBase<T, C = unknown> {
  readonly length: number;
  get<O>(index: number, otherwise?: OptLazy<O>): T | O;
  prepend(value: C): void;
  append(value: C): void;
  insert(index: number, value: T): void;
  remove(index: number): T;
  build(): List<T> | NonLeaf<T>;
  buildMap<T2>(f: (value: T) => T2): List<T2> | NonLeaf<T2>;
}

export interface LeafBuilder<T> extends BuilderBase<T, T> {
  updateAt<O>(index: number, update: Update<T>, otherwise?: OptLazy<O>): T | O;
  normalized(): LeafBuilder<T> | undefined;
  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    options?: { reversed?: boolean; state?: TraverseState }
  ): void;
  build(): List<T>;
  buildMap<T2>(f: (value: T) => T2): List<T2>;
}

export type NonLeafBuilder<T, C extends BlockBuilder<T>> =
  | NonLeafBlockBuilder<T, C>
  | NonLeafTreeBuilder<T, C>;

export interface BlockBuilder<T, C = unknown> extends BuilderBase<T, C> {
  level: number;
  nrChildren: number;
  children: C[];
  updateAt<O>(index: number, update: Update<T>, otherwise?: OptLazy<O>): T | O;
  remove(index: number): T;
  dropFirst(): C;
  dropLast(): C;
  copy(children: C[], length: number): BlockBuilder<T, C>;
  splitRight(index?: number): BlockBuilder<T, C>;
  concat(other: BlockBuilder<T, C>, prependOther?: boolean): void;
  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    options?: { reversed?: boolean; state?: TraverseState }
  ): void;
}
