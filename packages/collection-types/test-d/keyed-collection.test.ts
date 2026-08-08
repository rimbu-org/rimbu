import { describe, expectTypeOf, it } from 'bun:test';

import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { Stream } from '@rimbu/stream';

type WithMapNonEmpty<K, V> = KeyedCollection.NonEmpty<K, V> &
	KeyedCollection.Capability.WithMapValues<K, V>;

describe('KeyedCollection', () => {
	it('normal interface is correct', () => {
		const c: KeyedCollection<number, string> = 0 as any;

		expectTypeOf(c.get(1)).toEqualTypeOf<string | undefined>();
		expectTypeOf(c.get(1, 'a')).toEqualTypeOf<string | string>();
		expectTypeOf(c.get(1, true as boolean)).toEqualTypeOf<string | boolean>();

		expectTypeOf(c.has(1)).toEqualTypeOf<boolean>();

		expectTypeOf(c.streamKeys()).toEqualTypeOf<Stream<number>>();
		expectTypeOf(c.streamValues()).toEqualTypeOf<Stream<string>>();

		expectTypeOf(c.isEmpty).toEqualTypeOf<boolean>();
	});

	it('non-empty interface is correct', () => {
		const c: KeyedCollection.NonEmpty<number, string> = 0 as any;

		expectTypeOf(c.get(1)).toEqualTypeOf<string | undefined>();
		expectTypeOf(c.get(1, 'a')).toEqualTypeOf<string | string>();

		expectTypeOf(c.has(1)).toEqualTypeOf<boolean>();

		expectTypeOf(c.streamKeys()).toEqualTypeOf<Stream.NonEmpty<number>>();
		expectTypeOf(c.streamValues()).toEqualTypeOf<Stream.NonEmpty<string>>();

		expectTypeOf(c.isEmpty).toEqualTypeOf<false>();
	});

	it('extends Collection with readonly [K, V] as element', () => {
		expectTypeOf<KeyedCollection<number, string>>().toExtend<
			Collection<readonly [number, string]>
		>();
	});

	it('NonEmpty extends Collection.NonEmpty', () => {
		expectTypeOf<KeyedCollection.NonEmpty<number, string>>().toExtend<
			Collection.NonEmpty<readonly [number, string]>
		>();
	});

	it('is covariant in V', () => {
		expectTypeOf<KeyedCollection<number, string>>().toExtend<
			KeyedCollection<number, string | boolean>
		>();
		expectTypeOf<KeyedCollection<number, string | boolean>>().not.toExtend<
			KeyedCollection<number, string>
		>();
	});

	it('can assign non-empty to normal', () => {
		expectTypeOf<KeyedCollection.NonEmpty<number, string>>().toExtend<
			KeyedCollection<number, string>
		>();
		expectTypeOf<KeyedCollection<number, string>>().not.toExtend<
			KeyedCollection.NonEmpty<number, string>
		>();
	});
});

describe('KeyedCollection.Builder', () => {
	it('interface is correct', () => {
		const b: KeyedCollection.Builder<number, string> = 0 as any;

		expectTypeOf(b.get(1)).toEqualTypeOf<string | undefined>();
		expectTypeOf(b.get(1, 'a')).toEqualTypeOf<string | string>();
		expectTypeOf(b.get(1, true as boolean)).toEqualTypeOf<string | boolean>();

		expectTypeOf(b.has(1)).toEqualTypeOf<boolean>();

		expectTypeOf(b.isEmpty).toEqualTypeOf<boolean>();
		expectTypeOf(b.build()).toEqualTypeOf<KeyedCollection<number, string>>();
	});

	it('extends Collection.Builder', () => {
		expectTypeOf<KeyedCollection.Builder<number, string>>().toExtend<
			Collection.Builder<readonly [number, string]>
		>();
	});
});

describe('KeyedCollection.WithMap', () => {
	it('normal maps values using _NEW_V slot', () => {
		const c: KeyedCollection.Capability.WithMapValues<number, string> =
			0 as any;

		expectTypeOf(c.mapValues((v) => v.length)).toEqualTypeOf<
			KeyedCollection<unknown, number>
		>();
	});

	it('NonEmpty preserves NonEmpty via _SELF slot', () => {
		const c: WithMapNonEmpty<number, string> = 0 as any;

		expectTypeOf(c.mapValues((v) => v.length)).toEqualTypeOf<
			WithMapNonEmpty<number, number>
		>();
	});

	it('mapIndexed normal preserves type', () => {
		const c: KeyedCollection.WithMapValues<number, string> = 0 as any;

		expectTypeOf(c.mapIndexed((v, k, i) => v.length)).toEqualTypeOf<
			KeyedCollection<unknown, number>
		>();
	});

	it('mapIndexed NonEmpty preserves NonEmpty', () => {
		const c: WithMapNonEmpty<number, string> = 0 as any;

		expectTypeOf(c.mapIndexed((v, k, i) => v.length)).toEqualTypeOf<
			KeyedCollection.NonEmpty<unknown, number>
		>();
	});

	it('extends KeyedCollection', () => {
		expectTypeOf<KeyedCollection.WithMapValues<number, string>>().toExtend<
			KeyedCollection<number, string>
		>();
	});
});

describe('KeyedCollection.Advanced.Types', () => {
	it('_NORMAL is KeyedCollection', () => {
		expectTypeOf<
			KeyedCollection.Advanced.Types<number, string>['_NORMAL']
		>().toEqualTypeOf<KeyedCollection<number, string>>();
	});

	it('_NON_EMPTY is KeyedCollection.NonEmpty', () => {
		expectTypeOf<
			KeyedCollection.Advanced.Types<number, string>['_NON_EMPTY']
		>().toEqualTypeOf<KeyedCollection.NonEmpty<number, string>>();
	});

	it('_streamKeys resolves', () => {
		const fn: KeyedCollection.Advanced.Types<number, string>['_streamKeys'] =
			0 as any;

		expectTypeOf(fn()).toEqualTypeOf<Stream<number>>();
	});

	it('_streamValues resolves', () => {
		const fn: KeyedCollection.Advanced.Types<number, string>['_streamValues'] =
			0 as any;

		expectTypeOf(fn()).toEqualTypeOf<Stream<string>>();
	});

	it('NonEmpty._streamKeys returns Stream.NonEmpty', () => {
		const fn: KeyedCollection.Advanced.TypesNonEmpty<
			number,
			string
		>['_streamKeys'] = 0 as any;

		expectTypeOf(fn()).toEqualTypeOf<Stream.NonEmpty<number>>();
	});

	it('NonEmpty._streamValues returns Stream.NonEmpty', () => {
		const fn: KeyedCollection.Advanced.TypesNonEmpty<
			number,
			string
		>['_streamValues'] = 0 as any;

		expectTypeOf(fn()).toEqualTypeOf<Stream.NonEmpty<string>>();
	});

	it('_NEW_K defaults to unknown', () => {
		expectTypeOf<
			KeyedCollection.Advanced.Types<number, string>['_NEW_K']
		>().toEqualTypeOf<unknown>();
	});

	it('_NEW_V defaults to unknown', () => {
		expectTypeOf<
			KeyedCollection.Advanced.Types<number, string>['_NEW_V']
		>().toEqualTypeOf<unknown>();
	});

	it('_NEW_TYPES._NORMAL resolves', () => {
		expectTypeOf<
			KeyedCollection.Advanced.Types<number, string>['_NEW_TYPES']['_NORMAL']
		>().toEqualTypeOf<KeyedCollection<unknown, unknown>>();
	});

	it('NonEmpty._NEW_TYPES preserves NonEmpty', () => {
		expectTypeOf<
			KeyedCollection.Advanced.TypesNonEmpty<
				number,
				string
			>['_NEW_TYPES']['_NON_EMPTY']
		>().toEqualTypeOf<KeyedCollection.NonEmpty<unknown, unknown>>();
	});

	it('extends Collection.Advanced.Types', () => {
		expectTypeOf<KeyedCollection.Advanced.Types<number, string>>().toExtend<
			Collection.Advanced.Types<readonly [number, string]>
		>();
	});

	it('NonEmpty extends Collection.Advanced.TypesNonEmpty', () => {
		expectTypeOf<
			KeyedCollection.Advanced.TypesNonEmpty<number, string>
		>().toExtend<
			Collection.Advanced.TypesNonEmpty<readonly [number, string]>
		>();
	});
});
