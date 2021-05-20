import { OptLazy } from '@rimbu/common';
import { List } from '../internal';
import { NonLeaf } from '../list-custom';
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
