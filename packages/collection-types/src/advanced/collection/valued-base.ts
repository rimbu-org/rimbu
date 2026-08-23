import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
import type { RelatedTo } from '@rimbu/common';

import {
	CollectionBuilderBase,
	CollectionEmptyBase,
	CollectionNonEmptyBase,
} from '@rimbu/collection-types/advanced/collection-base';

export abstract class ValuedCollectionEmptyBase<
		E,
		FAM extends
			ValuedCollection.Advanced.Family<E> = ValuedCollection.Advanced.Family<E>,
		Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
			FAM,
			E
		>,
	>
	extends CollectionEmptyBase<E, FAM, Tp>
	implements ValuedCollection.Advanced.Api<E, Tp>
{
	has(): false {
		return false;
	}
}

export abstract class ValuedCollectionNonEmptyBase<
		E,
		FAM extends
			ValuedCollection.Advanced.Family<E> = ValuedCollection.Advanced.Family<E>,
		Tp extends Collection.Advanced.TypesNonEmpty<
			FAM,
			E
		> = Collection.Advanced.TypesNonEmpty<FAM, E>,
	>
	extends CollectionNonEmptyBase<E, FAM, Tp>
	implements ValuedCollection.Advanced.Api<E, Tp>
{
	abstract has<UE = E>(value: RelatedTo<E, UE>): boolean;
}

export abstract class ValuedCollectionBuilderBase<
		E,
		FAM extends
			ValuedCollection.Advanced.Family<E> = ValuedCollection.Advanced.Family<E>,
		Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
			FAM,
			E
		>,
	>
	extends CollectionBuilderBase<E, FAM, Tp>
	implements ValuedCollection.Advanced.BuilderApi<E, Tp>
{
	abstract has<UE = E>(value: RelatedTo<E, UE>): boolean;
}
