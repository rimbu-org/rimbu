import type { WithElem } from '@rimbu/collection-types/common';
import type { Stream } from '@rimbu/stream';

import type { ListImpl } from '#list/list-impl';

import { OptLazy } from '@rimbu/common/opt-lazy';

import { OuterBlock } from '#list/immutable/outer-block';

export class ReversedOuterBlock<
	T,
	Tp extends ListImpl.Types = ListImpl.Types,
> extends OuterBlock<T, Tp> {
	get isReversedBlock() {
		return true;
	}

	copy(children: WithElem<Tp, T>['outerChildren']): OuterBlock<T> {
		if (children === this.children) return this;
		if (this.ops.length(children) === 1) {
			return this.context.outerBlock(children);
		}
		return this.context.reversedOuterBlock(children);
	}

	copy2<T2>(children: WithElem<Tp, T2>['outerChildren']): OuterBlock<T2> {
		if (children === this.children) return this as unknown as OuterBlock<T2>;
		if (this.ops.length(children) === 1) {
			return this.context.outerBlock(children);
		}
		return this.context.reversedOuterBlock(children);
	}

	get<O>(index: number, otherwise?: OptLazy<O>): T | O {
		if (index >= this.length || -index > this.length) {
			return OptLazy(otherwise!);
		}
		if (index < 0) {
			return this.get(this.length + index, otherwise);
		}

		return this.ops.get(this.children, this.length - 1 - index);
	}

	stream(options: { reversed?: boolean } = {}): Stream.NonEmpty<T> {
		const { reversed = false } = options;

		return this.ops.stream(this.children, { reversed: !reversed });
	}

	prependChild(value: T): OuterBlock<T> {
		return super.appendChild(value);
	}

	appendChild(value: T): OuterBlock<T> {
		return super.prependChild(value);
	}

	takeChildren(amount: number): OuterBlock<T> {
		return this.copy(
			this.ops.toSpliced(this.children, 0, this.length - amount),
		);
	}

	dropChildren(amount: number): OuterBlock<T> {
		return this.copy(
			this.ops.toSpliced(this.children, this.length - amount, amount),
		);
	}

	_structure(): string {
		return `ReversedOuterBlock<${this.length}>(${this.ops.join(this.children, ',', true)})`;
	}
}
