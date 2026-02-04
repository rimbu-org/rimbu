import type { Link } from '@rimbu/graph/link';
import type { ValuedLink } from '@rimbu/graph/valued-link';

import type { VariantValuedGraphBase } from '#private/valued/variant-base';
import type { VariantGraphBase } from '#private/variant-base';

/**
 * Utility type to determine if a graph has valued or unvalued links
 * @typeparam G - a graph subtype
 * @typeparam N - the graph's node type
 */
export type LinkType<
	G extends VariantGraphBase<any, any>,
	N,
> = G extends VariantValuedGraphBase<N, infer V> ? ValuedLink<N, V> : Link<N>;
