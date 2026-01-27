import { describe, expect, it } from 'bun:test';

import type { CollectFun } from '@rimbu/common/collect';
import { Comp } from '@rimbu/common/comp';
import { Stream } from '@rimbu/stream';

import { List as ListSrc } from '@rimbu/list';

const List = ListSrc.createContext({ blockSizeBits: 2 });

describe('List creators', () => {
  it('empty', () => {
    expect(List.empty<number>()).toBe(List.empty<string>());
  });

  it('of', () => {
    expect(List.of(1, 2, 3).toArray()).toEqual([1, 2, 3]);
  });

  it('from', () => {
    const le = List.empty<any>();
    expect(List.from([])).toBe(le);
    expect(List.from('')).toBe(le);
    expect(List.from([1, 2, 3]).toArray()).toEqual([1, 2, 3]);
    expect(List.from('abc').toArray()).toEqual(['a', 'b', 'c']);
    expect(List.from('abc', 'def').toArray()).toEqual([
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
    ]);

    {
      const l = List.of(1, 2, 3);
      expect(List.from(l)).toBe(l);
    }
    {
      const c = ListSrc.createContext();
      const l = c.of(1, 2, 3);
      expect(List.from(l)).not.toBe(l);
    }
  });

  it('fromString', () => {
    expect(List.fromString('')).toBe(List.empty());
    expect(List.fromString('abc').length).toBe(3);
    expect(List.fromString('abc', 'def').length).toBe(6);
  });

  it('builder', () => {
    const b = List.builder<number>();
    expect(b.length).toBe(0);
    b.append(1);
    b.prepend(2);
    expect(b.length).toBe(2);
  });

  it('reducer', () => {
    const source = Stream.range({ start: 5, amount: 15 });
    {
      const result = source.reduce(List.reducer());
      expect(result.toArray()).toEqual(source.toArray());
    }

    {
      const result = source.reduce(List.reducer([1, 2, 3]));
      expect(result.toArray()).toEqual([1, 2, 3, ...source.toArray()]);
    }
  });
});

describe('List methods', () => {
  const listEmpty = List.empty<number>();
  const list3_1 = List.of(1, 2, 3);
  const list3_2 = List.of(3, 2, 1).reversed();
  const list6_1 = List.of(1, 2, 3, 4, 5, 6);
  const list6_2 = List.of(6, 5, 4, 3, 2, 1).reversed();

  it('iterator', () => {
    expect([...listEmpty]).toEqual([]);
    expect([...list3_1]).toEqual([1, 2, 3]);
    expect([...list3_2]).toEqual([1, 2, 3]);
    expect([...list6_1]).toEqual([1, 2, 3, 4, 5, 6]);
    expect([...list6_2]).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('context', () => {
    expect(listEmpty.context).toBe(List);
    expect(list3_1.context).toBe(List);
    expect(list3_2.context).toBe(List);
    expect(list6_1.context).toBe(List);
    expect(list6_2.context).toBe(List);
  });

  it('length', () => {
    expect(listEmpty.length).toBe(0);
    expect(list3_1.length).toBe(3);
    expect(list3_2.length).toBe(3);
    expect(List.from(Stream.range({ amount: 80 })).length).toBe(80);
  });

  it('isEmpty', () => {
    expect(listEmpty.isEmpty).toBe(true);
    expect(list3_1.isEmpty).toBe(false);
    expect(list3_2.isEmpty).toBe(false);
    expect(list6_1.isEmpty).toBe(false);
    expect(list6_2.isEmpty).toBe(false);
  });

  it('nonEmpty', () => {
    expect(listEmpty.nonEmpty()).toBe(false);
    expect(list3_1.nonEmpty()).toBe(true);
    expect(list3_2.nonEmpty()).toBe(true);
    expect(list6_1.nonEmpty()).toBe(true);
    expect(list6_2.nonEmpty()).toBe(true);
  });

  it('assumeNonEmpty', () => {
    expect(() => listEmpty.assumeNonEmpty()).toThrow();
    expect(list3_1.assumeNonEmpty()).toBe(list3_1);
    expect(list3_2.assumeNonEmpty()).toBe(list3_2);
    expect(list6_1.assumeNonEmpty()).toBe(list6_1);
    expect(list6_2.assumeNonEmpty()).toBe(list6_2);
  });

  it('stream', () => {
    expect(listEmpty.stream()).toBe(Stream.empty());
    expect(list3_1.stream().toArray()).toEqual([1, 2, 3]);
    expect(list3_1.stream({ reversed: true }).toArray()).toEqual([3, 2, 1]);
    expect(list3_2.stream().toArray()).toEqual([1, 2, 3]);
    expect(list3_2.stream({ reversed: true }).toArray()).toEqual([3, 2, 1]);
    expect(list6_1.stream().toArray()).toEqual([1, 2, 3, 4, 5, 6]);
    expect(list6_1.stream({ reversed: true }).toArray()).toEqual([
      6, 5, 4, 3, 2, 1,
    ]);
    expect(list6_2.stream().toArray()).toEqual([1, 2, 3, 4, 5, 6]);
    expect(list6_2.stream({ reversed: true }).toArray()).toEqual([
      6, 5, 4, 3, 2, 1,
    ]);
  });

  it('streamRange', () => {
    expect(listEmpty.streamRange({ amount: 100 })).toBe(Stream.empty());
    expect(list3_1.streamRange({ amount: 100 }).toArray()).toEqual([1, 2, 3]);
    expect(list3_1.streamRange({ start: 1, amount: 2 }).toArray()).toEqual([
      2, 3,
    ]);
    expect(list3_2.streamRange({ amount: 100 }).toArray()).toEqual([1, 2, 3]);
    expect(list3_2.streamRange({ start: 1, amount: 2 }).toArray()).toEqual([
      2, 3,
    ]);

    expect(listEmpty.streamRange({ amount: 100 }, { reversed: true })).toBe(
      Stream.empty()
    );
    expect(
      list3_1.streamRange({ amount: 100 }, { reversed: true }).toArray()
    ).toEqual([3, 2, 1]);
    expect(
      list3_1.streamRange({ start: 1, amount: 2 }, { reversed: true }).toArray()
    ).toEqual([3, 2]);
    expect(
      list3_2.streamRange({ amount: 100 }, { reversed: true }).toArray()
    ).toEqual([3, 2, 1]);
    expect(
      list3_2.streamRange({ start: 1, amount: 2 }, { reversed: true }).toArray()
    ).toEqual([3, 2]);
  });

  it('first', () => {
    expect(listEmpty.first()).toBe(undefined);
    expect(listEmpty.first('a')).toBe('a');
    expect(list3_1.first()).toBe(1);
    expect(list3_2.first()).toBe(1);
    expect(list6_1.first()).toBe(1);
    expect(list6_2.first()).toBe(1);
  });

  it('last', () => {
    expect(listEmpty.last()).toBe(undefined);
    expect(listEmpty.last('a')).toBe('a');
    expect(list3_1.last()).toBe(3);
    expect(list3_2.last()).toBe(3);
    expect(list6_1.last()).toBe(6);
    expect(list6_2.last()).toBe(6);
  });

  it('get', () => {
    expect(listEmpty.get(1)).toBe(undefined);
    expect(listEmpty.get(1, 'a')).toBe('a');

    expect(list3_1.get(1)).toBe(2);
    expect(list3_1.get(1, 'a')).toBe(2);
    expect(list3_1.get(5)).toBe(undefined);
    expect(list3_1.get(5, 'a')).toBe('a');
    expect(list3_1.get(-1)).toBe(3);
    expect(list3_1.get(-5)).toBe(undefined);
    expect(list3_1.get(-5, 'a')).toBe('a');

    expect(list3_2.get(1)).toBe(2);
    expect(list3_2.get(1, 'a')).toBe(2);
    expect(list3_2.get(5)).toBe(undefined);
    expect(list3_2.get(5, 'a')).toBe('a');
    expect(list3_2.get(-1)).toBe(3);
    expect(list3_2.get(-5)).toBe(undefined);
    expect(list3_2.get(-5, 'a')).toBe('a');

    expect(list6_1.get(3)).toBe(4);
    expect(list6_1.get(3, 'a')).toBe(4);
    expect(list6_1.get(-3)).toBe(4);
    expect(list6_2.get(3)).toBe(4);
    expect(list6_2.get(3, 'a')).toBe(4);
    expect(list6_2.get(-3)).toBe(4);
  });

  it('prepend', () => {
    expect(listEmpty.prepend(1).toArray()).toEqual([1]);
    expect(list3_1.prepend(0).toArray()).toEqual([0, 1, 2, 3]);
    expect(list3_2.prepend(0).toArray()).toEqual([0, 1, 2, 3]);
    expect(list6_1.prepend(0).toArray()).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(list6_2.prepend(0).toArray()).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('append', () => {
    expect(listEmpty.append(1).toArray()).toEqual([1]);
    expect(list3_1.append(0).toArray()).toEqual([1, 2, 3, 0]);
    expect(list3_2.append(0).toArray()).toEqual([1, 2, 3, 0]);
    expect(list6_1.append(0).toArray()).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(list6_2.append(0).toArray()).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });

  it('take', () => {
    expect(listEmpty.take(10)).toBe(listEmpty);
    expect(list3_1.take(10)).toBe(list3_1);
    expect(list3_2.take(10)).toBe(list3_2);
    expect(list6_1.take(10)).toBe(list6_1);
    expect(list6_2.take(10)).toBe(list6_2);
    expect(listEmpty.take(0)).toBe(listEmpty);
    expect(list3_1.take(0)).toBe(listEmpty);
    expect(list3_2.take(0)).toBe(listEmpty);
    expect(list6_1.take(0)).toBe(listEmpty);
    expect(list6_2.take(0)).toBe(listEmpty);
    expect(list3_1.take(2).toArray()).toEqual([1, 2]);
    expect(list3_2.take(2).toArray()).toEqual([1, 2]);
    expect(list6_1.take(2).toArray()).toEqual([1, 2]);
    expect(list6_2.take(2).toArray()).toEqual([1, 2]);
    expect(list3_1.take(-2).toArray()).toEqual([2, 3]);
    expect(list3_2.take(-2).toArray()).toEqual([2, 3]);
    expect(list6_1.take(-2).toArray()).toEqual([5, 6]);
    expect(list6_2.take(-2).toArray()).toEqual([5, 6]);
  });

  it('drop', () => {
    expect(listEmpty.drop(0)).toBe(listEmpty);
    expect(list3_1.drop(0)).toBe(list3_1);
    expect(list3_2.drop(0)).toBe(list3_2);
    expect(list6_1.drop(0)).toBe(list6_1);
    expect(list6_2.drop(0)).toBe(list6_2);
    expect(listEmpty.drop(10)).toBe(listEmpty);
    expect(list3_1.drop(10)).toBe(listEmpty);
    expect(list3_2.drop(10)).toBe(listEmpty);
    expect(list6_1.drop(10)).toBe(listEmpty);
    expect(list6_2.drop(10)).toBe(listEmpty);
    expect(list3_1.drop(1).toArray()).toEqual([2, 3]);
    expect(list3_2.drop(1).toArray()).toEqual([2, 3]);
    expect(list6_1.drop(1).toArray()).toEqual([2, 3, 4, 5, 6]);
    expect(list6_2.drop(1).toArray()).toEqual([2, 3, 4, 5, 6]);
    expect(list3_1.drop(-1).toArray()).toEqual([1, 2]);
    expect(list3_2.drop(-1).toArray()).toEqual([1, 2]);
    expect(list6_1.drop(-1).toArray()).toEqual([1, 2, 3, 4, 5]);
    expect(list6_2.drop(-1).toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('slice', () => {
    expect(listEmpty.slice({ amount: 10 })).toBe(listEmpty);
    expect(list3_1.slice({ amount: 10 })).toBe(list3_1);
    expect(list3_2.slice({ amount: 10 })).toBe(list3_2);
    expect(list6_1.slice({ amount: 10 })).toBe(list6_1);
    expect(list6_2.slice({ amount: 10 })).toBe(list6_2);
    expect(listEmpty.slice({ start: 1 })).toBe(listEmpty);
    expect(list3_1.slice({ start: 1 }).toArray()).toEqual([2, 3]);
    expect(list3_2.slice({ start: 1 }).toArray()).toEqual([2, 3]);
    expect(list6_1.slice({ start: 1 }).toArray()).toEqual([2, 3, 4, 5, 6]);
    expect(list6_2.slice({ start: 1 }).toArray()).toEqual([2, 3, 4, 5, 6]);
    expect(list3_1.slice({ start: 1, amount: 1 }).toArray()).toEqual([2]);
    expect(list3_2.slice({ start: 1, amount: 1 }).toArray()).toEqual([2]);
    expect(list6_1.slice({ start: 2, amount: 3 }).toArray()).toEqual([3, 4, 5]);
    expect(list6_2.slice({ start: 2, amount: 3 }).toArray()).toEqual([3, 4, 5]);
    expect(
      list6_1.slice({ start: 2, amount: 3 }, { reversed: true }).toArray()
    ).toEqual([5, 4, 3]);
    expect(
      list6_2.slice({ start: 2, amount: 3 }, { reversed: true }).toArray()
    ).toEqual([5, 4, 3]);
  });

  it('sort', () => {
    //Empty list
    expect(List.empty().sort()).toBe(List.empty());

    //Empty list, using arbitrary Comp
    expect(List.empty().sort(Comp.numberComp())).toBe(List.empty());

    //Strings
    expect(List.from(['C', 'E', 'B', 'A', 'D']).sort().toArray()).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
    ]);

    //Strings, with duplicates
    expect(
      List.from(['A', 'C', 'B', 'A', 'B', 'C', 'A']).sort().toArray()
    ).toEqual(['A', 'A', 'A', 'B', 'B', 'C', 'C']);

    //Default number sorting
    expect(List.from([90, 4, 8, 100, 7, 1, 9]).sort().toArray()).toEqual([
      1, 100, 4, 7, 8, 9, 90,
    ]);

    //Comp-based number sorting
    expect(
      List.from([90, 4, 8, 100, 7, 1, 9]).sort(Comp.numberComp()).toArray()
    ).toEqual([1, 4, 7, 8, 9, 90, 100]);

    //Comp-based number sorting inverse
    expect(
      List.from([90, 4, 8, 100, 7, 1, 9])
        .sort(Comp.numberComp(), {
          inverse: true,
        })
        .toArray()
    ).toEqual([1, 4, 7, 8, 9, 90, 100].toReversed());

    //Duplicate numbers
    expect(
      List.from([90, 4, 7, 90, 8, 100, 7, 1, 9, 7])
        .sort(Comp.numberComp())
        .toArray()
    ).toEqual([1, 4, 7, 7, 7, 8, 9, 90, 90, 100]);

    //Dates, with duplicates
    expect(
      List.from([
        new Date(2000, 10, 10),
        new Date(2000, 3, 3),
        new Date(1986, 3, 29),
        new Date(2000, 3, 3),
        new Date(1998, 5, 13),
      ])
        .sort(Comp.dateComp())
        .toArray()
    ).toEqual([
      new Date(1986, 3, 29),
      new Date(1998, 5, 13),
      new Date(2000, 3, 3),
      new Date(2000, 3, 3),
      new Date(2000, 10, 10),
    ]);
  });

  it('splice', () => {
    expect(listEmpty.splice({ index: 0 })).toBe(listEmpty);
    expect(listEmpty.splice({ index: 0, insert: [] })).toBe(listEmpty);
    expect(listEmpty.splice({ index: 0, remove: 10, insert: [] })).toBe(
      listEmpty
    );
    expect(listEmpty.splice({ index: 0, insert: [1, 2, 3] }).toArray()).toEqual(
      [1, 2, 3]
    );
    expect(list3_1.splice({ index: 1 })).toBe(list3_1);
    expect(list3_1.splice({ index: 1, insert: [] })).toBe(list3_1);
    expect(list3_1.splice({ index: 1, remove: 0 })).toBe(list3_1);
    expect(list3_1.splice({ index: 1, insert: [], remove: 0 })).toBe(list3_1);

    expect(list3_1.splice({ index: 1, remove: 1 }).toArray()).toEqual([1, 3]);
    expect(
      list3_1.splice({ index: 1, remove: 1, insert: [5] }).toArray()
    ).toEqual([1, 5, 3]);
    expect(
      list3_1.splice({ index: -1, remove: 1, insert: [5] }).toArray()
    ).toEqual([1, 2, 5]);

    expect(list3_2.splice({ index: 1 })).toBe(list3_2);
    expect(list3_2.splice({ index: 1, insert: [] })).toBe(list3_2);
    expect(list3_2.splice({ index: 1, remove: 0 })).toBe(list3_2);
    expect(list3_2.splice({ index: 1, insert: [], remove: 0 })).toBe(list3_2);

    expect(list3_2.splice({ index: 1, remove: 1 }).toArray()).toEqual([1, 3]);
    expect(
      list3_2.splice({ index: 1, remove: 1, insert: [5] }).toArray()
    ).toEqual([1, 5, 3]);
    expect(
      list3_2.splice({ index: -1, remove: 1, insert: [5] }).toArray()
    ).toEqual([1, 2, 5]);

    expect(list6_1.splice({ index: 1, remove: 1 }).toArray()).toEqual([
      1, 3, 4, 5, 6,
    ]);
    expect(list6_2.splice({ index: 1, remove: 1 }).toArray()).toEqual([
      1, 3, 4, 5, 6,
    ]);
    expect(
      list6_1.splice({ index: 1, remove: 1, insert: [5] }).toArray()
    ).toEqual([1, 5, 3, 4, 5, 6]);
    expect(
      list6_2.splice({ index: 1, remove: 1, insert: [5] }).toArray()
    ).toEqual([1, 5, 3, 4, 5, 6]);
    expect(
      list6_1.splice({ index: -1, remove: 1, insert: [5] }).toArray()
    ).toEqual([1, 2, 3, 4, 5, 5]);
    expect(
      list6_2.splice({ index: -1, remove: 1, insert: [5] }).toArray()
    ).toEqual([1, 2, 3, 4, 5, 5]);
  });

  it('insert', () => {
    expect(listEmpty.insert(1, [])).toBe(listEmpty);
    expect(list3_1.insert(1, [])).toBe(list3_1);
    expect(list3_2.insert(1, [])).toBe(list3_2);
    expect(list6_1.insert(1, [])).toBe(list6_1);
    expect(list6_2.insert(1, [])).toBe(list6_2);

    expect(listEmpty.insert(1, [9]).toArray()).toEqual([9]);
    expect(list3_1.insert(1, [9]).toArray()).toEqual([1, 9, 2, 3]);
    expect(list3_2.insert(1, [9]).toArray()).toEqual([1, 9, 2, 3]);
    expect(list6_1.insert(1, [9]).toArray()).toEqual([1, 9, 2, 3, 4, 5, 6]);
    expect(list6_2.insert(1, [9]).toArray()).toEqual([1, 9, 2, 3, 4, 5, 6]);

    expect(listEmpty.insert(-1, [9]).toArray()).toEqual([9]);
    expect(list3_1.insert(-1, [9]).toArray()).toEqual([1, 2, 9, 3]);
    expect(list3_2.insert(-1, [9]).toArray()).toEqual([1, 2, 9, 3]);
    expect(list6_1.insert(-1, [9]).toArray()).toEqual([1, 2, 3, 4, 5, 9, 6]);
    expect(list6_2.insert(-1, [9]).toArray()).toEqual([1, 2, 3, 4, 5, 9, 6]);
  });

  it('remove', () => {
    expect(listEmpty.remove(1, { amount: 0 })).toBe(listEmpty);
    expect(list3_1.remove(1, { amount: 0 })).toBe(list3_1);
    expect(list3_2.remove(1, { amount: 0 })).toBe(list3_2);
    expect(list6_1.remove(1, { amount: 0 })).toBe(list6_1);
    expect(list6_2.remove(1, { amount: 0 })).toBe(list6_2);

    expect(listEmpty.remove(1)).toBe(listEmpty);
    expect(list3_1.remove(1).toArray()).toEqual([1, 3]);
    expect(list3_2.remove(1).toArray()).toEqual([1, 3]);
    expect(list6_1.remove(1).toArray()).toEqual([1, 3, 4, 5, 6]);
    expect(list6_2.remove(1).toArray()).toEqual([1, 3, 4, 5, 6]);

    expect(listEmpty.remove(1, { amount: 2 })).toBe(listEmpty);
    expect(list3_1.remove(1, { amount: 2 }).toArray()).toEqual([1]);
    expect(list3_2.remove(1, { amount: 2 }).toArray()).toEqual([1]);
    expect(list6_1.remove(1, { amount: 2 }).toArray()).toEqual([1, 4, 5, 6]);
    expect(list6_2.remove(1, { amount: 2 }).toArray()).toEqual([1, 4, 5, 6]);

    expect(listEmpty.remove(-3, { amount: 2 })).toBe(listEmpty);
    expect(list3_1.remove(-3, { amount: 2 }).toArray()).toEqual([3]);
    expect(list3_2.remove(-3, { amount: 2 }).toArray()).toEqual([3]);
    expect(list6_1.remove(-3, { amount: 2 }).toArray()).toEqual([1, 2, 3, 6]);
    expect(list6_2.remove(-3, { amount: 2 }).toArray()).toEqual([1, 2, 3, 6]);
  });

  it('concat', () => {
    expect(listEmpty.concat(listEmpty)).toBe(listEmpty);
    expect(list3_1.concat(listEmpty)).toBe(list3_1);
    expect(list3_2.concat(listEmpty)).toBe(list3_2);
    expect(list6_1.concat(listEmpty)).toBe(list6_1);
    expect(list6_2.concat(listEmpty)).toBe(list6_2);
    expect(listEmpty.concat(list3_1)).toBe(list3_1);
    expect(listEmpty.concat(list6_2)).toBe(list6_2);
    expect(list3_1.concat(list3_1).toArray()).toEqual([1, 2, 3, 1, 2, 3]);
    expect(list3_2.concat(list3_2).toArray()).toEqual([1, 2, 3, 1, 2, 3]);
    expect(list6_1.concat(list3_1).toArray()).toEqual([
      1, 2, 3, 4, 5, 6, 1, 2, 3,
    ]);
    expect(list6_2.concat(list3_1).toArray()).toEqual([
      1, 2, 3, 4, 5, 6, 1, 2, 3,
    ]);
  });

  it('repeat', () => {
    expect(listEmpty.repeat(0)).toBe(listEmpty);
    expect(list3_1.repeat(0)).toBe(list3_1);
    expect(list3_2.repeat(0)).toBe(list3_2);
    expect(list6_1.repeat(0)).toBe(list6_1);
    expect(list6_2.repeat(0)).toBe(list6_2);

    expect(listEmpty.repeat(1)).toBe(listEmpty);
    expect(list3_1.repeat(1)).toBe(list3_1);
    expect(list3_2.repeat(1)).toBe(list3_2);
    expect(list6_1.repeat(1)).toBe(list6_1);
    expect(list6_2.repeat(1)).toBe(list6_2);

    expect(listEmpty.repeat(-1)).toBe(listEmpty);
    expect(list3_1.repeat(-1).toArray()).toEqual([3, 2, 1]);
    expect(list3_2.repeat(-1).toArray()).toEqual([3, 2, 1]);
    expect(list6_1.repeat(-1).toArray()).toEqual([6, 5, 4, 3, 2, 1]);
    expect(list6_2.repeat(-1).toArray()).toEqual([6, 5, 4, 3, 2, 1]);

    expect(listEmpty.repeat(2)).toBe(listEmpty);
    expect(list3_1.repeat(2).toArray()).toEqual([1, 2, 3, 1, 2, 3]);
    expect(list3_2.repeat(2).toArray()).toEqual([1, 2, 3, 1, 2, 3]);
    expect(list6_2.repeat(2).toArray()).toEqual([
      1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6,
    ]);
    expect(list6_1.repeat(2).toArray()).toEqual([
      1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6,
    ]);

    expect(listEmpty.repeat(-2)).toBe(listEmpty);
    expect(list3_1.repeat(-2).toArray()).toEqual([3, 2, 1, 3, 2, 1]);
    expect(list3_2.repeat(-2).toArray()).toEqual([3, 2, 1, 3, 2, 1]);
    expect(list6_1.repeat(-2).toArray()).toEqual([
      6, 5, 4, 3, 2, 1, 6, 5, 4, 3, 2, 1,
    ]);
    expect(list6_2.repeat(-2).toArray()).toEqual([
      6, 5, 4, 3, 2, 1, 6, 5, 4, 3, 2, 1,
    ]);
  });

  it('rotate', () => {
    expect(listEmpty.rotate(0)).toBe(listEmpty);
    expect(listEmpty.rotate(2)).toBe(listEmpty);
    expect(listEmpty.rotate(-2)).toBe(listEmpty);

    expect(list3_1.rotate(0)).toBe(list3_1);
    expect(list3_2.rotate(0)).toBe(list3_2);
    expect(list6_1.rotate(0)).toBe(list6_1);
    expect(list6_2.rotate(0)).toBe(list6_2);

    expect(list3_1.rotate(2).toArray()).toEqual([2, 3, 1]);
    expect(list3_2.rotate(2).toArray()).toEqual([2, 3, 1]);
    expect(list6_1.rotate(2).toArray()).toEqual([5, 6, 1, 2, 3, 4]);
    expect(list6_2.rotate(2).toArray()).toEqual([5, 6, 1, 2, 3, 4]);

    expect(list3_1.rotate(-2).toArray()).toEqual([3, 1, 2]);
    expect(list3_2.rotate(-2).toArray()).toEqual([3, 1, 2]);
    expect(list6_1.rotate(-2).toArray()).toEqual([3, 4, 5, 6, 1, 2]);
    expect(list6_2.rotate(-2).toArray()).toEqual([3, 4, 5, 6, 1, 2]);
  });

  it('padTo', () => {
    expect(listEmpty.padTo(0, -1)).toBe(listEmpty);
    expect(list3_1.padTo(0, -1)).toBe(list3_1);
    expect(list3_2.padTo(0, -1)).toBe(list3_2);
    expect(list6_1.padTo(0, -1)).toBe(list6_1);
    expect(list6_2.padTo(0, -1)).toBe(list6_2);
    expect(list3_1.padTo(2, -1)).toBe(list3_1);
    expect(list3_2.padTo(2, -1)).toBe(list3_2);
    expect(list6_1.padTo(5, -1)).toBe(list6_1);
    expect(list6_2.padTo(5, -1)).toBe(list6_2);

    expect(listEmpty.padTo(3, -1).toArray()).toEqual([-1, -1, -1]);
    expect(list3_1.padTo(5, -1).toArray()).toEqual([1, 2, 3, -1, -1]);
    expect(list3_2.padTo(5, -1).toArray()).toEqual([1, 2, 3, -1, -1]);
    expect(list6_1.padTo(8, -1).toArray()).toEqual([1, 2, 3, 4, 5, 6, -1, -1]);
    expect(list6_2.padTo(8, -1).toArray()).toEqual([1, 2, 3, 4, 5, 6, -1, -1]);

    expect(
      listEmpty.padTo(3, -1, { positionPercentage: 50 }).toArray()
    ).toEqual([-1, -1, -1]);
    expect(list3_1.padTo(5, -1, { positionPercentage: 50 }).toArray()).toEqual([
      -1, 1, 2, 3, -1,
    ]);
    expect(list3_2.padTo(5, -1, { positionPercentage: 50 }).toArray()).toEqual([
      -1, 1, 2, 3, -1,
    ]);
    expect(list6_1.padTo(8, -1, { positionPercentage: 50 }).toArray()).toEqual([
      -1, 1, 2, 3, 4, 5, 6, -1,
    ]);
    expect(list6_2.padTo(8, -1, { positionPercentage: 50 }).toArray()).toEqual([
      -1, 1, 2, 3, 4, 5, 6, -1,
    ]);

    expect(
      listEmpty.padTo(3, -1, { positionPercentage: 100 }).toArray()
    ).toEqual([-1, -1, -1]);
    expect(list3_1.padTo(5, -1, { positionPercentage: 100 }).toArray()).toEqual(
      [-1, -1, 1, 2, 3]
    );
    expect(list3_2.padTo(5, -1, { positionPercentage: 100 }).toArray()).toEqual(
      [-1, -1, 1, 2, 3]
    );
    expect(list6_1.padTo(8, -1, { positionPercentage: 100 }).toArray()).toEqual(
      [-1, -1, 1, 2, 3, 4, 5, 6]
    );
    expect(list6_2.padTo(8, -1, { positionPercentage: 100 }).toArray()).toEqual(
      [-1, -1, 1, 2, 3, 4, 5, 6]
    );
  });

  it('updateAt', () => {
    expect(listEmpty.updateAt(1, 1)).toBe(listEmpty);
    expect(listEmpty.updateAt(-1, 1)).toBe(listEmpty);
    expect(listEmpty.updateAt(1, (v) => v + 1)).toBe(listEmpty);

    expect(list3_1.updateAt(1, 10).toArray()).toEqual([1, 10, 3]);
    expect(list3_1.updateAt(-1, 10).toArray()).toEqual([1, 2, 10]);
    expect(list3_1.updateAt(-1, (v) => v + 1).toArray()).toEqual([1, 2, 4]);
    expect(list3_1.updateAt(10, 1)).toBe(list3_1);

    expect(list3_2.updateAt(1, 10).toArray()).toEqual([1, 10, 3]);
    expect(list3_2.updateAt(-1, 10).toArray()).toEqual([1, 2, 10]);
    expect(list3_2.updateAt(-1, (v) => v + 1).toArray()).toEqual([1, 2, 4]);
    expect(list3_2.updateAt(10, 1)).toBe(list3_2);

    expect(list6_1.updateAt(1, 10).toArray()).toEqual([1, 10, 3, 4, 5, 6]);
    expect(list6_1.updateAt(-1, 10).toArray()).toEqual([1, 2, 3, 4, 5, 10]);
    expect(list6_1.updateAt(-1, (v) => v + 1).toArray()).toEqual([
      1, 2, 3, 4, 5, 7,
    ]);
    expect(list6_1.updateAt(10, 1)).toBe(list6_1);

    expect(list6_2.updateAt(1, 10).toArray()).toEqual([1, 10, 3, 4, 5, 6]);
    expect(list6_2.updateAt(-1, 10).toArray()).toEqual([1, 2, 3, 4, 5, 10]);
    expect(list6_2.updateAt(-1, (v) => v + 1).toArray()).toEqual([
      1, 2, 3, 4, 5, 7,
    ]);
    expect(list6_2.updateAt(10, 1)).toBe(list6_2);
  });

  it('filter', () => {
    expect(listEmpty.filter(() => true)).toBe(listEmpty);
    expect(list3_1.filter(() => true)).toBe(list3_1);
    expect(list3_2.filter(() => true)).toBe(list3_2);
    expect(list6_1.filter(() => true)).toBe(list6_1);
    expect(list6_2.filter(() => true)).toBe(list6_2);

    const isEven = (value: number) => value % 2 === 0;

    expect(listEmpty.filter(isEven)).toBe(listEmpty);
    expect(list3_1.filter(isEven).toArray()).toEqual([2]);
    expect(list3_2.filter(isEven).toArray()).toEqual([2]);
    expect(list6_1.filter(isEven).toArray()).toEqual([2, 4, 6]);
    expect(list6_2.filter(isEven).toArray()).toEqual([2, 4, 6]);

    expect(listEmpty.filter(isEven, { reversed: true })).toBe(listEmpty);
    expect(list3_1.filter(isEven, { reversed: true }).toArray()).toEqual([2]);
    expect(list3_2.filter(isEven, { reversed: true }).toArray()).toEqual([2]);
    expect(list6_1.filter(isEven, { reversed: true }).toArray()).toEqual([
      6, 4, 2,
    ]);
    expect(list6_2.filter(isEven, { reversed: true }).toArray()).toEqual([
      6, 4, 2,
    ]);

    expect(listEmpty.filter(isEven, { range: { start: 1, amount: 2 } })).toBe(
      listEmpty
    );
    expect(
      list3_1.filter(isEven, { range: { start: 1, amount: 2 } }).toArray()
    ).toEqual([2]);
    expect(
      list3_2.filter(isEven, { range: { start: 1, amount: 2 } }).toArray()
    ).toEqual([2]);
    expect(
      list6_1.filter(isEven, { range: { start: 1, amount: 2 } }).toArray()
    ).toEqual([2]);
    expect(
      list6_2.filter(isEven, { range: { start: 1, amount: 2 } }).toArray()
    ).toEqual([2]);

    const indexLargerThanOne = (_: any, index: number) => index > 1;

    expect(listEmpty.filter(indexLargerThanOne)).toBe(listEmpty);
    expect(list3_1.filter(indexLargerThanOne).toArray()).toEqual([3]);
    expect(list3_2.filter(indexLargerThanOne).toArray()).toEqual([3]);
    expect(list6_1.filter(indexLargerThanOne).toArray()).toEqual([3, 4, 5, 6]);
    expect(list6_2.filter(indexLargerThanOne).toArray()).toEqual([3, 4, 5, 6]);

    const passOnlyFirst = (_: any, __: any, halt: () => void) => {
      halt();
      return true;
    };

    expect(listEmpty.filter(passOnlyFirst)).toBe(listEmpty);
    expect(list3_1.filter(passOnlyFirst).toArray()).toEqual([1]);
    expect(list3_2.filter(passOnlyFirst).toArray()).toEqual([1]);
    expect(list6_1.filter(passOnlyFirst).toArray()).toEqual([1]);
    expect(list6_2.filter(passOnlyFirst).toArray()).toEqual([1]);
  });

  it('filter negate', () => {
    expect(listEmpty.filter(() => false, { negate: true })).toBe(listEmpty);
    expect(list3_1.filter(() => false, { negate: true })).toBe(list3_1);
    expect(list3_2.filter(() => false, { negate: true })).toBe(list3_2);
    expect(list6_1.filter(() => false, { negate: true })).toBe(list6_1);
    expect(list6_2.filter(() => false, { negate: true })).toBe(list6_2);

    const isOdd = (value: number) => value % 2 !== 0;

    expect(listEmpty.filter(isOdd, { negate: true })).toBe(listEmpty);
    expect(list3_1.filter(isOdd, { negate: true }).toArray()).toEqual([2]);
    expect(list3_2.filter(isOdd, { negate: true }).toArray()).toEqual([2]);
    expect(list6_1.filter(isOdd, { negate: true }).toArray()).toEqual([
      2, 4, 6,
    ]);
    expect(list6_2.filter(isOdd, { negate: true }).toArray()).toEqual([
      2, 4, 6,
    ]);

    expect(listEmpty.filter(isOdd, { negate: true, reversed: true })).toBe(
      listEmpty
    );
    expect(
      list3_1.filter(isOdd, { negate: true, reversed: true }).toArray()
    ).toEqual([2]);
    expect(
      list3_2.filter(isOdd, { negate: true, reversed: true }).toArray()
    ).toEqual([2]);
    expect(
      list6_1.filter(isOdd, { negate: true, reversed: true }).toArray()
    ).toEqual([6, 4, 2]);
    expect(
      list6_2.filter(isOdd, { negate: true, reversed: true }).toArray()
    ).toEqual([6, 4, 2]);

    expect(
      listEmpty.filter(isOdd, { negate: true, range: { start: 1, amount: 2 } })
    ).toBe(listEmpty);
    expect(
      list3_1
        .filter(isOdd, { negate: true, range: { start: 1, amount: 2 } })
        .toArray()
    ).toEqual([2]);
    expect(
      list3_2
        .filter(isOdd, { negate: true, range: { start: 1, amount: 2 } })
        .toArray()
    ).toEqual([2]);
    expect(
      list6_1
        .filter(isOdd, { negate: true, range: { start: 1, amount: 2 } })
        .toArray()
    ).toEqual([2]);
    expect(
      list6_2
        .filter(isOdd, { negate: true, range: { start: 1, amount: 2 } })
        .toArray()
    ).toEqual([2]);

    const indexNotLargerThanOne = (_: any, index: number) => index <= 1;

    expect(listEmpty.filter(indexNotLargerThanOne, { negate: true })).toBe(
      listEmpty
    );
    expect(
      list3_1.filter(indexNotLargerThanOne, { negate: true }).toArray()
    ).toEqual([3]);
    expect(
      list3_2.filter(indexNotLargerThanOne, { negate: true }).toArray()
    ).toEqual([3]);
    expect(
      list6_1.filter(indexNotLargerThanOne, { negate: true }).toArray()
    ).toEqual([3, 4, 5, 6]);
    expect(
      list6_2.filter(indexNotLargerThanOne, { negate: true }).toArray()
    ).toEqual([3, 4, 5, 6]);

    const rejectFirst = (_: any, __: any, halt: () => void) => {
      halt();
      return false;
    };

    expect(listEmpty.filter(rejectFirst, { negate: true })).toBe(listEmpty);
    expect(list3_1.filter(rejectFirst, { negate: true }).toArray()).toEqual([
      1,
    ]);
    expect(list3_2.filter(rejectFirst, { negate: true }).toArray()).toEqual([
      1,
    ]);
    expect(list6_1.filter(rejectFirst, { negate: true }).toArray()).toEqual([
      1,
    ]);
    expect(list6_2.filter(rejectFirst, { negate: true }).toArray()).toEqual([
      1,
    ]);
  });

  it('collect', () => {
    const isEven = (value: number, _: any, skip: CollectFun.Skip) =>
      value % 2 === 0 ? value : skip;

    expect(listEmpty.collect(isEven)).toBe(listEmpty);
    expect(list3_1.collect(isEven).toArray()).toEqual([2]);
    expect(list3_2.collect(isEven).toArray()).toEqual([2]);
    expect(list6_1.collect(isEven).toArray()).toEqual([2, 4, 6]);
    expect(list6_2.collect(isEven).toArray()).toEqual([2, 4, 6]);

    expect(listEmpty.collect(isEven, { reversed: true })).toBe(listEmpty);
    expect(list3_1.collect(isEven, { reversed: true }).toArray()).toEqual([2]);
    expect(list3_2.collect(isEven, { reversed: true }).toArray()).toEqual([2]);
    expect(list6_1.collect(isEven, { reversed: true }).toArray()).toEqual([
      6, 4, 2,
    ]);
    expect(list6_2.collect(isEven, { reversed: true }).toArray()).toEqual([
      6, 4, 2,
    ]);

    expect(listEmpty.collect(isEven, { range: { start: 1, amount: 2 } })).toBe(
      listEmpty
    );
    expect(
      list3_1.collect(isEven, { range: { start: 1, amount: 2 } }).toArray()
    ).toEqual([2]);
    expect(
      list3_2.collect(isEven, { range: { start: 1, amount: 2 } }).toArray()
    ).toEqual([2]);
    expect(
      list6_1.collect(isEven, { range: { start: 1, amount: 2 } }).toArray()
    ).toEqual([2]);
    expect(
      list6_2.collect(isEven, { range: { start: 1, amount: 2 } }).toArray()
    ).toEqual([2]);

    const indexLargerThanOne = (
      value: number,
      index: number,
      skip: CollectFun.Skip
    ) => (index > 1 ? value : skip);

    expect(listEmpty.collect(indexLargerThanOne)).toBe(listEmpty);
    expect(list3_1.collect(indexLargerThanOne).toArray()).toEqual([3]);
    expect(list3_2.collect(indexLargerThanOne).toArray()).toEqual([3]);
    expect(list6_1.collect(indexLargerThanOne).toArray()).toEqual([3, 4, 5, 6]);
    expect(list6_2.collect(indexLargerThanOne).toArray()).toEqual([3, 4, 5, 6]);

    const passOnlyFirst = (
      value: number,
      __: any,
      ___: any,
      halt: () => void
    ) => {
      halt();
      return value;
    };

    expect(listEmpty.collect(passOnlyFirst)).toBe(listEmpty);
    expect(list3_1.collect(passOnlyFirst).toArray()).toEqual([1]);
    expect(list3_2.collect(passOnlyFirst).toArray()).toEqual([1]);
    expect(list6_1.collect(passOnlyFirst).toArray()).toEqual([1]);
    expect(list6_2.collect(passOnlyFirst).toArray()).toEqual([1]);
  });

  it('forEach', () => {
    let result = [] as number[];
    listEmpty.forEach((v) => result.push(v));
    expect(result).toEqual([]);
    result = [];
    list3_1.forEach((v, i) => result.push(v + i));
    expect(result).toEqual([1, 3, 5]);

    result = [];
    list3_2.forEach((v, i) => result.push(v + i));
    expect(result).toEqual([1, 3, 5]);

    result = [];
    list6_1.forEach((v, i) => result.push(v + i));
    expect(result).toEqual([1, 3, 5, 7, 9, 11]);

    result = [];
    list6_2.forEach((v, i) => result.push(v + i));
    expect(result).toEqual([1, 3, 5, 7, 9, 11]);

    const onlyFirst = (v: number, i: number, halt: () => void) => {
      halt();
      result.push(v + i);
    };

    result = [];
    listEmpty.forEach(onlyFirst);
    expect(result).toEqual([]);

    result = [];
    list3_1.forEach(onlyFirst);
    expect(result).toEqual([1]);

    result = [];
    list3_2.forEach(onlyFirst);
    expect(result).toEqual([1]);

    result = [];
    list6_1.forEach(onlyFirst);
    expect(result).toEqual([1]);

    result = [];
    list6_2.forEach(onlyFirst);
    expect(result).toEqual([1]);
  });

  it('forEach reversed', () => {
    let result = [] as number[];
    listEmpty.forEach((v) => result.push(v), { reversed: true });
    expect(result).toEqual([]);
    result = [];
    list3_1.forEach((v, i) => result.push(v + i), { reversed: true });
    expect(result).toEqual([3, 3, 3]);

    result = [];
    list3_2.forEach((v, i) => result.push(v + i), { reversed: true });
    expect(result).toEqual([3, 3, 3]);

    result = [];
    list6_1.forEach((v, i) => result.push(v + i), { reversed: true });
    expect(result).toEqual([6, 6, 6, 6, 6, 6]);

    result = [];
    list6_2.forEach((v, i) => result.push(v + i), { reversed: true });
    expect(result).toEqual([6, 6, 6, 6, 6, 6]);

    const onlyFirst = (v: number, i: number, halt: () => void) => {
      halt();
      result.push(v + i);
    };

    result = [];
    listEmpty.forEach(onlyFirst, { reversed: true });
    expect(result).toEqual([]);

    result = [];
    list3_1.forEach(onlyFirst, { reversed: true });
    expect(result).toEqual([3]);

    result = [];
    list3_2.forEach(onlyFirst, { reversed: true });
    expect(result).toEqual([3]);

    result = [];
    list6_1.forEach(onlyFirst, { reversed: true });
    expect(result).toEqual([6]);

    result = [];
    list6_2.forEach(onlyFirst, { reversed: true });
    expect(result).toEqual([6]);
  });

  it('map', () => {
    expect(listEmpty.map((v, i) => v + i)).toBe(listEmpty);
    expect(list3_1.map((v, i) => v + i).toArray()).toEqual([1, 3, 5]);
    expect(list3_2.map((v, i) => v + i).toArray()).toEqual([1, 3, 5]);
    expect(list6_1.map((v, i) => v + i).toArray()).toEqual([1, 3, 5, 7, 9, 11]);
    expect(list6_2.map((v, i) => v + i).toArray()).toEqual([1, 3, 5, 7, 9, 11]);

    expect(listEmpty.map((v, i) => v + i, { reversed: true })).toBe(listEmpty);
    expect(list3_1.map((v, i) => v + i, { reversed: true }).toArray()).toEqual([
      3, 3, 3,
    ]);
    expect(list3_2.map((v, i) => v + i, { reversed: true }).toArray()).toEqual([
      3, 3, 3,
    ]);
    expect(list6_1.map((v, i) => v + i, { reversed: true }).toArray()).toEqual([
      6, 6, 6, 6, 6, 6,
    ]);
    expect(list6_2.map((v, i) => v + i, { reversed: true }).toArray()).toEqual([
      6, 6, 6, 6, 6, 6,
    ]);
  });

  it('flatMap', () => {
    expect(listEmpty.flatMap((v, i) => [0, v + i])).toBe(listEmpty);
    expect(list3_1.flatMap((v, i) => [0, v + i]).toArray()).toEqual([
      0, 1, 0, 3, 0, 5,
    ]);
    expect(list3_2.flatMap((v, i) => [0, v + i]).toArray()).toEqual([
      0, 1, 0, 3, 0, 5,
    ]);
    expect(list6_1.flatMap((v, i) => [0, v + i]).toArray()).toEqual([
      0, 1, 0, 3, 0, 5, 0, 7, 0, 9, 0, 11,
    ]);
    expect(list6_2.flatMap((v, i) => [0, v + i]).toArray()).toEqual([
      0, 1, 0, 3, 0, 5, 0, 7, 0, 9, 0, 11,
    ]);

    expect(listEmpty.flatMap((v, i) => [0, v + i], { reversed: true })).toBe(
      listEmpty
    );
    expect(
      list3_1.flatMap((v, i) => [0, v + i], { reversed: true }).toArray()
    ).toEqual([0, 3, 0, 3, 0, 3]);
    expect(
      list3_2.flatMap((v, i) => [0, v + i], { reversed: true }).toArray()
    ).toEqual([0, 3, 0, 3, 0, 3]);
    expect(
      list6_1.flatMap((v, i) => [0, v + i], { reversed: true }).toArray()
    ).toEqual([0, 6, 0, 6, 0, 6, 0, 6, 0, 6, 0, 6]);
    expect(
      list6_2.flatMap((v, i) => [0, v + i], { reversed: true }).toArray()
    ).toEqual([0, 6, 0, 6, 0, 6, 0, 6, 0, 6, 0, 6]);

    expect(
      list3_1
        .flatMap((v, i) => [0, v + i], { range: { start: 1, amount: 2 } })
        .toArray()
    ).toEqual([0, 2, 0, 4]);
    expect(
      list3_2
        .flatMap((v, i) => [0, v + i], { range: { start: 1, amount: 2 } })
        .toArray()
    ).toEqual([0, 2, 0, 4]);
    expect(
      list6_1
        .flatMap((v, i) => [0, v + i], { range: { start: 1, amount: 2 } })
        .toArray()
    ).toEqual([0, 2, 0, 4]);
    expect(
      list6_2
        .flatMap((v, i) => [0, v + i], { range: { start: 1, amount: 2 } })
        .toArray()
    ).toEqual([0, 2, 0, 4]);

    expect(
      list3_1
        .flatMap((v, i) => [0, v + i], {
          range: { start: 1, amount: 2 },
          reversed: true,
        })
        .toArray()
    ).toEqual([0, 3, 0, 3]);
    expect(
      list3_2
        .flatMap((v, i) => [0, v + i], {
          range: { start: 1, amount: 2 },
          reversed: true,
        })
        .toArray()
    ).toEqual([0, 3, 0, 3]);
    expect(
      list6_1
        .flatMap((v, i) => [0, v + i], {
          range: { start: 1, amount: 2 },
          reversed: true,
        })
        .toArray()
    ).toEqual([0, 3, 0, 3]);
    expect(
      list6_2
        .flatMap((v, i) => [0, v + i], {
          range: { start: 1, amount: 2 },
          reversed: true,
        })
        .toArray()
    ).toEqual([0, 3, 0, 3]);
  });

  it('reversed', () => {
    expect(listEmpty.reversed()).toBe(listEmpty);
    expect(list3_1.reversed().toArray()).toEqual([3, 2, 1]);
    expect(list3_2.reversed().toArray()).toEqual([3, 2, 1]);
    expect(list6_1.reversed().toArray()).toEqual([6, 5, 4, 3, 2, 1]);
    expect(list6_2.reversed().toArray()).toEqual([6, 5, 4, 3, 2, 1]);
  });

  it('toArray', () => {
    expect(listEmpty.toArray()).toEqual([]);
    expect(list3_1.toArray()).toEqual([1, 2, 3]);
    expect(list3_2.toArray()).toEqual([1, 2, 3]);
    expect(list6_1.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
    expect(list6_2.toArray()).toEqual([1, 2, 3, 4, 5, 6]);

    expect(listEmpty.toArray({ range: { start: 1 } })).toEqual([]);
    expect(list3_1.toArray({ range: { start: 1 } })).toEqual([2, 3]);
    expect(list3_2.toArray({ range: { start: 1 } })).toEqual([2, 3]);
    expect(list6_1.toArray({ range: { start: 1 } })).toEqual([2, 3, 4, 5, 6]);
    expect(list6_2.toArray({ range: { start: 1 } })).toEqual([2, 3, 4, 5, 6]);

    expect(listEmpty.toArray({ range: { start: 1 }, reversed: true })).toEqual(
      []
    );
    expect(list3_1.toArray({ range: { start: 1 }, reversed: true })).toEqual([
      3, 2,
    ]);
    expect(list3_2.toArray({ range: { start: 1 }, reversed: true })).toEqual([
      3, 2,
    ]);
    expect(list6_1.toArray({ range: { start: 1 }, reversed: true })).toEqual([
      6, 5, 4, 3, 2,
    ]);
    expect(list6_2.toArray({ range: { start: 1 }, reversed: true })).toEqual([
      6, 5, 4, 3, 2,
    ]);
  });

  it('toBuilder', () => {
    expect(listEmpty.toBuilder().build()).toBe(listEmpty);
    expect(list3_1.toBuilder().build()).toBe(list3_1);
    expect(list3_2.toBuilder().build()).toBe(list3_2);
    expect(list6_1.toBuilder().build()).toBe(list6_1);
    expect(list6_2.toBuilder().build()).toBe(list6_2);

    {
      const b = listEmpty.toBuilder();
      expect(b.isEmpty).toBe(true);
    }
    {
      const b = list3_1.toBuilder();
      expect(b.get(1)).toBe(2);
      expect(b.get(2)).toBe(3);
      expect(b.get(10)).toBe(undefined);
    }
    {
      const b = list3_2.toBuilder();
      expect(b.get(1)).toBe(2);
      expect(b.get(2)).toBe(3);
      expect(b.get(10)).toBe(undefined);
    }
    {
      const b = list6_1.toBuilder();
      expect(b.get(1)).toBe(2);
      expect(b.get(10)).toBe(undefined);
    }
    {
      const b = list6_2.toBuilder();
      expect(b.get(1)).toBe(2);
      expect(b.get(10)).toBe(undefined);
    }
  });

  it('toString', () => {
    expect(listEmpty.toString()).toBe('List()');
    expect(list3_1.toString()).toBe('List(1, 2, 3)');
    expect(list3_2.toString()).toBe('List(1, 2, 3)');
    expect(list6_1.toString()).toBe('List(1, 2, 3, 4, 5, 6)');
    expect(list6_2.toString()).toBe('List(1, 2, 3, 4, 5, 6)');
  });

  it('asNormal', () => {
    expect(list3_1.asNormal()).toBe(list3_1);
    expect(list3_2.asNormal()).toBe(list3_2);
    expect(list6_1.asNormal()).toBe(list6_1);
    expect(list6_2.asNormal()).toBe(list6_2);
  });

  it('unzip', () => {
    {
      const [l1, l2] = List.unzip(List.empty<[number, string]>(), {
        length: 2,
      });

      expect(l1).toBe(List.empty());
      expect(l2).toBe(List.empty());
    }
    {
      const [l1, l2] = List.unzip(
        List.of<[number, string]>([1, 'a'], [2, 'b']),
        { length: 2 }
      );

      expect(l1.toArray()).toEqual([1, 2]);
      expect(l2.toArray()).toEqual(['a', 'b']);
    }
  });

  it('flatten', () => {
    expect(List.flatten(List.of([]))).toBe(List.empty());
    expect(List.flatten(List.of([1, 2], [3, 4, 5])).toArray()).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });
});

describe('List.Builder', () => {
  it('length', () => {
    const b = List.builder<number>();
    expect(b.length).toBe(0);
    b.appendAll([1, 2, 3]);
    expect(b.length).toBe(3);
    b.appendAll([4, 5, 6]);
    expect(b.length).toBe(6);
  });

  it('isEmpty', () => {
    const b = List.builder<number>();
    expect(b.isEmpty).toBe(true);
    b.appendAll([1, 2, 3]);
    expect(b.isEmpty).toBe(false);
  });

  it('get', () => {
    const b = List.builder<number>();
    expect(b.get(1)).toBe(undefined);
    expect(b.get(1, 'a')).toBe('a');
    b.appendAll([1, 2, 3]);
    expect(b.get(1)).toBe(2);
    expect(b.get(1, 'a')).toBe(2);
    expect(b.get(-1)).toBe(3);
    expect(b.get(-1, 'a')).toBe(3);
    expect(b.get(10)).toBe(undefined);
    expect(b.get(10, 'a')).toBe('a');
  });

  it('updateAt', () => {
    const b = List.builder<number>();
    expect(b.updateAt(1, 9)).toBe(undefined);
    expect(b.isEmpty).toBe(true);
    b.appendAll([1, 2, 3]);
    expect(b.updateAt(1, 5)).toBe(2);
    expect(b.get(1)).toBe(5);
    expect(b.updateAt(1, (v) => v + 1)).toBe(5);
    expect(b.get(1)).toBe(6);
    expect(b.get(10)).toBe(undefined);
    expect(b.get(10, 'a')).toBe('a');
  });

  it('set', () => {
    const b = List.builder<number>();
    expect(b.set(1, 9)).toBe(undefined);
    expect(b.isEmpty).toBe(true);
    b.appendAll([1, 2, 3]);
    expect(b.set(1, 5)).toBe(2);
    expect(b.get(1)).toBe(5);
    expect(b.set(1, 5)).toBe(5);
    expect(b.get(10)).toBe(undefined);
    expect(b.get(10, 'a')).toBe('a');
  });

  it('prepend', () => {
    const b = List.builder<number>();
    b.prepend(1);
    expect(b.length).toBe(1);
    expect(b.get(0)).toBe(1);
    b.prepend(2);
    expect(b.length).toBe(2);
    expect(b.get(0)).toBe(2);
    expect(b.get(1)).toBe(1);
  });

  it('append', () => {
    const b = List.builder<number>();
    b.append(1);
    expect(b.length).toBe(1);
    expect(b.get(0)).toBe(1);
    b.append(2);
    expect(b.length).toBe(2);
    expect(b.get(0)).toBe(1);
    expect(b.get(1)).toBe(2);
  });

  it('appendAll', () => {
    const b = List.builder<number>();
    b.appendAll([1, 2, 3]);
    expect(b.build().toArray()).toEqual([1, 2, 3]);
    b.appendAll([4, 5, 6]);
    expect(b.build().toArray()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('insert', () => {
    const b = List.builder<number>();
    b.insert(1, 1);
    expect(b.length).toBe(1);
    expect(b.get(0)).toBe(1);
    b.appendAll([2, 3, 4]);
    b.insert(2, 10);
    expect(b.length).toBe(5);
    expect(b.build().toArray()).toEqual([1, 2, 10, 3, 4]);
    b.insert(-2, 11);
    expect(b.length).toBe(6);
    expect(b.build().toArray()).toEqual([1, 2, 10, 11, 3, 4]);
  });

  it('remove', () => {
    const b = List.builder<number>();
    expect(b.remove(1)).toBe(undefined);
    expect(b.remove(1, 'a')).toBe('a');
    b.appendAll([1, 2, 3, 4, 5]);
    expect(b.remove(10)).toBe(undefined);
    expect(b.remove(10, 'a')).toBe('a');
    expect(b.remove(2)).toBe(3);
    expect(b.remove(2, 'a')).toBe(4);
    expect(b.length).toBe(3);
  });

  it('forEach', () => {
    const l1 = List.empty<number>().toBuilder();
    const l2 = List.of(1, 2, 3).toBuilder();
    const l3 = List.of(1, 2, 3, 4, 5, 6).toBuilder();

    let result = [] as number[];
    l1.forEach((v) => result.push(v));
    expect(result).toEqual([]);
    result = [];
    l2.forEach((v, i) => result.push(v + i));
    expect(result).toEqual([1, 3, 5]);
    result = [];
    l3.forEach((v, i) => result.push(v + i));
    expect(result).toEqual([1, 3, 5, 7, 9, 11]);

    const onlyFirst = (v: number, i: number, halt: () => void) => {
      halt();
      result.push(v + i);
    };

    result = [];
    l1.forEach(onlyFirst);
    expect(result).toEqual([]);
    result = [];
    l2.forEach(onlyFirst);
    expect(result).toEqual([1]);
    result = [];
    l3.forEach(onlyFirst);
    expect(result).toEqual([1]);
  });

  it('operations throw in forEach when modifying collection', () => {
    const b = List.of(1, 2, 3, 4, 5).toBuilder();

    expect(() => b.forEach(() => b.updateAt(1, 2))).toThrow();
    expect(() => b.forEach(() => b.set(1, 2))).toThrow();
    expect(() => b.forEach(() => b.prepend(1))).toThrow();
    expect(() => b.forEach(() => b.append(1))).toThrow();
    expect(() => b.forEach(() => b.appendAll([1, 2]))).toThrow();
    expect(() => b.forEach(() => b.insert(1, 2))).toThrow();
    expect(() => b.forEach(() => b.remove(1))).toThrow();
  });

  it('build', () => {
    const l1 = List.empty<number>().toBuilder();
    const l2 = List.of(1, 2, 3).toBuilder();
    const l3 = List.of(1, 2, 3, 4, 5, 6).toBuilder();

    expect(l1.build()).toBe(List.empty());
    l2.append(10);
    expect(l2.build().toArray()).toEqual([1, 2, 3, 10]);
    l3.append(10);
    expect(l3.build().toArray()).toEqual([1, 2, 3, 4, 5, 6, 10]);
  });

  it('buildMap', () => {
    const l1 = List.empty<number>().toBuilder();
    const l2 = List.of(1, 2, 3).toBuilder();
    const l3 = List.of(1, 2, 3, 4, 5, 6).toBuilder();

    const addOne = (value: number) => value + 1;

    expect(l1.buildMap(addOne)).toBe(List.empty());
    expect(l2.buildMap(addOne).toArray()).toEqual([2, 3, 4]);
    expect(l3.buildMap(addOne).toArray()).toEqual([2, 3, 4, 5, 6, 7]);
  });
});

describe('List inserts', () => {
  /* produced array after 28 iterations is correct:
  [
    1,  3,  5,  7,  9, 11, 13, 15, 17,
   19, 21, 23, 25, 27, 28, 26, 24, 22,
   20, 18, 16, 14, 12, 10,  8,  6,  4,
    2,  0
 ]
 produced array after 29 iterations contains two 28 and one 29
 [
    1,  3,  5,  7,  9, 11, 13, 15, 17,
   19, 21, 23, 25, 27, 28, 29, 28, 26,
   24, 22, 20, 18, 16, 14, 12, 10,  8,
    6,  4,  2,  0
 ]
 */
  it('inserts in the middle', () => {
    const maxInserts = 1000; // test a lot of cases, because this happend only "sometimes", first occurence is 29
    let list = List.empty<number>();
    for (let i = 0; i < maxInserts; i++) {
      const index = list.length / 2; // caution this can produce .5 values
      list = list.insert(index, [i]);

      expect(list.length).toBe(i + 1);
    }
  });
});

/*
Reason for insert bug is take with an non intereg rational number as arugment, test for isolation
*/
describe('List take', () => {
  it('take as much as wanted and no more', () => {
    const list = List.from<number>(Stream.range({ amount: 5 }));

    const mutatedList = list.take(3.5); //.concat([i + 1], list.drop(i));
    expect(mutatedList.length).toBe(3);
  });
});
