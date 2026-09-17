import type { IndexRange } from '@rimbu/common/index-range';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { Range } from '@rimbu/common/range';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { ArrayNonEmpty, RelatedTo, ToJSON } from '@rimbu/common/types';
import type { SortedMap } from '@rimbu/sorted/map';
import type { Stream } from '@rimbu/stream';

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
import { MapCollectionNonEmpty } from '@rimbu/collection-types/advanced/map-base';

import { SortedNode } from '#sorted/base';

const NonEmptyBase = IndexedKeyedSortedCollectionNonEmpty.WithMixin(
	MapCollectionNonEmpty.WithMixin(
		KeyedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor),
	),
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
	abstract streamSlice(
		range: IndexRange,
		options?: { reversed?: boolean },
	): Stream<readonly [K, V]>;
	abstract forEach(
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
		options?: { state?: TraverseState },
	): void;
	abstract get<U, O>(key: RelatedTo<K, U>, otherwise?: OptLazy<O>): V | O;
	abstract at<O>(index: number, otherwise?: OptLazy<O>): readonly [K, V] | O;
	abstract indexOf(key: K): number | undefined;
	abstract indexOf<O>(key: K, otherwise: OptLazy<O>): number | O;
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
		return SortedNode.next(this, key, options);
	}

	previous<O>(
		key: K,
		options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> } = {},
	): readonly [K, V] | O {
		return SortedNode.previous(this, key, options);
	}

	add(entry: readonly [K, V]): SortedMap.NonEmpty<K, V> {
		return this.addInternal(entry).normalize().assumeNonEmpty();
	}

	modifyAtKey(atKey: K, options: ModifyOptions<V>): SortedMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;
		return this.modifyAtInternal(atKey, options).normalize();
	}

	take(amount: number): SortedMap<K, V> | any {
		return SortedNode.take(this, amount);
	}

	drop(amount: number): SortedMap<K, V> {
		return SortedNode.drop(this, amount);
	}

	slice(range: IndexRange): SortedMap<K, V> {
		return SortedNode.sliceIndex(this, range);
	}

	get comp(): any {
		return this.context.comp;
	}

	splitAt(amount: number): any {
		return SortedNode.splitAt(this, amount);
	}

	removeAt(index: number, amount?: number | undefined): SortedMap<K, V> {
		const sz = this.size;
		let idx = index;
		if (idx < 0) idx = sz + idx;
		if (idx < 0 || idx >= sz) return this;
		const amt = amount === undefined ? 1 : amount;
		if (amt <= 0) return this;
		if (amt >= sz && idx === 0) return this.context.empty();
		let result: SortedMap<K, V> = this;
		for (let i = 0; i < amt; i++) {
			const e = result.at(idx);
			if (undefined === e) break;
			result = result.removeKey(e[0]);
			if (result.size <= idx && amt > 1) break;
		}
		return result;
	}

	removeAtAndReturn(index: number, amount?: number | undefined): any {
		const removed = this.slice({
			start: index,
			amount: amount ?? 1,
		});
		const next = this.removeAt(index, amount);
		return [next, removed] as any;
	}

	toBuilder(): SortedMapBuilder<K, V> {
		return this.context.createBuilder<K, V>(this as unknown as SortedMap<K, V>);
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
