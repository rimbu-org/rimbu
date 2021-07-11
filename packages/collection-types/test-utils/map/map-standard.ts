import { Entry } from '@rimbu/base';
import type { ArrayNonEmpty } from '@rimbu/common';
import { Stream } from '@rimbu/stream';
import type { RMap } from '../../src';

function expectEqual<K, V>(map: RMap<K, V>, arr: [K, V][]) {
  expect(new Map(map)).toEqual(new Map(arr));
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

export function runMapTestsWith(name: string, GMap: RMap.Context<any>) {
  describe(`${name} creators`, () => {
    it('empty', () => {
      expect(GMap.empty<number, number>()).toBe(GMap.empty<string, string>());
    });

    it('of', () => {
      expect(GMap.of(...arr3).toArray()).toEqual(arr3);
      expectEqual(GMap.of(...arr6), arr6);
      expect(GMap.of([1, 'a'], [1, 'b']).toArray()).toEqual([[1, 'b']]);
    });

    it('from', () => {
      expect(GMap.from(arr3).toArray()).toEqual(arr3);
      expectEqual(GMap.from(arr6), arr6);
      expect(
        GMap.from([
          [1, 'a'],
          [1, 'b'],
        ]).toArray()
      ).toEqual([[1, 'b']]);

      {
        const m = GMap.from(arr3);
        expect(GMap.from(m)).toBe(m);
      }
      // {
      //   const c = HashMap.createContext();
      //   const m = c.from(arr3);
      //   expect(GMap.from(m)).not.toBe(m);
      // }
    });

    it('builder', () => {
      const b = GMap.builder<number, string>();
      expect(b.size).toBe(0);
      b.addEntries(arr6);
      expect(b.size).toBe(6);
    });

    it('reducer', () => {
      const source = Stream.of<readonly [number, string]>(
        [1, 'a'],
        [2, 'b'],
        [3, 'a']
      );
      {
        const result = source.reduce(GMap.reducer());
        expectEqual(result, [
          [1, 'a'],
          [2, 'b'],
          [3, 'a'],
        ]);
      }

      {
        const result = source.reduce(
          GMap.reducer([
            [3, 'z'],
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
    const mapEmpty = GMap.empty<number, string>();
    const map3 = GMap.from(arr3);
    const map6 = GMap.from(arr6);

    it('iterator', () => {
      expect(new Map(mapEmpty)).toEqual(new Map());
      expect(new Map(map3)).toEqual(new Map(arr3));
      expect(new Map(map6)).toEqual(new Map(arr6));
    });

    it('addEntries', () => {
      expect(mapEmpty.addEntries([])).toBe(mapEmpty);
      expectEqual(mapEmpty.addEntries(arr3), arr3);
      expect(mapEmpty.addEntries(map3)).toBe(map3);
      expectEqual(mapEmpty.addEntries(arr6), arr6);

      expect(map3.addEntries(mapEmpty)).toBe(map3);
      expectEqual(map3.addEntries(arr3), arr3);
      expectEqual(map3.addEntries(arr6), arr6);

      expect(map6.addEntries(mapEmpty)).toBe(map6);
      expectEqual(map6.addEntries(arr3), arr6);
      expectEqual(map6.addEntries(arr6), arr6);
    });

    it('addEntry', () => {
      expect(mapEmpty.addEntry([1, 'a']).toArray()).toEqual([[1, 'a']]);
      expect(mapEmpty.addEntry([1, 'a']).addEntry([1, 'b']).toArray()).toEqual([
        [1, 'b'],
      ]);

      expect(map3.addEntry([10, 'z']).get(10)).toBe('z');
      expect(map3.addEntry([10, 'z']).size).toBe(4);

      expect(map6.addEntry([10, 'z']).get(10)).toBe('z');
      expect(map6.addEntry([10, 'z']).size).toBe(7);
    });

    it('asNormal', () => {
      expect(map3.asNormal()).toBe(map3);
      expect(map6.asNormal()).toBe(map6);
    });

    it('assumeNonEmpty', () => {
      expect(() => mapEmpty.assumeNonEmpty()).toThrow();
      expect(map3.assumeNonEmpty()).toBe(map3);
      expect(map6.assumeNonEmpty()).toBe(map6);
    });

    it('context', () => {
      expect(mapEmpty.context).toBe(GMap);
      expect(map3.context).toBe(GMap);
      expect(map6.context).toBe(GMap);
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
      expectEqual(map3.filter(isEvenKey), [[2, 'b']]);
      expectEqual(map3.filter(first2), [
        [1, 'a'],
        [2, 'b'],
      ]);

      expectEqual(map6.filter(isEvenKey), [
        [2, 'b'],
        [4, 'd'],
        [6, 'f'],
      ]);
      expect(map6.filter(first2).size).toBe(2);
    });

    it('forEach', () => {
      let result = new Set<number>();

      mapEmpty.forEach((entry) => result.add(entry[0]));
      expect(result).toEqual(new Set());

      result = new Set();
      map3.forEach((entry) => result.add(entry[0]));
      expect(result).toEqual(new Set([1, 2, 3]));

      result = new Set();
      map6.forEach((entry) => result.add(entry[0]));
      expect(result).toEqual(new Set([1, 2, 3, 4, 5, 6]));
    });

    it('get', () => {
      expect(mapEmpty.get(2)).toBe(undefined);
      expect(mapEmpty.get(2, 'z')).toBe('z');
      expect(mapEmpty.get(2, () => 'z')).toBe('z');

      expect(map3.get(2)).toBe('b');
      expect(map3.get(2, 'z')).toBe('b');
      expect(map3.get(10)).toBe(undefined);
      expect(map3.get(10, 'z')).toBe('z');

      expect(map6.get(2)).toBe('b');
      expect(map6.get(2, 'z')).toBe('b');
      expect(map6.get(10)).toBe(undefined);
      expect(map6.get(10, 'z')).toBe('z');
    });

    it('hasKey', () => {
      expect(mapEmpty.hasKey(2)).toBe(false);

      expect(map3.hasKey(2)).toBe(true);
      expect(map3.hasKey(10)).toBe(false);

      expect(map6.hasKey(2)).toBe(true);
      expect(map6.hasKey(10)).toBe(false);
    });

    it('isEmpty', () => {
      expect(mapEmpty.isEmpty).toBe(true);
      expect(map3.isEmpty).toBe(false);
      expect(map6.isEmpty).toBe(false);
    });

    it('mapValues', () => {
      expect(mapEmpty.mapValues((v) => v + v)).toBe(mapEmpty);
      expectEqual(
        map3.mapValues((v) => v + v),
        arr3.map(([k, v]) => [k, v + v])
      );
      expectEqual(
        map6.mapValues((v) => v + v),
        arr6.map(([k, v]) => [k, v + v])
      );
    });

    it('modifyAt', () => {
      expect(mapEmpty.modifyAt(2, { ifExists: (v) => v + v })).toBe(mapEmpty);
      expect(mapEmpty.modifyAt(2, { ifNew: 'z' }).get(2)).toBe('z');

      expect(map3.modifyAt(2, { ifExists: (v) => v + v }).get(2)).toBe('bb');
      expect(map3.modifyAt(2, { ifNew: 'bb' }).get(2)).toBe('b');
      expect(
        map3.modifyAt(10, { ifNew: 'z', ifExists: (v) => v + v }).get(10)
      ).toBe('z');
      expect(map3.modifyAt(2, { ifExists: (_, remove) => remove }).get(2)).toBe(
        undefined
      );

      expect(map6.modifyAt(2, { ifExists: (v) => v + v }).get(2)).toBe('bb');
      expect(map6.modifyAt(2, { ifNew: 'bb' }).get(2)).toBe('b');
      expect(
        map6.modifyAt(10, { ifNew: 'z', ifExists: (v) => v + v }).get(10)
      ).toBe('z');
      expect(map6.modifyAt(2, { ifExists: (_, remove) => remove }).get(2)).toBe(
        undefined
      );
    });

    it('nonEmpty', () => {
      expect(mapEmpty.nonEmpty()).toBe(false);
      expect(map3.nonEmpty()).toBe(true);
      expect(map6.nonEmpty()).toBe(true);
    });

    it('removeKey', () => {
      expect(mapEmpty.removeKey(2)).toBe(mapEmpty);
      expect(map3.removeKey(2).get(2)).toBe(undefined);
      expect(map3.removeKey(10)).toBe(map3);
      expect(map6.removeKey(2).get(2)).toBe(undefined);
      expect(map6.removeKey(10)).toBe(map6);
    });

    it('removeKeyAndGet', () => {
      expect(mapEmpty.removeKeyAndGet(2)).toBe(undefined);

      expect(map3.removeKeyAndGet(2)![0].size).toBe(2);
      expect(map3.removeKeyAndGet(2)![1]).toBe('b');
      expect(map3.removeKeyAndGet(10)).toBe(undefined);

      expect(map6.removeKeyAndGet(2)![0].size).toBe(5);
      expect(map6.removeKeyAndGet(2)![1]).toBe('b');
      expect(map6.removeKeyAndGet(10)).toBe(undefined);
    });

    it('removeKeys', () => {
      expect(mapEmpty.removeKeys([10, 11])).toBe(mapEmpty);

      expect(map3.removeKeys([10])).toBe(map3);
      expect(map3.removeKeys([1, 3, 10]).size).toBe(1);
      expect(map3.removeKeys([1, 3, 10]).get(2)).toBe('b');
      expect(map3.removeKeys([1, 3, 10]).get(1)).toBe(undefined);

      expect(map6.removeKeys([10])).toBe(map6);
      expect(map6.removeKeys([1, 3, 10]).size).toBe(4);
      expect(map6.removeKeys([1, 3, 10]).get(2)).toBe('b');
      expect(map6.removeKeys([1, 3, 10]).get(1)).toBe(undefined);
    });

    it('set', () => {
      expect(mapEmpty.set(1, 'a').get(1)).toBe('a');

      expect(map3.set(10, 'z').get(10)).toBe('z');
      expect(map3.set(2, 'z').get(2)).toBe('z');

      expect(map6.set(10, 'z').get(10)).toBe('z');
      expect(map6.set(2, 'z').get(2)).toBe('z');
    });

    it('size', () => {
      expect(mapEmpty.size).toBe(0);
      expect(map3.size).toBe(3);
      expect(map6.size).toBe(6);
    });

    it('stream', () => {
      expect(mapEmpty.stream()).toBe(Stream.empty());
      expect(new Map(map3.stream())).toEqual(new Map(arr3));
      expect(new Map(map6.stream())).toEqual(new Map(arr6));
    });

    it('streamKeys', () => {
      expect(mapEmpty.streamKeys()).toBe(Stream.empty());
      expect(new Set(map3.streamKeys())).toEqual(
        new Set(arr3.map(Entry.first))
      );
      expect(new Set(map6.streamKeys())).toEqual(
        new Set(arr6.map(Entry.first))
      );
    });

    it('streamValues', () => {
      expect(mapEmpty.streamValues()).toBe(Stream.empty());
      expect(new Set(map3.streamValues())).toEqual(
        new Set(arr3.map(Entry.second))
      );
      expect(new Set(map6.streamValues())).toEqual(
        new Set(arr6.map(Entry.second))
      );
    });

    it('toArray', () => {
      expect(mapEmpty.toArray()).toEqual([]);
      expect(new Map(map3.toArray())).toEqual(new Map(arr3));
      expect(new Map(map6.toArray())).toEqual(new Map(arr6));
    });

    it('toBuilder', () => {
      expect(mapEmpty.toBuilder().build()).toBe(mapEmpty);
      expect(map3.toBuilder().build()).toBe(map3);
      expect(map6.toBuilder().build()).toBe(map6);

      {
        const b = mapEmpty.toBuilder();
        expect(b.isEmpty).toBe(true);
      }
      {
        const b = map3.toBuilder();
        expect(b.get(2)).toBe('b');
        expect(b.get(10)).toBe(undefined);
      }
      {
        const b = map6.toBuilder();
        expect(b.get(2)).toBe('b');
        expect(b.get(10)).toBe(undefined);
      }
    });

    it('toString', () => {
      expect(mapEmpty.toString()).toBe(`${GMap.typeTag}()`);
      expect(map3.toString()).toBe(`${GMap.typeTag}(1 -> a, 2 -> b, 3 -> c)`);
    });

    it('updateAt', () => {
      expect(mapEmpty.updateAt(2, 'z')).toBe(mapEmpty);
      expect(mapEmpty.updateAt(2, (v) => v + v)).toBe(mapEmpty);

      expect(map3.updateAt(2, 'z').get(2)).toBe('z');
      expect(map3.updateAt(2, (v) => v + v).get(2)).toBe('bb');
      expect(map3.updateAt(10, 'z')).toBe(map3);

      expect(map6.updateAt(2, 'z').get(2)).toBe('z');
      expect(map6.updateAt(2, (v) => v + v).get(2)).toBe('bb');
      expect(map6.updateAt(10, 'z')).toBe(map6);
    });

    it('merge', () => {
      expect(mapEmpty.merge(mapEmpty)).toBe(mapEmpty);
      expect(mapEmpty.merge(map3)).toBe(mapEmpty);
      expect(map3.merge(mapEmpty)).toBe(mapEmpty);
      expectEqual(
        map3.merge(map3),
        arr3.map(([k, v]) => [k, [v, v] as [string, string]])
      );
      expectEqual(
        map6.merge(arr6),
        arr6.map(([k, v]) => [k, [v, v] as [string, string]])
      );
      expectEqual(map3.merge(map6), [
        [1, ['a', 'a']],
        [2, ['b', 'b']],
        [3, ['c', 'c']],
      ]);
      expectEqual(map6.merge(map3), [
        [1, ['a', 'a']],
        [2, ['b', 'b']],
        [3, ['c', 'c']],
      ]);
    });

    it('mergeAll', () => {
      expect(mapEmpty.mergeAll(undefined, mapEmpty)).toBe(mapEmpty);
      expect(map3.mergeAll(undefined, map3).toArray()).toEqual(
        arr3.map(([k, v]) => [k, [v, v]])
      );
      expectEqual(
        map6.mergeAll(undefined, arr6),
        arr6.map(([k, v]) => [k, [v, v] as [string, string]])
      );
      expectEqual(map3.mergeAll(undefined, map6), [
        [1, ['a', 'a']],
        [2, ['b', 'b']],
        [3, ['c', 'c']],
        [4, [undefined, 'd']],
        [5, [undefined, 'e']],
        [6, [undefined, 'f']],
      ]);
      expectEqual(map6.mergeAll(undefined, map3), [
        [1, ['a', 'a']],
        [2, ['b', 'b']],
        [3, ['c', 'c']],
        [4, ['d', undefined]],
        [5, ['e', undefined]],
        [6, ['f', undefined]],
      ]);
    });

    it('mergeAllWith', () => {
      const toTuple = <A, B>(_: any, a: A, b: B) => [a, b] as [A, B];

      expect(mapEmpty.mergeAllWith(undefined, toTuple, mapEmpty)).toBe(
        mapEmpty
      );
      expectEqual(
        mapEmpty.mergeAllWith(undefined, toTuple, map3),
        arr3.map(([k, v]) => [
          k,
          [undefined, v] as [string | undefined, string | undefined],
        ])
      );
      expectEqual(
        map3.mergeAllWith(undefined, toTuple, mapEmpty),
        arr3.map(([k, v]) => [
          k,
          [v, undefined] as [string | undefined, string | undefined],
        ])
      );
      expectEqual(
        map3.mergeAllWith(undefined, toTuple, map3),
        arr3.map(([k, v]) => [
          k,
          [v, v] as [string | undefined, string | undefined],
        ])
      );
      expectEqual(
        map6.mergeAllWith(undefined, toTuple, map6),
        arr6.map(([k, v]) => [k, [v, v] as [string, string]])
      );

      expectEqual(map3.mergeAllWith(undefined, toTuple, map6), [
        [1, ['a', 'a']],
        [2, ['b', 'b']],
        [3, ['c', 'c']],
        [4, [undefined, 'd']],
        [5, [undefined, 'e']],
        [6, [undefined, 'f']],
      ]);

      expectEqual(map6.mergeAllWith(undefined, toTuple, map3), [
        [1, ['a', 'a']],
        [2, ['b', 'b']],
        [3, ['c', 'c']],
        [4, ['d', undefined]],
        [5, ['e', undefined]],
        [6, ['f', undefined]],
      ]);
    });

    it('mergeWith', () => {
      const toTuple = <A, B>(_: any, a: A, b: B) => [a, b] as [A, B];

      expect(mapEmpty.mergeWith(toTuple, mapEmpty)).toBe(mapEmpty);
      expect(mapEmpty.mergeWith(toTuple, map3)).toBe(mapEmpty);
      expect(map3.mergeWith(toTuple, mapEmpty)).toBe(mapEmpty);
      expectEqual(
        map3.mergeWith(toTuple, map3),
        arr3.map(([k, v]) => [k, [v, v] as [string, string]])
      );
      expectEqual(
        map6.mergeWith(toTuple, map6),
        arr6.map(([k, v]) => [k, [v, v] as [string, string]])
      );

      expectEqual(map3.mergeWith(toTuple, map6), [
        [1, ['a', 'a']],
        [2, ['b', 'b']],
        [3, ['c', 'c']],
      ]);

      expectEqual(map6.mergeWith(toTuple, map3), [
        [1, ['a', 'a']],
        [2, ['b', 'b']],
        [3, ['c', 'c']],
      ]);
    });
  });

  describe(`${name}.Builder`, () => {
    function forEachBuilder(
      f: (builder: RMap.Builder<number, string>) => void
    ) {
      const b1 = GMap.from(arr3).toBuilder();
      const b2 = GMap.builder<number, string>();
      b2.addEntries(arr3);

      f(b1);
      f(b2);
    }

    it('addEntries', () => {
      const b = GMap.builder<number, string>();
      expect(b.size).toBe(0);
      expect(b.addEntries(arr3)).toBe(true);
      expect(b.size).toBe(3);
      expect(b.addEntries(arr3)).toBe(false);
      expect(b.size).toBe(3);
    });

    it('addEntry', () => {
      const b = GMap.builder<number, string>();
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
      const b = GMap.builder<number, string>();
      expect(b.build()).toBe(GMap.empty());

      forEachBuilder((b) => {
        expect(b.build().size).toBe(3);
        expect(b.build().get(2)).toBe('b');
      });
    });

    it('buildMapValues', () => {
      const b = GMap.builder<number, string>();
      expect(b.buildMapValues((v) => v + v)).toBe(GMap.empty());
      b.addEntries(arr3);
      expect(b.buildMapValues((v) => v + v).size).toBe(3);
      expect(b.buildMapValues((v) => v + v).get(2)).toBe('bb');
    });

    it('context', () => {
      const b = GMap.builder<number, string>();
      expect(b.context).toBe(GMap);
    });

    it('forEach', () => {
      const b = GMap.builder<number, string>();

      const result = new Set<readonly [number, string]>();

      b.forEach((entry) => result.add(entry));
      expect(result).toEqual(new Set());

      forEachBuilder((b) => {
        const result = new Set<readonly [number, string]>();

        b.forEach((entry) => result.add(entry));
        expect(result).toEqual(new Set(arr3));
      });
    });

    it('operations throw in forEach when modifying collection', () => {
      forEachBuilder((b) => {
        expect(() => b.forEach(() => b.addEntries([[1, 'a']]))).toThrow();
        expect(() => b.forEach(() => b.addEntry([1, 'a']))).toThrow();
        expect(() => b.forEach(() => b.modifyAt(1, {}))).toThrow();
        expect(() => b.forEach(() => b.removeKey(1))).toThrow();
        expect(() => b.forEach(() => b.removeKeys([1]))).toThrow();
        expect(() => b.forEach(() => b.set(1, 'a'))).toThrow();
        expect(() => b.forEach(() => b.updateAt(1, 'a'))).toThrow();
      });
    });

    it('get', () => {
      forEachBuilder((b) => {
        expect(b.get(2)).toBe('b');
        expect(b.get(2, 'z')).toBe('b');
        expect(b.get(10)).toBe(undefined);
        expect(b.get(10, 'z')).toBe('z');
        expect(b.get(10, () => 'z')).toBe('z');
      });
    });

    it('hasKey', () => {
      forEachBuilder((b) => {
        expect(b.hasKey(2)).toBe(true);
        expect(b.hasKey(10)).toBe(false);
      });
    });

    it('isEmpty', () => {
      const b = GMap.builder<number, string>();

      expect(b.isEmpty).toBe(true);
      b.set(1, 'a');
      expect(b.isEmpty).toBe(false);
    });

    it('modifyAt', () => {
      forEachBuilder((b) => {
        expect(b.modifyAt(2, { ifExists: (v) => v + v })).toBe(true);
        expect(b.get(2)).toBe('bb');

        expect(b.modifyAt(1, { ifExists: (v) => v })).toBe(false);

        expect(b.modifyAt(3, { ifNew: 'z' })).toBe(false);
        expect(b.get(3)).toBe('c');

        expect(b.modifyAt(10, { ifExists: (v) => v + v })).toBe(false);
        expect(b.get(10)).toBe(undefined);

        expect(b.size).toBe(3);

        expect(b.modifyAt(10, { ifNew: 'z' })).toBe(true);
        expect(b.get(10)).toBe('z');

        expect(b.size).toBe(4);

        expect(b.modifyAt(2, { ifExists: (_, remove) => remove })).toBe(true);
        expect(b.get(2)).toBe(undefined);

        expect(b.size).toBe(3);
      });
    });

    it('removeKey', () => {
      forEachBuilder((b) => {
        expect(b.removeKey(10)).toBe(undefined);
        expect(b.removeKey(10, 'z')).toBe('z');
        expect(b.size).toBe(3);
        expect(b.removeKey(2)).toBe('b');
        expect(b.size).toBe(2);
        expect(b.removeKey(3, 'z')).toBe('c');
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

    it('set', () => {
      forEachBuilder((b) => {
        expect(b.set(2, 'a')).toBe(true);
        expect(b.set(2, 'a')).toBe(false);
        expect(b.size).toBe(3);
        expect(b.set(10, 'a')).toBe(true);
        expect(b.size).toBe(4);
      });
    });

    it('size', () => {
      forEachBuilder((b) => {
        expect(b.size).toBe(3);
      });
    });

    it('updateAt', () => {
      forEachBuilder((b) => {
        expect(b.updateAt(10, (v) => v + v)).toBe(undefined);
        expect(b.size).toBe(3);
        expect(b.updateAt(2, (v) => v + v)).toBe('b');
        expect(b.updateAt(2, (v) => v + v)).toBe('bb');
        expect(b.size).toBe(3);
      });
    });
  });
}
