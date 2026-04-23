import type { ListContext } from '#list/context-module';
import type { InnerTree } from '#list/immutable/inner-tree';
import type {
	BlockBuilder,
	InnerBuilder,
	ToImmutable,
} from '#list/mutable/builder-base';
import type { InnerBlockBuilder } from '#list/mutable/inner-block-builder';

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

		if (!this.left.childrenInMin) {
			// need to rebalance left

			if (undefined === this.middle) {
				if (this.right.canRemoveChild) {
					// shift one child from right to left
					const shiftToLeft = this.right.dropFirstChild();
					this.left.appendChild(shiftToLeft);
				}
			} else {
				const firstMiddleBlock = this.middle.firstChild();

				if (
					this.left.nrChildren + firstMiddleBlock.nrChildren <=
					this.context.maxBlockSize
				) {
					// combine left and first middle block into one block
					this.left.appendItems(firstMiddleBlock);
					this.middle.dropFirstChild();
					this.middle = this.middle.normalized();
				} else {
					// shift one child from middle to left
					this.middle.modifyFirstChild((firstMiddleChild) => {
						const shiftLeft = firstMiddleChild.dropFirstChild();
						this.left.appendChild(shiftLeft);
						return -shiftLeft.length;
					});
				}
			}
		}

		return firstChild;
	}

	dropLastChild(): C {
		this.prepareMutate();
		const lastChild = this.right.dropLastChild();
		this.length -= lastChild.length;

		if (!this.right.childrenInMin) {
			// need to rebalance right
			if (undefined === this.middle) {
				if (this.left.canRemoveChild) {
					// shift one child from left to right
					const shiftToRight = this.left.dropLastChild();
					this.right.prependChild(shiftToRight);
				}
			} else {
				const lastMiddleBlock = this.middle.lastChild();

				if (
					this.right.nrChildren + lastMiddleBlock.nrChildren <=
					this.context.maxBlockSize
				) {
					// combine right and last middle block into one block
					this.right.prependItems(lastMiddleBlock);
					this.middle.dropLastChild();
					this.middle = this.middle.normalized();
				} else {
					// shift one child from middle to right
					this.middle.modifyLastChild((lastMiddleChild) => {
						const shiftRight = lastMiddleChild.dropLastChild();
						this.right.prependChild(shiftRight);
						return -shiftRight.length;
					});
				}
			}
		}

		return lastChild;
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
				// combine left and right
				this.left.appendItems(this.right);

				return this.left;
			}
		} else {
			if (
				this.context.isInnerBlockBuilder<T, InnerBlockBuilder<T, C>>(
					this.middle,
				) &&
				this.middle.nrChildren <= 2
			) {
				const firstMiddleBlock = this.middle.firstChild();
				const secondMiddleBlock =
					this.middle.nrChildren === 2 ? this.middle.lastChild() : null;
				const totalNrChildren =
					this.left.nrChildren +
					firstMiddleBlock.nrChildren +
					(secondMiddleBlock?.nrChildren ?? 0) +
					this.right.nrChildren;

				if (totalNrChildren <= this.context.maxBlockSize * 2) {
					this.left.appendItems(firstMiddleBlock);
					if (null !== secondMiddleBlock) {
						this.left.appendItems(secondMiddleBlock);
					}
					this.left.appendItems(this.right);
					this.middle = undefined;

					if (totalNrChildren <= this.context.maxBlockSize) {
						// combine into one block
						return this.left;
					}

					this.right = this.left.splitRight();

					return this;
				}
			}
		}

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
		} else {
			// if (
			// 	this.context.isInnerBlockBuilder(this.middle) &&
			// 	this.middle.nrChildren <= 2
			// ) {
			// 	let nrChildren = this.middle.firstChild().nrChildren;
			// 	if (this.middle.nrChildren === 2) {
			// 		nrChildren += this.middle.lastChild().nrChildren;
			// 	}
			// 	if (nrChildren <= this.context.maxBlockSize) {
			// 		messages.push(
			// 			`InnerTreeBuilder has a middle with ${this.middle.nrChildren} children but total middle children count ${nrChildren} is less than or equal to maxBlockSize ${this.context.maxBlockSize}, should be an InnerBlock`,
			// 		);
			// 	}
			// }
		}

		if (
			this.length <= this.context.maxBlockSize * 2 &&
			undefined !== this.middle
		) {
			messages.push(
				`TreeBuilder length ${this.length} is less than or equal to 2 * maxBlockSize ${this.context.maxBlockSize * 2} but has a middle.`,
			);
		}

		return super._verifyStructure(messages);
	}
}
