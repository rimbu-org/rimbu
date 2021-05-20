import { Stream } from '@rimbu/stream';
import { RMap } from '../../src';

export function runMapRandomTestsWith(
  name: string,
  context: RMap.Context<any>
): void {
  class Entangled {
    map = new Map<number, number>();
    builder = context.builder();
    immm = context.empty();
    log: string[] = [];

    check(): void {
      try {
        expect(this.builder.size).toEqual(this.map.size);
        expect(this.immm.size).toEqual(this.map.size);
        this.map.forEach((value, key): void => {
          expect(this.builder.get(key, 'a')).toEqual(value);
          expect(this.immm.get(key, 'a')).toEqual(value);
        });
      } catch (e) {
        console.log(this.log);
        console.log(
          'sizes',
          this.map.size,
          this.immm.size,
          this.builder.size,
          this.log.length
        );
        throw e;
      }
    }

    addLog(action: string, ...values: any[]): void {
      if (values.length > 0) this.log.push(`${action}: ${values}`);
      else this.log.push(`${action}`);
    }

    checkGet(index: number): void {
      const getmap = this.map.get(index);
      const gethm = this.immm.get(index, undefined);
      const gethb = this.builder.get(index, undefined);

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

    set(key: number, value: number): void {
      this.addLog('set', key, value);
      this.map.set(key, value);
      this.builder.set(key, value);
      this.immm = this.immm.set(key, value);
    }

    addEntry(entry: [number, number]): void {
      this.addLog('addEntry', entry);
      this.map.set(entry[0], entry[1]);
      this.builder.addEntry(entry);
      this.immm = this.immm.addEntry(entry);
    }

    removeKey(key: number): void {
      this.addLog('remove', key);
      this.map.delete(key);
      this.builder.removeKey(key);
      this.immm = this.immm.removeKey(key);
    }
  }

  describe(`${name} RMap`, (): void => {
    it('empty', (): void => {
      const m = context.empty();
      const empty = context.empty();

      expect(m).toBe(empty);
      expect(m.size).toBe(0);
      expect(m.isEmpty).toBe(true);
      expect(m.nonEmpty()).toBe(false);
      expect(m.addEntry([1, 2]).isEmpty).toBe(false);
      expect(m.assumeNonEmpty).toThrowError();
      expect(m.filter((): boolean => false)).toBe(empty);
      expect(m.get(0, 'a')).toBe('a');
      // expect(m.keySet().isEmpty).toBe(true);
      expect(m.mapValues((): number => 1)).toBe(empty);
      expect(m.modifyAt(0, { ifExists: (): number => 5 })).toBe(empty);
      expect(m.removeKey(0)).toBe(empty);
      expect(m.set(1, 2).isEmpty).toBe(false);
      expect(m.stream()).toBe(Stream.empty());
      expect(m.streamKeys()).toBe(Stream.empty());
      expect(m.streamValues()).toBe(Stream.empty());
      expect(m.hasKey(1)).toBe(false);
      expect(m.toBuilder().build()).toBe(empty);
    });

    it('set', (): void => {
      const ent = new Entangled();

      Stream.randomInt(0, 1000)
        .take(1000)
        .forEach((v): void => {
          ent.set(v, v);
          ent.check();
        });
    });

    it('addEntry', (): void => {
      const ent = new Entangled();

      Stream.randomInt(0, 1000)
        .take(1000)
        .forEach((v): void => {
          ent.addEntry([v, v]);
          ent.check();
        });
    });

    it('get', (): void => {
      const ent = new Entangled();

      const len = 3000;
      let i = 0;
      Stream.randomInt(0, len)
        .take(len)
        .forEach((v): void => {
          ent.set(v, i++);
        });

      Stream.range({ amount: len }).forEach((v): void => {
        ent.checkGet(v);
      });
    });

    it('remove', (): void => {
      const ent = new Entangled();

      const len = 1000;
      let i = 0;
      Stream.randomInt(0, len)
        .take(len)
        .forEach((v): void => {
          ent.set(v, i++);
        });

      Stream.range({ amount: len }).forEach((): void => {
        const r = Math.round(Math.random() * ent.map.size);
        ent.removeKey(r);
        ent.check();
      });
    });

    it('set existing key overrides', (): void => {
      const m = context.of([1, 1], [2, 2], [3, 3]);
      expect(m.set(1, 4).get(1, 'a')).toEqual(4);
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
      const m = context.from(Stream.range({ amount: 100 }).indexed());
      expect(m.size).toBe(100);
      expect(m.filter((v) => v[0] % 2 === 0).size).toBe(50);
      expect(m.filter((v) => true)).toBe(m);
      expect(m.filter((v) => false).isEmpty).toBe(true);
    });

    it('foreach', (): void => {
      const m = context.from(Stream.range({ amount: 100 }).indexed());

      let state = 0;
      m.forEach((e, i, halt): void => {
        state += e[0] + e[1] + i;
      });
      expect(state).toBe(14850);

      // cannot test order due to hashmap
      state = 0;
      m.forEach((_, i, halt): void => {
        state += i;
        if (i > 10) halt();
      });
      expect(state).toBe(66);
    });

    it('get', (): void => {
      expect(context.empty().get(1, 'a')).toBe('a');
      expect(context.of([1, 1]).get(1, 'a')).toBe(1);
      expect(context.of([1, 1]).get(2, 'a')).toBe('a');
    });

    it('hasKey', (): void => {
      expect(context.empty().hasKey(1)).toBe(false);
      expect(context.of([1, 1]).hasKey(1)).toBe(true);
      expect(context.of([1, 1]).hasKey(2)).toBe(false);
    });

    it('mapValues', (): void => {
      expect(context.empty().mapValues((v) => 1)).toBe(context.empty());
      expect(context.of([1, 1]).mapValues((v) => v + 1)).toEqual(
        context.of([1, 2])
      );
      expect(
        context.of([1, 1], [2, 2], [3, 3]).mapValues((v) => v + 1)
      ).toEqual(context.of([1, 2], [2, 3], [3, 4]));
    });

    it('modifyAt', (): void => {
      expect(context.empty().modifyAt(1, {})).toBe(context.empty());
      expect(context.empty().modifyAt(1, { ifNew: 1 })).toEqual(
        context.of([1, 1])
      );
      expect(context.empty().modifyAt(1, { ifNew: () => 1 })).toEqual(
        context.of([1, 1])
      );
      expect(context.empty().modifyAt(1, { ifExists: () => 1 })).toEqual(
        context.empty()
      );
      expect(
        context.empty().modifyAt(1, { ifExists: (_, remove) => remove })
      ).toEqual(context.empty());
      const m = context.of([1, 1], [2, 2], [3, 3]);
      expect(m.modifyAt(1, { ifNew: 2 })).toBe(m);
      expect(m.modifyAt(1, { ifNew: () => 2 })).toBe(m);
      expect(m.modifyAt(1, { ifExists: (v) => v + 1 })).toEqual(
        context.of([1, 2], [2, 2], [3, 3])
      );
      expect(m.modifyAt(2, { ifExists: (_, remove) => remove })).toEqual(
        context.of([1, 1], [3, 3])
      );
      expect(m.modifyAt(4, { ifNew: 4 })).toEqual(
        context.of([1, 1], [2, 2], [3, 3], [4, 4])
      );
      expect(m.modifyAt(4, { ifNew: () => 4 })).toEqual(
        context.of([1, 1], [2, 2], [3, 3], [4, 4])
      );
      expect(m.modifyAt(4, { ifExists: (v) => v + 1 })).toBe(m);
      expect(m.modifyAt(4, { ifExists: (_, remove) => remove })).toBe(m);
      expect(
        context.of([1, 1]).modifyAt(1, { ifExists: (_, remove) => remove })
      ).toBe(context.empty());
    });

    it('remove', (): void => {
      expect(context.empty().removeKey(1)).toBe(context.empty());
      const m = context.of([1, 1], [2, 2]);
      expect(m.removeKey(1)).toEqual(context.of([2, 2]));
      expect(m.removeKey(4)).toBe(m);
      expect(context.of([1, 1]).removeKey(1)).toBe(context.empty());
    });

    it('removeKeyAndGet', (): void => {
      expect(context.empty().removeKeyAndGet(1)).toBe(undefined);
      const m = context.of([1, 1], [2, 2]);
      expect(m.removeKeyAndGet(1)![1]).toBe(1);

      expect(m.removeKeyAndGet(4)).toBe(undefined);
    });

    it('updateAt', (): void => {
      expect(context.empty<number, number>().updateAt(1, (v) => v + 1)).toBe(
        context.empty()
      );
      const m = context.of([1, 1], [2, 2], [3, 3]);
      expect(m.updateAt(2, 3)).toEqual(context.of([1, 1], [2, 3], [3, 3]));
      expect(m.updateAt(2, (v) => v + 1)).toEqual(
        context.of([1, 1], [2, 3], [3, 3])
      );
      expect(m.updateAt(4, 3)).toBe(m);
    });

    it('stream', (): void => {
      expect(context.empty().stream().toArray()).toEqual([]);

      expect(context.of([1, 1], [2, 2], [3, 3]).stream().toArray()).toEqual([
        [1, 1],
        [2, 2],
        [3, 3],
      ]);
    });

    it('streamKeys', (): void => {
      expect(context.empty().streamKeys().toArray()).toEqual([]);

      expect(
        context.of([1, 10], [2, 20], [3, 30]).streamKeys().toArray()
      ).toEqual([1, 2, 3]);
    });

    it('streamValues', (): void => {
      expect(context.empty().streamValues().toArray()).toEqual([]);

      expect(
        context.of([1, 10], [2, 20], [3, 30]).streamValues().toArray()
      ).toEqual([10, 20, 30]);
    });
  });

  describe(`${name} RMap builder`, (): void => {
    it('empty', (): void => {
      const b = context.builder();

      expect(b.isEmpty).toBe(true);
      expect(b.size).toBe(0);
      expect(b.get(0, 'a')).toBe('a');
      expect(b.hasKey(0)).toBe(false);
      expect(b.build()).toBe(context.empty());
    });

    it('set existing key overrides', (): void => {
      const b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach(b.addEntry);
      expect(b.get(1, 'a')).toBe(1);
      b.set(1, 4);
      expect(b.get(1, 'a')).toBe(4);
    });

    it('foreach', (): void => {
      const b = context.builder<number, number>();
      Stream.range({ amount: 100 }).indexed().forEach(b.addEntry);

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
      Stream.range({ amount: 100 }).indexed().forEach(b.addEntry);

      expect((): void => {
        b.forEach((): void => {
          b.set(10, 100);
        });
      }).toThrow();

      expect((): void => {
        b.forEach((): void => {
          b.addEntry([10, 100]);
        });
      }).toThrow();

      expect((): void => {
        b.forEach((): void => {
          b.modifyAt(1, { ifNew: 2, ifExists: (v) => v });
        });
      }).toThrow();

      expect((): void => {
        b.forEach((): void => {
          b.removeKey(1);
        });
      }).toThrow();

      expect((): void => {
        b.forEach((): void => {
          b.updateAt(1, 3);
        });
      }).toThrow();
    });

    it('get', (): void => {
      expect(context.builder().get(1, 'a')).toBe('a');
      const b = context.builder();
      b.addEntry([1, 1]);
      expect(b.get(1, 'a')).toBe(1);
      expect(b.get(2, 'a')).toBe('a');
    });

    it('hasKey', (): void => {
      expect(context.builder().hasKey(1)).toBe(false);
      const b = context.builder();
      b.addEntry([1, 1]);
      expect(b.hasKey(1)).toBe(true);
      expect(b.hasKey(2)).toBe(false);
    });

    it('modifyAt', (): void => {
      let b = context.builder<number, number>();
      expect(b.modifyAt(1, {})).toBe(false);
      expect(b.size).toBe(0);

      b = context.builder();
      expect(b.modifyAt(1, { ifNew: 1 })).toBe(true);
      expect(b.get(1, 'a')).toBe(1);

      b = context.builder();
      expect(b.modifyAt(1, { ifNew: () => 1 })).toBe(true);
      expect(b.get(1, 'a')).toBe(1);

      b = context.builder();
      expect(b.modifyAt(1, { ifExists: () => 1 })).toBe(false);
      expect(b.size).toBe(0);

      b = context.builder();
      expect(b.modifyAt(1, { ifExists: (_, remove) => remove })).toBe(false);
      expect(b.size).toBe(0);

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach(b.addEntry);
      expect(b.modifyAt(1, { ifNew: 2 })).toBe(false);
      expect(b.get(1, 'a')).toBe(1);

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach(b.addEntry);
      expect(b.modifyAt(1, { ifNew: () => 2 })).toBe(false);
      expect(b.get(1, 'a')).toBe(1);

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach(b.addEntry);
      expect(b.modifyAt(1, { ifExists: (v) => v + 1 })).toBe(true);
      expect(b.get(1, 'a')).toBe(2);

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach(b.addEntry);
      expect(b.modifyAt(2, { ifExists: (_, remove) => remove })).toBe(true);
      expect(b.get(2, 'a')).toBe('a');

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach(b.addEntry);
      expect(b.modifyAt(4, { ifNew: 4 })).toBe(true);
      expect(b.get(4, 'a')).toBe(4);

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach(b.addEntry);
      expect(b.modifyAt(4, { ifNew: () => 4 })).toBe(true);
      expect(b.get(4, 'a')).toBe(4);

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach(b.addEntry);
      expect(b.modifyAt(4, { ifExists: (v) => v + 1 })).toBe(false);
      expect(b.get(4, 'a')).toBe('a');

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach(b.addEntry);
      expect(b.modifyAt(4, { ifExists: (_, remove) => remove })).toBe(false);
      expect(b.get(4, 'a')).toBe('a');
    });

    it('remove', (): void => {
      let b = context.builder<number, number>();

      expect(b.removeKey(1)).toBe(undefined);
      expect(b.removeKey(1, 'a')).toBe('a');
      expect(b.build()).toBe(context.empty());

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2]).forEach(b.addEntry);
      expect(b.removeKey(1)).toBe(1);
      expect(b.build()).toEqual(context.of([2, 2]));

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2]).forEach(b.addEntry);
      expect(b.removeKey(4)).toBe(undefined);
      expect(b.removeKey(4, 'a')).toBe('a');
      expect(b.build()).toEqual(context.of([1, 1], [2, 2]));
    });

    it('updateAt', (): void => {
      let b = context.builder<number, number>();

      expect(b.updateAt(1, (v) => v + 1)).toBe(undefined);
      expect(b.updateAt(1, (v) => v + 1, 'a')).toBe('a');
      expect(b.build()).toBe(context.empty());

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach(b.addEntry);
      expect(b.updateAt(2, 3)).toBe(2);
      expect(b.build()).toEqual(context.of([1, 1], [2, 3], [3, 3]));

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach(b.addEntry);
      expect(b.updateAt(2, (v) => v + 1)).toBe(2);
      expect(b.build()).toEqual(context.of([1, 1], [2, 3], [3, 3]));

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach(b.addEntry);
      expect(b.updateAt(4, 3)).toBe(undefined);
      expect(b.updateAt(4, 3, 'a')).toBe('a');
      expect(b.build()).toEqual(context.of([1, 1], [2, 2], [3, 3]));

      b = context.builder();
      Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach(b.addEntry);
      expect(b.updateAt(2, 2)).toBe(2);
      expect(b.build()).toEqual(context.of([1, 1], [2, 2], [3, 3]));
    });
  });

  describe(`${name} RMap Builder`, (): void => {
    it('builds from existing map', () => {
      const source = context.of([1, 1], [2, 2], [3, 3]);
      const builder = source.toBuilder();
      expect(builder.size).toBe(3);
      expect(builder.build()).toBe(source);
      builder.addEntry([4, 4]);
      builder.addEntry([1, 5]);
      expect(builder.size).toBe(4);
      expect(builder.build()).toEqual(
        context.of([1, 5], [2, 2], [3, 3], [4, 4])
      );
    });
  });
}
