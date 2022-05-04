import type { OptLazy, TraverseState, Update } from '../../../../common/mod.ts';

import type { List } from '../../../../list/mod.ts';
import type { BuilderBase } from '../../../../list/custom/index.ts';

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
