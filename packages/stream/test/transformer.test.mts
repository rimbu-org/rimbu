import { describe, expect, it } from 'bun:test';

import { Stream } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { Transformer } from '@rimbu/stream/transformer';

describe('Transformer', () => {
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
      Stream.of(1, 2, 3, 4, 5, 6)
        .transform(Transformer.window(3, { skipAmount: 1 }))
        .toArray()
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
        .transform(
          Transformer.window(3, { skipAmount: 1, collector: Reducer.toJSSet() })
        )
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

  it('flatMap', () => {
    expect(
      Stream.empty<number>()
        .transform(Transformer.flatMap((v) => [v, v]))
        .toArray()
    ).toEqual([]);

    expect(
      Stream.of(1, 2, 3)
        .transform(Transformer.flatMap((v) => [v, v]))
        .toArray()
    ).toEqual([1, 1, 2, 2, 3, 3]);
  });

  it('filter', () => {
    function isEven(v: number) {
      return v % 2 === 0;
    }

    expect(
      Stream.empty<number>().transform(Transformer.filter(isEven)).toArray()
    ).toEqual([]);
    expect(
      Stream.of(1, 2, 3).transform(Transformer.filter(isEven)).toArray()
    ).toEqual([2]);
    expect(
      Stream.of(1, 2, 3)
        .transform(Transformer.filter(isEven, { negate: true }))
        .toArray()
    ).toEqual([1, 3]);
  });

  it('collect', () => {
    expect(
      Stream.empty<number>()
        .transform(
          Transformer.collect((v, _, skip) => (v % 2 === 0 ? String(v) : skip))
        )
        .toArray()
    ).toEqual([]);
    expect(
      Stream.of(1, 2, 3, 4)
        .transform(
          Transformer.collect((v, _, skip) => (v % 2 === 0 ? String(v) : skip))
        )
        .toArray()
    ).toEqual(['2', '4']);
  });
});
