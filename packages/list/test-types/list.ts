import { describe, expectTypeOf, it } from 'bun:test';

import type { List } from '@rimbu/list';

describe('List', () => {
	// `List` is **invariant** in its element type, not covariant: `append`,
	// `prepend` and `insertAt` all take an `E` parameter, which makes the type
	// contravariant in `E` and therefore invariant. (This used to be asserted as
	// covariance, before the capability rewrite added `WithPrependAppend` and
	// `WithInsertAt` to the aggregate `Api`.)
	it('should be invariant', () => {
		expectTypeOf<List<string>>().not.toExtend<List<string | number>>();
		expectTypeOf<List<string | number>>().not.toExtend<List<string>>();

		expectTypeOf<List.NonEmpty<string>>().not.toExtend<
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
