import type { ListContext } from '#list/context';
import type { LeafTree } from '#list/immutable/leaf-tree';
import type { LeafBlockBuilder } from '#list/mutable/leaf-block-builder';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';

import {
	BuilderBase,
	type LeafBuilder,
	type NonLeafBuilder,
} from '#list/mutable/builder-base';

export class LeafTreeBuilder<T>
	extends BuilderBase<T>
	implements LeafBuilder<T>
{
	constructor(
		context: ListContext,
		public source?: LeafTree<T>,
		public _left?: LeafBlockBuilder<T>,
		public _right?: LeafBlockBuilder<T>,
		public _middle?: NonLeafBuilder<T>,
		public length: number = source?.length ?? 0,
	) {
		super(context);
	}

	prepareMutate(): void {
		if (undefined === this.source) return;

		this._left = this.source.left.toBuilder();
		this._right = this.source.right.toBuilder();
		this._middle = this.source.middle?.toBuilder();
		this.length = this.source.length;
		this.source = undefined;
	}

	get left(): LeafBlockBuilder<T> {
		if (undefined !== this.source) throwInvalidStateError();

		return this._left!;
	}

	set left(value: LeafBlockBuilder<T>) {
		if (undefined !== this.source) throwInvalidStateError();
		this._left = value;
	}

	get right(): LeafBlockBuilder<T> {
		if (undefined !== this.source) throwInvalidStateError();
		return this._right!;
	}

	set right(value: LeafBlockBuilder<T>) {
		if (undefined !== this.source) throwInvalidStateError();
		this._right = value;
	}

	get middle(): NonLeafBuilder<T> | undefined {
		if (undefined !== this.source) throwInvalidStateError();
		return this._middle;
	}

	set middle(value: NonLeafBuilder<T> | undefined) {
		if (undefined !== this.source) throwInvalidStateError();
		this._middle = value;
	}

	get(index: number): T {
		if (undefined !== this.source) {
			return this.source.get(index);
		}

		const middleIndex = index - this.left.length;

		if (middleIndex < 0) {
			// index is in left part
			return this.left.get(index);
		}

		const rightIndex = middleIndex - (this.middle?.itemsLength ?? 0);

		if (rightIndex >= 0) {
			// index is in right part
			return this.right.get(rightIndex);
		}

		if (undefined === this.middle) {
			throwInvalidStateError();
		}

		// index is in middle part
		return this.middle.get(middleIndex);
	}

	prepend(value: T): void {}

	append(value: T): void {}

	build(): LeafTree<T> {
		if (undefined !== this.source) {
			return this.source;
		}

		return this.context.leafTree(
			this.left.build(),
			this.right.build(),
			this.middle?.build() ?? null,
			this.length,
		);
	}

	normalized(): LeafBuilder<T> {
		if (this.length <= this.context.maxBlockSize) {
			// can collapse into block
			this.left.concat(this.right);
			return this.left;
		}

		if (undefined !== this.middle) {
			if (
				this.middle.itemsLength + this.left.length <=
				this.context.maxBlockSize
			) {
				// can merge middle with left
				this.left.concat(this.middle.firstLeafBlockBuilder());
				this.middle = undefined;
			} else if (
				this.middle.itemsLength + this.right.length <=
				this.context.maxBlockSize
			) {
				// can merge middle with right
				const newRight = this.middle.lastLeafBlockBuilder();
				newRight.concat(this.right);
				this.right = newRight;
				this.middle = undefined;
			}
		}

		return this;
	}
}
