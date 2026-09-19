import { runMapRandomTestsWith } from '@rimbu/collection-types/test-utils/map/map-random';
import { HashMap } from '@rimbu/hashed/map';
import { ProximityMap } from '@rimbu/proximity';

runMapRandomTestsWith(
	'ProximityMap default',
	(ProximityMap as any).createContext({}),
);

runMapRandomTestsWith(
	'ProximityMap blocksize 2',
	(ProximityMap as any).createContext({
		hashMapContext: HashMap.createContext({ blockSizeBits: 2 }),
	}),
);

runMapRandomTestsWith(
	'ProximityMap blocksize 3',
	(ProximityMap as any).createContext({
		hashMapContext: HashMap.createContext({ blockSizeBits: 3 }),
	}),
);
