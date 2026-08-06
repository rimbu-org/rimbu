import { describe, expectTypeOf, it } from 'bun:test';

import type {
	IndexedCollection,
	IndexedKeyedCollection,
	KeyedCollection,
} from '@rimbu/collection-types/collection/sorted';
import type { Stream } from '@rimbu/stream';

describe('IndexedKeyedCollection', () => {
	it('normal interface is correct', () => {
		const c: IndexedKeyedCollection<number, string> = 0 as any;

		expectTypeOf(c.indexOf(1)).toEqualTypeOf<number | undefined>();
		expectTypeOf(c.indexOf(1, 'a')).toEqualTypeOf<number | string>();

		expectTypeOf(c.get(1)).toEqualTypeOf<string | undefined>();
		expectTypeOf(c.get(1, 'a')).toEqualTypeOf<string | string>();

		expectTypeOf(c.has(1)).toEqualTypeOf<boolean>();

		expectTypeOf(c.at(3)).toEqualTypeOf<
			readonly [number, string] | undefined
		>();

		expectTypeOf(c.first()).toEqualTypeOf<
			readonly [number, string] | undefined
		>();
		expectTypeOf(c.last()).toEqualTypeOf<
			readonly [number, string] | undefined
		>();

		expectTypeOf(c.take(3)).toEqualTypeOf<
			IndexedKeyedCollection<number, string>
		>();

		expectTypeOf(c.stream()).toEqualTypeOf<Stream<readonly [number, string]>>();
		expectTypeOf(c.streamSlice({ amount: 3 })).toEqualTypeOf<
			Stream<readonly [number, string]>
		>();

		expectTypeOf(c.streamKeys()).toEqualTypeOf<Stream<number>>();
		expectTypeOf(c.streamValues()).toEqualTypeOf<Stream<string>>();

		expectTypeOf(c.isEmpty).toEqualTypeOf<boolean>();
	});

	it('non-empty interface is correct', () => {
		const c: IndexedKeyedCollection.NonEmpty<number, string> = 0 as any;

		expectTypeOf(c.indexOf(1)).toEqualTypeOf<number | undefined>();

		expectTypeOf(c.get(1)).toEqualTypeOf<string | undefined>();
		expectTypeOf(c.has(1)).toEqualTypeOf<boolean>();

		expectTypeOf(c.first()).toEqualTypeOf<readonly [number, string]>();
		expectTypeOf(c.last()).toEqualTypeOf<readonly [number, string]>();

		expectTypeOf(c.take(0)).toEqualTypeOf<
			IndexedKeyedCollection<number, string>
		>();
		expectTypeOf(c.take(3)).toEqualTypeOf<
			IndexedKeyedCollection.NonEmpty<number, string>
		>();
		expectTypeOf(c.take(-1)).toEqualTypeOf<
			IndexedKeyedCollection.NonEmpty<number, string>
		>();

		expectTypeOf(c.stream()).toEqualTypeOf<
			Stream.NonEmpty<readonly [number, string]>
		>();

		expectTypeOf(c.streamKeys()).toEqualTypeOf<Stream.NonEmpty<number>>();
		expectTypeOf(c.streamValues()).toEqualTypeOf<Stream.NonEmpty<string>>();

		expectTypeOf(c.isEmpty).toEqualTypeOf<false>();
	});

	it('extends IndexedCollection', () => {
		expectTypeOf<IndexedKeyedCollection<number, string>>().toExtend<
			IndexedCollection<readonly [number, string]>
		>();
	});

	it('extends KeyedCollection', () => {
		expectTypeOf<IndexedKeyedCollection<number, string>>().toExtend<
			KeyedCollection<number, string>
		>();
	});

	it('NonEmpty extends IndexedCollection.NonEmpty', () => {
		expectTypeOf<IndexedKeyedCollection.NonEmpty<number, string>>().toExtend<
			IndexedCollection.NonEmpty<readonly [number, string]>
		>();
	});

	it('NonEmpty extends KeyedCollection.NonEmpty', () => {
		expectTypeOf<IndexedKeyedCollection.NonEmpty<number, string>>().toExtend<
			KeyedCollection.NonEmpty<number, string>
		>();
	});

	it('is covariant in V', () => {
		expectTypeOf<IndexedKeyedCollection<number, string>>().toExtend<
			IndexedKeyedCollection<number, string | boolean>
		>();
	});

	it('can assign non-empty to normal', () => {
		expectTypeOf<IndexedKeyedCollection.NonEmpty<number, string>>().toExtend<
			IndexedKeyedCollection<number, string>
		>();
	});
});

describe('IndexedKeyedCollection.Builder', () => {
	it('interface is correct', () => {
		const b: IndexedKeyedCollection.Builder<number, string> = 0 as any;

		expectTypeOf(b.indexOf(1)).toEqualTypeOf<number | undefined>();
		expectTypeOf(b.indexOf(1, 'a')).toEqualTypeOf<number | string>();

		expectTypeOf(b.get(1)).toEqualTypeOf<string | undefined>();
		expectTypeOf(b.get(1, 'a')).toEqualTypeOf<string | string>();

		expectTypeOf(b.has(1)).toEqualTypeOf<boolean>();

		expectTypeOf(b.at(3)).toEqualTypeOf<
			readonly [number, string] | undefined
		>();
		expectTypeOf(b.first()).toEqualTypeOf<
			readonly [number, string] | undefined
		>();

		expectTypeOf(b.build()).toEqualTypeOf<
			IndexedKeyedCollection<number, string>
		>();
	});

	it('extends IndexedCollection.Builder', () => {
		expectTypeOf<IndexedKeyedCollection.Builder<number, string>>().toExtend<
			IndexedCollection.Builder<readonly [number, string]>
		>();
	});

	it('extends KeyedCollection.Builder', () => {
		expectTypeOf<IndexedKeyedCollection.Builder<number, string>>().toExtend<
			KeyedCollection.Builder<number, string>
		>();
	});
});

describe('IndexedKeyedCollection.Types', () => {
	it('_NORMAL is IndexedKeyedCollection', () => {
		expectTypeOf<
			IndexedKeyedCollection.Types<number, string>['_NORMAL']
		>().toEqualTypeOf<IndexedKeyedCollection<number, string>>();
	});

	it('_NON_EMPTY is IndexedKeyedCollection.NonEmpty', () => {
		expectTypeOf<
			IndexedKeyedCollection.Types<number, string>['_NON_EMPTY']
		>().toEqualTypeOf<IndexedKeyedCollection.NonEmpty<number, string>>();
	});

	it('_stream has indexed signature with reversed option', () => {
		const fn: IndexedKeyedCollection.Types<number, string>['_stream'] =
			0 as any;

		expectTypeOf(fn()).toEqualTypeOf<Stream<readonly [number, string]>>();
		expectTypeOf(fn({ reversed: true })).toEqualTypeOf<
			Stream<readonly [number, string]>
		>();
	});

	it('_streamKeys has indexed signature with reversed option', () => {
		const fn: IndexedKeyedCollection.Types<number, string>['_streamKeys'] =
			0 as any;

		expectTypeOf(fn()).toEqualTypeOf<Stream<number>>();
		expectTypeOf(fn({ reversed: true })).toEqualTypeOf<Stream<number>>();
	});

	it('_streamValues has indexed signature with reversed option', () => {
		const fn: IndexedKeyedCollection.Types<number, string>['_streamValues'] =
			0 as any;

		expectTypeOf(fn()).toEqualTypeOf<Stream<string>>();
		expectTypeOf(fn({ reversed: true })).toEqualTypeOf<Stream<string>>();
	});

	it('NonEmpty._streamKeys returns Stream.NonEmpty', () => {
		const fn: IndexedKeyedCollection.Types.NonEmpty<
			number,
			string
		>['_streamKeys'] = 0 as any;

		expectTypeOf(fn()).toEqualTypeOf<Stream.NonEmpty<number>>();
	});

	it('NonEmpty._streamValues returns Stream.NonEmpty', () => {
		const fn: IndexedKeyedCollection.Types.NonEmpty<
			number,
			string
		>['_streamValues'] = 0 as any;

		expectTypeOf(fn()).toEqualTypeOf<Stream.NonEmpty<string>>();
	});

	it('NonEmpty._firstLast returns element without fallback', () => {
		const fl: IndexedKeyedCollection.Types.NonEmpty<
			number,
			string
		>['_firstLast'] = 0 as any;

		expectTypeOf(fl()).toEqualTypeOf<readonly [number, string]>();
	});

	it('_NEW_TYPES._NORMAL resolves', () => {
		expectTypeOf<
			IndexedKeyedCollection.Types<number, string>['_NEW_TYPES']['_NORMAL']
		>().toEqualTypeOf<IndexedKeyedCollection<unknown, unknown>>();
	});

	it('NonEmpty._NEW_TYPES preserves NonEmpty', () => {
		expectTypeOf<
			IndexedKeyedCollection.Types.NonEmpty<
				number,
				string
			>['_NEW_TYPES']['_NON_EMPTY']
		>().toEqualTypeOf<IndexedKeyedCollection.NonEmpty<unknown, unknown>>();
	});

	it('extends IndexedCollection.Types', () => {
		expectTypeOf<IndexedKeyedCollection.Types<number, string>>().toExtend<
			IndexedCollection.Types<readonly [number, string]>
		>();
	});

	it('extends KeyedCollection.Types', () => {
		expectTypeOf<IndexedKeyedCollection.Types<number, string>>().toExtend<
			KeyedCollection.Types<number, string>
		>();
	});

	it('NonEmpty extends IndexedCollection.Types.NonEmpty', () => {
		expectTypeOf<
			IndexedKeyedCollection.Types.NonEmpty<number, string>
		>().toExtend<IndexedCollection.Types.NonEmpty<readonly [number, string]>>();
	});

	it('NonEmpty extends KeyedCollection.Types.NonEmpty', () => {
		expectTypeOf<
			IndexedKeyedCollection.Types.NonEmpty<number, string>
		>().toExtend<KeyedCollection.Types.NonEmpty<number, string>>();
	});
});
