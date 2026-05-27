import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Update } from '@rimbu/common/update';
import type { ToMutable } from '../mutable/builder-base';

import type { ListContext } from '#list/context-module';
import type { CacheMap } from '#list/immutable/cache-map';
import type { InnerTree } from '#list/immutable/inner-tree';
import type { InnerBlockBuilder } from '#list/mutable/inner-block-builder';

import { append, concat, prepend, splice } from '@rimbu/base/arr';
import { throwInvalidStateError } from '@rimbu/base/rimbu-error';
import { IndexRange } from '@rimbu/common/index-range';
import { Stream } from '@rimbu/stream';

import type { Block, Inner } from '#list/immutable/utils';

/**
 * Compute a cumulative size table for an array of child blocks.
 * sizes[k] = sum of children[0..k].length (inclusive).
 * Returns null if the block is regular (all children have the same full subtree size).
 */
function computeSizeTable<T>(
	children: Block<T>[],
	level: number,
	blockSizeBits: number,
): number[] | null {
	const levelBits = blockSizeBits * level;
	const blockSize = 1 << levelBits;
	const nrChildren = children.length;
	let total = 0;
	let irregular = false;

	const sizes = new Array<number>(nrChildren);
	for (let i = 0; i < nrChildren; i++) {
		total += children[i].length;
		sizes[i] = total;
		if (children[i].length !== blockSize) irregular = true;
	}

	return irregular ? sizes : null;
}

export class InnerBlock<T, C extends Block<T>> implements Block<T, C> {
	declare _self: InnerBlock<T, C>;

	/** Cumulative size table for irregular blocks. null means regular. */
	sizes: number[] | null;

	constructor(
		readonly context: ListContext,
		readonly children: C[],
		public length: number,
		readonly level: number,
		readonly ops = context.outerChildrenOps,
		sizes?: number[] | null,
	) {
		// If sizes is explicitly provided, use it; otherwise compute lazily.
		if (sizes !== undefined) {
			this.sizes = sizes;
		} else {
			this.sizes = computeSizeTable(children, level, context.blockSizeBits);
		}
	}

	get nrChildren(): number {
		return this.children.length;
	}

	get childrenInMax(): boolean {
		return this.children.length <= this.context.maxBlockSize;
	}

	get childrenInMin(): boolean {
		return this.children.length >= this.context.minBlockSize;
	}

	get canAddChild(): boolean {
		return this.children.length < this.context.maxBlockSize;
	}

	get canRemoveChild(): boolean {
		return this.children.length > this.context.minBlockSize;
	}

	copy(
		children = this.children,
		length = this.length,
		level = this.level,
	): InnerBlock<T, C> {
		if (
			children === this.children &&
			length === this.length &&
			level === this.level
		) {
			return this;
		}

		// Pass undefined for sizes so the constructor recomputes it.
		return this.context.innerBlock(children, length, level);
	}

	copy2<T2, C2 extends Block<T2>>(
		children: C2[],
		length = this.length,
		level = this.level,
	) {
		return this.context.innerBlock<T2, C2>(children, length, level);
	}

	stream(options: { reversed?: boolean } = {}): Stream.NonEmpty<T> {
		return Stream.fromArray(this.children, options)
			.assumeNonEmpty()
			.flatMap((child) => child.stream(options));
	}

	streamRange(
		range: IndexRange,
		options: { reversed?: boolean } = {},
	): Stream<T> {
		const indexRange = IndexRange.getIndicesFor(range, this.length);

		if (indexRange === 'all') {
			return Stream.fromArray(this.children, options).flatMap(
				(child: Block<T>): Stream.NonEmpty<T> => child.stream(options),
			) as Stream.NonEmpty<T>;
		}

		if (indexRange === 'empty') return Stream.empty();

		const [start, end] = indexRange;

		const [startChildIndex, inStartChildIndex] = this.getCoordinates(
			start,
			false,
			true,
		);
		const [endChildIndex, inEndChildIndex] = this.getCoordinates(
			end,
			false,
			true,
		);

		if (startChildIndex === endChildIndex) {
			const child = this.children[startChildIndex];

			return child.streamRange(
				{
					start: inStartChildIndex,
					end: inEndChildIndex,
				},
				options,
			);
		}

		const { reversed = false } = options;

		const startChild = this.children[startChildIndex];
		const endChild = this.children[endChildIndex];
		const childStream = Stream.fromArray(this.children, {
			range: { start: startChildIndex, end: endChildIndex },
			reversed,
		});

		return childStream.flatMap((child: Block<T>): Stream<T> => {
			if (child === startChild)
				return child.streamRange({ start: inStartChildIndex }, options);
			if (child === endChild)
				return child.streamRange({ end: inEndChildIndex }, options);
			return child.stream(options);
		});
	}

	get(index: number): T {
		const [childIndex, inChildIndex] = this.getCoordinates(index, false, false);

		return this.children[childIndex].get(inChildIndex);
	}

	updateAt(index: number, update: Update<T>): InnerBlock<T, C> {
		const [childIndex, inChildIndex] = this.getCoordinates(index, false, false);

		const newChild = this.children[childIndex].updateAt(
			inChildIndex,
			update,
		) as C;

		return this.copy(this.children.with(childIndex, newChild));
	}

	prependBlockChild(child: C): InnerBlock<T, C> {
		const newLength = this.length + child.length;

		return this.copy(prepend(this.children, child), newLength);
	}

	prependChild(block: C): Inner<T, C> {
		if (this.canAddChild) {
			return this.prependBlockChild(block);
		}

		const newLength = this.length + block.length;

		return this.context.innerTree(
			this.copy([block], block.length),
			this,
			null,
			newLength,
			this.level,
		);
	}

	appendBlockChild(child: C): InnerBlock<T, C> {
		const newLength = this.length + child.length;

		return this.copy(append(this.children, child), newLength);
	}

	appendChild(child: C): Inner<T, C> {
		const newLength = this.length + child.length;

		if (this.canAddChild) {
			return this.copy(append(this.children, child), newLength);
		}

		return this.context.innerTree(
			this,
			this.copy([child], child.length),
			null,
			newLength,
			this.level,
		);
	}

	concat(other: Inner<T, C>): Inner<T, C> {
		const newLength = this.length + other.length;

		if (other.context.isInnerBlock<T, C>(other)) {
			if (other === this && this.children.length > this.context.minBlockSize) {
				return this.context.innerTree(this, this, null, newLength, this.level);
			}

			return this.concatBlock(other);
		}
		if (this.context.isInnerTree<T, C>(other)) {
			return this.concatTree(other);
		}

		throwInvalidStateError();
	}

	concatBlock(innerBlock: InnerBlock<T, C>): Inner<T, C> {
		return this.concatChildren(innerBlock)._mutateNormalize();
	}

	concatTree(innerTree: InnerTree<T, C>): Inner<T, C> {
		const newLength = this.length + innerTree.length;

		if (
			this.nrChildren + innerTree.left.nrChildren <=
			this.context.maxBlockSize
		) {
			const newLeft = this.concatChildren(innerTree.left)._mutateRebalance();

			return innerTree.copy(newLeft, undefined, undefined, newLength);
		}

		if (innerTree.left.childrenInMin) {
			const newMiddle = innerTree.prependMiddleBlock(innerTree.left);

			return innerTree.copy(this, undefined, newMiddle, newLength);
		}

		const newLeft = this.concatChildren(innerTree.left)._mutateRebalance();
		if (newLeft.childrenInMax)
			return innerTree.copy(newLeft, undefined, undefined, newLength);

		const newSecond = newLeft._mutateSplitRight(
			newLeft.nrChildren - this.context.maxBlockSize,
		);
		const newMiddle = innerTree.prependMiddleBlock(newSecond);

		return innerTree.copy(newLeft, undefined, newMiddle, newLength);
	}

	concatChildren(other: InnerBlock<T, C>): InnerBlock<T, C> {
		const newChildren = this.children.concat(other.children);

		return this.copy(newChildren, this.length + other.length);
	}

	reversed(cacheMap: CacheMap = this.context.cacheMap()): InnerBlock<T, C> {
		const cachedThis = cacheMap.get<InnerBlock<T, C>>(this);
		if (cachedThis !== undefined) return cachedThis;

		const children = this.children;
		const nrChildren = this.nrChildren;
		const result: C[] = Array(nrChildren);
		let i = -1;
		let reverseIndex = nrChildren;

		while (++i < nrChildren) {
			result[i] = children[--reverseIndex].reversed(cacheMap) as C;
		}

		return this.copy(result);
	}

	dropFirstChild(): [InnerBlock<T, C> | null, C] {
		const firstChild = this.children[0];

		if (this.nrChildren === 1) return [null, firstChild];

		const newChildren = this.children.slice(1);
		const newLength = this.length - firstChild.length;
		const newSelf = this.copy(newChildren, newLength);

		return [newSelf, firstChild];
	}

	dropLastChild(): [InnerBlock<T, C> | null, C] {
		const lastChild = this.children.at(-1)!;

		if (this.nrChildren === 1) return [null, lastChild];

		const newChildren = this.children.slice(0, -1);
		const newLength = this.length - lastChild.length;
		const newSelf = this.copy(newChildren, newLength);

		return [newSelf, lastChild];
	}

	modifyFirstChild(f: (child: C) => C): InnerBlock<T, C> {
		const firstChild = this.children[0];
		const newFirstChild = f(firstChild);
		if (newFirstChild === firstChild) {
			return this;
		}
		const newChildren = [newFirstChild].concat(this.children.slice(1));
		const newLength = this.length - firstChild.length + newFirstChild.length;

		return this.copy(newChildren, newLength);
	}

	modifyLastChild(f: (child: C) => C): InnerBlock<T, C> {
		const lastChild = this.children.at(-1)!;
		const newLastChild = f(lastChild);
		if (newLastChild === lastChild) {
			return this;
		}
		const newChildren = this.children.slice(0, -1).concat(newLastChild);
		const newLength = this.length - lastChild.length + newLastChild.length;

		return this.copy(newChildren, newLength);
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { reversed: boolean; state: TraverseState },
	): void {
		const { reversed, state } = options;

		if (state.halted) return;

		const nrChildren = this.nrChildren;

		if (!reversed) {
			let i = -1;
			const children = this.children;

			while (!state.halted && ++i < nrChildren) {
				children[i].forEach(f, options);
			}
		} else {
			let i = nrChildren;
			const children = this.children;

			while (!state.halted && --i >= 0) {
				children[i].forEach(f, options);
			}
		}
	}

	map<T2, C2 extends Block<T2>>(
		mapFun: (value: T, index: number) => T2,
		options: { reversed?: boolean; indexOffset?: number } = {},
	): InnerBlock<T2, C2> {
		const { reversed = false, indexOffset = 0 } = options;

		let offset = indexOffset;
		const children = this.children;
		const nrChildren = this.nrChildren;
		const newChildren: C2[] = Array(nrChildren);

		if (reversed) {
			let i = -1;
			let reverseIndex = nrChildren;

			while (++i < nrChildren) {
				const child = children[--reverseIndex];
				newChildren[i] = child.map(mapFun, {
					reversed: true,
					indexOffset: offset,
				}) as C2;
				offset += child.length;
			}
		} else {
			let i = -1;

			while (++i < nrChildren) {
				const child = children[i];
				newChildren[i] = child.map(mapFun, { indexOffset: offset }) as C2;
				offset += child.length;
			}
		}

		return this.copy2(newChildren);
	}

	takeChildren(childAmount: number): InnerBlock<T, C> | null {
		if (childAmount <= 0) return null;
		if (childAmount >= this.nrChildren) return this;

		const newChildren = splice(
			this.children,
			childAmount,
			this.context.maxBlockSize,
		);

		const newLength = newChildren.reduce((l, c): number => l + c.length, 0);
		return this.copy(newChildren, newLength);
	}

	dropChildren(childAmount: number): InnerBlock<T, C> | null {
		if (childAmount <= 0) {
			return this;
		}
		if (childAmount >= this.nrChildren) {
			return null;
		}

		const newChildren = splice(this.children, 0, childAmount);

		const newLength = newChildren.reduce((l, c): number => l + c.length, 0);
		return this.copy(newChildren, newLength);
	}

	takeInternal(amount: number): [InnerBlock<T, C> | null, C, number] {
		const [childIndex, inChildIndex] = this.getCoordinates(amount, true, false);

		if (childIndex >= this.nrChildren) {
			throwInvalidStateError();
		}

		const lastChild = this.children[childIndex];
		const newSelf = this.takeChildren(childIndex);

		return [newSelf, lastChild, inChildIndex];
	}

	dropInternal(amount: number): [InnerBlock<T, C> | null, C, number] {
		const [childIndex, inChildIndex] = this.getCoordinates(
			amount,
			false,
			false,
		);

		if (childIndex >= this.nrChildren) {
			throwInvalidStateError();
		}

		const firstChild = this.children[childIndex];
		const newSelf = this.dropChildren(childIndex + 1);

		return [newSelf, firstChild, inChildIndex];
	}

	toArray(
		options: { range?: IndexRange | undefined; reversed?: boolean } = {},
	): T[] {
		const { range, reversed = false } = options;

		let start = 0;
		let end = this.length - 1;

		if (undefined !== range) {
			const indexRange = IndexRange.getIndicesFor(range, this.length);
			if (indexRange === 'empty') return [];
			if (indexRange !== 'all') {
				start = indexRange[0];
				end = indexRange[1];
			}
		}

		const [startChildIndex, inStartChildIndex] = this.getCoordinates(
			start,
			false,
			true,
		);
		const [endChildIndex, inEndChildIndex] = this.getCoordinates(
			end,
			false,
			true,
		);

		const children = this.children;

		if (startChildIndex === endChildIndex) {
			const child = children[startChildIndex];

			return child.toArray({
				range: {
					start: inStartChildIndex,
					end: inEndChildIndex,
				},
				reversed,
			});
		}

		const firstArray = children[startChildIndex].toArray({
			range: {
				start: inStartChildIndex,
			},
			reversed,
		});

		const lastArray = children[endChildIndex].toArray({
			range: { end: inEndChildIndex },
			reversed,
		});

		if (reversed) {
			let result: readonly T[] = lastArray;

			for (
				let childIndex = endChildIndex - 1;
				childIndex > startChildIndex;
				childIndex--
			) {
				result = concat(
					result,
					children[childIndex].toArray({ reversed: true }),
				);
			}

			return concat(result, firstArray) as T[];
		}

		let result: readonly T[] = firstArray;

		for (
			let childIndex = startChildIndex + 1;
			childIndex < endChildIndex;
			childIndex++
		) {
			result = concat(result, children[childIndex].toArray());
		}

		return concat(result, lastArray) as T[];
	}

	getCoordinates(
		index: number,
		forTake: boolean,
		noEmptyLast: boolean,
	): [number, number] {
		const offset = forTake ? 1 : 0;
		const indexWithOffset = index - offset;

		const nrChildren = this.nrChildren;
		const length = this.length;
		const children = this.children;

		if (indexWithOffset >= length) {
			// return the end
			if (noEmptyLast) {
				return [nrChildren - 1, children.at(-1)!.length - 1];
			}

			return [nrChildren, 0];
		}

		// Fast path: regular block — all children have the same full subtree size.
		if (this.sizes === null) {
			const levelBits = this.context.blockSizeBits * this.level;
			const blockSize = 1 << levelBits;
			const childIndex = indexWithOffset >>> levelBits;
			const inChildIndex = (indexWithOffset & (blockSize - 1)) + offset;
			return [childIndex, inChildIndex];
		}

		// Irregular block — binary search on cumulative size table.
		const sizes = this.sizes;
		let lo = 0;
		let hi = nrChildren - 1;

		while (lo < hi) {
			const mid = (lo + hi) >>> 1;
			if (sizes[mid] <= indexWithOffset) {
				lo = mid + 1;
			} else {
				hi = mid;
			}
		}

		const childIndex = lo;
		const prevSize = childIndex > 0 ? sizes[childIndex - 1] : 0;
		const inChildIndex = indexWithOffset - prevSize + offset;
		return [childIndex, inChildIndex];
	}

	createBlockBuilder(): InnerBlockBuilder<T, ToMutable<C>> {
		return this.context.innerBlockBuilderSource(this as any);
	}

	_mutateRebalance(): InnerBlock<T, C> {
		let i = 0;

		const children = this.children;

		while (i < children.length - 1) {
			const child = children[i];
			const rightChild = children[i + 1];

			if (
				child.nrChildren + rightChild.nrChildren <=
				this.context.maxBlockSize
			) {
				const newChild = child.concatChildren(rightChild) as C;
				this.children.splice(i, 2, newChild);
			} else i++;
		}

		this.sizes = computeSizeTable(this.children, this.level, this.context.blockSizeBits);

		return this;
	}

	_mutateNormalize(): Inner<T, C> {
		if (this.childrenInMax) {
			return this;
		}

		const length = this.length;
		const newRight = this._mutateSplitRight();

		return this.context.innerTree(this, newRight, null, length, this.level);
	}

	_mutateSplitRight(childIndex = this.nrChildren >>> 1): InnerBlock<T, C> {
		const rightChildren = this.children.splice(childIndex);
		let rightLength = 0;

		for (let i = 0; i < rightChildren.length; i++) {
			rightLength += rightChildren[i].length;
		}

		this.length -= rightLength;
		this.sizes = computeSizeTable(this.children, this.level, this.context.blockSizeBits);

		return this.copy(rightChildren, rightLength);
	}

	_structure(depth: number): string {
		const space = '  '.repeat(depth);
		const nextDepth = depth + 2;
		return `\
${space}InnerBlock(lev:${this.level}, len:${this.length}, ch: ${this.nrChildren})
${this.children.map((c) => c._structure(nextDepth)).join('\n')}\
`;
	}

	_verifyStructure(
		messages: string[] = [],
		enforceMinChildren = false,
	): string[] {
		if (enforceMinChildren && !this.childrenInMin) {
			messages.push(
				`InnerBlock of level ${this.level} has fewer children than allowed: ${this.nrChildren} < ${this.context.minBlockSize}`,
			);
		}
		if (!this.childrenInMax) {
			messages.push(
				`InnerBlock of level ${this.level} has more children than allowed: ${this.nrChildren} > ${this.context.maxBlockSize}`,
			);
		}

		let length = 0;
		for (const child of this.children) {
			length += child.length;
			child._verifyStructure(messages, true);
		}
		if (length !== this.length) {
			messages.push(
				`InnerBlock of level ${this.level} has length ${this.length} but sum of child lengths is ${length}.`,
			);
		}

		// Verify size table consistency.
		const expectedSizes = computeSizeTable(
			this.children,
			this.level,
			this.context.blockSizeBits,
		);
		if (expectedSizes === null && this.sizes !== null) {
			messages.push(
				`InnerBlock of level ${this.level} is regular but has a non-null size table.`,
			);
		} else if (expectedSizes !== null && this.sizes === null) {
			messages.push(
				`InnerBlock of level ${this.level} is irregular but has a null size table.`,
			);
		} else if (expectedSizes !== null && this.sizes !== null) {
			for (let i = 0; i < expectedSizes.length; i++) {
				if (expectedSizes[i] !== this.sizes[i]) {
					messages.push(
						`InnerBlock of level ${this.level} size table entry ${i} is ${this.sizes[i]} but expected ${expectedSizes[i]}.`,
					);
					break;
				}
			}
		}

		return messages;
	}
}
