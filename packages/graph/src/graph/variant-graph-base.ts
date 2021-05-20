import { RelatedTo } from '@rimbu/common';
import { FastIterable, Stream, Streamable, StreamSource } from '@rimbu/stream';
import { GraphValues, WithGraphValues } from '../graph-custom';
import { Link } from '../internal';

export interface VariantGraphBase<
  N,
  V,
  Tp extends VariantGraphBase.Types = VariantGraphBase.Types
> extends FastIterable<[N] | WithGraphValues<Tp, N, V>['link']> {
  /**
   * Returns true if the graph is an arrow (directed) graph.
   */
  readonly isDirected: boolean;
  /**
   * Returns true if the graph has no nodes.
   * @example
   * ArrowGraphHashed.empty<number>().isEmpty  // => true
   * ArrowGraphHashed.of([1]).isEmpty          // => false
   */
  readonly isEmpty: boolean;
  /**
   * Returns the amount of nodes in the graph.
   * @example
   * ArrowGraphHashed.empty<number>().nodeSize  // => 0
   * ArrowGraphHashed.of([1], [2, 3]).nodeSize  // => 3
   */
  readonly nodeSize: number;
  /**
   * Returns the amount of connections in the graph.
   * @example
   * ArrowGraphHashed.empty<number>().connectionSize  // => 0
   * ArrowGraphHashed.of([1], [2, 3]).connectionSize  // => 1
   */
  readonly connectionSize: number;
  /**
   * Returns true if there is at least one node in the collection, and instructs the compiler to treat the collection
   * as a .NonEmpty type.
   * @example
   * const g: ArrowGraphHashed<number> = ArrowGraphHashed.of([1, 1], [2, 2])
   * g.streamNodes().first(0)     // compiler allows fallback value since the Stream may be empty
   * if (g.nonEmpty()) {
   *   g.streamNodes().first(0)   // compiler error: fallback value not allowed since Stream is not empty
   * }
   */
  nonEmpty(): this is WithGraphValues<Tp, N, V>['nonEmpty'];
  /**
   * Returns the collection as a .NonEmpty type
   * @throws RimbuError.EmptyCollectionAssumedNonEmptyError if the collection is empty
   * @example
   * ArrowGraphHashed.empty<number>().assumeNonEmpty()   // => throws
   * const g: ArrowGraphHashed<number> = ArrowGraphHashed.of([1, 1], [2, 2])
   * const g2: ArrowGraphHashed.NonEmpty<number> = g     // => compiler error
   * const g3: ArrowGraphHashed.NonEmpty<number> = g.assumeNonEmpty()
   * @note returns reference to this collection
   */
  assumeNonEmpty(): WithGraphValues<Tp, N, V>['nonEmpty'];
  /**
   * Returns a `Stream` containing all graph elements of this collection as single tuples for isolated nodes
   * and 2-valued tuples of nodes for connections.
   * @example
   * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
   */
  stream(): Stream<[N] | WithGraphValues<Tp, N, V>['link']>;
  /**
   * Returns a `Stream` containing all nodes of this collection.
   * @example
   * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()   // => [1, 2, 3]
   */
  streamNodes(): Stream<N>;
  /**
   * Returns a `Stream` containing all connections of this collection.
   * @example
   * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()   // => [[2, 3]]
   */
  streamConnections(): Stream<WithGraphValues<Tp, N, V>['link']>;
  /**
   * Returns true if the graph contains the given `node`.
   * @param node - the node to search
   * @example
   * const g = ArrowGraphHashed.of([1], [2, 3])
   * g.hasNode(2)   // => true
   * g.hasNode(5)   // => false
   */
  hasNode<UN = N>(node: RelatedTo<N, UN>): boolean;
  /**
   * Returns true if the graph has a connection between given `node1` and `node2`.
   * @param node1 - the first connection node
   * @param node2 - the second connection node
   * @example
   * const g = ArrowGraphHashed.of([1], [2, 3])
   * g.hasConnection(2, 3)   // => true
   * g.hasConnection(3, 1)   // => false
   */
  hasConnection<UN = N>(
    node1: RelatedTo<N, UN>,
    node2: RelatedTo<N, UN>
  ): boolean;
  /**
   * Returns a `Stream` containing all the connetions from the given `node1`
   * @param node1 - the first connection node
   * @example
   * const g = ArrowGraphHashed.of([1], [2, 3])
   * g.getConnectionStreamFrom(2).toArray()   // => [3]
   * g.getConnectionStreamFrom(5).toArray()   // => []
   */
  getConnectionStreamFrom<UN = N>(
    node1: RelatedTo<N, UN>
  ): Stream<WithGraphValues<Tp, N, V>['link']>;
  /**
   * Returns a `Stream` containing all the connetions to the given `node2`
   * @param node2 - the second connection node
   * @example
   * const g = ArrowGraphHashed.of([1], [2, 3])
   * g.getConnectionStreamTo(3).toArray()   // => [2]
   * g.getConnectionStreamTo(5).toArray()   // => []
   */
  getConnectionStreamTo<UN = N>(
    node2: RelatedTo<N, UN>
  ): Stream<WithGraphValues<Tp, N, V>['link']>;
  /**
   * Returns the graph with the given `node` and all its connections removed.
   * @param node - the node to remove
   * @example
   * const g = ArrowGraphHashed.of([1], [2, 3])
   * g.removeNode(2).stream().toArray()  // => [[1]]
   * g.removeNode(6).stream().toArray()  // => [[1], [2, 3]]
   */
  removeNode<UN = N>(
    node: RelatedTo<N, UN>
  ): WithGraphValues<Tp, N, V>['normal'];
  /**
   * Returns the graph with all nodes in given `nodes` stream removed, together with all their
   * connections.
   * @param nodes - a `StreamSource` containing the nodes to remove
   * @example
   * const g = ArrowGraphHashed.of([1], [2, 3])
   * g.removeNodes([2, 3]).stream().toArray()  // => [[1]]
   * g.removeNodes([4, 5]).stream().toArray()  // => [[1], [2, 3]]
   */
  removeNodes<UN = N>(
    nodes: StreamSource<RelatedTo<N, UN>>
  ): WithGraphValues<Tp, N, V>['normal'];
  /**
   * Returns the graph with the connection between given `node1` and `node2` removed if it exists.
   * @param node1 - the first connection node
   * @param node2 - the second connectio node
   * @example
   * const g = ArrowGraphHashed.of([1], [2, 3])
   * g.disconnect(2, 3).stream().toArray()  // => [[1], [2], [3]]
   * g.disconnect(1, 2).stream().toArray()  // => [[1], [2, 3]]
   */
  disconnect<UN = N>(
    node1: RelatedTo<N, UN>,
    node2: RelatedTo<N, UN>
  ): WithGraphValues<Tp, N, V>['normal'];
  /**
   * Returns the graph with all connections in given `links` removed if they exist.
   * @param links - a `StreamSource` containing tuples of nodes representing connections
   * @example
   * const g = ArrowGraphHashed.of([1], [2, 3])
   * g.disconnectAll([[1, 2], [3, 4]]).stream().toArray() // => [[1], [2, 3]]
   * g.disconnectAll([[2, 3], [3, 4]]).stream().toArray() // => [[1], [2], [3]]
   */
  disconnectAll<UN = N>(
    links: StreamSource<Link<RelatedTo<N, UN>>>
  ): WithGraphValues<Tp, N, V>['normal'];
  /**
   * Returns the graph with all isolated nodes removed.
   * @example
   * const g = ArrowGraphHashed.of([1], [2, 3])
   * g.removeUnconnectedNodes().stream().toArray()   // => [[2, 3]]
   */
  removeUnconnectedNodes(): WithGraphValues<Tp, N, V>['normal'];
  /**
   * Returns a string representation of this collection.
   * @example
   * ArrowGraphHashed.of([1], [2, 3]).toString()   // => ArrowGraphHashed(1 => [], 2 => [3])
   */
  toString(): string;
}

export namespace VariantGraphBase {
  export interface NonEmpty<
    N,
    V,
    Tp extends VariantGraphBase.Types = VariantGraphBase.Types
  > extends VariantGraphBase<N, V, Tp>,
      Streamable.NonEmpty<[N] | WithGraphValues<Tp, N, V>['link']> {
    /**
     * Returns false since the graph is known to be non-empty.
     * @example
     * ArrowGraphHashed.empty<number>().isEmpty  // => true
     * ArrowGraphHashed.of([1]).isEmpty          // => false
     */
    readonly isEmpty: false;
    /**
     * Returns true since this collection is known to be non-empty
     * @example
     * ArrowGraphHashed.of([1], [2, 3]).nonEmpty()   // => true
     */
    nonEmpty(): true;
    /**
     * Returns this collection typed as a 'possibly empty' collection.
     * @example
     * ArrowGraphHashed.of([1], [2, 3]).asNormal();  // type: ArrowGraphHashed<number>
     */
    asNormal(): WithGraphValues<Tp, N, V>['normal'];
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 2-valued tuples of nodes for connections.
     * @example
     * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
     */
    stream(): Stream.NonEmpty<[N] | WithGraphValues<Tp, N, V>['link']>;
    /**
     * Returns a non-empty `Stream` containing all nodes of this collection.
     * @example
     * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()   // => [1, 2, 3]
     */
    streamNodes(): Stream.NonEmpty<N>;
  }

  export interface Types extends GraphValues {
    normal: VariantGraphBase<this['_N'], this['_V']>;
    nonEmpty: VariantGraphBase.NonEmpty<this['_N'], this['_V']>;
    link: Link<this['_N']>;
  }
}
