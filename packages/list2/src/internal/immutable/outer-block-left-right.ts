import type { Int } from '@rimbu/base';
import type { ArrayNonEmpty, IndexRange, TraverseState } from '@rimbu/common';
import type { List, OpWithResult } from '@rimbu/list';
import type { Stream } from '@rimbu/stream';

import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';
import type { ListContext } from '#list/context';

import { OuterBlock } from '#list/immutable/outer-block';

export class OuterBlockLeftRight<T> extends OuterBlock<T> {
	constructor(
		readonly context: ListContext<T, true>,
		children: OuterChildren<T>,
	) {
		super(context);
		this.#children = this.#ops.guard(children);
	}

	#children: OuterChildren<T>;

	get #ops(): ChildrenOps {
		return this.context.childrenOps;
	}

	get size() {
		return this.#ops.size(this.#children);
	}

	#copy(children: any): OuterBlock<T> {
		if (children === this.#children) return this;
		return this.context.outerBlockLeftRight(children);
	}

	#copyAsType<T2>(children: OuterChildren<T2>): OuterBlock<T2> {
		if ((children as any) === this.#children)
			return this as unknown as OuterBlock<T2>;
		return this.context.outerBlockLeftRight(children);
	}

	stream(options?: { reversed?: boolean | undefined }): Stream.NonEmpty<T> {
		return this.#ops.stream(this.#children, options);
	}

	streamSlice(range: IndexRange, options: { reversed?: boolean }): Stream<T> {
		return this.#ops.streamRange(this.#children, range, options);
	}

	_update(
		index: Int.AtLeastZero,
		f: (element: T) => T,
	): OpWithResult<OuterBlock<T>, [oldValue: T, newValue: T], true> {
		const [newChildren, result, hasChanged] = this.#ops.updateAt(
			this.#children,
			index,
			f,
		);

		return [this.#copy(newChildren), result, hasChanged];
	}

	forEach(f: (element: T) => void): void {
		this.#ops.forEach(this.#children, f);
	}

	filter(f: (element: T) => boolean): List<T> {
		const newChildren = this.#ops.filter(this.#children, f);

		if (undefined === newChildren) return this;
		if (this.#ops.size(newChildren) === 0) return this.context.empty();

		return this.#copy(newChildren);
	}

	filterIndexed(
		f: (element: T, index: number, halt: () => void) => boolean,
		options?: {
			reversed?: boolean | undefined;
			negate?: boolean | undefined;
			state?: TraverseState;
		},
	): List<T> {
		const newChildren = this.#ops.filterIndexed(this.#children, f, options);

		if (newChildren === this.#children) return this;

		if (this.#ops.size(newChildren) === 0) return this.context.empty();

		return this.#copy(newChildren);
	}

	map<T2>(f: (element: T) => T2): OuterBlock<T2> {
		return this.#copyAsType(this.#ops.map(this.#children, f));
	}

	reversed(): OuterBlock<T> {
		return this.context.outerBlockRightLeft(this.#children);
	}

	toArray(options: { reversed?: boolean } = {}): ArrayNonEmpty<T> {
		const { reversed = false } = options;
		return this.#ops.toArray(this.#children, reversed);
	}

	_get(index: number): T {
		return this.#ops.at(this.#children, index);
	}

	_prependBlockChild(child: T): OuterBlock<T> {
		return this.#copy(this.#ops.prepend(this.#children, child));
	}

	_appendBlockChild(child: T): OuterBlock<T> {
		return this.#copy(this.#ops.append(this.#children, child));
	}

	_copyChildren(): OuterChildren<T> {
		return this.#ops.safeCopy(this.#children);
	}

	_takeChildren(amount: Int): OuterBlock<T> {
		if (amount >= 0) {
			return this.#copy(
				this.#ops.toSpliced(this.#children, amount, this.size - amount),
			);
		}
		return this.#copy(
			this.#ops.toSpliced(this.#children, 0, this.size + amount),
		);
	}

	_dropChildren(amount: Int): OuterBlock<T> {
		if (amount >= 0) {
			return this.#copy(this.#ops.toSpliced(this.#children, 0, amount));
		}
		return this.#copy(
			this.#ops.toSpliced(this.#children, this.size + amount, -amount),
		);
	}

	_concatChildren(children: OuterChildren<T>): OuterChildren<T> {
		return this.#ops.concat(this.#children, children);
	}

	_prependChildren(children: OuterChildren<T>): OuterChildren<T> {
		return this.#ops.concat(children, this.#children);
	}

	_createOuterBlock(element: T): OuterBlock<T> {
		return this.context.outerBlockLeftRight(this.#ops.of([element]));
	}

	// concat(...sources: ArrayNonEmpty<StreamSource<T>>): List.NonEmpty<T> {
	// 	const asList = this.context.from(...sources);

	// 	if (!asList.nonEmpty()) {
	// 		return this;
	// 	}

	// 	// return asList as Outer<T>;

	// 	if (this.context.isOuterBlock<T>(asList)) {
	// 		if (asList === this && this.size > this.context.minBlockSize) {
	// 			return this.context.outerTree<T>(
	// 				this,
	// 				this,
	// 				null,
	// 				this.size + asList.size,
	// 			);
	// 		}

	// 		return this.concatBlock(asList);
	// 	}

	// 	if (this.context.isOuterTree<T>(asList)) {
	// 		return this.concatTree(asList);
	// 	}

	// 	throwInvalidStateError();
	// }

	// concatBlock(other: OuterBlock<T>): List.NonEmpty<T> {
	// 	return this.#copy(other.prependChildren(this.#children))._mutateNormalize();
	// }

	// concatTree(other: OuterTree<T>): OuterTree<T> {
	// 	const newSize = this.size + other.size;

	// 	if (this.size + other.left.size <= this.context.maxBlockSize) {
	// 		// this block children fit in tree left, just merge
	// 		const newLeft = this.concatChildren(other.left);

	// 		return other.copy(newLeft, undefined, undefined, newSize);
	// 	}

	// 	if (this.size + other.size <= 2 * this.context.maxBlockSize) {
	// 		// can fit in other left and right without middle, rebalance
	// 		const newLeft = this.concatChildren(other.left).concatChildren(
	// 			other.right,
	// 		);
	// 		const newRight = newLeft._mutateSplitRight();

	// 		return other.copy(newLeft, newRight, null, newSize);
	// 	}

	// 	if (other.left.childrenInMin) {
	// 		const newMiddle = other.prependMiddle(other.left);

	// 		return other.copy(this, undefined, newMiddle, newSize);
	// 	}

	// 	const newLeft = this.concatChildren(other.left);
	// 	const newSecond = newLeft._mutateSplitRight(
	// 		newLeft.size - this.context.maxBlockSize,
	// 	);
	// 	const newMiddle = other.prependMiddle(newSecond);

	// 	return other.copy(newLeft, undefined, newMiddle, newSize);
	// }

	// _mutateNormalize(): List.NonEmpty<T> {
	// 	if (this.childrenInMax) return this;

	// 	const length = this.size;
	// 	const newRight = this._mutateSplitRight();

	// 	return this.context.outerTree(this, newRight, null, length);
	// }

	// _mutateSplitRight(childIndex = this.size >>> 1): OuterBlock<T> {
	// 	const [newChildren, rightChildren] = this.#ops.mutateSplice(
	// 		this.#children,
	// 		childIndex,
	// 	);
	// 	this.#children = newChildren;

	// 	return this.#copy(rightChildren);
	// }
}
