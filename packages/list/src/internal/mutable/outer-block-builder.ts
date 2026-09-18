import type { OuterChildren } from '#advanced/children-ops';
import type { ListContext } from '#list/context';
import type { OuterBlock } from '#list/immutable/outer-block';
import type { BlockBuilder, OuterBuilder } from '#list/mutable/common';

import { type Int, throwInvalidUsageError } from '@rimbu/base';

import { CacheMap } from '#list/immutable/cache-map';

export class OuterBlockBuilder<T>
	implements OuterBuilder<T>, BlockBuilder<T, T>
{
	constructor(
		readonly context: ListContext,
		source?: OuterBlock<T>,
		children?: OuterChildren<T>,
	) {
		if (undefined === source && undefined === children) {
			throwInvalidUsageError('Either source or children must be defined');
		}
		if (undefined !== source && undefined !== children) {
			throwInvalidUsageError(
				'Either source or children must be defined, but not both',
			);
		}

		this.#source = source;
		this.#_children = children;
	}

	declare _self: OuterBlockBuilder<T>;

	#source: OuterBlock<T> | undefined;
	#_children: OuterChildren<T> | undefined;

	get #ops() {
		return this.context.childrenOps;
	}

	get #children(): OuterChildren<T> {
		return this.#_children as OuterChildren<T>;
	}

	set #children(value: OuterChildren<T>) {
		this.#_children = value;
	}

	get size(): number {
		return this.#source?.size ?? this.context.childrenOps.size(this.#children);
	}

	get nrChildren(): number {
		return this.size;
	}

	get canAddChild(): boolean {
		return this.nrChildren < this.context.maxBlockSize;
	}

	get canRemoveChild(): boolean {
		return this.nrChildren > this.context.minBlockSize;
	}

	get notTooManyChildren(): boolean {
		return this.nrChildren <= this.context.maxBlockSize;
	}

	get hasEnoughChildren(): boolean {
		return this.nrChildren >= this.context.minBlockSize;
	}

	#prepareMutate(): void {
		if (undefined === this.#source) return;

		this.#_children = this.#source._copyChildren();
		this.#source = undefined;
	}

	#copy(children: OuterChildren<T>): OuterBlockBuilder<T> {
		return this.context.outerBlockBuilder(children);
	}

	get(index: Int.AtLeastZero): T {
		if (undefined !== this.#source) {
			return this.#source._get(index);
		}

		return this.#ops.at(this.#children, index);
	}

	update(index: number, f: (element: T) => T): [previous: T, current: T] {
		this.#prepareMutate();
		const [newChildren, previous, current] = this.#ops.mutateUpdate(
			this.#children,
			index,
			f,
		);
		this.#children = newChildren;

		return [previous, current];
	}

	getChildSize(): number {
		return 1;
	}

	prepend(element: T): void {
		this.#prepareMutate();
		this.#children = this.#ops.mutatePrepend(this.#children, element);
	}

	append(element: T): void {
		this.#prepareMutate();
		this.#children = this.#ops.mutateAppend(this.#children, element);
	}

	insert(index: Int.AtLeastOne, element: T): void {
		this.#prepareMutate();

		const [newChildren] = this.#ops.mutateSplice(
			this.#children,
			index,
			0,
			this.#ops.of([element]),
		);
		this.#children = newChildren;
	}

	remove(index: Int.AtLeastZero): T {
		this.#prepareMutate();

		const [newChildren, removed] = this.#ops.mutateSplice(
			this.#children,
			index,
			1,
		);
		this.#children = newChildren;

		return this.#ops.at(removed, 0);
	}

	prependChild(child: T): void {
		this.prepend(child);
	}

	appendChild(child: T): void {
		this.append(child);
	}

	dropFirstChild(): T {
		this.#prepareMutate();
		const [newChildren, dropped] = this.#ops.mutateDropFirst(this.#children);
		this.#children = newChildren;
		return dropped;
	}

	dropLastChild(): T {
		this.#prepareMutate();
		const [newChildren, dropped] = this.#ops.mutateDropLast(this.#children);
		this.#children = newChildren;
		return dropped;
	}

	forEach(f: (element: T) => void): void {
		if (undefined !== this.#source) {
			this.#source.forEach(f);
			return;
		}

		this.#ops.forEach(this.#children, f);
	}

	build(): OuterBlock<T> {
		return (
			this.#source ??
			this.context.outerBlockLeftRight(this.#ops.safeCopy(this.#children))
		);
	}

	buildMap<T2>(
		f: (element: T) => T2,
		cacheMap = new CacheMap(),
	): OuterBlock<T2> {
		return (
			this.#source?.map(f, cacheMap) ??
			this.context.outerBlockLeftRight(this.#ops.map(this.#children, f))
		);
	}

	_verifyStructure(
		errors: string[] = [],
		enforceMinChildren = false,
	): string[] {
		if (undefined !== this.#source) {
			return this.#source._verifyStructure(errors, enforceMinChildren);
		}

		if (enforceMinChildren && !this.hasEnoughChildren) {
			errors.push(
				`OuterBlockBuilder has fewer children than allowed: ${this.nrChildren} < ${this.context.minBlockSize}`,
			);
		}
		if (!this.notTooManyChildren) {
			errors.push(
				`OuterBlockBuilder has more children than allowed: ${this.nrChildren} > ${this.context.maxBlockSize}`,
			);
		}

		return errors;
	}

	normalized(): OuterBuilder<T> | undefined {
		const length = this.size;

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

	splitRight(index = this.size >>> 1): OuterBlockBuilder<T> {
		this.#prepareMutate();

		const [newChildren, rightChildren] = this.#ops.mutateSplice(
			this.#children,
			index,
		);
		this.#children = newChildren;
		return this.#copy(rightChildren);
	}

	prependFrom(other: OuterBlockBuilder<T>): void {
		this.#prepareMutate();

		if (undefined !== other.#source) {
			this.#children = other.#source._concatChildren(this.#children);
		} else {
			this.#children = this.#ops.concat(other.#children, this.#children);
		}
	}

	appendFrom(other: OuterBlockBuilder<T>): void {
		this.#prepareMutate();

		if (undefined !== other.#source) {
			this.#children = other.#source._prependChildren(this.#children);
		} else {
			this.#children = this.#ops.concat(this.#children, other.#children);
		}
	}

	moveTo(other: OuterBlockBuilder<T>, count: number): void {
		this.#prepareMutate();
		other.#prepareMutate();

		const [newChildren, moved] = this.#ops.mutateSplice(this.#children, count);
		this.#children = newChildren;
		other.#children = this.#ops.concat(other.#children, moved);
	}

	moveFrom(other: OuterBlockBuilder<T>, count: number): void {
		this.#prepareMutate();
		other.#prepareMutate();

		const [newChildren, moved] = this.#ops.mutateSplice(other.#children, count);
		other.#children = newChildren;
		this.#children = this.#ops.concat(this.#children, moved);
	}
}
