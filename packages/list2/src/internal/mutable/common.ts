import type { Int } from '@rimbu/base';
import type { List } from '@rimbu/list';

import type { CacheMap } from '#list/immutable/cache-map';
import type { Block, Inner } from '#list/immutable/common';

export interface BuilderCommon<T, C> {
	get size(): number;
	get(index: Int.AtLeastZero): T;
	update(
		index: Int.AtLeastZero,
		f: (element: T) => T,
	): [previous: T, current: T];
	forEach(f: (element: T) => void): void;
	insert(index: Int.AtLeastZero, element: T): void;
	remove(index: Int.AtLeastZero): T;
	prependChild(child: C): void;
	appendChild(child: C): void;
}

export interface BlockBuilder<T, C = unknown> extends BuilderCommon<T, C> {
	get nrChildren(): number;
	get canAddChild(): boolean;
	get canRemoveChild(): boolean;
	get hasEnoughChildren(): boolean;
	get notTooManyChildren(): boolean;
	prependFrom(other: BlockBuilder<T, C>): void;
	appendFrom(other: BlockBuilder<T, C>): void;
	dropFirstChild(): C;
	dropLastChild(): C;
	splitRight(index?: number): BlockBuilder<T, C>;
	build(): Block<T>;
	buildMap<T2>(f: (element: T) => T2, cacheMap: CacheMap): Block<T2>;
}

export interface OuterBuilder<T> extends BuilderCommon<T, T> {
	prepend(element: T): void;
	append(element: T): void;
	build(): List<T>;
	buildMap<T2>(f: (element: T) => T2, cacheMap: CacheMap): List<T2>;
	normalized(): OuterBuilder<T> | undefined;
}

export interface InnerBuilder<T, C extends BlockBuilder<T>>
	extends BuilderCommon<T, C> {
	firstChild(): C;
	lastChild(): C;
	modifyFirstChild(f: (child: C) => number | undefined): number | undefined;
	modifyLastChild(f: (child: C) => number | undefined): number | undefined;
	dropFirstChild(): C;
	dropLastChild(): C;
	build(): Inner<T, any>;
	buildMap<T2>(f: (element: T) => T2, cacheMap: CacheMap): Inner<T2, any>;
	normalized(): InnerBuilder<T, C> | undefined;
}
