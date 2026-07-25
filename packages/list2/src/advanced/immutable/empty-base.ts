import type { List } from '@rimbu/list';

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

	prepend(element: T): List.NonEmpty<T> {
		return this.context.outerBlock(this.#ops.of([element]));
	}

	append(element: T): List.NonEmpty<T> {
		return this.context.outerBlock(this.#ops.of([element]));
	}

	placeAt(_: number, element: T): List.NonEmpty<T> {
		return this.context.outerBlock(this.#ops.of([element]));
	}
}
