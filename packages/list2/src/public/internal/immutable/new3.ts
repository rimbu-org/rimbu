// interface List<T> {
// 	readonly length: number;
// 	prepend(value: T): List<T>;
// 	append(value: T): List<T>;
// 	// take(amount: number): List<T>;
// 	structure(): string;
// }

// abstract class Block<T, C = unknown> {
// 	declare _self: Block<T, C>;
// 	declare _generic: unknown;

// 	abstract readonly children: C[];
// 	abstract copy(children?: C[], length?: number): this['_self'];
// 	abstract readonly length: number;
// 	abstract structure(): string;

// 	get canAddChild(): boolean {
// 		return this.children.length < 4;
// 	}

// 	get nrChildren(): number {
// 		return this.children.length;
// 	}

// 	abstract createBlock(children: C[], length: number): this['_self'];

// 	abstract createTree(
// 		left: this['_self'],
// 		right: this['_self'],
// 		middle: Inner<T, this['_self']> | null,
// 		length: number,
// 	): Tree<T, C>;

// 	prependBlockChild(child: C, childLength: number): this['_self'] {
// 		return this.copy([child, ...this.children], this.length + childLength);
// 	}

// 	appendBlockChild(child: C, childLength: number): this['_self'] {
// 		return this.copy([...this.children, child], this.length + childLength);
// 	}

// 	prependChild(child: C, childLength: number): this['_generic'] {
// 		if (this.canAddChild) {
// 			return this.prependBlockChild(child, childLength);
// 		}

// 		return this.createTree(
// 			this,
// 			this.createBlock([child], childLength),
// 			null,
// 			this.length + childLength,
// 		);
// 	}

// 	appendChild(child: C, childLength: number): this['_generic'] {
// 		if (this.canAddChild) {
// 			return this.appendBlockChild(child, childLength);
// 		}

// 		return this.createTree(
// 			this,
// 			this.createBlock([child], childLength),
// 			null,
// 			this.length + childLength,
// 		);
// 	}
// }

// abstract class Tree<T, C> {
// 	declare _self: Tree<T, C>;

// 	abstract readonly left: Block<T, C>;
// 	abstract readonly right: Block<T, C>;
// 	abstract readonly middle: Inner<T, Block<T, C>> | null;
// 	abstract readonly length: number;

// 	abstract copy(
// 		left?: Block<T, C>,
// 		right?: Block<T, C>,
// 		middle?: Inner<T, Block<T, C>> | null,
// 		length?: number,
// 	): this['_self'];

// 	abstract createBlock(children: C[], length: number): Block<T, C>;

// 	createMiddleBlock(
// 		children: Block<T, C>[],
// 		length: number,
// 	): InnerBlock<T, Block<T, C>> {
// 		return new InnerBlock(children, length);
// 	}

// 	prependChild(child: C, childLength: number): this['_self'] {
// 		const newLength = this.length + childLength;

// 		if (this.left.canAddChild) {
// 			return this.copy(
// 				this.left.prependBlockChild(child, childLength),
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

// 	appendChild(child: C, childLength: number): this['_self'] {
// 		const newLength = this.length + childLength;

// 		if (this.right.canAddChild) {
// 			return this.copy(
// 				this.left,
// 				this.right.appendBlockChild(child, childLength),
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

// 	prependMiddleBlock(block: Block<T, C>): Inner<T, Block<T, C>> {
// 		return (
// 			this.middle?.prependChild(block, block.length) ??
// 			this.createMiddleBlock([block], block.length)
// 		);
// 	}

// 	appendMiddleBlock(block: Block<T, C>): Inner<T, Block<T, C>> {
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

// 	take() {
// 		return this;
// 	}

// 	structure(): string {
// 		return '<Emoty>';
// 	}
// }

// class OuterBlock<T> extends Block<T, T> implements List<T> {
// 	declare _self: OuterBlock<T>;
// 	declare _generic: List<T>;

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

// 	createBlock(children: T[]): OuterBlock<T> {
// 		return new OuterBlock(children);
// 	}

// 	createTree(
// 		left: OuterBlock<T>,
// 		right: OuterBlock<T>,
// 		middle: Inner<T, OuterBlock<T>> | null,
// 		length: number,
// 	): OuterTree<T> {
// 		return new OuterTree(left, right, middle, length);
// 	}

// 	prepend(value: T): List<T> {
// 		return this.prependChild(value, 1);
// 	}

// 	append(value: T): List<T> {
// 		return this.appendChild(value, 1);
// 	}

// 	concatChildren(other: OuterBlock<T>): OuterBlock<T> {
// 		return this.copy(this.children.concat(other.children));
// 	}

// 	take(amount: number): List<T> {
// 		if (amount >= this.length) return this;
// 		if (amount <= 0) return new Emoty();

// 		return this.copy(this.children.slice(0, amount));
// 	}

// 	structure(): string {
// 		return `<OuterBlock(${this.length}) [${this.children.join(', ')}]>`;
// 	}
// }

// class OuterTree<T> extends Tree<T, T> implements List<T> {
// 	declare _self: OuterTree<T>;

// 	constructor(
// 		readonly left: OuterBlock<T>,
// 		readonly right: OuterBlock<T>,
// 		readonly middle: Inner<T, OuterBlock<T>> | null,
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
// 				this.left.prependBlockChild(value, 1),
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
// 				this.right.appendBlockChild(value, 1),
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

// 	// take(amount: number): List<T> {
// 	// 	if (amount >= this.length) return this;
// 	// 	if (amount <= 0) return new Emoty();

// 	// 	const middleAmount = amount - this.left.length;

// 	// 	if (middleAmount <= 0) return this.left.take(amount);

// 	// 	if (null === this.middle) {
// 	// 		return this.copy(
// 	// 			undefined,
// 	// 			this.right.takeChildren(middleAmount),
// 	// 		)._normalize();
// 	// 	}

// 	// 	const rightAmount = middleAmount - this.middle.length;

// 	// 	if (rightAmount > 0) {
// 	// 		const newRight = this.right.takeChildren(rightAmount);
// 	// 		return this.copy(undefined, newRight)._normalize();
// 	// 	}

// 	// 	const [newMiddle, upRight, inUpRight] =
// 	// 		this.middle.takeAndGetLastChild(middleAmount);

// 	// 	const newRight = upRight.takeChildren(inUpRight);

// 	// 	return this.copy(undefined, newRight, newMiddle)._normalize();
// 	// }

// 	structure(): string {
// 		return `<OuterTree(${this.length}) <left:${this.left.structure()}> | <middle:${this.middle?.structure() ?? 'null'}> | <right:${this.right.structure()}>>`;
// 	}
// }

// class InnerBlock<T, C extends Block<T>> extends Block<T, C> {
// 	declare _self: InnerBlock<T, C>;
// 	declare _generic: Inner<T, C>;

// 	constructor(
// 		readonly children: C[],
// 		readonly length: number,
// 	) {
// 		super();
// 	}

// 	copy(children = this.children, length = this.length): InnerBlock<T, C> {
// 		if (children === this.children && length === this.length) return this;
// 		return new InnerBlock(children, length);
// 	}

// 	createBlock(children: C[], length: number): this['_self'] {
// 		return new InnerBlock(children, length);
// 	}

// 	createTree(
// 		left: InnerBlock<T, C>,
// 		right: InnerBlock<T, C>,
// 		middle: Inner<T, InnerBlock<T, C>> | null,
// 		length: number,
// 	): InnerTree<T, C> {
// 		return new InnerTree(left, right, middle, length);
// 	}

// 	takeAndGetLastChild(
// 		amount: number,
// 	): [result: Inner<T, C>, child: C, childLength: number] {
// 		return 0 as any;
// 	}

// 	structure(): string {
// 		return `<InnerBlock(${this.nrChildren}, ${this.length}) [${this.children.map((c) => c.structure()).join(', ')}]>`;
// 	}
// }

// class InnerTree<T, C extends Block<T> = Block<T>> extends Tree<T, C> {
// 	declare _self: InnerTree<T, C>;

// 	constructor(
// 		readonly left: InnerBlock<T, C>,
// 		readonly right: InnerBlock<T, C>,
// 		readonly middle: Inner<T, InnerBlock<T, C>> | null,
// 		readonly length: number,
// 	) {
// 		super();
// 	}

// 	copy(
// 		left = this.left,
// 		right = this.right,
// 		middle = this.middle,
// 		length = this.length,
// 	): InnerTree<T, C> {
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

// 	createBlock(children: C[], length: number): InnerBlock<T, C> {
// 		return new InnerBlock(children, length);
// 	}

// 	takeAndGetLastChild(
// 		amount: number,
// 	): [result: Inner<T, C>, child: C, childLength: number] {
// 		return 0 as any;
// 	}

// 	structure(): string {
// 		return `<InnerTree(${this.length}) <left:${this.left.structure()}> | <middle:${this.middle?.structure() ?? 'null'}> | <right:${this.right.structure()}>>`;
// 	}
// }

// type Inner<T, C extends Block<T>> = InnerBlock<T, C> | InnerTree<T, C>;

// let list: List<number> = new Emoty();

// for (let i = 0; i < 200; i++) {
// 	console.log();
// 	list = list.append(i);
// 	console.log(list.structure());
// }
