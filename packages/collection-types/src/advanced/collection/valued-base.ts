import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
// biome-ignore lint/correctness/noUnusedImports: TypesKey is used as a computed property key, which Biome does not detect
import type { TypesKey } from '@rimbu/collection-types/types';
import type { RelatedTo } from '@rimbu/common';

import {
	CollectionEmptyBase,
	type CollectionEmptyBaseCapabilities,
	CollectionNonEmptyBase,
	type CollectionNonEmptyBaseCapabilities,
} from '@rimbu/collection-types/advanced/collection-base';

export type ValuedCollectionEmptyBaseCapabilities<E> =
	CollectionEmptyBaseCapabilities<E> & ValuedCollection.Advanced.Family<E>;

export abstract class ValuedCollectionEmptyBase<E>
	extends CollectionEmptyBase<E>
	implements ValuedCollection<E, ValuedCollectionEmptyBaseCapabilities<E>>
{
	declare readonly [TypesKey]: Collection.Advanced.InvariantTypes<
		Collection.Advanced.Types<ValuedCollectionEmptyBaseCapabilities<E>, E>,
		E
	>;

	has(): false {
		return false;
	}
}

export type ValuedCollectionNonEmptyBaseCapabilities<E> =
	CollectionNonEmptyBaseCapabilities<E> & ValuedCollection.Advanced.Family<E>;

export abstract class ValuedCollectionNonEmptyBase<E>
	extends CollectionNonEmptyBase<E>
	implements
		ValuedCollection.NonEmpty<E, ValuedCollectionNonEmptyBaseCapabilities<E>>
{
	declare readonly [TypesKey]: Collection.Advanced.InvariantTypes<
		Collection.Advanced.TypesNonEmpty<
			ValuedCollectionNonEmptyBaseCapabilities<E>,
			E
		>,
		E
	>;

	abstract has<E2 = E>(value: RelatedTo<E2, E>): boolean;
}
