import { describe, expectTypeOf, it } from 'bun:test';

import type {
	Collection,
	ValuedCollection,
} from '@rimbu/collection-types/collection/sorted';
import type { Stream } from '@rimbu/stream';

describe('ValuedCollection', () => {
	it('normal interface is correct', () => {
		const c: ValuedCollection<number> = 0 as any;

		expectTypeOf(c.has).toBeCallableWith(1);
		expectTypeOf(c.has).toBeCallableWith('a' as unknown as number);

		expectTypeOf(c.isEmpty).toEqualTypeOf<boolean>();
		expectTypeOf(c.stream()).toEqualTypeOf<Stream<number>>();
	});

	it('non-empty interface is correct', () => {
		const c: ValuedCollection.NonEmpty<number> = 0 as any;

		expectTypeOf(c.has).toBeCallableWith(1);
		expectTypeOf(c.isEmpty).toEqualTypeOf<false>();
		expectTypeOf(c.stream()).toEqualTypeOf<Stream.NonEmpty<number>>();
	});

	it('is covariant in T', () => {
		expectTypeOf<ValuedCollection<string>>().toExtend<
			ValuedCollection<string | number>
		>();
		expectTypeOf<ValuedCollection<string | number>>().not.toExtend<
			ValuedCollection<string>
		>();
	});

	it('NonEmpty is covariant in T', () => {
		expectTypeOf<ValuedCollection.NonEmpty<string>>().toExtend<
			ValuedCollection.NonEmpty<string | number>
		>();
		expectTypeOf<ValuedCollection.NonEmpty<string | number>>().not.toExtend<
			ValuedCollection.NonEmpty<string>
		>();
	});

	it('can assign non-empty to normal', () => {
		expectTypeOf<ValuedCollection.NonEmpty<string>>().toExtend<
			ValuedCollection<string>
		>();
		expectTypeOf<ValuedCollection<string>>().not.toExtend<
			ValuedCollection.NonEmpty<string>
		>();
	});

	it('extends Collection', () => {
		expectTypeOf<ValuedCollection<number>>().toExtend<Collection<number>>();
	});

	it('NonEmpty extends Collection.NonEmpty', () => {
		expectTypeOf<ValuedCollection.NonEmpty<number>>().toExtend<
			Collection.NonEmpty<number>
		>();
	});
});

describe('ValuedCollection.Builder', () => {
	it('interface is correct', () => {
		const b: ValuedCollection.Builder<number> = 0 as any;

		expectTypeOf(b.has).toBeCallableWith(1);
		expectTypeOf(b.has).toBeCallableWith('a' as unknown as number);

		expectTypeOf(b.isEmpty).toEqualTypeOf<boolean>();
		expectTypeOf(b.build()).toEqualTypeOf<ValuedCollection<number>>();
	});

	it('extends Collection.Builder', () => {
		expectTypeOf<ValuedCollection.Builder<number>>().toExtend<
			Collection.Builder<number>
		>();
	});
});

describe('ValuedCollection.Types', () => {
	it('_NORMAL is ValuedCollection', () => {
		expectTypeOf<ValuedCollection.Types<number>['_NORMAL']>().toEqualTypeOf<
			ValuedCollection<number>
		>();
	});

	it('_NON_EMPTY is ValuedCollection.NonEmpty', () => {
		expectTypeOf<ValuedCollection.Types<number>['_NON_EMPTY']>().toEqualTypeOf<
			ValuedCollection.NonEmpty<number>
		>();
	});

	it('_NEW_TYPES._NORMAL resolves', () => {
		expectTypeOf<
			ValuedCollection.Types<number>['_NEW_TYPES']['_NORMAL']
		>().toEqualTypeOf<ValuedCollection<unknown>>();
	});

	it('_NEW_TYPES._NON_EMPTY resolves', () => {
		expectTypeOf<
			ValuedCollection.Types<number>['_NEW_TYPES']['_NON_EMPTY']
		>().toEqualTypeOf<ValuedCollection.NonEmpty<unknown>>();
	});

	it('NonEmpty._NEW_TYPES preserves NonEmpty', () => {
		expectTypeOf<
			ValuedCollection.Types.NonEmpty<number>['_NEW_TYPES']['_NON_EMPTY']
		>().toEqualTypeOf<ValuedCollection.NonEmpty<unknown>>();
	});

	it('extends Collection.Types', () => {
		expectTypeOf<ValuedCollection.Types<number>>().toExtend<
			Collection.Types<number>
		>();
	});

	it('NonEmpty extends Collection.Types.NonEmpty', () => {
		expectTypeOf<ValuedCollection.Types.NonEmpty<number>>().toExtend<
			Collection.Types.NonEmpty<number>
		>();
	});
});
