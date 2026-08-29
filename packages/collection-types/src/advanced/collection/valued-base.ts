import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
import type { RelatedTo } from '@rimbu/common';

import {
	CollectionBuilderBase,
	CollectionEmptyBase,
	CollectionNonEmptyBase,
} from '@rimbu/collection-types/advanced/collection-base';
import { Stream, type StreamSource } from '@rimbu/stream';

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
	implements
		ValuedCollection.Advanced.Api<E, Tp>,
		Collection.Capability.WithFlatMap.Api<E, Tp>,
		Collection.Capability.WithMap.Api<E, Tp>,
		Collection.Capability.WithMutate.Api<E, Tp>,
		Collection.Capability.WithRecompose.Api<E, Tp>
{
	has(): false {
		return false;
	}

	map<E2 extends FAM['_UPPER_E']>(
		_f: (element: E) => E2,
	): Collection.Advanced.ReTyped<Tp, E2>['_SELF'] {
		return this as any;
	}

	mapIndexed<E2 extends FAM['_UPPER_E']>(
		_f: (element: E, index: number) => E2,
	): Collection.Advanced.ReTyped<Tp, E2>['_SELF'] {
		return this as any;
	}

	flatMap(): this {
		return this;
	}

	flatMapIndexed(): this {
		return this;
	}

	recompose<E2 extends FAM['_UPPER_E']>(
		f: (stream: Stream<E>) => StreamSource<E2>,
	): Collection.Advanced.ReTypeFam<FAM, E2>['_NORMAL'] {
		return this.context.from(f(Stream.empty()));
	}

	mutate(f: (builder: FAM['_BUILDER']) => void): FAM['_NORMAL'] {
		const builder = this.context.builder<E>();
		f(builder);
		return builder.build();
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
