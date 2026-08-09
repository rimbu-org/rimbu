import type { ListContext } from '#list/context';
import type { BlockBuilder, InnerBuilder } from '#list/mutable/common';

import { Int, throwInvalidStateError } from '@rimbu/base';

export abstract class TreeBuilderBase<T, C> {
	abstract readonly context: ListContext<T>;
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
	abstract createBlockBuilder(child: C): BlockBuilder<T, C>;

	get(index: Int.AtLeastZero): T {
		const middleIndex = index - this.left.size;

		if (!Int.isAtLeastZero(middleIndex)) {
			// index is in left part
			return this.left.get(index);
		}

		const rightIndex = middleIndex - (this.middle?.size ?? 0);

		if (Int.isAtLeastZero(rightIndex)) {
			// index is in right part
			return this.right.get(rightIndex);
		}

		if (undefined === this.middle) {
			throwInvalidStateError();
		}

		// index is in middle part
		return this.middle.get(middleIndex);
	}

	update(
		index: Int.AtLeastZero,
		f: (element: T) => T,
	): [previous: T, current: T] {
		this.prepareMutate();

		const middleIndex = index - this.left.size;

		if (!Int.isAtLeastZero(middleIndex)) {
			// index is in left part
			return this.left.update(index, f);
		}

		const rightIndex = middleIndex - (this.middle?.size ?? 0);

		if (Int.isAtLeastZero(rightIndex)) {
			// index is in right part
			return this.right.update(rightIndex, f);
		}

		if (undefined === this.middle) {
			throwInvalidStateError();
		}

		// index is in middle part
		return this.middle.update(middleIndex, f);
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

	insert(index: Int.AtLeastZero, element: T): void {
		this.prepareMutate();
		this.size++;

		const middleIndex = index - this.left.size;

		if (middleIndex <= 0) {
			// insert left
			this.left.insert(index, element);

			if (this.left.notTooManyChildren) {
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
							return this.getChildSize(shiftChild);
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

		const rightIndex = middleIndex - (this.middle?.size ?? 0);

		if (Int.isAtLeastZero(rightIndex)) {
			// insert in right block
			this.right.insert(rightIndex, element);

			if (this.right.notTooManyChildren) {
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
						return this.getChildSize(shiftChild);
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

		if (undefined === this.middle) {
			throwInvalidStateError();
		}

		Int.checkAtLeastOne(middleIndex);
		// insert into middle
		this.middle.insert(middleIndex, element);
		this.middle = this.middle.normalized();
	}

	remove(index: Int.AtLeastZero): T {
		this.prepareMutate();

		this.size--;

		const middleIndex = index - this.left.size;

		if (!Int.isAtLeastZero(middleIndex)) {
			// index is in left
			const previous = this.left.remove(index);
			if (!this.left.hasEnoughChildren) {
				if (undefined !== this.middle) {
					const firstBlock = this.middle.firstChild();

					if (
						this.left.nrChildren + firstBlock.nrChildren <=
						this.context.maxBlockSize
					) {
						this.middle.dropFirstChild();
						this.left.appendFrom(firstBlock);
						this.middle = this.middle.normalized();
						return previous;
					}

					this.middle.modifyFirstChild((firstChild) => {
						const firstGrandChild = firstChild.dropFirstChild();
						this.left.appendChild(firstGrandChild);
						return -this.getChildSize(firstGrandChild);
					});
				} else {
					const totalNrChildren = this.left.nrChildren + this.right.nrChildren;

					if (totalNrChildren > this.context.maxBlockSize) {
						// no middle — balance left and right
						const toMove = (totalNrChildren >>> 1) - this.left.nrChildren;
						const newRight = this.right.splitRight(toMove);
						this.left.appendFrom(this.right);
						this.right = newRight;
					}
				}
			}

			// this._normalizeMiddle();
			return previous;
		}

		const rightIndex = middleIndex - (this.middle?.size ?? 0);

		if (Int.isAtLeastZero(rightIndex)) {
			// index is in right
			const previous = this.right.remove(rightIndex);
			if (!this.right.hasEnoughChildren) {
				if (undefined !== this.middle) {
					const lastBlock = this.middle.lastChild();
					if (lastBlock.canRemoveChild) {
						// balance: move enough elements to equalize right and donor
						const total = this.right.nrChildren + lastBlock.nrChildren;
						const toMove = (total >>> 1) - this.right.nrChildren;
						this.middle.modifyLastChild((lastBlock) => {
							const preMoveSize = lastBlock.size;
							const moved = lastBlock.splitRight(-toMove);
							this.right.prependFrom(moved);
							const lbSizeDelta = preMoveSize - lastBlock.size;
							return -lbSizeDelta;
						});
					} else {
						// merge entire last block into right
						const dropped = this.middle.dropLastChild();
						this.right.prependFrom(dropped);
					}
					this.middle = this.middle.normalized();
				} else if (this.left.canRemoveChild) {
					// no middle — balance left and right
					const total = this.left.nrChildren + this.right.nrChildren;
					const toMove = (total >>> 1) - this.right.nrChildren;
					const moved = this.left.splitRight(-toMove);
					this.right.prependFrom(moved);
				}
			}

			// this._normalizeMiddle();
			return previous;
		}

		if (undefined === this.middle) {
			throwInvalidStateError();
		}

		// index is in middle
		const oldValue = this.middle.remove(middleIndex);
		this.middle = this.middle.normalized();

		this.#repairSingleChildMiddle();

		// this._normalizeMiddle();
		return oldValue;
	}

	/**
	 * A middle with a single child cannot repair an underflow internally:
	 * `InnerBlockBuilder.remove` early-exits when `nrChildren <= 1`, and with
	 * only one child there is no sibling to rebalance against. Repair the
	 * underflow here at the tree level, using the spine blocks:
	 *
	 * - merge the child into a spine block when it fits, or
	 * - move elements from the left spine block into the child to bring it
	 *   back up to `minBlockSize`.
	 */
	#repairSingleChildMiddle(): void {
		if (
			undefined === this.middle ||
			!this.context.isBlockBuilder<T>(this.middle) ||
			1 !== this.middle.nrChildren
		)
			return;

		const singleChild = this.middle.firstChild();
		const childNrChildren = singleChild.nrChildren;

		if (childNrChildren >= this.context.minBlockSize) return;

		if (this.left.nrChildren + childNrChildren <= this.context.maxBlockSize) {
			// merge the middle child into the left spine block
			this.left.appendFrom(this.middle.dropFirstChild());
			this.middle = this.middle.normalized();
			return;
		}

		if (this.right.nrChildren + childNrChildren <= this.context.maxBlockSize) {
			// merge the middle child into the right spine block
			this.right.prependFrom(this.middle.dropFirstChild());
			this.middle = this.middle.normalized();
			return;
		}

		// the child does not fit into either spine block: top it up from the
		// left spine block. This is always possible: since neither merge fits,
		// left has more than maxBlockSize - childNrChildren >= minBlockSize
		// children, which is more than the shortage below minBlockSize.
		this.middle.modifyFirstChild((child) => {
			const moved = this.left.dropLastChild();
			child.prependChild(moved);
			return this.getChildSize(moved);
		});
	}

	appendMiddle(child: BlockBuilder<T, C>): void {
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

	prependMiddle(child: BlockBuilder<T, C>): void {
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

	_verifyStructure(errors: string[] = []): string[] {
		const leftSize = this.left.size;
		const rightSize = this.right.size;
		const middleSize = this.middle?.size ?? 0;

		if (leftSize + middleSize + rightSize !== this.size) {
			errors.push(
				`Tree of level ${this.level} has size ${this.size} but left + middle + right = ${
					leftSize + middleSize + rightSize
				}.`,
			);
		}

		if (this.left.nrChildren < 1) {
			errors.push(
				`Tree of level ${this.level} has left block with too few children: ${this.left.nrChildren} < 1`,
			);
		}
		if (this.right.nrChildren < 1) {
			errors.push(
				`Tree of level ${this.level} has right block with too few children: ${this.right.nrChildren} < 1`,
			);
		}
		if (undefined === this.middle) {
			const totalChildren = this.left.nrChildren + this.right.nrChildren;

			if (totalChildren <= this.context.maxBlockSize) {
				errors.push(
					`Tree of level ${this.level} can merge left and right, they have too few children: ${totalChildren} <= ${this.context.maxBlockSize}`,
				);
			} else if (totalChildren > this.context.maxBlockSize * 2) {
				errors.push(
					`Tree of level ${this.level} without middle has too many children for left+right: ${totalChildren} > ${this.context.maxBlockSize * 2}`,
				);
			}
		}

		this.left._verifyStructure(errors, false);
		this.middle?._verifyStructure(errors, false);
		this.right._verifyStructure(errors, false);

		return errors;
	}
}
