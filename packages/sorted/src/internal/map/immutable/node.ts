import type { TraverseState } from '@rimbu/common/traverse-state';
import type {
	ArrayNonEmpty,
	RelatedTo,
	ToJSON,
	WithValueResult,
} from '@rimbu/common/types';
import type { SortedMap } from '@rimbu/sorted/map';

import type { SortedMapBuilder } from '#map/builder';
import type { ContextImpl } from '#map/context-factory';

import * as Entry from '@rimbu/base/entry';
import { IndexedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/indexed-base';
import { IndexedSortedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/indexed-sorted-base';
import { KeyedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { MapCollectionNonEmpty } from '@rimbu/collection-types/advanced/map-base';
import { IndexRange } from '@rimbu/common/index-range';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Range } from '@rimbu/common/range';
import { Stream, type StreamSource } from '@rimbu/stream';

import { SortedIndex } from '#sorted/sorted-index';

const NonEmptyBase = IndexedSortedCollectionNonEmpty.WithMixin(
	MapCollectionNonEmpty.WithMixin(
		IndexedCollectionNonEmpty.WithMixin(
			KeyedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor),
		),
	),
);

export abstract class SortedMapNode<K, V>
	extends NonEmptyBase<readonly [K, V], K, SortedMapNode<K, V>>
	implements SortedMap.NonEmpty<K, V>
{
	abstract get context(): ContextImpl<K>;
	abstract get size(): number;
	abstract stream(options?: {
		reversed?: boolean;
	}): Stream.NonEmpty<readonly [K, V]>;
	abstract streamSliceIndex(
		range: IndexRange,
		options?: { reversed?: boolean },
	): Stream<readonly [K, V]>;
	abstract forEach(
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
		options?: { state?: TraverseState },
	): void;
	// @ts-expect-error
	abstract get<U, O>(key: RelatedTo<K, U>, otherwise?: OptLazy<O>): V | O;
	// @ts-expect-error
	abstract at<O>(index: number, otherwise?: OptLazy<O>): readonly [K, V] | O;
	// @ts-expect-error
	abstract atIndex<O>(
		index: number,
		otherwise?: OptLazy<O>,
	): readonly [K, V] | O;
	// @ts-expect-error
	abstract findIndex(key: K): number | undefined;
	abstract addInternal(
		entry: readonly [K, V],
		hash?: number,
	): SortedMapNode<K, V>;
	abstract modifyAtInternal(
		atKey: K,
		options: ModifyOptions<V>,
	): SortedMapNode<K, V>;
	abstract getInsertIndexOf(key: K): number;
	// @ts-expect-error
	abstract mapValues<V2>(
		mapFun: (value: V, key: K) => V2,
	): SortedMapNode<K, V2>;
	abstract toArray(): ArrayNonEmpty<readonly [K, V]>;
	abstract normalize(): SortedMap<K, V>;
	abstract min(): readonly [K, V];
	abstract max(): readonly [K, V];

	// @ts-expect-error
	asNormal(): this {
		return this;
	}

	getSliceRange(range: Range<K>): { startIndex: number; endIndex: number } {
		const { start, end } = Range.getNormalizedRange(range);
		let startIndex = 0;
		let endIndex = this.size - 1;

		if (undefined !== start) {
			const [startValue, startInclude] = start;
			startIndex = this.getInsertIndexOf(startValue);

			if (startIndex < 0) {
				startIndex = SortedIndex.next(startIndex);
			} else if (!startInclude) {
				startIndex++;
			}
		}
		if (undefined !== end) {
			const [endValue, endInclude] = end;
			endIndex = this.getInsertIndexOf(endValue);

			if (endIndex < 0) endIndex = SortedIndex.prev(endIndex);
			else if (!endInclude) endIndex--;
		}

		return { startIndex, endIndex };
	}

	streamKeys(options: { reversed?: boolean } = {}): Stream.NonEmpty<K> {
		return this.stream(options).map(Entry.first);
	}

	streamValues(options: { reversed?: boolean } = {}): Stream.NonEmpty<V> {
		return this.stream(options).map(Entry.second);
	}

	streamRange(
		keyRange: Range<K>,
		options: { reversed?: boolean } = {},
	): Stream<readonly [K, V]> {
		const { startIndex, endIndex } = this.getSliceRange(keyRange);

		return this.streamSliceIndex(
			{
				start: [startIndex, true],
				end: [endIndex, true],
			},
			options,
		);
	}

	minKey(): K {
		return this.min()[0];
	}

	minValue(): V {
		return this.min()[1];
	}

	maxKey(): K {
		return this.max()[0];
	}

	maxValue(): V {
		return this.max()[1];
	}

	hasKey<UK>(key: RelatedTo<K, UK>): boolean {
		const token = Symbol();
		return token !== this.get(key, token);
	}

	lowerBound(key: K): number {
		const index = this.getInsertIndexOf(key);
		return index >= 0 ? index : -index - 1;
	}

	upperBound(key: K): number {
		const index = this.getInsertIndexOf(key);
		return index >= 0 ? index + 1 : -index - 1;
	}

	nextEntry<O>(
		key: K,
		options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> } = {},
	): readonly [K, V] | O {
		const { inclusive = false, otherwise } = options;
		if (!this.context.comp.isComparable(key)) return OptLazy(otherwise) as O;

		const atIndex = inclusive ? this.lowerBound(key) : this.upperBound(key);

		return this.atIndex(atIndex, otherwise);
	}

	previousEntry<O>(
		key: K,
		options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> } = {},
	): readonly [K, V] | O {
		const { inclusive = false, otherwise } = options;
		if (!this.context.comp.isComparable(key)) return OptLazy(otherwise) as O;

		const index = this.getInsertIndexOf(key);
		const atIndex =
			index >= 0 ? (inclusive ? index : index - 1) : -index - 1 - 1;

		if (atIndex < 0) return OptLazy(otherwise) as O;

		return this.atIndex(atIndex, otherwise);
	}

	addEntry(entry: readonly [K, V]): SortedMap.NonEmpty<K, V> {
		return this.addInternal(entry).normalize().assumeNonEmpty();
	}

	addEntries(entries: StreamSource<readonly [K, V]>): SortedMap.NonEmpty<K, V> {
		// @ts-expect-error
		if (Stream.isEmptyStreamSourceInstance(entries)) return this;

		const builder = this.toBuilder();
		builder.addEntries(entries);
		return builder.build() as SortedMap.NonEmpty<K, V>;
	}

	add(...args: any[]): any {
		return (this as any).addEntry(...args);
	}
	addAll(...args: any[]): any {
		return (this as any).addEntries(...args);
	}

	modifyAt(atKey: K, options: ModifyOptions<V>): SortedMap<K, V> {
		// @ts-expect-error
		if (checkEmptyModifyOptions(options)) return this;
		return this.modifyAtInternal(atKey, options).normalize();
	}

	set(key: K, value: V): SortedMap.NonEmpty<K, V> {
		return this.addEntry([key, value]);
	}

	updateAt<U>(
		key: RelatedTo<K, U>,
		update: (value: V) => V,
	): SortedMap.NonEmpty<K, V> {
		// @ts-expect-error
		if (!this.context.isValidKey(key)) return this;

		return this.modifyAt(key, {
			ifExists: { update },
		}).assumeNonEmpty();
	}

	updateAtAndGet<U>(
		key: RelatedTo<K, U>,
		update: (value: V) => V,
	): WithValueResult<SortedMap.NonEmpty<K, V>, V> {
		const token = Symbol();
		let oldValue: V | typeof token = token;

		const newMap = this.updateAt(key, (value) => {
			oldValue = value;
			return update(value);
		});

		// @ts-expect-error
		if (token === oldValue) return [this, undefined, false];
		return [newMap, oldValue, true];
	}

	removeKey<UK>(key: RelatedTo<K, UK>): SortedMap<K, V> {
		// @ts-expect-error
		if (!this.context.isValidKey(key)) return this;

		return this.modifyAt(key, {
			ifExists: { update: (_, remove): typeof remove => remove },
		});
	}

	removeKeys<UK>(keys: StreamSource<RelatedTo<K, UK>>): SortedMap<K, V> {
		// @ts-expect-error
		if (Stream.isEmptyStreamSourceInstance(keys)) return this;

		const builder = this.toBuilder();
		builder.removeKeys(keys);
		return builder.build();
	}

	// aliases for new MapCollection names
	modifyAtKey(...args: any[]): any {
		return (this as any).modifyAt(...args);
	}
	updateAtKey(...args: any[]): any {
		return (this as any).updateAt(...args);
	}

	removeKeyAndReturn<UK>(key: RelatedTo<K, UK>): any;
	removeKeyAndReturn<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): any;
	removeKeyAndReturn<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
	): any {
		const token = Symbol();
		let removed: V | typeof token = token;
		const newMap = this.modifyAt(key as K, {
			ifExists: {
				update: (value: V, remove: any): any => {
					removed = value;
					return remove;
				},
			},
		});
		if (token === removed) {
			const result =
				otherwise !== undefined ? OptLazy(otherwise as any) : undefined;
			return {
				collection: this,
				hasResult: false,
				result,
				hasChanged: false,
			};
		}
		return {
			collection: newMap,
			hasResult: true,
			result: removed,
			hasChanged: true,
		};
	}

	updateAtKeyAndReturn<UK>(
		key: RelatedTo<K, UK>,
		update: (value: V) => V,
	): any {
		const token = Symbol();
		let previous: V | typeof token = token;
		let current: V | typeof token = token;
		const newMap = this.modifyAt(key as K, {
			ifExists: {
				update: (value: V): any => {
					previous = value;
					const newVal = update(value);
					current = newVal;
					return newVal;
				},
			},
		});
		if (token === previous) {
			return {
				collection: this,
				hasResult: false,
				result: [undefined, undefined] as any,
				hasChanged: false,
			};
		}
		const hasChanged = (newMap as unknown) !== (this as unknown);
		return {
			collection: newMap,
			hasResult: true,
			result: [previous, current] as any,
			hasChanged,
		};
	}

	removeKeyAndGet<UK>(
		key: RelatedTo<K, UK>,
	): WithValueResult<SortedMap<K, V>, V> {
		// @ts-expect-error
		if (!this.context.isValidKey(key)) return [this, undefined, false];

		const token = Symbol();
		let currentValue: V | typeof token = token;

		const newMap = this.modifyAt(key, {
			ifExists: {
				update: (value, remove) => {
					currentValue = value;
					return remove;
				},
			},
		});

		// @ts-expect-error
		if (token === currentValue) return [this, undefined, false];
		return [newMap, currentValue, true];
	}

	// @ts-expect-error
	filter(
		pred: (entry: readonly [K, V], index: number, halt: () => void) => boolean,
		options: { negate?: boolean } = {},
	): SortedMap<K, V> {
		// @ts-expect-error
		const builder = this.context.builder<K, V>();
		// @ts-expect-error
		builder.addEntries(this.stream().filter(pred, options));

		// @ts-expect-error
		if (builder.size === this.size) return this;

		// @ts-expect-error
		return builder.build();
	}

	transform<V2, K2 extends K>(
		transformFun: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource<[K2, V2]>,
	): any {
		return this.context.from(transformFun(this.stream()));
	}

	take(amount: number): SortedMap<K, V> | any {
		if (amount === 0) return this.context.empty();
		if (amount >= this.size || -amount > this.size) return this;
		if (amount < 0) return this.drop(this.size + amount);

		return this.takeInternal(amount).normalize();
	}

	drop(amount: number): SortedMap<K, V> {
		// @ts-expect-error
		if (amount === 0) return this;
		if (amount >= this.size || -amount > this.size) return this.context.empty();
		if (amount < 0) return this.take(this.size + amount);

		return this.dropInternal(amount).normalize();
	}

	sliceIndex(range: IndexRange): SortedMap<K, V> {
		const indexRange = IndexRange.getIndicesFor(range, this.size);

		if (indexRange === 'empty') return this.context.empty();
		// @ts-expect-error
		if (indexRange === 'all') return this;

		const [start, end] = indexRange;

		return this.drop(start).take(end - start + 1);
	}

	slice(range: any): SortedMap<K, V> {
		if (range && typeof range === 'object' && 'amount' in range) {
			return this.sliceIndex(range as IndexRange);
		}
		const { startIndex, endIndex } = this.getSliceRange(range as Range<K>);

		return this.sliceIndex({
			start: [startIndex, true],
			end: [endIndex, true],
		});
	}

	get comp(): any {
		return this.context.comp;
	}

	get(key: any, otherwise?: any): any {
		const idx = (this as any).findIndex(key, -1);
		if (idx === -1 || idx === undefined) return OptLazy(otherwise) as any;
		const e = (this as any).atIndex(idx) as readonly [any, any] | undefined;
		return e ? e[1] : OptLazy(otherwise as any);
	}

	has(key: any): boolean {
		return (this as any).hasKey(key);
	}

	indexOf(key: any, otherwise?: any): any {
		return (this as any).findIndex(key, otherwise);
	}

	streamSlice(range: any, options?: any): Stream<readonly [K, V]> {
		return this.streamSliceIndex(range, options);
	}

	forEachIndexed(f: any, options?: any): void {
		return (this as any).forEach(f as any, options as any);
	}

	filterIndexed(pred: any, options?: any): any {
		return (this as any).filter(pred as any, options as any);
	}

	first(..._args: any[]): any {
		return (this as any).min(..._args);
	}

	last(..._args: any[]): any {
		return (this as any).max(..._args);
	}

	splitAt(amount: number): any {
		return [(this as any).take(amount), (this as any).drop(amount)];
	}

	removeAt(index: number, amount?: number | undefined): SortedMap<K, V> {
		const sz = (this as any).size as number;
		let idx = index;
		if (idx < 0) idx = sz + idx;
		if (idx < 0 || idx >= sz) return this as any;
		const amt = amount === undefined ? 1 : amount;
		if (amt <= 0) return this as any;
		if (amt >= sz && idx === 0) return (this as any).context.empty();
		let result: SortedMap<K, V> = this as any;
		for (let i = 0; i < amt; i++) {
			const e = (result as any).atIndex(idx) as readonly [K, V] | undefined;
			if (undefined === e) break;
			result = (result as any).removeKey(e[0]);
			if ((result as any).size <= idx && amt > 1) break;
		}
		return result;
	}

	removeAtAndReturn(index: number, amount?: number | undefined): any {
		const removed = (this as any).slice({
			start: index,
			amount: amount ?? 1,
		} as any);
		const next = (this as any).removeAt(index, amount);
		return [next, removed] as any;
	}

	// @ts-expect-error
	toBuilder(): SortedMapBuilder<K, V> {
		// @ts-expect-error
		return this.context.createBuilder<K, V>(this);
	}

	toString(): string {
		return this.stream().join({
			start: 'SortedMap(',
			sep: ', ',
			end: ')',
			valueToString: (entry) => `${entry[0]} -> ${entry[1]}`,
		});
	}

	toJSON(): ToJSON<(readonly [K, V])[]> {
		return {
			dataType: this.context.typeTag,
			value: this.toArray(),
		};
	}
}
