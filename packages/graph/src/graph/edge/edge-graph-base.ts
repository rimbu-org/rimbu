import { Stream, Streamable } from '@rimbu/stream';
import { GraphElement } from '../../internal';
import { GraphBase } from '../../graph-custom';

export interface EdgeGraphBase<
  N,
  Tp extends EdgeGraphBase.Types = EdgeGraphBase.Types
> extends GraphBase<N, Tp> {
  /**
   * Returns false since this is an arrow (directed) graph instance.
   */
  readonly isDirected: false;
}

export namespace EdgeGraphBase {
  type NonEmptyBase<N, Tp extends EdgeGraphBase.Types> = GraphBase.NonEmpty<
    N,
    Tp
  > &
    EdgeGraphBase<N, Tp>;

  export interface NonEmpty<
    N,
    Tp extends EdgeGraphBase.Types = EdgeGraphBase.Types
  > extends NonEmptyBase<N, Tp>,
      Streamable.NonEmpty<GraphElement<N>> {
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 2-valued tuples of nodes for connections.
     * @example
     * EdgeGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
     */
    stream(): Stream.NonEmpty<GraphElement<N>>;
  }

  export interface Builder<
    N,
    Tp extends EdgeGraphBase.Types = EdgeGraphBase.Types
  > extends GraphBase.Builder<N, Tp> {}

  export interface Context<
    UN,
    Tp extends EdgeGraphBase.Types = EdgeGraphBase.Types
  > extends GraphBase.Context<UN, Tp> {
    readonly isDirected: false;
  }

  export interface Types extends GraphBase.Types {
    normal: EdgeGraphBase<this['_N']>;
    nonEmpty: EdgeGraphBase.NonEmpty<this['_N']>;
    context: EdgeGraphBase.Context<this['_N']>;
    builder: EdgeGraphBase.Builder<this['_N']>;
  }
}
