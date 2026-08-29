import type { Op } from '@rimbu/collection-types/types';

import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';

import { type ArrayNonEmpty, type IndexRange, OptLazy } from '@rimbu/common';
import { Stream } from '@rimbu/stream';

/**
 * Compact bigint encoding for boolean blocks.
 *
 * A `bigint` stores both the length and the bits:
 * ```
 *  LSB                                     MSB
 *  [ length: blockSizeBits+1 bits | data: maxBlockSize bits ]
 *        <- lengthMask ->      <- dataOffset = blockSizeBits+1 ->
 *  bit i (0 = first element) is stored at `1n << (dataOffset + i)`
 *  empty = 0n (length 0, data 0, canonical)
 * ```
 * - `maxBlockSize = 1 << blockSizeBits` (4,8,16,32)
 * - `lengthBits = blockSizeBits + 1` so length `0..maxBlockSize` fits (e.g. 32 needs 6 bits)
 * - `length = Number(children & lengthMask)`, `data = children >> lengthBits`
 * - Little-endian bit order makes `append` a single bit set and `prepend`/`concat`
 *   cheap shifts/or, while keeping random access `O(1)`. Invariant: bits `>= length` are `0`.
 * - For complex bulk ops (`filter`, `toSpliced`, …) with `len <= 32` an array roundtrip
 *   is simpler and fast enough; pure bitwise equivalents would be larger and error-prone.
 * - Bigints are immutable values, so `guard`/`safeCopy`/`mutate*` just return new bigints.
 */
export class BitOuterChildrenOps
	implements ChildrenOps<BitOuterChildrenOps.Types>
{
	readonly #lengthBits: bigint;
	readonly #lengthMask: bigint;
	readonly #dataOffset: number;

	constructor(readonly blockSizeBits: number) {
		this.#lengthBits = BigInt(blockSizeBits + 1);
		this.#lengthMask = (1n << this.#lengthBits) - 1n;
		this.#dataOffset = blockSizeBits + 1;
	}

	#getLength(children: bigint): number {
		return Number(children & this.#lengthMask);
	}

	#getBit(children: bigint, index: number): boolean {
		return (children & (1n << BigInt(this.#dataOffset + index))) !== 0n;
	}

	#setBit(children: bigint, index: number, value: boolean): bigint {
		const bitPos = BigInt(this.#dataOffset + index);
		if (value) return children | (1n << bitPos);
		return children & ~(1n << bitPos);
	}

	#fromArray(values: readonly boolean[]): bigint {
		const len = values.length;
		let result = BigInt(len);
		for (let i = 0; i < len; i++) {
			if (values[i]) result |= 1n << BigInt(this.#dataOffset + i);
		}
		return result;
	}

	#toArrayFull(children: bigint): boolean[] {
		const len = this.#getLength(children);
		const result: boolean[] = Array(len);
		for (let i = 0; i < len; i++) result[i] = this.#getBit(children, i);
		return result;
	}

	of<T extends boolean>(values: T[]): bigint {
		return this.#fromArray(values);
	}

	size(children: bigint): number {
		return this.#getLength(children);
	}

	at<T extends boolean, O>(
		children: bigint,
		index: number,
		otherwise?: OptLazy<O>,
	): T | O {
		const len = this.#getLength(children);
		if (-index > len || index >= len) {
			return OptLazy(otherwise as OptLazy<O>) as O;
		}
		const i = index < 0 ? len + index : index;
		return this.#getBit(children, i) as T;
	}

	setAt<T extends boolean>(children: bigint, index: number, value: T): bigint {
		const len = this.#getLength(children);
		const i = index < 0 ? len + index : index;
		const current = this.#getBit(children, i);
		if (Object.is(current, value)) return children;
		return this.#setBit(children, i, value);
	}

	updateAt<T extends boolean>(
		children: bigint,
		index: number,
		update: (current: T) => T,
	): Op.WithResult<bigint, [previous: T, current: T], true> {
		const len = this.#getLength(children);
		const i = index < 0 ? len + index : index;
		const previous = this.#getBit(children, i) as T;
		const current = update(previous);
		const hasChanged = !Object.is(previous, current);
		return {
			collection: hasChanged ? this.#setBit(children, i, current) : children,
			hasResult: true,
			result: [previous, current],
			hasChanged,
		};
	}

	stream<T extends boolean>(
		children: bigint,
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream.NonEmpty<T> {
		const arr = this.#toArrayFull(children) as T[];
		return Stream.fromArray(arr, options) as Stream.NonEmpty<T>;
	}

	streamRange<T extends boolean>(
		children: bigint,
		range: IndexRange,
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream<T> {
		const arr = this.#toArrayFull(children);
		return Stream.fromArray(arr, { ...options, range }) as Stream<T>;
	}

	prepend<T extends boolean>(children: bigint, value: T): bigint {
		const len = this.#getLength(children);
		const data = children >> this.#lengthBits;
		const shifted = data << 1n;
		const withNew = value ? shifted | 1n : shifted;
		return (withNew << this.#lengthBits) | BigInt(len + 1);
	}

	append<T extends boolean>(children: bigint, value: T): bigint {
		const len = this.#getLength(children);
		let data = children >> this.#lengthBits;
		if (value) data |= 1n << BigInt(len);
		return (data << this.#lengthBits) | BigInt(len + 1);
	}

	concat(children1: bigint, children2: bigint): bigint {
		if (this.#getLength(children1) === 0) return children2;
		if (this.#getLength(children2) === 0) return children1;
		const len1 = this.#getLength(children1);
		const len2 = this.#getLength(children2);
		const data1 = children1 >> this.#lengthBits;
		const data2 = children2 >> this.#lengthBits;
		const combined = data1 | (data2 << BigInt(len1));
		return (combined << this.#lengthBits) | BigInt(len1 + len2);
	}

	toSpliced<T extends boolean>(
		children: bigint,
		start: number,
		deleteCount: number,
		items: bigint = 0n,
	): bigint {
		const arr = this.#toArrayFull(children);
		const itemsArr =
			items === undefined ? ([] as T[]) : this.#toArrayFull(items);
		const result = arr.toSpliced(start, deleteCount, ...itemsArr);
		return this.#fromArray(result);
	}

	toReversed(children: bigint): bigint {
		const len = this.#getLength(children);
		if (len <= 1) return children;
		let reversedData = 0n;
		for (let i = 0; i < len; i++) {
			if (this.#getBit(children, i)) {
				reversedData |= 1n << BigInt(len - 1 - i);
			}
		}
		return (reversedData << this.#lengthBits) | BigInt(len);
	}

	join(children: bigint, separator: string, reversed?: boolean): string {
		const arr = this.#toArrayFull(children);
		if (reversed) {
			let result = '';
			for (let i = arr.length - 1; i >= 0; i--) {
				if (i < arr.length - 1) result += separator;
				result += String(arr[i]);
			}
			return result;
		}
		return arr.join(separator);
	}

	filter<T extends boolean>(
		children: bigint,
		f: (value: T) => boolean,
		options?: { negate?: boolean | undefined },
	): bigint | undefined {
		const arr = this.#toArrayFull(children) as T[];
		const negate = options?.negate === true;
		const result = negate ? arr.filter((value) => !f(value)) : arr.filter(f);
		if (result.length === arr.length) return undefined;
		return this.#fromArray(result);
	}

	reverseFilter<T extends boolean>(
		children: bigint,
		f: (value: T) => boolean,
		options?: { negate?: boolean | undefined },
	): bigint | undefined {
		const len = this.#getLength(children);
		const negate = options?.negate === true;
		const result: boolean[] = [];
		for (let i = len - 1; i >= 0; i--) {
			const value = this.#getBit(children, i) as T;
			if (f(value) !== negate) result.push(value);
		}
		if (result.length === len) return undefined;
		return this.#fromArray(result);
	}

	map<T extends boolean, T2 extends boolean>(
		children: bigint,
		f: (value: T) => T2,
	): bigint {
		const arr = this.#toArrayFull(children) as T[];
		const result = arr.map(f);
		return this.#fromArray(result);
	}

	reverseMap<T extends boolean, T2 extends boolean>(
		children: bigint,
		f: (value: T) => T2,
	): bigint {
		const len = this.#getLength(children);
		const result: boolean[] = new Array(len);
		for (let i = 0; i < len; i++) {
			const value = this.#getBit(children, len - 1 - i) as T;
			result[i] = f(value);
		}
		return this.#fromArray(result);
	}

	forEach<T extends boolean>(
		children: bigint,
		f: (value: T) => void,
		options?: { reversed?: boolean },
	): void {
		const len = this.#getLength(children);
		if (options?.reversed) {
			for (let i = len - 1; i >= 0; i--) f(this.#getBit(children, i) as T);
		} else {
			for (let i = 0; i < len; i++) f(this.#getBit(children, i) as T);
		}
	}

	toArray<T extends boolean>(
		children: bigint,
		reversed = false,
	): ArrayNonEmpty<T> {
		const arr = this.#toArrayFull(children);
		if (reversed) return arr.toReversed() as ArrayNonEmpty<T>;
		return arr as ArrayNonEmpty<T>;
	}

	sliceArray<T extends boolean>(
		children: bigint,
		start: number,
		end: number,
		reversed?: boolean | undefined,
	): T[] {
		const arr = this.#toArrayFull(children) as T[];
		if (reversed) return arr.slice(start, end).reverse();
		if (start === 0 && end >= arr.length) return arr;
		return arr.slice(start, end);
	}

	mutateUpdate<T extends boolean>(
		children: bigint,
		index: number,
		f: (value: T) => T,
	): [result: bigint, previous: T, current: T] {
		const len = this.#getLength(children);
		const i = index < 0 ? len + index : index;
		const previous = this.#getBit(children, i) as T;
		const current = f(previous);
		const result = Object.is(previous, current)
			? children
			: this.#setBit(children, i, current);
		return [result, previous, current];
	}

	mutatePrepend<T extends boolean>(children: bigint, value: T): bigint {
		return this.prepend(children, value);
	}

	mutateAppend<T extends boolean>(children: bigint, value: T): bigint {
		return this.append(children, value);
	}

	mutateSplice(
		children: bigint,
		start: number,
		deleteCount = this.#getLength(children) - start,
		items?: bigint | undefined,
	): [result: bigint, deleted: bigint] {
		const arr = this.#toArrayFull(children);
		const itemsArr = items === undefined ? [] : this.#toArrayFull(items);
		const deleted = arr.splice(start, deleteCount, ...itemsArr);
		return [this.#fromArray(arr), this.#fromArray(deleted)];
	}

	mutateDropFirst<T extends boolean>(
		children: bigint,
	): [result: bigint, dropped: T] {
		const len = this.#getLength(children);
		if (len === 0) return [0n, undefined as unknown as T];
		const dropped = this.#getBit(children, 0) as T;
		const data = children >> this.#lengthBits;
		const shifted = data >> 1n;
		const result = (shifted << this.#lengthBits) | BigInt(len - 1);
		return [result, dropped];
	}

	mutateDropLast<T extends boolean>(
		children: bigint,
	): [result: bigint, dropped: T] {
		const len = this.#getLength(children);
		if (len === 0) return [0n, undefined as unknown as T];
		const dropped = this.#getBit(children, len - 1) as T;
		const data = children >> this.#lengthBits;
		const cleared = data & ((1n << BigInt(len - 1)) - 1n);
		const result = (cleared << this.#lengthBits) | BigInt(len - 1);
		return [result, dropped];
	}

	guard(children: bigint): bigint {
		return children;
	}

	safeCopy(children: bigint): bigint {
		return children;
	}
}

export declare namespace BitOuterChildrenOps {
	export interface Types extends ChildrenOps.Types {
		_T: boolean;
		_C: OuterChildren<this['_T']> & bigint;
	}
}
