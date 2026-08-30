import type { RelatedTo } from '@rimbu/common/types';
import type { SortedMap } from '@rimbu/sorted/map';

import type { ContextImpl } from '#map/context-factory';
import type { SortedMapNode } from '#map/immutable';

import { Token } from '@rimbu/base/token';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream, type StreamSource } from '@rimbu/stream';

import { SortedBuilder } from '#sorted/base';
import { SortedIndex } from '#sorted/sorted-index';

// @ts-ignore
// @ts-ignore
export class SortedMapBuilder<K, V>
	extends SortedBuilder<readonly [K, V]>
	implements SortedMap.Builder<K, V>
{
	constructor(
		readonly context: ContextImpl<K>,
		public source?: undefined | SortedMap<K, V>,
		public _entries?: undefined | (readonly [K, V])[],
		public _children?: undefined | SortedMapBuilder<K, V>[],
		public size = source?.size ?? 0,
	) {
		super();
	}

// @ts-ignore
	createNew(
		source?: undefined | SortedMap<K, V>,
		_entries?: undefined | (readonly [K, V])[],
		_children?: undefined | SortedMapBuilder<K, V>[],
		size?: undefined | number,
	): SortedMapBuilder<K, V> {
		return new SortedMapBuilder(
			this.context,
			source,
			_entries,
			_children,
			size,
		);
	}

	prepareMutate(): void {
		if (undefined === this._entries) {
			if (undefined !== this.source) {
				if (this.context.isSortedMapEmpty(this.source)) {
					this._entries = [];
					this._children = [];
				} else if (this.context.isSortedMapLeaf<K, V>(this.source)) {
					this._entries = this.source.entries.slice();
				} else if (this.context.isSortedMapInner<K, V>(this.source)) {
					this._entries = this.source.entries.slice();
					this._children = this.source.children.map(
// @ts-ignore
						(child): SortedMapBuilder<K, V> => this.createNew(child),
					);
				}
			}

			if (undefined === this._entries) {
				this._entries = [];
			}
		}
	}

// @ts-ignore
	get children(): SortedMapBuilder<K, V>[] {
		this.prepareMutate();
		return this._children!;
	}

// @ts-ignore
	set children(value: SortedMapBuilder<K, V>[]) {
		this.prepareMutate();
		this.source = undefined;
		this._children = value;
	}

	get = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
		if (!this.context.comp.isComparable(key)) return OptLazy(otherwise) as O;

// @ts-ignore
		if (undefined !== this.source) return this.source.get(key, otherwise!);

		const entryIndex = this.context.findIndex(key, this.entries);

		if (entryIndex >= 0) {
			return this.entries[entryIndex][1];
		}

		if (this.hasChildren) {
			const childIndex = SortedIndex.next(entryIndex);
			const child = this.children[childIndex];

			return child.get(key, otherwise);
		}

		return OptLazy(otherwise) as O;
	};

	at = (index: number, otherwise?: any): any => {
		return this.atIndex(index, otherwise);
	};

	hasKey = <UK>(key: RelatedTo<K, UK>): boolean => {
		return Token !== this.get(key, Token);
	};

	// aliases for new KeyedCollection API
	has = this.hasKey as any;
	at = this.get as any;

	clear = (): void => {
		this._entries = [];
		this._children = [];
		this.size = 0;
		this.source = undefined;
	};

	// @ts-ignore
	forEach = (...args: any[]): void => {
		const [f, options] = args;
		if (typeof f === 'function' && f.length === 1) {
			(this as any).forEachIndexed((v: any) => f(v), options);
		} else {
			// @ts-ignore
			const base = Object.getPrototypeOf(Object.getPrototypeOf(this));
			if (base && base.forEach) base.forEach.call(this, f, options);
			else (this as any).forEachIndexed(f, options);
		}
	};

	forEachIndexed = (f: any, options: any = {}): void => {
		// @ts-ignore
		const SortedBuilderProto = Object.getPrototypeOf(Object.getPrototypeOf(this));
		if (SortedBuilderProto && SortedBuilderProto.forEach) SortedBuilderProto.forEach.call(this, f, options);
	};

	first = (..._args: any[]): any => {
		return (this as any).min(..._args);
	};

	last = (..._args: any[]): any => {
		return (this as any).max(..._args);
	};

	atIndex = (index: any, otherwise?: any): any => {
		if (undefined !== this.source) return (this.source as any).atIndex(index, otherwise);
		// fallback via build
		return (this as any).build().atIndex(index, otherwise);
	};

	indexOf = (key: any, otherwise?: any): any => {
		if (undefined !== this.source) return (this.source as any).indexOf(key, otherwise);
		let found: number | undefined;
// @ts-ignore
		let idx = 0;
		let halted = false;
// @ts-ignore
		const halt = () => { halted = true; };
		this.forEachIndexed((entry: any, i: number, h: any) => {
			if (halted) return;
			if (Object.is(entry[0], key) || this.context.comp.compare(entry[0], key) === 0) {
				found = i;
				h();
				halted = true;
			}
		});
		if (undefined !== found) return found;
		return otherwise as any;
	};

	streamSlice = (_range?: any, _options?: any): any => {
		return (this as any).build().streamSlice(_range, _options);
	};

	previous = (key: any, options?: any): any => {
		return (this as any).build().previousEntry(key, options);
	};

	next = (key: any, options?: any): any => {
		return (this as any).build().nextEntry(key, options);
	};

	addEntry = (entry: readonly [K, V]): boolean => {
		this.checkLock();

		const result = this.addEntryInternal(entry);
		this.normalize();
		return result;
	};

	addEntries = (source: StreamSource<readonly [K, V]>): boolean => {
		this.checkLock();

		return Stream.from(source).filterPure({ pred: this.addEntry }).count() > 0;
	};

	// aliases for Collection WithAdd
	add = this.addEntry as any;
	addAll = this.addEntries as any;

	set = (key: K, value: V): boolean => {
		return this.addEntry([key, value]);
	};

	removeKey = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
		this.checkLock();

		if (!this.context.comp.isComparable(key)) return OptLazy(otherwise) as O;

		const result = this.removeInternal(key, otherwise);
		this.normalize();
		return result;
	};

	removeKeys = <UK>(keys: StreamSource<RelatedTo<K, UK>>): boolean => {
		this.checkLock();

		if (Stream.isEmptyStreamSourceInstance(keys)) return false;

		const notFound = Symbol();

		return (
			Stream.from(keys)
				.mapPure(this.removeKey, notFound)
				.countElement(notFound, { negate: true }) > 0
		);
	};

	modifyAt = (key: K, options: ModifyOptions<V>): boolean => {
		this.checkLock();
		if (checkEmptyModifyOptions(options)) return false;

		const result = this.modifyAtInternal(key, options);
		this.normalize();
		return result;
	};

	removeAt = (index: number, otherwise?: any): any => {
		this.checkLock();
		const sz = this.size;
		let idx = index;
		if (idx < 0) idx = sz + idx;
		if (idx < 0 || idx >= sz) return otherwise as any;
		const entry = this.atIndex(idx) as readonly [K, V];
		this.removeKey(entry[0] as any);
		this.normalize();
		return entry;
	};

	removeAmountAt = (index: number, amount: number): boolean => {
		this.checkLock();
		const sz = this.size;
		let idx = index;
		if (idx < 0) idx = sz + idx;
		if (idx < 0 || idx >= sz) return false;
		if (amount <= 0) return false;
		let removed = false;
		for (let i = 0; i < amount; i++) {
			const e = this.atIndex(idx) as readonly [K, V] | undefined;
			if (undefined === e) break;
			removed = (undefined !== this.removeKey(e[0] as any, Symbol())) || removed;
		}
		if (removed) this.normalize();
		return removed;
	};

	removeAllAt = (indices: any, _collector?: any): any => {
		this.checkLock();
		const arr = (Stream.from(indices).toArray() as number[]).slice().sort((a: number, b: number) => b - a);
		let changed = false;
		for (const idx of arr as number[]) {
			const e = this.atIndex(idx) as readonly [K, V] | undefined;
			if (undefined !== e) {
				const v = this.removeKey(e[0] as any, Symbol());
				if (v !== Symbol()) changed = true;
			}
		}
		if (changed) this.normalize();
		if (_collector) return changed;
		return changed;
	};

	updateAt = <O>(
		key: K,
		update: (value: V) => V,
		otherwise?: OptLazy<O>,
	): V | O => {
		let result: V;
		let found = false;

		this.modifyAt(key, {
			ifExists: {
				update: (value): V => {
					result = value;
					found = true;
					return update(value);
				},
			},
		});

		if (!found) return OptLazy(otherwise) as O;

		return result!;
	};

	// aliases for new names
	modifyAtKey = this.modifyAt as any;
	updateAtKey = this.updateAt as any;

	build = (): SortedMap<K, V> => {
		if (undefined !== this.source) return this.source;
		if (this.size === 0) return this.context.empty();
		if (!this.hasChildren) {
// @ts-ignore
			return this.context.leaf(this.entries.slice());
		}
// @ts-ignore
		return this.context.inner(
			this.entries.slice(),
			this.children.map(
// @ts-ignore
				(child): SortedMapNode<K, V> => child.build() as SortedMapNode<K, V>,
			),
			this.size,
		);
	};

	buildMapValues = <V2>(f: (value: V, key: K) => V2): SortedMap<K, V2> => {
// @ts-ignore
		if (undefined !== this.source) return this.source.mapValues(f);
		if (this.size === 0) return this.context.empty();

		const newEntries = this.entries.map((entry): [K, V2] => [
			entry[0],
			f(entry[1], entry[0]),
		]);

		if (!this.hasChildren) {
// @ts-ignore
			return this.context.leaf(newEntries);
		}

// @ts-ignore
		return this.context.inner(
			newEntries,
			this.children.map(
				(c): SortedMapNode<K, V2> =>
// @ts-ignore
					c.buildMapValues(f) as SortedMapNode<K, V2>,
			),
			this.size,
		);
	};

	addEntryInternal(entry: readonly [K, V]): boolean {
		const entryIndex = this.context.findIndex(entry[0], this.entries);

		if (entryIndex >= 0) {
			const currentEntry = this.entries[entryIndex];
			if (Object.is(currentEntry[1], entry[1])) return false;

			this.source = undefined;

			this.entries[entryIndex] = entry;
			return true;
		}

		const childIndex = SortedIndex.next(entryIndex);

		if (!this.hasChildren) {
			this.source = undefined;

			this.size++;

			this.entries.splice(childIndex, 0, entry);
			return true;
		}

		const child = this.children[childIndex];

		const preSize = child.size;
		const changed = child.addEntryInternal(entry);

		if (!changed) return false;

		this.source = undefined;

		this.size += child.size - preSize;

		this.normalizeChildDecrease(childIndex);
		return true;
	}

	removeInternal<O>(key: K, otherwise?: OptLazy<O>): V | O {
		if (this.size === 0) return OptLazy(otherwise) as O;

		const entryIndex = this.context.findIndex(key, this.entries);

		if (entryIndex >= 0) {
			this.source = undefined;

			this.size--;

			if (!this.hasChildren) {
				const removed = this.entries.splice(entryIndex, 1);
				return removed[0][1];
			}

			const leftChild = this.children[entryIndex];
			const rightChild = this.children[entryIndex + 1];

			const removed = this.entries[entryIndex];

			if (leftChild.size >= rightChild.size) {
				this.entries[entryIndex] = leftChild.deleteMax();
				this.normalizeChildIncrease(entryIndex);
			} else {
				this.entries[entryIndex] = rightChild.deleteMin();
				this.normalizeChildIncrease(entryIndex + 1);
			}

			return removed[1];
		}

		if (!this.hasChildren) return OptLazy(otherwise) as O;

		const childIndex = SortedIndex.next(entryIndex);
		const child = this.children[childIndex];

		const preSize = child.size;
		const token = Symbol();
		const oldValue = child.removeInternal(key, token);

		if (token === oldValue) return OptLazy(otherwise) as O;

		this.source = undefined;

		this.size += child.size - preSize;

		this.normalizeChildIncrease(childIndex);
		return oldValue;
	}

	modifyAtInternal(key: K, options: ModifyOptions<V>): boolean {
		const { ifNew, ifExists } = options;

		const entryIndex = this.context.findIndex(key, this.entries);

		if (entryIndex >= 0) {
			if (undefined === ifExists) return false;
			const { set, update } = ifExists;

			const currentEntry = this.entries[entryIndex];
			const currentValue = currentEntry[1];
			const token = Symbol();
			const newValue = set !== undefined ? set : update!(currentValue, token);

			if (newValue === currentValue) return false;

			if (token === newValue) {
				return token !== this.removeInternal(key, token);
			}

			this.source = undefined;

			const newEntry: [K, V] = [key, newValue];
			this.entries[entryIndex] = newEntry;
			return true;
		}

		const childIndex = SortedIndex.next(entryIndex);

		if (!this.hasChildren) {
			if (undefined === ifNew) return false;
			const { set, create } = ifNew;

			const token = Symbol();
			const newValue = set !== undefined ? set : create!(token);

			if (token === newValue) return false;

			this.source = undefined;

			this.size++;

			this.entries.splice(childIndex, 0, [key, newValue]);
			return true;
		}

		const child = this.children[childIndex];

		const preSize = child.size;
		const changed = child.modifyAtInternal(key, options);

		if (!changed) return false;

		this.source = undefined;

		this.size += child.size - preSize;

		this.normalizeChildDecrease(childIndex);
		this.normalizeChildIncrease(childIndex);
		return changed;
	}
}
