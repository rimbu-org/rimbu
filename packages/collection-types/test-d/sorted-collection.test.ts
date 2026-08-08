import { describe, expectTypeOf, it } from 'bun:test';

import type { Collection } from '@rimbu/collection-types/collection';
import type { SortedCollection } from '@rimbu/collection-types/collection/sorted';
import type { Comp } from '@rimbu/common';
import type { Stream } from '@rimbu/stream';

describe('SortedCollection', () => {
	it('normal interface is correct', () => {
		const c: SortedCollection<number, string> = 0 as any;

		expectTypeOf(c.comp).toEqualTypeOf<Comp<number>>();

		expectTypeOf(c.lowerBound(5)).toEqualTypeOf<number>();
		expectTypeOf(c.upperBound(5)).toEqualTypeOf<number>();

		expectTypeOf(c.next(5)).toEqualTypeOf<string | undefined>();
		expectTypeOf(c.next(5, { inclusive: true })).toEqualTypeOf<
			string | undefined
		>();
		expectTypeOf(c.next(5, { inclusive: true, otherwise: 'x' })).toEqualTypeOf<
			string | 'x'
		>();

		expectTypeOf(c.previous(5)).toEqualTypeOf<string | undefined>();
		expectTypeOf(c.previous(5, { inclusive: true })).toEqualTypeOf<
			string | undefined
		>();
		expectTypeOf(
			c.previous(5, { inclusive: true, otherwise: 'x' }),
		).toEqualTypeOf<string | 'x'>();

		expectTypeOf(c.streamRange({ start: 1, end: 5 })).toEqualTypeOf<
			Stream<string>
		>();
		expectTypeOf(
			c.streamRange({ start: 1, end: 5 }, { reversed: true }),
		).toEqualTypeOf<Stream<string>>();

		expectTypeOf(c.sliceRange({ start: 1, end: 5 })).toEqualTypeOf<
			SortedCollection<number, string>
		>();

		expectTypeOf(c.isEmpty).toEqualTypeOf<boolean>();
		expectTypeOf(c.stream()).toEqualTypeOf<Stream<string>>();
	});

	it('non-empty interface is correct', () => {
		const c: SortedCollection.NonEmpty<number, string> = 0 as any;

		expectTypeOf(c.comp).toEqualTypeOf<Comp<number>>();

		expectTypeOf(c.lowerBound(5)).toEqualTypeOf<number>();
		expectTypeOf(c.next(5)).toEqualTypeOf<string | undefined>();
		expectTypeOf(c.next(5, { otherwise: 'x' })).toEqualTypeOf<string | 'x'>();

		expectTypeOf(c.previous(5)).toEqualTypeOf<string | undefined>();

		expectTypeOf(c.streamRange({ start: 1, end: 5 })).toEqualTypeOf<
			Stream<string>
		>();

		expectTypeOf(c.sliceRange({ start: 1, end: 5 })).toEqualTypeOf<
			SortedCollection<number, string>
		>();

		expectTypeOf(c.isEmpty).toEqualTypeOf<false>();
		expectTypeOf(c.stream()).toEqualTypeOf<Stream.NonEmpty<string>>();
	});

	it('extends Collection', () => {
		expectTypeOf<SortedCollection<number, string>>().toExtend<
			Collection<string>
		>();
	});

	it('NonEmpty extends Collection.NonEmpty', () => {
		expectTypeOf<SortedCollection.NonEmpty<number, string>>().toExtend<
			Collection.NonEmpty<string>
		>();
	});

	it('is covariant in E', () => {
		expectTypeOf<SortedCollection<number, string>>().toExtend<
			SortedCollection<number, string | boolean>
		>();
		expectTypeOf<SortedCollection<number, string | boolean>>().not.toExtend<
			SortedCollection<number, string>
		>();
	});

	it('can assign non-empty to normal', () => {
		expectTypeOf<SortedCollection.NonEmpty<number, string>>().toExtend<
			SortedCollection<number, string>
		>();
		expectTypeOf<SortedCollection<number, string>>().not.toExtend<
			SortedCollection.NonEmpty<number, string>
		>();
	});
});

describe('SortedCollection.Builder', () => {
	it('interface is correct', () => {
		const b: SortedCollection.Builder<number, string> = 0 as any;

		expectTypeOf(b.lowerBound(5)).toEqualTypeOf<number>();
		expectTypeOf(b.upperBound(5)).toEqualTypeOf<number>();

		expectTypeOf(b.next(5)).toEqualTypeOf<string | undefined>();
		expectTypeOf(b.next(5, { inclusive: true, otherwise: 'x' })).toEqualTypeOf<
			string | 'x'
		>();

		expectTypeOf(b.previous(5)).toEqualTypeOf<string | undefined>();
		expectTypeOf(b.previous(5, { otherwise: 'x' })).toEqualTypeOf<
			string | 'x'
		>();

		expectTypeOf(b.isEmpty).toEqualTypeOf<boolean>();
		expectTypeOf(b.build()).toEqualTypeOf<SortedCollection<number, string>>();
	});

	it('extends Collection.Builder', () => {
		expectTypeOf<SortedCollection.Builder<number, string>>().toExtend<
			Collection.Builder<string>
		>();
	});
});

describe('SortedCollection.Types', () => {
	it('_NORMAL is SortedCollection', () => {
		expectTypeOf<
			SortedCollection.Advanced.Types<number, string>['_NORMAL']
		>().toEqualTypeOf<SortedCollection<number, string>>();
	});

	it('_NON_EMPTY is SortedCollection.NonEmpty', () => {
		expectTypeOf<
			SortedCollection.Advanced.Types<number, string>['_NON_EMPTY']
		>().toEqualTypeOf<SortedCollection.NonEmpty<number, string>>();
	});

	it('_NEW_S defaults to unknown', () => {
		expectTypeOf<
			SortedCollection.Advanced.Types<number, string>['_NEW_S']
		>().toEqualTypeOf<unknown>();
	});

	it('_NEW_TYPES._NORMAL resolves', () => {
		expectTypeOf<
			SortedCollection.Advanced.Types<number, string>['_NEW_TYPES']['_NORMAL']
		>().toEqualTypeOf<SortedCollection<unknown, unknown>>();
	});

	it('NonEmpty._NEW_TYPES preserves NonEmpty', () => {
		expectTypeOf<
			SortedCollection.Advanced.TypesNonEmpty<
				number,
				string
			>['_NEW_TYPES']['_NON_EMPTY']
		>().toEqualTypeOf<SortedCollection.NonEmpty<unknown, unknown>>();
	});

	it('extends Collection.Types', () => {
		expectTypeOf<SortedCollection.Advanced.Types<number, string>>().toExtend<
			Collection.Advanced.Types<string>
		>();
	});

	it('NonEmpty extends Collection.Types.NonEmpty', () => {
		expectTypeOf<
			SortedCollection.Advanced.TypesNonEmpty<number, string>
		>().toExtend<Collection.Advanced.TypesNonEmpty<string>>();
	});
});
