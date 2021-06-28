import { List } from '@rimbu/list';
import { Literal, Path } from '../src';

describe('Path', () => {
  const m = {
    a: 1,
    b: ['abc', 'def'],
    c: {
      d: true,
      e: [1, 'a'] as [number, string] | null,
    },
    f: List.of(1, 2, 3),
  };

  it('getValue', () => {
    expect(Path.getValue(m, 'a')).toBe(1);
    expect(Path.getValue(m, 'b')).toBe(m.b);
    expect(Path.getValue(m, 'c')).toBe(m.c);
    expect(Path.getValue(m, 'f')).toBe(m.f);
    expect(Path.getValue(m, 'c.d')).toBe(true);
    expect(Path.getValue(m, 'c.e')).toBe(m.c.e);
  });

  it('patchValue', () => {
    expect(Path.patchValue(m, 'a', 5)).toMatchObject({ a: 5 });
    expect(Path.patchValue(m, 'a', (v) => v + 1)).toMatchObject({
      a: 2,
    });
    expect(Path.patchValue(m, 'b', Literal.of(['abc']))).toMatchObject({
      b: ['abc'],
    });
    expect(Path.patchValue(m, 'c.d', false)).toMatchObject({
      c: { d: false },
    });
    expect(Path.patchValue(m, 'c.d', (v) => !v)).toMatchObject({
      c: { d: false },
    });
    expect(Path.patchValue(m, 'c.e', Literal.of(null))).toMatchObject({
      c: { e: null },
    });
    expect(Path.patchValue(m, 'a', 1)).toBe(m);

    const l = List.of(5);
    expect(Path.patchValue(m, 'f', Literal.of(l))).toMatchObject({
      f: l,
    });
  });
});
