import type { ListBase } from '#list/list-base';
import type { ListHelpers } from '#list/list-helpers';

import { Stream } from '@rimbu/stream';

import { ListContext } from '#list/context';

export interface List<T> extends ListBase<T, ListHelpers.Types> {}

export namespace List {
	export interface NonEmpty<T>
		extends ListBase.NonEmpty<T, ListHelpers.Types>,
			List<T> {}

	export interface Builder<T> extends ListBase.Builder<T, ListHelpers.Types> {}

	export interface Context extends ListBase.Context<ListHelpers.Types> {}
}

export const List: ListHelpers.Factory = new ListContext<ListHelpers.TypesImpl>(
	2,
	() => ({
		length(children: readonly unknown[]) {
			return children.length;
		},
		get<T>(children: readonly T[], index: number): T {
			return children[index]!;
		},
		of<T>(...values: T[]): readonly T[] {
			return values;
		},
		prepend<T>(children: readonly T[], value: T): readonly T[] {
			return [value, ...children];
		},
		append<T>(children: readonly T[], value: T): readonly T[] {
			return [...children, value];
		},
		toSpliced<T>(
			children: readonly T[],
			start: number,
			deleteCount: number,
			items: T[] = [],
		): readonly T[] {
			return children.toSpliced(start, deleteCount, ...items);
		},
		join(
			children: readonly unknown[],
			separator: string,
			reversed = false,
		): string {
			return Stream.fromArray(children, { reversed })
				.join({ sep: separator })
				.toString();
		},
	}),
) as ListHelpers.Factory;
