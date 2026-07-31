import type { OpWithResult } from '@rimbu/list';
import type { Stream } from '@rimbu/stream';

import type { Tree } from '#list/immutable/common';

import { Int } from '@rimbu/base';

export function treeGet<T>(tree: Tree<T>, index: Int.AtLeastZero): T {
	const middleIndex = index - tree.left.size;

	if (!Int.isAtLeastZero(middleIndex)) {
		return tree.left._get(index);
	}

	if (null === tree.middle) {
		return tree.right._get(middleIndex);
	}

	const rightIndex = middleIndex - tree.middle.size;

	if (!Int.isAtLeastZero(rightIndex)) return tree.middle._get(middleIndex);

	return tree.right._get(rightIndex);
}

export function treeStream<T>(
	tree: Tree<T>,
	options: { reversed?: boolean | undefined } = {},
): Stream.NonEmpty<T> {
	const { reversed = false } = options;

	if (reversed) {
		return tree.right
			.stream(options)
			.concat(tree.middle?.stream(options), tree.left.stream(options));
	}

	return tree.left
		.stream(options)
		.concat(tree.middle?.stream(options), tree.right.stream(options));
}

export function treeUpdate<T, TR extends Tree<T> & { _self: TR }>(
	tree: TR,
	index: Int.AtLeastZero,
	f: (element: T) => T,
): OpWithResult<TR, [previous: T, current: T], true> {
	const middleIndex = index - tree.left.size;

	if (!Int.isAtLeastZero(middleIndex)) {
		const [newLeft, hasResult, result, hasChanged] = tree.left._update(
			index,
			f,
		);

		const newTree = hasResult ? tree.copy(newLeft) : tree;

		return [newTree, hasResult, result, hasChanged];
	}

	if (null === tree.middle) {
		const [newRight, hasResult, result, hasChanged] = tree.right._update(
			middleIndex,
			f,
		);

		const newTree = hasResult ? tree.copy(undefined, newRight) : tree;
		return [newTree, hasResult, result, hasChanged];
	}

	const rightIndex = middleIndex - tree.middle.size;

	if (!Int.isAtLeastZero(rightIndex)) {
		const [newMiddle, hasResult, result, hasChanged] = tree.middle._update(
			middleIndex,
			f,
		);

		const newTree = hasResult
			? tree.copy(undefined, undefined, newMiddle)
			: tree;

		return [newTree, hasResult, result, hasChanged];
	}

	const [newRight, hasResult, result, hasChanged] = tree.right._update(
		rightIndex,
		f,
	);

	const newTree = hasResult ? tree.copy(undefined, newRight) : tree;
	return [newTree, hasResult, result, hasChanged];
}
