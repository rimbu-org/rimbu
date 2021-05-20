import { Stream } from '@rimbu/stream';
import { runSetRandomTestsWith } from '@rimbu/collection-types/test-utils/set/set-random';
import { SortedSet } from '../src';

runSetRandomTestsWith('SortedSet default', SortedSet.defaultContext<number>());

function runWith(name: string, context: SortedSet.Context<number>): void {
  describe(name, () => {
    it('sliceIndex', () => {
      expect(context.empty().sliceIndex({ amount: 10 })).toBe(context.empty());
      const set = context.from(Stream.range({ amount: 100 }));
      expect(set.sliceIndex({ amount: 3 }).toArray()).toEqual([0, 1, 2]);
      expect(set.sliceIndex({ start: 3, amount: 3 }).toArray()).toEqual([
        3,
        4,
        5,
      ]);
      expect(
        set.sliceIndex({ start: [3, false], amount: 3 }).toArray()
      ).toEqual([4, 5, 6]);
      expect(set.sliceIndex({ end: 3 }).toArray()).toEqual([0, 1, 2, 3]);
      expect(set.sliceIndex({ end: [3, false] }).toArray()).toEqual([0, 1, 2]);
      expect(set.sliceIndex({ start: 97 }).toArray()).toEqual([97, 98, 99]);
      expect(set.sliceIndex({ start: [97, false] }).toArray()).toEqual([
        98,
        99,
      ]);
      expect(set.sliceIndex({ start: 0, end: 3 }).toArray()).toEqual([
        0,
        1,
        2,
        3,
      ]);
      expect(
        set.sliceIndex({ start: [0, false], end: [3, false] }).toArray()
      ).toEqual([1, 2]);

      expect(set.sliceIndex({ start: -3 }).toArray()).toEqual([97, 98, 99]);
      expect(set.sliceIndex({ start: [-3, false] }).toArray()).toEqual([
        98,
        99,
      ]);

      expect(set.sliceIndex({ start: -3, end: -2 }).toArray()).toEqual([
        97,
        98,
      ]);
      expect(set.sliceIndex({ start: -3, amount: 2 }).toArray()).toEqual([
        97,
        98,
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
        3,
        4,
        5,
      ]);
      expect(
        set.streamSliceIndex({ start: [3, false], amount: 3 }).toArray()
      ).toEqual([4, 5, 6]);
      expect(set.streamSliceIndex({ end: 3 }).toArray()).toEqual([0, 1, 2, 3]);
      expect(set.streamSliceIndex({ end: [3, false] }).toArray()).toEqual([
        0,
        1,
        2,
      ]);
      expect(set.streamSliceIndex({ start: 97 }).toArray()).toEqual([
        97,
        98,
        99,
      ]);
      expect(set.streamSliceIndex({ start: [97, false] }).toArray()).toEqual([
        98,
        99,
      ]);
      expect(set.streamSliceIndex({ start: 0, end: 3 }).toArray()).toEqual([
        0,
        1,
        2,
        3,
      ]);
      expect(
        set.streamSliceIndex({ start: [0, false], end: [3, false] }).toArray()
      ).toEqual([1, 2]);

      expect(set.streamSliceIndex({ start: -3 }).toArray()).toEqual([
        97,
        98,
        99,
      ]);
      expect(set.streamSliceIndex({ start: [-3, false] }).toArray()).toEqual([
        98,
        99,
      ]);

      expect(set.streamSliceIndex({ start: -3, end: -2 }).toArray()).toEqual([
        97,
        98,
      ]);
      expect(set.streamSliceIndex({ start: -3, amount: 2 }).toArray()).toEqual([
        97,
        98,
      ]);
    });

    it('streamRange', () => {
      expect(context.empty().streamRange({ start: 3 })).toBe(Stream.empty());
      const set = context.from(Stream.range({ amount: 100 }));
      expect(set.streamRange({ end: 3 }).toArray()).toEqual([0, 1, 2, 3]);
      expect(set.streamRange({ end: [3, false] }).toArray()).toEqual([0, 1, 2]);
      expect(set.streamRange({ end: 3.5 }).toArray()).toEqual([0, 1, 2, 3]);
      expect(set.streamRange({ end: [3.5, false] }).toArray()).toEqual([
        0,
        1,
        2,
        3,
      ]);
      expect(set.streamRange({ start: 97 }).toArray()).toEqual([97, 98, 99]);
      expect(set.streamRange({ start: [97, false] }).toArray()).toEqual([
        98,
        99,
      ]);
      expect(set.streamRange({ start: 0, end: 3 }).toArray()).toEqual([
        0,
        1,
        2,
        3,
      ]);
      expect(
        set.streamRange({ start: [0, false], end: [3, false] }).toArray()
      ).toEqual([1, 2]);
      expect(set.streamRange({ start: 97.5 }).toArray()).toEqual([98, 99]);
      expect(set.streamRange({ start: [97.5, false] }).toArray()).toEqual([
        98,
        99,
      ]);
      expect(set.streamRange({ start: 0.5, end: 3.5 }).toArray()).toEqual([
        1,
        2,
        3,
      ]);
      expect(
        set.streamRange({ start: [0.5, false], end: [3.5, false] }).toArray()
      ).toEqual([1, 2, 3]);
    });
  });
}

runWith('SortedSet default', SortedSet.createContext());
