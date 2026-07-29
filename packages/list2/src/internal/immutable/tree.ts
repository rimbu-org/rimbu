import type { Int } from '@rimbu/base';
import type { Stream } from '@rimbu/stream';

import type { Tree } from '#list/immutable/common';

export function treeGet<T>(tree: Tree<T>, index: Int.Natural): T {
	const middleIndex = index - tree.left.size;

	if (middleIndex < 0) {
		return tree.left._get(index);
	}

	if (null === tree.middle) {
		return tree.right._get(middleIndex as Int.Natural);
	}

	const rightIndex = middleIndex - tree.middle.size;

	if (rightIndex < 0) return tree.middle._get(middleIndex as Int.Natural);

	return tree.right._get(rightIndex as Int.Natural);
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
