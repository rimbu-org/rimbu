import { Reducer } from '@rimbu/common';

import { Stream, Transformer } from '../src/main/index.mjs';

describe('Collector', () => {
  it('window', () => {
    expect(Stream.empty().transform(Transformer.window(3)).toArray()).toEqual(
      []
    );
    expect(Stream.of(1, 2).transform(Transformer.window(3)).toArray()).toEqual(
      []
    );
    expect(
      Stream.of(1, 2, 3).transform(Transformer.window(3)).toArray()
    ).toEqual([[1, 2, 3]]);
    expect(
      Stream.of(1, 2, 3, 4, 5).transform(Transformer.window(3)).toArray()
    ).toEqual([[1, 2, 3]]);
    expect(
      Stream.of(1, 2, 3, 4, 5, 6).transform(Transformer.window(3)).toArray()
    ).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it('sliding window', () => {
    expect(
      Stream.of(1, 2, 3, 4, 5, 6).transform(Transformer.window(3, 1)).toArray()
    ).toEqual([
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 5],
      [4, 5, 6],
    ]);
  });

  it('collects to different targets', () => {
    expect(
      Stream.of(1, 2, 3, 4, 5, 6)
        .transform(Transformer.window(3, 1, Reducer.toJSSet()))
        .toArray()
    ).toEqual([
      new Set([1, 2, 3]),
      new Set([2, 3, 4]),
      new Set([3, 4, 5]),
      new Set([4, 5, 6]),
    ]);
  });

  it('distinctPrevious', () => {
    expect(
      Stream.empty<number>().transform(Transformer.distinctPrevious()).toArray()
    ).toEqual([]);
    expect(
      Stream.of(1, 2, 2, 3, 1, 1, 3)
        .transform(Transformer.distinctPrevious())
        .toArray()
    ).toEqual([1, 2, 3, 1, 3]);
  });
});
