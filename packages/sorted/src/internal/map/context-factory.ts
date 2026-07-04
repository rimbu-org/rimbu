import type { SortedMap } from '@rimbu/sorted/map';

import type { SortedMapCreators } from '#map/creators';

import { RMapContextBaseModule } from '@rimbu/collection-types/map/base-module';
import { Comp } from '@rimbu/common/comp';
import { Module } from '@rimbu/common/module';

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

export interface ContextImpl<UK>
	extends SortedMap.Context<UK>,
		RMapContextBaseModule.ModuleAbstract<UK, SortedMap.Types>,
		ImmutableFactory<UK>,
		BuilderFactory<UK>,
		Omit<SortedMapCreators, keyof SortedMap.Context<any>> {
	readonly maxEntries: number;
	readonly minEntries: number;
	readonly blockSizeBits: number;
	readonly comp: Comp<UK>;

	isValidKey(key: any): key is UK;
	findIndex(key: UK, entries: readonly (readonly [UK, unknown])[]): number;
}

export function createSortedMapContextModule<UK>(
	options: {
		comp?: Comp<UK>;
		blockSizeBits?: number;
	} = {},
	_defaultContext?: SortedMap.Context<UK> | undefined,
): Module<ContextImpl<UK>> {
	const baseModule = RMapContextBaseModule.createContextModuleBase<
		UK,
		SortedMap.Types
	>();

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

	const builderModule = Module.createPartial<{
		defines: BuilderFactory<UK>;
		requires: ContextImpl<UK>;
	}>((mod) => ({
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
		...baseModule(mod),
		...immutableModule(mod),
		...builderModule(mod),

		createContext: (options) =>
			createSortedMapContextModule(options, mod as ContextImpl<any>).build(),
		defaultContext: Module.lazy<any>(() => _defaultContext ?? mod),

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
