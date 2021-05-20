import { IndexRange, OptLazy, TraverseState, Update } from '@rimbu/common';
import { Stream } from '@rimbu/stream';

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
  ): Block<T2>;
  reversed(): TS;
  toArray(range?: IndexRange, reversed?: boolean): T[] | any;
  structure(): string;
  _mutateSplitRight(index?: number): TS;
}
