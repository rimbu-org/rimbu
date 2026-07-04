import type { IndexRange } from '@rimbu/common/index-range';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { CharList } from '@rimbu/list/char';

import type { ListBase } from '#list/list-base';
import type { ListImpl } from '#list/list-impl';

import { Module } from '@rimbu/common/module';
import { Stream } from '@rimbu/stream';

import { createContextModule, type ListContext } from '#list/context-module';

export namespace CharListHelpers {
	export interface Factory extends ListBase.Factory<CharListHelpers.Types> {
		readonly defaultContext: CharList.Context;
		createContext(
			options?: { blockSizeBits?: number | undefined } | undefined,
		): CharList.Context;
	}

	export interface Context
		extends ListBase.Context<CharListHelpers.Types>,
			CharListHelpers.Factory {}

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

	export function createCharListContext(
		options?: { blockSizeBits?: number | undefined } | undefined,
		_defaultContext?: ListBase.Context<CharListHelpers.TypesImpl> | undefined,
	): CharList.Context {
		const outerChildrenOpsModule = Module.createPartial<{
			defines: ListImpl.OuterChildrenOps<CharListHelpers.TypesImpl>;
		}>((mod) => ({
			length(children: string) {
				return children.length;
			},
			at<T extends string = string>(children: string, index: number): T {
				return children.at(index) as T;
			},
			updateAt<T extends string>(
				children: string,
				index: number,
				update: (current: T) => string,
			): string {
				const currentValue = children.at(index) as T;
				const newValue = update(children.at(index) as T);

				if (Object.is(newValue, currentValue)) {
					return children;
				}

				const left = children.slice(0, index);
				const right = children.slice(index + 1);

				return `${left}${newValue}${right}`;
			},
			stream<T extends string = string>(
				children: string,
				options: { reversed?: boolean } = {},
			): Stream.NonEmpty<T> {
				return Stream.fromString(children, options) as Stream.NonEmpty<T>;
			},
			streamRange<T extends string>(
				children: string,
				options?: { range?: IndexRange; reversed?: boolean },
			): Stream<T> {
				return Stream.fromString(children, options) as Stream<T>;
			},
			of(values: string[]): string {
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
			concat(children1: string, children2: string): string {
				return children1.concat(children2);
			},
			toReversed(children: string): string {
				return Stream.fromString(children, { reversed: true }).join();
			},
			toSpliced(
				children: string,
				start: number,
				deleteCount: number,
				items: string = '',
			): string {
				const before = children.slice(0, start);
				const after = children.slice(start + deleteCount);
				return `${before}${items}${after}`;
			},
			join(children: string, separator: string, reversed = false): string {
				return Stream.fromString(children, { reversed }).join({
					sep: separator,
				});
			},
			map<T extends string>(
				children: string,
				f: (value: T, index: number) => string,
				indexOffset = 0,
			): string {
				return Stream.fromString(children)
					.map((value, index) => f(value as T, index + indexOffset))
					.join();
			},
			reverseMap<T extends string>(
				children: string,
				f: (value: T, index: number) => string,
				indexOffset = 0,
			): string {
				return Stream.fromString(children, { reversed: true })
					.map((value, index) => f(value as T, index + indexOffset))
					.join();
			},
			forEach<T extends string>(
				children: string,
				f: (value: T, index: number, halt: () => void) => void,
				options: { reversed: boolean; state: TraverseState },
			): void {
				const { reversed, state } = options;

				if (state.halted) return;

				const length = children.length;

				if (!reversed) {
					let i = -1;
					while (!state.halted && ++i < length) {
						f(children[i] as T, state.nextIndex(), state.halt);
					}
				} else {
					let i = length;
					while (!state.halted && --i >= 0) {
						f(children[i] as T, state.nextIndex(), state.halt);
					}
				}
			},
			toArray<T extends string>(
				children: string,
				start = 0,
				end = children.length,
				reversed = false,
			): T[] {
				if (!reversed && start === 0 && end === children.length) {
					return children.split('') as T[];
				}

				// `end` is exclusive throughout (matching Array.slice semantics).
				const slice = children.slice(start, end);

				if (!reversed) {
					return slice.split('') as T[];
				}

				return Stream.fromString(slice, { reversed }).toArray() as T[];
			},
			mutateSet(children: string, index: number, value: string): string {
				return mod.updateAt(children, index, () => value);
			},
			mutateAppend(children: string, value: string): string {
				return mod.append(children, value);
			},
			mutatePrepend(children: string, value: string): string {
				return mod.prepend(children, value);
			},
			mutateDropFirst<T extends string>(
				children: string,
			): [result: string, dropped: T] {
				return [children.slice(1), children[0] as T];
			},
			mutateDropLast<T extends string>(
				children: string,
			): [result: string, dropped: T] {
				return [children.slice(0, -1), children[children.length - 1] as T];
			},
			mutateSplice<T extends string>(
				children: string,
				start: number,
				deleteCount?: number | undefined,
				items: T = '' as T,
			): [result: string, deleted: string] {
				const begin = children.slice(0, start);
				const end = children.slice(start + (deleteCount ?? children.length));
				const result = `${begin}${items}${end}`;
				const deleted = children.slice(
					start,
					start + (deleteCount ?? children.length),
				);
				return [result, deleted];
			},
			safeCopy(children: string): string {
				return children;
			},
		}));

		return Module.create<ListContext<CharListHelpers.TypesImpl>>((mod) => ({
			...createContextModule<
				ListContext<CharListHelpers.TypesImpl>,
				CharListHelpers.TypesImpl
			>(options)(mod),
			createContext: (
				options: { blockSizeBits?: number | undefined } | undefined,
			) => createCharListContext(options, mod),
			defaultContext: Module.lazy(() => _defaultContext ?? mod),
			outerChildrenOps: Module.lazyGetter(() =>
				Module.create(outerChildrenOpsModule).build(),
			),
		})).build();
	}
}
