import type { MapCollection } from '@rimbu/collection-types/map';
import type { OrderedMap } from '@rimbu/ordered/map';
import type { SortedMap } from '@rimbu/sorted/map';
import type { StreamSource } from '@rimbu/stream';

import { KeyedCollectionContextBase } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { ContextBaseWithAddAll } from '@rimbu/collection-types/advanced/collection-base';
import { HashMap } from '@rimbu/hashed/map';
import { SortedMap as SortedMapValue } from '@rimbu/sorted/map';
import { Stream } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { Indicator } from '#ordered/common/ordered-indicator';
import { OrderedMapBuilder } from '#ordered/map/builder';
import { OrderedMapEmpty } from '#ordered/map/empty';
import { OrderedMapNonEmpty } from '#ordered/map/non-empty';

/**
 * The concrete context of {@link OrderedMap}, acting as a factory for every
 * instance of the collection.
 *
 * @typeparam UK - the upper key type bound for which the context can be used
 */
export class OrderedMapContext<UK>
	extends ContextBaseWithAddAll<OrderedMap.Advanced.Family<UK, any>>
	implements
		OrderedMap.Advanced.ContextApi<UK, OrderedMap.Advanced.Family<UK, any>>
{
	static createDefault<UK>(options?: {
		keyMapContext?:
			| MapCollection.Context<MapCollection.Advanced.Family<UK, any>>
			| undefined;
		indicatorBlockSizeBits?: number | undefined;
	}): OrderedMapContext<UK> {
		const result: OrderedMapContext<UK> = new OrderedMapContext<UK>(
			options?.keyMapContext,
			options?.indicatorBlockSizeBits,
			() => result,
		);

		return result;
	}

	#keyMapContext:
		| MapCollection.Context<MapCollection.Advanced.Family<UK, any>>
		| undefined;

	constructor(
		keyMapContext:
			| MapCollection.Context<MapCollection.Advanced.Family<UK, any>>
			| undefined,
		readonly indicatorBlockSizeBits: number = 5,
		readonly getDefaultInstance: () => OrderedMapContext<any>,
	) {
		super();
		this.#keyMapContext = keyMapContext;
	}

	readonly typeTag = 'OrderedMap' as const;

	get keyMapContext(): MapCollection.Context<
		MapCollection.Advanced.Family<UK, any>
	> {
		if (undefined === this.#keyMapContext) {
			this.#keyMapContext = HashMap.createContext<UK>(
				{},
			) as unknown as MapCollection.Context<
				MapCollection.Advanced.Family<UK, any>
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

	#keyedContext: OrderedMapKeyedContext<UK> | undefined;

	get keyedContext(): OrderedMapKeyedContext<UK> {
		if (undefined === this.#keyedContext) {
			this.#keyedContext = new OrderedMapKeyedContext<UK>(this);
		}

		return this.#keyedContext;
	}

	get defaultContext(): OrderedMap.Context<UK> {
		return this.getDefaultInstance() as unknown as OrderedMap.Context<UK>;
	}

	isValidKey(key: unknown): key is UK {
		return this.keyMapContext.isValidKey(key);
	}

	isNonEmptyInstance<E extends readonly [UK, any]>(
		source: unknown,
	): source is OrderedMap.NonEmpty<E[0], E[1]> {
		return source instanceof OrderedMapNonEmpty;
	}

	createNonEmpty<K extends UK, V>(
		keyIndicatorMap: MapCollection.NonEmpty<K, readonly [V, Indicator]>,
		indicatorKeyMap: SortedMap.NonEmpty<Indicator, readonly [K, V]>,
	): OrderedMap.NonEmpty<K, V> {
		return new OrderedMapNonEmpty<K, V>(
			this as unknown as OrderedMapContext<K>,
			keyIndicatorMap,
			indicatorKeyMap,
		);
	}

	createBuilder<K extends UK, V>(
		source?: OrderedMap.NonEmpty<K, V>,
	): OrderedMapBuilder<K, V> {
		return new OrderedMapBuilder<K, V>(
			this as unknown as OrderedMapContext<K>,
			source,
		);
	}

	#empty: OrderedMap<UK, any> | undefined;

	empty = <E extends readonly [UK, any]>(): OrderedMap<E[0], E[1]> => {
		if (undefined === this.#empty) {
			this.#empty = Object.freeze(
				new OrderedMapEmpty<UK, any>(this as unknown as OrderedMapContext<UK>),
			) as unknown as OrderedMap<UK, any>;
		}

		return this.#empty as unknown as OrderedMap<E[0], E[1]>;
	};

	builder = <E extends readonly [UK, any]>(): OrderedMap.Builder<
		E[0],
		E[1]
	> => {
		return new OrderedMapBuilder<E[0], E[1]>(
			this as unknown as OrderedMapContext<E[0]>,
		);
	};

	reducer = <E2 extends readonly [UK, any]>(
		source?: StreamSource<E2>,
	): Reducer<E2, OrderedMap<E2[0], E2[1]>> => {
		return Reducer.create(
			() =>
				undefined === source
					? this.builder<E2>()
					: this.from(source).toBuilder(),
			(builder, entry) => {
				builder.add(entry);
				return builder;
			},
			(builder) => builder.build(),
		);
	};
}

/**
 * The keyed factory context of {@link OrderedMap}, exposing the keyed
 * collection factory surface (`empty`, `of`, `from`, `builder`, `merge`, ...).
 *
 * @typeparam UK - the upper key type bound for which the context can be used
 */
export class OrderedMapKeyedContext<UK>
	extends KeyedCollectionContextBase<
		UK,
		any,
		OrderedMap.Advanced.Family<any, any>
	>
	implements
		OrderedMap.Advanced.KeyedContextApi<UK, OrderedMap.Advanced.Family<UK, any>>
{
	constructor(readonly context: OrderedMapContext<UK>) {
		super(context);
	}

	get defaultContext(): OrderedMap.Context<any> {
		return this.context.defaultContext;
	}

	createContext = <K>(options?: {
		keyMapContext?:
			| MapCollection.Context<MapCollection.Advanced.Family<K, any>>
			| undefined;
		indicatorBlockSizeBits?: number | undefined;
	}): OrderedMap.Context<K> => {
		return new OrderedMapContext<K>(
			options?.keyMapContext,
			options?.indicatorBlockSizeBits,
			this.context.getDefaultInstance,
		);
	};

	get reducer(): <K, V>(
		source?: StreamSource<readonly [K, V]>,
	) => Reducer<readonly [K, V], OrderedMap<K, V>> {
		return this.context.reducer as any;
	}

	mergeAllWith = (
		sources: readonly StreamSource<readonly [UK, any]>[],
		options: { fillValue?: any; merge: (key: UK, values: any) => any },
	): OrderedMap.NonEmpty<UK, any> => {
		const { fillValue = undefined, merge: mergeFun } = options;

		const builder = this.builder<UK, any[]>();

		let i = -1;
		const length = sources.length;

		while (++i < sources.length) {
			let entry: readonly [UK, unknown] | undefined;
			const iter = Stream.from(sources[i])[Symbol.iterator]();

			while (undefined !== (entry = iter.fastNext())) {
				const key = entry[0];
				const value = entry[1];

				const index = i;

				builder.modifyAtKey(key, {
					ifNew: {
						create: (): unknown[] => {
							const row = Array(length).fill(fillValue);
							row[index] = value;
							return row;
						},
					},
					ifExists: {
						update: (row): unknown[] => {
							row[index] = value;
							return row;
						},
					},
				});
			}
		}

		return builder.buildMapValues((values, key) =>
			mergeFun(key, values),
		) as OrderedMap.NonEmpty<UK, any>;
	};

	mergeAll = (
		sources: readonly StreamSource<readonly [UK, any]>[],
		options: { fillValue?: any } = {},
	): OrderedMap.NonEmpty<UK, any> => {
		return this.mergeAllWith(sources, {
			fillValue: options.fillValue,
			merge: (_key, values) => values,
		});
	};

	mergeWith = (
		sources: readonly StreamSource<readonly [UK, any]>[],
		options: { merge: (key: UK, values: any) => any },
	): OrderedMap<UK, any> => {
		if (Stream.from(sources).some(Stream.isEmptyStreamSourceInstance)) {
			return this.empty();
		}

		const { merge: mergeFun } = options;

		const builder = this.builder<UK, unknown[]>();

		let i = -1;
		const length = sources.length;

		while (++i < sources.length) {
			let entry: readonly [UK, unknown] | undefined;
			const iter = Stream.from(sources[i])[Symbol.iterator]();

			while (undefined !== (entry = iter.fastNext())) {
				const key = entry[0];
				const value = entry[1];

				const index = i;

				builder.modifyAtKey(key, {
					ifNew: {
						create: (nothing): unknown[] | typeof nothing => {
							if (index > 0) return nothing;

							const row = [value];
							return row;
						},
					},
					ifExists: {
						update: (row, remove): unknown[] | typeof remove => {
							if (row.length !== index) return remove;
							row.push(value);
							return row;
						},
					},
				});
			}
		}

		// remove all rows that are not full
		const firstSource = sources[0];

		let entry: readonly [UK, unknown] | undefined;
		const iter = Stream.from(firstSource)[Symbol.iterator]();

		while (undefined !== (entry = iter.fastNext())) {
			const key = entry[0];

			builder.modifyAtKey(key, {
				ifExists: {
					update: (row, remove): unknown[] | typeof remove => {
						if (row.length !== length) return remove;
						return row;
					},
				},
			});
		}

		return builder.buildMapValues((row, key) => mergeFun(key, row));
	};

	merge = (
		sources: readonly StreamSource<readonly [UK, any]>[],
	): OrderedMap<UK, any> => {
		return this.mergeWith(sources, {
			merge: (_key, values) => values,
		});
	};
}
