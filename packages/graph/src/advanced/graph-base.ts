import type { ModifyOptions } from '@rimbu/collection-types/advanced/common';
import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { RelatedTo, ToJSON } from '@rimbu/common/types';
import type { GraphElement, Link } from '@rimbu/graph/link';
import type { ValuedGraphElement, ValuedLink } from '@rimbu/graph/valued-link';
import type { FastIterable, Stream, StreamSource } from '@rimbu/stream';

/**
 * The capability suite a {@link Graph} contributes on top of the generic
 * `Collection` surface, and its valued twin {@link ValuedGraphCollection}.
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
 * The same reasoning refuses the element-level transforms. `WithMap` /
 * `WithFlatMap` / `WithMapIndexed` / `WithFlatMapIndexed` / `WithRecompose`
 * would all re-type the element stream, but a node rename has to be applied to
 * **both** sides of every link, which is not `map`'s contract — and their
 * re-typing goes through `ReTyped`, which pivots on `_NEW_E` into a
 * `_NEW_FAMILY` that is keyed on the **node** type, so it cannot express the
 * result. `WithFilter` is refused twice over: the same `ReTyped` problem, plus
 * on an undirected graph each edge is stored twice, so keeping `[2, 3]` while
 * dropping `[3, 2]` yields a state no `connect`/`disconnect` can produce. See
 * `.scratch/graph-migration-plan.md` §2.3 for the full claim/refuse list.
 *
 * ## Storage typing — two HKT slots, derived
 *
 * A graph generalises over its backing collections **only** through the two
 * family slots ({@link GraphCollection.Advanced.FamilyBase._LINK_MAP_FAM} and
 * {@link GraphCollection.Advanced.FamilyBase._LINK_CONNECTIONS_FAM}). A leaf
 * variant pins the inner family and the outer map family's value type is
 * *derived* from it, so each fact is named once per variant. Every storage
 * member (`linkMap`, `linkConnections`, their contexts) reads off those slots.
 * See `.scratch/graph-migration-plan.md` §2.1.
 *
 * ## Two root families, no collapse
 *
 * The inner slot differs in *kind* between the two: a non-valued graph's
 * connections are a `SetCollection` of target nodes, a valued graph's are a
 * `MapCollection` from target node to connection value. No single family spans
 * both, so `GraphCollection` (non-valued) and `ValuedGraphCollection` (valued)
 * are separate roots, each with its own `Advanced` records and `Capability`
 * suite. Their node/link vocabularies are spelled separately because the link
 * type is `Link<N>` versus `ValuedLink<N, V>`.
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
		 * The types record a **shared** graph capability is written against.
		 *
		 * It carries the storage-family slots on top of the generic
		 * `Collection.Advanced.TypesBase`, because a capability such as
		 * `WithLinkMap` has to read `Tp['_LINK_MAP_FAM']['_NORMAL']` — and
		 * `TypesBase` has no such member. Both roots satisfy this record, so the
		 * node-level capabilities can be shared between them.
		 */
		export interface TypesBase extends Collection.Advanced.TypesBase {
			_N: unknown;
			_LINK_CONNECTIONS_FAM: Collection.Advanced.FamilyBase<any>;
			_LINK_MAP_FAM: Collection.Advanced.FamilyBase<any>;
		}

		/**
		 * The slot skeleton a non-valued graph family builds on.
		 *
		 * `_N`, `_NEW_N` and `_UPPER_N` are **independent** slots rather than
		 * projections of the packed element. `KeyedCollection.Advanced.FamilyBase`
		 * gets away with `_UPPER_K: this['_UPPER_E'][0]` only because its element is
		 * a 2-tuple; `GraphElement<N>` is a union of two tuple shapes, so there is
		 * nothing to index, and projecting would require pinning `_UPPER_E` /
		 * `_NEW_E` as concrete unions — which merges with TS2320 against
		 * `Collection.Advanced.Family`. Same reason, same remedy as
		 * `table-base.ts`.
		 */
		export interface FamilyBase<N>
			extends Collection.Advanced.FamilyBase<GraphElement<N>> {
			/** the node type, and the type a retyping operation produces */
			_N: N;
			_NEW_N: unknown;
			_UPPER_N: unknown;

			/** the family a node's connection set is built from */
			_LINK_CONNECTIONS_FAM: LinkConnectionsFamily<N>;
			/**
			 * The family the outer link map is built from. Its value type is derived
			 * from {@link FamilyBase._LINK_CONNECTIONS_FAM} so each fact is named
			 * once per variant rather than twice.
			 */
			_LINK_MAP_FAM: LinkMapFamily<
				this['_N'],
				this['_LINK_CONNECTIONS_FAM']['_NORMAL']
			>;

			_FAM: FamilyBase<N>;
			_NEW_FAMILY: FamilyBase<this['_NEW_N']>;
		}

		/**
		 * The aggregate non-valued graph family: {@link FamilyBase} with the four
		 * API slots pinned to the graph surface.
		 */
		export interface Family<N> extends FamilyBase<N> {
			_NORMAL: Api<N, this['_TYPES']>;
			_NON_EMPTY: NonEmptyApi<N, this['_TYPES_NON_EMPTY']>;
			_BUILDER: BuilderApi<N, this['_TYPES']>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_FAM: Family<N>;
			_NEW_FAMILY: Family<this['_NEW_N']>;
		}

		/**
		 * The types record a graph capability is written against.
		 *
		 * The bound is `FAM`, the **concrete** family, not `FamilyBase`. That is
		 * load-bearing: a capability bound to `FamilyBase` would read `_NORMAL` off
		 * a `FamilyBase._NEW_FAMILY`, whose `_NORMAL` is `unknown`.
		 */
		export type TypesRecord<
			N,
			FAM extends Family<N>,
		> = Collection.Advanced.Types<FAM, GraphElement<N>>;

		/**
		 * The shared graph surface — the members every graph family carries,
		 * valued or not. The valued suite extends this and adds the link-value
		 * vocabulary.
		 */
		export interface Api<N, Tp extends TypesRecord<N, Family<N>>>
			extends FastIterable<GraphElement<N>>,
				Collection.Capability.WithToBuilder.Api<GraphElement<N>, Tp>,
				GraphCollection.Capability.WithNodeSize.Api<N, Tp>,
				GraphCollection.Capability.WithLinkMap.Api<N, Tp>,
				GraphCollection.Capability.WithNodeStreams.Api<N, Tp>,
				GraphCollection.Capability.WithHasNode.Api<N, Tp> {
			readonly context: Tp['_CONTEXT'];
			readonly isEmpty: Tp['_isEmpty'];
			/**
			 * The number of **nodes** in the graph — identical to {@link nodeSize}.
			 *
			 * Note this is *not* `toArray().length`, which enumerates graph
			 * *elements* (isolated nodes plus links) and equals neither `size` nor
			 * {@link connectionSize}.
			 */
			readonly size: number;
			asNormal(): Tp['_NORMAL'];
			nonEmpty(): this is Tp['_NON_EMPTY'];
			assumeNonEmpty(): Tp['_NON_EMPTY'];

			stream(): Tp['_AS_STREAM'];
			forEach(f: (element: GraphElement<N>) => void): void;
			forEachIndexed(
				f: (element: GraphElement<N>, index: number, halt: () => void) => void,
				options?: { state?: TraverseState | undefined } | undefined,
			): void;
			toArray(): Tp['_AS_ARRAY'];
			toString(): string;
			toJSON(): ToJSON<[N, Link.Target<N>[]][]>;
		}

		/**
		 * The non-empty refinements of {@link Api}.
		 *
		 * A separate interface rather than a member-level conditional on
		 * `Tp['_IS_NON_EMPTY']`: a concrete family pins `_NORMAL` to the
		 * possibly-empty type and TypeScript then requires that pin to be
		 * assignable to the *unresolved* conditional, which it cannot be. Same
		 * shape `ValuedCollection` / `KeyedCollection` use.
		 */
		export interface NonEmptyApi<
			N,
			Tp extends Collection.Advanced.TypesNonEmpty<Family<N>, GraphElement<N>>,
		> extends Api<N, Tp> {
			readonly isEmpty: false;
			readonly linkMap: Tp['_LINK_MAP_FAM']['_NON_EMPTY'];

			stream(): Stream.NonEmpty<GraphElement<N>>;
			streamNodes(): Stream.NonEmpty<N>;
		}

		/**
		 * The non-valued graph builder API: the generic builder surface plus the
		 * node/link mutations.
		 */
		export interface BuilderApi<N, Tp extends TypesRecord<N, Family<N>>>
			extends Collection.Advanced.BuilderApi<GraphElement<N>, Tp>,
				GraphCollection.Capability.WithNodeSize.BuilderApi<N, Tp>,
				GraphCollection.Capability.WithHasNode.BuilderApi<N, Tp>,
				GraphCollection.Capability.WithAddNode.BuilderApi<N, Tp>,
				GraphCollection.Capability.WithRemoveNode.BuilderApi<N, Tp>,
				GraphCollection.Capability.WithConnect.BuilderApi<N, Tp>,
				GraphCollection.Capability.WithDisconnect.BuilderApi<N, Tp>,
				GraphCollection.Capability.WithRemoveUnconnectedNodes.BuilderApi<
					N,
					Tp
				> {
			/** Adds a single graph element: a node, or a connection. */
			addGraphElement(element: GraphElement<N>): boolean;
			/** Adds each graph element in `elements`. */
			addGraphElements(elements: StreamSource<GraphElement<N>>): boolean;
		}

		/**
		 * The non-valued graph context: the factory surface plus the storage
		 * contexts and the graph-instance constructors.
		 */
		export interface ContextApi<FAM extends FamilyBase<any>>
			extends Collection.Advanced.ContextApi<FAM>,
				Collection.Capability.WithReducer.ContextApi<FAM> {
			readonly typeTag: string;
			/** The context the internal link maps are created with. */
			readonly linkMapContext: MapCollection.Context<
				LinkMapFamily<FAM['_N'], LinkConnectionsFamily<FAM['_N']>['_NORMAL']>
			>;
			/** The context a node's connection sets are created with. */
			readonly linkConnectionsContext: SetCollection.Context<
				LinkConnectionsFamily<FAM['_N']>
			>;
			/** Whether the graphs this context creates are arrow (directed) graphs. */
			readonly isDirected: boolean;

			createNonEmpty<N extends FAM['_UPPER_N']>(
				linkMap: MapCollection.NonEmpty<
					N,
					SetCollection<N>,
					LinkMapFamily<N, LinkConnectionsFamily<N>['_NORMAL']>
				>,
				connectionSize: number,
			): Collection.Advanced.FamToTypes<FAM, GraphElement<N>>['_NON_EMPTY'];
			createBuilder<N extends FAM['_UPPER_N']>(
				source?: Collection.Advanced.FamToTypes<
					FAM,
					GraphElement<N>
				>['_NON_EMPTY'],
			): Collection.Advanced.FamToTypes<FAM, GraphElement<N>>['_BUILDER'];
			isNonEmptyInstance(value: unknown): boolean;

			/**
			 * Derives a sibling context that differs only in its backing. An omitted
			 * option inherits this context's own backing.
			 */
			createContext<N>(options?: {
				linkMapContext?:
					| MapCollection.Context<
							LinkMapFamily<N, LinkConnectionsFamily<N>['_NORMAL']>
					  >
					| undefined;
				linkConnectionsContext?:
					| SetCollection.Context<LinkConnectionsFamily<N>>
					| undefined;
			}): ContextApi<Family<N>>;
		}

		/** A builder over one node's connection set. */
		export type LinkConnectionsBuilder<N> =
			LinkConnectionsFamily<N>['_BUILDER'];
		/** A builder over the graph's outer link map. */
		export type LinkMapBuilder<N, C> = LinkMapFamily<N, C>['_BUILDER'];

		/**
		 * A node's connection set: the non-valued inner collection.
		 *
		 * The concrete family is passed as the `F` argument rather than left to
		 * the default. `ExtendFamily` is conditional (see
		 * `MapCollection.Advanced.ExtendFamily`), so passing it collapses to the
		 * single `Api` a concrete family and `Context.builder()` both produce —
		 * where the default would give the redundant `Api & Api` intersection.
		 */
		export type LinkConnectionsType<N> = SetCollection<
			N,
			LinkConnectionsFamily<N>
		>;
		/** The non-empty form of {@link LinkConnectionsType}. */
		export type LinkConnectionsTypeNonEmpty<N> = SetCollection.NonEmpty<
			N,
			LinkConnectionsFamily<N>
		>;

		/** The outer link map of a non-valued graph: node to connection set. */
		export type LinkMapType<N> = MapCollection<
			N,
			LinkConnectionsType<N>,
			LinkMapFamily<N, LinkConnectionsType<N>>
		>;
		/** The non-empty form of {@link LinkMapType}. */
		export type LinkMapTypeNonEmpty<N> = MapCollection.NonEmpty<
			N,
			LinkConnectionsType<N>,
			LinkMapFamily<N, LinkConnectionsType<N>>
		>;
	}

	export namespace Capability {
		/** Node and connection counts. */
		export namespace WithNodeSize {
			export interface Api<N, Tp extends GraphCollection.Advanced.TypesBase> {
				/** the number of nodes in the graph */
				readonly nodeSize: number;
				/** the number of connections in the graph */
				readonly connectionSize: number;
			}

			export interface BuilderApi<
				N,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				readonly nodeSize: number;
				readonly connectionSize: number;
			}
		}

		/**
		 * The nested map representation of the connections, made public.
		 *
		 * `linkMap` stays public: it is documented with a runnable `@example`, and
		 * demoting it to `MapCollection` would be a breaking narrowing of its
		 * per-variant concrete type.
		 */
		export namespace WithLinkMap {
			export interface Api<N, Tp extends GraphCollection.Advanced.TypesBase> {
				readonly linkMap: Tp['_LINK_MAP_FAM']['_NORMAL'];
			}
		}

		/** Streams over nodes, and over connections. */
		export namespace WithNodeStreams {
			export interface Api<N, Tp extends GraphCollection.Advanced.TypesBase> {
				streamNodes(): Stream<N>;
				streamConnections(): Stream<Link<N>>;
			}
		}

		/** Presence tests for a node and for a connection. */
		export namespace WithHasNode {
			export interface Api<N, Tp extends GraphCollection.Advanced.TypesBase> {
				hasNode<UN = N>(node: RelatedTo<N, UN>): boolean;
				hasConnection<UN = N>(
					node1: RelatedTo<N, UN>,
					node2: RelatedTo<N, UN>,
				): boolean;
			}

			export interface BuilderApi<
				N,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				hasNode<UN = N>(node: RelatedTo<N, UN>): boolean;
				hasConnection<UN = N>(
					node1: RelatedTo<N, UN>,
					node2: RelatedTo<N, UN>,
				): boolean;
			}
		}

		/**
		 * Adding nodes.
		 *
		 * Named `addNode`/`addNodes` rather than `addNodeEach`: the plural already
		 * conveys per-element application, and `Node` is the correct unit noun.
		 * This is a deliberate deviation from the `*Each` convention — recorded in
		 * `packages/graph/AGENTS.md` so it is not "fixed".
		 */
		export namespace WithAddNode {
			export interface Api<N, Tp extends GraphCollection.Advanced.TypesBase> {
				addNode(node: N): Tp['_NON_EMPTY'];
				addNodes(nodes: StreamSource.NonEmpty<N>): Tp['_NON_EMPTY'];
				addNodes(nodes: StreamSource<N>): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				N,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				addNode(node: N): boolean;
				addNodes(nodes: StreamSource<N>): boolean;
			}
		}

		/** Removing nodes, and any of their connections. */
		export namespace WithRemoveNode {
			export interface Api<N, Tp extends GraphCollection.Advanced.TypesBase> {
				removeNode<UN = N>(node: RelatedTo<N, UN>): Tp['_NORMAL'];
				removeNodes<UN = N>(
					nodes: StreamSource<RelatedTo<N, UN>>,
				): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				N,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				removeNode<UN = N>(node: RelatedTo<N, UN>): boolean;
				removeNodes<UN = N>(nodes: StreamSource<RelatedTo<N, UN>>): boolean;
			}
		}

		/**
		 * Adding connections.
		 *
		 * The bulk form is `connectEach` — never `connectEach`, which reads as
		 * "connect everything" (root `AGENTS.md` §1.1's `*All` ban).
		 */
		export namespace WithConnect {
			export interface Api<N, Tp extends GraphCollection.Advanced.TypesBase> {
				connect(node1: N, node2: N): Tp['_NON_EMPTY'];
				connectEach(
					connections: StreamSource.NonEmpty<Link<N>>,
				): Tp['_NON_EMPTY'];
				connectEach(connections: StreamSource<Link<N>>): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				N,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				connect(node1: N, node2: N): boolean;
				connectEach(connections: StreamSource<Link<N>>): boolean;
				/**
				 * Adds a connection only if both nodes already exist. Builder-only:
				 * the immutable form would be indistinguishable from `connect`.
				 */
				connectIfNodesExist(node1: N, node2: N): boolean;
			}
		}

		/** Removing connections. */
		export namespace WithDisconnect {
			export interface Api<N, Tp extends GraphCollection.Advanced.TypesBase> {
				disconnect<UN = N>(
					node1: RelatedTo<N, UN>,
					node2: RelatedTo<N, UN>,
				): Tp['_NORMAL'];
				disconnectEach<UN = N>(
					connections: StreamSource<Link<RelatedTo<N, UN>>>,
				): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				N,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				disconnect<UN = N>(
					node1: RelatedTo<N, UN>,
					node2: RelatedTo<N, UN>,
				): boolean;
				disconnectEach<UN = N>(
					connections: StreamSource<Link<RelatedTo<N, UN>>>,
				): boolean;
			}
		}

		/**
		 * Reading the connections of a node.
		 *
		 * Note the asymmetry: `getConnectionsFrom` returns the connection
		 * *collection*, while `getConnectionStreamTo` returns a stream of links,
		 * because on a directed graph the incoming side has to be scanned.
		 */
		export namespace WithConnectionsQuery {
			export interface Api<N, Tp extends GraphCollection.Advanced.TypesBase> {
				getConnectionsFrom<UN = N>(
					node1: RelatedTo<N, UN>,
				): Tp['_LINK_CONNECTIONS_FAM']['_NORMAL'];
				getConnectionStreamFrom<UN = N>(
					node1: RelatedTo<N, UN>,
				): Stream<Link<N>>;
				getConnectionStreamTo<UN = N>(node2: RelatedTo<N, UN>): Stream<Link<N>>;
			}
		}

		/** Dropping every node that has no connections. */
		export namespace WithRemoveUnconnectedNodes {
			export interface Api<N, Tp extends GraphCollection.Advanced.TypesBase> {
				removeUnconnectedNodes(): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				N,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				removeUnconnectedNodes(): boolean;
			}
		}

		/**
		 * Sink/source tests.
		 *
		 * Present on all four families — narrowing per directedness would add
		 * asymmetry for no gain. On an undirected graph both report whether the
		 * node is isolated (a node with connections is neither a sink nor a source
		 * when there is no direction to speak of).
		 */
		export namespace WithIsSinkSource {
			export interface Api<N, Tp extends GraphCollection.Advanced.TypesBase> {
				isSink<UN = N>(node: RelatedTo<N, UN>): boolean;
				isSource<UN = N>(node: RelatedTo<N, UN>): boolean;
			}
		}
	}
}

export declare namespace ValuedGraphCollection {
	export namespace Advanced {
		/**
		 * The family a **valued** graph's inner connection collections are built
		 * from: a map from target node to connection value.
		 */
		export interface LinkValuesFamily<N, V>
			extends MapCollection.Advanced.Family<N, V> {}

		/**
		 * The types record a valued graph capability is written against: the
		 * shared {@link GraphCollection.Advanced.TypesBase} plus the connection
		 * value slots, which `WithMapValues` needs in order to refine `V`.
		 */
		export interface TypesBase extends GraphCollection.Advanced.TypesBase {
			_V: unknown;
			_NEW_V: unknown;
			_UPPER_V: unknown;
		}

		/**
		 * The slot skeleton a valued graph family builds on. See
		 * {@link GraphCollection.Advanced.FamilyBase} for why `_N` / `_NEW_N` /
		 * `_UPPER_N` are independent slots.
		 */
		export interface FamilyBase<N, V>
			extends Collection.Advanced.FamilyBase<ValuedGraphElement<N, V>> {
			_N: N;
			_NEW_N: unknown;
			_UPPER_N: unknown;

			/** the connection value type, and the type a retyping operation produces */
			_V: V;
			_NEW_V: unknown;
			_UPPER_V: unknown;

			/** the family a node's connection map is built from */
			_LINK_CONNECTIONS_FAM: LinkValuesFamily<N, V>;
			/**
			 * The family the outer link map is built from. Its value type is derived
			 * from {@link FamilyBase._LINK_CONNECTIONS_FAM} so each fact is named
			 * once per variant rather than twice.
			 */
			_LINK_MAP_FAM: GraphCollection.Advanced.LinkMapFamily<
				this['_N'],
				this['_LINK_CONNECTIONS_FAM']['_NORMAL']
			>;

			_FAM: FamilyBase<N, V>;
			_NEW_FAMILY: FamilyBase<this['_NEW_N'], this['_NEW_V']>;
		}

		/** The aggregate valued graph family. */
		export interface Family<N, V> extends FamilyBase<N, V> {
			_NORMAL: Api<N, V, this['_TYPES']>;
			_NON_EMPTY: NonEmptyApi<N, V, this['_TYPES_NON_EMPTY']>;
			_BUILDER: BuilderApi<N, V, this['_TYPES']>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_FAM: Family<N, V>;
			_NEW_FAMILY: Family<this['_NEW_N'], this['_NEW_V']>;
		}

		/** The types record a valued graph capability is written against. */
		export type TypesRecord<
			N,
			V,
			FAM extends Family<N, V>,
		> = Collection.Advanced.Types<FAM, ValuedGraphElement<N, V>>;

		/** The shared valued graph surface, plus the link-value vocabulary. */
		export interface Api<N, V, Tp extends TypesRecord<N, V, Family<N, V>>>
			extends FastIterable<ValuedGraphElement<N, V>>,
				Collection.Capability.WithToBuilder.Api<ValuedGraphElement<N, V>, Tp>,
				GraphCollection.Capability.WithNodeSize.Api<N, Tp>,
				ValuedGraphCollection.Capability.WithLinkMap.Api<N, V, Tp>,
				ValuedGraphCollection.Capability.WithNodeStreams.Api<N, V, Tp>,
				GraphCollection.Capability.WithHasNode.Api<N, Tp>,
				ValuedGraphCollection.Capability.WithAddNode.Api<N, V, Tp>,
				GraphCollection.Capability.WithRemoveNode.Api<N, Tp>,
				ValuedGraphCollection.Capability.WithConnect.Api<N, V, Tp>,
				GraphCollection.Capability.WithDisconnect.Api<N, Tp>,
				ValuedGraphCollection.Capability.WithConnectionsQuery.Api<N, V, Tp>,
				GraphCollection.Capability.WithRemoveUnconnectedNodes.Api<N, Tp>,
				GraphCollection.Capability.WithIsSinkSource.Api<N, Tp>,
				ValuedGraphCollection.Capability.WithGetValue.Api<N, V, Tp>,
				ValuedGraphCollection.Capability.WithModifyAt.Api<N, V, Tp>,
				ValuedGraphCollection.Capability.WithMapValues.Api<N, V, Tp> {
			readonly context: Tp['_CONTEXT'];
			readonly isEmpty: Tp['_isEmpty'];
			/** the number of **nodes** — identical to `nodeSize`, not `toArray().length` */
			readonly size: number;
			asNormal(): Tp['_NORMAL'];
			nonEmpty(): this is Tp['_NON_EMPTY'];
			assumeNonEmpty(): Tp['_NON_EMPTY'];

			stream(): Tp['_AS_STREAM'];
			forEach(f: (element: ValuedGraphElement<N, V>) => void): void;
			forEachIndexed(
				f: (
					element: ValuedGraphElement<N, V>,
					index: number,
					halt: () => void,
				) => void,
				options?: { state?: TraverseState | undefined } | undefined,
			): void;
			toArray(): Tp['_AS_ARRAY'];
			toString(): string;
			toJSON(): ToJSON<[N, ValuedLink.Target<N, V>[]][]>;
		}

		/** The non-empty refinements of {@link Api}. */
		export interface NonEmptyApi<
			N,
			V,
			Tp extends Collection.Advanced.TypesNonEmpty<
				Family<N, V>,
				ValuedGraphElement<N, V>
			>,
		> extends Api<N, V, Tp> {
			readonly isEmpty: false;
			readonly linkMap: Tp['_LINK_MAP_FAM']['_NON_EMPTY'];

			stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
			streamNodes(): Stream.NonEmpty<N>;
		}

		/** The valued graph builder API. */
		export interface BuilderApi<
			N,
			V,
			Tp extends TypesRecord<N, V, Family<N, V>>,
		> extends Collection.Advanced.BuilderApi<ValuedGraphElement<N, V>, Tp>,
				GraphCollection.Capability.WithNodeSize.BuilderApi<N, Tp>,
				GraphCollection.Capability.WithHasNode.BuilderApi<N, Tp>,
				GraphCollection.Capability.WithRemoveNode.BuilderApi<N, Tp>,
				GraphCollection.Capability.WithDisconnect.BuilderApi<N, Tp>,
				GraphCollection.Capability.WithRemoveUnconnectedNodes.BuilderApi<N, Tp>,
				ValuedGraphCollection.Capability.WithAddNode.BuilderApi<N, V, Tp>,
				ValuedGraphCollection.Capability.WithConnect.BuilderApi<N, V, Tp>,
				ValuedGraphCollection.Capability.WithGetValue.BuilderApi<N, V, Tp>,
				ValuedGraphCollection.Capability.WithModifyAt.BuilderApi<N, V, Tp> {
			/** Adds a single graph element: a node, or a valued connection. */
			addGraphElement(element: ValuedGraphElement<N, V>): boolean;
			/** Adds each graph element in `elements`. */
			addGraphElements(
				elements: StreamSource<ValuedGraphElement<N, V>>,
			): boolean;
			/** Builder-only value transform; see `WithMapValues`. */
			buildMapValues<V2 extends Tp['_UPPER_V']>(
				mapFun: (value: V, node1: N, node2: N) => V2,
			): Collection.Advanced.ReTyped<Tp, ValuedGraphElement<N, V2>>['_NORMAL'];
		}

		/** The valued graph context. */
		export interface ContextApi<FAM extends FamilyBase<any, any>>
			extends Collection.Advanced.ContextApi<FAM>,
				Collection.Capability.WithReducer.ContextApi<FAM> {
			readonly typeTag: string;
			/** The context the internal link maps are created with. */
			readonly linkMapContext: MapCollection.Context<
				GraphCollection.Advanced.LinkMapFamily<
					FAM['_N'],
					LinkValuesFamily<FAM['_N'], FAM['_V']>
				>
			>;
			/** The context a node's connection maps are created with. */
			readonly linkConnectionsContext: MapCollection.Context<
				LinkValuesFamily<FAM['_N'], FAM['_V']>
			>;
			/** Whether the graphs this context creates are arrow (directed) graphs. */
			readonly isDirected: boolean;

			createNonEmpty<N extends FAM['_UPPER_N'], V extends FAM['_UPPER_V']>(
				linkMap: MapCollection.NonEmpty<N, MapCollection<N, V>>,
				connectionSize: number,
			): Collection.Advanced.FamToTypes<
				FAM,
				ValuedGraphElement<N, V>
			>['_NON_EMPTY'];
			createBuilder<N extends FAM['_UPPER_N'], V extends FAM['_UPPER_V']>(
				source?: Collection.Advanced.FamToTypes<
					FAM,
					ValuedGraphElement<N, V>
				>['_NON_EMPTY'],
			): Collection.Advanced.FamToTypes<
				FAM,
				ValuedGraphElement<N, V>
			>['_BUILDER'];
			isNonEmptyInstance(value: unknown): boolean;

			/**
			 * Derives a sibling context that differs only in its backing. An omitted
			 * option inherits this context's own backing.
			 */
			createContext<N, V>(options?: {
				linkMapContext?:
					| MapCollection.Context<
							GraphCollection.Advanced.LinkMapFamily<
								N,
								LinkValuesFamily<N, V>['_NORMAL']
							>
					  >
					| undefined;
				linkConnectionsContext?:
					| MapCollection.Context<LinkValuesFamily<N, V>>
					| undefined;
			}): ContextApi<Family<N, V>>;
		}
	}

	export namespace Capability {
		/**
		 * The nested map representation of the valued connections, made public.
		 * See {@link GraphCollection.Capability.WithLinkMap}.
		 */
		export namespace WithLinkMap {
			export interface Api<
				N,
				V,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				readonly linkMap: Tp['_LINK_MAP_FAM']['_NORMAL'];
			}
		}

		/** Streams over nodes, and over valued connections. */
		export namespace WithNodeStreams {
			export interface Api<
				N,
				V,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				streamNodes(): Stream<N>;
				streamConnections(): Stream<ValuedLink<N, V>>;
			}
		}

		/**
		 * Adding nodes and valued connections. See
		 * {@link GraphCollection.Capability.WithAddNode} for the `addNodes` naming
		 * deviation.
		 */
		export namespace WithAddNode {
			export interface Api<
				N,
				V,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				addNode(node: N): Tp['_NON_EMPTY'];
				addNodes(nodes: StreamSource.NonEmpty<N>): Tp['_NON_EMPTY'];
				addNodes(nodes: StreamSource<N>): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				N,
				V,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				addNode(node: N): boolean;
				addNodes(nodes: StreamSource<N>): boolean;
			}
		}

		/**
		 * Adding valued connections. The bulk form is `connectEach` — see
		 * {@link GraphCollection.Capability.WithConnect}.
		 */
		export namespace WithConnect {
			export interface Api<
				N,
				V,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				connect(node1: N, node2: N, value: V): Tp['_NON_EMPTY'];
				connectEach(
					connections: StreamSource.NonEmpty<ValuedLink<N, V>>,
				): Tp['_NON_EMPTY'];
				connectEach(connections: StreamSource<ValuedLink<N, V>>): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				N,
				V,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				connect(node1: N, node2: N, value: V): boolean;
				connectEach(connections: StreamSource<ValuedLink<N, V>>): boolean;
			}
		}

		/** Reading the valued connections of a node. */
		export namespace WithConnectionsQuery {
			export interface Api<
				N,
				V,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				getConnectionsFrom<UN = N>(
					node1: RelatedTo<N, UN>,
				): Tp['_LINK_CONNECTIONS_FAM']['_NORMAL'];
				getConnectionStreamFrom<UN = N>(
					node1: RelatedTo<N, UN>,
				): Stream<ValuedLink<N, V>>;
				getConnectionStreamTo<UN = N>(
					node2: RelatedTo<N, UN>,
				): Stream<ValuedLink<N, V>>;
			}
		}

		/** Reading the value of a single connection. */
		export namespace WithGetValue {
			export interface Api<
				N,
				V,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				getValue<UN = N>(
					node1: RelatedTo<N, UN>,
					node2: RelatedTo<N, UN>,
				): V | undefined;
				getValue<UN, O>(
					node1: RelatedTo<N, UN>,
					node2: RelatedTo<N, UN>,
					otherwise: OptLazy<O>,
				): V | O;
			}

			export interface BuilderApi<
				N,
				V,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				getValue<UN = N>(
					node1: RelatedTo<N, UN>,
					node2: RelatedTo<N, UN>,
				): V | undefined;
				getValue<UN, O>(
					node1: RelatedTo<N, UN>,
					node2: RelatedTo<N, UN>,
					otherwise: OptLazy<O>,
				): V | O;
			}
		}

		/**
		 * Conditional write of a connection's value, mirroring
		 * `MapCollection.Capability.WithModifyAtKey`.
		 *
		 * Named `modifyAt`, not `modifyAtKey`: the key of a connection is the
		 * **pair** of nodes, so there is no single key to name. This is a
		 * deliberate deviation from the map naming — recorded in
		 * `packages/graph/AGENTS.md`.
		 */
		export namespace WithModifyAt {
			export interface Api<
				N,
				V,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				modifyAt(node1: N, node2: N, options: ModifyOptions<V>): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				N,
				V,
				Tp extends GraphCollection.Advanced.TypesBase,
			> {
				modifyAt(node1: N, node2: N, options: ModifyOptions<V>): boolean;
			}
		}

		/**
		 * Value-level transformation.
		 *
		 * The callback receives the value **and both nodes**, so this cannot be
		 * `KeyedCollection.Capability.WithMapValues` (2-arity: value and key) — a
		 * connection has two nodes, not one key.
		 */
		export namespace WithMapValues {
			export interface Api<
				N,
				V,
				Tp extends ValuedGraphCollection.Advanced.TypesBase,
			> {
				mapValues<V2 extends Tp['_UPPER_V']>(
					mapFun: (value: V, node1: N, node2: N) => V2,
				): Collection.Advanced.ReTyped<
					Tp,
					ValuedGraphElement<N, V2>
				>['_NORMAL'];
			}
		}
	}
}
