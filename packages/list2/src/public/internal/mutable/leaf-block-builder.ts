import type { WithElem } from '@rimbu/collection-types/common';

import type { ListContext } from '#list/context-module';
import type { LeafBlock } from '#list/immutable/leaf-block';
import type { ListImpl } from '#list/list-impl';

import {
	type BlockBuilder,
	BuilderBase,
	type LeafBuilder,
} from '#list/mutable/builder-base';

export class LeafBlockBuilder<T, Tp extends ListImpl.Types = ListImpl.Types>
	extends BuilderBase
	implements LeafBuilder<T>, BlockBuilder<T>
{
	constructor(
		context: ListContext,
		public source?: LeafBlock<T>,
		public _children?: WithElem<Tp, T>['leafChildren'],
	) {
		super(context);
	}

	get length(): number {
		return this.source?.length ?? this.ops.length(this.children);
	}

	get itemsLength(): number {
		return this.length;
	}

	get children(): WithElem<Tp, T>['leafChildren'] {
		return this._children!;
	}

	set children(value: WithElem<Tp, T>['leafChildren']) {
		this._children = value;
	}

	get nrChildren(): number {
		return this.ops.length(this.children);
	}

	get canAddChild(): boolean {
		return this.nrChildren < this.context.maxBlockSize;
	}

	prepareMutate(): void {
		if (undefined === this.source) return;

		this._children = this.source.children;
		this.source = undefined;
	}

	copy(children: WithElem<Tp, T>['leafChildren']): LeafBlockBuilder<T> {
		return this.context.leafBlockBuilder(children);
	}

	get(index: number): T {
		if (undefined !== this.source) {
			return this.source.get(index);
		}

		return this.ops.get(this.children, index);
	}

	prepend(value: T): void {
		this.prepareMutate();
		this.children = this.ops.mutatePrepend(this.children, value);
	}

	append(value: T): void {
		this.prepareMutate();
		this.children = this.ops.mutateAppend(this.children, value);
	}

	prependItems(other: LeafBlockBuilder<T>): void {
		this.prepareMutate();
		this.children = this.ops.concat(other.children, this.children);
	}

	appendItems(other: LeafBlockBuilder<T, Tp>): void {
		this.prepareMutate();
		this.children = this.ops.concat(this.children, other.children);
	}

	dropFirst(): T {
		this.prepareMutate();
		const value = this.ops.mutateDropFirst<T>(this.children);
		return value;
	}

	dropLast(): T {
		this.prepareMutate();
		const value = this.ops.mutateDropLast<T>(this.children);
		return value;
	}

	build(): LeafBlock<T> {
		return (
			this.source ?? this.context.leafBlock(this.ops.safeCopy(this.children))
		);
	}

	normalized(): LeafBuilder<T> | undefined {
		if (this.length <= 0) {
			// block is empty
			return undefined;
		}

		if (this.length <= this.context.maxBlockSize) {
			// block is normal
			return this;
		}

		// need to split block and create tree
		this.prepareMutate();
		const newLength = this.length;
		const newRight = this.splitRight();

		return this.context.leafTreeBuilder(this, newRight, undefined, newLength);
	}

	splitRight(index = this.length >>> 1): LeafBlockBuilder<T> {
		this.prepareMutate();
		const [newChildren, rightChildren] = this.ops.mutateSplice(
			this.children,
			index,
		);
		this.children = newChildren;
		this.source = undefined;
		return this.copy(rightChildren);
	}
}
