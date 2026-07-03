import type { IndexRange } from '@rimbu/common/index-range';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { TypedArrayList } from '../../entry/typed-array';

import type { ListBase } from '#list/list-base';
import type { ListImpl } from '#list/list-impl';

import { Module } from '@rimbu/common/module';
import { Stream } from '@rimbu/stream';

import { createContextModule, type ListContext } from '#list/context-module';

export namespace TypedArrayListHelpers {
	export interface Factory<V extends TypedArrayList.View>
		extends ListBase.Factory<TypedArrayListHelpers.Types<V>> {
		readonly defaultContext: TypedArrayList.Context<V>;
		createContext(
			options?: { blockSizeBits?: number | undefined } | undefined,
		): TypedArrayList.Context<V>;
	}

	export interface Context<V extends TypedArrayList.View>
		extends ListBase.Context<TypedArrayListHelpers.Types<V>> {}

	export interface Types<V extends TypedArrayList.View> extends ListBase.Types {
		readonly _UT: number;
		readonly normal: TypedArrayList<V>;
		readonly nonEmpty: TypedArrayList.NonEmpty<V>;
		readonly builder: TypedArrayList.Builder<V>;
		readonly context: TypedArrayList.Context<V>;
	}

	export interface TypesImpl extends ListImpl.Types {
		readonly _UT: number;
		readonly outerChildren: ArrayBufferLike & ListBase.OuterChildrenTag;
	}

	export function createTypedArrayListContext<V extends TypedArrayList.View>(
		arrayBuffer: {
			ViewConstructor: {
				readonly BYTES_PER_ELEMENT: number;
				new (buffer: ArrayBuffer): V;
			};
		},
		_options: {
			blockSizeBits?: number | undefined;
		} = {},
		_defaultContext:
			| ListBase.Context<TypedArrayListHelpers.TypesImpl>
			| undefined = undefined,
	): TypedArrayList.Context<V> {
		const { ViewConstructor } = arrayBuffer;
		const options = { ..._options, blockSizeBits: _options.blockSizeBits ?? 5 };
		const { blockSizeBits } = options;

		function createBuffer(length: number): ArrayBuffer {
			return new ArrayBuffer(length * ViewConstructor.BYTES_PER_ELEMENT, {
				maxByteLength:
					(1 << (blockSizeBits * ViewConstructor.BYTES_PER_ELEMENT)) * 2,
			});
		}

		const outerChildrenOpsModule = Module.createPartial<{
			defines: ListImpl.OuterChildrenOps<TypedArrayListHelpers.TypesImpl>;
		}>((mod) => ({
			length(children: ArrayBuffer) {
				return new ViewConstructor(children).length;
			},
			at<T extends number = number>(children: ArrayBuffer, index: number): T {
				return new ViewConstructor(children).at(index) as T;
			},
			updateAt<T extends number = number>(
				children: ArrayBuffer,
				index: number,
				update: (current: T) => number,
			): ArrayBufferLike {
				const view = new ViewConstructor(children);

				const currentValue = view[index];
				const newValue = update(currentValue as T);
				if (Object.is(newValue, currentValue)) {
					return children;
				}

				const newView = view.with(index, newValue);
				return newView.buffer;
			},
			stream<T extends number>(
				children: ArrayBuffer,
				options: { reversed?: boolean } = {},
			): Stream.NonEmpty<T> {
				const view = new ViewConstructor(children);
				const { reversed = false } = options;
				const range = Stream.range(
					{ start: reversed ? view.length - 1 : 0 },
					reversed ? { delta: -1 } : undefined,
				).take(view.length);
				return range.map((index) => view[index] as T) as Stream.NonEmpty<T>;
			},
			streamRange<T extends number>(
				children: ArrayBuffer,
				options: { range?: IndexRange; reversed?: boolean } = {},
			): Stream<T> {
				const { range = undefined, reversed = false } = options;
				if (undefined === range) {
					return mod.stream<T>(children, { reversed });
				}
				return Stream.range(range, reversed ? { delta: -1 } : undefined).map(
					(index) => new ViewConstructor(children)[index],
				) as Stream<T>;
			},
			of<T>(values: T[]): ArrayBuffer {
				const newBuffer = createBuffer(values.length);
				const newView = new ViewConstructor(newBuffer);
				newView.set(values as number[]);
				return newBuffer;
			},
			prepend(children: ArrayBuffer, value: number): ArrayBuffer {
				const view = new ViewConstructor(children);
				const newBuffer = createBuffer(view.length + 1);
				const newView = new ViewConstructor(newBuffer);
				newView.set(view, 1);
				newView[0] = value;
				return newBuffer;
			},
			append(children: ArrayBuffer, value: number): ArrayBuffer {
				const view = new ViewConstructor(children);
				const newBuffer = createBuffer(view.length + 1);
				const newView = new ViewConstructor(newBuffer);
				newView.set(view);
				newView[view.length] = value;
				return newBuffer;
			},
			concat(children1: ArrayBuffer, children2: ArrayBuffer): ArrayBuffer {
				const view1 = new ViewConstructor(children1);
				const view2 = new ViewConstructor(children2);
				const newBuffer = createBuffer(view1.length + view2.length);
				const newView = new ViewConstructor(newBuffer);
				newView.set(view1);
				newView.set(view2, view1.length);
				return newBuffer;
			},
			toReversed(children: ArrayBuffer): ArrayBuffer {
				const view = new ViewConstructor(children);
				const newBuffer = createBuffer(view.length);
				const newView = new ViewConstructor(newBuffer);
				newView.set(view.toReversed());
				return newBuffer;
			},
			toSpliced(
				children: ArrayBuffer,
				start: number,
				deleteCount: number,
				items: ArrayBuffer | undefined,
			): ArrayBuffer {
				const view = new ViewConstructor(children);
				const itemsView =
					items === undefined ? undefined : new ViewConstructor(items);

				let deleteAmount = deleteCount;
				if (deleteAmount > 0) {
					deleteAmount = Math.min(view.length - start, deleteAmount);
				}

				const resultLength =
					view.length - deleteAmount + (itemsView?.length ?? 0);
				const newBuffer = createBuffer(resultLength);
				const newView = new ViewConstructor(newBuffer);
				newView.set(view.subarray(0, start));
				if (itemsView) {
					newView.set(itemsView, start);
				}

				newView.set(
					view.subarray(start + deleteAmount),
					start + (itemsView?.length ?? 0),
				);

				return newBuffer;
			},
			join(children: ArrayBuffer, separator: string, reversed = false): string {
				if (!reversed) {
					return new ViewConstructor(children).join(separator);
				}

				return mod.stream(children, { reversed }).join({ sep: separator });
			},
			map<T extends number>(
				children: ArrayBuffer,
				f: (value: T, index: number) => number,
				indexOffset = 0,
			): ArrayBuffer {
				const view = new ViewConstructor(children);
				const resultView = view.map((value, index) =>
					f(value as T, index + indexOffset),
				);
				return resultView.buffer;
			},
			reverseMap<T extends number>(
				children: ArrayBuffer,
				f: (value: T, index: number) => number,
				indexOffset = 0,
			): ArrayBuffer {
				const view = new ViewConstructor(children);
				const newBuffer = createBuffer(view.length);
				const newView = new ViewConstructor(newBuffer);

				for (let i = 0; i < view.length; i++) {
					newView[i] = f(
						view[view.length - 1 - i] as T,
						i + indexOffset,
					) as number;
				}

				return newBuffer;
			},
			forEach<T>(
				children: ArrayBuffer,
				f: (value: T, index: number, halt: () => void) => void,
				options: { reversed: boolean; state: TraverseState },
			): void {
				const { reversed, state } = options;
				if (state.halted) return;

				const view = new ViewConstructor(children);
				if (!reversed) {
					let i = -1;
					while (!state.halted && ++i < view.length) {
						f(view[i] as T, state.nextIndex(), state.halt);
					}
				} else {
					let i = view.length;
					while (!state.halted && --i >= 0) {
						f(view[i] as T, state.nextIndex(), state.halt);
					}
				}
			},
			toArray<T extends number>(
				children: ArrayBuffer,
				start = 0,
				end = new ViewConstructor(children).length,
				reversed = false,
			): T[] {
				const view = new ViewConstructor(children);
				if (reversed) {
					return mod
						.streamRange(children, { range: { start, end }, reversed: true })
						.toArray() as T[];
				}
				return Array.from(view.subarray(start, end)) as T[];
			},
			mutateSet(
				children: ArrayBuffer,
				index: number,
				value: number,
			): ArrayBufferLike {
				const view = new ViewConstructor(children);
				view[index] = value;
				return view.buffer;
			},
			mutateAppend(children: ArrayBuffer, value: number): ArrayBufferLike {
				const view = new ViewConstructor(children);
				children.resize(children.byteLength + view.BYTES_PER_ELEMENT);
				view[view.length - 1] = value;
				return children;
			},
			mutatePrepend(children: ArrayBuffer, value: number): ArrayBufferLike {
				const view = new ViewConstructor(children);
				children.resize(children.byteLength + view.BYTES_PER_ELEMENT);
				view.copyWithin(1, 0, view.length - 1);
				view[0] = value;
				return children;
			},
			mutateDropFirst<T extends number>(
				children: ArrayBuffer,
			): [result: ArrayBuffer, dropped: T] {
				const view = new ViewConstructor(children);
				const dropped = view[0];
				view.copyWithin(0, 1);
				children.resize(children.byteLength - view.BYTES_PER_ELEMENT);
				return [children, dropped as T];
			},
			mutateDropLast<T extends number>(
				children: ArrayBuffer,
			): [result: ArrayBufferLike, dropped: T] {
				const view = new ViewConstructor(children);
				const dropped = view.at(-1);
				children.resize(children.byteLength - view.BYTES_PER_ELEMENT);
				return [children, dropped as T];
			},
			mutateSplice(
				children: ArrayBuffer,
				start: number,
				deleteCount = 0,
				items: ArrayBuffer | undefined = undefined,
			): [result: ArrayBufferLike, deleted: ArrayBufferLike] {
				const view = new ViewConstructor(children);
				const itemsView =
					items === undefined ? undefined : new ViewConstructor(items);

				let deleteAmount = deleteCount;
				if (deleteAmount > 0) {
					deleteAmount = Math.min(view.length - start, deleteAmount);
				}
				const deletedBuffer = createBuffer(deleteAmount);
				const deletedView = new ViewConstructor(deletedBuffer);
				deletedView.set(view.subarray(start, start + deleteAmount));

				const resultLength =
					view.length - deleteAmount + (itemsView?.length ?? 0);
				const resultByteLength = resultLength * view.BYTES_PER_ELEMENT;
				children.resize(resultByteLength);
				view.copyWithin(
					start + (itemsView?.length ?? 0),
					start + deleteAmount,
					view.length,
				);
				if (itemsView) {
					view.set(itemsView, start);
				}

				return [children, deletedView.buffer];
			},
			safeCopy(children: ArrayBuffer): ArrayBufferLike {
				const view = new ViewConstructor(children);
				return view.slice().buffer;
			},
		}));

		return Module.create<ListContext<TypedArrayListHelpers.TypesImpl>>(
			(mod) => ({
				...createContextModule<
					ListContext<TypedArrayListHelpers.TypesImpl>,
					TypedArrayListHelpers.TypesImpl
				>(options)(mod),
				createContext: (
					options: { blockSizeBits?: number | undefined } | undefined,
				) => createTypedArrayListContext(arrayBuffer, options),
				defaultContext: Module.lazy(() => _defaultContext ?? mod),
				outerChildrenOps: Module.lazyGetter(() =>
					Module.create(outerChildrenOpsModule).build(),
				),
			}),
		).build();
	}
}
