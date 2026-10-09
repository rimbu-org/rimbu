import { runMapRandomTestsWith } from '@rimbu/collection-types/test-utils/map/map-random';
import { HashMap } from '@rimbu/hashed/map';

runMapRandomTestsWith(
	'HashMap default',
	HashMap.createContext<number>({}).keyedContext,
);

runMapRandomTestsWith(
	'HashMap blocksize 2',
	HashMap.createContext({ blockSizeBits: 2 }).keyedContext,
);

runMapRandomTestsWith(
	'HashMap blocksize 3',
	HashMap.createContext({ blockSizeBits: 3 }).keyedContext,
);
