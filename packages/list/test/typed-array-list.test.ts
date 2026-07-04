import { describe, it } from 'bun:test';

import { TypedArrayList as TypedArrayListSrc } from '@rimbu/list/typed-array';
import { Stream } from '@rimbu/stream';

const UInt8ArrayList = TypedArrayListSrc.createContext(
	{
		ViewConstructor: Int16Array,
	},
	{ blockSizeBits: 3 },
);

describe('TypedArrayList', () => {
	it('works', () => {
		const list = Stream.range({ amount: 1000 }).reduce(
			UInt8ArrayList.reducer(),
		);
		// .with(0, 4)
		// .reversed();

		console.log(list.toString());
		console.log((list as any)._structure());
	});
});
