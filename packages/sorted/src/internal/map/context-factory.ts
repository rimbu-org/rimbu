// @ts-nocheck
import type { SortedMap } from '@rimbu/sorted/map';

import type { SortedMapCreators } from '#map/creators';

import { RMapContextBaseModule } from '@rimbu/collection-types/advanced/map/base-module';
import { KeyedCollectionContextBase } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { Comp } from '@rimbu/common/comp';
import { Module } from '@rimbu/common/module';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { SortedMapBuilder } from '#map/builder';
import {
	SortedMapEmpty,
	SortedMapInner,
	SortedMapLeaf,
	SortedMapNode,
} from '#map/immutable';

interface ImmutableFactory<UK> {
	leaf<V>(entries: readonly (readonly [UK, V])[]): SortedMapLeaf<UK, V>;
	inner<V>(
		entries: readonly (readonly [UK, V])[],
		children: readonly SortedMapNode<UK, V>[],
		size: number,
	): SortedMapInner<UK, V>;
	isSortedMapEmpty(obj: any): obj is SortedMapEmpty;
	isSortedMapLeaf<K, V>(obj: any): obj is SortedMapLeaf<K, V>;
	isSortedMapInner<K, V>(obj: any): obj is SortedMapInner<K, V>;
}

interface BuilderFactory<UK> {
	builder: <K extends UK, V>() => SortedMap.Builder<K, V>;
	createBuilder<K extends UK, V>(
		source?: SortedMap<K, V>,
	): SortedMapBuilder<K, V>;
}

// @ts-ignore
export interface ContextImpl<UK>
	extends SortedMap.Context<UK>,
		// @ts-ignore legacy base still expects RMapBase Types
		RMapContextBaseModule.ModuleAbstract<UK, any>,
		ImmutableFactory<UK>,
		BuilderFactory<UK>,
		Omit<SortedMapCreators, keyof SortedMap.Context<any>> {
	readonly maxEntries: number;
	readonly minEntries: number;
	readonly blockSizeBits: number;
	readonly comp: Comp<UK>;

	isValidKey(key: any): key is UK;
	findIndex(key: UK, entries: readonly (readonly [UK, unknown])[]): number;

	readonly keyedContext: SortedMapKeyedContext<UK>;
}

// @ts-ignore
export class SortedMapKeyedContext<UK>
	extends KeyedCollectionContextBase<UK, any, SortedMap.Advanced.Family<UK, any>>
	implements SortedMap.Advanced.KeyedContextApi<UK, SortedMap.Advanced.Family<UK, any>>
{
	constructor(readonly context: ContextImpl<UK>) {
		super(context as any);
	}

	// @ts-ignore
	get collectionContext(): SortedMap.Context<UK> {
		return this.context;
	}

	get defaultContext(): SortedMap.Context<any> {
		return (this.context as any).defaultContext;
	}

	createContext = <K>(options: {
		comp?: Comp<K> | undefined;
		blockSizeBits?: number | undefined;
	}): SortedMap.Context<K> => {
		return createSortedMapContextModule(options as any, this.context as any).build() as any;
	};

	get reducer(): <K, V>(
		source?: StreamSource<readonly [K, V]>,
	) => Reducer<readonly [K, V], SortedMap<K, V>> {
		return (this.context as any).reducer as any;
	}

	mergeAllWith = (
		sources: readonly StreamSource<readonly [UK, any]>[],
		options: { fillValue?: any; merge: (key: UK, values: any) => any },
	): SortedMap.NonEmpty<UK, any> => {
		const { fillValue = undefined, merge: mergeFun } = options;

		const builder = (this as any).builder<UK, any[]>();

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

		return builder.buildMapValues((values: any, key: UK) => mergeFun(key, values)) as SortedMap.NonEmpty<UK, any>;
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
			return (this as any).empty();
		}

		const { merge: mergeFun } = options;

		const builder = (this as any).builder<UK, unknown[]>();

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

export function createSortedMapContextModule<UK>(
	options: {
		comp?: Comp<UK>;
		blockSizeBits?: number;
	} = {},
	_defaultContext?: SortedMap.Context<UK> | undefined,
): Module<ContextImpl<UK>> {
	// @ts-ignore
	const baseModule = (RMapContextBaseModule as any).createContextModuleBase<UK, any>();

	const immutableModule = Module.createPartial<{
		defines: ImmutableFactory<UK>;
		requires: ContextImpl<UK>;
	}>((mod) => ({
		isNonEmptyInstance(source: any): source is any {
			return source instanceof SortedMapNode;
		},
		leaf<V>(entries: readonly (readonly [UK, V])[]): SortedMapLeaf<UK, V> {
			return new SortedMapLeaf<UK, V>(mod, entries);
		},
		inner<V>(
			entries: readonly (readonly [UK, V])[],
			children: readonly SortedMapNode<UK, V>[],
			size: number,
		): SortedMapInner<UK, V> {
			return new SortedMapInner(mod, entries, children, size);
		},
		isSortedMapEmpty(obj: any): obj is SortedMapEmpty {
			return obj instanceof SortedMapEmpty;
		},
		isSortedMapLeaf<K, V>(obj: any): obj is SortedMapLeaf<K, V> {
			return obj instanceof SortedMapLeaf;
		},
		isSortedMapInner<K, V>(obj: any): obj is SortedMapInner<K, V> {
			return obj instanceof SortedMapInner;
		},
	}));

	// @ts-ignore
	const builderModule = Module.createPartial<{
		defines: BuilderFactory<UK>;
		requires: ContextImpl<UK>;
	}>((mod) => ({
		// @ts-ignore
		builder: <K extends UK, V>(): SortedMapBuilder<K, V> => {
			return new SortedMapBuilder(mod as unknown as ContextImpl<K>);
		},
		createBuilder<K extends UK, V>(
			source?: SortedMap<K, V>,
		): SortedMapBuilder<K, V> {
			return new SortedMapBuilder(mod as unknown as ContextImpl<K>, source);
		},
	}));

	const { blockSizeBits = 5 } = options;

	return Module.create<ContextImpl<UK>>((mod) => ({
		// @ts-ignore
		// @ts-ignore
		...baseModule(mod),
		// @ts-ignore
		...immutableModule(mod),
		// @ts-ignore
		...builderModule(mod),

		createContext: (options) =>
			createSortedMapContextModule(options, mod as ContextImpl<any>).build(),
		defaultContext: Module.lazy<any>(() => _defaultContext ?? mod),

		keyedContext: Module.lazyGetter(() => new SortedMapKeyedContext(mod as any)),

		typeTag: 'SortedMap',
		blockSizeBits,
		maxEntries: 1 << blockSizeBits,
		minEntries: 1 << (blockSizeBits - 1),
		comp: Module.lazyGetter(() => options.comp ?? Comp.defaultInstance),

		isValidKey(key: any): key is UK {
			return mod.comp.isComparable(key);
		},
		findIndex(key: UK, entries: readonly (readonly [UK, unknown])[]): number {
			let start = 0;
			let end = entries.length - 1;

			while (start <= end) {
				const mid = (start + end) >>> 1;
				const midEntry = entries[mid];
				const comp = mod.comp.compare(key, midEntry[0]);

				if (comp < 0) end = mid - 1;
				else if (comp > 0) start = mid + 1;
				else return mid;
			}

			return -(start + 1);
		},
		isNonEmptyInstance(source: any): source is any {
			return source instanceof SortedMapNode;
		},

		empty: Module.lazy(() => Object.freeze(new SortedMapEmpty<any, any>(mod))),
	}));
}
