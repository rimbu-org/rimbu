import type { RSetBase } from '@rimbu/collection-types/set/base';
import type { ArrayNonEmpty } from '@rimbu/common/types';

import type { WithElem } from '#collection-types/common/types';

import { Module } from '@rimbu/common/module';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

export namespace RSetContextBaseModule {
	export interface ModuleAbstract<
		UT,
		Tp extends RSetBase.Types = RSetBase.Types,
	> {
		isNonEmptyInstance<T extends UT>(
			source: any,
		): source is WithElem<Tp, T>['nonEmpty'];
	}

	export function createContextModuleBase<
		UT,
		Tp extends RSetBase.Types = RSetBase.Types,
	>() {
		return Module.createPartial<{
			defines: Omit<
				RSetBase.Context<UT, Tp>,
				| keyof RSetContextBaseModule.ModuleAbstract<any>
				| 'typeTag'
				| 'empty'
				| 'builder'
				| 'isValidValue'
			>;
			requires: RSetBase.Context<UT, Tp> & ModuleAbstract<UT, Tp>;
		}>((mod) => ({
			_fixedElementType: undefined as any,
			_types: undefined as any,

			from: <T extends UT>(...sources: ArrayNonEmpty<StreamSource<T>>): any => {
				let builder = mod.builder();
				let i = -1;
				const length = sources.length;
				while (++i < length) {
					const source = sources[i];
					if (Stream.isEmptyStreamSourceInstance(source)) continue;
					if (
						builder.isEmpty &&
						mod.isNonEmptyInstance<T>(source) &&
						source.context === mod
					) {
						if (i === length - 1) return source;
						builder = source.toBuilder();
						continue;
					}
					builder.addAll(source);
				}
				return builder.build();
			},
			of: <T extends UT>(...values: ArrayNonEmpty<T>): Tp['nonEmpty'] => {
				return mod.from(values);
			},
			reducer: <T extends UT>(
				source?: StreamSource<T>,
			): Reducer<T, WithElem<Tp, T>['normal']> => {
				return Reducer.create(
					() =>
						undefined === source
							? mod.builder<T>()
							: (mod.from(source) as WithElem<Tp, T>['normal']).toBuilder(),
					(builder, value) => {
						builder.add(value);
						return builder;
					},
					(builder) => builder.build(),
				);
			},
		}));
	}
}
