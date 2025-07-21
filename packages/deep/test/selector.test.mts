import { List } from '@rimbu/list';

import { select } from '../src/index.mjs';

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

  it('select with previous', () => {
    {
      const res = select(m, 'a');
      const res2 = select(m, 'a', res);
      expect(res2).toBe(res);
    }
    {
      const res = select(m, { q: 'a', v: 'c.e?.[0]' });
      const res2 = select(m, { q: 'a', v: 'c.e?.[0]' }, res);
      expect(res2).toBe(res);
    }
    {
      const res = select(m, [{ q: 'a' }, 'c.e?.[0]']);
      const res2 = select(m, [{ q: 'a' }, 'c.e?.[0]'], res);
      expect(res2).toBe(res);
    }
    {
      // we do not deep compare function results
      const res = select(m, (v) => ({ q: v.a }));
      const res2 = select(m, (v) => ({ q: v.a }), res);
      expect(res2).toEqual(res);
      expect(res2).not.toBe(res);
    }
  });
});
