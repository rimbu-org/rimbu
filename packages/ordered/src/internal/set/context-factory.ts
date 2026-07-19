import type { RMap } from '@rimbu/collection-types';
import type { RMapBase } from '@rimbu/collection-types/advanced/map/base';
import type { OrderedSet } from '@rimbu/ordered/set';
import type { Indicator } from '../common/ordered-indicator';

import type { OrderedSetBase } from '#set/base';
import type { OrderedSetCreators } from '#set/creators';

import { RSetContextBaseModule } from '@rimbu/collection-types/advanced/set/base-module';
import { Comp } from '@rimbu/common';
import { Module } from '@rimbu/common/module';
import { HashMap } from '@rimbu/hashed';
import { SortedMap } from '@rimbu/sorted';

import { OrderedSetBuilder } from '#set/builder';
import { OrderedSetEmpty } from '#set/empty';
import { OrderedSetNonEmpty } from '#set/non-empty';

interface ImmutableFactory<UT> {
	createNonEmpty<T extends UT>(
		keyIndicatorMap: RMap.NonEmpty<T, Indicator>,
		indicatorKeyMap: SortedMap.NonEmpty<Indicator, T>,
	): OrderedSet.NonEmpty<T>;
}

interface BuilderFactory<UT> {
	builder<T extends UT>(): OrderedSet.Builder<T>;
	createBuilder<T extends UT>(
		source?: OrderedSetNonEmpty<T>,
	): OrderedSetBuilder<T>;
}

export interface ContextImpl<UT>
	extends OrderedSet.Context<UT>,
		RSetContextBaseModule.ModuleAbstract<UT, OrderedSetBase.Types>,
		ImmutableFactory<UT>,
		BuilderFactory<UT>,
		OrderedSetCreators {
	defaultContext<T extends UT>(): OrderedSet.Context<T>;
	readonly keyMapContext: RMapBase.Context<UT>;
	readonly indicatorMapContext: SortedMap.Context<Indicator>;
}

export function createOrderedSetContextModule<UT>(
	options?:
		| {
				keyMapContext?: RMap.Context<UT> | undefined;
		  }
		| undefined,
	_defaultContext?: OrderedSet.Context<UT> | undefined,
): Module<ContextImpl<UT>> {
	const baseModule = RSetContextBaseModule.createContextModuleBase<
		UT,
		OrderedSetBase.Types
	>();

	const immutableModule = Module.createPartial<{
		defines: ImmutableFactory<UT>;
		requires: ContextImpl<UT>;
	}>((mod) => ({
		createNonEmpty: <T extends UT>(
			keyIndicatorMap: RMap.NonEmpty<T, Indicator>,
			indicatorKeyMap: SortedMap.NonEmpty<Indicator, T>,
		): OrderedSet.NonEmpty<T> => {
			return new OrderedSetNonEmpty<T>(
				mod as unknown as ContextImpl<T>,
				keyIndicatorMap,
				indicatorKeyMap,
			);
		},
	}));

	const builderModule = Module.createPartial<{
		defines: BuilderFactory<UT>;
		requires: ContextImpl<UT>;
	}>((mod) => ({
		builder: <T>() => {
			return new OrderedSetBuilder<T>(mod as unknown as ContextImpl<T>);
		},
		createBuilder: <T>(source?: OrderedSetNonEmpty<T>) => {
			return new OrderedSetBuilder<T>(mod as unknown as ContextImpl<T>, source);
		},
	}));

	return Module.create<ContextImpl<UT>>((mod) => ({
		...baseModule(mod),
		...immutableModule(mod),
		...builderModule(mod),

		createContext: (options) =>
			createOrderedSetContextModule(options, mod as ContextImpl<any>).build(),
		defaultContext: Module.lazy(
			() => (_defaultContext ?? mod) as OrderedSet.Context<any>,
		),

		typeTag: 'OrderedSet',

		keyMapContext: Module.lazyGetter(
			() => options?.keyMapContext ?? HashMap.defaultContext<UT>(),
		),
		indicatorMapContext: Module.lazyGetter(() =>
			SortedMap.createContext<Indicator>({ comp: Comp.string() }),
		),

		isValidValue(value: any): value is UT {
			return mod.keyMapContext.isValidKey(value);
		},
		isNonEmptyInstance(source: any): source is any {
			return source instanceof OrderedSetNonEmpty;
		},
		empty: Module.lazy(
			<T extends UT>() =>
				new OrderedSetEmpty<T>(mod as unknown as ContextImpl<T>),
		),
	}));
}
