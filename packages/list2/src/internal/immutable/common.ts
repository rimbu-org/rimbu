import type { InnerBlock } from '#list/immutable/inner-block';
import type { InnerTree } from '#list/immutable/inner-tree';
import type { BlockBuilder } from '#list/mutable/common';

interface ListCommon<T> {
	get(index: number): T;
}

export interface Block<T, C = unknown> extends ListCommon<T> {
	readonly _self: Block<T, C>;

	readonly size: number;
	prependBlockChild(child: C): this['_self'];
	appendBlockChild(child: C): this['_self'];
	forEach(f: (value: T) => void): void;
	toBuilder(): BlockBuilder<T, any>;
}

export type Inner<T, C extends Block<T>> = InnerBlock<T, C> | InnerTree<T, C>;
