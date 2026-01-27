import { describe, it, expect } from 'bun:test';
import { Comp } from '../src/comp.mjs';

describe('Comp', () => {
  it('stringComp', () => {
    const c = Comp.stringComp();

    expect(c.compare('b', 'b')).toBe(0);
    expect(c.compare('b', 'c')).toBeLessThan(0);
    expect(c.compare('b', 'a')).toBeGreaterThan(0);
    expect(c.compare('a', 'A')).not.toBe(0);

    expect(c.compare('a', 'ab')).toBeLessThan(0);
    expect(c.compare('ab', 'a')).toBeGreaterThan(0);

    expect(c.isComparable('a')).toBe(true);
    expect(c.isComparable(5)).toBe(false);
  });

  it('stringCaseInsensitiveComp', () => {
    const c = Comp.stringCaseInsensitiveComp();

    expect(c.compare('b', 'b')).toBe(0);
    expect(c.compare('b', 'c')).toBeLessThan(0);
    expect(c.compare('b', 'a')).toBeGreaterThan(0);
    expect(c.compare('a', 'A')).toBe(0);
    expect(c.compare('aBCdEFg', 'ABcDEfG')).toBe(0);

    expect(c.compare('a', 'Ab')).toBeLessThan(0);
    expect(c.compare('ab', 'A')).toBeGreaterThan(0);

    expect(c.isComparable('a')).toBe(true);
    expect(c.isComparable(5)).toBe(false);
  });

  it('anyStringJSONComp', () => {
    const c = Comp.anyStringJSONComp();
    expect(c.compare({}, {})).toBe(0);
    expect(c.compare({ a: 1 }, { a: 1 })).toBe(0);
    expect(c.compare({ a: 1 }, { a: 2 })).toBeLessThan(0);
    expect(c.compare({ a: 3 }, { a: 2 })).toBeGreaterThan(0);

    expect(c.isComparable({})).toBe(true);
  });

  it('stringCharCodeComp', () => {
    const c = Comp.stringCharCodeComp();

    expect(c.compare('', '')).toBe(0);
    expect(c.compare('a', '')).toBeGreaterThan(0);
    expect(c.compare('', 'a')).toBeLessThan(0);

    expect(c.compare('a', 'ab')).toBeLessThan(0);
    expect(c.compare('ab', 'a')).toBeGreaterThan(0);

    expect(c.compare('b', 'a')).toBeGreaterThan(0);
    expect(c.compare('a', 'A')).not.toBe(0);

    expect(c.isComparable('a')).toBe(true);
    expect(c.isComparable(5)).toBe(false);
  });

  it('dateComp', () => {
    const c = Comp.dateComp();

    expect(c.compare(new Date(2020, 1, 1), new Date(2020, 1, 1))).toBe(0);
    expect(c.compare(new Date(2020, 1, 1), new Date(2020, 2, 1))).toBeLessThan(
      0
    );
    expect(
      c.compare(new Date(2020, 2, 1), new Date(2020, 1, 1))
    ).toBeGreaterThan(0);

    expect(c.isComparable(new Date())).toBe(true);
    expect(c.isComparable(new Date().toString())).toBe(false);
  });

  it('numberComp', () => {
    const c = Comp.numberComp();

    expect(c.compare(5, 5)).toBe(0);
    expect(c.compare(5, 7)).toBeLessThan(0);
    expect(c.compare(5, 3)).toBeGreaterThan(0);
    expect(c.compare(Number.NaN, Number.NaN)).toBe(0);
    expect(c.compare(Number.NaN, 1)).toBeLessThan(0);
    expect(c.compare(Number.NaN, Number.POSITIVE_INFINITY)).toBeGreaterThan(0);
    expect(c.compare(Number.NaN, Number.NEGATIVE_INFINITY)).toBeLessThan(0);

    expect(c.compare(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)).toBe(
      0
    );
    expect(c.compare(Number.POSITIVE_INFINITY, 1)).toBeGreaterThan(0);
    expect(c.compare(Number.POSITIVE_INFINITY, Number.NaN)).toBeGreaterThan(0);
    expect(
      c.compare(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY)
    ).toBeGreaterThan(0);

    expect(c.compare(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY)).toBe(
      0
    );
    expect(c.compare(Number.NEGATIVE_INFINITY, 1)).toBeLessThan(0);
    expect(c.compare(Number.NEGATIVE_INFINITY, Number.NaN)).toBeLessThan(0);
    expect(
      c.compare(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
    ).toBeLessThan(0);

    expect(c.isComparable(5)).toBe(true);
    expect(c.isComparable('')).toBe(false);
  });

  it('bigintComp', () => {
    const c = Comp.bigIntComp();

    expect(c.isComparable(BigInt(5))).toBe(true);
    expect(c.isComparable(5)).toBe(false);

    expect(c.compare(BigInt(5), BigInt(5))).toBe(0);
    expect(c.compare(BigInt(5), BigInt(10))).toBeLessThan(0);
    expect(c.compare(BigInt(5), BigInt(3))).toBeGreaterThan(0);
  });

  it('booleanComp', () => {
    const c = Comp.booleanComp();

    expect(c.compare(true, true)).toBe(0);
    expect(c.compare(true, true)).toBe(0);
    expect(c.compare(false, true)).toBeLessThan(0);
    expect(c.compare(true, false)).toBeGreaterThan(0);

    expect(c.isComparable(true)).toBe(true);
    expect(c.isComparable(false)).toBe(true);
    expect(c.isComparable(0)).toBe(false);
  });

  it('iterableComp', () => {
    const c = Comp.iterableComp();

    expect(c.compare('', '')).toBe(0);
    expect(c.compare('', 'a')).toBeLessThan(0);
    expect(c.compare('a', '')).toBeGreaterThan(0);
    expect(c.compare('a', 'a')).toBe(0);
    expect(c.compare('ab', 'a')).toBeGreaterThan(0);
  });

  it('iterableComp custom', () => {
    const c = Comp.iterableComp(Comp.numberComp());

    expect(c.compare([], [])).toBe(0);
    expect(c.compare([1, 2], [1, 2])).toBe(0);
    expect(c.compare([1], [1, 2])).toBeLessThan(0);
    expect(c.compare([1, 2], [1])).toBeGreaterThan(0);
    expect(c.compare([2, 1], [1, 2])).toBeGreaterThan(0);
  });

  it('anyFlatComp', () => {
    const c = Comp.anyFlatComp();

    expect(c.compare(1, 1)).toBe(0);
    expect(c.compare(1, 2)).toBeLessThan(0);
    expect(c.compare(1, 0)).toBeGreaterThan(0);
    expect(c.compare('b', 'b')).toBe(0);
    expect(c.compare('b', 'c')).toBeLessThan(0);
    expect(c.compare('b', 'a')).toBeGreaterThan(0);
    expect(c.compare('a', 'A')).not.toBe(0);

    expect(c.compare([1, 2], [1, 2])).toBe(0);
    expect(c.compare([1, 2], [1, 3])).toBeLessThan(0);
    expect(c.compare([1, 2], [1, 1])).toBeGreaterThan(0);

    expect(c.compare(['ab', 'c'], ['abc'])).not.toBe(0);

    expect(c.compare(new Boolean(true), new Boolean(true))).toBe(0);
    expect(c.compare(new Boolean(true), new Number(5))).not.toBe(0);

    expect(c.compare(0, true)).not.toBe(0);

    expect(c.compare(BigInt(0), BigInt(0))).toBe(0);
    expect(c.compare(BigInt(0), BigInt(5))).toBeLessThan(0);
    expect(c.compare(BigInt(5), BigInt(0))).toBeGreaterThan(0);

    expect(c.compare(true, true)).toBe(0);
    expect(c.compare(true, false)).toBeGreaterThan(0);

    expect(c.compare(null, null)).toBe(0);
    expect(c.compare(null, {})).toBeLessThan(0);
    expect(c.compare({}, null)).toBeGreaterThan(0);

    expect(c.compare([10], [2])).toBeLessThan(0);

    expect(c.isComparable(0)).toBe(true);
  });

  it('anyShallowComp', () => {
    const c = Comp.anyShallowComp();
    expect(c.compare([], [])).toBe(0);
    expect(c.compare([1, 2], [1, 2])).toBe(0);
    expect(c.compare([1], [1, 2])).toBeLessThan(0);
    expect(c.compare([1, 2], [1])).toBeGreaterThan(0);

    expect(c.compare([10], [2])).toBeGreaterThan(0);

    expect(c.compare([[10], [11]], [[2]])).toBeLessThan(0);

    expect(c.compare(1, 1)).toBe(0);
    expect(c.compare(1, 2)).toBeLessThan(0);
    expect(c.compare(1, 0)).toBeGreaterThan(0);
    expect(c.compare('b', 'b')).toBe(0);
    expect(c.compare('b', 'c')).toBeLessThan(0);
    expect(c.compare('b', 'a')).toBeGreaterThan(0);
    expect(c.compare('a', 'A')).not.toBe(0);

    expect(c.compare([1, 2], [1, 2])).toBe(0);
    expect(c.compare([1, 2], [1, 3])).toBeLessThan(0);
    expect(c.compare([1, 2], [1, 1])).toBeGreaterThan(0);

    expect(c.compare(['ab', 'c'], ['abc'])).toBeLessThan(0);
    expect(c.compare(['abc', 'c'], ['abc'])).toBeGreaterThan(0);
    expect(c.compare(['ab', 'c'], ['ab', 'c'])).toBe(0);
    expect(c.compare(['abc'], ['ab', 'c'])).toBeGreaterThan(0);
    expect(c.compare(['abc'], ['abc', 'c'])).toBeLessThan(0);
    expect(c.compare(['ab'], ['abc'])).toBeLessThan(0);
    expect(c.compare(['abc'], ['ab'])).toBeGreaterThan(0);

    expect(c.isComparable(0)).toBe(true);
  });

  it('anyDeepComp', () => {
    const c = Comp.anyDeepComp();

    expect(c.compare([10], [2])).toBeGreaterThan(0);

    expect(c.compare([[10], [11]], [[2]])).toBeGreaterThan(0);
  });

  it('withUndefined', () => {
    const c = Comp.withUndefined(Comp.numberComp());

    expect(c.compare(undefined, undefined)).toBe(0);
    expect(c.compare(undefined, 5)).toBeLessThan(0);
    expect(c.compare(5, undefined)).toBeGreaterThan(0);
    expect(c.compare(5, 3)).toBeGreaterThan(0);

    expect(c.isComparable(undefined)).toBe(true);
    expect(c.isComparable(5)).toBe(true);
    expect(c.isComparable('a')).toBe(false);
  });

  it('withNull', () => {
    const c = Comp.withNull(Comp.numberComp());

    expect(c.compare(null, null)).toBe(0);
    expect(c.compare(null, 5)).toBeLessThan(0);
    expect(c.compare(5, null)).toBeGreaterThan(0);
    expect(c.compare(5, 3)).toBeGreaterThan(0);

    expect(c.isComparable(null)).toBe(true);
    expect(c.isComparable(5)).toBe(true);
    expect(c.isComparable('a')).toBe(false);
  });

  it('invert', () => {
    const c = Comp.invert(Comp.numberComp());

    expect(c.compare(5, 5)).toBe(0);
    expect(c.compare(3, 5)).toBeGreaterThan(0);
    expect(c.compare(5, 3)).toBeLessThan(0);
  });

  it('objectComp', () => {
    const c = Comp.objectComp();

    expect(c.compare({}, {})).toBe(0);
    expect(c.compare({}, { a: 1 })).toBeLessThan(0);
    expect(c.compare({ a: 1 }, { a: 1 })).toBe(0);
    expect(c.compare({ a: 1 }, {})).toBeGreaterThan(0);
    expect(c.compare({ a: 1 }, { b: 1 })).toBeLessThan(0);
    expect(c.compare({ b: 1 }, { a: 1 })).toBeGreaterThan(0);
    expect(c.compare({ a: 1 }, { a: 2 })).toBeLessThan(0);
    expect(c.compare({ a: 2 }, { a: 1 })).toBeGreaterThan(0);
    expect(c.compare({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(0);
    expect(c.compare({ a: 1 }, { b: 2, a: 1 })).toBeLessThan(0);
    expect(c.compare({ b: 2, a: 1 }, { a: 1 })).toBeGreaterThan(0);
    expect(c.compare({ a: 1, b: 2 }, { a: 1, c: 2 })).toBeLessThan(0);
    expect(c.compare({ a: 1, c: 2 }, { a: 1, b: 2 })).toBeGreaterThan(0);
  });

  it('toEq', () => {
    const e = Comp.toEq(Comp.stringCaseInsensitiveComp());

    expect(e('b', 'b')).toBe(true);
    expect(e('b', 'a')).toBe(false);
    expect(e('b', 'c')).toBe(false);
    expect(e('b', 'B')).toBe(true);
  });
});
