import { List } from '@rimbu/list';

import { getAt, patchAt, Tuple } from '../src';

const m = {
  a: 1,
  b: ['abc', 'def'],
  c: {
    d: true,
    e: [1, 'a'] as [number, string] | null,
    f: null as [number, string] | null,
  },
  g: List.of(1, 2, 3),
};

describe('getAt', () => {
  it('gets simple props', () => {
    expect(getAt(m, '')).toBe(m);
    expect(getAt(m, 'a')).toBe(1);
    expect(getAt(m, 'b')).toBe(m.b);
    expect(getAt(m, 'c')).toBe(m.c);
    expect(getAt(m, 'g')).toBe(m.g);
    expect(getAt(m, 'c.d')).toBe(true);
    expect(getAt(m, 'c.e')).toBe(m.c.e);
  });

  it('gets in array', () => {
    expect(getAt(m, 'b[1]')).toBe(m.b[1]);
    expect(getAt(m, 'b[10]')).toBeUndefined();
  });

  it('gets in nullable array', () => {
    expect(getAt(m, 'c.e?.[0]')).toBe(1);
  });

  it('gets in nullable nested value', () => {
    const v = null as null | { a: number };
    expect(getAt(v, '?.a')).toBeUndefined();
  });
});

describe('patchAt', () => {
  it('patches simple props', () => {
    expect(patchAt(m, '', m)).toBe(m);
    expect(patchAt(m, 'a', 1)).toBe(m);
    expect(patchAt(m, 'a', 2)).toMatchObject({ a: 2 });
    expect(patchAt(m, 'a', (v) => v + 1)).toMatchObject({ a: 2 });
    expect(patchAt(m, 'c.d', false)).toMatchObject({
      c: { d: false },
    });
    expect(patchAt(m, 'c', [{ d: false }])).toMatchObject({
      c: { d: false },
    });
    expect(patchAt(m, 'c.d', (v) => !v)).toMatchObject({
      c: { d: false },
    });
  });

  it('patches optional props', () => {
    const q = {
      b: null as null | { a: number },
      c: { a: 1 } as null | { a: number },
    };
    expect(patchAt(q, 'b', null)).toBe(q);
    expect(patchAt(q, 'c', null)).toEqual({ b: null, c: null });
    expect(patchAt(q, '', [{ c: null }])).toEqual({ b: null, c: null });
  });

  it('patches array', () => {
    const q = {
      b: [1, 2, 3],
      c: 'a',
    };

    expect(patchAt(q, 'b', [10, 11])).toEqual({ b: [10, 11], c: 'a' });
  });

  it('patches tuple', () => {
    const q = {
      b: Tuple.of(1, 'a'),
      c: 'a',
    };

    expect(patchAt(q, 'b[0]', 2)).toEqual({ b: [2, 'a'], c: 'a' });
    expect(patchAt(q, 'b[0]', (v) => v + 1)).toEqual({ b: [2, 'a'], c: 'a' });
  });
});
