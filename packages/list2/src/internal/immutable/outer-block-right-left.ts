import type { List } from '@rimbu/list';

import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';
import type { ListContext } from '#list/context';

import {
	type ArrayNonEmpty,
	IndexRange,
	type TraverseState,
} from '@rimbu/common';
import { Stream } from '@rimbu/stream';

import { OuterBlock } from '#list/immutable/outer-block';

export class OuterBlockRightLeft<T> extends OuterBlock<T> {
	declare _self: OuterBlock<T>;

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

	streamSlice(
		range: IndexRange,
		options: { reversed?: boolean | undefined } = {},
	): Stream<T> {
		const { reversed = false } = options;

		const [start, end = this.size - 1] = IndexRange.getIndexRangeIndices(range);

		const lastIndex = this.size - 1;

		if (start > lastIndex || end < start) return Stream.empty();

		const reverseRange = {
			start: lastIndex - Math.min(end, lastIndex),
			end: lastIndex - start,
		};

		return this.#ops.streamRange(this.#children, reverseRange, {
			reversed: !reversed,
		});
	}

	get(index: number): T {
		return this.#ops.at(this.#children, this.size - index - 1);
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

	filterIndexed(
		f: (element: T, index: number, halt: () => void) => boolean,
		options: {
			reversed?: boolean | undefined;
			negate?: boolean | undefined;
			state?: TraverseState;
		} = {},
	): List<T> {
		const { reversed = false } = options;

		const newChildren = this.#ops.filterIndexed(this.#children, f, {
			...options,
			reversed: !reversed,
		});

		if (newChildren === this.#children) return this;

		if (this.#ops.size(newChildren) === 0) return this.context.empty();

		return this.context.outerBlockLeftRight(newChildren);
	}

	map<T2>(f: (element: T) => T2): OuterBlock<T2> {
		return this.context.outerBlockLeftRight(
			this.#ops.reverseMap(this.#children, f),
		);
	}

	prependBlockChild(child: T): OuterBlock<T> {
		return this.#copy(this.#ops.append(this.#children, child));
	}

	appendBlockChild(child: T): OuterBlock<T> {
		return this.#copy(this.#ops.prepend(this.#children, child));
	}

	toArray(options: { reversed?: boolean } = {}): ArrayNonEmpty<T> {
		const { reversed = false } = options;
		return this.#ops.toArray(this.#children, !reversed);
	}

	copyChildren(): OuterChildren<T> {
		return this.#ops.toReversed(this.#children);
	}

	takeChildren(amount: number): OuterBlock<T> {
		if (amount >= 0) {
			return this.#copy(
				this.#ops.toSpliced(this.#children, 0, this.size - amount),
			);
		}
		return this.#copy(
			this.#ops.toSpliced(this.#children, -amount, this.size - amount),
		);
	}

	dropChildren(amount: number): OuterBlock<T> {
		if (amount >= 0) {
			return this.#copy(
				this.#ops.toSpliced(this.#children, this.size - amount, amount),
			);
		}
		return this.#copy(this.#ops.toSpliced(this.#children, 0, -amount));
	}

	concatChildren(children: OuterChildren<T>): OuterChildren<T> {
		return this.#ops.concat(this.#ops.toReversed(this.#children), children);
	}

	prependChildren(children: OuterChildren<T>): OuterChildren<T> {
		return this.#ops.concat(children, this.#ops.toReversed(this.#children));
	}

	createOuterBlock(element: T): OuterBlock<T> {
		return this.context.outerBlockLeftRight(this.#ops.of([element]));
	}
}
