import type { Token } from '@rimbu/base';
import type { RMap } from '@rimbu/collection-types';
import type {
  ArrayNonEmpty,
  OptLazy,
  OptLazyOr,
  RelatedTo,
} from '@rimbu/common';
import type { Reducer, Stream, StreamSource, Streamable } from '@rimbu/stream';

import type { VariantValuedGraphBase } from '@rimbu/graph/custom';
import type {
  GraphConnect,
  GraphConnectNonEmpty,
  Link,
  ValuedGraphElement,
  VariantGraphBase,
  WithGraphValues,
} from '../../../common/index.mjs';

export interface ValuedGraphBase<
  N,
  V,
  Tp extends ValuedGraphBase.Types = ValuedGraphBase.Types,
> extends VariantValuedGraphBase<N, V, Tp>,
    GraphConnect<N, V, Tp> {
  /**
   * Returns the `context` associated to this collection instance.
   */
  readonly context: WithGraphValues<Tp, N, V>['context'];
  /**
   * Returns a Map containing the nodes and connection values reachable from given `node1` node as keys,
   * and their corresponding values.
   * @param node1 - the node from which to find the connections
   * @example
   * ```ts
   * const g = ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b'])
   * g.getConnectionsFrom(1)  // => HashMap(2 -> 'a')
   * g.getConnectionsFrom(3)  // => HashMap()
   * ```
   */
  getConnectionsFrom<UN = N>(
    node1: RelatedTo<N, UN>
  ): WithGraphValues<Tp, N, V>['linkConnections'];
  /**
   * Returns the graph where given nodes `node1` and `node2` are connected with
   * the given `value`.
   * @param node1 - the first node
   * @param node2 - the second node
   * @param value - the connection value
   * @example
   * ```ts
   * const g = ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b'])
   * g.connect(3, 1, 'c').stream().toArray()
   * // => [[1, 2, 'a'], [2, 3, 'b'], [3, 1, 'c']]
   * ```
   */
  connect(node1: N, node2: N, value: V): WithGraphValues<Tp, N, V>['nonEmpty'];
  /**
   * Returns the graph with the connection between given `node1` and `node2` modified according to given `options`.
   * @param node1 - the first connection node
   * @param node2 - the second connection node
   * @param options - an object containing the following information:<br/>
   * - ifNew: (optional) if the given connection is not present in the collection, this value or function will be used
   * to generate a new connection. If a function returning the token argument is given, no new entry is created.<br/>
   * - ifExists: (optional) if a value is associated with given connection, this function is called with the given value
   * to return a new value. As a second argument, a `remove` token is given. If the function returns this token, the current
   * connection is removed.
   * @example
   * ```ts
   * const g = ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b'])
   * g.modifyAt(3, 4, { ifNew: 'c' }).toArray()
   * // => [[1, 2, 'a'], [2, 3, 'b'], [3, 4, 'c']]
   * g.modifyAt(3, 4, { ifNew: (none) => 1 < 2 ? none : 'c' }).toArray()
   * // => [[1, 2, 'a'], [2, 3, 'b']]
   * g.modifyAt(1, 2, { ifExists: () => 'c' }).toArray()
   * // => [[1, 2, 'c'], [2, 3, 'b']]
   * g.modifyAt(1, 2, { ifExists: (v) => v + 'z' }).toArray()
   * // => [[1, 2, 'az'], [2, 3, 'b']]
   * g.modifyAt(2, 3, { ifExists: (v, remove) => v === 'a' ? v : remove }).toArray()
   * // => [[1, 2, 'a']]
   * ```
   */
  modifyAt(
    node1: N,
    node2: N,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: ((value: V, remove: Token) => V | Token) | V;
    }
  ): WithGraphValues<Tp, N, V>['normal'];
  /**
   * Returns a builder object containing the entries of this collection.
   * @example
   * ```ts
   * const builder: ArrowValuedGraphHashed.Builder<number, string> = ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).toBuilder()
   * ```
   */
  toBuilder(): WithGraphValues<Tp, N, V>['builder'];
}

export namespace ValuedGraphBase {
  export interface NonEmpty<
    N,
    V,
    Tp extends ValuedGraphBase.Types = ValuedGraphBase.Types,
  > extends VariantValuedGraphBase.NonEmpty<N, V, Tp>,
      Omit<
        GraphConnectNonEmpty<N, V, Tp>,
        keyof VariantValuedGraphBase.NonEmpty<any, any, any>
      >,
      Omit<
        ValuedGraphBase<N, V, Tp>,
        | keyof VariantValuedGraphBase.NonEmpty<any, any, any>
        | keyof GraphConnectNonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<ValuedGraphElement<N, V>> {
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 3-valued tuples containing the source node, target node, and connection value for connections.
     * @example
     * ```ts
     * ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
     * // => [[1, 2, 'a'], [2, 3, 'b']]
     * ```
     */
    stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
  }

  export interface Builder<
    N,
    V,
    Tp extends ValuedGraphBase.Types = ValuedGraphBase.Types,
  > {
    /**
     * Returns the `context` associated to this collection instance.
     */
    readonly context: WithGraphValues<Tp, N, V>['context'];
    /**
     * Returns true if there are no entries in the builder.
     * @example
     * ```ts
     * ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
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
     * ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
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
     * ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
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
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
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
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
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
     * Returns the value associated with the connection between `node1` and `node2`, or given `otherwise` value if the key is not in the collection.
     * @param node1 - the first connection node
     * @param node2 - the second connection node
     * @param otherwise - (default: undefined) the fallback value to return if the connection is not present
     * @example
     * ```ts
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
     *  .toBuilder()
     * m.getValue(2, 3)          // => 'b'
     * m.getValue(3, 4)          // => undefined
     * m.getValue(2, 3, 'none')  // => 'b'
     * m.getValue(3, 4, 'none')  // => 'none'
     * ```
     */
    getValue<UN = N>(
      node1: RelatedTo<N, UN>,
      node2: RelatedTo<N, UN>
    ): V | undefined;
    getValue<UN, O>(
      node1: RelatedTo<N, UN>,
      node2: RelatedTo<N, UN>,
      otherwise: OptLazy<O>
    ): V | O;
    /**
     * Adds the given `node` to the graph.
     * @param node - the node to add
     * @returns true if the node was not already present
     * @example
     * ```ts
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
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
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
     *  .toBuilder()
     * b.addNodes([3, 4, 5]) // => true
     * b.addNodes([1, 2])    // => false
     * ```
     */
    addNodes(nodes: StreamSource<N>): boolean;
    /**
     * Adds the given `element` graph element to the graph.
     * @param element - an object representing either a single node or a valued connection
     * @returns true if the element was not already in the graph
     * @example
     * ```ts
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
     *  .toBuilder()
     * b.addGraphElement([4])         // => true
     * b.addGraphElement([3, 1, 'c']) // => true
     * b.addGraphElement([1, 2, 'a']) // => false
     * ```
     */
    addGraphElement(element: ValuedGraphElement<N, V>): boolean;
    /**
     * Adds the graph elements in the given `elements` StreamSource to the graph.
     * @param elements - a `StreamSource` containing elements that represent either a single node or a valued connection
     * @returns true if the graph has changed
     * @example
     * ```ts
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
     *  .toBuilder()
     * b.addGraphElements([[4], [5]])          // => true
     * b.addGraphElements([[3, 1, 'c'], [1]])  // => true
     * b.addGraphElements([[1, 2, 'a'], [1]])  // => false
     * ```
     */
    addGraphElements(elements: StreamSource<ValuedGraphElement<N, V>>): boolean;
    /**
     * Removes the given `node`, and any of its connections, from the graph.
     * @param node - the node to remove
     * @returns true if the node was present
     * @example
     * ```ts
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
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
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
     *  .toBuilder()
     * b.removeNodes([1, 6, 7])  // => true
     * b.removeNodes([6, 7])     // => false
     * ```
     */
    removeNodes<UN = N>(nodes: StreamSource<RelatedTo<N, UN>>): boolean;
    /**
     * Adds a connection between `node1` and `node2` to the graph with given `value`.
     * @param node1 - the first connection node
     * @param node2 - the second connection node
     * @param value - the connection value
     * @returns true if the connection did not exist, or if the given value differs from the previous value
     * @example
     * ```ts
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
     *  .toBuilder()
     * b.connect(3, 1, 'c')  // => true
     * b.connect(1, 2, 'a')  // => false
     * b.connect(1, 2, 'z')  // => true
     * ```
     */
    connect(node1: N, node2: N, value: V): boolean;
    /**
     * Adds the connections in given `connections` `StreamSource` to the graph.
     * @param connections - a `StreamSource` containing the connection definitions to add
     * @returns true if any of the connections changed the collection
     * @example
     * ```ts
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
     *  .toBuilder()
     * b.connectAll([[1, 2, 'a'], [3, 1, 'c']]) // => true
     * b.connectAll([[1, 2, 'a']])              // => false
     * ```
     */
    connectAll(
      connections: StreamSource<WithGraphValues<Tp, N, V>['link']>
    ): boolean;
    /**
     * Modifies the graph at the connection between given `node1` and `node2` modified according to given `options`.
     * @param node1 - the first connection node
     * @param node2 - the second connection node
     * @param options - an object containing the following information:<br/>
     * - ifNew: (optional) if the given connection is not present in the collection, this value or function will be used
     * to generate a new connection. If a function returning the token argument is given, no new entry is created.<br/>
     * - ifExists: (optional) if a value is associated with given connection, this function is called with the given value
     * to return a new value. As a second argument, a `remove` token is given. If the function returns this token, the current
     * connection is removed.
     * @returns true if the collection changed
     * @example
     * ```ts
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
     *  .toBuilder()
     * b.modifyAt(3, 4, { ifNew: 'c' })                           // => true
     * g.modifyAt(4, 5, { ifNew: (none) => 1 < 2 ? none : 'c' })  // => false
     * g.modifyAt(1, 2, { ifNew: 'a' })                           // => false
     * g.modifyAt(1, 2, { ifExists: () => 'c' })                        // => false
     * g.modifyAt(1, 2, { ifExists: (v) => v + 'z' })               // => true
     * g.modifyAt(2, 3, { ifExists: (v, remove) => v === 'a' ? v : remove })
     * // => true
     * ```
     */
    modifyAt(
      node1: N,
      node2: N,
      options: {
        ifNew?: OptLazyOr<V, Token>;
        ifExists?: (value: V, remove: Token) => V | Token;
      }
    ): boolean;
    /**
     * Removes the connection between given `node1` and `node2` if the connection was present.
     * @param node1 - the first connection node
     * @param node2 - the second connection node
     * @returns true if the collection changed
     * @example
     * ```ts
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
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
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
     *  .toBuilder()
     * b.disconnectAll([[1, 2], [3, 4]])  // => true
     * b.disconnectAll([[3, 4], [5, 6]])  // => false
     * ```
     */
    disconnectAll<UN = N>(
      connections: StreamSource<Link<RelatedTo<N, UN>>>
    ): boolean;
    /**
     * Returns an immutable graph containing the nodes and connections of this builder.
     * @example
     * ```ts
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
     *  .toBuilder()
     * const g: ArrowValuedGraphHashed<number, string> = b.build()
     * ```
     */
    build(): WithGraphValues<Tp, N, V>['normal'];
    /**
     * Returns an immutable graph containing the nodes and connections of this builder, where the values are mapped
     * using the given `mapFun` function.
     * @param mapFun - a function taking the value
     * @example
     * ```ts
     * const b = ArrowValuedGraphHashed
     *  .of([[1, 2, 'a'], [2, 3, 'b']])
     *  .toBuilder()
     * const g: ArrowValuedGraphHashed<number, string> = b.buildMapValues(v => v.toUpperCase())
     * ```
     */
    buildMapValues<V2>(
      mapFun: (value: V, node1: N, node2: N) => V2
    ): WithGraphValues<Tp, N, V2>['normal'];
  }

  export interface Factory<Tp extends ValuedGraphBase.Types, UN = unknown> {
    /**
     * Returns the (singleton) empty instance of this type and context with given key and value types.
     * @example
     * ```ts
     * ArrowValuedGraphHashed.empty<number, string>()    // => ArrowValuedGraphHashed<number, string>
     * ArrowValuedGraphHashed.empty<string, boolean>()   // => ArrowValuedGraphHashed<string, boolean>
     * ```
     */
    empty<N extends UN, V>(): WithGraphValues<Tp, N, V>['normal'];
    /**
     * Returns an immutable valued Graph instance containing the graph elements from the given
     * `graphElements`.
     * @param graphElements - a non-empty array of graph elements that are either a single tuple containing a node, or a triplet containing
     * two connection nodes and the connection value.
     * @example
     * ```ts
     * ArrowValuedGraphHashed.of([1], [2], [3, 4, 'a']) // => ArrowValuedGraphHashed.NonEmpty<number, string>
     * ```
     */
    of<N extends UN, V>(
      ...graphElements: ArrayNonEmpty<ValuedGraphElement<N, V>>
    ): WithGraphValues<Tp, N, V>['nonEmpty'];
    /**
     * Returns an immutable valued Graph, containing the graph elements from each of the
     * given `sources`.
     * @param sources - an array of `StreamSource` instances containing graph elements to add
     * @example
     * ```ts
     * ArrowValuedGraphHashed.from([[1], [2]], [[3, 4, 'c']])  // => ArrowValuedGraphHashed.NonEmpty<number, string>
     * ```
     */
    from<N extends UN, V>(
      ...sources: ArrayNonEmpty<StreamSource.NonEmpty<ValuedGraphElement<N, V>>>
    ): WithGraphValues<Tp, N, V>['nonEmpty'];
    from<N extends UN, V>(
      ...sources: ArrayNonEmpty<StreamSource<ValuedGraphElement<N, V>>>
    ): WithGraphValues<Tp, N, V>['normal'];
    /**
     * Returns an empty builder instance.
     * @example
     * ```ts
     * ArrowValuedGraphHashed.builder<number, string>()    // => ArrowValuedGraphHashed.Builder<number, string>
     * ```
     */
    builder<N extends UN, V>(): WithGraphValues<Tp, N, V>['builder'];
    /**
     * Returns a `Reducer` that adds valued received graph elements to a ValuedGraph and returns the ValuedGraph as a result. When a `source` is given,
     * the reducer will first create a graph from the source, and then add graph elements to it.
     * @param source - (optional) an initial source of graph elements to add to
     * @example
     * ```ts
     * const someSource: ValuedGraphElement<number, string>[] = [[1, 2, 'a'], [3], [5]];
     * const result = Stream.of([1, 3, 'b'], [4, 3, 'c']).reduce(ArrowGraphSorted.reducer(someSource))
     * result.toArray()   // => [[1, 2, 'a'], [1, 3, 'b'], [4, 3, 'c'], [5]]
     * ```
     * @note uses a builder under the hood. If the given `source` is a ValuedGraph in the same context, it will directly call `.toBuilder()`.
     */
    reducer<N extends UN, V>(
      source?: StreamSource.NonEmpty<ValuedGraphElement<N, V>>
    ): Reducer<ValuedGraphElement<N, V>, WithGraphValues<Tp, N, V>['normal']>;
  }

  export interface Context<
    UN,
    Tp extends ValuedGraphBase.Types = ValuedGraphBase.Types,
  > extends Factory<Tp, UN> {
    readonly _fixedType: UN;

    /**
     * A string tag defining the specific collection type
     * @example
     * ```ts
     * ArrowValuedGraphHashed.defaultContext().typeTag   // => 'ArrowValuedGraphHashed'
     * ```
     */
    readonly typeTag: string;
    /**
     * The `context` instance used to create internal link maps
     */
    readonly linkMapContext: WithGraphValues<Tp, UN, unknown>['linkMapContext'];
    /**
     * The `context` instance used to create internal connection maps
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
  export interface Types extends VariantValuedGraphBase.Types {
    readonly normal: ValuedGraphBase<this['_N'], this['_V']> &
      VariantGraphBase<this['_N'], this['_V']>;
    readonly nonEmpty: ValuedGraphBase.NonEmpty<this['_N'], this['_V']>;
    readonly context: ValuedGraphBase.Context<this['_N']>;
    readonly builder: ValuedGraphBase.Builder<this['_N'], this['_V']>;
    readonly linkMap: RMap<this['_N'], RMap<this['_N'], this['_V']>>;
    readonly linkMapNonEmpty: RMap.NonEmpty<
      this['_N'],
      RMap<this['_N'], this['_V']>
    >;
    readonly linkMapContext: RMap.Context<this['_N']>;
    readonly linkConnectionsContext: RMap.Context<this['_N']>;
    readonly linkMapBuilder: RMap.Builder<
      this['_N'],
      RMap.Builder<this['_N'], this['_V']>
    >;
    readonly linkConnectionsBuilder: RMap.Builder<this['_N'], this['_V']>;
    readonly linkConnections: RMap<this['_N'], this['_V']>;
  }
}
