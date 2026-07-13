import { runSetTestsWith } from '@rimbu/collection-types/test-utils/set/set-standard';
import { SortedSet } from '@rimbu/sorted/set';

runSetTestsWith(
	'SortedSet blockSize 2',
	SortedSet.createContext({ blockSizeBits: 2 }),
	SortedSet.createContext({ blockSizeBits: 3 }),
);

runSetTestsWith(
	'SortedSet blockSize 3',
	SortedSet.createContext({ blockSizeBits: 3 }),
	SortedSet.createContext({ blockSizeBits: 4 }),
);
