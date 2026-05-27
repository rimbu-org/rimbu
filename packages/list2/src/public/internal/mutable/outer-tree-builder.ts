import type { ListContext } from '#list/context-module';
import type { OuterTree } from '#list/immutable/outer-tree';
import type { ListImpl } from '#list/list-impl';
import type { InnerBuilder, OuterBuilder } from '#list/mutable/builder-base';
import type { OuterBlockBuilder } from '#list/mutable/outer-block-builder';

import { throwInvalidStateError } from '@rimbu/base/rimbu-error';

import { TreeBuilder } from '#list/mutable/tree-builder';

export class OuterTreeBuilder<T>
	extends TreeBuilder<T, T>
	implements OuterBuilder<T>
{
	constructor(
		context: ListContext,
		public source?: OuterTree<T>,
		public _left?: OuterBlockBuilder<T>,
		public _right?: OuterBlockBuilder<T>,
		public _middle?: InnerBuilder<T, OuterBlockBuilder<T>>,
		public length: number = source?.length ?? 0,
	) {
		super(context);
	}

	get level(): number {
		return 0;
	}

	prepareMutate(): void {
		if (undefined === this.source) return;

		this._left = this.context.outerBlockBuilderSource(this.source.left);
		this._right = this.context.outerBlockBuilderSource(this.source.right);
		this._middle =
			null === this.source.middle
				? undefined
				: this.context.createInnerBuilder<T, OuterBlockBuilder<T>>(
						this.source.middle,
					);
		this.length = this.source.length;
		this.source = undefined;
	}

	get left(): OuterBlockBuilder<T> {
		return this._left!;
	}

	set left(value: OuterBlockBuilder<T>) {
		this._left = value;
	}

	get right(): OuterBlockBuilder<T> {
		return this._right!;
	}

	set right(value: OuterBlockBuilder<T>) {
		this._right = value;
	}

	get middle(): InnerBuilder<T, OuterBlockBuilder<T>> | undefined {
		return this._middle;
	}

	set middle(value: InnerBuilder<T, OuterBlockBuilder<T>> | undefined) {
		this._middle = value;
	}

	get(index: number): T {
		if (undefined !== this.source) {
			return this.source.get(index);
		}

		return super.get(index);
	}

	remove(index: number): T {
		this.prepareMutate();

		this.length--;

		const middleIndex = index - this.left.length;

		if (middleIndex < 0) {
			// index is in left
			const oldValue = this.left.remove(index);

			if (!this.left.childrenInMin) {
				if (undefined !== this.middle) {
					const firstBlock = (
						this.middle as any
					).firstChild() as OuterBlockBuilder<T>;
					if (firstBlock.canRemoveChild) {
						// steal one element from middle's first block
						this.middle.modifyFirstChild((fb: OuterBlockBuilder<T>) => {
							this.left.append(fb.dropFirstChild());
							return -1;
						});
					} else {
						// merge entire first block into left
						const dropped = this.middle.dropFirstChild();
						this.left.appendItems(dropped);
					}
					this.middle = this.middle.normalized();
				} else if (this.right.canRemoveChild) {
					// no middle — steal one element from right
					this.left.append(this.right.dropFirstChild());
				}
			}

			this._normalizeMiddle();
			return oldValue;
		}

		const rightIndex = middleIndex - (this.middle?.length ?? 0);

		if (rightIndex >= 0) {
			// index is in right
			const oldValue = this.right.remove(rightIndex);

			if (!this.right.childrenInMin) {
				if (undefined !== this.middle) {
					const lastBlock = (
						this.middle as any
					).lastChild() as OuterBlockBuilder<T>;
					if (lastBlock.canRemoveChild) {
						// steal one element from middle's last block
						this.middle.modifyLastChild((lb: OuterBlockBuilder<T>) => {
							this.right.prepend(lb.dropLastChild());
							return -1;
						});
					} else {
						// merge entire last block into right
						const dropped = this.middle.dropLastChild();
						this.right.prependItems(dropped);
					}
					this.middle = this.middle.normalized();
				} else if (this.left.canRemoveChild) {
					// no middle — steal one element from left
					this.right.prepend(this.left.dropLastChild());
				}
			}

			this._normalizeMiddle();
			return oldValue;
		}

		if (undefined === this.middle) {
			throwInvalidStateError();
		}

		// index is in middle
		const oldValue = this.middle.remove(middleIndex);
		this.middle = this.middle.normalized();

		this._normalizeMiddle();
		return oldValue;
	}

	private _normalizeMiddle(): void {
		if (
			undefined !== this.middle &&
			this.length <= this.context.maxBlockSize * 2
		) {
			this.normalized();
		}
	}

	normalized(): OuterBuilder<T> {
		if (undefined === this.middle) {
			if (this.length <= this.context.maxBlockSize) {
				// can collapse into block
				this.prepareMutate();
				this.left.appendItems(this.right);
				return this.left;
			}

			return this;
		}

		if (
			this.context.isInnerBlockBuilder<T, OuterBlockBuilder<T>>(this.middle)
		) {
			const middleLength = this.middle.length;
			if (this.length <= this.context.maxBlockSize * 2) {
				// no middle needed — redistribute into left and right
				this.prepareMutate();
				this.middle.prepareMutate();
				for (const child of this.middle.children) {
					this.left.appendItems(child);
				}
				this.left.appendItems(this.right);
				this.right = this.left.splitRight();
				this.middle = undefined;
			} else if (this.left.length + middleLength <= this.context.maxBlockSize) {
				// merge middle into left
				this.prepareMutate();
				this.middle.prepareMutate();
				for (const child of this.middle.children) {
					this.left.appendItems(child);
				}
				this.middle = undefined;
			} else if (
				middleLength + this.right.length <=
				this.context.maxBlockSize
			) {
				// merge middle into right (prepend)
				this.prepareMutate();
				this.middle.prepareMutate();
				const middleChildren = this.middle.children.slice().reverse();
				for (const child of middleChildren) {
					this.right.prependItems(child);
				}
				this.middle = undefined;
			}
		}

		return this;
	}

	build(): ListImpl.NonEmpty<T> {
		return (
			this.source ??
			this.context
				.outerTree<T>(
					this.left.build(),
					this.right.build(),
					this.middle?.build() ?? null,
					this.length,
				)
				._normalize()
		);
	}

	buildMap<T2>(f: (value: T) => T2): ListImpl.NonEmpty<T2> {
		return (
			this.source?.map(f) ??
			this.context
				.outerTree(
					this.left.buildMap(f),
					this.right.buildMap(f),
					this.middle?.buildMap?.(f) ?? null,
					this.length,
				)
				._normalize()
		);
	}

	getChildLength(): number {
		return 1;
	}

	prependBlockChild(block: OuterBlockBuilder<T>, child: T): void {
		block.prepend(child);
	}

	appendBlockChild(block: OuterBlockBuilder<T>, child: T): void {
		block.append(child);
	}

	dropBlockFirstChild(block: OuterBlockBuilder<T>): T {
		return block.dropFirstChild();
	}

	dropBlockLastChild(block: OuterBlockBuilder<T>): T {
		return block.dropLastChild();
	}

	_verifyStructure(messages: string[] = []): string[] {
		if (undefined !== this.source) {
			return this.source._verifyStructure(messages);
		}

		if (this.length <= this.context.maxBlockSize) {
			messages.push(
				`OuterTreeBuilder length ${this.length} is less than or equal to maxBlockSize ${this.context.maxBlockSize}, should be an OuterBlock`,
			);
		}

		if (
			this.length <= this.context.maxBlockSize * 2 &&
			undefined !== this.middle
		) {
			messages.push(
				`OuterTreeBuilder length ${this.length} is less than or equal to 2 * maxBlockSize ${this.context.maxBlockSize * 2} but has a middle.`,
			);
		}

		return super._verifyStructure(messages);
	}
}
