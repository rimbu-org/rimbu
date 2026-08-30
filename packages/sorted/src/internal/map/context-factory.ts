import type { Module } from '@rimbu/common/module';
import type { SortedMap } from '@rimbu/sorted/map';

import { KeyedCollectionContextBase } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { ContextBaseWithAddAll } from '@rimbu/collection-types/advanced/collection-base';
import { Comp } from '@rimbu/common/comp';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { SortedMapBuilder } from '#map/builder';
import {
	SortedMapEmpty,
	SortedMapInner,
	SortedMapLeaf,
	SortedMapNode,
} from '#map/immutable';

export class SortedMapContext<UK>
	extends ContextBaseWithAddAll<SortedMap.Advanced.Family<UK, any>>
	implements
		SortedMap.Advanced.ContextApi<UK, SortedMap.Advanced.Family<UK, any>>
{
	static createDefault<UK>(
		comp?: Comp<UK> | undefined,
		blockSizeBits: number = 5,
	): SortedMapContext<UK> {
		const result: SortedMapContext<UK> = new SortedMapContext(
			comp,
			blockSizeBits,
			() => result,
		);
		return result;
	}

	constructor(
		readonly _comp: Comp<UK> | undefined = undefined,
		readonly blockSizeBits: number = 5,
		readonly getDefaultInstance: () => SortedMapContext<any> = () =>
			this as unknown as SortedMapContext<any>,
	) {
		super();
		this.maxEntries = 1 << blockSizeBits;
		this.minEntries = 1 << (blockSizeBits - 1);
	}

	readonly maxEntries: number;
	readonly minEntries: number;

	get comp(): Comp<UK> {
		return (this._comp ?? Comp.defaultInstance) as Comp<UK>;
	}

	get typeTag(): 'SortedMap' {
		return 'SortedMap';
	}

	get defaultContext(): SortedMap.Context<UK> {
		return this.getDefaultInstance() as unknown as SortedMap.Context<UK>;
	}

	createContext = <K>(
		options: {
			comp?: Comp<K> | undefined;
			blockSizeBits?: number | undefined;
		} = {},
	): SortedMap.Context<K> => {
		return new SortedMapContext<K>(
			options.comp as Comp<K> | undefined,
			options.blockSizeBits ?? this.blockSizeBits,
			this.getDefaultInstance as unknown as () => SortedMapContext<any>,
		) as unknown as SortedMap.Context<K>;
	};

	#keyedContext: SortedMapKeyedContext<UK> | undefined;
	get keyedContext(): SortedMapKeyedContext<UK> {
		if (undefined === this.#keyedContext) {
			this.#keyedContext = new SortedMapKeyedContext<UK>(this);
		}
		return this.#keyedContext;
	}

	isValidKey(key: unknown): key is UK {
		return this.comp.isComparable(key as UK);
	}

	findIndex(key: UK, entries: readonly (readonly [UK, unknown])[]): number {
		let start = 0;
		let end = entries.length - 1;

		while (start <= end) {
			const mid = (start + end) >>> 1;
			const midEntry = entries[mid];
			const comp = this.comp.compare(key, midEntry[0] as UK);

			if (comp < 0) end = mid - 1;
			else if (comp > 0) start = mid + 1;
			else return mid;
		}

		return -(start + 1);
	}

	leaf<V>(entries: readonly (readonly [UK, V])[]): SortedMapLeaf<UK, V> {
		return new SortedMapLeaf<UK, V>(
			this as unknown as SortedMapContext<UK>,
			entries,
		);
	}

	inner<V>(
		entries: readonly (readonly [UK, V])[],
		children: readonly SortedMapNode<UK, V>[],
		size: number,
	): SortedMapInner<UK, V> {
		return new SortedMapInner(
			this as unknown as SortedMapContext<UK>,
			entries,
			children,
			size,
		);
	}

	isSortedMapEmpty(obj: unknown): obj is SortedMapEmpty {
		return obj instanceof SortedMapEmpty;
	}

	isSortedMapLeaf<K, V>(obj: unknown): obj is SortedMapLeaf<K, V> {
		return obj instanceof SortedMapLeaf;
	}

	isSortedMapInner<K, V>(obj: unknown): obj is SortedMapInner<K, V> {
		return obj instanceof SortedMapInner;
	}

	isNonEmptyInstance<E extends readonly [UK, any]>(
		source: unknown,
	): source is SortedMap.NonEmpty<E[0], E[1]> {
		return source instanceof SortedMapNode;
	}

	isSortedMapNode<K, V>(obj: unknown): obj is SortedMapNode<K, V> {
		return obj instanceof SortedMapNode;
	}

	#empty: SortedMap<UK, any> | undefined;
	empty = <E extends readonly [UK, any]>(): SortedMap<E[0], E[1]> => {
		if (undefined === this.#empty) {
			this.#empty = Object.freeze(
				new SortedMapEmpty<any, any>(this as unknown as SortedMapContext<any>),
			) as unknown as SortedMap<UK, any>;
		}
		return this.#empty as unknown as SortedMap<E[0], E[1]>;
	};

	builder = <E extends readonly [UK, any]>(): SortedMap.Builder<E[0], E[1]> => {
		return new SortedMapBuilder<E[0], E[1]>(
			this as unknown as SortedMapContext<E[0]>,
		);
	};

	createBuilder<K extends UK, V>(
		source?: SortedMap<K, V>,
	): SortedMapBuilder<K, V> {
		return new SortedMapBuilder<K, V>(
			this as unknown as SortedMapContext<K>,
			source as SortedMap<K, V>,
		);
	}

	reducer = <E extends readonly [UK, any]>(
		source?: StreamSource<E>,
	): Reducer<E, SortedMap<E[0], E[1]>> => {
		return Reducer.create(
			() =>
				undefined === source
					? this.builder<E>()
					: (
							this.from(source as StreamSource<E>) as unknown as SortedMap<
								E[0],
								E[1]
							>
						).toBuilder(),
			(builder, entry) => {
				builder.add(entry as unknown as E);
				return builder;
			},
			(builder) => builder.build() as unknown as SortedMap<E[0], E[1]>,
		);
	};
}

export class SortedMapKeyedContext<UK>
	extends KeyedCollectionContextBase<
		UK,
		any,
		SortedMap.Advanced.Family<any, any>
	>
	implements
		SortedMap.Advanced.KeyedContextApi<UK, SortedMap.Advanced.Family<UK, any>>
{
	constructor(readonly context: SortedMapContext<UK>) {
		super(context as unknown as SortedMap.Context<any>);
	}

	get defaultContext(): SortedMap.Context<any> {
		return this.context.defaultContext as unknown as SortedMap.Context<any>;
	}

	createContext = <K>(options: {
		comp?: Comp<K> | undefined;
		blockSizeBits?: number | undefined;
	}): SortedMap.Context<K> => {
		return this.context.createContext(
			options,
		) as unknown as SortedMap.Context<K>;
	};

	get reducer(): <K, V>(
		source?: StreamSource<readonly [K, V]>,
	) => Reducer<readonly [K, V], SortedMap<K, V>> {
		return this.context.reducer as unknown as <K, V>(
			source?: StreamSource<readonly [K, V]>,
		) => Reducer<readonly [K, V], SortedMap<K, V>>;
	}

	mergeAllWith = (
		sources: readonly StreamSource<readonly [UK, any]>[],
		options: { fillValue?: any; merge: (key: UK, values: any) => any },
	): SortedMap.NonEmpty<UK, any> => {
		const { fillValue = undefined, merge: mergeFun } = options;
		const builder = (
			this as unknown as SortedMap.Advanced.KeyedContextApi<
				UK,
				SortedMap.Advanced.Family<UK, any>
			>
		).builder<UK, any[]>();
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
						update: (row: unknown[]): unknown[] => {
							(row as unknown as unknown[])[index] = value;
							return row;
						},
					},
				});
			}
		}
		return builder.buildMapValues((values: any, key: UK) =>
			mergeFun(key, values),
		) as SortedMap.NonEmpty<UK, any>;
	};

	mergeAll = (
		sources: readonly StreamSource<readonly [UK, any]>[],
		options: { fillValue?: any } = {},
	): SortedMap.NonEmpty<UK, any> => {
		return this.mergeAllWith(sources, {
			fillValue: options.fillValue,
			merge: (_key: UK, values: any) => values,
		});
	};

	mergeWith = (
		sources: readonly StreamSource<readonly [UK, any]>[],
		options: { merge: (key: UK, values: any) => any },
	): SortedMap<UK, any> => {
		if (Stream.from(sources).some(Stream.isEmptyStreamSourceInstance)) {
			return (
				this as unknown as SortedMap.Advanced.KeyedContextApi<
					UK,
					SortedMap.Advanced.Family<UK, any>
				>
			).empty();
		}
		const { merge: mergeFun } = options;
		const builder = (
			this as unknown as SortedMap.Advanced.KeyedContextApi<
				UK,
				SortedMap.Advanced.Family<UK, any>
			>
		).builder<UK, unknown[]>();
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
						create: (nothing: any): unknown[] | typeof nothing => {
							if (index > 0) return nothing;
							const row = [value];
							return row;
						},
					},
					ifExists: {
						update: (row: any, remove: any): unknown[] | typeof remove => {
							if (row.length !== index) return remove;
							row.push(value);
							return row;
						},
					},
				});
			}
		}
		const firstSource = sources[0];
		let entry: readonly [UK, unknown] | undefined;
		const iter = Stream.from(firstSource)[Symbol.iterator]();
		while (undefined !== (entry = iter.fastNext())) {
			const key = entry[0];
			builder.modifyAtKey(key, {
				ifExists: {
					update: (row: any, remove: any): unknown[] | typeof remove => {
						if (row.length !== length) return remove;
						return row;
					},
				},
			});
		}
		return builder.buildMapValues((row: any, key: UK) => mergeFun(key, row));
	};

	merge = (
		sources: readonly StreamSource<readonly [UK, any]>[],
	): SortedMap<UK, any> => {
		return this.mergeWith(sources, {
			merge: (_key: UK, values: any) => values,
		});
	};
}

export type ContextImpl<UK> = SortedMapContext<UK>;

export function createSortedMapContextModule<UK>(
	options: {
		comp?: Comp<UK>;
		blockSizeBits?: number;
	} = {},
	_defaultContext?: SortedMap.Context<UK> | undefined,
): Module<SortedMapKeyedContext<UK>> {
	let context!: SortedMapContext<UK>;
	context = new SortedMapContext<UK>(
		options.comp as Comp<UK> | undefined,
		options.blockSizeBits ?? 5,
		() => (_defaultContext as unknown as SortedMapContext<UK>) ?? context,
	);
	const keyedContext = context.keyedContext;
	return {
		getDefinition: () =>
			({}) as unknown as ReturnType<
				Module<SortedMapKeyedContext<UK>>['getDefinition']
			>,
		build: () => keyedContext,
	} as unknown as Module<SortedMapKeyedContext<UK>>;
}
