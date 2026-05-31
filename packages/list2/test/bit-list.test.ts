import { describe, it } from 'bun:test';

import { BitList as BitListSrc } from '@rimbu/list2/bit';

const BitList = BitListSrc.createContext({ blockSizeBits: 2 });

describe('BitList', () => {
	it('works', () => {
		const list = BitList.from([true, false, true, true]).with(0, false);

		console.log(list.toString());
		console.log((list as any)._structure());
	});
});
