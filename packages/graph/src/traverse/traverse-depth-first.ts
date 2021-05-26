import { OptLazy } from '@rimbu/common';
import { HashSet } from '@rimbu/hashed';
import { SortedSet } from '@rimbu/sorted';
import { FastIterator, Stream, StreamCustom } from '@rimbu/stream';
import { LinkType, VariantGraphBase } from '../graph-custom';

class GraphDepthFirstStream<
  G extends VariantGraphBase.NonEmpty<N, any>,
  N
> extends StreamCustom.StreamBase<LinkType<G, N>> {
  constructor(
    readonly node: N,
    readonly graph: G,
    readonly addVisitedNode: (node: N) => boolean
  ) {
    super();
  }

  [Symbol.iterator](): FastIterator<LinkType<G, N>> {
    return new GraphDepthFirstIterable<G, N>(
      this.node,
      this.graph,
      this.addVisitedNode
    );
  }
}

class GraphDepthFirstIterable<
  G extends VariantGraphBase.NonEmpty<N, any>,
  N
> extends FastIterator.Base<LinkType<G, N>> {
  constructor(
    readonly node: N,
    readonly graph: G,
    readonly addVisitedNode: (node: N) => boolean,
    isRoot = true
  ) {
    super();
    if (isRoot) this.addVisitedNode(node);

    const startConnectionStream = this.graph.getConnectionStreamFrom(this.node);

    this.arrowIterator = startConnectionStream[
      Symbol.iterator
    ]() as FastIterator<LinkType<G, N>>;
  }

  readonly arrowIterator: FastIterator<LinkType<G, N>>;

  currentIterator?: FastIterator<LinkType<G, N>>;

  fastNext<O>(otherwise?: OptLazy<O>): LinkType<G, N> | O {
    if (this.currentIterator) {
      const nextNode = this.currentIterator.fastNext();
      if (undefined !== nextNode) return nextNode;
    }

    let nextConnection: LinkType<G, N> | undefined;

    while (undefined !== (nextConnection = this.arrowIterator.fastNext())) {
      const result = nextConnection;
      const targetNode = result[1];

      if (this.addVisitedNode(targetNode)) {
        this.currentIterator = new GraphDepthFirstIterable<G, N>(
          targetNode,
          this.graph,
          this.addVisitedNode,
          false
        );
        return result;
      }
    }

    return OptLazy(otherwise) as O;
  }
}

/**
 * Returns a stream of connections that can be reached in the given `graph`
 * starting at the given `startNode`, and using depth-first traversal. It can
 * avoid loops if needed in a custom way by supplying the `addVisitedNode` function.
 * @param graph - the graph to traverse
 * @param startNode - the start node within the graph
 * @param addVisitedNode - a function taking the currenty traversed node,
 * and returning true if the node has been traversed before, or false otherwise
 * @example
 * const g = EdgeGraphHashed.of([1, 2], [2, 3], [1, 3], [3, 4])
 * const stream = traverseDepthFirstCustom(g, 1)
 * console.log(stream.toArray())
 * // => [[1, 2], [2, 3], [1, 3], [3, 4]]
 */
export function traverseDepthFirstCustom<G extends VariantGraphBase<N, any>, N>(
  graph: G,
  startNode: N,
  addVisitedNode: (node: N) => boolean = (): true => true
): Stream<LinkType<G, N>> {
  if (!graph.nonEmpty() || !graph.hasNode(startNode)) return Stream.empty();

  return new GraphDepthFirstStream(startNode, graph, addVisitedNode);
}

/**
 * Returns a stream of connections that can be reached in the given `graph`
 * starting at the given `startNode`, and using depth-first traversal. It avoids
 * loops by internally placing the visited nodes in a HashSet builder.
 * @param graph - the graph to traverse
 * @param startNode - the start node within the graph
 * const g = EdgeGraphHashed.of([1, 2], [2, 3], [1, 3], [3, 4])
 * const stream = traverseDepthFirstHashed(g, 1)
 * console.log(stream.toArray())
 * // => [[1, 2], [2, 3], [1, 3], [3, 4]]
 */
export function traverseDepthFirstHashed<G extends VariantGraphBase<N, any>, N>(
  graph: G,
  startNode: N
): Stream<LinkType<G, N>> {
  if (!graph.nonEmpty() || !graph.hasNode(startNode)) return Stream.empty();

  const visitSet = HashSet.builder<N>();
  return new GraphDepthFirstStream(startNode, graph, visitSet.add);
}

/**
 * Returns a stream of connections that can be reached in the given `graph`
 * starting at the given `startNode`, and using depth-first traversal. It avoids
 * loops by internally placing the visited nodes in a SortedSet builder.
 * @param graph - the graph to traverse
 * @param startNode - the start node within the graph
 * const g = EdgeGraphHashed.of([1, 2], [2, 3], [1, 3], [3, 4])
 * const stream = traverseDepthFirstSorted(g, 1)
 * console.log(stream.toArray())
 * // => [[1, 2], [2, 3], [1, 3], [3, 4]]
 */
export function traverseDepthFirstSorted<G extends VariantGraphBase<N, any>, N>(
  graph: G,
  startNode: N
): Stream<LinkType<G, N>> {
  if (!graph.nonEmpty() || !graph.hasNode(startNode)) return Stream.empty();

  const visitSet = SortedSet.builder<N>();
  return new GraphDepthFirstStream(startNode, graph, visitSet.add);
}
