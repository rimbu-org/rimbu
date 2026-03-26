import type { TraverseState } from '@rimbu/common/traverse-state';
import type { ArrayNonEmpty, StringNonEmpty } from '@rimbu/common/types';
import type { List } from '@rimbu/list';

import type { ListBase } from '#list/list-base';
import type { ListImpl } from '#list/list-impl';

import { IndexRange } from '@rimbu/common/index-range';
import { Module } from '@rimbu/common/module';
import { Stream } from '@rimbu/stream';

import { createContextModule, type ListContext } from '#list/context-module';

export namespace ListHelpers {
	export interface Factory extends ListBase.Factory<ListHelpers.Types> {
		createContext(
			options?: { blockSizeBits?: number | undefined } | undefined,
		): List.Context;
		/**
		 * Returns a List of characters from the given strings in `sources`.
		 * @param sources - a non-empty array containing strings
		 * @typeparam S - the source string type
		 * @example
		 * ```ts
		 * List.fromString('abc').toArray()   // => ['a', 'b', 'c']
		 * ```
		 */
		fromString<S extends string>(
			...sources: ArrayNonEmpty<StringNonEmpty<S>>
		): List.NonEmpty<string>;
		fromString(...sources: ArrayNonEmpty<string>): List<string>;
	}

	export interface Context
		extends ListBase.Context<ListHelpers.Types>,
			ListHelpers.Factory {}

	export interface Types extends ListBase.Types {
		readonly normal: List<this['_T']>;
		readonly nonEmpty: List.NonEmpty<this['_T']>;
		readonly builder: List.Builder<this['_T']>;
		readonly context: List.Context;
	}

	export interface TypesImpl extends ListImpl.Types {
		readonly leafChildren: readonly this['_T'][] & ListBase.LeafChildrenTag;
	}

	export function createListContext(
		options?: { blockSizeBits?: number | undefined } | undefined,
	): List.Context {
		const leafChildrenOpsModule = Module.createPartial<{
			defines: ListImpl.LeafChildrenOps<ListHelpers.TypesImpl>;
		}>(() => ({
			length(children: readonly unknown[]) {
				return children.length;
			},
			get<T>(children: readonly T[], index: number): T {
				return children[index]!;
			},
			stream<T>(
				children: readonly T[],
				options: { reversed?: boolean } = {},
			): Stream.NonEmpty<T> {
				return Stream.fromArray(children, options).assumeNonEmpty();
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
			concat<T>(
				children1: readonly T[],
				children2: readonly T[],
			): readonly T[] {
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
			forEach<T>(
				children: readonly T[],
				f: (value: T, index: number, halt: () => void) => void,
				options: { reversed: boolean; state: TraverseState },
			): void {
				const { reversed, state } = options;

				if (state.halted) return;

				const length = children.length;

				if (!reversed) {
					let i = -1;
					while (!state.halted && ++i < length) {
						f(children[i], state.nextIndex(), state.halt);
					}
				} else {
					let i = length;
					while (!state.halted && --i >= 0) {
						f(children[i], state.nextIndex(), state.halt);
					}
				}
			},
			toArray<T>(
				children: readonly T[],
				startIndex?: number,
				endIndex?: number,
				reversed = false,
			): T[] {
				const range = IndexRange.getIndicesFor(
					{ start: startIndex ?? 0, end: endIndex ?? children.length },
					children.length,
				);

				if (range === 'empty') return [];
				if (range === 'all') {
					if (reversed) {
						return children.toReversed();
					}
					return children.slice();
				}

				const result = children.slice(range[0], range[1]);

				if (reversed) {
					return result.reverse();
				}

				return result;
			},
			mutateSet<T>(children: T[], index: number, value: T): T[] {
				children[index] = value;
				return children;
			},
			mutateAppend<T>(children: T[], value: T): T[] {
				children.push(value);
				return children;
			},
			mutatePrepend<T>(children: T[], value: T): T[] {
				children.unshift(value);
				return children;
			},
			mutateDropFirst<T>(children: T[]): T {
				return children.shift()!;
			},
			mutateDropLast<T>(children: T[]): T {
				return children.pop()!;
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
		}));

		return Module.create<ListContext<ListHelpers.TypesImpl>>((mod) => ({
			...createContextModule<
				ListContext<ListHelpers.TypesImpl>,
				ListHelpers.TypesImpl
			>(options)(mod),
			createContext: (
				options: { blockSizeBits?: number | undefined } | undefined,
			) => createListContext(options),
			fromString: (...sources: ArrayNonEmpty<string>): ListImpl<string> => {
				return mod.from(...sources);
			},
			leafChildrenOps: Module.lazyGetter(() =>
				Module.create(leafChildrenOpsModule).build(),
			),
		})).build();
	}
}
