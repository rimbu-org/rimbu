import { OptLazy } from '@rimbu/common';

/**
 * A potentially valued connection between two nodes,
 * being a 2-valued or 3-valued tuple of which the
 * first two elements are nodes
 * @typeparam N - the node type
 */
export type Link<N> = [N, N] | [N, N, unknown];

export namespace Link {
  /**
   * Returns the given potentially valued link `link` as a 2-tuple
   * @param link - the link to convert
   */
  export function toTuple<N>(link: Link<N>): [N, N] {
    if (link.length === 2) return link;
    return [link[0], link[1]];
  }

  /**
   * Returns a graph `Link` from the given `node1` and `node2` nodes.
   * @param node1 - the first connection node
   * @param node2 - the second connection node
   */
  export function fromArgs<N>(node1: N, node2: N): Link<N> {
    return [node1, node2];
  }

  /**
   * Returns a graph `Link` from the given 2-tuple `tuple`.
   * @param tuple - the tuple to convert
   */
  export function fromTuple<N>(tuple: [N, N]): Link<N> {
    return tuple;
  }
}

/**
 * A graph element is either an isolated node as a 1-tuple, or
 * a link between nodes represented as a `Link` instance.
 */
export type GraphElement<N> = [N] | Link<N>;

export namespace GraphElement {
  /**
   * Returns true if the given graph element `e` is a single node.
   * Instructs the compiler that the type is a 1-tuple.
   * @param e - the graph element
   */
  export function isSingleNode(e: GraphElement<any>): e is [unknown] {
    return e.length === 1;
  }

  /**
   * Returns true if the given graph element `e` is a 2-tuple.
   * Instructs the compiler that the type is a 2-tuple.
   * @param e - the graph element
   */
  export function isLink(e: GraphElement<any>): e is [unknown, unknown] {
    return e.length !== 1;
  }

  /**
   * Returns the value of a single node graph element if the given element `e` is a single
   * node, or the given `otherwise` fallback value otherwise.
   * @param e - the graph element
   * @param otherwise - (default: undefined) the fallback value to return
   * if the given element is not a single node
   */
  export function getSingleNode<N>(e: GraphElement<N>): N | undefined;
  export function getSingleNode<N, O>(
    e: GraphElement<N>,
    otherwise?: OptLazy<O>
  ): N | O {
    if (isSingleNode(e)) return e[0];
    return OptLazy(otherwise!);
  }

  /**
   * Returns the values of the link graph element if the given element `e` is
   * a Link element, or undefined otherwise.
   * @param e - the graph element
   */
  export function getLink<N>(e: GraphElement<N>): Link<N> | undefined {
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
  export function getLinkElement<N>(
    e: GraphElement<N>,
    key: 0 | 1
  ): N | undefined;
  export function getLinkElement<N, O>(
    e: GraphElement<N>,
    key: 0 | 1,
    otherwise?: OptLazy<O>
  ): N | O {
    if (isLink(e)) return e[key];
    return OptLazy(otherwise!);
  }
}

/**
 * A valued connection between two nodes,
 * being a 3-valued tuple of which the
 * first two elements are nodes and the last element a value
 * @typeparam N - the node type
 * @typeparam V - the value type
 */
export type ValuedLink<N, V> = [N, N, V];

export namespace ValuedLink {
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
