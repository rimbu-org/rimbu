import { expectTypeOf } from 'bun:test';

import type { Stream, StreamSource } from '@rimbu/stream';
import type { Reducer } from '@rimbu/stream/reducer';

import type { Op } from '@rimbu/collection-types/types';
import type { MapCollection } from '@rimbu/collection-types/map';

type M<K = number, V = string> = MapCollection<K, V>;
type MN<K = number, V = string> = MapCollection.NonEmpty<K, V>;

declare const m: M;
declare const mn: MN;
declare const entries: StreamSource<readonly [number, string]>;
declare const entriesNE: StreamSource.NonEmpty<readonly [number, string]>;
declare const mappedEntriesNE: StreamSource.NonEmpty<readonly [string, number]>;

// get / has (OptLazy fallback)
expectTypeOf(m.get(1)).toEqualTypeOf<string | undefined>();
expectTypeOf(m.get(1, 0)).toEqualTypeOf<string | number>();
expectTypeOf(m.get(1, () => 0)).toEqualTypeOf<string | number>();
expectTypeOf(mn.get(1)).toEqualTypeOf<string | undefined>();
expectTypeOf(m.has(1)).toEqualTypeOf<boolean>();

// key/value streams are kind-conditional
const mKeys: Stream<number> = m.streamKeys();
const mnKeys: Stream.NonEmpty<number> = mn.streamKeys();
const mValues: Stream<string> = m.streamValues();
const mnValues: Stream.NonEmpty<string> = mn.streamValues();

// set / add: always NonEmpty
const setNormal: MN = m.set(1, 'a');
const setNonEmpty: MN = mn.set(1, 'a');
const addNormal: MN = m.add([1, 'a']);
const addNonEmpty: MN = mn.add([1, 'a']);

// addAll: NonEmpty-first
const addAllNE: MN = m.addAll(entriesNE);
const addAllN: M = m.addAll(entries);
const addAllFromNE: MN = mn.addAll(entries);

// removeKey / removeKeyAndReturn / removeKeys
const removeKeyN: M = m.removeKey(1);
const removeKeyFromNE: M = mn.removeKey(1);
const removeKeyAndReturnN: Op.DynamicResult<M, undefined, string, M> =
	m.removeKeyAndReturn(1);
const removeKeyAndReturnFallback: Op.DynamicResult<M, string, string, M> =
	m.removeKeyAndReturn(1, 'x');
const removeKeysN: M = m.removeKeys([1, 2]);

// mapValues / map / mapIndexed
const mapValuesN: M<number, number> = m.mapValues((v, k) => v.length);
const mapValuesNE: MN<number, number> = mn.mapValues((v, k) => v.length);
const mapN: M<string, boolean> = m.map(([k, v]) => [String(k), v.length > 0]);
const mapNE: MN<string, boolean> = mn.map(([k, v]) => [
	String(k),
	v.length > 0,
]);
const mapIndexedN: M<string, boolean> = m.mapIndexed(([k, v], i) => [
	String(k),
	i > 0,
]);

// keyed flatMap / flatMapIndexed: NonEmpty-first, kind preserved via _SELF
const flatMapNonEmptyN: M<string, number> = m.flatMap(
	(e): StreamSource.NonEmpty<readonly [string, number]> => mappedEntriesNE,
);
const flatMapPlainN: M<string, number> = m.flatMap(
	(e): StreamSource<readonly [string, number]> => mappedEntriesNE,
);
const flatMapNEOnNE: MN<string, number> = mn.flatMap(
	(e): StreamSource.NonEmpty<readonly [string, number]> => mappedEntriesNE,
);
const flatMapPlainOnNE: M<string, number> = mn.flatMap(
	(e): StreamSource<readonly [string, number]> => mappedEntriesNE,
);
const flatMapIndexedN: M<string, number> = m.flatMapIndexed(
	(e, i): StreamSource<readonly [string, number]> => mappedEntriesNE,
	undefined,
);

// recompose (keyed)
const recomposeNE: MN<string, number> = mn.recompose(
	(st): StreamSource.NonEmpty<readonly [string, number]> => mappedEntriesNE,
);
const recomposeN: M<string, number> = m.recompose(
	(st): StreamSource<readonly [string, number]> => mappedEntriesNE,
);

// updateAtKey / updateAtKeyAndReturn / modifyAtKey
const updateAtKeyN: M = m.updateAtKey(1, (v) => v);
const updateAtKeyNE: MN = mn.updateAtKey(1, (v) => v);
const updateAtKeyAndReturnN: Op.DynamicResult<
	M,
	[previous: undefined, current: undefined],
	[previous: string, current: string],
	MN
> = m.updateAtKeyAndReturn(1, (v) => v);
const modifyAtKeyN: M = m.modifyAtKey(1, {});
const modifyAtKeyFromNE: M = mn.modifyAtKey(1, {});

// mutate / toBuilder
const mutatedN: M = m.mutate(() => {});
const builder: MapCollection.Builder<number, string> = m.toBuilder();

// builder (OptLazy overloads)
declare const mb: MapCollection.Builder<number, string>;
expectTypeOf(mb.get(1)).toEqualTypeOf<string | undefined>();
expectTypeOf(mb.get(1, 0)).toEqualTypeOf<string | number>();
expectTypeOf(mb.set(1, 'a')).toEqualTypeOf<boolean>();
expectTypeOf(mb.removeKey(1)).toEqualTypeOf<string | undefined>();
expectTypeOf(mb.removeKey(1, 'x')).toEqualTypeOf<string>();
expectTypeOf(mb.updateAtKey(1, (v) => v)).toEqualTypeOf<
	[previous: string | undefined, current: string | undefined]
>();
expectTypeOf(mb.updateAtKey(1, (v) => v, 'x')).toEqualTypeOf<
	[previous: string, current: string]
>();

// context: reducer and merge (context-only capabilities)
declare const ctx: MapCollection.Context;
const reducer: Reducer<readonly [number, string], M> =
	ctx.keyedContext.reducer<number, string>();
const mergedWith = ctx.keyedContext.mergeWith([m, mn], {
	merge: (k, values) => `${values[0]}${values[1]}`,
});
const mergedValue: [string, string] | undefined = mergedWith.get(1);
const mergedAllWith = ctx.keyedContext.mergeAllWith([mn, mn], {
	merge: (k, values) => `${values[0]}${values[1]}`,
});
expectTypeOf(mergedAllWith.isEmpty).toEqualTypeOf<false>();

// variance: MapCollection is invariant in V
expectTypeOf<M<number, string>>().not.toExtend<M<number, string | boolean>>();
expectTypeOf<MN<number, string>>().toExtend<M<number, string>>();

// keep all typed bindings live
void [
	mKeys,
	mnKeys,
	mValues,
	mnValues,
	setNormal,
	setNonEmpty,
	addNormal,
	addNonEmpty,
	addAllNE,
	addAllN,
	addAllFromNE,
	removeKeyN,
	removeKeyFromNE,
	removeKeyAndReturnN,
	removeKeyAndReturnFallback,
	removeKeysN,
	mapValuesN,
	mapValuesNE,
	mapN,
	mapNE,
	mapIndexedN,
	flatMapNonEmptyN,
	flatMapPlainN,
	flatMapNEOnNE,
	flatMapPlainOnNE,
	flatMapIndexedN,
	recomposeNE,
	recomposeN,
	updateAtKeyN,
	updateAtKeyNE,
	updateAtKeyAndReturnN,
	modifyAtKeyN,
	modifyAtKeyFromNE,
	mutatedN,
	builder,
	reducer,
	mergedWith,
	mergedValue,
	mergedAllWith,
];
