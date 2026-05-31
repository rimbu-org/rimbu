import { describe, it } from 'bun:test';

import { CharList as CharListSrc } from '@rimbu/list2/char';

const CharList = CharListSrc.createContext({ blockSizeBits: 2 });

describe('CharList', () => {
	it('works', () => {
		const list = CharList.from('hello this is a test').with(1, 'a');

		console.log(list.toString());
		console.log((list as any)._structure());
	});
});
