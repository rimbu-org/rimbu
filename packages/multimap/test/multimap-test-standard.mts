import { Entry } from '@rimbu/base';
import type { ArrayNonEmpty } from '@rimbu/common';
import { Stream, type Streamable } from '@rimbu/stream';

import { HashMultiMapHashValue, MultiMap } from '../src/main/index.mjs';

function expectEqual<K, V>(map: Streamable<readonly [K, V]>, arr: [K, V][]) {
  expect(new Set(map.stream())).toEqual(new Set(arr));
}

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

const arrDouble = [
  [1, 'a'],
  [2, 'a'],
  [1, 'b'],
  [2, 'b'],
] as ArrayNonEmpty<[number, string]>;

export function runMultiMapTestsWith(
  name: string,
  MM: MultiMap.Context<any, any>
) {
  describe(`${name} creators`, () => {
    it('empty', () => {
      expect(MM.empty<number, string>()).toBe(MM.empty<boolean, Symbol>());
    });

    it('of', () => {
      expectEqual(MM.of(...arr3), arr3);
      expectEqual(MM.of(...arr6), arr6);
      expectEqual(MM.of(...arrDouble), arrDouble);
    });

    it('from', () => {
      expectEqual(MM.from(arr3), arr3);
      expectEqual(MM.from(arr6), arr6);
      expectEqual(MM.from(arrDouble), arrDouble);

      {
        const m = MM.from(arr3);
        expect(MM.from(m)).toBe(m);
      }
      {
        const c = HashMultiMapHashValue.createContext();
        const m = c.from(arr3);
        expect(MM.from(m)).not.toBe(m);
      }
    });

    it('builder', () => {
      const b = MM.builder<number, string>();
      expect(b.size).toBe(0);
      b.addEntries(arr6);
      expect(b.size).toBe(6);
    });

    it('reducer', () => {
      const source = Stream.of<[number, string]>([1, 'a'], [2, 'b'], [3, 'a']);
      {
        const result = source.reduce(MM.reducer());
        expectEqual(result, [
          [1, 'a'],
          [2, 'b'],
          [3, 'a'],
        ]);
      }

      {
        const result = source.reduce(
          MM.reducer([
            [3, 'b'],
            [5, 'q'],
          ])
        );
        expectEqual(result, [
          [1, 'a'],
          [2, 'b'],
          [3, 'a'],
          [3, 'b'],
          [5, 'q'],
        ]);
      }
    });
  });

  describe(`${name} methods`, () => {
    const mapEmpty = MM.empty<number, string>();
    const map3_1 = MM.from(arr3);
    const map6_1 = MM.from(arr6);
    const mapDouble = MM.from(arrDouble);

    it('iterator', () => {
      expect(new Set(mapEmpty)).toEqual(new Set());
      expect(new Set(map3_1)).toEqual(new Set(arr3));
      expect(new Set(map6_1)).toEqual(new Set(arr6));
      expect(new Set(mapDouble)).toEqual(new Set(arrDouble));
    });

    it('add', () => {
      expectEqual(mapEmpty.add(1, 'a'), [[1, 'a']]);
      expectEqual(mapEmpty.add(1, 'a').add(1, 'b'), [
        [1, 'a'],
        [1, 'b'],
      ]);
      expect(new Set(map3_1.add(1, 'z').getValues(1))).toEqual(
        new Set(['a', 'z'])
      );
      expect(new Set(mapDouble.add(1, 'z').getValues(1))).toEqual(
        new Set(['a', 'b', 'z'])
      );
    });

    it('addEntries', () => {
      expect(mapEmpty.addEntries(mapEmpty)).toBe(mapEmpty);
      expectEqual(mapEmpty.addEntries(arr3), arr3);
      expectEqual(mapEmpty.addEntries(arr6), arr6);
      expectEqual(mapEmpty.addEntries(arrDouble), arrDouble);

      expect(map3_1.addEntries(mapEmpty)).toBe(map3_1);
      expect(map3_1.addEntries(arr3)).toBe(map3_1);
      expectEqual(map3_1.addEntries(arr6), arr6);

      expect(map6_1.addEntries(mapEmpty)).toBe(map6_1);
      expect(map6_1.addEntries(arr3)).toBe(map6_1);
      expect(map6_1.addEntries(arr6)).toBe(map6_1);
    });

    it('assumeNoneEmpty', () => {
      expect(() => mapEmpty.assumeNonEmpty()).toThrow();
      expect(map3_1.assumeNonEmpty()).toBe(map3_1);
      expect(map6_1.assumeNonEmpty()).toBe(map6_1);
    });

    it('asNormal', () => {
      expect(map3_1.asNormal()).toBe(map3_1);
      expect(map6_1.asNormal()).toBe(map6_1);
      expect(mapDouble.asNormal()).toBe(mapDouble);
    });

    it('context', () => {
      expect(mapEmpty.context).toBe(MM);
      expect(map3_1.context).toBe(MM);
      expect(map6_1.context).toBe(MM);
    });

    it('filter', () => {
      function isEvenKey(entry: readonly [number, string]): boolean {
        return entry[0] % 2 === 0;
      }

      function first2(
        _: readonly [number, string],
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

    it('getValues', () => {
      expect(mapEmpty.getValues(2).toArray()).toEqual([]);
      expect(map3_1.getValues(2).toArray()).toEqual(['b']);
      expect(map6_1.getValues(2).toArray()).toEqual(['b']);
      expect(mapDouble.getValues(2).toArray()).toEqual(['a', 'b']);
    });

    it('hasEntry', () => {
      expect(mapEmpty.hasEntry(2, 'z')).toBe(false);

      expect(map3_1.hasEntry(2, 'z')).toBe(false);
      expect(map3_1.hasEntry(9, 'b')).toBe(false);
      expect(map3_1.hasEntry(2, 'b')).toBe(true);

      expect(map6_1.hasEntry(2, 'z')).toBe(false);
      expect(map6_1.hasEntry(9, 'b')).toBe(false);
      expect(map6_1.hasEntry(2, 'b')).toBe(true);

      expect(mapDouble.hasEntry(2, 'a')).toBe(true);
      expect(mapDouble.hasEntry(2, 'b')).toBe(true);
      expect(mapDouble.hasEntry(2, 'z')).toBe(false);
      expect(mapDouble.hasEntry(9, 'b')).toBe(false);
    });

    it('hasKey', () => {
      expect(mapEmpty.hasKey(2)).toBe(false);

      expect(map3_1.hasKey(2)).toBe(true);
      expect(map3_1.hasKey(9)).toBe(false);

      expect(map6_1.hasKey(2)).toBe(true);
      expect(map6_1.hasKey(9)).toBe(false);

      expect(mapDouble.hasKey(2)).toBe(true);
      expect(mapDouble.hasKey(9)).toBe(false);
    });

    it('isEmpty', () => {
      expect(mapEmpty.isEmpty).toBe(true);
      expect(map3_1.isEmpty).toBe(false);
      expect(map6_1.isEmpty).toBe(false);
    });

    it('keySize', () => {
      expect(mapEmpty.keySize).toBe(0);
      expect(map3_1.keySize).toBe(3);
      expect(map6_1.keySize).toBe(6);
      expect(mapDouble.keySize).toBe(2);
    });

    it('keyMap', () => {
      expect(mapEmpty.keyMap.context).toBe(mapEmpty.context.keyMapContext);
      expect(map3_1.keyMap.context).toBe(map3_1.context.keyMapContext);
      expect(map6_1.keyMap.context).toBe(map6_1.context.keyMapContext);
    });

    it('nonEmpty', () => {
      expect(mapEmpty.nonEmpty()).toBe(false);
      expect(map3_1.nonEmpty()).toBe(true);
      expect(map6_1.nonEmpty()).toBe(true);
      expect(mapDouble.nonEmpty()).toBe(true);
    });

    it('modifyAt', () => {
      expect(mapEmpty.modifyAt(2, { ifExists: (v) => v })).toBe(mapEmpty);
      expectEqual(mapEmpty.modifyAt(2, { ifNew: ['z'] }), [[2, 'z']]);
      expectEqual(mapEmpty.modifyAt(2, { ifNew: () => ['z'] }), [[2, 'z']]);

      expect(map3_1.modifyAt(2, { ifNew: ['z'] })).toBe(map3_1);
      expect(map3_1.modifyAt(5, { ifExists: () => ['z'] })).toBe(map3_1);
      expectEqual(map3_1.modifyAt(2, { ifExists: (v) => [...v, 'z'] }), [
        [1, 'a'],
        [2, 'b'],
        [2, 'z'],
        [3, 'c'],
      ]);
      expectEqual(map3_1.modifyAt(2, { ifExists: () => [] }), [
        [1, 'a'],
        [3, 'c'],
      ]);
      expectEqual(map3_1.modifyAt(5, { ifNew: ['z'] }), [...arr3, [5, 'z']]);
    });

    it('removeEntries', () => {
      expect(
        mapEmpty.removeEntries([
          [2, 'z'],
          [2, 'b'],
        ])
      ).toBe(mapEmpty);
      expect(
        map3_1.removeEntries([
          [10, 'b'],
          [2, 'z'],
        ])
      ).toBe(map3_1);
      expectEqual(
        map3_1.removeEntries([
          [2, 'z'],
          [2, 'b'],
        ]),
        [
          [1, 'a'],
          [3, 'c'],
        ]
      );
      expect(
        map6_1.removeEntries([
          [10, 'b'],
          [2, 'z'],
        ])
      ).toBe(map6_1);
      expectEqual(
        map6_1.removeEntries([
          [2, 'z'],
          [2, 'b'],
        ]),
        [
          [1, 'a'],
          [3, 'c'],
          [4, 'd'],
          [5, 'e'],
          [6, 'f'],
        ]
      );
      expect(
        mapDouble.removeEntries([
          [10, 'a'],
          [2, 'z'],
        ])
      ).toBe(mapDouble);
      expectEqual(
        mapDouble.removeEntries([
          [10, 'a'],
          [2, 'b'],
        ]),
        [
          [1, 'a'],
          [1, 'b'],
          [2, 'a'],
        ]
      );
    });

    it('removeEntry', () => {
      expect(mapEmpty.removeEntry(2, 'b')).toBe(mapEmpty);

      expect(map3_1.removeEntry(2, 'z')).toBe(map3_1);
      expectEqual(map3_1.removeEntry(2, 'b'), [
        [1, 'a'],
        [3, 'c'],
      ]);

      expect(map6_1.removeEntry(2, 'z')).toBe(map6_1);
      expectEqual(map6_1.removeEntry(2, 'b'), [
        [1, 'a'],
        [3, 'c'],
        [4, 'd'],
        [5, 'e'],
        [6, 'f'],
      ]);

      expect(mapDouble.removeEntry(2, 'z')).toBe(mapDouble);
      expectEqual(mapDouble.removeEntry(2, 'b'), [
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
      ]);
    });

    it('removeKey', () => {
      expect(mapEmpty.removeKey(2)).toBe(mapEmpty);

      expect(map3_1.removeKey(9)).toBe(map3_1);
      expectEqual(map3_1.removeKey(2), [
        [1, 'a'],
        [3, 'c'],
      ]);

      expect(map6_1.removeKey(9)).toBe(map6_1);
      expectEqual(map6_1.removeKey(2), [
        [1, 'a'],
        [3, 'c'],
        [4, 'd'],
        [5, 'e'],
        [6, 'f'],
      ]);

      expect(mapDouble.removeKey(9)).toBe(mapDouble);
      expectEqual(mapDouble.removeKey(2), [
        [1, 'a'],
        [1, 'b'],
      ]);
    });

    it('removeKeyAndGet', () => {
      expect(mapEmpty.removeKeyAndGet(2)).toBe(undefined);
      expect(map3_1.removeKeyAndGet(10)).toBe(undefined);
      expectEqual(map3_1.removeKeyAndGet(2)![0], [
        [1, 'a'],
        [3, 'c'],
      ]);
      expect(map3_1.removeKeyAndGet(2)![1].toArray()).toEqual(['b']);
    });

    it('removeKeys', () => {
      expect(mapEmpty.removeKeys([2, 10])).toBe(mapEmpty);

      expect(map3_1.removeKeys([9, 10])).toBe(map3_1);
      expectEqual(map3_1.removeKeys([2, 10]), [
        [1, 'a'],
        [3, 'c'],
      ]);

      expect(map6_1.removeKeys([9, 10])).toBe(map6_1);
      expectEqual(map6_1.removeKeys([2, 10]), [
        [1, 'a'],
        [3, 'c'],
        [4, 'd'],
        [5, 'e'],
        [6, 'f'],
      ]);

      expect(mapDouble.removeKeys([9, 10])).toBe(mapDouble);
      expectEqual(mapDouble.removeKeys([2]), [
        [1, 'a'],
        [1, 'b'],
      ]);
    });

    it('setValues', () => {
      expect(mapEmpty.setValues(2, [])).toBe(mapEmpty);
      expectEqual(mapEmpty.setValues(2, ['b', 'c']), [
        [2, 'b'],
        [2, 'c'],
      ]);
      expectEqual(map3_1.setValues(2, ['b']), arr3);
      expectEqual(map3_1.setValues(2, []), [
        [1, 'a'],
        [3, 'c'],
      ]);
      expectEqual(map3_1.setValues(4, ['a']), [...arr3, [4, 'a']]);
      expectEqual(mapDouble.setValues(1, ['d']), [
        [1, 'd'],
        [2, 'a'],
        [2, 'b'],
      ]);
    });

    it('size', () => {
      expect(mapEmpty.size).toBe(0);
      expect(map3_1.size).toBe(3);
      expect(map6_1.size).toBe(6);
      expect(mapDouble.size).toBe(4);
    });

    it('stream', () => {
      expect(mapEmpty.stream()).toBe(Stream.empty());
      expect(new Map(map3_1.stream())).toEqual(new Map(arr3));
      expect(new Map(map6_1.stream())).toEqual(new Map(arr6));
      expect(new Map(mapDouble.stream())).toEqual(new Map(arrDouble));
    });

    it('streamKeys', () => {
      expect(mapEmpty.streamKeys()).toBe(Stream.empty());
      expect(new Set(map3_1.streamKeys())).toEqual(
        new Set(arr3.map(Entry.first))
      );
      expect(new Set(map6_1.streamKeys())).toEqual(
        new Set(arr6.map(Entry.first))
      );
      expect(new Set(mapDouble.streamKeys())).toEqual(
        new Set(arrDouble.map(Entry.first))
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
      expect(new Set(mapDouble.streamValues())).toEqual(
        new Set(arrDouble.map(Entry.second))
      );
    });

    it('toArray', () => {
      expect(mapEmpty.toArray()).toEqual([]);
      expect(new Map(map3_1.toArray())).toEqual(new Map(arr3));
      expect(new Map(map6_1.toArray())).toEqual(new Map(arr6));
      expect(new Map(mapDouble.toArray())).toEqual(new Map(arrDouble));
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
        expect(b.getValues(2).toArray()).toEqual(['b']);
        expect(b.getValues(10).toArray()).toEqual([]);
      }
      {
        const b = map6_1.toBuilder();
        expect(b.getValues(2).toArray()).toEqual(['b']);
        expect(b.getValues(10).toArray()).toEqual([]);
      }
      {
        const b = mapDouble.toBuilder();
        expect(b.getValues(2).toArray()).toEqual(['a', 'b']);
        expect(b.getValues(10).toArray()).toEqual([]);
      }
    });

    it('toString', () => {
      expect(mapEmpty.toString()).toBe(`${MM.typeTag}()`);
      expect(map3_1.toString()).toBe(
        `${MM.typeTag}(1 -> [a], 2 -> [b], 3 -> [c])`
      );
      expect(mapDouble.toString()).toBe(
        `${MM.typeTag}(1 -> [a, b], 2 -> [a, b])`
      );
    });
  });

  describe(`${name}.Buidler`, () => {
    const arr3 = [
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ] as ArrayNonEmpty<[number, string]>;

    function forEachBuilder(
      f: (builder: MultiMap.Builder<number, string>) => void
    ) {
      const b1 = MM.from(arr3).toBuilder();
      const b2 = MM.builder<number, string>();
      b2.addEntries(arr3);

      f(b1);
      f(b2);
    }

    it('add', () => {
      const b = MM.builder<number, string>();
      expect(b.size).toBe(0);
      expect(b.add(1, 'a')).toBe(true);
      expect(b.size).toBe(1);
      expect(b.add(2, 'b')).toBe(true);
      expect(b.size).toBe(2);
      expect(b.add(2, 'c')).toBe(true);
      expect(b.size).toBe(3);
      expect(b.add(2, 'c')).toBe(false);
      expect(b.size).toBe(3);
    });

    it('addEntries', () => {
      const b = MM.builder<number, string>();
      expect(b.size).toBe(0);
      expect(b.addEntries(arr3)).toBe(true);
      expect(b.size).toBe(3);
      expect(b.addEntries(arr3)).toBe(false);
      expect(b.size).toBe(3);
    });

    it('build', () => {
      const b = MM.builder<number, string>();
      expect(b.build()).toBe(MM.empty());
      b.addEntries(arr3);
      expect(b.build().size).toBe(3);
      expect(b.build().getValues(2).toArray()).toEqual(['b']);
    });

    it('forEach', () => {
      const b = MM.builder<number, string>();

      const result = new Set<number>();

      b.forEach((entry) => result.add(entry[0]));
      expect(result).toEqual(new Set());

      forEachBuilder((b) => {
        const result = new Set<number>();

        b.forEach((entry) => result.add(entry[0]));
        expect(result).toEqual(new Set([1, 2, 3]));
      });
    });

    it('operations throw in forEach when modifying collection', () => {
      forEachBuilder((b) => {
        expect(() => b.forEach(() => b.add(1, 'a'))).toThrow();
        expect(() => b.forEach(() => b.addEntries([[1, 'a']]))).toThrow();
        expect(() => b.forEach(() => b.removeEntries([[1, 'a']]))).toThrow();
        expect(() => b.forEach(() => b.removeEntry(1, 'a'))).toThrow();
        expect(() => b.forEach(() => b.removeKey(1))).toThrow();
        expect(() => b.forEach(() => b.removeKeys([1]))).toThrow();
        expect(() => b.forEach(() => b.setValues(1, ['a']))).toThrow();
      });
    });

    it('removeEntries', () => {
      forEachBuilder((b) => {
        expect(b.removeEntries([[10, 'z']])).toBe(false);
        expect(b.size).toBe(3);
        expect(
          b.removeEntries([
            [2, 'c'],
            [10, 'z'],
          ])
        ).toBe(false);
        expect(b.size).toBe(3);
        expect(
          b.removeEntries([
            [2, 'b'],
            [10, 'z'],
          ])
        ).toBe(true);
        expect(b.size).toBe(2);
      });
    });

    it('removeEntry', () => {
      forEachBuilder((b) => {
        expect(b.removeEntry(10, 'z')).toBe(false);
        expect(b.size).toBe(3);
        expect(b.removeEntry(2, 'c')).toBe(false);
        expect(b.size).toBe(3);
        expect(b.removeEntry(2, 'b')).toBe(true);
        expect(b.size).toBe(2);
      });
    });

    it('removeKey', () => {
      forEachBuilder((b) => {
        expect(b.removeKey(10)).toBe(false);
        expect(b.size).toBe(3);
        expect(b.removeKey(2)).toBe(true);
        expect(b.size).toBe(2);
        expect(b.removeKey(3)).toBe(true);
        expect(b.size).toBe(1);
      });
    });

    it('removeKeys', () => {
      forEachBuilder((b) => {
        expect(b.removeKeys([10])).toBe(false);
        expect(b.size).toBe(3);
        expect(b.removeKeys([2])).toBe(true);
        expect(b.size).toBe(2);
      });
    });

    it('setValues', () => {
      forEachBuilder((b) => {
        expect(b.setValues(10, [])).toBe(false);
        expect(b.setValues(2, ['b'])).toBe(true);
        expect(b.setValues(2, ['b', 'c'])).toBe(true);
        expect(b.size).toBe(4);
        expect(b.setValues(2, [])).toBe(true);
        expect(b.size).toBe(2);
        expect(b.setValues(10, ['z']));
        expect(b.size).toBe(3);
      });
    });
  });
}
