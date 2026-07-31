import type { List, OpWithKnownResult, OpWithResult } from '@rimbu/list';
import type { Stream, StreamSource } from '@rimbu/stream';

import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';
import type { ListContext } from '#list/context';
import type { Block } from '#list/immutable/common';
import type { OuterTree } from '#list/immutable/outer-tree';
import type { OuterBlockBuilder } from '#list/mutable/outer-block-builder';

import { Int } from '@rimbu/base';
import {
	type ArrayNonEmpty,
	type IndexRange,
	OptLazy,
	type TraverseState,
} from '@rimbu/common';

import { ListNonEmptyBase } from '#advanced/immutable/non-empty-base';

export abstract class OuterBlock<T>
	extends ListNonEmptyBase<T>
	implements Block<T>
{
	declare _self: this;

	constructor(readonly context: ListContext<T, true>) {
		super(context);
	}

	abstract get size(): number;
	abstract stream(options?: {
		reversed?: boolean | undefined;
	}): Stream.NonEmpty<T>;
	abstract streamSlice(
		range: IndexRange,
		options?: { reversed?: boolean | undefined },
	): Stream<T>;
	abstract _update(
		index: Int.AtLeastZero,
		f: (element: T) => T,
	): OpWithResult<OuterBlock<T>, [oldValue: T, newValue: T], true>;
	abstract forEach(f: (element: T) => void): void;
	abstract filter(f: (element: T) => boolean): List<T>;
	abstract filterIndexed(
		f: (element: T, index: number, halt: () => void) => boolean,
		options?: {
			reversed?: boolean | undefined;
			negate?: boolean | undefined;
			state?: TraverseState;
		},
	): List<T>;
	abstract reversed(): OuterBlock<T>;
	abstract toArray(options?: {
		reversed?: boolean | undefined;
	}): ArrayNonEmpty<T>;
	abstract map<T2>(f: (element: T) => T2): OuterBlock<T2>;

	abstract _get(index: Int.AtLeastZero): T;
	abstract _appendBlockChild(child: T): OuterBlock<T>;
	abstract _prependBlockChild(child: T): OuterBlock<T>;
	abstract _createOuterBlock(element: T): OuterBlock<T>;
	abstract _copyChildren(): OuterChildren<T>;
	abstract _takeChildren(amount: Int): OuterBlock<T>;
	abstract _dropChildren(amount: Int): OuterBlock<T>;
	abstract _concatChildren(children: OuterChildren<T>): OuterChildren<T>;
	abstract _prependChildren(children: OuterChildren<T>): OuterChildren<T>;

	get #ops(): ChildrenOps {
		return this.context.childrenOps;
	}

	get _nrChildren(): number {
		return this.size;
	}

	get _childrenInMax(): boolean {
		return this.size <= this.context.maxBlockSize;
	}

	get _childrenInMin(): boolean {
		return this.size >= this.context.minBlockSize;
	}

	get _canAddChild(): boolean {
		return this.size < this.context.maxBlockSize;
	}

	get _canRemoveChild(): boolean {
		return this.size > this.context.minBlockSize;
	}

	at<O>(index: number, otherwise?: OptLazy<O>): T | O {
		const size = this.size;
		if (-index > size || index >= size) {
			return OptLazy(otherwise) as O;
		}
		if (index < 0) {
			index = size + index;
		}

		Int.checkAtLeastZero(index);

		return this._get(index);
	}

	first(): T {
		return this._get(0 as Int.AtLeastZero);
	}

	last(): T {
		return this.at(-1);
	}

	setAt(
		index: number,
		element: T,
	): OpWithKnownResult<
		OuterBlock<T>,
		[oldValue: T | undefined],
		[oldValue: T]
	> {
		const [newThis, [hasKnownResult, oldValue], hasChanged] = this.updateAt(
			index,
			() => element,
		);

		if (hasKnownResult) {
			return [newThis, [hasKnownResult, oldValue], hasChanged];
		}

		return [newThis, [hasKnownResult, oldValue], hasChanged];
	}

	updateAt(
		index: number,
		f: (element: T) => T,
	): OpWithKnownResult<
		OuterBlock<T>,
		[oldValue: T | undefined, newValue: T | undefined],
		[oldValue: T, newValue: T]
	> {
		const size = this.size;
		if (-index > size || index >= size) {
			return [this, [false, undefined, undefined], false];
		}
		if (index < 0) {
			index = size + index;
		}

		Int.checkAtLeastZero(index);

		return this._update(index, f);
	}

	take(count: number): List<T> {
		Int.check(count);

		if (count <= 0) {
			if (count === 0) return this.context.empty();
			if (-count >= this.size) return this;
		} else if (count >= this.size) {
			return this;
		}

		return this._takeChildren(count);
	}

	drop(count: number): List<T> {
		Int.check(count);

		if (count <= 0) {
			if (count === 0) return this;
			if (-count >= this.size) return this.context.empty();
		} else if (count >= this.size) {
			return this.context.empty();
		}

		return this._dropChildren(count);
	}

	prepend(element: T): List.NonEmpty<T> {
		if (this._canAddChild) {
			return this._prependBlockChild(element);
		}

		return this.context.outerTree<T>(
			this._createOuterBlock(element),
			this,
			null,
			this.size + 1,
		);
	}

	append(element: T): List.NonEmpty<T> {
		if (this._canAddChild) {
			return this._appendBlockChild(element);
		}

		return this.context.outerTree(
			this,
			this._createOuterBlock(element),
			null,
			this.size + 1,
		);
	}

	concat(...sources: ArrayNonEmpty<StreamSource<T>>): List.NonEmpty<T> {
		const asList = this.context.from(...sources);

		if (!asList.nonEmpty()) {
			return this;
		}

		if (asList === this && this.size > this.context.minBlockSize) {
			return this.context.outerTree(this, this, null, this.size * 2);
		}

		return (asList as ListNonEmptyBase<T>)._prependBlock(this);
	}

	placeAt(): List.NonEmpty<T> {
		return 0 as any;
	}

	toBuilder(): OuterBlockBuilder<T> {
		return this.context.outerBlockBuilderSource(this);
	}

	_dropFirstChild(): [OuterBlock<T>, T] {
		const first = this.first();
		const newSelf = this._dropChildren(1 as Int);
		return [newSelf, first];
	}

	_dropLastChild(): [OuterBlock<T>, T] {
		const last = this.last();
		const newSelf = this._dropChildren(-1 as Int);
		return [newSelf, last];
	}

	_prependBlock(leftBlock: OuterBlock<T>): List.NonEmpty<T> {
		const newSize = leftBlock.size + this.size;

		if (newSize <= this.context.maxBlockSize) {
			const newChildren = leftBlock._concatChildren(this._copyChildren());
			return this.context.outerBlockLeftRight(newChildren);
		}

		return this.context.outerTree(leftBlock, this, null, newSize);
	}

	_prependTree(leftTree: OuterTree<T>): List.NonEmpty<T> {
		const newSize = leftTree.size + this.size;

		const jointSize = leftTree.right.size + this.size;
		// Case 1: Joint is small enough to merge into a single block
		if (jointSize <= this.context.maxBlockSize) {
			const newLeftRightChildren = leftTree.right.concat(this) as OuterBlock<T>;
			return this.context.outerTree(
				leftTree.left,
				newLeftRightChildren,
				leftTree.middle,
				newSize,
			);
		}

		// Case 2: Joint is too large to merge into a single block, but can be merged into the middle of the tree
		if (leftTree.right._childrenInMin) {
			const newLeftMiddle =
				leftTree.middle?.appendChild(leftTree.right) ??
				this.context.innerBlock([leftTree.right], leftTree.right.size, 1);

			return this.context.outerTree(
				leftTree.left,
				this,
				newLeftMiddle,
				newSize,
			);
		}

		// Case 3: Need to join and split the joint into a new block, and add it to the middle of the tree
		const jointChildren = leftTree.right._concatChildren(this._copyChildren());
		const [toMiddleChildren, newRightChildren] = this.#ops.mutateSplice(
			jointChildren,
			this.context.maxBlockSize,
		);

		const toMiddle = this.context.outerBlockLeftRight(toMiddleChildren);
		const newRight = this.context.outerBlockLeftRight(newRightChildren);

		const newMiddle =
			leftTree.middle?.appendChild(toMiddle) ??
			this.context.innerBlock([toMiddle], toMiddle.size, 1);

		return this.context.outerTree(leftTree.left, newRight, newMiddle, newSize);
	}
}
