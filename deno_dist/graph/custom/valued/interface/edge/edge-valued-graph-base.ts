import type { Stream, Streamable } from '../../../../../stream/mod.ts';

import type { ValuedGraphBase } from '../../../../../graph/custom/index.ts';
import type { ValuedGraphElement } from '../../../common/index.ts';

export interface EdgeValuedGraphBase<
  N,
  V,
  Tp extends EdgeValuedGraphBase.Types = EdgeValuedGraphBase.Types,
> extends ValuedGraphBase<N, V, Tp> {
  /**
   * Returns false since this is an edge (undirected) graph instance.
   */
  readonly isDirected: false;
}

export namespace EdgeValuedGraphBase {
  export interface NonEmpty<
    N,
    V,
    Tp extends EdgeValuedGraphBase.Types = EdgeValuedGraphBase.Types,
  > extends ValuedGraphBase.NonEmpty<N, V, Tp>,
      Omit<
        EdgeValuedGraphBase<N, V, Tp>,
        keyof ValuedGraphBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<ValuedGraphElement<N, V>> {
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 3-valued tuples containing the source node, target node, and connection value for connections.
     * @example
     * ```ts
     * EdgeValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
     * // => [[1, 2, 'a'], [2, 3, 'b']]
     * ```
     */
    stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
  }

  export interface Builder<
    N,
    V,
    Tp extends EdgeValuedGraphBase.Types = EdgeValuedGraphBase.Types,
  > extends ValuedGraphBase.Builder<N, V, Tp> {}

  export interface Context<
    UN,
    Tp extends EdgeValuedGraphBase.Types = EdgeValuedGraphBase.Types,
  > extends ValuedGraphBase.Context<UN, Tp> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends ValuedGraphBase.Types {
    readonly normal: EdgeValuedGraphBase<this['_N'], this['_V']>;
    readonly nonEmpty: EdgeValuedGraphBase.NonEmpty<this['_N'], this['_V']>;
    readonly context: EdgeValuedGraphBase.Context<this['_N']>;
    readonly builder: EdgeValuedGraphBase.Builder<this['_N'], this['_V']>;
  }
}
