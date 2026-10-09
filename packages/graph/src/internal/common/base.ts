import type { TraverseState } from '@rimbu/common/traverse-state';
import type { GraphElement } from '@rimbu/graph/link';

import * as RimbuError from '@rimbu/base/rimbu-error';
import { type FastIterator, Stream } from '@rimbu/stream';

export interface GraphValues<N = unknown, V = unknown> {
	readonly _N: N;
	readonly _V: V;
}

export type WithGraphValues<Tp, N, V> = GraphValues<N, V> & Tp;

/**
 * The shared empty-graph base.
 *
 * This used to extend `EmptyBase` from
 * `@rimbu/collection-types/advanced/common/empty-base`. That class is gone, so
 * the members graph actually used are declared here instead. Two are
 * deliberately **not** carried over:
 *
 * - `filter()` — `WithFilter` is refused for graphs (see `AGENTS.md`), so `filter`
 *   must not exist anywhere on a graph.
 * - `length` — a banned name in this repo. A graph's `toArray().length` is
 *   neither `size` nor `connectionSize`, so there is no honest meaning for it.
 *
 * `remove()` is likewise absent: `removeNode` / `removeNodes` / `disconnect` are
 * the graph's own vocabulary.
 */
export abstract class GraphEmptyBase<N, E = GraphElement<N>> {
	/**
	 * The non-empty form of this graph, used only by the `nonEmpty()` type guard.
	 * Each concrete empty class narrows it with `declare`.
	 */
	readonly _NonEmptyType: unknown;

	[Symbol.iterator](): FastIterator<E> {
		return Stream.empty<E>()[Symbol.iterator]();
	}

	/**
	 * @throws RimbuError.EmptyCollectionAssumedNonEmptyError
	 */
	assumeNonEmpty(): never {
		RimbuError.throwEmptyCollectionAssumedNonEmptyError();
	}

	stream(): Stream<E> {
		return Stream.empty();
	}

	/**
	 * `0`, and identical to {@link nodeSize}. See `AGENTS.md` — `size` is the node
	 * count, not `toArray().length`.
	 */
	get size(): 0 {
		return 0;
	}

	get isEmpty(): true {
		return true;
	}

	nonEmpty(): this is this['_NonEmptyType'] {
		return false;
	}

	toArray(): [] {
		return [];
	}

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
	 * satisfies the same signature as the non-empty one, where the capability `Api`
	 * types it as required.
	 */
	forEach(_f: (element: E) => void): void {
		//
	}

	/**
	 * No elements, so nothing is visited. See {@link forEach}.
	 */
	forEachIndexed(
		_f: (element: E, index: number, halt: () => void) => void,
		_options?: { state?: TraverseState },
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

/**
 * The shared non-empty-graph base.
 *
 * The counterpart to {@link GraphEmptyBase}, replacing `NonEmptyBase` from the
 * now-deleted `@rimbu/collection-types/advanced/common/empty-base`. It carries
 * only the members that are the same for every non-empty graph: the emptiness
 * brand, the two type-guard/refinement methods, and the iterator.
 *
 * `stream()` is left abstract — each graph derives its elements differently
 * (a 1-tuple for an isolated node, a link tuple for a connection), and the
 * non-empty form must return `Stream.NonEmpty`, which the empty form cannot
 * promise.
 */
export abstract class GraphNonEmptyBase<E> {
	/**
	 * The non-empty form of this graph, used only by the `nonEmpty()` type guard.
	 * Each concrete non-empty class narrows it with `declare`.
	 */
	readonly _NonEmptyType: unknown;

	abstract stream(): Stream.NonEmpty<E>;

	[Symbol.iterator](): FastIterator<E> {
		return this.stream()[Symbol.iterator]();
	}

	get isEmpty(): false {
		return false;
	}

	nonEmpty(): this is this['_NonEmptyType'] {
		return true;
	}

	assumeNonEmpty(): this {
		return this;
	}

	/**
	 * Returns `this` typed as the possibly-empty form. Each concrete class
	 * overrides this with its own public type, since only it knows the variant.
	 */
	asNormal(): any {
		return this;
	}
}
