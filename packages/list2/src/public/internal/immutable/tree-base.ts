import type { NonLeaf, Tree } from '#list/immutable/utils';

interface TreeGetNode<T> {
	length: number;
	get(index: number): T;
}

export function treeGet<T>(
	tree: Tree<TreeGetNode<T>, NonLeaf<T>>,
	index: number,
): T {
	const middleIndex = index - tree.left.length;

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
