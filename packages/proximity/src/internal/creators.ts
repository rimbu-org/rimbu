import type { RMapBase } from '@rimbu/collection-types/map/base';
import type { HashMap } from '@rimbu/hashed/map';
import type { ProximityMap } from '@rimbu/proximity';
import type { DistanceFunction } from '@rimbu/proximity/distance-function';

export interface ProximityMapCreators
	extends RMapBase.Factory<ProximityMap.Types> {
	/**
	 * Returns a new ProximityMap context instance based on the given `options`.
	 * @typeparam UK - the upper key type for which the context can create instances
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - distanceFunction: (optional) the distance function used to compare the proximity between keys<br/>
	 * - hashMapContext: (optional) the context to use to create the internal HashMap instances
	 */
	createContext<UK>(options?: {
		distanceFunction?: DistanceFunction<UK>;
		hashMapContext?: HashMap.Context<UK>;
	}): ProximityMap.Context<UK>;
	/**
	 * Returns the default context for ProximityMaps.
	 * @typeparam UK - the upper key type for which the context can create instances
	 */
	defaultContext<UK>(): ProximityMap.Context<UK>;
}
