import { Arr } from '@rimbu/base';
import { AsyncReducer, Eq, Err, Reducer } from '@rimbu/common';
import { AsyncStream, AsyncStreamSource, Stream } from '../src';

const streamRange1 = Stream.range({ amount: 100 });
const streamRange2 = Stream.from(streamRange1.toArray());
const streamRange3 = Stream.from(new Set(streamRange1.toArray()));
const streamRange4 = Stream.range({ amount: 10 }).concat(
  Stream.range({ start: 10, end: [100, false] }).toArray()
);
const streamRange5 = Stream.range({ amount: 100 }).map((v) => v);
const streamRange6 = Stream.range({ amount: 99 }).append(99);
const streamRange7 = Stream.range({ start: 1, amount: 99 }).prepend(0);
const streamRange8 = Stream.range({ amount: 100 }).filter(() => true);
const arr = Stream.range({ start: 99, end: 0 }, -1).toArray();
const streamRange9 = Stream.fromArray(arr, undefined, true);

const sources = (
  [
    streamRange1,
    streamRange2,
    streamRange3,
    streamRange4,
    streamRange5,
    streamRange6,
    streamRange7,
    streamRange8,
    streamRange9,
  ] as Stream<number>[]
).map((s) => AsyncStream.from<number>(s));

const open = jest.fn().mockReturnValue(1);
const close = jest.fn();

function createResourceStream<T>(
  source: AsyncStreamSource<T>,
  c = close,
  o = open
) {
  return AsyncStream.fromResource(o, () => source, c);
}

function createErrorStream<T>(c = close, o = open) {
  return AsyncStream.fromResource(o, () => AsyncStream.of(1, 2, Err), c);
}

async function testResForEach(res: AsyncStream<any>): Promise<void> {
  close.mockReset();
  await res.forEach(() => {});
  expect(close).toBeCalledTimes(1);
  close.mockReset();

  await res.forEach((v, i, halt) => {
    if (i === 2) halt();
  });
  expect(close).toBeCalledTimes(1);
  close.mockReset();

  try {
    await res.forEach((v, i, halt) => {
      if (i === 1) throw Error('a');
    });
  } catch (e) {}
  expect(close).toBeCalledTimes(1);
  close.mockReset();

  try {
    await res.forEach((v, i, halt) => {
      if (i === 2) {
        halt();
        throw Error('a');
      }
    });
  } catch (e) {}
  expect(close).toBeCalledTimes(1);
  close.mockReset();
}

describe('AsyncStream constructors', () => {
  beforeEach(() => {
    close.mockReset();
  });

  it('empty', async () => {
    const e = AsyncStream.empty();
    expect(e).toBe(AsyncStream.empty());
    expect(await e.toArray()).toEqual([]);
    expect(e.concat(e)).toBe(e);
  });

  it('of', async () => {
    expect(await AsyncStream.of(1).toArray()).toEqual([1]);
    expect(await AsyncStream.of(Promise.resolve(1)).toArray()).toEqual([1]);
    expect(await AsyncStream.of(() => 1).toArray()).toEqual([1]);
    expect(await AsyncStream.of(async () => 1).toArray()).toEqual([1]);
    expect(await AsyncStream.of(1, 2, 3).toArray()).toEqual([1, 2, 3]);
  });

  it('from', async () => {
    expect(AsyncStream.from([])).toBe(AsyncStream.empty());
    expect(await AsyncStream.from([1]).toArray()).toEqual([1]);
    expect(await AsyncStream.from([1, 2, 3]).toArray()).toEqual([1, 2, 3]);
    expect(await AsyncStream.from(new Set()).toArray()).toEqual([]);
    expect(await AsyncStream.from(new Set([1, 2, 3])).toArray()).toEqual([
      1, 2, 3,
    ]);
    expect(await AsyncStream.from(() => [1]).toArray()).toEqual([1]);
    expect(
      await AsyncStream.from(() => Promise.resolve([1])).toArray()
    ).toEqual([1]);
    expect(await AsyncStream.from(async () => [1]).toArray()).toEqual([1]);
    expect(
      await AsyncStream.from(async function* (): AsyncGenerator<
        number,
        number
      > {
        await Promise.resolve();
        yield 1;
        yield 2;
        return 3;
      }).toArray()
    );
  });

  it('fromResource', async () => {
    const open = jest.fn().mockReturnValue(1);
    const close = jest.fn();
    const s = AsyncStream.fromResource(open, () => [1, 2, 3], close);
    expect(open).not.toBeCalled();
    expect(close).not.toBeCalled();

    await s.count();
    expect(open).toBeCalledTimes(1);
    expect(close).toBeCalledTimes(1);
  });

  it('from multi', async () => {
    expect(AsyncStream.from([], [])).toBe(AsyncStream.empty());
    expect(
      await AsyncStream.from(
        () => [],
        () => []
      ).toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.from(
        [1, 2],
        () => [3, 4],
        () => Promise.resolve([5, 6]),
        async () => [7, 8],
        async function* () {
          yield 9;
          yield 10;
          return 'a';
        }
      ).toArray()
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('always', async () => {
    expect(await AsyncStream.always(5).take(5).toArray()).toEqual([
      5, 5, 5, 5, 5,
    ]);
    expect(await AsyncStream.always(5).first()).toBe(5);
    // expect(await AsyncStream.always(5).last()).toBe(5);
    expect(await AsyncStream.always(5).elementAt(10000)).toBe(5);
  });

  it('flatten', async () => {
    expect(AsyncStream.flatten(AsyncStream.empty())).toBe(AsyncStream.empty());
    expect(await AsyncStream.flatten(AsyncStream.of([])).toArray()).toEqual([]);
    expect(await AsyncStream.flatten(AsyncStream.of([1, 2])).toArray()).toEqual(
      [1, 2]
    );
    expect(
      await AsyncStream.flatten(AsyncStream.of([1, 2], [3], [4])).toArray()
    ).toEqual([1, 2, 3, 4]);

    // const closeInner = jest.fn();
    // const s = createResourceStream(
    //   createResourceStream([1, 2, 3], closeInner),
    //   close
    // );

    // await s.count();
    // expect(close).toBeCalledTimes(1);
    // expect(closeInner).toBeCalledTimes(1);
  });

  it('unfold', async () => {
    expect(await AsyncStream.unfold(0, (c, n, stop) => stop).toArray()).toEqual(
      [0]
    );
    expect(
      await AsyncStream.unfold(0, async (c, i, stop) =>
        c > 2 ? stop : c + i
      ).toArray()
    ).toEqual([0, 1, 3]);
  });
});

describe('AsyncStream methods', () => {
  beforeEach(() => {
    close.mockReset();
  });

  it('asyncStream', () => {
    expect(AsyncStream.empty<number>().asyncStream()).toBe(
      AsyncStream.empty<string>()
    );
    const s = AsyncStream.of(1, 2, 3);
    expect(s.asyncStream()).toBe(s);
    for (const source of sources) {
      expect(source.asyncStream()).toBe(source);
    }
  });
  it('equals', async () => {
    const s1 = AsyncStream.empty<number>();
    const s2 = AsyncStream.of(1, 2, 3);
    expect(await s1.equals(s1)).toBe(true);
    expect(await s1.equals([])).toBe(true);
    expect(await s1.equals(s2)).toBe(false);
    expect(await s2.equals(s1)).toBe(false);
    expect(await s2.equals([])).toBe(false);
    expect(await s2.equals(s2)).toBe(true);
    expect(await AsyncStream.of('a', 'b').equals(['A', 'B'])).toBe(false);
    expect(
      await AsyncStream.of('a', 'b').equals(
        ['A', 'B'],
        Eq.stringCaseInsentitiveEq()
      )
    ).toBe(true);

    for (const source of sources) {
      expect(await source.equals([])).toBe(false);
      expect(await source.equals(source)).toBe(true);
    }
  });
  it('equals close', async () => {
    const rs1 = createResourceStream([1, 2, 3]);
    {
      const close2 = jest.fn();
      const rs2 = createResourceStream([1, 2, 3], close2);

      await rs1.equals(rs2);
      expect(close).toBeCalledTimes(1);
      expect(close2).toBeCalledTimes(1);
    }

    {
      close.mockReset();
      const close2 = jest.fn();
      const rs2 = createResourceStream([1, 2], close2);

      await rs1.equals(rs2);
      expect(close).toBeCalledTimes(1);
      expect(close2).toBeCalledTimes(1);
    }

    {
      close.mockReset();
      const close2 = jest.fn();
      const rs2 = createResourceStream([1, 2], close2);

      await rs2.equals(rs1);
      expect(close).toBeCalledTimes(1);
      expect(close2).toBeCalledTimes(1);
    }
  });
  it('assumeNonEmpty', () => {
    expect(() => AsyncStream.empty<number>().assumeNonEmpty()).toThrow();
    const s = AsyncStream.of(1, 2, 3);
    expect(s.assumeNonEmpty()).toBe(s);
    for (const source of sources) {
      expect(source.assumeNonEmpty()).toBe(source);
    }
  });
  it('asNormal', () => {
    const s = AsyncStream.of(1, 2, 3);
    expect(s.asNormal()).toBe(s);
  });
  it('prepend', async () => {
    expect(await AsyncStream.empty<number>().prepend(5).toArray()).toEqual([5]);
    expect(await AsyncStream.of(1, 2, 3).prepend(5).toArray()).toEqual([
      5, 1, 2, 3,
    ]);
    for (const source of sources) {
      const arr = [5, ...(await source.toArray())];
      expect(await source.prepend(5).toArray()).toEqual(arr);
    }
  });
  it('prepend close', async () => {
    const res = createResourceStream([1, 2, 3]).prepend(0);
    await res.forEach((v, i, halt) => {
      halt();
    });
    expect(close).toBeCalledTimes(0);
    await res.count();
    expect(close).toBeCalledTimes(1);

    close.mockReset();
    try {
      await createErrorStream().prepend(0).count();
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('append', async () => {
    expect(await AsyncStream.empty<number>().append(5).toArray()).toEqual([5]);
    expect(await AsyncStream.of(1, 2, 3).append(5).toArray()).toEqual([
      1, 2, 3, 5,
    ]);
    for (const source of sources) {
      const arr = [...(await source.toArray()), 5];
      expect(await source.append(5).toArray()).toEqual(arr);
    }
  });
  it('append close', async () => {
    await testResForEach(createResourceStream([1, 2, 3]).append(4));
  });
  it('forEach', async () => {
    await AsyncStream.empty().forEach(() => {
      expect(true).toBe(false);
    });
    await AsyncStream.of(1).forEach((v) => {
      expect(v).toBe(1);
    });
    let result = 0;
    await AsyncStream.of(1, 2, 3).forEach((v) => {
      result += v;
    });
    expect(result).toBe(6);
    result = 0;
    await AsyncStream.of(1, 2, 3).forEach((v, _, halt) => {
      if (v > 2) return halt();
      result += v;
    });
    expect(result).toBe(3);
    for (const source of sources) {
      result = 0;
      await source.forEach((v) => {
        result += v;
      });
      expect(result).toBe(4950);
      result = 0;
      await source.forEach((v, _, halt): void => {
        if (v > 70) return halt();
        result += v;
      });
      expect(result).toBe(2485);
      result = 0;
      await source.forEach((v, _, halt) => {
        if (v > 5) return halt();
        result += v;
      });
      expect(result).toBe(15);
    }
  });
  it('forEach close', async () => {
    await testResForEach(createResourceStream([1, 2, 3]));

    try {
      await createErrorStream().forEach(jest.fn());
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('forEachPure', async () => {
    const s = AsyncStream.of(1, 2, 3);
    const op = jest.fn();
    await s.forEachPure(op);
    expect(op).toBeCalledTimes(3);
    expect(op).toHaveBeenNthCalledWith(1, 1);
    expect(op).toHaveBeenNthCalledWith(2, 2);
    expect(op).toHaveBeenNthCalledWith(3, 3);
  });
  it('forEachPure close', async () => {
    {
      const res = createResourceStream([1, 2, 3]);
      await res.forEachPure(jest.fn());
      expect(close).toBeCalledTimes(1);
    }
    close.mockReset();
    {
      const res = createResourceStream([1, 2, 3]);
      try {
        await res.forEachPure(Err);
      } catch {}
      expect(close).toBeCalledTimes(1);
    }
    close.mockReset();
    {
      try {
        await createErrorStream().forEachPure(jest.fn());
      } catch {}
      expect(close).toBeCalledTimes(1);
    }
  });
  it('indexed', async () => {
    expect(AsyncStream.empty().indexed()).toBe(AsyncStream.empty());
    expect(await AsyncStream.of(1).indexed().toArray()).toEqual([[0, 1]]);
    expect(await AsyncStream.of(1, 2, 3).indexed().toArray()).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
    ]);
    expect(await AsyncStream.of(1, 2, 3).indexed(5).toArray()).toEqual([
      [5, 1],
      [6, 2],
      [7, 3],
    ]);
  });
  it('indexed close', async () => {
    await testResForEach(createResourceStream([1, 2, 3]).indexed());
  });
  it('map', async () => {
    expect(AsyncStream.empty().map((v) => v)).toBe(AsyncStream.empty());
    expect(
      await AsyncStream.of(1, 2, 3)
        .map((v) => v + 1)
        .toArray()
    ).toEqual([2, 3, 4]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .map(async (v) => v + 1)
        .toArray()
    ).toEqual([2, 3, 4]);
    for (const source of sources) {
      expect(await source.map((v) => v).toArray()).toEqual(
        await source.toArray()
      );
    }
  });
  it('map close', async () => {
    await testResForEach(createResourceStream([1, 2, 3]).map((v) => v + 1));
  });
  it('mapPure', async () => {
    expect(AsyncStream.empty().mapPure((v) => v)).toBe(AsyncStream.empty());
    expect(
      await AsyncStream.of(1, 2, 3)
        .mapPure((v) => v + 1)
        .toArray()
    ).toEqual([2, 3, 4]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .mapPure(async (v) => v + 1)
        .toArray()
    ).toEqual([2, 3, 4]);
    for (const source of sources) {
      expect(await source.mapPure((v) => v).toArray()).toEqual(
        await source.toArray()
      );
    }
  });
  it('mapPure close', async () => {
    await testResForEach(createResourceStream([1, 2, 3]).mapPure((v) => v + 1));
  });
  it('flatMap', async () => {
    expect(AsyncStream.empty().flatMap((v) => AsyncStream.of(1))).toBe(
      AsyncStream.empty()
    );
    expect(
      await AsyncStream.of(1)
        .flatMap((v) => AsyncStream.empty())
        .toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.of(1)
        .flatMap((v) => AsyncStream.of(2, 3))
        .toArray()
    ).toEqual([2, 3]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .flatMap((v) => AsyncStream.of(v + 1))
        .toArray()
    ).toEqual([2, 3, 4]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .flatMap((v, i) => [i + 1])
        .toArray()
    ).toEqual([1, 2, 3]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .flatMap((v, i) => [v, v])
        .toArray()
    ).toEqual([1, 1, 2, 2, 3, 3]);
    for (const source of sources) {
      expect(await source.flatMap((v) => [v]).toArray()).toEqual(
        await source.toArray()
      );
    }
  });
  it('flatMap close', async () => {
    const s1 = createResourceStream([1, 2, 3]);
    const close2 = jest.fn();
    // const close3 = jest.fn();
    const s2 = createResourceStream([4, 5, 6], close2);
    // const s3 = createResourceStream([7, 8, 9], close3);
    const closeE = jest.fn();
    const se = createErrorStream(closeE);

    await s1.flatMap((v) => s2).count();
    expect(close).toBeCalledTimes(1);
    expect(close2).toBeCalledTimes(3);

    close.mockReset();
    try {
      await s1.flatMap((v) => se).count();
    } catch {}
    expect(close).toBeCalledTimes(1);
    expect(closeE).toBeCalledTimes(1);
  });
  it('filter', async () => {
    expect(AsyncStream.empty().filter((v) => true)).toBe(AsyncStream.empty());
    expect(
      await AsyncStream.of(1, 2, 3)
        .filter(async (v) => true)
        .toArray()
    ).toEqual([1, 2, 3]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .filter((v) => false)
        .toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .filter(async (v) => v % 2 === 1)
        .toArray()
    ).toEqual([1, 3]);
    for (const source of sources) {
      expect(await source.filter((v) => false).toArray()).toEqual([]);
      expect(await source.filter((v) => v % 30 === 0).toArray()).toEqual([
        0, 30, 60, 90,
      ]);
      expect(await source.filter((v, i) => i % 30 === 0).toArray()).toEqual([
        0, 30, 60, 90,
      ]);
      expect(
        await source
          .filter((v) => v % 15 === 0)
          .filter(async (v) => v % 20 === 0)
          .toArray()
      ).toEqual([0, 60]);
    }
  });
  it('filter close', async () => {
    await testResForEach(createResourceStream([1, 2, 3]).filter((v) => true));

    try {
      await createResourceStream([1, 2, 3]).filter(Err).count();
    } catch {}
    expect(close).toBeCalledTimes(1);

    close.mockReset();
    try {
      await createErrorStream()
        .filter((v) => true)
        .count();
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('filterPure', async () => {
    expect(AsyncStream.empty().filterPure((v) => true)).toBe(
      AsyncStream.empty()
    );
    expect(
      await AsyncStream.of(1, 2, 3)
        .filterPure(async (v) => true)
        .toArray()
    ).toEqual([1, 2, 3]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .filterPure((v) => false)
        .toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .filterPure(async (v) => v % 2 === 1)
        .toArray()
    ).toEqual([1, 3]);
    for (const source of sources) {
      expect(await source.filterPure((v) => false).toArray()).toEqual([]);
      expect(await source.filterPure((v) => v % 30 === 0).toArray()).toEqual([
        0, 30, 60, 90,
      ]);
      expect(
        await source
          .filterPure((v) => v % 15 === 0)
          .filterPure(async (v) => v % 20 === 0)
          .toArray()
      ).toEqual([0, 60]);
    }
  });
  it('filterPure close', async () => {
    await testResForEach(
      createResourceStream([1, 2, 3]).filterPure((v) => true)
    );

    try {
      await createResourceStream([1, 2, 3]).filterPure(Err).count();
    } catch {}
    expect(close).toBeCalledTimes(1);

    close.mockReset();
    try {
      await createErrorStream()
        .filterPure((v) => true)
        .count();
    } catch {}
    expect(close).toBeCalledTimes(1);
  });

  it('collect', async () => {
    expect(AsyncStream.empty<number>().collect((v) => v + 1)).toBe(
      AsyncStream.empty()
    );
    expect(
      await AsyncStream.of(1)
        .collect((v) => v + 1)
        .toArray()
    ).toEqual([2]);
    expect(
      await AsyncStream.of(1)
        .collect((v, i, skip) => skip)
        .toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .collect(async (v) => v + 1)
        .toArray()
    ).toEqual([2, 3, 4]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .collect((v, i, skip) => (v === 2 ? skip : v))
        .toArray()
    ).toEqual([1, 3]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .collect((v, i, skip) => (i === 1 ? skip : v))
        .toArray()
    ).toEqual([1, 3]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .collect(async (v, i, skip, halt) => {
          if (v === 1) {
            halt();
            return v;
          }
          return v;
        })
        .toArray()
    ).toEqual([1]);
    for (const source of sources) {
      expect(
        await source
          .collect((v, i, skip, halt) => {
            if (v < 50) return skip;
            if (v > 55) {
              halt();
              return skip;
            }
            return v - 50;
          })
          .toArray()
      ).toEqual([0, 1, 2, 3, 4, 5]);
    }
  });
  it('collect close', async () => {
    await testResForEach(createResourceStream([1, 2, 3]).collect((v) => true));
    await testResForEach(
      createResourceStream([1, 2, 3]).collect((v, i, skip, halt) => {
        halt();
        return v;
      })
    );

    try {
      await testResForEach(createResourceStream([1, 2, 3]).collect(Err));
    } catch {}
    expect(close).toBeCalledTimes(1);

    close.mockReset();
    try {
      await createErrorStream()
        .collect((v) => {
          return v;
        })
        .count();
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('first', async () => {
    expect(await AsyncStream.empty<number>().first()).toBeUndefined();
    expect(await AsyncStream.empty<number>().first(1)).toBe(1);
    expect(await AsyncStream.of(1, 2, 3).first()).toBe(1);
    expect(await AsyncStream.from(Stream.range({ start: 0 })).first()).toBe(0);
    for (const source of sources) {
      const first = (await source.toArray())[0];
      expect(await source.first()).toBe(first);
      expect(await source.first('a')).toBe(first);
    }
  });
  it('first close', async () => {
    await createResourceStream([1, 2, 3]).first();
    expect(close).toBeCalledTimes(1);
  });
  it('last', async () => {
    expect(await AsyncStream.empty<number>().last()).toBeUndefined();
    expect(await AsyncStream.empty<number>().last(1)).toBe(1);
    expect(await AsyncStream.of(1, 2, 3).last()).toBe(3);
    for (const source of sources) {
      const last = Arr.last(await source.toArray());
      expect(await source.last()).toBe(last);
      expect(await source.last('a')).toBe(last);
    }
  });
  it('last close', async () => {
    await createResourceStream([1, 2, 3]).last();
    expect(close).toBeCalledTimes(1);
  });
  it('count', async () => {
    expect(await AsyncStream.empty<number>().count()).toBe(0);
    expect(await AsyncStream.of(1, 2, 3).count()).toBe(3);
    for (const source of sources) {
      expect(await source.count()).toEqual((await source.toArray()).length);
      expect(await source.filter((v) => v % 2 === 0).count()).toEqual(
        (await source.toArray()).length / 2
      );
    }
  });
  it('count close', async () => {
    await createResourceStream([1, 2, 3]).count();
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    try {
      await createErrorStream().count();
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('countElement', async () => {
    expect(await AsyncStream.empty<number>().countElement(1)).toBe(0);
    expect(await AsyncStream.of(1, 2, 3, 2).countElement(2)).toBe(2);
    for (const source of sources) {
      expect(await source.countElement(2)).toEqual(1);
      expect(await source.filter((v) => v % 2 === 0).countElement(2)).toEqual(
        1
      );
    }
  });
  it('countNotElement close', async () => {
    await createResourceStream([1, 2, 3]).countNotElement(3);
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    try {
      await createErrorStream().countNotElement(3);
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('countNotElement', async () => {
    expect(await AsyncStream.empty<number>().countNotElement(1)).toBe(0);
    expect(await AsyncStream.of(1, 2, 3, 2).countNotElement(2)).toBe(2);
    for (const source of sources) {
      expect(await source.countNotElement(2)).toEqual(99);
      expect(
        await source.filter((v) => v % 2 === 0).countNotElement(2)
      ).toEqual(49);
    }
  });
  it('countNotElement close', async () => {
    await createResourceStream([1, 2, 3]).countNotElement(3);
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    try {
      await createErrorStream().countNotElement(3);
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('find', async () => {
    expect(await AsyncStream.empty().find((v) => false, 1)).toBe(undefined);
    expect(await AsyncStream.empty().find((v) => false, 1, 'a')).toBe('a');
    expect(await AsyncStream.empty().find((v) => true, 1)).toBe(undefined);
    expect(await AsyncStream.empty().find((v) => true, 1, 'a')).toBe('a');
    expect(await AsyncStream.of(1, 2, 3).find((v) => v === 2, 1, 'a')).toBe(2);
    expect(await AsyncStream.of(1, 2, 3).find((v) => v === 10, 1, 'a')).toBe(
      'a'
    );
    expect(await AsyncStream.of(1, 2, 1, 4).find((v) => v > 1, 2, 'a')).toBe(4);
    for (const source of sources) {
      expect(await source.find((v) => v === 70, 1, 'a')).toBe(70);
      expect(await source.find((v) => v === -10, 1, 'a')).toBe('a');
    }
  });
  it('find close', async () => {
    await createResourceStream([1, 2, 3]).find((v) => false);
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    await createResourceStream([1, 2, 3]).find((v) => true);
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    await createResourceStream([1, 2, 3]).find((v, i) => i === 2);
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    try {
      await createErrorStream().find((v) => false);
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('elementAt', async () => {
    expect(await AsyncStream.empty().elementAt(0, 'a')).toBe('a');
    expect(await AsyncStream.of(1).elementAt(0, 'a')).toBe(1);
    expect(await AsyncStream.of(1).elementAt(1, 'a')).toBe('a');
    for (const source of sources) {
      expect(await source.elementAt(0, 'a')).toBe(0);
      expect(await source.elementAt(50, 'a')).toBe(50);
      expect(await source.elementAt(99, 'a')).toBe(99);
      expect(await source.elementAt(100, 'a')).toBe('a');
    }
  });
  it('elementAt close', async () => {
    await createResourceStream([1, 2, 3]).elementAt(1);
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    await createResourceStream([1, 2, 3]).elementAt(100);
    expect(close).toBeCalledTimes(1);
  });
  it('indicesWhere', async () => {
    expect(AsyncStream.empty<number>().indicesWhere((v) => v > 0)).toBe(
      AsyncStream.empty()
    );
    expect(
      await AsyncStream.of(1)
        .indicesWhere((v) => v > 0)
        .toArray()
    ).toEqual([0]);
    expect(
      await AsyncStream.of(1)
        .indicesWhere((v) => v < 0)
        .toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.of(1, 2, 1)
        .indicesWhere((v) => v < 2)
        .toArray()
    ).toEqual([0, 2]);
    for (const source of sources) {
      expect(await source.indicesWhere((v) => v >= 97).toArray()).toEqual([
        97, 98, 99,
      ]);
      expect(await source.indicesWhere((v) => v < 0).toArray()).toEqual([]);
    }
  });
  it('indicesWhere close', async () => {
    await testResForEach(
      createResourceStream([1, 2, 3]).indicesWhere((v) => v > 1)
    );
  });
  it('indicesOf', async () => {
    expect(AsyncStream.empty<number>().indicesOf(1)).toBe(AsyncStream.empty());
    expect(await AsyncStream.of(1).indicesOf(1).toArray()).toEqual([0]);
    expect(await AsyncStream.of(1).indicesOf(2).toArray()).toEqual([]);
    expect(await AsyncStream.of(1, 2, 1).indicesOf(1).toArray()).toEqual([
      0, 2,
    ]);
    for (const source of sources) {
      expect(await source.indicesOf(50).toArray()).toEqual([50]);
      expect(await source.indicesOf(-1).toArray()).toEqual([]);
    }
  });
  it('indicesOf close', async () => {
    await testResForEach(createResourceStream([1, 2, 3]).indicesOf(2));
  });
  it('indexWhere', async () => {
    expect(await AsyncStream.empty<number>().indexWhere((v) => v >= 0)).toBe(
      undefined
    );
    expect(await AsyncStream.of(1).indexWhere((v) => v >= 0)).toBe(0);
    expect(await AsyncStream.of(1).indexWhere((v) => v < 0)).toBe(undefined);
    expect(await AsyncStream.of(1).indexWhere((v) => v >= 0, 2)).toBe(
      undefined
    );
    expect(await AsyncStream.of(1, 2, 1).indexWhere((v) => v >= 2)).toBe(1);
    expect(await AsyncStream.of(1, 2, 1).indexWhere((v) => v < 0)).toBe(
      undefined
    );
    expect(await AsyncStream.of(1, 2, 1).indexWhere((v) => v < 2, 2)).toBe(2);
    expect(await AsyncStream.of(1, 2, 1).indexWhere((v) => v < 2, 3)).toBe(
      undefined
    );
    for (const source of sources) {
      expect(await source.indexWhere((v) => v >= 50)).toEqual(50);
      expect(await source.indexWhere((v) => v >= 50, 10)).toEqual(59);
      expect(await source.indexWhere((v) => v < 0)).toEqual(undefined);
    }
  });
  it('indexWhere close', async () => {
    await createResourceStream([1, 2, 3]).indexWhere((v) => v > 1);
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    await createResourceStream([1, 2, 3]).indexWhere((v) => v > 100);
    expect(close).toBeCalledTimes(1);
  });
  it('indexOf', async () => {
    expect(await AsyncStream.empty<number>().indexOf(1)).toBe(undefined);
    expect(await AsyncStream.of(1).indexOf(1)).toBe(0);
    expect(await AsyncStream.of(1).indexOf(2)).toBe(undefined);
    expect(await AsyncStream.of(1).indexOf(1, 2)).toBe(undefined);
    expect(await AsyncStream.of(1, 2, 1).indexOf(2)).toBe(1);
    expect(await AsyncStream.of(1, 2, 1).indexOf(3)).toBe(undefined);
    expect(await AsyncStream.of(1, 2, 1).indexOf(1, 2)).toBe(2);
    expect(await AsyncStream.of(1, 2, 1).indexOf(1, 3)).toBe(undefined);
    for (const source of sources) {
      expect(await source.indexOf(50)).toEqual(50);
      expect(await source.indexOf(50, 2)).toEqual(undefined);
      expect(await source.indexOf(-1)).toEqual(undefined);
    }
  });
  it('indexOf close', async () => {
    await createResourceStream([1, 2, 3]).indexOf(2);
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    await createResourceStream([1, 2, 3]).indexOf(10);
    expect(close).toBeCalledTimes(1);
  });
  it('some', async () => {
    expect(await AsyncStream.empty().some((v) => true)).toBe(false);
    expect(await AsyncStream.empty().some((v) => false)).toBe(false);
    expect(await AsyncStream.of(1, 2, 3).some((v) => v === 2)).toBe(true);
    expect(await AsyncStream.of(1, 2, 3).some((v) => v === 10)).toBe(false);
    for (const source of sources) {
      expect(await source.some((v) => v === 50)).toBe(true);
      expect(await source.some((v) => v === -50)).toBe(false);
      expect(await source.some((v, i) => i === 50)).toBe(true);
      expect(await source.some((v, i) => i === -50)).toBe(false);
    }
  });
  it('some close', async () => {
    await createResourceStream([1, 2, 3]).some((v) => v > 1);
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    await createResourceStream([1, 2, 3]).some((v) => v > 100);
    expect(close).toBeCalledTimes(1);
  });
  it('every', async () => {
    expect(await AsyncStream.empty().every(() => true)).toBe(true);
    expect(await AsyncStream.empty().every(() => false)).toBe(true);
    expect(await AsyncStream.of(1, 2, 3).every((v) => v > 0)).toBe(true);
    expect(await AsyncStream.of(1, 2, 3).every((v) => v < 3)).toBe(false);
    expect(await AsyncStream.of(1, 2, 3).every((v, i) => i >= 0)).toBe(true);
    expect(await AsyncStream.of(1, 2, 3).every((v, i) => i < 2)).toBe(false);
    for (const source of sources) {
      expect(await source.every((v) => v < 50)).toBe(false);
      expect(await source.every((v) => v >= 0)).toBe(true);
      expect(await source.every((v, i) => i < 50)).toBe(false);
      expect(await source.every((v, i) => i >= 0)).toBe(true);
    }
  });
  it('every close', async () => {
    await createResourceStream([1, 2, 3]).every((v) => v > -10);
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    await createResourceStream([1, 2, 3]).every((v) => v > 100);
    expect(close).toBeCalledTimes(1);
  });
  it('contains', async () => {
    expect(await AsyncStream.empty().contains(1)).toBe(false);
    expect(await AsyncStream.of(1).contains(1)).toBe(true);
    expect(await AsyncStream.of(1).contains(1, 2)).toBe(false);
    expect(await AsyncStream.of(1).contains(1, 0)).toBe(true);
    expect(await AsyncStream.of(1).contains(2)).toBe(false);
    expect(await AsyncStream.of(1, 2, 1, 2, 1, 2).contains(2, 2)).toBe(true);
    expect(await AsyncStream.of(1, 2, 1, 2, 1, 2).contains(2, 3)).toBe(true);
    expect(await AsyncStream.of(1, 2, 1, 2, 1, 2).contains(2, 4)).toBe(false);
    for (const source of sources) {
      expect(await source.contains(50)).toBe(true);
      expect(await source.contains(50, 2)).toBe(false);
      expect(await source.contains(-50)).toBe(false);
      expect(await source.contains(-50, 2)).toBe(false);
    }
  });
  it('contains close', async () => {
    await createResourceStream([1, 2, 3]).contains(2);
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    await createResourceStream([1, 2, 3]).contains(100);
    expect(close).toBeCalledTimes(1);
  });
  it('takeWhile', async () => {
    expect(AsyncStream.empty().takeWhile((v) => true)).toBe(
      AsyncStream.empty()
    );
    expect(AsyncStream.empty().takeWhile((v) => false)).toBe(
      AsyncStream.empty()
    );
    expect(
      await AsyncStream.of(1)
        .takeWhile(async (v) => true)
        .toArray()
    ).toEqual([1]);
    expect(
      await AsyncStream.of(1)
        .takeWhile((v) => false)
        .toArray()
    ).toEqual([]);
    for (const source of sources) {
      expect(await source.takeWhile((v) => false).toArray()).toEqual([]);
      expect(await source.takeWhile(async (v) => v < 3).toArray()).toEqual([
        0, 1, 2,
      ]);
    }
  });
  it('takeWhle close', async () => {
    await testResForEach(
      createResourceStream([1, 2, 3]).takeWhile((v) => v < 3)
    );
    await testResForEach(
      createResourceStream([1, 2, 3]).takeWhile((v) => v > -10)
    );

    try {
      await createResourceStream([1, 2, 3]).takeWhile(Err).count();
    } catch {}
    expect(close).toBeCalledTimes(1);

    close.mockReset();
    try {
      await createErrorStream()
        .takeWhile(() => true)
        .count();
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('dropWhile', async () => {
    expect(AsyncStream.empty().dropWhile((v) => true)).toBe(
      AsyncStream.empty()
    );
    expect(AsyncStream.empty().dropWhile((v) => false)).toBe(
      AsyncStream.empty()
    );
    expect(
      await AsyncStream.of(1)
        .dropWhile(async (v) => true)
        .toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.of(1)
        .dropWhile(async (v) => false)
        .toArray()
    ).toEqual([1]);
    for (const source of sources) {
      expect(await source.dropWhile((v) => true).toArray()).toEqual([]);
      expect(await source.dropWhile(async (v) => v < 97).toArray()).toEqual([
        97, 98, 99,
      ]);
      expect(await source.dropWhile((v, i) => i < 97).toArray()).toEqual([
        97, 98, 99,
      ]);
    }
  });
  it('dropWhile close', async () => {
    await testResForEach(
      createResourceStream([1, 2, 3]).dropWhile((v) => v < 10)
    );
    await testResForEach(
      createResourceStream([1, 2, 3]).dropWhile((v) => v < -10)
    );

    try {
      await createResourceStream([1, 2, 3]).dropWhile(Err).count();
    } catch {}
    expect(close).toBeCalledTimes(1);

    close.mockReset();
    try {
      await createErrorStream()
        .dropWhile(() => true)
        .count();
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('take', async () => {
    expect(AsyncStream.empty().take(1)).toBe(AsyncStream.empty());
    expect(AsyncStream.of(1).take(0)).toBe(AsyncStream.empty());
    expect(await AsyncStream.of(1).take(10).toArray()).toEqual([1]);
    const e = AsyncStream.of(1, 2, 3);
    expect(await e.take(10).toArray()).toEqual([1, 2, 3]);
    expect(await AsyncStream.of(1, 2, 3).take(2).toArray()).toEqual([1, 2]);
    for (const source of sources) {
      expect(await source.take(3).toArray()).toEqual([0, 1, 2]);
    }
  });
  it('take close', async () => {
    await testResForEach(createResourceStream([1, 2, 3]).take(2));
    await testResForEach(createResourceStream([1, 2, 3]).take(100));

    try {
      await createErrorStream().take(10).count();
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('drop', async () => {
    expect(AsyncStream.empty().drop(1)).toBe(AsyncStream.empty());
    expect(await AsyncStream.of(1).drop(1).toArray()).toEqual([]);
    expect(await AsyncStream.of(1).drop(10).toArray()).toEqual([]);
    expect(await AsyncStream.of(1, 2, 3).drop(10).toArray()).toEqual([]);
    expect(await AsyncStream.of(1, 2, 3).drop(1).toArray()).toEqual([2, 3]);
    for (const source of sources) {
      expect(await source.drop(97).toArray()).toEqual([97, 98, 99]);
    }
  });
  it('drop close', async () => {
    await testResForEach(createResourceStream([1, 2, 3]).drop(2));
    await testResForEach(createResourceStream([1, 2, 3]).drop(0));

    try {
      await createErrorStream().drop(10).count();
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('repeat', async () => {
    const nonStandardEmpty = AsyncStream.of(1).drop(1);
    expect(AsyncStream.empty().repeat(10)).toBe(AsyncStream.empty());
    expect(await nonStandardEmpty.repeat(10).first('a')).toBe('a');
    const one = AsyncStream.of(1);
    expect(one.repeat(1)).toBe(one);
    expect(one.repeat(0)).toBe(one);
    expect(await one.repeat(3).toArray()).toEqual([1, 1, 1]);
    expect(await AsyncStream.of(1, 2, 3).repeat(2).toArray()).toEqual([
      1, 2, 3, 1, 2, 3,
    ]);
    for (const source of sources) {
      expect(source.repeat(0)).toBe(source);
      expect(await source.repeat(2).toArray()).toEqual(
        (await source.toArray()).concat(await source.toArray())
      );
    }
  });
  it('repeat close', async () => {
    await testResForEach(createResourceStream([1, 2, 3]).repeat(0));
    const s = createResourceStream([1, 2, 3]).repeat(10);
    await s.count();
    expect(close).toBeCalledTimes(10);

    close.mockReset();
    try {
      await createErrorStream().repeat(10).count();
    } catch {}
    expect(close).toBeCalledTimes(1);
  });

  it('concat', async () => {
    const e = AsyncStream.empty<number>();
    const ne = AsyncStream.of(1, 2, 3);
    expect(e.concat(e)).toBe(e);
    expect(e.concat(ne)).toBe(ne);
    expect(ne.concat(e)).toBe(ne);
    expect(await e.concat(e).toArray()).toEqual([]);
    expect(await e.concat(ne).toArray()).toEqual([1, 2, 3]);
    expect(await ne.concat(e).toArray()).toEqual([1, 2, 3]);
    expect(await ne.concat(ne).toArray()).toEqual([1, 2, 3, 1, 2, 3]);
    expect(await ne.concat(ne).concat(ne).toArray()).toEqual([
      1, 2, 3, 1, 2, 3, 1, 2, 3,
    ]);
    for (const source of sources) {
      const arr = await source.toArray();
      expect(await source.concat(source).toArray()).toEqual(arr.concat(arr));
    }
  });
  it('concat close', async () => {
    const s = createResourceStream([1, 2, 3]);
    const close2 = jest.fn();
    const s2 = createResourceStream([4, 5, 6], close2);
    const c = s.concat(s2);

    await testResForEach(c);

    close.mockReset();
    close2.mockReset();
    try {
      await s.concat(createErrorStream(close2)).count();
    } catch {}
    expect(close).toBeCalledTimes(1);
    expect(close2).toBeCalledTimes(1);
  });
  it('min', async () => {
    expect(await AsyncStream.empty().min(undefined)).toBe(undefined);
    expect(await AsyncStream.of(1).min()).toBe(1);
    expect(await AsyncStream.of(1, -10, 5).min()).toBe(-10);
    for (const source of sources) {
      expect(await source.min(undefined)).toBe(0);
    }
  });
  it('min close', async () => {
    await createResourceStream([1, 2, 3]).min();
    expect(close).toBeCalledTimes(1);

    close.mockReset();
    try {
      await createErrorStream().min();
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('minBy', async () => {
    function comp(s1: string, s2: string) {
      return s1.length - s2.length;
    }
    expect(await AsyncStream.empty<string>().minBy(comp)).toBe(undefined);
    expect(await AsyncStream.empty<string>().minBy(comp, 1)).toBe(1);
    expect(await AsyncStream.of('a').minBy(comp)).toBe('a');
    expect(await AsyncStream.of('ab', 'c', 'def').minBy(comp)).toBe('c');
  });
  it('minBy close', async () => {
    await createResourceStream([1, 2, 3]).minBy((a, b) => a - 1);
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    try {
      await createErrorStream().minBy(() => 1);
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('max', async () => {
    expect(await AsyncStream.empty().max(undefined)).toBe(undefined);
    expect(await AsyncStream.of(1).max()).toBe(1);
    expect(await AsyncStream.of(1, 10, 5).max()).toBe(10);
    for (const source of sources) {
      expect(await source.max(undefined)).toBe(99);
    }
  });
  it('max close', async () => {
    await createResourceStream([1, 2, 3]).max();
    expect(close).toBeCalledTimes(1);

    close.mockReset();
    try {
      await createErrorStream().max();
    } catch {}
    expect(close).toBeCalledTimes(1);
  });

  it('maxBy', async () => {
    function comp(s1: string, s2: string) {
      return s1.length - s2.length;
    }
    expect(await AsyncStream.empty<string>().maxBy(comp)).toBe(undefined);
    expect(await AsyncStream.empty<string>().maxBy(comp, 1)).toBe(1);
    expect(await AsyncStream.of('a').maxBy(comp)).toBe('a');
    expect(await AsyncStream.of('ab', 'c', 'def').maxBy(comp)).toBe('def');
  });
  it('maxBy close', async () => {
    await createResourceStream([1, 2, 3]).maxBy((a, b) => a - 1);
    expect(close).toBeCalledTimes(1);

    close.mockReset();
    try {
      await createErrorStream().maxBy((v) => 1);
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('intersperse', async () => {
    expect(AsyncStream.empty().intersperse([1])).toBe(AsyncStream.empty());
    expect(await AsyncStream.of(1).intersperse([0]).toArray()).toEqual([1]);
    expect(await AsyncStream.of(1, 2, 3).intersperse([0]).toArray()).toEqual([
      1, 0, 2, 0, 3,
    ]);
    expect(
      await AsyncStream.of(1, 2, 3).intersperse([0, 10]).toArray()
    ).toEqual([1, 0, 10, 2, 0, 10, 3]);
    expect(await AsyncStream.of(1, 2, 3).intersperse([]).toArray()).toEqual([
      1, 2, 3,
    ]);
  });
  it('intersperse close', async () => {
    const s1 = createResourceStream([1, 2, 3]);
    const close2 = jest.fn();
    const s2 = createResourceStream([4, 5], close2);

    const c = s1.intersperse(s2);

    await c.count();

    expect(close).toBeCalledTimes(1);
    expect(close2).toBeCalledTimes(2);

    await testResForEach(c);

    close.mockReset();
    close2.mockReset();

    await c.take(4).count();
    expect(close).toBeCalledTimes(1);
    expect(close2).toBeCalledTimes(1);

    close.mockReset();
    close2.mockReset();
    try {
      await s1.intersperse(createErrorStream(close2)).count();
    } catch {}

    expect(close).toBeCalledTimes(1);
    expect(close2).toBeCalledTimes(1);
  });

  it('join', async () => {
    expect(await AsyncStream.empty().join()).toBe('');
    expect(
      await AsyncStream.empty().join({ start: '<', end: '>', sep: '-' })
    ).toBe('<>');
    expect(
      await AsyncStream.empty().join({
        start: '<',
        end: '>',
        sep: '-',
        ifEmpty: 'abc',
      })
    ).toBe('abc');
    expect(
      await AsyncStream.of(1).join({ start: '<', end: '>', sep: '-' })
    ).toBe('<1>');
    expect(
      await AsyncStream.of(1, 2, 3).join({ start: '<', end: '>', sep: '-' })
    ).toBe('<1-2-3>');
    expect(await AsyncStream.of(1, 2, 3).join()).toBe('123');
    expect(await AsyncStream.of(1, 2, 3).join({ ifEmpty: 'abc' })).toBe('123');
  });
  it('join close', async () => {
    const s = createResourceStream([1, 2, 3]);
    await s.join();
    expect(close).toBeCalledTimes(1);

    close.mockReset();
    try {
      await createErrorStream().join();
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('mkGroup', async () => {
    expect(
      await AsyncStream.empty()
        .mkGroup({ start: [-1], end: [-2], sep: [-3] })
        .toArray()
    ).toEqual([-1, -2]);
    expect(await AsyncStream.of(1).mkGroup({}).toArray()).toEqual([1]);
    expect(
      await AsyncStream.of(1)
        .mkGroup({ start: [-1], end: [-2], sep: [-3] })
        .toArray()
    ).toEqual([-1, 1, -2]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .mkGroup({ start: [-1], end: [-2], sep: [-3] })
        .toArray()
    ).toEqual([-1, 1, -3, 2, -3, 3, -2]);
  });
  it('mkGroup close', async () => {
    const s = createResourceStream([1, 2, 3]);
    const closeStart = jest.fn();
    const start = createResourceStream([4, 5], closeStart);
    const closeSep = jest.fn();
    const sep = createResourceStream([6, 7], closeSep);
    const closeEnd = jest.fn();
    const end = createResourceStream([8, 9], closeEnd);

    const group = s.mkGroup({ sep, start, end });
    await group.count();
    expect(close).toBeCalledTimes(1);
    expect(closeStart).toBeCalledTimes(1);
    expect(closeEnd).toBeCalledTimes(1);
    expect(closeSep).toBeCalledTimes(2);

    close.mockReset();
    closeStart.mockReset();
    closeEnd.mockReset();
    closeSep.mockReset();
    try {
      await createErrorStream().mkGroup({ sep, start, end }).count();
    } catch {}
    expect(close).toBeCalledTimes(1);
    expect(closeStart).toBeCalledTimes(1);
    expect(closeEnd).toBeCalledTimes(0);
    expect(closeSep).toBeCalledTimes(1);
  });
  it('splitWhere', async () => {
    function isEven(v: number) {
      return v % 2 === 0;
    }
    expect(
      await AsyncStream.empty<number>().splitWhere(isEven).toArray()
    ).toEqual([]);
    expect(await AsyncStream.of(1, 3, 5).splitWhere(isEven).toArray()).toEqual([
      [1, 3, 5],
    ]);
    expect(await AsyncStream.of(1, 2, 5).splitWhere(isEven).toArray()).toEqual([
      [1],
      [5],
    ]);
    expect(await AsyncStream.of(2, 2, 5).splitWhere(isEven).toArray()).toEqual([
      [],
      [],
      [5],
    ]);
    expect(await AsyncStream.of(2, 5, 2).splitWhere(isEven).toArray()).toEqual([
      [],
      [5],
    ]);
    expect(await AsyncStream.of(2, 2, 2).splitWhere(isEven).toArray()).toEqual([
      [],
      [],
      [],
    ]);
  });
  it('splitWhere close', async () => {
    await testResForEach(
      createResourceStream([1, 2, 3]).splitWhere((v) => v > 1)
    );
    await testResForEach(
      createResourceStream([1, 2, 3]).splitWhere((v) => true)
    );
    await testResForEach(
      createResourceStream([1, 2, 3]).splitWhere((v) => false)
    );

    close.mockReset();
    try {
      await createErrorStream()
        .splitWhere((v) => false)
        .count();
    } catch {}
    expect(close).toBeCalledTimes(1);

    close.mockReset();
    try {
      await createResourceStream([1, 2, 3]).splitWhere(Err).count();
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('splitOn', async () => {
    expect(await AsyncStream.empty<number>().splitOn(2).toArray()).toEqual([]);
    expect(await AsyncStream.of(1, 3, 5).splitOn(2).toArray()).toEqual([
      [1, 3, 5],
    ]);
    expect(await AsyncStream.of(1, 2, 5).splitOn(2).toArray()).toEqual([
      [1],
      [5],
    ]);
    expect(await AsyncStream.of(2, 2, 5).splitOn(2).toArray()).toEqual([
      [],
      [],
      [5],
    ]);
    expect(await AsyncStream.of(2, 5, 2).splitOn(2).toArray()).toEqual([
      [],
      [5],
    ]);
    expect(await AsyncStream.of(2, 2, 2).splitOn(2).toArray()).toEqual([
      [],
      [],
      [],
    ]);
  });
  it('splitOn close', async () => {
    await testResForEach(createResourceStream([1, 2, 3]).splitOn(2));
    await testResForEach(createResourceStream([1, 2, 3]).splitOn(10));
  });
  it('fold', async () => {
    async function sum(
      current: number,
      value: number,
      index: number,
      halt: () => void
    ) {
      if (value > 10) {
        halt();
        return current;
      }
      return current + value;
    }
    expect(await AsyncStream.empty<number>().fold(0, sum)).toBe(0);
    expect(await AsyncStream.of(1, 2, 3).fold(0, sum)).toBe(6);
    expect(await AsyncStream.of(1, 20, 3).fold(0, sum)).toBe(1);
  });
  it('fold close', async () => {
    await createResourceStream([1, 2, 3]).fold(1, (c) => c);
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    await createResourceStream([1, 2, 3]).fold(1, (c, v, i, halt) => {
      halt();
      return c;
    });
    expect(close).toBeCalledTimes(1);
  });
  it('foldStream', async () => {
    async function sum(
      current: number,
      value: number,
      index: number,
      halt: () => void
    ) {
      if (value > 10) {
        halt();
        return current;
      }
      return current + value;
    }
    expect(
      await AsyncStream.empty<number>().foldStream(0, sum).toArray()
    ).toEqual([]);
    expect(await AsyncStream.of(1, 2, 3).foldStream(0, sum).toArray()).toEqual([
      1, 3, 6,
    ]);
    expect(await AsyncStream.of(1, 20, 3).foldStream(0, sum).toArray()).toEqual(
      [1, 1]
    );
  });
  it('foldStream close', async () => {
    await testResForEach(
      createResourceStream([1, 2, 3]).foldStream(0, (c) => c)
    );
    await testResForEach(
      createResourceStream([1, 2, 3]).foldStream(
        0,
        (c: number, _: any, __: any, halt: () => void) => {
          halt();
          return c;
        }
      )
    );
  });
  it('reduce', async () => {
    expect(
      await AsyncStream.empty<number>().reduce(AsyncReducer.from(Reducer.sum))
    ).toBe(0);
    expect(
      await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.from(Reducer.sum))
    ).toBe(6);
  });
  it('reduce close', async () => {
    await createResourceStream([1, 2, 3]).reduce(
      AsyncReducer.from(Reducer.count())
    );
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    await createResourceStream([1, 2, 3]).reduce(
      AsyncReducer.from(Reducer.first<number>())
    );
    expect(close).toBeCalledTimes(1);

    close.mockReset();
    try {
      await createErrorStream().reduce(((v: any) => v) as any);
    } catch {}
    expect(close).toBeCalledTimes(1);

    close.mockReset();
    try {
      const errorReducer = AsyncReducer.createMono(0, Err);

      await createResourceStream([1, 2, 3]).reduce(errorReducer);
    } catch {}
    expect(close).toBeCalledTimes(1);
  });
  it('reducer close reducer', async () => {
    const endReducer = jest.fn();

    const asyncSum = AsyncReducer.createMono<number>(
      async () => 0,
      async (c, v) => c + v,
      async (v) => v * 2,
      endReducer
    );

    expect(await AsyncStream.of(1, 2, 3).reduce(asyncSum));
    expect(endReducer).toBeCalledTimes(1);

    endReducer.mockReset();
    try {
      await createErrorStream().reduce(asyncSum);
    } catch {}
    expect(endReducer).toBeCalledTimes(1);

    const asyncError = AsyncReducer.createMono<number>(
      async () => 0,
      Err,
      async (v) => v * 2,
      endReducer
    );

    endReducer.mockReset();
    try {
      await AsyncStream.of(1, 2, 3).reduce(asyncError);
    } catch {}
    expect(endReducer).toBeCalledTimes(1);
  });
  it('reduceStream', async () => {
    expect(
      await AsyncStream.empty<number>()
        .reduceStream(AsyncReducer.from(Reducer.sum))
        .toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .reduceStream(AsyncReducer.from(Reducer.sum))
        .toArray()
    ).toEqual([1, 3, 6]);
  });
  it('reduceStream close', async () => {
    await testResForEach(
      createResourceStream([1, 2, 3]).reduceStream(
        AsyncReducer.from(Reducer.count())
      )
    );
    await testResForEach(
      createResourceStream([1, 2, 3]).reduceStream(
        AsyncReducer.from(Reducer.first())
      )
    );
  });
  it('reduceAll', async () => {
    expect(
      await AsyncStream.empty<number>().reduceAll(
        AsyncReducer.from(Reducer.sum),
        AsyncReducer.from(Reducer.count())
      )
    ).toEqual([0, 0]);
    expect(
      await AsyncStream.of(1, 2, 3).reduceAll(
        AsyncReducer.from(Reducer.sum),
        AsyncReducer.from(Reducer.count())
      )
    ).toEqual([6, 3]);
    expect(
      await AsyncStream.from(Stream.range({ start: 0 })).reduceAll(
        AsyncReducer.from(Reducer.first<number>()),
        AsyncReducer.from(Reducer.first<number>())
      )
    ).toEqual([0, 0]);
  });
  it('reduceAll close', async () => {
    await createResourceStream([1, 2, 3]).reduceAll(
      AsyncReducer.from(Reducer.count()),
      AsyncReducer.from(Reducer.count())
    );
    expect(close).toBeCalledTimes(1);
    close.mockReset();
    await createResourceStream([1, 2, 3]).reduceAll(
      AsyncReducer.from(Reducer.first<number>()),
      AsyncReducer.from(Reducer.first<number>())
    );
    expect(close).toBeCalledTimes(1);
  });

  it('reduceAllStream', async () => {
    expect(
      await AsyncStream.empty<number>()
        .reduceAllStream(
          AsyncReducer.from(Reducer.sum),
          AsyncReducer.from(Reducer.count())
        )
        .toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .reduceAllStream(
          AsyncReducer.from(Reducer.sum),
          AsyncReducer.from(Reducer.count())
        )
        .toArray()
    ).toEqual([
      [1, 1],
      [3, 2],
      [6, 3],
    ]);
  });
  it('reduceAllStream close', async () => {
    await testResForEach(
      createResourceStream([1, 2, 3]).reduceAllStream(
        AsyncReducer.from(Reducer.count()),
        AsyncReducer.from(Reducer.count())
      )
    );
    await testResForEach(
      createResourceStream([1, 2, 3]).reduceAllStream(
        AsyncReducer.from(Reducer.first()),
        AsyncReducer.from(Reducer.first())
      )
    );

    const exit1 = jest.fn();
    const exit2 = jest.fn();

    try {
      await createErrorStream()
        .reduceAllStream(
          AsyncReducer.createMono(
            0,
            () => 0,
            () => 0,
            exit1
          ),
          AsyncReducer.createMono(
            0,
            () => 0,
            () => 0,
            exit2
          )
        )
        .count();
    } catch {}

    expect(close).toBeCalledTimes(1);
    expect(exit1).toBeCalledTimes(1);
    expect(exit2).toBeCalledTimes(1);

    close.mockReset();
    exit1.mockReset();
    exit2.mockReset();

    try {
      await createResourceStream([1, 2, 3])
        .reduceAllStream(
          AsyncReducer.createMono(
            0,
            () => 0,
            () => 0,
            exit1
          ),
          AsyncReducer.createMono(0, Err, () => 0, exit2)
        )
        .count();
    } catch {}

    expect(close).toBeCalledTimes(1);
    expect(exit1).toBeCalledTimes(1);
    expect(exit2).toBeCalledTimes(1);
  });

  it('toArray', async () => {
    expect(await AsyncStream.empty().toArray()).toEqual([]);
    expect(await AsyncStream.of(1).toArray()).toEqual([1]);
    expect(await AsyncStream.from([1, 2, 3]).toArray()).toEqual([1, 2, 3]);
    const a1 = streamRange1.toArray();
    for (const source of sources) {
      expect(await source.toArray()).toEqual(a1);
    }
  });
  it('toArray close', async () => {
    await createResourceStream([1, 2, 3]).toArray();
    expect(close).toBeCalledTimes(1);

    close.mockReset();
    try {
      await createErrorStream().toArray();
    } catch {}
    expect(close).toBeCalledTimes(1);
  });

  it('toString', async () => {
    expect(AsyncStream.empty<string>().toString()).toBe('AsyncStream(<empty>)');
    expect(AsyncStream.of(1).toString()).toBe(
      'AsyncStream(...<potentially empty>)'
    );
  });

  it('zipWith', async () => {
    expect(
      await AsyncStream.zipWith(
        AsyncStream.empty<number>(),
        []
      )((a, b) => a + b).toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.zipWith(
        AsyncStream.of(1, 2, 3),
        []
      )((a, b) => a + b).toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.zipWith(
        AsyncStream.empty<number>(),
        [1, 2, 3]
      )((a, b) => a + b).toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.zipWith(
        AsyncStream.of(1, 2, 3),
        [1, 2, 3]
      )(async (a, b) => a + b).toArray()
    ).toEqual([2, 4, 6]);
    expect(
      await AsyncStream.zipWith(
        AsyncStream.of(1),
        [1, 2, 3]
      )((a, b) => a + b).toArray()
    ).toEqual([2]);
    expect(
      await AsyncStream.zipWith(AsyncStream.of(1, 2, 3), [1])(
        (a, b) => a + b
      ).toArray()
    ).toEqual([2]);
  });
  it('zipWith close', async () => {
    const s1 = createResourceStream([1, 2, 3]);

    {
      const close2 = jest.fn();
      const s2 = createResourceStream([4, 5, 6], close2);
      const res = AsyncStream.zipWith(s1, s2)((v1, v2) => [v1, v2] as const);
      await res.count();
      expect(close).toBeCalledTimes(1);
      expect(close2).toBeCalledTimes(1);
    }

    {
      close.mockReset();
      const close2 = jest.fn();
      const s2 = createResourceStream([4, 5], close2);
      const res = AsyncStream.zipWith(s1, s2)((v1, v2) => [v1, v2] as const);
      await res.count();
      expect(close).toBeCalledTimes(1);
      expect(close2).toBeCalledTimes(1);
    }

    {
      close.mockReset();
      const close2 = jest.fn();
      const s2 = createResourceStream([4, 5], close2);
      const res = AsyncStream.zipWith(s2, s1)((v1, v2) => [v1, v2] as const);
      await res.count();
      expect(close).toBeCalledTimes(1);
      expect(close2).toBeCalledTimes(1);
    }
  });
  it('zip', async () => {
    expect(AsyncStream.zip(AsyncStream.empty(), AsyncStream.empty())).toBe(
      AsyncStream.empty()
    );
    expect(AsyncStream.zip(AsyncStream.empty(), AsyncStream.of(1))).toBe(
      AsyncStream.empty()
    );
    expect(AsyncStream.zip(AsyncStream.of(1), AsyncStream.empty())).toBe(
      AsyncStream.empty()
    );
    expect(
      await AsyncStream.zip(AsyncStream.of(1), AsyncStream.of(2)).toArray()
    ).toEqual([[1, 2]]);
    expect(
      await AsyncStream.zip(
        AsyncStream.of(1, 2, 3),
        AsyncStream.of(2)
      ).toArray()
    ).toEqual([[1, 2]]);
    expect(
      await AsyncStream.zip(
        AsyncStream.of(1),
        AsyncStream.of(2, 3, 4)
      ).toArray()
    ).toEqual([[1, 2]]);
    expect(
      await AsyncStream.zip(
        AsyncStream.of(1, 2, 3, 4, 5),
        AsyncStream.of(2, 3, 4),
        AsyncStream.of(3, 4, 5, 6)
      ).toArray()
    ).toEqual([
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 5],
    ]);
    for (const source of sources) {
      expect(await AsyncStream.zip(source, source).toArray()).toEqual(
        await source.map((v) => [v, v]).toArray()
      );
    }
  });
  it('zip close', async () => {
    const s1 = createResourceStream([1, 2, 3]);

    {
      const close2 = jest.fn();
      const s2 = createResourceStream([4, 5, 6], close2);
      const res = AsyncStream.zip(s1, s2);
      await res.count();
      expect(close).toBeCalledTimes(1);
      expect(close2).toBeCalledTimes(1);
    }

    {
      close.mockReset();
      const close2 = jest.fn();
      const s2 = createResourceStream([4, 5], close2);
      const res = AsyncStream.zip(s1, s2);
      await res.count();
      expect(close).toBeCalledTimes(1);
      expect(close2).toBeCalledTimes(1);
    }

    {
      close.mockReset();
      const close2 = jest.fn();
      const s2 = createResourceStream([4, 5], close2);
      const res = AsyncStream.zip(s2, s1);
      await res.count();
      expect(close).toBeCalledTimes(1);
      expect(close2).toBeCalledTimes(1);
    }
  });
  it('zipAllWith', async () => {
    expect(
      await AsyncStream.zipAllWith(AsyncStream.empty<number>(), [])(
        10,
        (a, b) => a + b
      ).toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.zipAllWith(AsyncStream.of(1, 2, 3), [])(
        10,
        (a, b) => a + b
      ).toArray()
    ).toEqual([11, 12, 13]);
    expect(
      await AsyncStream.zipAllWith(AsyncStream.empty<number>(), [1, 2, 3])(
        10,
        (a, b) => a + b
      ).toArray()
    ).toEqual([11, 12, 13]);
    expect(
      await AsyncStream.zipAllWith(AsyncStream.of(1, 2, 3), [1, 2, 3])(
        10,
        (a, b) => a + b
      ).toArray()
    ).toEqual([2, 4, 6]);
    expect(
      await AsyncStream.zipAllWith(AsyncStream.of(1), [1, 2, 3])(
        10,
        (a, b) => a + b
      ).toArray()
    ).toEqual([2, 12, 13]);
    expect(
      await AsyncStream.zipAllWith(AsyncStream.of(1, 2, 3), [1])(
        10,
        (a, b) => a + b
      ).toArray()
    ).toEqual([2, 12, 13]);
  });
  it('zipAllWith close', async () => {
    const s1 = createResourceStream([1, 2, 3]);

    {
      const close2 = jest.fn();
      const s2 = createResourceStream([4, 5, 6], close2);
      const res = AsyncStream.zipAllWith(s1, s2)(-1, (v1, v2) => v1);
      await res.count();
      expect(close).toBeCalledTimes(1);
      expect(close2).toBeCalledTimes(1);
    }

    {
      close.mockReset();
      const close2 = jest.fn();
      const s2 = createResourceStream([4, 5], close2);
      const res = AsyncStream.zipAllWith(s1, s2)(
        -1,
        (v1, v2) => [v1, v2] as const
      );
      await res.count();
      expect(close).toBeCalledTimes(1);
      expect(close2).toBeCalledTimes(1);
    }

    {
      close.mockReset();
      const close2 = jest.fn();
      const s2 = createResourceStream([4, 5], close2);
      const res = AsyncStream.zipAllWith(s2, s1)(
        -1,
        (v1, v2) => [v1, v2] as const
      );
      await res.count();
      expect(close).toBeCalledTimes(1);
      expect(close2).toBeCalledTimes(1);
    }
  });

  it('zipAll', async () => {
    expect(
      await AsyncStream.zipAll(
        undefined,
        AsyncStream.empty(),
        AsyncStream.empty()
      ).toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.zipAll(
        undefined,
        AsyncStream.of(1),
        AsyncStream.empty()
      ).toArray()
    ).toEqual([[1, undefined]]);
    expect(
      await AsyncStream.zipAll(
        undefined,
        AsyncStream.empty(),
        AsyncStream.of(1)
      ).toArray()
    ).toEqual([[undefined, 1]]);
    expect(
      await AsyncStream.zipAll(
        undefined,
        AsyncStream.of(1),
        AsyncStream.of(2)
      ).toArray()
    ).toEqual([[1, 2]]);
    expect(
      await AsyncStream.zipAll(
        undefined,
        AsyncStream.of(1, 2, 3),
        AsyncStream.of(10, 11)
      ).toArray()
    ).toEqual([
      [1, 10],
      [2, 11],
      [3, undefined],
    ]);
  });
  it('zipAll close', async () => {
    const s1 = createResourceStream([1, 2, 3]);

    {
      const close2 = jest.fn();
      const s2 = createResourceStream([4, 5, 6], close2);
      const res = AsyncStream.zipAll(-1, s1, s2);
      await res.count();
      expect(close).toBeCalledTimes(1);
      expect(close2).toBeCalledTimes(1);
    }

    {
      close.mockReset();
      const close2 = jest.fn();
      const s2 = createResourceStream([4, 5], close2);
      const res = AsyncStream.zipAll(-1, s1, s2);
      await res.count();
      expect(close).toBeCalledTimes(1);
      expect(close2).toBeCalledTimes(1);
    }

    {
      close.mockReset();
      const close2 = jest.fn();
      const s2 = createResourceStream([4, 5], close2);
      const res = AsyncStream.zipAll(-1, s2, s1);
      await res.count();
      expect(close).toBeCalledTimes(1);
      expect(close2).toBeCalledTimes(1);
    }
  });

  it('unzip', async () => {
    const [u1l, u1r] = AsyncStream.unzip(
      AsyncStream.empty<[number, string]>(),
      2
    );
    expect(await u1l.toArray()).toEqual([]);
    expect(await u1r.toArray()).toEqual([]);
    const [u2l, u2r] = AsyncStream.unzip(
      AsyncStream.of<[number, string]>([1, 'a'], [2, 'b']),
      2
    );
    expect(await u2l.toArray()).toEqual([1, 2]);
    expect(await u2r.toArray()).toEqual(['a', 'b']);
  });

  it('unzip close', async () => {
    const [s1, s2] = AsyncStream.unzip(
      createResourceStream([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ] as [number, string][]),
      2
    );

    await s1.count();
    expect(close).toBeCalledTimes(1);

    close.mockReset();

    await s2.count();
    expect(close).toBeCalledTimes(1);
  });
});
