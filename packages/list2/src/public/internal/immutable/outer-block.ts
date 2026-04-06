import type { WithElem } from '@rimbu/collection-types/common';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { Update } from '@rimbu/common/update';
import type { Stream, StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context-module';
import type { OuterTree } from '#list/immutable/outer-tree';
import type { Block } from '#list/immutable/utils';
import type { ListImpl } from '#list/list-impl';
import type { OuterBlockBuilder } from '#list/mutable/outer-block-builder';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';
import { IndexRange } from '@rimbu/common/index-range';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { TraverseState } from '@rimbu/common/traverse-state';

import { OuterBase } from '#list/immutable/outer-base';

export class OuterBlock<T, Tp extends ListImpl.Types = ListImpl.Types>
	extends OuterBase<T>
	implements ListImpl.NonEmpty<T>, Block<T, T>
{
	declare _self: OuterBlock<T>;

	constructor(
		context: ListContext,
		public children: WithElem<Tp, T>['outerChildren'],
		readonly length = context.outerChildrenOps.length(children),
	) {
		super(context);
	}

	get isReversedBlock() {
		return false;
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

	copy(children: WithElem<Tp, T>['outerChildren']): OuterBlock<T> {
		if (children === this.children) return this;
		return this.context.outerBlock(children);
	}

	copy2<T2>(children: WithElem<Tp, T2>['outerChildren']): OuterBlock<T2> {
		if (children === this.children) return this as unknown as OuterBlock<T2>;
		return this.context.outerBlock(children);
	}

	stream(options: { reversed?: boolean } = {}): Stream.NonEmpty<T> {
		return this.ops.stream(this.children, options);
	}

	getIndex(index: number): number {
		return index;
	}

	streamRange(
		range: IndexRange,
		options: { reversed?: boolean } = {},
	): Stream<T> {
		const { reversed = false } = options;

		return this.ops.streamRange(this.children, {
			range,
			reversed,
		});
	}

	get<O>(index: number, otherwise?: OptLazy<O>): T | O {
		const { length } = this;
		if (index >= length || -index > length) {
			return OptLazy(otherwise!);
		}

		return this.ops.at(this.children, this.getIndex(index));
	}

	updateAt(index: number, update: Update<T>): OuterBlock<T> {
		const { length } = this;
		if (index >= length || -index > length) {
			return this;
		}

		return this.copy(
			this.ops.updateAt(this.children, this.getIndex(index), update),
		);
	}

	first(): T {
		return this.get(0);
	}

	last(): T {
		return this.get(-1);
	}

	prepend(value: T): ListImpl.NonEmpty<T> {
		if (this.canAddChild) {
			return this.prependBlockChild(value);
		}

		return this.context.outerTree<T>(
			this.context.outerBlock(this.ops.of([value])),
			this,
			null,
			this.length + 1,
		);
	}

	append(value: T): ListImpl.NonEmpty<T> {
		if (this.canAddChild) {
			return this.appendBlockChild(value);
		}

		return this.context.outerTree(
			this,
			this.context.outerBlock(this.ops.of([value])),
			null,
			this.length + 1,
		);
	}

	prependBlockChild(value: T): OuterBlock<T> {
		return this.copy(this.ops.prepend(this.children, value));
	}

	appendBlockChild(value: T): OuterBlock<T> {
		return this.copy(this.ops.append(this.children, value));
	}

	reversed(cacheMap = this.context.cacheMap()): OuterBlock<T> {
		if (this.length === 1) return this;

		const cachedThis = cacheMap.get<OuterBlock<T>>(this);
		if (cachedThis !== undefined) return cachedThis;

		const reversedThis = this.isReversedBlock
			? this.context.outerBlock<T>(this.children)
			: this.context.reversedOuterBlock<T>(this.children);

		return cacheMap.setAndReturn(this, reversedThis);
	}

	take(amountInput: number): any {
		const amount = Math.floor(amountInput);
		if (amount === 0) return this.context.empty();
		if (amount >= this.length || -amount > this.length) return this;
		if (amount < 0) return this.drop(this.length + amount);

		return this.takeChildren(amount);
	}

	drop(amountInput: number): ListImpl<T> {
		const amount = Math.floor(amountInput);
		if (amount === 0) return this;
		if (amount >= this.length || -amount > this.length)
			return this.context.empty();
		if (amount < 0) return this.take(this.length + amount);

		return this.dropChildren(amount);
	}

	takeChildren(amount: number): OuterBlock<T> {
		if (amount >= this.length) return this;

		return this.copy(
			this.ops.toSpliced(this.children, amount, this.context.maxBlockSize),
		);
	}

	dropChildren(amount: number): OuterBlock<T> {
		if (amount <= 0) return this;

		return this.copy(this.ops.toSpliced(this.children, 0, amount));
	}

	concat(...sources: ArrayNonEmpty<StreamSource<T>>): ListImpl.NonEmpty<T> {
		const asList = this.context.from(...sources);

		if (asList.nonEmpty()) {
			if (this.context.isOuterBlock<T>(asList)) {
				if (asList === this && this.length > this.context.minBlockSize) {
					return this.context.outerTree<T>(
						this,
						this,
						null,
						this.length + asList.length,
					);
				}

				return this.concatBlock(asList);
			}

			if (this.context.isOuterTree<T>(asList)) {
				return this.concatTree(asList);
			}

			throwInvalidStateError();
		}

		return this;
	}

	concatBlock(other: OuterBlock<T>): ListImpl.NonEmpty<T> {
		return this.concatChildren(other)._mutateNormalize();
	}

	concatChildren(other: OuterBlock<T>): OuterBlock<T> {
		return this.context.outerBlock(
			this.ops.concat(
				this.children,
				other.isReversedBlock
					? this.ops.toReversed(other.children)
					: other.children,
			),
		);
	}

	concatTree(other: OuterTree<T>): OuterTree<T> {
		const newLength = this.length + other.length;

		if (this.length + other.left.length <= this.context.maxBlockSize) {
			const newLeft = this.concatChildren(other.left);

			return other.copy(newLeft, undefined, undefined, newLength);
		}

		if (other.left.childrenInMin) {
			const newMiddle = other.prependMiddle(other.left);

			return other.copy(this, undefined, newMiddle, newLength);
		}

		const newLeft = this.concatChildren(other.left);
		const newSecond = newLeft._mutateSplitRight(
			newLeft.length - this.context.maxBlockSize,
		);
		const newMiddle = other.prependMiddle(newSecond);

		return other.copy(newLeft, undefined, newMiddle, newLength);
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { reversed?: boolean; state?: TraverseState } | undefined = {},
	): void {
		const { reversed = false, state = TraverseState() } = options;

		if (state.halted) return;

		this.ops.forEach(this.children, f, {
			reversed: this.isReversedBlock !== reversed,
			state,
		});
	}

	map<T2>(
		mapFun: (value: T, index: number) => T2,
		options: { reversed?: boolean; indexOffset?: number } = {},
	): OuterBlock<T2> {
		const { reversed = false, indexOffset = 0 } = options;

		const newChildren = this.ops.map(this.children, mapFun, indexOffset);

		return reversed
			? this.context.reversedOuterBlock(newChildren)
			: this.context.outerBlock(newChildren);
	}

	toArray(
		options: { range?: IndexRange | undefined; reversed?: boolean } = {},
	): any {
		const { range, reversed = false } = options;
		const reverseOrder = reversed !== this.isReversedBlock;

		if (undefined === range) {
			return this.ops.toArray(
				this.children,
				undefined,
				undefined,
				reverseOrder,
			);
		}

		const indexRange = IndexRange.getIndicesFor(range, this.length);

		if (indexRange === 'empty') {
			return [];
		}

		if (indexRange === 'all') {
			return this.ops.toArray(
				this.children,
				undefined,
				undefined,
				reverseOrder,
			);
		}

		const [indexStart, indexEnd] = indexRange;

		const start = this.isReversedBlock
			? this.length - 1 - indexEnd
			: indexStart;
		const end = this.isReversedBlock ? this.length - indexStart : indexEnd + 1;

		return this.ops.toArray(this.children, start, end, reverseOrder);
	}

	createBlockBuilder(): OuterBlockBuilder<T> {
		return this.context.outerBlockBuilderSource(this);
	}

	_mutateNormalize(): ListImpl.NonEmpty<T> {
		if (this.childrenInMax) return this;

		const length = this.length;

		const newRight = this._mutateSplitRight();

		return this.context.outerTree(this, newRight, null, length);
	}

	_mutateSplitRight(childIndex = this.length >>> 1): OuterBlock<T> {
		const [newChildren, rightChildren] = this.ops.mutateSplice(
			this.children,
			childIndex,
		);
		this.children = newChildren;

		return this.copy(rightChildren);
	}

	_structure(): string {
		return `OuterBlock<${this.length}>(${this.ops.join(this.children, ',')})`;
	}
}
