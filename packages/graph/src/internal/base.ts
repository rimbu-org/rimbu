import type { TraverseState } from '@rimbu/common/traverse-state';
import type { ArrayNonEmpty, RelatedTo, ToJSON } from '@rimbu/common/types';
import type { GraphCollection } from '@rimbu/graph/advanced/graph-base';
import type { GraphElement, Link } from '@rimbu/graph/link';
import type {
	FastIterable,
	Stream,
	Streamable,
	StreamSource,
} from '@rimbu/stream';
import type { Reducer } from '@rimbu/stream/reducer';

import type { GraphValues, WithGraphValues } from '#graph/common/base';

export interface GraphBase<N, Tp extends GraphBase.Types = GraphBase.Types>
	extends FastIterable<[N] | WithGraphValues<Tp, N, unknown>['link']> {
	/**
	 * Returns true if the graph is an arrow (directed) graph.
	 */
	readonly isDirected: boolean;
	/**
	 * Returns true if the graph has no nodes.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * ArrowGraphHashed.empty<number>().isEmpty  // => true
	 * ArrowGraphHashed.of([1]).isEmpty          // => false
	 * ```
	 */
	readonly isEmpty: boolean;
	/**
	 * The number of **nodes** in the graph — identical to {@link nodeSize}.
	 *
	 * Note the divergence from every other Rimbu collection: this is *not*
	 * `toArray().length`. A graph's elements are its isolated nodes **and** its
	 * links, so `toArray().length` equals neither `size` nor
	 * {@link connectionSize}. `length` is not offered — it is a banned name, and
	 * its only meaning here would be that third number.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * ArrowGraphHashed.empty<number>().size   // => 0
	 * ArrowGraphHashed.of([1], [2, 3]).size  // => 3
	 * ```
	 */
	readonly size: number;
	/**
	 * Returns the amount of nodes in the graph.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * ArrowGraphHashed.empty<number>().nodeSize  // => 0
	 * ArrowGraphHashed.of([1], [2, 3]).nodeSize  // => 3
	 * ```
	 */
	readonly nodeSize: number;
	/**
	 * Returns the amount of connections in the graph.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * ArrowGraphHashed.empty<number>().connectionSize  // => 0
	 * ArrowGraphHashed.of([1], [2, 3]).connectionSize  // => 1
	 * ```
	 */
	readonly connectionSize: number;
	/**
	 * Returns true if there is at least one node in the collection, and instructs the compiler to treat the collection
	 * as a .NonEmpty type.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
import { Stream } from '@rimbu/stream'
	 * const g: ArrowGraphHashed<number> = ArrowGraphHashed.of([1, 1], [2, 2])
	 * if (g.nonEmpty()) {
	 *   const h: ArrowGraphHashed.NonEmpty<number> = g
	 * }
	 * ```
	 */
	nonEmpty(): this is WithGraphValues<Tp, N, unknown>['nonEmpty'];
	/**
	 * Returns this collection typed as a 'possibly empty' collection. On the
	 * non-empty form see {@link GraphBase.NonEmpty.asNormal}; the empty
	 * form returns `this`.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
const g = ArrowGraphHashed.empty<number>()
g.asNormal() === g   // => true
	 * ```
	 */
	asNormal(): WithGraphValues<Tp, N, unknown>['normal'];
	/**
	 * Returns the collection as a .NonEmpty type
	 * @throws RimbuError.EmptyCollectionAssumedNonEmptyError if the collection is empty
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * ArrowGraphHashed.empty<number>().assumeNonEmpty()   // => throws
	 * const g = ArrowGraphHashed.of([1, 1], [2, 2]).assumeNonEmpty()
	 * ```
	 * @note returns reference to this collection
	 */
	assumeNonEmpty(): WithGraphValues<Tp, N, unknown>['nonEmpty'];
	/**
	 * Returns a `Stream` containing all graph elements of this collection as single tuples for isolated nodes
	 * and 2-valued tuples of nodes for connections.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
	 * ```
	 */
	stream(): Stream<[N] | WithGraphValues<Tp, N, unknown>['link']>;
	/**
	 * Returns a `Stream` containing all nodes of this collection.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()   // => [1, 2, 3]
	 * ```
	 */
	streamNodes(): Stream<N>;
	/**
	 * Returns a `Stream` containing all connections of this collection.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()   // => [[2, 3]]
	 * ```
	 */
	streamConnections(): Stream<WithGraphValues<Tp, N, unknown>['link']>;
	/**
	 * Returns true if the graph contains the given `node`.
	 * @param node - the node to search
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3])
	 * g.hasNode(2)   // => true
	 * g.hasNode(5)   // => false
	 * ```
	 */
	hasNode<UN = N>(node: RelatedTo<N, UN>): boolean;
	/**
	 * Returns true if the graph has a connection between given `node1` and `node2`.
	 * @param node1 - the first connection node
	 * @param node2 - the second connection node
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3])
	 * g.hasConnection(2, 3)   // => true
	 * g.hasConnection(3, 1)   // => false
	 * ```
	 */
	hasConnection<UN = N>(
		node1: RelatedTo<N, UN>,
		node2: RelatedTo<N, UN>,
	): boolean;
	/**
	 * Returns a `Stream` containing all the connections from the given `node1`
	 * @param node1 - the first connection node
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3])
	 * g.getConnectionStreamFrom(2).toArray()   // => [3]
	 * g.getConnectionStreamFrom(5).toArray()   // => []
	 * ```
	 */
	getConnectionStreamFrom<UN = N>(
		node1: RelatedTo<N, UN>,
	): Stream<WithGraphValues<Tp, N, unknown>['link']>;
	/**
	 * Returns a `Stream` containing all the connections to the given `node2`
	 * @param node2 - the second connection node
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3])
	 * g.getConnectionStreamTo(3).toArray()   // => [2]
	 * g.getConnectionStreamTo(5).toArray()   // => []
	 * ```
	 */
	getConnectionStreamTo<UN = N>(
		node2: RelatedTo<N, UN>,
	): Stream<WithGraphValues<Tp, N, unknown>['link']>;
	/**
	 * Returns the graph with the given `node` and all its connections removed.
	 * @param node - the node to remove
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3])
	 * g.removeNode(2).stream().toArray()  // => [[1]]
	 * g.removeNode(6).stream().toArray()  // => [[1], [2, 3]]
	 * ```
	 */
	removeNode<UN = N>(
		node: RelatedTo<N, UN>,
	): WithGraphValues<Tp, N, unknown>['normal'];
	/**
	 * Returns the graph with all nodes in given `nodes` stream removed, together with all their
	 * connections.
	 * @param nodes - a `StreamSource` containing the nodes to remove
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3])
	 * g.removeNodes([2, 3]).stream().toArray()  // => [[1]]
	 * g.removeNodes([4, 5]).stream().toArray()  // => [[1], [2, 3]]
	 * ```
	 */
	removeNodes<UN = N>(
		nodes: StreamSource<RelatedTo<N, UN>>,
	): WithGraphValues<Tp, N, unknown>['normal'];
	/**
	 * Returns the graph with the connection between given `node1` and `node2` removed if it exists.
	 * @param node1 - the first connection node
	 * @param node2 - the second connection node
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3])
	 * g.disconnect(2, 3).stream().toArray()  // => [[1], [2], [3]]
	 * g.disconnect(1, 2).stream().toArray()  // => [[1], [2, 3]]
	 * ```
	 */
	disconnect<UN = N>(
		node1: RelatedTo<N, UN>,
		node2: RelatedTo<N, UN>,
	): WithGraphValues<Tp, N, unknown>['normal'];
	/**
	 * Returns the graph with all connections in given `links` removed if they exist.
	 * @param links - a `StreamSource` containing tuples of nodes representing connections
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3])
	 * g.disconnectEach([[1, 2], [3, 4]]).stream().toArray() // => [[1], [2, 3]]
	 * g.disconnectEach([[2, 3], [3, 4]]).stream().toArray() // => [[1], [2], [3]]
	 * ```
	 */
	disconnectEach<UN = N>(
		links: StreamSource<Link<RelatedTo<N, UN>>>,
	): WithGraphValues<Tp, N, unknown>['normal'];
	/**
	 * Returns the graph with all isolated nodes removed.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3])
	 * g.removeUnconnectedNodes().stream().toArray()   // => [[2, 3]]
	 * ```
	 */
	removeUnconnectedNodes(): WithGraphValues<Tp, N, unknown>['normal'];
	/**
	 * Performs given function `f` for each graph element of the collection.
	 *
	 * Use {@link forEachIndexed} when you need the index or want to stop early.
	 * @param f - the function to perform for each graph element
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
const g = ArrowGraphHashed.of([1], [2, 3])
g.forEach((entry) => {
 *   console.log([entry])
 * })
	 * ```
	 * @note O(N)
	 */
	forEach(
		f: (entry: [N] | WithGraphValues<Tp, N, unknown>['link']) => void,
	): void;
	/**
	 * Performs given function `f` for each entry of the collection, using given `state` as initial traversal state.
	 * @param f - the function to perform for each entry, receiving:<br/>
	 * - `entry`: the next graph element<br/>
	 * - `index`: the index of the element<br/>
	 * - `halt`: a function that, if called, ensures that no new elements are passed
	 * @param options - object containing the following<br/>
	 * - state: (optional) the traverse state
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3], [4])
	 * g.forEachIndexed((entry, i, halt) => {
	 *   console.log([entry]);
	 *   if (i >= 1) halt();
	 * })
	 * // => logs [1]  [2, 3]
	 * ```
	 * @note O(N)
	 */
	forEachIndexed(
		f: (
			entry: [N] | WithGraphValues<Tp, N, unknown>['link'],
			index: number,
			halt: () => void,
		) => void,
		options?: { state?: TraverseState },
	): void;
	/**
	 * Returns an array of all graph elements: a 1-tuple per isolated node and a
	 * link tuple per connection.
	 *
	 * Note this is **not** {@link size} — see that member for why.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
import { ArrowGraphHashed as AGH } from '@rimbu/graph/non-valued/arrow/hashed'
AGH.of([1], [2, 3]).toArray()  // => [[1], [2, 3], [3]]
	 * ```
	 */
	toArray(): ([N] | WithGraphValues<Tp, N, unknown>['link'])[];
	/**
	 * Returns a string representation of this collection.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * ArrowGraphHashed.of([1], [2, 3]).toString()   // => ArrowGraphHashed(1 => [], 2 => [3])
	 * ```
	 */
	toString(): string;
	/**
	 * Returns a JSON representation of this collection.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * ArrowGraphHashed.of([1], [2, 3]).toJSON()
	 * // => { dataType: 'ArrowGraphHashed', value: [[1, []], [2, [3]]] }
	 * ```
	 */
	toJSON(): ToJSON<[N, WithGraphValues<Tp, N, unknown>['linkTarget'][]][]>;
	/**
	 * Returns the nested Map representation of the graph connections.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
import { HashSet } from '@rimbu/hashed'
	 * ArrowGraphHashed.of([1, 2], [2, 3]).linkMap.toArray()
	 * // => [[1, HashSet(2)], [2, HashSet(3)]]
	 * ```
	 */
	readonly linkMap: WithGraphValues<Tp, N, unknown>['linkMap'];
	/**
	 * Returns the `context` associated to this collection instance.
	 */
	readonly context: WithGraphValues<Tp, N, unknown>['context'];
	/**
	 * Returns a Set containing the nodes reachable from given `node1` node as keys,
	 * and their corresponding values.
	 * @param node1 - the node from which to find the connections
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
import { HashSet } from '@rimbu/hashed'
	 * const g = ArrowGraphHashed.of([1, 2], [2, 3])
	 * g.getConnectionsFrom(1)  // => HashSet(2)
	 * g.getConnectionsFrom(3)  // => HashSet()
	 * ```
	 */
	getConnectionsFrom<UN = N>(
		node1: RelatedTo<N, UN>,
	): WithGraphValues<Tp, N, unknown>['linkConnections'];
	/**
	 * Returns the graph where given nodes `node1` and `node2` are connected.
	 * @param node1 - the first node
	 * @param node2 - the second node
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1, 2], [2, 3])
	 * g.connect(3, 1).stream().toArray()
	 * // => [[1, 2], [2, 3], [3, 1]]
	 * ```
	 */
	connect(node1: N, node2: N): WithGraphValues<Tp, N, unknown>['nonEmpty'];
	/**
	 * Returns a builder object containing the entries of this collection.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const builder: ArrowGraphHashed.Builder<number> = ArrowGraphHashed.of([1, 2], [2, 3]).toBuilder()
	 * ```
	 */
	toBuilder(): WithGraphValues<Tp, N, unknown>['builder'];

	/**
	 * Returns the graph with the given `node` added, if it was not yet present.
	 * @param node - the node to add
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3])
	 * g.addNode(4).stream().toArray()  // => [[1], [2, 3], [4]]
	 * g.addNode(1).stream().toArray()  // => [[1], [2, 3]]
	 * ```
	 */
	addNode(node: N): WithGraphValues<Tp, N, unknown>['nonEmpty'];
	/**
	 * Returns the graph with the nodes from the given `nodes` `StreamSource` added.
	 * @param nodes - a `StreamSource` containing the nodes to add
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3])
	 * g.addNodes([4, 1]).stream().toArray()  // => [[1], [2, 3], [4]]
	 * g.addNodes([1, 2]).stream().toArray()  // => [[1], [2, 3]]
	 * ```
	 */
	addNodes(
		nodes: StreamSource.NonEmpty<N>,
	): WithGraphValues<Tp, N, unknown>['nonEmpty'];
	addNodes(nodes: StreamSource<N>): WithGraphValues<Tp, N, unknown>['normal'];
	/**
	 * Returns the graph with the connections from the given `connections` `StreamSource` added.
	 * @param connections - a `StreamSource` containing tuples representing the connections to add
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3])
	 * g.connectEach([[1, 2], [3, 1]]).stream().toArray()  // => [[1, 2], [2, 3], [3, 1]]
	 * const g2 = ArrowValuedGraphHashed.of([1], [2, 3, 'a'])
	 * g2.connectEach([[1, 2, 'b'], [2, 3, 'c']]).stream().toArray()
	 * // => [[1, 2, 'b'], [2, 3, 'c']]
	 * ```
	 */
	connectEach(
		connections: StreamSource.NonEmpty<WithGraphValues<Tp, N, unknown>['link']>,
	): WithGraphValues<Tp, N, unknown>['nonEmpty'];
	connectEach(
		connections: StreamSource<WithGraphValues<Tp, N, unknown>['link']>,
	): WithGraphValues<Tp, N, unknown>['normal'];
}

export namespace GraphBase {
	export interface NonEmpty<N, Tp extends GraphBase.Types = GraphBase.Types>
		extends Omit<
				GraphBase<N, Tp>,
				'nonEmpty' | 'asNormal' | 'toArray' | 'stream' | 'streamNodes'
			>,
			Streamable.NonEmpty<[N] | WithGraphValues<Tp, N, unknown>['link']> {
		/**
		 * Returns false since the graph is known to be non-empty.
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * ArrowGraphHashed.empty<number>().isEmpty  // => true
		 * ArrowGraphHashed.of([1]).isEmpty          // => false
		 * ```
		 */
		readonly isEmpty: false;
		/**
		 * Returns true since this collection is known to be non-empty
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * ArrowGraphHashed.of([1], [2, 3]).nonEmpty()   // => true
		 * ```
		 */
		nonEmpty(): this is WithGraphValues<Tp, N, unknown>['nonEmpty'];
		/**
	 * Returns this collection typed as a 'possibly empty' collection. On the
	 * non-empty form see {@link GraphBase.NonEmpty.asNormal}; the empty
	 * form returns `this`.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
const g = ArrowGraphHashed.empty<number>()
g.asNormal() === g   // => true
	 * ```
	 */
		asNormal(): WithGraphValues<Tp, N, unknown>['normal'];
		/**
		 * Returns this collection typed as a 'possibly empty' collection.
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
		 * ```
		 */
		asNormal(): WithGraphValues<Tp, N, unknown>['normal'];
		/**
		 * Returns a non-empty array of all graph elements. See {@link toArray}.
		 */
		toArray(): ArrayNonEmpty<[N] | WithGraphValues<Tp, N, unknown>['link']>;
		/**
		 * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
		 * and 2-valued tuples of nodes for connections.
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
		 * ```
		 */
		stream(): Stream.NonEmpty<[N] | WithGraphValues<Tp, N, unknown>['link']>;
		/**
		 * Returns a non-empty `Stream` containing all nodes of this collection.
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()   // => [1, 2, 3]
		 * ```
		 */
		streamNodes(): Stream.NonEmpty<N>;

		/**
	 * Returns the non-empty graph with the nodes from the given `nodes` `StreamSource` added.
	 * @param nodes - a `StreamSource` containing the nodes to add
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3])
	 * g.addNodes([4, 1]).stream().toArray()  // => [[1], [2, 3], [4]]
	 * g.addNodes([1, 2]).stream().toArray()  // => [[1], [2, 3]]
	 * ```
	 */
		addNodes(
			nodes: StreamSource<N>,
		): WithGraphValues<Tp, N, unknown>['nonEmpty'];
		/**
	 * Returns the non-empty graph with the connections from the given `connections` `StreamSource` added.
	 * @param connections - a `StreamSource` containing tuples representing the connections to add
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3])
	 * g.connectEach([[1, 2], [3, 1]]).stream().toArray()  // => [[1, 2], [2, 3], [3, 1]]
	 * const g2 = ArrowValuedGraphHashed.of([1], [2, 3, 'a'])
	 * g2.connectEach([[1, 2, 'b'], [2, 3, 'c']]).stream().toArray()
	 * // => [[1, 2, 'b'], [2, 3, 'c']]
	 * ```
	 */
		connectEach(
			links: StreamSource<WithGraphValues<Tp, N, unknown>['link']>,
		): WithGraphValues<Tp, N, unknown>['nonEmpty'];

		/**
		 * Returns the nested non-empty Map representation of the graph connections.
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
import { HashSet } from '@rimbu/hashed'
		 * ArrowGraphHashed.of([1, 2], [2, 3]).linkMap.toArray()
		 * // => [[1, HashSet(2)], [2, HashSet(3)]]
		 * ```
		 */
		readonly linkMap: WithGraphValues<Tp, N, unknown>['linkMapNonEmpty'];
		/**
		 * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
		 * and 2-valued tuples of nodes for connections.
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
		 * ```
		 */
		stream(): Stream.NonEmpty<GraphElement<N>>;
	}

	export interface Builder<N, Tp extends GraphBase.Types = GraphBase.Types> {
		/**
		 * Returns the `context` associated to this collection instance.
		 */
		readonly context: WithGraphValues<Tp, N, unknown>['context'];
		/**
		 * Returns true if there are no entries in the builder.
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * ArrowGraphHashed
		 *  .builder<number>()
		 *  .isEmpty
		 * // => false
		 * ```
		 */
		readonly isEmpty: boolean;
		/**
		 * Returns the amount of nodes in the graph.
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * ArrowGraphHashed
		 *  .builder<number>()
		 *  .nodeSize
		 * // => 3
		 * ```
		 */
		readonly nodeSize: number;
		/**
		 * Returns the amount of connections in the graph.
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * ArrowGraphHashed
		 *  .builder<number>()
		 *  .connectionSize
		 * // => 2
		 * ```
		 */
		readonly connectionSize: number;
		/**
		 * Returns true if the graph contains the given `node`.
		 * @param node - the node to search
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * const b = ArrowGraphHashed
		 *  .builder<number>()
		 * b.hasNode(1)   // => true
		 * b.hasNode(6)   // => false
		 * ```
		 */
		hasNode<UN = N>(node: RelatedTo<N, UN>): boolean;
		/**
		 * Returns true if the graph has a connection between given nodes `node1` and `node2`.
		 * @param node1 - the first connection node
		 * @param node2 - the second connection node
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * const b = ArrowGraphHashed
		 *  .builder<number>()
		 * b.hasConnection(1, 2)   // => true
		 * b.hasConnection(6, 7)   // => false
		 * ```
		 */
		hasConnection<UN = N>(
			node1: RelatedTo<N, UN>,
			node2: RelatedTo<N, UN>,
		): boolean;
		/**
		 * Adds the given `node` to the graph.
		 * @param node - the node to add
		 * @returns true if the node was not already present
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * const b = ArrowGraphHashed
		 *  .builder<number>()
		 * b.addNode(6)   // => true
		 * b.addNode(1)   // => false
		 * ```
		 */
		addNode(node: N): boolean;
		/**
		 * Adds the given `nodes` to the builder.
		 * @param nodes - a `StreamSource` containing the nodes to add
		 * @returns true if any of the nodes was not yet present
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * const b = ArrowGraphHashed
		 *  .builder<number>()
		 * b.addNodes([3, 4, 5]) // => true
		 * b.addNodes([1, 2])    // => false
		 * ```
		 */
		addNodes(nodes: StreamSource<N>): boolean;
		/**
		 * Adds the given `element` graph element to the builder, where a graph element
		 * is either a one-element tuple containing a node, or a two-element tuple containing
		 * two nodes indicating a connection.
		 * @param element - the graph element to add
		 * @returns true if the builder has changed
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * const b = ArrowGraphHashed
		 *  .builder<number>()
		 * b.addGraphElement([1])  // => false
		 * b.addGraphElement([4])  // => true
		 * b.addGraphElement([2, 3])  // => false
		 * b.addGraphElement([4, 1])  // => true
		 * ```
		 */
		addGraphElement(element: GraphElement<N>): boolean;
		/**
		 * Adds the graph elements in the given `elements` StreamSource to the graph.
		 * @param elements - a `StreamSource` containing elements that represent either a single node or a valued connection
		 * @returns true if the graph has changed
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * const b = ArrowGraphHashed
		 *  .builder<number>()
		 * b.addGraphElements([[4], [5]])      // => true
		 * b.addGraphElements([[3, 1], [1]])  // => true
		 * b.addGraphElements([[1, 2], [1]])  // => false
		 * ```
		 */
		addGraphElements(elements: StreamSource<GraphElement<N>>): boolean;
		/**
		 * Removes the given `node`, and any of its connections, from the graph.
		 * @param node - the node to remove
		 * @returns true if the node was present
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * const b = ArrowGraphHashed
		 *  .builder<number>()
		 * b.removeNode(1)  // => true
		 * b.removeNode(6)  // => false
		 * ```
		 */
		removeNode<UN = N>(node: RelatedTo<N, UN>): boolean;
		/**
		 * Removes the given `nodes`, and any of their connections, from the graph.
		 * @param nodes - a `StreamSource` containing the nodes to remove
		 * @returns true if any of the nodes were present
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * const b = ArrowGraphHashed
		 *  .builder<number>()
		 * b.removeNodes([1, 6, 7])  // => true
		 * b.removeNodes([6, 7])     // => false
		 * ```
		 */
		removeNodes<UN = N>(nodes: StreamSource<RelatedTo<N, UN>>): boolean;
		/**
		 * Adds a connection between `node1` and `node2` to the graph.
		 * @param node1 - the first connection node
		 * @param node2 - the second connection node
		 * @returns true if the connection did not exist
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * const b = ArrowGraphHashed
		 *  .builder<number>()
		 * b.connect(3, 1)  // => true
		 * b.connect(1, 2)  // => false
		 * ```
		 */
		connect(node1: N, node2: N): boolean;
		/**
		 * Adds the connections in given `connections` `StreamSource` to the graph.
		 * @param connections - a `StreamSource` containing the connection definitions to add
		 * @returns true if any of the connections changed the collection
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * const b = ArrowGraphHashed
		 *  .builder<number>()
		 * b.connectEach([[1, 2], [3, 1]])   // => true
		 * b.connectEach([[1, 2]])           // => false
		 * ```
		 */
		connectEach(
			connections: StreamSource<WithGraphValues<Tp, N, unknown>['link']>,
		): boolean;
		/**
		 * Adds a connection between given `node1` and `node2` nodes only if both
		 * nodes exist in the graph.
		 * @returns true if the graph has changed
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * const b = ArrowGraphHashed
		 *  .builder<number>()
		 * b.connectIfNodesExist(3, 1)   // => true
		 * b.connectIfNodesExist(3, 4)   // => false
		 * ```
		 */
		connectIfNodesExist(node1: N, node2: N): boolean;
		/**
		 * Removes the connection between given `node1` and `node2` if the connection was present.
		 * @param node1 - the first connection node
		 * @param node2 - the second connection node
		 * @returns true if the collection changed
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * const b = ArrowGraphHashed
		 *  .builder<number>()
		 * b.disconnect(1, 2)  // => true
		 * b.disconnect(3, 4)  // => false
		 * ```
		 */
		disconnect<UN = N>(
			node1: RelatedTo<N, UN>,
			node2: RelatedTo<N, UN>,
		): boolean;
		/**
		 * Removes all connections from the given `connections` `StreamSource` from the graph.
		 * @param connections - a `StreamSource` containing the tuples defining the nodes of the connections to remove
		 * @returns true if the collection changed
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * const b = ArrowGraphHashed
		 *  .builder<number>()
		 * b.disconnectEach([[1, 2], [3, 4]])  // => true
		 * b.disconnectEach([[3, 4], [5, 6]])  // => false
		 * ```
		 */
		disconnectEach<UN = N>(
			connections: StreamSource<Link<RelatedTo<N, UN>>>,
		): boolean;
		/**
		 * Performs given function `f` for each graph element in this builder.
		 *
		 * Use {@link forEachIndexed} when you need the index or want to stop early.
		 * @param f - the function to perform for each graph element
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
const b = ArrowGraphHashed.of([1], [2, 3], [4]).toBuilder()
b.forEach((entry) => {
 *   console.log([entry])
 * })
		 * ```
		 * @note O(N)
		 */
		forEach(
			f: (entry: [N] | WithGraphValues<Tp, N, unknown>['link']) => void,
		): void;
		/**
		 * Performs given function `f` for each entry of the collection, using given `state` as initial traversal state.
		 * @param f - the function to perform for each entry, receiving:<br/>
		 * - `entry`: the next graph element<br/>
		 * - `index`: the index of the element<br/>
		 * - `halt`: a function that, if called, ensures that no new elements are passed
		 * @param options - object containing the following<br/>
		 * - state: (optional) the traverse state
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * const b = ArrowGraphHashed.of([1], [2, 3], [4]).toBuilder();
		 * b.forEachIndexed((entry, i, halt) => {
		 *   console.log([entry]);
		 *   if (i >= 1) halt();
		 * })
		 * // => logs [1]  [2, 3]
		 * ```
		 * @note O(N)
		 */
		forEachIndexed(
			f: (
				entry: [N] | WithGraphValues<Tp, N, unknown>['link'],
				index: number,
				halt: () => void,
			) => void,
			options?: { state?: TraverseState },
		): void;
		/**
		 * Removes every node and connection from this builder, returning it to the
		 * empty state. The builder stays usable afterwards.
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
const b = ArrowGraphHashed.of([1], [2, 3]).toBuilder()
b.clear()
b.isEmpty    // => true
		 * ```
		 * @note O(1)
		 */
		clear(): void;
		/**
		 * Returns an immutable Graph containing the links in this Builder instance.
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * const b = ArrowGraphHashed.builder<number>()
		 * b.connect(1, 2)
		 * b.addNode(3)
		 * const g = b.build()
		 * console.log(g.stream().toArray())
		 * // => [[1, 2], [3]]
		 * ```
		 */
		build(): WithGraphValues<Tp, N, unknown>['normal'];
	}

	export interface Factory<Tp extends GraphBase.Types, UN = unknown> {
		/**
		 * Returns the (singleton) empty instance of this type and context with given key and value types.
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * ArrowGraphHashed.empty<number>()    // => ArrowGraphHashed<number>
		 * ArrowGraphHashed.empty<string>()    // => ArrowGraphHashed<string>
		 * ```
		 */
		empty<N extends UN>(): WithGraphValues<Tp, N, unknown>['normal'];
		/**
		 * Returns an immutable valued Graph instance containing the graph elements from the given
		 * `graphElements`.
		 * @param graphElements - a non-empty array of graph elements that are either a single tuple containing a node, or a triplet containing
		 * two connection nodes and the connection value.
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * ArrowGraphHashed.of([1], [2], [3, 4]) // => ArrowGraphHashed.NonEmpty<number>
		 * ```
		 */
		of<N extends UN>(
			...graphElements: ArrayNonEmpty<GraphElement<N>>
		): WithGraphValues<Tp, N, unknown>['nonEmpty'];
		/**
		 * Returns an immutable valued Graph, containing the graph elements from each of the
		 * given `sources`.
		 * @param sources - an array of `StreamSource` instances containing graph elements to add
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * ArrowGraphHashed.from([[1], [2]], [[3, 4]])  // => ArrowGraphHashed.NonEmpty<number>
		 * ```
		 */
		from<N extends UN>(
			...sources: ArrayNonEmpty<StreamSource.NonEmpty<GraphElement<N>>>
		): WithGraphValues<Tp, N, unknown>['nonEmpty'];
		from<N extends UN>(
			...sources: ArrayNonEmpty<StreamSource<GraphElement<N>>>
		): WithGraphValues<Tp, N, unknown>['normal'];
		/**
		 * Returns an empty builder instance.
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * ArrowValuedGraphHashed.builder<number, string>()    // => ArrowValuedGraphHashed.Builder<number, string>
		 * ```
		 */
		builder<N extends UN>(): WithGraphValues<Tp, N, unknown>['builder'];
		/**
		 * Returns a `Reducer` that adds received graph elements to a Graph and returns the Graph as a result. When a `source` is given,
		 * the reducer will first create a graph from the source, and then add graph elements to it.
		 * @param source - (optional) an initial source of graph elements to add to
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
import { Stream } from '@rimbu/stream'
import { ArrayNonEmpty } from '@rimbu/common/types'
import { GraphElement } from '@rimbu/graph/link'
		 * const someSource: ArrayNonEmpty<GraphElement<number>> = [[1, 2], [3], [5]];
		 * const result = Stream.of<GraphElement<number>>([1, 3], [4, 3]).reduce(ArrowGraphHashed.reducer(someSource))
		 * result.stream().toArray()   // => [[1, 2], [1, 3], [4, 3], [5]]
		 * ```
		 * @note uses a builder under the hood. If the given `source` is a Graph in the same context, it will directly call `.toBuilder()`.
		 */
		reducer<N extends UN>(
			source?: StreamSource.NonEmpty<GraphElement<N>>,
		): Reducer<GraphElement<N>, WithGraphValues<Tp, N, unknown>['normal']>;
	}

	export interface Context<UN, Tp extends GraphBase.Types = GraphBase.Types>
		extends Factory<Tp, UN> {
		readonly _fixedType: UN;

		/**
		 * A string tag defining the specific collection type
		 * @example
		 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
		 * ArrowGraphHashed.defaultContext().typeTag   // => 'ArrowGraphHashed'
		 * ```
		 */
		readonly typeTag: string;
		/**
		 * The `context` instance used to create internal link maps
		 */
		readonly linkMapContext: WithGraphValues<Tp, UN, unknown>['linkMapContext'];
		/**
		 * The `context` instance used to create internal connection collections
		 */
		readonly linkConnectionsContext: WithGraphValues<
			Tp,
			UN,
			unknown
		>['linkConnectionsContext'];

		/**
		 * Returns true if the graphs created by this context are arrow (directed) graphs.
		 */
		readonly isDirected: boolean;
	}

	/**
	 * Utility interface that provides higher-kinded types for this collection.
	 */
	export interface Types extends GraphValues<unknown> {
		readonly normal: GraphBase<this['_N']>;
		readonly nonEmpty: GraphBase.NonEmpty<this['_N']>;
		readonly link: Link<this['_N']>;
		readonly linkTarget: Link.Target<this['_N']>;
		readonly context: GraphBase.Context<this['_N']>;
		readonly builder: GraphBase.Builder<this['_N']>;

		/**
		 * The family a node's connection set is built from. Pinned per variant;
		 * every storage member below is derived from it rather than restated.
		 */
		readonly _LINK_CONNECTIONS_FAM: GraphCollection.Advanced.LinkConnectionsFamily<any>;
		/**
		 * The family the outer link map is built from. Its value type is derived
		 * from {@link Types._LINK_CONNECTIONS_FAM} so each fact is named once per
		 * variant instead of seven times.
		 *
		 * The slot is declared with `any` parameters here — the leaf variants
		 * narrow it to the concrete family. Widening is required, not cosmetic:
		 * `ModifyOptions` makes a map invariant in its value type, so a concrete
		 * `HashMap<N, HashSet<N>>` is *not* assignable to the abstract
		 * `MapCollection.Advanced.Api`, and a narrow declaration would make every
		 * leaf `Types` fail its `extends` constraint.
		 */
		readonly _LINK_MAP_FAM: GraphCollection.Advanced.LinkMapFamily<any, any>;

		readonly linkMap: this['_LINK_MAP_FAM']['_NORMAL'];
		readonly linkMapNonEmpty: this['_LINK_MAP_FAM']['_NON_EMPTY'];
		readonly linkMapContext: this['_LINK_MAP_FAM']['_CONTEXT'];
		readonly linkMapBuilder: this['_LINK_MAP_FAM']['_BUILDER'];
		readonly linkConnections: this['_LINK_CONNECTIONS_FAM']['_NORMAL'];
		readonly linkConnectionsBuilder: this['_LINK_CONNECTIONS_FAM']['_BUILDER'];
		readonly linkConnectionsContext: this['_LINK_CONNECTIONS_FAM']['_CONTEXT'];
	}
}
