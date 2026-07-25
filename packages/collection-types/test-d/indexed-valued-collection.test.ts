import { describe, expectTypeOf, it } from 'bun:test';

import type {
	IndexedCollection,
	IndexedValuedCollection,
	ValuedCollection,
} from '@rimbu/collection-types/capabilities';
import type { Stream } from '@rimbu/stream';

describe('IndexedValuedCollection', () => {
	it('normal interface is correct', () => {
		const c: IndexedValuedCollection<number> = 0 as any;

		expectTypeOf(c.indexOf(1)).toEqualTypeOf<number | undefined>();
		expectTypeOf(c.indexOf(1, 'a')).toEqualTypeOf<number | string>();

		expectTypeOf(c.has(1)).toEqualTypeOf<boolean>();

		expectTypeOf(c.at(3)).toEqualTypeOf<number | undefined>();
		expectTypeOf(c.at(3, 'a')).toEqualTypeOf<number | string>();

		expectTypeOf(c.first()).toEqualTypeOf<number | undefined>();
		expectTypeOf(c.first('a')).toEqualTypeOf<number | string>();
		expectTypeOf(c.last()).toEqualTypeOf<number | undefined>();
		expectTypeOf(c.last('a')).toEqualTypeOf<number | string>();

		expectTypeOf(c.take(3)).toEqualTypeOf<
			IndexedValuedCollection<number>
		>();
		expectTypeOf(c.drop(3)).toEqualTypeOf<
			IndexedValuedCollection<number>
		>();

		expectTypeOf(c.stream()).toEqualTypeOf<Stream<number>>();
		expectTypeOf(c.streamSlice({ amount: 3 })).toEqualTypeOf<Stream<number>>();
	});

	it('non-empty interface is correct', () => {
		const c: IndexedValuedCollection.NonEmpty<number> = 0 as any;

		expectTypeOf(c.indexOf(1)).toEqualTypeOf<number | undefined>();
		expectTypeOf(c.indexOf(1, 'a')).toEqualTypeOf<number | string>();

		expectTypeOf(c.has(1)).toEqualTypeOf<boolean>();

		expectTypeOf(c.at(3)).toEqualTypeOf<number | undefined>();
		expectTypeOf(c.at(3, 'a')).toEqualTypeOf<number | string>();

		expectTypeOf(c.first()).toEqualTypeOf<number>();
		expectTypeOf(c.first('a')).toEqualTypeOf<number>();
		expectTypeOf(c.last()).toEqualTypeOf<number>();
		expectTypeOf(c.last('a')).toEqualTypeOf<number>();

		expectTypeOf(c.take(0)).toEqualTypeOf<IndexedValuedCollection<number>>();
		expectTypeOf(c.take(3)).toEqualTypeOf<
			IndexedValuedCollection.NonEmpty<number>
		>();
		expectTypeOf(c.take(-1)).toEqualTypeOf<
			IndexedValuedCollection.NonEmpty<number>
		>();

		expectTypeOf(c.stream()).toEqualTypeOf<Stream.NonEmpty<number>>();
		expectTypeOf(c.isEmpty).toEqualTypeOf<false>();
	});

	it('extends IndexedCollection', () => {
		expectTypeOf<IndexedValuedCollection<number>>().toExtend<
			IndexedCollection<number>
		>();
	});

	it('extends ValuedCollection', () => {
		expectTypeOf<IndexedValuedCollection<number>>().toExtend<
			ValuedCollection<number>
		>();
	});

	it('NonEmpty extends IndexedCollection.NonEmpty', () => {
		expectTypeOf<IndexedValuedCollection.NonEmpty<number>>().toExtend<
			IndexedCollection.NonEmpty<number>
		>();
	});

	it('NonEmpty extends ValuedCollection.NonEmpty', () => {
		expectTypeOf<IndexedValuedCollection.NonEmpty<number>>().toExtend<
			ValuedCollection.NonEmpty<number>
		>();
	});

	it('is covariant in T', () => {
		expectTypeOf<IndexedValuedCollection<string>>().toExtend<
			IndexedValuedCollection<string | number>
		>();
		expectTypeOf<
			IndexedValuedCollection<string | number>
		>().not.toExtend<IndexedValuedCollection<string>>();
	});

	it('can assign non-empty to normal', () => {
		expectTypeOf<IndexedValuedCollection.NonEmpty<number>>().toExtend<
			IndexedValuedCollection<number>
		>();
		expectTypeOf<IndexedValuedCollection<number>>().not.toExtend<
			IndexedValuedCollection.NonEmpty<number>
		>();
	});
});

describe('IndexedValuedCollection.Builder', () => {
	it('interface is correct', () => {
		const b: IndexedValuedCollection.Builder<number> = 0 as any;

		expectTypeOf(b.indexOf(1)).toEqualTypeOf<number | undefined>();
		expectTypeOf(b.indexOf(1, 'a')).toEqualTypeOf<number | string>();

		expectTypeOf(b.has(1)).toEqualTypeOf<boolean>();

		expectTypeOf(b.at(3)).toEqualTypeOf<number | undefined>();
		expectTypeOf(b.at(3, 'a')).toEqualTypeOf<number | string>();

		expectTypeOf(b.first()).toEqualTypeOf<number | undefined>();
		expectTypeOf(b.first('a')).toEqualTypeOf<number | string>();
		expectTypeOf(b.last()).toEqualTypeOf<number | undefined>();
		expectTypeOf(b.last('a')).toEqualTypeOf<number | string>();

		expectTypeOf(b.build()).toEqualTypeOf<IndexedValuedCollection<number>>();
	});

	it('extends IndexedCollection.Builder', () => {
		expectTypeOf<IndexedValuedCollection.Builder<number>>().toExtend<
			IndexedCollection.Builder<number>
		>();
	});

	it('extends ValuedCollection.Builder', () => {
		expectTypeOf<IndexedValuedCollection.Builder<number>>().toExtend<
			ValuedCollection.Builder<number>
		>();
	});
});

describe('IndexedValuedCollection.Types', () => {
	it('_NORMAL is IndexedValuedCollection', () => {
		expectTypeOf<
			IndexedValuedCollection.Types<number>['_NORMAL']
		>().toEqualTypeOf<IndexedValuedCollection<number>>();
	});

	it('_NON_EMPTY is IndexedValuedCollection.NonEmpty', () => {
		expectTypeOf<
			IndexedValuedCollection.Types<number>['_NON_EMPTY']
		>().toEqualTypeOf<IndexedValuedCollection.NonEmpty<number>>();
	});

	it('_stream has indexed signature with reversed option', () => {
		const fn: IndexedValuedCollection.Types<number>['_stream'] = 0 as any;

		expectTypeOf(fn()).toEqualTypeOf<Stream<number>>();
		expectTypeOf(fn({ reversed: true })).toEqualTypeOf<Stream<number>>();
	});

	it('_firstLast resolves to element type', () => {
		const fl: IndexedValuedCollection.Types<number>['_firstLast'] = 0 as any;

		expectTypeOf(fl()).toEqualTypeOf<number | undefined>();
	});

	it('NonEmpty._firstLast returns element without fallback', () => {
		const fl: IndexedValuedCollection.Types.NonEmpty<
			number
		>['_firstLast'] = 0 as any;

		expectTypeOf(fl()).toEqualTypeOf<number>();
	});

	it('_NEW_TYPES._NORMAL resolves', () => {
		expectTypeOf<
			IndexedValuedCollection.Types<number>['_NEW_TYPES']['_NORMAL']
		>().toEqualTypeOf<IndexedValuedCollection<unknown>>();
	});

	it('NonEmpty._NEW_TYPES preserves NonEmpty', () => {
		expectTypeOf<
			IndexedValuedCollection.Types.NonEmpty<
				number
			>['_NEW_TYPES']['_NON_EMPTY']
		>().toEqualTypeOf<IndexedValuedCollection.NonEmpty<unknown>>();
	});

	it('extends IndexedCollection.Types', () => {
		expectTypeOf<IndexedValuedCollection.Types<number>>().toExtend<
			IndexedCollection.Types<number>
		>();
	});

	it('extends ValuedCollection.Types', () => {
		expectTypeOf<IndexedValuedCollection.Types<number>>().toExtend<
			ValuedCollection.Types<number>
		>();
	});

	it('NonEmpty extends IndexedCollection.Types.NonEmpty', () => {
		expectTypeOf<
			IndexedValuedCollection.Types.NonEmpty<number>
		>().toExtend<IndexedCollection.Types.NonEmpty<number>>();
	});
});
