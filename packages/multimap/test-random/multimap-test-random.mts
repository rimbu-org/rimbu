import type { RSet } from '@rimbu/collection-types';
import { Stream } from '@rimbu/stream';

import type { MultiMap } from '../src/main/index.mjs';

function expectMultiMap(s: MultiMap<number, number>): {
  toEqual(...entries: [number, number[]][]): void;
} {
  return {
    toEqual(...entries: [number, number[]][]): void {
      for (const e of entries) {
        const values = s.getValues(e[0]).stream().toArray().sort();
        const targetValues = e[1].sort();
        expect(values).toEqual(targetValues);
      }
    },
  };
}

export function runMultiMapRandomTestsWith(
  name: string,
  context: MultiMap.Context<any, any>,
  GSet: RSet.Context<any>,
  uniqueValue: boolean
): void {
  class Entangled {
    jsmap = new Map<number, number[]>();
    builder = context.builder<number, number>();
    immm = context.empty<number, number>();
    log: string[] = [];

    check(): void {
      try {
        expect(this.immm.keySize).toEqual(this.jsmap.size);
        expect(this.builder.size).toEqual(this.immm.size);
        this.jsmap.forEach((values, key): void => {
          const bValuesSet = GSet.from(this.builder.getValues(key));
          const iValuesSet = GSet.from(this.immm.getValues(key));
          let diff1: any;
          let diff2: any;
          try {
            diff1 = bValuesSet.difference(values);
            expect(diff1.isEmpty).toBe(true);
            diff2 = iValuesSet.difference(values);
            expect(diff2.isEmpty).toBe(true);
          } catch (e) {
            if (diff1) console.log('diff1', ...diff1);
            if (diff2) console.log('diff2', ...diff2);
            throw e;
          }
        });
      } catch (e) {
        // console.log(this.log);
        console.log(
          'sizes',
          this.jsmap.size,
          this.immm.size,
          this.builder.size
        );
        // console.log(this.jsmap);
        // console.log(...this.immm.keyMap.mapValues(v => v.stream().toArray()));
        throw e;
      }
    }

    addLog(action: string, ...values: any[]): void {
      if (values.length > 0) this.log.push(`${action}: ${values}`);
      else this.log.push(`${action}`);
    }

    add(key: number, value: number): void {
      this.addLog('add', key, value);
      let curValues = this.jsmap.get(key);
      if (undefined === curValues) {
        curValues = [];
        this.jsmap.set(key, curValues);
      }
      curValues.push(value);
      this.builder.add(key, value);
      this.immm = this.immm.add(key, value);
    }

    setValues(key: number, values: number[]): void {
      this.addLog('setCount', key, values);

      if (values.length <= 0) this.jsmap.delete(key);
      else this.jsmap.set(key, values);

      this.builder.setValues(key, values);
      this.immm = this.immm.setValues(key, values);
    }

    removeEntry(key: number, value: number): void {
      this.addLog('removeEntry', key, value);
      const values = this.jsmap.get(key);
      if (undefined !== values) {
        if (uniqueValue) {
          const newValues = values.filter((v) => !Object.is(v, value));
          if (newValues.length > 0) this.jsmap.set(key, newValues);
          else this.jsmap.delete(key);
        } else {
          const index = values.indexOf(value);
          if (index >= 0) {
            values.splice(index, 1);
            if (values.length <= 0) this.jsmap.delete(key);
          }
        }
      }
      this.builder.removeEntry(key, value);
      this.immm = this.immm.removeEntry(key, value);
    }

    // removeEntries(key: number, value: number): void {
    //   this.addLog('removeEntries', key, value);
    //   const values = this.jsmap.get(key);
    //   if (undefined !== values) {
    //     const newValues = values.filter((v) => !Object.is(v, value));
    //     if (newValues.length > 0) this.jsmap.set(key, newValues);
    //     else this.jsmap.delete(key);
    //   }
    //   this.builder.removeEntries(key, value);
    //   this.immm = this.immm.removeEntries(key, value);
    // }

    removeKey(value: number): void {
      this.addLog('remove', value);
      this.jsmap.delete(value);
      this.builder.removeKey(value);
      this.immm = this.immm.removeKey(value);
    }
  }

  describe(`${name} MultiMap`, (): void => {
    it('create', (): void => {
      expectMultiMap(context.empty()).toEqual();
      expectMultiMap(context.of([1, 1], [2, 2])).toEqual([1, [1]], [2, [2]]);
      expectMultiMap(context.of([1, 1], [1, 2], [2, 1])).toEqual(
        [1, [1, 2]],
        [2, [1]]
      );
      expectMultiMap(context.of([1, 1], [2, 1], [1, 2])).toEqual(
        [1, [1, 2]],
        [2, [1]]
      );
      expectMultiMap(context.from([])).toEqual();
      expectMultiMap(
        context.from([
          [1, 1],
          [2, 1],
          [1, 2],
          [2, 2],
        ])
      ).toEqual([1, [1, 2]], [2, [1, 2]]);
    });

    it('empty', (): void => {
      const m = context.empty();
      const empty = context.empty();

      expect(m).toBe(empty);
      expect(m.size).toBe(0);
      expect(m.isEmpty).toBe(true);
      expect(m.nonEmpty()).toBe(false);
      expect(m.add(1, 1).isEmpty).toBe(false);
      expect(() => m.assumeNonEmpty()).toThrowError();
      expect(m.filter((): boolean => false)).toBe(empty);
      expect(m.hasKey(0)).toBe(false);
      expect(m.hasEntry(0, 0)).toBe(false);
      expect(m.keyMap.isEmpty).toBe(true);
      expect(m.removeKey(0)).toBe(empty);
      expect(m.stream()).toBe(Stream.empty());
      expect(m.toBuilder().build()).toBe(empty);
    });

    it('add', (): void => {
      const ent = new Entangled();

      Stream.zip(Stream.randomInt(0, 1000), Stream.randomInt(0, 5))
        .take(1000)
        .forEach((values): void => {
          ent.add(values[0], values[1]);
          ent.check();
        });
    });

    it('removeEntry', (): void => {
      const ent = new Entangled();

      Stream.zip(Stream.randomInt(0, 1000), Stream.randomInt(0, 5))
        .take(1000)
        .forEach((values): void => {
          ent.add(values[0], values[1]);
        });

      Stream.zip(Stream.randomInt(0, 1000), Stream.randomInt(0, 5))
        .take(1000)
        .forEach((values): void => {
          ent.removeEntry(values[0], values[1]);
          ent.check();
        });
    });

    // it('removeEntries', (): void => {
    //   const ent = new Entangled();

    //   Stream.zip(Stream.randomInt(0, 1000), Stream.randomInt(0, 5))
    //     .take(1000)
    //     .forEach((values): void => {
    //       ent.add(values[0], values[1]);
    //     });

    //   Stream.zip(Stream.randomInt(0, 1000), Stream.randomInt(0, 5))
    //     .take(1000)
    //     .forEach((values): void => {
    //       ent.removeEntries(values[0], values[1]);
    //       ent.check();
    //     });
    // });

    it('remove', (): void => {
      const ent = new Entangled();

      Stream.zip(Stream.randomInt(0, 1000), Stream.randomInt(0, 5))
        .take(1000)
        .forEach((values): void => {
          ent.add(values[0], values[1]);
        });

      Stream.randomInt(0, 1000)
        .take(1000)
        .forEach((v): void => {
          ent.removeKey(v);
          ent.check();
        });
    });

    it('set existing key overrides', (): void => {
      const m = context.of([1, 1], [2, 2], [3, 3]);
      expect(m.add(1, 4).getValues(1).stream().toArray().sort()).toEqual([
        1, 4,
      ]);
    });

    it('isEmpty', (): void => {
      expect(context.empty().isEmpty).toBe(true);
      expect(context.of([1, 1]).isEmpty).toBe(false);
    });

    it('nonEmpty', (): void => {
      expect(context.empty().nonEmpty()).toBe(false);
      expect(context.of([1, 1]).nonEmpty()).toBe(true);
    });

    it('assumeNonEmpty', (): void => {
      expect((): any => context.empty().assumeNonEmpty()).toThrow();
      const m = context.of([1, 1]);
      expect(m.assumeNonEmpty()).toBe(m);
    });

    it('filter', (): void => {
      const stream = Stream.zip(
        Stream.range({ amount: 30 }).repeat(),
        Stream.range({ amount: 100 })
      );

      const m = context.from(stream);
      expect(m.size).toBe(100);
      expect(m.filter((v) => v[0] % 2 === 0).size).toBe(50);
      expect(m.filter(() => true)).toBe(m);
      expect(m.filter(() => false).isEmpty).toBe(true);
    });

    it('foreach', (): void => {
      const stream = Stream.zip(
        Stream.range({ amount: 30 }).repeat(),
        Stream.range({ amount: 100 })
      );
      const m = context.from(stream);

      let state = 0;
      m.forEach((e, i): void => {
        state += e[0] + e[1] + i;
      });
      expect(state).toBe(11250);

      // cannot test order due to hashmap
      state = 0;
      m.forEach((_, i, halt): void => {
        state += i;
        if (i > 10) halt();
      });
      expect(state).toBe(66);
    });

    it('getValues', (): void => {
      expect(context.empty().getValues(1).stream()).toBe(Stream.empty());
      expect(
        context.of([1, 1], [1, 2]).getValues(1).stream().toArray().sort()
      ).toEqual([1, 2]);
      expect(context.of([1, 1]).getValues(2).stream()).toBe(Stream.empty());
    });

    it('hasKey', (): void => {
      expect(context.empty().hasKey(1)).toBe(false);
      expect(context.of([1, 1]).hasKey(1)).toBe(true);
      expect(context.of([1, 1]).hasKey(2)).toBe(false);
    });

    it('remove', (): void => {
      expect(context.empty().removeKey(1)).toBe(context.empty());
      const m = context.of([1, 1], [2, 2]);
      expect(m.removeKey(1)).toEqual(context.of([2, 2]));
      expect(m.removeKey(4)).toBe(m);
      expect(context.of([1, 1]).removeKey(1)).toBe(context.empty());
    });

    it('stream', (): void => {
      expect(context.empty().stream()).toBe(Stream.empty());

      expect(context.of([1, 1], [2, 2], [3, 3]).stream().toArray()).toEqual([
        [1, 1],
        [2, 2],
        [3, 3],
      ]);
    });

    it('streamKeys', (): void => {
      expect(context.empty().streamKeys()).toBe(Stream.empty());

      expect(
        context.of([1, 10], [2, 20], [3, 30], [2, 40]).streamKeys().toArray()
      ).toEqual([1, 2, 3]);
    });

    it('streamValues', (): void => {
      expect(context.empty().streamValues()).toBe(Stream.empty());

      expect(
        context
          .of([1, 10], [2, 20], [3, 30], [2, 40])
          .streamValues()
          .toArray()
          .sort()
      ).toEqual([10, 20, 30, 40]);
    });
  });

  describe(`${name} Multimap builder`, (): void => {
    it('empty', (): void => {
      const b = context.builder();

      expect(b.isEmpty).toBe(true);
      expect(b.size).toBe(0);
      expect(b.getValues(0).stream().toArray()).toEqual([]);
      expect(b.hasKey(0)).toBe(false);
      expect(b.build()).toBe(context.empty());
    });

    it('add existing key adds value', (): void => {
      const b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2], [3, 3], [2, 4]).forEach((e) =>
        b.add(e[0], e[1])
      );
      expect(b.getValues(1).stream().toArray()).toEqual([1]);
      b.add(1, 4);
      expect(b.getValues(1).stream().toArray().sort()).toEqual([1, 4]);
    });

    it('foreach', (): void => {
      const stream = Stream.zip(
        Stream.range({ amount: 30 }).repeat(),
        Stream.range({ amount: 100 })
      );
      const b = context.builder<number, number>();
      stream.forEach((e) => b.add(e[0], e[1]));

      let state = 0;
      b.forEach((e, i): void => {
        state += e[0] + e[1] + i;
      });
      expect(state).toBe(11250);

      // cannot test order due to hashmap
      state = 0;
      b.forEach((_, i, halt): void => {
        state += i;
        if (i > 10) halt();
      });
      expect(state).toBe(66);
    });

    it('foreach checklock', (): void => {
      const stream = Stream.zip(
        Stream.range({ amount: 30 }).repeat(),
        Stream.range({ amount: 100 })
      );
      const b = context.builder();
      b.addEntries(stream);

      expect((): void => {
        b.forEach((): void => {
          b.add(10, 100);
        });
      }).toThrow();

      expect((): void => {
        b.forEach((): void => {
          b.removeKey(1);
        });
      }).toThrow();

      // expect((): void => {
      //   b.forEach((): void => {
      //     b.removeEntries(1, 1);
      //   });
      // }).toThrow();

      expect((): void => {
        b.forEach((): void => {
          b.removeEntry(1, 1);
        });
      }).toThrow();
    });

    it('getValues', (): void => {
      expect(context.builder().getValues(1).stream().toArray()).toEqual([]);
      const b = context.builder();
      b.add(1, 1);
      expect(b.getValues(1).stream().toArray()).toEqual([1]);
      expect(b.getValues(2).stream().toArray()).toEqual([]);
    });

    it('hasKey', (): void => {
      expect(context.builder().hasKey(1)).toBe(false);
      const b = context.builder();
      b.add(1, 1);
      expect(b.hasKey(1)).toBe(true);
      expect(b.hasKey(2)).toBe(false);
    });

    it('remove', (): void => {
      let b = context.builder();
      expect(b.removeKey(1)).toBe(false);
      expect(b.build()).toBe(context.empty());

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2]).forEach((e) =>
        b.add(e[0], e[1])
      );
      expect(b.removeKey(1)).toBe(true);
      expect(b.build()).toEqual(context.of([2, 2]));

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2]).forEach((e) =>
        b.add(e[0], e[1])
      );
      expect(b.removeKey(4)).toBe(false);
      expect(b.build()).toEqual(context.of([1, 1], [2, 2]));
    });
  });

  describe(`${name} MultiMap Builder`, (): void => {
    it('builds from existing multimap', () => {
      const source = context.of([1, 1], [2, 2], [3, 3], [1, 4]);
      const builder = source.toBuilder();
      expect(builder.size).toBe(4);
      expect(builder.build()).toBe(source);
      builder.add(4, 4);
      builder.add(1, 5);
      expect(builder.size).toBe(6);
      expect(builder.build()).toEqual(
        context.of([1, 1], [1, 4], [1, 5], [2, 2], [3, 3], [4, 4])
      );
    });
  });
}
