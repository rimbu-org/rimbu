import { Entry } from '@rimbu/base';
import type { ArrayNonEmpty } from '@rimbu/common';
import { Stream, Streamable } from '@rimbu/stream';
import {
  BiMultiMap,
  HashBiMultiMap,
  SortedBiMultiMap,
} from '@rimbu/bimultimap';

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

function runWith(name: string, BMM: BiMultiMap.Context<any, any>) {
  describe(`${name} creators`, () => {
    it('empty', () => {
      expect(BMM.empty<number, string>()).toBe(BMM.empty<boolean, Symbol>());
    });

    it('of', () => {
      expectEqual(BMM.of(...arr3), arr3);
      expectEqual(BMM.of(...arr6), arr6);
      expectEqual(BMM.of(...arrDouble), arrDouble);
    });

    it('from', () => {
      expectEqual(BMM.from(arr3), arr3);
      expectEqual(BMM.from(arr6), arr6);
      expectEqual(BMM.from(arrDouble), arrDouble);

      expectEqual(BMM.from([[1, 'a']], [[1, 'b']]), [
        [1, 'a'],
        [1, 'b'],
      ]);

      {
        const m = BMM.from(arr3);
        expect(BMM.from(m)).toBe(m);
      }
      {
        const c = HashBiMultiMap.createContext();
        const m = c.from(arr3);
        expect(BMM.from(m)).not.toBe(m);
      }
    });

    it('builder', () => {
      const b = BMM.builder<number, string>();
      expect(b.size).toBe(0);
      b.addEntries(arr6);
      expect(b.size).toBe(6);
    });

    it('reducer', () => {
      const source = Stream.of<[number, string]>([1, 'a'], [2, 'b'], [3, 'a']);
      {
        const result = source.reduce(BMM.reducer());
        expectEqual(result, [
          [1, 'a'],
          [2, 'b'],
          [3, 'a'],
        ]);
      }

      {
        const result = source.reduce(
          BMM.reducer([
            [4, 'b'],
            [5, 'q'],
          ])
        );
        expectEqual(result, [
          [1, 'a'],
          [2, 'b'],
          [3, 'a'],
          [4, 'b'],
          [5, 'q'],
        ]);
      }
    });
  });

  describe(`${name} methods`, () => {
    const mapEmpty = BMM.empty<number, string>();
    const map3_1 = BMM.from(arr3);
    const map6_1 = BMM.from(arr6);
    const mapDouble = BMM.from(arrDouble);

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
      expect(mapEmpty.context).toBe(BMM);
      expect(map3_1.context).toBe(BMM);
      expect(map6_1.context).toBe(BMM);
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

    it('getKeys', () => {
      expect(mapEmpty.getKeys('b').toArray()).toEqual([]);
      expect(map3_1.getKeys('b').toArray()).toEqual([2]);
      expect(map6_1.getKeys('b').toArray()).toEqual([2]);
      expect(mapDouble.getKeys('b').toArray()).toEqual([1, 2]);
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

    it('hasValue', () => {
      expect(mapEmpty.hasValue('b')).toBe(false);

      expect(map3_1.hasValue('b')).toBe(true);
      expect(map3_1.hasValue('z')).toBe(false);

      expect(map6_1.hasValue('b')).toBe(true);
      expect(map6_1.hasValue('z')).toBe(false);

      expect(mapDouble.hasValue('b')).toBe(true);
      expect(mapDouble.hasValue('z')).toBe(false);
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

    it('keyValueMultiMap', () => {
      expect(mapEmpty.keyValueMultiMap.context).toBe(
        mapEmpty.context.keyValueMultiMapContext
      );
      expect(map3_1.keyValueMultiMap.context).toBe(
        map3_1.context.keyValueMultiMapContext
      );
      expect(map6_1.keyValueMultiMap.context).toBe(
        map6_1.context.keyValueMultiMapContext
      );
    });

    it('nonEmpty', () => {
      expect(mapEmpty.nonEmpty()).toBe(false);
      expect(map3_1.nonEmpty()).toBe(true);
      expect(map6_1.nonEmpty()).toBe(true);
      expect(mapDouble.nonEmpty()).toBe(true);
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

    it('removeValue', () => {
      expect(mapEmpty.removeValue('b')).toBe(mapEmpty);

      expect(map3_1.removeValue('z')).toBe(map3_1);
      expectEqual(map3_1.removeValue('b'), [
        [1, 'a'],
        [3, 'c'],
      ]);

      expect(map6_1.removeValue('z')).toBe(map6_1);
      expectEqual(map6_1.removeValue('b'), [
        [1, 'a'],
        [3, 'c'],
        [4, 'd'],
        [5, 'e'],
        [6, 'f'],
      ]);

      expect(mapDouble.removeValue('z')).toBe(mapDouble);
      expectEqual(mapDouble.removeValue('b'), [
        [1, 'a'],
        [2, 'a'],
      ]);
    });

    it('removeValues', () => {
      expect(mapEmpty.removeValues(['b'])).toBe(mapEmpty);

      expect(map3_1.removeValues(['z'])).toBe(map3_1);
      expectEqual(map3_1.removeValues(['b']), [
        [1, 'a'],
        [3, 'c'],
      ]);

      expect(map6_1.removeValues(['z'])).toBe(map6_1);
      expectEqual(map6_1.removeValues(['b']), [
        [1, 'a'],
        [3, 'c'],
        [4, 'd'],
        [5, 'e'],
        [6, 'f'],
      ]);

      expect(mapDouble.removeValues(['z'])).toBe(mapDouble);
      expectEqual(mapDouble.removeValues(['b']), [
        [1, 'a'],
        [2, 'a'],
      ]);
    });

    it('setKeys', () => {
      expect(mapEmpty.setKeys('b', [])).toBe(mapEmpty);
      expectEqual(mapEmpty.setKeys('b', [1, 2]), [
        [1, 'b'],
        [2, 'b'],
      ]);

      expectEqual(map3_1.setKeys('b', [2]), arr3);
      expectEqual(map3_1.setKeys('b', []), [
        [1, 'a'],
        [3, 'c'],
      ]);
      expectEqual(map3_1.setKeys('d', [5, 6]), [...arr3, [5, 'd'], [6, 'd']]);
    });

    expectEqual(mapDouble.setKeys('b', [1, 2]), arrDouble);
    expectEqual(mapDouble.setKeys('b', [2]), [
      [1, 'a'],
      [2, 'a'],
      [2, 'b'],
    ]);
    expectEqual(mapDouble.setKeys('b', []), [
      [1, 'a'],
      [2, 'a'],
    ]);
    expectEqual(mapDouble.setKeys('b', [3, 4]), [
      [1, 'a'],
      [2, 'a'],
      [3, 'b'],
      [4, 'b'],
    ]);

    it('setValues', () => {
      expect(mapEmpty.setValues(2, [])).toBe(mapEmpty);
      expectEqual(mapEmpty.setValues(2, ['a', 'b']), [
        [2, 'a'],
        [2, 'b'],
      ]);

      expectEqual(map3_1.setValues(2, ['b']), arr3);
      expectEqual(map3_1.setValues(2, []), [
        [1, 'a'],
        [3, 'c'],
      ]);
      expectEqual(map3_1.setValues(4, ['e', 'f']), [
        ...arr3,
        [4, 'e'],
        [4, 'f'],
      ]);
    });

    expectEqual(mapDouble.setValues(2, ['a', 'b']), arrDouble);
    expectEqual(mapDouble.setValues(2, ['b']), [
      [1, 'a'],
      [1, 'b'],
      [2, 'b'],
    ]);
    expectEqual(mapDouble.setValues(2, []), [
      [1, 'a'],
      [1, 'b'],
    ]);
    expectEqual(mapDouble.setValues(2, ['c', 'd']), [
      [1, 'a'],
      [1, 'b'],
      [2, 'c'],
      [2, 'd'],
    ]);

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
      expect(mapEmpty.toString()).toBe(`${BMM.typeTag}()`);
      expect(map3_1.toString()).toBe(
        `${BMM.typeTag}(1 <-> (a), 2 <-> (b), 3 <-> (c))`
      );
      expect(mapDouble.toString()).toBe(
        `${BMM.typeTag}(1 <-> (a, b), 2 <-> (a, b))`
      );
    });

    it('valueKeyMultiMap', () => {
      expect(mapEmpty.valueKeyMultiMap.context).toBe(
        mapEmpty.context.valueKeyMultiMapContext
      );
      expect(map3_1.valueKeyMultiMap.context).toBe(
        map3_1.context.valueKeyMultiMapContext
      );
      expect(map6_1.valueKeyMultiMap.context).toBe(
        map6_1.context.valueKeyMultiMapContext
      );
    });
  });

  describe(`${name}.Builder`, () => {
    const arr3 = [
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ] as ArrayNonEmpty<[number, string]>;

    function forEachBuilder(
      f: (builder: BiMultiMap.Builder<number, string>) => void
    ) {
      const b1 = BMM.from(arr3).toBuilder();
      const b2 = BMM.builder<number, string>();
      b2.addEntries(arr3);

      f(b1);
      f(b2);
    }

    it('add', () => {
      const b = BMM.builder<number, string>();
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
      const b = BMM.builder<number, string>();
      expect(b.size).toBe(0);
      expect(b.addEntries(arr3)).toBe(true);
      expect(b.size).toBe(3);
      expect(b.addEntries(arr3)).toBe(false);
      expect(b.size).toBe(3);
    });

    it('build', () => {
      const b = BMM.builder<number, string>();
      expect(b.build()).toBe(BMM.empty());
      b.addEntries(arr3);
      expect(b.build().size).toBe(3);
      expect(b.build().getValues(2).toArray()).toEqual(['b']);
    });

    it('forEach', () => {
      {
        const b = BMM.builder<number, string>();

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
        expect(() => b.forEach(() => b.add(1, 'a'))).toThrow();
        expect(() => b.forEach(() => b.addEntries([[1, 'a']]))).toThrow();
        expect(() => b.forEach(() => b.removeEntry(1, 'a'))).toThrow();
        expect(() => b.forEach(() => b.removeEntries([[1, 'a']]))).toThrow();
        expect(() => b.forEach(() => b.removeKey(1))).toThrow();
        expect(() => b.forEach(() => b.removeKeys([1]))).toThrow();
        expect(() => b.forEach(() => b.removeValue('b'))).toThrow();
        expect(() => b.forEach(() => b.removeValues(['b']))).toThrow();
        expect(() => b.forEach(() => b.setKeys('a', [1]))).toThrow();
        expect(() => b.forEach(() => b.setValues(1, ['a']))).toThrow();
      });
    });

    it('getKeys', () => {
      forEachBuilder((b) => {
        expect(b.getKeys('b').toArray()).toEqual([2]);
        expect(b.getKeys('z').isEmpty).toBe(true);
      });
    });

    it('getValues', () => {
      forEachBuilder((b) => {
        expect(b.getValues(2).toArray()).toEqual(['b']);
        expect(b.getValues(10).isEmpty).toBe(true);
      });
    });

    it('hasEntry', () => {
      forEachBuilder((b) => {
        expect(b.hasEntry(2, 'b')).toBe(true);
        expect(b.hasEntry(10, 'b')).toBe(false);
        expect(b.hasEntry(2, 'z')).toBe(false);
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
      const b = BMM.builder<number, string>();

      expect(b.isEmpty).toBe(true);
      b.add(1, 'a');
      expect(b.isEmpty).toBe(false);
    });

    it('removeEntries', () => {
      const be = BMM.builder<number, string>();
      expect(be.removeEntries([[1, 'a']])).toBe(false);

      forEachBuilder((b) => {
        expect(b.removeEntries([[10, 'z']])).toBe(false);
        expect(
          b.removeEntries([
            [2, 'b'],
            [10, 'z'],
          ])
        ).toBe(true);
        expect(
          b.removeEntries([
            [2, 'z'],
            [10, 'z'],
          ])
        ).toBe(false);
        expect(
          b.removeEntries([
            [10, 'b'],
            [10, 'z'],
          ])
        ).toBe(false);
      });
    });

    it('removeEntry', () => {
      const be = BMM.builder<number, string>();
      expect(be.removeEntry(1, 'a')).toBe(false);

      forEachBuilder((b) => {
        expect(b.removeEntry(10, 'z')).toBe(false);
        expect(b.removeEntry(2, 'b')).toBe(true);
        expect(b.removeEntry(2, 'z')).toBe(false);
        expect(b.removeEntry(10, 'b')).toBe(false);
      });
    });

    it('removeKey', () => {
      const be = BMM.builder<number, string>();
      expect(be.removeKey(1)).toBe(false);

      forEachBuilder((b) => {
        expect(b.removeKey(10)).toBe(false);
        expect(b.removeKey(2)).toBe(true);
        expect(b.removeKey(2)).toBe(false);
      });
    });

    it('removeKeys', () => {
      const be = BMM.builder<number, string>();
      expect(be.removeKeys([1, 10])).toBe(false);

      forEachBuilder((b) => {
        expect(b.removeKeys([10])).toBe(false);
        expect(b.removeKeys([2, 10])).toBe(true);
        expect(b.removeKeys([2, 10])).toBe(false);
      });
    });

    it('removeValue', () => {
      const be = BMM.builder<number, string>();
      expect(be.removeValue('a')).toBe(false);

      forEachBuilder((b) => {
        expect(b.removeValue('z')).toBe(false);
        expect(b.removeValue('b')).toBe(true);
        expect(b.removeValue('b')).toBe(false);
      });
    });

    it('removeValues', () => {
      const be = BMM.builder<number, string>();
      expect(be.removeValues(['a', 'z'])).toBe(false);

      forEachBuilder((b) => {
        expect(b.removeValues(['z'])).toBe(false);
        expect(b.removeValues(['b', 'z'])).toBe(true);
        expect(b.removeValues(['b', 'z'])).toBe(false);
      });
    });

    it('setKeys', () => {
      const be = BMM.builder<number, string>();
      expect(be.setKeys('b', [])).toBe(false);
      expect(be.setKeys('b', [1, 2, 2])).toBe(true);
      expect(be.size).toBe(2);

      forEachBuilder((b) => {
        expect(b.setKeys('z', [])).toBe(false);
        expect(b.setKeys('b', [])).toBe(true);
        expect(b.size).toBe(2);
        expect(b.setKeys('b', [2, 1, 2])).toBe(true);
        expect(b.size).toBe(4);
      });
    });

    it('setValues', () => {
      const be = BMM.builder<number, string>();
      expect(be.setValues(2, [])).toBe(false);
      expect(be.setValues(2, ['a', 'b', 'b'])).toBe(true);
      expect(be.size).toBe(2);

      forEachBuilder((b) => {
        expect(b.setValues(10, [])).toBe(false);
        expect(b.setValues(2, [])).toBe(true);
        expect(b.size).toBe(2);
        expect(b.setValues(2, ['b', 'a', 'b'])).toBe(true);
        expect(b.size).toBe(4);
      });
    });

    it('size', () => {
      expect(BMM.builder().size).toBe(0);

      forEachBuilder((b) => {
        expect(b.size).toBe(3);
        b.add(2, 'c');
        expect(b.size).toBe(4);
      });
    });
  });
}

runWith('HashBiMultiMap', HashBiMultiMap.defaultContext());
runWith('SortedBiMultiMap', SortedBiMultiMap.defaultContext());
