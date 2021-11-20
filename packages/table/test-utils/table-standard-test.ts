import type { ArrayNonEmpty } from '@rimbu/common';
import { Stream } from '@rimbu/stream';
import { Table } from '..';

function expectEqual<R, C, V>(
  map: Table<R, C, V> | Table.NonEmpty<R, C, V>,
  arr: [R, C, V][]
): void {
  expect(new Set(map)).toEqual(new Set(arr));
}

const arr3 = [
  [1, 'a', true],
  [2, 'b', true],
  [1, 'c', true],
] as ArrayNonEmpty<[number, string, boolean]>;

const arr6 = [
  [1, 'a', true],
  [2, 'b', true],
  [1, 'c', true],
  [1, 'd', true],
  [2, 'e', true],
  [3, 'f', true],
] as ArrayNonEmpty<[number, string, boolean]>;

export function runTableTestsWith(
  name: string,
  T: Table.Context<any, any>
): void {
  describe(`${name} creators`, () => {
    it('empty', () => {
      expect(T.empty<number, number, number>()).toBe(
        T.empty<string, string, string>()
      );
    });

    it('of', () => {
      expectEqual(T.of(...arr3), arr3);
      expectEqual(T.of(...arr6), arr6);
      expectEqual(T.of([1, 'a', true], [1, 'a', false]), [[1, 'a', false]]);
    });

    it('from', () => {
      expectEqual(T.from(arr3), arr3);
      expectEqual(T.from(arr6), arr6);
      expectEqual(
        T.from([
          [1, 'a', true],
          [1, 'a', false],
        ]),
        [[1, 'a', false]]
      );

      {
        const t = T.from(arr3);
        expect(T.from(t)).toBe(t);
      }

      {
        const c = Table.createContext({
          rowContext: T.rowContext,
          columnContext: T.columnContext,
        });
        const t = c.from(arr3);
        expect(T.from(t)).not.toBe(t);
      }
    });

    it('builder', () => {
      const b = T.builder<number, string, boolean>();
      expect(b.size).toBe(0);
      b.addEntries(arr6);
      expect(b.size).toBe(6);
    });

    it('reducer', () => {
      const source = Stream.of<[number, string, boolean]>(
        [1, 'a', true],
        [2, 'b', false],
        [3, 'a', true]
      );
      {
        const result = source.reduce(T.reducer());
        expectEqual(result, [
          [1, 'a', true],
          [2, 'b', false],
          [3, 'a', true],
        ]);
      }

      {
        const result = source.reduce(
          T.reducer([
            [3, 'a', false],
            [3, 'b', true],
          ])
        );
        expectEqual(result, [
          [1, 'a', true],
          [2, 'b', false],
          [3, 'a', true],
          [3, 'b', true],
        ]);
      }
    });
  });

  describe(`${name} methods`, () => {
    const tableEmpty = T.empty<number, string, boolean>();
    const table3 = T.from(arr3);
    const table6 = T.from(arr6);

    it('iterator', () => {
      expect(new Set(tableEmpty)).toEqual(new Set());
      expect(new Set(table3)).toEqual(new Set(arr3));
      expect(new Set(table6)).toEqual(new Set(arr6));
    });

    it('addEntries', () => {
      expect(tableEmpty.addEntries([])).toBe(tableEmpty);
      expectEqual(tableEmpty.addEntries(arr3), arr3);
      expect(tableEmpty.addEntries(table3)).toBe(table3);
      expect(tableEmpty.addEntries(table6)).toBe(table6);

      expect(table3.addEntries(arr3)).toBe(table3);
      expectEqual(table3.addEntries(arr6), arr6);
      // expect(table6.addEntries(arr6)).toBe(table6);
    });

    it('addEntry', () => {
      expectEqual(tableEmpty.addEntry([1, 'a', true]), [[1, 'a', true]]);
      expectEqual(
        tableEmpty.addEntry([1, 'a', true]).addEntry([1, 'a', false]),
        [[1, 'a', false]]
      );

      expect(table3.addEntry([10, 'a', true]).get(10, 'a')).toBe(true);
      expect(table3.addEntry([10, 'a', true]).size).toBe(4);

      expect(table6.addEntry([10, 'a', true]).get(10, 'a')).toBe(true);
      expect(table6.addEntry([10, 'a', true]).size).toBe(7);
    });

    it('amountRows', () => {
      expect(tableEmpty.amountRows).toBe(0);
      expect(table3.amountRows).toBe(2);
      expect(table6.amountRows).toBe(3);
    });

    it('asNormal', () => {
      expect(table3.asNormal()).toBe(table3);
      expect(table6.asNormal()).toBe(table6);
    });

    it('assumeNonEmpty', () => {
      expect(() => tableEmpty.assumeNonEmpty()).toThrow();
      expect(table3.assumeNonEmpty()).toBe(table3);
      expect(table6.assumeNonEmpty()).toBe(table6);
    });

    it('context', () => {
      expect(tableEmpty.context).toBe(T);
      expect(table3.context).toBe(T);
      expect(table6.context).toBe(T);
    });

    it('filter', () => {
      function isEvenKey(entry: [number, string, boolean]): boolean {
        return entry[0] % 2 === 0;
      }

      function first2(
        entry: [number, string, boolean],
        index: number,
        halt: () => void
      ): boolean {
        if (index > 0) halt();
        return true;
      }

      expect(tableEmpty.filter(isEvenKey)).toBe(tableEmpty);

      expectEqual(table3.filter(isEvenKey), [[2, 'b', true]]);
      expectEqual(table3.filter(first2), [
        [1, 'a', true],
        [1, 'c', true],
      ]);

      expectEqual(table6.filter(isEvenKey), [
        [2, 'b', true],
        [2, 'e', true],
      ]);
      expect(table6.filter(first2).size).toBe(2);
    });

    it('filterRows', () => {
      expect(tableEmpty.filterRows(([_, map]) => map.size > 1)).toBe(
        tableEmpty
      );
      expectEqual(
        table3.filterRows(([_, map]) => map.size > 1),
        [
          [1, 'a', true],
          [1, 'c', true],
        ]
      );
    });

    it('forEach', () => {
      let result = new Set<string>();

      tableEmpty.forEach((entry) => result.add(entry[1]));
      expect(result).toEqual(new Set());

      result = new Set();
      table3.forEach((entry) => result.add(entry[1]));
      expect(result).toEqual(new Set('abc'));

      result = new Set();
      table6.forEach((entry) => result.add(entry[1]));
      expect(result).toEqual(new Set('abcdef'));
    });

    it('get', () => {
      expect(tableEmpty.get(1, 'a')).toBe(undefined);
      expect(tableEmpty.get(1, 'a', 0)).toBe(0);
      expect(tableEmpty.get(1, 'a', () => 0)).toBe(0);

      expect(table3.get(10, 'a')).toBe(undefined);
      expect(table3.get(10, 'a', 0)).toBe(0);
      expect(table3.get(1, 'z')).toBe(undefined);
      expect(table3.get(1, 'z', 0)).toBe(0);
      expect(table3.get(2, 'b')).toBe(true);
      expect(table3.get(2, 'b', 0)).toBe(true);
    });

    it('getRow', () => {
      expect(tableEmpty.getRow(1)).toBe(T.columnContext.empty());
      expect(table3.getRow(10)).toBe(T.columnContext.empty());
      expect(new Map(table3.getRow(1))).toEqual(
        new Map([
          ['a', true],
          ['c', true],
        ])
      );
    });

    it('hasRowKey', () => {
      expect(tableEmpty.hasRowKey(1)).toBe(false);
      expect(table3.hasRowKey(10)).toBe(false);
      expect(table3.hasRowKey(1)).toBe(true);
    });

    it('hasValueAt', () => {
      expect(tableEmpty.hasValueAt(1, 'a')).toBe(false);
      expect(table3.hasValueAt(10, 'a')).toBe(false);
      expect(table3.hasValueAt(1, 'z')).toBe(false);
      expect(table3.hasValueAt(2, 'b')).toBe(true);
    });

    it('isEmpty', () => {
      expect(tableEmpty.isEmpty).toBe(true);
      expect(table3.isEmpty).toBe(false);
      expect(table6.isEmpty).toBe(false);
    });

    it('mapValues', () => {
      expect(tableEmpty.mapValues((v) => (v ? 'a' : 'b'))).toBe(tableEmpty);
      expectEqual(
        table3.mapValues((v): string => (v ? 'a' : 'b')),
        [
          [1, 'a', 'a'],
          [1, 'c', 'a'],
          [2, 'b', 'a'],
        ]
      );
    });

    it('modifyAt', () => {
      expect(
        tableEmpty.modifyAt(1, 'a', {
          ifNew: (none) => none,
          ifExists: () => true,
        })
      ).toBe(tableEmpty);
      expectEqual(tableEmpty.modifyAt(1, 'a', { ifNew: true }), [
        [1, 'a', true],
      ]);
      expectEqual(tableEmpty.modifyAt(1, 'a', { ifNew: () => true }), [
        [1, 'a', true],
      ]);
      expect(
        table3.modifyAt(10, 'z', {
          ifNew: (none) => none,
          ifExists: () => true,
        })
      ).toBe(table3);
      expect(
        table3.modifyAt(1, 'a', {
          ifNew: (none) => none,
          ifExists: () => true,
        })
      ).toBe(table3);
      expectEqual(
        table3.modifyAt(1, 'a', {
          ifNew: (none) => none,
          ifExists: () => false,
        }),
        [
          [1, 'a', false],
          [1, 'c', true],
          [2, 'b', true],
        ]
      );
      expectEqual(
        table3.modifyAt(1, 'a', {
          ifNew: (none) => none,
          ifExists: (_, remove) => remove,
        }),
        [
          [1, 'c', true],
          [2, 'b', true],
        ]
      );
      expectEqual(
        table3.modifyAt(10, 'a', {
          ifNew: true,
          ifExists: (_, remove) => remove,
        }),
        [
          [1, 'a', true],
          [1, 'c', true],
          [2, 'b', true],
          [10, 'a', true],
        ]
      );
    });

    it('nonEmpty', () => {
      expect(tableEmpty.nonEmpty()).toBe(false);
      expect(table3.nonEmpty()).toBe(true);
      expect(table6.nonEmpty()).toBe(true);
    });

    it('remove', () => {
      expect(tableEmpty.remove(1, 'a')).toBe(tableEmpty);
      expect(table3.remove(10, 'a')).toBe(table3);
      expectEqual(table3.remove(1, 'a'), [
        [2, 'b', true],
        [1, 'c', true],
      ]);
    });

    it('removeAndGet', () => {
      expect(tableEmpty.removeAndGet(1, 'a')).toBe(undefined);
      expect(table3.removeAndGet(10, 'a')).toBe(undefined);
      const [newTable, value] = table3.removeAndGet(1, 'a')!;
      expectEqual(newTable, [
        [2, 'b', true],
        [1, 'c', true],
      ]);
      expect(value).toBe(true);
    });

    it('removeEntries', () => {
      expect(
        tableEmpty.removeEntries([
          [1, 'a'],
          [2, 'b'],
        ])
      ).toBe(tableEmpty);
      expect(
        table3.removeEntries([
          [1, 'z'],
          [10, 'a'],
        ])
      ).toBe(table3);
      expectEqual(
        table3.removeEntries([
          [1, 'a'],
          [2, 'b'],
        ]),
        [[1, 'c', true]]
      );
    });

    it('removeRow', () => {
      expect(tableEmpty.removeRow(1)).toBe(tableEmpty);
      expect(table3.removeRow(10)).toBe(table3);
      expectEqual(table3.removeRow(1), [[2, 'b', true]]);
    });

    it('removeRowAndGet', () => {
      expect(tableEmpty.removeRowAndGet(1)).toBe(undefined);
      expect(table3.removeRowAndGet(10)).toBe(undefined);
      const [newTable, row] = table3.removeRowAndGet(1)!;
      expectEqual(newTable, [[2, 'b', true]]);
      expect(new Set(row)).toEqual(
        new Set([
          ['a', true],
          ['c', true],
        ])
      );
    });

    it('removeRows', () => {
      expect(tableEmpty.removeRows([10, 11])).toBe(tableEmpty);
      expect(table3.removeRows([10, 11])).toBe(table3);
      expectEqual(table3.removeRows([1, 10]), [[2, 'b', true]]);
    });

    it('rowMap', () => {
      expect(tableEmpty.rowMap).toBe(T.rowContext.empty());
      expect(table3.rowMap.context).toBe(T.rowContext);
      expect(table3.rowMap.size).toBe(2);
    });

    it('set', () => {
      expectEqual(tableEmpty.set(1, 'a', true), [[1, 'a', true]]);
      expectEqual(tableEmpty.set(1, 'a', true).set(1, 'a', false), [
        [1, 'a', false],
      ]);

      expect(table3.set(10, 'a', true).get(10, 'a')).toBe(true);
      expect(table3.set(10, 'a', true).size).toBe(4);

      expect(table6.set(10, 'a', true).get(10, 'a')).toBe(true);
      expect(table6.set(10, 'a', true).size).toBe(7);
    });

    it('size', () => {
      expect(tableEmpty.size).toBe(0);
      expect(table3.size).toBe(3);
      expect(table6.size).toBe(6);
    });

    it('stream', () => {
      expect(tableEmpty.stream()).toBe(Stream.empty());
      expect(new Set(table3.stream())).toEqual(new Set(arr3));
      expect(new Set(table6.stream())).toEqual(new Set(arr6));
    });

    it('streamRows', () => {
      expect(tableEmpty.streamRows()).toBe(Stream.empty());
      expect(new Set(table3.streamRows())).toEqual(new Set([1, 2]));
    });

    it('streamValues', () => {
      expect(tableEmpty.streamValues()).toBe(Stream.empty());
      expect(table3.streamValues().toArray()).toEqual([true, true, true]);
    });

    it('toArray', () => {
      expect(tableEmpty.toArray()).toEqual([]);
      expect(new Set(table3.toArray())).toEqual(new Set(arr3));
      expect(new Set(table6.toArray())).toEqual(new Set(arr6));
    });

    it('toBuilder', () => {
      expect(tableEmpty.toBuilder().build()).toBe(tableEmpty);
      expect(table3.toBuilder().build()).toBe(table3);
      expect(table6.toBuilder().build()).toBe(table6);

      {
        const b = tableEmpty.toBuilder();
        expect(b.isEmpty).toBe(true);
      }
      {
        const b = table3.toBuilder();
        expect(b.get(1, 'a')).toBe(true);
        expect(b.get(10, 'a')).toBe(undefined);
      }
      {
        const b = table6.toBuilder();
        expect(b.get(1, 'a')).toBe(true);
        expect(b.get(10, 'a')).toBe(undefined);
      }
    });

    it('toString', () => {
      expect(tableEmpty.toString()).toBe(`${T.typeTag}()`);
      expect(table3.toString()).toBe(
        `${T.typeTag}([1, a] -> true, [1, c] -> true, [2, b] -> true)`
      );
    });

    it('updateAt', () => {
      expect(tableEmpty.updateAt(1, 'a', false)).toBe(tableEmpty);
      expect(tableEmpty.updateAt(1, 'a', (v) => !v)).toBe(tableEmpty);
      expect(table3.updateAt(10, 'a', false)).toBe(table3);
      expect(table3.updateAt(1, 'a', true)).toBe(table3);
      expectEqual(table3.updateAt(1, 'a', false), [
        [1, 'a', false],
        [2, 'b', true],
        [1, 'c', true],
      ]);
      expectEqual(
        table3.updateAt(1, 'a', (v) => !v),
        [
          [1, 'a', false],
          [2, 'b', true],
          [1, 'c', true],
        ]
      );
    });

    describe(`${name}.Builder`, () => {
      function forEachBuilder(
        f: (builder: Table.Builder<number, string, boolean>) => void
      ): void {
        const b1 = T.from(arr3).toBuilder();
        const b2 = T.builder<number, string, boolean>();
        b2.addEntries(arr3);

        f(b1);
        f(b2);
      }

      it('addEntries', () => {
        const b = T.builder<number, string, boolean>();

        expect(b.size).toBe(0);
        expect(b.addEntries(arr3)).toBe(true);
        expect(b.size).toBe(3);
        expect(b.addEntries(arr3)).toBe(false);
        expect(b.size).toBe(3);
      });

      it('addEntry', () => {
        const b = T.builder<number, string, boolean>();
        expect(b.size).toBe(0);
        expect(b.addEntry([1, 'a', true])).toBe(true);
        expect(b.size).toBe(1);
        expect(b.addEntry([2, 'b', true])).toBe(true);
        expect(b.size).toBe(2);
        expect(b.addEntry([2, 'b', false])).toBe(true);
        expect(b.size).toBe(2);
        expect(b.addEntry([2, 'b', false])).toBe(false);
        expect(b.size).toBe(2);
      });

      it('amountRows', () => {
        expect(T.builder().amountRows).toBe(0);
      });

      it('build', () => {
        const b = T.builder<number, string, boolean>();
        expect(b.build()).toBe(T.empty());

        forEachBuilder((b) => {
          expect(b.build().size).toBe(3);
          expect(b.build().get(2, 'b')).toBe(true);
        });
      });

      it('buildMapValues', () => {
        expect(T.builder().buildMapValues((v) => v)).toBe(T.empty());

        forEachBuilder((b) => {
          expectEqual(
            b.buildMapValues(() => 1),
            [
              [1, 'a', 1],
              [2, 'b', 1],
              [1, 'c', 1],
            ]
          );
        });
      });

      it('forEach', () => {
        const b = T.builder<number, string, boolean>();

        const result = new Set<[number, string, boolean]>();

        b.forEach((entry) => result.add(entry));
        expect(result).toEqual(new Set());

        forEachBuilder((b) => {
          const result = new Set<[number, string, boolean]>();

          b.forEach((entry) => result.add(entry));
          expect(result).toEqual(new Set(arr3));
        });
      });

      it('operations throw in forEach when modifying collection', () => {
        forEachBuilder((b) => {
          expect(() =>
            b.forEach(() => b.addEntries([[1, 'a', false]]))
          ).toThrow();
          expect(() => b.forEach(() => b.addEntry([1, 'a', false]))).toThrow();
          expect(() => b.forEach(() => b.modifyAt(1, 'a', {}))).toThrow();
          expect(() => b.forEach(() => b.remove(1, 'a'))).toThrow();
          expect(() => b.forEach(() => b.removeEntries([[1, 'a']]))).toThrow();
          expect(() => b.forEach(() => b.removeRow(1))).toThrow();
          expect(() => b.forEach(() => b.removeRows([1]))).toThrow();
          expect(() => b.forEach(() => b.set(1, 'a', false))).toThrow();
          expect(() => b.forEach(() => b.updateAt(1, 'a', false))).toThrow();
        });
      });

      it('get', () => {
        const b = T.builder<number, string, boolean>();
        expect(b.get(1, 'a')).toBe(undefined);
        expect(b.get(1, 'a', true)).toBe(true);
        expect(b.get(1, 'a', () => true)).toBe(true);

        forEachBuilder((b) => {
          expect(b.get(10, 'a')).toBe(undefined);
          expect(b.get(10, 'a', true)).toBe(true);
          expect(b.get(10, 'a', () => true)).toBe(true);
          expect(b.get(1, 'a')).toBe(true);
          expect(b.get(1, 'a', 1)).toBe(true);
          expect(b.get(1, 'a', () => 1)).toBe(true);
        });
      });

      it('getRow', () => {
        const b = T.builder<number, string, boolean>();
        expect(b.getRow(1)).toBe(T.columnContext.empty());

        forEachBuilder((b) => {
          expect(new Set(b.getRow(1).toArray())).toEqual(
            new Set([
              ['a', true],
              ['c', true],
            ])
          );
        });
      });

      it('hasRowKey', () => {
        const b = T.builder<number, string, boolean>();

        expect(b.hasRowKey(1)).toBe(false);

        forEachBuilder((b) => {
          expect(b.hasRowKey(10)).toBe(false);
          expect(b.hasRowKey(2)).toBe(true);
        });
      });

      it('hasValueAt', () => {
        const b = T.builder<number, string, boolean>();

        expect(b.hasValueAt(1, 'a')).toBe(false);

        forEachBuilder((b) => {
          expect(b.hasValueAt(10, 'a')).toBe(false);
          expect(b.hasValueAt(2, 'b')).toBe(true);
        });
      });

      it('isEmpty', () => {
        const b = T.builder<number, string, boolean>();
        expect(b.isEmpty).toBe(true);

        forEachBuilder((b) => {
          expect(b.isEmpty).toBe(false);
        });
      });

      it('modifyAt', () => {
        const b = T.builder<number, string, boolean>();
        expect(
          b.modifyAt(1, 'a', { ifNew: (none) => none, ifExists: (v) => !v })
        ).toBe(false);
        expect(b.size).toBe(0);
        expect(b.build().size).toBe(0);

        expect(b.modifyAt(1, 'a', { ifNew: true })).toBe(true);
        expect(b.size).toBe(1);
        expect(b.get(1, 'a')).toBe(true);
        expect(b.build().get(1, 'a')).toBe(true);

        expect(b.modifyAt(1, 'a', { ifNew: true })).toBe(false);

        expect(b.modifyAt(1, 'a', { ifExists: (v) => !v })).toBe(true);
        expect(b.size).toBe(1);
        expect(b.get(1, 'a')).toBe(false);
        expect(b.build().get(1, 'a')).toBe(false);

        expect(b.modifyAt(2, 'a', { ifNew: true })).toBe(true);
        expect(b.size).toBe(2);

        expect(b.modifyAt(1, 'a', { ifExists: (_, remove) => remove })).toBe(
          true
        );
        expect(b.size).toBe(1);
        expect(b.get(1, 'a')).toBe(undefined);
        expect(b.build().get(1, 'a')).toBe(undefined);
        expect(b.get(2, 'a')).toBe(true);
        expect(b.build().get(2, 'a')).toBe(true);
      });

      it('remove', () => {
        const b = T.builder<number, string, boolean>();
        expect(b.remove(1, 'a')).toBe(undefined);
        expect(b.remove(1, 'a', 1)).toBe(1);
        expect(b.remove(1, 'a', () => 1)).toBe(1);

        forEachBuilder((b) => {
          expect(b.remove(10, 'a')).toBe(undefined);
          expect(b.remove(1, 'z')).toBe(undefined);
          expect(b.remove(1, 'z', 1)).toBe(1);
          expect(b.remove(1, 'z', () => 1)).toBe(1);
          expect(b.remove(1, 'a')).toBe(true);
          expect(b.remove(2, 'b', 1)).toBe(true);
        });
      });

      it('removeEntries', () => {
        const b = T.builder<number, string, boolean>();
        expect(b.removeEntries([[1, 'a']])).toBe(false);

        forEachBuilder((b) => {
          expect(
            b.removeEntries([
              [10, 'a'],
              [1, 'z'],
            ])
          ).toBe(false);
          expect(
            b.removeEntries([
              [1, 'a'],
              [1, 'z'],
            ])
          ).toBe(true);
          expect(b.size).toBe(2);
        });
      });

      it('removeRow', () => {
        const b = T.builder<number, string, boolean>();
        expect(b.removeRow(1)).toBe(false);

        forEachBuilder((b) => {
          expect(b.removeRow(10)).toBe(false);
          expect(b.removeRow(1)).toBe(true);
        });
      });

      it('removeRows', () => {
        const b = T.builder<number, string, boolean>();
        expect(b.removeRows([1, 2])).toBe(false);

        forEachBuilder((b) => {
          expect(b.removeRows([10, 11])).toBe(false);
          expect(b.removeRows([1, 10])).toBe(true);
        });
      });

      it('set', () => {
        const b = T.builder<number, string, boolean>();
        expect(b.size).toBe(0);
        expect(b.set(1, 'a', true)).toBe(true);
        expect(b.size).toBe(1);
        expect(b.set(2, 'b', true)).toBe(true);
        expect(b.size).toBe(2);
        expect(b.set(2, 'b', false)).toBe(true);
        expect(b.size).toBe(2);
        expect(b.set(2, 'b', false)).toBe(false);
        expect(b.size).toBe(2);
      });

      it('size', () => {
        const b = T.builder<number, string, boolean>();
        expect(b.size).toBe(0);

        forEachBuilder((b) => {
          expect(b.size).toBe(3);
        });
      });

      it('updateAt', () => {
        const b = T.builder<number, string, boolean>();
        expect(b.updateAt(1, 'a', false)).toBe(undefined);
        expect(b.updateAt(1, 'a', false, 1)).toBe(1);
        expect(b.updateAt(1, 'a', () => false)).toBe(undefined);
        expect(
          b.updateAt(
            1,
            'a',
            () => false,
            () => 1
          )
        ).toBe(1);

        forEachBuilder((b) => {
          expect(b.updateAt(10, 'a', false)).toBe(undefined);
          expect(b.updateAt(10, 'a', false, 1)).toBe(1);
          expect(b.updateAt(10, 'a', () => false)).toBe(undefined);
          expect(b.updateAt(1, 'a', true)).toBe(true);
          expect(b.updateAt(1, 'a', () => true)).toBe(true);
          expect(b.updateAt(1, 'a', (v) => !v)).toBe(true);
        });
      });
    });
  });
}
