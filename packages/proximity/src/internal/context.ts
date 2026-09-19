import type { ProximityMap } from '@rimbu/proximity';

import { KeyedCollectionContextBase } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { ContextBaseWithAddAll } from '@rimbu/collection-types/advanced/collection-base';
import { HashMap } from '@rimbu/hashed/map';
import { DistanceFunction } from '@rimbu/proximity/distance-function';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { ProximityMapBuilder } from '#proximity/builder';
import { ProximityMapEmpty } from '#proximity/empty';
import { ProximityMapNonEmpty } from '#proximity/non-empty';

/**
 * The concrete context of {@link ProximityMap}, acting as a factory for every
 * instance of the collection.
 *
 * @typeparam UK - the upper key type bound for which the context can be used
 */
export class ProximityMapContext<UK>
	extends ContextBaseWithAddAll<ProximityMap.Advanced.Family<UK, any>>
	implements
		ProximityMap.Advanced.ContextApi<UK, ProximityMap.Advanced.Family<UK, any>>
{
	static createDefault<UK>(
		distanceFunction?: DistanceFunction<UK>,
		hashMapContext?: HashMap.Context<UK>,
	): ProximityMapContext<UK> {
		const result: ProximityMapContext<UK> = new ProximityMapContext(
			distanceFunction,
			hashMapContext,
			() => result,
		);

		return result;
	}

	constructor(
		readonly _distanceFunction: DistanceFunction<UK> | undefined = undefined,
		readonly _hashMapContext: HashMap.Context<UK> | undefined = undefined,
		readonly getDefaultInstance: () => ProximityMapContext<any> = () =>
			this as unknown as ProximityMapContext<any>,
	) {
		super();
	}

	#keyedContext: ProximityMapKeyedContext<UK> | undefined;

	get keyedContext(): ProximityMapKeyedContext<UK> {
		if (undefined === this.#keyedContext) {
			this.#keyedContext = new ProximityMapKeyedContext<UK>(this);
		}

		return this.#keyedContext;
	}

	get defaultContext(): ProximityMap.Context<UK> {
		return this.getDefaultInstance() as unknown as ProximityMap.Context<UK>;
	}

	get typeTag(): 'ProximityMap' {
		return 'ProximityMap';
	}

	#resolvedDistanceFunction: DistanceFunction<UK> | undefined;

	get distanceFunction(): DistanceFunction<UK> {
		if (undefined === this.#resolvedDistanceFunction) {
			this.#resolvedDistanceFunction =
				this._distanceFunction ?? DistanceFunction.defaultFunction;
		}

		return this.#resolvedDistanceFunction;
	}

	#resolvedHashMapContext: HashMap.Context<UK> | undefined;

	get hashMapContext(): HashMap.Context<UK> {
		if (undefined === this.#resolvedHashMapContext) {
			this.#resolvedHashMapContext =
				this._hashMapContext ?? HashMap.createContext<UK>({});
		}

		return this.#resolvedHashMapContext;
	}

	isValidKey(key: unknown): key is UK {
		return this.hashMapContext.isValidKey(key);
	}

	#empty: ProximityMap<UK, any> | undefined;

	empty = <E extends readonly [UK, any]>(): ProximityMap<E[0], E[1]> => {
		if (undefined === this.#empty) {
			this.#empty = Object.freeze(
				new ProximityMapEmpty<UK, any>(
					this as unknown as ProximityMapContext<UK>,
				),
			) as unknown as ProximityMap<UK, any>;
		}

		return this.#empty as unknown as ProximityMap<E[0], E[1]>;
	};

	builder = <E extends readonly [UK, any]>(): ProximityMap.Builder<
		E[0],
		E[1]
	> => {
		return new ProximityMapBuilder<E[0], E[1]>(
			this as unknown as ProximityMapContext<E[0]>,
		);
	};

	createBuilder<K extends UK, V>(
		source?: ProximityMap.NonEmpty<K, V>,
	): ProximityMap.Builder<K, V> {
		return new ProximityMapBuilder<K, V>(
			this as unknown as ProximityMapContext<K>,
			source,
		);
	}

	isNonEmptyInstance<E extends readonly [UK, any]>(
		source: unknown,
	): source is ProximityMap.NonEmpty<E[0], E[1]> {
		return source instanceof ProximityMapNonEmpty;
	}

	reducer = <E2 extends readonly [UK, any]>(
		source?: StreamSource<E2>,
	): Reducer<E2, ProximityMap<E2[0], E2[1]>> => {
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
 * The keyed factory context of {@link ProximityMap}, exposing the keyed
 * collection factory surface (`empty`, `of`, `from`, `builder`, `merge`, ...).
 *
 * @typeparam UK - the upper key type bound for which the context can be used
 */
export class ProximityMapKeyedContext<UK>
	extends KeyedCollectionContextBase<
		UK,
		any,
		ProximityMap.Advanced.Family<any, any>
	>
	implements
		ProximityMap.Advanced.KeyedContextApi<
			UK,
			ProximityMap.Advanced.Family<UK, any>
		>
{
	constructor(readonly context: ProximityMapContext<UK>) {
		super(context);
	}

	get defaultContext(): ProximityMap.Context<any> {
		return this.context.defaultContext;
	}

	createContext = <K>(options?: {
		distanceFunction?: DistanceFunction<K> | undefined;
		hashMapContext?: HashMap.Context<K> | undefined;
	}): ProximityMap.Context<K> => {
		return new ProximityMapContext<K>(
			options?.distanceFunction,
			options?.hashMapContext,
			this.context.getDefaultInstance,
		);
	};

	get reducer(): <K, V>(
		source?: StreamSource<readonly [K, V]>,
	) => Reducer<readonly [K, V], ProximityMap<K, V>> {
		return this.context.reducer as any;
	}

	mergeAllWith = (
		sources: readonly StreamSource<readonly [UK, any]>[],
		options: { fillValue?: any; merge: (key: UK, values: any) => any },
	): ProximityMap.NonEmpty<UK, any> => {
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
		) as ProximityMap.NonEmpty<UK, any>;
	};

	mergeAll = (
		sources: readonly StreamSource<readonly [UK, any]>[],
		options: { fillValue?: any } = {},
	): ProximityMap.NonEmpty<UK, any> => {
		return this.mergeAllWith(sources, {
			fillValue: options.fillValue,
			merge: (_key, values) => values,
		});
	};

	mergeWith = (
		sources: readonly StreamSource<readonly [UK, any]>[],
		options: { merge: (key: UK, values: any) => any },
	): ProximityMap<UK, any> => {
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
	): ProximityMap<UK, any> => {
		return this.mergeWith(sources, {
			merge: (_key, values) => values,
		});
	};
}
