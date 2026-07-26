import type { ListContext } from '#list/context';
import type { BlockBuilder, InnerBuilder } from '#list/mutable/common';

import { treeGet } from '#list/immutable/tree';

export abstract class TreeBuilderBase<T, C> {
	abstract readonly context: ListContext<T, true>;
	abstract readonly level: number;
	abstract size: number;
	abstract left: BlockBuilder<T, C>;
	abstract right: BlockBuilder<T, C>;
	abstract middle: InnerBuilder<T, BlockBuilder<T, C>> | undefined;
	abstract getChildSize(child: C): number;
	abstract prependBlockChild(block: BlockBuilder<T, C>, child: C): void;
	abstract appendBlockChild(block: BlockBuilder<T, C>, child: C): void;
	abstract dropBlockFirstChild(block: BlockBuilder<T, C>): C;
	abstract dropBlockLastChild(block: BlockBuilder<T, C>): C;
	abstract prepareMutate(): void;

	get #ops() {
		return this.context.childrenOps;
	}

	get(index: number): T {
		return treeGet(this, index);
	}

	append(child: C): void {
		this.prepareMutate();

		// add child length to this length
		this.size += this.getChildSize(child);

		if (this.right.canAddChild) {
			// can append to right
			this.appendBlockChild(this.right, child);
			return;
		}

		// right is already at maximum amount children
		if (undefined === this.middle) {
			if (this.left.canAddChild) {
				const shiftChild = this.dropBlockFirstChild(this.right);
				this.appendBlockChild(this.left, shiftChild);
				this.appendBlockChild(this.right, child);
				return;
			}

			this.appendMiddle(this.right);
			this.right = this.context.outerBlockBuilder(this.#ops.of([child]));
			return;
		}

		// middle exists

		// try to shift child to last middle
		const delta = this.middle.modifyLastChild(
			(lastChild): number | undefined => {
				if (lastChild.canAddChild) {
					// last child has room for shift
					const shiftChild = this.dropBlockFirstChild(this.right);
					this.appendBlockChild(this.right, child);
					this.appendBlockChild(lastChild, shiftChild);
					return this.getChildSize(shiftChild);
				}
				return;
			},
		);

		if (undefined !== delta) {
			// shift succeeded, done
			return;
		}

		// move full right block to middle and append new child to new right block
		this.appendMiddle(this.right);
		this.right = this.context.outerBlockBuilder(this.#ops.of([child]));
	}
}
