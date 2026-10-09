import type { Link } from '@rimbu/graph/link';
import type { ValuedLink } from '@rimbu/graph/valued-link';

import type { ValuedGraphBase } from '#graph/valued/base';

/**
 * Utility type to determine if a graph has valued or unvalued links
 * @param G - a graph subtype
 * @param N - the graph's node type
 */
export type LinkType<G, N> =
	G extends ValuedGraphBase<any, infer V> ? ValuedLink<N, V> : Link<N>;
