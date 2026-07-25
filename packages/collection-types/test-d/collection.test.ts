import { describe, expectTypeOf, it } from 'bun:test';

import type { Collection } from '@rimbu/collection-types/capabilities';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { Stream } from '@rimbu/stream';

interface WithFilterNonEmpty<E> extends Collection.WithFilter<E> {
	readonly context: { __types: Collection.Types.NonEmpty<E> };
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

	it('non-empty stream is more specific than normal', () => {
		expectTypeOf<Stream.NonEmpty<number>>().toExtend<Stream<number>>();
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

	it('forEach is callable', () => {
		const c: Collection<number> = 0 as any;

		expectTypeOf(c.forEach).toBeCallableWith((v: number) => {});
	});

	it('forEachIndexed is callable', () => {
		const c: Collection<number> = 0 as any;

		expectTypeOf(c.forEachIndexed).toBeCallableWith(
			(v: number, i: number, halt: () => void) => {},
		);
		expectTypeOf(c.forEachIndexed).toBeCallableWith(
			(v: number, i: number, halt: () => void) => {},
			{},
		);
		expectTypeOf(c.forEachIndexed).toBeCallableWith(
			(v: number, i: number, halt: () => void) => {},
			{ state: undefined as any },
		);
	});
});

describe('Collection.Builder', () => {
	it('interface is correct', () => {
		const b: Collection.Builder<number> = 0 as any;

		expectTypeOf(b.isEmpty).toEqualTypeOf<boolean>();
		expectTypeOf(b.size).toEqualTypeOf<number>();
		expectTypeOf(b.build()).toEqualTypeOf<Collection<number>>();
		expectTypeOf(b.clear()).toEqualTypeOf<void>();
	});

	it('NonEmpty context still returns normal from build', () => {
		interface B extends Collection.Builder<number> {
			readonly context: { __types: Collection.Types.NonEmpty<number> };
		}
		const b: B = 0 as any;

		expectTypeOf(b.build()).toEqualTypeOf<Collection<number>>();
	});

	it('forEach is callable', () => {
		const b: Collection.Builder<number> = 0 as any;

		expectTypeOf(b.forEach).toBeCallableWith((v: number) => {});
	});

	it('forEachIndexed is callable', () => {
		const b: Collection.Builder<number> = 0 as any;

		expectTypeOf(b.forEachIndexed).toBeCallableWith(
			(v: number, i: number, halt: () => void) => {},
		);
		expectTypeOf(b.forEachIndexed).toBeCallableWith(
			(v: number, i: number, halt: () => void) => {},
			{},
		);
		expectTypeOf(b.forEachIndexed).toBeCallableWith(
			(v: number, i: number, halt: () => void) => {},
			{ state: undefined as any },
		);
	});
});

describe('Collection.WithFilter', () => {
	it('boolean predicate returns _NORMAL', () => {
		const c: Collection.WithFilter<number> = 0 as any;

		expectTypeOf(c.filter((v) => v > 0)).toEqualTypeOf<Collection<number>>();
	});

	it('type guard narrows element type', () => {
		const c: Collection.WithFilter<string | number> = 0 as any;

		expectTypeOf(
			c.filter((v): v is string => typeof v === 'string'),
		).toEqualTypeOf<Collection<string>>();

		expectTypeOf(
			c.filter((v): v is number => typeof v === 'number'),
		).toEqualTypeOf<Collection<number>>();
	});

	it('filterIndexed type guard narrows element type', () => {
		const c: Collection.WithFilter<string | number> = 0 as any;

		expectTypeOf(
			c.filterIndexed((v): v is string => typeof v === 'string'),
		).toEqualTypeOf<Collection<string>>();

		expectTypeOf(
			c.filterIndexed((v): v is number => typeof v === 'number'),
		).toEqualTypeOf<Collection<number>>();
	});

	it('filterIndexed boolean predicate returns _NORMAL', () => {
		const c: Collection.WithFilter<number> = 0 as any;

		expectTypeOf(
			c.filterIndexed((v, i) => i % 2 === 0),
		).toEqualTypeOf<Collection<number>>();
	});

	it('NonEmpty context still returns normal after filter', () => {
		const c: WithFilterNonEmpty<string | number> = 0 as any;

		expectTypeOf(
			c.filter((v): v is string => typeof v === 'string'),
		).toEqualTypeOf<Collection<string>>();

		expectTypeOf(c.filter((v) => (v as number) > 0)).toEqualTypeOf<
			Collection<string | number>
		>();
	});

	it('can be assigned to Collection', () => {
		expectTypeOf<Collection.WithFilter<number>>().toExtend<Collection<number>>();
	});

	it('is covariant in E', () => {
		expectTypeOf<Collection.WithFilter<string>>().toExtend<
			Collection.WithFilter<string | number>
		>();
		expectTypeOf<
			Collection.WithFilter<string | number>
		>().not.toExtend<Collection.WithFilter<string>>();
	});
});

describe('Collection.Types', () => {
	it('_SELF equals _NORMAL', () => {
		expectTypeOf<
			Collection.Types<number>['_SELF']
		>().toEqualTypeOf<Collection.Types<number>['_NORMAL']>();
	});

	it('NonEmpty._SELF equals NonEmpty._NON_EMPTY', () => {
		expectTypeOf<
			Collection.Types.NonEmpty<number>['_SELF']
		>().toEqualTypeOf<Collection.Types.NonEmpty<number>['_NON_EMPTY']>();
	});

	it('_UPPER_E is unknown', () => {
		expectTypeOf<Collection.Types<number>['_UPPER_E']>().toEqualTypeOf<unknown>();
	});

	it('_NEW_E defaults to _UPPER_E (unknown)', () => {
		expectTypeOf<Collection.Types<number>['_NEW_E']>().toEqualTypeOf<unknown>();
	});

	it('_NEW_TYPES._NORMAL resolves to Collection<unknown>', () => {
		expectTypeOf<
			Collection.Types<number>['_NEW_TYPES']['_NORMAL']
		>().toEqualTypeOf<Collection<unknown>>();
	});

	it('_NEW_TYPES._NON_EMPTY resolves to Collection.NonEmpty<unknown>', () => {
		expectTypeOf<
			Collection.Types<number>['_NEW_TYPES']['_NON_EMPTY']
		>().toEqualTypeOf<Collection.NonEmpty<unknown>>();
	});

	it('NonEmpty._NEW_TYPES preserves NonEmpty structure', () => {
		expectTypeOf<
			Collection.Types.NonEmpty<number>['_NEW_TYPES']['_NORMAL']
		>().toEqualTypeOf<Collection<unknown>>();
		expectTypeOf<
			Collection.Types.NonEmpty<number>['_NEW_TYPES']['_NON_EMPTY']
		>().toEqualTypeOf<Collection.NonEmpty<unknown>>();
	});

	it('_NEW_TYPES._SELF equals _NEW_TYPES._NORMAL', () => {
		expectTypeOf<
			Collection.Types<number>['_NEW_TYPES']['_SELF']
		>().toEqualTypeOf<Collection.Types<number>['_NEW_TYPES']['_NORMAL']>();
	});

	it('NonEmpty extends normal Types', () => {
		expectTypeOf<Collection.Types.NonEmpty<number>>().toExtend<
			Collection.Types<number>
		>();
	});
});

describe('Collection context', () => {
	it('context.__types is Types', () => {
		const c: Collection<number> = 0 as any;

		expectTypeOf(c.context.__types).toEqualTypeOf<Collection.Types<number>>();
	});

	it('NonEmpty context.__types is Types.NonEmpty', () => {
		const c: Collection.NonEmpty<number> = 0 as any;

		expectTypeOf(c.context.__types).toEqualTypeOf<
			Collection.Types.NonEmpty<number>
		>();
	});
});
