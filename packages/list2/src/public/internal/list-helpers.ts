import type { IndexRange } from '@rimbu/common/index-range';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { ArrayNonEmpty, StringNonEmpty } from '@rimbu/common/types';
import type { List } from '@rimbu/list2';

import type { ListBase } from '#list/list-base';
import type { ListImpl } from '#list/list-impl';

import { Module } from '@rimbu/common/module';
import { Stream } from '@rimbu/stream';

import { createContextModule, type ListContext } from '#list/context-module';

export namespace ListHelpers {
	export interface Factory extends ListBase.Factory<ListHelpers.Types> {
		readonly defaultContext: List.Context;
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
		readonly outerChildren: readonly this['_T'][] & ListBase.OuterChildrenTag;
	}

	export function createListContext(
		options?: { blockSizeBits?: number | undefined } | undefined,
		_defaultContext?: ListContext<ListHelpers.TypesImpl> | undefined,
	): List.Context {
		const outerChildrenOpsModule = Module.createPartial<{
			defines: ListImpl.OuterChildrenOps<ListHelpers.TypesImpl>;
		}>(() => ({
			length(children: readonly unknown[]) {
				return children.length;
			},
			at<T>(children: readonly T[], index: number): T {
				return children.at(index)!;
			},
			updateAt<T>(
				children: readonly T[],
				index: number,
				update: (current: T) => T,
			): readonly T[] {
				const currentValue = children.at(index)!;
				const newValue = update(currentValue);
				if (Object.is(newValue, currentValue)) {
					return children;
				}
				return children.with(index, newValue);
			},
			stream<T>(
				children: readonly T[],
				options: { reversed?: boolean } = {},
			): Stream.NonEmpty<T> {
				return Stream.fromArray(children, options).assumeNonEmpty();
			},
			streamRange<T>(
				children: readonly T[],
				options?: { range?: IndexRange; reversed?: boolean },
			): Stream<T> {
				return Stream.fromArray(children, options);
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
				if (!reversed) {
					return children.join(separator);
				}

				return Stream.fromArray(children, { reversed })
					.join({ sep: separator })
					.toString();
			},
			map<T, T2>(
				children: readonly T[],
				f: (value: T, index: number) => T2,
				indexOffset = 0,
			): readonly T2[] {
				if (indexOffset === 0) {
					return children.map(f);
				}

				return children.map((value, index) => f(value, index + indexOffset));
			},
			reverseMap<T, T2>(
				children: readonly T[],
				f: (value: T, index: number) => T2,
				indexOffset = 0,
			): readonly T2[] {
				const length = children.length;
				const result: T2[] = Array(length);
				let i = -1;
				let target = length - 1;

				while (++i < length) {
					result[i] = f(children.at(target--)!, i + indexOffset);
				}

				return result;
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
				children: T[],
				start = undefined,
				end = undefined,
				reversed = false,
			): T[] {
				const isFullRange =
					(undefined === start || start === 0) &&
					(undefined === end || end === children.length);

				const resultChildren = isFullRange
					? children
					: children.slice(start, end);

				return reversed ? resultChildren.toReversed() : resultChildren;
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
			mutateDropFirst<T>(children: T[]): [result: T[], dropped: T] {
				return [children, children.shift()!];
			},
			mutateDropLast<T>(children: T[]): [result: T[], dropped: T] {
				return [children, children.pop()!];
			},
			mutateSplice<T>(
				children: T[],
				start: number,
				deleteCount = children.length,
				items: T[] = [],
			): [result: T[], deleted: T[]] {
				const deleted = children.splice(start, deleteCount, ...items);
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
			) => createListContext(options, mod),
			defaultContext: Module.lazy(() => _defaultContext ?? mod),

			fromString: (...sources: ArrayNonEmpty<string>): ListImpl<string> => {
				return mod.from(...sources);
			},
			outerChildrenOps: Module.lazyGetter(() =>
				Module.create(outerChildrenOpsModule).build(),
			),
		})).build();
	}
}
