import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
import type { SetCollection } from '@rimbu/collection-types/set';

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

export interface SetCollectionNonEmptyBase<
	E,
	Tp extends Collection.Advanced.TypesNonEmpty<
		Collection.Advanced.Family<E>,
		E
	>,
> extends SetCollection.Advanced.Api<E, Tp> {}

export interface SetNonEmptyMixin extends ApiMixin {
	_API: SetCollectionNonEmptyBase<this['_E'], this['_TP']>;

	_TP: Collection.Advanced.TypesNonEmpty<
		Collection.Advanced.Family<this['_E']>,
		this['_E']
	>;
}

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
	abstract class Result extends Base {
		abstract isOrdered: boolean;
		abstract has: (element: E) => boolean;
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

			return defaultAddAll(this, elements);
		}

		mapIndexed: any;

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
	FAM extends ValuedCollection.Capability.WithSymmetricDifferenceAndUnion<E>,
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
	FAM extends Collection.Capability.WithAdd<E>,
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
	FAM extends Collection.Capability.WithAdd<E>,
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
	FAM extends Collection.Capability.WithToBuilder<E> &
		Collection.Capability.WithAdd<E> &
		ValuedCollection.Capability.WithRemove<E>,
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
		Collection.Capability.WithAdd<E>,
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
