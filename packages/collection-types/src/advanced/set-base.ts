import type { Collection } from '@rimbu/collection-types/collection';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { TypesKey } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty } from '@rimbu/common';

import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';
import {
	ValuedCollectionBuilderBase,
	ValuedCollectionEmptyBase,
	type ValuedCollectionEmptyBaseCapabilities,
	ValuedCollectionNonEmptyBase,
	type ValuedCollectionNonEmptyBaseCapabilities,
} from './collection/valued-base';

export type SetCollectionEmptyBaseCapabilities<E> =
	ValuedCollectionEmptyBaseCapabilities<E> &
		Collection.Capability.WithAdd<E> &
		SetCollection.Advanced.Family<E> &
		SetCollection.Capability.WithDifferenceAndIntersection<E> &
		SetCollection.Capability.WithRemove<E> &
		SetCollection.Capability.WithSymmetricDifferenceAndUnion<E>;

export abstract class SetCollectionEmptyBase<E>
	extends ValuedCollectionEmptyBase<E>
	implements SetCollection<E, SetCollectionEmptyBaseCapabilities<E>>
{
	declare readonly [TypesKey]: SetCollectionEmptyBaseCapabilities<E>;
	abstract readonly context: SetCollection.Context<this[TypesKey]>;

	add(element: E): this[TypesKey]['_NON_EMPTY'] {
		return this.context.of(element);
	}

	addAll(elements: StreamSource<E>): this[TypesKey]['_NON_EMPTY'] {
		return this.context.from(elements) as this[TypesKey]['_NON_EMPTY'];
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

	symmetricDifference(other: StreamSource<E>): this[TypesKey]['_NORMAL'] {
		return this.context.from(other);
	}

	union(other: StreamSource<E>): this[TypesKey]['_NON_EMPTY'] {
		return this.context.from(other) as this[TypesKey]['_NON_EMPTY'];
	}
}

export type SetCollectionNonEmptyBaseCapabilities<E> =
	ValuedCollectionNonEmptyBaseCapabilities<E> &
		SetCollection.Advanced.Family<E>;

export abstract class SetCollectionNonEmptyBase<E>
	extends ValuedCollectionNonEmptyBase<E>
	implements SetCollection.NonEmpty<E, SetCollectionNonEmptyBaseCapabilities<E>>
{
	declare readonly [TypesKey]: SetCollectionNonEmptyBaseCapabilities<E>;
	abstract readonly context: SetCollection.Context<this[TypesKey]>;
}

export abstract class SetCollectionContextBase<
	Tp extends Collection.Advanced.Types<
		SetCollection.Advanced.Family<any> &
			Collection.Capability.WithAdd<any> &
			Collection.Capability.WithToBuilder<any>,
		any
	>,
> implements SetCollection.Advanced.ContextApi<Tp>
{
	declare readonly [TypesKey]: Collection.Advanced.Types<Tp, any>;

	abstract isNonEmptyInstance<E extends Tp['_UPPER_E']>(
		source: unknown,
	): source is Tp['_NON_EMPTY'];
	abstract empty<E extends Tp['_UPPER_E']>(): Collection.Advanced.ReTyped<
		Tp,
		E
	>['_NORMAL'];
	abstract builder<E extends Tp['_UPPER_E']>(): Collection.Advanced.ReTyped<
		Tp,
		E
	>['_BUILDER'];

	of = <E extends Tp['_UPPER_E']>(
		...elements: ArrayNonEmpty<E>
	): Collection.Advanced.ReTyped<Tp, E>['_NON_EMPTY'] => {
		return this.from(elements);
	};

	from = <E extends Tp['_UPPER_E']>(
		...sources: ArrayNonEmpty<StreamSource<E>>
	): Collection.Advanced.ReTyped<Tp, E>['_NON_EMPTY'] => {
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

export abstract class SetCollectionBuilderBase<E>
	extends ValuedCollectionBuilderBase<E>
	implements
		SetCollection.Builder<E, SetCollectionNonEmptyBaseCapabilities<E>> {}

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
