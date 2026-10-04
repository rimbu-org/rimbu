import type { ModifyOptions } from '@rimbu/collection-types/advanced/common';
import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { RelatedTo } from '@rimbu/common/types';
import type { Stream, StreamSource } from '@rimbu/stream';

/**
 * The capability suite a {@link Table} contributes on top of the generic
 * {@link Collection} surface.
 *
 * ## Why a Table is not a keyed collection
 *
 * `KeyedCollection<K, V>` binds its element to `readonly [K, V]` and its
 * capabilities are all expressed in terms of that pair — `get(key)`, `has(key)`,
 * `streamKeys`, `streamValues`. A table's element is a **cell**,
 * `readonly [R, C, V]`, and every one of its operations is addressed by *two*
 * independent coordinates. Adopting the keyed capabilities would force a choice
 * between two wrong answers: bind `V` to a whole column map, which turns
 * `stream`/`filter`/`toArray` into row-shaped operations, or bind `V` to a
 * single cell value, which makes `get(key)` undefined (a key alone does not
 * identify a cell).
 *
 * The same reasoning bans the other three generic suites:
 *
 * - `ValuedCollection` — its algebra (`union`, `intersection`, `difference`,
 *   `symmetricDifference`) and `has(element)` are all defined over a single
 *   value type. There is no single value type here.
 * - `IndexedCollection` — `at`/`slice`/`first`/`last`/`prepend`/`append` are
 *   defined over a positional order. A table has no positional order: cells are
 *   addressed by coordinate, and a row map may be hash-ordered or sorted-backed
 *   independently of the column map. Note that `at` in particular is *already*
 *   a coordinate accessor here (`get(row, column)`), which is the opposite of
 *   what the indexed contract means by it.
 * - `SortedCollection` — `min`/`max`/`next`/`previous` require a total order on
 *   the *element*. A cell has no meaningful order; only its row key or its
 *   column key does, and which one is a property of the backing context rather
 *   than of the table.
 *
 * A table therefore gets the plain `Collection` contract — `size`, `isEmpty`,
 * `stream`, `forEach`, `filter`, `toArray`, `nonEmpty` — and supplies every
 * 2-dimensional operation itself. That is the same shape as
 * `MultiSetCollection`, `MultiMapCollection` and `BiMapCollection`.
 *
 * ## Which shared capabilities are adopted, and why
 *
 * Only the capabilities whose operand is the *cell* or a *stream of cells*:
 * `WithAdd`, `WithAddEach`, `WithFilter` (which is part of
 * `Collection.Advanced.Api` unconditionally and therefore not optional),
 * `WithToBuilder`, `WithMutate` and `WithReducer`. Even `WithFilter` needs
 * care — see its note below.
 *
 * The element-level transforms are deliberately **not** adopted:
 * `WithMap`/`WithMapIndexed`/`WithFlatMap`/`WithFlatMapIndexed`/`WithRecompose`
 * would all operate cell-to-cell, i.e. "rebuild this 3-tuple" and "explode one
 * cell into N cells". That is not a useful table operation, and offering it
 * would be actively misleading. Value-level transformation is provided by
 * {@link TableCollection.Capability.WithMapValues} instead, whose callback
 * receives the value *and both coordinates*.
 */
export declare namespace TableCollection {
	export namespace Advanced {
		/**
		 * The slot skeleton a Table family builds on.
		 *
		 * The element is a cell triple, so `E = readonly [R, C, V]`. The three
		 * coordinate slots (`_NEW_R` / `_NEW_C` / `_NEW_V` and their `_UPPER_*`
		 * counterparts) exist because `mapValues` must be able to re-type `V`
		 * alone, leaving `R` and `C` untouched. This mirrors
		 * `KeyedCollection.Advanced.FamilyBase<K, V>`, which adds `_NEW_K` /
		 * `_NEW_V` / `_UPPER_K` / `_UPPER_V` for the same reason.
		 *
		 * Note `_UPPER_E` is deliberately pinned permissively by the concrete
		 * family (`readonly [any, any, any]`), the way `HashMap` pins
		 * `readonly [K, any]`: the row key may be widened at a context factory
		 * via `RelatedTo<R, UR>` on every operation that accepts a row.
		 */
		export interface FamilyBase<R, C, V>
			extends Collection.Advanced.FamilyBase<readonly [R, C, V]> {
			/**
			 * The upper bound on each coordinate, and the coordinate a retyping
			 * operation produces.
			 *
			 * These are declared as *independent* slots rather than as
			 * `this['_UPPER_E'][0]`-style projections of the packed element.
			 * Projecting requires redeclaring `_UPPER_E` / `_NEW_E` as concrete
			 * triples, and `Collection.Advanced.Family<E>` — which
			 * `CollectionEmpty.Constructor` and `ContextBaseWithAddEach` both
			 * require a family to extend — leaves them as `unknown`, so the merge
			 * fails with TS2320. Independent slots keep this base compatible with
			 * `Collection.Advanced.Family`; the concrete family below ties them
			 * together by pinning `_UPPER_E`, `_NEW_E` and the three projections
			 * together in one place.
			 */
			_UPPER_R: unknown;
			_UPPER_C: unknown;
			_UPPER_V: unknown;

			_NEW_R: unknown;
			_NEW_C: unknown;
			_NEW_V: unknown;

			/**
			 * The context used for the internal row maps. Distinct per context,
			 * so it is pinned per family rather than fixed to one map type.
			 */
			_ROW_CONTEXT: unknown;
			/** The context used for the internal column maps. */
			_COLUMN_CONTEXT: unknown;

			_FAM: FamilyBase<R, C, V>;
			_NEW_FAMILY: FamilyBase<this['_NEW_R'], this['_NEW_C'], this['_NEW_V']>;
		}

		/**
		 * The aggregate table family.
		 *
		 * This intermediate exists for the same reason
		 * `KeyedCollection.Advanced.Family` does: a concrete family must not mix a
		 * base that pins slots (here `_UPPER_E` / `_NEW_E` as cell triples) with
		 * one that leaves them `unknown`, because TypeScript rejects the merge
		 * with TS2320. Pinning them **once**, here, and having the concrete family
		 * extend only this keeps every slot identically declared.
		 *
		 * Note the shared `WithAdd` / `WithAddEach` / `WithToBuilder` capability
		 * families are deliberately *not* in this `extends` clause even though
		 * their `Api`s are adopted above: those families redeclare `_NEW_E` and
		 * `_INVARIANT` off the un-pinned `Collection.Advanced.FamilyBase`, which
		 * is precisely the conflict. The concrete family below states the
		 * invariant once instead.
		 */
		export interface Family<R, C, V>
			extends TableCollection.Advanced.FamilyBase<R, C, V>,
				Collection.Advanced.Family<readonly [R, C, V]> {
			_NORMAL: TableCollection.Advanced.Api<R, C, V, this['_TYPES']>;
			_NON_EMPTY: TableCollection.Advanced.Api<
				R,
				C,
				V,
				this['_TYPES_NON_EMPTY']
			>;
			_BUILDER: TableCollection.Advanced.BuilderApi<R, C, V, this['_TYPES']>;
			_CONTEXT: TableCollection.Advanced.ContextApi<this>;

			_FAM: TableCollection.Advanced.Family<R, C, V>;
			_NEW_FAMILY: TableCollection.Advanced.Family<
				this['_NEW_R'],
				this['_NEW_C'],
				this['_NEW_V']
			>;
		}

		/**
		 * The non-empty table API: the shared `Api` with the members a non-empty
		 * table can narrow.
		 *
		 * A separate interface is required rather than a member-level conditional on
		 * `Tp['_IS_NON_EMPTY']` (the trick `IndexedCollection.Advanced.FirstLast`
		 * uses). A concrete family pins `_NORMAL` to the concrete possibly-empty
		 * type, and TypeScript then requires that pin to be assignable to the
		 * *unresolved* conditional — which it cannot be, because for a normal
		 * collection the conditional is still deferred. Splitting the two kinds
		 * into their own interfaces keeps each one concrete, and it is the same
		 * shape `ValuedCollection` / `KeyedCollection` use for their non-empty
		 * refinements.
		 */
		export interface NonEmptyApi<
			R,
			C,
			V,
			Tp extends Collection.Advanced.TypesNonEmpty<
				TableCollection.Advanced.Family<R, C, V>,
				readonly [R, C, V]
			>,
		> extends TableCollection.Advanced.Api<R, C, V, Tp> {
			readonly rowMap: MapCollection.NonEmpty<R, MapCollection.NonEmpty<C, V>>;

			streamRows(): Stream.NonEmpty<R>;
			streamValues(): Stream.NonEmpty<V>;
		}

		export interface Api<
			R,
			C,
			V,
			Tp extends TableCollection.Advanced.TypesRecord<
				R,
				C,
				V,
				TableCollection.Advanced.Family<R, C, V>
			>,
		> extends Collection.Advanced.Api<readonly [R, C, V], Tp>,
				Collection.Capability.WithAdd.Api<readonly [R, C, V], Tp>,
				Collection.Capability.WithAddEach.Api<readonly [R, C, V], Tp>,
				Collection.Capability.WithToBuilder.Api<readonly [R, C, V], Tp>,
				Collection.Capability.WithMutate.Api<readonly [R, C, V], Tp>,
				TableCollection.Capability.WithGet.Api<R, C, V, Tp>,
				TableCollection.Capability.WithHas.Api<R, C, V, Tp>,
				TableCollection.Capability.WithSetAt.Api<R, C, V, Tp>,
				TableCollection.Capability.WithModify.Api<R, C, V, Tp>,
				TableCollection.Capability.WithUpdate.Api<R, C, V, Tp>,
				TableCollection.Capability.WithRemoveAt.Api<R, C, V, Tp>,
				TableCollection.Capability.WithRemoveRow.Api<R, C, V, Tp>,
				TableCollection.Capability.WithRemoveEach.Api<R, C, V, Tp>,
				TableCollection.Capability.WithRowMap.Api<R, C, V, Tp>,
				TableCollection.Capability.WithMapValues.Api<R, C, V, Tp>,
				TableCollection.Capability.WithFilterRows.Api<R, C, V, Tp> {}

		export interface BuilderApi<
			R,
			C,
			V,
			Tp extends TableCollection.Advanced.TypesRecord<
				R,
				C,
				V,
				TableCollection.Advanced.Family<R, C, V>
			>,
		> extends Collection.Advanced.BuilderApi<readonly [R, C, V], Tp>,
				Collection.Capability.WithAdd.BuilderApi<readonly [R, C, V], Tp>,
				Collection.Capability.WithAddEach.BuilderApi<readonly [R, C, V], Tp>,
				TableCollection.Capability.WithGet.BuilderApi<R, C, V, Tp>,
				TableCollection.Capability.WithHas.BuilderApi<R, C, V, Tp>,
				TableCollection.Capability.WithSetAt.BuilderApi<R, C, V, Tp>,
				TableCollection.Capability.WithModify.BuilderApi<R, C, V, Tp>,
				TableCollection.Capability.WithUpdate.BuilderApi<R, C, V, Tp>,
				TableCollection.Capability.WithRemoveAt.BuilderApi<R, C, V, Tp>,
				TableCollection.Capability.WithRemoveRow.BuilderApi<R, C, V, Tp>,
				TableCollection.Capability.WithRemoveEach.BuilderApi<R, C, V, Tp>,
				TableCollection.Capability.WithRowMap.BuilderApi<R, C, V, Tp>,
				TableCollection.Capability.WithMapValues.BuilderApi<R, C, V, Tp> {}

		export interface ContextApi<
			FAM extends TableCollection.Advanced.FamilyBase<any, any, any>,
		> extends Collection.Advanced.ContextApi<FAM>,
				Collection.Capability.WithReducer.ContextApi<FAM> {
			/**
			 * Uniformly `'Table'`: the tag describes the collection, not the
			 * backing. The backing is chosen by `rowContext` and `columnContext`
			 * and is no longer visible in `toString()`.
			 */
			readonly typeTag: 'Table';

			/** The context used for the internal row maps. */
			readonly rowContext: FAM['_ROW_CONTEXT'];
			/** The context used for the internal column maps. */
			readonly columnContext: FAM['_COLUMN_CONTEXT'];

			isValidRow(row: unknown): boolean;
			isValidColumn(column: unknown): boolean;

			/**
			 * Derives a table context from the given row and column map contexts.
			 * Both are required: a table has no default backing, because which map
			 * backs rows and which backs columns are independent choices.
			 * @example
			 * ```ts
			 * import { Table } from '@rimbu/table';
			 * import { HashMap } from '@rimbu/hashed';
			 * import { SortedMap } from '@rimbu/sorted';
			 *
			 * const context = Table.createContext({
			 * 	rowContext: HashMap.defaultContext,
			 * 	columnContext: SortedMap.defaultContext,
			 * });
			 * const table = context.of([2, 'b', 1]);
			 * console.log(table.streamRows().toArray()); // => [ 2 ]
			 * ```
			 */
			/**
			 * Derives a sibling context with a different row and/or column backing.
			 *
			 * The return is `ContextApi<this>` rather than a fresh family: the
			 * derived context is the *same* family with different backing contexts,
			 * and typing it as `FAM` would be wrong anyway since the backing is a
			 * property of the context instance, not of the collection family. Using
			 * `this` keeps the derived context interchangeable with this one, which
			 * is what `Table.createContext(...).createContext(...)` callers need.
			 */
			createContext<UR2, UC2>(options: {
				rowContext: TableCollection.Advanced.RowMapContext<UR2>;
				columnContext: TableCollection.Advanced.ColumnMapContext<UC2>;
			}): TableCollection.Advanced.ContextApi<
				TableCollection.Advanced.Family<UR2, UC2, any>
			>;
		}

		/**
		 * The types record a table capability is written against.
		 *
		 * Every capability below constrains `Tp` to this rather than to the generic
		 * `Collection.Advanced.TypesBase`. That is required, not stylistic:
		 * `TypesBase` carries no coordinate slots, so `Tp['_UPPER_V']` — which
		 * `WithMapValues` needs in order to *refine* the value type — would not
		 * resolve against it.
		 *
		 * The bound is `FAM`, the **concrete** family, not `FamilyBase`. That is
		 * load-bearing for the re-typing primitives: `ReTyped` and `FamToTypes` both
		 * pivot through `_NEW_E` into `_NEW_FAMILY` and then read `_NORMAL` /
		 * `_NON_EMPTY` off the result. `FamilyBase._NEW_FAMILY` is a `FamilyBase`,
		 * whose `_NORMAL` is `unknown` — so a capability bound to `FamilyBase` can
		 * never re-type a result, and `mapValues` would return `unknown`.
		 */
		export type TypesRecord<
			R,
			C,
			V,
			FAM extends TableCollection.Advanced.Family<R, C, V>,
		> = Collection.Advanced.Types<FAM, readonly [R, C, V]>;

		/**
		 * The family a table's *inner* (column) map builders are built from.
		 *
		 * A named interface, never an ad-hoc intersection of the individual
		 * `Capability.*` families: an intersection is not the aggregate family, so
		 * slots like `_BUILDER` resolve to an intersection of each capability's own
		 * `BuilderApi` and the aggregate-only members (`get`, `has`, `remove`,
		 * `modifyAtKey`, …) go missing. It is also uncacheable by symbol, so every
		 * slot resolution re-intersects and recurses through `_TYPES`. See root
		 * `AGENTS.md` §6.4.
		 */
		export interface ColumnMapFamily<C, V>
			extends MapCollection.Advanced.Family<C, V> {}

		/** The family a table's outer (row) map builders are built from. */
		export interface RowMapFamily<R, V>
			extends MapCollection.Advanced.Family<R, V> {}

		/** A builder over one row's columns. */
		export type ColumnBuilder<C, V> = ColumnMapFamily<C, V>['_BUILDER'];

		/** A builder over the table's row keys. */
		export type RowBuilder<R, V> = RowMapFamily<R, V>['_BUILDER'];

		/**
		 * The context for a table's *outer* map (row key → that row's columns).
		 *
		 * `MapCollection.Context<Family<K, any>>` is the right shape, but its value
		 * type is unconstrained: `of([row, columns])` yields a
		 * `MapCollection<K, any>`, which is not statically known to be non-empty.
		 * `RowMapContext` adds the constraint so a built row map can be handed to
		 * `createNonEmpty` directly.
		 */
		export type RowMapContext<R> = MapCollection.Context<
			RowMapFamily<R, MapCollection.NonEmpty<any, any>>
		>;
		/** The context for a table's *inner* maps (column key → value). */
		export type ColumnMapContext<C> = MapCollection.Context<
			ColumnMapFamily<C, any>
		>;

		/**
		 * The context a table builds a *single* row's columns with.
		 *
		 * Parameterised by the value type because the only way to obtain a
		 * `ColumnMapTypeNonEmpty` from a context is `of([column, value])`, whose
		 * result is non-empty precisely because the caller supplies one entry.
		 */
		export type ColumnMapContextFor<C, V> = MapCollection.Context<
			ColumnMapFamily<C, V>
		>;

		/**
		 * One row's columns: always non-empty.
		 *
		 * A table row is pruned the moment its last cell is removed, so a row value
		 * is non-empty by construction. Every place a row map is *built* states this
		 * explicitly rather than relying on the reader to remember the invariant.
		 */
		export type ColumnMapTypeNonEmpty<C, V> = MapCollection.NonEmpty<C, V>;

		/**
		 * The internal row map of a table that holds at least one cell: a non-empty
		 * map from row key to a **non-empty** map of that row's columns.
		 *
		 * The inner `NonEmpty` is an invariant of the storage, not an
		 * approximation — a row is pruned the moment its last cell is removed, in
		 * every code path that can empty a row.
		 */
		export type RowMapTypeNonEmpty<R, C, V> = MapCollection.NonEmpty<
			R,
			MapCollection.NonEmpty<C, V>
		>;

		/** The internal row map of a possibly-empty table. */
		export type RowMapType<R, C, V> = MapCollection<
			R,
			MapCollection.NonEmpty<C, V>
		>;
	}

	export namespace Capability {
		/**
		 * Value lookup at a coordinate pair.
		 *
		 * Named `get` rather than `at`: in Rimbu `at` always means a positional
		 * index (see `IndexedCollection.Capability.WithAt`), and a coordinate
		 * pair is not an index.
		 */
		export namespace WithGet {
			export interface Api<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				get<UR = R, UC = C>(
					row: RelatedTo<R, UR>,
					column: RelatedTo<C, UC>,
				): V | undefined;
				get<UR, UC, O>(
					row: RelatedTo<R, UR>,
					column: RelatedTo<C, UC>,
					otherwise: OptLazy<O>,
				): V | O;
			}

			export interface BuilderApi<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				get<UR = R, UC = C>(
					row: RelatedTo<R, UR>,
					column: RelatedTo<C, UC>,
				): V | undefined;
				get<UR, UC, O>(
					row: RelatedTo<R, UR>,
					column: RelatedTo<C, UC>,
					otherwise: OptLazy<O>,
				): V | O;
			}
		}

		/** Presence tests for a cell and for a row. */
		export namespace WithHas {
			export interface Api<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				/** whether the cell at the given coordinate pair holds a value */
				has<UR = R, UC = C>(
					row: RelatedTo<R, UR>,
					column: RelatedTo<C, UC>,
				): boolean;
				/** whether the table holds any cell in the given row */
				hasRow<UR = R>(row: RelatedTo<R, UR>): boolean;
			}

			export interface BuilderApi<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				has<UR = R, UC = C>(
					row: RelatedTo<R, UR>,
					column: RelatedTo<C, UC>,
				): boolean;
				hasRow<UR = R>(row: RelatedTo<R, UR>): boolean;
			}
		}

		/** Unconditional write of a cell value. */
		export namespace WithSetAt {
			export interface Api<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				set(row: R, column: C, value: V): Tp['_NON_EMPTY'];
			}

			export interface BuilderApi<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				set(row: R, column: C, value: V): boolean;
			}
		}

		/**
		 * Conditional write, mirroring `MapCollection.Capability.WithModifyAtKey`.
		 * Named `modify` (not `modifyAt`) for the reason given by `get`.
		 */
		export namespace WithModify {
			export interface Api<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				modify(row: R, column: C, options: ModifyOptions<V>): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				modify(row: R, column: C, options: ModifyOptions<V>): boolean;
			}
		}

		/** Read-modify-write of an existing cell, as a function of its value. */
		export namespace WithUpdate {
			export interface Api<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				update<UR = R, UC = C>(
					row: RelatedTo<R, UR>,
					column: RelatedTo<C, UC>,
					update: (value: V) => V,
				): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				update<UR = R, UC = C>(
					row: RelatedTo<R, UR>,
					column: RelatedTo<C, UC>,
					update: (value: V) => V,
				): V | undefined;
				update<UR, UC, O>(
					row: RelatedTo<R, UR>,
					column: RelatedTo<C, UC>,
					update: (value: V) => V,
					otherwise: OptLazy<O>,
				): V | O;
			}
		}

		/**
		 * Removal of a single cell.
		 *
		 * Returns nothing on the immutable collection, matching every other Rimbu
		 * `remove`. To learn the removed value, read it with `get` first. The
		 * builder's `remove` does return the value, because a mutable builder has
		 * no result collection to return and the information would otherwise be
		 * unrecoverable.
		 */
		export namespace WithRemoveAt {
			export interface Api<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				remove<UR = R, UC = C>(
					row: RelatedTo<R, UR>,
					column: RelatedTo<C, UC>,
				): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				remove<UR = R, UC = C>(
					row: RelatedTo<R, UR>,
					column: RelatedTo<C, UC>,
				): V | undefined;
				remove<UR, UC, O>(
					row: RelatedTo<R, UR>,
					column: RelatedTo<C, UC>,
					otherwise: OptLazy<O>,
				): V | O;
			}
		}

		/** Removal of whole rows. */
		export namespace WithRemoveRow {
			export interface Api<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				removeRow<UR = R>(row: RelatedTo<R, UR>): Tp['_NORMAL'];
				removeRows<UR = R>(rows: StreamSource<RelatedTo<R, UR>>): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				removeRow<UR = R>(row: RelatedTo<R, UR>): boolean;
				removeRows<UR = R>(rows: StreamSource<RelatedTo<R, UR>>): boolean;
			}
		}

		/**
		 * Removal of many cells at once.
		 *
		 * Named `removeEach` per the workspace-wide convention: a method that
		 * applies a per-element operation to every element of a source is
		 * suffixed `*Each`.
		 */
		export namespace WithRemoveEach {
			export interface Api<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				removeEach<UR = R, UC = C>(
					cells: StreamSource<readonly [RelatedTo<R, UR>, RelatedTo<C, UC>]>,
				): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				removeEach<UR = R, UC = C>(
					cells: StreamSource<readonly [RelatedTo<R, UR>, RelatedTo<C, UC>]>,
				): boolean;
			}
		}

		/**
		 * The row-shaped view of a table: `rowMap` is the internal storage made
		 * public, `getRow` reads one row, and `amountRows` counts them.
		 *
		 * The inner map is `MapCollection.NonEmpty` — and that is an *invariant*,
		 * not an approximation: a row is pruned the moment its last cell is
		 * removed, in every code path that can empty a row.
		 */
		export namespace WithRowMap {
			export interface Api<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				readonly rowMap: MapCollection<R, MapCollection.NonEmpty<C, V>>;
				/** the whole row at `row`, or an empty map if there is none */
				getRow<UR = R>(row: RelatedTo<R, UR>): MapCollection<C, V>;
				/** the number of rows that hold at least one cell */
				readonly amountRows: number;
				/**
				 * A stream of the row keys, in backing order.
				 *
				 * A row stream, **not** `Tp['_AS_STREAM']` (which would be a stream of
				 * *cells*). It is `Stream<R>` on the shared `Api` and narrowed to
				 * `Stream.NonEmpty<R>` by {@link TableCollection.Advanced.NonEmptyApi}
				 * — see that interface for why a conditional cannot do the job here.
				 */
				streamRows(): Stream<R>;
				/**
				 * A stream of the cell values, across every row.
				 *
				 * Note these are the **cell** values, one per occupied coordinate
				 * pair — not "the values of one column". A table has no column-side
				 * projection today (see `filterRows` for the row-side analogue).
				 */
				streamValues(): Stream<V>;
			}

			export interface BuilderApi<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				readonly amountRows: number;
				getRow<UR = R>(row: RelatedTo<R, UR>): MapCollection<C, V>;
			}
		}

		/**
		 * Value-level transformation.
		 *
		 * The callback receives the value **and both coordinates**, which is why
		 * this cannot be `KeyedCollection.Capability.WithMapValues` (that one is
		 * 2-arity: value and key) — a cell has two keys, not one.
		 *
		 * `V2` is bounded by `Tp['_UPPER_V']` so the operation refines the value
		 * type while leaving the row and column types alone, exactly as
		 * `HashMap.mapValues` does.
		 */
		export namespace WithMapValues {
			export interface Api<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				mapValues<V2 extends Tp['_UPPER_V']>(
					mapFun: (value: V, row: R, column: C) => V2,
				): Collection.Advanced.ReTyped<Tp, readonly [R, C, V2]>['_SELF'];
			}

			export interface BuilderApi<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				buildMapValues<V2 extends Tp['_UPPER_V']>(
					mapFun: (value: V, row: R, column: C) => V2,
				): Collection.Advanced.ReTyped<Tp, readonly [R, C, V2]>['_NORMAL'];
			}
		}

		/**
		 * Row-level filtering.
		 *
		 * The predicate receives the row key *and* the whole row, so it can decide
		 * on the row's contents rather than on cell values alone. Cells in rows
		 * that fail the predicate are dropped; rows that pass are kept whole.
		 */
		export namespace WithFilterRows {
			export interface Api<
				R,
				C,
				V,
				Tp extends TableCollection.Advanced.TypesRecord<
					R,
					C,
					V,
					TableCollection.Advanced.Family<R, C, V>
				>,
			> {
				filterRows<UR = R>(
					pred: (row: RelatedTo<R, UR>, rowMap: MapCollection<C, V>) => boolean,
					options: { negate: true },
				): Tp['_NORMAL'];
				filterRows<UR = R>(
					pred: (row: RelatedTo<R, UR>, rowMap: MapCollection<C, V>) => boolean,
					options?: { negate?: false | undefined } | undefined,
				): Tp['_NORMAL'];
			}
		}
	}
}
