import { isPlainObj } from '@rimbu/base';

describe('isPlainObj', () => {
  it('returns false for primitive types', () => {
    expect(isPlainObj(undefined)).toBe(false);
    expect(isPlainObj(5)).toBe(false);
    expect(isPlainObj('a')).toBe(false);
    expect(isPlainObj(true)).toBe(false);
    expect(isPlainObj(Symbol('a'))).toBe(false);
    expect(isPlainObj(BigInt(512))).toBe(false);
  });

  it('returns false for non-plain objects', () => {
    expect(isPlainObj(null)).toBe(false);
    expect(isPlainObj(new (class A {})())).toBe(false);
    expect(isPlainObj({ [Symbol.iterator]: null })).toBe(false);
    expect(isPlainObj({ [Symbol.asyncIterator]: null })).toBe(false);
  });

  it('returns true for plain objects', () => {
    expect(isPlainObj({})).toBe(true);
    expect(isPlainObj({ a: 1, b: { c: true } })).toBe(true);
  });
});
