import { OptLazy, TraverseState, Update } from '@rimbu/common';
import type { List } from '../../internal';
import type { BuilderBase } from '../../list-custom';

export interface LeafBuilder<T> extends BuilderBase<T, T> {
  updateAt<O>(index: number, update: Update<T>, otherwise?: OptLazy<O>): T | O;
  normalized(): LeafBuilder<T> | undefined;
  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state?: TraverseState
  ): void;
  build(): List<T>;
  buildMap<T2>(f: (value: T) => T2): List<T2>;
}
