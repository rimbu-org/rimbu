import type { Int } from '@rimbu/base';
import type { Op } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { List } from '@rimbu/list';
import type { Stream } from '@rimbu/stream';

import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';
import type { ListContext } from '#list/context';
import type { CacheMap } from '#list/immutable/cache-map';

import { OuterBlock } from '#list/immutable/outer-block';

export class OuterBlockLeftRight<T> extends OuterBlock<T> {
	constructor(
		readonly context: ListContext<T, true>,
		children: OuterChildren<T>,
	) {
		super(context);
		this.#children = this.#ops.guard(children);
	}

	#children: OuterChildren<T>;

	get #ops(): ChildrenOps {
		return this.context.childrenOps;
	}

	get size() {
		return this.#ops.size(this.#children);
	}

	#copy(children: any): OuterBlock<T> {
		if (children === this.#children) return this;
		return this.context.outerBlockLeftRight(children);
	}

	#copyAsType<T2>(children: OuterChildren<T2>): OuterBlock<T2> {
		if ((children as any) === this.#children)
			return this as unknown as OuterBlock<T2>;
		return this.context.outerBlockLeftRight(children);
	}

	stream(options?: { reversed?: boolean | undefined }): Stream.NonEmpty<T> {
		return this.#ops.stream(this.#children, options);
	}

	_streamSlice(
		start: number,
		end: number,
		options: { reversed?: boolean },
	): Stream<T> {
		return this.#ops.streamRange(this.#children, { start, end }, options);
	}

	_update(
		index: Int.AtLeastZero,
		f: (element: T) => T,
	): Op.WithResult<OuterBlock<T>, [previous: T, current: T], true> {
		const outcome = this.#ops.updateAt(this.#children, index, f);

		const collection = outcome.hasChanged
			? this.#copy(outcome.collection)
			: this;

		return { ...outcome, collection };
	}

	forEach(f: (element: T) => void): void {
		this.#ops.forEach(this.#children, f);
	}

	filter(f: (element: T) => boolean): List<T> {
		const newChildren = this.#ops.filter(this.#children, f);

		if (undefined === newChildren) return this;
		if (this.#ops.size(newChildren) === 0) return this.context.empty();

		return this.#copy(newChildren);
	}

	map<T2>(f: (element: T) => T2, cacheMap?: CacheMap): OuterBlock<T2> {
		const cached = cacheMap?.get<OuterBlock<T2>>(this);
		if (cached) return cached;

		const newBlock = this.#copyAsType(this.#ops.map(this.#children, f));

		if (cacheMap) {
			return cacheMap?.setAndReturn(this, newBlock);
		}
		return newBlock;
	}

	reversed(): OuterBlock<T> {
		return this.context.outerBlockRightLeft(this.#children);
	}

	toArray(options: { reversed?: boolean } = {}): ArrayNonEmpty<T> {
		const { reversed = false } = options;
		return this.#ops.toArray(this.#children, reversed);
	}

	_get(index: number): T {
		return this.#ops.at(this.#children, index);
	}

	_prependBlockChild(child: T): OuterBlock<T> {
		return this.#copy(this.#ops.prepend(this.#children, child));
	}

	_appendBlockChild(child: T): OuterBlock<T> {
		return this.#copy(this.#ops.append(this.#children, child));
	}

	_copyChildren(): OuterChildren<T> {
		return this.#ops.safeCopy(this.#children);
	}

	_takeChildren(amount: Int.AtLeastOne): OuterBlock<T> {
		return this.#copy(
			this.#ops.toSpliced(this.#children, amount, this.size - amount),
		);
	}

	_dropChildren(amount: Int.AtLeastOne): OuterBlock<T> {
		return this.#copy(this.#ops.toSpliced(this.#children, 0, amount));
	}

	_concatChildren(children: OuterChildren<T>): OuterChildren<T> {
		return this.#ops.concat(this.#children, children);
	}

	_prependChildren(children: OuterChildren<T>): OuterChildren<T> {
		return this.#ops.concat(children, this.#children);
	}

	_createOuterBlock(element: T): OuterBlock<T> {
		return this.context.outerBlockLeftRight(this.#ops.of([element]));
	}
}
