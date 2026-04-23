import type { WithElem } from '@rimbu/collection-types/common';
import type { TraverseState } from '@rimbu/common/traverse-state';

import type { ListContext } from '#list/context-module';
import type { OuterBlock } from '#list/immutable/outer-block';
import type { ListImpl } from '#list/list-impl';

import { Update } from '@rimbu/common/update';

import {
	type BlockBuilder,
	BuilderBase,
	type OuterBuilder,
} from '#list/mutable/builder-base';

export class OuterBlockBuilder<T, Tp extends ListImpl.Types = ListImpl.Types>
	extends BuilderBase
	implements OuterBuilder<T>, BlockBuilder<T, T>
{
	constructor(
		context: ListContext,
		public source?: OuterBlock<T>,
		public _children?: WithElem<Tp, T>['outerChildren'],
	) {
		super(context);
	}

	get length(): number {
		return this.source?.length ?? this.ops.length(this.children);
	}

	get children(): WithElem<Tp, T>['outerChildren'] {
		return this._children!;
	}

	set children(value: WithElem<Tp, T>['outerChildren']) {
		this._children = value;
	}

	get nrChildren(): number {
		return this.source?.nrChildren ?? this.ops.length(this.children);
	}

	get canAddChild(): boolean {
		return this.nrChildren < this.context.maxBlockSize;
	}

	get canRemoveChild(): boolean {
		return this.nrChildren > this.context.minBlockSize;
	}

	get childrenInMax(): boolean {
		return this.nrChildren <= this.context.maxBlockSize;
	}

	get childrenInMin(): boolean {
		return this.nrChildren >= this.context.minBlockSize;
	}

	prepareMutate(): void {
		if (undefined === this.source) return;

		this._children = this.source.isReversedBlock
			? this.ops.toReversed(this.source.children)
			: this.ops.safeCopy(this.source.children);
		this.source = undefined;
	}

	copy(children: WithElem<Tp, T>['outerChildren']): OuterBlockBuilder<T> {
		return this.context.outerBlockBuilder(children);
	}

	get(index: number): T {
		if (undefined !== this.source) {
			return this.source.get(index);
		}

		return this.ops.at(this.children, index);
	}

	prepend(value: T): void {
		this.prepareMutate();
		this.children = this.ops.mutatePrepend(this.children, value);
	}

	append(value: T): void {
		this.prepareMutate();
		this.children = this.ops.mutateAppend(this.children, value);
	}

	insert(index: number, value: T): void {
		this.prepareMutate();
		this.ops.mutateSplice(this.children, index, 0, this.ops.of([value]));
	}

	remove(index: number): T {
		this.prepareMutate();
		const removed = this.ops.at<T>(this.children, index);
		this.ops.mutateSplice(this.children, index, 1);
		return removed;
	}

	prependItems(other: OuterBlockBuilder<T>): void {
		this.prepareMutate();
		this.children = this.ops.concat(
			other.source?.children ?? other.children,
			this.children,
		);
	}

	appendItems(other: OuterBlockBuilder<T>): void {
		this.prepareMutate();
		this.children = this.ops.concat(
			this.children,
			other.source?.children ?? other.children,
		);
	}

	dropFirstChild(): T {
		this.prepareMutate();
		const value = this.ops.mutateDropFirst<T>(this.children);
		return value;
	}

	dropLastChild(): T {
		this.prepareMutate();
		const value = this.ops.mutateDropLast<T>(this.children);
		return value;
	}

	build(): OuterBlock<T> {
		return (
			this.source ?? this.context.outerBlock(this.ops.safeCopy(this.children))
		);
	}

	buildMap<T2>(f: (value: T) => T2): OuterBlock<T2> {
		return (
			this.source?.map(f) ??
			this.context.outerBlock(this.ops.map(this.children, f))
		);
	}

	normalized(): OuterBuilder<T> | undefined {
		const length = this.length;
		if (length <= 0) {
			// block is empty
			return undefined;
		}

		if (length <= this.context.maxBlockSize) {
			// block is normal
			return this;
		}

		// need to split block and create tree
		const newRight = this.splitRight();

		return this.context.outerTreeBuilder(this, newRight, undefined, length);
	}

	splitRight(index = this.length >>> 1): OuterBlockBuilder<T> {
		this.prepareMutate();
		const [newChildren, rightChildren] = this.ops.mutateSplice(
			this.children,
			index,
		);
		this.children = newChildren;
		return this.copy(rightChildren);
	}

	updateAt(index: number, update: Update<T>): T {
		const oldValue =
			(this.source?.get(index) as T) ?? this.ops.at<T>(this.children, index);
		const newValue = Update(oldValue, update);

		if (!Object.is(oldValue, newValue)) {
			this.prepareMutate();
			// value changed
			this.ops.mutateSet(this.children, index, newValue);
		}

		return oldValue;
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { reversed: boolean; state: TraverseState },
	): void {
		if (undefined !== this.source) {
			this.source.forEach(f, options);
			return;
		}

		this.ops.forEach(this.children, f, options);
	}

	prependChild(child: T): void {
		this.prepareMutate();
		this.children = this.ops.mutatePrepend(this.children, child);
	}

	appendChild(child: T): void {
		this.prepareMutate();
		this.children = this.ops.mutateAppend(this.children, child);
	}

	_verifyStructure(
		messages: string[] = [],
		enforceMinChildren = false,
	): string[] {
		if (undefined !== this.source) {
			return this.source._verifyStructure(messages);
		}

		if (enforceMinChildren && this.nrChildren < this.context.minBlockSize) {
			messages.push(
				`OuterBlockBuilder has too few children: ${this.nrChildren} < ${this.context.minBlockSize}`,
			);
		}
		if (this.nrChildren === 0) {
			messages.push(`OuterBlockBuilder has no children.`);
		}
		if (this.nrChildren > this.context.maxBlockSize) {
			messages.push(
				`OuterBlockBuilder has too many children: ${this.nrChildren} > ${this.context.maxBlockSize}`,
			);
		}

		return messages;
	}
}
