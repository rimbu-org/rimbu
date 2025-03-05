import type { Stream, Streamable } from '../../../../stream/mod.ts';

import type { GraphBase, GraphElement } from '../../common/index.ts';

export interface EdgeGraphBase<
  N,
  Tp extends EdgeGraphBase.Types = EdgeGraphBase.Types,
> extends GraphBase<N, Tp> {
  /**
   * Returns false since this is an arrow (directed) graph instance.
   */
  readonly isDirected: false;
}

export namespace EdgeGraphBase {
  export interface NonEmpty<
    N,
    Tp extends EdgeGraphBase.Types = EdgeGraphBase.Types,
  > extends GraphBase.NonEmpty<N, Tp>,
      Omit<EdgeGraphBase<N, Tp>, keyof GraphBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<GraphElement<N>> {
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 2-valued tuples of nodes for connections.
     * @example
     * ```ts
     * EdgeGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
     * ```
     */
    stream(): Stream.NonEmpty<GraphElement<N>>;
  }

  export interface Builder<
    N,
    Tp extends EdgeGraphBase.Types = EdgeGraphBase.Types,
  > extends GraphBase.Builder<N, Tp> {}

  export interface Context<
    UN,
    Tp extends EdgeGraphBase.Types = EdgeGraphBase.Types,
  > extends GraphBase.Context<UN, Tp> {
    readonly isDirected: false;
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends GraphBase.Types {
    readonly normal: EdgeGraphBase<this['_N']>;
    readonly nonEmpty: EdgeGraphBase.NonEmpty<this['_N']>;
    readonly context: EdgeGraphBase.Context<this['_N']>;
    readonly builder: EdgeGraphBase.Builder<this['_N']>;
  }
}
