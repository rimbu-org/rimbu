import { HashMap } from '@rimbu/hashed/map';
import { runMapRandomTestsWith } from '@rimbu/collection-types/test-utils/map/map-random';

// @ts-ignore legacy RMap.Context vs HashMap.Context mismatch until 10
runMapRandomTestsWith('HashMap default', (HashMap as any).createContext<number>({}));

// @ts-ignore legacy RMap.Context vs HashMap.Context mismatch until 10
runMapRandomTestsWith(
	'HashMap blocksize 2',
	(HashMap as any).createContext({ blockSizeBits: 2 }),
);

// @ts-ignore legacy RMap.Context vs HashMap.Context mismatch until 10
runMapRandomTestsWith(
	'HashMap blocksize 3',
	(HashMap as any).createContext({ blockSizeBits: 3 }),
);
