import { List } from '@rimbu/list';

import { Tuple, patch } from '../src/index.mjs';

describe('patch', () => {
  it('undefined', () => {
    expect(patch(undefined, undefined)).toBeUndefined();
    expect(patch(undefined, () => undefined)).toBeUndefined();
    expect(patch(undefined, (v) => v)).toBeUndefined();
    expect(patch(undefined, (v, p) => p)).toBeUndefined();
    expect(patch(undefined, (v, p, r) => r)).toBeUndefined();
  });

  it('null', () => {
    expect(patch(null, null)).toBeNull();
    expect(patch(null, () => null)).toBeNull();
    expect(patch(null, (v) => v)).toBeNull();
    expect(patch(null, (v, p) => p)).toBeNull();
    expect(patch(null, (v, p, r) => r)).toBeNull();
  });

  it('number', () => {
    const value: number = 1;
    expect(patch(value, value)).toBe(value);
    expect(patch(value, value + 1)).toBe(value + 1);
    expect(patch(value, () => value)).toBe(value);
    expect(patch(value, () => value + 1)).toBe(value + 1);
    expect(patch(value, (v) => v + 1)).toBe(value + 1);
    expect(patch(value, (v, p) => p + 1)).toBe(value + 1);
    expect(patch(value, (v, p, r) => r + 1)).toBe(value + 1);
  });

  it('string', () => {
    const value: string = 'a';
    expect(patch(value, value)).toBe(value);
    expect(patch(value, `${value}b`)).toBe(`${value}b`);
    expect(patch(value, () => value)).toBe(value);
    expect(patch(value, () => `${value}b`)).toBe(`${value}b`);
    expect(patch(value, (v) => `${v}b`)).toBe(`${value}b`);
    expect(patch(value, (v, p) => `${p}b`)).toBe(`${value}b`);
    expect(patch(value, (v, p, r) => `${r}b`)).toBe(`${value}b`);
  });

  it('boolean', () => {
    const value = false as boolean;
    expect(patch(value, value)).toBe(value);
    expect(patch(value, !value)).toBe(!value);
    expect(patch(value, () => value)).toBe(value);
    expect(patch(value, () => !value)).toBe(!value);
    expect(patch(value, (v) => !v)).toBe(!value);
    expect(patch(value, (v, p) => !p)).toBe(!value);
    expect(patch(value, (v, p, r) => !r)).toBe(!value);
  });

  it('symbol', () => {
    const value: symbol = Symbol();
    const newValue: symbol = Symbol();
    expect(patch(value, value)).toBe(value);
    expect(patch(value, newValue)).toBe(newValue);
    expect(patch(value, () => value)).toBe(value);
    expect(patch(value, () => newValue)).toBe(newValue);
    expect(patch(value, (v) => v)).toBe(value);
    expect(patch(value, (v, p) => p)).toBe(value);
    expect(patch(value, (v, p, r) => r)).toBe(value);
  });

  it('simple object', () => {
    const value = { a: 1 };

    expect(patch(value, value)).toBe(value);
    {
      const v2 = { a: 1 };
      expect(patch(value, v2)).toBe(v2);
    }
    {
      const v2 = { a: 2 };
      expect(patch(value, v2)).toBe(v2);
    }
    expect(patch(value, [{ a: 1 }])).toBe(value);
    {
      const v2 = { a: 2 };
      expect(patch(value, [v2])).toEqual(v2);
      expect(patch(value, [v2])).not.toBe(v2);
    }

    expect(patch(value, [{ a: (v) => v }])).toBe(value);
    expect(patch(value, [{ a: (v) => v + 1 }])).toEqual({ a: 2 });
    expect(patch(value, [{ a: (v, p) => p.a + 1 }])).toEqual({ a: 2 });
    expect(patch(value, [{ a: (v, p, r) => r.a + 1 }])).toEqual({ a: 2 });
    expect(patch(value, [{ a: (v) => v + 1 }, { a: (v) => v + 1 }])).toEqual({
      a: 3,
    });

    expect(patch(value, () => value)).toBe(value);
    expect(patch(value, (v) => v)).toBe(value);
    expect(patch(value, (v, p) => p)).toBe(value);
    expect(patch(value, (v, p, r) => r)).toBe(value);
    expect(patch(value, () => [{ a: 1 }])).toBe(value);
    expect(patch(value, () => [{ a: (v) => v }])).toBe(value);
    expect(patch(value, () => [{ a: (v) => v + 1 }])).toEqual({ a: 2 });
    expect(patch(value, () => [{ a: (v, p) => p.a + 1 }])).toEqual({ a: 2 });
    expect(patch(value, () => [{ a: (v, p, r) => r.a + 1 }])).toEqual({ a: 2 });
    expect(
      patch(value, () => [{ a: (v) => v + 1 }, { a: (v) => v + 1 }])
    ).toEqual({
      a: 3,
    });

    expect(value).toEqual({ a: 1 });
  });

  it('simple object with two props', () => {
    const value = { a: 1, b: 'a' };

    expect(patch(value, value)).toBe(value);
    {
      const v2 = { a: 1, b: 'a' };
      expect(patch(value, v2)).toBe(v2);
    }
    {
      const v2 = { a: 2, b: 'b' };
      expect(patch(value, v2)).toBe(v2);
    }
    expect(patch(value, [{ a: 1 }])).toBe(value);
    expect(patch(value, [{ a: 2 }])).toEqual({ a: 2, b: 'a' });
    expect(patch(value, [{ a: (v) => v }])).toBe(value);
    expect(patch(value, [{ a: (v) => v + 1 }])).toEqual({ a: 2, b: 'a' });
    expect(patch(value, [{ a: (v) => v + 1 }, { a: (v) => v + 1 }])).toEqual({
      a: 3,
      b: 'a',
    });

    expect(patch(value, () => value)).toBe(value);
    expect(patch(value, (v) => v)).toBe(value);
    expect(patch(value, (v, p) => p)).toBe(value);
    expect(patch(value, (v, p, r) => r)).toBe(value);
    {
      const v2 = { a: 1, b: 'a' };
      expect(patch(value, () => v2)).toBe(v2);
    }
    {
      const v2 = { a: 2, b: 'b' };
      expect(patch(value, () => v2)).toBe(v2);
    }
    expect(patch(value, [{ a: 1 }])).toBe(value);
    expect(patch(value, () => [{ a: 2 }])).toEqual({ a: 2, b: 'a' });
    expect(patch(value, [{ a: (v) => v }])).toBe(value);
    expect(patch(value, [{ a: (v) => v + 1 }])).toEqual({ a: 2, b: 'a' });
    expect(patch(value, [{ a: (v) => v + 1 }, { a: (v) => v + 1 }])).toEqual({
      a: 3,
      b: 'a',
    });

    expect(value).toEqual({ a: 1, b: 'a' });
  });

  it('nested object', () => {
    const value = { a: 1, b: { c: { d: true, e: 'a' } } };

    expect(patch(value, value)).toBe(value);
    {
      const v2: typeof value = { a: 2, b: { c: { d: false, e: 'f' } } };
      expect(patch(value, v2)).toBe(v2);
    }
    expect(patch(value, [{ a: 2 }])).toEqual({ ...value, a: 2 });
    expect(patch(value, [{ a: 2 }]).b).toBe(value.b);
    expect(patch(value, [{ a: (v) => v + 1 }])).toEqual({ ...value, a: 2 });
    expect(patch(value, [{ a: (v) => v + 1 }]).b).toBe(value.b);
    expect(patch(value, [{ b: [{ c: [{ d: true }] }] }])).toBe(value);
    expect(patch(value, [{ b: [{ c: [{ d: () => true }] }] }])).toBe(value);
    expect(patch(value, [{ b: [{ c: [{ d: (v) => v }] }] }])).toBe(value);
    expect(patch(value, [{ b: [{ c: [{ d: (v, p) => p.d }] }] }])).toBe(value);
    expect(patch(value, [{ b: [{ c: [{ d: (v, p, r) => r.b.c.d }] }] }])).toBe(
      value
    );

    expect(patch(value, () => value)).toBe(value);
    expect(patch(value, (v) => v)).toBe(value);
    expect(patch(value, (v, p) => p)).toBe(value);
    expect(patch(value, (v, p, r) => r)).toBe(value);
    {
      const v2: typeof value = { a: 2, b: { c: { d: false, e: 'f' } } };
      expect(patch(value, () => v2)).toBe(v2);
    }
    expect(patch(value, () => [{ a: 2 }])).toEqual({ ...value, a: 2 });
    expect(patch(value, () => [{ a: 2 }]).b).toBe(value.b);
    expect(patch(value, () => [{ a: (v) => v + 1 }])).toEqual({
      ...value,
      a: 2,
    });
    expect(patch(value, () => [{ a: (v) => v + 1 }]).b).toBe(value.b);
    expect(patch(value, () => [{ b: [{ c: [{ d: true }] }] }])).toBe(value);
    expect(patch(value, () => [{ b: [{ c: [{ d: () => true }] }] }])).toBe(
      value
    );
    expect(patch(value, () => [{ b: [{ c: [{ d: (v) => v }] }] }])).toBe(value);
    expect(patch(value, () => [{ b: [{ c: [{ d: (v, p) => p.d }] }] }])).toBe(
      value
    );
    expect(
      patch(value, () => [{ b: [{ c: [{ d: (v, p, r) => r.b.c.d }] }] }])
    ).toBe(value);

    expect(value).toEqual({ a: 1, b: { c: { d: true, e: 'a' } } });
  });

  it('simple array', () => {
    const value = [1, 2, 3];

    expect(patch(value, value)).toBe(value);
    {
      const v2 = [1, 2, 3];
      expect(patch(value, v2)).toBe(v2);
    }
    {
      const v2 = [4, 5];
      expect(patch(value, v2)).toBe(v2);
    }
    {
      const v2: typeof value = [];
      expect(patch(value, v2)).toBe(v2);
    }

    expect(patch(value, () => value)).toBe(value);
    expect(patch(value, (v) => v)).toBe(value);
    expect(patch(value, (v, p) => p)).toBe(value);
    expect(patch(value, (v, p, r) => r)).toBe(value);
    {
      const v2 = [1, 2, 3];
      expect(patch(value, () => v2)).toBe(v2);
    }
    {
      const v2 = [4, 5];
      expect(patch(value, () => v2)).toBe(v2);
    }
    {
      const v2: typeof value = [];
      expect(patch(value, () => v2)).toBe(v2);
    }

    expect(value).toEqual([1, 2, 3]);
  });

  it('simple tuple', () => {
    const value = Tuple.of(1, 'a', true);

    expect(patch(value, value)).toBe(value);
    {
      const v2 = Tuple.of(2, 'b', false);
      expect(patch(value, v2)).toBe(v2);
    }
    expect(patch(value, {})).toBe(value);
    expect(patch(value, { 0: 1 })).toBe(value);
    expect(patch(value, { 0: 2 })).toEqual([2, 'a', true]);
    expect(patch(value, { 1: 'b', 2: false })).toEqual([1, 'b', false]);
    expect(patch(value, { 0: (v) => v + 1 })).toEqual([2, 'a', true]);
    expect(patch(value, { 0: (v, p) => p[0] + 1 })).toEqual([2, 'a', true]);
    expect(patch(value, { 0: (v, p, r) => r[0] + 1 })).toEqual([2, 'a', true]);

    expect(patch(value, () => value)).toBe(value);
    expect(patch(value, (v) => v)).toBe(value);
    expect(patch(value, (v, p) => p)).toBe(value);
    expect(patch(value, (v, p, r) => r)).toBe(value);
    expect(patch(value, () => ({}))).toBe(value);
    expect(patch(value, () => ({ 0: 1 }))).toBe(value);
    expect(patch(value, () => ({ 0: 2 }))).toEqual([2, 'a', true]);
    expect(patch(value, () => ({ 1: 'b', 2: false }))).toEqual([1, 'b', false]);
    expect(patch(value, () => ({ 0: (v) => v + 1 }))).toEqual([2, 'a', true]);
    expect(patch(value, () => ({ 0: (v, p) => p[0] + 1 }))).toEqual([
      2,
      'a',
      true,
    ]);
    expect(patch(value, () => ({ 0: (v, p, r) => r[0] + 1 }))).toEqual([
      2,
      'a',
      true,
    ]);

    expect(value).toEqual(Tuple.of(1, 'a', true));
  });

  it('nested tuple', () => {
    const value = Tuple.of(1, { a: 2, b: true }, true);

    expect(patch(value, { 1: { a: 2, b: true } })).toEqual(value);
    expect(patch(value, { 1: { a: 2, b: true } })).not.toBe(value);
    expect(patch(value, { 1: [{ a: 2 }] })).toBe(value);
    expect(patch(value, { 1: [{ a: 3 }] })).toEqual([
      1,
      { a: 3, b: true },
      true,
    ]);
    expect(patch(value, { 1: [{ a: (v) => v + 1 }] })).toEqual([
      1,
      { a: 3, b: true },
      true,
    ]);
    expect(patch(value, { 1: [{ a: (v, p) => p.a + 1 }] })).toEqual([
      1,
      { a: 3, b: true },
      true,
    ]);
    expect(patch(value, { 1: [{ a: (v, p, r) => r[1].a + 1 }] })).toEqual([
      1,
      { a: 3, b: true },
      true,
    ]);

    expect(patch(value, () => ({ 1: { a: 2, b: true } }))).toEqual(value);
    expect(patch(value, () => ({ 1: { a: 2, b: true } }))).not.toBe(value);
    expect(patch(value, () => ({ 1: [{ a: 2 }] }))).toBe(value);
    expect(patch(value, () => ({ 1: [{ a: 3 }] }))).toEqual([
      1,
      { a: 3, b: true },
      true,
    ]);
    expect(patch(value, () => ({ 1: [{ a: (v) => v + 1 }] }))).toEqual([
      1,
      { a: 3, b: true },
      true,
    ]);
    expect(patch(value, () => ({ 1: [{ a: (v, p) => p.a + 1 }] }))).toEqual([
      1,
      { a: 3, b: true },
      true,
    ]);
    expect(
      patch(value, () => ({ 1: [{ a: (v, p, r) => r[1].a + 1 }] }))
    ).toEqual([1, { a: 3, b: true }, true]);

    expect(value).toEqual(Tuple.of(1, { a: 2, b: true }, true));
  });

  it('non-plain object', () => {
    const value = new Set([1, 2, 3]);

    expect(patch(value, value)).toBe(value);
    expect(patch(value, () => value)).toBe(value);
    expect(patch(value, (v) => v)).toBe(value);
    expect(patch(value, (v, p) => p)).toBe(value);
    expect(patch(value, (v, p, r) => r)).toBe(value);
    expect(patch(value, (v) => new Set([...v, 4]))).toEqual(
      new Set([1, 2, 3, 4])
    );

    expect(value).toEqual(new Set([1, 2, 3]));
  });

  it('immutable object', () => {
    const value = List.of(1, 2, 3);

    expect(patch(value, value)).toBe(value);
    expect(patch(value, () => value)).toBe(value);
    expect(patch(value, (v) => v)).toBe(value);
    expect(patch(value, (v) => v.updateAt(0, 1))).toBe(value);
    expect(patch(value, (v) => v.take(2)).toArray()).toEqual([1, 2]);

    expect(value).toEqual(List.of(1, 2, 3));
  });

  it('nested sequence', () => {
    const value = { a: 1, b: { c: { d: true, e: 1 } } };

    expect(
      patch(value, [
        { b: [{ c: [{ e: (v) => v + 1 }] }] },
        { b: [{ c: [{ e: (v) => v + 1 }] }] },
      ])
    ).toEqual({ a: 1, b: { c: { d: true, e: 3 } } });
    expect(
      patch(value, [
        { b: [{ c: [{ e: (v, p) => p.e + 1 }] }] },
        { b: [{ c: [{ e: (v, p) => p.e + 1 }] }] },
      ])
    ).toEqual({ a: 1, b: { c: { d: true, e: 3 } } });
    expect(
      patch(value, [
        { b: [{ c: [{ e: (v, p, r) => r.b.c.e + 1 }] }] },
        { b: [{ c: [{ e: (v, p, r) => r.b.c.e + 1 }] }] },
      ])
    ).toEqual({ a: 1, b: { c: { d: true, e: 3 } } });

    expect(
      patch(value, [
        { b: [{ c: [{ e: (v) => v + 1 }] }] },
        { b: [{ c: [{ e: (v, p) => p.e + 1 }] }] },
        { b: [{ c: [{ e: (v, p, r) => r.b.c.e + 1 }] }] },
      ])
    ).toEqual({ a: 1, b: { c: { d: true, e: 4 } } });

    expect(value).toEqual({ a: 1, b: { c: { d: true, e: 1 } } });
  });

  it('functions', () => {
    const value = () => 5;

    expect(patch(value, value)).toBe(value);
    {
      const v2 = () => 3;
      expect(patch(value, v2)).toBe(v2);
    }
  });

  it('circular obj', () => {
    const value = { a: 1, b: 2 };

    expect(
      patch(value, [{ a: (v, p) => p.b + 1, b: (v, p) => p.a + 1 }])
    ).toEqual({ a: 3, b: 2 });
    expect(
      patch(value, [{ a: (v, p, r) => r.b + 1, b: (v, p, r) => r.a + 1 }])
    ).toEqual({ a: 3, b: 2 });
    expect(
      patch({ q: value }, [
        { q: [{ a: (v, p) => p.b + 1, b: (v, p) => p.a + 1 }] },
      ])
    ).toEqual({ q: { a: 3, b: 2 } });
    expect(
      patch({ q: value }, [
        { q: [{ a: (v, p, r) => r.q.b + 1, b: (v, p, r) => r.q.a + 1 }] },
      ])
    ).toEqual({ q: { a: 3, b: 2 } });

    expect(value).toEqual({ a: 1, b: 2 });
  });

  it('circular Tuple', () => {
    const tup = Tuple.of(1, 2);

    expect(
      patch(tup, {
        0: (v, p) => p[1] + 1,
        1: (v, p) => p[0] + 1,
      })
    ).toEqual([3, 2]);
    expect(
      patch(tup, {
        0: (v, p, r) => r[1] + 1,
        1: (v, p, r) => r[0] + 1,
      })
    ).toEqual([3, 2]);
    expect(
      patch({ q: tup }, [
        {
          q: {
            0: (v, p) => p[1] + 1,
            1: (v, p) => p[0] + 1,
          },
        },
      ])
    ).toEqual({ q: [3, 2] });
    expect(
      patch({ q: tup }, [
        {
          q: {
            0: (v, p, r) => r.q[1] + 1,
            1: (v, p, r) => r.q[0] + 1,
          },
        },
      ])
    ).toEqual({ q: [3, 2] });

    expect(tup).toEqual(Tuple.of(1, 2));
  });

  it('undefined props', () => {
    const value: { a: number | undefined } = { a: 1 };
    expect(patch(value, [{ a: undefined }])).toEqual({ a: undefined });
  });

  it('mixed undefined value', () => {
    const value = { a: 1 } as { a: number } | undefined;
    expect(patch(value, undefined)).toBeUndefined();
    expect(patch(undefined as typeof value, value)).toBe(value);
  });

  it('returns updated object as parent', () => {
    expect(
      patch({ count: 0, total: 10 }, [
        { count: (v) => v + 1 },
        { total: (v, p) => v + p.count },
      ])
    ).toEqual({ count: 1, total: 11 });

    expect(
      patch({ nest: { count: 0, total: 10 } }, [
        { nest: [{ count: (v) => v + 1 }] },
        { nest: [{ total: (v, p) => v + p.count }] },
      ])
    ).toEqual({ nest: { count: 1, total: 11 } });
  });

  it('returns updated object as root', () => {
    expect(
      patch({ count: 0, total: 10 }, [
        { count: (v) => v + 1 },
        { total: (v, p, r) => v + r.count },
      ])
    ).toEqual({ count: 1, total: 11 });

    expect(
      patch({ nest: { count: 0, total: 10 } }, [
        { nest: [{ count: (v) => v + 1 }] },
        { nest: [{ total: (v, p, r) => v + r.nest.count }] },
      ])
    ).toEqual({ nest: { count: 1, total: 11 } });
  });
});
