import type { ArrayNonEmpty, IndexRange, TraverseState } from '@rimbu/common';
import type { List } from '@rimbu/list';
import type { Stream } from '@rimbu/stream';

import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';
import type { ListContext } from '#list/context';

import { OuterBlock } from '#list/immutable/outer-block';

export class OuterBlockLeftRight<T> extends OuterBlock<T> {
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

	streamSlice(range: IndexRange, options: { reversed?: boolean }): Stream<T> {
		return this.#ops.streamRange(this.#children, range, options);
	}

	get(index: number): T {
		return this.#ops.at(this.#children, index);
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

	filterIndexed(
		f: (element: T, index: number, halt: () => void) => boolean,
		options?: {
			reversed?: boolean | undefined;
			negate?: boolean | undefined;
			state?: TraverseState;
		},
	): List<T> {
		const newChildren = this.#ops.filterIndexed(this.#children, f, options);
		if (newChildren === this.#children) return this;

		if (this.#ops.size(newChildren) === 0) return this.context.empty();

		return this.#copy(newChildren);
	}

	map<T2>(f: (element: T) => T2): OuterBlock<T2> {
		return this.#copyAsType(this.#ops.map(this.#children, f));
	}

	prependBlockChild(child: T): OuterBlock<T> {
		return this.#copy(this.#ops.prepend(this.#children, child));
	}

	appendBlockChild(child: T): OuterBlock<T> {
		return this.#copy(this.#ops.append(this.#children, child));
	}

	toArray(options: { reversed?: boolean } = {}): ArrayNonEmpty<T> {
		const { reversed = false } = options;
		return this.#ops.toArray(this.#children, reversed);
	}

	copyChildren(): OuterChildren<T> {
		return this.#ops.safeCopy(this.#children);
	}

	takeChildren(amount: number): OuterBlock<T> {
		if (amount >= 0) {
			return this.#copy(
				this.#ops.toSpliced(this.#children, amount, this.size - amount),
			);
		}
		return this.#copy(
			this.#ops.toSpliced(this.#children, 0, this.size + amount),
		);
	}

	dropChildren(amount: number): OuterBlock<T> {
		if (amount >= 0) {
			return this.#copy(this.#ops.toSpliced(this.#children, 0, amount));
		}
		return this.#copy(
			this.#ops.toSpliced(this.#children, this.size + amount, -amount),
		);
	}

	concatChildren(children: OuterChildren<T>): OuterChildren<T> {
		return this.#ops.concat(this.#children, children);
	}

	prependChildren(children: OuterChildren<T>): OuterChildren<T> {
		return this.#ops.concat(children, this.#children);
	}

	createOuterBlock(element: T): OuterBlock<T> {
		return this.context.outerBlockLeftRight(this.#ops.of([element]));
	}
}
