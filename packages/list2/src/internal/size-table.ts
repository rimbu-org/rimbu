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

	if (size >= maxChildSize * (nrChildren - 1)) {
		let allButLastFull = true;
		for (let i = 0; i < nrChildren - 1; i++) {
			if (children[i].size !== maxChildSize) {
				allButLastFull = false;
				break;
			}
		}
		if (allButLastFull) return 'regular';
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

	if (sizeTable === 'regular') {
		const levelBits = blockSizeBits * level;
		const blockSize = 1 << levelBits;
		const childIndex = indexWithOffset >>> levelBits;
		const inChildIndex = (indexWithOffset & (blockSize - 1)) + offset;
		return [childIndex, inChildIndex];
	}

	let lo = 0;
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
