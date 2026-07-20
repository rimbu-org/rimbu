import type { RMap } from '@rimbu/collection-types';
import type { ModifyOptions } from '@rimbu/collection-types/advanced/common';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common/types';
import type { Link } from '@rimbu/graph/link';
import type { ValuedGraphElement } from '@rimbu/graph/valued-link';
import type { Stream, Streamable, StreamSource } from '@rimbu/stream';
import type { Reducer } from '@rimbu/stream/reducer';

import type {
	GraphConnect,
	GraphConnectNonEmpty,
	WithGraphValues,
} from '#graph/common/base';
import type { VariantValuedGraphBase } from '#graph/valued/variant-base';
import type { VariantGraphBase } from '#graph/variant-base';

export interface ValuedGraphBase<
	N,
	V,
	Tp extends ValuedGraphBase.Types = ValuedGraphBase.Types,
> extends VariantValuedGraphBase<N, V, Tp>,
		GraphConnect<N, V, Tp> {
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
}

export namespace ValuedGraphBase {
	export interface NonEmpty<
		N,
		V,
		Tp extends ValuedGraphBase.Types = ValuedGraphBase.Types,
	> extends VariantValuedGraphBase.NonEmpty<N, V, Tp>,
			Omit<
				GraphConnectNonEmpty<N, V, Tp>,
				keyof VariantValuedGraphBase.NonEmpty<any, any, any>
			>,
			Omit<
				ValuedGraphBase<N, V, Tp>,
				| keyof VariantValuedGraphBase.NonEmpty<any, any, any>
				| keyof GraphConnectNonEmpty<any, any, any>
			>,
			Streamable.NonEmpty<ValuedGraphElement<N, V>> {
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
		 * b.connectAll([[1, 2, 'a'], [3, 1, 'c']]) // => true
		 * b.connectAll([[1, 2, 'a']])              // => false
		 * ```
		 */
		connectAll(
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
		 * b.disconnectAll([[1, 2], [3, 4]])  // => true
		 * b.disconnectAll([[3, 4], [5, 6]])  // => false
		 * ```
		 */
		disconnectAll<UN = N>(
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
		forEach(
			f: (
				entry: [N] | WithGraphValues<Tp, N, V>['link'],
				index: number,
				halt: () => void,
			) => void,
			options?: { state?: TraverseState },
		): void;
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
	export interface Types extends VariantValuedGraphBase.Types {
		readonly normal: ValuedGraphBase<this['_N'], this['_V']> &
			VariantGraphBase<this['_N'], this['_V']>;
		readonly nonEmpty: ValuedGraphBase.NonEmpty<this['_N'], this['_V']>;
		readonly context: ValuedGraphBase.Context<this['_N']>;
		readonly builder: ValuedGraphBase.Builder<this['_N'], this['_V']>;
		readonly linkMap: RMap<this['_N'], RMap<this['_N'], this['_V']>>;
		readonly linkMapNonEmpty: RMap.NonEmpty<
			this['_N'],
			RMap<this['_N'], this['_V']>
		>;
		readonly linkMapContext: RMap.Context<this['_N']>;
		readonly linkConnectionsContext: RMap.Context<this['_N']>;
		readonly linkMapBuilder: RMap.Builder<
			this['_N'],
			RMap.Builder<this['_N'], this['_V']>
		>;
		readonly linkConnectionsBuilder: RMap.Builder<this['_N'], this['_V']>;
		readonly linkConnections: RMap<this['_N'], this['_V']>;
	}
}
