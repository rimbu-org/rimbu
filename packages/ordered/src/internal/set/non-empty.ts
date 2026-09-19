import type { MapCollection } from '@rimbu/collection-types/map';
import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common';
import type { OrderedSet } from '@rimbu/ordered/set';
import type { SortedMap } from '@rimbu/sorted/map';
import type { Stream } from '@rimbu/stream';

import type { OrderedSetContext } from '#ordered/set/context';

import { ValuedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/valued-base';
import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { SetCollectionNonEmpty } from '@rimbu/collection-types/advanced/set-base';

import { Indicator } from '#ordered/common/ordered-indicator';

const NonEmptyBase = SetCollectionNonEmpty.WithMixin(
	ValuedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor),
);

/**
 * Concrete non-empty implementation of {@link OrderedSet.NonEmpty}.<br/>
 * <br/>
 * Elements are stored in a key map holding their ordering indicator and a
 * sorted indicator map holding the elements. The sorted map defines the
 * insertion order and is the source of iteration. Adding an element that is
 * already present does not change its position.
 *
 * @typeparam T - the element type
 */
export class OrderedSetNonEmpty<T>
	extends NonEmptyBase<T, OrderedSet.Advanced.Family<T>>
	implements OrderedSet.NonEmpty<T>
{
	constructor(
		readonly context: OrderedSetContext<T>,
		readonly keyIndicatorMap: MapCollection.NonEmpty<T, Indicator>,
		readonly indicatorKeyMap: SortedMap.NonEmpty<Indicator, T>,
	) {
		super(context);
	}

	copy(
		keyIndicatorMap = this.keyIndicatorMap,
		indicatorKeyMap = this.indicatorKeyMap,
	): OrderedSet.NonEmpty<T> {
		if (
			keyIndicatorMap === this.keyIndicatorMap &&
			indicatorKeyMap === this.indicatorKeyMap
		) {
			return this;
		}

		return this.context.createNonEmpty<T>(keyIndicatorMap, indicatorKeyMap);
	}

	get size(): number {
		return this.keyIndicatorMap.size;
	}

	#nextIndicator(): Indicator {
		return Indicator.after(this.indicatorKeyMap.max()[0]);
	}

	stream(): Stream.NonEmpty<T> {
		return this.indicatorKeyMap.streamValues();
	}

	has = <U = T>(value: RelatedTo<T, U>): boolean => {
		return this.keyIndicatorMap.has(value);
	};

	add(value: T): OrderedSet.NonEmpty<T> {
		let appendedIndicator: Indicator | undefined;

		const newKeyIndicatorMap = this.keyIndicatorMap.modifyAtKey(value, {
			ifNew: {
				create: () => {
					appendedIndicator = this.#nextIndicator();
					return appendedIndicator;
				},
			},
		});

		if (undefined === appendedIndicator) return this;

		const newIndicatorKeyMap = this.indicatorKeyMap.set(
			appendedIndicator,
			value,
		);

		return this.copy(newKeyIndicatorMap.assumeNonEmpty(), newIndicatorKeyMap);
	}

	remove<U = T>(value: RelatedTo<T, U>): OrderedSet<T> {
		const result = this.keyIndicatorMap.removeKeyAndReturn(value);

		if (!result.hasResult) return this;

		const removedIndicator = result.result;
		const newKeyIndicatorMap = result.collection;

		if (!newKeyIndicatorMap.nonEmpty()) return this.context.empty();

		const newIndicatorKeyMap = this.indicatorKeyMap
			.removeKey(removedIndicator)
			.assumeNonEmpty();

		return this.copy(newKeyIndicatorMap, newIndicatorKeyMap);
	}

	filter(
		pred: (element: T) => boolean,
		options: { negate?: boolean | undefined } = {},
	): OrderedSet<T> {
		const builder = this.context.builder<T>();

		builder.addAll(this.stream().filter(pred, options));

		if (builder.size === this.size) return this;

		return builder.build();
	}

	map<E2 extends T>(f: (element: T) => E2): OrderedSet.NonEmpty<E2> {
		const builder = this.context.builder<E2>();

		this.forEach((element) => {
			builder.add(f(element));
		});

		return builder.build().assumeNonEmpty();
	}

	forEach(f: (element: T) => void): void {
		this.indicatorKeyMap.forEach(([, value]) => {
			f(value);
		});
	}

	toArray(): ArrayNonEmpty<T> {
		return this.stream().toArray();
	}

	toBuilder(): OrderedSet.Builder<T> {
		return this.context.createBuilder<T>(this);
	}

	toString(): string {
		return this.stream().join({ start: 'OrderedSet(', sep: ', ', end: ')' });
	}
}
