/**
 * @packageDocumentation
 *
 * The `@rimbu/collection-types` package holds the shared higher-kinded type
 * (HKT) machinery every Rimbu collection is built on. It contains no
 * implementations — only the abstract capability families that describe what a
 * collection *can* do, plus the base classes and interfaces implementers
 * extend.
 *
 * ## The capability surface
 *
 * A collection's capabilities are described by a *family*: a record of type
 * slots (`_NORMAL`, `_NON_EMPTY`, `_BUILDER`, `_CONTEXT`, …) plus the API
 * interfaces for each individual capability.
 *
 * | Namespace | Describes |
 * |---|---|
 * | {@link Collection} | capabilities shared by every collection |
 * | {@link ValuedCollection} | element-keyed capabilities (`add`, `remove`, `union`, …) |
 * | {@link IndexedCollection} | positional access (`at`, `updateAt`, …) |
 * | {@link SortedCollection} | order-sensitive capabilities |
 * | {@link KeyedCollection} | key/entry-keyed capabilities |
 * | {@link MapCollection} | map-shaped collections (`set`, `get`, `mapValues`, …) |
 * | {@link SetCollection} | set-shaped collections |
 *
 * Each namespace's `Capability.*` member adds one capability at a time, and
 * `Advanced.Family` is the aggregate. To constrain a value to a subset of
 * capabilities, declare a **named** interface extending the aggregate — never
 * an ad-hoc intersection of individual `Capability.*` families. See the root
 * `AGENTS.md` §6.4 for why.
 *
 * ```ts
 * import type { SetCollection } from '@rimbu/collection-types/set';
 *
 * // A named family: a cached nominal symbol, and the aggregate supplies every
 * // slot. Intersecting the individual `Capability.*` families by hand instead
 * // loses `_BUILDER` / `_CONTEXT` / `_NORMAL` members and is far slower to
 * // resolve.
 * interface Capabilities extends SetCollection.Advanced.Family<number> {}
 *
 * declare const S: SetCollection.Context<Capabilities>;
 * S.empty<number>().add(1);
 * ```
 *
 * ## Sub-paths
 *
 * The public capability surface lives under the `public` sub-path:<br/>
 * - [`@rimbu/collection-types/collection`](./collection)<br/>
 * - [`@rimbu/collection-types/map`](./map)<br/>
 * - [`@rimbu/collection-types/set`](./set)<br/>
 * - [`@rimbu/collection-types/types`](./types)<br/>
 *
 * Implementer-facing base classes live under the `advanced` sub-path:<br/>
 * - [`@rimbu/collection-types/advanced/common`](./advanced/common)<br/>
 * - [`@rimbu/collection-types/advanced/common/empty-base`](./advanced/common/empty-base)<br/>
 *
 * The generic `RMap` / `RSet` / `VariantMap` / `VariantSet` type aliases that
 * previously made up this entry point have been **removed**. The capability
 * families above replace them: they describe the same operations without the
 * separate read-only/invariant split, and without a second "types" record to
 * keep in sync.
 *
 * See the [Rimbu docs Map page](https://rimbu.org/docs/collections/map) and
 * the [Rimbu docs Set page](https://rimbu.org/docs/collections/set) for more information.
 */

export type * from '@rimbu/collection-types/collection';
export type * from '@rimbu/collection-types/map';
export type * from '@rimbu/collection-types/set';
export type * from '@rimbu/collection-types/types';
