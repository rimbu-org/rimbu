import type { ListImpl } from '@rimbu/list/internal/list-impl';

import type { ListBase } from '#list/list-base';

export interface CharList extends ListBase<string, CharListHelpers.Types> {}

export namespace CharList {
	export interface NonEmpty
		extends ListBase.NonEmpty<string, CharListHelpers.Types>,
			Omit<CharList, keyof ListBase.NonEmpty<any>> {}

	export interface Builder
		extends ListBase.Builder<string, CharListHelpers.Types> {}

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
		readonly outerChildren: string & ListBase.OuterChildrenTag;
	}
}

// export const CharList: CharListHelpers.Factory =
// 	new ListContext<CharListHelpers.TypesImpl>(2, () => ({
// 		length(children: string) {
// 			return children.length;
// 		},
// 		stream<T extends string = string>(
// 			children: string,
// 			options: { reversed?: boolean } = {},
// 		): Stream.NonEmpty<T> {
// 			return Stream.fromString(children, options) as Stream.NonEmpty<T>;
// 		},
// 		get<T extends string = string>(children: string, index: number): T {
// 			return children[index]! as T;
// 		},
// 		of(values: string[]): string {
// 			return Stream.from(values)
// 				.map((value) => value[0])
// 				.join();
// 		},
// 		prepend(children: string, value: string): string {
// 			return `${value[0]}${children}`;
// 		},
// 		append(children: string, value: string): string {
// 			return `${children}${value[0]}`;
// 		},
// 		concat(children1: string, children2: string): string {
// 			return `${children1}${children2}`;
// 		},
// 		toReversed(children: string): string {
// 			return Stream.fromString(children, { reversed: true }).join();
// 		},
// 		toSpliced(
// 			children: string,
// 			start: number,
// 			deleteCount: number,
// 			items: string[] = [],
// 		): string {
// 			const before = children.slice(0, start);
// 			const after = children.slice(start + deleteCount);
// 			const middle = Stream.from(items)
// 				.map((value) => value[0])
// 				.join();
// 			return `${before}${middle}${after}`;
// 		},
// 		toArray<T extends string = string>(
// 			children: string,
// 			startIndex = 0,
// 			endIndex = children.length,
// 		): T[] {
// 			throw new Error('Not implemented');
// 		},
// 		join(children: string, separator: string, reversed = false): string {
// 			return Stream.fromString(children, { reversed }).join({ sep: separator });
// 		},
// 		mutateAppend(children: string, value: string): string {
// 			return this.append(children, value);
// 		},
// 		mutatePrepend(children: string, value: string): string {
// 			return this.prepend(children, value);
// 		},
// 		mutateSplice(
// 			children: string,
// 			start: number,
// 			deleteCount?: number | undefined,
// 			items: string[] = [],
// 		): [result: string, deleted: string] {
// 			throw new Error('Not implemented');
// 		},
// 		safeCopy(children: string): string {
// 			return children;
// 		},
// 	})) as CharListHelpers.Factory;
