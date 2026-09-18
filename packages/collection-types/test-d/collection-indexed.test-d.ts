import { expectTypeOf } from 'bun:test';

import type { Stream, StreamSource } from '@rimbu/stream';

import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { Op } from '@rimbu/collection-types/types';

type I<E = number> = IndexedCollection<E>;
type IN<E = number> = IndexedCollection.NonEmpty<E>;

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

type WithConcat<E> = IndexedCollection.Capability.WithConcat<E>;
type WithRepeat<E> = IndexedCollection.Capability.WithRepeat<E>;
type WithPadTo<E> = IndexedCollection.Capability.WithPadTo<E>;
type WithPrependAppend<E> = IndexedCollection.Capability.WithPrependAppend<E>;
type WithSpliceAt<E> = IndexedCollection.Capability.WithSpliceAt<E>;
type WithInsertAt<E> = IndexedCollection.Capability.WithInsertAt<E>;
type WithRemoveAt<E> = IndexedCollection.Capability.WithRemoveAt<E>;
type WithUpdateAt<E> = IndexedCollection.Capability.WithUpdateAt<E>;
type WithSetAt<E> = IndexedCollection.Capability.WithSetAt<E>;
type WithSwapAt<E> = IndexedCollection.Capability.WithSwapAt<E>;
type WithUnzip<E> = IndexedCollection.Capability.WithUnzip<E>;
type WithFlatten<E> = IndexedCollection.Capability.WithFlatten<E>;

declare const i: I;
declare const ine: IN;
declare const srcN: StreamSource<number>;
declare const srcNE: StreamSource.NonEmpty<number>;
declare const nestedNE: StreamSource.NonEmpty<StreamSource<number>>;
declare const nestedN: StreamSource<StreamSource<number>>;

// ---------------------------------------------------------------------------
// IndexedCollection.Advanced.Api
// ---------------------------------------------------------------------------

expectTypeOf(i.at(1)).toEqualTypeOf<number | undefined>();
expectTypeOf(i.at(1, 0)).toEqualTypeOf<number>();
expectTypeOf(i.first()).toEqualTypeOf<number | undefined>();
expectTypeOf(ine.first()).toEqualTypeOf<number>();
// @ts-expect-error a fallback is not accepted on a NonEmpty collection
ine.first(0);
expectTypeOf(i.last()).toEqualTypeOf<number | undefined>();
expectTypeOf(ine.last()).toEqualTypeOf<number>();
expectTypeOf(i.streamSlice({ start: 0, end: 1 })).toEqualTypeOf<Stream<number>>();
const sliceN: I = i.slice({ start: 1, end: 3 });

// take/splitAt are keyed on the literal amount N
const takeN: I = i.take(2);
const takeZeroN: I = i.take(0);
const takeNE: IN = ine.take(2);
const takeZeroNE: I = ine.take(0);
const dropN: I = i.drop(1);
const splitN: [I, I] = i.splitAt(2);
const splitZeroNE: [I, I] = ine.splitAt(0);
const splitNE: [IN, I] = ine.splitAt(2);

// builder
declare const ib: IndexedCollection.Builder<number>;
expectTypeOf(ib.at(1)).toEqualTypeOf<number | undefined>();
expectTypeOf(ib.at(1, 0)).toEqualTypeOf<number>();
expectTypeOf(ib.first()).toEqualTypeOf<number | undefined>();
expectTypeOf(ib.first(0)).toEqualTypeOf<number>();
expectTypeOf(ib.last()).toEqualTypeOf<number | undefined>();
expectTypeOf(ib.last(0)).toEqualTypeOf<number>();

// ---------------------------------------------------------------------------
// Capabilities not part of the aggregate IndexedCollection alias
// ---------------------------------------------------------------------------

// WithConcat: NonEmpty-first
declare const concat: N<WithConcat<number>, number>;
declare const concatNE: NE<WithConcat<number>, number>;
const concatNE1: NE<WithConcat<number>, number> = concat.concat(srcNE);
const concatN1: N<WithConcat<number>, number> = concat.concat(srcN);
const concatNE2: NE<WithConcat<number>, number> = concatNE.concat(srcN);

// WithRepeat: amount 0 widens to normal, otherwise preserves the kind
declare const repeat: N<WithRepeat<number>, number>;
declare const repeatNE: NE<WithRepeat<number>, number>;
const repeatZeroN: N<WithRepeat<number>, number> = repeat.repeat(0);
const repeatResultN: N<WithRepeat<number>, number> = repeat.repeat(3);
const repeatResultNE: NE<WithRepeat<number>, number> = repeatNE.repeat(3);
const repeatZeroNE: N<WithRepeat<number>, number> = repeatNE.repeat(0);

// WithPadTo
declare const padTo: N<WithPadTo<number>, number>;
const padToN: N<WithPadTo<number>, number> = padTo.padTo(3, 0);
const padToBiasN: N<WithPadTo<number>, number> = padTo.padTo(3, 0, {
	paddingLeftBias: 1,
});

// WithPrependAppend
declare const prependAppend: N<WithPrependAppend<number>, number>;
const prependNE: NE<WithPrependAppend<number>, number> =
	prependAppend.prepend(1);
const appendNE: NE<WithPrependAppend<number>, number> = prependAppend.append(1);
declare const paBuilder: B<WithPrependAppend<number>, number>;
expectTypeOf(paBuilder.prepend(1)).toEqualTypeOf<void>();
expectTypeOf(paBuilder.appendAll(srcN)).toEqualTypeOf<void>();

// WithSpliceAt
declare const splice: N<WithSpliceAt<number>, number>;
const spliceInsertNE: NE<WithSpliceAt<number>, number> = splice.spliceAt(0, {
	insert: srcNE,
});
const spliceRemoveN: N<WithSpliceAt<number>, number> = splice.spliceAt(0, {
	removeAmount: 1,
});
const spliceNoopN: N<WithSpliceAt<number>, number> = splice.spliceAt(0);
const spliceReturnNE: Op.WithResult<
	NE<WithSpliceAt<number>, number>,
	[
		removed: N<WithSpliceAt<number>, number>,
		inserted: NE<WithSpliceAt<number>, number>,
	],
	true
> = splice.spliceAtAndReturn(0, { insert: srcNE });
const spliceReturnN: Op.DynamicResult<
	N<WithSpliceAt<number>, number>,
	[
		removed: N<WithSpliceAt<number>, number>,
		inserted: N<WithSpliceAt<number>, number>,
	],
	[
		removed: N<WithSpliceAt<number>, number>,
		inserted: N<WithSpliceAt<number>, number>,
	],
	N<WithSpliceAt<number>, number>
> = splice.spliceAtAndReturn(0);

// WithInsertAt: NonEmpty-first
declare const insertAt: N<WithInsertAt<number>, number>;
const insertNE: NE<WithInsertAt<number>, number> = insertAt.insertAt(0, srcNE);
const insertN: N<WithInsertAt<number>, number> = insertAt.insertAt(0, srcN);
declare const insertBuilder: IndexedCollection.Capability.WithInsertAt.BuilderApi<
	number,
	Tp<WithInsertAt<number>, number>
>;
expectTypeOf(insertBuilder.insertAt(0, srcN)).toEqualTypeOf<void>();

// WithRemoveAt
declare const removeAt: N<WithRemoveAt<number>, number>;
const removeAtN: N<WithRemoveAt<number>, number> = removeAt.removeAt(0);
const removeAtAmountN: N<WithRemoveAt<number>, number> = removeAt.removeAt(0, 2);
const removeAtReturn: Op.DynamicResult<
	N<WithRemoveAt<number>, number>,
	N<WithRemoveAt<number>, number>,
	NE<WithRemoveAt<number>, number>,
	N<WithRemoveAt<number>, number>
> = removeAt.removeAtAndReturn(0);
declare const removeAtBuilder: B<WithRemoveAt<number>, number>;
expectTypeOf(removeAtBuilder.removeAt(0)).toEqualTypeOf<number | undefined>();
expectTypeOf(removeAtBuilder.removeAt(0, 0)).toEqualTypeOf<number>();
expectTypeOf(removeAtBuilder.removeAmountAt(0, 1)).toEqualTypeOf<boolean>();
expectTypeOf(removeAtBuilder.removeAllAt([0, 1])).toEqualTypeOf<boolean>();

// WithUpdateAt
declare const updateAt: N<WithUpdateAt<number>, number>;
const updateAtN: N<WithUpdateAt<number>, number> = updateAt.updateAt(0, (e) => e);
const updateAtReturn: Op.DynamicResult<
	N<WithUpdateAt<number>, number>,
	[previous: undefined, current: undefined],
	[previous: number, current: number],
	NE<WithUpdateAt<number>, number>
> = updateAt.updateAtAndReturn(0, (e) => e);
declare const updateAtBuilder: B<WithUpdateAt<number>, number>;
expectTypeOf(updateAtBuilder.updateAt(0, (e) => e)).toEqualTypeOf<
	[previous: number | undefined, current: number | undefined]
>();
expectTypeOf(updateAtBuilder.updateAt(0, (e) => e, 0)).toEqualTypeOf<
	[previous: number, current: number]
>();

// WithSetAt
declare const setAt: N<WithSetAt<number>, number>;
const setAtN: N<WithSetAt<number>, number> = setAt.setAt(0, 1);
const setAtReturn: Op.DynamicResult<
	N<WithSetAt<number>, number>,
	undefined,
	number,
	NE<WithSetAt<number>, number>
> = setAt.setAtAndReturn(0, 1);
declare const setAtBuilder: B<WithSetAt<number>, number>;
expectTypeOf(setAtBuilder.setAt(0, 1)).toEqualTypeOf<number | undefined>();
expectTypeOf(setAtBuilder.setAt(0, 1, 0)).toEqualTypeOf<number>();

// WithSwapAt
declare const swapAt: N<WithSwapAt<number>, number>;
const swapAtN: N<WithSwapAt<number>, number> = swapAt.swapAt(0, 1);
const swapAtReturn: Op.DynamicResult<
	N<WithSwapAt<number>, number>,
	[previous1: undefined, previous2: undefined],
	[previous1: number, previous2: number],
	NE<WithSwapAt<number>, number>
> = swapAt.swapAtAndReturn(0, 1);

// WithUnzip / WithFlatten are context-only
declare const unzipCtx: Ctx<WithUnzip<number>, number>;
declare const oneRow: readonly [readonly [number, string]];
const unzipped = unzipCtx.unzip(oneRow, { length: 2 });
void unzipped;
declare const flattenCtx: Ctx<WithFlatten<number>, number>;
const flattenNE: NE<WithFlatten<number>, number> = flattenCtx.flatten(nestedNE);
const flattenN: N<WithFlatten<number>, number> = flattenCtx.flatten(nestedN);

// variance
expectTypeOf<I<number>>().toExtend<I<number | string>>();
expectTypeOf<I<number | string>>().not.toExtend<I<number>>();
expectTypeOf<IN<number>>().toExtend<I<number>>();

void [
	takeN,
	takeZeroN,
	takeNE,
	takeZeroNE,
	dropN,
	splitN,
	splitZeroNE,
	splitNE,
	sliceN,
	concatNE1,
	concatN1,
	concatNE2,
	repeatZeroN,
	repeatResultN,
	repeatResultNE,
	repeatZeroNE,
	padToN,
	padToBiasN,
	prependNE,
	appendNE,
	spliceInsertNE,
	spliceRemoveN,
	spliceNoopN,
	spliceReturnNE,
	spliceReturnN,
	insertNE,
	insertN,
	removeAtN,
	removeAtAmountN,
	removeAtReturn,
	updateAtN,
	updateAtReturn,
	setAtN,
	setAtReturn,
	swapAtN,
	swapAtReturn,
	flattenNE,
	flattenN,
];
