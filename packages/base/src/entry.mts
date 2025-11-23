/**
 * Returns the first element of a 2-tuple.
 * @typeparam K - the first element type
 * @typeparam V - the second element type
 * @param entry - the tuple
 * @returns the first element
 */
export function first<K, V>(entry: readonly [K, V]): K {
  return entry[0];
}

/**
 * Returns the second element of a 2-tuple.
 * @typeparam K - the first element type
 * @typeparam V - the second element type
 * @param entry - the tuple
 * @returns the second element
 */
export function second<K, V>(entry: readonly [K, V]): V {
  return entry[1];
}
