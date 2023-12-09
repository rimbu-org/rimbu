import { SortedSet } from '../src/main/index.mjs';
import { Stream, Tuple } from '@rimbu/core';

describe('SortedSet issues fixed by PRs', () => {
  it('issue #189: remove should not use reference equality', () => {
    const set1 = SortedSet.of(Tuple.of(1, 'a'), Tuple.of(2, 'b'));

    expect(set1.getAtIndex(0)).toEqual([1, 'a']);
    expect(set1.has([1, 'a'])).toBe(true);

    const s2 = set1.remove([1, 'a']);
    expect(s2.size).toBe(1);
  });

  it('issue #188: `getAtIndex` causes TypeError', () => {
    let set = SortedSet.from<number>([]);

    for (const i of Stream.range({ start: 0, end: 5 })) {
      // add [0 .. 10], [10 .. 20], [20 .. 30] ...
      set = set.addAll(Stream.range({ start: i * 10, amount: 10 }));
      expect(set.getAtIndex(-1)).toBe(i * 10 + 9);
    }
  });
});
