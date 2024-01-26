import { Comp, Eq } from '@rimbu/common';

import { Reducer, Stream } from '../src/main/index.mjs';

describe('Reducer', () => {
  it('create', () => {
    const r = Reducer.create<number>(
      () => 5,
      (v, n, i) => v + n + i,
      (v) => v + 1
    );
    expect(r.next(6, 7, 8, () => {})).toBe(6 + 7 + 8);
    expect(r.stateToResult(5)).toBe(6);
  });

  it('createMono', () => {
    const r = Reducer.createMono(
      () => 5,
      (v, n, i) => v + n + i,
      (v) => v + 1
    );
    expect(r.next(6, 7, 8, () => {})).toBe(6 + 7 + 8);
    expect(r.stateToResult(5)).toBe(6);
  });

  it('createOutput', () => {
    const r = Reducer.createOutput<number>(
      () => 5,
      (v, n, i) => v + n + i
    );
    expect(r.next(6, 7, 8, () => {})).toBe(6 + 7 + 8);
    expect(r.stateToResult(5)).toBe(5);
  });

  it('sum', () => {
    const s = Stream.of(1, 2, 3);
    expect(s.reduce(Reducer.sum)).toBe(6);
  });

  it('product', () => {
    const s = Stream.of(1, 2, 3);
    expect(s.reduce(Reducer.product)).toBe(6);
    expect(Stream.of(5, 0, 4).reduce(Reducer.product)).toBe(0);
  });

  it('average', () => {
    const s = Stream.of(1, 2, 3);
    expect(s.reduce(Reducer.average)).toBe(2);
  });

  it('minBy', () => {
    const s = Stream.of('be', 'T', 'Ad', 'Eha');
    expect(
      s.reduce(Reducer.minBy(Comp.stringCaseInsensitiveComp().compare))
    ).toBe('Ad');

    expect(
      Stream.empty<string>().reduce(
        Reducer.minBy(Comp.stringCaseInsensitiveComp().compare, 5)
      )
    ).toBe(5);
  });

  it('min', () => {
    const s = Stream.of(10, 5, 7, 2, 15, 4);
    expect(s.reduce(Reducer.min())).toBe(2);

    expect(Stream.empty<number>().reduce(Reducer.min(5))).toBe(5);
  });

  it('maxBy', () => {
    const s = Stream.of('be', 'T', 'Ad', 'Eha');
    expect(
      s.reduce(Reducer.maxBy(Comp.stringCaseInsensitiveComp().compare))
    ).toBe('T');

    expect(
      Stream.empty<string>().reduce(
        Reducer.maxBy(Comp.stringCaseInsensitiveComp().compare, 5)
      )
    ).toBe(5);
  });

  it('max', () => {
    const s = Stream.of(10, 5, 7, 2, 15, 4);
    expect(s.reduce(Reducer.max())).toBe(15);

    expect(Stream.empty<number>().reduce(Reducer.max(5))).toBe(5);
  });

  it('join', () => {
    expect(Stream.of(1, 2, 3).reduce(Reducer.join())).toBe('123');
    expect(
      Stream.of(1, 2, 3).reduce(
        Reducer.join({ start: '[', sep: ',', end: ']' })
      )
    ).toBe('[1,2,3]');
    expect(
      Stream.of(1, 2, 3).reduce(
        Reducer.join({ valueToString: (v) => `${v}${v}` })
      )
    ).toBe('112233');
  });

  it('count', () => {
    expect(Stream.empty<number>().reduce(Reducer.count())).toBe(0);
    expect(Stream.of(1, 2, 3).reduce(Reducer.count())).toBe(3);
    expect(Stream.of(1, 2, 3).reduce(Reducer.count((v) => v > 2))).toBe(1);
    expect(
      Stream.of(1, 2, 3).reduce(Reducer.count((v) => v > 2, { negate: true }))
    ).toBe(2);
  });

  it('firstWhere', () => {
    const s = Stream.of(1, 2, 3);
    expect(s.reduce(Reducer.firstWhere((v) => v === 2))).toBe(2);
    expect(
      s.reduce(Reducer.firstWhere((v) => v === 2, { otherwise: 'a' }))
    ).toBe(2);
    expect(s.reduce(Reducer.firstWhere((v) => v > 10))).toBe(undefined);
    expect(
      s.reduce(Reducer.firstWhere((v) => v > 10, { otherwise: 'a' }))
    ).toBe('a');
    expect(s.reduce(Reducer.firstWhere((v) => v < 10))).toBe(1);
    expect(
      s.reduce(Reducer.firstWhere((v) => v < 10, { otherwise: 'a' }))
    ).toBe(1);

    expect(s.reduce(Reducer.firstWhere((v) => v === 2, { negate: true }))).toBe(
      1
    );
    expect(
      s.reduce(
        Reducer.firstWhere((v) => v === 2, { negate: true, otherwise: 'a' })
      )
    ).toBe(1);
    expect(s.reduce(Reducer.firstWhere((v) => v < 10, { negate: true }))).toBe(
      undefined
    );
    expect(
      s.reduce(
        Reducer.firstWhere((v) => v < 10, { negate: true, otherwise: 'a' })
      )
    ).toBe('a');
    expect(s.reduce(Reducer.firstWhere((v) => v > 10, { negate: true }))).toBe(
      1
    );
    expect(
      s.reduce(
        Reducer.firstWhere((v) => v > 10, { negate: true, otherwise: 'a' })
      )
    ).toBe(1);
  });

  it('first', () => {
    expect(Stream.empty<number>().reduce(Reducer.first())).toBe(undefined);
    expect(Stream.empty<number>().reduce(Reducer.first('a'))).toBe('a');
    expect(Stream.of(1, 2, 3).reduce(Reducer.first())).toBe(1);
    expect(Stream.of(1, 2, 3).reduce(Reducer.first('a'))).toBe(1);
  });

  it('lastWhere', () => {
    const s = Stream.of(1, 2, 3);
    expect(s.reduce(Reducer.lastWhere((v) => v === 2))).toBe(2);
    expect(
      s.reduce(Reducer.lastWhere((v) => v === 2, { otherwise: 'a' }))
    ).toBe(2);
    expect(s.reduce(Reducer.lastWhere((v) => v > 10))).toBe(undefined);
    expect(s.reduce(Reducer.lastWhere((v) => v > 10, { otherwise: 'a' }))).toBe(
      'a'
    );
    expect(s.reduce(Reducer.lastWhere((v) => v < 10))).toBe(3);
    expect(s.reduce(Reducer.lastWhere((v) => v < 10, { otherwise: 'a' }))).toBe(
      3
    );

    expect(s.reduce(Reducer.lastWhere((v) => v === 2, { negate: true }))).toBe(
      3
    );
    expect(
      s.reduce(
        Reducer.lastWhere((v) => v === 2, { negate: true, otherwise: 'a' })
      )
    ).toBe(3);
    expect(s.reduce(Reducer.lastWhere((v) => v < 10, { negate: true }))).toBe(
      undefined
    );
    expect(
      s.reduce(
        Reducer.lastWhere((v) => v < 10, { negate: true, otherwise: 'a' })
      )
    ).toBe('a');
    expect(s.reduce(Reducer.lastWhere((v) => v > 10, { negate: true }))).toBe(
      3
    );
    expect(
      s.reduce(
        Reducer.lastWhere((v) => v > 10, { negate: true, otherwise: 'a' })
      )
    ).toBe(3);
  });

  it('last', () => {
    expect(Stream.empty<number>().reduce(Reducer.last())).toBe(undefined);
    expect(Stream.empty<number>().reduce(Reducer.last('a'))).toBe('a');
    expect(Stream.of(1, 2, 3).reduce(Reducer.last())).toBe(3);
    expect(Stream.of(1, 2, 3).reduce(Reducer.last('a'))).toBe(3);
  });

  it('some', () => {
    expect(Stream.empty<number>().reduce(Reducer.some((v) => v > 2))).toBe(
      false
    );
    expect(Stream.of(1, 2, 3).reduce(Reducer.some((v) => v > 2))).toBe(true);
    expect(Stream.of(1, 2, 3).reduce(Reducer.some((v) => v > 10))).toBe(false);
  });

  it('every', () => {
    expect(Stream.empty<number>().reduce(Reducer.every((v) => v > 2))).toBe(
      true
    );
    expect(Stream.of(1, 2, 3).reduce(Reducer.every((v) => v > 2))).toBe(false);
    expect(Stream.of(1, 2, 3).reduce(Reducer.every((v) => v > 10))).toBe(false);
    expect(Stream.of(1, 2, 3).reduce(Reducer.every((v) => v > 0))).toBe(true);

    expect(
      Stream.empty<number>().reduce(
        Reducer.every((v) => v <= 2, { negate: true })
      )
    ).toBe(true);
    expect(
      Stream.of(1, 2, 3).reduce(Reducer.every((v) => v <= 2, { negate: true }))
    ).toBe(false);
    expect(
      Stream.of(1, 2, 3).reduce(Reducer.every((v) => v <= 10, { negate: true }))
    ).toBe(false);
    expect(
      Stream.of(1, 2, 3).reduce(Reducer.every((v) => v <= 0, { negate: true }))
    ).toBe(true);
  });

  it('contains', () => {
    expect(Stream.empty<number>().reduce(Reducer.contains(5))).toBe(false);
    expect(Stream.of(1, 2, 3).reduce(Reducer.contains(5))).toBe(false);
    expect(Stream.of(1, 2, 3).reduce(Reducer.contains(2))).toBe(true);
    expect(
      Stream.of(1, 2, 3).reduce(
        Reducer.contains(2, { eq: (v1, v2) => v1 + v2 === v1 })
      )
    ).toBe(false);
    expect(
      Stream.of([1, 2], [2, 3], [3, 4]).reduce(Reducer.contains([2, 1]))
    ).toBe(false);
    expect(
      Stream.of<readonly [number, number]>([1, 2], [2, 3], [3, 4]).reduce(
        Reducer.contains([2, 1], { eq: Eq.tupleSymmetric() })
      )
    ).toBe(true);
    expect(
      Stream.of<readonly [Number, number]>([1, 2], [2, 3], [3, 4]).reduce(
        Reducer.contains([3, 1], { eq: Eq.tupleSymmetric() })
      )
    ).toBe(false);

    expect(
      Stream.of(1, 2, 3).reduce(Reducer.contains(5, { negate: true }))
    ).toBe(true);

    expect(
      Stream.of(5, 5, 3, 5).reduce(Reducer.contains(5, { negate: true }))
    ).toBe(true);

    expect(
      Stream.of(5, 5, 5, 5).reduce(Reducer.contains(5, { negate: true }))
    ).toBe(false);
  });

  it('and', () => {
    expect(Stream.empty<boolean>().reduce(Reducer.and)).toBe(true);
    expect(Stream.of(true, true).reduce(Reducer.and)).toBe(true);
    expect(Stream.of(true, false).reduce(Reducer.and)).toBe(false);
  });

  it('or', () => {
    expect(Stream.empty<boolean>().reduce(Reducer.or)).toBe(false);
    expect(Stream.of(false, false).reduce(Reducer.or)).toBe(false);
    expect(Stream.of(true, false).reduce(Reducer.or)).toBe(true);
  });

  it('isEmpty', () => {
    expect(Stream.empty<number>().reduce(Reducer.isEmpty)).toBe(true);
    expect(Stream.of(1, 2, 3).reduce(Reducer.isEmpty)).toBe(false);
  });

  it('nonEmpty', () => {
    expect(Stream.empty<number>().reduce(Reducer.nonEmpty)).toBe(false);
    expect(Stream.of(1, 2, 3).reduce(Reducer.nonEmpty)).toBe(true);
  });

  it('toArray', () => {
    expect(Stream.empty<number>().reduce(Reducer.toArray())).toEqual([]);
    expect(
      Stream.empty<number>().reduce(Reducer.toArray({ reversed: true }))
    ).toEqual([]);
    expect(Stream.of(1, 2, 3).reduce(Reducer.toArray())).toEqual([1, 2, 3]);
    expect(
      Stream.of(1, 2, 3).reduce(Reducer.toArray({ reversed: true }))
    ).toEqual([3, 2, 1]);
  });

  it('toJSMap', () => {
    const map1 = Stream.empty<[number, string]>().reduce(Reducer.toJSMap());
    expect(map1.size).toBe(0);

    const map2 = Stream.of([1, 'a'], [2, 'b'], [3, 'b'], [3, 'c']).reduce(
      Reducer.toJSMap()
    );
    expect(map2.size).toBe(3);
  });

  it('toJSSet', () => {
    const set1 = Stream.empty<number>().reduce(Reducer.toJSSet());
    expect(set1.size).toBe(0);

    const set2 = Stream.of(1, 2, 3, 3).reduce(Reducer.toJSSet());
    expect(set2.size).toBe(3);
  });

  it('toJSObject', () => {
    const obj1 = Stream.empty<[string, number]>().reduce(Reducer.toJSObject());
    expect(obj1).toEqual({});

    const obj2 = Stream.of(['a', 1], ['b', 2], ['b', 3], ['c', 3]).reduce(
      Reducer.toJSObject()
    );
    expect(obj2).toEqual({
      a: 1,
      b: 3,
      c: 3,
    });
  });

  it('filterInput', () => {
    expect(
      Stream.of(1, 2, 3).reduce(Reducer.count().filterInput((v) => v > 2))
    ).toBe(1);
  });

  it('mapInput', () => {
    expect(
      Stream.of(1, 2, 3).reduce(Reducer.average.mapInput((v) => v * 2))
    ).toBe(4);
  });

  it('flatMapInput', () => {
    expect(
      Stream.of(1, 2, 3).reduce(Reducer.sum.flatMapInput((v) => [v, v]))
    ).toBe(12);
  });

  it('collectInput', () => {
    expect(
      Stream.of(1, 2, 3).reduce(
        Reducer.sum.collectInput((v, _, skip) => (v === 2 ? skip : v * 2))
      )
    ).toBe(8);
  });

  it('mapOutput', () => {
    expect(
      Stream.of(1, 2, 3).reduce(Reducer.average.mapOutput((v) => v * 2))
    ).toBe(4);
  });

  it('takeInput', () => {
    expect(Stream.of(1, 2, 3).reduce(Reducer.sum.takeInput(2))).toBe(3);

    expect(Stream.of(1, 2, 3).reduce(Reducer.sum.takeInput(0))).toBe(0);
  });

  it('dropInput', () => {
    expect(Stream.of(1, 2, 3).reduce(Reducer.sum.dropInput(2))).toBe(3);

    expect(Stream.of(1, 2, 3).reduce(Reducer.sum.dropInput(0))).toBe(6);
  });

  it('sliceInput', () => {
    expect(Stream.of(1, 2, 3).reduce(Reducer.sum.sliceInput(1))).toBe(5);
    expect(Stream.of(1, 2, 3).reduce(Reducer.sum.sliceInput(1, 10))).toBe(5);
    expect(Stream.of(1, 2, 3).reduce(Reducer.sum.sliceInput(1, 1))).toBe(2);
    expect(Stream.of(1, 2, 3).reduce(Reducer.sum.sliceInput(0, 1))).toBe(1);
    expect(Stream.of(1, 2, 3).reduce(Reducer.sum.sliceInput(2))).toBe(3);
    expect(Stream.of(1, 2, 3).reduce(Reducer.sum.sliceInput(2, 2))).toBe(3);
    expect(Stream.of(1, 2, 3).reduce(Reducer.sum.sliceInput(2, 0))).toBe(0);
    expect(Stream.of(1, 2, 3).reduce(Reducer.sum.sliceInput(2, 1))).toBe(3);
  });

  it('pipe', () => {
    const red = Reducer.sum.pipe(Reducer.join({ sep: ', ' }));
    expect(Stream.empty<number>().reduce(red)).toEqual('');
    expect(Stream.of(1).reduce(red)).toEqual('1');
    expect(Stream.of(1, 2, 3).reduce(red)).toEqual('1, 3, 6');
  });

  it('pipe 2', () => {
    const red = Reducer.sum.pipe(Reducer.product, Reducer.join({ sep: ', ' }));
    expect(Stream.empty<number>().reduce(red)).toEqual('');
    expect(Stream.of(1).reduce(red)).toEqual('1');
    expect(Stream.of(1, 2, 3).reduce(red)).toEqual('1, 3, 18');
    expect(Stream.of(0, 1, 2).reduce(red)).toEqual('0');
  });

  it('chain', () => {
    {
      const red = Reducer.toArray<number>()
        .takeInput(2)
        .chain(Reducer.toArray<number>().takeInput(2));

      expect(Stream.of(1, 2, 3, 4, 5).reduce(red)).toEqual([3, 4]);
    }

    {
      const red = Reducer.sum
        .takeInput(2)
        .chain((v) => Reducer.product.mapOutput((o) => o + v));

      expect(Stream.of(1, 2, 3, 4).reduce(red)).toEqual(15);
    }
  });
});

describe('Reducers', () => {
  it('Reducer.and', () => {
    expect(Stream.empty().reduce(Reducer.and)).toBe(true);
    expect(Stream.of(true).reduce(Reducer.and)).toBe(true);
    expect(Stream.of(true, true).reduce(Reducer.and)).toBe(true);
    expect(Stream.of(false).reduce(Reducer.and)).toBe(false);
    expect(Stream.of(false, false).reduce(Reducer.and)).toBe(false);
    expect(Stream.of(false, true).reduce(Reducer.and)).toBe(false);
    expect(Stream.of(true, false).reduce(Reducer.and)).toBe(false);

    expect(
      Stream.of(true, true, false, true).reduceStream(Reducer.and).toArray()
    ).toEqual([true, true, false]);
  });

  it('Reducer.average', () => {
    expect(Stream.empty().reduce(Reducer.average)).toBe(0);
    expect(Stream.of(0, 0, 0).reduceStream(Reducer.average).toArray()).toEqual([
      0, 0, 0,
    ]);
    expect(Stream.of(0, 2, 4).reduceStream(Reducer.average).toArray()).toEqual([
      0, 1, 2,
    ]);
  });

  it('Reducer.combine array', () => {
    const r = Reducer.combine([
      Reducer.sum,
      Reducer.average,
      Reducer.toArray<number>(),
    ]);

    expect(Stream.empty().reduce(r)).toEqual([0, 0, []]);
    expect(Stream.of(0, 0, 0).reduceStream(r).toArray()).toEqual([
      [0, 0, [0]],
      [0, 0, [0, 0]],
      [0, 0, [0, 0, 0]],
    ]);
    expect(Stream.of(0, 2, 4).reduceStream(r).toArray()).toEqual([
      [0, 0, [0]],
      [2, 1, [0, 2]],
      [6, 2, [0, 2, 4]],
    ]);
  });

  it('Reducer.combine array with halt', () => {
    const r = Reducer.combine([Reducer.sum, Reducer.product]);

    expect(Stream.empty().reduce(r)).toEqual([0, 1]);
    expect(Stream.of(0, 0, 0).reduceStream(r).toArray()).toEqual([
      [0, 0],
      [0, 0],
      [0, 0],
    ]);
    expect(Stream.of(0, 2, 4).reduceStream(r).toArray()).toEqual([
      [0, 0],
      [2, 0],
      [6, 0],
    ]);
  });

  it('Reducer.combine array with stateToResult', () => {
    const r = Reducer.combine([
      Reducer.sum.mapOutput((v) => v + 1),
      Reducer.product,
    ]);

    expect(Stream.empty().reduce(r)).toEqual([1, 1]);
    expect(Stream.of(0, 0, 0).reduceStream(r).toArray()).toEqual([
      [1, 0],
      [1, 0],
      [1, 0],
    ]);
    expect(Stream.of(0, 2, 4).reduceStream(r).toArray()).toEqual([
      [1, 0],
      [3, 0],
      [7, 0],
    ]);
  });

  it('Reducer.combine object', () => {
    const r = Reducer.combine({
      sum: Reducer.sum,
      avg: Reducer.average,
      arr: Reducer.toArray<number>(),
    });

    expect(Stream.empty().reduce(r)).toEqual({ sum: 0, avg: 0, arr: [] });
    expect(Stream.of(0, 0, 0).reduceStream(r).toArray()).toEqual([
      { sum: 0, avg: 0, arr: [0] },
      { sum: 0, avg: 0, arr: [0, 0] },
      { sum: 0, avg: 0, arr: [0, 0, 0] },
    ]);
    expect(Stream.of(0, 2, 4).reduceStream(r).toArray()).toEqual([
      { sum: 0, avg: 0, arr: [0] },
      { sum: 2, avg: 1, arr: [0, 2] },
      { sum: 6, avg: 2, arr: [0, 2, 4] },
    ]);
  });

  it('Reducer.combine object with halt', () => {
    const r = Reducer.combine({ sum: Reducer.sum, prod: Reducer.product });

    expect(Stream.empty().reduce(r)).toEqual({ sum: 0, prod: 1 });
    expect(Stream.of(0, 0, 0).reduceStream(r).toArray()).toEqual([
      { sum: 0, prod: 0 },
      { sum: 0, prod: 0 },
      { sum: 0, prod: 0 },
    ]);
    expect(Stream.of(0, 2, 4).reduceStream(r).toArray()).toEqual([
      { sum: 0, prod: 0 },
      { sum: 2, prod: 0 },
      { sum: 6, prod: 0 },
    ]);
  });

  it('Reducer.combine object with stateToResult', () => {
    const r = Reducer.combine({
      sum: Reducer.sum.mapOutput((v) => v + 1),
      prod: Reducer.product,
    });

    expect(Stream.empty().reduce(r)).toEqual({ sum: 1, prod: 1 });
    expect(Stream.of(0, 0, 0).reduceStream(r).toArray()).toEqual([
      { sum: 1, prod: 0 },
      { sum: 1, prod: 0 },
      { sum: 1, prod: 0 },
    ]);
    expect(Stream.of(0, 2, 4).reduceStream(r).toArray()).toEqual([
      { sum: 1, prod: 0 },
      { sum: 3, prod: 0 },
      { sum: 7, prod: 0 },
    ]);
  });

  it('Reducer.combine shapes', () => {
    const r1 = Reducer.combine({
      sum: Reducer.sum,
      prod: Reducer.product,
    });
    const r2 = Reducer.combine([Reducer.sum, Reducer.product]);
    const r3 = Reducer.combine(Reducer.sum);
    const r4 = Reducer.combine({
      a: Reducer.sum,
      b: { c: { d: [Reducer.product] } },
    });

    const s = Stream.range({ start: 1, amount: 5 });
    expect(s.reduce(r1)).toEqual({ sum: 15, prod: 120 });
    expect(s.reduce(r2)).toEqual([15, 120]);
    expect(s.reduce(r3)).toEqual(15);
    expect(s.reduce(r4)).toEqual({ a: 15, b: { c: { d: [120] } } });
  });

  it('Reducer.contains', () => {
    expect(Stream.empty().reduce(Reducer.contains(6))).toBe(false);
    expect(Stream.of(1, 2, 3).reduce(Reducer.contains(6))).toBe(false);
    expect(Stream.of(1, 6, 3).reduce(Reducer.contains(6))).toBe(true);
    expect(
      Stream.of(1, 6, 2, 3, 8).reduceStream(Reducer.contains(6)).toArray()
    ).toEqual([false, true]);
  });

  it('Reducer.every', () => {
    const r = Reducer.every((v: number) => v > 5);
    expect(Stream.empty().reduce(r)).toBe(true);
    expect(Stream.of(1, 2, 3).reduce(r)).toBe(false);
    expect(Stream.of(7, 8, 9).reduce(r)).toBe(true);
    expect(Stream.of(9, 7, 5, 8).reduceStream(r).toArray()).toEqual([
      true,
      true,
      false,
    ]);
  });

  it('Reducer.first', () => {
    expect(Stream.empty().reduce(Reducer.first())).toBeUndefined();
    expect(Stream.empty().reduce(Reducer.first(5))).toBe(5);
    expect(Stream.of(1, 2, 3).reduce(Reducer.first())).toBe(1);
    expect(Stream.of(1, 2, 3).reduce(Reducer.first(5))).toBe(1);
    expect(Stream.of(1, 2, 3).reduceStream(Reducer.first()).toArray()).toEqual([
      1,
    ]);
  });

  it('Reducer.firstWhere', () => {
    const r1 = Reducer.firstWhere((v: number) => v >= 5);
    const r2 = Reducer.firstWhere((v: number) => v >= 5, { otherwise: -5 });

    expect(Stream.empty().reduce(r1)).toBeUndefined();
    expect(Stream.empty().reduce(r2)).toBe(-5);
    expect(Stream.of(1, 10, 2, 11, 3).reduce(r1)).toBe(10);
    expect(Stream.of(1, 10, 2, 11, 3).reduce(r2)).toBe(10);
    expect(Stream.of(1, 10, 2, 11, 3).reduceStream(r1).toArray()).toEqual([
      undefined,
      10,
    ]);
    expect(Stream.of(1, 10, 2, 11, 3).reduceStream(r2).toArray()).toEqual([
      -5, 10,
    ]);
  });

  it('Reducer.isEmpty', () => {
    expect(Stream.empty().reduce(Reducer.isEmpty)).toBe(true);
    expect(Stream.of(1, 2, 3).reduce(Reducer.isEmpty)).toBe(false);

    expect(Stream.of(1, 2, 3).reduceStream(Reducer.isEmpty).toArray()).toEqual([
      false,
    ]);
  });

  it('Reducer.last', () => {
    expect(Stream.empty().reduce(Reducer.last())).toBeUndefined();
    expect(Stream.empty().reduce(Reducer.last(5))).toBe(5);
    expect(Stream.of(1, 2, 3).reduce(Reducer.last())).toBe(3);
    expect(Stream.of(1, 2, 3).reduce(Reducer.last(5))).toBe(3);
    expect(Stream.of(1, 2, 3).reduceStream(Reducer.last()).toArray()).toEqual([
      1, 2, 3,
    ]);
  });

  it('Reducer.lastWhere', () => {
    const r1 = Reducer.lastWhere((v: number) => v >= 5);
    const r2 = Reducer.lastWhere((v: number) => v >= 5, { otherwise: -5 });

    expect(Stream.empty().reduce(r1)).toBeUndefined();
    expect(Stream.empty().reduce(r2)).toBe(-5);
    expect(Stream.of(1, 10, 2, 11, 3).reduce(r1)).toBe(11);
    expect(Stream.of(1, 10, 2, 11, 3).reduce(r2)).toBe(11);
    expect(Stream.of(1, 10, 2, 11, 3).reduceStream(r1).toArray()).toEqual([
      undefined,
      10,
      10,
      11,
      11,
    ]);
    expect(Stream.of(1, 10, 2, 11, 3).reduceStream(r2).toArray()).toEqual([
      -5, 10, 10, 11, 11,
    ]);
  });

  it('Reducer.max', () => {
    expect(Stream.empty().reduce(Reducer.max())).toBeUndefined();
    expect(Stream.empty().reduce(Reducer.max(-5))).toBe(-5);
    expect(Stream.of(2, 10, 1, 11, 3).reduce(Reducer.max())).toBe(11);
    expect(Stream.of(1, 10, 1, 11, 3).reduce(Reducer.max(-5))).toBe(11);

    expect(
      Stream.of(1, 10, 1, 11, 3).reduceStream(Reducer.max()).toArray()
    ).toEqual([1, 10, 10, 11, 11]);
  });

  it('Reducer.maxBy', () => {
    const maxLen1 = Reducer.maxBy<string>((v1, v2) => v1.length - v2.length);
    const maxLen2 = Reducer.maxBy<string, string>(
      (v1, v2) => v1.length - v2.length,
      'z'
    );

    expect(Stream.empty().reduce(maxLen1)).toBeUndefined();
    expect(Stream.empty().reduce(maxLen2)).toBe('z');

    expect(Stream.of('b', 'abc', 'ef').reduce(maxLen1)).toBe('abc');
    expect(Stream.of('b', 'abc', 'ef').reduce(maxLen2)).toBe('abc');

    expect(Stream.of('b', 'abc', 'ef').reduceStream(maxLen1).toArray()).toEqual(
      ['b', 'abc', 'abc']
    );

    expect(Stream.of('b', 'abc', 'ef').reduceStream(maxLen2).toArray()).toEqual(
      ['b', 'abc', 'abc']
    );
  });

  it('Reducer.min', () => {
    expect(Stream.empty().reduce(Reducer.min())).toBeUndefined();
    expect(Stream.empty().reduce(Reducer.min(-5))).toBe(-5);
    expect(Stream.of(2, 10, 1, 11, 3).reduce(Reducer.min())).toBe(1);
    expect(Stream.of(2, 10, 1, 11, 3).reduce(Reducer.min(-5))).toBe(1);

    expect(
      Stream.of(2, 10, 1, 11, 3).reduceStream(Reducer.min()).toArray()
    ).toEqual([2, 2, 1, 1, 1]);
  });

  it('Reducer.minBy', () => {
    const maxLen1 = Reducer.minBy<string>((v1, v2) => v1.length - v2.length);
    const maxLen2 = Reducer.minBy<string, string>(
      (v1, v2) => v1.length - v2.length,
      'z'
    );

    expect(Stream.empty().reduce(maxLen1)).toBeUndefined();
    expect(Stream.empty().reduce(maxLen2)).toBe('z');

    expect(Stream.of('b', 'abc', '', 'ef').reduce(maxLen1)).toBe('');
    expect(Stream.of('b', 'abc', '', 'ef').reduce(maxLen2)).toBe('');

    expect(
      Stream.of('b', 'abc', '', 'ef').reduceStream(maxLen1).toArray()
    ).toEqual(['b', 'b', '', '']);

    expect(
      Stream.of('b', 'abc', '', 'ef').reduceStream(maxLen2).toArray()
    ).toEqual(['b', 'b', '', '']);
  });

  it('Reducer.nonEmpty', () => {
    expect(Stream.empty().reduce(Reducer.nonEmpty)).toBe(false);
    expect(Stream.of(1, 2, 3).reduce(Reducer.nonEmpty)).toBe(true);

    expect(Stream.of(1, 2, 3).reduceStream(Reducer.nonEmpty).toArray()).toEqual(
      [true]
    );
  });

  it('Reducer.or', () => {
    expect(Stream.empty().reduce(Reducer.or)).toBe(false);
    expect(Stream.of(true).reduce(Reducer.or)).toBe(true);
    expect(Stream.of(true, true).reduce(Reducer.or)).toBe(true);
    expect(Stream.of(false).reduce(Reducer.or)).toBe(false);
    expect(Stream.of(false, false).reduce(Reducer.or)).toBe(false);
    expect(Stream.of(false, true).reduce(Reducer.or)).toBe(true);
    expect(Stream.of(true, false).reduce(Reducer.or)).toBe(true);

    expect(
      Stream.of(false, false, true, false).reduceStream(Reducer.or).toArray()
    ).toEqual([false, false, true]);
  });

  it('Reducer.product', () => {
    expect(Stream.empty().reduce(Reducer.product)).toBe(1);
    expect(Stream.of(1, 2, 3).reduce(Reducer.product)).toBe(6);
    expect(Stream.of(1, 0, 3).reduce(Reducer.product)).toBe(0);

    expect(
      Stream.of(1, 2, 3, 0, 4).reduceStream(Reducer.product).toArray()
    ).toEqual([1, 2, 6, 0]);
  });

  it('Reducer.some', () => {
    {
      const r = Reducer.some((v: number) => v > 5);
      expect(Stream.empty().reduce(r)).toBe(false);
      expect(Stream.of(1, 2, 3).reduce(r)).toBe(false);
      expect(Stream.of(1, 8, 3).reduce(r)).toBe(true);
      expect(Stream.of(1, 2, 7, 3).reduceStream(r).toArray()).toEqual([
        false,
        false,
        true,
      ]);
    }

    {
      const r = Reducer.some((v: number) => v <= 5, { negate: true });
      expect(Stream.empty().reduce(r)).toBe(false);
      expect(Stream.of(1, 2, 3).reduce(r)).toBe(false);
      expect(Stream.of(1, 8, 3).reduce(r)).toBe(true);
      expect(Stream.of(1, 2, 7, 3).reduceStream(r).toArray()).toEqual([
        false,
        false,
        true,
      ]);
    }
  });

  it('Reducer.sum', () => {
    expect(Stream.empty().reduce(Reducer.sum)).toBe(0);
    expect(Stream.of(1, 2, 3).reduce(Reducer.sum)).toBe(6);
    expect(Stream.of(1, 0, 3).reduce(Reducer.sum)).toBe(4);

    expect(
      Stream.of(1, 2, 3, 0, 4).reduceStream(Reducer.sum).toArray()
    ).toEqual([1, 3, 6, 6, 10]);
  });

  it('Reducer.toArray', () => {
    expect(Stream.empty().reduce(Reducer.toArray())).toEqual([]);
    expect(Stream.of(1, 2, 3).reduce(Reducer.toArray())).toEqual([1, 2, 3]);

    expect(
      Stream.of(1, 2, 3).reduceStream(Reducer.toArray()).toArray()
    ).toEqual([[1], [1, 2], [1, 2, 3]]);
  });

  it('Reducer.toJSMap', () => {
    expect(Stream.empty().reduce(Reducer.toJSMap())).toEqual(new Map());
    expect(Stream.of([1, 'a'], [2, 'b']).reduce(Reducer.toJSMap())).toEqual(
      new Map([
        [1, 'a'],
        [2, 'b'],
      ])
    );

    expect(
      Stream.of([1, 'a'], [2, 'b']).reduceStream(Reducer.toJSMap()).toArray()
    ).toEqual([
      new Map([[1, 'a']]),
      new Map([
        [1, 'a'],
        [2, 'b'],
      ]),
    ]);
  });

  it('Reducer.toJSSet', () => {
    expect(Stream.empty().reduce(Reducer.toJSSet())).toEqual(new Set());
    expect(Stream.of(1, 2, 3).reduce(Reducer.toJSSet())).toEqual(
      new Set([1, 2, 3])
    );

    expect(
      Stream.of(1, 2, 3).reduceStream(Reducer.toJSSet()).toArray()
    ).toEqual([new Set([1]), new Set([1, 2]), new Set([1, 2, 3])]);
  });
});
