import type { ListContext } from '#list/context';
import type { CacheMap } from '#list/immutable/cache-map';
import type { LeafBlock } from '#list/immutable/leaf-block';
import type { NonLeaf } from '#list/immutable/utils';
import type { ListImpl } from '#list/list-impl';

import { OptLazy } from '@rimbu/common/opt-lazy';

import { LeafBase } from '#list/immutable/leaf-base';
import { treeGet } from '#list/immutable/tree-base';

export class LeafTree<T> extends LeafBase<T> implements ListImpl.NonEmpty<T> {
	constructor(
		context: ListContext,
		readonly left: LeafBlock<T>,
		readonly right: LeafBlock<T>,
		readonly middle: NonLeaf<T> | null,
		readonly length: number,
	) {
		super(context);
	}

	get itemsLength() {
		return this.length;
	}

	copy(
		left = this.left,
		right = this.right,
		middle = this.middle,
		length = this.length,
	): LeafTree<T> {
		if (
			left === this.left &&
			right === this.right &&
			middle === this.middle &&
			length === this.length
		) {
			return this;
		}

		return this.context.leafTree(left, right, middle, length);
	}

	get<O>(index: number, otherwise?: OptLazy<T>): T | O {
		if (index >= this.length || -index > this.length) {
			return OptLazy(otherwise) as O;
		}
		if (index < 0) {
			return this.get(this.length + index, otherwise);
		}

		return treeGet<T>(this, index);
	}

	prepend(value: T): LeafTree<T> {
		const newLength = this.length + 1;

		if (this.left.canAddChild) {
			return this.copy(
				this.left.prependChild(value),
				this.right,
				this.middle,
				newLength,
			);
		}

		return this.copy(
			this.left.copy(this.ops.of(value)),
			this.right,
			this.middle?.prependChild(this.left) ??
				this.context.nonLeafBlock<T>([this.left], this.left.length, 1),
			newLength,
		);
	}

	append(value: T): LeafTree<T> {
		const newLength = this.length + 1;

		if (this.right.canAddChild) {
			return this.copy(
				this.left,
				this.right.append(value) as LeafBlock<T>,
				this.middle,
				newLength,
			);
		}

		return this.copy(
			this.left,
			this.right.copy(this.ops.of(value)),
			this.middle?.appendChild(this.right) ??
				this.context.nonLeafBlock<T>([this.right], this.right.length, 1),
			newLength,
		);
	}

	take(amount: number): ListImpl.NonEmpty<T> {
		return 0 as any;
	}

	drop(amount: number): ListImpl<T> {
		return 0 as any;
	}

	reversed(cacheMap: CacheMap = this.context.cacheMap()): LeafTree<T> {
		const cachedThis = cacheMap.get<LeafTree<T>>(this);
		if (cachedThis !== undefined) return cachedThis;

		const newMid = this.middle?.reversed(cacheMap) ?? null;
		const newLeft = this.right.reversed(cacheMap);
		const newRight =
			this.left === this.right ? newLeft : this.left.reversed(cacheMap);

		const reversedThis = this.copy(newLeft, newRight, newMid);
		return cacheMap.setAndReturn(this, reversedThis);
	}

	_structure(): string {
		return `LeafTree<${this.length}>(${this.left._structure()}, ${this.middle?._structure() ?? '<notree>'}, ${this.right._structure()})`;
	}
}
