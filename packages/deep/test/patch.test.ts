import { HashMap } from '@rimbu/hashed';
import { List } from '@rimbu/list';
import { Literal, patch, Tuple } from '../src';

describe('patch', () => {
  it('handles null', () => {
    expect(
      patch({ value: 'a' as string | null, b: 1 })({ value: null })
    ).toEqual({
      value: null,
      b: 1,
    });
    expect(
      patch({ value: 'a' as string | null, b: 1 })({ value: () => null })
    ).toEqual({
      value: null,
      b: 1,
    });
    expect(
      patch({
        value: { nested: 'a' } as { nested: string } | null,
        b: 1,
      })({ value: null })
    ).toEqual({
      value: null,
      b: 1,
    });
    expect(
      patch({
        value: { nested: 'a' } as { nested: string } | null,
        b: 1,
      })({ value: () => null })
    ).toEqual({
      value: null,
      b: 1,
    });
  });

  it('handles undefined', () => {
    expect(() =>
      patch({ value: 'a' as string | undefined, b: 1 })({
        value: undefined,
      })
    ).toThrow();

    expect(
      patch({ value: 'a' as string | undefined, b: 1 })({
        value: Literal.of(undefined),
      })
    ).toEqual({ value: undefined, b: 1 });

    expect(
      patch({ value: 'a' as string | undefined, b: 1 })({
        value: () => undefined,
      })
    ).toEqual({
      value: undefined,
      b: 1,
    });

    expect(() =>
      patch({
        value: { nested: 'a' } as { nested: string } | undefined,
        b: 1,
      })({ value: undefined })
    ).toThrow();

    expect(
      patch({
        value: { nested: 'a' } as { nested: string } | undefined,
        b: 1,
      })({ value: Literal.of(undefined) })
    ).toEqual({
      value: undefined,
      b: 1,
    });

    expect(
      patch({
        value: { nested: 'a' } as { nested: string } | undefined,
        b: 1,
      })({ value: () => undefined })
    ).toEqual({
      value: undefined,
      b: 1,
    });

    expect(
      patch({
        value: undefined as { nested: string; b: number } | undefined,
        b: 1,
      })({ value: { nested: 'a' } })
    ).toEqual({
      value: undefined,
      b: 1,
    });

    expect(
      patch({
        value: undefined as { nested: string; b: number } | undefined,
        b: 1,
      })({ value: Literal.of({ nested: 'a', b: 1 }) })
    ).toEqual({
      value: { nested: 'a', b: 1 },
      b: 1,
    });

    expect(
      patch({
        value: undefined as { nested: string; b: number } | undefined,
        b: 1,
      })({ value: () => ({ nested: 'a', b: 1 }) })
    ).toEqual({
      value: { nested: 'a', b: 1 },
      b: 1,
    });
  });

  it('does multiple updates', () => {
    const obj = { v: 0 };
    function inc(o: typeof obj) {
      return { v: o.v + 1 };
    }
    expect(patch(obj)(inc, inc, inc)).toMatchObject({ v: 3 });
  });

  it('updates object', () => {
    const obj = {
      value: 1,
      nested: { prop1: 'a', prop2: true },
      nested2: { foo: 5 },
    };

    expect(patch(obj)({ value: 2 })).toMatchObject({
      value: 2,
      nested: { prop1: 'a', prop2: true },
      nested2: { foo: 5 },
    });
    expect(patch(obj)({ value: (v) => v + 1 })).toMatchObject({
      value: 2,
      nested: { prop1: 'a', prop2: true },
      nested2: { foo: 5 },
    });
    expect(patch(obj)({ nested: { prop1: 'b' } })).toMatchObject({
      value: 1,
      nested: { prop1: 'b', prop2: true },
      nested2: { foo: 5 },
    });
    expect(
      patch(obj)({ value: (v) => v + 1, nested: { prop1: 'b' } })
    ).toMatchObject({
      value: 2,
      nested: { prop1: 'b', prop2: true },
      nested2: { foo: 5 },
    });
    expect(
      patch(obj)({ nested: { prop1: (v, p, r) => v + p.prop2 } })
    ).toMatchObject({
      value: 1,
      nested: { prop1: 'atrue', prop2: true },
      nested2: { foo: 5 },
    });
    expect(
      patch(obj)({ nested: { prop1: (v, p, r) => v + r.value } })
    ).toMatchObject({
      value: 1,
      nested: { prop1: 'a1', prop2: true },
      nested2: { foo: 5 },
    });
    expect(
      patch(obj)({ value: 5 }, { nested: { prop1: (v, p, r) => v + r.value } })
    ).toMatchObject({
      value: 5,
      nested: { prop1: 'a5', prop2: true },
      nested2: { foo: 5 },
    });

    // Should not compile:
    // expect(
    //   patch(obj,{
    //     nested: n => {
    //       n.prop1 = '';
    //       return n;
    //     }
    //   })
    // );
  });

  it('does not perform unnecessary updates', () => {
    const obj = {
      value: 1,
      nested: { prop1: 'a', prop2: true },
      nested2: { foo: 5 },
    };

    expect(patch(obj)({ value: 1 })).toBe(obj);
    expect(patch(obj)({ value: () => 1 })).toBe(obj);
    expect(patch(obj)({ nested2: { foo: 5 } })).toBe(obj);
    expect(patch(obj)({ nested2: { foo: () => 5 } })).toBe(obj);
    expect(patch(obj)({ nested: { prop1: 'a', prop2: true } })).toBe(obj);
    expect(patch(obj)({ nested: { prop1: () => 'a' } })).toBe(obj);
  });

  it('updates function', () => {
    const f1 = () => 1;
    const f2 = () => 2;
    expect(patch({ a: f1 })({ a: () => f2 })).toEqual({ a: f2 });
    expect(patch({ a: f1 })({ a: Literal.of(f2) })).toEqual({ a: f2 });
  });

  it('updates list', () => {
    const obj = {
      list: List.of(1),
    };

    expect(patch(obj)({ list: Literal.of(List.of(2)) })).toEqual({
      list: List.of(2),
    });
    expect(patch(obj)({ list: (v) => v.append(2) })).toEqual({
      list: List.of(1, 2),
    });
    expect(patch(obj)({ list: (v) => v.remove(10).assumeNonEmpty() })).toEqual(
      obj
    );
    expect(
      patch(obj as { list: List<number> })({ list: (v) => v.remove(10) })
    ).toEqual(obj);

    // Should not compile
    // expect(patch(obj)({ list: v => { length: 3 })).toEqual({ list: List.of(1, 2) });
    // expect(patch(obj)({ list: v => v.remove(10) })).toEqual(obj);
  });

  it('updates map', () => {
    const obj = {
      personAge: HashMap.of(['Jim', 25], ['Bob', 56]),
    };

    expect(patch(obj)({ personAge: (s) => s.updateAt('Jim', 26) })).toEqual({
      personAge: HashMap.of(['Jim', 26], ['Bob', 56]),
    });

    expect(
      patch(obj)({ personAge: (m) => m.updateAt('Jim', (v) => v + 1) })
    ).toEqual({
      personAge: HashMap.of(['Jim', 26], ['Bob', 56]),
    });

    expect(patch(obj)({ personAge: (m) => m.set('Alice', 19) })).toEqual({
      personAge: HashMap.of(['Jim', 25], ['Bob', 56], ['Alice', 19]),
    });
  });

  it('replaces values', () => {
    const obj = {
      value: 1,
      nested: { prop1: 'a', prop2: true },
      nested2: { foo: 5 },
    };

    const repl = {
      value: 2,
      nested: { prop1: 'b', prop2: false },
      nested2: { foo: 6 },
    };
    expect(patch(obj)(Literal.of(repl))).toBe(repl);
    expect(patch(obj)({ nested2: Literal.of({ foo: 6 }) })).toMatchObject({
      value: 1,
      nested: { prop1: 'a', prop2: true },
      nested2: { foo: 6 },
    });
    expect(
      patch(obj)({ nested: Literal.of({ prop1: 'b', prop2: true }) })
    ).toMatchObject({
      value: 1,
      nested: { prop1: 'b', prop2: true },
      nested2: { foo: 5 },
    });
  });

  it('handles arrays', () => {
    // expect(() => patch({ a: [1, 2] })({ a: [3, 4] })).toThrow();
    expect(patch({ a: [1, 2] })({ a: Literal.of([3, 4]) })).toEqual({
      a: [3, 4],
    });
    expect(patch({ a: [1, 2] })({ a: { 0: (v) => v + 2 } })).toEqual({
      a: [3, 2],
    });
    expect(patch({ a: [1, 2] })({ a: { 1: (v, p) => v + p[0] } })).toEqual({
      a: [1, 3],
    });
    expect(patch({ a: [1, 2] })({ a: { 4: (v, p) => v + p[0] } })).toEqual({
      a: [1, 2],
    });
  });

  it('handles tuples', () => {
    expect(patch({ a: Tuple.of(1, 'a') })({ a: { 0: 2 } })).toEqual({
      a: [2, 'a'],
    });
    expect(patch({ a: Tuple.of(1, 'a') })({ a: { 0: (v) => v + 1 } })).toEqual({
      a: [2, 'a'],
    });
    expect(
      patch({ a: { b: Tuple.of(1, 'a'), c: 3 }, e: 5 })({
        a: { b: { 0: (v, p, r) => v + p[0] + r.e }, c: (v, p) => v + p.c },
        e: (v, p) => v + p.e,
      })
    ).toEqual({
      a: { b: [7, 'a'], c: 6 },
      e: 10,
    });
  });

  it('handles other cases', () => {
    expect(patch(true)(Literal.of(false))).toBe(false);
    expect(patch(true)(() => false)).toBe(false);
  });
});
