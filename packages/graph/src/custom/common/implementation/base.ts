import { Stream, StreamSource } from '@rimbu/stream';
import { EmptyBase } from '@rimbu/collection-types/map-custom';

import type { VariantGraphBase } from '..';

export interface GraphValues<N = unknown, V = unknown> {
  readonly _N: N;
  readonly _V: V;
}

export type WithGraphValues<Tp, N, V> = GraphValues<N, V> & Tp;

export interface GraphConnect<N, V, Tp extends VariantGraphBase.Types>
  extends VariantGraphBase<N, V, Tp> {
  /**
   * Returns the graph with the given `node` added, if it was not yet present.
   * @param node - the node to add
   * @example
   * ```ts
   * const g = ArrowGraphHashed.of([1], [2, 3])
   * g.addNode(4).stream().toArray()  // => [[1], [2, 3], [4]]
   * g.addNode(1).stream().toArray()  // ==> [[1], [2, 3]]
   * ```
   */
  addNode(node: N): WithGraphValues<Tp, N, V>['nonEmpty'];
  /**
   * Returns the graph with the nodes from the given `nodes` `StreamSource` added.
   * @param nodes - a `StreamSource` containing the nodes to add
   * @example
   * ```ts
   * const g = ArrowGraphHashed.of([1], [2, 3])
   * g.addNodes([4, 1]).stream().toArray()  // => [[1], [2, 3], [4]]
   * g.addNodes([1, 2]).stream().toArray()  // => [[1], [2, 3]]
   * ```
   */
  addNodes(
    nodes: StreamSource.NonEmpty<N>
  ): WithGraphValues<Tp, N, V>['nonEmpty'];
  addNodes(nodes: StreamSource<N>): WithGraphValues<Tp, N, V>['normal'];
  /**
   * Returns the graph with the connections from the given `connections` `StreamSource` added.
   * @param connections - a `StreamSource` conntaining tuple representing the connections to add
   * @example
   * ```ts
   * const g = ArrowGraphHashed.of([1], [2, 3])
   * g.connectAll([[1, 2], [3, 1]]).stream().toArray()  // => [[1, 2], [2, 3], [3, 1]]
   * const g2 = ArrowValuedGraphHashed.of([1], [2, 3, 'a'])
   * g2.connectAll([[1, 2, 'b'], [2, 3, 'c']]).stream().toArray()
   * // => [[1, 2, 'b'], [2, 3, 'c']]
   * ```
   */
  connectAll(
    connections: StreamSource.NonEmpty<WithGraphValues<Tp, N, V>['link']>
  ): WithGraphValues<Tp, N, V>['nonEmpty'];
  connectAll(
    connections: StreamSource<WithGraphValues<Tp, N, V>['link']>
  ): WithGraphValues<Tp, N, V>['normal'];
}

export interface GraphConnectNonEmpty<N, V, Tp extends VariantGraphBase.Types>
  extends GraphConnect<N, V, Tp> {
  /**
   * Returns the non-empty graph with the nodes from the given `nodes` `StreamSource` added.
   * @param nodes - a `StreamSource` containing the nodes to add
   * @example
   * ```ts
   * const g = ArrowGraphHashed.of([1], [2, 3])
   * g.addNodes([4, 1]).stream().toArray()  // => [[1], [2, 3], [4]]
   * g.addNodes([1, 2]).stream().toArray()  // => [[1], [2, 3]]
   * ```
   */
  addNodes(nodes: StreamSource<N>): WithGraphValues<Tp, N, V>['nonEmpty'];
  /**
   * Returns the non-empty graph with the connections from the given `connections` `StreamSource` added.
   * @param connections - a `StreamSource` conntaining tuple representing the connections to add
   * @example
   * ```ts
   * const g = ArrowGraphHashed.of([1], [2, 3])
   * g.connectAll([[1, 2], [3, 1]]).stream().toArray()  // => [[1, 2], [2, 3], [3, 1]]
   * const g2 = ArrowValuedGraphHashed.of([1], [2, 3, 'a'])
   * g2.connectAll([[1, 2, 'b'], [2, 3, 'c']]).stream().toArray()
   * // => [[1, 2, 'b'], [2, 3, 'c']]
   * ```
   */
  connectAll(
    links: StreamSource<WithGraphValues<Tp, N, V>['link']>
  ): WithGraphValues<Tp, N, V>['nonEmpty'];
}

export abstract class GraphEmptyBase extends EmptyBase {
  get nodeSize(): 0 {
    return 0;
  }

  get connectionSize(): 0 {
    return 0;
  }

  streamNodes(): Stream<any> {
    return Stream.empty();
  }

  streamConnections(): Stream<any> {
    return Stream.empty();
  }

  hasNode(): false {
    return false;
  }

  hasConnection(): false {
    return false;
  }

  isSink(): false {
    return false;
  }

  isSource(): false {
    return false;
  }

  removeNode(): any {
    return this;
  }

  removeNodes(): any {
    return this;
  }

  getConnectionStreamFrom(): Stream<any> {
    return Stream.empty();
  }

  getConnectionStreamTo(): Stream<any> {
    return Stream.empty();
  }

  disconnect(): any {
    return this;
  }

  disconnectAll(): any {
    return this;
  }

  removeUnconnectedNodes(): any {
    return this;
  }
}
