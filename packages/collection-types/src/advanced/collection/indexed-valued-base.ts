import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedValuedCollection } from '@rimbu/collection-types/collection/indexed-valued';
// biome-ignore lint/correctness/noUnusedImports: TypesKey is used as a computed property key, which Biome does not detect
import type { TypesKey } from '@rimbu/collection-types/types';

import {
	IndexedCollectionEmptyBase,
	IndexedCollectionNonEmptyBase,
} from '@rimbu/collection-types/advanced/collection/indexed-base';
import { OptLazy } from '@rimbu/common';

export abstract class IndexedValuedCollectionEmptyBase<T>
	extends IndexedCollectionEmptyBase<T>
	implements IndexedValuedCollection<T>
{
	declare readonly [TypesKey]: IndexedValuedCollection.Advanced.Types<T>;

	abstract readonly context: Collection.Advanced.ContextBase<
		IndexedValuedCollection.Advanced.Types<T>
	>;

	has(): false {
		return false;
	}

	indexOf<O>(_: T, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}
}

export abstract class IndexedValuedCollectionNonEmptyBase<T>
	extends IndexedCollectionNonEmptyBase<T>
	implements IndexedValuedCollection.NonEmpty<T>
{
	declare readonly [TypesKey]: IndexedValuedCollection.Advanced.TypesNonEmpty<T>;

	abstract readonly context: Collection.Advanced.ContextBase<
		IndexedValuedCollection.Advanced.TypesNonEmpty<T>
	>;

	abstract has(value: T): boolean;
	abstract indexOf<O>(value: T, otherwise?: OptLazy<O>): number | O;
}
