import type { HashSet } from '@rimbu/hashed/set';
import type { StreamSource } from '@rimbu/stream';
import type { HashSetCreators } from './creators';

import { RSetContextBaseModule } from '@rimbu/collection-types/set/base-module';
import { Eq } from '@rimbu/common/eq';
import { Module } from '@rimbu/common/module';
import { Hasher } from '@rimbu/hashed';
import { List } from '@rimbu/list';
import { HashSetBlockBuilder, type SetBlockBuilderEntry } from './builder';
import {
	HashSetBlock,
	HashSetCollision,
	HashSetEmpty,
	HashSetNonEmptyBase,
	type SetEntrySet,
} from './immutable';

interface ImmutableFactory<UT> {
	emptyBlock: HashSetBlock<UT>;
	block(
		entries: readonly UT[] | null,
		entrySets: SetEntrySet<UT>[] | null,
		size: number,
		level: number,
	): HashSetBlock<UT>;
	collision(entries: List.NonEmpty<UT>): HashSetCollision<UT>;
	isHashSetBlock<T>(
		obj: SetEntrySet<T> | StreamSource<T>,
	): obj is HashSetBlock<T>;
	isHashSetCollision<T>(
		obj: SetEntrySet<T> | StreamSource<T>,
	): obj is HashSetCollision<T>;
}

interface BuilderFactory<UT> {
	builder<T extends UT>(): HashSet.Builder<T>;
	createBuilder<T extends UT>(source?: HashSet.NonEmpty<T>): HashSet.Builder<T>;
	isHashSetBlockBuilder<T>(
		obj: SetBlockBuilderEntry<T>,
	): obj is HashSetBlockBuilder<T>;
}

export interface ContextImpl<UT>
	extends HashSet.Context<UT>,
		RSetContextBaseModule.ModuleAbstract<UT, HashSet.Types>,
		ImmutableFactory<UT>,
		BuilderFactory<UT>,
		Omit<HashSetCreators, 'builder' | 'empty' | 'of' | 'from' | 'reducer'> {
	readonly maxDepth: number;
	readonly listContext: List.Context;
	hash(value: UT): number;
	getKeyIndex(level: number, hash: number): number;
}

export function createHashSetContextModule<UT>(
	options: {
		hasher?: Hasher<UT>;
		eq?: Eq<UT>;
		blockSizeBits?: number;
		listContext?: List.Context;
	} = {},
	_defaultContext?: ContextImpl<any> | undefined,
): Module<ContextImpl<UT>> {
	const baseModule = RSetContextBaseModule.createContextModuleBase<
		UT,
		HashSet.Types
	>();

	const immutableModule = Module.createPartial<{
		defines: ImmutableFactory<UT>;
		requires: ContextImpl<UT>;
	}>((mod) => ({
		listContext: Module.lazyGetter(() => listContext ?? List.defaultContext()),
		emptyBlock: Module.lazyGetter(() =>
			Object.freeze(new HashSetBlock<UT>(mod, null, null, 0, 0)),
		),
		block(
			entries: readonly UT[] | null,
			entrySets: SetEntrySet<UT>[] | null,
			size: number,
			level: number,
		): HashSetBlock<UT> {
			return new HashSetBlock(mod, entries, entrySets, size, level);
		},
		collision(entries: List.NonEmpty<UT>): HashSetCollision<UT> {
			return new HashSetCollision(mod, entries);
		},
		isHashSetBlock: <T>(
			obj: SetEntrySet<T> | StreamSource<T>,
		): obj is HashSetBlock<T> => {
			return obj instanceof HashSetBlock;
		},
		isHashSetCollision: <T>(
			obj: SetEntrySet<T> | StreamSource<T>,
		): obj is HashSetCollision<T> => {
			return obj instanceof HashSetCollision;
		},
	}));

	const builderModule = Module.createPartial<{
		defines: BuilderFactory<UT>;
		requires: ContextImpl<UT>;
	}>((mod) => ({
		builder<T extends UT>(): HashSet.Builder<T> {
			return new HashSetBlockBuilder<any>(mod);
		},
		createBuilder<T extends UT>(
			source?: HashSet.NonEmpty<T>,
		): HashSet.Builder<T> {
			return new HashSetBlockBuilder<any>(mod, source as any);
		},
		isHashSetBlockBuilder<T>(
			obj: SetBlockBuilderEntry<T>,
		): obj is HashSetBlockBuilder<T> {
			return obj instanceof HashSetBlockBuilder;
		},
	}));

	const { hasher, eq, listContext, blockSizeBits = 5 } = options;

	const blockCapacity = 1 << blockSizeBits;
	const blockMask = blockCapacity - 1;

	return Module.create<ContextImpl<UT>>((mod) => ({
		...baseModule(mod),
		...immutableModule(mod),
		...builderModule(mod),

		createContext: (options) =>
			createHashSetContextModule(
				options,
				mod.defaultContext() as any,
			).build() as any,
		defaultContext: Module.lazy<any>(() => _defaultContext ?? mod),

		typeTag: 'HashSet',
		_fixedElementType: undefined as any,
		_types: undefined as any,

		hasher: Module.lazyGetter(() => hasher ?? Hasher.defaultInstance),
		eq: Module.lazyGetter(() => eq ?? Eq.defaultInstance),
		listContext: Module.lazyGetter(() => listContext ?? List.defaultContext()),

		maxDepth: Math.ceil(32 / blockSizeBits),

		hash: (value: UT): number => {
			return mod.hasher.hash(value);
		},
		getKeyIndex: (level: number, hash: number): number => {
			const shift = blockSizeBits * level;
			return (hash >>> shift) & blockMask;
		},
		empty: Module.lazy(() => new HashSetEmpty<any>(mod)),
		builder: () => new HashSetBlockBuilder<any>(mod),
		isValidValue: (value: unknown): value is UT => {
			return mod.hasher.isValid(value);
		},
		isNonEmptyInstance: (source: any): source is any => {
			return source instanceof HashSetNonEmptyBase;
		},
	}));
}
