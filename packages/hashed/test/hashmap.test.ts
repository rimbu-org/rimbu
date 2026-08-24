import type { Hasher } from '@rimbu/hashed';

import { runMapTestsWith } from '@rimbu/collection-types/test-utils/map/map-collection-standard';
import { HashMap } from '@rimbu/hashed/map';

const collisionHasher: Hasher<any> = {
	hash: () => 1,
	isValid(value: any): value is any {
		return true;
	},
};

runMapTestsWith(
	'HashMap collision hasher',
	HashMap.createContext({ hasher: collisionHasher, blockSizeBits: 2 })
		.keyedContext,
);

runMapTestsWith(
	'HashMap block size 2',
	HashMap.createContext({ blockSizeBits: 2 }).keyedContext,
);
