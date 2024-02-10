import { Comp, Eq } from '@rimbu/common';

import { AsyncReducer, AsyncStream, Reducer } from '../src/main/index.mjs';

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
    expect(await r.stateToResult(5, 0, false)).toBe(6);
  });

  it('createMono', async () => {
    const r = AsyncReducer.createMono(
      async () => 5,
      async (v, n, i) => v + n + i,
      async (v) => v + 1
    );
    expect(await r.next(6, 7, 8, () => {})).toBe(6 + 7 + 8);
    expect(await r.stateToResult(5, 0, false)).toBe(6);
  });

  it('createOutput', async () => {
    const r = AsyncReducer.createOutput<number>(
      async () => 5,
      async (v, n, i) => v + n + i
    );
    expect(await r.next(6, 7, 8, () => {})).toBe(6 + 7 + 8);
    expect(await r.stateToResult(5, 0, false)).toBe(5);
  });

  it('sum', async () => {
    const s = AsyncStream.of(1, 2, 3);
    expect(await s.reduce(AsyncReducer.from(Reducer.sum))).toBe(6);
  });

  it('product', async () => {
    const s = AsyncStream.of(1, 2, 3);
    expect(await s.reduce(AsyncReducer.from(Reducer.product))).toBe(6);
    expect(
      await AsyncStream.of(5, 0, 4).reduce(AsyncReducer.from(Reducer.product))
    ).toBe(0);
  });

  it('average', async () => {
    const s = AsyncStream.of(1, 2, 3);
    expect(await s.reduce(AsyncReducer.from(Reducer.average))).toBe(2);
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
    expect(await AsyncStream.of(1, 2, 3).reduce(Reducer.join<number>())).toBe(
      '123'
    );
    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        Reducer.join<number>({ start: '[', sep: ',', end: ']' })
      )
    ).toBe('[1,2,3]');
    expect(
      await AsyncStream.of(1, 2, 3).reduce(
        Reducer.join<number>({ valueToString: (v) => `${v}${v}` })
      )
    ).toBe('112233');
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
    const red = AsyncReducer.from(Reducer.sum).pipe(
      Reducer.join<number>({ sep: ', ' })
    );
    expect(await AsyncStream.empty<number>().reduce(red)).toEqual('');
    expect(await AsyncStream.of(1).reduce(red)).toEqual('1');
    // expect(await AsyncStream.of(1, 2, 3).reduce(red)).toEqual('1, 3, 6');
  });

  it('pipe 2', async () => {
    const red = AsyncReducer.from(Reducer.sum).pipe(
      AsyncReducer.from(Reducer.product),
      AsyncReducer.from(Reducer.join({ sep: ', ' }))
    );
    expect(await AsyncStream.empty<number>().reduce(red)).toEqual('');
    expect(await AsyncStream.of(1).reduce(red)).toEqual('1');
    expect(await AsyncStream.of(1, 2, 3).reduce(red)).toEqual('1, 3, 18');
    expect(await AsyncStream.of(0, 1, 2).reduce(red)).toEqual('0');
  });

  it('chain', async () => {
    {
      const red = AsyncReducer.from(Reducer.toArray<number>())
        .takeInput(2)
        .chain(Reducer.toArray<number>().takeInput(2));

      expect(await AsyncStream.of(1, 2, 3, 4, 5).reduce(red)).toEqual([3, 4]);
    }

    {
      const red = AsyncReducer.from(Reducer.sum)
        .takeInput(2)
        .chain((v) =>
          AsyncReducer.from(Reducer.product).mapOutput((o) => o + v)
        );

      expect(await AsyncStream.of(1, 2, 3, 4).reduce(red)).toEqual(15);
    }
  });
});

describe('AsyncReducers', () => {
  it('AsyncReducer.combineArr', async () => {
    const r = AsyncReducer.combine([
      AsyncReducer.from(Reducer.sum),
      Reducer.average,
    ]);

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
    const r = AsyncReducer.combine([
      AsyncReducer.from(Reducer.sum),
      AsyncReducer.from(Reducer.product),
    ]);

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
      AsyncReducer.from(Reducer.sum).mapOutput(async (v) => v + 1),
      AsyncReducer.from(Reducer.product),
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
      sum: AsyncReducer.from(Reducer.sum),
      avg: AsyncReducer.from(Reducer.average),
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
      sum: AsyncReducer.from(Reducer.sum),
      prod: AsyncReducer.from(Reducer.product),
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
      sum: AsyncReducer.from(Reducer.sum).mapOutput(async (v) => v + 1),
      prod: AsyncReducer.from(Reducer.product),
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
});
