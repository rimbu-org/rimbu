import type { ArrayNonEmpty } from '@rimbu/common';
import type { List, OpWithResult } from '@rimbu/list';
import type { StreamSource } from '@rimbu/stream';

import type { ListContext } from '#list/context';

import { IndexedCollectionEmptyBase } from '@rimbu/collection-types/advanced/capabilities/base';

export class ListEmptyBase<T>
	extends IndexedCollectionEmptyBase<T>
	implements List<T>
{
	constructor(readonly context: ListContext<T>) {
		super();
	}

	get #ops() {
		return this.context.childrenOps;
	}

	setAt(): OpWithResult<List<T>, [oldValue: T | undefined], false> {
		return [this, [false, undefined], false];
	}

	updateAt(): OpWithResult<
		List<T>,
		[oldValue: T | undefined, newValue: T | undefined],
		false
	> {
		return [this, [false, undefined, undefined], false];
	}

	prepend(element: T): List.NonEmpty<T> {
		return this.context.outerBlockLeftRight(this.#ops.of([element]));
	}

	append(element: T): List.NonEmpty<T> {
		return this.context.outerBlockLeftRight(this.#ops.of([element]));
	}

	concat(...sources: ArrayNonEmpty<StreamSource<T>>): List.NonEmpty<T> {
		if (sources.length === 0) return this as any;

		return this.context.from(...sources) as any;
	}

	placeAt(_: number, element: T): List.NonEmpty<T> {
		return this.context.outerBlockLeftRight(this.#ops.of([element]));
	}

	reversed(): List<T> {
		return this;
	}
}
