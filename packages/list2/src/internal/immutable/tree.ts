import type { Stream } from '@rimbu/stream';

import type { Tree } from '#list/immutable/common';

export function treeGet<T>(tree: Tree<T>, index: number): T {
	const middleIndex = index - tree.left.size;

	if (middleIndex < 0) {
		return tree.left.get(index);
	}

	if (null === tree.middle) {
		return tree.right.get(middleIndex);
	}

	const rightIndex = middleIndex - tree.middle.size;

	if (rightIndex < 0) return tree.middle.get(middleIndex);

	return tree.right.get(rightIndex);
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
