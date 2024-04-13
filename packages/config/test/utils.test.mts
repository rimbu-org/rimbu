import { cond, condFn } from '../src/index.mjs';

function condResultFor(value: any, ...cases: any[]) {
  return cond(...cases)(value)[0];
}

describe('cond', () => {
  it('throws error when no conditions match', () => {
    expect(() => condResultFor(0)).toThrow();
    expect(() => condResultFor(0, [1, 1])).toThrow();
  });

  it('matches simple cases', () => {
    expect(condResultFor(1, [1, 2])).toBe(2);
    expect(condResultFor('a', ['a', 2])).toBe(2);
    expect(condResultFor(3, [1, 2], [3, 4], [5, 6])).toBe(4);
  });

  it('matches function predicates', () => {
    expect(condResultFor(3, [(v: number) => v > 2, 'a'])).toBe('a');
    expect(condResultFor('abc', [(v: string) => v.length > 2, 1])).toBe(1);

    expect(condResultFor(1, [(v: number) => v > 2, 'a'], [true, 'q'])).toBe(
      'q'
    );
    expect(
      condResultFor('a', [(v: string) => v.length > 2, 1], [true, 10])
    ).toBe(10);
  });

  it('can use fallback value', () => {
    expect(condResultFor(3, [true, 10])).toBe(10);
    expect(condResultFor(3, [1, 2], [true, 10])).toBe(10);
  });

  it('can use boolean in any order', () => {
    expect(condResultFor(true, [false, 5], [true, 10])).toBe(10);
    expect(condResultFor(false, [false, 5], [true, 10])).toBe(5);
    expect(condResultFor(false, [true, 5], [false, 10])).toBe(10);
  });
});

function condFnResultFor(value: any, createCases: any) {
  return condFn(createCases)(value)[0];
}

describe('condFn', () => {
  it('throws error when no conditions match', () => {
    expect(() => condFnResultFor(0, () => [])).toThrow();
    expect(() => condFnResultFor(0, () => [[1, 1]])).toThrow();
  });

  it('allows using input value', () => {
    expect(condFnResultFor(0, (amount: number) => [[0, amount + 1]])).toBe(1);
    expect(
      condFnResultFor(5, (amount: number) => [
        [0, amount + 1],
        [1, amount + 2],
        [true, amount - 10],
      ])
    ).toBe(-5);
  });
});
