import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Stream } from '@rimbu/stream';

import type { Tree } from '#list/immutable/utils';

import { IndexRange } from '@rimbu/common/index-range';

interface TreeGetNode<T> {
	readonly itemsLength: number;
	get(index: number): T;
}

export function treeGet<T>(
	tree: Tree<TreeGetNode<T>, TreeGetNode<T>>,
	index: number,
): T {
	const middleIndex = index - tree.left.itemsLength;

	if (middleIndex < 0) {
		return tree.left.get(index);
	}

	if (null === tree.middle) {
		return tree.right.get(middleIndex);
	}

	const rightIndex = middleIndex - tree.middle.itemsLength;

	if (rightIndex < 0) return tree.middle.get(middleIndex);

	return tree.right.get(rightIndex);
}

interface TreeToArrayNode<T> {
	readonly itemsLength: number;
	toArray(options: { range?: IndexRange | undefined; reversed?: boolean }): T[];
}

export function treeToArray<T>(
	tree: Tree<TreeToArrayNode<T>, TreeToArrayNode<T>>,
	options: {
		range?: IndexRange | undefined;
		reversed?: boolean | undefined;
	} = {},
): T[] {
	const { range, reversed = false } = options;

	const indexRange = IndexRange.getIndicesFor(
		range ?? { start: 0 },
		tree.itemsLength,
	);

	if (indexRange === 'empty') return [];
	if (indexRange === 'all') {
		const leftArray = tree.left.toArray({ reversed });
		const rightArray = tree.right.toArray({ reversed });

		if (null === tree.middle) {
			if (reversed) return rightArray.concat(leftArray);
			return leftArray.concat(rightArray);
		}

		const middleArray = tree.middle.toArray({ reversed });

		if (reversed) return rightArray.concat(middleArray, leftArray);
		return leftArray.concat(middleArray, rightArray);
	}

	const [start, end] = indexRange;

	const leftArray = tree.left.toArray({ range: { start, end }, reversed });

	if (null === tree.middle) {
		const rightStart = Math.max(0, start - tree.left.itemsLength);
		const rightEnd = end - tree.left.itemsLength;

		if (rightEnd < 0) return leftArray;

		const rightArray = tree.right.toArray({
			range: { start: rightStart, end: rightEnd },
			reversed,
		});

		if (reversed) return rightArray.concat(leftArray);
		return leftArray.concat(rightArray);
	}

	const middleStart = Math.max(0, start - tree.left.itemsLength);
	const middleEnd = end - tree.left.itemsLength;

	if (middleEnd < 0) return leftArray;

	const middleArray = tree.middle.toArray({
		range: { start: middleStart, end: middleEnd },
		reversed,
	});

	const rightStart = Math.max(0, middleStart - tree.middle.itemsLength);
	const rightEnd = middleEnd - tree.middle.itemsLength;

	if (rightEnd < 0) {
		if (reversed) return middleArray.concat(leftArray);
		return leftArray.concat(middleArray);
	}

	const rightArray = tree.right.toArray({
		range: { start: rightStart, end: rightEnd },
		reversed,
	});

	if (reversed) return rightArray.concat(middleArray, leftArray);
	return leftArray.concat(middleArray, rightArray);
}

interface TreeToStreamNode<T> {
	stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
}

export function treeToStream<T>(
	tree: Tree<TreeToStreamNode<T>, TreeToStreamNode<T>>,
	options: { reversed?: boolean } = {},
): Stream.NonEmpty<T> {
	const { reversed = false } = options;

	const [first, second] = reversed
		? [tree.right, tree.left]
		: [tree.left, tree.right];

	return first
		.stream(options)
		.concat(tree.middle?.stream(options), second.stream(options));
}

interface TreeForEachNode<T> {
	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options?: { reversed?: boolean; state?: TraverseState } | undefined,
	): void;
}

export function treeForEach<T>(
	tree: Tree<TreeForEachNode<T>, TreeForEachNode<T>>,
	f: (value: T, index: number, halt: () => void) => void,
	options: { reversed: boolean; state: TraverseState },
) {
	const { reversed, state } = options;

	if (state.halted) return;

	(reversed ? tree.right : tree.left).forEach(f, options);

	if (state.halted) return;

	tree.middle?.forEach(f, options);

	if (state.halted) return;

	(reversed ? tree.left : tree.right).forEach(f, options);
}
