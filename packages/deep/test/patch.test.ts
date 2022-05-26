import { HashMap } from '@rimbu/hashed';
import { List } from '@rimbu/list';
import { Patch, patch, patchNested as $ } from '../src';

describe('patch', () => {
  it('handles null', () => {
    expect(
      patch({ value: 'a' as string | null, b: 1 }, { value: null })
    ).toEqual({
      value: null,
      b: 1,
    });
    expect(
      patch({ value: 'a' as string | null, b: 1 }, { value: () => null })
    ).toEqual({
      value: null,
      b: 1,
    });
    expect(
      patch(
        {
          value: { nested: 'a' } as { nested: string } | null,
          b: 1,
        },
        { value: null }
      )
    ).toEqual({
      value: null,
      b: 1,
    });
    expect(
      patch(
        {
          value: { nested: 'a' } as { nested: string } | null,
          b: 1,
        },
        { value: () => null }
      )
    ).toEqual({
      value: null,
      b: 1,
    });
    expect(
      patch({ value: null as string | null, b: 1 }, { value: 'a' })
    ).toEqual({
      value: 'a',
      b: 1,
    });
    expect(
      patch({ value: null as string | null, b: 1 }, { value: () => 'a' })
    ).toEqual({
      value: 'a',
      b: 1,
    });
  });

  it('handles undefined', () => {
    expect(() =>
      patch(
        { value: 'a' as string | undefined, b: 1 },
        {
          value: undefined,
        }
      )
    ).toThrow();

    expect(
      patch(
        { value: 'a' as string | undefined, b: 1 },
        {
          value: () => undefined,
        }
      )
    ).toEqual({
      value: undefined,
      b: 1,
    });

    expect(() =>
      patch(
        {
          value: { nested: 'a' } as { nested: string } | undefined,
          b: 1,
        },
        { value: undefined }
      )
    ).toThrow();

    expect(
      patch(
        {
          value: { nested: 'a' } as { nested: string } | undefined,
          b: 1,
        },
        { value: () => undefined }
      )
    ).toEqual({
      value: undefined,
      b: 1,
    });

    expect(
      patch(
        {
          value: undefined as { nested: string; b: number } | undefined,
          b: 1,
        },
        { value: $({ nested: 'a' }) }
      )
    ).toEqual({
      value: undefined,
      b: 1,
    });

    expect(
      patch(
        {
          value: undefined as { nested: string; b: number } | undefined,
          b: 1,
        },
        { value: $({ nested: 'a', b: 1 }) }
      )
    ).toEqual({
      value: undefined,
      b: 1,
    });

    expect(
      patch(
        {
          value: undefined as { nested: string; b: number } | undefined,
          b: 1,
        },
        { value: () => ({ nested: 'a', b: 1 }) }
      )
    ).toEqual({
      value: { nested: 'a', b: 1 },
      b: 1,
    });
  });

  it('does multiple updates', () => {
    const obj = { value: 0 };
    const inc: Patch<typeof obj> = {
      value: (v) => v + 1,
    };
    expect(patch(obj, inc, inc, inc)).toEqual({ value: 3 });

    expect(obj).toEqual({ value: 0 });
  });

  it('updates object', () => {
    const obj = {
      value: 1,
      nested: { prop1: 'a', prop2: true },
      nested2: { foo: 5 },
    };

    expect(patch(obj, { value: 2 })).toMatchObject({
      value: 2,
      nested: { prop1: 'a', prop2: true },
      nested2: { foo: 5 },
    });
    expect(patch(obj, { value: (v) => v + 1 })).toMatchObject({
      value: 2,
      nested: { prop1: 'a', prop2: true },
      nested2: { foo: 5 },
    });
    expect(patch(obj, { nested: $({ prop1: 'b' }) })).toMatchObject({
      value: 1,
      nested: { prop1: 'b', prop2: true },
      nested2: { foo: 5 },
    });
    expect(
      patch(obj, { value: (v) => v + 1, nested: $({ prop1: 'b' }) })
    ).toMatchObject({
      value: 2,
      nested: { prop1: 'b', prop2: true },
      nested2: { foo: 5 },
    });

    expect(
      patch(obj, { nested: $({ prop1: (v, p, r) => v + p.prop2 }) })
    ).toMatchObject({
      value: 1,
      nested: { prop1: 'atrue', prop2: true },
      nested2: { foo: 5 },
    });
    expect(
      patch(obj, { nested: $({ prop1: (v, p, r) => v + r.value }) })
    ).toMatchObject({
      value: 1,
      nested: { prop1: 'a1', prop2: true },
      nested2: { foo: 5 },
    });
    expect(
      patch(
        obj,
        { value: 5 },
        {
          nested: $({ prop1: (v, p, r) => v + r.value }),
        }
      )
    ).toMatchObject({
      value: 5,
      nested: { prop1: 'a5', prop2: true },
      nested2: { foo: 5 },
    });

    expect(obj).toEqual({
      value: 1,
      nested: { prop1: 'a', prop2: true },
      nested2: { foo: 5 },
    });
  });

  it('does not perform unnecessary updates', () => {
    const obj = {
      value: 1,
      nested: { prop1: 'a', prop2: true },
      nested2: { foo: 5 },
    };

    expect(patch(obj, { value: 1 })).toBe(obj);
    expect(patch(obj, { value: () => 1 })).toBe(obj);
    expect(patch(obj, { nested2: $({ foo: 5 }) })).toBe(obj);
    expect(patch(obj, { nested2: $({ foo: () => 5 }) })).toBe(obj);
    expect(patch(obj, { nested: $({ prop1: 'a', prop2: true }) })).toBe(obj);
    expect(patch(obj, { nested: $({ prop1: () => 'a' }) })).toBe(obj);

    expect(obj).toEqual({
      value: 1,
      nested: { prop1: 'a', prop2: true },
      nested2: { foo: 5 },
    });
  });

  // it('updates function', () => {
  //   const f1 = () => 1;
  //   const f2 = () => 2;
  //   expect(patch({ a: f1 }, { a: () => f2 })).toEqual({ a: f2 });
  // });

  it('updates list', () => {
    const obj = {
      list: List.of(1),
    };

    expect(patch(obj, { list: () => List.of(2) })).toEqual({
      list: List.of(2),
    });
    expect(patch(obj, { list: (v) => v.append(2) })).toEqual({
      list: List.of(1, 2),
    });
    expect(patch(obj, { list: (v) => v.remove(10).assumeNonEmpty() })).toBe(
      obj
    );
    expect(
      patch(obj as { list: List<number> }, { list: (v) => v.remove(10) })
    ).toBe(obj);

    expect(obj).toEqual({
      list: List.of(1),
    });
  });

  it('updates map', () => {
    const obj = {
      personAge: HashMap.of(['Jim', 25], ['Bob', 56]),
    };

    expect(patch(obj, { personAge: (s) => s.updateAt('Jim', 26) })).toEqual({
      personAge: HashMap.of(['Jim', 26], ['Bob', 56]),
    });

    expect(
      patch(obj, { personAge: (m) => m.updateAt('Jim', (v) => v + 1) })
    ).toEqual({
      personAge: HashMap.of(['Jim', 26], ['Bob', 56]),
    });

    expect(patch(obj, { personAge: (m) => m.set('Alice', 19) })).toEqual({
      personAge: HashMap.of(['Jim', 25], ['Bob', 56], ['Alice', 19]),
    });

    expect(obj).toEqual({
      personAge: HashMap.of(['Jim', 25], ['Bob', 56]),
    });
  });

  it('replaces values', () => {
    const obj = {
      nest1: {
        value: 1,
        nested: { prop1: 'a', prop2: true },
        nested2: { foo: 5 },
      },
    };

    const repl = {
      value: 2,
      nested: { prop1: 'b', prop2: false },
      nested2: { foo: 6 },
    };
    expect(patch(obj, { nest1: repl }).nest1).toBe(repl);
    expect(
      patch(obj, { nest1: $({ nested2: repl.nested2 }) }).nest1.nested2
    ).toBe(repl.nested2);
  });

  it('handles arrays', () => {
    // expect(() => patch({ a: [1, 2] })({ a: [3, 4] })).toThrow();
    expect(patch({ a: [1, 2] }, { a: [3, 4] })).toEqual({
      a: [3, 4],
    });
  });

  it('adds new props for indexed objects', () => {
    expect(patch({ a: 1 } as Record<string, number>, { b: 2 })).toEqual({
      a: 1,
      b: 2,
    });
  });

  it('throws an error when trying to update a non-existing key with a function', () => {
    expect(() =>
      patch({ a: 1 } as Record<string, number>, {
        a: (v) => v + 1,
        b: (v) => v + 1,
      })
    ).toThrow();
  });

  it('throws when trying to update __proto__', () => {
    expect(() =>
      // simulate object mocking prototype override
      patch({ a: 1 }, {
        get __proto__() {
          return null;
        },
      } as any)
    ).toThrow();
  });

  it('allows setting constructor to a value', () => {
    expect(patch({ constructor: 1 }, { constructor: 2 })).toEqual({
      constructor: 2,
    });
  });

  it('throws when trying to set constructor to a new function', () => {
    expect(() =>
      patch<unknown>({ constructor: () => 1 }, { constructor: () => () => 2 })
    ).toThrow();
  });

  it('throws when trying to update a non-plain object', () => {
    class A {
      v = 1;
    }
    const customClass = new A();
    expect(() => patch(customClass, { v: 2 })).toThrow();
  });

  it('supplies correct parent and root values for sequential updates', () => {
    const obj = {
      v1: { v2: 3 },
    };

    expect(
      patch(
        obj,
        { v1: $({ v2: (v) => v + 1 }) },
        { v1: $({ v2: (_, p) => p.v2 + 1 }) },
        { v1: $({ v2: (_, __, r) => r.v1.v2 + 1 }) }
      )
    ).toEqual({ v1: { v2: 6 } });
  });

  it('receives patch create function when passing function', () => {
    expect(
      patch({ a: { b: { c: 1, d: 'a' } } }, ($$) => ({
        a: $$({ b: { c: 2, d: 'b' } }),
      }))
    ).toEqual({ a: { b: { c: 2, d: 'b' } } });

    expect(
      patch(
        { a: { b: { c: 1 } } },
        ($$) => ({ a: $$({ b: $$({ c: 2 }) }) }),
        ($$) => ({ a: $$({ b: $$({ c: (v) => v + 1 }) }) })
      )
    ).toEqual({ a: { b: { c: 3 } } });
  });
});
