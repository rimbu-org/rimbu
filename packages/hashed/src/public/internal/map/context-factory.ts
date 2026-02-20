import type { HashMap } from '@rimbu/hashed/map';

import type { HashMapCreators } from '#map/creators';

import { RMapContextBaseModule } from '@rimbu/collection-types/map/base-module';
import { Eq } from '@rimbu/common/eq';
import { Module } from '@rimbu/common/module';
import { Hasher } from '@rimbu/hashed';
import { List } from '@rimbu/list';

import { HashMapBlockBuilder, type MapBlockBuilderEntry } from '#map/builder';
import {
	HashMapBlock,
	HashMapCollision,
	HashMapEmpty,
	HashMapNonEmptyBase,
	type MapEntrySet,
} from '#map/immutable';

interface ImmutableFactory<UK> {
	emptyBlock<V>(): HashMapBlock<UK, V>;
	block<V>(
		entries: (readonly [UK, V])[] | null,
		entrySets: MapEntrySet<UK, V>[] | null,
		size: number,
		level: number,
	): HashMapBlock<UK, V>;
	collision<V>(
		entries: List.NonEmpty<readonly [UK, V]>,
	): HashMapCollision<UK, V>;
	isHashMapBlock<K, V>(obj: MapEntrySet<K, V>): obj is HashMapBlock<K, V>;
}

interface BuilderFactory<UK> {
	isHashMapBlockBuilder<K, V>(
		obj: MapBlockBuilderEntry<K, V>,
	): obj is HashMapBlockBuilder<K, V>;
	builder<K extends UK, V>(): HashMap.Builder<K, V>;
	createBuilder<K extends UK, V>(
		source?: HashMap.NonEmpty<K, V> | undefined,
	): HashMap.Builder<K, V>;
}

export interface ContextImpl<UK>
	extends HashMap.Context<UK>,
		RMapContextBaseModule.ModuleAbstract<UK, HashMap.Types>,
		ImmutableFactory<UK>,
		BuilderFactory<UK>,
		Omit<HashMapCreators, keyof HashMap.Context<any>> {
	readonly blockMask: number;
	readonly maxDepth: number;
	readonly listContext: List.Context;
	hash(value: UK): number;
	getKeyIndex(level: number, hash: number): number;
}

export function createHashMapContextModule<UK>(
	options: {
		hasher?: Hasher<UK>;
		eq?: Eq<UK>;
		blockSizeBits?: number;
		listContext?: List.Context;
	} = {},
	_defaultContext?: HashMap.Context<UK> | undefined,
): Module<ContextImpl<UK>> {
	const baseModule = RMapContextBaseModule.createContextModuleBase<
		UK,
		HashMap.Types
	>();

	const immutableModule = Module.createPartial<{
		defines: ImmutableFactory<UK>;
		requires: ContextImpl<UK>;
	}>((mod) => ({
		emptyBlock: Module.lazy(
			<V>(): HashMapBlock<UK, V> => new HashMapBlock(mod, null, null, 0, 0),
		),
		block<V>(
			entries: (readonly [UK, V])[] | null,
			entrySets: MapEntrySet<UK, V>[] | null,
			size: number,
			level: number,
		): HashMapBlock<UK, V> {
			return new HashMapBlock(mod, entries, entrySets, size, level);
		},
		collision<V>(
			entries: List.NonEmpty<readonly [UK, V]>,
		): HashMapCollision<UK, V> {
			return new HashMapCollision(mod, entries);
		},
		isHashMapBlock<K, V>(obj: MapEntrySet<K, V>): obj is HashMapBlock<K, V> {
			return obj instanceof HashMapBlock;
		},
	}));

	const builderModule = Module.createPartial<{
		defines: BuilderFactory<UK>;
		requires: ContextImpl<UK>;
	}>((mod) => ({
		isHashMapBlockBuilder<K, V>(
			obj: MapBlockBuilderEntry<K, V>,
		): obj is HashMapBlockBuilder<K, V> {
			return obj instanceof HashMapBlockBuilder;
		},
		builder: <K extends UK, V>(): HashMap.Builder<K, V> => {
			return new HashMapBlockBuilder<K, V>(mod as unknown as ContextImpl<K>);
		},
		createBuilder<K extends UK, V>(
			source?: HashMap.NonEmpty<K, V>,
		): HashMap.Builder<K, V> {
			return new HashMapBlockBuilder<K, V>(
				mod as unknown as ContextImpl<K>,
				source as HashMapBlock<K, V> | undefined,
			);
		},
	}));

	const { blockSizeBits = 5, hasher, eq } = options;

	return Module.create<ContextImpl<UK>>((mod) => ({
		...baseModule(mod),
		...immutableModule(mod),
		...builderModule(mod),

		createContext: (options) =>
			createHashMapContextModule(
				options,
				mod as unknown as ContextImpl<any>,
			).build(),
		defaultContext: Module.lazy<any>(() => _defaultContext ?? mod),

		hasher: Module.lazyGetter(() => hasher ?? Hasher.defaultInstance),
		eq: Module.lazyGetter(() => eq ?? Eq.defaultInstance),
		listContext: Module.lazyGetter(
			() => options.listContext ?? List.defaultContext(),
		),

		typeTag: 'HashMap',
		_fixedKeyType: undefined as any,
		_types: undefined as any,

		blockSizeBits,
		blockCapacity: 1 << blockSizeBits,
		blockMask: (1 << blockSizeBits) - 1,
		maxDepth: Math.ceil(32 / blockSizeBits),

		isValidKey(key: unknown): key is UK {
			return mod.hasher.isValid(key);
		},
		isNonEmptyInstance: (source: any): source is any => {
			return source instanceof HashMapNonEmptyBase;
		},
		getKeyIndex(level: number, hash: number): number {
			const shift = blockSizeBits * level;
			return (hash >>> shift) & mod.blockMask;
		},
		hash(value: UK): number {
			return mod.hasher.hash(value);
		},
		empty: Module.lazy(() => new HashMapEmpty<any, any>(mod)),
	}));
}
