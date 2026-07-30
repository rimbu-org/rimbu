import type { Int } from '@rimbu/base';

import type { ListContext } from '#list/context';
import type { Inner } from '#list/immutable/common';
import type { InnerTree } from '#list/immutable/inner-tree';
import type { BlockBuilder, InnerBuilder } from '#list/mutable/common';
import type { InnerBlockBuilder } from '#list/mutable/inner-block-builder';

import { TreeBuilderBase } from '#list/mutable/tree-builder-base';

export class InnerTreeBuilder<T, C extends BlockBuilder<T>>
	extends TreeBuilderBase<T, C>
	implements InnerBuilder<T, C>
{
	constructor(
		readonly context: ListContext<T>,
		readonly level: number,
		source?: InnerTree<T, any>,
		_left?: InnerBlockBuilder<T, C>,
		_right?: InnerBlockBuilder<T, C>,
		_middle?: InnerBuilder<T, InnerBlockBuilder<T, C>>,
		size: number = source?.size ?? 0,
	) {
		super();

		this.#source = source;
		this.#_left = _left;
		this.#_right = _right;
		this.#_middle = _middle;
		this.#size = size;
	}

	#source: InnerTree<T, any> | undefined;
	#_left: InnerBlockBuilder<T, C> | undefined;
	#_right: InnerBlockBuilder<T, C> | undefined;
	#_middle: InnerBuilder<T, InnerBlockBuilder<T, C>> | undefined;
	#size: number;

	get left(): InnerBlockBuilder<T, C> {
		return this.#_left!;
	}

	set left(value: InnerBlockBuilder<T, C>) {
		this.#_left = value;
	}

	get right(): InnerBlockBuilder<T, C> {
		return this.#_right!;
	}

	set right(value: InnerBlockBuilder<T, C>) {
		this.#_right = value;
	}

	get middle(): InnerBuilder<T, InnerBlockBuilder<T, C>> | undefined {
		return this.#_middle;
	}

	set middle(value: InnerBuilder<T, InnerBlockBuilder<T, C>> | undefined) {
		this.#_middle = value;
	}

	get size(): number {
		return this.#size;
	}

	set size(value: number) {
		this.#size = value;
	}

	prepareMutate(): void {
		if (undefined === this.#source) return;

		this.#_left = this.#source.left.toBuilder();
		this.#_right = this.#source.right.toBuilder();
		this.#_middle =
			null === this.#source.middle
				? undefined
				: this.#source.middle.toBuilder();
		this.#source = undefined;
	}

	getChildSize(child: C): number {
		return child.size;
	}

	prependBlockChild(block: InnerBlockBuilder<T, C>, child: C): void {
		block.prependChild(child);
	}

	appendBlockChild(block: InnerBlockBuilder<T, C>, child: C): void {
		block.appendChild(child);
	}

	dropBlockFirstChild(block: InnerBlockBuilder<T, C>): C {
		return block.dropFirstChild();
	}

	dropBlockLastChild(block: InnerBlockBuilder<T, C>): C {
		return block.dropLastChild();
	}

	createBlockBuilder(child: C): InnerBlockBuilder<T, C> {
		return this.context.innerBlockBuilder([child], child.size, this.level);
	}

	get(index: Int.AtLeastZero): T {
		if (undefined !== this.#source) {
			return this.#source._get(index);
		}

		return super.get(index);
	}

	forEach(f: (element: T) => void): void {
		if (undefined !== this.#source) {
			this.#source.forEach(f);
			return;
		}

		this.left.forEach(f);
		this.middle?.forEach?.(f);
		this.right.forEach(f);
	}

	prependChild(child: C): void {
		this.prepend(child);
	}

	appendChild(child: C): void {
		this.append(child);
	}

	firstChild(): C {
		this.prepareMutate();
		return this.left.firstChild();
	}

	lastChild(): C {
		this.prepareMutate();
		return this.right.lastChild();
	}

	dropFirstChild(): C {
		this.prepareMutate();
		const child = this.left.dropFirstChild();
		this.#size -= child.size;
		return child;
	}

	dropLastChild(): C {
		this.prepareMutate();
		const child = this.right.dropLastChild();
		this.#size -= child.size;
		return child;
	}

	modifyFirstChild(f: (child: C) => number | undefined): number | undefined {
		this.prepareMutate();
		const delta = this.left.modifyFirstChild(f);
		if (undefined !== delta) {
			this.#size += delta;
		}
		return delta;
	}

	modifyLastChild(f: (child: C) => number | undefined): number | undefined {
		this.prepareMutate();
		const delta = this.right.modifyLastChild(f);
		if (undefined !== delta) {
			this.#size += delta;
		}
		return delta;
	}

	build(): Inner<T, any> {
		if (undefined !== this.#source) return this.#source;

		return this.context.innerTree<T, any>(
			this.left.build(),
			this.right.build(),
			this.middle?.build() ?? null,
			this.#size,
			this.level,
		);
	}

	buildMap<T2>(f: (value: T) => T2): Inner<T2, any> {
		if (undefined !== this.#source) return this.#source.map(f);

		return this.context.innerTree(
			this.left.buildMap(f),
			this.right.buildMap(f),
			null,
			this.#size,
			this.level,
		);
	}

	normalized(): InnerBuilder<T, C> | undefined {
		if (this.#size <= 0) return undefined;

		if (undefined === this.middle) {
			const totalChildren = this.left.nrChildren + this.right.nrChildren;

			if (totalChildren <= this.context.maxBlockSize) {
				this.left.appendFrom(this.right);
				return this.left;
			}
		}

		return this;
	}
}
