import { Comp, Eq } from '@rimbu/common';

import { AsyncReducer, AsyncStream } from '../src/main/index.mjs';

describe('AsyncReducer', () => {
  const FB = 'a';
  const fallback = async () => FB;

  it('create', async () => {
    const r = AsyncReducer.create<number, number>(
      async () => 5,
      async (v, n, i) => v + n + i,
      async (v) => v + 1
    );
    expect(await r.next(6, 7, 8, () => {})).toBe(6 + 7 + 8);
    expect(await r.stateToResult(5)).toBe(6);
  });

  it('createMono', async () => {
    const r = AsyncReducer.createMono(
      async () => 5,
      async (v, n, i) => v + n + i,
      async (v) => v + 1
    );
    expect(await r.next(6, 7, 8, () => {})).toBe(6 + 7 + 8);
    expect(await r.stateToResult(5)).toBe(6);
  });

  it('createOutput', async () => {
    const r = AsyncReducer.createOutput<number>(
      async () => 5,
      async (v, n, i) => v + n + i
    );
    expect(await r.next(6, 7, 8, () => {})).toBe(6 + 7 + 8);
    expect(await r.stateToResult(5)).toBe(5);
  });

  it('sum', async () => {
    const s = AsyncStream.of(1, 2, 3);
    expect(await s.reduce(AsyncReducer.sum)).toBe(6);
  });

  it('product', async () => {
    const s = AsyncStream.of(1, 2, 3);
    expect(await s.reduce(AsyncReducer.product)).toBe(6);
    expect(await AsyncStream.of(5, 0, 4).reduce(AsyncReducer.product)).toBe(0);
  });

  it('average', async () => {
    const s = AsyncStream.of(1, 2, 3);
    expect(await s.reduce(AsyncReducer.average)).toBe(2);
  });

  it('minBy', async () => {
    const s = AsyncStream.of('be', 'T', 'Ad', 'Eha');
    expect(
      await s.reduce(
        AsyncReducer.minBy(async (v1, v2) =>
          Comp.stringCaseInsensitiveComp().compare(v1, v2)
        )
      )
    ).toBe('Ad');

    expect(
      await AsyncStream.empty<string>().reduce(
        AsyncReducer.minBy(
          async (v1, v2) => Comp.stringCaseInsensitiveComp().compare(v1, v2),
          fallback
        )
      )
    ).toBe(FB);
  });

  it('min', async () => {
    const s = AsyncStream.of(10, 5, 7, 2, 15, 4);
    expect(await s.reduce(AsyncReducer.min())).toBe(2);

    expect(
      await AsyncStream.empty<number>().reduce(AsyncReducer.min(fallback))
    ).toBe(FB);
  });

  it('maxBy', async () => {
    const s = AsyncStream.of('be', 'T', 'Ad', 'Eha');
    expect(
      await s.reduce(
        AsyncReducer.maxBy(async (v1, v2) =>
          Comp.stringCaseInsensitiveComp().compare(v1, v2)
        )
      )
    ).toBe('T');

    expect(
      await AsyncStream.empty<string>().reduce(
        AsyncReducer.maxBy(
          async (v1, v2) => Comp.stringCaseInsensitiveComp().compare(v1, v2),
          fallback
        )
      )
    ).toBe(FB);
  });

  it('max', async () => {
    const s = AsyncStream.of(10, 5, 7, 2, 15, 4);
    expect(await s.reduce(AsyncReducer.max())).toBe(15);

    expect(
      await AsyncStream.empty<number>().reduce(AsyncReducer.max(fallback))
    ).toBe(FB);
  });

  it('join', async () => {
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.join())).toBe(
      '123'
    );
    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        AsyncReducer.join({ start: '[', sep: ',', end: ']' })
      )
    ).toBe('[1,2,3]');
    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        AsyncReducer.join({ valueToString: (v) => `${v}${v}` })
      )
    ).toBe('112233');
  });

  it('count', async () => {
    expect(await AsyncStream.empty<number>().reduce(AsyncReducer.count())).toBe(
      0
    );
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.count())).toBe(3);
    expect(
      await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.count((v) => v > 2))
    ).toBe(1);
  });

  it('firstWhere', async () => {
    const s = AsyncStream.of(1, 2, 3);
    expect(await s.reduce(AsyncReducer.firstWhere(async (v) => v === 2))).toBe(
      2
    );
    expect(
      await s.reduce(
        AsyncReducer.firstWhere(async (v) => v === 2, { otherwise: fallback })
      )
    ).toBe(2);
    expect(await s.reduce(AsyncReducer.firstWhere(async (v) => v > 10))).toBe(
      undefined
    );
    expect(
      await s.reduce(
        AsyncReducer.firstWhere(async (v) => v > 10, { otherwise: fallback })
      )
    ).toBe(FB);
    expect(await s.reduce(AsyncReducer.firstWhere(async (v) => v < 10))).toBe(
      1
    );
    expect(
      await s.reduce(
        AsyncReducer.firstWhere(async (v) => v < 10, { otherwise: fallback })
      )
    ).toBe(1);

    expect(
      await s.reduce(
        AsyncReducer.firstWhere(async (v) => v !== 2, { negate: true })
      )
    ).toBe(2);
    expect(
      await s.reduce(
        AsyncReducer.firstWhere(async (v) => v !== 2, {
          negate: true,
          otherwise: fallback,
        })
      )
    ).toBe(2);
    expect(
      await s.reduce(
        AsyncReducer.firstWhere(async (v) => v <= 10, { negate: true })
      )
    ).toBe(undefined);
    expect(
      await s.reduce(
        AsyncReducer.firstWhere(async (v) => v <= 10, {
          negate: true,
          otherwise: fallback,
        })
      )
    ).toBe(FB);
    expect(
      await s.reduce(
        AsyncReducer.firstWhere(async (v) => v > 10, { negate: true })
      )
    ).toBe(1);
    expect(
      await s.reduce(
        AsyncReducer.firstWhere(async (v) => v >= 10, {
          negate: true,
          otherwise: fallback,
        })
      )
    ).toBe(1);
  });

  it('first', async () => {
    expect(await AsyncStream.empty<number>().reduce(AsyncReducer.first())).toBe(
      undefined
    );
    expect(
      await AsyncStream.empty<number>().reduce(AsyncReducer.first(fallback))
    ).toBe(FB);
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.first())).toBe(1);
    expect(
      await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.first(fallback))
    ).toBe(1);
  });

  it('lastWhere', async () => {
    const s = AsyncStream.of(1, 2, 3);
    expect(await s.reduce(AsyncReducer.lastWhere(async (v) => v === 2))).toBe(
      2
    );
    expect(
      await s.reduce(
        AsyncReducer.lastWhere(async (v) => v === 2, { otherwise: fallback })
      )
    ).toBe(2);
    expect(await s.reduce(AsyncReducer.lastWhere(async (v) => v > 10))).toBe(
      undefined
    );
    expect(
      await s.reduce(
        AsyncReducer.lastWhere(async (v) => v > 10, { otherwise: fallback })
      )
    ).toBe(FB);
    expect(await s.reduce(AsyncReducer.lastWhere(async (v) => v < 10))).toBe(3);
    expect(
      await s.reduce(
        AsyncReducer.lastWhere(async (v) => v < 10, { otherwise: fallback })
      )
    ).toBe(3);

    expect(
      await s.reduce(
        AsyncReducer.lastWhere(async (v) => v !== 2, { negate: true })
      )
    ).toBe(2);
    expect(
      await s.reduce(
        AsyncReducer.lastWhere(async (v) => v !== 2, {
          negate: true,
          otherwise: fallback,
        })
      )
    ).toBe(2);
    expect(
      await s.reduce(
        AsyncReducer.lastWhere(async (v) => v <= 10, { negate: true })
      )
    ).toBe(undefined);
    expect(
      await s.reduce(
        AsyncReducer.lastWhere(async (v) => v <= 10, {
          negate: true,
          otherwise: fallback,
        })
      )
    ).toBe(FB);
    expect(
      await s.reduce(
        AsyncReducer.lastWhere(async (v) => v >= 10, { negate: true })
      )
    ).toBe(3);
    expect(
      await s.reduce(
        AsyncReducer.lastWhere(async (v) => v >= 10, {
          negate: true,
          otherwise: fallback,
        })
      )
    ).toBe(3);
  });

  it('last', async () => {
    expect(await AsyncStream.empty<number>().reduce(AsyncReducer.last())).toBe(
      undefined
    );
    expect(
      await AsyncStream.empty<number>().reduce(AsyncReducer.last(fallback))
    ).toBe(FB);
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.last())).toBe(3);
    expect(
      await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.last(fallback))
    ).toBe(3);
  });

  it('some', async () => {
    expect(
      await AsyncStream.empty<number>().reduce(
        AsyncReducer.some(async (v) => v > 2)
      )
    ).toBe(false);
    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        AsyncReducer.some(async (v) => v > 2)
      )
    ).toBe(true);
    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        AsyncReducer.some(async (v) => v > 10)
      )
    ).toBe(false);

    expect(
      await AsyncStream.empty<number>().reduce(
        AsyncReducer.some(async (v) => v <= 2, { negate: true })
      )
    ).toBe(false);
    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        AsyncReducer.some(async (v) => v <= 2, { negate: true })
      )
    ).toBe(true);
    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        AsyncReducer.some(async (v) => v <= 10, { negate: true })
      )
    ).toBe(false);
  });

  it('every', async () => {
    expect(
      await AsyncStream.empty<number>().reduce(
        AsyncReducer.every(async (v) => v > 2)
      )
    ).toBe(true);
    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        AsyncReducer.every(async (v) => v > 2)
      )
    ).toBe(false);
    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        AsyncReducer.every(async (v) => v > 10)
      )
    ).toBe(false);
    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        AsyncReducer.every(async (v) => v > 0)
      )
    ).toBe(true);

    expect(
      await AsyncStream.empty<number>().reduce(
        AsyncReducer.every(async (v) => v <= 2, { negate: true })
      )
    ).toBe(true);
    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        AsyncReducer.every(async (v) => v <= 2, { negate: true })
      )
    ).toBe(false);
    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        AsyncReducer.every(async (v) => v <= 10, { negate: true })
      )
    ).toBe(false);
    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        AsyncReducer.every(async (v) => v <= 0, { negate: true })
      )
    ).toBe(true);
  });

  it('contains', async () => {
    expect(
      await AsyncStream.empty<number>().reduce(AsyncReducer.contains(5))
    ).toBe(false);
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.contains(5))).toBe(
      false
    );
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.contains(2))).toBe(
      true
    );
    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        AsyncReducer.contains(2, { eq: (v1, v2) => v1 + v2 === v1 })
      )
    ).toBe(false);
    expect(
      await AsyncStream.of([1, 2], [2, 3], [3, 4]).reduce(
        AsyncReducer.contains([2, 1])
      )
    ).toBe(false);
    expect(
      await AsyncStream.of<readonly [number, number]>(
        [1, 2],
        [2, 3],
        [3, 4]
      ).reduce(AsyncReducer.contains([2, 1], { eq: Eq.tupleSymmetric() }))
    ).toBe(true);
    expect(
      await AsyncStream.of<readonly [Number, number]>(
        [1, 2],
        [2, 3],
        [3, 4]
      ).reduce(AsyncReducer.contains([3, 1], { eq: Eq.tupleSymmetric() }))
    ).toBe(false);

    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        AsyncReducer.contains(5, { negate: true })
      )
    ).toBe(true);

    expect(
      await AsyncStream.of(5, 5, 3, 5).reduce(
        AsyncReducer.contains(5, { negate: true })
      )
    ).toBe(true);

    expect(
      await AsyncStream.of(5, 5, 5, 5).reduce(
        AsyncReducer.contains(5, { negate: true })
      )
    ).toBe(false);
  });

  it('and', async () => {
    expect(await AsyncStream.empty<boolean>().reduce(AsyncReducer.and)).toBe(
      true
    );
    expect(await AsyncStream.of(true, true).reduce(AsyncReducer.and)).toBe(
      true
    );
    expect(await AsyncStream.of(true, false).reduce(AsyncReducer.and)).toBe(
      false
    );
  });

  it('or', async () => {
    expect(await AsyncStream.empty<boolean>().reduce(AsyncReducer.or)).toBe(
      false
    );
    expect(await AsyncStream.of(false, false).reduce(AsyncReducer.or)).toBe(
      false
    );
    expect(await AsyncStream.of(true, false).reduce(AsyncReducer.or)).toBe(
      true
    );
  });

  it('isEmpty', async () => {
    expect(await AsyncStream.empty<number>().reduce(AsyncReducer.isEmpty)).toBe(
      true
    );
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.isEmpty)).toBe(
      false
    );
  });

  it('nonEmpty', async () => {
    expect(
      await AsyncStream.empty<number>().reduce(AsyncReducer.nonEmpty)
    ).toBe(false);
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.nonEmpty)).toBe(
      true
    );
  });

  it('toArray', async () => {
    expect(
      await AsyncStream.empty<number>().reduce(AsyncReducer.toArray())
    ).toEqual([]);
    expect(
      await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.toArray())
    ).toEqual([1, 2, 3]);
  });

  it('toJSMap', async () => {
    const map1 = await AsyncStream.empty<[number, string]>().reduce(
      AsyncReducer.toJSMap()
    );
    expect(map1.size).toBe(0);

    const map2 = await AsyncStream.of(
      [1, 'a'],
      [2, 'b'],
      [3, 'b'],
      [3, 'c']
    ).reduce(AsyncReducer.toJSMap());
    expect(map2.size).toBe(3);
  });

  it('toJSSet', async () => {
    const set1 = await AsyncStream.empty<number>().reduce(
      AsyncReducer.toJSSet()
    );
    expect(set1.size).toBe(0);

    const set2 = await AsyncStream.of(1, 2, 3, 3).reduce(
      AsyncReducer.toJSSet()
    );
    expect(set2.size).toBe(3);
  });

  it('toJSObject', async () => {
    const obj1 = await AsyncStream.empty<[string, number]>().reduce(
      AsyncReducer.toJSObject()
    );
    expect(obj1).toEqual({});

    const obj2 = await AsyncStream.of(
      ['a', 1],
      ['b', 2],
      ['b', 3],
      ['c', 3]
    ).reduce(AsyncReducer.toJSObject());
    expect(obj2).toEqual({
      a: 1,
      b: 3,
      c: 3,
    });
  });

  it('filterInput', async () => {
    const close = vi.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2,
      close
    ).filterInput((v) => v > 1);

    expect(await AsyncStream.of(1, 2, 3).reduce(sumDouble)).toBe(10);
    expect(close).toBeCalledTimes(1);
  });

  it('filterInput throw', async () => {
    const close = vi.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => {
        throw Error('');
      },
      async (s) => s * 2,
      close
    ).filterInput((v) => v > 1);

    await expect(() =>
      AsyncStream.of(1, 2, 3).reduce(sumDouble)
    ).rejects.toThrow();

    expect(close).toBeCalledTimes(1);
  });

  it('mapInput', async () => {
    const close = vi.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2,
      close
    ).mapInput((v: string) => Number.parseInt(v));

    expect(await AsyncStream.of('1', '2', '3').reduce(sumDouble)).toBe(12);
    expect(close).toBeCalledTimes(1);
  });

  it('collectInput', async () => {
    const close = vi.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2,
      close
    ).collectInput((v: string, _, skip, halt) => {
      const value = Number.parseInt(v);
      if (value === 1) return skip;
      if (value === 3) {
        halt();
        return skip;
      }
      return value;
    });

    expect(await AsyncStream.of('1', '2', '3').reduce(sumDouble)).toBe(4);
    expect(close).toBeCalledTimes(1);
  });

  it('mapOutput', async () => {
    const close = vi.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2,
      close
    ).mapOutput((v) => v / 2);

    expect(await AsyncStream.of(1, 2, 3).reduce(sumDouble)).toBe(6);
    expect(close).toBeCalledTimes(1);
  });

  it('takeInput', async () => {
    const close = vi.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2,
      close
    ).takeInput(2);

    expect(await AsyncStream.of(1, 2, 4).reduce(sumDouble)).toBe(6);
    expect(close).toBeCalledTimes(1);
  });

  it('dropInput', async () => {
    const close = vi.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2,
      close
    ).dropInput(1);

    expect(await AsyncStream.of(1, 2, 3).reduce(sumDouble)).toBe(10);
    expect(close).toBeCalledTimes(1);
  });

  it('sliceInput', async () => {
    const close = vi.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2,
      close
    ).sliceInput(1, 1);

    expect(await AsyncStream.of(1, 2, 3).reduce(sumDouble)).toBe(4);
    expect(close).toBeCalledTimes(1);
  });

  it('pipe', async () => {
    const red = AsyncReducer.sum.pipe(AsyncReducer.join({ sep: ', ' }));
    expect(await AsyncStream.empty<number>().reduce(red)).toEqual('');
    expect(await AsyncStream.of(1).reduce(red)).toEqual('1');
    // expect(await AsyncStream.of(1, 2, 3).reduce(red)).toEqual('1, 3, 6');
  });

  it('pipe 2', async () => {
    const red = AsyncReducer.sum.pipe(
      AsyncReducer.product,
      AsyncReducer.join({ sep: ', ' })
    );
    expect(await AsyncStream.empty<number>().reduce(red)).toEqual('');
    expect(await AsyncStream.of(1).reduce(red)).toEqual('1');
    expect(await AsyncStream.of(1, 2, 3).reduce(red)).toEqual('1, 3, 18');
    expect(await AsyncStream.of(0, 1, 2).reduce(red)).toEqual('0');
  });

  it('chain', async () => {
    {
      const red = AsyncReducer.toArray<number>()
        .takeInput(2)
        .chain(AsyncReducer.toArray<number>().takeInput(2));

      expect(await AsyncStream.of(1, 2, 3, 4, 5).reduce(red)).toEqual([3, 4]);
    }

    {
      const red = AsyncReducer.sum
        .takeInput(2)
        .chain((v) => AsyncReducer.product.mapOutput((o) => o + v));

      expect(await AsyncStream.of(1, 2, 3, 4).reduce(red)).toEqual(15);
    }
  });
});

describe('AsyncReducers', () => {
  it('AsyncReducer.and', async () => {
    expect(await AsyncStream.empty().reduce(AsyncReducer.and)).toBe(true);
    expect(await AsyncStream.of(true).reduce(AsyncReducer.and)).toBe(true);
    expect(await AsyncStream.of(true, true).reduce(AsyncReducer.and)).toBe(
      true
    );
    expect(await AsyncStream.of(false).reduce(AsyncReducer.and)).toBe(false);
    expect(await AsyncStream.of(false, false).reduce(AsyncReducer.and)).toBe(
      false
    );
    expect(await AsyncStream.of(false, true).reduce(AsyncReducer.and)).toBe(
      false
    );
    expect(await AsyncStream.of(true, false).reduce(AsyncReducer.and)).toBe(
      false
    );

    expect(
      await AsyncStream.of(true, true, false, true)
        .reduceStream(AsyncReducer.and)
        .toArray()
    ).toEqual([true, true, false]);
  });

  it('AsyncReducer.average', async () => {
    expect(await AsyncStream.empty().reduce(AsyncReducer.average)).toBe(0);
    expect(
      await AsyncStream.of(0, 0, 0).reduceStream(AsyncReducer.average).toArray()
    ).toEqual([0, 0, 0]);
    expect(
      await AsyncStream.of(0, 2, 4).reduceStream(AsyncReducer.average).toArray()
    ).toEqual([0, 1, 2]);
  });

  it('AsyncReducer.combineArr', async () => {
    const r = AsyncReducer.combine([AsyncReducer.sum, AsyncReducer.average]);

    expect(await AsyncStream.empty().reduce(r)).toEqual([0, 0]);
    expect(await AsyncStream.of(0, 0, 0).reduceStream(r).toArray()).toEqual([
      [0, 0],
      [0, 0],
      [0, 0],
    ]);
    expect(await AsyncStream.of(0, 2, 4).reduceStream(r).toArray()).toEqual([
      [0, 0],
      [2, 1],
      [6, 2],
    ]);
  });

  it('AsyncReducer.combineArr with halt', async () => {
    const r = AsyncReducer.combine([AsyncReducer.sum, AsyncReducer.product]);

    expect(await AsyncStream.empty().reduce(r)).toEqual([0, 1]);
    expect(await AsyncStream.of(0, 0, 0).reduceStream(r).toArray()).toEqual([
      [0, 0],
      [0, 0],
      [0, 0],
    ]);
    expect(await AsyncStream.of(0, 2, 4).reduceStream(r).toArray()).toEqual([
      [0, 0],
      [2, 0],
      [6, 0],
    ]);
  });

  it('AsyncReducer.combineArr with stateToResult', async () => {
    const r = AsyncReducer.combine([
      AsyncReducer.sum.mapOutput(async (v) => v + 1),
      AsyncReducer.product,
    ]);

    expect(await AsyncStream.empty().reduce(r)).toEqual([1, 1]);
    expect(await AsyncStream.of(0, 0, 0).reduceStream(r).toArray()).toEqual([
      [1, 0],
      [1, 0],
      [1, 0],
    ]);
    expect(await AsyncStream.of(0, 2, 4).reduceStream(r).toArray()).toEqual([
      [1, 0],
      [3, 0],
      [7, 0],
    ]);
  });

  it('AsyncReducer.combineObj', async () => {
    const r = AsyncReducer.combine({
      sum: AsyncReducer.sum,
      avg: AsyncReducer.average,
    });

    expect(await AsyncStream.empty().reduce(r)).toEqual({ sum: 0, avg: 0 });
    expect(await AsyncStream.of(0, 0, 0).reduceStream(r).toArray()).toEqual([
      { sum: 0, avg: 0 },
      { sum: 0, avg: 0 },
      { sum: 0, avg: 0 },
    ]);
    expect(await AsyncStream.of(0, 2, 4).reduceStream(r).toArray()).toEqual([
      { sum: 0, avg: 0 },
      { sum: 2, avg: 1 },
      { sum: 6, avg: 2 },
    ]);
  });

  it('AsyncReducer.combineObj with halt', async () => {
    const r = AsyncReducer.combine({
      sum: AsyncReducer.sum,
      prod: AsyncReducer.product,
    });

    expect(await AsyncStream.empty().reduce(r)).toEqual({ sum: 0, prod: 1 });
    expect(await AsyncStream.of(0, 0, 0).reduceStream(r).toArray()).toEqual([
      { sum: 0, prod: 0 },
      { sum: 0, prod: 0 },
      { sum: 0, prod: 0 },
    ]);
    expect(await AsyncStream.of(0, 2, 4).reduceStream(r).toArray()).toEqual([
      { sum: 0, prod: 0 },
      { sum: 2, prod: 0 },
      { sum: 6, prod: 0 },
    ]);
  });

  it('AsyncReducer.combineObj with stateToResult', async () => {
    const r = AsyncReducer.combine({
      sum: AsyncReducer.sum.mapOutput(async (v) => v + 1),
      prod: AsyncReducer.product,
    });

    expect(await AsyncStream.empty().reduce(r)).toEqual({ sum: 1, prod: 1 });
    expect(await AsyncStream.of(0, 0, 0).reduceStream(r).toArray()).toEqual([
      { sum: 1, prod: 0 },
      { sum: 1, prod: 0 },
      { sum: 1, prod: 0 },
    ]);
    expect(await AsyncStream.of(0, 2, 4).reduceStream(r).toArray()).toEqual([
      { sum: 1, prod: 0 },
      { sum: 3, prod: 0 },
      { sum: 7, prod: 0 },
    ]);
  });

  it('AsyncReducer.contains', async () => {
    expect(await AsyncStream.empty().reduce(AsyncReducer.contains(6))).toBe(
      false
    );
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.contains(6))).toBe(
      false
    );
    expect(await AsyncStream.of(1, 6, 3).reduce(AsyncReducer.contains(6))).toBe(
      true
    );
    expect(
      await AsyncStream.of(1, 6, 2, 3, 8)
        .reduceStream(AsyncReducer.contains(6))
        .toArray()
    ).toEqual([false, true]);
  });

  it('AsyncReducer.every', async () => {
    const r = AsyncReducer.every(async (v: number) => v > 5);
    expect(await AsyncStream.empty().reduce(r)).toBe(true);
    expect(await AsyncStream.of(1, 2, 3).reduce(r)).toBe(false);
    expect(await AsyncStream.of(7, 8, 9).reduce(r)).toBe(true);
    expect(await AsyncStream.of(9, 7, 5, 8).reduceStream(r).toArray()).toEqual([
      true,
      true,
      false,
    ]);
  });

  it('AsyncReducer.first', async () => {
    expect(
      await AsyncStream.empty().reduce(AsyncReducer.first())
    ).toBeUndefined();
    expect(await AsyncStream.empty().reduce(AsyncReducer.first(5))).toBe(5);
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.first())).toBe(1);
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.first(5))).toBe(1);
    expect(
      await AsyncStream.of(1, 2, 3).reduceStream(AsyncReducer.first()).toArray()
    ).toEqual([1]);
  });

  it('AsyncReducer.firstWhere', async () => {
    const r1 = AsyncReducer.firstWhere(async (v: number) => v >= 5);
    const r2 = AsyncReducer.firstWhere(async (v: number) => v >= 5, {
      otherwise: -5,
    });

    expect(await AsyncStream.empty().reduce(r1)).toBeUndefined();
    expect(await AsyncStream.empty().reduce(r2)).toBe(-5);
    expect(await AsyncStream.of(1, 10, 2, 11, 3).reduce(r1)).toBe(10);
    expect(await AsyncStream.of(1, 10, 2, 11, 3).reduce(r2)).toBe(10);
    expect(
      await AsyncStream.of(1, 10, 2, 11, 3).reduceStream(r1).toArray()
    ).toEqual([undefined, 10]);
    expect(
      await AsyncStream.of(1, 10, 2, 11, 3).reduceStream(r2).toArray()
    ).toEqual([-5, 10]);
  });

  it('AsyncReducer.isEmpty', async () => {
    expect(await AsyncStream.empty().reduce(AsyncReducer.isEmpty)).toBe(true);
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.isEmpty)).toBe(
      false
    );

    expect(
      await AsyncStream.of(1, 2, 3).reduceStream(AsyncReducer.isEmpty).toArray()
    ).toEqual([false]);
  });

  it('AsyncReducer.last', async () => {
    expect(
      await AsyncStream.empty().reduce(AsyncReducer.last())
    ).toBeUndefined();
    expect(await AsyncStream.empty().reduce(AsyncReducer.last(5))).toBe(5);
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.last())).toBe(3);
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.last(5))).toBe(3);
    expect(
      await AsyncStream.of(1, 2, 3).reduceStream(AsyncReducer.last()).toArray()
    ).toEqual([1, 2, 3]);
  });

  it('AsyncReducer.lastWhere', async () => {
    const r1 = AsyncReducer.lastWhere(async (v: number) => v >= 5);
    const r2 = AsyncReducer.lastWhere(async (v: number) => v >= 5, {
      otherwise: -5,
    });

    expect(await AsyncStream.empty().reduce(r1)).toBeUndefined();
    expect(await AsyncStream.empty().reduce(r2)).toBe(-5);
    expect(await AsyncStream.of(1, 10, 2, 11, 3).reduce(r1)).toBe(11);
    expect(await AsyncStream.of(1, 10, 2, 11, 3).reduce(r2)).toBe(11);
    expect(
      await AsyncStream.of(1, 10, 2, 11, 3).reduceStream(r1).toArray()
    ).toEqual([undefined, 10, 10, 11, 11]);
    expect(
      await AsyncStream.of(1, 10, 2, 11, 3).reduceStream(r2).toArray()
    ).toEqual([-5, 10, 10, 11, 11]);
  });

  it('AsyncReducer.max', async () => {
    expect(
      await AsyncStream.empty().reduce(AsyncReducer.max())
    ).toBeUndefined();
    expect(await AsyncStream.empty().reduce(AsyncReducer.max(-5))).toBe(-5);
    expect(
      await AsyncStream.of(2, 10, 1, 11, 3).reduce(AsyncReducer.max())
    ).toBe(11);
    expect(
      await AsyncStream.of(1, 10, 1, 11, 3).reduce(AsyncReducer.max(-5))
    ).toBe(11);

    expect(
      await AsyncStream.of(1, 10, 1, 11, 3)
        .reduceStream(AsyncReducer.max())
        .toArray()
    ).toEqual([1, 10, 10, 11, 11]);
  });

  it('AsyncReducer.maxBy', async () => {
    const maxLen1 = AsyncReducer.maxBy<string>(
      async (v1, v2) => v1.length - v2.length
    );
    const maxLen2 = AsyncReducer.maxBy<string, string>(
      async (v1, v2) => v1.length - v2.length,
      'z'
    );

    expect(await AsyncStream.empty().reduce(maxLen1)).toBeUndefined();
    expect(await AsyncStream.empty().reduce(maxLen2)).toBe('z');

    expect(await AsyncStream.of('b', 'abc', 'ef').reduce(maxLen1)).toBe('abc');
    expect(await AsyncStream.of('b', 'abc', 'ef').reduce(maxLen2)).toBe('abc');

    expect(
      await AsyncStream.of('b', 'abc', 'ef').reduceStream(maxLen1).toArray()
    ).toEqual(['b', 'abc', 'abc']);

    expect(
      await AsyncStream.of('b', 'abc', 'ef').reduceStream(maxLen2).toArray()
    ).toEqual(['b', 'abc', 'abc']);
  });

  it('AsyncReducer.min', async () => {
    expect(
      await AsyncStream.empty().reduce(AsyncReducer.min())
    ).toBeUndefined();
    expect(await AsyncStream.empty().reduce(AsyncReducer.min(-5))).toBe(-5);
    expect(
      await AsyncStream.of(2, 10, 1, 11, 3).reduce(AsyncReducer.min())
    ).toBe(1);
    expect(
      await AsyncStream.of(2, 10, 1, 11, 3).reduce(AsyncReducer.min(-5))
    ).toBe(1);

    expect(
      await AsyncStream.of(2, 10, 1, 11, 3)
        .reduceStream(AsyncReducer.min())
        .toArray()
    ).toEqual([2, 2, 1, 1, 1]);
  });

  it('AsyncReducer.minBy', async () => {
    const maxLen1 = AsyncReducer.minBy<string>(
      async (v1, v2) => v1.length - v2.length
    );
    const maxLen2 = AsyncReducer.minBy<string, string>(
      async (v1, v2) => v1.length - v2.length,
      'z'
    );

    expect(await AsyncStream.empty().reduce(maxLen1)).toBeUndefined();
    expect(await AsyncStream.empty().reduce(maxLen2)).toBe('z');

    expect(await AsyncStream.of('b', 'abc', '', 'ef').reduce(maxLen1)).toBe('');
    expect(await AsyncStream.of('b', 'abc', '', 'ef').reduce(maxLen2)).toBe('');

    expect(
      await AsyncStream.of('b', 'abc', '', 'ef').reduceStream(maxLen1).toArray()
    ).toEqual(['b', 'b', '', '']);

    expect(
      await AsyncStream.of('b', 'abc', '', 'ef').reduceStream(maxLen2).toArray()
    ).toEqual(['b', 'b', '', '']);
  });

  it('AsyncReducer.nonEmpty', async () => {
    expect(await AsyncStream.empty().reduce(AsyncReducer.nonEmpty)).toBe(false);
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.nonEmpty)).toBe(
      true
    );

    expect(
      await AsyncStream.of(1, 2, 3)
        .reduceStream(AsyncReducer.nonEmpty)
        .toArray()
    ).toEqual([true]);
  });

  it('AsyncReducer.or', async () => {
    expect(await AsyncStream.empty().reduce(AsyncReducer.or)).toBe(false);
    expect(await AsyncStream.of(true).reduce(AsyncReducer.or)).toBe(true);
    expect(await AsyncStream.of(true, true).reduce(AsyncReducer.or)).toBe(true);
    expect(await AsyncStream.of(false).reduce(AsyncReducer.or)).toBe(false);
    expect(await AsyncStream.of(false, false).reduce(AsyncReducer.or)).toBe(
      false
    );
    expect(await AsyncStream.of(false, true).reduce(AsyncReducer.or)).toBe(
      true
    );
    expect(await AsyncStream.of(true, false).reduce(AsyncReducer.or)).toBe(
      true
    );

    expect(
      await AsyncStream.of(false, false, true, false)
        .reduceStream(AsyncReducer.or)
        .toArray()
    ).toEqual([false, false, true]);
  });

  it('AsyncReducer.product', async () => {
    expect(await AsyncStream.empty().reduce(AsyncReducer.product)).toBe(1);
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.product)).toBe(6);
    expect(await AsyncStream.of(1, 0, 3).reduce(AsyncReducer.product)).toBe(0);

    expect(
      await AsyncStream.of(1, 2, 3, 0, 4)
        .reduceStream(AsyncReducer.product)
        .toArray()
    ).toEqual([1, 2, 6, 0]);
  });

  it('AsyncReducer.some', async () => {
    const r = AsyncReducer.some(async (v: number) => v > 5);
    expect(await AsyncStream.empty().reduce(r)).toBe(false);
    expect(await AsyncStream.of(1, 2, 3).reduce(r)).toBe(false);
    expect(await AsyncStream.of(1, 8, 3).reduce(r)).toBe(true);
    expect(await AsyncStream.of(1, 2, 7, 3).reduceStream(r).toArray()).toEqual([
      false,
      false,
      true,
    ]);
  });

  it('AsyncReducer.sum', async () => {
    expect(await AsyncStream.empty().reduce(AsyncReducer.sum)).toBe(0);
    expect(await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.sum)).toBe(6);
    expect(await AsyncStream.of(1, 0, 3).reduce(AsyncReducer.sum)).toBe(4);

    expect(
      await AsyncStream.of(1, 2, 3, 0, 4)
        .reduceStream(AsyncReducer.sum)
        .toArray()
    ).toEqual([1, 3, 6, 6, 10]);
  });

  it('AsyncReducer.toArray', async () => {
    expect(await AsyncStream.empty().reduce(AsyncReducer.toArray())).toEqual(
      []
    );
    expect(
      await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.toArray())
    ).toEqual([1, 2, 3]);

    expect(
      await AsyncStream.of(1, 2, 3)
        .reduceStream(AsyncReducer.toArray())
        .toArray()
    ).toEqual([[1], [1, 2], [1, 2, 3]]);
  });

  it('AsyncReducer.toJSMap', async () => {
    expect(await AsyncStream.empty().reduce(AsyncReducer.toJSMap())).toEqual(
      new Map()
    );
    expect(
      await AsyncStream.of([1, 'a'], [2, 'b']).reduce(AsyncReducer.toJSMap())
    ).toEqual(
      new Map([
        [1, 'a'],
        [2, 'b'],
      ])
    );

    expect(
      await AsyncStream.of([1, 'a'], [2, 'b'])
        .reduceStream(AsyncReducer.toJSMap())
        .toArray()
    ).toEqual([
      new Map([[1, 'a']]),
      new Map([
        [1, 'a'],
        [2, 'b'],
      ]),
    ]);
  });

  it('AsyncReducer.toJSSet', async () => {
    expect(await AsyncStream.empty().reduce(AsyncReducer.toJSSet())).toEqual(
      new Set()
    );
    expect(
      await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.toJSSet())
    ).toEqual(new Set([1, 2, 3]));

    expect(
      await AsyncStream.of(1, 2, 3)
        .reduceStream(AsyncReducer.toJSSet())
        .toArray()
    ).toEqual([new Set([1]), new Set([1, 2]), new Set([1, 2, 3])]);
  });
});
