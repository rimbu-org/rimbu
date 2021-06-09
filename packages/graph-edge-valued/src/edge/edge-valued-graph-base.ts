import { ValuedGraphCustom, ValuedGraphElement } from '@rimbu/graph';
import { Stream, Streamable } from '@rimbu/stream';

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
  type NonEmptyBase<N, V, Tp extends EdgeValuedGraphBase.Types> =
    ValuedGraphCustom.ValuedGraphBase.NonEmpty<N, V, Tp> &
      EdgeValuedGraphBase<N, V, Tp>;

  export interface NonEmpty<
    N,
    V,
    Tp extends EdgeValuedGraphBase.Types = EdgeValuedGraphBase.Types
  > extends NonEmptyBase<N, V, Tp>,
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
