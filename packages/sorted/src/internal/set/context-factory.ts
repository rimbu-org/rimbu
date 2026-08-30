import type { SortedSet } from '@rimbu/sorted/set';

import type { SortedSetCreators } from '#set/creators';

import { RSetContextBaseModule } from '@rimbu/collection-types/advanced/set/base-module';
import { Comp } from '@rimbu/common/comp';
import { Module } from '@rimbu/common/module';

import { SortedSetBuilder } from '#set/builder';
import {
	SortedSetEmpty,
	SortedSetInner,
	SortedSetLeaf,
	SortedSetNode,
} from '#set/immutable';

interface ImmutableFactory<UT> {
	isSortedSetEmpty(obj: any): obj is SortedSetEmpty<UT>;
	isSortedSetLeaf<T>(obj: any): obj is SortedSetLeaf<T>;
	isSortedSetInner<T>(obj: any): obj is SortedSetInner<T>;
	isSortedSetNode<T>(obj: any): obj is SortedSetNode<T>;
	leaf(entries: readonly UT[]): SortedSetLeaf<UT>;
	inner(
		entries: readonly UT[],
		children: readonly SortedSetNode<UT>[],
		size: number,
	): SortedSetInner<UT>;
}

interface BuilderFactory<UT> {
	builder<T extends UT>(): SortedSet.Builder<T>;
	createBuilder<T extends UT>(source?: SortedSet<T>): SortedSet.Builder<T>;
}

export interface ContextImpl<UT>
	extends SortedSet.Context<UT>,
		// @ts-ignore legacy base still expects RSetBase Types, suppress for incremental migration
		RSetContextBaseModule.ModuleAbstract<UT, any>,
		ImmutableFactory<UT>,
		BuilderFactory<UT>,
		Omit<SortedSetCreators, keyof SortedSet.Context<any>> {
	minEntries: number;
	maxEntries: number;
	findIndex(value: UT, entries: readonly UT[]): number;
}

export function createSortedSetContextModule<UT>(
	options: {
		comp?: Comp<UT>;
		blockSizeBits?: number;
	} = {},
	_defaultContext?: SortedSet.Context<any> | undefined,
): Module<ContextImpl<UT>> {
	// @ts-ignore
	const baseModule = (RSetContextBaseModule as any).createContextModuleBase<
		UT,
		any
	>();

	const immutableModule = Module.createPartial<{
		defines: ImmutableFactory<UT>;
		requires: ContextImpl<UT>;
	}>((mod) => ({
		isSortedSetEmpty(obj: any): obj is SortedSetEmpty<UT> {
			return obj instanceof SortedSetEmpty;
		},
		isSortedSetLeaf<T>(obj: any): obj is SortedSetLeaf<T> {
			return obj instanceof SortedSetLeaf;
		},
		isSortedSetInner<T>(obj: any): obj is SortedSetInner<T> {
			return obj instanceof SortedSetInner;
		},
		isSortedSetNode<T>(obj: any): obj is SortedSetNode<T> {
			return obj instanceof SortedSetNode;
		},
		leaf(entries: readonly UT[]): SortedSetLeaf<UT> {
			return new SortedSetLeaf(mod, entries);
		},
		inner(
			entries: readonly UT[],
			children: readonly SortedSetNode<UT>[],
			size: number,
		): SortedSetInner<UT> {
			return new SortedSetInner(mod, entries, children, size);
		},
	}));

	const builderModule = Module.createPartial<{
		defines: BuilderFactory<UT>;
		requires: ContextImpl<UT>;
	}>((mod) => ({
		builder<T extends UT>(): SortedSet.Builder<T> {
			return new SortedSetBuilder<T>(mod as unknown as ContextImpl<T>);
		},
		createBuilder<T extends UT>(source?: SortedSet<T>): SortedSet.Builder<T> {
			return new SortedSetBuilder<T>(mod as unknown as ContextImpl<T>, source);
		},
	}));

	const { blockSizeBits = 5 } = options;

	return Module.create<ContextImpl<UT>>((mod) => ({
		...baseModule(mod),
		...immutableModule(mod),
		...builderModule(mod),

		createContext: (options) =>
			createSortedSetContextModule(options, mod).build(),
		defaultContext: Module.lazy<any>(() => _defaultContext ?? mod),

		typeTag: 'SortedSet',

		blockSizeBits,
		minEntries: 1 << (blockSizeBits - 1),
		maxEntries: 1 << blockSizeBits,
		comp: Module.lazyGetter(() => options.comp ?? Comp.defaultInstance),

		isValidValue: (value: unknown): value is UT => {
			return mod.comp.isComparable(value);
		},
		isNonEmptyInstance(source: any): source is any {
			return source instanceof SortedSetNode;
		},
		empty: Module.lazy(<T extends UT>() =>
			Object.freeze(new SortedSetEmpty<T>(mod as unknown as ContextImpl<T>)),
		),
		findIndex(value: UT, entries: readonly UT[]): number {
			let start = 0;
			let end = entries.length - 1;

			while (start <= end) {
				const mid = (start + end) >>> 1;
				const midEntry = entries[mid];
				const comp = mod.comp.compare(value, midEntry);
				if (comp < 0) end = mid - 1;
				else if (comp > 0) start = mid + 1;
				else return mid;
			}

			return -(start + 1);
		},
	}));
}
