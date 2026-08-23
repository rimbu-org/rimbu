import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
// biome-ignore lint/correctness/noUnusedImports: TypesKey is used as a computed property key, which Biome does not detect
import type { TypesKey } from '@rimbu/collection-types/types';
import type { RelatedTo } from '@rimbu/common';

import {
	CollectionBuilderBase,
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
	declare readonly [TypesKey]: ValuedCollectionEmptyBaseCapabilities<E>;
	abstract readonly context: ValuedCollection.Context<this[TypesKey]>;

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
	declare readonly [TypesKey]: ValuedCollectionNonEmptyBaseCapabilities<E>;
	abstract readonly context: ValuedCollection.Context<this[TypesKey]>;

	abstract has<UE = E>(value: RelatedTo<E, UE>): boolean;
}

export abstract class ValuedCollectionBuilderBase<E>
	extends CollectionBuilderBase<E>
	implements ValuedCollection.Builder<E>
{
	declare readonly [TypesKey]: ValuedCollectionEmptyBaseCapabilities<E>;
	abstract readonly context: ValuedCollection.Context<this[TypesKey]>;

	abstract has<UE = E>(value: RelatedTo<E, UE>): boolean;
}
