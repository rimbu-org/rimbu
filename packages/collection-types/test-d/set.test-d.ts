import { expectTypeOf } from 'bun:test';

import type { StreamSource } from '@rimbu/stream';

import type { SetCollection } from '@rimbu/collection-types/set';

type S<E = number> = SetCollection<E>;
type SN<E = number> = SetCollection.NonEmpty<E>;

declare const s: S;
declare const sn: SN;
declare const streamN: StreamSource<number>;
declare const streamNE: StreamSource.NonEmpty<number>;
declare const streamStrNE: StreamSource.NonEmpty<string>;

// add / addEach (NonEmpty-first)
const addN: SN = s.add(1);
const addNE: SN = sn.add(1);
const addEachNE: SN = s.addEach(streamNE);
const addEachN: S = s.addEach(streamN);
const addEachFromNE: SN = sn.addEach(streamN);

expectTypeOf(s.has(1)).toEqualTypeOf<boolean>();

// map / mapIndexed preserve the kind
const mapN: S<string> = s.map((e) => String(e));
const mapNE: SN<string> = sn.map((e) => String(e));
const mapIndexedN: S<string> = s.mapIndexed((e, i) => String(e));
const mapIndexedNE: SN<string> = sn.mapIndexed((e, i) => String(e));

// flatMap / flatMapIndexed (NonEmpty-first, kind-preserving via _SELF)
const flatMapNonEmptyN: S<string> = s.flatMap(
	(e): StreamSource.NonEmpty<string> => streamStrNE,
);
const flatMapPlainN: S<string> = s.flatMap(
	(e): StreamSource<string> => streamStrNE,
);
const flatMapNEOnNE: SN<string> = sn.flatMap(
	(e): StreamSource.NonEmpty<string> => streamStrNE,
);
const flatMapPlainOnNE: S<string> = sn.flatMap(
	(e): StreamSource<string> => streamStrNE,
);
const flatMapIndexedNonEmptyN: S<string> = s.flatMapIndexed(
	(e, i): StreamSource.NonEmpty<string> => streamStrNE,
	undefined,
);
const flatMapIndexedPlainNE: S<string> = sn.flatMapIndexed(
	(e, i): StreamSource<string> => streamStrNE,
	{ indexOffset: 1 },
);

// recompose
const recomposeNE: SN<string> = sn.recompose(
	(st): StreamSource.NonEmpty<string> => streamStrNE,
);
const recomposeN: S<string> = s.recompose(
	(st): StreamSource<string> => streamStrNE,
);

// mutate always yields normal, toBuilder yields the concrete builder
const mutatedN: S = s.mutate(() => {});
const mutatedFromNE: S = sn.mutate(() => {});
const builder: SetCollection.Builder<number> = s.toBuilder();

// set algebra
const differenceN: S = s.difference(streamN);
const intersectionN: S = s.intersection(streamN);
const symmetricDifferenceN: S = s.symmetricDifference(streamN);
const unionNE: SN = s.union(streamNE);
const unionN: S = s.union(streamN);
const unionFromNE: SN = sn.union(streamN);
const removeN: S = s.remove(1);
const removeEachN: S = s.removeEach(streamN);

// builder
declare const sb: SetCollection.Builder<number>;
expectTypeOf(sb.has(1)).toEqualTypeOf<boolean>();
expectTypeOf(sb.add(1)).toEqualTypeOf<boolean>();
expectTypeOf(sb.remove(1)).toEqualTypeOf<boolean>();
expectTypeOf(sb.removeEach(streamN)).toEqualTypeOf<boolean>();
const built: S = sb.build();

// kind
expectTypeOf(s.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(sn.isEmpty).toEqualTypeOf<false>();

// variance
expectTypeOf<S<number>>().toExtend<S<number | string>>();
expectTypeOf<S<number | string>>().not.toExtend<S<number>>();
expectTypeOf<SN<number>>().toExtend<S<number>>();

void [
	addN,
	addNE,
	addEachNE,
	addEachN,
	addEachFromNE,
	mapN,
	mapNE,
	mapIndexedN,
	mapIndexedNE,
	flatMapNonEmptyN,
	flatMapPlainN,
	flatMapNEOnNE,
	flatMapPlainOnNE,
	flatMapIndexedNonEmptyN,
	flatMapIndexedPlainNE,
	recomposeNE,
	recomposeN,
	mutatedN,
	mutatedFromNE,
	builder,
	differenceN,
	intersectionN,
	symmetricDifferenceN,
	unionNE,
	unionN,
	unionFromNE,
	removeN,
	removeEachN,
	built,
];
