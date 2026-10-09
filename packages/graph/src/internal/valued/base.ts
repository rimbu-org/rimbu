import type { ModifyOptions } from '@rimbu/collection-types/advanced/common';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { ArrayNonEmpty, RelatedTo, ToJSON } from '@rimbu/common/types';
import type {
	GraphCollection,
	ValuedGraphCollection,
} from '@rimbu/graph/advanced/graph-base';
import type { Link } from '@rimbu/graph/link';
import type { ValuedGraphElement, ValuedLink } from '@rimbu/graph/valued-link';
import type {
	FastIterable,
	Stream,
	Streamable,
	StreamSource,
} from '@rimbu/stream';
import type { Reducer } from '@rimbu/stream/reducer';

import type { GraphValues, WithGraphValues } from '#graph/common/base';

export interface ValuedGraphBase<
	N,
	V,
	Tp extends ValuedGraphBase.Types = ValuedGraphBase.Types,
> extends FastIterable<[N] | WithGraphValues<Tp, N, V>['link']> {
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
	nonEmpty(): this is WithGraphValues<Tp, N, V>['nonEmpty'];
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
	asNormal(): WithGraphValues<Tp, N, V>['normal'];
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
	assumeNonEmpty(): WithGraphValues<Tp, N, V>['nonEmpty'];
	/**
	 * Returns a `Stream` containing all graph elements of this collection as single tuples for isolated nodes
	 * and 2-valued tuples of nodes for connections.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
	 * ```
	 */
	stream(): Stream<[N] | WithGraphValues<Tp, N, V>['link']>;
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
	streamConnections(): Stream<WithGraphValues<Tp, N, V>['link']>;
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
	): Stream<WithGraphValues<Tp, N, V>['link']>;
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
	): Stream<WithGraphValues<Tp, N, V>['link']>;
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
	): WithGraphValues<Tp, N, V>['normal'];
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
	): WithGraphValues<Tp, N, V>['normal'];
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
	): WithGraphValues<Tp, N, V>['normal'];
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
	): WithGraphValues<Tp, N, V>['normal'];
	/**
	 * Returns the graph with all isolated nodes removed.
	 * @example
	 * ```ts
import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed'
	 * const g = ArrowGraphHashed.of([1], [2, 3])
	 * g.removeUnconnectedNodes().stream().toArray()   // => [[2, 3]]
	 * ```
	 */
	removeUnconnectedNodes(): WithGraphValues<Tp, N, V>['normal'];
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
	forEach(f: (entry: [N] | WithGraphValues<Tp, N, V>['link']) => void): void;
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
			entry: [N] | WithGraphValues<Tp, N, V>['link'],
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
	toArray(): ([N] | WithGraphValues<Tp, N, V>['link'])[];
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
	toJSON(): ToJSON<[N, WithGraphValues<Tp, N, V>['linkTarget'][]][]>;

	/**
	 * Returns the nested Map representation of the graph connections.
	 * @example
	 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
import { HashMap } from '@rimbu/hashed'
	 * ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).linkMap.toArray()
	 * // => [[1, HashMap(2 -> 'a')], [2, HashMap(3 -> 'b')]]
	 * ```
	 */
	readonly linkMap: WithGraphValues<Tp, N, V>['linkMap'];
	/**
	 * Returns the value of the connection between given `node1` and `node2`
	 * @param node1 - the first connection node
	 * @param node2 - the second connection node
	 * @param otherwise - (default: undefined) the fallback value to return if the connection does not exist
	 * @example
	 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
	 * const g = ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b'])
	 * g.getValue(1, 2) // => 'a'
	 * g.getValue(3, 4) // => undefined
	 * g.getValue(1, 2, 'z')  // => 'a'
	 * g.getValue(3, 4, 'z')  // => 'z'
	 * ```
	 */
	getValue<UN = N>(
		node1: RelatedTo<N, UN>,
		node2: RelatedTo<N, UN>,
	): V | undefined;
	getValue<UN, O>(
		node1: RelatedTo<N, UN>,
		node2: RelatedTo<N, UN>,
		otherwise: OptLazy<O>,
	): V | O;
	/**
	 * Returns a graph with the same connections, but where the given `mapFun` function is applied to each connection value.
	 * @param mapFun - a function taking a `value` and connection's `node1` and `node2`, and returning a new value
	 * @example
	 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
	 * ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'bc']).mapValues(v => v.length).stream().toArray()
	 * // => [[1, 2, 1], [2, 3, 2]]
	 * ```
	 */
	mapValues<V2>(
		mapFun: (value: V, node1: N, node2: N) => V2,
	): WithGraphValues<Tp, N, V2>['normal'];
	/**
	 * Returns the `context` associated to this collection instance.
	 */
	readonly context: WithGraphValues<Tp, N, V>['context'];
	/**
	 * Returns a Map containing the nodes and connection values reachable from given `node1` node as keys,
	 * and their corresponding values.
	 * @param node1 - the node from which to find the connections
	 * @example
	 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
import { HashMap } from '@rimbu/hashed'
	 * const g = ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b'])
	 * g.getConnectionsFrom(1)  // => HashMap(2 -> 'a')
	 * g.getConnectionsFrom(3)  // => HashMap()
	 * ```
	 */
	getConnectionsFrom<UN = N>(
		node1: RelatedTo<N, UN>,
	): WithGraphValues<Tp, N, V>['linkConnections'];
	/**
	 * Returns the graph where given nodes `node1` and `node2` are connected with
	 * the given `value`.
	 * @param node1 - the first node
	 * @param node2 - the second node
	 * @param value - the connection value
	 * @example
	 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
	 * const g = ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b'])
	 * g.connect(3, 1, 'c').stream().toArray()
	 * // => [[1, 2, 'a'], [2, 3, 'b'], [3, 1, 'c']]
	 * ```
	 */
	connect(node1: N, node2: N, value: V): WithGraphValues<Tp, N, V>['nonEmpty'];
	/**
	 * Returns the graph with the connection between given `node1` and `node2` modified according to given `options`.
	 * @param node1 - the first connection node
	 * @param node2 - the second connection node
	 * @param options - an object containing the following information:<br/>
	 * - ifNew: (optional) if the given connection is not present in the collection, this value or function will be used
	 * to generate a new connection. If a function returning the token argument is given, no new entry is created.<br/>
	 * - ifExists: (optional) if a value is associated with given connection, this function is called with the given value
	 * to return a new value. As a second argument, a `remove` token is given. If the function returns this token, the current
	 * connection is removed.
	 * @example
	 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
	 * const g = ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b'])
	 * g.modifyAt(3, 4, { ifNew: { set: 'c' } }).stream().toArray()
	 * // => [[1, 2, 'a'], [2, 3, 'b'], [3, 4, 'c']]
	 * g.modifyAt(3, 4, { ifNew: { create: () => 'c' } }).stream().toArray()
	 * // => [[1, 2, 'a'], [2, 3, 'b']]
	 * g.modifyAt(1, 2, { ifExists: { set: 'c' } }).stream().toArray()
	 * // => [[1, 2, 'c'], [2, 3, 'b']]
	 * g.modifyAt(1, 2, { ifExists: { update: (v) => v + 'z' } }).stream().toArray()
	 * // => [[1, 2, 'az'], [2, 3, 'b']]
	 * g.modifyAt(2, 3, { ifExists: { update: (v, remove) => v === 'a' ? v : remove } }).stream().toArray()
	 * // => [[1, 2, 'a']]
	 * ```
	 */
	modifyAt(
		node1: N,
		node2: N,
		options: ModifyOptions<V>,
	): WithGraphValues<Tp, N, V>['normal'];
	/**
	 * Returns a builder object containing the entries of this collection.
	 * @example
	 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
	 * const builder: ArrowValuedGraphHashed.Builder<number, string> = ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).toBuilder()
	 * ```
	 */
	toBuilder(): WithGraphValues<Tp, N, V>['builder'];

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
	addNode(node: N): WithGraphValues<Tp, N, V>['nonEmpty'];
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
	): WithGraphValues<Tp, N, V>['nonEmpty'];
	addNodes(nodes: StreamSource<N>): WithGraphValues<Tp, N, V>['normal'];
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
		connections: StreamSource.NonEmpty<WithGraphValues<Tp, N, V>['link']>,
	): WithGraphValues<Tp, N, V>['nonEmpty'];
	connectEach(
		connections: StreamSource<WithGraphValues<Tp, N, V>['link']>,
	): WithGraphValues<Tp, N, V>['normal'];
}

export namespace ValuedGraphBase {
	export interface NonEmpty<
		N,
		V,
		Tp extends ValuedGraphBase.Types = ValuedGraphBase.Types,
	> extends Omit<
				ValuedGraphBase<N, V, Tp>,
				| 'nonEmpty'
				| 'asNormal'
				| 'stream'
				| 'streamNodes'
				| 'toArray'
				| 'addNodes'
				| 'connectEach'
				| 'getValue'
				| 'mapValues'
			>,
			Streamable.NonEmpty<ValuedGraphElement<N, V>> {
		/**
		 * Returns the nested non-empty Map representation of the graph connections.
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
import { HashMap } from '@rimbu/hashed'
		 * ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).linkMap.toArray()
		 * // => [[1, HashMap(2 -> 'a')], [2, HashMap(3 -> 'b')]]
		 * ```
		 */
		readonly linkMap: WithGraphValues<Tp, N, V>['linkMapNonEmpty'];
		/**
		 * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
		 * and 3-valued tuples containing the source node, target node, and connection value for connections.
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
		 * // => [[1, 2, 'a'], [2, 3, 'b']]
		 * ```
		 */
		stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
		/**
		 * Returns a non-empty graph with the same connections, but where the given `mapFun` function is applied to each connection value.
		 * @param mapFun - a function taking a `value` and connection's `node1` and `node2`, and returning a new value
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'bc']).mapValues(v => v.length).stream().toArray()
		 * // => [[1, 2, 1], [2, 3, 2]]
		 * ```
		 */
		mapValues<V2>(
			mapFun: (value: V, node1: N, node2: N) => V2,
		): WithGraphValues<Tp, N, V2>['nonEmpty'];

		/**
		 * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
		 * and 3-valued tuples containing the source node, target node, and connection value for connections.
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
		 * // => [[1, 2, 'a'], [2, 3, 'b']]
		 * ```
		 */
		stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
	}

	export interface Builder<
		N,
		V,
		Tp extends ValuedGraphBase.Types = ValuedGraphBase.Types,
	> {
		/**
		 * Returns the `context` associated to this collection instance.
		 */
		readonly context: WithGraphValues<Tp, N, V>['context'];
		/**
		 * Returns true if there are no entries in the builder.
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * ArrowValuedGraphHashed
		 *  .builder<number, string>()
		 *  .isEmpty
		 * // => false
		 * ```
		 */
		readonly isEmpty: boolean;
		/**
		 * Returns the amount of nodes in the graph.
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * ArrowValuedGraphHashed
		 *  .builder<number, string>()
		 *  .nodeSize
		 * // => 3
		 * ```
		 */
		readonly nodeSize: number;
		/**
		 * Returns the amount of connections in the graph.
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * ArrowValuedGraphHashed
		 *  .builder<number, string>()
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
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
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
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
		 * b.hasConnection(1, 2)   // => true
		 * b.hasConnection(6, 7)   // => false
		 * ```
		 */
		hasConnection<UN = N>(
			node1: RelatedTo<N, UN>,
			node2: RelatedTo<N, UN>,
		): boolean;
		/**
		 * Returns the value associated with the connection between `node1` and `node2`, or given `otherwise` value if the key is not in the collection.
		 * @param node1 - the first connection node
		 * @param node2 - the second connection node
		 * @param otherwise - (default: undefined) the fallback value to return if the connection is not present
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
		 * b.getValue(2, 3)          // => 'b'
		 * b.getValue(3, 4)          // => undefined
		 * b.getValue(2, 3, 'none')  // => 'b'
		 * b.getValue(3, 4, 'none')  // => 'none'
		 * ```
		 */
		getValue<UN = N>(
			node1: RelatedTo<N, UN>,
			node2: RelatedTo<N, UN>,
		): V | undefined;
		getValue<UN, O>(
			node1: RelatedTo<N, UN>,
			node2: RelatedTo<N, UN>,
			otherwise: OptLazy<O>,
		): V | O;
		/**
		 * Adds the given `node` to the graph.
		 * @param node - the node to add
		 * @returns true if the node was not already present
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
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
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
		 * b.addNodes([3, 4, 5]) // => true
		 * b.addNodes([1, 2])    // => false
		 * ```
		 */
		addNodes(nodes: StreamSource<N>): boolean;
		/**
		 * Adds the given `element` graph element to the graph.
		 * @param element - an object representing either a single node or a valued connection
		 * @returns true if the element was not already in the graph
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
		 * b.addGraphElement([4])         // => true
		 * b.addGraphElement([3, 1, 'c']) // => true
		 * b.addGraphElement([1, 2, 'a']) // => false
		 * ```
		 */
		addGraphElement(element: ValuedGraphElement<N, V>): boolean;
		/**
		 * Adds the graph elements in the given `elements` StreamSource to the graph.
		 * @param elements - a `StreamSource` containing elements that represent either a single node or a valued connection
		 * @returns true if the graph has changed
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
		 * b.addGraphElements([[4], [5]])          // => true
		 * b.addGraphElements([[3, 1, 'c'], [1]])  // => true
		 * b.addGraphElements([[1, 2, 'a'], [1]])  // => false
		 * ```
		 */
		addGraphElements(elements: StreamSource<ValuedGraphElement<N, V>>): boolean;
		/**
		 * Removes the given `node`, and any of its connections, from the graph.
		 * @param node - the node to remove
		 * @returns true if the node was present
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
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
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
		 * b.removeNodes([1, 6, 7])  // => true
		 * b.removeNodes([6, 7])     // => false
		 * ```
		 */
		removeNodes<UN = N>(nodes: StreamSource<RelatedTo<N, UN>>): boolean;
		/**
		 * Adds a connection between `node1` and `node2` to the graph with given `value`.
		 * @param node1 - the first connection node
		 * @param node2 - the second connection node
		 * @param value - the connection value
		 * @returns true if the connection did not exist, or if the given value differs from the previous value
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
		 * b.connect(3, 1, 'c')  // => true
		 * b.connect(1, 2, 'a')  // => false
		 * b.connect(1, 2, 'z')  // => true
		 * ```
		 */
		connect(node1: N, node2: N, value: V): boolean;
		/**
		 * Adds the connections in given `connections` `StreamSource` to the graph.
		 * @param connections - a `StreamSource` containing the connection definitions to add
		 * @returns true if any of the connections changed the collection
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
		 * b.connectEach([[1, 2, 'a'], [3, 1, 'c']]) // => true
		 * b.connectEach([[1, 2, 'a']])              // => false
		 * ```
		 */
		connectEach(
			connections: StreamSource<WithGraphValues<Tp, N, V>['link']>,
		): boolean;
		/**
		 * Modifies the graph at the connection between given `node1` and `node2` modified according to given `options`.
		 * @param node1 - the first connection node
		 * @param node2 - the second connection node
		 * @param options - an object containing the following information:<br/>
		 * - ifNew: (optional) if the given connection is not present in the collection, this value or function will be used
		 * to generate a new connection. If a function returning the token argument is given, no new entry is created.<br/>
		 * - ifExists: (optional) if a value is associated with given connection, this function is called with the given value
		 * to return a new value. As a second argument, a `remove` token is given. If the function returns this token, the current
		 * connection is removed.
		 * @returns true if the collection changed
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
		 * b.modifyAt(3, 4, { ifNew: { set: 'c' } })                           // => true
		 * b.modifyAt(4, 5, { ifNew: { create: () => 'c' } })  // => false
		 * b.modifyAt(1, 2, { ifNew: { set: 'a' } })                           // => false
		 * b.modifyAt(1, 2, { ifExists: { set: 'c' } })                        // => false
		 * b.modifyAt(1, 2, { ifExists: { update: (v) => v + 'z' } })               // => true
		 * b.modifyAt(2, 3, { ifExists: { update: (v, remove) => v === 'a' ? v : remove } })
		 * // => true
		 * ```
		 */
		modifyAt(node1: N, node2: N, options: ModifyOptions<V>): boolean;
		/**
		 * Removes the connection between given `node1` and `node2` if the connection was present.
		 * @param node1 - the first connection node
		 * @param node2 - the second connection node
		 * @returns true if the collection changed
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
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
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
		 * b.disconnectEach([[1, 2], [3, 4]])  // => true
		 * b.disconnectEach([[3, 4], [5, 6]])  // => false
		 * ```
		 */
		disconnectEach<UN = N>(
			connections: StreamSource<Link<RelatedTo<N, UN>>>,
		): boolean;
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
		 * b.forEach((entry, i, halt) => {
		 *   console.log([entry]);
		 *   if (i >= 1) halt();
		 * })
		 * // => logs [1]  [2, 3]
		 * ```
		 * @note O(N)
		 */
		/**
		 * Performs given function `f` for each graph element in this builder.
		 *
		 * Use {@link forEachIndexed} when you need the index or want to stop early.
		 * @param f - the function to perform for each graph element
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
const b = ArrowValuedGraphHashed.of([1, 2, 'a']).toBuilder()
b.forEach((entry) => {
 *   console.log([entry])
 * })
		 * ```
		 * @note O(N)
		 */
		forEach(f: (entry: [N] | WithGraphValues<Tp, N, V>['link']) => void): void;
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
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
const b = ArrowValuedGraphHashed.of([1, 2, 'a']).toBuilder()
b.forEachIndexed((entry, i, halt) => {
 *   console.log([entry]);
 *   if (i >= 1) halt();
 * })
		 * // => logs the elements
		 * ```
		 * @note O(N)
		 */
		forEachIndexed(
			f: (
				entry: [N] | WithGraphValues<Tp, N, V>['link'],
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
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
const b = ArrowValuedGraphHashed.of([1, 2, 'a']).toBuilder()
b.clear()
b.isEmpty    // => true
		 * ```
		 * @note O(1)
		 */
		clear(): void;
		/**
		 * Returns an immutable graph containing the nodes and connections of this builder.
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
		 * const g: ArrowValuedGraphHashed<number, string> = b.build()
		 * ```
		 */
		build(): WithGraphValues<Tp, N, V>['normal'];
		/**
		 * Returns an immutable graph containing the nodes and connections of this builder, where the values are mapped
		 * using the given `mapFun` function.
		 * @param mapFun - a function taking the value
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * const b = ArrowValuedGraphHashed
		 *  .builder<number, string>()
		 * const g: ArrowValuedGraphHashed<number, string> = b.buildMapValues(v => v.toUpperCase())
		 * ```
		 */
		buildMapValues<V2>(
			mapFun: (value: V, node1: N, node2: N) => V2,
		): WithGraphValues<Tp, N, V2>['normal'];
	}

	export interface Factory<Tp extends ValuedGraphBase.Types, UN = unknown> {
		/**
		 * Returns the (singleton) empty instance of this type and context with given key and value types.
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * ArrowValuedGraphHashed.empty<number, string>()    // => ArrowValuedGraphHashed<number, string>
		 * ArrowValuedGraphHashed.empty<string, boolean>()   // => ArrowValuedGraphHashed<string, boolean>
		 * ```
		 */
		empty<N extends UN, V>(): WithGraphValues<Tp, N, V>['normal'];
		/**
		 * Returns an immutable valued Graph instance containing the graph elements from the given
		 * `graphElements`.
		 * @param graphElements - a non-empty array of graph elements that are either a single tuple containing a node, or a triplet containing
		 * two connection nodes and the connection value.
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * ArrowValuedGraphHashed.of([1], [2], [3, 4, 'a']) // => ArrowValuedGraphHashed.NonEmpty<number, string>
		 * ```
		 */
		of<N extends UN, V>(
			...graphElements: ArrayNonEmpty<ValuedGraphElement<N, V>>
		): WithGraphValues<Tp, N, V>['nonEmpty'];
		/**
		 * Returns an immutable valued Graph, containing the graph elements from each of the
		 * given `sources`.
		 * @param sources - an array of `StreamSource` instances containing graph elements to add
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * ArrowValuedGraphHashed.from([[1], [2]], [[3, 4, 'c']])  // => ArrowValuedGraphHashed.NonEmpty<number, string>
		 * ```
		 */
		from<N extends UN, V>(
			...sources: ArrayNonEmpty<StreamSource.NonEmpty<ValuedGraphElement<N, V>>>
		): WithGraphValues<Tp, N, V>['nonEmpty'];
		from<N extends UN, V>(
			...sources: ArrayNonEmpty<StreamSource<ValuedGraphElement<N, V>>>
		): WithGraphValues<Tp, N, V>['normal'];
		/**
		 * Returns an empty builder instance.
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * ArrowValuedGraphHashed.builder<number, string>()    // => ArrowValuedGraphHashed.Builder<number, string>
		 * ```
		 */
		builder<N extends UN, V>(): WithGraphValues<Tp, N, V>['builder'];
		/**
		 * Returns a `Reducer` that adds valued received graph elements to a ValuedGraph and returns the ValuedGraph as a result. When a `source` is given,
		 * the reducer will first create a graph from the source, and then add graph elements to it.
		 * @param source - (optional) an initial source of graph elements to add to
		 * @example
		 * ```ts
import { ArrowValuedGraphSorted } from '@rimbu/graph/valued/arrow/sorted'
import { Stream } from '@rimbu/stream'
import { ArrayNonEmpty } from '@rimbu/common/types'
import { ValuedGraphElement } from '@rimbu/graph/valued-link'
		 * const someSource = [[1, 2, 'a'], [3], [5]] as ArrayNonEmpty<ValuedGraphElement<number, string>>;
		 * const result = Stream.of<ValuedGraphElement<number, string>>(
		 *   [1, 3, 'b'],
		 *   [4, 3, 'c'],
		 * ).reduce(ArrowValuedGraphSorted.reducer(someSource))
		 * result.stream().toArray()   // => [[1, 2, 'a'], [1, 3, 'b'], [4, 3, 'c'], [5]]
		 * ```
		 * @note uses a builder under the hood. If the given `source` is a ValuedGraph in the same context, it will directly call `.toBuilder()`.
		 */
		reducer<N extends UN, V>(
			source?: StreamSource.NonEmpty<ValuedGraphElement<N, V>>,
		): Reducer<ValuedGraphElement<N, V>, WithGraphValues<Tp, N, V>['normal']>;
	}

	export interface Context<
		UN,
		Tp extends ValuedGraphBase.Types = ValuedGraphBase.Types,
	> extends Factory<Tp, UN> {
		readonly _fixedType: UN;

		/**
		 * A string tag defining the specific collection type
		 * @example
		 * ```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed'
		 * ArrowValuedGraphHashed.defaultContext().typeTag   // => 'ArrowValuedGraphHashed'
		 * ```
		 */
		readonly typeTag: string;
		/**
		 * The `context` instance used to create internal link maps
		 */
		readonly linkMapContext: WithGraphValues<Tp, UN, unknown>['linkMapContext'];
		/**
		 * The `context` instance used to create internal connection maps
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
	export interface Types extends GraphValues<unknown, unknown> {
		readonly normal: ValuedGraphBase<this['_N'], this['_V']>;
		readonly nonEmpty: ValuedGraphBase.NonEmpty<this['_N'], this['_V']>;
		readonly link: ValuedLink<this['_N'], this['_V']>;
		readonly linkTarget: ValuedLink.Target<this['_N'], this['_V']>;
		readonly context: ValuedGraphBase.Context<this['_N']>;
		readonly builder: ValuedGraphBase.Builder<this['_N'], this['_V']>;

		/**
		 * The family a node's connection map (target node → connection value) is
		 * built from. Pinned per variant; every storage member below is derived
		 * from it rather than restated.
		 */
		readonly _LINK_CONNECTIONS_FAM: ValuedGraphCollection.Advanced.LinkValuesFamily<
			any,
			any
		>;
		/**
		 * The family the outer link map is built from. Its value type is derived
		 * from {@link Types._LINK_CONNECTIONS_FAM} so each fact is named once per
		 * variant instead of seven times.
		 *
		 * Declared with `any` parameters; the leaf variants narrow it. See the note
		 * on `GraphBase.Types._LINK_MAP_FAM` — `ModifyOptions` makes a map
		 * invariant in its value type, so a narrow declaration here would make
		 * every leaf `Types` fail its `extends` constraint.
		 */
		readonly _LINK_MAP_FAM: GraphCollection.Advanced.LinkMapFamily<any, any>;

		readonly linkMap: this['_LINK_MAP_FAM']['_NORMAL'];
		readonly linkMapNonEmpty: this['_LINK_MAP_FAM']['_NON_EMPTY'];
		readonly linkMapContext: this['_LINK_MAP_FAM']['_CONTEXT'];
		readonly linkConnections: this['_LINK_CONNECTIONS_FAM']['_NORMAL'];
		readonly linkConnectionsContext: this['_LINK_CONNECTIONS_FAM']['_CONTEXT'];
	}
}
