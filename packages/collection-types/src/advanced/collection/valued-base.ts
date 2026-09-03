import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
import type { RelatedTo } from '@rimbu/common';

import {
	type ApiMixin,
	CollectionBuilderBase,
	type CollectionEmptyBase,
	CollectionNonEmptyBase,
	type Constructor,
} from '@rimbu/collection-types/advanced/collection-base';
import { Stream, type StreamSource } from '@rimbu/stream';

export interface ValuedCollectionEmptyBase<
	E,
	Tp extends Collection.Advanced.TypesBase,
> extends ValuedCollection.Advanced.Api<E, Tp>,
		Collection.Capability.WithAdd.Api<E, Tp>,
		Collection.Capability.WithFlatMap.Api<E, Tp>,
		Collection.Capability.WithMap.Api<E, Tp>,
		Collection.Capability.WithRecompose.Api<E, Tp>,
		ValuedCollection.Capability.WithDifferenceAndIntersection.Api<E, Tp>,
		ValuedCollection.Capability.WithSymmetricDifferenceAndUnion.Api<E, Tp>,
		ValuedCollection.Capability.WithRemove.Api<E, Tp> {}

export interface ValuedEmptyMixin extends ApiMixin {
	_API: ValuedCollectionEmptyBase<this['_E'], this['_TP']>;
}

/**
 * Adds the valued-collection API to an empty collection base constructor.
 */
export function WithValuedCollectionEmptyBase<C extends ApiMixin>(
	Base: ApiMixin.Constructor<C>,
): ApiMixin.Constructor<C & ValuedEmptyMixin>;
export function WithValuedCollectionEmptyBase<
	TBase extends Constructor<CollectionEmptyBase<E, FAM, Tp>>,
	E,
	FAM extends Collection.Advanced.Family<E> = Collection.Advanced.Family<E>,
	Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
		FAM,
		E
	>,
>(Base: TBase): TBase & Constructor<ValuedCollectionEmptyBase<E, Tp>> {
	return class extends Base {
		has(): false {
			return false;
		}

		get add() {
			return this.context.of;
		}

		get addAll() {
			return this.context.from;
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

		flatMap(): FAM['_NORMAL'] {
			return this;
		}

		flatMapIndexed(): FAM['_NORMAL'] {
			return this;
		}

		recompose<E2 extends FAM['_UPPER_E']>(
			f: (stream: Stream<E>) => StreamSource<E2>,
		): Collection.Advanced.ReTypeFam<FAM, E2>['_NORMAL'] {
			return this.context.from(f(Stream.empty()));
		}

		remove(): FAM['_NORMAL'] {
			return this;
		}

		removeAll(): FAM['_NORMAL'] {
			return this;
		}

		difference(): FAM['_NORMAL'] {
			return this;
		}

		intersection(): FAM['_NORMAL'] {
			return this;
		}

		symmetricDifference(other: StreamSource<E>): FAM['_NORMAL'] {
			return this.context.from(other);
		}

		union(other: StreamSource<E>): FAM['_NON_EMPTY'] {
			return this.context.from(other) as FAM['_NON_EMPTY'];
		}
	};
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
