import type { OptLazy } from '@rimbu/common';
import type { List } from '@rimbu/list';

export interface OuterBuilder<T> {
	get size(): number;
	at<O>(index: number, otherwise?: OptLazy<O>): T | O;
	prepend(value: T): void;
	append(value: T): void;
	forEach(f: (value: T) => void): void;
	build(): List<T>;
	buildMap<T2>(f: (value: T) => T2): List<T2>;
	normalized(): OuterBuilder<T> | undefined;
}

export type InnerBuilder<T, C> = any;
