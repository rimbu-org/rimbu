import { VariantGraphBase, VariantValuedGraphBase } from '../graph-custom';
import { Link, ValuedLink } from '../internal';

/**
 * Utility type to determine if a graph has valued or unvalued links
 * @typeparam G - a graph subtype
 * @typeparam N - the graph's node type
 */
export type LinkType<
  G extends VariantGraphBase<any, any>,
  N
> = G extends VariantValuedGraphBase<N, infer V> ? ValuedLink<N, V> : Link<N>;
