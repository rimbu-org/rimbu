import { expectTypeOf } from 'bun:test';

import type { MapCollection } from '@rimbu/collection-types/map';
import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common/types';
import { Table } from '@rimbu/table';
import type { FastIterator, Stream } from '@rimbu/stream';

type Cell = readonly [number, string, boolean];

type TE = Table<number, string, boolean>;
type TNE = Table.NonEmpty<number, string, boolean>;

const genEmpty: TE = undefined as any;
const genNonEmpty: TNE = undefined as any;

// NonEmpty is a subtype of the normal form, and the two are distinct.
expectTypeOf(genNonEmpty).toExtend<TE>();
expectTypeOf(genNonEmpty).toExtend<TNE>();
expectTypeOf(genEmpty).not.toExtend<TNE>();

// .isEmpty
expectTypeOf(genEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.isEmpty).toEqualTypeOf<false>();

// .size / .amountRows
expectTypeOf(genEmpty.size).toEqualTypeOf<number>();
expectTypeOf(genNonEmpty.size).toEqualTypeOf<number>();
expectTypeOf(genEmpty.amountRows).toEqualTypeOf<number>();
expectTypeOf(genNonEmpty.amountRows).toEqualTypeOf<number>();

// .stream()
expectTypeOf(genEmpty.stream()).toEqualTypeOf<Stream<Cell>>();
expectTypeOf(genNonEmpty.stream()).toEqualTypeOf<Stream.NonEmpty<Cell>>();

// .streamRows() narrows on the non-empty form.
expectTypeOf(genEmpty.streamRows()).toEqualTypeOf<Stream<number>>();
expectTypeOf(genNonEmpty.streamRows()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .streamValues() likewise.
expectTypeOf(genEmpty.streamValues()).toEqualTypeOf<Stream<boolean>>();
expectTypeOf(genNonEmpty.streamValues()).toEqualTypeOf<Stream.NonEmpty<boolean>>();

// .rowMap narrows to a non-empty map on the non-empty form, and the inner map is
// always non-empty — that is an invariant of the storage, not a refinement.
expectTypeOf(genEmpty.rowMap).toEqualTypeOf<
	MapCollection<number, MapCollection.NonEmpty<string, boolean>>
>();
expectTypeOf(genNonEmpty.rowMap).toEqualTypeOf<
	MapCollection.NonEmpty<number, MapCollection.NonEmpty<string, boolean>>
>();

// .get(row, column)
expectTypeOf(genEmpty.get(1, 'a')).toEqualTypeOf<boolean | undefined>();
expectTypeOf(genNonEmpty.get(1, 'a')).toEqualTypeOf<boolean | undefined>();
// The `OptLazy` overload.
expectTypeOf(genEmpty.get(1, 'a', 'fallback')).toEqualTypeOf<boolean | string>();
expectTypeOf(genEmpty.get(1, 'a', () => 'lazy')).toEqualTypeOf<boolean | string>();
// `RelatedTo` widening: a wider row key type is accepted.
expectTypeOf(genEmpty.get(1 as RelatedTo<number, number | string>, 'a')).toEqualTypeOf<
	boolean | undefined
>();

// .has(..) / .hasRow(..)
expectTypeOf(genEmpty.has(1, 'a')).toEqualTypeOf<boolean>();
expectTypeOf(genEmpty.hasRow(1)).toEqualTypeOf<boolean>();

// .getRow(..)
expectTypeOf(genEmpty.getRow(1)).toEqualTypeOf<MapCollection<string, boolean>>();

// .set(..) always yields a non-empty table.
expectTypeOf(genEmpty.set(1, 'a', true)).toEqualTypeOf<TNE>();
expectTypeOf(genNonEmpty.set(1, 'a', true)).toEqualTypeOf<TNE>();

// .add(..) is the adopted `WithAdd`, and also always non-empty.
expectTypeOf(genEmpty.add([1, 'a', true])).toEqualTypeOf<TNE>();
expectTypeOf(genNonEmpty.add([1, 'a', true])).toEqualTypeOf<TNE>();

// .addEach(..) — `StreamSource.NonEmpty` overload first, per root AGENTS.md §1.1.
expectTypeOf(genEmpty.addEach([[1, 'a', true]])).toEqualTypeOf<TNE>();
expectTypeOf(genNonEmpty.addEach([[1, 'a', true]])).toEqualTypeOf<TNE>();
expectTypeOf(genEmpty.addEach([] as Cell[])).toEqualTypeOf<TE>();

// .update(..) may empty the table, even on a non-empty source.
expectTypeOf(genEmpty.update(1, 'a', (v) => !v)).toEqualTypeOf<TE>();
expectTypeOf(genNonEmpty.update(1, 'a', (v) => !v)).toEqualTypeOf<TE>();

// .modify(..)
expectTypeOf(genEmpty.modify(1, 'a', {})).toEqualTypeOf<TE>();
expectTypeOf(genNonEmpty.modify(1, 'a', {})).toEqualTypeOf<TE>();

// .remove(..) / .removeRow(..) / .removeRows(..) / .removeEach(..) all may empty.
expectTypeOf(genEmpty.remove(1, 'a')).toEqualTypeOf<TE>();
expectTypeOf(genNonEmpty.remove(1, 'a')).toEqualTypeOf<TE>();
expectTypeOf(genEmpty.removeRow(1)).toEqualTypeOf<TE>();
expectTypeOf(genEmpty.removeRows([1])).toEqualTypeOf<TE>();
expectTypeOf(genEmpty.removeEach([[1, 'a']])).toEqualTypeOf<TE>();

// .filter(..) — 1-arity, per the adopted `WithFilter`.
expectTypeOf(genEmpty.filter(() => true)).toEqualTypeOf<TE>();
expectTypeOf(genNonEmpty.filter(() => true)).toEqualTypeOf<TE>();
expectTypeOf(genEmpty.filter(() => true, { negate: true })).toEqualTypeOf<TE>();

// .filterIndexed(..) comes from the shared base.
expectTypeOf(genEmpty.filterIndexed(() => true)).toEqualTypeOf<TE>();
expectTypeOf(genNonEmpty.filterIndexed(() => true)).toEqualTypeOf<TE>();

// .filterRows(..)
expectTypeOf(genEmpty.filterRows(() => true)).toEqualTypeOf<TE>();
expectTypeOf(genNonEmpty.filterRows(() => true)).toEqualTypeOf<TE>();

// .mapValues(..) refines only V; R and C are untouched.
//
// `toExtend` rather than `toEqualTypeOf` for the whole-interface comparison: `Table`
// is a recursive generic interface, so `expectTypeOf` cannot prove two
// instantiations structurally identical even when they are (it reports
// "Expected: function, Actual: function"). The migrated packages
// (`hashed/test-d`, `multiset/test-d`) assert these relations with `toExtend` for
// the same reason. The per-member assertions below pin the re-typing exactly.

// .mutate(..) comes from the adopted `WithMutate`.
expectTypeOf(genEmpty.mutate(() => {})).toEqualTypeOf<TE>();
expectTypeOf(genNonEmpty.mutate(() => {})).toEqualTypeOf<TE>();

// .toArray() narrows to a non-empty array.
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<Cell[]>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<ArrayNonEmpty<Cell>>();

// .toBuilder()
expectTypeOf(genEmpty.toBuilder()).toEqualTypeOf<Table.Builder<number, string, boolean>>();
expectTypeOf(genNonEmpty.toBuilder()).toEqualTypeOf<
	Table.Builder<number, string, boolean>
>();

// .context
expectTypeOf(genEmpty.context).toEqualTypeOf<Table.Context<number, string>>();

// .asNormal()
expectTypeOf(genNonEmpty.asNormal()).toEqualTypeOf<TE>();
expectTypeOf(genNonEmpty.assumeNonEmpty()).toEqualTypeOf<TNE>();
expectTypeOf(genEmpty.nonEmpty()).toEqualTypeOf<boolean>();

// Iterator
expectTypeOf(genEmpty[Symbol.iterator]()).toEqualTypeOf<FastIterator<Cell>>();
expectTypeOf(genNonEmpty[Symbol.iterator]()).toEqualTypeOf<FastIterator<Cell>>();

// A Table is invariant in all three coordinates: `set` puts them in
// contravariant position, `stream` in covariant.
type TWider = Table<number | string, string, boolean>;
expectTypeOf(genEmpty).not.toExtend<TWider>();
expectTypeOf(genEmpty).not.toExtend<Table<number, string | number, boolean>>();
expectTypeOf(genEmpty).not.toExtend<Table<number, string, boolean | number>>();

let m!: any;
expectTypeOf(m as TWider).not.toExtend<TE>();
expectTypeOf(
	m as Table<number, string | number, boolean>,
).not.toExtend<TE>();
expectTypeOf(
	m as Table<number, string, boolean | number>,
).not.toExtend<TE>();

// The Builder. Whole-interface comparisons use `toExtend` for the reason given
// above; per-member assertions pin the exact types.
type TB = Table.Builder<number, string, boolean>;
declare const bEmpty: TB;

expectTypeOf(bEmpty.context).toEqualTypeOf<Table.Context<number, string>>();
expectTypeOf(bEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(bEmpty.size).toEqualTypeOf<number>();
expectTypeOf(bEmpty.amountRows).toEqualTypeOf<number>();
expectTypeOf(bEmpty.build()).toExtend<TE>();

expectTypeOf(bEmpty.get(1, 'a')).toEqualTypeOf<boolean | undefined>();
expectTypeOf(bEmpty.get(1, 'a', 'fallback')).toEqualTypeOf<boolean | string>();
expectTypeOf(bEmpty.getRow(1)).toEqualTypeOf<MapCollection<string, boolean>>();
expectTypeOf(bEmpty.has(1, 'a')).toEqualTypeOf<boolean>();
expectTypeOf(bEmpty.hasRow(1)).toEqualTypeOf<boolean>();

// Mutators report whether anything changed.
expectTypeOf(bEmpty.set(1, 'a', true)).toEqualTypeOf<boolean>();
expectTypeOf(bEmpty.add([1, 'a', true])).toEqualTypeOf<boolean>();
expectTypeOf(bEmpty.addEach([[1, 'a', true]])).toEqualTypeOf<boolean>();
expectTypeOf(bEmpty.modify(1, 'a', {})).toEqualTypeOf<boolean>();
expectTypeOf(bEmpty.removeRow(1)).toEqualTypeOf<boolean>();
expectTypeOf(bEmpty.removeRows([1])).toEqualTypeOf<boolean>();
expectTypeOf(bEmpty.removeEach([[1, 'a']])).toEqualTypeOf<boolean>();
expectTypeOf(bEmpty.clear()).toEqualTypeOf<void>();

// The builder's `remove` returns the removed value — unlike the collection's,
// which returns nothing. A mutable builder has no result collection to return.
expectTypeOf(bEmpty.remove(1, 'a')).toEqualTypeOf<boolean | undefined>();
expectTypeOf(bEmpty.remove(1, 'a', 'fallback')).toEqualTypeOf<boolean | string>();
expectTypeOf(bEmpty.update(1, 'a', (v) => !v)).toEqualTypeOf<boolean | undefined>();

// `forEach` is 1-arity; `forEachIndexed` carries index and halt.
expectTypeOf(bEmpty.forEach(() => {})).toEqualTypeOf<void>();
expectTypeOf(
	bEmpty.forEachIndexed((cell, index, halt) => {
		expectTypeOf(cell).toEqualTypeOf<Cell>();
		expectTypeOf(index).toEqualTypeOf<number>();
		expectTypeOf(halt).toEqualTypeOf<() => void>();
	}),
).toEqualTypeOf<void>();

// `buildMapValues` refines only V.
expectTypeOf(bEmpty.buildMapValues((value) => `${value}`)).toExtend<
	Table<number, string, string>
>();

// The Context. `Table.Context` is the interface; `Table.CollectionContext` is the
// concrete class the four exported constants are typed as. Assert the interface.
type TC = Table.Context<number, string>;
declare const ctx: TC;

expectTypeOf(ctx.typeTag).toEqualTypeOf<'Table'>();
expectTypeOf(ctx.empty<Cell>()).toExtend<TE>();
expectTypeOf(ctx.of<Cell>([1, 'a', true])).toExtend<TNE>();
expectTypeOf(ctx.builder<Cell>()).toExtend<TB>();
expectTypeOf(ctx.defaultContext).toExtend<TC>();
// `createContext` returns a context typed by the *base* family, not by `TC`, so
// assert the members that matter rather than the whole interface.
const derived = ctx.createContext({
	rowContext: ctx.rowContext,
	columnContext: ctx.columnContext,
});
expectTypeOf(derived.typeTag).toEqualTypeOf<'Table'>();
// `empty`/`of` on the derived context produce concrete Tables. The whole-interface
// comparison hits the recursive-interface limit, so assert per member. Note
// `get` returns `unknown` here: `createContext` is typed by the *generic*
// `RowMapContext` / `ColumnMapContext` aliases, whose value type is `any`-shaped.
// A typed table comes from a *variant* context (see `HashTableHashColumn`), which
// is the type users actually hold.
expectTypeOf(derived.empty<Cell>().size).toEqualTypeOf<number>();
expectTypeOf(derived.empty<Cell>().isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(derived.of<Cell>([1, 'a', true]).isEmpty).toEqualTypeOf<false>();
expectTypeOf(derived.of<Cell>([1, 'a', true]).size).toEqualTypeOf<number>();
expectTypeOf(derived.builder<Cell>().build().size).toEqualTypeOf<number>();

// The root `Table` value exposes only `createContext`: a table has no default
// backing, because which map backs rows and which backs columns are independent.
// The root `Table` value is `createContext`-only: a table has no default backing.
expectTypeOf(
	Table.createContext({
		rowContext: ctx.rowContext,
		columnContext: ctx.columnContext,
	}).typeTag,
).toEqualTypeOf<'Table'>();

// .mapValues(..) re-typing, asserted per member (see the note above on why the
// whole-interface comparison uses `toExtend`).
const mapped = genNonEmpty.mapValues((value) => `${value}`);
expectTypeOf(mapped.get(1, 'a')).toExtend<string | undefined>();
expectTypeOf(mapped.size).toEqualTypeOf<number>();
expectTypeOf(mapped.amountRows).toEqualTypeOf<number>();
expectTypeOf(mapped.has(1, 'a')).toEqualTypeOf<boolean>();
expectTypeOf(mapped.stream().toArray).toBeFunction();
expectTypeOf(mapped.isEmpty).toEqualTypeOf<false>();
// R and C are untouched by a value-level map.
expectTypeOf(mapped.getRow(1)).toExtend<MapCollection<string, string>>();
expectTypeOf(mapped.rowMap).toExtend<
	MapCollection<number, MapCollection.NonEmpty<string, string>>
>();

// The mapped form is itself usable as a Table: it can be re-mapped and built from.
expectTypeOf(mapped.mapValues((value) => value.length)).toExtend<
	Table<number, string, number>
>();
