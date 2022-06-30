import fs from 'fs';
import { List } from '@rimbu/list';
import { Stream } from '@rimbu/stream';

type Action = {
  name: string;
  args: any[];
};

function runWith(nrOfBits: number): void {
  const context = List.createContext({ blockSizeBits: nrOfBits });

  class Entangled {
    arr: number[] = [];
    list = context.empty<number>();
    listBuilder = context.builder<number>();
    log: Action[] = [];

    disableList = false;
    disableListBuilder = false;
    enableLog = false;

    check(): void {
      try {
        if (!this.disableListBuilder) {
          expect(this.listBuilder.length).toEqual(this.arr.length);
          expect(this.listBuilder.build().toArray()).toEqual(this.arr);
        }
        if (!this.disableList) {
          expect(this.list.length).toEqual(this.arr.length);
          expect(this.list.toArray()).toEqual(this.arr);
        }
      } catch (e) {
        if (this.enableLog) {
          fs.writeFileSync('data.json', JSON.stringify(this.arr), {
            encoding: 'utf-8',
            flag: 'w',
          });
          fs.writeFileSync('log.json', JSON.stringify(this.log), {
            encoding: 'utf-8',
            flag: 'w',
          });
        }
        console.log('log:', this.log);
        console.log('expected:', this.arr);
        console.log((this.listBuilder.build() as any).structure());
        console.log('length', this.listBuilder.length);
        // console.log('str', (this.wv as any).structure());
        // console.log('actual wv: ', this.wv.toArray());
        // console.log('actual wb: ', this.wb.build().toArray());
        throw e;
      }
    }

    addLog(name: string, ...args: any[]): void {
      if (!this.enableLog) return;

      this.log.push({ name, args });
      // if (values.length > 0) this.log.push(`${action}: ${values}`);
      // else this.log.push(`${action}`);
    }

    prepend(value: number): void {
      this.addLog('prepend', value);
      this.arr.push(value);
      this.list = this.list.append(value);
      this.listBuilder.append(value);
    }

    append(value: number): void {
      this.addLog('append', value);
      this.arr.push(value);
      this.list = this.list.append(value);
      this.listBuilder.append(value);
    }

    insert(index: number, value: number): void {
      this.addLog('insert', index, value);
      const newList = this.list.insert(index, context.of(value));
      this.list = newList;
      this.arr.splice(index, 0, value);
      this.listBuilder.insert(index, value);
    }

    remove(index: number): void {
      this.addLog('remove', index);
      // const v = this.list.get(index);
      // expect(this.listBuilder.remove(index)).toBe(this.list.get(index));
      this.listBuilder.remove(index);
      const newList = this.list.remove(index);
      this.list = newList;

      this.arr.splice(index, 1);

      // expect(this.listBuilder.get(index)).toBe(v);
      // expect(this.listBuilder.remove(index)).toBe(v);
    }

    concat(other: Entangled): void {
      this.addLog('concat', this.arr.length, other.arr.length);
      this.arr = this.arr.concat(other.arr);
      this.list = this.list.concat(other.list);
    }

    createLen(length: number): void {
      if (Math.random() < 0.5) {
        const valueStream = Stream.range({ amount: length });
        this.arr = valueStream.toArray();
        this.list = context.from(this.arr);
      } else {
        const valueStream = Stream.range(
          { start: [length, false], end: 0 },
          -1
        );
        this.list = context.from(valueStream).reversed();
        this.arr = valueStream.toArray().reverse();
      }

      this.listBuilder = this.list.toBuilder();
    }

    checkGet(index: number): void {
      const getArr = this.arr[index];
      const getList = this.list.get(index, undefined);
      expect(getList).toEqual(getArr);

      if (!this.disableListBuilder) {
        const getListBuilder = this.listBuilder.get(index, undefined);
        expect(getListBuilder).toEqual(getArr);
      }
    }

    checkStream(options?: { start: number; amount: number }): void {
      let i = undefined === options ? 0 : options.start;
      try {
        this.list.streamRange(options || { start: 0 }).forEach((v) => {
          expect(v).toBe(this.listBuilder.get(i, 'a'));
          expect(v).toBe(this.arr[i]);
          i++;
        });
      } catch (e) {
        if (undefined !== options) {
          const end = options.start + options.amount;
          console.log(
            { options },
            JSON.stringify(this.arr.slice(options.start, end)),
            JSON.stringify(this.list.streamRange(options).toArray())
          );
        }
        throw e;
      }
    }
  }

  describe(`List nrBits=${nrOfBits}`, () => {
    it('prepends', () => {
      const ent = new Entangled();

      for (let i = 0; i < 3000; i++) {
        ent.prepend(i);
        ent.check();
      }
    });

    it('appends', () => {
      const ent = new Entangled();

      for (let i = 0; i < 3000; i++) {
        ent.append(i);
        ent.check();
      }
    });

    it('gets random', () => {
      const ent = new Entangled();

      const size = 3000;

      let i = 0;
      Stream.randomInt(0, 3000)
        .take(size)
        .forEach((v) => {
          ent.insert(v, i++);
        });

      Stream.range({ amount: size }).forEach((v) => {
        ent.checkGet(v);
      });
    });

    it('inserts', () => {
      const ent = new Entangled();

      for (let i = 0; i < 3000; i++) {
        const index = Math.round(Math.random() * i);
        ent.insert(index, i);
        ent.check();
      }
    });

    it('removes', () => {
      const ent = new Entangled();

      let i = 0;
      const len = 4000;
      Stream.randomInt(0, len)
        .take(len)
        .forEach((v) => {
          ent.insert(v, i++);
        });

      ent.check();

      Stream.range({ amount: len }).forEach((v) => {
        const r = Math.round(Math.random() * ent.arr.length);
        ent.remove(r);
        ent.check();
      });
    });

    it('concats', () => {
      const maxLen = 3000;
      Stream.zip(
        Stream.randomInt(0, maxLen).take(3000),
        Stream.randomInt(0, maxLen)
      ).forEach(([len1, len2]) => {
        const e1 = new Entangled();
        const e2 = new Entangled();

        e1.createLen(len1);
        e2.createLen(len2);
        e1.disableListBuilder = true;

        try {
          e1.concat(e2);
          e1.check();
        } catch (err) {
          console.log(
            'failed concat',
            { v1: len1, v2: len2 },
            [...e1.list],
            [...e2.list]
          );
          throw err;
        }
      });
    });

    it('stream', () => {
      Stream.randomInt(0, 1000)
        .take(3000)
        .forEach((len) => {
          const e = new Entangled();

          e.createLen(len);
          e.checkStream();
        });
    });

    it('stream partial', () => {
      Stream.randomInt(0, 1000)
        .take(3000)
        .forEach((len) => {
          const e = new Entangled();

          e.createLen(len);
          const start = Math.round(Math.random() * len);
          const amount = Math.round(Math.random() * len);
          try {
            e.checkStream({ start, amount });
          } catch (err) {
            console.log('failed', { len, start, amount });
            throw err;
          }
        });
    });

    it('foreach', (): void => {
      const list = context.from(Stream.range({ amount: 100 }));

      let state = 0;
      list.forEach((v, i, halt): void => {
        state += v + i;
      });
      expect(state).toBe(9900);

      state = 0;
      list.forEach((_, i, halt): void => {
        state += i;
        if (i > 10) halt();
      });
      expect(state).toBe(66);
    });

    it('toArray', () => {
      const list = context.from(Stream.range({ amount: 10 }));
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(list.toArray(undefined, true)).toEqual([
        9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
      ]);
      expect(list.toArray({ start: 5 })).toEqual([5, 6, 7, 8, 9]);
      expect(list.toArray({ end: 5 })).toEqual([0, 1, 2, 3, 4, 5]);
      expect(list.toArray({ start: 3, end: 5 })).toEqual([3, 4, 5]);
      expect(list.toArray({ start: 3, end: 5 }, true)).toEqual([5, 4, 3]);

      const list2 = list.reversed();
      expect(list2.toArray()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
      expect(list2.toArray(undefined, true)).toEqual([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
      ]);
      expect(list2.toArray({ start: 5 })).toEqual([4, 3, 2, 1, 0]);
      expect(list2.toArray({ end: 5 })).toEqual([9, 8, 7, 6, 5, 4]);
      expect(list2.toArray({ start: 3, end: 5 })).toEqual([6, 5, 4]);
      expect(list2.toArray({ start: 3, end: 5 }, true)).toEqual([4, 5, 6]);
    });

    it('take', () => {
      for (let i = 0; i < 3000; i += 10) {
        const arr = Stream.range({ amount: i }).toArray();
        const list = context.from(arr);

        for (let j = 0; j <= arr.length; j += 10) {
          const arrTake = arr.slice(0, j);
          const listTake = list.take(j);
          if (j === 0) expect(listTake).toBe(context.empty());

          expect(listTake.toArray()).toEqual(arrTake);
        }
      }
    });

    it('drop', () => {
      for (let i = 0; i < 3000; i += 10) {
        const arr = Stream.range({ amount: i }).toArray();
        const list = context.from(arr);

        for (let j = 0; j <= arr.length; j += 10) {
          const arrDrop = arr.slice(j);
          const listDrop = list.drop(j);

          expect(listDrop.toArray()).toEqual(arrDrop);
        }
      }
    });
  });

  describe(`List builder nrBits=${nrOfBits}`, () => {
    it('empty', (): void => {
      const builder = context.builder<number>();
      expect(builder.isEmpty).toBe(true);
      expect(builder.build()).toBe(context.empty());
      expect(builder.get(1, 'a')).toBe('a');
      expect(builder.length).toBe(0);
      builder.updateAt(1, 1);
      expect(builder.isEmpty).toBe(true);
    });

    it('foreach', (): void => {
      const builder = context.builder<number>();
      Stream.range({ amount: 100 }).forEach(builder.append);

      let state = 0;
      builder.forEach((v, i, halt): void => {
        state += v + i;
      });
      expect(state).toBe(9900);

      // cannot test order due to hashset
      state = 0;
      builder.forEach((_, i, halt): void => {
        state += i;
        if (i > 10) halt();
      });
      expect(state).toBe(66);
    });

    it('foreach checklock', (): void => {
      const builder = context.builder<number>();
      Stream.range({ amount: 100 }).forEach(builder.append);

      expect((): void => {
        builder.forEach((): void => {
          builder.append(5);
        });
      }).toThrow();

      expect((): void => {
        builder.forEach((): void => {
          builder.prepend(5);
        });
      }).toThrow();

      expect((): void => {
        builder.forEach((): void => {
          builder.insert(5, 10);
        });
      }).toThrow();

      expect((): void => {
        builder.forEach((): void => {
          builder.updateAt(5, 10);
        });
      }).toThrow();

      expect((): void => {
        builder.forEach((): void => {
          builder.remove(5);
        });
      }).toThrow();
    });
  });
}

runWith(2);
runWith(3);
runWith(4);
