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

		if (this.left.nrChildren < this.context.maxBlockSize) {
			// can prepend to left
			this.prependBlockChild(this.left, child);
			return;
		}

		// left is already at maximum amount children

		if (undefined !== this.middle) {
			// try to shift child to first middle
			const delta = this.middle.modifyFirstChild(
				(firstChild): number | undefined => {
					if (firstChild.nrChildren < this.context.maxBlockSize) {
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
		} else if (this.right.nrChildren < this.context.maxBlockSize) {
			// no middle
			// right not full, shift last left child to right
			const shiftChild = this.dropBlockLastChild(this.left);
			this.prependBlockChild(this.left, child);
			this.prependBlockChild(this.right, shiftChild);
			return;
		}

		// prepend and split full block to middle
		this.prependBlockChild(this.left, child);
		const toMiddle = this.left.splitRight(1);

		this.prependMiddle(toMiddle);
	}

	append(child: C): void {
		this.prepareMutate();

		// add child length to this length
		this.length += this.getChildLength(child);

		if (this.right.nrChildren < this.context.maxBlockSize) {
			// caon append to right
			this.appendBlockChild(this.right, child);
			return;
		}

		// right is already at maimum amount children

		if (undefined !== this.middle) {
			// try to shift child to last middle
			const delta = this.middle.modifyLastChild(
				(lastChild): number | undefined => {
					if (lastChild.nrChildren < this.context.maxBlockSize) {
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
		} else if (this.left.nrChildren < this.context.maxBlockSize) {
			// no middle
			// left not full, shift first right to left
			const shiftChild = this.dropBlockFirstChild(this.right);
			this.appendBlockChild(this.right, child);
			this.appendBlockChild(this.left, shiftChild);
			return;
		}

		// append and split full block to middle
		this.appendBlockChild(this.right, child);
		const newRight = this.right.splitRight(this.context.maxBlockSize);

		this.appendMiddle(this.right);
		this.right = newRight;
	}

	insert(index: number, value: T): void {
		this.length++;

		const middleIndex = index - this.left.length;

		if (middleIndex <= 0) {
			// insert left
			this.left.insert(index, value);

			if (this.left.nrChildren <= this.context.maxBlockSize) {
				// no need to rebalance
				return;
			}

			if (undefined !== this.middle) {
				// try shift child from left to middle
				const delta = this.middle.modifyFirstChild(
					(firstChild): number | undefined => {
						if (firstChild.nrChildren < this.context.maxBlockSize) {
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
			} else if (this.right.nrChildren < this.context.maxBlockSize) {
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

			if (this.right.nrChildren <= this.context.maxBlockSize) {
				// no need to rebalance
				return;
			}

			if (undefined !== this.middle) {
				// try to shift child from right to middle last
				const delta = this.middle.modifyLastChild(
					(lastChild): number | undefined => {
						if (lastChild.nrChildren < this.context.maxBlockSize) {
							const shiftChild = this.right.dropLastChild();
							lastChild.appendChild(shiftChild);
							return this.getChildLength(shiftChild);
						}
						return;
					},
				);

				if (undefined !== delta) {
					// shift succeeded
					return;
				}
			} else if (this.left.nrChildren < this.context.maxBlockSize) {
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
			// no middle, create it with child
			this.middle = this.context.innerBlockBuilder(
				this.level + 1,
				[child],
				child.length,
			);

			return;
		}

		if (child.nrChildren >= this.context.minBlockSize) {
			// child size enough for its own middle block
			this.middle.prependChild(child);
			this.middle = this.middle.normalized();

			return;
		}

		// child size too small for own block, need to combine with first middle block

		const delta = this.middle.modifyFirstChild((firstMiddleChild) => {
			if (
				child.nrChildren + firstMiddleChild.nrChildren <=
				this.context.maxBlockSize
			) {
				// can merge child into firstMiddleChild
				firstMiddleChild.prependItems(child);
				return child.length;
			}

			return;
		});

		if (undefined !== delta) {
			return;
		}

		// need to replace firstMiddleChild with two split blocks
		const firstMiddleChild = this.middle.dropFirstChild();
		child.appendItems(firstMiddleChild);
		const newSecondChild = child.splitRight();
		this.middle.prependChild(newSecondChild);
		this.middle.prependChild(child);
		this.middle = this.middle.normalized();
	}

	appendMiddle(child: BlockBuilder<T, C>): void {
		this.prepareMutate();

		if (undefined === this.middle) {
			// no middle, create it with child
			this.middle = this.context.innerBlockBuilder(
				this.level + 1,
				[child],
				child.length,
			);

			return;
		}

		if (child.nrChildren >= this.context.minBlockSize) {
			// child size enough for its own middle block
			this.middle.appendChild(child);
			this.middle = this.middle.normalized();

			return;
		}

		// child size too small for own block, need to combine with last middle block

		const delta = this.middle.modifyLastChild((lastMiddleChild) => {
			if (
				child.nrChildren + lastMiddleChild.nrChildren <=
				this.context.maxBlockSize
			) {
				// can merge child into lastMiddleChild
				lastMiddleChild.appendItems(child);
				return child.length;
			}

			return;
		});

		if (undefined !== delta) {
			return;
		}

		// need to split lastMiddleChild and append new right
		const lastMiddleChild = this.middle.lastChild();
		lastMiddleChild.appendItems(child);
		const newLastChild = lastMiddleChild.splitRight();
		this.middle.appendChild(newLastChild);
		this.middle = this.middle.normalized();
	}
}
