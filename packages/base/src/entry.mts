// Returns the first element of a 2-Tuple
export function first<K, V>(entry: readonly [K, V]): K {
  return entry[0];
}

// Returns the second element of a 2-Tuple
export function second<K, V>(entry: readonly [K, V]): V {
  return entry[1];
}
