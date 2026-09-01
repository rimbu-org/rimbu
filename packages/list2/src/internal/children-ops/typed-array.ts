import type { Op } from '@rimbu/collection-types/types';

import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';

import { type ArrayNonEmpty, type IndexRange, OptLazy } from '@rimbu/common';
import { Stream } from '@rimbu/stream';

/**
 * Typed-array backed outer children for `TypedArrayList`.
 *
 * Each block stores its elements in a resizable `ArrayBuffer` viewed through
 * the configured `ViewConstructor` (e.g. `Uint8Array`, `Float64Array`).
 * This mirrors `packages/list/src/internal/typed-array-helpers.ts` but
 * adapted to the `list2` `ChildrenOps` interface (`size` vs `length`,
 * `Op.WithResult`, `OptLazy` fallback, `Stream` range handling, etc.).
 *
 * - `size` is `view.length`
 * - `at` supports negative indices and `OptLazy` fallback
 * - `prepend`/`append`/`concat` allocate a new resizable buffer and copy
 * - `toSpliced`/`toReversed`/`join`/`map`/`filter` etc. allocate new buffers
 * - `mutate*` helpers resize the underlying `ArrayBuffer` in place (requires
 *   resizable buffers created via `createBuffer`)
 * - For complex bulk ops (`filter`, `map` fallback) we reuse `of`/`Array.from`
 *   for simplicity; the max block size is ≤32 so this is cheap
 */
export class TypedArrayOuterChildrenOps<V extends TypedArrayListView>
	implements ChildrenOps<TypedArrayOuterChildrenOps.Types<V>>
{
	readonly ViewConstructor: {
		readonly BYTES_PER_ELEMENT: number;
		new (buffer: ArrayBuffer): V;
		new (buffer: ArrayBuffer, byteOffset: number, length: number): V;
	};
	readonly blockSizeBits: number;

	constructor(
		ViewConstructor: {
			readonly BYTES_PER_ELEMENT: number;
			new (buffer: ArrayBuffer): V;
			new (buffer: ArrayBuffer, byteOffset: number, length: number): V;
		},
		blockSizeBits: number,
	) {
		this.ViewConstructor = ViewConstructor;
		this.blockSizeBits = blockSizeBits;
	}

	private createBuffer(length: number): ArrayBuffer {
		return new ArrayBuffer(length * this.ViewConstructor.BYTES_PER_ELEMENT, {
			maxByteLength:
				(1 << (this.blockSizeBits * this.ViewConstructor.BYTES_PER_ELEMENT)) *
				2,
		});
	}

	private getView(children: ArrayBuffer): V {
		return new this.ViewConstructor(children);
	}

	private fromArray(values: readonly number[]): ArrayBuffer {
		const buffer = this.createBuffer(values.length);
		const view = new this.ViewConstructor(buffer);
		view.set(values as unknown as number[]);
		return buffer;
	}

	of<T>(values: T[]): ArrayBuffer {
		return this.fromArray(values as unknown as number[]);
	}

	size(children: ArrayBuffer): number {
		return this.getView(children).length;
	}

	at<T, O>(
		children: ArrayBuffer,
		index: number,
		otherwise?: OptLazy<O>,
	): T | O {
		const view = this.getView(children) as unknown as {
			length: number;
			at: (i: number) => unknown;
		};
		if (-index > view.length || index >= view.length) {
			return OptLazy(otherwise as OptLazy<O>) as O;
		}
		// TypedArray.at handles negative indices natively
		return (view.at as (i: number) => unknown)(index) as T;
	}

	setAt<T>(children: ArrayBuffer, index: number, value: T): ArrayBuffer {
		const view = this.getView(children) as unknown as {
			length: number;
			at: (i: number) => unknown;
		};
		const len = view.length;
		const i = index < 0 ? len + index : index;
		const current = (view.at as any)(i);
		if (Object.is(current, value)) return children;
		// Use .with if available (ES2023), otherwise copy
		const viewTyped = this.getView(children) as unknown as {
			with?: (i: number, v: number) => V;
		};
		if (typeof viewTyped.with === 'function') {
			const newView = viewTyped.with(
				i,
				value as unknown as number,
			) as unknown as V;
			return (newView as unknown as { buffer: ArrayBuffer }).buffer;
		}
		const newBuffer = this.createBuffer(len);
		const newView = new this.ViewConstructor(newBuffer);
		newView.set(this.getView(children) as unknown as number[]);
		(newView as unknown as Record<number, number>)[i] =
			value as unknown as number;
		return newBuffer;
	}

	updateAt<T>(
		children: ArrayBuffer,
		index: number,
		update: (current: T) => T,
	): Op.WithResult<ArrayBuffer, [previous: T, current: T], true> {
		const view = this.getView(children) as unknown as ArrayLike<number> & {
			at: (i: number) => unknown;
		};
		const len = (view as unknown as { length: number }).length;
		const i = index < 0 ? len + index : index;
		const previous = (view as unknown as { at: (i: number) => unknown }).at(
			i,
		) as T;
		const current = update(previous);
		const hasChanged = !Object.is(previous, current);
		if (!hasChanged) {
			return {
				collection: children,
				hasResult: true,
				result: [previous, current],
				hasChanged: false,
			};
		}
		const viewTyped = this.getView(children) as unknown as {
			with?: (i: number, v: number) => V;
		};
		let newBuffer: ArrayBuffer;
		if (typeof viewTyped.with === 'function') {
			const newView = viewTyped.with(
				i,
				current as unknown as number,
			) as unknown as V;
			newBuffer = (newView as unknown as { buffer: ArrayBuffer }).buffer;
		} else {
			newBuffer = this.createBuffer(len);
			const newView = new this.ViewConstructor(newBuffer);
			newView.set(this.getView(children) as unknown as number[]);
			(newView as unknown as Record<number, number>)[i] =
				current as unknown as number;
		}
		return {
			collection: newBuffer,
			hasResult: true,
			result: [previous, current],
			hasChanged: true,
		};
	}

	stream<T>(
		children: ArrayBuffer,
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream.NonEmpty<T> {
		const view = this.getView(children) as unknown as ArrayLike<T>;
		const arr = Array.from(view as unknown as T[]);
		return Stream.fromArray(arr, options as never).assumeNonEmpty();
	}

	streamRange<T>(
		children: ArrayBuffer,
		range: IndexRange,
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream<T> {
		const view = this.getView(children) as unknown as ArrayLike<T>;
		const arr = Array.from(view as unknown as T[]);
		return Stream.fromArray(arr, {
			...((options ?? {}) as object),
			range,
		} as never) as Stream<T>;
	}

	prepend<T>(children: ArrayBuffer, value: T): ArrayBuffer {
		const view = this.getView(children) as unknown as { length: number };
		const newBuffer = this.createBuffer(view.length + 1);
		const newView = new this.ViewConstructor(newBuffer) as unknown as {
			set: (a: any, o?: number) => void;
			[i: number]: number;
		};
		newView.set(this.getView(children) as unknown as number[], 1);
		newView[0] = value as unknown as number;
		return newBuffer;
	}

	append<T>(children: ArrayBuffer, value: T): ArrayBuffer {
		const view = this.getView(children) as unknown as { length: number };
		const newBuffer = this.createBuffer(view.length + 1);
		const newView = new this.ViewConstructor(newBuffer) as unknown as {
			set: (a: any, o?: number) => void;
			[i: number]: number;
			length: number;
		};
		newView.set(this.getView(children) as unknown as number[]);
		newView[view.length] = value as unknown as number;
		return newBuffer;
	}

	concat(children1: ArrayBuffer, children2: ArrayBuffer): ArrayBuffer {
		const view1 = this.getView(children1) as unknown as { length: number };
		const view2 = this.getView(children2) as unknown as { length: number };
		if (view1.length === 0) return children2;
		if (view2.length === 0) return children1;
		const newBuffer = this.createBuffer(view1.length + view2.length);
		const newView = new this.ViewConstructor(newBuffer) as unknown as {
			set: (a: any, o?: number) => void;
		};
		newView.set(this.getView(children1) as unknown as number[]);
		newView.set(this.getView(children2) as unknown as number[], view1.length);
		return newBuffer;
	}

	toSpliced<T>(
		children: ArrayBuffer,
		start: number,
		deleteCount: number,
		items: ArrayBuffer = this.createBuffer(0),
	): ArrayBuffer {
		const view = this.getView(children) as unknown as {
			length: number;
			subarray: (s: number, e?: number) => any;
		};
		const itemsView = items
			? (new this.ViewConstructor(items) as unknown as {
					length: number;
					subarray: (s: number, e?: number) => any;
				})
			: undefined;
		let deleteAmount = deleteCount;
		if (deleteAmount > 0) {
			deleteAmount = Math.min(view.length - start, deleteAmount);
		} else if (deleteAmount < 0) {
			deleteAmount = 0;
		}
		const resultLength = view.length - deleteAmount + (itemsView?.length ?? 0);
		const newBuffer = this.createBuffer(resultLength);
		const newView = new this.ViewConstructor(newBuffer) as unknown as {
			set: (a: any, o?: number) => void;
		};
		newView.set((view as any).subarray(0, start));
		if (itemsView) {
			newView.set(itemsView as unknown as number[], start);
		}
		newView.set(
			(view as any).subarray(start + deleteAmount),
			start + (itemsView?.length ?? 0),
		);
		return newBuffer;
	}

	toReversed(children: ArrayBuffer): ArrayBuffer {
		const view = this.getView(children) as unknown as {
			length: number;
			toReversed?: () => V;
		};
		if (view.length <= 1) return children;
		const typedView = this.getView(children) as unknown as V & {
			toReversed?: () => V;
		};
		if (typeof typedView.toReversed === 'function') {
			const newView = typedView.toReversed();
			// toReversed returns a new TypedArray with its own buffer
			// Ensure the buffer is resizable with correct maxByteLength by copying
			const newBuffer = this.createBuffer(newView.length as unknown as number);
			new this.ViewConstructor(newBuffer).set(newView as unknown as number[]);
			return newBuffer;
		}
		const newBuffer = this.createBuffer(view.length);
		const newView = new this.ViewConstructor(newBuffer) as unknown as {
			length: number;
			[i: number]: number;
		};
		const oldView = this.getView(children) as unknown as {
			length: number;
			[i: number]: number;
		};
		for (let i = 0; i < view.length; i++) {
			newView[i] = oldView[view.length - 1 - i];
		}
		return newBuffer;
	}

	join(children: ArrayBuffer, separator: string, reversed?: boolean): string {
		const view = this.getView(children) as unknown as {
			join: (s: string) => string;
			length: number;
		};
		if (!reversed) return view.join(separator);
		const arr = Array.from(view as unknown as number[]);
		return arr.reverse().join(separator);
	}

	filter<T>(
		children: ArrayBuffer,
		f: (value: T) => boolean,
		options?: { negate?: boolean | undefined },
	): ArrayBuffer | undefined {
		const negate = options?.negate === true;
		const view = this.getView(children) as unknown as Iterable<T>;
		const arr = Array.from(view);
		const filtered = arr.filter((v) => (negate ? !f(v) : f(v)));
		if (filtered.length === arr.length) return undefined;
		return this.fromArray(filtered as unknown as number[]);
	}

	reverseFilter<T>(
		children: ArrayBuffer,
		f: (value: T) => boolean,
		options?: { negate?: boolean | undefined },
	): ArrayBuffer | undefined {
		const view = this.getView(children) as unknown as ArrayLike<T> & {
			length: number;
		};
		const len = view.length;
		const negate = options?.negate === true;
		const result: T[] = [];
		for (let i = len - 1; i >= 0; i--) {
			const v = (view as unknown as Record<number, T>)[i];
			if (f(v) !== negate) result.push(v);
		}
		if (result.length === len) return undefined;
		return this.fromArray(result as unknown as number[]);
	}

	map<T, T2>(children: ArrayBuffer, f: (value: T) => T2): ArrayBuffer {
		const view = this.getView(children) as unknown as {
			map: (fn: (v: number) => number) => V;
			length: number;
		};
		// Use TypedArray.map when available for performance
		if (typeof view.map === 'function') {
			const resultView = view.map(
				(value) => f(value as unknown as T) as unknown as number,
			);
			// resultView may share buffer handling; ensure resizable copy
			const newBuffer = this.createBuffer(
				resultView.length as unknown as number,
			);
			new this.ViewConstructor(newBuffer).set(
				resultView as unknown as number[],
			);
			return newBuffer;
		}
		const arr = Array.from(this.getView(children) as unknown as T[]).map(
			(v) => f(v) as unknown as number,
		);
		return this.fromArray(arr);
	}

	reverseMap<T, T2>(children: ArrayBuffer, f: (value: T) => T2): ArrayBuffer {
		const view = this.getView(children) as unknown as {
			length: number;
			[i: number]: number;
		};
		const newBuffer = this.createBuffer(view.length);
		const newView = new this.ViewConstructor(newBuffer) as unknown as {
			[i: number]: number;
		};
		for (let i = 0; i < view.length; i++) {
			newView[i] = f(
				view[view.length - 1 - i] as unknown as T,
			) as unknown as number;
		}
		return newBuffer;
	}

	forEach<T>(
		children: ArrayBuffer,
		f: (value: T) => void,
		options?: { reversed?: boolean },
	): void {
		const view = this.getView(children) as unknown as {
			length: number;
			[i: number]: T;
		};
		if (options?.reversed) {
			for (let i = view.length - 1; i >= 0; i--) f(view[i]);
		} else {
			for (let i = 0; i < view.length; i++) f(view[i]);
		}
	}

	toArray<T>(children: ArrayBuffer, reversed = false): ArrayNonEmpty<T> {
		const view = this.getView(children) as unknown as {
			length: number;
			[i: number]: T;
			subarray: (s: number, e: number) => any;
		};
		if (reversed) {
			const arr = Array.from(view as unknown as T[]);
			return arr.reverse() as ArrayNonEmpty<T>;
		}
		return Array.from(view as unknown as T[]) as ArrayNonEmpty<T>;
	}

	sliceArray<T>(
		children: ArrayBuffer,
		start: number,
		end: number,
		reversed?: boolean | undefined,
	): T[] {
		const view = this.getView(children) as unknown as {
			length: number;
			subarray: (s: number, e: number) => any;
			slice?: (s: number, e: number) => any;
		};
		const slice = (
			view as unknown as { subarray: (s: number, e: number) => Iterable<T> }
		).subarray(start, end);
		const arr = Array.from(slice as unknown as T[]);
		if (reversed) return arr.reverse() as T[];
		if (start === 0 && end >= view.length)
			return Array.from(view as unknown as T[]) as T[];
		return arr as T[];
	}

	mutateUpdate<T>(
		children: ArrayBuffer,
		index: number,
		f: (value: T) => T,
	): [result: ArrayBuffer, previous: T, current: T] {
		const view = this.getView(children) as unknown as {
			length: number;
			[i: number]: T;
			at: (i: number) => T;
		};
		const len = view.length;
		const i = index < 0 ? len + index : index;
		const previous = (view as unknown as { at: (i: number) => T }).at(i);
		const current = f(previous);
		if (Object.is(previous, current)) return [children, previous, current];
		(view as unknown as Record<number, T>)[i] = current;
		return [children, previous, current];
	}

	mutatePrepend<T>(children: ArrayBuffer, value: T): ArrayBuffer {
		const view = this.getView(children) as unknown as {
			length: number;
			BYTES_PER_ELEMENT: number;
			copyWithin: (t: number, s: number, e: number) => void;
			[i: number]: number;
		};
		(children as unknown as { resize: (n: number) => void }).resize(
			children.byteLength + view.BYTES_PER_ELEMENT,
		);
		// Need to re-get view after resize as length changed
		const newView = this.getView(children) as unknown as {
			copyWithin: (t: number, s: number, e: number) => void;
			[i: number]: number;
			length: number;
		};
		newView.copyWithin(1, 0, newView.length - 1);
		newView[0] = value as unknown as number;
		return children;
	}

	mutateAppend<T>(children: ArrayBuffer, value: T): ArrayBuffer {
		const view = this.getView(children) as unknown as {
			length: number;
			BYTES_PER_ELEMENT: number;
		};
		(children as unknown as { resize: (n: number) => void }).resize(
			children.byteLength + view.BYTES_PER_ELEMENT,
		);
		const newView = this.getView(children) as unknown as {
			[i: number]: number;
			length: number;
		};
		newView[newView.length - 1] = value as unknown as number;
		return children;
	}

	mutateSplice(
		children: ArrayBuffer,
		start: number,
		deleteCount = 0,
		items?: ArrayBuffer | undefined,
	): [result: ArrayBuffer, deleted: ArrayBuffer] {
		const view = this.getView(children) as unknown as {
			length: number;
			BYTES_PER_ELEMENT: number;
			copyWithin: (t: number, s: number, e: number) => void;
			subarray: (s: number, e: number) => any;
			set: (a: any, o?: number) => void;
			[i: number]: number;
		};
		const itemsView = items
			? (new this.ViewConstructor(items) as unknown as {
					length: number;
					subarray: (s: number, e: number) => any;
				})
			: undefined;
		let deleteAmount = deleteCount;
		if (deleteAmount > 0) {
			deleteAmount = Math.min(view.length - start, deleteAmount);
		} else if (deleteAmount < 0) {
			deleteAmount = 0;
		}
		const deletedBuffer = this.createBuffer(deleteAmount);
		new this.ViewConstructor(deletedBuffer).set(
			(
				view as unknown as {
					subarray: (s: number, e: number) => Iterable<number>;
				}
			).subarray(start, start + deleteAmount) as unknown as number[],
		);
		const oldLength = view.length;
		const itemsLength = itemsView?.length ?? 0;
		const resultLength = oldLength - deleteAmount + itemsLength;
		const resultByteLength = resultLength * view.BYTES_PER_ELEMENT;
		if (resultByteLength > children.byteLength) {
			(children as unknown as { resize: (n: number) => void }).resize(
				resultByteLength,
			);
			const newView = this.getView(children) as unknown as {
				copyWithin: (t: number, s: number, e: number) => void;
			};
			newView.copyWithin(start + itemsLength, start + deleteAmount, oldLength);
		} else {
			const newView = this.getView(children) as unknown as {
				copyWithin: (t: number, s: number, e: number) => void;
			};
			newView.copyWithin(start + itemsLength, start + deleteAmount, oldLength);
			(children as unknown as { resize: (n: number) => void }).resize(
				resultByteLength,
			);
		}
		if (itemsView) {
			this.getView(children).set(itemsView as unknown as number[], start);
		}
		return [children, deletedBuffer];
	}

	mutateDropFirst<T>(children: ArrayBuffer): [result: ArrayBuffer, dropped: T] {
		const view = this.getView(children) as unknown as {
			length: number;
			[i: number]: T;
			copyWithin: (t: number, s: number) => void;
			BYTES_PER_ELEMENT: number;
		};
		const dropped = view[0];
		view.copyWithin(0, 1);
		(children as unknown as { resize: (n: number) => void }).resize(
			children.byteLength - view.BYTES_PER_ELEMENT,
		);
		return [children, dropped];
	}

	mutateDropLast<T>(children: ArrayBuffer): [result: ArrayBuffer, dropped: T] {
		const view = this.getView(children) as unknown as {
			length: number;
			at: (i: number) => T;
			BYTES_PER_ELEMENT: number;
		};
		const dropped = (view as unknown as { at: (i: number) => T }).at(-1);
		(children as unknown as { resize: (n: number) => void }).resize(
			children.byteLength - view.BYTES_PER_ELEMENT,
		);
		return [children, dropped as T];
	}

	guard(children: ArrayBuffer): ArrayBuffer {
		return children;
	}

	safeCopy(children: ArrayBuffer): ArrayBuffer {
		const view = this.getView(children) as unknown as Iterable<number>;
		const newBuffer = this.createBuffer(
			(view as unknown as { length: number }).length,
		);
		new this.ViewConstructor(newBuffer).set(view as unknown as number[]);
		return newBuffer;
	}
}

// Local helper type to avoid importing the full TypedArray union in the internal file
type TypedArrayListView =
	| Int8Array
	| Uint8Array
	| Int16Array
	| Uint16Array
	| Int32Array
	| Uint32Array
	| Float32Array
	| Float64Array;

export declare namespace TypedArrayOuterChildrenOps {
	export interface Types<V extends TypedArrayListView = TypedArrayListView>
		extends ChildrenOps.Types {
		_T: number;
		_C: OuterChildren<this['_T']> & ArrayBuffer;
	}
}
