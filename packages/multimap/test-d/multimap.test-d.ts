import { expectTypeOf } from 'bun:test';

import type { MapCollection } from '@rimbu/collection-types/map';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { Op } from '@rimbu/collection-types/types';
import type { MultiMap } from '@rimbu/multimap';
import type { MultiMapCollection } from '@rimbu/multimap/advanced/multimap-base';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { FastIterator, Stream } from '@rimbu/stream';
import type { Reducer } from '@rimbu/stream/reducer';

import { Stream as StreamImpl } from '@rimbu/stream';

import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';

type GE<K, V> = MultiMap<K, V>;
type GNE<K, V> = MultiMap.NonEmpty<K, V>;

type G_Empty = GE<number, string>;
type G_NonEmpty = GNE<number, string>;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

// A MultiMap is invariant in `readonly [K, V]`: `addTo`, `mapValues`,
// `flatMapValues` and `flatMapValues`-style callbacks all take a
// `(value: V, key: K) => …`, which is contravariant in `V`.
expectTypeOf(genEmpty).not.toExtend<GE<number | string, string>>();
expectTypeOf(genEmpty).not.toExtend<GE<number, string | boolean>>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number | string, string>>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number, string | boolean>>();

let m!: any;
expectTypeOf(m as GE<number | string, string>).not.toExtend<G_Empty>();
expectTypeOf(m as GNE<number | string, string>).not.toExtend<G_NonEmpty>();

// Subtyping: NonEmpty extends normal, and nothing extends NonEmpty.
expectTypeOf(genNonEmpty).toExtend<G_Empty>();
expectTypeOf(genEmpty).not.toExtend<G_NonEmpty>();
expectTypeOf(genNonEmpty).toExtend<G_NonEmpty>();

// Iterator — the element is now a `readonly` tuple.
expectTypeOf(genEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<readonly [number, string]>
>();
expectTypeOf(genNonEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<readonly [number, string]>
>();

// .isEmpty / .size / .keySize
expectTypeOf(genEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.isEmpty).toEqualTypeOf<false>();
expectTypeOf(genEmpty.size).toEqualTypeOf<number>();
expectTypeOf(genEmpty.keySize).toEqualTypeOf<number>();

// .stream() — non-empty is refined
expectTypeOf(genEmpty.stream()).toEqualTypeOf<Stream<readonly [number, string]>>();
expectTypeOf(genNonEmpty.stream()).toEqualTypeOf<
	Stream.NonEmpty<readonly [number, string]>
>();
expectTypeOf(genEmpty.streamKeys()).toEqualTypeOf<Stream<number>>();
expectTypeOf(genNonEmpty.streamKeys()).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(genEmpty.streamValues()).toEqualTypeOf<Stream<string>>();
expectTypeOf(genNonEmpty.streamValues()).toEqualTypeOf<Stream.NonEmpty<string>>();

// .toArray() — non-empty is refined
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<Array<readonly [number, string]>>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<
	ArrayNonEmpty<readonly [number, string]>
>();

// .assumeNonEmpty() / .asNormal()
expectTypeOf(genEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.asNormal()).toEqualTypeOf<G_Empty>();

// .addTo(key, value) — renamed from `add`; always non-empty
expectTypeOf(genEmpty.addTo(1, 'a')).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addTo(1, 'a')).toEqualTypeOf<G_NonEmpty>();

// .addEach(entries) — renamed from `addEntries`; NonEmpty source first
expectTypeOf(genEmpty.addEach([])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.addEach([[1, 'a']])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEach([[1, 'a']])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEach([])).toEqualTypeOf<G_NonEmpty>();

// .getValues(key) — renamed from `valuesAt`; an absent key yields the EMPTY set,
// never `undefined`.
expectTypeOf(genEmpty.getValues(1)).toEqualTypeOf<SetCollection<string>>();
expectTypeOf(genNonEmpty.getValues(1)).toEqualTypeOf<SetCollection<string>>();

// .has(key) — renamed from `hasKey`
expectTypeOf(genEmpty.has(1)).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.has(1)).toEqualTypeOf<boolean>();
// .hasEntry(key, value) — kept; a second, distinct predicate
expectTypeOf(genEmpty.hasEntry(1, 'a')).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.hasEntry(1, 'a')).toEqualTypeOf<boolean>();

// .count(key) — set cardinality, NOT `MultiSet`'s multiplicity
expectTypeOf(genEmpty.count(1)).toEqualTypeOf<number>();
expectTypeOf(genNonEmpty.count(1)).toEqualTypeOf<number>();

// .keyMap — generic `MapCollection` of non-empty value sets; narrowed on NonEmpty
expectTypeOf(genEmpty.keyMap).toEqualTypeOf<
	MapCollection<number, SetCollection.NonEmpty<string>>
>();
expectTypeOf(genNonEmpty.keyMap).toEqualTypeOf<
	MapCollection.NonEmpty<number, SetCollection.NonEmpty<string>>
>();

// .removeKeyAndReturn(key) — renamed from `removeKeyAndGet`; an `Op.DynamicResult`
// whose found value is the whole value SET.
expectTypeOf(genEmpty.removeKeyAndReturn(1)).toEqualTypeOf<
	DynamicResultOf<G_Empty>
>();
expectTypeOf(genNonEmpty.removeKeyAndReturn(1)).toEqualTypeOf<
	DynamicResultOf<G_NonEmpty>
>();
expectTypeOf(genNonEmpty.removeKeyAndReturn(1, 'fallback')).toEqualTypeOf<
	DynamicResultOf<G_NonEmpty, string>
>();

// .removeKey — the collection-level one still returns the normal type
expectTypeOf(genEmpty.removeKey(1)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeKey(1)).toEqualTypeOf<G_Empty>();

// .addEachValue / .setEachValue — renamed from `addValues` / `setValues`
expectTypeOf(genEmpty.addEachValue(1, [])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.addEachValue(1, ['a'])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genEmpty.setEachValue(1, [])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.setEachValue(1, ['a'])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEachValue(1, ['a'])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.setEachValue(1, ['a'])).toEqualTypeOf<G_NonEmpty>();

// .mapValues — the result is built in the SAME context, so `V2` is constrained
// to a subtype of `V`: mapping to an unrelated type is not representable.
expectTypeOf(genEmpty.mapValues((v) => v)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.mapValues((v) => v)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genEmpty.mapValues((v) => v as 'a')).toEqualTypeOf<GE<number, 'a'>>();
// @ts-expect-error the result value must be a subtype of V
expectTypeOf(genEmpty.mapValues((_v) => 1));

// .flatMapValues — same same-context constraint, and may empty a key
expectTypeOf(genEmpty.flatMapValues((v) => [v])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.flatMapValues((v) => [v, v])).toEqualTypeOf<G_Empty>();

// .modifyValuesAt — renamed from `modifyAt`; keeps the StreamSource payload
expectTypeOf(genEmpty.modifyValuesAt(1, { ifNew: { set: ['a'] } })).toEqualTypeOf<
	G_Empty
>();
expectTypeOf(
	genEmpty.modifyValuesAt(1, { ifNew: { create: () => ['a'] } }),
).toEqualTypeOf<G_Empty>();
expectTypeOf(
	genNonEmpty.modifyValuesAt(1, {
		ifExists: { update: (current) => current },
	}),
).toEqualTypeOf<G_Empty>();

// Set algebra — `intersection` / `symmetricDifference` renamed from
// `intersect` / `symDifference` to match the shared vocabulary.
expectTypeOf(genEmpty.union(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genEmpty.union(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.intersection(genNonEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.difference(genNonEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.symmetricDifference(genNonEmpty)).toEqualTypeOf<G_Empty>();
// The operand is the abstract `MultiMapCollection.Collection`, not any
// `MapCollection` — the two are not interchangeable.
// @ts-expect-error a plain `MapCollection` is not a MultiMap operand
genEmpty.union(undefined as unknown as MapCollection<number, string>);

// .filterIndexed — the 3-parameter (entry, index, halt) form was `filter`.
// The inherited `filterIndexed` has no `halt`.
expectTypeOf(genEmpty.filterIndexed((_e, i) => i < 1)).toEqualTypeOf<G_Empty>();
// .filter — the 1-parameter form, including the type-guard overloads
expectTypeOf(genEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.filter(() => true, { negate: true })).toEqualTypeOf<G_Empty>();
// the type-guard overload narrows the value type
expectTypeOf(
	genEmpty.filter((e): e is readonly [number, 'a'] => e[1] === 'a'),
).toEqualTypeOf<GE<number, 'a'>>();

// .recompose — renamed from `transform`
expectTypeOf(genEmpty.recompose((s) => s)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.recompose((s) => s)).toEqualTypeOf<G_NonEmpty>();

// Gained by adopting the capability style (see the migration plan, Q18).
expectTypeOf(genEmpty.map((e) => e)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.map((e) => e)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genEmpty.mapIndexed((e) => e)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.flatMap((e) => StreamImpl.of(e))).toEqualTypeOf<G_Empty>();
// `flatMapIndexed`'s `options` is a *required* parameter in the shared
// capability, so it must be passed (possibly `undefined`).
expectTypeOf(
	genEmpty.flatMapIndexed((e) => StreamImpl.of(e), undefined),
).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.mutate(() => {})).toEqualTypeOf<G_Empty>();

// .toBuilder()
expectTypeOf(genEmpty.toBuilder()).toEqualTypeOf<MultiMap.Builder<number, string>>();

// MultiMap.Builder
const builder = undefined as unknown as MultiMap.Builder<number, string>;
expectTypeOf(builder.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(builder.size).toEqualTypeOf<number>();
expectTypeOf(builder.build()).toEqualTypeOf<G_Empty>();
expectTypeOf(builder.addTo(1, 'a')).toEqualTypeOf<boolean>();
expectTypeOf(builder.addEach([[1, 'a']])).toEqualTypeOf<boolean>();
expectTypeOf(builder.getValues(1)).toEqualTypeOf<SetCollection<string>>();
expectTypeOf(builder.has(1)).toEqualTypeOf<boolean>();
expectTypeOf(builder.hasEntry(1, 'a')).toEqualTypeOf<boolean>();
expectTypeOf(builder.count(1)).toEqualTypeOf<number>();
expectTypeOf(builder.addEachValue(1, ['a'])).toEqualTypeOf<boolean>();
expectTypeOf(builder.setEachValue(1, ['a'])).toEqualTypeOf<boolean>();
expectTypeOf(builder.removeEntry(1, 'a')).toEqualTypeOf<boolean>();
expectTypeOf(builder.removeEntries([[1, 'a']])).toEqualTypeOf<boolean>();
// `removeKey` on the builder hands back the removed VALUE SET: an empty set
// means "this key was not present", where a map would return `undefined`.
expectTypeOf(builder.removeKey(1)).toEqualTypeOf<SetCollection<string>>();
expectTypeOf(builder.removeKey(1, 'fallback')).toEqualTypeOf<
	SetCollection<string> | string
>();
// `clear` is inherited from the shared builder API
expectTypeOf(builder.clear()).toEqualTypeOf<void>();

// MultiMap.Context
const context = undefined as unknown as MultiMap.Context<number, string>;
expectTypeOf(context.typeTag).toEqualTypeOf<'MultiMap'>();
expectTypeOf(context.empty<readonly [number, string]>()).toEqualTypeOf<G_Empty>();
expectTypeOf(context.of<readonly [number, string]>([1, 'a'])).toEqualTypeOf<
	G_NonEmpty
>();
expectTypeOf(context.from<readonly [number, string]>([])).toEqualTypeOf<G_Empty>();
expectTypeOf(context.builder<readonly [number, string]>()).toEqualTypeOf<
	MultiMap.Builder<number, string>
>();
expectTypeOf(context.reducer<number, string>()).toEqualTypeOf<
	Reducer<readonly [number, string], G_Empty>
>();
expectTypeOf(context.keyMapContext).toExtend<MapCollection.Context<any>>();
expectTypeOf(context.keyMapValuesContext).toExtend<SetCollection.Context<any>>();

// The four historical variants are contexts now, not types.
expectTypeOf(HashMultiMapHashValue).toExtend<MultiMap.Context<any, any>>();

// The abstract MultiMap, used to type cross-variant operands.
expectTypeOf(genEmpty).toExtend<
	MultiMapCollection.Collection<number, string>
>();
expectTypeOf(genNonEmpty).toExtend<
	MultiMapCollection.CollectionNonEmpty<number, string>
>();

/** The `Op.DynamicResult` shape produced by `removeKeyAndReturn`. */
type DynamicResultOf<
	Col extends G_Empty,
	O = undefined,
> = Op.DynamicResult<Col, O, SetCollection<string>, G_Empty>;
