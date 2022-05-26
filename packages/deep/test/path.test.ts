import { List } from '@rimbu/list';
import { Path } from '../src';

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
    expect(Path.get(m, 'a')).toBe(1);
    expect(Path.get(m, 'b')).toBe(m.b);
    expect(Path.get(m, 'c')).toBe(m.c);
    expect(Path.get(m, 'f')).toBe(m.f);
    expect(Path.get(m, 'c.d')).toBe(true);
    expect(Path.get(m, 'c.e')).toBe(m.c.e);
  });

  it('updateValue', () => {
    expect(Path.update(m, 'a', 1)).toBe(m);
    expect(Path.update(m, 'a', 2)).toMatchObject({ a: 2 });
    expect(Path.update(m, 'a', (v) => v + 1)).toMatchObject({ a: 2 });
    expect(Path.update(m, 'c.d', false)).toMatchObject({
      c: { d: false },
    });
  });
});
