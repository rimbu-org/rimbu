import { OptLazy } from '@rimbu/common';

import type { Link } from '.';

/**
 * A valued connection between two nodes,
 * being a 3-valued tuple of which the
 * first two elements are nodes and the last element a value
 * @typeparam N - the node type
 * @typeparam V - the value type
 */
export type ValuedLink<N, V> = [N, N, V];

export namespace ValuedLink {
  export type Target<N, V> = readonly [N, V];

  export function fromArgs<N, V>(
    node1: N,
    node2: N,
    value: V
  ): ValuedLink<N, V> {
    return [node1, node2, value];
  }
}

export type ValuedGraphElement<N, V> = [N] | ValuedLink<N, V>;

export namespace ValuedGraphElement {
  /**
   * Returns true if the given graph element `e` is a single node.
   * Instructs the compiler that the type is a 1-tuple.
   * @param e - the graph element
   */
  export function isSingleNode(
    e: ValuedGraphElement<any, any>
  ): e is [unknown] {
    return e.length === 1;
  }

  /**
   * Returns true if the given graph element `e` is a 3-tuple.
   * Instructs the compiler that the type is a 3-tuple.
   * @param e - the graph element
   */
  export function isLink(
    e: ValuedGraphElement<any, any>
  ): e is [unknown, unknown, unknown] {
    return e.length !== 1;
  }

  /**
   * Returns the value of a single node graph element if the given element `e` is a single
   * node, or the given `otherwise` fallback value otherwise.
   * @param e - the graph element
   * @param otherwise - (default: undefined) the fallback value to return
   * if the given element is not a single node
   */
  export function getSingleNode<N>(
    e: ValuedGraphElement<N, any>
  ): N | undefined;
  export function getSingleNode<N, O>(
    e: ValuedGraphElement<N, any>,
    otherwise?: OptLazy<O>
  ): N | O {
    if (isSingleNode(e)) return e[0];
    return OptLazy(otherwise!);
  }

  /**
   * Returns the nodes of the link graph element if the given element `e` is
   * a Link element, or undefined otherwise.
   * @param e - the graph element
   */
  export function getLink<N, V>(
    e: ValuedGraphElement<N, V>
  ): Link<N> | undefined {
    if (isLink(e)) return e;
    return undefined;
  }

  /**
   * Returns the element at the given `key` in the graph element `e`,
   * if the element is a Link element, or returns the given `otherwise` value
   * otherwise.
   * @param e - the graph element
   * @param key - the link key
   * @param otherwise - (default: undefined) the fallback value
   */
  export function getLinkElement<
    N,
    V,
    K extends keyof ValuedGraphElement<N, V>
  >(e: ValuedGraphElement<N, V>, key: K): ValuedLink<N, V>[K] | undefined;
  export function getLinkElement<
    N,
    V,
    K extends keyof ValuedGraphElement<N, V>,
    O
  >(
    e: ValuedGraphElement<N, V>,
    key: K,
    otherwise?: OptLazy<O>
  ): ValuedLink<N, V>[K] | O {
    if (isLink(e)) return e[key];
    return OptLazy(otherwise!);
  }
}
