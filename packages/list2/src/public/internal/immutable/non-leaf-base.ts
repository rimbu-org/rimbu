import type { Stream } from '@rimbu/stream';

import type { ListContext } from '#list/context-module';

export abstract class NonLeafBase<T> {
	constructor(
		readonly context: ListContext,
		readonly ops = context.leafChildrenOps,
	) {}

	abstract get itemsLength(): number;
	abstract get(index: number): T;
	abstract stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
}
