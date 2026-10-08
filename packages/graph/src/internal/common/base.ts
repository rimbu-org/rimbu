import type { TraverseState } from '@rimbu/common/traverse-state';
import type { GraphElement } from '@rimbu/graph/link';

import type { VariantGraphBase } from '#graph/variant-base';

import { EmptyBase } from '@rimbu/collection-types/advanced/common/empty-base';
import { Stream, type StreamSource } from '@rimbu/stream';

export interface GraphValues<N = unknown, V = unknown> {
	readonly _N: N;
	readonly _V: V;
}

export type WithGraphValues<Tp, N, V> = GraphValues<N, V> & Tp;

export interface GraphConnect<N, V, Tp extends VariantGraphBase.Types>
	extends VariantGraphBase<N, V, Tp> {
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

export interface GraphConnectNonEmpty<N, V, Tp extends VariantGraphBase.Types>
	extends GraphConnect<N, V, Tp> {
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
	addNodes(nodes: StreamSource<N>): WithGraphValues<Tp, N, V>['nonEmpty'];
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
		links: StreamSource<WithGraphValues<Tp, N, V>['link']>,
	): WithGraphValues<Tp, N, V>['nonEmpty'];
}

export abstract class GraphEmptyBase<N, E = GraphElement<N>> extends EmptyBase {
	get nodeSize(): 0 {
		return 0;
	}

	get connectionSize(): 0 {
		return 0;
	}

	/**
	 * An empty graph is already the "possibly empty" form, so this returns
	 * `this`. Declared here because `EmptyBase` only provides it on `NonEmptyBase`.
	 */
	asNormal(): this {
		return this;
	}

	streamNodes(): Stream<N> {
		return Stream.empty();
	}

	streamConnections(): Stream<never> {
		return Stream.empty();
	}

	/**
	 * No elements, so nothing is visited. `f` is still accepted so the empty class
	 * satisfies the same signature as the non-empty one. Without this the class
	 * would inherit `EmptyBase.forEach()`, which is declared with **zero**
	 * parameters, and `empty.forEach(f)` would not typecheck.
	 *
	 * `f` is optional only because that inherited declaration admits none — the
	 * capability `Api` types it as required. This goes away with `EmptyBase`.
	 */
	forEach(f?: (element: E) => void): void {
		//
	}

	/**
	 * No elements, so nothing is visited. See {@link forEach}.
	 */
	forEachIndexed(
		f: (element: E, index: number, halt: () => void) => void,
		options?: { state?: TraverseState },
	): void {
		//
	}

	hasNode(): false {
		return false;
	}

	hasConnection(): false {
		return false;
	}

	isSink(): false {
		return false;
	}

	isSource(): false {
		return false;
	}

	removeNode(): this {
		return this;
	}

	removeNodes(): this {
		return this;
	}

	getConnectionStreamFrom(): Stream<never> {
		return Stream.empty();
	}

	getConnectionStreamTo(): Stream<never> {
		return Stream.empty();
	}

	disconnect(): this {
		return this;
	}

	disconnectEach(): this {
		return this;
	}

	removeUnconnectedNodes(): this {
		return this;
	}
}
