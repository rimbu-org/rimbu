import { HashMap } from '@rimbu/hashed/map';
import { ProximityMap } from '@rimbu/proximity';
import { runMapRandomTestsWith } from '@rimbu/collection-types/test-utils/map/map-random';

runMapRandomTestsWith('ProximityMap default', ProximityMap.defaultContext());

runMapRandomTestsWith(
	'ProximityMap blocksize 2',
	ProximityMap.createContext({
		hashMapContext: HashMap.createContext({ blockSizeBits: 2 }),
	}),
);

runMapRandomTestsWith(
	'ProximityMap blocksize 3',
	ProximityMap.createContext({
		hashMapContext: HashMap.createContext({ blockSizeBits: 3 }),
	}),
);
