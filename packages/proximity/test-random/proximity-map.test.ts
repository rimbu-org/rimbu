import { runMapRandomTestsWith } from '@rimbu/collection-types/test-utils/map/map-random';
import { HashMap } from '@rimbu/hashed/map';
import { ProximityMap } from '@rimbu/proximity';

runMapRandomTestsWith(
	'ProximityMap default',
	ProximityMap.createContext({}).keyedContext,
);

runMapRandomTestsWith(
	'ProximityMap blocksize 2',
	ProximityMap.createContext({
		hashMapContext: HashMap.createContext({ blockSizeBits: 2 }),
	}).keyedContext,
);

runMapRandomTestsWith(
	'ProximityMap blocksize 3',
	ProximityMap.createContext({
		hashMapContext: HashMap.createContext({ blockSizeBits: 3 }),
	}).keyedContext,
);
