import type { Int } from '@rimbu/base';
import type { Op } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { List } from '@rimbu/list';
import type { Stream } from '@rimbu/stream';

import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';
import type { ListContext } from '#list/context';

import { OuterBlock } from '#list/immutable/outer-block';

export class OuterBlockRightLeft<T> extends OuterBlock<T> {
	constructor(
		readonly context: ListContext<T, true>,
		children: OuterChildren<T>,
	) {
		super(context);
		this.#children = this.#ops.guard(children);
	}

	readonly #children: OuterChildren<T>;

	get #ops(): ChildrenOps {
		return this.context.childrenOps;
	}

	get size() {
		return this.#ops.size(this.#children);
	}

	#copy(children: any): OuterBlock<T> {
		if (children === this.#children) return this;
		return this.context.outerBlockRightLeft(children);
	}

	stream(options: { reversed?: boolean | undefined } = {}): Stream.NonEmpty<T> {
		const { reversed = false } = options;
		return this.#ops.stream(this.#children, { reversed: !reversed });
	}

	_streamSlice(
		start: number,
		end: number,
		options: { reversed?: boolean },
	): Stream<T> {
		const { reversed = false } = options;

		const lastIndex = this.size - 1;

		const reversedStart = lastIndex - Math.min(end, lastIndex);
		const reversedEnd = lastIndex - start;

		return this.#ops.streamRange(
			this.#children,
			{ start: reversedStart, end: reversedEnd },
			{
				reversed: !reversed,
			},
		);
	}

	_update(
		index: Int.AtLeastZero,
		f: (element: T) => T,
	): Op.WithResult<OuterBlock<T>, [previous: T, current: T], true> {
		const outcome = this.#ops.updateAt(
			this.#children,
			this.size - index - 1,
			f,
		);

		const collection = outcome.hasChanged
			? this.#copy(outcome.collection)
			: this;

		return { ...outcome, collection };
	}

	forEach(f: (element: T) => void): void {
		this.#ops.forEach(this.#children, f, { reversed: true });
	}

	filter(f: (element: T) => boolean): List<T> {
		const newChildren = this.#ops.reverseFilter(this.#children, f);

		if (undefined === newChildren) return this;
		if (this.#ops.size(newChildren) === 0) return this.context.empty();

		return this.context.outerBlockLeftRight(newChildren);
	}

	map<T2>(f: (element: T) => T2): OuterBlock<T2> {
		return this.context.outerBlockLeftRight(
			this.#ops.reverseMap(this.#children, f),
		);
	}

	reversed(): OuterBlock<T> {
		return this.context.outerBlockLeftRight(this.#children);
	}

	toArray(options: { reversed?: boolean } = {}): ArrayNonEmpty<T> {
		const { reversed = false } = options;
		return this.#ops.toArray(this.#children, !reversed);
	}

	_get(index: number): T {
		return this.#ops.at(this.#children, this.size - index - 1);
	}

	_prependBlockChild(child: T): OuterBlock<T> {
		return this.#copy(this.#ops.append(this.#children, child));
	}

	_appendBlockChild(child: T): OuterBlock<T> {
		return this.#copy(this.#ops.prepend(this.#children, child));
	}

	_copyChildren(): OuterChildren<T> {
		return this.#ops.toReversed(this.#children);
	}

	_takeChildren(amount: Int): OuterBlock<T> {
		if (amount >= 0) {
			return this.#copy(
				this.#ops.toSpliced(this.#children, 0, this.size - amount),
			);
		}
		return this.#copy(
			this.#ops.toSpliced(this.#children, -amount, this.size - amount),
		);
	}

	_dropChildren(amount: Int): OuterBlock<T> {
		if (amount >= 0) {
			return this.#copy(
				this.#ops.toSpliced(this.#children, this.size - amount, amount),
			);
		}
		return this.#copy(this.#ops.toSpliced(this.#children, 0, -amount));
	}

	_concatChildren(children: OuterChildren<T>): OuterChildren<T> {
		return this.#ops.concat(this.#ops.toReversed(this.#children), children);
	}

	_prependChildren(children: OuterChildren<T>): OuterChildren<T> {
		return this.#ops.concat(children, this.#ops.toReversed(this.#children));
	}

	_createOuterBlock(element: T): OuterBlock<T> {
		return this.context.outerBlockLeftRight(this.#ops.of([element]));
	}
}
