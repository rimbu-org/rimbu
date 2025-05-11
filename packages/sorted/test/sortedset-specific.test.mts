import { Reducer, Stream } from '@rimbu/stream';

import { SortedSet } from '../src/main/index.mjs';

function runWith(name: string, context: SortedSet.Context<number>): void {
  describe(name, () => {
    it('stream reversed', () => {
      expect(context.empty().stream({ reversed: true }).toArray()).toEqual([]);
      expect(
        context.of(8, 3, 5, 2).stream({ reversed: true }).toArray()
      ).toEqual([8, 5, 3, 2]);
      const set = context.from(Stream.range({ amount: 100 }));
      expect(set.stream({ reversed: true }).toArray()).toEqual(
        Stream.range({ start: 99, end: 0 }, { delta: -1 }).toArray()
      );
    });

    it('sliceIndex', () => {
      expect(context.empty().sliceIndex({ amount: 10 })).toBe(context.empty());
      const set = context.from(Stream.range({ amount: 100 }));
      expect(set.sliceIndex({ amount: 3 }).toArray()).toEqual([0, 1, 2]);
      expect(set.sliceIndex({ start: 3, amount: 3 }).toArray()).toEqual([
        3, 4, 5,
      ]);
      expect(
        set.sliceIndex({ start: [3, false], amount: 3 }).toArray()
      ).toEqual([4, 5, 6]);
      expect(set.sliceIndex({ end: 3 }).toArray()).toEqual([0, 1, 2, 3]);
      expect(set.sliceIndex({ end: [3, false] }).toArray()).toEqual([0, 1, 2]);
      expect(set.sliceIndex({ start: 97 }).toArray()).toEqual([97, 98, 99]);
      expect(set.sliceIndex({ start: [97, false] }).toArray()).toEqual([
        98, 99,
      ]);
      expect(set.sliceIndex({ start: 0, end: 3 }).toArray()).toEqual([
        0, 1, 2, 3,
      ]);
      expect(
        set.sliceIndex({ start: [0, false], end: [3, false] }).toArray()
      ).toEqual([1, 2]);

      expect(set.sliceIndex({ start: -3 }).toArray()).toEqual([97, 98, 99]);
      expect(set.sliceIndex({ start: [-3, false] }).toArray()).toEqual([
        98, 99,
      ]);

      expect(set.sliceIndex({ start: -3, end: -2 }).toArray()).toEqual([
        97, 98,
      ]);
      expect(set.sliceIndex({ start: -3, amount: 2 }).toArray()).toEqual([
        97, 98,
      ]);
    });

    it('slice', () => {
      expect(context.empty().slice({ start: 3 })).toBe(context.empty());
      const set = context.from(Stream.range({ amount: 100 }));
      expect(set.slice({ end: 3 }).toArray()).toEqual([0, 1, 2, 3]);
      expect(set.slice({ end: [3, false] }).toArray()).toEqual([0, 1, 2]);
      expect(set.slice({ end: 3.5 }).toArray()).toEqual([0, 1, 2, 3]);
      expect(set.slice({ end: [3.5, false] }).toArray()).toEqual([0, 1, 2, 3]);
      expect(set.slice({ start: 97 }).toArray()).toEqual([97, 98, 99]);
      expect(set.slice({ start: [97, false] }).toArray()).toEqual([98, 99]);
      expect(set.slice({ start: 0, end: 3 }).toArray()).toEqual([0, 1, 2, 3]);
      expect(
        set.slice({ start: [0, false], end: [3, false] }).toArray()
      ).toEqual([1, 2]);
      expect(set.slice({ start: 97.5 }).toArray()).toEqual([98, 99]);
      expect(set.slice({ start: [97.5, false] }).toArray()).toEqual([98, 99]);
      expect(set.slice({ start: 0.5, end: 3.5 }).toArray()).toEqual([1, 2, 3]);
      expect(
        set.slice({ start: [0.5, false], end: [3.5, false] }).toArray()
      ).toEqual([1, 2, 3]);
    });

    it('streamSliceIndex', () => {
      expect(context.empty().streamSliceIndex({ amount: 10 })).toBe(
        Stream.empty()
      );
      const set = context.from(Stream.range({ amount: 100 }));
      expect(set.streamSliceIndex({ amount: 3 }).toArray()).toEqual([0, 1, 2]);
      expect(set.streamSliceIndex({ start: 3, amount: 3 }).toArray()).toEqual([
        3, 4, 5,
      ]);
      expect(
        set.streamSliceIndex({ start: [3, false], amount: 3 }).toArray()
      ).toEqual([4, 5, 6]);
      expect(set.streamSliceIndex({ end: 3 }).toArray()).toEqual([0, 1, 2, 3]);
      expect(set.streamSliceIndex({ end: [3, false] }).toArray()).toEqual([
        0, 1, 2,
      ]);
      expect(set.streamSliceIndex({ start: 97 }).toArray()).toEqual([
        97, 98, 99,
      ]);
      expect(set.streamSliceIndex({ start: [97, false] }).toArray()).toEqual([
        98, 99,
      ]);
      expect(set.streamSliceIndex({ start: 0, end: 3 }).toArray()).toEqual([
        0, 1, 2, 3,
      ]);
      expect(
        set.streamSliceIndex({ start: [0, false], end: [3, false] }).toArray()
      ).toEqual([1, 2]);

      expect(set.streamSliceIndex({ start: -3 }).toArray()).toEqual([
        97, 98, 99,
      ]);
      expect(set.streamSliceIndex({ start: [-3, false] }).toArray()).toEqual([
        98, 99,
      ]);

      expect(set.streamSliceIndex({ start: -3, end: -2 }).toArray()).toEqual([
        97, 98,
      ]);
      expect(set.streamSliceIndex({ start: -3, amount: 2 }).toArray()).toEqual([
        97, 98,
      ]);
    });

    it('streamSliceIndex reversed', () => {
      expect(
        context.empty().streamSliceIndex({ amount: 10 }, { reversed: true })
      ).toBe(Stream.empty());
      const set = context.from(Stream.range({ amount: 100 }));
      expect(
        set.streamSliceIndex({ amount: 3 }, { reversed: true }).toArray()
      ).toEqual([2, 1, 0]);
      expect(
        set
          .streamSliceIndex({ start: 3, amount: 3 }, { reversed: true })
          .toArray()
      ).toEqual([5, 4, 3]);
      expect(
        set
          .streamSliceIndex(
            { start: [3, false], amount: 3 },
            { reversed: true }
          )
          .toArray()
      ).toEqual([6, 5, 4]);
      expect(
        set.streamSliceIndex({ end: 3 }, { reversed: true }).toArray()
      ).toEqual([3, 2, 1, 0]);
      expect(
        set.streamSliceIndex({ end: [3, false] }, { reversed: true }).toArray()
      ).toEqual([2, 1, 0]);
      expect(
        set.streamSliceIndex({ start: 97 }, { reversed: true }).toArray()
      ).toEqual([99, 98, 97]);
      expect(
        set
          .streamSliceIndex({ start: [97, false] }, { reversed: true })
          .toArray()
      ).toEqual([99, 98]);
      expect(
        set.streamSliceIndex({ start: 0, end: 3 }, { reversed: true }).toArray()
      ).toEqual([3, 2, 1, 0]);
      expect(
        set
          .streamSliceIndex(
            { start: [0, false], end: [3, false] },
            { reversed: true }
          )
          .toArray()
      ).toEqual([2, 1]);

      expect(
        set.streamSliceIndex({ start: -3 }, { reversed: true }).toArray()
      ).toEqual([99, 98, 97]);
      expect(
        set
          .streamSliceIndex({ start: [-3, false] }, { reversed: true })
          .toArray()
      ).toEqual([99, 98]);

      expect(
        set
          .streamSliceIndex({ start: -3, end: -2 }, { reversed: true })
          .toArray()
      ).toEqual([98, 97]);
      expect(
        set
          .streamSliceIndex({ start: -3, amount: 2 }, { reversed: true })
          .toArray()
      ).toEqual([98, 97]);
    });

    it('streamRange', () => {
      expect(context.empty().streamRange({ start: 3 })).toBe(Stream.empty());
      const set = context.from(Stream.range({ amount: 100 }));
      expect(set.streamRange({ end: 3 }).toArray()).toEqual([0, 1, 2, 3]);
      expect(set.streamRange({ end: [3, false] }).toArray()).toEqual([0, 1, 2]);
      expect(set.streamRange({ end: 3.5 }).toArray()).toEqual([0, 1, 2, 3]);
      expect(set.streamRange({ end: [3.5, false] }).toArray()).toEqual([
        0, 1, 2, 3,
      ]);
      expect(set.streamRange({ start: 97 }).toArray()).toEqual([97, 98, 99]);
      expect(set.streamRange({ start: [97, false] }).toArray()).toEqual([
        98, 99,
      ]);
      expect(set.streamRange({ start: 0, end: 3 }).toArray()).toEqual([
        0, 1, 2, 3,
      ]);
      expect(
        set.streamRange({ start: [0, false], end: [3, false] }).toArray()
      ).toEqual([1, 2]);
      expect(set.streamRange({ start: 97.5 }).toArray()).toEqual([98, 99]);
      expect(set.streamRange({ start: [97.5, false] }).toArray()).toEqual([
        98, 99,
      ]);
      expect(set.streamRange({ start: 0.5, end: 3.5 }).toArray()).toEqual([
        1, 2, 3,
      ]);
      expect(
        set.streamRange({ start: [0.5, false], end: [3.5, false] }).toArray()
      ).toEqual([1, 2, 3]);
    });

    it('streamRange reversed', () => {
      expect(
        context.empty().streamRange({ start: 3 }, { reversed: true })
      ).toBe(Stream.empty());
      const set = context.from(Stream.range({ amount: 100 }));
      expect(set.streamRange({ end: 3 }, { reversed: true }).toArray()).toEqual(
        [3, 2, 1, 0]
      );
      expect(
        set.streamRange({ end: [3, false] }, { reversed: true }).toArray()
      ).toEqual([2, 1, 0]);
      expect(
        set.streamRange({ end: 3.5 }, { reversed: true }).toArray()
      ).toEqual([3, 2, 1, 0]);
      expect(
        set.streamRange({ end: [3.5, false] }, { reversed: true }).toArray()
      ).toEqual([3, 2, 1, 0]);
      expect(
        set.streamRange({ start: 97 }, { reversed: true }).toArray()
      ).toEqual([99, 98, 97]);
      expect(
        set.streamRange({ start: [97, false] }, { reversed: true }).toArray()
      ).toEqual([99, 98]);
      expect(
        set.streamRange({ start: 0, end: 3 }, { reversed: true }).toArray()
      ).toEqual([3, 2, 1, 0]);
      expect(
        set
          .streamRange(
            { start: [0, false], end: [3, false] },
            { reversed: true }
          )
          .toArray()
      ).toEqual([2, 1]);
      expect(
        set.streamRange({ start: 97.5 }, { reversed: true }).toArray()
      ).toEqual([99, 98]);
      expect(
        set.streamRange({ start: [97.5, false] }, { reversed: true }).toArray()
      ).toEqual([99, 98]);
      expect(
        set.streamRange({ start: 0.5, end: 3.5 }, { reversed: true }).toArray()
      ).toEqual([3, 2, 1]);
      expect(
        set
          .streamRange(
            { start: [0.5, false], end: [3.5, false] },
            { reversed: true }
          )
          .toArray()
      ).toEqual([3, 2, 1]);
    });

    it('min', () => {
      expect(context.empty().min()).toBe(undefined);
      expect(context.empty().min(1)).toBe(1);
      const input = Stream.randomInt(0, 1000).take(100);
      const [min, set] = input.reduce([
        Reducer.min(),
        context.reducer<number>(),
      ]);
      expect(set.min()).toBe(min);
    });

    it('max', () => {
      expect(context.empty().min()).toBe(undefined);
      expect(context.empty().min(1)).toBe(1);
      const input = Stream.randomInt(0, 1000).take(100);
      const [max, set] = input.reduce([
        Reducer.max(),
        context.reducer<number>(),
      ]);
      expect(set.max()).toBe(max);
    });

    it('findIndex', () => {
      expect(context.empty().findIndex(5)).toBe(-1);

      const set = context.of(8, 3, 5, 2);
      expect(set.findIndex(2)).toBe(0);
      expect(set.findIndex(3)).toBe(1);
      expect(set.findIndex(5)).toBe(2);
      expect(set.findIndex(8)).toBe(3);
      expect(set.findIndex(10 as any)).toBe(-1);

      const largeSet = context.from(Stream.range({ amount: 100 }));
      expect(largeSet.findIndex(0)).toBe(0);
      expect(largeSet.findIndex(50)).toBe(50);
      expect(largeSet.findIndex(99)).toBe(99);
      expect(largeSet.findIndex(100)).toBe(-1);

      for (const value of largeSet) {
        expect(largeSet.findIndex(value)).toBe(value);
      }
    });
  });
}

runWith('SortedSet default', SortedSet.createContext());
runWith(
  'SortedSet block bits 2',
  SortedSet.createContext({ blockSizeBits: 2 })
);
