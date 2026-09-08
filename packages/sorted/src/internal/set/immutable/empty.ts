import type { SortedSet } from '@rimbu/sorted/set';

import type { SortedSetContext } from '#set/context';

import { WithIndexedSortedCollectionEmptyBase } from '@rimbu/collection-types/advanced/collection/indexed-sorted-base';
import { WithValuedCollectionEmptyBase } from '@rimbu/collection-types/advanced/collection/valued-base';
import { CollectionEmptyConstructor } from '@rimbu/collection-types/advanced/collection-base';
import { Stream } from '@rimbu/stream';

const EmptyBase = WithIndexedSortedCollectionEmptyBase(
	WithValuedCollectionEmptyBase(CollectionEmptyConstructor),
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

	streamSliceIndex(): Stream<T> {
		return Stream.empty();
	}

	toBuilder() {
		return this.context.builder();
	}

	mutate(f: (builder: SortedSet.Builder<T>) => void): SortedSet<T> {
		const builder = this.context.builder();
		f(builder);
		return builder.build();
	}
}
