import type { WithElem } from '@rimbu/collection-types/common';
import type { Stream } from '@rimbu/stream';

import type { ListImpl } from '#list/list-impl';

import { LeafBlock } from '#list/immutable/leaf-block';

export class ReversedLeafBlock<
	T,
	Tp extends ListImpl.Types = ListImpl.Types,
> extends LeafBlock<T, Tp> {
	copy(children: WithElem<Tp, T>['leafChildren']): LeafBlock<T> {
		if (children === this.children) return this;
		if (this.ops.length(children) === 1) {
			return this.context.leafBlock(children);
		}
		return this.context.reversedLeafBlock(children);
	}

	copy2<T2>(children: WithElem<Tp, T2>['leafChildren']): LeafBlock<T2> {
		if (children === this.children) return this as unknown as LeafBlock<T2>;
		if (this.ops.length(children) === 1) {
			return this.context.leafBlock(children);
		}
		return this.context.reversedLeafBlock(children);
	}

	stream(options: { reversed?: boolean } = {}): Stream.NonEmpty<T> {
		const { reversed = false } = options;

		return this.ops.stream(this.children, { reversed: !reversed });
	}

	prependChild(value: T): LeafBlock<T> {
		return super.appendChild(value);
	}

	appendChild(value: T): LeafBlock<T> {
		return super.prependChild(value);
	}

	takeChildren(amount: number): LeafBlock<T> {
		return this.copy(
			this.ops.toSpliced(this.children, 0, this.length - amount),
		);
	}

	dropChildren(amount: number): LeafBlock<T> {
		return this.copy(this.ops.toSpliced(this.children, 0, amount));
	}

	_structure(): string {
		return `ReversedLeafBlock<${this.length}>(${this.ops.join(this.children, ',', true)})`;
	}
}
