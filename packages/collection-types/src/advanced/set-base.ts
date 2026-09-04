import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
import type { SetCollection } from '@rimbu/collection-types/set';

import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

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
