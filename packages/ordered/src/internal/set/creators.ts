import type { RMap } from '@rimbu/collection-types';
import type { OrderedSet } from '@rimbu/ordered/set';

export interface OrderedSetCreators {
	createContext<UT>(
		options?:
			| {
					keyMapContext?: RMap.Context<UT> | undefined;
			  }
			| undefined,
	): OrderedSet.Context<UT>;
}
