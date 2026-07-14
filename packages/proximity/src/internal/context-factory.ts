import type { ProximityMap } from '@rimbu/proximity';

import type { ProximityMapCreators } from '#proximity/creators';

import { RMapContextBaseModule } from '@rimbu/collection-types/advanced/map/base-module';
import { Module } from '@rimbu/common/module';
import { HashMap } from '@rimbu/hashed/map';
import { DistanceFunction } from '@rimbu/proximity/distance-function';

import { ProximityMapBuilder } from '#proximity/builder';
import { ProximityMapEmpty } from '#proximity/empty';
import { ProximityMapNonEmpty } from '#proximity/non-empty';

interface BuilderContext<UK> {
	builder: <K extends UK, V>() => ProximityMap.Builder<K, V>;
	createBuilder<K extends UK, V>(
		source?: ProximityMap.NonEmpty<K, V>,
	): ProximityMap.Builder<K, V>;
}

export interface ContextImpl<UK>
	extends ProximityMap.Context<UK>,
		RMapContextBaseModule.ModuleAbstract<UK, ProximityMap.Types>,
		BuilderContext<UK>,
		Omit<ProximityMapCreators, keyof ProximityMap.Context<any>> {}

export function createProximityMapContextModule<UK>(
	options: {
		distanceFunction?: DistanceFunction<UK>;
		hashMapContext?: HashMap.Context<UK>;
	} = {},
	_defaultContext?: ProximityMap.Context<UK> | undefined,
): Module<ContextImpl<UK>> {
	const baseModule = RMapContextBaseModule.createContextModuleBase<
		UK,
		ProximityMap.Types
	>();

	const builderModule = Module.createPartial<{
		defines: BuilderContext<UK>;
		requires: ContextImpl<UK>;
	}>((mod) => ({
		builder: <K extends UK, V>(): ProximityMap.Builder<K, V> => {
			return mod.createBuilder();
		},
		createBuilder<K extends UK, V>(
			source?: ProximityMap.NonEmpty<K, V>,
		): ProximityMap.Builder<K, V> {
			return new ProximityMapBuilder<K, V>(
				mod as unknown as ContextImpl<K>,
				source,
			);
		},
	}));

	return Module.create<ContextImpl<UK>>((mod) => ({
		...baseModule(mod),
		...builderModule(mod),

		createContext: (options) =>
			createProximityMapContextModule(options, mod as ContextImpl<any>).build(),
		defaultContext: Module.lazy(
			() => (_defaultContext ?? mod) as ProximityMap.Context<any>,
		),

		typeTag: 'ProximityMap',

		distanceFunction: Module.lazyGetter(
			() => options.distanceFunction ?? DistanceFunction.defaultFunction,
		),
		hashMapContext: Module.lazyGetter(
			() => options.hashMapContext ?? HashMap.defaultContext<UK>(),
		),
		isValidKey(key: any): key is UK {
			return mod.hashMapContext.isValidKey(key);
		},
		isNonEmptyInstance(source: any): source is any {
			return source instanceof ProximityMapNonEmpty;
		},
		empty: Module.lazy(
			<K extends UK, V>(): ProximityMap<K, V> =>
				Object.freeze(new ProximityMapEmpty(mod as unknown as ContextImpl<K>)),
		),
	}));
}
