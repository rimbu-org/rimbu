import type { WithKeyValue } from '@rimbu/collection-types/advanced/common';
import type { RMapBase } from '@rimbu/collection-types/advanced/map/base';
import type { ArrayNonEmpty } from '@rimbu/common/types';

import { Module } from '@rimbu/common/module';
import { Stream, type StreamSource } from '@rimbu/stream';
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
			defines: Omit<
				RMapBase.Context<UK, Tp>,
				| keyof RMapContextBaseModule.ModuleAbstract<any>
				| 'typeTag'
				| 'empty'
				| 'builder'
			>;
			requires: RMapBase.Context<UK, Tp> & ModuleAbstract<UK, Tp>;
		}>((mod) => ({
			_fixedKeyType: undefined as any,
			_types: undefined as any,

			from: (...sources: any[]): any => {
				let builder = mod.builder();

				let i = -1;
				const length = sources.length;

				while (++i < length) {
					const source = sources[i];

					if (Stream.isEmptyStreamSourceInstance(source)) continue;

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
			mergeAllWith: <K, I extends readonly [unknown, unknown, ...unknown[]]>(
				...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
			): any => {
				return <O, R>(
					fillValue: O,
					mergeFun: (key: K, ...values: { [KT in keyof I]: I[KT] | O }) => R,
				): any => {
					const builder = mod.builder() as unknown as RMapBase.Builder<
						K,
						unknown[]
					>;

					let i = -1;
					const length = sources.length;

					while (++i < sources.length) {
						let entry: readonly [K, unknown] | undefined;
						const iter = Stream.from(sources[i])[Symbol.iterator]();

						while (undefined !== (entry = iter.fastNext())) {
							const key = entry[0];
							const value = entry[1];

							const index = i;

							builder.modifyAt(key, {
								ifNew: {
									create: () => {
										const row = Array(length).fill(fillValue);
										row[index] = value;
										return row;
									},
								},
								ifExists: {
									update: (row) => {
										row[index] = value;
										return row;
									},
								},
							});
						}
					}

					return builder.buildMapValues((row, key) =>
						mergeFun(key, ...(row as any)),
					);
				};
			},
			mergeAll: (fillValue, ...sources: any): any => {
				return mod.mergeAllWith(...sources)(
					fillValue,
					(_, ...values: unknown[]): any => values,
				);
			},
			mergeWith: <K extends UK, I extends readonly unknown[]>(
				...sources: StreamSource<readonly [K, unknown]>[]
			): any => {
				return (mergeFun: (key: K, ...values: I) => any): any => {
					if (Stream.from(sources).some(Stream.isEmptyStreamSourceInstance)) {
						return mod.empty();
					}

					const builder = mod.builder() as unknown as RMapBase.Builder<
						K,
						unknown[]
					>;

					let i = -1;
					const length = sources.length;

					while (++i < sources.length) {
						let entry: readonly [K, unknown] | undefined;
						const iter = Stream.from(sources[i])[Symbol.iterator]();

						while (undefined !== (entry = iter.fastNext())) {
							const key = entry[0];
							const value = entry[1];

							const index = i;

							builder.modifyAt(key, {
								ifNew: {
									create: (skip) => {
										if (index > 0) return skip;

										const row = [value];
										return row;
									},
								},
								ifExists: {
									update: (row, remove) => {
										if (row.length !== index) return remove;
										row.push(value);
										return row;
									},
								},
							});
						}
					}

					// remove all rows that are not full
					const firstSource = sources[0];

					let entry: readonly [K, unknown] | undefined;
					const iter = Stream.from(firstSource)[Symbol.iterator]();

					while (undefined !== (entry = iter.fastNext())) {
						const key = entry[0];

						builder.modifyAt(key, {
							ifExists: {
								update: (row, remove) => {
									if (row.length !== length) return remove;
									return row;
								},
							},
						});
					}

					return builder.buildMapValues((row, key) =>
						mergeFun(key, ...(row as any)),
					);
				};
			},
			merge: (...sources: any): any => {
				return mod.mergeWith(...sources)(
					(_, ...values: unknown[]): any => values,
				);
			},
		}));
	}
}
