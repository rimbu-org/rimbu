import type { ListContext } from '#list/context';
import type { Inner } from '#list/immutable/common';
import type { InnerTree } from '#list/immutable/inner-tree';
import type { BlockBuilder, InnerBuilder } from '#list/mutable/common';

import { TreeBuilderBase } from '#list/mutable/tree';

export class InnerTreeBuilder<T, C extends BlockBuilder<T>>
	extends TreeBuilderBase<T, C>
	implements InnerBuilder<T, C>
{
	constructor(
		readonly context: ListContext<T>,
		readonly level: number,
		source?: InnerTree<T, any>,
		public _left?: C,
		public _right?: C,
		public _middle?: InnerBuilder<T, C>,
		public size: number = 0,
	) {
		super();
	}

	get left(): C {
		throw new Error('Method not implemented.');
	}

	get right(): C {
		throw new Error('Method not implemented.');
	}

	get middle(): InnerBuilder<T, C> | undefined {
		throw new Error('Method not implemented.');
	}

	prepareMutate(): void {
		throw new Error('Method not implemented.');
	}

	get(index: number): T {
		throw new Error('Method not implemented.');
	}

	forEach(f: (value: T) => void): void {
		throw new Error('Method not implemented.');
	}

	prependChild(child: C): void {
		throw new Error('Method not implemented.');
	}

	appendChild(child: C): void {
		throw new Error('Method not implemented.');
	}

	firstChild(): C {
		throw new Error('Method not implemented.');
	}

	lastChild(): C {
		throw new Error('Method not implemented.');
	}

	dropFirstChild(): C {
		throw new Error('Method not implemented.');
	}

	dropLastChild(): C {
		throw new Error('Method not implemented.');
	}
	prependBlockChild(block: C, child: C): void {}

	appendBlockChild(block: C, child: C): void {}

	dropBlockFirstChild(block: C): C {
		throw new Error('Method not implemented.');
	}

	dropBlockLastChild(block: C): C {
		throw new Error('Method not implemented.');
	}

	modifyFirstChild(f: (child: C) => number | undefined): number | undefined {
		throw new Error('Method not implemented.');
	}

	modifyLastChild(f: (child: C) => number | undefined): number | undefined {
		throw new Error('Method not implemented.');
	}

	build(): Inner<T, any> {
		throw new Error('Method not implemented.');
	}

	buildMap<T2>(f: (value: T) => T2): Inner<T2, any> {
		throw new Error('Method not implemented.');
	}

	getChildSize(child: C): number {
		return child.size;
	}

	normalized(): InnerBuilder<T, C> | undefined {
		throw new Error('Method not implemented.');
	}
}
