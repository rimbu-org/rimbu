export type SizeTable = number[] | 'regular';

/**
 * Compute a cumulative size table for an array of child blocks.
 * sizes[k] = sum of children[0..k].size (inclusive).
 * Returns 'regular' if the block is regular (all children have the same full subtree size).
 */
export function computeSizeTable(
	children: { get size(): number }[],
	size: number,
	blockSizeBits: number,
	level: number,
): SizeTable {
	const nrChildren = children.length;
	const maxChildSize = 1 << (blockSizeBits * level);

	if (size === maxChildSize * nrChildren) {
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
