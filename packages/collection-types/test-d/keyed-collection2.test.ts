import { describe, expectTypeOf, it } from 'bun:test';

import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';

describe('IndexedCollection', () => {
	it('normal is covariant', () => {
		expectTypeOf<IndexedCollection<string>>().toExtend<
			IndexedCollection<string | number>
		>();

		expectTypeOf<IndexedCollection<string | number>>().not.toExtend<
			IndexedCollection<string>
		>();
	});

	it('non-empty is assignable to normal', () => {});
});
