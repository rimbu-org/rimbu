import type { Distance, DistanceFunction } from './distanceFunction.mjs';

/**
 * Match between a reference key and the closest key in a `[key, value]` collection:<br/>
 * <br/>
 * - `key` is the key closest to the reference key<br/>
 * - `value` is the value associated with the closest key<br/>
 * - `distance` is the distance between the closest key and the reference key;
 * it is always a finite value
 */
export type NearestKeyMatch<K, V> = Readonly<{
  key: K;
  value: V;
  distance: Distance;
}>;

/**
 * Given an `Iterable` of `[key, value]` entries, applies the distance function to
 * each key, finding the one closest to the input key, also returning its
 * associated value as well as the related distance; returns `undefined`
 * only when there are no successful matches - that is, all the keys have `+∞` distance.<br/>
 * <br/>
 * Performs a full linear scan unless a distance equal to `0` is encountered, in which
 * case the function returns immediately; otherwise, the algorithm selects the
 * smallest *non-infinite* distance: if multiple keys happen to have such distance,
 * the selection order is not guaranteed.
 *
 * @param distanceFunction - returns the distance between two keys
 * @param key - the key used as a reference to find the closest key
 * @param entries - the `[key, value]` entries to scan
 * @returns a `NearestKeyMatch` object if a closest key -
 * having a *finite distance* - exists; `undefined` otherwise
 */
export function findNearestKeyMatch<K, V>(
  distanceFunction: DistanceFunction<K>,
  key: K,
  entries: Iterable<readonly [K, V]>
): NearestKeyMatch<K, V> | undefined {
  let bestEntry: readonly [K, V] | undefined = undefined;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const [currentKey, currentValue] of entries) {
    const currentDistance = distanceFunction(currentKey, key);

    if (!currentDistance) {
      return {
        key: currentKey,
        value: currentValue,
        distance: 0,
      };
    }

    if (currentDistance < bestDistance) {
      bestEntry = [currentKey, currentValue];
      bestDistance = currentDistance;
    }
  }

  return bestEntry
    ? {
        key: bestEntry[0],
        value: bestEntry[1],
        distance: bestDistance,
      }
    : undefined;
}
