import { Token } from '@rimbu/base';
import { DistanceFunction, getValueWithNearestKey } from '../src/common';

type TestSuite<TKey, TValue> = {
  keyTypeDescription: string;
  entries: readonly (readonly [TKey, TValue | undefined])[];
  matchingKey: TKey;
  valueForMatchingKey: TValue;
  nonMatchingKey: TKey;
  matchingKeyWithUndefinedValue: TKey;
  distanceFunction?: DistanceFunction<TKey>;
};

function runTestSuite<TKey, TValue>({
  keyTypeDescription,
  entries,
  matchingKey,
  valueForMatchingKey,
  nonMatchingKey,
  matchingKeyWithUndefinedValue,
  distanceFunction,
}: TestSuite<TKey, TValue>) {
  describe(`with ${keyTypeDescription} keys`, () => {
    const actualDistanceFunction =
      distanceFunction ?? DistanceFunction.defaultFunction;

    describe('when there is a matching key', () => {
      it('should return the associated value', () => {
        const retrievedValue = getValueWithNearestKey(
          actualDistanceFunction,
          matchingKey,
          entries
        );

        expect(retrievedValue).toBe(valueForMatchingKey);
      });
    });

    describe('when there is no match', () => {
      it('should return the Token', () => {
        const retrievedValue = getValueWithNearestKey(
          actualDistanceFunction,
          nonMatchingKey,
          entries
        );

        expect(retrievedValue).toBe(Token);
      });
    });

    describe('when the matching key has an undefined value', () => {
      it('should actually return undefined', () => {
        const retrievedValue = getValueWithNearestKey(
          actualDistanceFunction,
          matchingKeyWithUndefinedValue,
          entries
        );

        expect(retrievedValue).toBeUndefined();
      });
    });
  });
}

describe('Getting the value associated with the nearest key', () => {
  describe('when using the default distance', () => {
    runTestSuite({
      keyTypeDescription: 'string',
      entries: [
        ['alpha', 90],
        ['beta', 92],
        ['gamma', undefined],
      ],
      matchingKey: 'beta',
      valueForMatchingKey: 92,
      nonMatchingKey: '<INEXISTING>',
      matchingKeyWithUndefinedValue: 'gamma',
    });

    runTestSuite({
      keyTypeDescription: 'number',
      entries: [
        [0, 90],
        [2, 92],
        [8, undefined],
      ],
      matchingKey: 2,
      valueForMatchingKey: 92,
      nonMatchingKey: 100,
      matchingKeyWithUndefinedValue: 8,
    });

    type Animal = { species: string; name: string };

    const yogi: Animal = { species: 'bear', name: 'yogi' };
    const otherYogiInstance: Animal = { species: 'bear', name: 'yogi' };
    const bubu: Animal = { species: 'bear', name: 'bubu' };

    runTestSuite({
      keyTypeDescription: 'object',
      entries: [
        [yogi, 90],
        [bubu, undefined],
      ],
      matchingKey: yogi,
      valueForMatchingKey: 90,
      nonMatchingKey: otherYogiInstance,
      matchingKeyWithUndefinedValue: bubu,
    });
  });

  describe('when using a custom distance', () => {
    type IHaveLength = Readonly<{ length: number }>;

    const customDistance: DistanceFunction<IHaveLength> = (x, y) =>
      x.length && y.length
        ? Math.abs(x.length - y.length)
        : Number.POSITIVE_INFINITY;

    runTestSuite({
      keyTypeDescription: 'string',
      entries: [
        ['a', 90],
        ['bbb', 92],
        ['ccccccccccccc', undefined],
      ],
      matchingKey: 'ddddd',
      valueForMatchingKey: 92,
      nonMatchingKey: '',
      matchingKeyWithUndefinedValue: 'aaaaaaaaaaaaaaaaaaaaa',
      distanceFunction: customDistance,
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
