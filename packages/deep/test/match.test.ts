import { List } from '@rimbu/list';
import { SortedMap } from '@rimbu/sorted';
import { Literal, Match, Tuple } from '../src';

describe('Match.all', () => {
  it('matches null', () => {
    expect(Match.all({ v: null })({ v: null })).toBe(true);
    expect(
      Match.all({ v: { a: 1 } as { a: number } | null })({ v: null })
    ).toBe(false);
  });

  it('matches simple', () => {
    expect(Match.all(true)(true)).toBe(true);
    expect(Match.all(true)(true, true, true)).toBe(true);
    expect(Match.all(true)(true, true, false)).toBe(false);
    expect(Match.all(0)(0)).toBe(true);
    expect(Match.all(0)(1)).toBe(false);
    expect(Match.all('abc')('abc')).toBe(true);
    expect(Match.all('abc')('cbc')).toBe(false);
    expect(Match.all([1, 2, 3])({ 1: 2 })).toBe(true);
    expect(Match.all([1, 2, 3])({ 1: 3 })).toBe(false);
    expect(Match.all([1, 2, 3])(Literal.of([1, 2, 3]))).toBe(false);
  });

  it('matches undefined', () => {
    expect(Match.all(undefined)(Literal.of(undefined))).toBe(true);
    expect(Match.all(undefined as number | undefined)(1)).toBe(false);
    expect(Match.all(undefined as number | undefined)(Literal.of(1))).toBe(
      false
    );

    expect(() => Match.all({ v: undefined })({ v: undefined })).toThrow();
    expect(Match.all({ v: undefined })({ v: Literal.of(undefined) })).toBe(
      true
    );
    expect(
      Match.all({ v: { a: 1 } as { a: number } | undefined })({
        v: Literal.of(undefined),
      })
    ).toBe(false);
  });

  it('handles array', () => {
    expect(Match.all({ s: [1] })({ s: Literal.of([]) })).toBe(false);
    expect(Match.all({ s: [1] })({ s: Literal.of([1]) })).toBe(false);
    expect(Match.all({ s: [1, 2] })({ s: { 0: 1 } })).toBe(true);
    expect(Match.all({ s: [1, 2] })({ s: { 1: (v) => v > 1 } })).toBe(true);
    expect(Match.all({ s: [1] })((v) => v.s.length > 3)).toBe(false);
    expect(Match.all({ s: [1] })((v) => v.s.length < 3)).toBe(true);
  });

  it('matches tuple', () => {
    expect(Match.all({ s: Tuple.of('name', 34) })({ s: { 1: 34 } })).toBe(true);
    expect(Match.all({ s: Tuple.of('name', 34) })({ s: { 1: 35 } })).toBe(
      false
    );
    expect(
      Match.all({ s: Tuple.of('name', 34) })({ s: { 1: (v) => v > 10 } })
    ).toBe(true);
  });

  it('matches object', () => {
    const obj = {
      value: 1,
      nested: { prop1: 'a', prop2: true },
      nested2: { foo: [5] },
    };

    expect(Match.all(obj)({ value: 1 })).toBe(true);
    expect(Match.all(obj)({ value: 2 })).toBe(false);
    expect(Match.all(obj)({ value: (v) => v > 0 })).toBe(true);
    expect(Match.all(obj)({ value: (v) => v < 0 })).toBe(false);
    expect(Match.all(obj)({ nested: { prop1: 'a' } })).toBe(true);
    expect(Match.all(obj)({ nested: { prop1: 'b' } })).toBe(false);
    expect(Match.all(obj)({ nested: { prop1: (v) => v.length > 0 } })).toBe(
      true
    );
    expect(Match.all(obj)({ nested: { prop1: (v) => v.length === 0 } })).toBe(
      false
    );
    expect(
      Match.all(obj)({ nested: { prop1: (_, p) => p.prop1.length > 0 } })
    ).toBe(true);
    expect(
      Match.all(obj)({ nested: { prop1: (_, p) => p.prop1.length === 0 } })
    ).toBe(false);
    expect(
      Match.all(obj)({
        nested: { prop1: (_, __, r) => r.nested.prop1.length > 0 },
      })
    ).toBe(true);
    expect(
      Match.all(obj)({
        nested: { prop1: (_, __, r) => r.nested.prop1.length === 0 },
      })
    ).toBe(false);
  });

  it('matches function', () => {
    const f = () => 1;
    // expect(() => Match({ a: f }, { a: f })).toThrow();
    expect(Match.all({ a: f })({ a: Literal.of(f) })).toBe(true);
    expect(Match.all({ a: f })({ a: Literal.of(() => 1) })).toBe(false);
  });

  it('matches list', () => {
    expect(Match.all({ s: List.of(1) })({ s: Literal.of(List.of(1)) })).toBe(
      false
    );
    expect(Match.all({ s: List.of(1) })({ s: Literal.of(List.of(1, 2)) })).toBe(
      false
    );
    expect(Match.all({ s: List.of(1, 2) })({ s: Literal.of(List.of(1)) })).toBe(
      false
    );
  });

  it('matches map', () => {
    const obj = {
      personAge: SortedMap.of(['Jim', 25], ['Bob', 56]),
    };
    expect(
      Match.all(obj)({
        personAge: (l) => l.size > 0,
      })
    ).toBe(true);
    expect(
      Match.all(obj)({
        personAge: (l) => l.size === 0,
      })
    ).toBe(false);
    expect(
      Match.all(obj)({
        personAge: Literal.of(SortedMap.of(['Jim', 25], ['Bob', 56])),
      })
    ).toBe(false);
  });
});

describe('Match.all', () => {
  it('matches single', () => {
    const obj = { value: 1, nested: { p: 'foo' } };
    expect(Match.all(obj)({ nested: { p: (v) => v.length > 1 } })).toBe(true);
    expect(Match.all(obj)({ nested: { p: (v) => v.length < 1 } })).toBe(false);
  });

  it('matches multiple', () => {
    const obj = { value: 1, nested: { p: 'foo' } };
    expect(Match.all(obj)({ value: 1 }, { nested: { p: 'foo' } })).toBe(true);
    expect(Match.all(obj)({ value: 2 }, { nested: { p: 'foo' } })).toBe(false);
    expect(Match.all(obj)({ value: 1 }, { nested: { p: 'bla' } })).toBe(false);
  });
});

describe('Match.any', () => {
  it('matches one', () => {
    const obj = { value: 1, nested: { p: 'foo' } };
    expect(Match.any(obj)({ nested: { p: (v) => v.length > 1 } })).toBe(true);
    expect(Match.any(obj)({ nested: { p: (v) => v.length < 1 } })).toBe(false);
  });

  it('matches multiple', () => {
    const obj = { value: 1, nested: { p: 'foo' } };
    expect(Match.any(obj)({ value: 1 }, { nested: { p: 'foo' } })).toBe(true);
    expect(Match.any(obj)({ value: 2 }, { nested: { p: 'foo' } })).toBe(true);
    expect(Match.any(obj)({ value: 1 }, { nested: { p: 'bla' } })).toBe(true);
    expect(Match.any(obj)({ value: 2 }, { nested: { p: 'bla' } })).toBe(false);
  });
});
