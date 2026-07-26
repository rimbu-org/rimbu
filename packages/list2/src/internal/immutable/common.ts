import type { Stream } from '@rimbu/stream';

import type { BlockBuilder, InnerBuilder } from '#list/mutable/common';

interface ListCommon<T> {
	readonly size: number;
	get(index: number): T;
	stream(options?: { reversed?: boolean | undefined }): Stream.NonEmpty<T>;
	forEach(f: (value: T) => void): void;
}

export interface Block<T, C = unknown> extends ListCommon<T> {
	readonly _self: Block<T, C>;

	map<T2>(f: (element: T) => T2): Block<T2, any>;

	prependBlockChild(child: C): this['_self'];
	appendBlockChild(child: C): this['_self'];
	toBuilder(): BlockBuilder<T, any>;
}

export interface Inner<T, C extends Block<T>> extends ListCommon<T> {
	toBuilder(): InnerBuilder<T, any>;
	map<T2>(f: (element: T) => T2): Inner<T2, any>;
}

export interface Tree<T, C extends Block<T> = Block<T>> extends ListCommon<T> {
	readonly left: C;
	readonly right: C;
	readonly middle: Inner<T, C> | null;
}
