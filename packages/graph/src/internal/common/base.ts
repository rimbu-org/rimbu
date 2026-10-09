import type { TraverseState } from '@rimbu/common/traverse-state';
import type { GraphElement } from '@rimbu/graph/link';

import { EmptyBase } from '@rimbu/collection-types/advanced/common/empty-base';
import { Stream } from '@rimbu/stream';

export interface GraphValues<N = unknown, V = unknown> {
	readonly _N: N;
	readonly _V: V;
}

export type WithGraphValues<Tp, N, V> = GraphValues<N, V> & Tp;

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
