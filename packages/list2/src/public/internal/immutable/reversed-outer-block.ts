import type { WithElem } from '@rimbu/collection-types/common';

import type { ListImpl } from '#list/list-impl';

import { IndexRange } from '@rimbu/common/index-range';
import { Stream } from '@rimbu/stream';

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

	getIndex(index: number): number {
		return -index - 1;
	}

	stream(options: { reversed?: boolean } = {}): Stream.NonEmpty<T> {
		const { reversed = false } = options;

		return this.ops.stream(this.children, { reversed: !reversed });
	}

	streamRange(
		range: IndexRange,
		options: { reversed?: boolean } = {},
	): Stream<T> {
		const { reversed = false } = options;

		const [start, end = this.length - 1] =
			IndexRange.getIndexRangeIndices(range);

		const lastIndex = this.length - 1;

		if (start > lastIndex || end < start) return Stream.empty();

		const reverseRange = {
			start: lastIndex - Math.min(end, lastIndex),
			end: lastIndex - start,
		};

		return this.ops.streamRange(this.children, {
			range: reverseRange,
			reversed: !reversed,
		});
	}

	map<T2>(
		mapFun: (value: T, index: number) => T2,
		options: { reversed?: boolean; indexOffset?: number } = {},
	): OuterBlock<T2> {
		const { reversed = false, indexOffset = 0 } = options;

		const newChildren = reversed
			? this.ops.map(this.children, mapFun, indexOffset)
			: this.ops.reverseMap(this.children, mapFun, indexOffset);

		return reversed
			? this.context.reversedOuterBlock(newChildren)
			: this.context.outerBlock(newChildren);
	}

	prependBlockChild(value: T): OuterBlock<T, ListImpl.Types> {
		return super.appendBlockChild(value);
	}

	appendBlockChild(value: T): OuterBlock<T, ListImpl.Types> {
		return super.prependBlockChild(value);
	}

	takeChildren(amount: number): OuterBlock<T> {
		if (amount >= this.length) return this;
		if (amount < 0) return this.takeChildren(this.length + amount);

		return this.copy(
			this.ops.toSpliced(this.children, 0, this.length - amount),
		);
	}

	dropChildren(amount: number): OuterBlock<T> {
		if (amount === 0) return this;
		if (amount < 0) return this.dropChildren(this.length + amount);

		return this.copy(
			this.ops.toSpliced(this.children, this.length - amount, amount),
		);
	}

	concatChildren(other: OuterBlock<T>): OuterBlock<T> {
		if (other.isReversedBlock) {
			return this.context.reversedOuterBlock(
				this.ops.concat(other.children, this.children),
			);
		}

		return this.context.outerBlock(
			this.ops.concat(this.ops.toReversed(this.children), other.children),
		);
	}

	_mutateSplitRight(childIndex = this.length >>> 1): OuterBlock<T> {
		const [rightChildren, newChildren] = this.ops.mutateSplice(
			this.children,
			this.length - childIndex,
		);
		this.children = newChildren;

		return this.copy(rightChildren);
	}

	_structure(depth = 0): string {
		const space = '  '.repeat(depth);
		return `${space}ReversedOuterBlock<${this.length}>(${this.ops.join(this.children, ',', true)})`;
	}

	_verifyStructure(messages: string[] = []): string[] {
		if (!this.childrenInMax) {
			messages.push(
				`ReversedOuterBlock has more children than allowed: ${this.nrChildren} > ${this.context.maxBlockSize}`,
			);
		}

		return messages;
	}
}
