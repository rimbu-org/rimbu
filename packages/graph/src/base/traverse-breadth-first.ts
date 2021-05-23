import { OptLazy } from '@rimbu/common';
import { HashSet } from '@rimbu/hashed';
import { SortedSet } from '@rimbu/sorted';
import { FastIterator, Stream, StreamCustom } from '@rimbu/stream';
import { LinkType, VariantGraphBase } from '../graph-custom';

class GraphBreadthFirstStream<
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
    return new DirectedGraphBreadthFirstIterable<G, N>(
      this.node,
      this.graph,
      this.addVisitedNode
    );
  }
}

class DirectedGraphBreadthFirstIterable<
  G extends VariantGraphBase.NonEmpty<N, any>,
  N
> extends FastIterator.Base<LinkType<G, N>> {
  constructor(
    readonly node: N,
    readonly graph: G,
    readonly addVisitedNode: (node: N) => boolean
  ) {
    super();
    addVisitedNode(node);

    const startConnectionStream = this.graph.getConnectionStreamFrom(this.node);

    this.currentIterator = startConnectionStream[
      Symbol.iterator
    ]() as FastIterator<LinkType<G, N>>;
  }

  readonly nextIterators: FastIterator<LinkType<G, N>>[] = [];
  currentIterator: FastIterator<LinkType<G, N>>;

  fastNext<O>(otherwise?: OptLazy<O>): LinkType<G, N> | O {
    let nextConnection: LinkType<G, N> | undefined;

    while (undefined !== (nextConnection = this.currentIterator.fastNext())) {
      const result = nextConnection;
      const targetNode = result[1];

      if (this.addVisitedNode(targetNode)) {
        const targetConnectionStream =
          this.graph.getConnectionStreamFrom(targetNode);

        this.nextIterators.push(
          targetConnectionStream[Symbol.iterator]() as FastIterator<
            LinkType<G, N>
          >
        );
        return result;
      }
    }

    const nextIterator = this.nextIterators.shift();

    if (undefined === nextIterator) return OptLazy(otherwise) as O;

    this.currentIterator = nextIterator;

    return this.fastNext(otherwise);
  }
}

/**
 * Returns a stream of connections that can be reached in the given `graph`
 * starting at the given `startNode`, and using breadth-first traversal. It can
 * avoid loops if needed in a custom way by supplying the `addVisitedNode` function.
 * @param graph - the graph to traverse
 * @param startNode - the start node within the graph
 * @param addVisitedNode - a function taking the currenty traversed node,
 * and returning true if the node has been traversed before, or false otherwise
 * @example
 * const g = EdgeGraphHashed.of([1, 2], [2, 3], [1, 3], [3, 4])
 * const stream = traverseBreadthFirstCustom(g, 1)
 * console.log(stream.toArray())
 * // => [[1, 2], [1, 3], [2, 3], [3, 4]]
 */
export function traverseBreadthFirstCustom<
  G extends VariantGraphBase<N, any>,
  N
>(
  graph: G,
  startNode: N,
  addVisitedNode: (node: N) => boolean = () => true
): Stream<LinkType<G, N>> {
  if (!graph.nonEmpty() || !graph.hasNode(startNode)) return Stream.empty();

  return new GraphBreadthFirstStream(startNode, graph, addVisitedNode);
}

/**
 * Returns a stream of connections that can be reached in the given `graph`
 * starting at the given `startNode`, and using breadth-first traversal. It avoids
 * loops by internally placing the visited nodes in a HashSet builder.
 * @param graph - the graph to traverse
 * @param startNode - the start node within the graph
 * @example
 * const g = EdgeGraphHashed.of([1, 2], [2, 3], [1, 3], [3, 4])
 * const stream = traverseBreadthFirstHashed(g, 1)
 * console.log(stream.toArray())
 * // => [[1, 2], [1, 3], [2, 3], [3, 4]]
 */
export function traverseBreadthFirstHashed<
  G extends VariantGraphBase<N, V>,
  N,
  V
>(graph: G, startNode: N): Stream<LinkType<G, N>> {
  if (!graph.nonEmpty() || !graph.hasNode(startNode)) return Stream.empty();

  const visitSet = HashSet.builder<N>();
  return new GraphBreadthFirstStream(startNode, graph, visitSet.add);
}

/**
 * Returns a stream of connections that can be reached in the given `graph`
 * starting at the given `startNode`, and using breadth-first traversal. It avoids
 * loops by internally placing the visited nodes in a SortedSet builder.
 * @param graph - the graph to traverse
 * @param startNode - the start node within the graph
 * @example
 * const g = EdgeGraphHashed.of([1, 2], [2, 3], [1, 3], [3, 4])
 * const stream = traverseBreadthFirstSorted(g, 1)
 * console.log(stream.toArray())
 * // => [[1, 2], [1, 3], [2, 3], [3, 4]]
 */
export function traverseBreadthFirstSorted<
  G extends VariantGraphBase<N, any>,
  N
>(graph: G, startNode: N): Stream<LinkType<G, N>> {
  if (!graph.nonEmpty() || !graph.hasNode(startNode)) return Stream.empty();

  const visitSet = SortedSet.builder<N>();
  return new GraphBreadthFirstStream(startNode, graph, visitSet.add);
}
