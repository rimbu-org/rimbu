import type { ValuedGraphBase, ValuedGraphElement } from '../../../../../graph/custom/index.ts';
import type { Stream, Streamable } from '../../../../../stream/mod.ts';

/**
 * An type-invariant immutable valued graph.
 * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [ValuedGraph API documentation](https://rimbu.org/api/rimbu/graph/ValuedGraph/interface)
 * @typeparam N - the node type
 * @typeparam V - the connection value type
 */
export interface ValuedGraph<N, V>
  extends ValuedGraphBase<N, V, ValuedGraph.Types> {}

export namespace ValuedGraph {
  /**
   * A non-empty type-invariant immutable valued graph.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [ValuedGraph API documentation](https://rimbu.org/api/rimbu/graph/ValuedGraph/interface)
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface NonEmpty<N, V>
    extends ValuedGraphBase.NonEmpty<N, V, ValuedGraph.Types>,
      Omit<ValuedGraph<N, V>, keyof ValuedGraphBase.NonEmpty<any, any, any>>,
      Streamable.NonEmpty<ValuedGraphElement<N, V>> {
    stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
  }

  /**
   * A mutable `ValuedGraph` builder used to efficiently create new immutable instances.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [ValuedGraph.Builder API documentation](https://rimbu.org/api/rimbu/graph/ValuedGraph/Builder/interface)
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface Builder<N, V>
    extends ValuedGraphBase.Builder<N, V, ValuedGraph.Types> {}

  /**
   * The ValuedGraph's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN>
    extends ValuedGraphBase.Context<UN, ValuedGraph.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends ValuedGraphBase.Types {
    readonly normal: ValuedGraph<this['_N'], this['_V']>;
    readonly nonEmpty: ValuedGraph.NonEmpty<this['_N'], this['_V']>;
    readonly builder: ValuedGraph.Builder<this['_N'], this['_V']>;
    readonly context: ValuedGraph.Context<this['_N']>;
  }
}
