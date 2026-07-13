import { runSetTestsWith } from '@rimbu/collection-types/test-utils/set/set-standard';
import type { Hasher } from '@rimbu/hashed';
import { HashSet } from '@rimbu/hashed/set';

runSetTestsWith(
	'HashSet block size 2',
	HashSet.createContext({ blockSizeBits: 2 }),
	HashSet.createContext({ blockSizeBits: 3 }),
);

const collisionHasher: Hasher<any> = {
	hash: () => 1,
	isValid(value: any): value is any {
		return true;
	},
};

runSetTestsWith(
	'HashSet collision hasher',
	HashSet.createContext({ hasher: collisionHasher, blockSizeBits: 2 }),
		HashSet.createContext({ blockSizeBits: 3 }),
);
