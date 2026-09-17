import type { SortedSet } from '@rimbu/sorted/set';

import type { SortedSetContext } from '#set/context';

import { IndexedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/indexed-base';
import { IndexedSortedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/indexed-sorted-base';
import { SortedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/sorted-base';
import { ValuedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/valued-base';
import { CollectionEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { Stream } from '@rimbu/stream';

const EmptyBase = IndexedSortedCollectionEmpty.WithMixin(
	SortedCollectionEmpty.WithMixin(
		IndexedCollectionEmpty.WithMixin(
			ValuedCollectionEmpty.WithMixin(CollectionEmpty.Constructor),
		),
	),
);

export class SortedSetEmpty<T = any>
	extends EmptyBase<T, T, SortedSet.Advanced.Family<T>>
	implements SortedSet<T>
{
	constructor(readonly context: SortedSetContext<T>) {
		super(context);
	}

	streamRange(): Stream<T> {
		return Stream.empty();
	}

	toBuilder(): SortedSet.Builder<T> {
		return this.context.builder();
	}

	mutate(f: (builder: SortedSet.Builder<T>) => void): SortedSet<T> {
		const builder = this.context.builder();
		f(builder);
		return builder.build();
	}
}
