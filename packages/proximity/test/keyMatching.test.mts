import { Distance, DistanceFunction, findNearestKeyMatch } from '../src/common';

type TestSuite<TKey, TValue> = {
  keyTypeDescription: string;
  entries: Iterable<readonly [TKey, TValue | undefined]>;
  matchingInputKey: TKey;
  valueForMatchingInputKey: TValue;
  distanceFromMatchingInputKey: Distance;
  nonMatchingInputKey: TKey;
  inputKeyMatchingForUndefined: TKey;
  distanceFromInputKeyMatchingForUndefined: Distance;
  distanceFunction?: DistanceFunction<TKey>;
};

function runTestSuite<TKey, TValue>({
  keyTypeDescription,
  entries,
  matchingInputKey,
  valueForMatchingInputKey,
  distanceFromMatchingInputKey,
  nonMatchingInputKey,
  inputKeyMatchingForUndefined,
  distanceFromInputKeyMatchingForUndefined,
  distanceFunction,
}: TestSuite<TKey, TValue>) {
  describe(`with ${keyTypeDescription} keys`, () => {
    const actualDistanceFunction =
      distanceFunction ?? DistanceFunction.defaultFunction;

    describe('when there is a matching input key', () => {
      it('should return the closest key', () => {
        const { key } = findNearestKeyMatch(
          actualDistanceFunction,
          matchingInputKey,
          entries
        )!;

        expect(actualDistanceFunction(key, matchingInputKey)).toBe(
          distanceFromMatchingInputKey
        );
      });

      it('should return the associated value', () => {
        const { value } = findNearestKeyMatch(
          actualDistanceFunction,
          matchingInputKey,
          entries
        )!;

        expect(value).toBe(valueForMatchingInputKey);
      });

      it('should return the associated distance', () => {
        const { distance } = findNearestKeyMatch(
          actualDistanceFunction,
          matchingInputKey,
          entries
        )!;

        expect(distance).toBe(distanceFromMatchingInputKey);
      });
    });

    describe('when there is no match', () => {
      it('should return undefined', () => {
        const keyMatch = findNearestKeyMatch(
          actualDistanceFunction,
          nonMatchingInputKey,
          entries
        )!;

        expect(keyMatch).toBeUndefined();
      });
    });

    describe('when the matching key has an undefined value', () => {
      it('should actually return it in the key match', () => {
        const { value, distance } = findNearestKeyMatch(
          actualDistanceFunction,
          inputKeyMatchingForUndefined,
          entries
        )!;

        expect(value).toBeUndefined();
        expect(distance).toBe(distanceFromInputKeyMatchingForUndefined);
      });
    });
  });
}

describe('Getting the nearest key match', () => {
  describe('when using the default distance', () => {
    runTestSuite({
      keyTypeDescription: 'string',
      entries: [
        ['alpha', 90],
        ['beta', 92],
        ['gamma', undefined],
      ],
      matchingInputKey: 'beta',
      valueForMatchingInputKey: 92,
      distanceFromMatchingInputKey: 0,
      nonMatchingInputKey: '<INEXISTING>',
      inputKeyMatchingForUndefined: 'gamma',
      distanceFromInputKeyMatchingForUndefined: 0,
    });

    runTestSuite({
      keyTypeDescription: 'number',
      entries: [
        [0, 90],
        [2, 92],
        [8, undefined],
      ],
      matchingInputKey: 2,
      valueForMatchingInputKey: 92,
      distanceFromMatchingInputKey: 0,
      nonMatchingInputKey: 9999,
      inputKeyMatchingForUndefined: 8,
      distanceFromInputKeyMatchingForUndefined: 0,
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
      matchingInputKey: yogi,
      valueForMatchingInputKey: 90,
      distanceFromMatchingInputKey: 0,
      nonMatchingInputKey: otherYogiInstance,
      inputKeyMatchingForUndefined: bubu,
      distanceFromInputKeyMatchingForUndefined: 0,
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
      distanceFunction: customDistance,
      matchingInputKey: 'abcdefg',
      valueForMatchingInputKey: 92,
      distanceFromMatchingInputKey: 'abcdefg'.length - 'bbb'.length,
      nonMatchingInputKey: '',
      inputKeyMatchingForUndefined: 'abcdefghijklmnopq',
      distanceFromInputKeyMatchingForUndefined:
        'abcdefghijklmnopq'.length - 'ccccccccccccc'.length,
    });
  });

  it('should short-circuit when a distance equal to 0 is found', () => {
    function* intGenerator(): Iterable<readonly [number, string]> {
      yield [90, 'alpha'];
      yield [92, 'beta'];
      yield [93, 'gamma'];

      throw new Error('This line should never be reached!');
    }

    const { key, value, distance } = findNearestKeyMatch(
      DistanceFunction.defaultFunction,
      92,
      intGenerator()
    )!;

    expect(key).toBe(92);
    expect(value).toBe('beta');
    expect(distance).toBe(0);
  });
});
