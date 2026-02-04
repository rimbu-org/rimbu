import type { HashMap } from '@rimbu/hashed/map';
import type { ProximityMap } from '@rimbu/proximity';

import { ProximityMapNonEmpty } from '#proximity/non-empty';

export function wrapHashMap<K, V>(
	context: ProximityMap.Context<K>,
	newInternalMap: HashMap.NonEmpty<K, V>,
): ProximityMap.NonEmpty<K, V>;

export function wrapHashMap<K, V>(
	context: ProximityMap.Context<K>,
	newInternalMap: HashMap<K, V>,
): ProximityMap<K, V>;

export function wrapHashMap<K, V>(
	context: ProximityMap.Context<K>,
	newInternalMap: HashMap<K, V>,
): ProximityMap<K, V> {
	return newInternalMap.nonEmpty()
		? new ProximityMapNonEmpty<K, V>(context, newInternalMap)
		: context.empty();
}
