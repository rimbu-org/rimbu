import { List } from '@rimbu/list';

import { Deep } from '../src/index.mjs';

describe('Deep', () => {
  const m = {
    a: 1,
    b: ['abc', 'def'],
    c: {
      d: true,
      e: [1, 'a'] as [number, string] | null,
    },
    f: List.of(1, 2, 3),
  };

  type M = typeof m;

  it('getAt', () => {
    expect(Deep.getAt(m, 'a')).toBe(1);
    expect(Deep.getAt(m, 'b')).toBe(m.b);
    expect(Deep.getAt(m, 'c')).toBe(m.c);
    expect(Deep.getAt(m, 'f')).toBe(m.f);
    expect(Deep.getAt(m, 'c.d')).toBe(true);
    expect(Deep.getAt(m, 'c.e')).toBe(m.c.e);
  });

  it('matchAt', () => {
    expect(Deep.matchAt(m, 'a', 1)).toBe(true);
    expect(Deep.matchAt(m, 'a', 3)).toBe(false);
    expect(Deep.matchAt(m, 'c', { d: true })).toBe(true);
    expect(Deep.matchAt(m, 'c', { d: false })).toBe(false);
  });

  it('select simple', () => {
    expect(Deep.select(m, 'a')).toBe(1);
    expect(Deep.select(m, 'b')).toBe(m.b);
    expect(Deep.select(m, 'c')).toBe(m.c);
    expect(Deep.select(m, 'f')).toBe(m.f);
    expect(Deep.select(m, 'c.d')).toBe(m.c.d);
    expect(Deep.select(m, 'c.e')).toBe(m.c.e);
  });

  it('select function', () => {
    expect(Deep.select(m, (v) => v.b)).toBe(m.b);
    expect(Deep.select(m, (v) => v.c)).toBe(m.c);
    expect(Deep.select(m, (v) => v.f)).toBe(m.f);
    expect(Deep.select(m, (v) => v.c.d)).toBe(m.c.d);
    expect(Deep.select(m, (v) => v.c.e)).toBe(m.c.e);
    expect(Deep.select(m, (v) => v.a + 1)).toBe(2);
  });

  it('select complex', () => {
    expect(Deep.select(m, { m: 'a' })).toEqual({ m: 1 });
    expect(Deep.select(m, { m: 'a', q: 'c.d' })).toEqual({ m: 1, q: true });
    expect(Deep.select(m, { m: 'a', q: { n: 'c.d' } })).toEqual({
      m: m.a,
      q: { n: m.c.d },
    });
    expect(Deep.select(m, [])).toEqual([]);
    expect(Deep.select(m, ['a'])).toEqual([m.a]);
    expect(Deep.select(m, ['a', 'c.d'])).toEqual([m.a, m.c.d]);
    expect(Deep.select(m, ['a', { q: 'c.d' }])).toEqual([m.a, { q: m.c.d }]);
    expect(Deep.select(m, { h: ['a', { q: 'c.d' }] })).toEqual({
      h: [m.a, { q: m.c.d }],
    });
    expect(
      Deep.select(m, {
        h: ['a', (v) => v.a + 1, { q: 'c.d' }],
      })
    ).toEqual({
      h: [m.a, m.a + 1, { q: m.c.d }],
    });
  });

  it('selectAt simple', () => {
    const q = { m };

    expect(Deep.selectAt(q, 'm', 'a')).toBe(1);
    expect(Deep.selectAt(q, 'm', 'b')).toBe(m.b);
    expect(Deep.selectAt(q, 'm', 'c')).toBe(m.c);
    expect(Deep.selectAt(q, 'm', 'f')).toBe(m.f);
    expect(Deep.selectAt(q, 'm', 'c.d')).toBe(m.c.d);
    expect(Deep.selectAt(q, 'm', 'c.e')).toBe(m.c.e);
  });

  it('selectAt complex', () => {
    const q = { m };

    expect(Deep.selectAt(q, 'm', { m: 'a' })).toEqual({ m: 1 });
    expect(Deep.selectAt(q, 'm', { m: 'a', q: 'c.d' })).toEqual({
      m: 1,
      q: true,
    });
    expect(Deep.selectAt(q, 'm', { m: 'a', q: { n: 'c.d' } })).toEqual({
      m: m.a,
      q: { n: m.c.d },
    });
    expect(Deep.selectAt(q, 'm', [])).toEqual([]);
    expect(Deep.selectAt(q, 'm', ['a'])).toEqual([m.a]);
    expect(Deep.selectAt(q, 'm', ['a', 'c.d'])).toEqual([m.a, m.c.d]);
    expect(Deep.selectAt(q, 'm', ['a', { q: 'c.d' }])).toEqual([
      m.a,
      { q: m.c.d },
    ]);
    expect(Deep.selectAt(q, 'm', { h: ['a', { q: 'c.d' }] })).toEqual({
      h: [m.a, { q: m.c.d }],
    });
    expect(
      Deep.selectAt(q, 'm', {
        h: ['a', (v) => v.a + 1, { q: 'c.d' }],
      })
    ).toEqual({
      h: [m.a, m.a + 1, { q: m.c.d }],
    });
  });

  it('patchAt', () => {
    expect(Deep.patchAt(m, 'a', 1)).toBe(m);
    expect(Deep.patchAt(m, 'a', 2)).toMatchObject({ a: 2 });
    expect(Deep.patchAt(m, 'a', (v) => v + 1)).toMatchObject({ a: 2 });
    expect(Deep.patchAt(m, 'c.d', false)).toMatchObject({
      c: { d: false },
    });
    expect(Deep.patchAt(m, 'c.d', (v) => !v)).toMatchObject({
      c: { d: false },
    });

    expect(Deep.patchAt(m, 'c', [{ d: (v) => !v }])).toEqual({
      ...m,
      c: { ...m.c, d: false },
    });
  });

  it('withType returns same instance', () => {
    expect(Deep.withType<number>()).toBe(Deep.withType<string>());
  });

  it('withType.selectWith', () => {
    expect(Deep.withType<M>().selectWith('a')(m)).toBe(1);
  });

  it('withType.matchWith', () => {
    expect(Deep.withType<M>().matchWith({ a: 1 })(m)).toBe(true);
    expect(Deep.withType<M>().matchWith({ a: 3 })(m)).toBe(false);
  });

  it('withType.patchWith', () => {
    expect(Deep.withType<M>().patchWith([{ a: 1 }])(m)).toBe(m);
    expect(Deep.withType<M>().patchWith([{ a: 3 }])(m)).toEqual({ ...m, a: 3 });
  });

  it('withType.getAtWith', () => {
    expect(Deep.withType<M>().getAtWith('a')(m)).toBe(1);
    expect(Deep.withType<M>().getAtWith('c.d')(m)).toBe(true);
  });

  it('withType.matchWith', () => {
    expect(Deep.withType<M>().matchAtWith('a', 1)(m)).toBe(true);
    expect(Deep.withType<M>().matchAtWith('a', 2)(m)).toBe(false);
    expect(Deep.withType<M>().matchAtWith('c', { d: true })(m)).toBe(true);
    expect(Deep.withType<M>().matchAtWith('c', { d: false })(m)).toBe(false);
  });

  it('withType.patchWith', () => {
    expect(Deep.withType<M>().patchAtWith('c', [{ d: false }])(m)).toEqual({
      ...m,
      c: { ...m.c, d: false },
    });

    expect(Deep.withType<M>().patchAtWith('a', (v) => v + 1)(m)).toEqual({
      ...m,
      a: m.a + 1,
    });
  });

  it('withType.select', () => {
    expect(
      Deep.withType<M>().selectAtWith('c', {
        a: 'd',
        m: { c: (v) => v.e?.[0] },
      })(m)
    ).toEqual({
      a: m.c.d,
      m: { c: m.c.e?.[0] },
    });
  });

  it('protect', () => {
    expect(Deep.protect(m)).toBe(m);
  });

  it('Deep.getAtWith', () => {
    expect([{ a: 1 }, { a: 2 }].map(Deep.getAtWith('a'))).toEqual([1, 2]);
  });

  it('Deep.patchWith', () => {
    expect([{ a: 1 }, { a: 2 }].map(Deep.patchWith({ a: 5 }))).toEqual([
      { a: 5 },
      { a: 5 },
    ]);
    expect(
      [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
      ].map(Deep.patchWith([{ a: 5 }]))
    ).toEqual([
      { a: 5, b: 'a' },
      { a: 5, b: 'b' },
    ]);
  });

  it('Deep.patchAtWith', () => {
    expect(
      [{ a: { b: 'a', c: 1 } }, { a: { b: 'b', c: 2 } }].map(
        Deep.patchAtWith('a', [{ c: 5 }])
      )
    ).toEqual([{ a: { b: 'a', c: 5 } }, { a: { b: 'b', c: 5 } }]);

    expect(
      [{ a: { b: 'a', c: 1 } }, { a: { b: 'b', c: 2 } }].map(
        Deep.patchAtWith('a.c', (v) => v + 10)
      )
    ).toEqual([{ a: { b: 'a', c: 11 } }, { a: { b: 'b', c: 12 } }]);
  });

  it('create.matchWith', () => {
    expect([{ a: 1 }, { a: 2 }].filter(Deep.matchWith({ a: 2 }))).toEqual([
      { a: 2 },
    ]);
    expect(
      [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
      ].filter(Deep.matchWith({ a: 2 }))
    ).toEqual([{ a: 2, b: 'b' }]);
  });

  it('Deep.matchAtWith', () => {
    expect(
      [{ a: { b: 'a', c: 1 } }, { a: { b: 'b', c: 2 } }].filter(
        Deep.matchAtWith('a', { c: 2 })
      )
    ).toEqual([{ a: { b: 'b', c: 2 } }]);
  });

  it('Deep.selectWith', () => {
    expect(
      [{ a: { b: 'a', c: 1 } }, { a: { b: 'b', c: 2 } }].map(
        Deep.selectWith({ x: ['a.b'], y: { c: 'a.c' } })
      )
    ).toEqual([
      { x: ['a'], y: { c: 1 } },
      { x: ['b'], y: { c: 2 } },
    ]);
  });

  it('Deep.selectAtWith', () => {
    expect(
      [{ a: { b: 'a', c: 1 } }, { a: { b: 'b', c: 2 } }].map(
        Deep.selectAtWith('a', { x: ['b'], y: { c: 'c' } })
      )
    ).toEqual([
      { x: ['a'], y: { c: 1 } },
      { x: ['b'], y: { c: 2 } },
    ]);
  });
});
