import type { WithKeyValue } from '@rimbu/collection-types/common';
import type { RMapBase } from '@rimbu/collection-types/map/base';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { StreamSource } from '@rimbu/stream';

import { Module } from '@rimbu/common/module';
import { StreamFactory } from '@rimbu/stream/internal/factory';
import { Reducer } from '@rimbu/stream/reducer';

export namespace RMapContextBaseModule {
	export interface ModuleAbstract<
		UK,
		Tp extends RMapBase.Types = RMapBase.Types,
	> {
		isValidKey(key: any): key is UK;
		isNonEmptyInstance<K, V>(
			source: any,
		): source is WithKeyValue<Tp, K, V>['nonEmpty'];
	}

	export function createContextModuleBase<
		UK,
		Tp extends RMapBase.Types = RMapBase.Types,
	>() {
		return Module.createPartial<{
			defines: Pick<RMapBase.Context<UK, Tp>, 'of' | 'from' | 'reducer'>;
			requires: RMapBase.Context<UK, Tp> & ModuleAbstract<UK, Tp>;
		}>((mod) => ({
			from: (...sources: any[]): any => {
				let builder = mod.builder();

				let i = -1;
				const length = sources.length;

				while (++i < length) {
					const source = sources[i];

					if (StreamFactory().isEmptyStreamSourceInstance(source)) continue;

					if (
						builder.isEmpty &&
						mod.isNonEmptyInstance(source) &&
						source.context === mod
					) {
						if (i === length - 1) return source;
						builder = source.toBuilder();
						continue;
					}

					builder.addEntries(source);
				}

				return builder.build();
			},
			of: <K extends UK, V>(...values: ArrayNonEmpty<readonly [K, V]>) => {
				return mod.from(values);
			},
			reducer: <K extends UK, V>(
				source?: StreamSource<readonly [K, V]>,
			): Reducer<readonly [K, V], WithKeyValue<Tp, K, V>['normal']> => {
				return Reducer.create(
					() =>
						undefined === source
							? mod.builder<K, V>()
							: (
									mod.from(source) as WithKeyValue<Tp, K, V>['normal']
								).toBuilder(),
					(builder, entry) => {
						builder.addEntry(entry);
						return builder;
					},
					(builder) => builder.build(),
				);
			},
		}));
	}
}
