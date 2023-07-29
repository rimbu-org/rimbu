import type { Stream, Streamable } from '@rimbu/stream';

import type { ValuedGraphBase } from '@rimbu/graph/custom';
import type { ValuedGraphElement } from '../../../common/index.mjs';

export interface EdgeValuedGraphBase<
  N,
  V,
  Tp extends EdgeValuedGraphBase.Types = EdgeValuedGraphBase.Types
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
    Tp extends EdgeValuedGraphBase.Types = EdgeValuedGraphBase.Types
  > extends ValuedGraphBase.NonEmpty<N, V, Tp>,
      Omit<
        EdgeValuedGraphBase<N, V, Tp>,
        keyof ValuedGraphBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<ValuedGraphElement<N, V>> {
    /**
     * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
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
    Tp extends EdgeValuedGraphBase.Types = EdgeValuedGraphBase.Types
  > extends ValuedGraphBase.Builder<N, V, Tp> {}

  export interface Context<
    UN,
    Tp extends EdgeValuedGraphBase.Types = EdgeValuedGraphBase.Types
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
