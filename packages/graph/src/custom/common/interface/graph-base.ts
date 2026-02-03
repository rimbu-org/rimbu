import type { RMap, RSet } from '@rimbu/collection-types';
import type { ArrayNonEmpty, RelatedTo, TraverseState } from '@rimbu/common';
import type { Reducer, Stream, StreamSource, Streamable } from '@rimbu/stream';

import type { GraphElement, Link } from '../../common/index.mjs';
import type {
  GraphConnect,
  GraphConnectNonEmpty,
  VariantGraphBase,
  WithGraphValues,
} from '../index.mjs';

export interface GraphBase<N, Tp extends GraphBase.Types = GraphBase.Types>
  extends VariantGraphBase<N, unknown, Tp>,
    GraphConnect<N, unknown, Tp> {
  /**
   * Returns the nested Map representation of the graph connections.
   * @example
   * ```ts
   * ArrowGraphHashed.of([1, 2], [2, 3]).linkMap.toArray()
   * // => [1 -> HashSet(2), 2 -> HashSet(3)]]
   * ```
   */
  readonly linkMap: WithGraphValues<Tp, N, unknown>['linkMap'];
  /**
   * Returns the `context` associated to this collection instance.
   */
  readonly context: WithGraphValues<Tp, N, unknown>['context'];
  /**
   * Returns a Set containing the nodes reachable from given `node1` node as keys,
   * and their corresponding values.
   * @param node1 - the node from which to find the connections
   * @example
   * ```ts
   * const g = ArrowGraphHashed.of([1, 2], [2, 3])
   * g.getConnectionsFrom(1)  // => HashSet(2)
   * g.getConnectionsFrom(3)  // => HashSet()
   * ```
   */
  getConnectionsFrom<UN = N>(
    node1: RelatedTo<N, UN>
  ): WithGraphValues<Tp, N, unknown>['linkConnections'];
  /**
   * Returns the graph where given nodes `node1` and `node2` are connected.
   * @param node1 - the first node
   * @param node2 - the second node
   * @example
   * ```ts
   * const g = ArrowGraphHashed.of([1, 2], [2, 3])
   * g.connect(3, 1).stream().toArray()
   * // => [[1, 2], [2, 3], [3, 1]]
   * ```
   */
  connect(node1: N, node2: N): WithGraphValues<Tp, N, unknown>['nonEmpty'];
  /**
   * Returns a builder object containing the entries of this collection.
   * @example
   * ```ts
   * const builder: ArrowGraphHashed.Builder<number> = ArrowGraphHashed.of([1, 2], [2, 3]).toBuilder()
   * ```
   */
  toBuilder(): WithGraphValues<Tp, N, unknown>['builder'];
}

export namespace GraphBase {
  export interface NonEmpty<N, Tp extends GraphBase.Types = GraphBase.Types>
    extends VariantGraphBase.NonEmpty<N, unknown, Tp>,
      Omit<
        GraphConnectNonEmpty<N, unknown, Tp>,
        keyof VariantGraphBase.NonEmpty<any, any, any>
      >,
      Omit<
        GraphBase<N, Tp>,
        | keyof VariantGraphBase.NonEmpty<any, any, any>
        | keyof GraphConnectNonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<GraphElement<N>> {
    /**
     * Returns the nested non-empty Map representation of the graph connections.
     * @example
     * ```ts
     * ArrowGraphHashed.of([1, 2], [2, 3]).linkMap.toArray()
     * // => [1 -> HashSet(2), 2 -> HashSet(3)]]
     * ```
     */
    readonly linkMap: WithGraphValues<Tp, N, unknown>['linkMapNonEmpty'];
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 2-valued tuples of nodes for connections.
     * @example
     * ```ts
     * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
     * ```
     */
    stream(): Stream.NonEmpty<GraphElement<N>>;
  }

  export interface Builder<N, Tp extends GraphBase.Types = GraphBase.Types> {
    /**
     * Returns the `context` associated to this collection instance.
     */
    readonly context: WithGraphValues<Tp, N, unknown>['context'];
    /**
     * Returns true if there are no entries in the builder.
     * @example
     * ```ts
     * ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     *  .isEmpty
     * // => false
     * ```
     */
    readonly isEmpty: boolean;
    /**
     * Returns the amount of nodes in the graph.
     * @example
     * ```ts
     * ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     *  .nodeSize
     * // => 3
     * ```
     */
    readonly nodeSize: number;
    /**
     * Returns the amount of connections in the graph.
     * @example
     * ```ts
     * ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     *  .connectionsSize
     * // => 2
     * ```
     */
    readonly connectionSize: number;
    /**
     * Returns true if the graph contains the given `node`.
     * @param node - the node to search
     * @example
     * ```ts
     * const b = ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     * b.hasNode(1)   // => true
     * b.hasNode(6)   // => false
     * ```
     */
    hasNode<UN = N>(node: RelatedTo<N, UN>): boolean;
    /**
     * Returns true if the graph has a connection between given nodes `node1` and `node2`.
     * @param node1 - the first connection node
     * @param node2 - the second connection node
     * @example
     * ```ts
     * const b = ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     * b.hasConnection(1, 2)   // => true
     * b.hasConnection(6, 7)   // => false
     * ```
     */
    hasConnection<UN = N>(
      node1: RelatedTo<N, UN>,
      node2: RelatedTo<N, UN>
    ): boolean;
    /**
     * Adds the given `node` to the graph.
     * @param node - the node to add
     * @returns true if the node was not already present
     * @example
     * ```ts
     * const b = ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     * b.addNode(6)   // => true
     * b.addNode(1)   // => false
     * ```
     */
    addNode(node: N): boolean;
    /**
     * Adds the given `nodes` to the builder.
     * @param nodes - a `StreamSource` containing the nodes to add
     * @returns true if any of the nodes was not yet present
     * @example
     * ```ts
     * const b = ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     * b.addNodes([3, 4, 5]) // => true
     * b.addNodes([1, 2])    // => false
     * ```
     */
    addNodes(nodes: StreamSource<N>): boolean;
    /**
     * Adds the given `element` graph element to the builder, where a graph element
     * is either a one-element tuple containing a node, or a two-element tuple containing
     * two nodes indicating a connection.
     * @param element - the graph element to add
     * @returns true if the builder has changed
     * @example
     * ```ts
     * const b = ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     * b.addGraphElement([1])  // => false
     * b.addGraphElement([4])  // => true
     * b.addGraphElement([2, 3])  // => false
     * b.addGraphElement([4, 1])  // => true
     * ```
     */
    addGraphElement(element: GraphElement<N>): boolean;
    /**
     * Adds the graph elements in the given `elements` StreamSource to the graph.
     * @param elements - a `StreamSource` containing elements that represent either a single node or a valued connection
     * @returns true if the graph has changed
     * @example
     * ```ts
     * const b = ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     * b.addGraphElements([[4], [5]])      // => true
     * b.addGraphElements([[3, 1], [1]])  // => true
     * b.addGraphElements([[1, 2], [1]])  // => false
     * ```
     */
    addGraphElements(elements: StreamSource<GraphElement<N>>): boolean;
    /**
     * Removes the given `node`, and any of its connections, from the graph.
     * @param node - the node to remove
     * @returns true if the node was present
     * @example
     * ```ts
     * const b = ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     * b.removeNode(1)  // => true
     * b.removeNode(6)  // => false
     * ```
     */
    removeNode<UN = N>(node: RelatedTo<N, UN>): boolean;
    /**
     * Removes the given `nodes`, and any of their connections, from the graph.
     * @param nodes - a `StreamSource` containing the nodes to remove
     * @returns true if any of the nodes were present
     * @example
     * ```ts
     * const b = ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     * b.removeNodes([1, 6, 7])  // => true
     * b.removeNodes([6, 7])     // => false
     * ```
     */
    removeNodes<UN = N>(nodes: StreamSource<RelatedTo<N, UN>>): boolean;
    /**
     * Adds a connection between `node1` and `node2` to the graph.
     * @param node1 - the first connection node
     * @param node2 - the second connection node
     * @returns true if the connection did not exist
     * @example
     * ```ts
     * const b = ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     * b.connect(3, 1)  // => true
     * b.connect(1, 2)  // => false
     * ```
     */
    connect(node1: N, node2: N): boolean;
    /**
     * Adds the connections in given `connections` `StreamSource` to the graph.
     * @param connections - a `StreamSource` containing the connection definitions to add
     * @returns true if any of the connections changed the collection
     * @example
     * ```ts
     * const b = ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     * b.connectAll([[1, 2], [3, 1]])   // => true
     * b.connectAll([[1, 2]])           // => false
     * ```
     */
    connectAll(
      connections: StreamSource<WithGraphValues<Tp, N, unknown>['link']>
    ): boolean;
    /**
     * Adds a connection between given `node1` and `node2` nodes only if both
     * nodes exist in the graph.
     * @returns true if the graph has changed
     * @example
     * ```ts
     * const b = ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     * b.connectIfNodesExist(3, 1)   // => true
     * b.connectIfNodesExist(3, 4)   // => false
     * ```
     */
    connectIfNodesExist(node1: N, node2: N): boolean;
    /**
     * Removes the connection between given `node1` and `node2` if the connection was present.
     * @param node1 - the first connection node
     * @param node2 - the second connection node
     * @returns true if the collection changed
     * @example
     * ```ts
     * const b = ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     * b.disconnect(1, 2)  // => true
     * b.disconnect(3, 4)  // => false
     * ```
     */
    disconnect<UN = N>(
      node1: RelatedTo<N, UN>,
      node2: RelatedTo<N, UN>
    ): boolean;
    /**
     * Removes all connections from the given `connections` `StreamSource` from the graph.
     * @param connections - a `StreamSource` containing the tuples defining the nodes of the connections to remove
     * @returns true if the collection changed
     * @example
     * ```ts
     * const b = ArrowGraphHashed
     *  .of([[1, 2], [2, 3]])
     *  .toBuilder()
     * b.disconnectAll([[1, 2], [3, 4]])  // => true
     * b.disconnectAll([[3, 4], [5, 6]])  // => false
     * ```
     */
    disconnectAll<UN = N>(
      connections: StreamSource<Link<RelatedTo<N, UN>>>
    ): boolean;
    /**
     * Performs given function `f` for each entry of the collection, using given `state` as initial traversal state.
     * @param f - the function to perform for each entry, receiving:<br/>
     * - `entry`: the next graph element<br/>
     * - `index`: the index of the element<br/>
     * - `halt`: a function that, if called, ensures that no new elements are passed
     * @param options - object containing the following<br/>
     * - state: (optional) the traverse state
     * @example
     * ```ts
     * const b = ArrowGraphHashed.of([1], [2, 3], [4]).toBuilder();
     * b.forEach((entry, i, halt) => {
     *   console.log([entry]);
     *   if (i >= 1) halt();
     * })
     * // => logs [1]  [2, 3]
     * ```
     * @note O(N)
     */
    forEach(
      f: (
        entry: [N] | WithGraphValues<Tp, N, unknown>['link'],
        index: number,
        halt: () => void
      ) => void,
      options?: { state?: TraverseState }
    ): void;
    /**
     * Returns an immutable Graph containing the links in this Builder instance.
     * @example
     * ```ts
     * const b = ArrowGraphHashed.builder<number, number>()
     * b.connect(1, 2)
     * b.addNode(3)
     * const g = b.build()
     * console.log(g.toArray())
     * // => [[1, 2], [3]]
     * ```
     */
    build(): WithGraphValues<Tp, N, unknown>['normal'];
  }

  export interface Factory<Tp extends GraphBase.Types, UN = unknown> {
    /**
     * Returns the (singleton) empty instance of this type and context with given key and value types.
     * @example
     * ```ts
     * ArrowGraphHashed.empty<number>()    // => ArrowGraphHashed<number>
     * ArrowGraphHashed.empty<string>()    // => ArrowGraphHashed<string>
     * ```
     */
    empty<N extends UN>(): WithGraphValues<Tp, N, unknown>['normal'];
    /**
     * Returns an immutable valued Graph instance containing the graph elements from the given
     * `graphElements`.
     * @param graphElements - a non-empty array of graph elements that are either a single tuple containing a node, or a triplet containing
     * two connection nodes and the connection value.
     * @example
     * ```ts
     * ArrowGraphHashed.of([1], [2], [3, 4]) // => ArrowGraphHashed.NonEmpty<number>
     * ```
     */
    of<N extends UN>(
      ...graphElements: ArrayNonEmpty<GraphElement<N>>
    ): WithGraphValues<Tp, N, unknown>['nonEmpty'];
    /**
     * Returns an immutable valued Graph, containing the graph elements from each of the
     * given `sources`.
     * @param sources - an array of `StreamSource` instances containing graph elements to add
     * @example
     * ```ts
     * ArrowGraphHashed.from([[1], [2]], [[3, 4]])  // => ArrowGraphHashed.NonEmpty<number>
     * ```
     */
    from<N extends UN>(
      ...sources: ArrayNonEmpty<StreamSource.NonEmpty<GraphElement<N>>>
    ): WithGraphValues<Tp, N, unknown>['nonEmpty'];
    from<N extends UN>(
      ...sources: ArrayNonEmpty<StreamSource<GraphElement<N>>>
    ): WithGraphValues<Tp, N, unknown>['normal'];
    /**
     * Returns an empty builder instance.
     * @example
     * ```ts
     * ArrowValuedGraphHashed.builder<number, string>()    // => ArrowValuedGraphHashed.Builder<number, string>
     * ```
     */
    builder<N extends UN>(): WithGraphValues<Tp, N, unknown>['builder'];
    /**
     * Returns a `Reducer` that adds received graph elements to a Graph and returns the Graph as a result. When a `source` is given,
     * the reducer will first create a graph from the source, and then add graph elements to it.
     * @param source - (optional) an initial source of graph elements to add to
     * @example
     * ```ts
     * const someSource: GraphElement<number>[] = [[1, 2], [3], [5]];
     * const result = Stream.of([1, 3], [4, 3]).reduce(ArrowGraphSorted.reducer(someSource))
     * result.toArray()   // => [[1, 2], [1, 3], [4, 3], [5]]
     * ```
     * @note uses a builder under the hood. If the given `source` is a Graph in the same context, it will directly call `.toBuilder()`.
     */
    reducer<N extends UN>(
      source?: StreamSource.NonEmpty<GraphElement<N>>
    ): Reducer<GraphElement<N>, WithGraphValues<Tp, N, unknown>['normal']>;
  }

  export interface Context<UN, Tp extends GraphBase.Types = GraphBase.Types>
    extends Factory<Tp, UN> {
    readonly _fixedType: UN;

    /**
     * A string tag defining the specific collection type
     * @example
     * ```ts
     * ArrowGraphHashed.defaultContext().typeTag   // => 'ArrowGraphHashed'
     * ```
     */
    readonly typeTag: string;
    /**
     * The `context` instance used to create internal link maps
     */
    readonly linkMapContext: WithGraphValues<Tp, UN, unknown>['linkMapContext'];
    /**
     * The `context` instance used to create internal connection collections
     */
    readonly linkConnectionsContext: WithGraphValues<
      Tp,
      UN,
      unknown
    >['linkConnectionsContext'];

    /**
     * Returns true if the graphs created by this context are arrow (directed) graphs.
     */
    readonly isDirected: boolean;
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends VariantGraphBase.Types {
    readonly normal: GraphBase<this['_N']>;
    readonly nonEmpty: GraphBase.NonEmpty<this['_N']>;
    readonly context: GraphBase.Context<this['_N']>;
    readonly builder: GraphBase.Builder<this['_N']>;
    readonly linkMap: RMap<this['_N'], RSet<this['_N']>>;
    readonly linkMapNonEmpty: RMap.NonEmpty<this['_N'], RSet<this['_N']>>;
    readonly linkMapContext: RMap.Context<this['_N']>;
    readonly linkConnectionsContext: RSet.Context<this['_N']>;
    readonly linkMapBuilder: RMap.Builder<this['_N'], RSet.Builder<this['_N']>>;
    readonly linkConnectionsBuilder: RSet.Builder<this['_N']>;
    readonly linkConnections: RSet<this['_N']>;
  }
}
