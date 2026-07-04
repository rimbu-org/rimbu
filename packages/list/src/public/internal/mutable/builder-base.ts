import type { TraverseState } from '@rimbu/common/traverse-state';

import type { ListContext } from '#list/context-module';
import type { InnerBlock } from '#list/immutable/inner-block';
import type { OuterBlock } from '#list/immutable/outer-block';
import type { Block, Inner } from '#list/immutable/utils';
import type { ListImpl } from '#list/list-impl';
import type { InnerBlockBuilder } from '#list/mutable/inner-block-builder';
import type { OuterBlockBuilder } from '#list/mutable/outer-block-builder';

export interface BuilderCommon<T> {
	get length(): number;
	get(index: number): T;
	updateAt(index: number, update: (current: T) => T): T;
	insert(index: number, value: T): void;
	remove(index: number): T;
	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { reversed: boolean; state: TraverseState },
	): void;
	_verifyStructure(
		messages?: string[] | undefined,
		enforceMinChildren?: boolean | undefined,
	): string[];
}

export interface OuterBuilder<T> extends BuilderCommon<T> {
	prepend(value: T): void;
	append(value: T): void;
	build(): ListImpl<T>;
	buildMap<T2>(f: (value: T) => T2): ListImpl<T2>;
	normalized(): OuterBuilder<T> | undefined;
}

export interface InnerBuilder<T, C extends BlockBuilder<T> = BlockBuilder<T>>
	extends BuilderCommon<T> {
	prependChild(child: C): void;
	appendChild(child: C): void;
	firstChild(): C;
	lastChild(): C;
	dropFirstChild(): C;
	dropLastChild(): C;
	modifyFirstChild(f: (child: C) => number | undefined): void;
	modifyLastChild(f: (child: C) => number | undefined): void;
	build(): Inner<T, any>;
	buildMap<T2>(f: (value: T) => T2): Inner<T2, any>;
	normalized(): InnerBuilder<T, C> | undefined;
}

export interface BlockBuilder<T, C = unknown> extends BuilderCommon<T> {
	get length(): number;
	get nrChildren(): number;
	get canAddChild(): boolean;
	get canRemoveChild(): boolean;
	get childrenInMax(): boolean;
	get childrenInMin(): boolean;
	prependItems(other: BlockBuilder<T, C>): void;
	appendItems(other: BlockBuilder<T, C>): void;
	splitRight(index?: number): BlockBuilder<T, C>;
	dropFirstChild(): C;
	dropLastChild(): C;
	prependChild(child: C): void;
	appendChild(child: C): void;
	build(): Block<T, any>;
	buildMap<T2>(f: (value: T) => T2): Block<T2, any>;
}

export abstract class BuilderBase {
	constructor(
		readonly context: ListContext,
		readonly ops = context.outerChildrenOps,
	) {}
}

export type ToMutable<C extends Block<any>> =
	C extends Block<infer T>
		? C extends OuterBlock<T>
			? OuterBlockBuilder<T>
			: C extends InnerBlock<T, infer CC>
				? InnerBlockBuilder<T, ToMutable<CC>>
				: BlockBuilder<T>
		: never;

export type ToImmutable<C extends BlockBuilder<any>> =
	C extends BlockBuilder<infer T>
		? C extends OuterBlockBuilder<T>
			? OuterBlock<T>
			: C extends InnerBlockBuilder<T, infer CC>
				? InnerBlock<T, ToImmutable<CC>>
				: Block<T>
		: never;
