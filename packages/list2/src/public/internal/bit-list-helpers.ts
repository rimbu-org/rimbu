import type { IndexRange } from '@rimbu/common/index-range';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { BitList } from '@rimbu/list2/bit';

import type { ListBase } from '#list/list-base';
import type { ListImpl } from '#list/list-impl';

import { Module } from '@rimbu/common/module';
import { Stream } from '@rimbu/stream';

import { createContextModule, type ListContext } from '#list/context-module';

export namespace BitListHelpers {
	export interface Factory extends ListBase.Factory<BitListHelpers.Types> {
		readonly defaultContext: BitList.Context;
		createContext(
			options?: { blockSizeBits?: number | undefined } | undefined,
		): BitList.Context;
	}

	export interface Context
		extends ListBase.Context<BitListHelpers.Types>,
			BitListHelpers.Factory {}

	export interface Types extends ListBase.Types {
		readonly _UT: boolean;
		readonly normal: BitList;
		readonly nonEmpty: BitList.NonEmpty;
		readonly builder: BitList.Builder;
		readonly context: BitList.Context;
	}

	export interface TypesImpl extends ListImpl.Types {
		readonly _UT: boolean;
		readonly outerChildren: bigint & ListBase.OuterChildrenTag;
	}

	export function createBitListContext(
		options?: { blockSizeBits?: number | undefined } | undefined,
		_defaultContext?: ListBase.Context<BitListHelpers.TypesImpl> | undefined,
	): BitList.Context {
		const blockSizeBits = options?.blockSizeBits ?? 5;
		const lengthBits = BigInt(blockSizeBits);
		const lengthMask = (1n << lengthBits) - 1n;

		/**
		 * Bigint encoding:
		 * The lower `lengthBits` bits store (length - 1).
		 * The bits above store the actual boolean values, where bit at position
		 * (lengthBits + i) represents the element at index i.
		 */

		function getLength(children: bigint): number {
			return Number(children & lengthMask) + 1;
		}

		function getBit(children: bigint, index: number): boolean {
			return (children & (1n << BigInt(blockSizeBits + index))) !== 0n;
		}

		function setBit(children: bigint, index: number, value: boolean): bigint {
			const bitPos = BigInt(blockSizeBits + index);
			if (value) {
				return children | (1n << bitPos);
			}
			return children & ~(1n << bitPos);
		}

		function fromArray(values: boolean[]): bigint {
			const len = values.length;
			let result = BigInt(len - 1);
			for (let i = 0; i < len; i++) {
				if (values[i]) {
					result |= 1n << BigInt(blockSizeBits + i);
				}
			}
			return result;
		}

		function toArrayFull(children: bigint): boolean[] {
			const len = getLength(children);
			const result: boolean[] = Array(len);
			for (let i = 0; i < len; i++) {
				result[i] = getBit(children, i);
			}
			return result;
		}

		const outerChildrenOpsModule = Module.createPartial<{
			defines: ListImpl.OuterChildrenOps<BitListHelpers.TypesImpl>;
		}>((mod) => ({
			length(children: bigint) {
				return getLength(children);
			},
			at<T extends boolean = boolean>(children: bigint, index: number): T {
				return getBit(children, index) as T;
			},
			updateAt<T extends boolean>(
				children: bigint,
				index: number,
				update: (current: T) => boolean,
			): bigint {
				const current = getBit(children, index) as T;
				const newValue = update(current);
				if (Object.is(newValue, current)) {
					return children;
				}
				return setBit(children, index, newValue);
			},
			stream<T extends boolean = boolean>(
				children: bigint,
				options: { reversed?: boolean } = {},
			): Stream.NonEmpty<T> {
				const arr = toArrayFull(children);
				return Stream.fromArray(
					arr,
					options,
				).assumeNonEmpty() as Stream.NonEmpty<T>;
			},
			streamRange<T extends boolean>(
				children: bigint,
				options?: { range?: IndexRange; reversed?: boolean },
			): Stream<T> {
				const arr = toArrayFull(children);
				return Stream.fromArray(arr, options) as Stream<T>;
			},
			of(values: boolean[]): bigint {
				return fromArray(values);
			},
			prepend(children: bigint, value: boolean): bigint {
				const len = getLength(children);
				// Shift all bits up by one position
				const dataBits = children >> lengthBits;
				const shifted = dataBits << 1n;
				const withNew = value ? shifted | 1n : shifted;
				return (withNew << lengthBits) | BigInt(len);
			},
			append(children: bigint, value: boolean): bigint {
				const len = getLength(children);
				const newLen = BigInt(len);
				let result = children >> lengthBits;
				if (value) {
					result |= 1n << BigInt(len);
				}
				return (result << lengthBits) | newLen;
			},
			concat(children1: bigint, children2: bigint): bigint {
				const len1 = getLength(children1);
				const len2 = getLength(children2);
				const data1 = children1 >> lengthBits;
				const data2 = children2 >> lengthBits;
				const combined = data1 | (data2 << BigInt(len1));
				return (combined << lengthBits) | BigInt(len1 + len2 - 1);
			},
			toReversed(children: bigint): bigint {
				const len = getLength(children);
				let result = 0n;
				for (let i = 0; i < len; i++) {
					if (getBit(children, i)) {
						result |= 1n << BigInt(len - 1 - i);
					}
				}
				return (result << lengthBits) | BigInt(len - 1);
			},
			toSpliced(
				children: bigint,
				start: number,
				deleteCount: number,
				items: bigint = BigInt(0),
			): bigint {
				const arr = toArrayFull(children);
				const itemsArr = items === 0n ? [] : toArrayFull(items);
				const result = arr.toSpliced(start, deleteCount, ...itemsArr);
				return fromArray(result);
			},
			join(children: bigint, separator: string, reversed = false): string {
				const arr = toArrayFull(children);
				return Stream.fromArray(arr, { reversed })
					.join({ sep: separator })
					.toString();
			},
			map<T extends boolean>(
				children: bigint,
				f: (value: T, index: number) => boolean,
				indexOffset = 0,
			): bigint {
				const len = getLength(children);
				const result: boolean[] = Array(len);
				for (let i = 0; i < len; i++) {
					result[i] = f(getBit(children, i) as T, i + indexOffset);
				}
				return fromArray(result);
			},
			reverseMap<T extends boolean>(
				children: bigint,
				f: (value: T, index: number) => boolean,
				indexOffset = 0,
			): bigint {
				const len = getLength(children);
				const result: boolean[] = Array(len);
				for (let i = 0; i < len; i++) {
					result[i] = f(getBit(children, len - 1 - i) as T, i + indexOffset);
				}
				return fromArray(result);
			},
			forEach<T extends boolean>(
				children: bigint,
				f: (value: T, index: number, halt: () => void) => void,
				options: { reversed: boolean; state: TraverseState },
			): void {
				const { reversed, state } = options;

				if (state.halted) return;

				const length = getLength(children);

				if (!reversed) {
					let i = -1;
					while (!state.halted && ++i < length) {
						f(getBit(children, i) as T, state.nextIndex(), state.halt);
					}
				} else {
					let i = length;
					while (!state.halted && --i >= 0) {
						f(getBit(children, i) as T, state.nextIndex(), state.halt);
					}
				}
			},
			toArray<T extends boolean>(
				children: bigint,
				start = 0,
				end = getLength(children),
				reversed = false,
			): T[] {
				const arr = toArrayFull(children);
				const result = arr.slice(start, end);
				if (reversed) {
					result.reverse();
				}
				return result as T[];
			},
			mutateSet(children: bigint, index: number, value: boolean): bigint {
				return setBit(children, index, value);
			},
			mutateAppend(children: bigint, value: boolean): bigint {
				return mod.append(children, value);
			},
			mutatePrepend(children: bigint, value: boolean): bigint {
				return mod.prepend(children, value);
			},
			mutateDropFirst<T extends boolean>(
				children: bigint,
			): [result: bigint, dropped: T] {
				const dropped = getBit(children, 0) as T;
				const len = getLength(children);
				const data = children >> lengthBits;
				const shifted = data >> 1n;
				const result = (shifted << lengthBits) | BigInt(len - 2);
				return [result, dropped];
			},
			mutateDropLast<T extends boolean>(
				children: bigint,
			): [result: bigint, dropped: T] {
				const len = getLength(children);
				const dropped = getBit(children, len - 1) as T;
				// Clear the top bit and decrease length
				const data = children >> lengthBits;
				const cleared = data & ((1n << BigInt(len - 1)) - 1n);
				const result = (cleared << lengthBits) | BigInt(len - 2);
				return [result, dropped];
			},
			mutateSplice<T extends boolean>(
				children: bigint,
				start: number,
				deleteCount?: number | undefined,
				items: bigint = 0n as unknown as bigint,
			): [result: bigint, deleted: bigint] {
				const arr = toArrayFull(children);
				const itemsArr = items === 0n ? [] : toArrayFull(items);
				const deleted = arr.splice(
					start,
					deleteCount ?? arr.length,
					...itemsArr,
				);
				return [fromArray(arr), fromArray(deleted)];
			},
			safeCopy(children: bigint): bigint {
				return children;
			},
		}));

		return Module.create<ListContext<BitListHelpers.TypesImpl>>((mod) => ({
			...createContextModule<
				ListContext<BitListHelpers.TypesImpl>,
				BitListHelpers.TypesImpl
			>(options)(mod),
			createContext: (
				options: { blockSizeBits?: number | undefined } | undefined,
			) => createBitListContext(options, mod),
			defaultContext: Module.lazy(() => _defaultContext ?? mod),
			outerChildrenOps: Module.lazyGetter(() =>
				Module.create(outerChildrenOpsModule).build(),
			),
		})).build();
	}
}
