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

export class InnerBlockBuilder<T>
	extends BuilderBase
	implements InnerBuilder<T>, BlockBuilder<T>
{
	constructor(
		context: ListContext,
		readonly level: number,
		public source?: InnerBlock<T, any>,
		public _children?: Array<BlockBuilder<T>>,
		public length: number = source?.length ?? 0,
	) {
		super(context);
	}

	get children(): Array<BlockBuilder<T>> {
		return this._children!;
	}

	get nrChildren(): number {
		return this.children.length;
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

		return this.children[childIndex].get(inChildIndex);
	}

	updateAt(index: number, update: Update<T>): T {
		const [childIndex, inChildIndex] = this.getCoordinates(index);
		return this.children[childIndex].updateAt(inChildIndex, update);
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

	prependChild(child: BlockBuilder<T>): void {
		this.length += child.length;

		this.children.unshift(child);
	}

	appendChild(child: BlockBuilder<T>): void {
		this.length += child.length;

		this.children.push(child);
	}

	firstChild(): BlockBuilder<T> {
		return this.children[0];
	}

	lastChild(): BlockBuilder<T> {
		return this.children.at(-1)!;
	}

	dropFirstChild(): BlockBuilder<T> {
		const child = this.children.shift()!;
		this.length -= child.length;

		return child;
	}

	dropLastChild(): BlockBuilder<T> {
		const child = this.children.pop()!;
		this.length -= child.length;

		return child;
	}

	modifyFirstChild(
		f: (child: BlockBuilder<T>) => number | undefined,
	): number | undefined {
		const delta = f(this.firstChild());
		if (undefined !== delta) {
			this.length += delta;
		}

		return delta;
	}

	modifyLastChild(
		f: (child: BlockBuilder<T>) => number | undefined,
	): number | undefined {
		const delta = f(this.lastChild());
		if (undefined !== delta) {
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

	splitRight(index = this.nrChildren >>> 1): InnerBlockBuilder<T> {
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

	normalized(): InnerBuilder<T> | undefined {
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

	prependItems(other: BlockBuilder<T>): void {
		this.prepareMutate();
		this.length += other.length;
		this.children.unshift(other);
	}

	appendItems(other: BlockBuilder<T>): void {
		this.prepareMutate();
		this.length += other.length;
		this.children.push(other);
	}

	getCoordinates(index: number): [number, number] {
		const nrChildren = this.nrChildren;
		const length = this.length;

		if (index >= length) {
			// always return end of last child
			const lastChild = this.children.at(-1)!;
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
		const children = this.children;

		if (index <= length >>> 1) {
			// search left to right
			let i = index;
			for (let childIndex = 0; childIndex < nrChildren; childIndex++) {
				const childLength = children[childIndex].length;

				if (i < childLength) {
					return [childIndex, i];
				}

				i -= childLength;
			}
		} else {
			// search right to left
			let i = length - index;
			for (let childIndex = nrChildren - 1; childIndex >= 0; childIndex--) {
				const childLength = children[childIndex].length;

				if (i <= childLength) {
					return [childIndex, childLength - i];
				}

				i -= childLength;
			}
		}

		throwInvalidStateError();
	}
}
