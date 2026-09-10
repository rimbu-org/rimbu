import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { RelatedTo } from '@rimbu/common';

import {
	type AbstractConstructor,
	type ApiMixin,
	type CollectionNonEmptyBase,
	defaultAddAll,
	defaultFlatMapByAddAll,
	defaultFlatMapIndexed,
} from '@rimbu/collection-types/advanced/collection-base';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

/**
 * The part of the set collection API that {@link WithSetCollectionNonEmptyBase}
 * implements itself.
 *
 * Only members that the mixin actually defines may be listed here. Members that
 * the mixin leaves abstract belong in {@link SetCollectionNonEmptyRequirements}
 * instead — see the remarks there.
 *
 * @remarks
 * The signatures are copied from the corresponding
 * {@link Collection.Capability} and {@link ValuedCollection.Capability} `Api`
 * interfaces rather than inherited from them, because every one of those
 * interfaces also (re)declares the members this mixin leaves abstract — for
 * example every valued capability extends
 * {@link ValuedCollection.Advanced.Api}, which declares `has`. Inheriting them
 * would silently discharge those obligations again. {@link Collection.Advanced.Api}
 * is the one exception: it declares no member that this mixin leaves abstract,
 * only members owned by the collection base itself.
 */
export interface SetCollectionNonEmptyImplemented<
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

/**
 * The members that {@link WithSetCollectionNonEmptyBase} leaves abstract, and
 * that an extending class must therefore implement.
 *
 * @remarks
 * This is an ambient `abstract class` and not an interface on purpose.
 * TypeScript does not model abstractness in types, with one exception: a
 * non-abstract class that extends a base whose *instance type* contains a member
 * declared `abstract` is reported with `TS2654`. That check looks at the member
 * declaration, so it survives an intersection, a type alias, an interface that
 * extends this class, and the generic construct signature of
 * {@link ApiMixin.AbstractNonEmptyConstructor}. Declaring these members on an
 * interface instead would claim they are already implemented, which is how the
 * missing `isOrdered`, `map` and `mapIndexed` implementations went unnoticed.
 *
 * The obligation is discharged as soon as *any* capability in the composition
 * contributes a non-abstract declaration of the same member, in any order, so a
 * mixin applied later can still provide these.
 *
 * Members are declared with method syntax where possible: a subclass may
 * implement a base method as a property (e.g. `has = (value) => ...`), but not
 * the other way around.
 */
declare abstract class SetCollectionNonEmptyRequirementsClass<
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
	/**
	 * Whether this collection considers the order of its elements significant.
	 *
	 * Used by `addAll` and `removeAll` to decide whether the `elements === this`
	 * identity shortcut may be taken.
	 */
	abstract readonly isOrdered: boolean;

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

/**
 * See {@link SetCollectionNonEmptyRequirementsClass}.
 */
export type SetCollectionNonEmptyRequirements<
	E,
	Tp extends Collection.Advanced.TypesNonEmpty<
		Collection.Advanced.Family<E>,
		E
	>,
> = SetCollectionNonEmptyRequirementsClass<E, Tp>;

export interface SetCollectionNonEmptyBase<
	E,
	Tp extends Collection.Advanced.TypesNonEmpty<
		Collection.Advanced.Family<E>,
		E
	>,
> extends SetCollectionNonEmptyImplemented<E, Tp>,
		SetCollectionNonEmptyRequirementsClass<E, Tp> {}

export interface SetNonEmptyMixin extends ApiMixin {
	_API: SetCollectionNonEmptyBase<this['_E'], this['_TP']>;

	_TP: Collection.Advanced.TypesNonEmpty<
		Collection.Advanced.Family<this['_E']>,
		this['_E']
	>;
}

export function WithSetCollectionNonEmptyBase<C extends ApiMixin>(
	Base: ApiMixin.AbstractNonEmptyConstructor<C>,
): ApiMixin.AbstractNonEmptyConstructor<C & SetNonEmptyMixin>;
export function WithSetCollectionNonEmptyBase<
	TBase extends AbstractConstructor<CollectionNonEmptyBase<E, Tp>>,
	E,
	FAM extends
		SetCollection.Advanced.Family<E> = SetCollection.Advanced.Family<E>,
	Tp extends Collection.Advanced.TypesNonEmpty<
		FAM,
		E
	> = Collection.Advanced.TypesNonEmpty<FAM, E>,
>(Base: TBase): TBase & AbstractConstructor<SetCollectionNonEmptyBase<E, Tp>> {
	type Requirements = SetCollectionNonEmptyRequirements<
		E,
		Collection.Advanced.TypesNonEmpty<Collection.Advanced.Family<E>, E>
	>;

	// the members below are declared abstract here only so that this mixin can
	// use them; the type that extenders see is derived from
	// SetCollectionNonEmptyRequirements, which is what makes them a visible
	// obligation
	abstract class Result
		extends Base
		implements SetCollectionNonEmptyBase<E, Tp>
	{
		abstract isOrdered: Requirements['isOrdered'];
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
			if (!this.isOrdered && this === elements) {
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
			if (!this.isOrdered && this === elements) {
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
