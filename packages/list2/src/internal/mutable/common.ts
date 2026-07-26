import type { OptLazy } from '@rimbu/common';
import type { List } from '@rimbu/list';

import type { Block, Inner } from '#list/immutable/common';

export interface BuilderCommon<T> {
	get size(): number;
	get(index: number): T;
	forEach(f: (value: T) => void): void;
}

export interface OuterBuilder<T> extends BuilderCommon<T> {
	at<O>(index: number, otherwise?: OptLazy<O>): T | O;
	prepend(value: T): void;
	append(value: T): void;
	build(): List<T>;
	buildMap<T2>(f: (value: T) => T2): List<T2>;
	normalized(): OuterBuilder<T> | undefined;
}

export interface InnerBuilder<T, C extends BlockBuilder<T> = BlockBuilder<T>>
	extends BuilderCommon<T> {
	prependChild(child: C): void;
	appendChild(child: C): void;
	modifyFirstChild(f: (child: C) => number | undefined): void;
	modifyLastChild(f: (child: C) => number | undefined): void;
	build(): Inner<T, any>;
	normalized(): InnerBuilder<T, C> | undefined;
}

export interface BlockBuilder<T, C = unknown> extends BuilderCommon<T> {
	get nrChildren(): number;
	get canAddChild(): boolean;
	get canRemoveChild(): boolean;
	get childrenInMax(): boolean;
	get childrenInMin(): boolean;
	prependItems(other: BlockBuilder<T, C>): void;
	appendItems(other: BlockBuilder<T, C>): void;
	build(): Block<T, any>;
}
