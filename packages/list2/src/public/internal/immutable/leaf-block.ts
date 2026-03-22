import type { WithElem } from '@rimbu/collection-types/common';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { Stream, StreamSource } from '@rimbu/stream';
import type { LeafBlockBuilder } from '../mutable/leaf-block-builder';

import type { ListContext } from '#list/context-module';
import type { LeafTree } from '#list/immutable/leaf-tree';
import type { Block } from '#list/immutable/utils';
import type { ListImpl } from '#list/list-impl';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';
import { IndexRange } from '@rimbu/common/index-range';
import { OptLazy } from '@rimbu/common/opt-lazy';

import { LeafBase } from '#list/immutable/leaf-base';

export class LeafBlock<T, Tp extends ListImpl.Types = ListImpl.Types>
	extends LeafBase<T>
	implements ListImpl.NonEmpty<T>, Block<T>
{
	constructor(
		context: ListContext,
		public children: WithElem<Tp, T>['leafChildren'],
		readonly length = context.leafChildrenOps.length(children),
	) {
		super(context);
	}

	get itemsLength() {
		return this.length;
	}

	get nrChildren() {
		return this.ops.length(this.children);
	}

	get childrenInMax(): boolean {
		return this.length <= this.context.maxBlockSize;
	}

	get childrenInMin(): boolean {
		return this.length >= this.context.minBlockSize;
	}

	get canAddChild(): boolean {
		return this.length < this.context.maxBlockSize;
	}

	copy(children: WithElem<Tp, T>['leafChildren']): LeafBlock<T> {
		if (children === this.children) return this;
		return this.context.leafBlock(children);
	}

	copy2<T2>(children: WithElem<Tp, T2>['leafChildren']): LeafBlock<T2> {
		if (children === this.children) return this as unknown as LeafBlock<T2>;
		return this.context.leafBlock(children);
	}

	stream(options: { reversed?: boolean } = {}): Stream.NonEmpty<T> {
		return this.ops.stream(this.children, options);
	}

	// 	streamRange(
	// 	range: IndexRange,
	// 	options: { reversed?: boolean } = {},
	// ): Stream<T> {
	// 	const { reversed = false } = options;
	// 	return this.leafOps.streamRange(this.children, {
	// 		indexRange: range,
	// 		reversed,
	// 	});
	// }

	get<O>(index: number, otherwise?: OptLazy<O>): T | O {
		if (index >= this.length || -index > this.length) {
			return OptLazy(otherwise!);
		}
		if (index < 0) {
			return this.get(this.length + index, otherwise);
		}

		return this.ops.get(this.children, index);
	}

	first(): T {
		return this.ops.get(this.children, 0);
	}

	last(): T {
		return this.ops.get(this.children, -1);
	}

	prepend(value: T): ListImpl.NonEmpty<T> {
		if (this.canAddChild) {
			return this.prependChild(value);
		}

		return this.context.leafTree<T>(
			this.context.leafBlock(this.ops.of([value])),
			this,
			null,
			this.length + 1,
		);
	}

	append(value: T): ListImpl.NonEmpty<T> {
		if (this.canAddChild) {
			return this.appendChild(value);
		}

		return this.context.leafTree(
			this,
			this.context.leafBlock(this.ops.of([value])),
			null,
			this.length + 1,
		);
	}

	prependChild(value: T): LeafBlock<T> {
		return this.copy(this.ops.prepend(this.children, value));
	}

	appendChild(value: T): LeafBlock<T> {
		return this.copy(this.ops.append(this.children, value));
	}

	reversed(cacheMap = this.context.cacheMap()): LeafBlock<T> {
		if (this.length === 1) return this;

		const cachedThis = cacheMap.get<LeafBlock<T>>(this);
		if (cachedThis !== undefined) return cachedThis;

		// biome-ignore lint/complexity/noUselessThisAlias: Needed
		const thisCopy = this;

		const reversedThis = this.context.isReversedLeafBlock(this)
			? this.context.leafBlock<T>(this.children)
			: thisCopy.context.reversedLeafBlock<T>(thisCopy.children);

		return cacheMap.setAndReturn(this, reversedThis);
	}

	take(amount: number): any {
		if (amount === 0) return this.context.empty();
		if (amount >= this.length || -amount > this.length) return this;
		if (amount < 0) return this.drop(this.length + amount);

		return this.takeChildren(amount);
	}

	drop(amount: number): ListImpl<T> {
		if (amount === 0) return this;
		if (amount >= this.length || -amount > this.length)
			return this.context.empty();
		if (amount < 0) return this.take(this.length + amount);

		return this.dropChildren(amount);
	}

	takeChildren(amount: number): LeafBlock<T> {
		return this.copy(
			this.ops.toSpliced(this.children, amount, this.context.maxBlockSize),
		);
	}

	dropChildren(amount: number): LeafBlock<T> {
		return this.copy(this.ops.toSpliced(this.children, 0, amount));
	}

	concat(...sources: ArrayNonEmpty<StreamSource<T>>): ListImpl.NonEmpty<T> {
		const asList = this.context.from(...sources);

		if (asList.nonEmpty()) {
			if (this.context.isLeafBlock<T>(asList)) {
				if (
					asList === this &&
					this.ops.length(this.children) > this.context.minBlockSize
				) {
					return this.context.leafTree<T>(this, this, null, this.length);
				}

				return this.concatBlock(asList);
			}

			if (this.context.isLeafTree<T>(asList)) {
				return this.concatTree(asList);
			}

			throwInvalidStateError();
		}

		return this;
	}

	concatBlock(other: LeafBlock<T>): ListImpl.NonEmpty<T> {
		return this.concatChildren(other)._mutateNormalize();
	}

	concatChildren(other: LeafBlock<T>): LeafBlock<T> {
		const addChildren = this.context.isReversedLeafBlock(other as any)
			? this.ops.toReversed(other.children)
			: other.children;

		const newChildren = this.ops.concat(this.children, addChildren);

		return this.copy(newChildren);
	}

	concatTree(other: LeafTree<T>): LeafTree<T> {
		if (this.length + other.left.length <= this.context.maxBlockSize) {
			const newLeft = this.concatChildren(other.left);

			return other.copy(newLeft);
		}

		if (other.left.childrenInMin) {
			const newMiddle = other.prependMiddle(other.left);

			return other.copy(this, undefined, newMiddle);
		}

		const newLeft = this.concatChildren(other.left);
		const newSecond = newLeft._mutateSplitRight(
			newLeft.length - this.context.maxBlockSize,
		);
		const newMiddle = other.prependMiddle(newSecond);

		return other.copy(newLeft, undefined, newMiddle);
	}

	toArray(
		options: { range?: IndexRange | undefined; reversed?: boolean } = {},
	): any {
		const { range, reversed = false } = options;

		if (undefined === range) {
			return this.ops.toArray(this.children, undefined, undefined, reversed);
		}

		const indexRange = IndexRange.getIndicesFor(range, this.length);

		if (indexRange === 'empty') {
			return [];
		}

		if (indexRange === 'all') {
			return this.ops.toArray(this.children, undefined, undefined, reversed);
		}

		const [indexStart, indexEnd] = indexRange;
		const start = this.length - 1 - indexEnd;
		const end = this.length - 1 - indexStart;

		return this.ops.toArray(this.children, start, end + 1, reversed);
	}

	createBlockBuilder(): LeafBlockBuilder<T> {
		return this.context.leafBlockBuilderSource(this);
	}

	_mutateNormalize(): ListImpl.NonEmpty<T> {
		if (this.childrenInMax) return this;

		const newRight = this._mutateSplitRight();

		return this.context.leafTree(this, newRight, null, this.length);
	}

	_mutateSplitRight(
		childIndex = this.ops.length(this.children) >>> 1,
	): LeafBlock<T> {
		const [newChildren, rightChildren] = this.ops.mutateSplice(
			this.children,
			childIndex,
		);
		this.children = newChildren;

		return this.copy(rightChildren);
	}

	_structure(): string {
		return `LeafBlock<${this.length}>(${this.ops.join(this.children, ',')})`;
	}
}
