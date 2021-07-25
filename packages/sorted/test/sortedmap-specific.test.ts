import { Stream } from '@rimbu/stream';
import { SortedMap } from '../src';

function entries<T>(...keys: T[]): [T, T][] {
  return keys.map((v) => [v, v]);
}

function runWith(name: string, context: SortedMap.Context<number>): void {
  describe(name, () => {
    it('sliceIndex', () => {
      expect(context.empty().sliceIndex({ amount: 10 })).toBe(context.empty());
      const map = context.from(
        Stream.range({ amount: 100 }).map((v) => [v, v])
      );

      expect(map.sliceIndex({ amount: 3 }).toArray()).toEqual(entries(0, 1, 2));
      expect(map.sliceIndex({ start: 3, amount: 3 }).toArray()).toEqual(
        entries(3, 4, 5)
      );
      expect(
        map.sliceIndex({ start: [3, false], amount: 3 }).toArray()
      ).toEqual(entries(4, 5, 6));
      expect(map.sliceIndex({ end: 3 }).toArray()).toEqual(entries(0, 1, 2, 3));
      expect(map.sliceIndex({ end: [3, false] }).toArray()).toEqual(
        entries(0, 1, 2)
      );
      expect(map.sliceIndex({ start: 97 }).toArray()).toEqual(
        entries(97, 98, 99)
      );
      expect(map.sliceIndex({ start: [97, false] }).toArray()).toEqual(
        entries(98, 99)
      );
      expect(map.sliceIndex({ start: 0, end: 3 }).toArray()).toEqual(
        entries(0, 1, 2, 3)
      );
      expect(
        map.sliceIndex({ start: [0, false], end: [3, false] }).toArray()
      ).toEqual(entries(1, 2));

      expect(map.sliceIndex({ start: -3 }).toArray()).toEqual(
        entries(97, 98, 99)
      );
      expect(map.sliceIndex({ start: [-3, false] }).toArray()).toEqual(
        entries(98, 99)
      );

      expect(map.sliceIndex({ start: -3, end: -2 }).toArray()).toEqual(
        entries(97, 98)
      );
      expect(map.sliceIndex({ start: -3, amount: 2 }).toArray()).toEqual(
        entries(97, 98)
      );
    });

    it('slice', () => {
      expect(context.empty().slice({ start: 3 })).toBe(context.empty());
      const map = context.from(
        Stream.range({ amount: 100 }).map((v) => [v, v])
      );
      expect(map.slice({ end: 3 }).toArray()).toEqual(entries(0, 1, 2, 3));
      expect(map.slice({ end: [3, false] }).toArray()).toEqual(
        entries(0, 1, 2)
      );
      expect(map.slice({ end: 3.5 }).toArray()).toEqual(entries(0, 1, 2, 3));
      expect(map.slice({ end: [3.5, false] }).toArray()).toEqual(
        entries(0, 1, 2, 3)
      );
      expect(map.slice({ start: 97 }).toArray()).toEqual(entries(97, 98, 99));
      expect(map.slice({ start: [97, false] }).toArray()).toEqual(
        entries(98, 99)
      );
      expect(map.slice({ start: 0, end: 3 }).toArray()).toEqual(
        entries(0, 1, 2, 3)
      );
      expect(
        map.slice({ start: [0, false], end: [3, false] }).toArray()
      ).toEqual(entries(1, 2));
      expect(map.slice({ start: 97.5 }).toArray()).toEqual(entries(98, 99));
      expect(map.slice({ start: [97.5, false] }).toArray()).toEqual(
        entries(98, 99)
      );
      expect(map.slice({ start: 0.5, end: 3.5 }).toArray()).toEqual(
        entries(1, 2, 3)
      );
      expect(
        map.slice({ start: [0.5, false], end: [3.5, false] }).toArray()
      ).toEqual(entries(1, 2, 3));
    });

    it('streamSliceIndex', () => {
      expect(context.empty().streamSliceIndex({ amount: 10 })).toBe(
        Stream.empty()
      );
      const map = context.from(
        Stream.range({ amount: 100 }).map((v) => [v, v])
      );
      expect(map.streamSliceIndex({ amount: 3 }).toArray()).toEqual(
        entries(0, 1, 2)
      );
      expect(map.streamSliceIndex({ start: 3, amount: 3 }).toArray()).toEqual(
        entries(3, 4, 5)
      );
      expect(
        map.streamSliceIndex({ start: [3, false], amount: 3 }).toArray()
      ).toEqual(entries(4, 5, 6));
      expect(map.streamSliceIndex({ end: 3 }).toArray()).toEqual(
        entries(0, 1, 2, 3)
      );
      expect(map.streamSliceIndex({ end: [3, false] }).toArray()).toEqual(
        entries(0, 1, 2)
      );
      expect(map.streamSliceIndex({ start: 97 }).toArray()).toEqual(
        entries(97, 98, 99)
      );
      expect(map.streamSliceIndex({ start: [97, false] }).toArray()).toEqual(
        entries(98, 99)
      );
      expect(map.streamSliceIndex({ start: 0, end: 3 }).toArray()).toEqual(
        entries(0, 1, 2, 3)
      );
      expect(
        map.streamSliceIndex({ start: [0, false], end: [3, false] }).toArray()
      ).toEqual(entries(1, 2));

      expect(map.streamSliceIndex({ start: -3 }).toArray()).toEqual(
        entries(97, 98, 99)
      );
      expect(map.streamSliceIndex({ start: [-3, false] }).toArray()).toEqual(
        entries(98, 99)
      );

      expect(map.streamSliceIndex({ start: -3, end: -2 }).toArray()).toEqual(
        entries(97, 98)
      );
      expect(map.streamSliceIndex({ start: -3, amount: 2 }).toArray()).toEqual(
        entries(97, 98)
      );
    });

    it('streamRange', () => {
      expect(context.empty().streamRange({ start: 3 })).toBe(Stream.empty());
      const map = context.from(
        Stream.range({ amount: 100 }).map((v) => [v, v])
      );
      expect(map.streamRange({ end: 3 }).toArray()).toEqual(
        entries(0, 1, 2, 3)
      );
      expect(map.streamRange({ end: [3, false] }).toArray()).toEqual(
        entries(0, 1, 2)
      );
      expect(map.streamRange({ end: 3.5 }).toArray()).toEqual(
        entries(0, 1, 2, 3)
      );
      expect(map.streamRange({ end: [3.5, false] }).toArray()).toEqual(
        entries(0, 1, 2, 3)
      );
      expect(map.streamRange({ start: 97 }).toArray()).toEqual(
        entries(97, 98, 99)
      );
      expect(map.streamRange({ start: [97, false] }).toArray()).toEqual(
        entries(98, 99)
      );
      expect(map.streamRange({ start: 0, end: 3 }).toArray()).toEqual(
        entries(0, 1, 2, 3)
      );
      expect(
        map.streamRange({ start: [0, false], end: [3, false] }).toArray()
      ).toEqual(entries(1, 2));
      expect(map.streamRange({ start: 97.5 }).toArray()).toEqual(
        entries(98, 99)
      );
      expect(map.streamRange({ start: [97.5, false] }).toArray()).toEqual(
        entries(98, 99)
      );
      expect(map.streamRange({ start: 0.5, end: 3.5 }).toArray()).toEqual(
        entries(1, 2, 3)
      );
      expect(
        map.streamRange({ start: [0.5, false], end: [3.5, false] }).toArray()
      ).toEqual(entries(1, 2, 3));
    });
  });
}

runWith('SortedMap default', SortedMap.createContext());
runWith(
  'SortedMap block bits 2',
  SortedMap.createContext({ blockSizeBits: 2 })
);
