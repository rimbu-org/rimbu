import type { Collection } from '@rimbu/collection-types/collection';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { ArrayNonEmpty } from '@rimbu/common';

import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';
import {
	ValuedCollectionBuilderBase,
	ValuedCollectionEmptyBase,
	ValuedCollectionNonEmptyBase,
} from './collection/valued-base';

export abstract class SetCollectionEmptyBase<
		E,
		FAM extends
			SetCollection.Advanced.Family<E> = SetCollection.Advanced.Family<E>,
		Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
			FAM,
			E
		>,
	>
	extends ValuedCollectionEmptyBase<E, FAM, Tp>
	implements
		SetCollection.Advanced.Api<E, Tp>,
		Collection.Capability.WithAdd.Api<E, Tp>,
		SetCollection.Capability.WithDifferenceAndIntersection.Api<E, Tp>,
		SetCollection.Capability.WithRemove.Api<E, Tp>,
		SetCollection.Capability.WithSymmetricDifferenceAndUnion.Api<E, Tp>
{
	abstract readonly context: SetCollection.Context<FAM>;

	add(element: E): Tp['_NON_EMPTY'] {
		return this.context.of(element);
	}

	addAll(elements: StreamSource<E>): Tp['_NON_EMPTY'] {
		return this.context.from(elements) as Tp['_NON_EMPTY'];
	}

	remove(): this {
		return this;
	}

	removeAll(): this {
		return this;
	}

	difference(): this {
		return this;
	}

	intersection(): this {
		return this;
	}

	symmetricDifference(other: StreamSource<E>): Tp['_NORMAL'] {
		return this.context.from(other);
	}

	union(other: StreamSource<E>): Tp['_NON_EMPTY'] {
		return this.context.from(other) as Tp['_NON_EMPTY'];
	}
}

export abstract class SetCollectionNonEmptyBase<
		E,
		FAM extends
			SetCollection.Advanced.Family<E> = SetCollection.Advanced.Family<E>,
		Tp extends Collection.Advanced.TypesNonEmpty<
			FAM,
			E
		> = Collection.Advanced.TypesNonEmpty<FAM, E>,
	>
	extends ValuedCollectionNonEmptyBase<E, FAM, Tp>
	implements SetCollection.Advanced.Api<E, Tp> {}

export abstract class SetCollectionContextBase<
	FAM extends SetCollection.Advanced.Family<any> &
		Collection.Capability.WithToBuilder<any> &
		Collection.Capability.WithAdd<any> = SetCollection.Advanced.Family<any> &
		Collection.Capability.WithToBuilder<any> &
		Collection.Capability.WithAdd<any>,
> implements SetCollection.Advanced.ContextApi<FAM>
{
	abstract isNonEmptyInstance<E extends FAM['_UPPER_E']>(
		source: unknown,
	): source is FAM['_NON_EMPTY'];
	abstract empty<E extends FAM['_UPPER_E']>(): Collection.Advanced.FamToTypes<
		FAM,
		E
	>['_NORMAL'];
	abstract builder<E extends FAM['_UPPER_E']>(): Collection.Advanced.FamToTypes<
		FAM,
		E
	>['_BUILDER'];

	of = <E extends FAM['_UPPER_E']>(
		...elements: ArrayNonEmpty<E>
	): Collection.Advanced.FamToTypes<FAM, E>['_NON_EMPTY'] => {
		return this.from(elements);
	};

	from = <E extends FAM['_UPPER_E']>(
		...sources: ArrayNonEmpty<StreamSource<E>>
	): Collection.Advanced.FamToTypes<FAM, E>['_NON_EMPTY'] => {
		let builder = this.builder<E>();
		let i = -1;
		const length = sources.length;
		while (++i < length) {
			const source = sources[i];
			if (Stream.isEmptyStreamSourceInstance(source)) continue;
			if (
				builder.isEmpty &&
				this.isNonEmptyInstance<E>(source) &&
				source.context === this
			) {
				if (i === length - 1) return source;
				builder = source.toBuilder();
				continue;
			}
			builder.addAll(source);
		}

		return builder.build() as any;
	};
}

export abstract class SetCollectionBuilderBase<
		E,
		FAM extends
			SetCollection.Advanced.Family<E> = SetCollection.Advanced.Family<E>,
		Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
			FAM,
			E
		>,
	>
	extends ValuedCollectionBuilderBase<E, FAM, Tp>
	implements SetCollection.Advanced.BuilderApi<E, Tp> {}

export function defaultFlatMapByUnion<
	E,
	E2,
	C extends SetCollection.NonEmpty<E, FAM>,
	FAM extends SetCollection.Capability.WithSymmetricDifferenceAndUnion<E>,
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
	FAM extends SetCollection.Capability.WithRemove<E>,
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
		SetCollection.Capability.WithRemove<E>,
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
