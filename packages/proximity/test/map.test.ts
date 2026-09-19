import { runMapTestsWith } from '@rimbu/collection-types/test-utils/map/map-collection-standard';
import { ProximityMap } from '@rimbu/proximity';

runMapTestsWith(
	'ProximityMap default',
	ProximityMap.createContext().keyedContext,
);
