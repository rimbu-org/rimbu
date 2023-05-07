import { DistanceFunction, getValueWithNearestKey } from '../src/common';

describe('Getting the value associated with the nearest key', () => {
  describe('when using the default distance', () => {
    describe('with strings', () => {
      const entries: readonly [string, number][] = [
        ['alpha', 90],
        ['beta', 92],
        ['gamma', 3],
      ];

      describe('when there is a match', () => {
        it('should return the value associated with the matching key', () => {
          const retrievedValue = getValueWithNearestKey(
            DistanceFunction.defaultFunction,
            'beta',
            entries
          );

          expect(retrievedValue).toBe(92);
        });
      });

      describe('when there is no match', () => {
        it('should return undefined', () => {
          const retrievedValue = getValueWithNearestKey(
            DistanceFunction.defaultFunction,
            '<INEXISTING>',
            entries
          );

          expect(retrievedValue).toBeUndefined();
        });
      });
    });

    describe('with numbers', () => {
      const entries: readonly [number, number][] = [
        [0, 90],
        [2, 92],
        [8, 98],
      ];

      describe('when there is a match', () => {
        it('should return the value associated with the matching key', () => {
          const retrievedValue = getValueWithNearestKey(
            DistanceFunction.defaultFunction,
            8,
            entries
          );

          expect(retrievedValue).toBe(98);
        });
      });

      describe('when there is no match', () => {
        it('should return undefined', () => {
          const retrievedValue = getValueWithNearestKey(
            DistanceFunction.defaultFunction,
            100,
            entries
          );

          expect(retrievedValue).toBeUndefined();
        });
      });
    });

    describe('with objects', () => {
      type Animal = { species: string; name: string };

      const yogi: Animal = { species: 'bear', name: 'yogi' };
      const bubu: Animal = { species: 'bear', name: 'bubu' };

      const entries: readonly [Animal, number][] = [[yogi, 90]];

      describe('when there is a match', () => {
        it('should return the value associated with the matching key', () => {
          const retrievedValue = getValueWithNearestKey(
            DistanceFunction.defaultFunction,
            yogi,
            entries
          );

          expect(retrievedValue).toBe(90);
        });
      });

      describe('when there is no match', () => {
        it('should return undefined', () => {
          const retrievedValue = getValueWithNearestKey(
            DistanceFunction.defaultFunction,
            bubu,
            entries
          );

          expect(retrievedValue).toBeUndefined();
        });
      });
    });
  });

  describe('when using a custom distance', () => {
    type IHaveLength = { length: number };

    const customDistance: DistanceFunction<IHaveLength> = (x, y) =>
      Math.abs(x.length - y.length);

    describe('with strings', () => {
      const entries: readonly [string, number][] = [
        ['a', 90],
        ['bbb', 92],
        ['ccccccccccccc', 98],
      ];

      describe('when there is a perfect match', () => {
        it('should return the value associated with the matching key', () => {
          const retrievedValue = getValueWithNearestKey(
            customDistance,
            'ddd',
            entries
          );

          expect(retrievedValue).toBe(92);
        });
      });

      describe('when there is a partial match', () => {
        it('should return the value associated with the closest key', () => {
          const retrievedValue = getValueWithNearestKey(
            customDistance,
            'DDDDD',
            entries
          );

          expect(retrievedValue).toBe(92);
        });
      });
    });
  });

  it('should short-circuit upon zero distance', () => {
    function* intGenerator(): Iterable<readonly [number, string]> {
      yield [90, 'alpha'];
      yield [92, 'beta'];
      yield [93, 'gamma'];

      throw new Error('This line should never be reached!');
    }

    const foundValue = getValueWithNearestKey(
      DistanceFunction.defaultFunction,
      92,
      intGenerator()
    );

    expect(foundValue).toBe('beta');
  });
});
