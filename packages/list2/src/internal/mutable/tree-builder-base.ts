import type { ListContext } from '#list/context';
import type { BlockBuilder, InnerBuilder } from '#list/mutable/common';

import { throwInvalidStateError } from '@rimbu/base';

export abstract class TreeBuilderBase<T, C> {
	abstract readonly context: ListContext<T, true>;
	abstract readonly level: number;
	abstract size: number;
	abstract left: BlockBuilder<T>;
	abstract right: BlockBuilder<T>;
	abstract middle: InnerBuilder<T, BlockBuilder<T>> | undefined;
	abstract getChildSize(child: C): number;
	abstract prependBlockChild(block: BlockBuilder<T>, child: C): void;
	abstract appendBlockChild(block: BlockBuilder<T>, child: C): void;
	abstract dropBlockFirstChild(block: BlockBuilder<T>): C;
	abstract dropBlockLastChild(block: BlockBuilder<T>): C;
	abstract prepareMutate(): void;
	abstract createBlockBuilder(child: C): BlockBuilder<T>;

	get(index: number): T {
		const middleIndex = index - this.left.size;

		if (middleIndex < 0) {
			// index is in left part
			return this.left.get(index);
		}

		const rightIndex = middleIndex - (this.middle?.size ?? 0);

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

	append(child: C): void {
		this.prepareMutate();

		this.size += this.getChildSize(child);

		if (this.right.canAddChild) {
			this.appendBlockChild(this.right, child);
			return;
		}

		if (undefined === this.middle) {
			if (this.left.canAddChild) {
				const shiftChild = this.dropBlockFirstChild(this.right);
				this.appendBlockChild(this.left, shiftChild);
				this.appendBlockChild(this.right, child);
				return;
			}

			this.appendMiddle(this.right);
			this.right = this.createBlockBuilder(child);
			return;
		}

		const delta = this.middle.modifyLastChild(
			(lastChild): number | undefined => {
				if (lastChild.canAddChild) {
					const shiftChild = this.dropBlockFirstChild(this.right);
					this.appendBlockChild(this.right, child);
					this.appendBlockChild(lastChild, shiftChild);
					return this.getChildSize(shiftChild);
				}
				return;
			},
		);

		if (undefined !== delta) {
			return;
		}

		this.appendMiddle(this.right);
		this.right = this.createBlockBuilder(child);
	}

	prepend(child: C): void {
		this.prepareMutate();

		this.size += this.getChildSize(child);

		if (this.left.canAddChild) {
			this.prependBlockChild(this.left, child);
			return;
		}

		if (undefined === this.middle) {
			if (this.right.canAddChild) {
				const shiftChild = this.dropBlockLastChild(this.left);
				this.prependBlockChild(this.right, shiftChild);
				this.prependBlockChild(this.left, child);
				return;
			}

			this.prependMiddle(this.left);
			this.left = this.createBlockBuilder(child);
			return;
		}

		// middle exists

		// try to shift child to first middle
		const delta = this.middle.modifyFirstChild(
			(firstChild): number | undefined => {
				if (firstChild.canAddChild) {
					// first child has room for shift
					const shiftChild = this.dropBlockLastChild(this.left);
					this.prependBlockChild(this.left, child);
					this.prependBlockChild(firstChild, shiftChild);
					return this.getChildSize(shiftChild);
				}
				return;
			},
		);

		if (undefined !== delta) {
			// shift succeeded, done
			return;
		}

		// move full left block to middle and prepend new child to new left block
		this.prependMiddle(this.left);
		this.left = this.createBlockBuilder(child);
	}

	appendMiddle(child: BlockBuilder<T>): void {
		this.prepareMutate();

		if (undefined === this.middle) {
			this.middle = this.context.innerBlockBuilder(
				[child],
				child.size,
				this.level + 1,
			);
		} else {
			this.middle.appendChild(child);
			this.middle = this.middle.normalized();
		}
	}

	prependMiddle(child: BlockBuilder<T>): void {
		this.prepareMutate();

		if (undefined === this.middle) {
			this.middle = this.context.innerBlockBuilder(
				[child],
				child.size,
				this.level + 1,
			);
		} else {
			this.middle.prependChild(child);
			this.middle = this.middle.normalized();
		}
	}
}
