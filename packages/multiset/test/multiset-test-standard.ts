import { Stream } from '@rimbu/stream';
import { HashMultiSet, MultiSet } from '../src';

function expectEqual(source: MultiSet<string>, values: [string, number][]) {
  expect(new Set(source.countMap.toArray())).toEqual(new Set(values));
}

export function runMultiSetTestsWith(name: string, MS: MultiSet.Context<any>) {
  describe(`${name} creators`, () => {
    it('empty', () => {
      expect(MS.empty<number>()).toBe(MS.empty<string>());
    });

    it('of', () => {
      expectEqual(MS.of('a', 'a', 'c', 'b', 'c', 'c'), [
        ['a', 2],
        ['b', 1],
        ['c', 3],
      ]);
    });

    it('from', () => {
      expectEqual(MS.from('aacbcc'), [
        ['a', 2],
        ['b', 1],
        ['c', 3],
      ]);

      expectEqual(MS.from(['a', 'a'], [], 'cbc', ['c']), [
        ['a', 2],
        ['b', 1],
        ['c', 3],
      ]);

      {
        const s = MS.from('abc');
        expect(MS.from(s)).toBe(s);
        expectEqual(MS.from(s, 'ab'), [
          ['a', 2],
          ['b', 2],
          ['c', 1],
        ]);
      }

      {
        const c = HashMultiSet.createContext();
        const s = c.from('abc');
        expect(MS.from(s)).not.toBe(s);
      }
    });

    it('builder', () => {
      const b = MS.builder<string>();
      expect(b.size).toBe(0);
      b.add('a');
      expect(b.size).toBe(1);
      b.addAll('aabc');
      expect(b.size).toBe(5);
    });

    it('reducer', () => {
      const source = Stream.from('abcb');
      {
        const result = source.reduce(MS.reducer());
        expectEqual(result, [
          ['a', 1],
          ['b', 2],
          ['c', 1],
        ]);
      }

      {
        const result = source.reduce(MS.reducer('bdb'));
        expectEqual(result, [
          ['a', 1],
          ['b', 4],
          ['c', 1],
          ['d', 1],
        ]);
      }
    });
  });

  describe(`${name} methods`, () => {
    const set_empty = MS.empty<string>();
    const set_4 = MS.from('abcc').assumeNonEmpty();
    const set_7 = MS.from('abcfcab').assumeNonEmpty();

    it('iterator', () => {
      expect([...MS.empty()]).toEqual([]);
      expect([...MS.from('abcc')]).toEqual(['a', 'b', 'c', 'c']);
    });

    it('add', () => {
      expectEqual(set_empty.add('a'), [['a', 1]]);
      expectEqual(set_4.add('a'), [
        ['a', 2],
        ['b', 1],
        ['c', 2],
      ]);
      expectEqual(set_4.add('f'), [
        ['a', 1],
        ['b', 1],
        ['c', 2],
        ['f', 1],
      ]);
    });

    it('addAll', () => {
      expect(set_empty.addAll([])).toBe(set_empty);
      expect(set_4.addAll([])).toBe(set_4);
      expect(set_7.addAll([])).toBe(set_7);

      expectEqual(set_empty.addAll('abca'), [
        ['a', 2],
        ['b', 1],
        ['c', 1],
      ]);

      expectEqual(set_4.addAll('abcae'), [
        ['a', 3],
        ['b', 2],
        ['c', 3],
        ['e', 1],
      ]);
    });

    it('addEntries', () => {
      expect(set_empty.addEntries([])).toBe(set_empty);
      expect(set_4.addEntries([])).toBe(set_4);
      expect(set_7.addEntries([])).toBe(set_7);

      expectEqual(
        set_empty.addEntries([
          ['a', 2],
          ['b', 4],
        ]),
        [
          ['a', 2],
          ['b', 4],
        ]
      );
      expectEqual(
        set_4.addEntries([
          ['a', 2],
          ['e', 4],
        ]),
        [
          ['a', 3],
          ['b', 1],
          ['c', 2],
          ['e', 4],
        ]
      );
    });

    it('asNormal', () => {
      expect(set_4.asNormal()).toBe(set_4);
      expect(set_7.asNormal()).toBe(set_7);
    });

    it('assumeNonEmpty', () => {
      expect(() => set_empty.assumeNonEmpty()).toThrow();
      expect(set_4.assumeNonEmpty()).toBe(set_4);
      expect(set_7.assumeNonEmpty()).toBe(set_7);
    });

    it('context', () => {
      expect(set_empty.context).toBe(MS);
      expect(set_4.context).toBe(MS);
      expect(set_7.context).toBe(MS);
    });

    it('count', () => {
      expect(set_empty.count('b')).toBe(0);
      expect(set_4.count('b')).toBe(1);
      expect(set_4.count('z')).toBe(0);
      expect(set_7.count('b')).toBe(2);
      expect(set_7.count('z')).toBe(0);
    });

    it('countMap', () => {
      expect(set_empty.countMap).toBe(
        set_empty.context.countMapContext.empty()
      );
      expect(set_4.countMap.size).toBe(3);
      expect(set_7.countMap.size).toBe(4);
    });

    it('filterEntries', () => {
      const atLeast2 = ([_, count]: readonly [string, number]) => count > 1;

      expect(set_empty.filterEntries(atLeast2)).toBe(set_empty);
      expectEqual(set_4.filterEntries(atLeast2), [['c', 2]]);
      expectEqual(set_7.filterEntries(atLeast2), [
        ['a', 2],
        ['b', 2],
        ['c', 2],
      ]);
    });

    it('forEach', () => {
      let result = [] as string[];
      set_empty.forEach((v) => result.push(v));
      expect(result).toEqual([]);

      result = [];
      set_4.forEach((v, i) => result.push(`${v}${i}`));
      expect(result).toEqual(['a0', 'b1', 'c2', 'c3']);

      result = [];
      set_7.forEach((v, i) => result.push(`${v}${i}`));
      expect(result).toEqual(['a0', 'a1', 'b2', 'b3', 'c4', 'c5', 'f6']);

      const onlyFirst = (v: string, i: number, halt: () => void) => {
        halt();
        result.push(`${v}${i}`);
      };

      result = [];
      set_empty.forEach(onlyFirst);
      expect(result).toEqual([]);

      result = [];
      set_4.forEach(onlyFirst);
      expect(result).toEqual(['a0']);

      result = [];
      set_7.forEach(onlyFirst);
      expect(result).toEqual(['a0']);
    });

    it('has', () => {
      expect(set_empty.has('b')).toBe(false);
      expect(set_4.has('b')).toBe(true);
      expect(set_4.has('z')).toBe(false);
      expect(set_7.has('b')).toBe(true);
      expect(set_7.has('z')).toBe(false);
    });

    it('isEmpty', () => {
      expect(set_empty.isEmpty).toBe(true);
      expect(set_4.isEmpty).toBe(false);
      expect(set_7.isEmpty).toBe(false);
    });

    it('modifyCount', () => {
      expect(set_empty.modifyCount('b', () => 0)).toBe(set_empty);
      expectEqual(
        set_empty.modifyCount('b', () => 2),
        [['b', 2]]
      );
      expectEqual(
        set_empty.modifyCount('b', (c) => c + 1),
        [['b', 1]]
      );
      expectEqual(
        set_4.modifyCount('b', () => 10),
        [
          ['a', 1],
          ['b', 10],
          ['c', 2],
        ]
      );
      expectEqual(
        set_4.modifyCount('b', (v) => v + 1),
        [
          ['a', 1],
          ['b', 2],
          ['c', 2],
        ]
      );
      expectEqual(
        set_4.modifyCount('b', () => 0),
        [
          ['a', 1],
          ['c', 2],
        ]
      );
      expect(set_4.modifyCount('z', () => 0)).toBe(set_4);
      expectEqual(
        set_4.modifyCount('z', () => 2),
        [
          ['a', 1],
          ['b', 1],
          ['c', 2],
          ['z', 2],
        ]
      );
    });

    it('nonEmpty', () => {
      expect(set_empty.nonEmpty()).toBe(false);
      expect(set_4.nonEmpty()).toBe(true);
      expect(set_7.nonEmpty()).toBe(true);
    });

    it('remove', () => {
      expect(set_empty.remove('b')).toBe(set_empty);
      expect(set_empty.remove('b', 0)).toBe(set_empty);
      expect(set_empty.remove('b', 10)).toBe(set_empty);
      expect(set_empty.remove('b', 'ALL')).toBe(set_empty);

      expect(set_4.remove('z')).toBe(set_4);
      expect(set_4.remove('b', 0)).toBe(set_4);
      expectEqual(set_4.remove('c'), [
        ['a', 1],
        ['b', 1],
        ['c', 1],
      ]);
      expectEqual(set_4.remove('c', 10), [
        ['a', 1],
        ['b', 1],
      ]);
      expectEqual(set_4.remove('c', 'ALL'), [
        ['a', 1],
        ['b', 1],
      ]);
    });

    it('removeAllEvery', () => {
      expect(set_empty.removeAllEvery(['a', 'z'])).toBe(set_empty);
      expect(set_4.removeAllEvery(['y', 'z'])).toBe(set_4);
      expectEqual(set_4.removeAllEvery(['c', 'y', 'z']), [
        ['a', 1],
        ['b', 1],
      ]);
    });

    it('removeAllSingle', () => {
      expect(set_empty.removeAllSingle(['a', 'z'])).toBe(set_empty);
      expect(set_4.removeAllSingle(['y', 'z'])).toBe(set_4);
      expectEqual(set_4.removeAllSingle(['c', 'y', 'z']), [
        ['a', 1],
        ['b', 1],
        ['c', 1],
      ]);
      expectEqual(set_4.removeAllSingle(['a', 'c', 'y', 'z']), [
        ['b', 1],
        ['c', 1],
      ]);
    });

    it('setCount', () => {
      expect(set_empty.setCount('b', 0)).toBe(set_empty);
      expect(set_4.setCount('b', 1)).toBe(set_4);
      expectEqual(set_4.setCount('b', 3), [
        ['a', 1],
        ['b', 3],
        ['c', 2],
      ]);
      expectEqual(set_4.setCount('b', 0), [
        ['a', 1],
        ['c', 2],
      ]);
    });

    it('size', () => {
      expect(set_empty.size).toBe(0);
      expect(set_4.size).toBe(4);
      expect(set_7.size).toBe(7);
    });

    it('sizeDistinct', () => {
      expect(set_empty.sizeDistinct).toBe(0);
      expect(set_4.sizeDistinct).toBe(3);
      expect(set_7.sizeDistinct).toBe(4);
    });

    it('stream', () => {
      expect(set_empty.stream()).toBe(Stream.empty());
      expect(set_4.stream().toArray()).toEqual(['a', 'b', 'c', 'c']);
    });

    it('streamDistinct', () => {
      expect(set_empty.streamDistinct()).toBe(Stream.empty());
      expect(set_4.streamDistinct().toArray()).toEqual(['a', 'b', 'c']);
    });

    it('toArray', () => {
      expect(set_empty.toArray()).toEqual([]);
      expect(set_4.toArray()).toEqual(['a', 'b', 'c', 'c']);
      expect(set_7.toArray()).toEqual(['a', 'a', 'b', 'b', 'c', 'c', 'f']);
    });

    it('toBuilder', () => {
      expect(set_empty.toBuilder().build()).toBe(set_empty);
      expect(set_4.toBuilder().build()).toBe(set_4);
      expect(set_7.toBuilder().build()).toBe(set_7);

      {
        const b = set_4.toBuilder();
        expect(b.count('c')).toBe(2);
      }
      {
        const b = set_7.toBuilder();
        expect(b.count('c')).toBe(2);
      }
    });

    it('toString', () => {
      expect(set_empty.toString()).toBe(`${MS.typeTag}()`);
      expect(set_4.toString()).toBe(`${MS.typeTag}(a, b, c, c)`);
    });
  });

  describe(`${name}.Builder`, () => {
    function forEachBuilder(f: (builder: MultiSet.Builder<string>) => void) {
      const b1 = MS.of('a', 'b', 'a', 'c', 'c').toBuilder();
      const b2 = MS.builder<string>();
      b2.addAll('abacc');

      f(b1);
      f(b2);
    }

    it('add', () => {
      const b = MS.builder<string>();
      expect(b.add('a')).toBe(true);
      expect(b.size).toBe(1);
      expect(b.add('b', 5)).toBe(true);
      expect(b.size).toBe(6);
      expect(b.add('b', 0)).toBe(false);
      expect(b.size).toBe(6);

      forEachBuilder((b) => {
        expect(b.add('a', 0)).toBe(false);
        expect(b.add('a')).toBe(true);
        expect(b.size).toBe(6);
        expect(b.add('e', 10)).toBe(true);
        expect(b.size).toBe(16);
      });
    });

    it('addAll', () => {
      const b = MS.builder<string>();
      expect(b.addAll('')).toBe(false);
      expect(b.addAll('abac')).toBe(true);
      expect(b.count('a')).toBe(2);
      expect(b.size).toBe(4);
      expect(b.sizeDistinct).toBe(3);

      forEachBuilder((b) => {
        expect(b.addAll('')).toBe(false);
        expect(b.addAll('cd')).toBe(true);
        expect(b.size).toBe(7);
      });
    });

    it('addEntries', () => {
      const b = MS.builder<string>();
      expect(
        b.addEntries([
          ['a', 0],
          ['b', 0],
        ])
      ).toBe(false);
      expect(
        b.addEntries([
          ['a', 3],
          ['b', 2],
          ['c', 0],
        ])
      ).toBe(true);
      expect(b.size).toBe(5);

      forEachBuilder((b) => {
        expect(
          b.addEntries([
            ['a', 0],
            ['f', 0],
          ])
        ).toBe(false);
        expect(
          b.addEntries([
            ['a', 3],
            ['b', 1],
          ])
        ).toBe(true);
        expect(b.size).toBe(9);
      });
    });

    it('build', () => {
      expect(MS.builder().build()).toBe(MS.empty());

      forEachBuilder((b) => {
        expectEqual(b.build(), [
          ['a', 2],
          ['b', 1],
          ['c', 2],
        ]);
      });
    });

    it('count', () => {
      const b = MS.builder<string>();
      expect(b.count('b')).toBe(0);

      forEachBuilder((b) => {
        expect(b.count('z')).toBe(0);
        expect(b.count('b')).toBe(1);
      });
    });

    it('forEach', () => {
      let result = [] as string[];

      const b = MS.builder<string>();

      b.forEach((v) => result.push(v));
      expect(result).toEqual([]);

      const onlyFirst = (v: string, i: number, halt: () => void) => {
        halt();
        result.push(`${v}${i}`);
      };

      result = [];
      b.forEach(onlyFirst);
      expect(result).toEqual([]);

      forEachBuilder((b) => {
        result = [];
        b.forEach((v, i) => result.push(`${v}${i}`));
        expect(result).toEqual(['a0', 'a1', 'b2', 'c3', 'c4']);
      });
    });

    it('has', () => {
      expect(MS.builder<string>().has('b')).toBe(false);

      forEachBuilder((b) => {
        expect(b.has('z')).toBe(false);
        expect(b.has('b')).toBe(true);
      });
    });

    it('isEmpty', () => {
      expect(MS.builder<string>().isEmpty).toBe(true);

      forEachBuilder((b) => {
        expect(b.isEmpty).toBe(false);
      });
    });

    it('modifyCount', () => {
      const b = MS.builder<string>();

      expect(b.modifyCount('b', () => 0)).toBe(false);
      expect(b.modifyCount('b', () => 1)).toBe(true);
      expect(b.count('b')).toBe(1);
      expect(b.modifyCount('b', (v) => v + 1)).toBe(true);
      expect(b.count('b')).toBe(2);
      expect(b.modifyCount('b', () => 0)).toBe(true);
      expect(b.count('b')).toBe(0);

      forEachBuilder((b) => {
        expect(b.modifyCount('z', () => 0)).toBe(false);
        expect(b.modifyCount('z', () => 2)).toBe(true);
        expect(b.count('z')).toBe(2);
        expect(b.modifyCount('z', () => 0)).toBe(true);
        expect(b.count('z')).toBe(0);
        expect(b.modifyCount('b', (v) => v + 1)).toBe(true);
        expect(b.count('b')).toBe(2);
      });
    });

    it('remove', () => {
      const b = MS.builder<string>();
      expect(b.remove('b')).toBe(0);
      expect(b.remove('b', 0)).toBe(0);
      expect(b.remove('b', 10)).toBe(0);
      expect(b.remove('b', 'ALL')).toBe(0);

      forEachBuilder((b) => {
        expect(b.remove('z')).toBe(0);
        expect(b.remove('z', 0)).toBe(0);
        expect(b.remove('z', 10)).toBe(0);
        expect(b.remove('z', 'ALL')).toBe(0);

        expect(b.remove('c')).toBe(1);
        expect(b.remove('c', 0)).toBe(0);
        expect(b.remove('c', 10)).toBe(1);
        expect(b.remove('a', 'ALL')).toBe(2);
      });
    });

    it('removeAllEvery', () => {
      const b = MS.builder<string>();
      expect(b.removeAllEvery(['b'])).toBe(false);
      expect(b.removeAllEvery(['b', 'c'])).toBe(false);

      forEachBuilder((b) => {
        expect(b.removeAllEvery(['z'])).toBe(false);
        expect(b.removeAllEvery(['y', 'z'])).toBe(false);

        expect(b.removeAllEvery(['c', 'z'])).toBe(true);
        expect(b.size).toBe(3);
      });
    });

    it('removeAllSingle', () => {
      const b = MS.builder<string>();
      expect(b.removeAllSingle(['b'])).toBe(false);
      expect(b.removeAllSingle(['b', 'c'])).toBe(false);

      forEachBuilder((b) => {
        expect(b.removeAllSingle(['z'])).toBe(false);
        expect(b.removeAllSingle(['y', 'z'])).toBe(false);

        expect(b.removeAllSingle(['c', 'z'])).toBe(true);
        expect(b.size).toBe(4);
      });
    });

    it('setCount', () => {
      const b = MS.builder<string>();
      expect(b.setCount('b', 0)).toBe(false);
      expect(b.setCount('b', 2)).toBe(true);
      expect(b.setCount('b', 2)).toBe(false);

      forEachBuilder((b) => {
        expect(b.setCount('z', 0)).toBe(false);
        expect(b.setCount('b', 1)).toBe(false);
        expect(b.setCount('b', 2)).toBe(true);
        expect(b.setCount('b', 2)).toBe(false);
        expect(b.size).toBe(6);
      });
    });

    it('size', () => {
      expect(MS.builder().size).toBe(0);

      forEachBuilder((b) => {
        expect(b.size).toBe(5);
      });
    });

    it('sizeDistinct', () => {
      expect(MS.builder().sizeDistinct).toBe(0);

      forEachBuilder((b) => {
        expect(b.sizeDistinct).toBe(3);
      });
    });
  });
}
