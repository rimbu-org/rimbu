import type { Int } from '@rimbu/base';
import type { List } from '@rimbu/list';

import type { Block, Inner } from '#list/immutable/common';

export interface BuilderCommon<T> {
	get size(): number;
	get(index: Int.AtLeastZero): T;
	forEach(f: (value: T) => void): void;
}

export interface OuterBuilder<T> extends BuilderCommon<T> {
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
	firstChild(): C;
	lastChild(): C;
	dropFirstChild(): C;
	dropLastChild(): C;
	modifyFirstChild(f: (child: C) => number | undefined): number | undefined;
	modifyLastChild(f: (child: C) => number | undefined): number | undefined;
	build(): Inner<T, any>;
	buildMap<T2>(f: (value: T) => T2): Inner<T2, any>;
	normalized(): InnerBuilder<T, C> | undefined;
}

export interface BlockBuilder<T> extends BuilderCommon<T> {
	get nrChildren(): number;
	get canAddChild(): boolean;
	get canRemoveChild(): boolean;
	get childrenInMax(): boolean;
	get childrenInMin(): boolean;
	prependItems(other: BlockBuilder<T>): void;
	appendItems(other: BlockBuilder<T>): void;
	build(): Block<T>;
	buildMap<T2>(f: (value: T) => T2): Block<T2>;
}
