import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Update } from '@rimbu/common/update';

import type { ListContext } from '#list/context-module';
import type { InnerBlock } from '#list/immutable/inner-block';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';

import {
	type BlockBuilder,
	BuilderBase,
	type InnerBuilder,
} from '#list/mutable/builder-base';

export class InnerBlockBuilder<T, C extends BlockBuilder<T>>
	extends BuilderBase
	implements InnerBuilder<T, C>, BlockBuilder<T, C>
{
	constructor(
		context: ListContext,
		readonly level: number,
		public source?: InnerBlock<T, any>,
		public _children?: C[],
		public length: number = source?.length ?? 0,
	) {
		super(context);
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

	prepareMutate(): void {
		if (undefined === this.source) return;

		this._children = this.source.children.map((c) => c.createBlockBuilder());
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

		if (child.nrChildren <= this.context.maxBlockSize) {
			// no need to normalize
			return;
		}

		// child is too large
		const leftChild = this.children[childIndex - 1];
		if (
			undefined !== leftChild &&
			leftChild.nrChildren < this.context.maxBlockSize
		) {
			// shift to leftChild
			const shiftChild = child.dropFirstChild();
			leftChild.appendChild(shiftChild);

			return;
		}

		const rightChild = this.children[childIndex + 1];
		if (
			undefined !== rightChild &&
			rightChild.nrChildren < this.context.maxBlockSize
		) {
			// shift to rightChild
			const shiftChild = child.dropLastChild();
			rightChild.prependChild(shiftChild);

			return;
		}

		// cannot shift, split child
		const newRightChild = child.splitRight();
		this.children.splice(childIndex + 1, 0, newRightChild as C);
	}

	remove(index: number): T {
		this.prepareMutate();
		const [childIndex, inChildIndex] = this.getCoordinates(index);

		this.length--;

		// remove from child
		const child = this.children[childIndex];

		const oldValue = child.remove(inChildIndex);

		if (child.nrChildren >= this.context.minBlockSize || this.nrChildren <= 1) {
			// no need to normalize
			return oldValue;
		}

		const leftChild = this.children[childIndex - 1];
		if (
			undefined !== leftChild &&
			leftChild.nrChildren > this.context.minBlockSize
		) {
			// can shift from left
			const shiftChild = leftChild.dropLastChild();
			child.prependChild(shiftChild);

			return oldValue;
		}

		const rightChild = this.children[childIndex + 1];
		if (
			undefined !== rightChild &&
			rightChild.nrChildren > this.context.minBlockSize
		) {
			// can shift from right
			const shiftChild = rightChild.dropFirstChild();
			child.appendChild(shiftChild);

			return oldValue;
		}

		if (undefined !== leftChild) {
			// merge with left
			leftChild.appendItems(child);
			this.children.splice(childIndex, 1);

			return oldValue;
		}

		// merge with right
		child.appendItems(rightChild);
		this.children.splice(childIndex + 1, 1);

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

		this.children.unshift(child);
	}

	appendChild(child: C): void {
		this.prepareMutate();
		this.length += child.length;

		this.children.push(child);
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

		return child;
	}

	dropLastChild(): C {
		this.prepareMutate();
		const child = this.children.pop()!;
		this.length -= child.length;

		return child;
	}

	modifyFirstChild(f: (child: C) => number | undefined): number | undefined {
		const delta = f(this.firstChild());
		if (undefined !== delta) {
			this.prepareMutate();
			this.length += delta;
		}

		return delta;
	}

	modifyLastChild(f: (child: C) => number | undefined): number | undefined {
		const delta = f(this.lastChild());
		if (undefined !== delta) {
			this.prepareMutate();
			this.length += delta;
		}

		return delta;
	}

	build(): InnerBlock<T, any> {
		return (
			this.source ??
			this.context.innerBlock(
				this.children.map((c) => c.build()),
				this.length,
				this.level,
			)
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

		return this.context.innerBlockBuilder(
			this.level,
			rightChildren,
			rightLength,
		);
	}

	normalized(): InnerBuilder<T, C> | undefined {
		if (this.nrChildren === 0) {
			// empty
			return undefined;
		}

		const context = this.context;

		const maxBlockSize = context.maxBlockSize;

		if (this.nrChildren > maxBlockSize) {
			// too many children, needs to split
			const middleLength = this.length;

			const result = context.innerTreeBuilder(
				this.level,
				this,
				this.splitRight(),
				undefined,
				middleLength,
			);

			return result;
		}

		// already normalized
		return this;
	}

	prependItems(other: InnerBlockBuilder<T, C>): void {
		this.prepareMutate();
		this.length += other.length;
		this._children = other.children.concat(this.children);
	}

	appendItems(other: InnerBlockBuilder<T, C>): void {
		this.prepareMutate();
		this.length += other.length;
		this._children = this.children.concat(other.children);
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

		const levelBits = this.context.blockSizeBits << (this.level - 1);
		const blockSize = 1 << levelBits;

		const regularSize = nrChildren * blockSize;

		if (length === regularSize) {
			// regular blocks, calculate coordinates
			const childIndex = index >>> levelBits;

			const mask = blockSize - 1;
			const inChildIndex = index & mask;
			return [childIndex, inChildIndex];
		}

		// not regular, need to search per child

		if (index <= length >>> 1) {
			// search left to right
			let i = index;
			for (let childIndex = 0; childIndex < nrChildren; childIndex++) {
				const childLength = readChildren[childIndex].length;

				if (i < childLength) {
					return [childIndex, i];
				}

				i -= childLength;
			}
		} else {
			// search right to left
			let i = length - index;
			for (let childIndex = nrChildren - 1; childIndex >= 0; childIndex--) {
				const childLength = readChildren[childIndex].length;

				if (i <= childLength) {
					return [childIndex, childLength - i];
				}

				i -= childLength;
			}
		}

		throwInvalidStateError();
	}
}
