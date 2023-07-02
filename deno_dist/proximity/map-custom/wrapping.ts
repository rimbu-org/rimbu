import type { HashMap } from '../../hashed/map/index.ts';
import type { ProximityMap } from '../../proximity/map/index.ts';
import { ProximityMapNonEmpty } from './implementation/index.ts';

export function wrapHashMap<K, V>(
  context: ProximityMap.Context<K>,
  newInternalMap: HashMap.NonEmpty<K, V>
): ProximityMap.NonEmpty<K, V>;

export function wrapHashMap<K, V>(
  context: ProximityMap.Context<K>,
  newInternalMap: HashMap<K, V>
): ProximityMap<K, V>;

export function wrapHashMap<K, V>(
  context: ProximityMap.Context<K>,
  newInternalMap: HashMap<K, V>
): ProximityMap<K, V> {
  return newInternalMap.nonEmpty()
    ? new ProximityMapNonEmpty<K, V>(context, newInternalMap)
    : context.empty();
}
