import type {
	AbstractConstructor,
	ApiMixin,
	CollectionEmpty,
	CollectionNonEmpty,
} from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';

import { Stream, type StreamSource } from '@rimbu/stream';

export namespace ValuedCollectionEmpty {
	export interface Base<E, Tp extends Collection.Advanced.TypesBase>
		extends ValuedCollection.Advanced.Api<E, Tp>,
			Collection.Capability.WithAdd.Api<E, Tp>,
			Collection.Capability.WithAddAll.Api<E, Tp>,
			Collection.Capability.WithFlatMap.Api<E, Tp>,
			Collection.Capability.WithFlatMapIndexed.Api<E, Tp>,
			Collection.Capability.WithMap.Api<E, Tp>,
			Collection.Capability.WithMapIndexed.Api<E, Tp>,
			Collection.Capability.WithRecompose.Api<E, Tp>,
			ValuedCollection.Capability.WithDifference.Api<E, Tp>,
			ValuedCollection.Capability.WithIntersection.Api<E, Tp>,
			ValuedCollection.Capability.WithSymmetricDifference.Api<E, Tp>,
			ValuedCollection.Capability.WithUnion.Api<E, Tp>,
			ValuedCollection.Capability.WithRemove.Api<E, Tp>,
			ValuedCollection.Capability.WithRemoveAll.Api<E, Tp> {}

	export interface Mixin extends ApiMixin {
		_API: Base<this['_E'], this['_TP']>;
	}

	/**
	 * Adds the valued-collection API to an empty collection base constructor.
	 */
	export function WithMixin<C extends ApiMixin>(
		Base: ApiMixin.AbstractEmptyConstructor<C>,
	): ApiMixin.AbstractEmptyConstructor<C & Mixin>;
	export function WithMixin<
		TBase extends AbstractConstructor<CollectionEmpty.Base<E, Tp>>,
		E,
		FAM extends Collection.Advanced.Family<E> = Collection.Advanced.Family<E>,
		Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
			FAM,
			E
		>,
	>(Base: TBase) {
		abstract class Result extends Base implements Base<E, Tp> {
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
		}

		return Result;
	}
}

export namespace ValuedCollectionNonEmpty {
	export interface Base<
		E,
		Tp extends Collection.Advanced.TypesNonEmpty<
			Collection.Advanced.Family<E>,
			E
		>,
	> extends ValuedCollection.Advanced.Api<E, Tp>,
			Collection.Capability.WithMutate.Api<E, Tp>,
			Collection.Capability.WithRecompose.Api<E, Tp>,
			Collection.Capability.WithToBuilder.Api<E, Tp> {}

	export interface Mixin extends ApiMixin {
		_API: Base<this['_E'], this['_TP']>;

		_TP: Collection.Advanced.TypesNonEmpty<
			Collection.Advanced.Family<this['_E']>,
			this['_E']
		>;
	}

	export function WithMixin<C extends ApiMixin>(
		Base: ApiMixin.AbstractNonEmptyConstructor<C>,
	): ApiMixin.AbstractNonEmptyConstructor<C & Mixin>;
	export function WithMixin<
		TBase extends AbstractConstructor<CollectionNonEmpty.Base<E, Tp>>,
		E,
		Tp extends Collection.Advanced.TypesNonEmpty<
			ValuedCollection.Advanced.Family<E>,
			E
		> = Collection.Advanced.TypesNonEmpty<
			ValuedCollection.Advanced.Family<E>,
			E
		>,
	>(Base: TBase): TBase & AbstractConstructor<Base<E, Tp>> {
		abstract class Result extends Base {
			abstract has: <UE>(value: UE) => boolean;
			abstract toBuilder(): Tp['_BUILDER'];

			recompose<E2 extends Tp['_UPPER_E']>(
				f: (stream: Tp['_AS_STREAM']) => StreamSource<E2>,
			): Collection.Advanced.ReTyped<Tp, E2>['_NON_EMPTY'] {
				return this.context.from(f(this.stream())) as any;
			}

			mutate(f: (builder: Tp['_BUILDER']) => void): Tp['_NORMAL'] {
				const builder = this.toBuilder();
				f(builder);
				return builder.build();
			}
		}

		return Result;
	}
}

// export abstract class ValuedCollectionBuilderBase<
// 		E,
// 		FAM extends
// 			ValuedCollection.Advanced.Family<E> = ValuedCollection.Advanced.Family<E>,
// 		Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
// 			FAM,
// 			E
// 		>,
// 	>
// 	extends CollectionBuilderBase<E, FAM, Tp>
// 	implements ValuedCollection.Advanced.BuilderApi<E, Tp>
// {
// 	abstract has<UE = E>(value: RelatedTo<E, UE>): boolean;
// }
