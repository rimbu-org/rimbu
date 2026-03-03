export interface Context {
	readonly maxBlockSize: number;
	leafBlock<T>(children: T[]): LeafBlock<T>;
	leafTree<T>(
		left: LeafBlock<T>,
		right: LeafBlock<T>,
		middle: LeafTreeMiddle<T> | null,
		length: number,
	): LeafTree<T>;
	leafTreeMiddleBlock<T>(
		children: LeafBlock<T>[],
		itemsLength: number,
	): LeafTreeMiddleBlock<T>;
	leafTreeMiddleTree<T>(
		left: LeafTreeMiddleBlock<T>,
		right: LeafTreeMiddleBlock<T>,
		middle: NonLeaf<T> | null,
		itemsLength: number,
	): LeafTreeMiddleTree<T>;
	nonLeafBlock<T>(children: NonLeaf<T>[], itemsLength: number): NonLeafBlock<T>;
	nonLeafTree<T>(
		left: NonLeafBlock<T>,
		right: NonLeafBlock<T>,
		middle: NonLeaf<T> | null,
		itemsLength: number,
	): NonLeafTree<T>;
}

export interface Lst<T> {
	readonly context: Context;
	readonly length: number;
	append(value: T): Lst<T>;
}

export interface Block<T> {
	readonly itemsLength: number;
}

export class LeafBlock<T> implements Lst<T>, Block<T> {
	constructor(
		readonly context: Context,
		readonly children: T[],
	) {}

	get length() {
		return this.children.length;
	}

	get itemsLength() {
		return this.children.length;
	}

	append(value: T): Lst<T> {
		if (this.length < this.context.maxBlockSize) {
			return this.context.leafBlock([...this.children, value]);
		}

		return this.context.leafTree(
			this,
			this.context.leafBlock([value]),
			null,
			this.length + 1,
		);
	}
}

export class LeafTree<T> implements Lst<T> {
	constructor(
		readonly context: Context,
		readonly left: LeafBlock<T>,
		readonly right: LeafBlock<T>,
		readonly middle: LeafTreeMiddle<T> | null,
		readonly length: number,
	) {}

	append(value: T): Lst<T> {
		const newLength = this.length + 1;

		if (this.right.length < this.context.maxBlockSize) {
			return this.context.leafTree(
				this.left,
				this.right.append(value) as LeafBlock<T>,
				this.middle,
				newLength,
			);
		}

		return this.context.leafTree(
			this.left,
			this.context.leafBlock([value]),
			this.middle
				? this.middle.appendChild(this.right)
				: this.context.leafTreeMiddleBlock([this.right], this.right.length),
			newLength,
		);
	}
}

export interface LeafTreeMiddle<T> extends NonLeaf<T> {
	readonly itemsLength: number;
	appendChild(child: LeafBlock<T>): LeafTreeMiddle<T>;
}

export class LeafTreeMiddleBlock<T> implements LeafTreeMiddle<T>, Block<T> {
	constructor(
		readonly context: Context,
		readonly children: LeafBlock<T>[],
		readonly itemsLength: number,
	) {}

	appendChild(child: LeafBlock<T>): LeafTreeMiddle<T> {
		const newLength = this.itemsLength + child.length;

		if (this.children.length < this.context.maxBlockSize) {
			return this.context.leafTreeMiddleBlock(
				[...this.children, child],
				newLength,
			);
		}

		return this.context.leafTreeMiddleTree(
			this,
			this.context.leafTreeMiddleBlock([child], child.length),
			null,
			newLength,
		);
	}
}

export class LeafTreeMiddleTree<T> implements LeafTreeMiddle<T> {
	constructor(
		readonly context: Context,
		readonly left: LeafTreeMiddleBlock<T>,
		readonly right: LeafTreeMiddleBlock<T>,
		readonly middle: NonLeaf<T> | null,
		readonly itemsLength: number,
	) {}

	appendChild(child: LeafBlock<T>): LeafTreeMiddleTree<T> {
		if (this.right.children.length < this.context.maxBlockSize) {
			return this.context.leafTreeMiddleTree(
				this.left,
				this.right.appendChild(child) as LeafTreeMiddleBlock<T>,
				this.middle,
				this.itemsLength + child.length,
			);
		}

		return this.context.leafTreeMiddleTree(
			this.left,
			this.context.leafTreeMiddleBlock([child], child.length),
			this.middle
				? this.middle.appendChild(this.right)
				: this.context.nonLeafBlock([this.right], this.right.itemsLength),
			this.itemsLength + child.length,
		);
	}
}

export interface NonLeaf<T> {
	readonly itemsLength: number;
	appendChild(child: Block<T>): NonLeaf<T>;
}

export class NonLeafBlock<T> implements NonLeaf<T> {
	constructor(
		readonly context: Context,
		readonly children: NonLeaf<T>[],
		readonly itemsLength: number,
	) {}

	appendChild(child: NonLeafBlock<T>): NonLeaf<T> {
		if (this.children.length < this.context.maxBlockSize) {
			return this.context.nonLeafBlock(
				[...this.children, child],
				this.itemsLength + child.itemsLength,
			);
		}

		return this.context.nonLeafTree(
			this,
			this.context.nonLeafBlock([child], child.itemsLength),
			null,
			this.itemsLength + child.itemsLength,
		);
	}
}

export class NonLeafTree<T> implements NonLeaf<T> {
	constructor(
		readonly context: Context,
		readonly left: NonLeafBlock<T>,
		readonly right: NonLeafBlock<T>,
		readonly middle: NonLeaf<T> | null,
		readonly itemsLength: number,
	) {}

	appendChild(child: NonLeafBlock<T>): NonLeafTree<T> {
		if (this.right.children.length < this.context.maxBlockSize) {
			return this.context.nonLeafTree(
				this.left,
				this.right.appendChild(child) as NonLeafBlock<T>,
				this.middle,
				this.itemsLength + child.itemsLength,
			);
		}

		return this.context.nonLeafTree(
			this.left,
			this.context.nonLeafBlock([child], child.itemsLength),
			this.middle
				? this.middle.appendChild(this.right)
				: this.context.nonLeafBlock([this.right], this.right.itemsLength),
			this.itemsLength + child.itemsLength,
		);
	}
}
