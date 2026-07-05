import type { RMap } from '@rimbu/collection-types';
import type { OrderedMap } from '@rimbu/ordered/map';

import type { OrderedMapBase } from '#map/base';
import type { OrderedMapCreators } from '#map/creators';

import { RMapContextBaseModule } from '@rimbu/collection-types/map/base-module';
import { Module } from '@rimbu/common/module';
import { List } from '@rimbu/list';

import { OrderedMapBuilder } from '#map/builder';
import { OrderedMapEmpty } from '#map/empty';
import { OrderedMapNonEmpty } from '#map/non-empty';

interface ImmutableFactory<UK> {
	createNonEmpty<K extends UK, V>(
		order: List.NonEmpty<K>,
		sourceMap: RMap.NonEmpty<K, V>,
	): OrderedMapNonEmpty<K, V>;
}

interface BuilderFactory<UK> {
	builder: <K extends UK, V>() => OrderedMap.Builder<K, V>;
	createBuilder: <K extends UK, V>(
		source?: OrderedMapNonEmpty<K, V>,
	) => OrderedMapBuilder<K, V>;
}

export interface ContextImpl<UK>
	extends OrderedMap.Context<UK>,
		RMapContextBaseModule.ModuleAbstract<UK, OrderedMapBase.Types>,
		ImmutableFactory<UK>,
		BuilderFactory<UK>,
		OrderedMapCreators {
	defaultContext<K extends UK>(): OrderedMap.Context<K>;
}

export function createOrderedMapContextModule<UK>(
	options: {
		listContext?: List.Context | undefined;
		mapContext: RMap.Context<UK>;
	},
	_defaultContext?: OrderedMap.Context<UK> | undefined,
): Module<ContextImpl<UK>> {
	const baseModule = RMapContextBaseModule.createContextModuleBase<
		UK,
		OrderedMapBase.Types
	>();

	const immutableModule = Module.createPartial<{
		defines: ImmutableFactory<UK>;
		requires: ContextImpl<UK>;
	}>((mod) => ({
		createNonEmpty<K extends UK, V>(
			order: List.NonEmpty<K>,
			sourceMap: RMap.NonEmpty<K, V>,
		) {
			return new OrderedMapNonEmpty(
				mod as unknown as ContextImpl<K>,
				order,
				sourceMap,
			);
		},
	}));

	const builderModule = Module.createPartial<{
		defines: BuilderFactory<UK>;
		requires: ContextImpl<UK>;
	}>((mod) => ({
		builder: <K extends UK, V>(): OrderedMap.Builder<K, V> => {
			return new OrderedMapBuilder(mod as unknown as ContextImpl<K>);
		},
		createBuilder<K extends UK, V>(
			source?: OrderedMapNonEmpty<K, V>,
		): OrderedMapBuilder<K, V> {
			return new OrderedMapBuilder<K, V>(
				mod as unknown as ContextImpl<K>,
				source,
			);
		},
	}));

	return Module.create<ContextImpl<UK>>((mod) => ({
		...baseModule(mod),
		...immutableModule(mod),
		...builderModule(mod),

		createContext: (options) =>
			createOrderedMapContextModule(options, mod as ContextImpl<any>).build(),
		defaultContext: Module.lazy(
			() => (_defaultContext ?? mod) as OrderedMap.Context<any>,
		),

		typeTag: 'OrderedMap',
		listContext: Module.lazyGetter(
			() => options.listContext ?? List.defaultContext,
		),
		mapContext: Module.lazyGetter(() => options.mapContext),

		isNonEmptyInstance(source: any): source is any {
			return source instanceof OrderedMapNonEmpty;
		},
		isValidKey(key: any): key is UK {
			return mod.mapContext.isValidKey(key);
		},

		empty: Module.lazy(<K>() =>
			Object.freeze(new OrderedMapEmpty(mod as unknown as ContextImpl<K>)),
		),
	}));
}
