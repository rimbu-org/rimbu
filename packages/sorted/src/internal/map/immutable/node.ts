import type { IndexRange } from '@rimbu/common/index-range';
import type { Range } from '@rimbu/common/range';
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
import { IndexedKeyedSortedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/indexed-keyed-sorted-base';
import { KeyedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream, type StreamSource } from '@rimbu/stream';

import { SortedNode } from '#sorted/base';

const NonEmptyBase = IndexedKeyedSortedCollectionNonEmpty.WithMixin(
	KeyedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor),
);

export abstract class SortedMapNode<K, V>
	extends NonEmptyBase<K, V, SortedMap.Advanced.Family<K, V>>
	implements SortedMap.NonEmpty<K, V>
{
	abstract get context(): ContextImpl<K>;
	abstract get size(): number;
	abstract entries: readonly (readonly [K, V])[];

	/**
	 * Mutable view of {@link entries} used by the shared B-tree mutation
	 * helpers. Callers always re-wrap the node through `copy`, so the in-place
	 * edits never escape.
	 */
	get mutateEntries(): (readonly [K, V])[] {
		return this.entries as (readonly [K, V])[];
	}
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
	abstract get<U, O>(key: RelatedTo<K, U>, otherwise?: OptLazy<O>): V | O;
	abstract at<O>(index: number, otherwise?: OptLazy<O>): readonly [K, V] | O;
	abstract atIndex<O>(
		index: number,
		otherwise?: OptLazy<O>,
	): readonly [K, V] | O;
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
	abstract mapValues<V2>(
		mapFun: (value: V, key: K) => V2,
	): SortedMapNode<K, V2>;
	abstract toArray(): ArrayNonEmpty<readonly [K, V]>;
	abstract normalize(): SortedMap<K, V>;
	abstract min(): readonly [K, V];
	abstract max(): readonly [K, V];
	abstract takeInternal(amount: number): SortedMapNode<K, V>;
	abstract dropInternal(amount: number): SortedMapNode<K, V>;
	abstract deleteMin(): [readonly [K, V], SortedMapNode<K, V>];
	abstract deleteMax(): [readonly [K, V], SortedMapNode<K, V>];
	abstract mutateSplitRight(
		index?: number,
	): [readonly [K, V], SortedMapNode<K, V>];
	abstract mutateGiveToLeft(
		left: SortedMapNode<K, V>,
		toLeft: readonly [K, V],
	): [readonly [K, V], SortedMapNode<K, V>];
	abstract mutateGiveToRight(
		right: SortedMapNode<K, V>,
		toRight: readonly [K, V],
	): [readonly [K, V], SortedMapNode<K, V>];
	abstract mutateGetFromLeft(
		left: SortedMapNode<K, V>,
		toMe: readonly [K, V],
	): [readonly [K, V], SortedMapNode<K, V>];
	abstract mutateGetFromRight(
		right: SortedMapNode<K, V>,
		toMe: readonly [K, V],
	): [readonly [K, V], SortedMapNode<K, V>];
	abstract mutateJoinLeft(
		left: SortedMapNode<K, V>,
		entry: readonly [K, V],
	): void;
	abstract mutateJoinRight(
		right: SortedMapNode<K, V>,
		entry: readonly [K, V],
	): void;

	asNormal(): this {
		return this;
	}

	getSliceRange(range: Range<K>): { startIndex: number; endIndex: number } {
		return SortedNode.getSliceRange(this, range);
	}

	streamKeys = (options: { reversed?: boolean } = {}): Stream.NonEmpty<K> =>
		this.stream(options).map(Entry.first);

	streamValues = (options: { reversed?: boolean } = {}): Stream.NonEmpty<V> =>
		this.stream(options).map(Entry.second);

	streamRange(
		keyRange: Range<K>,
		options: { reversed?: boolean } = {},
	): Stream<readonly [K, V]> {
		return SortedNode.streamRange(this, keyRange, options);
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
		return SortedNode.lowerBound(this, key);
	}

	upperBound(key: K): number {
		return SortedNode.upperBound(this, key);
	}

	next<O>(
		key: K,
		options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> } = {},
	): readonly [K, V] | O {
		return this.nextEntry(key, options);
	}

	previous<O>(
		key: K,
		options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> } = {},
	): readonly [K, V] | O {
		return this.previousEntry(key, options);
	}

	nextEntry<O>(
		key: K,
		options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> } = {},
	): readonly [K, V] | O {
		return SortedNode.next(this, key, options);
	}

	previousEntry<O>(
		key: K,
		options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> } = {},
	): readonly [K, V] | O {
		return SortedNode.previous(this, key, options);
	}

	addEntry(entry: readonly [K, V]): SortedMap.NonEmpty<K, V> {
		return this.addInternal(entry).normalize().assumeNonEmpty();
	}

	addEntries(entries: StreamSource<readonly [K, V]>): SortedMap.NonEmpty<K, V> {
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

		if (token === oldValue) return [this, undefined, false];
		return [newMap, oldValue, true];
	}

	removeKey<UK>(key: RelatedTo<K, UK>): SortedMap<K, V> {
		if (!this.context.isValidKey(key)) return this;

		return this.modifyAt(key, {
			ifExists: { update: (_, remove): typeof remove => remove },
		});
	}

	removeKeys<UK>(keys: StreamSource<RelatedTo<K, UK>>): SortedMap<K, V> {
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

		if (token === currentValue) return [this, undefined, false];
		return [newMap, currentValue, true];
	}

	transform<V2, K2 extends K>(
		transformFun: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource<[K2, V2]>,
	): any {
		return this.context.from(transformFun(this.stream()));
	}

	take(amount: number): SortedMap<K, V> | any {
		return SortedNode.take(this, amount);
	}

	drop(amount: number): SortedMap<K, V> {
		return SortedNode.drop(this, amount);
	}

	sliceIndex(range: IndexRange): SortedMap<K, V> {
		return SortedNode.sliceIndex(this, range);
	}

	slice(range: IndexRange | Range<K>): SortedMap<K, V> {
		return SortedNode.slice(this, range);
	}

	get comp(): any {
		return this.context.comp;
	}

	indexOf(key: any, otherwise?: any): any {
		return (this as any).findIndex(key, otherwise);
	}

	streamSlice(range: any, options?: any): Stream<readonly [K, V]> {
		return this.streamSliceIndex(range, options);
	}

	forEachIndexed(f: any, options?: any): void {
		(this as any).forEach(f as any, options as any);
	}

	filterIndexed(pred: any, options?: any): any {
		return (this as any).filter(pred as any, options as any);
	}

	splitAt(amount: number): any {
		return SortedNode.splitAt(this, amount);
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

	toBuilder(): SortedMapBuilder<K, V> {
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
