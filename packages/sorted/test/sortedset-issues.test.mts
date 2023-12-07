import { SortedSet } from '../src/main/index.mjs';
import { Tuple } from '@rimbu/core';

describe('SortedSet issues fixed by PRs', () => {
  it('issue #189: remove should not use reference equality', () => {
    const set1 = SortedSet.of(Tuple.of(1, 'a'), Tuple.of(2, 'b'));

    expect(set1.getAtIndex(0)).toEqual([1, 'a']);
    expect(set1.has([1, 'a'])).toBe(true);

    const s2 = set1.remove([1, 'a']);
    expect(s2.size).toBe(1);
  });
});
