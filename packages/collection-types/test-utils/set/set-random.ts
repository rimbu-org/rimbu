import { Stream } from '@rimbu/stream';
import { RSet } from '../../src';

function expectSet(s: RSet<any>): any {
  return {
    toEqual(i: Iterable<any>): void {
      const arrS = s.toArray().sort();
      const arrI = [...i].sort();
      expect(arrS).toEqual(arrI);
    },
  };
}

export function runSetRandomTestsWith(
  name: string,
  context: RSet.Context<any>
): void {
  class Entangled {
    jsset = new Set<number>();
    builder = context.builder();
    immm = context.empty();
    log: string[] = [];

    check(): void {
      try {
        expect(this.builder.size).toEqual(this.jsset.size);
        expect(this.immm.size).toEqual(this.jsset.size);
        this.jsset.forEach((key): void => {
          expect(this.builder.has(key)).toBe(true);
          expect(this.immm.has(key)).toBe(true);
        });
      } catch (e) {
        console.log(this.log);
        console.log(
          'sizes',
          this.jsset.size,
          this.immm.size,
          this.builder.size
        );
        throw e;
      }
    }

    addLog(action: string, ...values: any[]): void {
      if (values.length > 0) this.log.push(`${action}: ${values}`);
      else this.log.push(`${action}`);
    }

    add(value: number): void {
      this.addLog('add', value);
      this.jsset.add(value);
      this.builder.add(value);
      this.immm = this.immm.add(value);
    }

    remove(value: number): void {
      this.addLog('remove', value);
      this.jsset.delete(value);
      this.builder.remove(value);
      this.immm = this.immm.remove(value);
    }
  }

  describe(`${name} RSet`, (): void => {
    it('create', (): void => {
      context.empty();
      context.of(1);
      context.from([1, 1]);
    });

    it('empty', (): void => {
      const m = context.empty();
      const empty = context.empty();

      expect(m).toBe(empty);
      expect(m.size).toBe(0);
      expect(m.isEmpty).toBe(true);
      expect(m.nonEmpty()).toBe(false);
      expect(m.add(1).isEmpty).toBe(false);
      expect(m.assumeNonEmpty).toThrowError();
      expect(m.filter((v): boolean => false)).toBe(empty);
      expect(m.has(0)).toBe(false);
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
          ent.add(v);
          ent.check();
        });
    });

    it('remove', (): void => {
      const ent = new Entangled();

      const len = 1000;

      Stream.randomInt(0, len)
        .take(len)
        .forEach((v): void => {
          ent.add(v);
        });

      Stream.range({ amount: len }).forEach((v): void => {
        const r = Math.round(Math.random() * ent.jsset.size);
        ent.remove(r);
        ent.check();
      });
    });

    it('isEmpty', (): void => {
      expect(context.empty().isEmpty).toBe(true);
      expect(context.of(1).isEmpty).toBe(false);
    });

    it('nonEmpty', (): void => {
      expect(context.empty().nonEmpty()).toBe(false);
      expect(context.of(1).nonEmpty()).toBe(true);
    });

    it('assumeNonEmpty', (): void => {
      expect((): any => context.empty().assumeNonEmpty()).toThrow();
      const m = context.of(1);
      expect(m.assumeNonEmpty()).toBe(m);
    });

    it('removes duplicates', (): void => {
      expect(context.of(1, 2, 2, 3, 3, 3)).toEqual(context.of(1, 2, 3));
    });

    it('difference', (): void => {
      const s1 = context.of(1, 2, 3, 4, 5);
      const s2 = context.of(4, 5, 6, 7, 8);
      const s3 = context.of(10, 11);
      expect(context.empty().difference(context.empty())).toBe(context.empty());
      expect(s1.difference(context.empty())).toBe(s1);
      expect(context.empty().difference(s1)).toBe(context.empty());
      expect(s1.difference(s1)).toBe(context.empty());
      expect(s1.difference(s2)).toEqual(context.of(1, 2, 3));
      expect(s2.difference(s1)).toEqual(context.of(6, 7, 8));
      expect(s1.difference(s3)).toBe(s1);
      expect(s3.difference(context.of(10, 11))).toBe(context.empty());
    });

    it('union', (): void => {
      const s1 = context.of(1, 2, 3, 4, 5);
      const s2 = context.of(4, 5, 6, 7, 8);
      const s3 = context.of(10, 11);
      expect(context.empty().union(context.empty())).toBe(context.empty());
      expect(s1.union(context.empty())).toBe(s1);
      expect(context.empty().union(s1)).toBe(s1);
      expect(s1.union(s1)).toBe(s1);
      expectSet(s1.union(s2)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expectSet(s2.union(s1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expectSet(s1.union(s3)).toEqual([1, 2, 3, 4, 5, 10, 11]);
      expect(s3.union(context.of(10, 11))).toBe(s3);
    });

    it('intersect', (): void => {
      const s1 = context.of(1, 2, 3, 4, 5);
      const s2 = context.of(4, 5, 6, 7, 8);
      const s3 = context.of(10, 11);
      expect(context.empty().intersect(context.empty())).toBe(context.empty());
      expect(s1.intersect(context.empty())).toBe(context.empty());
      expect(context.empty().intersect(s1)).toBe(context.empty());
      expect(s1.intersect(s1)).toBe(s1);
      expect(s1.intersect(s2)).toEqual(context.of(4, 5));
      expect(s1.intersect([4, 5, 6, 7, 8])).toEqual(context.of(4, 5));
      expect(s2.intersect(s1)).toEqual(context.of(4, 5));
      expect(s1.intersect(s3)).toBe(context.empty());
      expect(s3.intersect(context.of(10, 11))).toBe(s3);
    });

    it('symDifference', (): void => {
      const s1 = context.of(1, 2, 3, 4, 5);
      const s2 = context.of(4, 5, 6, 7, 8);
      const s3 = context.of(10, 11);
      expect(context.empty().symDifference(context.empty())).toBe(
        context.empty()
      );
      expect(s1.symDifference(context.empty())).toBe(s1);
      expect(context.empty().symDifference(s1)).toBe(s1);
      expect(s1.symDifference(s1)).toBe(context.empty());
      expectSet(s1.symDifference(s2)).toEqual([1, 2, 3, 6, 7, 8]);
      expectSet(s2.symDifference(s1)).toEqual([1, 2, 3, 6, 7, 8]);
      expectSet(s1.symDifference(s3)).toEqual([1, 2, 3, 4, 5, 10, 11]);
      expect(s3.symDifference(context.of(10, 11))).toBe(context.empty());
    });

    it('filter', (): void => {
      const m = context.from(Stream.range({ amount: 100 }));
      expect(m.size).toBe(100);
      expect(m.filter((v) => v % 2 === 0).size).toBe(50);
      expect(m.filter((v) => true)).toBe(m);
      expect(m.filter((v) => false).isEmpty).toBe(true);
    });

    it('foreach', (): void => {
      const m = context.from(Stream.range({ amount: 100 }));

      let state = 0;
      m.forEach((v, i, halt): void => {
        state += v + i;
      });
      expect(state).toBe(9900);

      // cannot test order due to hashset
      state = 0;
      m.forEach((_, i, halt): void => {
        state += i;
        if (i > 10) halt();
      });
      expect(state).toBe(66);
    });

    it('has', (): void => {
      expect(context.empty().has(1)).toBe(false);
      expect(context.of(1, 2, 3).has(1)).toBe(true);
      expect(context.of(1, 2, 3).has(8)).toBe(false);
    });

    it('remove', (): void => {
      expect(context.empty().remove(1)).toBe(context.empty());
      const m = context.of(1, 2, 3);
      expect(m.remove(2)).toEqual(context.of(1, 3));
      expect(m.remove(4)).toBe(m);
    });

    it('stream', (): void => {
      expect(context.empty().stream().toArray()).toEqual([]);

      expect(context.of(1, 2, 3).stream().toArray()).toEqual([1, 2, 3]);
    });
  });

  describe(`${name} RSet builder`, (): void => {
    it('empty', (): void => {
      const b = context.builder();

      expect(b.build()).toBe(context.empty());
      expect(b.size).toBe(0);
      expect(b.isEmpty).toBe(true);
      expect(b.has(0)).toBe(false);
      b.remove(0);
      expect(b.build()).toBe(context.empty());
      b.add(1);
      expect(b.isEmpty).toBe(false);
    });

    it('isEmpty', (): void => {
      expect(context.builder().isEmpty).toBe(true);
      expect(context.of(1).toBuilder().isEmpty).toBe(false);
    });

    it('removes duplicates', (): void => {
      const b = context.builder();
      expect(b.add(1)).toBe(true);
      expect(b.add(2)).toBe(true);
      expect(b.add(2)).toBe(false);
      expect(b.add(3)).toBe(true);
      expect(b.add(3)).toBe(false);
      expect(b.add(3)).toBe(false);
      expect(b.build()).toEqual(context.of(1, 2, 3));
    });

    it('foreach', (): void => {
      const b = context.builder();
      Stream.range({ amount: 100 }).forEach(b.add);

      let state = 0;
      b.forEach((v, i, halt): void => {
        state += v + i;
      });
      expect(state).toBe(9900);

      // cannot test order due to hashset
      state = 0;
      b.forEach((_, i, halt): void => {
        state += i;
        if (i > 10) halt();
      });
      expect(state).toBe(66);
    });

    it('foreach checklock', (): void => {
      const b = context.builder();
      Stream.range({ amount: 100 }).forEach(b.add);

      expect((): void => {
        b.forEach((): void => {
          b.add(5);
        });
      }).toThrow();

      expect((): void => {
        b.forEach((): void => {
          b.remove(5);
        });
      }).toThrow();
    });

    it('has', (): void => {
      const b = context.builder();
      expect(b.has(1)).toBe(false);

      b.addAll(Stream.range({ start: 1, end: 4 }));
      expect(b.has(1)).toBe(true);
      expect(b.has(8)).toBe(false);
    });

    it('remove', (): void => {
      const b = context.builder();
      expect(b.remove(1)).toBe(false);

      b.addAll(Stream.range({ start: 1, end: 3 }));
      expect(b.remove(2)).toEqual(true);
      expect(b.remove(4)).toBe(false);
    });
  });

  describe(`${name} RSet Builder`, (): void => {
    it('builds from existing set', () => {
      const source = context.of(1, 2, 3);
      const builder = source.toBuilder();
      expect(builder.size).toBe(3);
      expect(builder.build()).toBe(source);
      builder.add(4);
      builder.add(1);
      expect(builder.size).toBe(4);
      expect(builder.build()).toEqual(context.of(1, 2, 3, 4));
    });
  });
}
