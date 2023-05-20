import { Token } from '@rimbu/base';
import type { DistanceFunction } from './distanceFunction';

/**
 * Given an iterable of [key, value] entries, applies the distance function to
 * each key, finding the closest one and returning its associated value.
 * Performs a full linear scan unless a distance equal to 0 is encountered; otherwise,
 * the selected distance is the smallest among all the non-infinite ones.
 *
 * @param distanceFunction Returns the distance between 2 points
 * @param key The key used to find the closest key
 * @param entries The [key, value] entries
 * @returns The value associated with the closest key; it returns Token if:
 * * the collection is empty
 * * all the items have `POSITIVE_INFINITY` distance
 */
export function getValueWithNearestKey<K, V>(
  distanceFunction: DistanceFunction<K>,
  key: K,
  entries: Iterable<readonly [K, V]>
): V | Token {
  let bestValue: V | Token = Token;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const [currentKey, currentValue] of entries) {
    const currentDistance = distanceFunction(currentKey, key);

    if (!currentDistance) {
      return currentValue;
    }

    if (currentDistance < bestDistance) {
      bestValue = currentValue;
      bestDistance = currentDistance;
    }
  }

  return bestValue;
}
