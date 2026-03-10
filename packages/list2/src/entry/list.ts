import type { ListBase } from '#list/list-base';
import type { ListHelpers } from '#list/list-helpers';

import { Stream } from '@rimbu/stream';

import { ListContext } from '#list/context';

export interface List<T> extends ListBase<T, ListHelpers.Types> {}

export namespace List {
	export interface NonEmpty<T>
		extends ListBase.NonEmpty<T, ListHelpers.Types>,
			Omit<List<T>, keyof ListBase.NonEmpty<any>> {}

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
		of<T>(values: T[]): readonly T[] {
			return values;
		},
		prepend<T>(children: readonly T[], value: T): readonly T[] {
			return [value, ...children];
		},
		append<T>(children: readonly T[], value: T): readonly T[] {
			return [...children, value];
		},
		concat<T>(children1: readonly T[], children2: readonly T[]): readonly T[] {
			return children1.concat(children2);
		},
		toReversed<T>(children: readonly T[]): readonly T[] {
			return Stream.fromArray(children, { reversed: true }).toArray();
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
		mutateAppend<T>(children: T[], value: T): T[] {
			children.push(value);
			return children;
		},
		mutatePrepend<T>(children: T[], value: T): T[] {
			children.unshift(value);
			return children;
		},
		mutateSplice<T>(
			children: T[],
			start: number,
			deleteCount?: number | undefined,
			items: T[] = [],
		): [result: T[], deleted: T[]] {
			const deleted = children.splice(start, deleteCount ?? 0, ...items);
			return [children, deleted];
		},
		safeCopy<T>(children: readonly T[]): T[] {
			return children.slice();
		},
	}),
) as ListHelpers.Factory;
