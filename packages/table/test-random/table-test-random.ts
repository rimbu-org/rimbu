import { Table } from '../src';
import { Stream } from '@rimbu/stream';

export function runTableRandomTestsWith(
  name: string,
  context: Table.Context<any, any>
): void {
  class Entangled {
    map = new Map<number, Map<number, number>>();
    builder = context.builder();
    immm = context.empty();
    log: string[] = [];

    check(): void {
      try {
        expect(this.builder.amountRows).toEqual(this.map.size);
        expect(this.immm.amountRows).toEqual(this.map.size);
        expect(this.builder.size).toEqual(this.immm.size);
        this.map.forEach((row, rowKey): void => {
          expect(this.builder.getRow(rowKey).size).toBe(row.size);
          expect(this.immm.getRow(rowKey).size).toBe(row.size);
          row.forEach((value, columnKey): void => {
            expect(this.builder.get(rowKey, columnKey, 'a')).toEqual(value);
            expect(this.immm.get(rowKey, columnKey, 'a')).toEqual(value);
          });
        });
      } catch (e) {
        console.log(this.log);
        console.log(
          'sizes',
          this.map.size,
          this.immm.amountRows,
          this.builder.amountRows,
          this.immm.size,
          this.builder.size,
          this.log.length
        );
        throw e;
      }
    }

    checkGet(row: number, column: number): void {
      const getmap = this.map.get(row)?.get(column);
      const gethm = this.immm.get(row, column, undefined);
      const gethb = this.builder.get(row, column, undefined);

      try {
        expect(gethm).toEqual(getmap);
        expect(gethb).toEqual(getmap);
      } catch (e) {
        console.log(this.log);
        console.log('size', this.map.size, this.immm.size, this.builder.size);
        console.log([...this.map].sort());
        console.log(this.immm.toArray().sort());
        throw e;
      }
    }

    addLog(action: string, ...values: any[]): void {
      if (values.length > 0) this.log.push(`${action}: ${values}`);
      else this.log.push(`${action}`);
    }

    set(row: number, column: number, value: number): void {
      this.addLog('set', row, column, value);
      let rowMap = this.map.get(row);
      if (undefined === rowMap) {
        rowMap = new Map();
        this.map.set(row, rowMap);
      }
      rowMap.set(column, value);
      this.builder.set(row, column, value);
      this.immm = this.immm.set(row, column, value);
    }

    removeRow(row: number): void {
      this.addLog('removeRow', row);
      this.map.delete(row);
      this.builder.removeRow(row);
      this.immm = this.immm.removeRow(row);
    }

    remove(row: number, column: number): void {
      this.addLog('remove', row, column);
      this.builder.remove(row, column);
      this.immm = this.immm.remove(row, column);
      const columnMap = this.map.get(row);
      if (columnMap) {
        if (columnMap.delete(column)) {
          if (columnMap.size === 0) this.map.delete(row);
        }
      }
    }
  }

  describe(`${name} Table`, (): void => {
    it('create', (): void => {
      context.empty();
      context.of([1, 1, 1]);
      context.from([[1, 1, 1]]);
    });

    it('empty', (): void => {
      const m = context.empty();
      const empty = context.empty();

      expect(m).toBe(empty);
      expect(m.size).toBe(0);
      expect(m.isEmpty).toBe(true);
      expect(m.nonEmpty()).toBe(false);
      expect(() => m.assumeNonEmpty()).toThrowError();
      expect(m.filter((v): boolean => false)).toBe(empty);
      expect(m.get(0, 0, 'a')).toBe('a');
      expect(m.rowMap.isEmpty).toBe(true);
      expect(m.mapValues((v): number => 1)).toBe(empty);
      // expect(m.modifyAt(0, { ifExists: (): number => 5 })).toBe(empty);
      expect(m.remove(0, 0)).toBe(empty);
      expect(m.set(1, 2, 3).isEmpty).toBe(false);
      expect(m.stream()).toBe(Stream.empty());
      expect(m.streamRows()).toBe(Stream.empty());
      expect(m.streamValues()).toBe(Stream.empty());
      expect(m.hasRowKey(1)).toBe(false);
      expect(m.hasValueAt(0, 0)).toBe(false);
      expect(m.toBuilder().build()).toBe(empty);
    });

    it('set', (): void => {
      const ent = new Entangled();

      Stream.randomInt(0, 1000)
        .zip(Stream.randomInt(0, 10), Stream.randomInt(0, 100))
        .take(1000)
        .forEach(([v1, v2, v3]): void => {
          ent.set(v1, v2, v3);
          ent.check();
        });
    });

    it('get', (): void => {
      const ent = new Entangled();

      const len = 3000;

      Stream.randomInt(0, len)
        .zip(Stream.randomInt(0, 10), Stream.randomInt(0, 100))
        .take(len)
        .forEach(([v1, v2, v3]): void => {
          ent.set(v1, v2, v3);
        });

      Stream.range({ amount: len })
        .zip(Stream.range({ amount: 10 }))
        .forEach(([v1, v2]): void => {
          ent.checkGet(v1, v2);
        });
    });

    it('remove', (): void => {
      const ent = new Entangled();

      const len = 1000;

      Stream.randomInt(0, len)
        .zip(Stream.randomInt(0, 4), Stream.randomInt(0, 100))
        .take(len)
        .forEach(([v1, v2, v3]): void => {
          ent.set(v1, v2, v3);
        });

      ent.check();

      Stream.range({ amount: len })
        .zip(Stream.randomInt(0, 4))
        .forEach(([v1, v2]): void => {
          ent.remove(v1, v2);
          ent.check();
        });
    });

    it('set existing key overrides', (): void => {
      const m = context.of([1, 1, 1], [2, 2, 2], [2, 0, 0], [3, 3, 3]);
      expect(m.set(1, 1, 4).get(1, 1, 'a')).toEqual(4);
    });

    it('isEmpty', (): void => {
      expect(context.empty().isEmpty).toBe(true);
      expect(context.of([1, 1, 1]).isEmpty).toBe(false);
    });

    it('nonEmpty', (): void => {
      expect(context.empty().nonEmpty()).toBe(false);
      expect(context.of([1, 1, 1]).nonEmpty()).toBe(true);
    });

    it('assumeNonEmpty', (): void => {
      expect((): any => context.empty().assumeNonEmpty()).toThrow();
      const m = context.of([1, 1, 1]);
      expect(m.assumeNonEmpty()).toBe(m);
    });

    it('filter', (): void => {
      const stream = Stream.range({ amount: 100 });
      const m = context.from(stream.zip(stream, stream));
      expect(m.size).toBe(100);
      expect(m.filter((r) => r[0] % 2 === 0).size).toBe(50);
      expect(m.filter((r) => r[1] % 2 === 0).size).toBe(50);
      expect(m.filter((r) => r[2] % 2 === 0).size).toBe(50);
      expect(m.filter((v) => true)).toBe(m);
      expect(m.filter((v) => false).isEmpty).toBe(true);
    });

    it('foreach', (): void => {
      const stream = Stream.range({ amount: 100 });
      const m = context.from(stream.zip(stream, stream));

      let state = 0;
      m.forEach((e, i, halt): void => {
        state += e[0] + e[1] + e[2] + i;
      });
      expect(state).toBe(19800);

      // cannot test order due to hashmap
      state = 0;
      m.forEach((_, i, halt): void => {
        state += i;
        if (i > 10) halt();
      });
      expect(state).toBe(66);
    });

    it('get', (): void => {
      expect(context.empty().get(1, 1, 'a')).toBe('a');
      expect(context.of([1, 1, 1]).get(1, 1, 'a')).toBe(1);
      expect(context.of([1, 1, 1]).get(2, 1, 'a')).toBe('a');
      expect(context.of([1, 1, 1]).get(1, 2, 'a')).toBe('a');
    });

    it('hasRowKey', (): void => {
      expect(context.empty().hasRowKey(1)).toBe(false);
      expect(context.of([1, 1, 1]).hasRowKey(1)).toBe(true);
      expect(context.of([1, 1, 1]).hasRowKey(2)).toBe(false);
    });

    it('hasValueAt', (): void => {
      expect(context.empty().hasValueAt(1, 1)).toBe(false);
      expect(context.of([1, 1, 1]).hasValueAt(1, 1)).toBe(true);
      expect(context.of([1, 1, 1]).hasValueAt(2, 1)).toBe(false);
      expect(context.of([1, 1, 1]).hasValueAt(1, 2)).toBe(false);
    });

    it('mapValues', (): void => {
      expect(context.empty().mapValues((v) => 1)).toBe(context.empty());
      expect(context.of([1, 1, 1]).mapValues((v) => v + 1)).toEqual(
        context.of([1, 1, 2])
      );
      expect(
        context
          .of([1, 1, 1], [2, 2, 2], [2, 0, 0], [3, 3, 3])
          .mapValues((v) => v + 1)
      ).toEqual(context.of([1, 1, 2], [2, 2, 3], [2, 0, 1], [3, 3, 4]));
    });

    it('modifyAt', (): void => {
      expect(context.empty().modifyAt(1, 1, {})).toBe(context.empty());
      expect(context.empty().modifyAt(1, 1, { ifNew: 1 })).toEqual(
        context.of([1, 1, 1])
      );
      expect(context.empty().modifyAt(1, 1, { ifNew: () => 1 })).toEqual(
        context.of([1, 1, 1])
      );
      expect(context.empty().modifyAt(1, 1, { ifExists: () => 1 })).toEqual(
        context.empty()
      );
      expect(
        context.empty().modifyAt(1, 1, { ifExists: (_, remove) => remove })
      ).toEqual(context.empty());
      const m = context.of([1, 1, 1], [2, 2, 2], [2, 0, 0], [3, 3, 3]);
      expect(m.modifyAt(2, 2, { ifNew: 2 })).toBe(m);
      expect(m.modifyAt(2, 2, { ifNew: () => 2 })).toBe(m);
      expect(m.modifyAt(1, 1, { ifExists: (v) => v + 1 })).toEqual(
        context.of([1, 1, 2], [2, 2, 2], [2, 0, 0], [3, 3, 3])
      );
      expect(m.modifyAt(1, 2, { ifExists: (v) => v + 1 })).toEqual(m);
      expect(m.modifyAt(2, 1, { ifExists: (v) => v + 1 })).toEqual(m);
      expect(m.modifyAt(2, 2, { ifExists: (_, remove) => remove })).toEqual(
        context.of([1, 1, 1], [2, 0, 0], [3, 3, 3])
      );
      expect(m.modifyAt(4, 4, { ifNew: 4 })).toEqual(
        context.of([1, 1, 1], [2, 2, 2], [2, 0, 0], [3, 3, 3], [4, 4, 4])
      );
      expect(m.modifyAt(4, 4, { ifNew: () => 4 })).toEqual(
        context.of([1, 1, 1], [2, 2, 2], [2, 0, 0], [3, 3, 3], [4, 4, 4])
      );
      expect(m.modifyAt(4, 4, { ifExists: (v) => v + 1 })).toBe(m);
      expect(m.modifyAt(4, 4, { ifExists: (_, remove) => remove })).toBe(m);
      expect(
        context
          .of([1, 1, 1])
          .modifyAt(1, 1, { ifExists: (_, remove) => remove })
      ).toBe(context.empty());
    });

    it('remove', (): void => {
      expect(context.empty().remove(1, 1)).toBe(context.empty());
      const m = context.of([1, 1, 1], [2, 2, 2], [2, 0, 0]);
      expect(m.remove(1, 1)).toEqual(context.of([2, 2, 2], [2, 0, 0]));
      expect(m.remove(4, 4)).toBe(m);
      expect(context.of([1, 1, 1]).remove(1, 1)).toBe(context.empty());
      expect(context.of([2, 2, 2], [2, 0, 0]).remove(2, 0)).toEqual(
        context.of([2, 2, 2])
      );
    });

    it('removeAndGet', (): void => {
      expect(context.empty().removeAndGet(1, 1)).toBe(undefined);
      const m = context.of([1, 1, 1], [2, 2, 2], [2, 0, 0]);
      expect(m.removeAndGet(1, 1)![1]).toBe(1);

      expect(m.removeAndGet(4, 4)).toBe(undefined);
    });

    it('updateAt', (): void => {
      expect(
        context.empty<number, number, number>().updateAt(1, 1, (v) => v + 1)
      ).toBe(context.empty());
      const m = context.of([1, 1, 1], [2, 2, 2], [2, 0, 0], [3, 3, 3]);
      expect(m.updateAt(2, 2, 3)).toEqual(
        context.of([1, 1, 1], [2, 2, 3], [2, 0, 0], [3, 3, 3])
      );
      expect(m.updateAt(2, 2, (v) => v + 1)).toEqual(
        context.of([1, 1, 1], [2, 2, 3], [2, 0, 0], [3, 3, 3])
      );
      expect(m.updateAt(4, 4, 3)).toBe(m);
    });

    it('stream', (): void => {
      expect(context.empty().stream().toArray()).toEqual([]);

      expect(
        context
          .of([1, 1, 1], [2, 2, 2], [2, 0, 0], [3, 3, 3])
          .stream()
          .toArray()
          .sort()
      ).toEqual([
        [1, 1, 1],
        [2, 0, 0],
        [2, 2, 2],
        [3, 3, 3],
      ]);
    });

    it('streamRows', (): void => {
      expect(context.empty().streamRows().toArray()).toEqual([]);

      expect(
        context
          .of([1, 10, 100], [2, 20, 200], [2, 21, 210], [3, 30, 300])
          .streamRows()
          .toArray()
      ).toEqual([1, 2, 3]);
    });

    it('streamValues', (): void => {
      expect(context.empty().streamValues().toArray()).toEqual([]);

      expect(
        context
          .of([1, 10, 100], [2, 20, 200], [2, 21, 210], [3, 30, 300])
          .streamValues()
          .toArray()
      ).toEqual([100, 200, 210, 300]);
    });
  });

  describe(`${name} Table builder`, (): void => {
    it('empty', (): void => {
      const b = context.builder();

      expect(b.isEmpty).toBe(true);
      expect(b.size).toBe(0);
      expect(b.get(0, 0, 'a')).toBe('a');
      expect(b.hasRowKey(0)).toBe(false);
      expect(b.hasValueAt(0, 0)).toBe(false);
      expect(b.build()).toBe(context.empty());
    });

    it('set existing key overrides', (): void => {
      const b = context.builder();
      Stream.of<[number, number, number]>(
        [1, 1, 1],
        [2, 2, 2],
        [3, 3, 3]
      ).forEach((e) => b.set(...e));
      expect(b.get(1, 1, 'a')).toBe(1);
      b.set(1, 1, 4);
      expect(b.get(1, 1, 'a')).toBe(4);
    });

    it('foreach', (): void => {
      const b = context.builder();
      const stream = Stream.range({ amount: 100 });
      stream.zip(stream, stream).forEach((e) => b.set(...e));

      let state = 0;
      b.forEach((e, i, halt): void => {
        state += e[0] + e[1] + i;
      });
      expect(state).toBe(14850);

      // cannot test order due to hashmap
      state = 0;
      b.forEach((_, i, halt): void => {
        state += i;
        if (i > 10) halt();
      });
      expect(state).toBe(66);
    });

    it('foreach checklock', (): void => {
      const b = context.builder();
      const stream = Stream.range({ amount: 100 });
      stream.zip(stream, stream).forEach((e) => b.set(...e));

      expect((): void => {
        b.forEach((): void => {
          b.set(1, 1, 1);
        });
      }).toThrow();

      expect((): void => {
        b.forEach((): void => {
          b.modifyAt(1, 1, { ifNew: 1, ifExists: () => 1 });
        });
      }).toThrow();
    });

    it('get', (): void => {
      expect(context.builder().get(1, 1, 'a')).toBe('a');
      const b = context.builder();
      b.set(1, 1, 1);
      expect(b.get(1, 1, 'a')).toBe(1);
      expect(b.get(2, 1, 'a')).toBe('a');
    });

    it('hasRow', (): void => {
      expect(context.builder().hasRowKey(1)).toBe(false);
      const b = context.builder();
      b.set(1, 1, 1);
      expect(b.hasRowKey(1)).toBe(true);
      expect(b.hasRowKey(2)).toBe(false);
    });

    it('modifyAt', (): void => {
      let b = context.builder<number, number, number>();
      expect(b.modifyAt(1, 1, {})).toBe(false);
      expect(b.size).toBe(0);

      b = context.builder();
      expect(b.modifyAt(1, 1, { ifNew: 1 })).toBe(true);
      expect(b.get(1, 1, 'a')).toBe(1);

      b = context.builder();
      expect(b.modifyAt(1, 1, { ifNew: () => 1 })).toBe(true);
      expect(b.get(1, 1, 'a')).toBe(1);

      b = context.builder();
      expect(b.modifyAt(1, 1, { ifExists: () => 1 })).toBe(false);
      expect(b.size).toBe(0);

      b = context.builder();
      expect(b.modifyAt(1, 1, { ifExists: (_, remove) => remove })).toBe(false);
      expect(b.size).toBe(0);

      b = context.builder();
      Stream.of<[number, number, number]>(
        [1, 1, 1],
        [2, 2, 2],
        [2, 0, 0],
        [3, 3, 3]
      ).forEach((e) => b.set(...e));
      expect(b.modifyAt(1, 1, { ifNew: 2 })).toBe(false);
      expect(b.get(1, 1, 'a')).toBe(1);

      b = context.builder();
      Stream.of<[number, number, number]>(
        [1, 1, 1],
        [2, 2, 2],
        [2, 0, 0],
        [3, 3, 3]
      ).forEach((e) => b.set(...e));
      expect(b.modifyAt(1, 1, { ifNew: () => 2 })).toBe(false);
      expect(b.get(1, 1, 'a')).toBe(1);

      b = context.builder();
      Stream.of<[number, number, number]>(
        [1, 1, 1],
        [2, 2, 2],
        [2, 0, 0],
        [3, 3, 3]
      ).forEach((e) => b.set(...e));
      expect(b.modifyAt(1, 1, { ifExists: (v) => v + 1 })).toBe(true);
      expect(b.get(1, 1, 'a')).toBe(2);

      b = context.builder();
      Stream.of<[number, number, number]>(
        [1, 1, 1],
        [2, 2, 2],
        [2, 0, 0],
        [3, 3, 3]
      ).forEach((e) => b.set(...e));
      expect(b.modifyAt(2, 2, { ifExists: (_, remove) => remove })).toBe(true);
      expect(b.get(2, 2, 'a')).toBe('a');

      b = context.builder();
      Stream.of<[number, number, number]>(
        [1, 1, 1],
        [2, 2, 2],
        [2, 0, 0],
        [3, 3, 3]
      ).forEach((e) => b.set(...e));
      expect(b.modifyAt(4, 4, { ifNew: 4 })).toBe(true);
      expect(b.get(4, 4, 'a')).toBe(4);

      b = context.builder();
      Stream.of<[number, number, number]>(
        [1, 1, 1],
        [2, 2, 2],
        [2, 0, 0],
        [3, 3, 3]
      ).forEach((e) => b.set(...e));
      expect(b.modifyAt(4, 4, { ifNew: () => 4 })).toBe(true);
      expect(b.get(4, 4, 'a')).toBe(4);

      b = context.builder();
      Stream.of<[number, number, number]>(
        [1, 1, 1],
        [2, 2, 2],
        [2, 0, 0],
        [3, 3, 3]
      ).forEach((e) => b.set(...e));
      expect(b.modifyAt(4, 4, { ifExists: (v) => v + 1 })).toBe(false);
      expect(b.get(4, 4, 'a')).toBe('a');

      b = context.builder();
      Stream.of<[number, number, number]>(
        [1, 1, 1],
        [2, 2, 2],
        [2, 0, 0],
        [3, 3, 3]
      ).forEach((e) => b.set(...e));
      expect(b.modifyAt(4, 4, { ifExists: (_, remove) => remove })).toBe(false);
      expect(b.get(4, 4, 'a')).toBe('a');
    });

    it('remove', (): void => {
      let b = context.builder<number, number, number>();
      expect(b.remove(1, 1)).toBe(undefined);
      expect(b.remove(1, 1, 'a')).toBe('a');
      expect(b.build()).toBe(context.empty());

      b = context.builder();
      Stream.of<[number, number, number]>([1, 1, 1], [2, 2, 2]).forEach((e) =>
        b.set(...e)
      );
      expect(b.remove(1, 1)).toBe(1);
      expect(b.build()).toEqual(context.of([2, 2, 2]));

      b = context.builder();
      Stream.of<[number, number, number]>([1, 1, 1], [2, 2, 2]).forEach((e) =>
        b.set(...e)
      );
      expect(b.remove(4, 4)).toBe(undefined);
      expect(b.remove(4, 4, 'a')).toBe('a');
      expect(b.build()).toEqual(context.of([1, 1, 1], [2, 2, 2]));
    });

    it('updateAt', (): void => {
      let b = context.builder<number, number, number>();
      expect(b.updateAt(1, 1, (v) => v + 1)).toBe(undefined);
      expect(b.updateAt(1, 1, (v) => v + 1, 'a')).toBe('a');
      expect(b.build()).toBe(context.empty());

      b = context.builder();
      Stream.of<[number, number, number]>(
        [1, 1, 1],
        [2, 2, 2],
        [2, 0, 0],
        [3, 3, 3]
      ).forEach((e) => b.set(...e));
      expect(b.updateAt(2, 2, 3)).toBe(2);
      expect(b.build()).toEqual(
        context.of([1, 1, 1], [2, 2, 3], [2, 0, 0], [3, 3, 3])
      );

      b = context.builder();
      Stream.of<[number, number, number]>(
        [1, 1, 1],
        [2, 2, 2],
        [2, 0, 0],
        [3, 3, 3]
      ).forEach((e) => b.set(...e));
      expect(b.updateAt(2, 2, (v) => v + 1)).toBe(2);
      expect(b.build()).toEqual(
        context.of([1, 1, 1], [2, 2, 3], [2, 0, 0], [3, 3, 3])
      );

      b = context.builder();
      Stream.of<[number, number, number]>(
        [1, 1, 1],
        [2, 2, 2],
        [2, 0, 0],
        [3, 3, 3]
      ).forEach((e) => b.set(...e));
      expect(b.updateAt(4, 4, 3)).toBe(undefined);
      expect(b.updateAt(4, 4, 3, 'a')).toBe('a');
      expect(b.build()).toEqual(
        context.of([1, 1, 1], [2, 2, 2], [2, 0, 0], [3, 3, 3])
      );

      b = context.builder();
      Stream.of<[number, number, number]>(
        [1, 1, 1],
        [2, 2, 2],
        [2, 0, 0],
        [3, 3, 3]
      ).forEach((e) => b.set(...e));
      expect(b.updateAt(2, 2, 2)).toBe(2);
      expect(b.build()).toEqual(
        context.of([1, 1, 1], [2, 2, 2], [2, 0, 0], [3, 3, 3])
      );
    });
  });

  describe(`${name} Table Builder`, (): void => {
    it('builds from existing table', () => {
      const source = context.of([1, 1, 1], [2, 2, 2], [3, 3, 3], [1, 2, 2]);
      const builder = source.toBuilder();
      expect(builder.size).toBe(4);
      expect(builder.build()).toEqual(source);
      builder.addEntry([4, 4, 4]);
      builder.addEntry([1, 2, 5]);
      expect(builder.size).toBe(5);
      expect(builder.build()).toEqual(
        context.of([1, 1, 1], [1, 2, 5], [2, 2, 2], [3, 3, 3], [4, 4, 4])
      );
    });
  });
}
