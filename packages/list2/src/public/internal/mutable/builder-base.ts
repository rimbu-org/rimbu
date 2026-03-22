import type { ListContext } from '#list/context-module';
import type { NonLeaf } from '#list/immutable/utils';
import type { ListImpl } from '#list/list-impl';
import type { LeafBlockBuilder } from '#list/mutable/leaf-block-builder';

export interface LeafBuilder<T> {
	get length(): number;
	get(index: number): T;
	prepend(value: T): void;
	append(value: T): void;
	build(): ListImpl<T>;
	normalized(): LeafBuilder<T> | undefined;
}

export interface NonLeafBuilder<T> {
	get itemsLength(): number;
	get(index: number): T;
	appendChild(child: LeafBlockBuilder<T>): void;
	firstLeafBlockBuilder(): LeafBlockBuilder<T>;
	lastLeafBlockBuilder(): LeafBlockBuilder<T>;
	build(): NonLeaf<T>;
}

export abstract class BuilderBase<T> {
	constructor(
		readonly context: ListContext,
		readonly ops = context.leafChildrenOps,
	) {}
}
