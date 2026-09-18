import { describe, expectTypeOf, it } from 'bun:test';

import type { List } from '@rimbu/list';

describe('List', () => {
	it('should be covariant', () => {
		expectTypeOf<List<string>>().toExtend<List<string | number>>();
		expectTypeOf<List<string | number>>().not.toExtend<List<string>>();

		expectTypeOf<List.NonEmpty<string>>().toExtend<
			List.NonEmpty<string | number>
		>();
		expectTypeOf<List.NonEmpty<string | number>>().not.toExtend<
			List.NonEmpty<string>
		>();
	});

	it('nonEmpty should be assignable to normal', () => {
		expectTypeOf<List.NonEmpty<string>>().toExtend<List<string>>();
	});
});
