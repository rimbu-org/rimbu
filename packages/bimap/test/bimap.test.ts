import { Entry } from '@rimbu/base';
import type { ArrayNonEmpty } from '@rimbu/common';
import { Stream } from '@rimbu/stream';
import { BiMap } from '../src';

function expectEqual(map: BiMap<number, string>, arr: [number, string][]) {
  expect(new Map(map)).toEqual(new Map(arr));
}

describe('BiMap creators', () => {
  const arr3 = [
    [1, 'a'],
    [2, 'b'],
    [3, 'c'],
  ] as ArrayNonEmpty<[number, string]>;

  const arr6 = [
    [1, 'a'],
    [2, 'b'],
    [3, 'c'],
    [4, 'd'],
    [5, 'e'],
    [6, 'f'],
  ] as ArrayNonEmpty<[number, string]>;

  it('empty', () => {
    expect(BiMap.empty<number, string>()).toBe(BiMap.empty<boolean, Symbol>());
  });

  it('of', () => {
    expect(BiMap.of(...arr3).toArray()).toEqual(arr3);
    expectEqual(BiMap.of(...arr6), arr6);
    expect(BiMap.of([1, 'a'], [1, 'b']).toArray()).toEqual([[1, 'b']]);
  });

  it('from', () => {
    expect(BiMap.from(arr3).toArray()).toEqual(arr3);
    expectEqual(BiMap.from(arr6), arr6);
    expect(
      BiMap.from([
        [1, 'a'],
        [1, 'b'],
      ]).toArray()
    ).toEqual([[1, 'b']]);
    expect(
      BiMap.from([
        [1, 'a'],
        [1, 'b'],
        [2, 'b'],
      ]).toArray()
    ).toEqual([[2, 'b']]);

    expectEqual(BiMap.from([[1, 'a']], [[1, 'b']]), [[1, 'b']]);

    {
      const m = BiMap.from(arr3);
      expect(BiMap.from(m)).toBe(m);
    }
    {
      const c = BiMap.createContext();
      const m = c.of([1, 'a']);
      expect(BiMap.from(c.from(m))).not.toBe(m);
    }
  });

  it('reducer', () => {
    const source = Stream.of<readonly [number, string]>(
      [1, 'a'],
      [2, 'b'],
      [3, 'a']
    );
    {
      const result = source.reduce(BiMap.reducer());
      expectEqual(result, [
        [2, 'b'],
        [3, 'a'],
      ]);
    }

    {
      const result = source.reduce(
        BiMap.reducer([
          [4, 'b'],
          [5, 'q'],
        ])
      );
      expectEqual(result, [
        [2, 'b'],
        [3, 'a'],
        [5, 'q'],
      ]);
    }
  });
});

describe('BiMap methods', () => {
  const arr3 = [
    [1, 'a'],
    [2, 'b'],
    [3, 'c'],
  ] as ArrayNonEmpty<[number, string]>;

  const arr6 = [
    [1, 'a'],
    [2, 'b'],
    [3, 'c'],
    [4, 'd'],
    [5, 'e'],
    [6, 'f'],
  ] as ArrayNonEmpty<[number, string]>;

  const mapEmpty = BiMap.empty<number, string>();
  const map3_1 = BiMap.from(arr3);
  const map6_1 = BiMap.from(arr6);

  it('iterator', () => {
    expect(new Map(mapEmpty)).toEqual(new Map());
    expect(new Map(map3_1)).toEqual(new Map(arr3));
    expect(new Map(map6_1)).toEqual(new Map(arr6));
  });

  it('addEntries', () => {
    expect(mapEmpty.addEntries(mapEmpty)).toBe(mapEmpty);
    expectEqual(mapEmpty.addEntries(arr3), arr3);
    expectEqual(mapEmpty.addEntries(arr6), arr6);

    expect(map3_1.addEntries(mapEmpty)).toBe(map3_1);
    expectEqual(map3_1.addEntries(arr3), arr3);
    expectEqual(map3_1.addEntries(arr6), arr6);

    expect(map6_1.addEntries(mapEmpty)).toBe(map6_1);
    expectEqual(map6_1.addEntries(arr3), arr6);
    expectEqual(map6_1.addEntries(arr6), arr6);
  });

  it('addEntry', () => {
    expect(mapEmpty.addEntry([1, 'a']).toArray()).toEqual([[1, 'a']]);
    expect(mapEmpty.addEntry([1, 'a']).addEntry([1, 'b']).toArray()).toEqual([
      [1, 'b'],
    ]);

    expect(map3_1.addEntry([10, 'z']).getValue(10)).toBe('z');
    expect(map3_1.addEntry([10, 'z']).size).toBe(4);

    expect(map6_1.addEntry([10, 'z']).getValue(10)).toBe('z');
    expect(map6_1.addEntry([10, 'z']).size).toBe(7);
  });

  it('asNormal', () => {
    expect(map3_1.asNormal()).toBe(map3_1);
    expect(map6_1.asNormal()).toBe(map6_1);
  });

  it('assumeNonEmpty', () => {
    expect(() => mapEmpty.assumeNonEmpty()).toThrow();
    expect(map3_1.assumeNonEmpty()).toBe(map3_1);
    expect(map6_1.assumeNonEmpty()).toBe(map6_1);
  });

  it('context', () => {
    expect(mapEmpty.context).toBe(BiMap.defaultContext());
    expect(map3_1.context).toBe(BiMap.defaultContext());
    expect(map6_1.context).toBe(BiMap.defaultContext());
  });

  it('filter', () => {
    function isEvenKey(entry: readonly [number, string]): boolean {
      return entry[0] % 2 === 0;
    }

    function first2(
      entry: readonly [number, string],
      index: number,
      halt: () => void
    ): boolean {
      if (index > 0) halt();
      return true;
    }

    expect(mapEmpty.filter(isEvenKey)).toBe(mapEmpty);
    expectEqual(map3_1.filter(isEvenKey), [[2, 'b']]);
    expectEqual(map3_1.filter(first2), [
      [1, 'a'],
      [2, 'b'],
    ]);

    expectEqual(map6_1.filter(isEvenKey), [
      [2, 'b'],
      [4, 'd'],
      [6, 'f'],
    ]);
    expect(map6_1.filter(first2).size).toBe(2);
  });

  it('forEach', () => {
    let result = new Set<number>();

    mapEmpty.forEach((entry) => result.add(entry[0]));
    expect(result).toEqual(new Set());

    result = new Set();
    map3_1.forEach((entry) => result.add(entry[0]));
    expect(result).toEqual(new Set([1, 2, 3]));

    result = new Set();
    map6_1.forEach((entry) => result.add(entry[0]));
    expect(result).toEqual(new Set([1, 2, 3, 4, 5, 6]));
  });

  it('getKey', () => {
    expect(mapEmpty.getKey('b')).toBe(undefined);
    expect(mapEmpty.getKey('b', 'z')).toBe('z');
    expect(mapEmpty.getKey('b', () => 'z')).toBe('z');

    expect(map3_1.getKey('b')).toBe(2);
    expect(map3_1.getKey('b', 'z')).toBe(2);
    expect(map3_1.getKey('z')).toBe(undefined);
    expect(map3_1.getKey('z', 'o')).toBe('o');

    expect(map6_1.getKey('b')).toBe(2);
    expect(map6_1.getKey('b', 'z')).toBe(2);
    expect(map6_1.getKey('z')).toBe(undefined);
    expect(map6_1.getKey('z', 'o')).toBe('o');
  });

  it('getValue', () => {
    expect(mapEmpty.getValue(2)).toBe(undefined);
    expect(mapEmpty.getValue(2, 'z')).toBe('z');
    expect(mapEmpty.getValue(2, () => 'z')).toBe('z');

    expect(map3_1.getValue(2)).toBe('b');
    expect(map3_1.getValue(2, 'z')).toBe('b');
    expect(map3_1.getValue(10)).toBe(undefined);
    expect(map3_1.getValue(10, 'z')).toBe('z');

    expect(map6_1.getValue(2)).toBe('b');
    expect(map6_1.getValue(2, 'z')).toBe('b');
    expect(map6_1.getValue(10)).toBe(undefined);
    expect(map6_1.getValue(10, 'z')).toBe('z');
  });

  it('hasKey', () => {
    expect(mapEmpty.hasKey(2)).toBe(false);

    expect(map3_1.hasKey(2)).toBe(true);
    expect(map3_1.hasKey(10)).toBe(false);

    expect(map6_1.hasKey(2)).toBe(true);
    expect(map6_1.hasKey(10)).toBe(false);
  });

  it('hasValue', () => {
    expect(mapEmpty.hasValue('b')).toBe(false);

    expect(map3_1.hasValue('b')).toBe(true);
    expect(map3_1.hasValue('z')).toBe(false);

    expect(map6_1.hasValue('b')).toBe(true);
    expect(map6_1.hasValue('z')).toBe(false);
  });

  it('isEmpty', () => {
    expect(mapEmpty.isEmpty).toBe(true);
    expect(map3_1.isEmpty).toBe(false);
    expect(map6_1.isEmpty).toBe(false);
  });

  it('keyValueMap', () => {
    expect(mapEmpty.keyValueMap).toBe(mapEmpty.context.keyValueContext.empty());
    expect(map3_1.keyValueMap.size).toBe(3);
    expect(map6_1.keyValueMap.size).toBe(6);
  });

  it('nonEmpty', () => {
    expect(mapEmpty.nonEmpty()).toBe(false);
    expect(map3_1.nonEmpty()).toBe(true);
    expect(map6_1.nonEmpty()).toBe(true);
  });

  it('removeKey', () => {
    expect(mapEmpty.removeKey(2)).toBe(mapEmpty);
    expect(map3_1.removeKey(2).getValue(2)).toBe(undefined);
    expect(map3_1.removeKey(10)).toBe(map3_1);
    expect(map6_1.removeKey(2).getValue(2)).toBe(undefined);
    expect(map6_1.removeKey(10)).toBe(map6_1);
  });

  it('removeKeyAndGet', () => {
    expect(mapEmpty.removeKeyAndGet(2)).toBe(undefined);

    expect(map3_1.removeKeyAndGet(2)![0].size).toBe(2);
    expect(map3_1.removeKeyAndGet(2)![1]).toBe('b');
    expect(map3_1.removeKeyAndGet(10)).toBe(undefined);

    expect(map6_1.removeKeyAndGet(2)![0].size).toBe(5);
    expect(map6_1.removeKeyAndGet(2)![1]).toBe('b');
    expect(map6_1.removeKeyAndGet(10)).toBe(undefined);
  });

  it('removeKeys', () => {
    expect(mapEmpty.removeKeys([10, 11])).toBe(mapEmpty);

    expect(map3_1.removeKeys([10])).toBe(map3_1);
    expect(map3_1.removeKeys([1, 3, 10]).size).toBe(1);
    expect(map3_1.removeKeys([1, 3, 10]).getValue(2)).toBe('b');
    expect(map3_1.removeKeys([1, 3, 10]).getValue(1)).toBe(undefined);

    expect(map6_1.removeKeys([10])).toBe(map6_1);
    expect(map6_1.removeKeys([1, 3, 10]).size).toBe(4);
    expect(map6_1.removeKeys([1, 3, 10]).getValue(2)).toBe('b');
    expect(map6_1.removeKeys([1, 3, 10]).getValue(1)).toBe(undefined);
  });

  it('removeValue', () => {
    expect(mapEmpty.removeValue('b')).toBe(mapEmpty);
    expect(map3_1.removeValue('b').getValue(2)).toBe(undefined);
    expect(map3_1.removeValue('z')).toBe(map3_1);
    expect(map6_1.removeValue('b').getValue(2)).toBe(undefined);
    expect(map6_1.removeValue('z')).toBe(map6_1);
  });

  it('removeValueAndGet', () => {
    expect(mapEmpty.removeValueAndGet('b')).toBe(undefined);

    expect(map3_1.removeValueAndGet('b')![0].size).toBe(2);
    expect(map3_1.removeValueAndGet('b')![1]).toBe(2);
    expect(map3_1.removeValueAndGet('z')).toBe(undefined);

    expect(map6_1.removeValueAndGet('b')![0].size).toBe(5);
    expect(map6_1.removeValueAndGet('b')![1]).toBe(2);
    expect(map6_1.removeValueAndGet('z')).toBe(undefined);
  });

  it('removeValues', () => {
    expect(mapEmpty.removeValues(['y', 'z'])).toBe(mapEmpty);

    expect(map3_1.removeValues(['z'])).toBe(map3_1);
    expect(map3_1.removeValues(['a', 'c', 'z']).size).toBe(1);
    expect(map3_1.removeValues(['a', 'c', 'z']).getValue(2)).toBe('b');
    expect(map3_1.removeValues(['a', 'c', 'z']).getValue(1)).toBe(undefined);

    expect(map6_1.removeValues(['z'])).toBe(map6_1);
    expect(map6_1.removeValues(['a', 'c', 'z']).size).toBe(4);
    expect(map6_1.removeValues(['a', 'c', 'z']).getValue(2)).toBe('b');
    expect(map6_1.removeValues(['a', 'c', 'z']).getValue(1)).toBe(undefined);
  });

  it('set', () => {
    expect(mapEmpty.set(1, 'a').getValue(1)).toBe('a');

    expect(map3_1.set(10, 'z').getValue(10)).toBe('z');
    expect(map3_1.set(2, 'z').getValue(2)).toBe('z');

    expect(map6_1.set(10, 'z').getValue(10)).toBe('z');
    expect(map6_1.set(2, 'z').getValue(2)).toBe('z');
  });

  it('size', () => {
    expect(mapEmpty.size).toBe(0);
    expect(map3_1.size).toBe(3);
    expect(map6_1.size).toBe(6);
  });

  it('stream', () => {
    expect(mapEmpty.stream()).toBe(Stream.empty());
    expect(new Map(map3_1.stream())).toEqual(new Map(arr3));
    expect(new Map(map6_1.stream())).toEqual(new Map(arr6));
  });

  it('streamKeys', () => {
    expect(mapEmpty.streamKeys()).toBe(Stream.empty());
    expect(new Set(map3_1.streamKeys())).toEqual(
      new Set(arr3.map(Entry.first))
    );
    expect(new Set(map6_1.streamKeys())).toEqual(
      new Set(arr6.map(Entry.first))
    );
  });

  it('streamValues', () => {
    expect(mapEmpty.streamValues()).toBe(Stream.empty());
    expect(new Set(map3_1.streamValues())).toEqual(
      new Set(arr3.map(Entry.second))
    );
    expect(new Set(map6_1.streamValues())).toEqual(
      new Set(arr6.map(Entry.second))
    );
  });

  it('toArray', () => {
    expect(mapEmpty.toArray()).toEqual([]);
    expect(new Map(map3_1.toArray())).toEqual(new Map(arr3));
    expect(new Map(map6_1.toArray())).toEqual(new Map(arr6));
  });

  it('toBuilder', () => {
    expect(mapEmpty.toBuilder().build()).toBe(mapEmpty);
    expect(map3_1.toBuilder().build()).toBe(map3_1);
    expect(map6_1.toBuilder().build()).toBe(map6_1);

    {
      const b = mapEmpty.toBuilder();
      expect(b.isEmpty).toBe(true);
    }
    {
      const b = map3_1.toBuilder();
      expect(b.getValue(2)).toBe('b');
      expect(b.getValue(10)).toBe(undefined);
    }
    {
      const b = map6_1.toBuilder();
      expect(b.getValue(2)).toBe('b');
      expect(b.getValue(10)).toBe(undefined);
    }
  });

  it('toString', () => {
    expect(mapEmpty.toString()).toBe(`BiMap()`);
    expect(map3_1.toString()).toBe(`BiMap(1 <-> a, 2 <-> b, 3 <-> c)`);
  });

  it('updateKeyAt', () => {
    expect(mapEmpty.updateKeyAt('b', 10)).toBe(mapEmpty);
    expect(mapEmpty.updateKeyAt('b', (v) => v + v)).toBe(mapEmpty);

    expect(map3_1.updateKeyAt('b', 10).getKey('b')).toBe(10);
    expect(map3_1.updateKeyAt('b', (v) => v + v).getKey('b')).toBe(4);
    expect(map3_1.updateKeyAt('z', 10)).toBe(map3_1);

    expect(map6_1.updateKeyAt('b', 10).getKey('b')).toBe(10);
    expect(map6_1.updateKeyAt('b', (v) => v + v).getKey('b')).toBe(4);
    expect(map6_1.updateKeyAt('z', 10)).toBe(map6_1);
  });

  it('updateValueAt', () => {
    expect(mapEmpty.updateValueAt(2, 'z')).toBe(mapEmpty);
    expect(mapEmpty.updateValueAt(2, (v) => v + v)).toBe(mapEmpty);

    expect(map3_1.updateValueAt(2, 'z').getValue(2)).toBe('z');
    expect(map3_1.updateValueAt(2, (v) => v + v).getValue(2)).toBe('bb');
    expect(map3_1.updateValueAt(10, 'z')).toBe(map3_1);

    expect(map6_1.updateValueAt(2, 'z').getValue(2)).toBe('z');
    expect(map6_1.updateValueAt(2, (v) => v + v).getValue(2)).toBe('bb');
    expect(map6_1.updateValueAt(10, 'z')).toBe(map6_1);
  });
});

describe('BiMap.Builder', () => {
  const arr3 = [
    [1, 'a'],
    [2, 'b'],
    [3, 'c'],
  ] as ArrayNonEmpty<[number, string]>;

  function forEachBuilder(f: (builder: BiMap.Builder<number, string>) => void) {
    const b1 = BiMap.from(arr3).toBuilder();
    const b2 = BiMap.builder<number, string>();
    b2.addEntries(arr3);

    f(b1);
    f(b2);
  }

  it('addEntries', () => {
    const b = BiMap.builder<number, string>();
    expect(b.size).toBe(0);
    expect(b.addEntries(arr3)).toBe(true);
    expect(b.size).toBe(3);
    expect(b.addEntries(arr3)).toBe(false);
    expect(b.size).toBe(3);
  });

  it('addEntry', () => {
    const b = BiMap.builder<number, string>();
    expect(b.size).toBe(0);
    expect(b.addEntry([1, 'a'])).toBe(true);
    expect(b.size).toBe(1);
    expect(b.addEntry([2, 'b'])).toBe(true);
    expect(b.size).toBe(2);
    expect(b.addEntry([2, 'c'])).toBe(true);
    expect(b.size).toBe(2);
    expect(b.addEntry([2, 'c'])).toBe(false);
    expect(b.size).toBe(2);
  });

  it('build', () => {
    const b = BiMap.builder<number, string>();
    expect(b.build()).toBe(BiMap.empty());
    b.addEntries(arr3);
    expect(b.build().size).toBe(3);
    expect(b.build().getValue(2)).toBe('b');
  });

  it('forEach', () => {
    {
      const b = BiMap.builder<number, string>();

      const result = new Set<number>();

      b.forEach((entry) => result.add(entry[0]));
      expect(result).toEqual(new Set());
    }

    forEachBuilder((b) => {
      const result = new Set<number>();

      b.forEach((entry) => result.add(entry[0]));
      expect(result).toEqual(new Set([1, 2, 3]));
    });
  });

  it('operations throw in forEach when modifying collection', () => {
    forEachBuilder((b) => {
      expect(() => b.forEach(() => b.addEntries([[1, 'a']]))).toThrow();
      expect(() => b.forEach(() => b.addEntry([1, 'a']))).toThrow();
      expect(() => b.forEach(() => b.removeKey(1))).toThrow();
      expect(() => b.forEach(() => b.removeKeys([1]))).toThrow();
      expect(() => b.forEach(() => b.set(1, 'a'))).toThrow();
    });
  });

  it('getKey', () => {
    forEachBuilder((b) => {
      expect(b.getKey('b')).toBe(2);
      expect(b.getKey('b', 'z')).toBe(2);
      expect(b.getKey('z')).toBe(undefined);
      expect(b.getKey('z', 'y')).toBe('y');
      expect(b.getKey('z', () => 'y')).toBe('y');
    });
  });

  it('getValue', () => {
    forEachBuilder((b) => {
      expect(b.getValue(2)).toBe('b');
      expect(b.getValue(2, 'z')).toBe('b');
      expect(b.getValue(10)).toBe(undefined);
      expect(b.getValue(10, 'z')).toBe('z');
      expect(b.getValue(10, () => 'z')).toBe('z');
    });
  });

  it('hasKey', () => {
    forEachBuilder((b) => {
      expect(b.hasKey(2)).toBe(true);
      expect(b.hasKey(10)).toBe(false);
    });
  });

  it('hasValue', () => {
    forEachBuilder((b) => {
      expect(b.hasValue('b')).toBe(true);
      expect(b.hasValue('z')).toBe(false);
    });
  });

  it('isEmpty', () => {
    const b = BiMap.builder<number, string>();

    expect(b.isEmpty).toBe(true);
    b.set(1, 'a');
    expect(b.isEmpty).toBe(false);
  });

  it('removeKey', () => {
    forEachBuilder((b) => {
      expect(b.removeKey(10)).toBe(undefined);
      expect(b.removeKey(10, 'z')).toBe('z');
      expect(b.removeKey(2)).toBe('b');
      expect(b.removeKey(3, 'z')).toBe('c');
      expect(b.size).toBe(1);
    });
  });

  it('removeKeys', () => {
    forEachBuilder((b) => {
      expect(b.removeKeys([10])).toBe(false);
      expect(b.removeKeys([2])).toBe(true);
      expect(b.size).toBe(2);
    });
  });

  it('removeValue', () => {
    forEachBuilder((b) => {
      expect(b.removeValue('z')).toBe(undefined);
      expect(b.removeValue('z', 'y')).toBe('y');
      expect(b.removeValue('b')).toBe(2);
      expect(b.removeValue('c', 'y')).toBe(3);
      expect(b.size).toBe(1);
    });
  });

  it('removeValues', () => {
    forEachBuilder((b) => {
      expect(b.removeValues(['z'])).toBe(false);
      expect(b.removeValues(['b'])).toBe(true);
      expect(b.size).toBe(2);
    });
  });

  it('set', () => {
    forEachBuilder((b) => {
      expect(b.set(2, 'a')).toBe(true);
      expect(b.set(2, 'a')).toBe(false);
      expect(b.set(10, 'a')).toBe(true);
      expect(b.size).toBe(2);
    });
  });

  it('size', () => {
    forEachBuilder((b) => {
      expect(b.size).toBe(3);
    });
  });
});
