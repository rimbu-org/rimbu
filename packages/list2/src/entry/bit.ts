import type { ListImpl } from '@rimbu/list2/internal/list-impl';

import type { ListBase } from '#list/list-base';

export interface BitList extends ListBase<boolean, BitListHelpers.Types> {}

export namespace BitList {
	export interface NonEmpty
		extends ListBase.NonEmpty<boolean, BitListHelpers.Types>,
			Omit<BitList, keyof ListBase.NonEmpty<any>> {}

	export interface Builder
		extends ListBase.Builder<boolean, BitListHelpers.Types> {}

	export interface Context
		extends BitListHelpers.Factory,
			ListBase.Context<BitListHelpers.Types> {}
}

export namespace BitListHelpers {
	export interface Factory extends ListBase.Factory<BitListHelpers.Types> {}

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
}

// export const BitList: BitListHelpers.Factory =
// 	new ListContext<BitListHelpers.TypesImpl>(2, ({ blockSizeBits }) => {
// 		const lengthBits = BigInt(blockSizeBits);
// 		const lengthMask = (1n << lengthBits) - 1n;

// 		return {
// 			length(children: bigint) {
// 				return Number(children & lengthMask) + 1;
// 			},
// 			stream<T extends boolean = boolean>(
// 				children: bigint,
// 				options: { reversed?: boolean } = {},
// 			): Stream.NonEmpty<T> {
// 				throw new Error('Not implemented');
// 			},
// 			get<T extends boolean = boolean>(children: bigint, index: number): T {
// 				const result =
// 					(children & (1n << BigInt(blockSizeBits + index))) !== 0n;
// 				return result as T;
// 			},
// 			of(values: boolean[]): bigint {
// 				let result = 0n;
// 				for (const value of values) {
// 					result = (result << 1n) | (value ? 1n : 0n);
// 				}
// 				result = (result << lengthBits) | BigInt(values.length - 1);
// 				return result;
// 			},
// 			prepend(children: bigint, value: boolean): bigint {
// 				let result = children >> lengthBits;
// 				const newChildrenLengthBits = (children & lengthMask) + 1n;
// 				result = result | ((value ? 1n : 0n) << newChildrenLengthBits);
// 				result = (result << lengthBits) | newChildrenLengthBits;
// 				return result;
// 			},
// 			append(children: bigint, value: boolean): bigint {
// 				let result = children >> lengthBits;
// 				result = (result << 1n) | (value ? 1n : 0n);
// 				const newChildrenLengthBits = (children & lengthMask) + 1n;
// 				result = (result << lengthBits) | newChildrenLengthBits;
// 				return result;
// 			},
// 			concat(children1: bigint, children2: bigint): bigint {
// 				const length1 = children1 & lengthMask;
// 				const length2 = children2 & lengthMask;
// 				let result = (children1 >> lengthBits) << length2;
// 				result = result | (children2 >> lengthBits);
// 				const newChildrenLengthBits = length1 + length2;
// 				result = (result << lengthBits) | newChildrenLengthBits;
// 				return result;
// 			},
// 			toReversed(children: bigint): bigint {
// 				const length = children & lengthMask;
// 				let result = 0n;
// 				for (let i = 0n; i <= length; i++) {
// 					const bit = (children >> (lengthBits + i)) & 1n;
// 					result = (result << 1n) | bit;
// 				}
// 				result = (result << lengthBits) | length;
// 				return result;
// 			},
// 			toSpliced(
// 				children: bigint,
// 				start: number,
// 				deleteCount: number,
// 				items: boolean[] = [],
// 			): bigint {
// 				throw new Error('Not implemented');
// 			},
// 			toArray<T extends boolean = boolean>(
// 				children: bigint,
// 				startIndex?: number,
// 				endIndex?: number,
// 				reversed = false,
// 			): T[] {
// 				throw new Error('Not implemented');
// 			},
// 			join(children: bigint, separator: string, reversed = false): string {
// 				const length = Number(children & lengthMask) + 1;
// 				const startBit = length + blockSizeBits - 1;

// 				const stream = reversed
// 					? Stream.range(
// 							{ start: startBit, end: startBit - length + 1 },
// 							{ delta: -1 },
// 						)
// 					: Stream.range({ start: blockSizeBits, end: startBit });

// 				return stream
// 					.map((_, index) =>
// 						children & (1n << BigInt(startBit - index)) ? '1' : '0',
// 					)
// 					.join({ sep: separator });
// 			},
// 			mutateAppend(children: bigint, value: boolean): bigint {
// 				return this.append(children, value);
// 			},
// 			mutatePrepend(children: bigint, value: boolean): bigint {
// 				return this.prepend(children, value);
// 			},
// 			mutateSplice(
// 				children: bigint,
// 				start: number,
// 				deleteCount?: number | undefined,
// 				items: boolean[] = [],
// 			): [result: bigint, deleted: bigint] {
// 				throw new Error('Not implemented');
// 			},
// 			safeCopy(children: bigint): bigint {
// 				return children;
// 			},
// 		};
// 	}) as BitListHelpers.Factory;
