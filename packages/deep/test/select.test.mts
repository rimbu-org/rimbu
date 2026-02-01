import { describe, expect, it } from 'bun:test';

import { List } from '@rimbu/list';

import { select, selectAt, selectAtWith, selectWith } from '@rimbu/deep/select';

const m = {
  a: 1,
  b: ['abc', 'def'],
  c: {
    d: true,
    e: [1, 'a'] as [number, string] | null,
  },
  f: List.of(1, 2, 3),
};

describe('select', () => {
  it('select', () => {
    expect(select(m, 'a')).toBe(1);
    expect(select(m, ['a', 'b[0]'] as const)).toEqual([1, 'abc']);
    expect(select(m, { a: 'a', b: 'c.e?.[0]' })).toEqual({ a: 1, b: 1 });
  });

  it('select simple', () => {
    expect(select(m, 'a')).toBe(1);
    expect(select(m, 'b')).toBe(m.b);
    expect(select(m, 'c')).toBe(m.c);
    expect(select(m, 'f')).toBe(m.f);
    expect(select(m, 'c.d')).toBe(m.c.d);
    expect(select(m, 'c.e')).toBe(m.c.e);
  });

  it('select function', () => {
    expect(select(m, (v) => v.b)).toBe(m.b);
    expect(select(m, (v) => v.c)).toBe(m.c);
    expect(select(m, (v) => v.f)).toBe(m.f);
    expect(select(m, (v) => v.c.d)).toBe(m.c.d);
    expect(select(m, (v) => v.c.e)).toBe(m.c.e);
    expect(select(m, (v) => v.a + 1)).toBe(2);
  });

  it('select complex', () => {
    expect(select(m, { m: 'a' })).toEqual({ m: 1 });
    expect(select(m, { m: 'a', q: 'c.d' })).toEqual({ m: 1, q: true });
    expect(select(m, { m: 'a', q: { n: 'c.d' } })).toEqual({
      m: m.a,
      q: { n: m.c.d },
    });
    expect(select(m, [])).toEqual([]);
    expect(select(m, ['a'])).toEqual([m.a]);
    expect(select(m, ['a', 'c.d'])).toEqual([m.a, m.c.d]);
    expect(select(m, ['a', { q: 'c.d' }])).toEqual([m.a, { q: m.c.d }]);
    expect(select(m, { h: ['a', { q: 'c.d' }] })).toEqual({
      h: [m.a, { q: m.c.d }],
    });
    expect(
      select(m, {
        h: ['a', (v) => v.a + 1, { q: 'c.d' }],
      })
    ).toEqual({
      h: [m.a, m.a + 1, { q: m.c.d }],
    });
  });
});

describe('selectAt', () => {
  it('selectAt simple', () => {
    const q = { m };

    expect(selectAt(q, 'm', 'a')).toBe(1);
    expect(selectAt(q, 'm', 'b')).toBe(m.b);
    expect(selectAt(q, 'm', 'c')).toBe(m.c);
    expect(selectAt(q, 'm', 'f')).toBe(m.f);
    expect(selectAt(q, 'm', 'c.d')).toBe(m.c.d);
    expect(selectAt(q, 'm', 'c.e')).toBe(m.c.e);
  });

  it('selectAt complex', () => {
    const q = { m };

    expect(selectAt(q, 'm', { m: 'a' })).toEqual({ m: 1 });
    expect(selectAt(q, 'm', { m: 'a', q: 'c.d' })).toEqual({
      m: 1,
      q: true,
    });
    expect(selectAt(q, 'm', { m: 'a', q: { n: 'c.d' } })).toEqual({
      m: m.a,
      q: { n: m.c.d },
    });
    expect(selectAt(q, 'm', [])).toEqual([]);
    expect(selectAt(q, 'm', ['a'])).toEqual([m.a]);
    expect(selectAt(q, 'm', ['a', 'c.d'])).toEqual([m.a, m.c.d]);
    expect(selectAt(q, 'm', ['a', { q: 'c.d' }])).toEqual([m.a, { q: m.c.d }]);
    expect(selectAt(q, 'm', { h: ['a', { q: 'c.d' }] })).toEqual({
      h: [m.a, { q: m.c.d }],
    });
    expect(
      selectAt(q, 'm', {
        h: ['a', (v) => v.a + 1, { q: 'c.d' }],
      })
    ).toEqual({
      h: [m.a, m.a + 1, { q: m.c.d }],
    });
  });
});

describe('selectWith', () => {
  it('selects from input object', () => {
    expect(
      [{ a: { b: 'a', c: 1 } }, { a: { b: 'b', c: 2 } }].map(
        selectWith({ x: ['a.b'], y: { c: 'a.c' } })
      )
    ).toEqual([
      { x: ['a'], y: { c: 1 } },
      { x: ['b'], y: { c: 2 } },
    ]);
  });
});

describe('selectAtWith', () => {
  it('selects from input object at given path', () => {
    expect(
      [{ a: { b: 'a', c: 1 } }, { a: { b: 'b', c: 2 } }].map(
        selectAtWith('a', { x: ['b'], y: { c: 'c' } })
      )
    ).toEqual([
      { x: ['a'], y: { c: 1 } },
      { x: ['b'], y: { c: 2 } },
    ]);
  });
});
