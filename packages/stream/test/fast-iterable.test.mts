import { OptLazy } from '@rimbu/common';

import {
  emptyFastIterator,
  FastIteratorBase,
  fixedDoneIteratorResult,
} from '../src/custom/index.mjs';

describe('FastIterator', () => {
  it('fixedDone', () => {
    expect(fixedDoneIteratorResult).toEqual({ done: true, value: undefined });
  });

  it('emptyFastIterator', () => {
    expect(emptyFastIterator.fastNext()).toEqual(undefined);
    expect(emptyFastIterator.fastNext(1)).toEqual(1);
    expect(emptyFastIterator.fastNext(() => 1)).toEqual(1);
    expect(emptyFastIterator.next()).toBe(fixedDoneIteratorResult);
  });

  it('Base', () => {
    class Test1 extends FastIteratorBase<number> {
      fastNext(): number {
        return 1;
      }
    }

    class Test2 extends FastIteratorBase<number> {
      fastNext<O>(otherwise?: OptLazy<O>): number | O {
        return OptLazy(otherwise)!;
      }
    }

    const t1 = new Test1();
    expect(t1.next()).toEqual({ done: false, value: 1 });

    const t2 = new Test2();
    expect(t2.next()).toEqual({ done: true, value: undefined });
  });
});
