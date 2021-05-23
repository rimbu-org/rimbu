import { Stream } from '@rimbu/stream';
import { MultiSet } from '../src';

function expectMultiSet(s: MultiSet<number>): any {
  return {
    toEqual(it: Iterable<[number, number]>): void {
      let size = 0;
      for (const e of it) {
        expect(s.count(e[0])).toBe(e[1]);
        size++;
      }
      expect(s.sizeDistinct).toBe(size);
    },
  };
}

export function runMultiSetRandomTestsWith(
  name: string,
  context: MultiSet.Context<any>
): void {
  class Entangled {
    jsmap = new Map<number, number>();
    builder = context.builder();
    immm = context.empty();
    log: string[] = [];

    check(): void {
      try {
        expect(this.builder.sizeDistinct).toEqual(this.jsmap.size);
        expect(this.immm.sizeDistinct).toEqual(this.jsmap.size);
        expect(this.builder.size).toBe(this.immm.size);
        this.jsmap.forEach((value, key): void => {
          expect(this.builder.count(key)).toBe(value);
          expect(this.immm.count(key)).toBe(value);
        });
      } catch (e) {
        console.log(this.log);
        console.log('sizes', this.jsmap.size, this.immm.size, this.log.length);
        throw e;
      }
    }

    addLog(action: string, ...values: any[]): void {
      if (values.length > 0) this.log.push(`${action}: ${values}`);
      else this.log.push(`${action}`);
    }

    add(value: number, amount = 1): void {
      this.addLog('add', value, amount);
      if (amount > 0)
        this.jsmap.set(value, (this.jsmap.get(value) ?? 0) + amount);
      this.builder.add(value, amount);
      this.immm = this.immm.add(value, amount);
    }

    setCount(value: number, amount: number): void {
      this.addLog('setCount', value, amount);
      if (amount <= 0) this.removeAllValues(value);
      else {
        this.jsmap.set(value, amount);
        this.builder.setCount(value, amount);
        this.immm = this.immm.setCount(value, amount);
      }
    }

    remove(value: number, amount = 1): void {
      this.addLog('remove', value, amount);
      if (amount > 0) {
        const count = this.jsmap.get(value);
        if (undefined !== count) {
          const newAmount = count - amount;
          if (newAmount <= 0) this.jsmap.delete(value);
          else this.jsmap.set(value, newAmount);
        }
      }
      this.builder.remove(value, amount);
      this.immm = this.immm.remove(value, amount);
    }

    removeAllValues(value: number): void {
      this.addLog('removeAllValues', value);
      this.jsmap.delete(value);
      this.builder.remove(value, 'ALL');
      this.immm = this.immm.remove(value, 'ALL');
    }
  }

  describe(`${name} MultiSet`, (): void => {
    it('create', (): void => {
      expectMultiSet(context.empty()).toEqual([]);
      expectMultiSet(context.of(1, 2)).toEqual([
        [1, 1],
        [2, 1],
      ]);
      expectMultiSet(context.of(1, 1, 2)).toEqual([
        [1, 2],
        [2, 1],
      ]);
      expectMultiSet(context.of(1, 2, 1)).toEqual([
        [1, 2],
        [2, 1],
      ]);
      expectMultiSet(context.from([] as number[])).toEqual([]);
      expectMultiSet(context.from([1, 2, 1, 2])).toEqual([
        [1, 2],
        [2, 2],
      ]);
    });

    it('empty', (): void => {
      const m = context.empty();
      const empty = context.empty();

      expect(m).toBe(empty);
      expect(m.size).toBe(0);
      expect(m.sizeDistinct).toBe(0);
      expect(m.isEmpty).toBe(true);
      expect(m.nonEmpty()).toBe(false);
      expect(m.add(1).isEmpty).toBe(false);
      expect(m.assumeNonEmpty).toThrowError();
      expect(m.filterEntries((v): boolean => false)).toBe(empty);
      expect(m.has(0)).toBe(false);
      expect(m.count(1)).toBe(0);
      // expect(m.keySet().isEmpty).toBe(true);
      expect(m.remove(0)).toBe(empty);
      expect(m.stream()).toBe(Stream.empty());
      expect(m.toBuilder().build()).toBe(empty);
    });

    it('add', (): void => {
      const ent = new Entangled();

      Stream.randomInt(0, 1000)
        .take(1000)
        .forEach((v): void => {
          const amount = Math.round(Math.random() * 5);
          ent.add(v, amount);
          ent.check();
        });
    });

    it('remove', (): void => {
      const ent = new Entangled();

      const len = 1000;
      Stream.randomInt(0, len)
        .take(len)
        .forEach((v): void => {
          const amount = Math.round(Math.random() * 5);
          ent.add(v, amount);
        });

      Stream.range({ amount: len }).forEach((v): void => {
        const amount = Math.round(Math.random() * 5);
        const r = Math.round(Math.random() * ent.jsmap.size);
        ent.remove(r, amount);
        ent.check();
      });
    });

    it('removeAll', (): void => {
      const ent = new Entangled();

      const len = 1000;
      Stream.randomInt(0, len)
        .take(len)
        .forEach((v): void => {
          const amount = Math.round(Math.random() * 5);
          ent.add(v, amount);
        });

      Stream.range({ amount: len }).forEach((v): void => {
        const r = Math.round(Math.random() * ent.jsmap.size);
        ent.removeAllValues(r);
        ent.check();
      });
    });

    it('setCount', (): void => {
      const ent = new Entangled();

      const len = 1000;
      Stream.randomInt(0, len)
        .take(len)
        .forEach((v): void => {
          const amount = Math.round(Math.random() * 5);
          ent.add(v, amount);
        });

      Stream.range({ amount: len }).forEach((v): void => {
        const r = Math.round(Math.random() * ent.jsmap.size);
        const amount = Math.round(Math.random() * 5);
        ent.setCount(r, amount);
        ent.check();
      });
    });

    it('assumeNonEmpty', (): void => {
      expect((): void => {
        context.empty().assumeNonEmpty();
      }).toThrow();
      const m = context.of(1, 2, 3);
      expect(m.assumeNonEmpty()).toBe(m);
    });

    it('count', (): void => {
      expect(context.empty().count(10)).toBe(0);
      expect(context.of(10).count(10)).toBe(1);
      expect(context.of(10, 1, 10, 1).count(10)).toBe(2);
      expect(context.of(10, 1, 10, 1).count(5)).toBe(0);
    });

    it('filterEntries', (): void => {
      expect(context.empty().filterEntries((v) => true)).toBe(context.empty());
      const m = context.from(
        Stream.range({ amount: 4 }).concat(Stream.range({ amount: 6 }))
      );
      expect(m.filterEntries((v) => true)).toBe(m);
      expect(m.filterEntries(([value, count]) => value < 3)).toEqual(
        context.of(0, 0, 1, 1, 2, 2)
      );
      expect(m.filterEntries(([value, count]) => count > 1)).toEqual(
        context.of(0, 0, 1, 1, 2, 2, 3, 3)
      );
    });

    it('foreach', (): void => {
      let value = 0;
      context.empty().forEach((v) => (value = 1));
      expect(value).toBe(0);

      const m = context.from(
        Stream.range({ amount: 4 }).concat(Stream.range({ amount: 6 }))
      );
      value = 0;
      m.forEach((v) => (value += v));
      expect(value).toBe(21);

      value = 0;
      m.forEach((v, i) => (value += v + i));
      expect(value).toBe(66);

      value = 0;
      m.forEach((v, i, halt) => {
        value += v + i;
        if (i > 6) halt();
      });
      expect(value).toBe(40);
    });

    it('has', (): void => {
      expect(context.empty().has(1)).toBe(false);
      expect(context.of(1, 2, 1).has(1)).toBe(true);
      expect(context.of(1, 2, 1).has(5)).toBe(false);
    });

    it('isEmpty', (): void => {
      expect(context.empty().isEmpty).toBe(true);
      expect(context.of(1, 2, 1).isEmpty).toBe(false);
    });

    it('nonEmpty', (): void => {
      expect(context.empty().nonEmpty()).toBe(false);
      expect(context.of(1, 2, 1).nonEmpty()).toBe(true);
    });

    it('stream', (): void => {
      expect(context.empty().stream().toArray()).toEqual([]);
      expect(context.of(1, 2, 1).stream().toArray().sort()).toEqual([1, 1, 2]);
    });

    it('streamDistinct', (): void => {
      expect(context.empty().streamDistinct().toArray()).toEqual([]);
      expect(context.of(1, 2, 1).streamDistinct().toArray().sort()).toEqual([
        1, 2,
      ]);
    });

    it('toArray', (): void => {
      expect(context.empty().toArray()).toEqual([]);
      expect(context.of(1, 2, 1, 2).toArray().sort()).toEqual([1, 1, 2, 2]);
    });

    it('toBuilder', (): void => {
      expect(context.empty().toBuilder().size).toBe(0);
      expect(context.empty().toBuilder().build()).toBe(context.empty());
      const m = context.of(1, 2, 1, 3);
      expect(m.toBuilder().build().countMap).toBe(m.countMap);
      expect(m.toBuilder().build()).toEqual(m);
      const b = m.toBuilder();
      b.add(1);
      expect(b.build()).toEqual(context.of(1, 2, 1, 3, 1));
    });
  });

  describe(`${name} MultiSet builder`, (): void => {
    it('count', (): void => {
      expect(context.builder().count(10)).toBe(0);
      expect(context.of(10).toBuilder().count(10)).toBe(1);
      expect(context.of(10, 1, 10, 1).toBuilder().count(10)).toBe(2);
      expect(context.of(10, 1, 10, 1).toBuilder().count(5)).toBe(0);
    });

    it('foreach', (): void => {
      let value = 0;
      context.builder().forEach((v) => (value = 1));
      expect(value).toBe(0);

      const stream = Stream.range({ amount: 4 }).concat(
        Stream.range({ amount: 6 })
      );
      const b = context.builder();
      stream.forEach((v) => b.add(v));
      value = 0;
      b.forEach((v) => (value += v));
      expect(value).toBe(21);

      value = 0;
      b.forEach((v, i) => (value += v + i));
      expect(value).toBe(66);

      value = 0;
      b.forEach((v, i, halt) => {
        value += v + i;
        if (i > 6) halt();
      });
      expect(value).toBe(40);
    });

    it('foreach checklock', (): void => {
      const stream = Stream.range({ amount: 4 }).concat(
        Stream.range({ amount: 6 })
      );
      const b = context.builder();
      stream.forEach((v) => b.add(v));

      expect((): void => {
        b.forEach((): void => {
          b.add(10, 100);
        });
      }).toThrow();

      expect((): void => {
        b.forEach((): void => {
          b.remove(1);
        });
      }).toThrow();

      expect((): void => {
        b.forEach((): void => {
          b.remove(1, 'ALL');
        });
      }).toThrow();

      expect((): void => {
        b.forEach((): void => {
          b.setCount(1, 1);
        });
      }).toThrow();
    });

    it('has', (): void => {
      expect(context.builder().has(1)).toBe(false);
      expect(context.of(1, 2, 1).toBuilder().has(1)).toBe(true);
      expect(context.of(1, 2, 1).toBuilder().has(5)).toBe(false);
    });

    it('isEmpty', (): void => {
      expect(context.builder().isEmpty).toBe(true);
      expect(context.of(1, 2, 1).toBuilder().isEmpty).toBe(false);
    });
  });

  describe(`${name} MultiSet Builder`, (): void => {
    it('builds from existing multiset', () => {
      const source = context.of(1, 2, 3, 2);
      const builder = source.toBuilder();
      expect(builder.size).toBe(4);
      expect(builder.build()).toEqual(source);
      builder.add(4);
      builder.add(1);
      expect(builder.size).toBe(6);
      expect(builder.build()).toEqual(context.of(1, 1, 2, 2, 3, 4));
    });
  });
}
