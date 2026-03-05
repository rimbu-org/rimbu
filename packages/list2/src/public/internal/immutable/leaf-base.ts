import type { Stream } from '@rimbu/stream';

import type { ListContext } from '#list/context';

import { NonEmptyBase } from '@rimbu/collection-types/common/empty-base';

export abstract class LeafBase<T> extends NonEmptyBase<T> {
	constructor(
		readonly context: ListContext,
		readonly ops = context.leafChildrenOps,
	) {
		super();
	}

	stream(): Stream.NonEmpty<T> {
		throw new Error('Method not implemented.');
	}
}
