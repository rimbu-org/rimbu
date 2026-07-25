import { describe, expectTypeOf, it } from 'bun:test';

import type {
	Collection,
	IndexedCollection,
} from '@rimbu/collection-types/capabilities';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { Stream } from '@rimbu/stream';

interface WithMapNonEmpty<E> extends IndexedCollection.WithMap<E> {
	context: { __types: IndexedCollection.Types.NonEmpty<E> };
}

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

describe('IndexedCollection', () => {
	it('normal interface is correct', () => {
		const c: IndexedCollection<number> = 0 as any;

		expectTypeOf(c.stream()).toEqualTypeOf<Stream<number>>();
		expectTypeOf(c.stream({ reversed: true })).toEqualTypeOf<Stream<number>>();

		expectTypeOf(c.streamSlice({ amount: 3 })).toEqualTypeOf<Stream<number>>();
		expectTypeOf(
			c.streamSlice({ amount: 3 }, { reversed: true }),
		).toEqualTypeOf<Stream<number>>();

		expectTypeOf(c.at(3)).toEqualTypeOf<number | undefined>();
		expectTypeOf(c.at(3, 'a')).toEqualTypeOf<number | string>();

		expectTypeOf(c.first()).toEqualTypeOf<number | undefined>();
		expectTypeOf(c.first('a')).toEqualTypeOf<number | string>();
		expectTypeOf(c.last()).toEqualTypeOf<number | undefined>();
		expectTypeOf(c.last('a')).toEqualTypeOf<number | string>();

		expectTypeOf(c.take(3)).toEqualTypeOf<IndexedCollection<number>>();
		expectTypeOf(c.drop(3)).toEqualTypeOf<IndexedCollection<number>>();
		expectTypeOf(c.slice({ amount: 3 })).toEqualTypeOf<
			IndexedCollection<number>
		>();
	});

	it('non-empty interface is correct', () => {
		const c: IndexedCollection.NonEmpty<number> = 0 as any;

		expectTypeOf(c.stream()).toEqualTypeOf<Stream.NonEmpty<number>>();
		expectTypeOf(c.stream({ reversed: true })).toEqualTypeOf<
			Stream.NonEmpty<number>
		>();

		expectTypeOf(c.streamSlice({ amount: 3 })).toEqualTypeOf<Stream<number>>();
		expectTypeOf(
			c.streamSlice({ amount: 3 }, { reversed: true }),
		).toEqualTypeOf<Stream<number>>();

		expectTypeOf(c.at(3)).toEqualTypeOf<number | undefined>();
		expectTypeOf(c.at(3, 'a')).toEqualTypeOf<number | string>();

		expectTypeOf(c.first()).toEqualTypeOf<number>();
		expectTypeOf(c.first('a')).toEqualTypeOf<number>();
		expectTypeOf(c.last()).toEqualTypeOf<number>();
		expectTypeOf(c.last('a')).toEqualTypeOf<number>();

		expectTypeOf(c.take(0)).toEqualTypeOf<IndexedCollection<number>>();
		expectTypeOf(c.take(3)).toEqualTypeOf<IndexedCollection.NonEmpty<number>>();
		expectTypeOf(c.drop(0)).toEqualTypeOf<IndexedCollection<number>>();
		expectTypeOf(c.drop(3)).toEqualTypeOf<IndexedCollection<number>>();
		expectTypeOf(c.slice({ amount: 3 })).toEqualTypeOf<
			IndexedCollection<number>
		>();
	});

	it('is covariant', () => {
		expectTypeOf<IndexedCollection<string>>().toExtend<
			IndexedCollection<string | number>
		>();
		expectTypeOf<IndexedCollection<string | number>>().not.toExtend<
			IndexedCollection<string>
		>();

		expectTypeOf<IndexedCollection.NonEmpty<string>>().toExtend<
			IndexedCollection.NonEmpty<string | number>
		>();
		expectTypeOf<IndexedCollection.NonEmpty<string | number>>().not.toExtend<
			IndexedCollection.NonEmpty<string>
		>();
	});

	it('can assign non-empty to normal', () => {
		expectTypeOf<IndexedCollection.NonEmpty<string>>().toExtend<
			IndexedCollection<string>
		>();
		expectTypeOf<IndexedCollection<string>>().not.toExtend<
			IndexedCollection.NonEmpty<string>
		>();
	});

	it('WithMap interface is correct', () => {
		const c: IndexedCollection.WithMap<number> = 0 as any;

		expectTypeOf(c.map(String)).toEqualTypeOf<IndexedCollection<string>>();

		const cne: WithMapNonEmpty<number> = 0 as any;

		expectTypeOf(cne.map(String)).toEqualTypeOf<
			IndexedCollection.NonEmpty<string>
		>();
	});
});
