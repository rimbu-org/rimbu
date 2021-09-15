import type { ValuedGraphCustom, ValuedGraphElement } from '../../graph/mod.ts';
import type { Stream, Streamable } from '../../stream/mod.ts';

export interface EdgeValuedGraphBase<
  N,
  V,
  Tp extends EdgeValuedGraphBase.Types = EdgeValuedGraphBase.Types
> extends ValuedGraphCustom.ValuedGraphBase<N, V, Tp> {
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
  > extends ValuedGraphCustom.ValuedGraphBase.NonEmpty<N, V, Tp>,
      Omit<
        EdgeValuedGraphBase<N, V, Tp>,
        keyof ValuedGraphCustom.ValuedGraphBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<ValuedGraphElement<N, V>> {
    /**
     * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
     * @example
     * EdgeValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
     * // => [[1, 2, 'a'], [2, 3, 'b']]
     */
    stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
  }

  export interface Builder<
    N,
    V,
    Tp extends EdgeValuedGraphBase.Types = EdgeValuedGraphBase.Types
  > extends ValuedGraphCustom.ValuedGraphBase.Builder<N, V, Tp> {}

  export interface Context<
    UN,
    Tp extends EdgeValuedGraphBase.Types = EdgeValuedGraphBase.Types
  > extends ValuedGraphCustom.ValuedGraphBase.Context<UN, Tp> {}

  export interface Types extends ValuedGraphCustom.ValuedGraphBase.Types {
    readonly normal: EdgeValuedGraphBase<this['_N'], this['_V']>;
    readonly nonEmpty: EdgeValuedGraphBase.NonEmpty<this['_N'], this['_V']>;
    readonly context: EdgeValuedGraphBase.Context<this['_N']>;
    readonly builder: EdgeValuedGraphBase.Builder<this['_N'], this['_V']>;
  }
}
