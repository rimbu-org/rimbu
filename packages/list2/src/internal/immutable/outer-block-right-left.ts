import type { List } from '@rimbu/list';
import type { Stream } from '@rimbu/stream';

import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';
import type { ListContext } from '#list/context';

import {
	type ArrayNonEmpty,
	type IndexRange,
	type TraverseState,
} from '@rimbu/common';

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

	#copyAsType<T2>(children: OuterChildren<T2>): OuterBlock<T2> {
		if ((children as any) === this.#children) {
			return this as unknown as OuterBlock<T2>;
		}
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
		// TODO range should also be updated
		return this.#ops.streamRange(this.#children, range, {
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
		const newChildren = this.#ops.filter(this.#children, f);
		if (newChildren === this.#children) return this;

		if (this.#ops.size(newChildren) === 0) return this.context.empty();

		return this.#copy(newChildren);
	}

	filterIndexed(
		f: (element: T, index: number, halt: () => void) => boolean,
		options: {
			reversed?: boolean | undefined;
			negate?: boolean | undefined;
			state?: TraverseState;
		} = {},
	): List<T> {
		const newChildren = this.#ops.filterIndexed(this.#children, f, {
			...options,
			reversed: !options.reversed,
		});

		if (newChildren === this.#children) return this;

		if (this.#ops.size(newChildren) === 0) return this.context.empty();

		return this.#copy(newChildren);
	}

	map<T2>(f: (element: T) => T2): OuterBlock<T2> {
		return this.#copyAsType(this.#ops.map(this.#children, f));
	}

	prependBlockChild(child: T): OuterBlock<T> {
		return this.#copy(this.#ops.append(this.#children, child));
	}

	appendBlockChild(child: T): OuterBlock<T> {
		return this.#copy(this.#ops.prepend(this.#children, child));
	}

	toArray(): ArrayNonEmpty<T> {
		// TODO reverse
		return this.#ops.toArray(this.#children);
	}

	copyChildren(): OuterChildren<T> {
		// TODO reverse
		return this.#ops.safeCopy(this.#children);
	}

	takeChildren(amount: number): OuterBlock<T> {
		if (amount >= 0) {
			return this.#copy(
				this.#ops.toSpliced(this.#children, 0, this.size - amount),
			);
		}
		return this.#copy(
			this.#ops.toSpliced(this.#children, amount, this.size + amount),
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
		// TODO reverse
		return this.#ops.concat(this.#children, children);
	}

	prependChildren(children: OuterChildren<T>): OuterChildren<T> {
		// TODO reverse
		return this.#ops.concat(children, this.#children);
	}

	createOuterBlock(element: T): OuterBlock<T> {
		return this.context.outerBlockLeftRight(this.#ops.of([element]));
	}
}
