import { OptLazy, OptLazyOr } from '../src/index.mjs';

describe('OptLazy', () => {
  it('default', () => {
    const t1: number = OptLazy(1);
    const t2: number = OptLazy(() => 1);
    expect(t1).toBe(1);
    expect(t2).toBe(1);
  });

  it('OptLazyOr', () => {
    expect(OptLazyOr(1, 2)).toBe(1);
    expect(OptLazyOr(() => 1, 2)).toBe(1);
    expect(OptLazyOr((none) => none, 2)).toBe(2);
  });
});
