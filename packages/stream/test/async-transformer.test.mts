import { Reducer, Transformer } from '../src/main/index.mjs';

import { AsyncStream, AsyncTransformer } from '../src/async/index.mjs';

describe('AsyncTransformer', () => {
  it('window', async () => {
    expect(
      await AsyncStream.empty().transform(AsyncTransformer.window(3)).toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.of(1, 2).transform(AsyncTransformer.window(3)).toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .transform(AsyncTransformer.window(3))
        .toArray()
    ).toEqual([[1, 2, 3]]);
    expect(
      await AsyncStream.of(1, 2, 3, 4, 5)
        .transform(AsyncTransformer.window(3))
        .toArray()
    ).toEqual([[1, 2, 3]]);
    expect(
      await AsyncStream.of(1, 2, 3, 4, 5, 6)
        .transform(AsyncTransformer.window(3))
        .toArray()
    ).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it('sliding window', async () => {
    expect(
      await AsyncStream.of(1, 2, 3, 4, 5, 6)
        .transform(AsyncTransformer.window(3, { skipAmount: 1 }))
        .toArray()
    ).toEqual([
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 5],
      [4, 5, 6],
    ]);
  });

  it('collects to different targets', async () => {
    expect(
      await AsyncStream.of(1, 2, 3, 4, 5, 6)
        .transform(
          AsyncTransformer.window(3, {
            skipAmount: 1,
            collector: Reducer.toJSSet<number>(),
          })
        )
        .toArray()
    ).toEqual([
      new Set([1, 2, 3]),
      new Set([2, 3, 4]),
      new Set([3, 4, 5]),
      new Set([4, 5, 6]),
    ]);
  });

  it('distinctPrevious', async () => {
    expect(
      await AsyncStream.empty<number>()
        .transform(
          AsyncTransformer.from(Transformer.distinctPrevious<number>())
        )
        .toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.of(1, 2, 2, 3, 1, 1, 3)
        .transform(
          AsyncTransformer.from(Transformer.distinctPrevious<number>())
        )
        .toArray()
    ).toEqual([1, 2, 3, 1, 3]);
  });

  it('flatMap', async () => {
    expect(
      await AsyncStream.empty<number>()
        .transform(AsyncTransformer.flatMap(async (v) => [v, v]))
        .toArray()
    ).toEqual([]);

    expect(
      await AsyncStream.of(1, 2, 3)
        .transform(AsyncTransformer.flatMap(async (v) => [v, v]))
        .toArray()
    ).toEqual([1, 1, 2, 2, 3, 3]);
  });

  it('filter', async () => {
    async function isEven(v: number) {
      return v % 2 === 0;
    }

    expect(
      await AsyncStream.empty<number>()
        .transform(AsyncTransformer.filter(isEven))
        .toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .transform(AsyncTransformer.filter(isEven))
        .toArray()
    ).toEqual([2]);
    expect(
      await AsyncStream.of(1, 2, 3)
        .transform(AsyncTransformer.filter(isEven, { negate: true }))
        .toArray()
    ).toEqual([1, 3]);
  });

  it('collect', async () => {
    expect(
      await AsyncStream.empty<number>()
        .transform(
          AsyncTransformer.collect(async (v, _, skip) =>
            v % 2 === 0 ? String(v) : skip
          )
        )
        .toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.of(1, 2, 3, 4)
        .transform(
          AsyncTransformer.collect(async (v, _, skip) =>
            v % 2 === 0 ? String(v) : skip
          )
        )
        .toArray()
    ).toEqual(['2', '4']);
  });
});
