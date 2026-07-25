import type { ListContext } from '#list/context';
import type { Block } from '#list/immutable/common';
import type { InnerBlock } from '#list/immutable/inner-block';
import type { BlockBuilder, InnerBuilder } from '#list/mutable/common';

import { throwInvalidUsageError } from '@rimbu/base';

export class InnerBlockBuilder<T, C extends Block<T>>
	implements InnerBuilder<T, C>, BlockBuilder<T, C>
{
	constructor(
		readonly context: ListContext<T>,
		readonly level: number,
		source?: InnerBlock<T, C>,
		children?: C[],
		size: number = source?.size ?? 0,
		sizeTable = source?.computedSizeTable,
	) {
		if (undefined === source && undefined === children) {
			throwInvalidUsageError('Either source or children must be defined');
		}
		if (undefined !== source && undefined !== children) {
			throwInvalidUsageError(
				'Either source or children must be defined, but not both',
			);
		}

		this.#source = source;
		this.#_children = children;
		this.#size = size;
		// this.#_computedSizeTable = sizeTable;
	}

	#source?: InnerBlock<T, C> | undefined;
	#_children?: C[] | undefined;
	// #_computedSizeTable?: SizeTable | undefined;
	#size: number;

	get #children(): C[] {
		return this.#_children as C[];
	}

	get size(): number {
		return this.#size;
	}

	get nrChildren(): number {
		throw new Error('Method not implemented.');
	}

	get canAddChild(): boolean {
		throw new Error('Method not implemented.');
	}

	get canRemoveChild(): boolean {
		throw new Error('Method not implemented.');
	}

	get childrenInMax(): boolean {
		throw new Error('Method not implemented.');
	}

	get childrenInMin(): boolean {
		throw new Error('Method not implemented.');
	}

	#prepareMutate(): void {
		if (undefined === this.#source) return;

		this.#_children = this.#source.mapChildren((child) => child.toBuilder());
		this.#source = undefined;
	}

	get(index: number): T {
		throw new Error('Method not implemented.');
	}

	forEach(f: (element: T) => void): void {
		if (undefined !== this.#source) {
			this.#source.forEach(f);
			return;
		}
		for (const child of this.#children) {
			child.forEach(f);
		}
	}

	prependChild(child: C): void {
		this.#prepareMutate();
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

	modifyFirstChild(f: (child: C) => number | undefined): number | undefined {
		throw new Error('Method not implemented.');
	}

	modifyLastChild(f: (child: C) => number | undefined): number | undefined {
		throw new Error('Method not implemented.');
	}

	build(): InnerBlock<T, C> {
		throw new Error('Method not implemented.');
	}

	buildMap<T2>(f: (value: T) => T2): InnerBlock<T2, any> {
		throw new Error('Method not implemented.');
	}

	normalized(): InnerBlockBuilder<T, C> | undefined {
		throw new Error('Method not implemented.');
	}

	splitRight(index?: number): InnerBlockBuilder<T, C> {
		throw new Error('Method not implemented.');
	}

	prependItems(other: InnerBlockBuilder<T, C>): void {
		throw new Error('Method not implemented.');
	}

	appendItems(other: InnerBlockBuilder<T, C>): void {
		throw new Error('Method not implemented.');
	}
}
