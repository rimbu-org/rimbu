import type { MapCollection } from '@rimbu/collection-types/map';
import type { OrderedSet } from '@rimbu/ordered/set';
import type { SortedMap } from '@rimbu/sorted/map';
import type { StreamSource } from '@rimbu/stream';

import { ContextBaseWithAddAll } from '@rimbu/collection-types/advanced/collection-base';
import { HashMap } from '@rimbu/hashed/map';
import { SortedMap as SortedMapValue } from '@rimbu/sorted/map';
import { Reducer } from '@rimbu/stream/reducer';

import { Indicator } from '#ordered/common/ordered-indicator';
import { OrderedSetBuilder } from '#ordered/set/builder';
import { OrderedSetEmpty } from '#ordered/set/empty';
import { OrderedSetNonEmpty } from '#ordered/set/non-empty';

/**
 * The concrete context of {@link OrderedSet}, acting as a factory for every
 * instance of the collection.
 *
 * @typeparam UE - the upper element type bound for which the context can be used
 */
export class OrderedSetContext<UE>
	extends ContextBaseWithAddAll<OrderedSet.Advanced.Family<UE>>
	implements OrderedSet.Advanced.ContextApi<UE, OrderedSet.Advanced.Family<UE>>
{
	static createDefault<UE>(options?: {
		keyMapContext?:
			| MapCollection.Context<MapCollection.Advanced.Family<UE, any>>
			| undefined;
		indicatorBlockSizeBits?: number | undefined;
	}): OrderedSetContext<UE> {
		const result: OrderedSetContext<UE> = new OrderedSetContext<UE>(
			options?.keyMapContext,
			options?.indicatorBlockSizeBits,
			() => result,
		);

		return result;
	}

	#keyMapContext:
		| MapCollection.Context<MapCollection.Advanced.Family<UE, any>>
		| undefined;

	constructor(
		keyMapContext:
			| MapCollection.Context<MapCollection.Advanced.Family<UE, any>>
			| undefined,
		readonly indicatorBlockSizeBits: number = 5,
		readonly getDefaultInstance: () => OrderedSetContext<any>,
	) {
		super();
		this.#keyMapContext = keyMapContext;
	}

	readonly typeTag = 'OrderedSet' as const;

	get keyMapContext(): MapCollection.Context<
		MapCollection.Advanced.Family<UE, any>
	> {
		if (undefined === this.#keyMapContext) {
			this.#keyMapContext = HashMap.createContext<UE>(
				{},
			) as unknown as MapCollection.Context<
				MapCollection.Advanced.Family<UE, any>
			>;
		}

		return this.#keyMapContext;
	}

	get indicatorMapContext(): SortedMap.Context<Indicator> {
		return SortedMapValue.createContext<Indicator>({
			comp: Indicator.COMP_INSTANCE,
			blockSizeBits: this.indicatorBlockSizeBits,
		});
	}

	createContext = <E>(options?: {
		keyMapContext?:
			| MapCollection.Context<MapCollection.Advanced.Family<E, any>>
			| undefined;
		indicatorBlockSizeBits?: number | undefined;
	}): OrderedSet.Context<E> => {
		return new OrderedSetContext<E>(
			options?.keyMapContext,
			options?.indicatorBlockSizeBits,
			this.getDefaultInstance,
		);
	};

	get defaultContext(): OrderedSet.Context<UE> {
		return this.getDefaultInstance() as unknown as OrderedSet.Context<UE>;
	}

	isNonEmptyInstance<T extends UE>(
		source: unknown,
	): source is OrderedSet.NonEmpty<T> {
		return source instanceof OrderedSetNonEmpty;
	}

	createNonEmpty<T extends UE>(
		keyIndicatorMap: MapCollection.NonEmpty<T, Indicator>,
		indicatorKeyMap: SortedMap.NonEmpty<Indicator, T>,
	): OrderedSet.NonEmpty<T> {
		return new OrderedSetNonEmpty<T>(
			this as unknown as OrderedSetContext<T>,
			keyIndicatorMap,
			indicatorKeyMap,
		);
	}

	createBuilder<T extends UE>(
		source?: OrderedSet.NonEmpty<T>,
	): OrderedSetBuilder<T> {
		return new OrderedSetBuilder<T>(
			this as unknown as OrderedSetContext<T>,
			source,
		);
	}

	#empty: OrderedSet<UE> | undefined;

	empty = <T extends UE>(): OrderedSet<T> => {
		if (undefined === this.#empty) {
			this.#empty = Object.freeze(
				new OrderedSetEmpty<UE>(this as unknown as OrderedSetContext<UE>),
			) as unknown as OrderedSet<UE>;
		}

		return this.#empty as unknown as OrderedSet<T>;
	};

	builder = <T extends UE>(): OrderedSet.Builder<T> => {
		return new OrderedSetBuilder<T>(this as unknown as OrderedSetContext<T>);
	};

	reducer = <E extends UE>(
		source?: StreamSource<E>,
	): Reducer<E, OrderedSet<E>> => {
		return Reducer.create(
			() =>
				undefined === source
					? this.builder<E>()
					: this.from(source).toBuilder(),
			(builder, element) => {
				builder.add(element);
				return builder;
			},
			(builder) => builder.build(),
		);
	};
}
