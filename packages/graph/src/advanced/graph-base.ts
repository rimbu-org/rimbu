import type { MapCollection } from '@rimbu/collection-types/map';
import type { SetCollection } from '@rimbu/collection-types/set';

/**
 * The storage families a graph is built from, and the capability suite that a
 * graph contributes on top of the generic {@link Collection} surface.
 *
 * ## Why a graph is not a keyed collection
 *
 * `KeyedCollection<K, V>` binds its element to `readonly [K, V]`
 * unconditionally. A graph's element is the **union** `GraphElement<N> = [N] |
 * Link<N>` — an isolated node is a 1-tuple, a connection is a 2-tuple — so
 * there is no single `[K, V]` to bind, and every keyed capability (`get(key)`,
 * `streamKeys`) would be guessing at which of the two shapes it addresses.
 * `ValuedCollection` and `IndexedCollection` are refused for the same reason:
 * the element is a union, and a graph has no positional order.
 *
 * A graph therefore gets the plain `Collection` contract and supplies its own
 * node/link vocabulary through `GraphCollection.Capability.*` (non-valued) and
 * `ValuedGraphCollection.Capability.*` (valued). See
 * `.scratch/graph-migration-plan.md` §2.3 for the full claim/refuse list.
 *
 * ## Storage typing — two HKT slots, derived
 *
 * A graph generalises over its backing collections **only** through the two
 * family slots below. The leaf variants pin those two slots, and every storage
 * member (`linkMap`, `linkConnections`, their contexts and builders) is
 * *derived* from them, so each fact is named once per variant rather than
 * seven times. See `.scratch/graph-migration-plan.md` §2.1.
 */
export declare namespace GraphCollection {
	export namespace Advanced {
		/**
		 * The family a graph's *outer* link map (node → that node's connections)
		 * is built from.
		 *
		 * A named interface, never an ad-hoc intersection of the individual
		 * `Capability.*` families: an intersection is not the aggregate family, so
		 * slots like `_BUILDER` resolve to an intersection of each capability's own
		 * `BuilderApi` and the aggregate-only members (`get`, `has`, `removeKey`, …)
		 * go missing. See root `AGENTS.md` §6.4.
		 */
		export interface LinkMapFamily<N, C>
			extends MapCollection.Advanced.Family<N, C> {}

		/**
		 * The family a **non-valued** graph's inner connection collections are
		 * built from: a set of target nodes.
		 */
		export interface LinkConnectionsFamily<N>
			extends SetCollection.Advanced.Family<N> {}

		/**
		 * The family a **valued** graph's inner connection collections are built
		 * from: a map from target node to connection value.
		 */
		export interface LinkValuesFamily<N, V>
			extends MapCollection.Advanced.Family<N, V> {}
	}
}
