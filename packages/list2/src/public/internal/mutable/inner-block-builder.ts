import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Update } from '@rimbu/common/update';

import type { ListContext } from '#list/context-module';
import type { InnerBlock } from '#list/immutable/inner-block';

import {
	type BlockBuilder,
	BuilderBase,
	type InnerBuilder,
} from '#list/mutable/builder-base';

/**
 * Recompute a full cumulative size table from the current mutable children.
 * Returns null if the block is regular (all children fill exactly blockSize elements).
 */
function recomputeSizes(
	children: readonly { length: number }[],
	level: number,
	blockSizeBits: number,
): number[] | null {
	const levelBits = blockSizeBits << (level - 1);
	const blockSize = 1 << levelBits;
	const n = children.length;
	let total = 0;
	let irregular = false;
	const sizes = new Array<number>(n);

	for (let i = 0; i < n; i++) {
		total += children[i].length;
		sizes[i] = total;
		if (children[i].length !== blockSize) irregular = true;
	}

	return irregular ? sizes : null;
}

/**
 * Update the cumulative size table in-place starting from index `from`.
 * Pass the existing sizes array (which must already be non-null).
 */
function updateSizesFrom(
	sizes: number[],
	children: readonly { length: number }[],
	from: number,
): void {
	const prev = from > 0 ? sizes[from - 1] : 0;
	let total = prev;
	for (let i = from; i < children.length; i++) {
		total += children[i].length;
		sizes[i] = total;
	}
}

export class InnerBlockBuilder<T, C extends BlockBuilder<T>>
	extends BuilderBase
	implements InnerBuilder<T, C>, BlockBuilder<T, C>
{
	/** Cumulative size table; null means regular (all children full). */
	sizes: number[] | null = null;

	constructor(
		context: ListContext,
		readonly level: number,
		public source?: InnerBlock<T, any>,
		public _children?: C[],
		public length: number = source?.length ?? 0,
	) {
		super(context);
		if (source !== undefined) {
			// Inherit size table from source.
			this.sizes = source.sizes;
		} else if (_children !== undefined && _children.length > 0) {
			// Compute size table from provided children.
			this.sizes = recomputeSizes(_children, level, context.blockSizeBits);
		}
	}

	get children(): C[] {
		return this._children!;
	}

	get readChildren(): readonly C[] {
		return this.source?.children ?? this.children;
	}

	get nrChildren(): number {
		return this.source?.nrChildren ?? this.children.length;
	}

	get canAddChild(): boolean {
		return this.nrChildren < this.context.maxBlockSize;
	}

	get canRemoveChild(): boolean {
		return this.nrChildren > this.context.minBlockSize;
	}

	get childrenInMax(): boolean {
		return this.nrChildren <= this.context.maxBlockSize;
	}

	get childrenInMin(): boolean {
		return this.nrChildren >= this.context.minBlockSize;
	}

	prepareMutate(): void {
		if (undefined === this.source) return;

		this._children = this.source.children.map((c) => c.createBlockBuilder());
		// Copy size table from source (already computed at construction time).
		this.sizes = this.source.sizes
			? this.source.sizes.slice()
			: null;
		this.source = undefined;
	}

	get(index: number): T {
		if (undefined !== this.source) {
			return this.source.get(index);
		}

		const [childIndex, inChildIndex] = this.getCoordinates(index);

		return this.readChildren[childIndex].get(inChildIndex);
	}

	updateAt(index: number, update: Update<T>): T {
		this.prepareMutate();
		const [childIndex, inChildIndex] = this.getCoordinates(index);
		return this.children[childIndex].updateAt(inChildIndex, update);
	}

	insert(index: number, value: T): void {
		this.prepareMutate();
		const [childIndex, inChildIndex] = this.getCoordinates(index);

		this.length++;

		// insert into child
		const child = this.children[childIndex];

		child.insert(inChildIndex, value);

		if (child.childrenInMax) {
			// child is still valid — update size table from childIndex onward
			if (this.sizes !== null) {
				updateSizesFrom(this.sizes, this.children, childIndex);
			} else {
				// Was regular; one child grew — now irregular
				this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
			}
			return;
		}

		// child is too large
		const leftChild = this.children[childIndex - 1];
		if (leftChild?.canAddChild) {
			// shift to leftChild
			const shiftChild = child.dropFirstChild();
			leftChild.appendChild(shiftChild);

			// Two children changed: childIndex-1 and childIndex
			if (this.sizes !== null) {
				updateSizesFrom(this.sizes, this.children, childIndex - 1);
			} else {
				this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
			}
			return;
		}

		const rightChild = this.children[childIndex + 1];
		if (rightChild?.canAddChild) {
			// shift to rightChild
			const shiftChild = child.dropLastChild();
			rightChild.prependChild(shiftChild);

			if (this.sizes !== null) {
				updateSizesFrom(this.sizes, this.children, childIndex);
			} else {
				this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
			}
			return;
		}

		// cannot shift, split child
		const newRightChild = child.splitRight();
		this.children.splice(childIndex + 1, 0, newRightChild as C);

		// Sizes array needs a new entry; full recompute is simplest here.
		this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
	}

	remove(index: number): T {
		this.prepareMutate();
		const [childIndex, inChildIndex] = this.getCoordinates(index);

		this.length--;

		// remove from child
		const child = this.children[childIndex];
		const oldValue = child.remove(inChildIndex);

		if (child.canRemoveChild || this.nrChildren <= 1) {
			// no need to normalize
			if (this.sizes !== null) {
				updateSizesFrom(this.sizes, this.children, childIndex);
			} else {
				this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
			}
			return oldValue;
		}

		const leftChild = this.children[childIndex - 1];
		if (undefined !== leftChild) {
			if (
				child.nrChildren + leftChild.nrChildren <=
				this.context.maxBlockSize
			) {
				// merge with left
				leftChild.appendItems(child);
				this.children.splice(childIndex, 1);
				this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
				return oldValue;
			}
		}

		const rightChild = this.children[childIndex + 1];
		if (undefined !== rightChild) {
			if (
				child.nrChildren + rightChild.nrChildren <=
				this.context.maxBlockSize
			) {
				// merge with right
				rightChild.prependItems(child);
				this.children.splice(childIndex, 1);
				this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
				return oldValue;
			}
		}

		if (child.childrenInMin) {
			// child has enough children, and left and right more than min, so all good
			if (this.sizes !== null) {
				updateSizesFrom(this.sizes, this.children, childIndex);
			} else {
				this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
			}
			return oldValue;
		}

		// find sibling with most children (most surplus to redistribute)
		const maxChildren =
			undefined === leftChild
				? rightChild
				: undefined === rightChild
					? leftChild
					: leftChild.nrChildren >= rightChild.nrChildren
						? leftChild
						: rightChild;

		if (maxChildren === leftChild) {
			// rebalance with left
			leftChild.appendItems(child);
			this.children[childIndex] = leftChild.splitRight(
				Math.ceil(leftChild.nrChildren / 2),
			) as C;
		} else {
			// rebalance with right
			child.appendItems(rightChild);
			this.children[childIndex + 1] = child.splitRight(
				Math.floor(child.nrChildren / 2),
			) as C;
		}

		this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
		return oldValue;
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { reversed: boolean; state: TraverseState },
	): void {
		if (undefined !== this.source) {
			this.source.forEach(f, options);
			return;
		}

		const { reversed, state } = options;

		if (state.halted) return;

		const length = this.children.length;

		if (!reversed) {
			let i = -1;
			while (!state.halted && ++i < length) {
				this.children[i].forEach(f, options);
			}
		} else {
			let i = length;
			while (!state.halted && --i >= 0) {
				this.children[i].forEach(f, options);
			}
		}
	}

	prependChild(child: C): void {
		this.prepareMutate();
		this.length += child.length;

		const firstChild = this.children[0]!;

		if (firstChild.nrChildren + child.nrChildren <= this.context.maxBlockSize) {
			// can merge with first child
			firstChild.prependItems(child);
		} else if (!firstChild.childrenInMin) {
			firstChild.prependItems(child);
			const newSecondChild = firstChild.splitRight() as C;
			this.children.splice(1, 0, newSecondChild);
		} else {
			this.children.unshift(child);
		}

		this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
	}

	appendChild(child: C): void {
		this.prepareMutate();
		this.length += child.length;

		const lastChild = this.children.at(-1)!;

		if (lastChild.nrChildren + child.nrChildren <= this.context.maxBlockSize) {
			// can merge with last child
			lastChild.appendItems(child);
		} else if (!lastChild.childrenInMin) {
			lastChild.appendItems(child);
			this.children.push(lastChild.splitRight() as C);
		} else {
			this.children.push(child);
		}

		this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
	}

	firstChild(): C {
		this.prepareMutate();
		return this.children[0];
	}

	lastChild(): C {
		this.prepareMutate();
		return this.children.at(-1)!;
	}

	dropFirstChild(): C {
		this.prepareMutate();
		const child = this.children.shift()!;
		this.length -= child.length;

		if (this.sizes !== null) {
			const removed = this.sizes.shift()!;
			// Subtract removed size from all remaining entries.
			for (let i = 0; i < this.sizes.length; i++) {
				this.sizes[i] -= removed;
			}
			// Check if now regular.
			if (this.children.length > 0) {
				this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
			} else {
				this.sizes = null;
			}
		}

		return child;
	}

	dropLastChild(): C {
		this.prepareMutate();
		const child = this.children.pop()!;
		this.length -= child.length;

		if (this.sizes !== null) {
			this.sizes.pop();
			// Check if now regular.
			if (this.children.length > 0) {
				this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
			} else {
				this.sizes = null;
			}
		}

		return child;
	}

	modifyFirstChild(f: (child: C) => number | undefined): number | undefined {
		const firstChild = this.firstChild();
		const delta = f(firstChild);
		if (undefined !== delta) {
			this.length += delta;
			// Update size table from index 0.
			if (this.sizes !== null) {
				updateSizesFrom(this.sizes, this.children, 0);
			} else {
				this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
			}
		}

		return delta;
	}

	modifyLastChild(f: (child: C) => number | undefined): number | undefined {
		const lastChild = this.lastChild();
		const delta = f(lastChild);
		if (undefined !== delta) {
			this.length += delta;
			const lastIndex = this.nrChildren - 1;
			if (this.sizes !== null) {
				updateSizesFrom(this.sizes, this.children, lastIndex);
			} else {
				this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
			}
		}

		return delta;
	}

	build(): InnerBlock<T, any> {
		if (this.source) return this.source;

		return this.context.innerBlock(
			this.children.map((c) => c.build()),
			this.length,
			this.level,
			this.sizes,
		);
	}

	buildMap<T2>(f: (value: T) => T2): InnerBlock<T2, any> {
		return (
			this.source?.map?.(f) ??
			this.context.innerBlock<T2, any>(
				this.children.map((c) => c.buildMap(f)),
				this.length,
				this.level,
			)
		);
	}

	splitRight(index = this.nrChildren >>> 1): InnerBlockBuilder<T, C> {
		this.prepareMutate();
		const rightChildren = this.children.splice(index);
		const oldLength = this.length;
		this.length = 0;
		for (let i = 0; i < this.nrChildren; i++) {
			this.length += this.children[i].length;
		}
		const rightLength = oldLength - this.length;

		// Recompute size tables for both halves.
		this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);

		const right = this.context.innerBlockBuilder(
			this.level,
			rightChildren as C[],
			rightLength,
		) as InnerBlockBuilder<T, C>;
		right.sizes = recomputeSizes(rightChildren, this.level, this.context.blockSizeBits);

		return right;
	}

	normalized(): InnerBuilder<T, C> | undefined {
		if (this.nrChildren === 0) {
			// empty
			return undefined;
		}

		const context = this.context;

		const maxBlockSize = context.maxBlockSize;

		if (this.nrChildren > maxBlockSize) {
			const currentLength = this.length;
			const newRight = this.splitRight();

			// too many children, needs to split
			const result = context.innerTreeBuilder(
				this.level,
				this,
				newRight,
				undefined,
				currentLength,
			);

			return result;
		}

		// already normalized
		return this;
	}

	prependItems(other: InnerBlockBuilder<T, C>): void {
		this.prepareMutate();
		other.prepareMutate();
		this.length += other.length;

		const firstChild = this.children[0];
		const lastIndex = other.nrChildren - 1;
		for (let i = 0; i < other.nrChildren; i++) {
			const child = other.children[i];
			if (
				i === lastIndex &&
				firstChild.nrChildren + child.nrChildren <= this.context.maxBlockSize
			) {
				// can merge with first child
				firstChild.prependItems(child);
			} else {
				this.children.unshift(child);
			}
		}

		this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
	}

	appendItems(other: InnerBlockBuilder<T, C>): void {
		this.prepareMutate();
		other.prepareMutate();
		this.length += other.length;

		const lastChild = this.children.at(-1)!;
		for (let i = 0; i < other.nrChildren; i++) {
			const child = other.children[i];
			if (
				i === 0 &&
				lastChild.nrChildren + child.nrChildren <= this.context.maxBlockSize
			) {
				// can merge with last child
				lastChild.appendItems(child);
			} else {
				this.children.push(child);
			}
		}

		this.sizes = recomputeSizes(this.children, this.level, this.context.blockSizeBits);
	}

	getCoordinates(index: number): [number, number] {
		const readChildren = this.readChildren;
		const nrChildren = readChildren.length;
		const length = this.length;

		if (index >= length) {
			// always return end of last child
			const lastChild = readChildren.at(-1)!;
			return [nrChildren - 1, lastChild.length];
		}

		// Fast path: regular block.
		if (this.sizes === null) {
			const levelBits = this.context.blockSizeBits << (this.level - 1);
			const blockSize = 1 << levelBits;
			const childIndex = index >>> levelBits;
			const inChildIndex = index & (blockSize - 1);
			return [childIndex, inChildIndex];
		}

		// Irregular block — binary search on cumulative size table.
		const sizes = this.sizes;
		let lo = 0;
		let hi = nrChildren - 1;

		while (lo < hi) {
			const mid = (lo + hi) >>> 1;
			if (sizes[mid] <= index) {
				lo = mid + 1;
			} else {
				hi = mid;
			}
		}

		const childIndex = lo;
		const prevSize = childIndex > 0 ? sizes[childIndex - 1] : 0;
		return [childIndex, index - prevSize];
	}

	_verifyStructure(
		messages: string[] = [],
		enforceMinChildren = false,
	): string[] {
		if (undefined !== this.source) {
			return this.source._verifyStructure(messages, enforceMinChildren);
		}

		if (enforceMinChildren && !this.childrenInMin) {
			messages.push(
				`InnerBlockBuilder has too few children: ${this.nrChildren} < ${this.context.minBlockSize}`,
			);
		}
		if (this.nrChildren === 0) {
			messages.push(`InnerBlockBuilder has no children.`);
		}

		if (!this.childrenInMax) {
			messages.push(
				`InnerBlockBuilder has too many children: ${this.nrChildren} > ${this.context.maxBlockSize}`,
			);
		}

		let length = 0;

		for (const child of this.readChildren) {
			length += child.length;
			child._verifyStructure(messages, true);
		}

		if (this.length !== length) {
			messages.push(
				`InnerBlockBuilder length ${this.length} does not match sum of children lengths ${length}.`,
			);
		}

		return messages;
	}
}
