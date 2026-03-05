import type { CacheMap } from '#list/immutable/cache-map';

export interface Block<T> {
	readonly itemsLength: number;
	get(index: number): T;
	reversed(cacheMap?: CacheMap | undefined): Block<T>;
	_structure(): string;
}

export interface NonLeaf<T> {
	readonly itemsLength: number;
	get(index: number): T;
	prependChild(child: Block<T>): NonLeaf<T>;
	appendChild(child: Block<T>): NonLeaf<T>;
	reversed(cacheMap?: CacheMap | undefined): NonLeaf<T>;
	_structure(): string;
}

export type Tree<N, TM> = {
	readonly left: N;
	readonly right: N;
	readonly middle: TM | null;
};
