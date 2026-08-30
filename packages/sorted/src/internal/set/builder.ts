// @ts-nocheck
import type { RelatedTo } from '@rimbu/common/types';
import type { SortedSet } from '@rimbu/sorted/set';

import type { ContextImpl } from '#set/context-factory';
import type { SortedSetNode } from '#set/immutable';

import { Stream, type StreamSource } from '@rimbu/stream';

import { SortedBuilder } from '#sorted/base';
import { SortedIndex } from '#sorted/sorted-index';

// @ts-ignore
export class SortedSetBuilder<T> extends SortedBuilder<T> {
	constructor(
		readonly context: ContextImpl<T>,
		public source?: undefined | SortedSet<T>,
		public _entries?: undefined | T[],
		public _children?: undefined | SortedSetBuilder<T>[],
		public size = source?.size ?? 0,
	) {
		super();
	}

	// @ts-ignore
	createNew(
		source?: undefined | SortedSet<T>,
		entries?: undefined | T[],
		children?: undefined | SortedSetBuilder<T>[],
		size?: undefined | number,
	): SortedSetBuilder<T> {
		return new SortedSetBuilder(this.context, source, entries, children, size);
	}

	prepareMutate(): void {
		if (undefined === this._entries) {
			if (undefined !== this.source) {
				if (this.context.isSortedSetEmpty(this.source)) {
					this._entries = [];
					this._children = [];
				} else if (this.context.isSortedSetLeaf<T>(this.source)) {
					this._entries = this.source.entries.slice();
				} else if (this.context.isSortedSetInner<T>(this.source)) {
					this._entries = this.source.entries.slice();
					this._children = this.source.children.map(
						(child): SortedSetBuilder<T> => this.createNew(child),
					);
				}
			}

			if (undefined === this._entries) this._entries = [];
		}
	}

	// @ts-ignore
	get children(): SortedSetBuilder<T>[] {
		this.prepareMutate();
		return this._children!;
	}

	// @ts-ignore
	set children(value: SortedSetBuilder<T>[]) {
		this.prepareMutate();
		this.source = undefined;
		this._children = value;
	}

	has = <U>(value: RelatedTo<T, U>): boolean => {
		if (!this.context.comp.isComparable(value)) return false;

		if (undefined !== this.source) return this.source.has<U>(value);

		const index = this.context.findIndex(value as T, this.entries);

		if (index >= 0) return true;

		if (!this.hasChildren) return false;

		const childIndex = SortedIndex.next(index);
		const child = this.children[childIndex];

		return child.has<U>(value);
	};

	clear = (): void => {
		this._entries = [];
		this._children = [];
		this.size = 0;
		this.source = undefined;
	};

	// @ts-ignore: override to match new Collection BuilderApi
	forEach = (...args: any[]): void => {
		const [f, options] = args;
		if (typeof f === 'function' && f.length === 1) {
			// simple forEach
			(this as any).forEachIndexed((value: T) => f(value), options);
		} else {
			(SortedBuilder.prototype.forEach as any).call(this, f, options);
		}
	};

	forEachIndexed = (
		f: (value: T, index: number, halt: () => void) => void,
		options: { state?: any } = {},
	): void => {
		// delegate to SortedBuilder's forEach which is indexed
		(SortedBuilder.prototype.forEach as any).call(this, f, options);
	};

	at = (index: number, otherwise?: any): any => {
		return this.atIndex(index, otherwise);
	};

	first = (otherwise?: any): any => {
		return this.min(otherwise);
	};

	last = (otherwise?: any): any => {
		return this.max(otherwise);
	};

	indexOf = (value: T, otherwise?: any): any => {
		// use built set for simplicity
		if (undefined !== this.source) return this.source.indexOf(value, otherwise);
		// fallback: search via entries
		let found: number | undefined;
		this.forEachIndexed((v, i, halt) => {
			if (Object.is(v, value) || this.context.comp.compare(v, value) === 0) {
				found = i;
				halt();
			}
		});
		if (undefined !== found) return found;
		return otherwise as any;
	};

	streamSlice = (_range?: any, _options?: any): any => {
		return this.build().streamSlice(_range, _options);
	};

	previous = (value: T, options?: any): any => {
		return this.build().previous(value, options);
	};

	next = (value: T, options?: any): any => {
		return this.build().next(value, options);
	};

	add = (value: T): boolean => {
		this.checkLock();

		const result = this.addInternal(value);
		this.normalize();
		return result;
	};

	addAll = (source: StreamSource<T>): boolean => {
		this.checkLock();

		return Stream.from(source).filterPure({ pred: this.add }).count() > 0;
	};

	remove = <U>(value: RelatedTo<T, U>): boolean => {
		this.checkLock();

		if (!this.context.comp.isComparable(value)) return false;

		const result = this.removeInternal(value);
		this.normalize();
		return result;
	};

	removeAll = <U>(values: StreamSource<RelatedTo<T, U>>): boolean => {
		this.checkLock();

		return Stream.from(values).filterPure({ pred: this.remove }).count() > 0;
	};

	build = (): SortedSet<T> => {
		if (undefined !== this.source) return this.source;
		if (this.size === 0) return this.context.empty();
		if (!this.hasChildren) {
			return this.context.leaf(this.entries.slice());
		}
		return this.context.inner(
			this.entries.slice(),
			this.children.map(
				(child): SortedSetNode<T> => child.build() as SortedSetNode<T>,
			),
			this.size,
		);
	};

	addInternal(value: T): boolean {
		const entryIndex = this.context.findIndex(value, this.entries);

		if (entryIndex >= 0) {
			return false;
		}

		const childIndex = SortedIndex.next(entryIndex);

		if (!this.hasChildren) {
			this.source = undefined;

			this.size++;

			this.entries.splice(childIndex, 0, value);
			return true;
		}

		const child = this.children[childIndex];
		const preSize = child.size;
		const changed = child.addInternal(value);

		if (!changed) return false;

		this.source = undefined;

		this.size += child.size - preSize;
		this.normalizeChildDecrease(childIndex);
		return changed;
	}

	removeInternal(value: T): boolean {
		if (this.size === 0) return false;

		const entryIndex = this.context.findIndex(value, this.entries);

		if (entryIndex >= 0) {
			this.source = undefined;

			this.size--;

			if (!this.hasChildren) {
				this.entries.splice(entryIndex, 1);
				return true;
			}

			const leftChild = this.children[entryIndex];
			const rightChild = this.children[entryIndex + 1];

			if (leftChild.size >= rightChild.size) {
				this.entries[entryIndex] = leftChild.deleteMax();
				this.normalizeChildIncrease(entryIndex);
			} else {
				this.entries[entryIndex] = rightChild.deleteMin();
				this.normalizeChildIncrease(entryIndex + 1);
			}

			return true;
		}

		if (!this.hasChildren) return false;

		const childIndex = SortedIndex.next(entryIndex);
		const child = this.children[childIndex];

		const preSize = child.size;
		const changed = child.removeInternal(value);

		if (!changed) return false;

		this.source = undefined;

		this.size += child.size - preSize;

		this.normalizeChildIncrease(childIndex);
		return true;
	}
}
