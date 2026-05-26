import type { ListContext } from '#list/context-module';
import type { InnerTree } from '#list/immutable/inner-tree';
import type {
	BlockBuilder,
	InnerBuilder,
	ToImmutable,
} from '#list/mutable/builder-base';
import type { InnerBlockBuilder } from '#list/mutable/inner-block-builder';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';

import { TreeBuilder } from '#list/mutable/tree-builder';

export class InnerTreeBuilder<T, C extends BlockBuilder<T>>
	extends TreeBuilder<T, C>
	implements InnerBuilder<T, C>
{
	constructor(
		context: ListContext,
		readonly level: number,
		public source?: InnerTree<T, ToImmutable<C>>,
		public _left?: InnerBlockBuilder<T, C>,
		public _right?: InnerBlockBuilder<T, C>,
		public _middle?: InnerBuilder<T, InnerBlockBuilder<T, C>>,
		public length: number = source?.length ?? 0,
	) {
		super(context);
	}

	get left(): InnerBlockBuilder<T, C> {
		return this._left!;
	}

	set left(value: InnerBlockBuilder<T, C>) {
		this._left = value;
	}

	get right(): InnerBlockBuilder<T, C> {
		return this._right!;
	}

	set right(value: InnerBlockBuilder<T, C>) {
		this._right = value;
	}

	get middle(): InnerBuilder<T, InnerBlockBuilder<T, C>> | undefined {
		return this._middle;
	}

	set middle(value: InnerBuilder<T, InnerBlockBuilder<T, C>> | undefined) {
		this._middle = value;
	}

	prepareMutate(): void {
		if (undefined === this.source) return;

		this._left = this.context.innerBlockBuilderSource(this.source.left);
		this._right = this.context.innerBlockBuilderSource(this.source.right);
		this._middle =
			null === this.source.middle
				? undefined
				: this.context.createInnerBuilder(this.source.middle);
		this.length = this.source.length;
		this.source = undefined;
	}

	get(index: number): T {
		if (undefined !== this.source) {
			return this.source.get(index);
		}

		return super.get(index);
	}

	prependChild(child: C): void {
		this.prepareMutate();
		this.length += child.length;

		if (this.left.canAddChild) {
			this.left.prependChild(child);
			return;
		}

		if (undefined === this.middle) {
			if (this.right.canAddChild) {
				const shiftToRight = this.left.dropLastChild();
				this.right.prependChild(shiftToRight);
				this.left.prependChild(child);
				return;
			}
		}

		this.prependMiddle(this.left);
		this.left = this.context.innerBlockBuilder(
			this.level,
			[child],
			child.length,
		);
	}

	appendChild(child: C): void {
		this.prepareMutate();
		this.length += child.length;

		if (this.right.canAddChild) {
			this.right.appendChild(child);
			return;
		}

		if (undefined === this.middle) {
			if (this.left.canAddChild) {
				const shiftToLLeft = this.right.dropFirstChild();
				this.left.appendChild(shiftToLLeft);
				this.right.appendChild(child);
				return;
			}
		}

		this.appendMiddle(this.right);
		this.right = this.context.innerBlockBuilder(
			this.right.level,
			[child],
			child.length,
		);
	}

	firstChild(): C {
		this.prepareMutate();

		return this.left.firstChild();
	}

	lastChild(): C {
		this.prepareMutate();
		return this.right.lastChild();
	}

	dropFirstChild(): C {
		this.prepareMutate();
		const firstChild = this.left.dropFirstChild();
		this.length -= firstChild.length;

		if (this.left.nrChildren === 0) {
			if (undefined === this.middle) {
				if (this.right.canRemoveChild) {
					this.left.appendChild(this.right.dropFirstChild());
				}
			} else {
				const firstMiddleBlock = this.middle.dropFirstChild();
				this.middle = this.middle.normalized();
				this.left = firstMiddleBlock;
			}
		}

		return firstChild;
	}

	dropLastChild(): C {
		this.prepareMutate();
		const lastChild = this.right.dropLastChild();
		this.length -= lastChild.length;

		if (this.right.nrChildren === 0) {
			if (undefined === this.middle) {
				if (this.left.canRemoveChild) {
					this.right.prependChild(this.left.dropLastChild());
				}
			} else {
				// right is empty, need to shift from middle to right
				const lastMiddleBlock = this.middle.dropLastChild();
				this.middle = this.middle.normalized();
				this.right = lastMiddleBlock;
			}
		}

		return lastChild;
	}

	remove(index: number): T {
		this.prepareMutate();

		this.length--;

		const middleIndex = index - this.left.length;

		if (middleIndex < 0) {
			// index is in left
			const oldValue = this.left.remove(index);

			if (this.left.nrChildren === 0) {
				if (undefined !== this.middle) {
					this.left = this.middle.dropFirstChild();
					this.middle = this.middle.normalized();
				} else if (this.right.canRemoveChild) {
					// no middle — steal one child from right
					this.left.appendChild(this.right.dropFirstChild());
				}
			} else if (this.left.nrChildren === 1) {
				const leftChild = this.left.firstChild();
				if (!leftChild.childrenInMin) {
					if (undefined !== this.middle) {
						this.middle.modifyFirstChild((firstMiddleChild) => {
							const firstMiddleGrandChild = firstMiddleChild.dropFirstChild();
							leftChild.appendItems(firstMiddleGrandChild);
							return -firstMiddleGrandChild.length;
						});
					} else if (this.right.canRemoveChild) {
						// no middle — steal a grandchild from right's first child
						const rightFirstChild = this.right.firstChild() as BlockBuilder<T>;
						const grandChild = rightFirstChild.dropFirstChild() as BlockBuilder<T>;
						leftChild.appendItems(grandChild as BlockBuilder<T, unknown>);
						this.right.length -= grandChild.length;
					}
				}
			}

			return oldValue;
		}

		const rightIndex = middleIndex - (this.middle?.length ?? 0);

		if (rightIndex >= 0) {
			// index is in right
			const oldValue = this.right.remove(rightIndex);

			if (this.right.nrChildren === 0) {
				if (undefined !== this.middle) {
					this.right = this.middle.dropLastChild();
					this.middle = this.middle.normalized();
				} else if (this.left.canRemoveChild) {
					// no middle — steal one child from left
					this.right.prependChild(this.left.dropLastChild());
				}
			}

			return oldValue;
		}

		if (undefined === this.middle) {
			throwInvalidStateError();
		}

		// index is in middle
		const oldValue = this.middle.remove(middleIndex);
		this.middle = this.middle.normalized();

		return oldValue;
	}

	modifyFirstChild(f: (child: C) => number | undefined): number | undefined {
		const delta = this.left.modifyFirstChild(f);
		if (undefined !== delta) {
			this.prepareMutate();
			this.length += delta;
		}

		return delta;
	}

	modifyLastChild(f: (child: C) => number | undefined): number | undefined {
		const delta = this.right.modifyLastChild(f);
		if (undefined !== delta) {
			this.prepareMutate();
			this.length += delta;
		}

		return delta;
	}

	build(): InnerTree<T, ToImmutable<C>> {
		return (
			this.source ??
			this.context.innerTree(
				this.left.build(),
				this.right.build(),
				this.middle?.build() ?? null,
				this.length,
				this.level,
			)
		);
	}

	buildMap<T2>(f: (value: T) => T2): InnerTree<T2, any> {
		return (
			this.source?.map?.(f) ??
			this.context.innerTree(
				this.left.buildMap(f),
				this.right.buildMap(f),
				this.middle?.buildMap?.(f) ?? null,
				this.length,
				this.level,
			)
		);
	}

	normalized(): InnerBuilder<T, C> {
		if (undefined === this.middle) {
			if (
				this.left.nrChildren + this.right.nrChildren <=
				this.context.maxBlockSize
			) {
				// fits in single block
				this.left.appendItems(this.right);

				return this.left;
			}

			return this;
		}

		if (
			this.context.isInnerBlockBuilder<T, InnerBlockBuilder<T, C>>(
				this.middle,
			) &&
			this.middle.nrChildren <= 2
		) {
			const firstMiddleChild = this.middle.firstChild();
			const lastMiddleChild = this.middle.lastChild();

			const totalNrChildren =
				this.left.nrChildren +
				firstMiddleChild.nrChildren +
				(this.middle.nrChildren === 2 ? lastMiddleChild.nrChildren : 0) +
				this.right.nrChildren;

			if (totalNrChildren <= this.context.maxBlockSize * 2) {
				this.left.appendItems(firstMiddleChild);
				if (this.middle.nrChildren === 2) {
					this.left.appendItems(lastMiddleChild);
				}
				this.left.appendItems(this.right);
				this.middle = undefined;
				this.right = this.left.splitRight();
			}

			// if (this.middle.nrChildren === 1) {
			// 	if (
			// 		this.left.nrChildren +
			// 			firstMiddleChild.nrChildren +
			// 			this.right.nrChildren <=
			// 		this.context.maxBlockSize * 2
			// 	) {
			// 		this.left.appendItems(firstMiddleChild);
			// 		this.left.appendItems(this.right);
			// 		this.middle = undefined;
			// 		this.right = this.left.splitRight();
			// 		return this;
			// 	}
			// }
			// const lastMiddleChild = this.middle.lastChild();
			// // if (
			// // 	this.left.nrChildren + firstMiddleChild.nrChildren <=
			// // 	this.context.maxBlockSize
			// // ) {
			// // 	this.middle.dropFirstChild();
			// // 	this.middle = this.middle.normalized();
			// // 	this.left.appendItems(firstMiddleChild);
			// // 	return this.normalized();
			// // }
			// // if (
			// // 	lastMiddleChild.nrChildren + this.right.nrChildren <=
			// // 	this.context.maxBlockSize
			// // ) {
			// // 	this.middle.dropLastChild();
			// // 	this.middle = this.middle.normalized();
			// // 	this.right.prependItems(lastMiddleChild);
			// // 	return this.normalized();
			// // }
			// if (this.middle.nrChildren <= 2) {
			// 	this.middle.prepareMutate();
			// 	const secondChild =
			// 		this.middle.nrChildren === 2 ? lastMiddleChild : undefined;
			// 	const totalNrChildren =
			// 		this.left.nrChildren +
			// 		firstMiddleChild.nrChildren +
			// 		(secondChild?.nrChildren ?? 0) +
			// 		this.right.nrChildren;
			// 	if (totalNrChildren <= this.context.maxBlockSize * 2) {
			// 		this.left.appendItems(firstMiddleChild);
			// 		if (undefined !== secondChild) {
			// 			this.left.appendItems(secondChild);
			// 		}
			// 		this.left.appendItems(this.right);
			// 		this.middle = undefined;
			// 		this.right = this.left.splitRight();
			// 	} else if (!this.middle.childrenInMin) {
			// 		// while (!this.middle.childrenInMin) {
			// 		// 	if (this.left.nrChildren > 1) {
			// 		// 		const toMiddle = this.left.splitRight(1);
			// 		// 		this.middle.prependChild(toMiddle);
			// 		// 	} else if (this.right.nrChildren > 1) {
			// 		// 		const newRight = this.right.splitRight(this.right.nrChildren - 1);
			// 		// 		this.middle.appendChild(this.right);
			// 		// 		this.right = newRight;
			// 		// 	}
			// 		// }
			// 	}
			// }
		}

		// else if (
		// 	this.context.isInnerBlockBuilder<T, C>(this.middle) &&
		// 	!this.middle.childrenInMin
		// ) {
		// 	this.middle.prepareMutate();

		// 	while (
		// 		this.left.nrChildren < this.context.maxBlockSize &&
		// 		(this.left.nrChildren > 1 || this.right.nrChildren > 1)
		// 	) {
		// 		this.middle.modifyFirstChild((child) => {
		// 			child.prepareMutate();
		// 			child.
		// 		});
		// 	}
		// }
		// } else if (
		// 	this.context.isInnerBlockBuilder<T, InnerBlockBuilder<T, C>>(
		// 		this.middle,
		// 	) &&
		// 	this.middle.nrChildren <= 2
		// ) {
		// 	this.middle.prepareMutate();
		// 	const [firstMiddleBlock, secondMiddleBlock] = this.middle.children;
		// 	const totalNrChildren =
		// 		this.left.nrChildren +
		// 		firstMiddleBlock.nrChildren +
		// 		(secondMiddleBlock?.nrChildren ?? 0) +
		// 		this.right.nrChildren;

		// 	if (totalNrChildren <= this.context.maxBlockSize) {
		// 		throw Error('Should have been normalized to InnerBlock');
		// 	}

		// 	if (totalNrChildren <= this.context.maxBlockSize * 2) {
		// 		this.left.appendItems(firstMiddleBlock);
		// 		if (undefined !== secondMiddleBlock) {
		// 			this.left.appendItems(secondMiddleBlock);
		// 		}
		// 		this.left.appendItems(this.right);
		// 		this.middle = undefined;
		// 		if (this.left.nrChildren <= this.context.maxBlockSize) {
		// 			// combine into one block
		// 			return this.left;
		// 		}
		// 		this.right = this.left.splitRight();
		// 		return this;
		// 	}
		// }

		return this;
	}

	getChildLength(child: C): number {
		return child.length;
	}

	prependBlockChild(block: InnerBlockBuilder<T, C>, child: C): void {
		block.prependChild(child);
	}

	appendBlockChild(block: InnerBlockBuilder<T, C>, child: C): void {
		block.appendChild(child);
	}

	dropBlockFirstChild(block: InnerBlockBuilder<T, C>): C {
		return block.dropFirstChild();
	}

	dropBlockLastChild(block: InnerBlockBuilder<T, C>): C {
		return block.dropLastChild();
	}

	_verifyStructure(messages: string[] = []): string[] {
		if (undefined !== this.source) {
			return this.source._verifyStructure(messages);
		}

		if (undefined === this.middle) {
			if (
				this.left.nrChildren + this.right.nrChildren <=
				this.context.maxBlockSize
			) {
				messages.push(
					`InnerTreeBuilder has no middle but left and right children count ${this.left.nrChildren} + ${this.right.nrChildren} is less than or equal to maxBlockSize ${this.context.maxBlockSize}, should be an InnerBlock`,
				);
			}
		} else if (
			this.context.isInnerBlockBuilder<T, InnerBlockBuilder<T, C>>(
				this.middle,
			) &&
			this.middle.nrChildren <= 2
		) {
			const [firstMiddleBlock, secondMiddleBlock] = this.middle.readChildren;
			const totalNrChildren =
				this.left.nrChildren +
				firstMiddleBlock.nrChildren +
				(secondMiddleBlock?.nrChildren ?? 0) +
				this.right.nrChildren;

			if (totalNrChildren <= this.context.maxBlockSize) {
				messages.push(
					`InnerTreeBuilder has middle but total children count ${totalNrChildren} is less than or equal to maxBlockSize ${this.context.maxBlockSize}, should be an InnerBlock`,
				);
			} else if (totalNrChildren <= this.context.maxBlockSize * 2) {
				messages.push(
					`InnerTreeBuilder has middle but total children count ${totalNrChildren} is less than or equal to 2 * maxBlockSize ${this.context.maxBlockSize * 2}, should not have middle`,
				);
			}
		}

		return super._verifyStructure(messages);
	}
}
