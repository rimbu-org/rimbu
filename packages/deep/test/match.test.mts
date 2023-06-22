import { List } from '@rimbu/list';
import { SortedMap } from '@rimbu/sorted';
import { match } from '../src';
import { Tuple } from '../src';

describe('match', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('matches simple', () => {
    expect(match({ a: 1 }, { a: 1 })).toBe(true);
    expect(match({ a: 1 }, { a: 2 })).toBe(false);
    expect(match({ a: 1 }, { a: (v) => v < 2 })).toBe(true);
    expect(match({ a: 1 }, { a: (v) => v > 2 })).toBe(false);
  });

  it('matches simple with provider function', () => {
    expect(match({ a: 1 }, () => ({ a: 1 }))).toBe(true);
    expect(match({ a: 1 }, () => ({ a: 2 }))).toBe(false);
    expect(match({ a: 1 }, () => ({ a: (v) => v < 2 }))).toBe(true);
    expect(match({ a: 1 }, () => ({ a: (v) => v > 2 }))).toBe(false);
  });

  it('matches deep', () => {
    expect(match({ a: { b: 1, c: 2 } }, { a: { b: 1 } })).toBe(true);
    expect(match({ a: { b: 1, c: 2 } }, { a: { b: 2 } })).toBe(false);
    expect(match({ a: { b: 1, c: 2 } }, { a: { b: (v) => v < 2 } })).toBe(true);
    expect(match({ a: { b: 1, c: 2 } }, { a: { b: (v) => v > 2 } })).toBe(
      false
    );
  });

  it('matches deep with provider function', () => {
    expect(match({ a: { b: 1, c: 2 } }, () => ({ a: { b: 1 } }))).toBe(true);
    expect(match({ a: { b: 1, c: 2 } }, () => ({ a: { b: 2 } }))).toBe(false);
    expect(
      match({ a: { b: 1, c: 2 } }, () => ({ a: { b: (v) => v < 2 } }))
    ).toBe(true);
    expect(
      match({ a: { b: 1, c: 2 } }, () => ({ a: { b: (v) => v > 2 } }))
    ).toBe(false);
  });

  it('matches null', () => {
    expect(match({ v: null as null }, {})).toBe(true);
    expect(match({ v: null as null }, { v: null })).toBe(true);
    expect(match({ v: { a: 1 } as { a: number } | null }, { v: null })).toBe(
      false
    );
    expect(
      match({ v: null as { a: number } | null }, { v: (q) => q?.a === 1 })
    ).toBe(false);
  });

  it('matches undefined', () => {
    expect(match({ v: undefined as undefined }, { v: undefined })).toBe(true);
    expect(match({ v: undefined as undefined }, { v: () => undefined })).toBe(
      true
    );
    expect(
      match(
        { v: { a: 1 } as { a: number } | undefined },
        {
          v: undefined,
        }
      )
    ).toBe(false);
  });

  it('handles array', () => {
    expect(match({ s: [1] }, { s: [] })).toBe(false);
    expect(match({ s: [1, 2, 3] }, { s: [1, 2, 3] })).toBe(true);
    expect(match({ s: [1, 2, 3] }, { s: [1, 2, 4] })).toBe(false);
    expect(match({ s: [1] }, { s: [1, 2] })).toBe(false);
    expect(match({ s: [1] }, { s: (v) => v.length > 3 })).toBe(false);
    expect(match({ s: [1] }, { s: (v) => v.length < 3 })).toBe(true);
    expect(match({ s: [1, 2, 3] }, { s: { 1: 2, 2: 3 } })).toBe(true);
    expect(match({ s: [1, 2, 3] }, { s: { 1: 2, 3: 5 } })).toBe(false);
    expect(match({ s: [1, 2, 3] }, { s: { some: [{ 0: 1 }, { 1: 3 }] } })).toBe(
      true
    );
    expect(
      match({ s: [1, 2, 3] }, { s: { every: [{ 0: 1 }, { 1: 3 }] } })
    ).toBe(false);
    expect(match({ s: [1, 2, 3] }, { s: { none: [{ 0: 1 }, { 1: 3 }] } })).toBe(
      false
    );
    expect(
      match({ s: [1, 2, 3] }, { s: { single: [{ 0: 1 }, { 1: 3 }] } })
    ).toBe(true);
  });

  it('handles deep array', () => {
    const values = [
      { x: [1, 2, 3], y: 6 },
      { x: [10, 11], y: 10 },
    ];
    expect(match(values, values)).toBe(true);
    expect(match(values, [{ x: { 0: 1 } }, { y: 10 }])).toBe(true);
    expect(match(values, [{ x: { 0: 1 } }, { y: 12 }])).toBe(false);

    expect(match(values, { someItem: { x: { someItem: 2 } } })).toBe(true);
    expect(match(values, { someItem: { x: { someItem: 0 } } })).toBe(false);

    expect(match(values, { someItem: { y: (v) => v > 8 } })).toBe(true);
    expect(match(values, { everyItem: { y: (v) => v > 8 } })).toBe(false);
  });

  it('handles array traversal', () => {
    const values = [
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ];

    expect(match(values, { someItem: { a: 0 } })).toBe(false);
    expect(match(values, { someItem: { a: 3 } })).toBe(true);

    expect(match(values, { everyItem: { a: 1 } })).toBe(false);
    expect(match(values, { everyItem: { a: (v) => v > 0 } })).toBe(true);

    expect(match(values, { noneItem: { a: 1 } })).toBe(false);
    expect(match(values, { noneItem: { a: 0 } })).toBe(true);

    expect(match(values, { singleItem: { a: 1 } })).toBe(true);
    expect(match(values, { singleItem: { a: 0 } })).toBe(false);
    expect(match(values, { singleItem: { a: (v) => v > 0 } })).toBe(false);

    expect(
      match(
        { values },
        {
          values: {
            everyItem: (v, p, r) => p[0].a === r.values[0].a,
          },
        }
      )
    ).toBe(true);
  });

  it('handles tuples', () => {
    expect(
      match({ s: Tuple.of(true, { q: 5 }) }, { s: Tuple.of(true, { q: 5 }) })
    ).toBe(true);
    expect(match({ s: Tuple.of(true, { q: 5 }) }, { s: { 0: true } })).toBe(
      true
    );
    expect(match({ s: Tuple.of(true, { q: 5 }) }, { s: { 1: { q: 5 } } })).toBe(
      true
    );
    expect(match({ s: Tuple.of(true, { q: 5 }) }, { s: { 1: { q: 3 } } })).toBe(
      false
    );
    expect(
      match({ s: Tuple.of(true, { q: 5 }) }, () => ({
        s: { 1: { q: (v: number) => v > 3 } },
      }))
    ).toBe(true);
    expect(
      match({ s: Tuple.of(true, { q: 5 }) }, () => ({
        s: { 1: { q: (v: number) => v < 3 } },
      }))
    ).toBe(false);
  });

  it('matches object', () => {
    const obj = {
      value: 1,
      nested: { prop1: 'a', prop2: true },
      nested2: { foo: [5] },
    };

    expect(match(obj, { value: 1 })).toBe(true);
    expect(match(obj, { value: 2 })).toBe(false);
    expect(match(obj, { value: (v) => v > 0 })).toBe(true);
    expect(match(obj, { value: (v) => v < 0 })).toBe(false);
    expect(match(obj, { nested: { prop1: 'a' } })).toBe(true);
    expect(match(obj, { nested: { prop1: 'b' } })).toBe(false);
    expect(match(obj, { nested: { prop1: (v) => v.length > 0 } })).toBe(true);
    expect(match(obj, { nested: { prop1: (v) => v.length === 0 } })).toBe(
      false
    );
    expect(
      match(obj, { nested: { prop1: (_, p) => p.prop1.length > 0 } })
    ).toBe(true);
    expect(
      match(obj, { nested: { prop1: (_, p) => p.prop1.length === 0 } })
    ).toBe(false);
    expect(
      match(obj, {
        nested: { prop1: (_, __, r) => r.nested.prop1.length > 0 },
      })
    ).toBe(true);
    expect(
      match(obj, {
        nested: { prop1: (_, __, r) => r.nested.prop1.length === 0 },
      })
    ).toBe(false);
    expect(match(obj, { value: () => 2 })).toBe(false);
  });

  it('matches function', () => {
    const f = () => 1;
    expect(match({ a: { b: f } }, { a: { b: f } })).toBe(true);
    expect(match({ a: { b: f } }, { a: () => ({ b: f }) })).toBe(true);
    expect(match({ a: { b: f } }, { a: () => ({ b: () => 1 }) })).toBe(false);
    expect(match({ a: { b: f } }, { a: (v) => v.b === (() => 1) })).toBe(false);
  });

  it('matches list', () => {
    const l = List.of(1);
    expect(match({ s: l }, { s: l })).toBe(true);
    expect(match({ s: l }, { s: () => l })).toBe(true);
    expect(match({ s: l }, { s: List.of(1) })).toBe(false);
    expect(match({ s: l }, { s: (v) => v.stream().equals(List.of(1)) })).toBe(
      true
    );
  });

  it('matches map', () => {
    const obj = {
      personAge: SortedMap.of(['Jim', 25], ['Bob', 56]),
    };
    expect(
      match(obj, {
        personAge: (l) => l.size > 0,
      })
    ).toBe(true);
    expect(
      match(obj, {
        personAge: (l) => l.size === 0,
      })
    ).toBe(false);
    expect(
      match(obj, {
        personAge: SortedMap.of(['Jim', 25], ['Bob', 56]),
      })
    ).toBe(false);
  });

  it('matches some matchers using the `some` provider', () => {
    expect(match({ a: 1 }, ['some', { a: 1 }, { a: (v) => v > 0 }])).toBe(true);
    expect(match({ a: 1 }, ['some', { a: 2 }, { a: (v) => v > 0 }])).toBe(true);
    expect(match({ a: 1 }, ['some', { a: 1 }, { a: (v) => v > 10 }])).toBe(
      true
    );
    expect(match({ a: 1 }, ['some', { a: 2 }, { a: (v) => v > 10 }])).toBe(
      false
    );
  });

  it('matches every matchers using the `every` provider', () => {
    expect(match({ a: 1 }, ['every', { a: 1 }, { a: (v) => v > 0 }])).toBe(
      true
    );
    expect(match({ a: 1 }, ['every', { a: 2 }, { a: (v) => v > 0 }])).toBe(
      false
    );
    expect(match({ a: 1 }, ['every', { a: 1 }, { a: (v) => v > 10 }])).toBe(
      false
    );
    expect(match({ a: 1 }, ['every', { a: 2 }, { a: (v) => v > 10 }])).toBe(
      false
    );
  });

  it('matches none matchers using the `none` provider', () => {
    expect(match({ a: 1 }, ['none', { a: 1 }, { a: (v) => v > 0 }])).toBe(
      false
    );
    expect(match({ a: 1 }, ['none', { a: 2 }, { a: (v) => v > 0 }])).toBe(
      false
    );
    expect(match({ a: 1 }, ['none', { a: 1 }, { a: (v) => v > 10 }])).toBe(
      false
    );
    expect(match({ a: 1 }, ['none', { a: 2 }, { a: (v) => v > 10 }])).toBe(
      true
    );
  });

  it('matches one matcher using the `single` provider', () => {
    expect(match({ a: 1 }, ['single', { a: 1 }, { a: (v) => v > 0 }])).toBe(
      false
    );
    expect(match({ a: 1 }, ['single', { a: 2 }, { a: (v) => v > 0 }])).toBe(
      true
    );
    expect(match({ a: 1 }, ['single', { a: 1 }, { a: (v) => v > 10 }])).toBe(
      true
    );
    expect(match({ a: 1 }, ['single', { a: 2 }, { a: (v) => v > 10 }])).toBe(
      false
    );
  });

  it('matches booleans', () => {
    expect(match({ a: true }, { a: true })).toBe(true);
    expect(match({ a: true }, { a: false })).toBe(false);
    expect(match({ a: false }, { a: false })).toBe(true);
    expect(match({ a: false }, { a: true })).toBe(false);

    expect(match({ a: true }, { a: () => true })).toBe(true);
    expect(match({ a: true }, { a: () => false })).toBe(false);
    expect(match({ a: false }, { a: () => false })).toBe(false);
    expect(match({ a: false }, { a: () => true })).toBe(true);
  });

  it('matches non-plain data objects', () => {
    class B {
      constructor(readonly b: number) {}
    }
    const cls1 = new B(1);
    const cls2 = new B(2);

    expect(match({ a: cls1 }, { a: cls1 })).toBe(true);
    expect(match({ a: cls1 }, { a: cls2 })).toBe(false);
  });

  it('matches source objects that are not plain objects by reference', () => {
    class B {
      b: number;
      constructor(b: number) {
        this.b = b;
      }
    }
    const cls = new B(1);

    expect(
      match(
        {
          a: cls,
        },
        { a: { b: 1 } }
      )
    ).toBe(false);

    expect(
      match(
        {
          a: { b: 1 },
        },
        { a: cls }
      )
    ).toBe(true);
  });

  it('always returns false when receiving match keys that are not in the source object', () => {
    expect(match({ a: 1 }, { a: 1, b: 1 } as any)).toEqual(false);
    expect(match({ a: 1 }, () => ({ a: 1, b: 1 } as any))).toEqual(false);
  });
});
