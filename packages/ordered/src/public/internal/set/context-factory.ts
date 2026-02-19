import type { RSet } from '@rimbu/collection-types';
import type { WithElem } from '@rimbu/collection-types/common';
import type { OrderedSet } from '@rimbu/ordered/set';

import type { OrderedSetBase } from '#set/base';
import type { OrderedSetCreators } from '#set/creators';

import { RSetContextBaseModule } from '@rimbu/collection-types/set/base-module';
import { Module } from '@rimbu/common/module';
import { List } from '@rimbu/list';

import { OrderedSetBuilder } from '#set/builder';
import { OrderedSetEmpty } from '#set/empty';
import { OrderedSetNonEmpty } from '#set/non-empty';

interface ImmutableFactory<UT> {
	createNonEmpty<T extends UT>(
		order: List.NonEmpty<T>,
		sourceSet: WithElem<OrderedSetBase.Types, T>['sourceSetNonEmpty'],
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
}

export function createOrderedSetContextModule<UT>(
	options: {
		listContext?: List.Context;
		setContext: RSet.Context<UT>;
	},
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
			order: List.NonEmpty<T>,
			sourceSet: RSet.NonEmpty<T>,
		): OrderedSetNonEmpty<T> => {
			return new OrderedSetNonEmpty<T>(
				mod as unknown as ContextImpl<T>,
				order,
				sourceSet,
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

	const { listContext, setContext } = options;

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

		listContext: Module.lazyGetter(() => listContext ?? List.defaultContext()),
		setContext,

		isValidValue(value: any): value is UT {
			return mod.setContext.isValidValue(value);
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
