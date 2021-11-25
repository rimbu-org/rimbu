import type { VariantGraphBase } from '../graph/graph-custom';
import type { Link, ValuedLink } from '../internal';
import type { VariantValuedGraphBase } from '../valued-graph/valued-graph-custom';

/**
 * Utility type to determine if a graph has valued or unvalued links
 * @typeparam G - a graph subtype
 * @typeparam N - the graph's node type
 */
export type LinkType<
  G extends VariantGraphBase<any, any>,
  N
> = G extends VariantValuedGraphBase<N, infer V> ? ValuedLink<N, V> : Link<N>;
