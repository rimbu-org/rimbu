import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Update } from '@rimbu/common/update';
import type { Stream } from '@rimbu/stream';

import type { Block, Inner } from '#list/immutable/utils';

import { IndexRange } from '@rimbu/common/index-range';

type TreeOperation<TS, TL = TS> = TS & {
	left: TL;
	middle: TS | null;
	right: TL;
};

interface TreeGetNode<T> {
	readonly length: number;
	get(index: number): T;
}

export function treeGet<T>(
	tree: TreeOperation<TreeGetNode<T>>,
	index: number,
): T {
	const middleIndex = index - tree.left.length;

	if (middleIndex < 0) {
		return tree.left.get(index);
	}

	if (null === tree.middle) {
		return tree.right.get(middleIndex);
	}

	const rightIndex = middleIndex - tree.middle.length;

	if (rightIndex < 0) return tree.middle.get(middleIndex);

	return tree.right.get(rightIndex);
}

export function treeUpdate<
	T,
	TR extends {
		readonly length: number;
		left: Block<T>;
		right: Block<T>;
		middle: Inner<T, any> | null;
		copy(left?: Block<T>, right?: Block<T>, middle?: Inner<T, any> | null): TR;
		updateAt(index: number, update: Update<T>): TR;
	},
>(tree: TR, index: number, update: Update<T>): TR {
	const middleIndex = index - tree.left.length;

	if (middleIndex < 0) {
		return tree.copy(tree.left.updateAt(index, update));
	}

	if (null === tree.middle) {
		return tree.copy(undefined, tree.right.updateAt(middleIndex, update));
	}

	const rightIndex = middleIndex - tree.middle.length;

	if (rightIndex < 0)
		return tree.copy(
			undefined,
			undefined,
			tree.middle.updateAt(middleIndex, update),
		);

	return tree.copy(undefined, tree.right.updateAt(rightIndex, update));
}

interface TreeToArrayNode<T> {
	readonly length: number;
	toArray(options: { range?: IndexRange | undefined; reversed?: boolean }): T[];
}

export function treeToArray<T>(
	tree: TreeOperation<TreeToArrayNode<T>>,
	options: {
		range?: IndexRange | undefined;
		reversed?: boolean | undefined;
	} = {},
): T[] {
	const { range, reversed = false } = options;

	const indexRange = IndexRange.getIndicesFor(
		range ?? { start: 0 },
		tree.length,
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
		const rightStart = Math.max(0, start - tree.left.length);
		const rightEnd = end - tree.left.length;

		if (rightEnd < 0) return leftArray;

		const rightArray = tree.right.toArray({
			range: { start: rightStart, end: rightEnd },
			reversed,
		});

		if (reversed) return rightArray.concat(leftArray);
		return leftArray.concat(rightArray);
	}

	const middleStart = Math.max(0, start - tree.left.length);
	const middleEnd = end - tree.left.length;

	if (middleEnd < 0) return leftArray;

	const middleArray = tree.middle.toArray({
		range: { start: middleStart, end: middleEnd },
		reversed,
	});

	const rightStart = Math.max(0, middleStart - tree.middle.length);
	const rightEnd = middleEnd - tree.middle.length;

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
	tree: TreeOperation<TreeToStreamNode<T>>,
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
	tree: TreeOperation<TreeForEachNode<T>>,
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
