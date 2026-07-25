import type { ListContext } from '#list/context';
import type { Block, Inner } from '#list/immutable/common';
import type { InnerBlock } from '#list/immutable/inner-block';

export class InnerTree<T, C extends Block<T>> {
	constructor(
		readonly context: ListContext<T, true>,
		readonly left: InnerBlock<T, C>,
		readonly right: InnerBlock<T, C>,
		readonly middle: Inner<T, InnerBlock<T, C>> | null,
		readonly size: number,
		readonly level: number,
	) {}

	copy(
		left = this.left,
		right = this.right,
		middle = this.middle,
		size = this.size,
		level = this.level,
	): InnerTree<T, C> {
		if (
			left === this.left &&
			right === this.right &&
			middle === this.middle &&
			size === this.size &&
			level === this.level
		) {
			return this;
		}

		return this.context.innerTree(left, right, middle, size, level);
	}

	copyAsType<T2, C2 extends Block<T2>>(
		left: InnerBlock<T2, C2>,
		right: InnerBlock<T2, C2>,
		middle: Inner<T2, InnerBlock<T2, C2>> | null,
		size = this.size,
		level = this.level,
	): InnerTree<T2, C2> {
		return this.context.innerTree(left, right, middle, size, level);
	}
}
