// interface List<T> {
// 	readonly length: number;
// 	prepend(value: T): List<T>;
// 	append(value: T): List<T>;
// 	// take(amount: number): List<T>;
// }

// abstract class Block<T, C = unknown> {
// 	declare _self: Block<T, C>;
// 	abstract readonly children: C[];
// 	abstract copy(children?: C[], length?: number): this['_self'];
// 	abstract readonly length: number;

// 	get canAddChild(): boolean {
// 		return this.children.length < 4;
// 	}

// 	get nrChildren(): number {
// 		return this.children.length;
// 	}

// 	prependChild(child: C, childLength: number): this['_self'] {
// 		return this.copy([child, ...this.children], this.length + childLength);
// 	}

// 	appendChild(child: C, childLength: number): this['_self'] {
// 		return this.copy([...this.children, child], this.length + childLength);
// 	}
// }

// abstract class TreeBase<T, C> {
// 	abstract readonly left: Block<T, C>;
// 	abstract readonly right: Block<T, C>;
// 	abstract readonly middle: Inner<T> | null;
// 	abstract readonly length: number;

// 	abstract copy(
// 		left?: Block<T, C>,
// 		right?: Block<T, C>,
// 		middle?: Inner<T> | null,
// 		length?: number,
// 	): TreeBase<T, C>;

// 	abstract createBlock(children: C[], length: number): Block<T, C>;

// 	createMiddleBlock(children: Block<T, C>[], length: number): InnerBlock<T> {
// 		return new InnerBlock(children, length);
// 	}

// 	prependChild(child: C, childLength: number): TreeBase<T, C> {
// 		const newLength = this.length + childLength;

// 		if (this.left.canAddChild) {
// 			return this.copy(
// 				this.left.prependChild(child, childLength),
// 				this.right,
// 				this.middle,
// 				newLength,
// 			);
// 		}

// 		return this.copy(
// 			this.createBlock([child], childLength),
// 			this.left,
// 			this.middle?.prependChild(this.left, this.left.length) ??
// 				this.createMiddleBlock([this.left], this.left.length),
// 			newLength,
// 		);
// 	}

// 	appendChild(child: C, childLength: number): TreeBase<T, C> {
// 		const newLength = this.length + childLength;

// 		if (this.right.canAddChild) {
// 			return this.copy(
// 				this.left,
// 				this.right.appendChild(child, childLength),
// 				this.middle,
// 				newLength,
// 			);
// 		}

// 		return this.copy(
// 			this.left,
// 			this.createBlock([child], childLength),
// 			this.middle?.appendChild(this.right, this.right.length) ??
// 				this.createMiddleBlock([this.right], this.right.length),
// 			newLength,
// 		);
// 	}

// 	prependMiddleBlock(block: Block<T, C>): Inner<T> {
// 		return (
// 			this.middle?.prependChild(block, block.length) ??
// 			this.createMiddleBlock([block], block.length)
// 		);
// 	}

// 	appendMiddleBlock(block: Block<T, C>): Inner<T> {
// 		return (
// 			this.middle?.appendChild(block, block.length) ??
// 			this.createMiddleBlock([block], block.length)
// 		);
// 	}
// }

// class Emoty<T> implements List<T> {
// 	get length(): number {
// 		return 0;
// 	}

// 	prepend(value: T): List<T> {
// 		return new OuterBlock([value]);
// 	}

// 	append(value: T): List<T> {
// 		return new OuterBlock([value]);
// 	}
// }

// class OuterBlock<T> extends Block<T, T> implements List<T> {
// 	declare _self: OuterBlock<T>;
// 	constructor(readonly children: T[]) {
// 		super();
// 	}

// 	get length(): number {
// 		return this.children.length;
// 	}

// 	copy(children: T[]): OuterBlock<T> {
// 		if (children === this.children) return this;
// 		return new OuterBlock(children);
// 	}

// 	prepend(value: T): List<T> {
// 		if (this.canAddChild) {
// 			return this.prependChild(value, 1);
// 		}

// 		return new OuterTree(new OuterBlock([value]), this, null, this.length + 1);
// 	}

// 	append(value: T): List<T> {
// 		if (this.canAddChild) {
// 			return this.appendChild(value, 1);
// 		}

// 		return new OuterTree(this, new OuterBlock([value]), null, this.length + 1);
// 	}

// 	concatChildren(other: OuterBlock<T>): OuterBlock<T> {
// 		return this.copy(this.children.concat(other.children));
// 	}

// 	// concatTree(other: OuterTree<T>): OuterTree<T> {
// 	// 	if (this.length + other.left.length <= 4) {
// 	// 		const newLeft = this.concatChildren(other.left);

// 	// 		return other.copy(newLeft);
// 	// 	}

// 	// 	if (other.left.nrChildren >= 2) {
// 	// 		const newMiddle = other.prependMiddleBlock(other.left);

// 	// 		return other.copy(this, undefined, newMiddle);
// 	// 	}

// 	// 	const newLeft = this.concatChildren(other.left);
// 	// 	const newSecond = newLeft._mutateSplitRight(
// 	// 		newLeft.length - this.context.maxBlockSize,
// 	// 	);
// 	// 	const newMiddle = other.prependMiddleBlock(newSecond);

// 	// 	return other.copy(newLeft, undefined, newMiddle);
// 	// }
// }

// class OuterTree<T> extends TreeBase<T, T> implements List<T> {
// 	constructor(
// 		readonly left: OuterBlock<T>,
// 		readonly right: OuterBlock<T>,
// 		readonly middle: Inner<T> | null,
// 		readonly length: number,
// 	) {
// 		super();
// 	}

// 	copy(
// 		left = this.left,
// 		right = this.right,
// 		middle = this.middle,
// 		length = this.length,
// 	): OuterTree<T> {
// 		if (
// 			left === this.left &&
// 			right === this.right &&
// 			middle === this.middle &&
// 			length === this.length
// 		) {
// 			return this;
// 		}

// 		return new OuterTree(left, right, middle, length);
// 	}

// 	createBlock(children: T[]): OuterBlock<T> {
// 		return new OuterBlock(children);
// 	}

// 	prepend(value: T): List<T> {
// 		const newLength = this.length + 1;

// 		if (this.left.canAddChild) {
// 			return new OuterTree(
// 				this.left.prependChild(value, 1),
// 				this.right,
// 				this.middle,
// 				newLength,
// 			);
// 		}

// 		return new OuterTree(
// 			this.createBlock([value]),
// 			this.left,
// 			this.middle?.prependChild(this.left, this.left.length) ??
// 				new InnerBlock([this.left], this.left.length),
// 			newLength,
// 		);
// 	}

// 	append(value: T): List<T> {
// 		const newLength = this.length + 1;

// 		if (this.right.canAddChild) {
// 			return new OuterTree(
// 				this.left,
// 				this.right.appendChild(value, 1),
// 				this.middle,
// 				newLength,
// 			);
// 		}

// 		return new OuterTree(
// 			this.left,
// 			this.createBlock([value]),
// 			this.middle?.appendChild(this.right, this.right.length) ??
// 				new InnerBlock([this.right], this.right.length),
// 			newLength,
// 		);
// 	}
// }

// class InnerBlock<T> extends Block<T, Block<T>> {
// 	constructor(
// 		readonly children: Block<T>[],
// 		readonly length: number,
// 	) {
// 		super();
// 	}

// 	copy(children = this.children, length = this.length): InnerBlock<T> {
// 		if (children === this.children && length === this.length) return this;
// 		return new InnerBlock(children, length);
// 	}

// 	// takeAndGetLastChild(
// 	// 	amount: number,
// 	// ): [result: Inner<T>, child: Block<T>, childLength: number] {
// 	// 	return 0 as any;
// 	// }
// }

// class InnerTree<T> extends TreeBase<T, Block<T>> {
// 	constructor(
// 		readonly left: InnerBlock<T>,
// 		readonly right: InnerBlock<T>,
// 		readonly middle: Inner<T> | null,
// 		readonly length: number,
// 	) {
// 		super();
// 	}

// 	copy(
// 		left = this.left,
// 		right = this.right,
// 		middle = this.middle,
// 		length = this.length,
// 	): InnerTree<T> {
// 		if (
// 			left === this.left &&
// 			right === this.right &&
// 			middle === this.middle &&
// 			length === this.length
// 		) {
// 			return this;
// 		}

// 		return new InnerTree(left, right, middle, length);
// 	}

// 	createBlock(children: InnerBlock<T>[], length: number): InnerBlock<T> {
// 		return new InnerBlock(children, length);
// 	}

// 	// takeAndGetLastChild(
// 	// 	amount: number,
// 	// ): [result: Inner<T>, child: InnerBlock<T>, childLength: number] {
// 	// 	return 0 as any;
// 	// }
// }

// type Inner<T> = InnerBlock<T> | InnerTree<T>;
