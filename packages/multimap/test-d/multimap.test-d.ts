import { expectTypeOf } from 'bun:test';

import type {
	RMap,
	RSet,
	VariantMap,
	VariantSet,
} from '@rimbu/collection-types';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { MultiMap } from '@rimbu/multimap';
import type { VariantMultiMap } from '@rimbu/multimap/variant';
import type { FastIterator, Stream } from '@rimbu/stream';

type VE<K, V> = VariantMultiMap<K, V>;
type VNE<K, V> = VariantMultiMap.NonEmpty<K, V>;
type GE<K, V> = MultiMap<K, V>;
type GNE<K, V> = MultiMap.NonEmpty<K, V>;

type V_Empty = VE<number, string>;
type V_NonEmpty = VNE<number, string>;
type G_Empty = GE<number, string>;
type G_NonEmpty = GNE<number, string>;

const varEmpty: V_Empty = undefined as any;
const varNonEmpty: V_NonEmpty = undefined as any;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectTypeOf(varNonEmpty).toExtend<V_Empty>();
expectTypeOf(genEmpty).toExtend<V_Empty>();
expectTypeOf(genNonEmpty).toExtend<V_Empty>();

expectTypeOf(genNonEmpty).toExtend<V_NonEmpty>();
expectTypeOf(varEmpty).not.toExtend<V_NonEmpty>();
expectTypeOf(genEmpty).not.toExtend<V_NonEmpty>();

expectTypeOf(genNonEmpty).toExtend<G_Empty>();
expectTypeOf(varEmpty).not.toExtend<G_Empty>();
expectTypeOf(genNonEmpty).toExtend<G_NonEmpty>();
expectTypeOf(varEmpty).not.toExtend<G_NonEmpty>();

// Test variance
expectTypeOf(varEmpty).toExtend<VE<number | string, string>>();
expectTypeOf(varEmpty).toExtend<VE<number, string | boolean>>();
expectTypeOf(varEmpty).toExtend<VE<number | string, string | boolean>>();
expectTypeOf(varNonEmpty).toExtend<VNE<number | string, string>>();
expectTypeOf(varNonEmpty).toExtend<VNE<number, string | boolean>>();
expectTypeOf(varNonEmpty).toExtend<VNE<number | string, string | boolean>>();

expectTypeOf(genEmpty).toExtend<VE<number | string, string | boolean>>();
expectTypeOf(genNonEmpty).toExtend<VE<number | string, string | boolean>>();
expectTypeOf(genNonEmpty).toExtend<VNE<number | string, string | boolean>>();

expectTypeOf(genEmpty).not.toExtend<GE<number | string, string>>();
expectTypeOf(genEmpty).not.toExtend<GE<number, string | boolean>>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number | string, string>>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number, string | boolean>>();

let m!: any;
expectTypeOf(m as VE<number | string, string>).not.toExtend<V_Empty>();
expectTypeOf(m as VE<number | string, string>).not.toExtend<V_Empty>();
expectTypeOf(m as VNE<number | string, string>).not.toExtend<V_NonEmpty>();
expectTypeOf(m as VNE<number | string, string>).not.toExtend<V_NonEmpty>();

expectTypeOf(m as GE<number | string, string>).not.toExtend<G_Empty>();
expectTypeOf(m as GE<number, string | number>).not.toExtend<G_Empty>();
expectTypeOf(m as GNE<number | string, string>).not.toExtend<G_NonEmpty>();
expectTypeOf(m as GNE<number, string | number>).not.toExtend<G_NonEmpty>();

// Iterator
expectTypeOf(varEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<[number, string]>
>();
expectTypeOf(varNonEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<[number, string]>
>();
expectTypeOf(genEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<[number, string]>
>();
expectTypeOf(genNonEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<[number, string]>
>();

// .add(..)
expectTypeOf(genEmpty.add(1, 'a')).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.add(1, 'a')).toEqualTypeOf<G_NonEmpty>();

// .addEntries(..)
expectTypeOf(genEmpty.addEntries([])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.addEntries([[1, 'a']])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntries([])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntries([[1, 'a']])).toEqualTypeOf<G_NonEmpty>();

// .assumeNonEmpty()
expectTypeOf(varEmpty.assumeNonEmpty()).toEqualTypeOf<V_NonEmpty>();
expectTypeOf(varNonEmpty.assumeNonEmpty()).toEqualTypeOf<V_NonEmpty>();
expectTypeOf(genEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();

// .context
expectTypeOf(genEmpty.context).toEqualTypeOf<
	MultiMap.Context<number, string>
>();
expectTypeOf(genNonEmpty.context).toEqualTypeOf<
	MultiMap.Context<number, string>
>();

// .filter(..)
expectTypeOf(varEmpty.filter(() => true)).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.filter(() => true)).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();

// .transform(..)
// Normal overload: a plain StreamSource result yields a (possibly empty) collection.
const tVarEmpty: V_Empty = varEmpty.transform((s) =>
	s.map(([k, v]) => [k, v] as [number, string]),
);
const tVarNonEmpty: V_Empty = varNonEmpty.transform((s) =>
	s.map(([k, v]) => [k, v] as [number, string]),
);
const tGenEmpty: G_Empty = genEmpty.transform((s) =>
	s.map(([k, v]) => [k, v] as [number, string]),
);
const tGenNonEmpty: G_Empty = genNonEmpty.transform((s) =>
	s.map(([k, v]) => [k, v] as [number, string]),
);
// The NonEmpty overload must be declared FIRST: when transformFun returns a
// StreamSource.NonEmpty, TypeScript must select it so the result keeps its
// NonEmpty type. If the overloads are reordered, these assignments fail to
// compile (the result would be the possibly-empty G_Empty instead).
const tGenNonEmptyNE: G_NonEmpty = genNonEmpty.transform((s) =>
	s.map(([k, v]) => [k, v] as [number, string]).assumeNonEmpty(),
);
const tGenNonEmptyStreamNE: G_NonEmpty = genNonEmpty.transform((s) =>
	s.assumeNonEmpty(),
);

void [
	tVarEmpty,
	tVarNonEmpty,
	tGenEmpty,
	tGenNonEmpty,
	tGenNonEmptyNE,
	tGenNonEmptyStreamNE,
];

// .getValues(..)
expectTypeOf(genEmpty.getValues(1)).toEqualTypeOf<RSet<string>>();
expectTypeOf(genNonEmpty.getValues(1)).toEqualTypeOf<RSet<string>>();

// .isEmpty
expectTypeOf(varEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(varNonEmpty.isEmpty).toEqualTypeOf<false>();
expectTypeOf(genEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.isEmpty).toEqualTypeOf<false>();

// .keyMap
expectTypeOf(varEmpty.keyMap).toEqualTypeOf<
	VariantMap<number, VariantSet.NonEmpty<string>>
>();
expectTypeOf(varNonEmpty.keyMap).toEqualTypeOf<
	VariantMap.NonEmpty<number, VariantSet.NonEmpty<string>>
>();
expectTypeOf(genEmpty.keyMap).toEqualTypeOf<
	RMap<number, RSet.NonEmpty<string>>
>();
expectTypeOf(genNonEmpty.keyMap).toExtend<
	RMap.NonEmpty<number, RSet.NonEmpty<string>>
>();

// .nonEmpty()
expectTypeOf(varEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(varNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(genEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();

// .removeKey(..)
expectTypeOf(varEmpty.removeEntries([[3, 'a']])).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.removeEntries([[3, 'a']])).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.removeEntries([[3, 'a']])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeEntries([[3, 'a']])).toEqualTypeOf<G_Empty>();

// .removeEntry(..)
expectTypeOf(varEmpty.removeEntry(3, 'a')).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.removeEntry(3, 'a')).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.removeEntry(3, 'a')).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeEntry(3, 'a')).toEqualTypeOf<G_Empty>();

// .removeKey(..)
expectTypeOf(varEmpty.removeKey(3)).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.removeKey(3)).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.removeKey(3)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeKey(3)).toEqualTypeOf<G_Empty>();

// .removeKeyAndGet(..)
expectTypeOf(varEmpty.removeKeyAndGet(3)).toEqualTypeOf<
	[V_Empty, VariantSet.NonEmpty<string>] | undefined
>();
expectTypeOf(varNonEmpty.removeKeyAndGet(3)).toEqualTypeOf<
	[V_Empty, VariantSet.NonEmpty<string>] | undefined
>();
expectTypeOf(genEmpty.removeKeyAndGet(3)).toEqualTypeOf<
	[G_Empty, RSet.NonEmpty<string>] | undefined
>();
expectTypeOf(genNonEmpty.removeKeyAndGet(3)).toEqualTypeOf<
	[G_Empty, RSet.NonEmpty<string>] | undefined
>();

// .removeKeys(..)
expectTypeOf(varEmpty.removeKeys([3, 4])).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.removeKeys([3, 4])).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.removeKeys([3, 4])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeKeys([3, 4])).toEqualTypeOf<G_Empty>();

// .setValues(..)
expectTypeOf(genEmpty.setValues(1, [])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.setValues(1, ['a'])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.setValues(1, [])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.setValues(1, ['a'])).toEqualTypeOf<G_NonEmpty>();

// .addValues(..)
expectTypeOf(genEmpty.addValues(1, [] as string[])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.addValues(1, ['a'])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(
	genNonEmpty.addValues(1, [] as string[]),
).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addValues(1, ['a'])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(
	genNonEmpty.addValues(1, ['a'] as const),
).toEqualTypeOf<G_NonEmpty>();

// .count(..)
expectTypeOf(genEmpty.count(1)).toEqualTypeOf<number>();
expectTypeOf(genNonEmpty.count(1)).toEqualTypeOf<number>();

// .mapValues(..)
expectTypeOf(genEmpty.mapValues((v) => v.toUpperCase())).toEqualTypeOf<
	GE<number, string>
>();
expectTypeOf(genNonEmpty.mapValues((v) => v.toUpperCase())).toEqualTypeOf<
	GNE<number, string>
>();

// .flatMapValues(..)
expectTypeOf(
	genEmpty.flatMapValues((v) => [v, v.toUpperCase()] as string[]),
).toEqualTypeOf<GE<number, string>>();
expectTypeOf(
	genNonEmpty.flatMapValues((v) => [v, v.toUpperCase()] as string[]),
).toEqualTypeOf<GE<number, string>>();

// .flatMap(..)
expectTypeOf(
	genEmpty.flatMap(([k, v]) => [[k, v]] as [number, string][]),
).toEqualTypeOf<GE<number, string>>();
expectTypeOf(genNonEmpty.flatMap(([k, v]) => [[k, v]])).toEqualTypeOf<
	GNE<number, string>
>();

// set algebra
expectTypeOf(genEmpty.union(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.union(genEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.union(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genEmpty.intersect(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.intersect(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.difference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.difference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.symDifference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.symDifference(genEmpty)).toEqualTypeOf<G_Empty>();

// .stream()
expectTypeOf(varEmpty.stream()).toEqualTypeOf<Stream<[number, string]>>();
expectTypeOf(varNonEmpty.stream()).toEqualTypeOf<
	Stream.NonEmpty<[number, string]>
>();
expectTypeOf(genEmpty.stream()).toEqualTypeOf<Stream<[number, string]>>();
expectTypeOf(genNonEmpty.stream()).toEqualTypeOf<
	Stream.NonEmpty<[number, string]>
>();

// .streamKeys()
expectTypeOf(varEmpty.streamKeys()).toEqualTypeOf<Stream<number>>();
expectTypeOf(varNonEmpty.streamKeys()).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(genEmpty.streamKeys()).toEqualTypeOf<Stream<number>>();
expectTypeOf(genNonEmpty.streamKeys()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .streamValues()
expectTypeOf(varEmpty.streamValues()).toEqualTypeOf<Stream<string>>();
expectTypeOf(varNonEmpty.streamValues()).toEqualTypeOf<
	Stream.NonEmpty<string>
>();
expectTypeOf(genEmpty.streamValues()).toEqualTypeOf<Stream<string>>();
expectTypeOf(genNonEmpty.streamValues()).toEqualTypeOf<
	Stream.NonEmpty<string>
>();

// .toArray()
expectTypeOf(varEmpty.toArray()).toEqualTypeOf<[number, string][]>();
expectTypeOf(varNonEmpty.toArray()).toEqualTypeOf<
	ArrayNonEmpty<[number, string]>
>();
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<[number, string][]>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<
	ArrayNonEmpty<[number, string]>
>();

// .toBuilder()
expectTypeOf(genEmpty.toBuilder()).toEqualTypeOf<
	MultiMap.Builder<number, string>
>();
expectTypeOf(genNonEmpty.toBuilder()).toEqualTypeOf<
	MultiMap.Builder<number, string>
>();

// From Builder
expectTypeOf(genEmpty.toBuilder().build()).toEqualTypeOf<G_Empty>();
