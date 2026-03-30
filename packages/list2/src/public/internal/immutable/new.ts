// interface List<T> {
// 	append(value: T): List<T>;
// }

// abstract class Block<T, C = unknown> {
// 	declare _self: Block<T, C>;
// 	abstract readonly children: C[];
// 	abstract copy(children: C[]): this['_self'];

// 	get canAddChild(): boolean {
// 		return this.children.length < 4;
// 	}

// 	appendChild(child: C): this['_self'] {
// 		return this.copy([...this.children, child]);
// 	}
// }

// abstract class TreeBase<T, C> {
// 	constructor(
// 		readonly left: Block<T, C>,
// 		readonly right: Block<T, C>,
// 		readonly middle: Inner<T> | null,
// 	) {}

// 	abstract copy(
// 		left: Block<T, C>,
// 		right: Block<T, C>,
// 		middle: Inner<T> | null,
// 	): TreeBase<T, C>;

// 	abstract createBlock(children: C[]): Block<T, C>;

// 	createMiddleBlock(children: Block<T, C>[]): InnerBlock<T> {
// 		return new InnerBlock(children);
// 	}

// 	appendChild(child: C): TreeBase<T, C> {
// 		if (this.right.canAddChild) {
// 			return this.copy(this.left, this.right.appendChild(child), this.middle);
// 		}

// 		return this.copy(
// 			this.left,
// 			this.createBlock([child]),
// 			this.middle?.appendChild(this.right) ??
// 				this.createMiddleBlock([this.right]),
// 		);
// 	}
// }

// class Emoty<T> implements List<T> {
// 	append(value: T): List<T> {
// 		return new OuterBlock([value]);
// 	}
// }

// class OuterBlock<T> extends Block<T, T> implements List<T> {
// 	declare _self: OuterBlock<T>;
// 	constructor(readonly children: T[]) {
// 		super();
// 	}

// 	copy(children: T[]): OuterBlock<T> {
// 		if (children === this.children) return this;
// 		return new OuterBlock(children);
// 	}

// 	append(value: T): List<T> {
// 		if (this.canAddChild) {
// 			return this.appendChild(value);
// 		}
// 		return new OuterTree(this, new OuterBlock([value]), null);
// 	}
// }

// class OuterTree<T> extends TreeBase<T, T> implements List<T> {
// 	copy(
// 		left: Block<T, T>,
// 		right: Block<T, T>,
// 		middle: Inner<T> | null,
// 	): OuterTree<T> {
// 		if (left === this.left && right === this.right && middle === this.middle)
// 			return this;
// 		return new OuterTree(left, right, middle);
// 	}

// 	createBlock(children: T[]): Block<T, T> {
// 		return new OuterBlock(children);
// 	}

// 	append(value: T): List<T> {
// 		if (this.right.canAddChild) {
// 			return new OuterTree(
// 				this.left,
// 				new OuterBlock([...this.right.children, value]),
// 				this.middle,
// 			);
// 		}

// 		return new OuterTree(
// 			this.left,
// 			new OuterBlock([value]),
// 			this.middle?.appendChild(this.right) ?? new InnerBlock([this.right]),
// 		);
// 	}
// }

// class InnerBlock<T> extends Block<T, Block<T>> {
// 	constructor(readonly children: Block<T>[]) {
// 		super();
// 	}

// 	copy(children: Block<T>[]): InnerBlock<T> {
// 		if (children === this.children) return this;
// 		return new InnerBlock(children);
// 	}
// }

// class InnerTree<T> extends TreeBase<T, Block<T>> {
// 	constructor(
// 		readonly left: InnerBlock<T>,
// 		readonly right: InnerBlock<T>,
// 		readonly middle: Inner<T> | null,
// 	) {
// 		super(left, right, middle);
// 	}

// 	copy(
// 		left: InnerBlock<T>,
// 		right: InnerBlock<T>,
// 		middle: Inner<T> | null,
// 	): InnerTree<T> {
// 		if (left === this.left && right === this.right && middle === this.middle)
// 			return this;
// 		return new InnerTree(left, right, middle);
// 	}

// 	createBlock(children: InnerBlock<T>[]): Block<T, Block<T>> {
// 		return new InnerBlock(children);
// 	}
// }

// type Inner<T> = InnerBlock<T> | InnerTree<T>;
