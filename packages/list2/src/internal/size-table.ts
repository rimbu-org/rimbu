export type SizeTable = number[] | 'regular';

/**
 * Compute a cumulative size table for an array of child blocks.
 * sizes[k] = sum of children[0..k].size (inclusive).
 * Returns 'regular' if the block can use the O(1) bitwise coordinate lookup.
 *
 * A block qualifies as regular when:
 * - It has 0 or 1 children (trivially regular), OR
 * - Every child except possibly the last has the exact maxChildSize.
 *   The last child may be smaller without breaking the bitwise formula.
 */
export function computeSizeTable(
	children: { get size(): number }[],
	size: number,
	blockSizeBits: number,
	level: number,
): SizeTable {
	const nrChildren = children.length;
	const maxChildSize = 1 << (blockSizeBits * level);

	if (nrChildren <= 1) {
		return 'regular';
	}

	if (size === maxChildSize * nrChildren) {
		return 'regular';
	}

	const lastChildSize = children.at(-1)!.size;

	if (size - lastChildSize === maxChildSize * (nrChildren - 1)) {
		return 'regular';
	}

	let total = 0;

	const sizeTable = new Array<number>(nrChildren);

	for (let i = 0; i < nrChildren; i++) {
		total += children[i].size;
		sizeTable[i] = total;
	}

	return sizeTable;
}

export function safeCopySizeTable(
	sizeTable: SizeTable | undefined,
): SizeTable | undefined {
	if (Array.isArray(sizeTable)) {
		return sizeTable.slice();
	}
	return sizeTable;
}

/**
 * Resolve a global element index into a [childIndex, positionWithinChild] pair
 * using a cumulative size table. Handles three paths:
 * - overflow (index past end): returns sentinel position
 * - regular (all children are full): O(1) bitwise division
 * - irregular: O(log n) binary search on the cumulative size table
 */
export function getInnerBlockCoordinates(options: {
	index: number;
	size: number;
	nrChildren: number;
	sizeTable: SizeTable;
	blockSizeBits: number;
	level: number;
	forTake?: boolean | undefined;
	noEmptyLast?: boolean | undefined;
	lastChildSize?: number | undefined;
}): [number, number] {
	const {
		index,
		size,
		nrChildren,
		sizeTable,
		blockSizeBits,
		level,
		forTake = false,
		noEmptyLast = false,
		lastChildSize = 0,
	} = options;

	const offset = forTake ? 1 : 0;
	const indexWithOffset = index - offset;

	if (indexWithOffset >= size) {
		if (noEmptyLast) {
			return [nrChildren - 1, lastChildSize - 1];
		}
		return [nrChildren, 0];
	}

	const levelBits = blockSizeBits * level;

	if (sizeTable === 'regular') {
		const blockSize = 1 << levelBits;
		const childIndex = indexWithOffset >>> levelBits;
		const inChildIndex = (indexWithOffset & (blockSize - 1)) + offset;
		return [childIndex, inChildIndex];
	}

	// Each child has at most maxChildSize elements, so the target can't
	// be in a child before floor(indexWithOffset / maxChildSize).
	let lo = indexWithOffset >>> levelBits;
	let hi = nrChildren - 1;

	while (lo < hi) {
		const mid = (lo + hi) >>> 1;
		if (sizeTable[mid] <= indexWithOffset) {
			lo = mid + 1;
		} else {
			hi = mid;
		}
	}

	const childIndex = lo;
	const prevSize = childIndex > 0 ? sizeTable[childIndex - 1] : 0;
	const inChildIndex = indexWithOffset - prevSize + offset;
	return [childIndex, inChildIndex];
}

// /**
//  * Recompute a full cumulative size table from the current mutable children.
//  * Returns null if the block is regular (all children fill exactly blockSize elements).
//  */
// export function recomputeSizes(
// 	children: readonly { size: number }[],
// 	level: number,
// 	blockSizeBits: number,
// ): SizeTable {
// 	if (children.length <= 1) {
// 		return 'regular';
// 	}

// 	const levelBits = blockSizeBits * level;
// 	const blockSize = 1 << levelBits;
// 	const len = children.length;

// 	let total = 0;
// 	let irregular = false;

// 	const sizes = new Array<number>(len);

// 	for (let i = 0; i < len; i++) {
// 		total += children[i].size;
// 		sizes[i] = total;
// 		if (children[i].size !== blockSize) irregular = true;
// 	}

// 	return irregular ? sizes : null;
// }

/**
 * Update the cumulative size table in-place starting from index `from`.
 * Pass the existing sizes array (which must already be non-null).
 */
export function updateSizesFrom(
	sizes: number[],
	children: readonly { length: number }[],
	from: number,
): void {
	const prev = from > 0 ? sizes[from - 1] : 0;
	let total = prev;
	for (let i = from; i < children.length; i++) {
		total += children[i].length;
		sizes[i] = total;
	}
}
