import type { Stream, Streamable } from 'https://deno.land/x/rimbu/stream/mod.ts';
import type { ValuedGraphElement } from '../internal.ts';
import type { VariantValuedGraphBase } from './valued-graph-custom.ts';

/**
 * An type-variant immutable valued graph.
 * @typeparam N - the node type
 * @typeparam V - the connection value type
 */
export interface VariantValuedGraph<N, V>
  extends VariantValuedGraphBase<N, V, VariantValuedGraph.Types> {}

export namespace VariantValuedGraph {
  type NonEmptyBase<N, V> = VariantValuedGraphBase.NonEmpty<
    N,
    V,
    VariantValuedGraph.Types
  > &
    VariantValuedGraph<N, V>;

  /**
   * A non-empty type-variant immutable valued graph.
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface NonEmpty<N, V>
    extends NonEmptyBase<N, V>,
      Streamable.NonEmpty<ValuedGraphElement<N, V>> {
    /**
     * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
     * @example
     * ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
     * // => [[1, 2, 'a'], [2, 3, 'b']]
     */
    stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
  }

  export interface Types extends VariantValuedGraphBase.Types {
    readonly normal: VariantValuedGraph<this['_N'], this['_V']>;
    readonly nonEmpty: VariantValuedGraph.NonEmpty<this['_N'], this['_V']>;
  }
}
