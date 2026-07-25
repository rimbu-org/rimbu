import { describe, expectTypeOf, it } from 'bun:test';

import type { Collection } from '@rimbu/collection-types/capabilities';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { Stream } from '@rimbu/stream';

describe('Collection', () => {
	it('normal interface is correct', () => {
		const c: Collection<number> = 0 as any;

		expectTypeOf(c.isEmpty).toEqualTypeOf<boolean>();
		expectTypeOf(c.assumeNonEmpty()).toEqualTypeOf<
			Collection.NonEmpty<number>
		>();
		expectTypeOf(c.nonEmpty()).toEqualTypeOf<boolean>();
		expectTypeOf(c.stream()).toEqualTypeOf<Stream<number>>();
		expectTypeOf(c.toArray()).toEqualTypeOf<number[]>();
	});

	it('non-empty interface is correct', () => {
		const c: Collection.NonEmpty<number> = 0 as any;

		expectTypeOf(c.isEmpty).toEqualTypeOf<false>();
		expectTypeOf(c.assumeNonEmpty()).toEqualTypeOf<
			Collection.NonEmpty<number>
		>();
		expectTypeOf(c.nonEmpty()).toEqualTypeOf<boolean>();
		expectTypeOf(c.stream()).toEqualTypeOf<Stream.NonEmpty<number>>();
		expectTypeOf(c.toArray()).toEqualTypeOf<ArrayNonEmpty<number>>();
	});

	it('is covariant', () => {
		expectTypeOf<Collection<string>>().toExtend<Collection<string | number>>();
		expectTypeOf<Collection<string | number>>().not.toExtend<
			Collection<string>
		>();

		expectTypeOf<Collection.NonEmpty<string>>().toExtend<
			Collection.NonEmpty<string | number>
		>();
		expectTypeOf<Collection.NonEmpty<string | number>>().not.toExtend<
			Collection.NonEmpty<string>
		>();
	});

	it('can assign non-empty to normal', () => {
		expectTypeOf<Collection.NonEmpty<string>>().toExtend<Collection<string>>();
		expectTypeOf<Collection<string>>().not.toExtend<
			Collection.NonEmpty<string>
		>();
	});

	it('WithFilter interface is correct', () => {
		const c: Collection.WithFilter<number> = 0 as any;

		expectTypeOf(c.filter((v) => v > 0)).toEqualTypeOf<Collection<number>>();
	});
});
