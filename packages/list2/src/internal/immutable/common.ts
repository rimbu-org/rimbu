import type { Int } from '@rimbu/base';
import type { TraverseState } from '@rimbu/common';
import type { List, OpWithResult } from '@rimbu/list';
import type { Stream } from '@rimbu/stream';

import type { InnerBlock } from '#list/immutable/inner-block';
import type { InnerTree } from '#list/immutable/inner-tree';
import type { BlockBuilder, InnerBuilder } from '#list/mutable/common';

export type Self<T, S extends T = T> = T & { _self: S };

/**
 * Shared read-only shape for all list nodes (blocks, inner nodes, trees).
 */
interface ListNode<T> {
	_self: ListNode<T>;

	/** Total number of elements reachable from this node. */
	readonly size: number;

	stream(options?: { reversed?: boolean | undefined }): Stream.NonEmpty<T>;
	forEach(f: (element: T) => void): void;
	filter(f: (element: T) => boolean): List<T>;
	filterIndexed(
		f: (element: T, index: number, halt: () => void) => boolean,
		options: {
			reversed?: boolean | undefined;
			negate?: boolean | undefined;
			state?: TraverseState;
		},
	): List<T>;
	reversed(): this['_self'];
	toArray(): T[];

	/** Returns the element at `index`. Caller must ensure 0 ≤ index < size. */
	_get(index: Int.AtLeastZero): T;
	_update(
		index: Int.AtLeastZero,
		f: (element: T) => T,
	): OpWithResult<this['_self'], [previous: T, current: T], true>;
}

/**
 * A leaf or inner node that holds directly enumerated children.
 *
 * For leaf blocks (OuterBlock) `C` = the element type `T`. For inner blocks
 * (InnerBlock) `C` = another Block whose elements resolve to `T`.
 */
export interface Block<T> extends ListNode<T> {
	_self: Block<T>;

	/** Number of direct children. */
	readonly _nrChildren: number;
	/** True when one more child can be added without normalizing. */
	readonly _canAddChild: boolean;
	/** True when one child can be removed without violating minimum fill. */
	readonly _canRemoveChild: boolean;
	readonly _childrenInMin: boolean;
	readonly _childrenInMax: boolean;

	map<T2>(f: (element: T) => T2): Block<T2>;
	toBuilder(): BlockBuilder<T, T>;
}

/**
 * A 2-3 finger tree: a left leaf block, a right leaf block, and an optional
 * middle Inner node holding the blocks between them.
 */
export interface Tree<T, C extends Self<Block<T>, C> = Self<Block<T>>>
	extends ListNode<T> {
	readonly left: C;
	readonly right: C;
	readonly middle: Inner<T, C> | null;

	copy(left?: C, right?: C, middle?: Inner<T, C> | null): this['_self'];
}

/**
 * A block whose children are themselves Blocks. Provides child-level
 * operations used during tree rebalancing.
 */
export interface Inner<T, C extends Self<Block<T>, C>> extends ListNode<T> {
	_self: Inner<T, C>;

	map<T2>(f: (element: T) => T2): Inner<T2, any>;
	prependChild(child: C): Inner<T, C>;
	appendChild(child: C): Inner<T, C>;
	dropLastChild(): [Inner<T, C> | null, C];
	dropFirstChild(): [Inner<T, C> | null, C];
	/** Replace the first child via `f`. Returns `undefined` if the block becomes empty. */
	modifyFirstChild(f: (block: C) => C): Inner<T, C> | undefined;
	/** Replace the last child via `f`. Returns `undefined` if the block becomes empty. */
	modifyLastChild(f: (block: C) => C): Inner<T, C> | undefined;
	concat(other: Inner<T, C>): Inner<T, C>;
	prependBlock(leftBlock: InnerBlock<T, C>): Inner<T, C>;
	prependTree(leftTree: InnerTree<T, C>): Inner<T, C>;
	takeInternal(
		amount: Int.AtLeastZero,
	): [
		newInner: Inner<T, C> | null,
		lastChild: C,
		lastChildCount: Int.AtLeastZero,
	];
	dropInternal(
		amount: Int.AtLeastZero,
	): [
		newInner: Inner<T, C> | null,
		lastChild: C,
		lastChildCount: Int.AtLeastZero,
	];
	toBuilder(): InnerBuilder<T, any>;
}
