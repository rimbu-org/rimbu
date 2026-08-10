import type { Int } from '@rimbu/base';

import type { ListContext } from '#list/context';
import type { OuterTree } from '#list/immutable/outer-tree';
import type { InnerBuilder, OuterBuilder } from '#list/mutable/common';
import type { OuterBlockBuilder } from '#list/mutable/outer-block-builder';

import { CacheMap } from '#list/immutable/cache-map';
import { TreeBuilderBase } from '#list/mutable/tree-builder-base';

export class OuterTreeBuilder<T>
	extends TreeBuilderBase<T, T>
	implements OuterBuilder<T>
{
	constructor(
		readonly context: ListContext<T>,
		source?: OuterTree<T>,
		_left?: OuterBlockBuilder<T>,
		_right?: OuterBlockBuilder<T>,
		_middle?: InnerBuilder<T, OuterBlockBuilder<T>>,
		size: number = source?.size ?? 0,
	) {
		super();

		this.#source = source;
		this.#_left = _left;
		this.#_right = _right;
		this.#_middle = _middle;
		this.#size = size;
	}

	#source: OuterTree<T> | undefined;
	#_left: OuterBlockBuilder<T> | undefined;
	#_right: OuterBlockBuilder<T> | undefined;
	#_middle: InnerBuilder<T, OuterBlockBuilder<T>> | undefined;

	#size: number;

	get level(): number {
		return 0;
	}

	get size(): number {
		return this.#size;
	}

	set size(value: number) {
		this.#size = value;
	}

	get left(): OuterBlockBuilder<T> {
		return this.#_left!;
	}

	set left(value: OuterBlockBuilder<T>) {
		this.#_left = value;
	}

	get right(): OuterBlockBuilder<T> {
		return this.#_right!;
	}

	set right(value: OuterBlockBuilder<T>) {
		this.#_right = value;
	}

	get middle(): InnerBuilder<T, OuterBlockBuilder<T>> | undefined {
		return this.#_middle;
	}

	set middle(value: InnerBuilder<T, OuterBlockBuilder<T>> | undefined) {
		this.#_middle = value;
	}

	prepareMutate(): void {
		if (undefined === this.#source) return;

		this.#_left = this.context.outerBlockBuilderSource(this.#source.left);
		this.#_right = this.context.outerBlockBuilderSource(this.#source.right);
		this.#_middle =
			null === this.#source.middle
				? undefined
				: this.#source.middle.toNodeBuilder();
		this.#source = undefined;
	}

	get(index: Int.AtLeastZero): T {
		if (undefined !== this.#source) {
			return this.#source._get(index);
		}

		return super.get(index);
	}

	getChildSize(): 1 {
		return 1;
	}

	prependBlockChild(block: OuterBlockBuilder<T>, child: T): void {
		block.prepend(child);
	}

	appendBlockChild(block: OuterBlockBuilder<T>, child: T): void {
		block.append(child);
	}

	dropBlockFirstChild(block: OuterBlockBuilder<T>): T {
		return block.dropFirstChild();
	}

	dropBlockLastChild(block: OuterBlockBuilder<T>): T {
		return block.dropLastChild();
	}

	createBlockBuilder(child: T): OuterBlockBuilder<T> {
		return this.context.outerBlockBuilder(this.context.childrenOps.of([child]));
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

	prependChild(child: T): void {
		this.prepend(child);
	}

	appendChild(child: T): void {
		this.append(child);
	}

	build(): OuterTree<T> {
		if (undefined !== this.#source) return this.#source;

		return this.context.outerTree(
			this.left.build(),
			this.right.build(),
			this.middle?.build() ?? null,
			this.#size,
		);
	}

	buildMap<T2>(f: (element: T) => T2): OuterTree<T2> {
		if (undefined !== this.#source) return this.#source.map(f);

		const cacheMap = new CacheMap();

		return this.context.outerTree(
			this.left.buildMap(f, cacheMap),
			this.right.buildMap(f, cacheMap),
			this.middle?.buildMap(f, cacheMap) ?? null,
			this.#size,
		);
	}

	_repairSingleChildLeftSpine(): void {}

	_repairSingleChildRightSpine(): void {}

	normalized(): OuterBuilder<T> | undefined {
		if (this.#size <= 0) return undefined;

		if (undefined === this.middle) {
			const totalChildren = this.left.nrChildren + this.right.nrChildren;

			if (totalChildren <= this.context.maxBlockSize) {
				this.left.appendFrom(this.right);
				return this.left;
			}
		} else if (this.#size <= this.context.maxBlockSize * 2) {
			// tree is small enough to fit in a single block — rebuild it to
			// drop the middle
			const firstMiddleChild = this.middle.firstChild();
			const lastMiddleChild = this.middle.lastChild();
			this.left.appendFrom(this.middle.firstChild());
			if (firstMiddleChild !== lastMiddleChild) {
				this.left.appendFrom(this.middle.lastChild());
			}
			this.left.appendFrom(this.right);

			return this.left.normalized();
		}

		return this;
	}

	_verifyStructure(errors: string[] = []): string[] {
		if (undefined !== this.#source) {
			return this.#source._verifyStructure(errors);
		}

		if (this.size <= this.context.maxBlockSize) {
			errors.push(
				`OuterTreeBuilder size ${this.size} is less than or equal to maxBlockSize ${this.context.maxBlockSize}, should be an OuterBlockBuilder`,
			);
		}

		if (this.middle) {
			if (this.middle.level !== 1) {
				errors.push(
					`OuterTreeBuilder has middle with wrong level: ${this.middle.level} != 1`,
				);
			}
			if (this.size <= this.context.maxBlockSize * 2) {
				errors.push(
					`OuterTreeBuilder size ${this.size} is less than or equal to 2 * maxBlockSize ${this.context.maxBlockSize * 2} but has a middle.`,
				);
			}
		}

		return super._verifyStructure(errors);
	}
}
