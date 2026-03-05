import type { ListImpl } from '@rimbu/list/internal/list-impl';

import type { ListBase } from '#list/list-base';

import { Stream } from '@rimbu/stream';

import { ListContext } from '#list/context';

export interface CharList extends ListBase<string, CharListHelpers.Types> {}

export namespace CharList {
	export interface NonEmpty
		extends ListBase.NonEmpty<string, CharListHelpers.Types>,
			CharList {}

	export interface Builder extends ListBase.Builder<CharListHelpers.Types> {}

	export interface Context
		extends CharListHelpers.Factory,
			ListBase.Context<CharListHelpers.Types> {}
}

export namespace CharListHelpers {
	export interface Factory extends ListBase.Factory<CharListHelpers.Types> {}

	export interface Types extends ListBase.Types {
		readonly _UT: string;
		readonly normal: CharList;
		readonly nonEmpty: CharList.NonEmpty;
		readonly builder: CharList.Builder;
		readonly context: CharList.Context;
	}

	export interface TypesImpl extends ListImpl.Types {
		readonly _UT: string;
		readonly leafChildren: string & ListBase.LeafChildrenTag;
	}
}

export const CharList: CharListHelpers.Factory =
	new ListContext<CharListHelpers.TypesImpl>(2, () => ({
		length(children: string) {
			return children.length;
		},
		get<T extends string>(children: string, index: number): T {
			return children[index]! as T;
		},
		of(...values: string[]): string {
			return Stream.from(values)
				.map((value) => value[0])
				.join();
		},
		prepend(children: string, value: string): string {
			return `${value[0]}${children}`;
		},
		append(children: string, value: string): string {
			return `${children}${value[0]}`;
		},
		toSpliced(
			children: string,
			start: number,
			deleteCount: number,
			items: string[] = [],
		): string {
			const before = children.slice(0, start);
			const after = children.slice(start + deleteCount);
			const middle = Stream.from(items)
				.map((value) => value[0])
				.join();
			return `${before}${middle}${after}`;
		},
		join(children: string, separator: string, reversed = false): string {
			return Stream.fromString(children, { reversed }).join({ sep: separator });
		},
	})) as CharListHelpers.Factory;
