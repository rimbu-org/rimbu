import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { RelatedTo } from '@rimbu/common';

import {
	type AbstractConstructor,
	type ApiMixin,
	type CollectionNonEmpty,
	defaultAddAll,
	defaultFlatMapByAddAll,
	defaultFlatMapIndexed,
} from '@rimbu/collection-types/advanced/collection-base';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

export namespace SetCollectionNonEmpty {
	export interface Implemented<
		E,
		Tp extends Collection.Advanced.TypesNonEmpty<
			Collection.Advanced.Family<E>,
			E
		>,
	> extends Collection.Advanced.Api<E, Tp>,
			Collection.Capability.WithAddAll.Api<E, Tp>,
			Collection.Capability.WithMapIndexed.Api<E, Tp>,
			Collection.Capability.WithFlatMap.Api<E, Tp>,
			Collection.Capability.WithFlatMapIndexed.Api<E, Tp>,
			ValuedCollection.Capability.WithRemove.Api<E, Tp>,
			ValuedCollection.Capability.WithRemoveAll.Api<E, Tp>,
			ValuedCollection.Capability.WithSymmetricDifference.Api<E, Tp>,
			ValuedCollection.Capability.WithUnion.Api<E, Tp>,
			ValuedCollection.Capability.WithDifference.Api<E, Tp>,
			ValuedCollection.Capability.WithIntersection.Api<E, Tp> {}

	abstract class RequiredClass<
		E,
		Tp extends Collection.Advanced.TypesNonEmpty<
			Collection.Advanced.Family<E>,
			E
		>,
	> implements
			Collection.Capability.WithAdd.Api<E, Tp>,
			Collection.Capability.WithMap.Api<E, Tp>,
			Collection.Capability.WithMutate.Api<E, Tp>,
			Collection.Capability.WithRecompose.Api<E, Tp>,
			Collection.Capability.WithToBuilder.Api<E, Tp>,
			ValuedCollection.Capability.WithRemove.Api<E, Tp>
	{
		abstract has<UE = E>(value: RelatedTo<E, UE>): boolean;
		abstract add(element: E): Tp['_NON_EMPTY'];
		abstract remove<UE = E>(element: RelatedTo<E, UE>): Tp['_NORMAL'];
		abstract map<E2 extends Tp['_UPPER_E']>(
			f: (element: E) => E2,
		): Collection.Advanced.ReTyped<Tp, E2>['_SELF'];
		abstract recompose<E2 extends Tp['_UPPER_E']>(
			f: (stream: Tp['_AS_STREAM']) => StreamSource.NonEmpty<E2>,
		): Collection.Advanced.ReTyped<Tp, E2>['_SELF'];
		abstract recompose<E2 extends Tp['_UPPER_E']>(
			f: (stream: Tp['_AS_STREAM']) => StreamSource<E2>,
		): Collection.Advanced.ReTyped<Tp, E2>['_NORMAL'];
		abstract mutate(f: (builder: Tp['_BUILDER']) => void): Tp['_NORMAL'];
		abstract toBuilder(): Tp['_BUILDER'];
	}

	export type Required<
		E,
		Tp extends Collection.Advanced.TypesNonEmpty<
			Collection.Advanced.Family<E>,
			E
		>,
	> = RequiredClass<E, Tp>;

	export interface ApiBase<
		E,
		Tp extends Collection.Advanced.TypesNonEmpty<
			Collection.Advanced.Family<E>,
			E
		>,
	> extends Implemented<E, Tp>,
			RequiredClass<E, Tp> {}

	export interface Mixin extends ApiMixin {
		_API: ApiBase<this['_E'], this['_TP']>;

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
		FAM extends
			SetCollection.Advanced.Family<E> = SetCollection.Advanced.Family<E>,
		Tp extends Collection.Advanced.TypesNonEmpty<
			FAM,
			E
		> = Collection.Advanced.TypesNonEmpty<FAM, E>,
	>(Base: TBase): TBase & AbstractConstructor<ApiBase<E, Tp>> {
		type Requirements = Required<
			E,
			Collection.Advanced.TypesNonEmpty<Collection.Advanced.Family<E>, E>
		>;

		// the members below are declared abstract here only so that this mixin can
		// use them; the type that extenders see is derived from
		// SetCollectionNonEmptyRequirements, which is what makes them a visible
		// obligation
		abstract class Result extends Base implements ApiBase<E, Tp> {
			abstract has: Requirements['has'];
			abstract add(element: E): Tp['_NON_EMPTY'];
			abstract remove(element: E): Tp['_NORMAL'];
			abstract map<E2>(
				f: (element: E) => E2,
			): Collection.Advanced.ReTyped<Tp, E2>['_NON_EMPTY'];
			abstract recompose<E2>(
				f: (stream: Tp['_AS_STREAM']) => StreamSource<E2>,
			): Collection.Advanced.ReTyped<Tp, E2>['_SELF'];
			abstract mutate(f: (builder: Tp['_BUILDER']) => void): Tp['_NORMAL'];
			abstract toBuilder(): Tp['_BUILDER'];

			addAll(elements: StreamSource<E>): Tp['_NON_EMPTY'] {
				if (this === elements) {
					return this;
				}

				return defaultAddAll(this, elements) as Tp['_NON_EMPTY'];
			}

			mapIndexed<E2>(
				f: (element: E, index: number) => E2,
			): Collection.Advanced.ReTyped<Tp, E2>['_SELF'] {
				let index = 0;

				return this.map((element) => f(element, index++)) as any;
			}

			flatMap<E2>(
				f: (element: E) => StreamSource<E2>,
			): Collection.Advanced.ReTyped<Tp, E2>['_SELF'] {
				return defaultFlatMapByAddAll(this, f) as any;
			}

			flatMapIndexed<E2>(
				f: (element: E, index: number) => StreamSource<E2>,
				options: { indexOffset?: number | undefined } | undefined,
			): Collection.Advanced.ReTyped<Tp, E2>['_SELF'] {
				return defaultFlatMapIndexed(this, f, options) as any;
			}

			union(other: StreamSource<E>): Tp['_NON_EMPTY'] {
				return this.addAll(other);
			}

			difference(other: StreamSource<E>): Tp['_NORMAL'] {
				return this.removeAll(other);
			}

			intersection(other: StreamSource<E>): Tp['_NORMAL'] {
				return defaultIntersectByAdd<
					E,
					SetCollection.NonEmpty<E>,
					SetCollection.Advanced.Family<E>
				>(this, other);
			}

			symmetricDifference(other: StreamSource<E>): Tp['_NORMAL'] {
				return defaultSymDifferenceByRemove(this, other);
			}

			removeAll(elements: StreamSource<E>): Tp['_NORMAL'] {
				if (this === elements) {
					return this.context.empty();
				}

				const builder = this.toBuilder();
				builder.removeAll(elements);
				if (builder.size === this.size) return this;
				return builder.build();
			}
		}

		return Result;
	}
}

export function defaultFlatMapByUnion<
	E,
	E2,
	C extends SetCollection.NonEmpty<E, FAM>,
	FAM extends ValuedCollection.Capability.WithUnion<E>,
>(
	col: C,
	f: (element: E) => StreamSource<E2>,
): Collection.Advanced.FamToTypes<FAM, E2>['_NORMAL'] {
	const iter = col[Symbol.iterator]();
	let result = col.context.empty<E2>();
	const done = Symbol();
	let elem: E | typeof done;

	while (done !== (elem = iter.fastNext(done))) {
		result = result.union(f(elem));
	}

	return result;
}

export function defaultUnionByAdd<
	E,
	C extends SetCollection.NonEmpty<E, FAM>,
	FAM extends Collection.Capability.WithAddAll<E>,
>(col: C, other: StreamSource<E>): FAM['_NORMAL'] {
	if (other === col) return col;
	if (Stream.isEmptyStreamSourceInstance(other)) return col;

	return col.addAll(other);
}

export function defaultDifferenceByRemove<
	E,
	C extends SetCollection.NonEmpty<E, FAM>,
	FAM extends ValuedCollection.Capability.WithRemove<E>,
>(col: C, other: StreamSource<E>): FAM['_NORMAL'] {
	if (other === col) return col.context.empty();
	if (Stream.isEmptyStreamSourceInstance(other)) return col;

	return col.removeAll(other);
}

export function defaultIntersectByAdd<
	E,
	C extends SetCollection.NonEmpty<E, FAM>,
	FAM extends Collection.Capability.WithAddAll<E>,
>(col: C, other: StreamSource<E>): FAM['_NORMAL'] {
	if (other === col) return col;
	if (Stream.isEmptyStreamSourceInstance(other)) return col.context.empty();

	const result = col.context.from(
		Stream.from(other).filterPure({ pred: col.has }),
	) as C;

	if (result.size === col.size) return col;
	return result;
}

export function defaultSymDifferenceByRemove<
	E,
	C extends SetCollection.NonEmpty<E, FAM>,
	FAM extends SetCollection.Advanced.Family<E>,
>(col: C, other: StreamSource<E>): FAM['_NORMAL'] {
	if (other === col) return col.context.empty();
	if (Stream.isEmptyStreamSourceInstance(other)) return col;

	const builder = col.toBuilder();

	Stream.from(other)
		.filterPure({ pred: builder.remove, negate: true })
		.forEachPure(builder.add);

	return builder.build();
}

export function defaultReducerByAdd<
	E,
	F extends Collection.Capability.WithToBuilder<E> &
		Collection.Capability.WithAddAll<E>,
>(
	context: SetCollection.Context<F>,
	source?: StreamSource<E>,
): Reducer<E, F['_NORMAL']> {
	return Reducer.create(
		() =>
			undefined === source
				? context.builder<E>()
				: context.from(source).toBuilder(),
		(builder, element) => {
			builder.add(element);
			return builder;
		},
		(builder) => builder.build(),
	);
}
