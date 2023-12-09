import { Stream, Tuple } from '@rimbu/core';
import { SortedMap } from '../src/main/index.mjs';

describe('SortedMap issues fixed by PRs', () => {
  it('from SortedSet issue #189: remove should not use reference equality', () => {
    const set1 = SortedMap.of([Tuple.of(1, 'a'), 'q'], [Tuple.of(2, 'b'), 'v']);

    expect(set1.getAtIndex(0)).toEqual([[1, 'a'], 'q']);
    expect(set1.hasKey([1, 'a'])).toBe(true);

    const s2 = set1.removeKey([1, 'a']);
    expect(s2.size).toBe(1);
  });

  it('from SortedSet issue #188: `getAtIndex` causes TypeError', () => {
    let map = SortedMap.from<number, number>([]);

    for (const i of Stream.range({ start: 0, end: 5 })) {
      // add [0 .. 10], [10 .. 20], [20 .. 30] ...
      map = map.addEntries(
        Stream.range({ start: i * 10, amount: 10 }).map((v) => [v, -v])
      );
      expect(map.getAtIndex(-1)).toEqual([i * 10 + 9, -(i * 10 + 9)]);
    }
  });
});
