import type { Op } from '@rimbu/collection-types/types';

import type { Tree } from '#list/immutable/common';

import { Int } from '@rimbu/base';
import { Stream } from '@rimbu/stream';

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

export function treeStreamSlice<T>(
	tree: Tree<T>,
	start: number,
	end: number,
	options: { reversed?: boolean | undefined } = {},
): Stream<T> {
	const leftStream = tree.left._streamSlice(start, end, options);

	const leftSize = tree.left.size;
	const middleStart = start - leftSize;
	const middleEnd = end - leftSize;

	const middleStream =
		tree.middle?._streamSlice(middleStart, middleEnd, options) ??
		Stream.empty<T>();

	const middleSize = tree.middle?.size ?? 0;
	const rightStart = middleStart - middleSize;
	const rightEnd = middleEnd - middleSize;

	const rightStream = tree.right._streamSlice(rightStart, rightEnd, options);

	const { reversed = false } = options;

	if (reversed) {
		return Stream.from(rightStream, middleStream, leftStream);
	}

	return leftStream.concat(middleStream, rightStream);
}

export function treeUpdate<T, TR extends Tree<T> & { _self: TR }>(
	tree: TR,
	index: Int.AtLeastZero,
	f: (element: T) => T,
): Op.WithResult<TR, [previous: T, current: T], true> {
	const middleIndex = index - tree.left.size;

	if (!Int.isAtLeastZero(middleIndex)) {
		const outcome = tree.left._update(index, f);

		const collection = outcome.hasChanged
			? tree.copy(outcome.collection)
			: tree;

		return { ...outcome, collection };
	}

	if (null === tree.middle) {
		const outcome = tree.right._update(middleIndex, f);

		const collection = outcome.hasChanged
			? tree.copy(undefined, outcome.collection)
			: tree;
		return { ...outcome, collection };
	}

	const rightIndex = middleIndex - tree.middle.size;

	if (!Int.isAtLeastZero(rightIndex)) {
		const outcome = tree.middle._update(middleIndex, f);

		const collection = outcome.hasChanged
			? tree.copy(undefined, undefined, outcome.collection)
			: tree;

		return { ...outcome, collection };
	}

	const outcome = tree.right._update(rightIndex, f);

	const collection = outcome.hasChanged
		? tree.copy(undefined, outcome.collection)
		: tree;
	return { ...outcome, collection };
}
