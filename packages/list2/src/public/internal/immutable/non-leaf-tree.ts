import type { ListContext } from '#list/context';
import type { CacheMap } from '#list/immutable/cache-map';
import type { NonLeafBlock } from '#list/immutable/non-leaf-block';
import type { NonLeaf } from '#list/immutable/utils';

import { NonLeafBase } from '#list/immutable/non-leaf-base';

export class NonLeafTree<T> extends NonLeafBase<T> implements NonLeaf<T> {
	constructor(
		context: ListContext,
		readonly left: NonLeafBlock<T>,
		readonly right: NonLeafBlock<T>,
		readonly middle: NonLeaf<T> | null,
		readonly itemsLength: number,
		readonly level: number,
	) {
		super(context);
	}

	copy(
		left = this.left,
		right = this.right,
		middle = this.middle,
		itemsLength = this.itemsLength,
		level = this.level,
	): NonLeafTree<T> {
		if (
			left === this.left &&
			right === this.right &&
			middle === this.middle &&
			itemsLength === this.itemsLength &&
			level === this.level
		) {
			return this;
		}

		return this.context.nonLeafTree(left, right, middle, itemsLength, level);
	}

	get(index: number): T {
		return 0 as any;
	}

	prependChild(child: NonLeaf<T>): NonLeafTree<T> {
		const newLength = this.itemsLength + child.itemsLength;

		if (this.left.children.length < this.context.maxBlockSize) {
			return this.copy(
				this.left.prependChild(child) as NonLeafBlock<T>,
				undefined,
				undefined,
				newLength,
			);
		}

		return this.copy(
			this.left.copy([child], child.itemsLength),
			undefined,
			this.middle
				? this.middle.prependChild(this.left)
				: this.context.nonLeafBlock(
						[this.left],
						this.left.itemsLength,
						this.level + 1,
					),
			newLength,
		);
	}

	appendChild(child: NonLeaf<T>): NonLeafTree<T> {
		const newLength = this.itemsLength + child.itemsLength;

		if (this.right.children.length < this.context.maxBlockSize) {
			return this.copy(
				undefined,
				this.right.appendChild(child) as NonLeafBlock<T>,
				undefined,
				newLength,
			);
		}

		return this.copy(
			undefined,
			this.right.copy([child], child.itemsLength),
			this.middle
				? this.middle.appendChild(this.right)
				: this.context.nonLeafBlock(
						[this.right],
						this.right.itemsLength,
						this.level + 1,
					),
			newLength,
		);
	}

	reversed(cacheMap: CacheMap = this.context.cacheMap()): NonLeafTree<T> {
		const cachedThis = cacheMap.get<NonLeafTree<T>>(this);
		if (cachedThis !== undefined) return cachedThis;

		const newMid = this.middle?.reversed(cacheMap) ?? null;
		const newLeft = this.right.reversed(cacheMap);
		const newRight =
			this.left === this.right ? newLeft : this.left.reversed(cacheMap);

		const reversedThis = this.copy(newLeft, newRight, newMid);
		return cacheMap.setAndReturn(this, reversedThis);
	}

	_structure(): string {
		return `NonLeafTree<${this.itemsLength}>(${this.left._structure()}, ${this.middle?._structure() ?? '<notree>'}, ${this.right._structure()})`;
	}
}
