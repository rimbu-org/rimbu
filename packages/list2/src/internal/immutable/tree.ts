type TreeOperation<TTree, TChild = TTree> = TTree & {
	left: TChild;
	middle: TTree | null;
	right: TChild;
};

interface TreeGetNode<T> {
	readonly size: number;
	get(index: number): T;
}

export function treeGet<T>(
	tree: TreeOperation<TreeGetNode<T>>,
	index: number,
): T {
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
