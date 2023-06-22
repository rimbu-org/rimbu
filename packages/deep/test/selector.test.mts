import { List } from '@rimbu/list';
import { select } from '../src';

describe('Selector', () => {
  const m = {
    a: 1,
    b: ['abc', 'def'],
    c: {
      d: true,
      e: [1, 'a'] as [number, string] | null,
    },
    f: List.of(1, 2, 3),
  };

  it('select', () => {
    expect(select(m, 'a')).toBe(1);
    expect(select(m, ['a', 'b[0]'] as const)).toEqual([1, 'abc']);
    expect(select(m, { a: 'a', b: 'c.e?.[0]' })).toEqual({ a: 1, b: 1 });
  });
});
