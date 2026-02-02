import { runSetTestsWith } from '../../collection-types/test-utils/set/set-standard.mjs';

import { SortedSet } from '@rimbu/sorted/set';

runSetTestsWith(
	'SortedSet blockSize 2',
	SortedSet.createContext({ blockSizeBits: 2 }),
);

runSetTestsWith(
	'SortedSet blockSize 3',
	SortedSet.createContext({ blockSizeBits: 3 }),
);
