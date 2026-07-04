import type { RMap } from '@rimbu/collection-types';
import type { Table } from '@rimbu/table';

import type { TableCreators } from '#table/creators';
import type { TableBase } from '#table/types';

import { Module } from '@rimbu/common/module';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { TableBuilder, TableEmpty, TableNonEmpty } from '#table/base';

export interface ContextImpl<UR, UC>
	extends TableBase.Context<UR, UC>,
		TableCreators {
	isNonEmptyInstance<R, C, V>(source: any): source is Table.NonEmpty<R, C, V>;
	createNonEmpty<R extends UR, C extends UC, V>(
		rowMap: RMap.NonEmpty<R, RMap.NonEmpty<C, V>>,
		size: number,
	): Table.NonEmpty<R, C, V>;
	createBuilder<R extends UR, C extends UC, V>(
		source?: Table.NonEmpty<R, C, V> | undefined,
	): Table.Builder<R, C, V>;
}

export function createTableContextModule<UR, UC>(
	typeTag: string,
	options: {
		rowContext: RMap.Context<UR>;
		columnContext: RMap.Context<UC>;
	},
	_defaultContext?: ContextImpl<UR, UC> | undefined,
): Module<ContextImpl<UR, UC>> {
	return Module.create<ContextImpl<UR, UC>>((mod) => ({
		createContext: (_options) => {
			return createTableContextModule(
				typeTag,
				{
					get rowContext() {
						return _options?.rowContext ?? options.rowContext;
					},
					get columnContext() {
						return _options?.columnContext ?? options.columnContext;
					},
				},
				mod as ContextImpl<any, any>,
			).build();
		},
		defaultContext: Module.lazy(() => _defaultContext ?? mod),

		isNonEmptyInstance<R, C, V>(
			source: any,
		): source is Table.NonEmpty<R, C, V> {
			return source instanceof TableNonEmpty;
		},
		createBuilder: <R, C, V>(source?: Table.NonEmpty<R, C, V> | undefined) =>
			new TableBuilder<R, C, V>(mod as unknown as ContextImpl<R, C>, source),
		createNonEmpty: <R, C, V>(
			rowMap: RMap.NonEmpty<R, RMap.NonEmpty<C, V>>,
			size: number,
		) =>
			new TableNonEmpty<R, C, V>(
				mod as unknown as ContextImpl<R, C>,
				rowMap,
				size,
			),

		typeTag,
		_fixedKeys: undefined as any,
		_types: undefined as any,

		rowContext: Module.lazyGetter(() => options.rowContext),
		columnContext: Module.lazyGetter(() => options.columnContext),

		empty: Module.lazy(
			<R, C, V>(): Table<R, C, V> =>
				Object.freeze<Table<R, C, V>>(
					new TableEmpty(mod as unknown as ContextImpl<R, C>),
				),
		),
		of: (...entries) => mod.from(entries),
		from: <R extends UR, C extends UC, V>(
			...sources: StreamSource<readonly [R, C, V]>[]
		): any => {
			let builder = mod.builder<R, C, V>();
			let i = -1;
			const length = sources.length;
			while (++i < length) {
				const source = sources[i];
				if (Stream.isEmptyStreamSourceInstance(source)) continue;
				if (
					builder.isEmpty &&
					mod.isNonEmptyInstance<R, C, V>(source) &&
					source.context === (mod as any)
				) {
					if (i === length - 1) return source;
					builder = source.toBuilder();
					continue;
				}
				builder.addEntries(source);
			}
			return builder.build();
		},
		builder: <R, C, V>() =>
			new TableBuilder<R, C, V>(mod as unknown as ContextImpl<R, C>),
		reducer: <R extends UR, C extends UC, V>(
			source?: StreamSource<readonly [R, C, V]> | undefined,
		): Reducer<readonly [R, C, V], Table<R, C, V>> => {
			return Reducer.create(
				() =>
					undefined === source
						? mod.builder<R, C, V>()
						: mod.from(source).toBuilder(),
				(builder, entry) => {
					builder.addEntry(entry);
					return builder;
				},
				(builder) => builder.build(),
			);
		},
	}));
}
