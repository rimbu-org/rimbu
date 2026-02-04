import { ProximityMap } from '@rimbu/proximity';
import { runMapTestsWith } from '../../collection-types/test-utils/map/map-standard';

runMapTestsWith(
	'ProximityMap with default options',
	ProximityMap.createContext(),
);
