import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Update } from '@rimbu/common/update';

import type { ListCommon } from '#list/immutable/utils';
import type { BlockBuilder, InnerBuilder } from '#list/mutable/builder-base';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';

import { BuilderBase } from '#list/mutable/builder-base';

export abstract class TreeBuilder<T, C> extends BuilderBase {
	abstract length: number;
	abstract source?: ListCommon<T> | undefined;
	abstract left: BlockBuilder<T, C>;
	abstract right: BlockBuilder<T, C>;
	abstract middle: InnerBuilder<T, BlockBuilder<T, C>> | undefined;
	abstract getChildLength(child: C): number;
	abstract prependBlockChild(block: BlockBuilder<T, C>, child: C): void;
	abstract appendBlockChild(block: BlockBuilder<T, C>, child: C): void;
	abstract dropBlockFirstChild(block: BlockBuilder<T, C>): C;
	abstract dropBlockLastChild(block: BlockBuilder<T, C>): C;
	abstract get level(): number;
	abstract prepareMutate(): void;

	get(index: number): T {
		const middleIndex = index - this.left.length;

		if (middleIndex < 0) {
			// index is in left part
			return this.left.get(index);
		}

		const rightIndex = middleIndex - (this.middle?.length ?? 0);

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

	updateAt(index: number, update: Update<T>): T {
		this.prepareMutate();
		const middleIndex = index - this.left.length;

		if (middleIndex < 0) {
			// index is in left part
			return this.left.updateAt(index, update);
		}

		const rightIndex = middleIndex - (this.middle?.length ?? 0);

		if (rightIndex >= 0) {
			// index is in right part
			return this.right.updateAt(rightIndex, update);
		}

		if (undefined === this.middle) {
			throwInvalidStateError();
		}

		// index is in middle part
		return this.middle.updateAt(middleIndex, update);
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

		if (!reversed) {
			this.left.forEach(f, options);

			if (state.halted) return;

			if (undefined !== this.middle) {
				this.middle.forEach(f, options);
				if (state.halted) return;
			}

			this.right.forEach(f, options);
		} else {
			this.right.forEach(f, options);

			if (state.halted) return;

			if (undefined !== this.middle) {
				this.middle.forEach(f, options);
				if (state.halted) return;
			}

			this.left.forEach(f, options);
		}
	}

	prepend(child: C): void {
		this.prepareMutate();

		// add child length to this length
		this.length += this.getChildLength(child);

		if (this.left.canAddChild) {
			// can prepend to left
			this.prependBlockChild(this.left, child);
			return;
		}

		// left is already at maximum amount children
		if (undefined === this.middle) {
			if (this.right.canAddChild) {
				// right not full, shift first right child to left and prepend new child to right
				const shiftChild = this.dropBlockLastChild(this.left);
				this.prependBlockChild(this.right, shiftChild);
				this.prependBlockChild(this.left, child);
				return;
			}

			this.prependMiddle(this.left);
			this.left = this.context.outerBlockBuilder(this.ops.of([child]));
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
					return this.getChildLength(shiftChild);
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
		this.left = this.context.outerBlockBuilder(this.ops.of([child]));
	}

	append(child: C): void {
		this.prepareMutate();

		// add child length to this length
		this.length += this.getChildLength(child);

		if (this.right.canAddChild) {
			// can append to right
			this.appendBlockChild(this.right, child);
			return;
		}

		// right is already at maimum amount children
		if (undefined === this.middle) {
			if (this.left.canAddChild) {
				const shiftChild = this.dropBlockFirstChild(this.right);
				this.appendBlockChild(this.left, shiftChild);
				this.appendBlockChild(this.right, child);
				return;
			}

			this.appendMiddle(this.right);
			this.right = this.context.outerBlockBuilder(this.ops.of([child]));
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
					return this.getChildLength(shiftChild);
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
		this.right = this.context.outerBlockBuilder(this.ops.of([child]));
	}

	insert(index: number, value: T): void {
		this.prepareMutate();
		this.length++;

		const middleIndex = index - this.left.length;

		if (middleIndex <= 0) {
			// insert left
			this.left.insert(index, value);

			if (this.left.childrenInMax) {
				// no need to rebalance
				return;
			}

			if (undefined !== this.middle) {
				// try shift child from left to middle
				const delta = this.middle.modifyFirstChild(
					(firstChild): number | undefined => {
						if (firstChild.canAddChild) {
							const shiftChild = this.left.dropLastChild();
							firstChild.prependChild(shiftChild);
							return this.getChildLength(shiftChild);
						}
						return;
					},
				);

				if (undefined !== delta) {
					// shift succeeded
					return;
				}
			} else if (this.right.canAddChild) {
				// try to shift child from left to right
				const shiftChild = this.left.dropLastChild();
				this.right.prependChild(shiftChild);
				return;
			}

			// split left and prepend block to middle
			const toMiddle = this.left.splitRight();
			this.prependMiddle(toMiddle);
			return;
		}

		const rightIndex = middleIndex - (this.middle?.length ?? 0);

		if (undefined === this.middle || rightIndex >= 0) {
			// insert in right block
			this.right.insert(rightIndex, value);

			if (this.right.childrenInMax) {
				// no need to rebalance
				return;
			}

			if (undefined !== this.middle) {
				// try to shift child from right to middle last
				const delta = this.middle.modifyLastChild(
					(lastChild): number | undefined => {
						if (!lastChild.canAddChild) return;

						const shiftChild = this.right.dropFirstChild();
						lastChild.appendChild(shiftChild);
						return this.getChildLength(shiftChild);
					},
				);

				if (undefined !== delta) {
					// shift succeeded
					return;
				}
			} else if (this.left.canAddChild) {
				// shift child from right to left
				const shiftChild = this.right.dropFirstChild();
				this.left.appendChild(shiftChild);
				return;
			}

			// split right and append block to middle
			const newRight = this.right.splitRight();
			this.appendMiddle(this.right);
			this.right = newRight;
			return;
		}

		// insert into middle
		this.middle.insert(middleIndex, value);
		this.middle = this.middle.normalized();
	}

	prependMiddle(child: BlockBuilder<T, C>): void {
		this.prepareMutate();

		if (undefined === this.middle) {
			this.middle = this.context.innerBlockBuilder(
				this.level + 1,
				[child],
				child.length,
			);
		} else {
			this.middle.prependChild(child);
			this.middle = this.middle.normalized();
		}
	}

	appendMiddle(child: BlockBuilder<T, C>): void {
		this.prepareMutate();

		if (undefined === this.middle) {
			this.middle = this.context.innerBlockBuilder(
				this.level + 1,
				[child],
				child.length,
			);
		} else {
			this.middle.appendChild(child);
			this.middle = this.middle.normalized();
		}
	}

	_verifyStructure(messages: string[] = []): string[] {
		if (undefined !== this.source) {
			return this.source._verifyStructure(messages);
		}

		const length =
			this.left.length + (this.middle?.length ?? 0) + this.right.length;

		if (this.length !== length) {
			messages.push(
				`TreeBuilder length ${this.length} does not match sum of left (${this.left.length}), middle (${this.middle?.length ?? 0}), and right (${this.right.length}) lengths.`,
			);
		}

		if (undefined === this.middle) {
			if (
				this.left.nrChildren + this.right.nrChildren <=
				this.context.maxBlockSize
			) {
				messages.push(
					`TreeBuilder has no middle but left and right children count ${this.left.nrChildren} + ${this.right.nrChildren} is less than or equal to maxBlockSize ${this.context.maxBlockSize}, should be an InnerBlock`,
				);
			}
		}

		this.left._verifyStructure(messages);

		this.middle?._verifyStructure(messages, false);

		this.right._verifyStructure(messages);

		return messages;
	}
}
