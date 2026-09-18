import { expectTypeOf } from 'bun:test';

import { Stream } from '@rimbu/stream';
import type { StreamSource } from '@rimbu/stream';
import type { Reducer } from '@rimbu/stream/reducer';

import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { Op } from '@rimbu/collection-types/types';

type K<K = number, V = string> = KeyedCollection<K, V>;
type KN<K = number, V = string> = KeyedCollection.NonEmpty<K, V>;

type EF = readonly [number, string];

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
type KCtx<
	F extends KeyedCollection.Advanced.FamilyBase<any, any>,
	E,
> = Tp<F, E>['_KEYED_CONTEXT'];

type WithRemoveKey<K, V> = KeyedCollection.Capability.WithRemoveKey<K, V>;
type WithRemoveKeys<K, V> = KeyedCollection.Capability.WithRemoveKeys<K, V>;
type WithMapValues<K, V> = KeyedCollection.Capability.WithMapValues<K, V>;
type WithMerge<K, V> = KeyedCollection.Capability.WithMerge<K, V>;
type WithReducer<K, V> = KeyedCollection.Capability.WithReducer<K, V>;
type WithRecompose<K, V> = KeyedCollection.Capability.WithRecompose<K, V>;
type WithMap<K, V> = KeyedCollection.Capability.WithMap<K, V>;
type WithMapIndexed<K, V> = KeyedCollection.Capability.WithMapIndexed<K, V>;
type WithFlatMap<K, V> = KeyedCollection.Capability.WithFlatMap<K, V>;
type WithFlatMapIndexed<K, V> =
	KeyedCollection.Capability.WithFlatMapIndexed<K, V>;

declare const k: K;
declare const kne: KN;

// ---------------------------------------------------------------------------
// KeyedCollection.Advanced.Api (read capabilities)
// ---------------------------------------------------------------------------

expectTypeOf(k.get(1)).toEqualTypeOf<string | undefined>();
expectTypeOf(k.get(1, 0)).toEqualTypeOf<string | number>();
expectTypeOf(k.get(1, () => 0)).toEqualTypeOf<string | number>();
expectTypeOf(k.has(1)).toEqualTypeOf<boolean>();
const kKeys: Stream<number> = k.streamKeys();
const kneKeys: Stream.NonEmpty<number> = kne.streamKeys();
const kValues: Stream<string> = k.streamValues();
const kneValues: Stream.NonEmpty<string> = kne.streamValues();

// keyed context factory
declare const ctx: KeyedCollection.Context;
const emptyK: K = ctx.keyedContext.empty<number, string>();
const ofK: KN = ctx.keyedContext.of([1, 'a']);
const builtK: K = ctx.keyedContext.builder<number, string>().build();
const fromNE: KN = ctx.keyedContext.from(Stream.of<EF>([1, 'a']));

// ---------------------------------------------------------------------------
// Capabilities
// ---------------------------------------------------------------------------

// WithRemoveKey: OptLazy builder overloads
declare const removeKey: N<WithRemoveKey<number, string>, EF>;
const removeKeyN: N<WithRemoveKey<number, string>, EF> = removeKey.removeKey(1);
const removeKeyReturn: Op.DynamicResult<
	N<WithRemoveKey<number, string>, EF>,
	undefined,
	string,
	N<WithRemoveKey<number, string>, EF>
> = removeKey.removeKeyAndReturn(1);
const removeKeyReturnFallback: Op.DynamicResult<
	N<WithRemoveKey<number, string>, EF>,
	number,
	string,
	N<WithRemoveKey<number, string>, EF>
> = removeKey.removeKeyAndReturn(1, 0);
declare const removeKeyBuilder: B<WithRemoveKey<number, string>, EF>;
expectTypeOf(removeKeyBuilder.removeKey(1)).toEqualTypeOf<string | undefined>();
expectTypeOf(removeKeyBuilder.removeKey(1, 0)).toEqualTypeOf<string | number>();

// WithRemoveKeys
declare const removeKeys: N<WithRemoveKeys<number, string>, EF>;
const removeKeysN: N<WithRemoveKeys<number, string>, EF> =
	removeKeys.removeKeys([1, 2]);
declare const removeKeysBuilder: B<WithRemoveKeys<number, string>, EF>;
expectTypeOf(removeKeysBuilder.removeKeys([1])).toEqualTypeOf<boolean>();

// WithMapValues
declare const mapValues: N<WithMapValues<number, string>, EF>;
const mapValuesN: N<WithMapValues<number, number>, readonly [number, number]> =
	mapValues.mapValues((v, k) => v.length);
declare const mapValuesBuilder: B<WithMapValues<number, string>, EF>;
const builtMapValues: N<WithMapValues<number, number>, readonly [number, number]> =
	mapValuesBuilder.buildMapValues((v, k) => v.length);

// WithRecompose: NonEmpty-first
declare const recompose: N<WithRecompose<number, string>, EF>;
declare const recomposeNE: NE<WithRecompose<number, string>, EF>;
declare const mappedNE: StreamSource.NonEmpty<readonly [string, boolean]>;
const recomposeNEOnNE: NE<WithRecompose<string, boolean>, readonly [string, boolean]> =
	recomposeNE.recompose(
		(st): StreamSource.NonEmpty<readonly [string, boolean]> => mappedNE,
	);
const recomposeN: N<WithRecompose<string, boolean>, readonly [string, boolean]> =
	recompose.recompose(
		(st): StreamSource<readonly [string, boolean]> => mappedNE,
	);

// WithMap / WithMapIndexed / WithFlatMap / WithFlatMapIndexed
declare const map: N<WithMap<number, string>, EF>;
const mapN: N<WithMap<string, boolean>, readonly [string, boolean]> = map.map(
	([k, v]): readonly [string, boolean] => [String(k), v.length > 0],
);
declare const mapIndexed: N<WithMapIndexed<number, string>, EF>;
const mapIndexedN: N<WithMapIndexed<string, boolean>, readonly [string, boolean]> =
	mapIndexed.mapIndexed(
		([k, v], i): readonly [string, boolean] => [String(k), i > 0],
	);
declare const flatMap: N<WithFlatMap<number, string>, EF>;
declare const flatMapNE: NE<WithFlatMap<number, string>, EF>;
const flatMapNEOnNE: NE<WithFlatMap<string, boolean>, readonly [string, boolean]> =
	flatMapNE.flatMap(
		(e): StreamSource.NonEmpty<readonly [string, boolean]> => mappedNE,
	);
const flatMapPlainN: N<WithFlatMap<string, boolean>, readonly [string, boolean]> =
	flatMap.flatMap(
		(e): StreamSource<readonly [string, boolean]> => mappedNE,
	);
declare const flatMapIndexed: N<WithFlatMapIndexed<number, string>, EF>;
const flatMapIndexedN: N<
	WithFlatMapIndexed<string, boolean>,
	readonly [string, boolean]
> = flatMapIndexed.flatMapIndexed(
	(e, i): StreamSource<readonly [string, boolean]> => mappedNE,
	undefined,
);

// WithMerge / WithReducer are context-only
declare const mergeCtx: KCtx<WithMerge<number, string>, EF>;
const merged = mergeCtx.merge([k, kne]);
void merged;
declare const reducerCtx: KCtx<WithReducer<number, string>, EF>;
const reduced: Reducer<EF, N<WithReducer<number, string>, EF>> =
	reducerCtx.reducer<number, string>();

// variance: NonEmpty is assignable to normal
expectTypeOf<KN<number, string>>().toExtend<K<number, string>>();

void [
	kKeys,
	kneKeys,
	kValues,
	kneValues,
	emptyK,
	ofK,
	builtK,
	fromNE,
	removeKeyN,
	removeKeyReturn,
	removeKeyReturnFallback,
	removeKeysN,
	mapValuesN,
	builtMapValues,
	recomposeNEOnNE,
	recomposeN,
	mapN,
	mapIndexedN,
	flatMapNEOnNE,
	flatMapPlainN,
	flatMapIndexedN,
	reduced,
];
