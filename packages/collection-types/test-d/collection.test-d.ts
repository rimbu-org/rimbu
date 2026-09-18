import { expectTypeOf } from 'bun:test';

import type { ArrayNonEmpty } from '@rimbu/common';
import type { FastIterator, Stream, StreamSource } from '@rimbu/stream';
import type { Reducer } from '@rimbu/stream/reducer';

import type { Collection } from '@rimbu/collection-types/collection';

type C<
	E = number,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = Collection<E, F>;
type CNE<E = number> = Collection.NonEmpty<E>;

type WithAdd<E> = Collection.Capability.WithAdd<E>;
type WithAddAll<E> = Collection.Capability.WithAddAll<E>;
type WithToBuilder<E> = Collection.Capability.WithToBuilder<E>;
type WithMap<E> = Collection.Capability.WithMap<E>;
type WithMapIndexed<E> = Collection.Capability.WithMapIndexed<E>;
type WithFlatMap<E> = Collection.Capability.WithFlatMap<E>;
type WithFlatMapIndexed<E> = Collection.Capability.WithFlatMapIndexed<E>;
type WithMutate<E> = Collection.Capability.WithMutate<E>;
type WithReducer<E> = Collection.Capability.WithReducer<E>;
type WithRecompose<E> = Collection.Capability.WithRecompose<E>;

type Tp<
	F extends Collection.Advanced.FamilyBase<any>,
	E,
> = Collection.Advanced.Types<F, E>;
type N<
	F extends Collection.Advanced.FamilyBase<any>,
	E,
> = Tp<F, E>['_NORMAL'];
type NE<
	F extends Collection.Advanced.FamilyBase<any>,
	E,
> = Tp<F, E>['_NON_EMPTY'];
type B<
	F extends Collection.Advanced.FamilyBase<any>,
	E,
> = Tp<F, E>['_BUILDER'];
type Ctx<
	F extends Collection.Advanced.FamilyBase<any>,
	E,
> = Tp<F, E>['_CONTEXT'];

declare const c: C;
declare const cne: CNE;
declare const u: C<1 | 2>;

// ---------------------------------------------------------------------------
// Collection.Advanced.Api
// ---------------------------------------------------------------------------

expectTypeOf(c.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(cne.isEmpty).toEqualTypeOf<false>();
expectTypeOf(c.size).toEqualTypeOf<number>();
expectTypeOf(c.asNormal()).toEqualTypeOf<C>();
expectTypeOf(cne.asNormal()).toEqualTypeOf<C>();
expectTypeOf(c.assumeNonEmpty()).toEqualTypeOf<CNE>();
expectTypeOf(cne.assumeNonEmpty()).toEqualTypeOf<CNE>();
expectTypeOf(c.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(c.stream()).toEqualTypeOf<Stream<number>>();
expectTypeOf(cne.stream()).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(c.toArray()).toEqualTypeOf<number[]>();
expectTypeOf(cne.toArray()).toEqualTypeOf<ArrayNonEmpty<number>>();
expectTypeOf(c[Symbol.iterator]()).toEqualTypeOf<FastIterator<number>>();

// nonEmpty() narrows the receiver
function narrow(x: C): void {
	if (x.nonEmpty()) {
		expectTypeOf(x).toEqualTypeOf<CNE>();
	}
}
void narrow;

// filterIndexed: negated guard, positive guard, boolean
expectTypeOf(u.filterIndexed((e): e is 1 => e === 1)).toEqualTypeOf<C<1>>();
expectTypeOf(
	u.filterIndexed((e): e is 1 => e === 1, { negate: true }),
).toEqualTypeOf<C<2>>();
expectTypeOf(c.filterIndexed((e) => e > 0, { indexOffset: 1 })).toEqualTypeOf<C>();

// filter (Collection.Capability.WithFilter is part of the base Api)
expectTypeOf(u.filter((e): e is 1 => e === 1)).toEqualTypeOf<C<1>>();
expectTypeOf(u.filter((e): e is 1 => e === 1, { negate: true })).toEqualTypeOf<
	C<2>
>();
expectTypeOf(c.filter((e) => e > 0)).toEqualTypeOf<C>();

declare const streamNE: StreamSource.NonEmpty<number>;
declare const streamN: StreamSource<number>;
declare const streamStr: StreamSource.NonEmpty<string>;

// ---------------------------------------------------------------------------
// Collection.Capability.* (isolated through a named capability family)
// ---------------------------------------------------------------------------

// WithAdd
declare const add: N<WithAdd<number>, number>;
declare const addNE: NE<WithAdd<number>, number>;
expectTypeOf(add.add(1)).toEqualTypeOf<NE<WithAdd<number>, number>>();
expectTypeOf(addNE.add(1)).toEqualTypeOf<NE<WithAdd<number>, number>>();
expectTypeOf<B<WithAdd<number>, number>>().toHaveProperty('add');

// WithAddAll: NonEmpty-first overload
declare const addAll: N<WithAddAll<number>, number>;
declare const addAllNE: NE<WithAddAll<number>, number>;
expectTypeOf(addAll.addAll(streamNE)).toEqualTypeOf<
	NE<WithAddAll<number>, number>
>();
expectTypeOf(addAll.addAll(streamN)).toEqualTypeOf<N<WithAddAll<number>, number>>();
expectTypeOf(addAllNE.addAll(streamN)).toEqualTypeOf<
	NE<WithAddAll<number>, number>
>();

// WithToBuilder
declare const toBuilder: N<WithToBuilder<number>, number>;
expectTypeOf(toBuilder.toBuilder()).toEqualTypeOf<
	B<WithToBuilder<number>, number>
>();

// WithMap / WithMapIndexed retype the element and preserve the kind
declare const mapCap: N<WithMap<number>, number>;
declare const mapIndexedCap: N<WithMapIndexed<number>, number>;
expectTypeOf(mapCap.map((e) => String(e))).toEqualTypeOf<
	N<WithMap<string>, string>
>();
expectTypeOf(mapIndexedCap.mapIndexed((e, i) => String(e))).toEqualTypeOf<
	N<WithMapIndexed<string>, string>
>();

// WithFlatMap: NonEmpty-first overload
declare const flatMap: N<WithFlatMap<number>, number>;
declare const flatMapNE: NE<WithFlatMap<number>, number>;
expectTypeOf(
	flatMap.flatMap((e): StreamSource.NonEmpty<string> => streamStr),
).toEqualTypeOf<NE<WithFlatMap<string>, string>>();
expectTypeOf(
	flatMap.flatMap((e): StreamSource<string> => streamStr),
).toEqualTypeOf<N<WithFlatMap<string>, string>>();
expectTypeOf(
	flatMapNE.flatMap((e): StreamSource<string> => streamStr),
).toEqualTypeOf<NE<WithFlatMap<string>, string>>();

// WithFlatMapIndexed: NonEmpty-first overload
declare const flatMapIndexed: N<WithFlatMapIndexed<number>, number>;
declare const flatMapIndexedNE: NE<WithFlatMapIndexed<number>, number>;
expectTypeOf(
	flatMapIndexed.flatMapIndexed(
		(e, i): StreamSource.NonEmpty<string> => streamStr,
		undefined,
	),
).toEqualTypeOf<NE<WithFlatMapIndexed<string>, string>>();
expectTypeOf(
	flatMapIndexed.flatMapIndexed(
		(e, i): StreamSource<string> => streamStr,
		{ indexOffset: 1 },
	),
).toEqualTypeOf<N<WithFlatMapIndexed<string>, string>>();
expectTypeOf(
	flatMapIndexedNE.flatMapIndexed(
		(e, i): StreamSource<string> => streamStr,
		undefined,
	),
).toEqualTypeOf<NE<WithFlatMapIndexed<string>, string>>();

// WithMutate always yields the normal kind
declare const mutate: N<WithMutate<number>, number>;
declare const mutateNE: NE<WithMutate<number>, number>;
expectTypeOf(mutate.mutate((b) => {})).toEqualTypeOf<N<WithMutate<number>, number>>();
expectTypeOf(mutateNE.mutate((b) => {})).toEqualTypeOf<
	N<WithMutate<number>, number>
>();

// WithReducer is context-only: no _NORMAL slot, reducer yields a normal result
declare const reducerCtx: Ctx<WithReducer<number>, number>;
expectTypeOf<Tp<WithReducer<number>, number>['_NORMAL']>().toEqualTypeOf<unknown>();
expectTypeOf(reducerCtx.reducer<number>()).toEqualTypeOf<Reducer<number, unknown>>();

// WithRecompose: NonEmpty-first overload. The non-empty callback overload
// preserves the receiver kind via `_SELF`; only on a NonEmpty receiver does it
// yield NonEmpty.
declare const recompose: N<WithRecompose<number>, number>;
declare const recomposeNE: NE<WithRecompose<number>, number>;
expectTypeOf(
	recompose.recompose((s): StreamSource.NonEmpty<string> => streamStr),
).toEqualTypeOf<N<WithRecompose<string>, string>>();
expectTypeOf(
	recompose.recompose((s): StreamSource<string> => streamStr),
).toEqualTypeOf<N<WithRecompose<string>, string>>();
expectTypeOf(
	recomposeNE.recompose((s): StreamSource.NonEmpty<string> => streamStr),
).toEqualTypeOf<NE<WithRecompose<string>, string>>();
expectTypeOf(
	recomposeNE.recompose((s): StreamSource<string> => streamStr),
).toEqualTypeOf<N<WithRecompose<string>, string>>();

// ---------------------------------------------------------------------------
// Collection.Advanced.ReTyped
// ---------------------------------------------------------------------------

interface TestFamily<E> extends Collection.Advanced.Family<E> {}
type TestTypes<E> = Tp<TestFamily<E>, E>;
type TestTypesNE<E> = Collection.Advanced.TypesNonEmpty<TestFamily<E>, E>;

declare const retypedNormal: Collection.Advanced.ReTyped<
	TestTypes<number>,
	string
>;
declare const retypedNE: Collection.Advanced.ReTyped<TestTypesNE<number>, string>;
// ReTyped yields a types record, not the `_NORMAL` slot.
const retypedNormalResult: TestTypes<string> = retypedNormal;
const retypedNEResult: TestTypesNE<string> = retypedNE;
void [retypedNormalResult, retypedNEResult];
expectTypeOf(retypedNormal._SELF).toExtend<C<string, TestFamily<string>>>();
expectTypeOf(retypedNE._SELF).toExtend<Collection.NonEmpty<string, TestFamily<string>>>();

// ---------------------------------------------------------------------------
// Variance
// ---------------------------------------------------------------------------

expectTypeOf<C<number>>().toExtend<C<number | string>>();
expectTypeOf<C<number | string>>().not.toExtend<C<number>>();
expectTypeOf<CNE<number>>().toExtend<C<number>>();
expectTypeOf<CNE<number>>().toExtend<CNE<number | string>>();
expectTypeOf<CNE<number | string>>().not.toExtend<CNE<number>>();

expectTypeOf<Collection.Capability.WithMap<number>>().not.toExtend<
	Collection.Capability.WithMap<number | string>
>();
expectTypeOf<Collection.Capability.WithAddAll<number>>().not.toExtend<
	Collection.Capability.WithAddAll<number | string>
>();
expectTypeOf<Collection.Capability.WithFlatMap<number>>().not.toExtend<
	Collection.Capability.WithFlatMap<number | string>
>();
expectTypeOf<Collection.Capability.WithMutate<number>>().not.toExtend<
	Collection.Capability.WithMutate<number | string>
>();
expectTypeOf<Collection.Capability.WithToBuilder<number>>().not.toExtend<
	Collection.Capability.WithToBuilder<number | string>
>();
expectTypeOf<Collection.Capability.WithRecompose<number>>().not.toExtend<
	Collection.Capability.WithRecompose<number | string>
>();
expectTypeOf<Collection.Capability.WithReducer<number>>().toExtend<
	Collection.Capability.WithReducer<number | string>
>();
