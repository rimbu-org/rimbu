export type SizeTable = number[] | 'regular';

/**
 * Compute a cumulative size table for an array of child blocks.
 * sizes[k] = sum of children[0..k].size (inclusive).
 * Returns 'regular' if the block is regular (all children have the same full subtree size).
 */
export function computeSizeTable(
	children: { get size(): number }[],
	size: number,
	maxBlockSize: number,
): SizeTable {
	const nrChildren = children.length;

	if (size === maxBlockSize * nrChildren) {
		return 'regular';
	}

	let total = 0;
	let irregular = false;

	const sizes = new Array<number>(nrChildren);

	for (let i = 0; i < nrChildren; i++) {
		total += children[i].size;
		sizes[i] = total;
		if (children[i].size !== maxBlockSize) irregular = true;
	}

	return irregular ? sizes : 'regular';
}
