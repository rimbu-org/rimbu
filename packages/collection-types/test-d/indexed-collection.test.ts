import { describe, expectTypeOf, it } from 'bun:test';

import type {
	Collection,
	IndexedCollection,
} from '@rimbu/collection-types/collection/sorted';
import type { Stream } from '@rimbu/stream';

interface WithMapNonEmpty<E> extends IndexedCollection.Capability.WithMap<E> {
	context: { __types: IndexedCollection.Advanced.TypesNonEmpty<E> };
}

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
		expectTypeOf(c.take(-1)).toEqualTypeOf<
			IndexedCollection.NonEmpty<number>
		>();
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
		const c: IndexedCollection.Capability.WithMap<number> = 0 as any;

		expectTypeOf(c.map(String)).toEqualTypeOf<IndexedCollection<string>>();

		const cne: WithMapNonEmpty<number> = 0 as any;

		expectTypeOf(cne.map(String)).toEqualTypeOf<
			IndexedCollection.NonEmpty<string>
		>();
	});

	it('WithMap mapIndexed preserves type', () => {
		const c: IndexedCollection.WithMap<number> = 0 as any;

		expectTypeOf(c.mapIndexed((v, i) => String(v))).toEqualTypeOf<
			IndexedCollection<string>
		>();

		const cne: WithMapNonEmpty<number> = 0 as any;

		expectTypeOf(cne.mapIndexed((v, i) => String(v))).toEqualTypeOf<
			IndexedCollection.NonEmpty<string>
		>();
	});
});

describe('IndexedCollection extends Collection', () => {
	it('normal extends Collection normal', () => {
		expectTypeOf<IndexedCollection<number>>().toExtend<Collection<number>>();
	});

	it('NonEmpty extends Collection.NonEmpty', () => {
		expectTypeOf<IndexedCollection.NonEmpty<number>>().toExtend<
			Collection.NonEmpty<number>
		>();
	});

	it('Builder extends Collection.Builder', () => {
		expectTypeOf<IndexedCollection.Builder<number>>().toExtend<
			Collection.Builder<number>
		>();
	});

	it('Types extends Collection.Types', () => {
		expectTypeOf<IndexedCollection.Types<number>>().toExtend<
			Collection.Types<number>
		>();
	});

	it('Types.NonEmpty extends Collection.Types.NonEmpty', () => {
		expectTypeOf<IndexedCollection.Types.NonEmpty<number>>().toExtend<
			Collection.Types.NonEmpty<number>
		>();
	});
});

describe('IndexedCollection.Builder', () => {
	it('interface is correct', () => {
		const b: IndexedCollection.Builder<number> = 0 as any;

		expectTypeOf(b.at(3)).toEqualTypeOf<number | undefined>();
		expectTypeOf(b.at(3, 'a')).toEqualTypeOf<number | string>();

		expectTypeOf(b.first()).toEqualTypeOf<number | undefined>();
		expectTypeOf(b.first('a')).toEqualTypeOf<number | string>();
		expectTypeOf(b.last()).toEqualTypeOf<number | undefined>();
		expectTypeOf(b.last('a')).toEqualTypeOf<number | string>();
	});
});

describe('IndexedCollection.FirstLast', () => {
	it('normal returns E | undefined without fallback', () => {
		const fl: IndexedCollection.FirstLast<number> = 0 as any;

		expectTypeOf(fl()).toEqualTypeOf<number | undefined>();
	});

	it('normal returns E | O with fallback', () => {
		const fl: IndexedCollection.FirstLast<number> = 0 as any;

		expectTypeOf(fl('a')).toEqualTypeOf<number | string>();
	});

	it('NonEmpty returns E without fallback', () => {
		const fl: IndexedCollection.FirstLast<number, true> = 0 as any;

		expectTypeOf(fl()).toEqualTypeOf<number>();
	});

	it('NonEmpty returns E with fallback ignored', () => {
		const fl: IndexedCollection.FirstLast<number, true> = 0 as any;

		expectTypeOf(fl('a')).toEqualTypeOf<number>();
	});

	it('NonEmpty is assignable to normal', () => {
		expectTypeOf<IndexedCollection.FirstLast<string, true>>().toExtend<
			IndexedCollection.FirstLast<string>
		>();
	});
});

describe('IndexedCollection.Capability.WithFilterIndexed', () => {
	it('filterIndexed type guard narrows element type', () => {
		const c: Collection.Capability.WithFilterIndexed<string | number> =
			0 as any;

		expectTypeOf(
			c.filterIndexed((v): v is string => typeof v === 'string'),
		).toEqualTypeOf<Collection<string>>();

		expectTypeOf(
			c.filterIndexed((v): v is number => typeof v === 'number'),
		).toEqualTypeOf<Collection<number>>();
	});

	it('filterIndexed boolean predicate returns _NORMAL', () => {
		const c: Collection.Capability.WithFilter<number> = 0 as any;

		expectTypeOf(c.filterIndexed((v, i) => i % 2 === 0)).toEqualTypeOf<
			Collection<number>
		>();
	});

	it('filterIndexed negate with type guard returns complement', () => {
		const c: Collection.Capability.WithFilter<string | number> = 0 as any;

		expectTypeOf(
			c.filterIndexed((v): v is string => typeof v === 'string', {
				negate: true,
			}),
		).toEqualTypeOf<Collection<number>>();
	});
});

describe('IndexedCollection.WithRemoveAt', () => {
	it('interface is correct', () => {
		const c: IndexedCollection.Capability.WithRemoveAt<number> = 0 as any;

		expectTypeOf(c.removeAt(3)).toEqualTypeOf<IndexedCollection<number>>();
	});

	it('extends IndexedCollection', () => {
		expectTypeOf<IndexedCollection.Capability.WithRemoveAt<number>>().toExtend<
			IndexedCollection<number>
		>();
	});
});

describe('IndexedCollection.WithSwapAt', () => {
	it('interface is correct', () => {
		const c: IndexedCollection.Capability.WithSwapAt<number> = 0 as any;

		expectTypeOf(c.swapAt(0, 3)).toEqualTypeOf<IndexedCollection<number>>();
	});

	it('extends IndexedCollection', () => {
		expectTypeOf<IndexedCollection.Capability.WithSwapAt<number>>().toExtend<
			IndexedCollection<number>
		>();
	});
});

describe('IndexedCollection.WithOrderEditable', () => {
	it('interface is correct', () => {
		const c: IndexedCollection.Capability.WithOrderEditable<number> = 0 as any;

		expectTypeOf(c.prepend(1)).toEqualTypeOf<
			IndexedCollection.NonEmpty<number>
		>();
		expectTypeOf(c.append(1)).toEqualTypeOf<
			IndexedCollection.NonEmpty<number>
		>();
		expectTypeOf(c.placeAt(0, 1)).toEqualTypeOf<
			IndexedCollection.NonEmpty<number>
		>();
	});

	it('extends IndexedCollection', () => {
		expectTypeOf<
			IndexedCollection.Capability.WithOrderEditable<number>
		>().toExtend<IndexedCollection<number>>();
	});
});

describe('IndexedCollection.WithMoveTo', () => {
	it('interface is correct', () => {
		const c: IndexedCollection.Capability.WithMoveTo<unknown, number> =
			0 as any;

		expectTypeOf(c.moveTo(3, 1)).toEqualTypeOf<IndexedCollection<number>>();
	});

	it('extends IndexedCollection', () => {
		expectTypeOf<
			IndexedCollection.Capability.WithMoveTo<unknown, number>
		>().toExtend<IndexedCollection<number>>();
	});
});

describe('IndexedCollection.Types', () => {
	it('_NORMAL is IndexedCollection', () => {
		expectTypeOf<
			IndexedCollection.Advanced.Types<number>['_NORMAL']
		>().toEqualTypeOf<IndexedCollection<number>>();
	});

	it('_NON_EMPTY is IndexedCollection.NonEmpty', () => {
		expectTypeOf<
			IndexedCollection.Advanced.Types<number>['_NON_EMPTY']
		>().toEqualTypeOf<IndexedCollection.NonEmpty<number>>();
	});

	it('_stream takes optional reversed option', () => {
		const streamFn: IndexedCollection.Advanced.Types<number>['_stream'] =
			0 as any;

		expectTypeOf(streamFn()).toEqualTypeOf<Stream<number>>();
		expectTypeOf(streamFn({ reversed: true })).toEqualTypeOf<Stream<number>>();
	});

	it('NonEmpty._stream takes optional reversed option', () => {
		const streamFn: IndexedCollection.Advanced.TypesNonEmpty<number>['_stream'] =
			0 as any;

		expectTypeOf(streamFn()).toEqualTypeOf<Stream.NonEmpty<number>>();
		expectTypeOf(streamFn({ reversed: true })).toEqualTypeOf<
			Stream.NonEmpty<number>
		>();
	});

	it('_firstLast normal returns E | undefined', () => {
		const fl: IndexedCollection.Advanced.Types<number>['_firstLast'] = 0 as any;

		expectTypeOf(fl()).toEqualTypeOf<number | undefined>();
	});

	it('_firstLast NonEmpty returns E', () => {
		const fl: IndexedCollection.Advanced.Types.NonEmpty<number>['_firstLast'] =
			0 as any;

		expectTypeOf(fl()).toEqualTypeOf<number>();
	});

	it('_NEW_TYPES._NORMAL resolves', () => {
		expectTypeOf<
			IndexedCollection.Advanced.Types<number>['_NEW_TYPES']['_NORMAL']
		>().toEqualTypeOf<IndexedCollection<unknown>>();
	});

	it('_NEW_TYPES._SELF preserves NonEmpty from NonEmpty source', () => {
		expectTypeOf<
			IndexedCollection.Advanced.TypesNonEmpty<number>['_NEW_TYPES']['_SELF']
		>().toEqualTypeOf<IndexedCollection.NonEmpty<unknown>>();
	});
});
