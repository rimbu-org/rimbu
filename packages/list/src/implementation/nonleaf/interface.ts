import type { IndexRange, TraverseState, Update } from '@rimbu/common';
import type { Stream } from '@rimbu/stream';
import type { Block, ListContext } from '../../list-custom';

export interface NonLeaf<T, C extends Block<T, C> = any> {
  readonly length: number;
  readonly context: ListContext;
  get(index: number): T;
  prepend(child: C): NonLeaf<T, C>;
  append(child: C): NonLeaf<T, C>;
  dropFirst(): [NonLeaf<T, C> | null, C];
  dropLast(): [NonLeaf<T, C> | null, C];
  dropInternal(amount: number): [NonLeaf<T, C> | null, C, number];
  takeInternal(amount: number): [NonLeaf<T, C> | null, C, number];
  concat(other: NonLeaf<T, C>): NonLeaf<T, C>;
  updateAt(index: number, update: Update<T>): NonLeaf<T, C>;
  stream(reversed?: boolean): Stream.NonEmpty<T>;
  streamRange(range: IndexRange, reversed?: boolean): Stream<T>;
  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state?: TraverseState
  ): void;
  map<T2>(
    mapFun: (value: T, index: number) => T2,
    reversed?: boolean,
    indexOffset?: number
  ): NonLeaf<T2>;
  reversed(): NonLeaf<T, C>;
  toArray(range?: IndexRange, reversed?: boolean): T[];
  structure(): string;
}
