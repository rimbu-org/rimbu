import type { List } from '@rimbu/list';
import type { Stream } from '@rimbu/stream';

import type { InnerBlock } from '#list/immutable/inner-block';
import type { InnerTree } from '#list/immutable/inner-tree';
import type { BlockBuilder, InnerBuilder } from '#list/mutable/common';

/**
 * Shared read-only shape for all list nodes (blocks, inner nodes, trees).
 */
interface ListCommon<T> {
	/** Total number of elements reachable from this node. */
	readonly size: number;

	/** Returns the element at `index`. Caller must ensure 0 ≤ index < size. */
	_get(index: number): T;
	stream(options?: { reversed?: boolean | undefined }): Stream.NonEmpty<T>;
	forEach(f: (value: T) => void): void;
	filter(f: (element: T) => boolean): List<T>;
	toArray(): T[];
}

/**
 * A leaf or inner node that holds directly enumerated children.
 *
 * For leaf blocks (OuterBlock) `C` = the element type `T`. For inner blocks
 * (InnerBlock) `C` = another Block whose elements resolve to `T`.
 */
export interface Block<T, C = unknown> extends ListCommon<T> {
	/** Self-type anchor for narrowing in subclasses. */
	readonly _self: Block<T, C>;

	/** Number of direct children. */
	readonly _nrChildren: number;
	/** True when one more child can be added without normalizing. */
	readonly _canAddChild: boolean;
	/** True when one child can be removed without violating minimum fill. */
	readonly _canRemoveChild: boolean;

	map<T2>(f: (element: T) => T2): Block<T2, any>;
	toBuilder(): BlockBuilder<T, any>;

	_prependBlockChild(child: C): this['_self'];
	_appendBlockChild(child: C): this['_self'];
}

/**
 * A 2-3 finger tree: a left leaf block, a right leaf block, and an optional
 * middle Inner node holding the blocks between them.
 */
export interface Tree<T, C extends Block<T> = Block<T>> extends ListCommon<T> {
	readonly left: C;
	readonly right: C;
	readonly middle: Inner<T, C> | null;
}

/**
 * A block whose children are themselves Blocks. Provides child-level
 * operations used during tree rebalancing.
 */
export interface Inner<T, C extends Block<T>> extends ListCommon<T> {
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
	toBuilder(): InnerBuilder<T, any>;
}
