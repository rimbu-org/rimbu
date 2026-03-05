import type { WithElem } from '@rimbu/collection-types/common';

import type { ListContext } from '#list/context';
import type { Block } from '#list/immutable/utils';
import type { ListImpl } from '#list/list-impl';

import { OptLazy } from '@rimbu/common/opt-lazy';

import { LeafBase } from '#list/immutable/leaf-base';

export class LeafBlock<T, Tp extends ListImpl.Types = ListImpl.Types>
	extends LeafBase<T>
	implements ListImpl.NonEmpty<T>, Block<T>
{
	constructor(
		context: ListContext,
		readonly children: WithElem<Tp, T>['leafChildren'],
		readonly length = context.leafChildrenOps.length(children),
	) {
		super(context);
	}

	get itemsLength() {
		return this.length;
	}

	get childrenInMax(): boolean {
		return this.length <= this.context.maxBlockSize;
	}

	get childrenInMin(): boolean {
		return this.length >= this.context.minBlockSize;
	}

	get canAddChild(): boolean {
		return this.length < this.context.maxBlockSize;
	}

	copy(children: WithElem<Tp, T>['leafChildren']): LeafBlock<T> {
		if (children === this.children) return this;
		return this.context.leafBlock(children);
	}

	copy2<T2>(children: WithElem<Tp, T2>['leafChildren']): LeafBlock<T2> {
		if (children === this.children) return this as unknown as LeafBlock<T2>;
		return this.context.leafBlock(children);
	}

	// stream(options: { reversed?: boolean } = {}): Stream.NonEmpty<T> {
	// 	return this.ops.stream(this.children, options);
	// }

	// 	streamRange(
	// 	range: IndexRange,
	// 	options: { reversed?: boolean } = {},
	// ): Stream<T> {
	// 	const { reversed = false } = options;
	// 	return this.leafOps.streamRange(this.children, {
	// 		indexRange: range,
	// 		reversed,
	// 	});
	// }

	get<O>(index: number, otherwise?: OptLazy<O>): T | O {
		if (index >= this.length || -index > this.length) {
			return OptLazy(otherwise!);
		}
		if (index < 0) {
			return this.get(this.length + index, otherwise);
		}

		return this.ops.get(this.children, index);
	}

	prepend(value: T): ListImpl.NonEmpty<T> {
		if (this.canAddChild) {
			return this.prependChild(value);
		}

		return this.context.leafTree<T>(
			this.context.leafBlock(this.ops.of(value)),
			this,
			null,
			this.length + 1,
		);
	}

	append(value: T): ListImpl.NonEmpty<T> {
		if (this.canAddChild) {
			return this.appendChild(value);
		}

		return this.context.leafTree(
			this,
			this.context.leafBlock(this.ops.of(value)),
			null,
			this.length + 1,
		);
	}

	prependChild(value: T): LeafBlock<T> {
		return this.copy(this.ops.prepend(this.children, value));
	}

	appendChild(value: T): LeafBlock<T> {
		return this.copy(this.ops.append(this.children, value));
	}

	reversed(cacheMap = this.context.cacheMap()): LeafBlock<T> {
		if (this.length === 1) return this;

		const cachedThis = cacheMap.get<LeafBlock<T>>(this);
		if (cachedThis !== undefined) return cachedThis;

		// biome-ignore lint/complexity/noUselessThisAlias: Needed
		const thisCopy = this;

		const reversedThis = this.context.isReversedLeafBlock(this)
			? this.context.leafBlock<T>(this.children)
			: thisCopy.context.reversedLeafBlock<T>(thisCopy.children);

		return cacheMap.setAndReturn(this, reversedThis);
	}

	take(amount: number): ListImpl<T> {
		if (amount === 0) return this.context.empty();
		if (amount >= this.length || -amount > this.length) return this;
		if (amount < 0) return this.drop(this.length + amount);

		return this.takeChildren(amount);
	}

	drop(amount: number): ListImpl<T> {
		if (amount === 0) return this;
		if (amount >= this.length || -amount > this.length)
			return this.context.empty();
		if (amount < 0) return this.take(this.length + amount);

		return this.dropChildren(amount);
	}

	takeChildren(amount: number): LeafBlock<T> {
		return this.copy(
			this.ops.toSpliced(this.children, amount, this.context.maxBlockSize),
		);
	}

	dropChildren(amount: number): LeafBlock<T> {
		return this.copy(this.ops.toSpliced(this.children, 0, amount));
	}

	_structure(): string {
		return `LeafBlock<${this.length}>(${this.ops.join(this.children, ',')})`;
	}
}
