import type { RelatedTo } from '../../../../common/mod.ts';
import type { Stream, Streamable } from '../../../../stream/mod.ts';

import type { GraphBase, GraphElement } from '../../common/index.ts';

export interface ArrowGraphBase<
  N,
  Tp extends ArrowGraphBase.Types = ArrowGraphBase.Types,
> extends GraphBase<N, Tp> {
  /**
   * Returns true since this is an arrow (directed) graph instance.
   */
  readonly isDirected: true;
  /**
   * Returns true if the given `node` has no outgoing connections.
   * @typeparam UN - upper node type used to provide sane typing defaults
   * @param node - the node to check
   * @example
   * ```ts
   * const g = ArrowGraphHashed.of([1, 2], [2, 3])
   * g.isSink(1)  // => false
   * g.isSink(3)  // => true
   * ```
   */
  isSink<UN = N>(node: RelatedTo<N, UN>): boolean;
  /**
   * Returns true if the given `node` has no incoming connections.
   * @typeparam UN - upper node type used to provide sane typing defaults
   * @param node - the node to check
   * @example
   * ```ts
   * const g = ArrowGraphHashed.of([1, 2], [2, 3])
   * g.isSource(1)  // => true
   * g.isSource(3)  // => false
   * ```
   */
  isSource<UN = N>(node: RelatedTo<N, UN>): boolean;
}

export namespace ArrowGraphBase {
  export interface NonEmpty<
    N,
    Tp extends ArrowGraphBase.Types = ArrowGraphBase.Types,
  > extends GraphBase.NonEmpty<N, Tp>,
      Omit<ArrowGraphBase<N, Tp>, keyof GraphBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<GraphElement<N>> {
    /**
     * Returns true since this is an arrow (directed) graph instance.
     */
    readonly isDirected: true;

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

  export interface Builder<
    N,
    Tp extends ArrowGraphBase.Types = ArrowGraphBase.Types,
  > extends GraphBase.Builder<N, Tp> {}

  export interface Context<
    UN,
    Tp extends ArrowGraphBase.Types = ArrowGraphBase.Types,
  > extends GraphBase.Context<UN, Tp> {
    readonly isDirected: true;
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends GraphBase.Types {
    readonly normal: ArrowGraphBase<this['_N']>;
    readonly nonEmpty: ArrowGraphBase.NonEmpty<this['_N']>;
    readonly context: ArrowGraphBase.Context<this['_N']>;
    readonly builder: ArrowGraphBase.Builder<this['_N']>;
  }
}
