import { Stream } from '@rimbu/stream';

import { SortedMap } from '../src/main/index.mjs';

function entries<T>(...keys: T[]): [T, T][] {
  return keys.map((v) => [v, v]);
}

function runWith(name: string, context: SortedMap.Context<number>): void {
  describe(name, () => {
    it('stream reversed', () => {
      expect(context.empty().stream({ reversed: true }).toArray()).toEqual([]);
      expect(
        context.from(entries(8, 3, 5, 2)).stream({ reversed: true }).toArray()
      ).toEqual(entries(8, 5, 3, 2));
      const map = context.from(
        Stream.range({ amount: 100 }).map((v) => [v, v])
      );
      expect(map.stream({ reversed: true }).toArray()).toEqual(
        Stream.range({ start: 99, end: 0 }, { delta: -1 })
          .map((v) => [v, v])
          .toArray()
      );
    });

    it('streamKeys reversed', () => {
      expect(context.empty().streamKeys({ reversed: true }).toArray()).toEqual(
        []
      );
      expect(
        context
          .from(entries(8, 3, 5, 2))
          .streamKeys({ reversed: true })
          .toArray()
      ).toEqual([8, 5, 3, 2]);
      const map = context.from(
        Stream.range({ amount: 100 }).map((v) => [v, v])
      );
      expect(map.streamKeys({ reversed: true }).toArray()).toEqual(
        Stream.range({ start: 99, end: 0 }, { delta: -1 }).toArray()
      );
    });

    it('streamValues reversed', () => {
      expect(
        context.empty().streamValues({ reversed: true }).toArray()
      ).toEqual([]);
      expect(
        context
          .from(entries(8, 3, 5, 2))
          .streamValues({ reversed: true })
          .toArray()
      ).toEqual([8, 5, 3, 2]);
      const map = context.from(
        Stream.range({ amount: 100 }).map((v) => [v, v])
      );
      expect(map.streamValues({ reversed: true }).toArray()).toEqual(
        Stream.range({ start: 99, end: 0 }, { delta: -1 }).toArray()
      );
    });

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

    it('streamSliceIndex reversed', () => {
      expect(
        context.empty().streamSliceIndex({ amount: 10 }, { reversed: true })
      ).toBe(Stream.empty());
      const map = context.from(
        Stream.range({ amount: 100 }).map((v) => [v, v])
      );
      expect(
        map.streamSliceIndex({ amount: 3 }, { reversed: true }).toArray()
      ).toEqual(entries(2, 1, 0));
      expect(
        map
          .streamSliceIndex({ start: 3, amount: 3 }, { reversed: true })
          .toArray()
      ).toEqual(entries(5, 4, 3));
      expect(
        map
          .streamSliceIndex(
            { start: [3, false], amount: 3 },
            { reversed: true }
          )
          .toArray()
      ).toEqual(entries(6, 5, 4));
      expect(
        map.streamSliceIndex({ end: 3 }, { reversed: true }).toArray()
      ).toEqual(entries(3, 2, 1, 0));
      expect(
        map.streamSliceIndex({ end: [3, false] }, { reversed: true }).toArray()
      ).toEqual(entries(2, 1, 0));
      expect(
        map.streamSliceIndex({ start: 97 }, { reversed: true }).toArray()
      ).toEqual(entries(99, 98, 97));
      expect(
        map
          .streamSliceIndex({ start: [97, false] }, { reversed: true })
          .toArray()
      ).toEqual(entries(99, 98));
      expect(
        map.streamSliceIndex({ start: 0, end: 3 }, { reversed: true }).toArray()
      ).toEqual(entries(3, 2, 1, 0));
      expect(
        map
          .streamSliceIndex(
            { start: [0, false], end: [3, false] },
            { reversed: true }
          )
          .toArray()
      ).toEqual(entries(2, 1));

      expect(
        map.streamSliceIndex({ start: -3 }, { reversed: true }).toArray()
      ).toEqual(entries(99, 98, 97));
      expect(
        map
          .streamSliceIndex({ start: [-3, false] }, { reversed: true })
          .toArray()
      ).toEqual(entries(99, 98));

      expect(
        map
          .streamSliceIndex({ start: -3, end: -2 }, { reversed: true })
          .toArray()
      ).toEqual(entries(98, 97));
      expect(
        map
          .streamSliceIndex({ start: -3, amount: 2 }, { reversed: true })
          .toArray()
      ).toEqual(entries(98, 97));
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

    it('streamRange reversed', () => {
      expect(
        context.empty().streamRange({ start: 3 }, { reversed: true })
      ).toBe(Stream.empty());
      const map = context.from(
        Stream.range({ amount: 100 }).map((v) => [v, v])
      );
      expect(map.streamRange({ end: 3 }, { reversed: true }).toArray()).toEqual(
        entries(3, 2, 1, 0)
      );
      expect(
        map.streamRange({ end: [3, false] }, { reversed: true }).toArray()
      ).toEqual(entries(2, 1, 0));
      expect(
        map.streamRange({ end: 3.5 }, { reversed: true }).toArray()
      ).toEqual(entries(3, 2, 1, 0));
      expect(
        map.streamRange({ end: [3.5, false] }, { reversed: true }).toArray()
      ).toEqual(entries(3, 2, 1, 0));
      expect(
        map.streamRange({ start: 97 }, { reversed: true }).toArray()
      ).toEqual(entries(99, 98, 97));
      expect(
        map.streamRange({ start: [97, false] }, { reversed: true }).toArray()
      ).toEqual(entries(99, 98));
      expect(
        map.streamRange({ start: 0, end: 3 }, { reversed: true }).toArray()
      ).toEqual(entries(3, 2, 1, 0));
      expect(
        map
          .streamRange(
            { start: [0, false], end: [3, false] },
            { reversed: true }
          )
          .toArray()
      ).toEqual(entries(2, 1));
      expect(
        map.streamRange({ start: 97.5 }, { reversed: true }).toArray()
      ).toEqual(entries(99, 98));
      expect(
        map.streamRange({ start: [97.5, false] }, { reversed: true }).toArray()
      ).toEqual(entries(99, 98));
      expect(
        map.streamRange({ start: 0.5, end: 3.5 }, { reversed: true }).toArray()
      ).toEqual(entries(3, 2, 1));
      expect(
        map
          .streamRange(
            { start: [0.5, false], end: [3.5, false] },
            { reversed: true }
          )
          .toArray()
      ).toEqual(entries(3, 2, 1));
    });
  });
}

runWith('SortedMap default', SortedMap.createContext());
runWith(
  'SortedMap block bits 2',
  SortedMap.createContext({ blockSizeBits: 2 })
);
