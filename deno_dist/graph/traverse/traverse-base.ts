import type { VariantGraphBase } from '../graph/graph-custom.ts';
import type { Link, ValuedLink } from '../internal.ts';
import type { VariantValuedGraphBase } from '../valued-graph/valued-graph-custom.ts';

/**
 * Utility type to determine if a graph has valued or unvalued links
 * @typeparam G - a graph subtype
 * @typeparam N - the graph's node type
 */
export type LinkType<G extends VariantGraphBase<any, any>, N> =
  G extends VariantValuedGraphBase<N, infer V> ? ValuedLink<N, V> : Link<N>;
