import { HashMap } from '@rimbu/hashed/map';
import { runMapRandomTestsWith } from '../../collection-types/test-utils/map/map-random.mjs';

runMapRandomTestsWith('HashMap default', HashMap.defaultContext());

runMapRandomTestsWith(
	'HashMap blocksize 2',
	HashMap.createContext({ blockSizeBits: 2 }),
);

runMapRandomTestsWith(
	'HashMap blocksize 3',
	HashMap.createContext({ blockSizeBits: 3 }),
);
