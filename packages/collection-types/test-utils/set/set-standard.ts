import { Stream } from '@rimbu/stream';
import { RSet } from '../../src';
import { HashSet } from '../../../hashed/src';

function expectEqual<T>(set: RSet<T>, arr: T[]) {
  expect(new Set(set)).toEqual(new Set(arr));
}

const arr3 = [1, 3, 2];
const arr6 = [1, 3, 2, 4, 6, 5];

export function runSetTestsWith(
  name: string,
  context: RSet.Context<any>
): void {
  const S = context;

  describe(`${name} creators`, () => {
    it('empty', () => {
      expect(S.empty<number>()).toBe(S.empty<string>());
    });

    it('of', () => {
      expectEqual(S.of(1, 2, 3), [1, 2, 3]);
      expectEqual(S.of(1, 2, 3, 3), [1, 2, 3]);
    });

    it('from', () => {
      expect(S.from([])).toBe(S.empty());
      expectEqual(S.from([1, 2, 3]), [1, 2, 3]);
      expectEqual(S.from([1, 2, 3, 3]), [1, 2, 3]);

      {
        const s = S.from(arr3);
        expect(S.from(s)).toBe(s);
      }

      {
        const c = HashSet.createContext();
        const s = c.from(arr3);
        expect(S.from(s)).not.toBe(s);
      }
    });

    it('builder', () => {
      const b = S.builder<number>();
      expect(b.size).toBe(0);
      b.addAll([1, 2]);
      expect(b.size).toBe(2);
    });
  });

  describe(`${name} methods`, () => {
    const setEmpty = S.empty<number>();
    const set3_1 = S.of(1, 2, 3);
    const set6_1 = S.of(1, 2, 3, 4, 5, 6);

    it('iterator', () => {
      expect(new Set(setEmpty)).toEqual(new Set());
      expect(new Set(set3_1)).toEqual(new Set(arr3));
      expect(new Set(set6_1)).toEqual(new Set(arr6));
    });

    it('add', () => {
      expectEqual(setEmpty.add(1), [1]);
      expect(set3_1.add(2)).toBe(set3_1);
      expect(set6_1.add(2)).toBe(set6_1);

      expectEqual(set3_1.add(10), [10, ...arr3]);
      expectEqual(set6_1.add(10), [10, ...arr6]);
    });

    it('addAll', () => {
      expectEqual(setEmpty.addAll([1]), [1]);
      expectEqual(set3_1.addAll([2]), arr3);
      expectEqual(set6_1.addAll([2]), arr6);

      expectEqual(set3_1.addAll([10]), [10, ...arr3]);
      expectEqual(set6_1.addAll([10]), [10, ...arr6]);
    });

    it('asNormal', () => {
      expect(set3_1.asNormal()).toBe(set3_1);
      expect(set6_1.asNormal()).toBe(set6_1);
    });

    it('assumeNonEmpty', () => {
      expect(() => setEmpty.assumeNonEmpty()).toThrow();
      expect(set3_1.assumeNonEmpty()).toBe(set3_1);
      expect(set6_1.assumeNonEmpty()).toBe(set6_1);
    });

    it('context', () => {
      expect(setEmpty.context).toBe(S);
      expect(set3_1.context).toBe(S);
      expect(set6_1.context).toBe(S);
    });

    it('difference', () => {
      expect(setEmpty.difference(setEmpty)).toBe(setEmpty);
      expect(setEmpty.difference([2, 5, 10])).toBe(setEmpty);

      expect(set3_1.difference(setEmpty)).toBe(set3_1);
      expectEqual(set3_1.difference([2, 5, 10]), [1, 3]);
      expectEqual(set3_1.difference(arr3), []);

      expect(set6_1.difference(setEmpty)).toBe(set6_1);
      expectEqual(set6_1.difference([2, 5, 10]), [1, 3, 4, 6]);
      expectEqual(set6_1.difference(arr6), []);
    });

    it('filter', () => {
      function isEven(value: number): boolean {
        return value % 2 === 0;
      }

      function first2(value: number, index: number, halt: () => void): boolean {
        if (index > 0) halt();
        return true;
      }

      expect(setEmpty.filter(isEven)).toBe(setEmpty);

      expectEqual(set3_1.filter(isEven), [2]);
      expect(set3_1.filter(first2).size).toBe(2);

      expectEqual(set6_1.filter(isEven), [2, 4, 6]);
      expect(set6_1.filter(first2).size).toBe(2);
    });

    it('forEach', () => {
      let result = [] as number[];
      setEmpty.forEach((v) => result.push(v));
      expect(new Set(result)).toEqual(new Set(setEmpty));

      result = [];
      set3_1.forEach((v) => result.push(v));
      expect(new Set(result)).toEqual(new Set(arr3));

      result = [];
      set6_1.forEach((v) => result.push(v));
      expect(new Set(result)).toEqual(new Set(arr6));
    });

    it('has', () => {
      expect(setEmpty.has(2)).toBe(false);
      expect(set3_1.has(2)).toBe(true);
      expect(set3_1.has(10)).toBe(false);
      expect(set6_1.has(2)).toBe(true);
      expect(set6_1.has(10)).toBe(false);
    });

    it('intersect', () => {
      expect(setEmpty.intersect(setEmpty)).toBe(setEmpty);
      expectEqual(set3_1.intersect([]), []);
      expectEqual(set3_1.intersect(arr3), arr3);
      expectEqual(set6_1.intersect([]), []);
      expectEqual(set6_1.intersect(arr3), arr3);
      expectEqual(set6_1.intersect(arr6), arr6);
    });

    it('isEmpty', () => {
      expect(setEmpty.isEmpty).toBe(true);
      expect(set3_1.isEmpty).toBe(false);
      expect(set3_1.isEmpty).toBe(false);
      expect(set6_1.isEmpty).toBe(false);
    });

    it('nonEmpty', () => {
      expect(setEmpty.nonEmpty()).toBe(false);
      expect(set3_1.nonEmpty()).toBe(true);
      expect(set6_1.nonEmpty()).toBe(true);
    });

    it('remove', () => {
      expect(setEmpty.remove(10)).toBe(setEmpty);
      expect(set3_1.remove(10)).toBe(set3_1);
      expect(set6_1.remove(10)).toBe(set6_1);

      expectEqual(set3_1.remove(2), [1, 3]);
      expectEqual(set6_1.remove(2), [1, 3, 4, 5, 6]);
    });

    it('removeAll', () => {
      expect(setEmpty.removeAll([10])).toBe(setEmpty);
      expect(set3_1.removeAll([10])).toBe(set3_1);
      expect(set6_1.removeAll([10])).toBe(set6_1);

      expectEqual(set3_1.removeAll([2]), [1, 3]);
      expectEqual(set6_1.removeAll([2]), [1, 3, 4, 5, 6]);
    });

    it('size', () => {
      expect(setEmpty.size).toBe(0);
      expect(set3_1.size).toBe(3);
      expect(set6_1.size).toBe(6);
    });

    it('stream', () => {
      expect(setEmpty.stream()).toBe(Stream.empty());
      expect(new Set(set3_1.stream())).toEqual(new Set(arr3));
      expect(new Set(set6_1.stream())).toEqual(new Set(arr6));
    });

    it('symDifference', () => {
      expect(setEmpty.symDifference([])).toBe(setEmpty);
      expectEqual(setEmpty.symDifference(arr3), arr3);
      expectEqual(setEmpty.symDifference(arr6), arr6);

      expectEqual(set3_1.symDifference([]), arr3);
      expectEqual(set3_1.symDifference(arr3), []);
      expectEqual(set3_1.symDifference(arr6), [4, 5, 6]);

      expectEqual(set6_1.symDifference([]), arr6);
      expectEqual(set6_1.symDifference(arr3), [4, 5, 6]);
      expectEqual(set6_1.symDifference(arr6), []);
    });

    it('toArray', () => {
      expect(setEmpty.toArray()).toEqual([]);
      expect(new Set(set3_1.toArray())).toEqual(new Set(arr3));
      expect(new Set(set6_1.toArray())).toEqual(new Set(arr6));
    });

    it('toBuilder', () => {
      expect(setEmpty.toBuilder().build()).toBe(setEmpty);
      expect(set3_1.toBuilder().build()).toBe(set3_1);
      expect(set6_1.toBuilder().build()).toBe(set6_1);

      {
        const b = setEmpty.toBuilder();
        expect(b.isEmpty).toBe(true);
      }
      {
        const b = set3_1.toBuilder();
        expect(b.has(2)).toBe(true);
        expect(b.has(10)).toBe(false);
        expect(b.size).toBe(3);
      }
      {
        const b = set6_1.toBuilder();
        expect(b.has(2)).toBe(true);
        expect(b.has(10)).toBe(false);
        expect(b.size).toBe(6);
      }
    });

    it('toString', () => {
      expect(setEmpty.toString()).toBe(`${S.typeTag}()`);
      expect(set3_1.toString()).toBe(`${S.typeTag}(1, 2, 3)`);
    });

    it('union', () => {
      expect(setEmpty.union([])).toBe(setEmpty);
      expect(setEmpty.union(set3_1)).toBe(set3_1);
      expectEqual(setEmpty.union(arr3), arr3);
      expectEqual(setEmpty.union(arr6), arr6);

      expect(set3_1.union([])).toBe(set3_1);
      expect(set3_1.union(arr3)).toBe(set3_1);
      expectEqual(set3_1.union(arr6), arr6);

      expect(set6_1.union([])).toBe(set6_1);
      expect(set6_1.union(arr3)).toBe(set6_1);
      expect(set6_1.union(arr6)).toBe(set6_1);
    });
  });

  describe(`${name}.Builder`, () => {
    // const arr3 = [1, 3, 2];
    const arr6 = [1, 3, 2, 4, 6, 5];

    it('add', () => {
      const b = S.builder<number>();
      expect(b.add(1)).toBe(true);
      expect(b.add(1)).toBe(false);
      expect(b.size).toBe(1);
    });

    it('addAll', () => {
      const b = S.builder<number>();
      expect(b.addAll([1, 2, 3])).toBe(true);
      expect(b.addAll([1, 2, 3])).toBe(false);
      expect(b.addAll([1, 2, 5])).toBe(true);
      expect(b.size).toBe(4);
    });

    it('build', () => {
      const b = S.builder<number>();
      expect(b.build()).toBe(S.empty());
      b.addAll([1, 2, 3]);
      expect(b.build().size).toBe(3);
      expect(b.build().has(2)).toBe(true);
    });

    it('forEach', () => {
      {
        const b = S.builder<number>();
        const result = new Set<number>();

        b.forEach((value) => result.add(value));
        expect(result).toEqual(new Set());
      }
      {
        const b = S.from(arr6).toBuilder();
        const result = new Set<number>();

        b.forEach((value) => result.add(value));
        expect(result).toEqual(new Set(arr6));
      }
    });

    it('has', () => {
      const b = S.from(arr6).toBuilder();
      expect(b.has(2)).toBe(true);
      expect(b.has(10)).toBe(false);
    });

    it('isEmpty', () => {
      const b = S.builder<number>();
      expect(b.isEmpty).toBe(true);
      b.add(5);
      expect(b.isEmpty).toBe(false);
    });

    it('remove', () => {
      const b = S.from(arr6).toBuilder();
      expect(b.remove(10)).toBe(false);
      expect(b.remove(2)).toBe(true);
      expect(b.has(2)).toBe(false);
    });

    it('removeAll', () => {
      const b = S.from(arr6).toBuilder();
      expect(b.removeAll([10, 11])).toBe(false);
      expect(b.removeAll([2, 10])).toBe(true);
      expect(b.has(2)).toBe(false);
    });

    it('size', () => {
      const b = S.from(arr6).toBuilder();
      expect(b.size).toBe(6);
      b.remove(2);
      expect(b.size).toBe(5);
    });
  });
}
