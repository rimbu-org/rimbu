import { SortedMap, List } from '@rimbu/core';
import { match } from '@rimbu/deep';

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
    expect(match({ v: { a: 1 } as { a: number } | null }, { v: null })).toBe(
      false
    );
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
    expect(match({ s: [1] }, { s: [1] })).toBe(true);
    expect(match({ s: [1] }, { s: [1, 2] })).toBe(false);
    expect(match({ s: [1] }, { s: (v) => v.length > 3 })).toBe(false);
    expect(match({ s: [1] }, { s: (v) => v.length < 3 })).toBe(true);
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
    expect(match({ a: { b: f } }, { a: (v) => v.b === (() => 1) })).toBe(false);
  });

  it('matches list', () => {
    expect(match({ s: List.of(1) }, { s: List.of(1) })).toBe(true);
    expect(match({ s: List.of(1) }, { s: List.of(1, 2) })).toBe(false);
    expect(match({ s: List.of(1, 2) }, { s: List.of(1) })).toBe(false);
    expect(match({ s: List.of(1) }, { s: [1] })).toBe(true);
    expect(match({ s: List.of(1) }, { s: [1, 2] })).toBe(false);
    expect(match({ s: List.of(1, 2) }, { s: [1] })).toBe(false);
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

  it('matches some matchers using the some provider', () => {
    expect(
      match({ a: 1 }, ({ every }) => every({ a: 1 }, { a: (v) => v > 0 }))
    ).toBe(true);
    expect(
      match({ a: 1 }, ({ every }) => every({ a: 2 }, { a: (v) => v > 0 }))
    ).toBe(false);
    expect(
      match({ a: 1 }, ({ every }) => every({ a: 1 }, { a: (v) => v > 10 }))
    ).toBe(false);
    expect(
      match({ a: 1 }, ({ every }) => every({ a: 2 }, { a: (v) => v > 10 }))
    ).toBe(false);
  });

  it('matches every matchers using the every provider', () => {
    expect(
      match({ a: 1 }, ({ some }) => some({ a: 1 }, { a: (v) => v > 0 }))
    ).toBe(true);
    expect(
      match({ a: 1 }, ({ some }) => some({ a: 2 }, { a: (v) => v > 0 }))
    ).toBe(true);
    expect(
      match({ a: 1 }, ({ some }) => some({ a: 1 }, { a: (v) => v > 10 }))
    ).toBe(true);
    expect(
      match({ a: 1 }, ({ some }) => some({ a: 2 }, { a: (v) => v > 10 }))
    ).toBe(false);
  });

  it('matches none matchers using the none provider', () => {
    expect(
      match({ a: 1 }, ({ none }) => none({ a: 1 }, { a: (v) => v > 0 }))
    ).toBe(false);
    expect(
      match({ a: 1 }, ({ none }) => none({ a: 2 }, { a: (v) => v > 0 }))
    ).toBe(false);
    expect(
      match({ a: 1 }, ({ none }) => none({ a: 1 }, { a: (v) => v > 10 }))
    ).toBe(false);
    expect(
      match({ a: 1 }, ({ none }) => none({ a: 2 }, { a: (v) => v > 10 }))
    ).toBe(true);
  });

  it('matches one matcher using the single provider', () => {
    expect(
      match({ a: 1 }, ({ single }) => single({ a: 1 }, { a: (v) => v > 0 }))
    ).toBe(false);
    expect(
      match({ a: 1 }, ({ single }) => single({ a: 2 }, { a: (v) => v > 0 }))
    ).toBe(true);
    expect(
      match({ a: 1 }, ({ single }) => single({ a: 1 }, { a: (v) => v > 10 }))
    ).toBe(true);
    expect(
      match({ a: 1 }, ({ single }) => single({ a: 2 }, { a: (v) => v > 10 }))
    ).toBe(false);
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

  it('matches non-pure data objects as references', () => {
    const cls = new (class B {
      b = 1;
    })();

    expect(match({ a: { b: 1 } }, { a: cls })).toBe(false);

    expect(match({ a: cls }, { a: cls })).toBe(true);
  });

  it('matches objects that are not plain objects by reference', () => {
    expect(
      match(
        {
          a: new (class B {
            b = 1;
          })(),
        },
        { a: { b: 1 } }
      )
    ).toBe(false);
  });

  it('always returns false when receiving match keys that are not in the source object', () => {
    expect(match({ a: 1 }, { b: 1 } as any)).toEqual(false);
  });
});
