// @ts-nocheck
import type {
	ArrayNonEmpty,
	RelatedTo,
	ToJSON,
	WithValueResult,
} from '@rimbu/common/types';
import type { SortedMap } from '@rimbu/sorted/map';

import type { SortedMapBuilder } from '#map/builder';
import type { ContextImpl } from '#map/context-factory';

import * as Arr from '@rimbu/base/arr';
import * as Entry from '@rimbu/base/entry';
import * as RimbuError from '@rimbu/base/rimbu-error';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { IndexRange } from '@rimbu/common/index-range';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Range } from '@rimbu/common/range';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream, type StreamSource } from '@rimbu/stream';

import {
	innerDeleteMax,
	innerDeleteMin,
	innerDropInternal,
	innerGetAtIndex,
	innerMutateGetFromLeft,
	innerMutateGetFromRight,
	innerMutateGiveToLeft,
	innerMutateGiveToRight,
	innerMutateJoinLeft,
	innerMutateJoinRight,
	innerMutateSplitRight,
	innerNormalizeDownsizeChild,
	innerNormalizeIncreaseChild,
	innerStreamSliceIndex,
	innerTakeInternal,
	leafDeleteMax,
	leafDeleteMin,
	leafMutateGetFromLeft,
	leafMutateGetFromRight,
	leafMutateGiveToLeft,
	leafMutateGiveToRight,
	leafMutateJoinLeft,
	leafMutateJoinRight,
	leafMutateSplitRight,
	SortedEmpty,
	SortedNonEmptyBase,
} from '#sorted/base';
import { SortedIndex } from '#sorted/sorted-index';

export class SortedMapEmpty<K = any, V = any>
	extends SortedEmpty
	implements SortedMap<K, V>
{
	declare _NonEmptyType: SortedMap.NonEmpty<K, V>;

	constructor(readonly context: ContextImpl<K>) {
		super();
	}

	streamRange(): Stream<readonly [K, V]> {
		return Stream.empty();
	}

	streamKeys(): Stream<K> {
		return Stream.empty();
	}

	streamValues(): Stream<V> {
		return Stream.empty();
	}

	streamSliceIndex(): Stream<readonly [K, V]> {
		return Stream.empty();
	}

	get comp(): any {
		return this.context.comp;
	}

	get(_key: any, _otherwise?: any): any {
		return (this as any).at(_key, _otherwise);
	}

	has(_key: any): boolean {
		return (this as any).hasKey(_key);
	}

	indexOf(_key: any, _otherwise?: any): any {
		return (this as any).findIndex(_key, _otherwise);
	}

	streamSlice(_range?: any, _options?: any): Stream<readonly [K, V]> {
		return Stream.empty();
	}

	forEachIndexed(_f?: any, _options?: any): void {}

	filter(_pred?: any, _options?: any): any {
		return this;
	}

	filterIndexed(_pred?: any, _options?: any): any {
		return this;
	}

	first(..._args: any[]): any {
		return (this as any).min(..._args);
	}

	last(..._args: any[]): any {
		return (this as any).max(..._args);
	}

	splitAt(_amount?: any): any {
		return [this, this];
	}

	minKey<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	minValue<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	maxKey<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	maxValue<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	at<_, O>(key: any, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	hasKey(): false {
		return false;
	}

	findIndex<O>(_key: K, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise!);
	}

	lowerBound(): number {
		return 0;
	}

	upperBound(): number {
		return 0;
	}

	nextEntry(): undefined {
		return undefined;
	}

	previousEntry(): undefined {
		return undefined;
	}

	set(key: K, value: V): SortedMap.NonEmpty<K, V> {
		return this.context.leaf([[key, value]]);
	}

	addEntry(entry: readonly [K, V]): SortedMap.NonEmpty<K, V> {
		return this.context.leaf([entry]);
	}

	addEntries(entries: StreamSource<readonly [K, V]>): SortedMap.NonEmpty<K, V> {
		return this.context.from(entries) as SortedMap.NonEmpty<K, V>;
	}

	removeKey(): SortedMap<K, V> {
		return this;
	}

	removeKeys(): SortedMap<K, V> {
		return this;
	}

	removeKeyAndGet(): WithValueResult<SortedMap<K, V>, V> {
		return [this, undefined, false];
	}

	modifyAt(atKey: K, options: ModifyOptions<V>): SortedMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;

		const { ifNew } = options;
		if (undefined === ifNew) return this;

		const { set, create } = ifNew;
		const skip = Symbol();
		const newValue = create !== undefined ? create(skip) : set;

		if (skip === newValue) return this;
		return this.context.leaf([[atKey, newValue]]);
	}

	transform<V2, K2 extends K>(
		transformFun: (stream: Stream<readonly [K, V]>) => StreamSource<[K2, V2]>,
	): SortedMap<K2, V2> {
		return this.context.from(transformFun(this.stream()));
	}

	mapValues<V2>(): SortedMap<K, V2> {
		return this as any;
	}

	updateAt(): SortedMap<K, V> {
		return this;
	}

	updateAtAndGet(): WithValueResult<
		SortedMap.NonEmpty<K, V>,
		V,
		SortedMap<K, V>
	> {
		return [this, undefined, false];
	}

	slice(): SortedMap<K, V> {
		return this;
	}

	toBuilder(): SortedMap.Builder<K, V> {
		return this.context.builder();
	}

	toString(): string {
		return `SortedMap()`;
	}

	toJSON(): ToJSON<any[]> {
		return {
			dataType: this.context.typeTag,
			value: [],
		};
	}
}

export abstract class SortedMapNode<K, V>
	extends SortedNonEmptyBase<readonly [K, V], SortedMapNode<K, V>>
	implements SortedMap.NonEmpty<K, V>
{
	declare _NonEmptyType: SortedMap.NonEmpty<K, V>;

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
	abstract at<U, O>(key: RelatedTo<K, U>, otherwise?: OptLazy<O>): V | O;
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
		return token !== this.at(key, token);
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
		if (Stream.isEmptyStreamSourceInstance(entries)) return this;

		const builder = this.toBuilder();
		builder.addEntries(entries);
		return builder.build() as SortedMap.NonEmpty<K, V>;
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

	filter(
		pred: (entry: readonly [K, V], index: number, halt: () => void) => boolean,
		options: { negate?: boolean } = {},
	): SortedMap<K, V> {
		const builder = this.context.builder<K, V>();
		builder.addEntries(this.stream().filter(pred, options));

		if (builder.size === this.size) return this;

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
		if (amount === 0) return this;
		if (amount >= this.size || -amount > this.size) return this.context.empty();
		if (amount < 0) return this.take(this.size + amount);

		return this.dropInternal(amount).normalize();
	}

	sliceIndex(range: IndexRange): SortedMap<K, V> {
		const indexRange = IndexRange.getIndicesFor(range, this.size);

		if (indexRange === 'empty') return this.context.empty();
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
		return (this as any).at(key, otherwise);
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

export class SortedMapLeaf<K, V> extends SortedMapNode<K, V> {
	constructor(
		readonly context: ContextImpl<K>,
		public entries: readonly (readonly [K, V])[],
	) {
		super();
	}

	copy(entries: readonly (readonly [K, V])[]): SortedMapLeaf<K, V> {
		if (entries === this.entries) return this;
		return this.context.leaf(entries);
	}

	get size(): number {
		return this.entries.length;
	}

	stream(
		options: { reversed?: boolean } = {},
	): Stream.NonEmpty<readonly [K, V]> {
		return Stream.fromArray(this.entries, options) as Stream.NonEmpty<[K, V]>;
	}

	streamSliceIndex(
		range: IndexRange,
		options: { reversed?: boolean } = {},
	): Stream<readonly [K, V]> {
		const { reversed = false } = options;

		return Stream.fromArray(this.entries, { range, reversed });
	}

	min(): readonly [K, V] {
		return this.entries[0];
	}

	max(): readonly [K, V] {
		return this.entries.at(-1)!;
	}

	at<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O {
		if (!this.context.isValidKey(key)) return OptLazy(otherwise) as O;

		const index = this.context.findIndex(key, this.entries);

		if (index < 0) return OptLazy(otherwise) as O;

		return this.entries[index][1];
	}

	findIndex<O>(key: K, otherwise?: OptLazy<O>): number | O {
		if (!this.context.comp.isComparable(key)) return OptLazy(otherwise!);
		const index = this.context.findIndex(key, this.entries);
		return index < 0 ? OptLazy(otherwise!) : index;
	}

	atIndex<O>(index: number, otherwise?: OptLazy<O>): readonly [K, V] | O {
		if (index >= this.size || -index > this.size)
			return OptLazy(otherwise) as O;
		if (index < 0) return this.atIndex(this.size + index, otherwise);

		return this.entries[index];
	}

	forEach(
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		Arr.forEach(this.entries, f, state);
	}

	mapValues<V2>(mapFun: (value: V, key: K) => V2): SortedMapLeaf<K, V2> {
		const newEntries = this.entries.map(([key, value]): [K, V2] => {
			const newValue = mapFun(value, key);
			return [key, newValue];
		});

		return this.context.leaf(newEntries);
	}

	toArray(): ArrayNonEmpty<[K, V]> {
		return this.entries.slice() as ArrayNonEmpty<[K, V]>;
	}

	// internal methods

	getInsertIndexOf(key: K): number {
		return this.context.findIndex(key, this.entries);
	}

	addInternal(entry: readonly [K, V]): SortedMapNode<K, V> {
		const index = this.context.findIndex(entry[0], this.entries);

		if (index >= 0) {
			const currentEntry = this.entries[index];
			if (Object.is(currentEntry[1], entry[1])) return this;

			const newEntries = Arr.set(this.entries, index, entry);
			return this.copy(newEntries);
		}

		const insertIndex = SortedIndex.next(index);
		const newEntries = Arr.insert(this.entries, insertIndex, entry);
		return this.copy(newEntries);
	}

	modifyAtInternal(key: K, options: ModifyOptions<V>): SortedMapNode<K, V> {
		const { ifNew, ifExists } = options;
		const entryIndex = this.context.findIndex(key, this.entries);

		if (entryIndex >= 0) {
			if (undefined === ifExists) return this;

			const { set, update } = ifExists;
			const currentEntry = this.entries[entryIndex];
			const currentValue = currentEntry[1];
			const token = Symbol();
			const newValue = update !== undefined ? update(currentValue, token) : set;

			if (Object.is(newValue, currentValue)) return this;

			if (token === newValue) {
				const newEntries = this.mutateEntries.toSpliced(entryIndex, 1);
				return this.copy(newEntries);
			}

			const newEntries = Arr.set(this.entries, entryIndex, [key, newValue] as [
				K,
				V,
			]);
			return this.copy(newEntries);
		}

		if (undefined === ifNew) return this;
		const { set, create } = ifNew;
		const token = Symbol();
		const newValue = create !== undefined ? create(token) : set;

		if (token === newValue) return this;

		const insertIndex = SortedIndex.next(entryIndex);
		const newEntries = Arr.insert(this.entries, insertIndex, [
			key,
			newValue,
		] as [K, V]);

		return this.copy(newEntries);
	}

	takeInternal(amount: number): SortedMapLeaf<K, V> {
		return this.context.leaf(this.entries.slice(0, amount));
	}

	dropInternal(amount: number): SortedMapLeaf<K, V> {
		return this.context.leaf(this.entries.slice(amount));
	}

	deleteMin(): [readonly [K, V], SortedMapLeaf<K, V>] {
		return leafDeleteMin<SortedMapLeaf<K, V>, readonly [K, V]>(this);
	}

	deleteMax(): [readonly [K, V], SortedMapLeaf<K, V>] {
		return leafDeleteMax<SortedMapLeaf<K, V>, readonly [K, V]>(this);
	}

	mutateSplitRight(index?: number): [readonly [K, V], SortedMapLeaf<K, V>] {
		return leafMutateSplitRight<SortedMapLeaf<K, V>, readonly [K, V]>(
			this,
			index,
		);
	}

	mutateGiveToLeft(
		left: SortedMapLeaf<K, V>,
		toLeft: readonly [K, V],
	): [readonly [K, V], SortedMapLeaf<K, V>] {
		return leafMutateGiveToLeft(this, left, toLeft);
	}

	mutateGiveToRight(
		right: SortedMapLeaf<K, V>,
		toRight: readonly [K, V],
	): [readonly [K, V], SortedMapLeaf<K, V>] {
		return leafMutateGiveToRight(this, right, toRight);
	}

	mutateGetFromLeft(
		left: SortedMapLeaf<K, V>,
		toMe: readonly [K, V],
	): [readonly [K, V], SortedMapLeaf<K, V>] {
		return leafMutateGetFromLeft(this, left, toMe);
	}

	mutateGetFromRight(
		right: SortedMapLeaf<K, V>,
		toMe: readonly [K, V],
	): [readonly [K, V], SortedMapLeaf<K, V>] {
		return leafMutateGetFromRight(this, right, toMe);
	}

	mutateJoinLeft(left: SortedMapLeaf<K, V>, entry: readonly [K, V]): void {
		leafMutateJoinLeft(this, left, entry);
	}

	mutateJoinRight(right: SortedMapLeaf<K, V>, entry: readonly [K, V]): void {
		leafMutateJoinRight(this, right, entry);
	}

	normalize(): SortedMap<K, V> {
		if (this.entries.length === 0) return this.context.empty();
		if (this.entries.length <= this.context.maxEntries) return this;
		const size = this.size;
		const [upEntry, rightNode] = this.mutateSplitRight();
		return this.context.inner([upEntry], [this, rightNode], size);
	}
}

export class SortedMapInner<K, V> extends SortedMapNode<K, V> {
	constructor(
		readonly context: ContextImpl<K>,
		public entries: readonly (readonly [K, V])[],
		public children: readonly SortedMapNode<K, V>[],
		readonly size: number,
	) {
		super();
	}

	get mutateChildren(): SortedMapNode<K, V>[] {
		return this.children as SortedMapNode<K, V>[];
	}

	copy(
		entries: readonly (readonly [K, V])[] = this.entries,
		children: readonly SortedMapNode<K, V>[] = this.children,
		size: number = this.size,
	): SortedMapInner<K, V> {
		if (
			entries === this.entries &&
			children === this.children &&
			size === this.size
		)
			return this;
		return this.context.inner(entries, children, size);
	}

	stream(
		options: { reversed?: boolean } = {},
	): Stream.NonEmpty<readonly [K, V]> {
		const token = Symbol();
		return Stream.zipAll(
			token,
			Stream.fromArray(this.children, options),
			Stream.fromArray(this.entries, options),
		).flatMap(([child, e]): Stream.NonEmpty<readonly [K, V]> => {
			if (token === child) RimbuError.throwInvalidStateError();
			if (token === e) return child.stream(options);
			return child.stream(options).append(e);
		}) as Stream.NonEmpty<readonly [K, V]>;
	}

	streamSliceIndex(
		range: IndexRange,
		options: { reversed?: boolean } = {},
	): Stream<readonly [K, V]> {
		const { reversed = false } = options;
		return innerStreamSliceIndex<readonly [K, V]>(this, range, reversed);
	}

	min(): readonly [K, V] {
		return this.children[0].min();
	}

	max(): readonly [K, V] {
		return this.children.at(-1)!.max();
	}

	at<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O {
		if (!this.context.isValidKey(key)) return OptLazy(otherwise) as O;

		const index = this.context.findIndex(key, this.entries);

		if (index >= 0) return this.entries[index][1];

		const childIndex = SortedIndex.next(index);
		const child = this.children[childIndex];

		return child.at(key, otherwise);
	}

	findIndex<O>(key: K, otherwise?: OptLazy<O>): number | O {
		if (!this.context.comp.isComparable(key)) return OptLazy(otherwise!);

		const index = this.context.findIndex(key, this.entries);
		if (index >= 0)
			return (
				this.children.slice(0, index + 1).reduce((x, y) => x + y.size, 0) +
				index
			);
		const childIndex = SortedIndex.next(index);
		const child = this.children[childIndex];
		const index$ = child.findIndex(key);
		if (undefined !== index$) {
			return (
				index$ +
				(Stream.fromArray(this.children, {
					range: { amount: childIndex },
				}).fold(0, (x, y) => x + y.size) -
					index -
					1)
			);
		}

		return OptLazy(otherwise!);
	}

	atIndex<O>(index: number, otherwise?: OptLazy<O>): readonly [K, V] | O {
		return innerGetAtIndex<readonly [K, V], O>(this, index, otherwise);
	}

	forEach(
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		let i = -1;
		const entryLength = this.entries.length;
		const { halt } = state;

		while (!state.halted && i < entryLength) {
			if (i >= 0) f(this.entries[i], state.nextIndex(), halt);
			else {
				const childIndex = SortedIndex.next(i);
				this.children[childIndex].forEach(f, { state });
			}
			i = SortedIndex.next(i);
		}
	}

	mapValues<V2>(mapFun: (value: V, key: K) => V2): SortedMapInner<K, V2> {
		const newEntries = this.entries.map((entry): [K, V2] => {
			const newValue = mapFun(entry[1], entry[0]);
			return [entry[0], newValue];
		});
		const newChildren = this.children.map(
			(child): SortedMapNode<K, V2> => child.mapValues(mapFun),
		);

		return this.context.inner(newEntries, newChildren, this.size);
	}

	toArray(): ArrayNonEmpty<readonly [K, V]> {
		let i = -1;
		let result: (readonly [K, V])[] = [];

		while (i < this.entries.length) {
			if (i >= 0) result.push(this.entries[i]);
			else {
				const childIndex = SortedIndex.next(i);
				result = result.concat(this.children[childIndex].toArray());
			}
			i = SortedIndex.next(i);
		}

		return result as ArrayNonEmpty<[K, V]>;
	}

	// internal methods

	getInsertIndexOf(key: K): number {
		let index = 0;

		for (let i = 0; i < this.entries.length; i++) {
			const comp = this.context.comp.compare(key, this.entries[i][0]);
			const child = this.children[i];

			if (comp < 0) {
				const insertIndex = child.getInsertIndexOf(key);

				if (insertIndex < 0) return -index + insertIndex;
				return index + insertIndex;
			}

			index += child.size + 1;

			if (comp === 0) return index - 1;
		}

		const insertIndex = this.children.at(-1)!.getInsertIndexOf(key);

		if (insertIndex < 0) return -index + insertIndex;
		return index + insertIndex;
	}

	addInternal(entry: readonly [K, V]): SortedMapInner<K, V> {
		const entryIndex = this.context.findIndex(entry[0], this.entries);

		if (entryIndex >= 0) {
			const newEntries = Arr.update(
				this.entries,
				entryIndex,
				(currentEntry): readonly [K, V] => {
					if (Object.is(currentEntry[1], entry[1])) return currentEntry;
					return entry;
				},
			);

			return this.copy(newEntries);
		}

		const childIndex = SortedIndex.next(entryIndex);
		const child = this.children[childIndex];

		const newChild = child.addInternal(entry);
		if (newChild === child) return this;

		const newSize = this.size + newChild.size - child.size;

		if (newChild.entries.length <= this.context.maxEntries) {
			// no need to shift
			const newChildren = Arr.set(this.children, childIndex, newChild);
			return this.copy(undefined, newChildren, newSize);
		}

		return this.normalizeDownsizeChild(childIndex, newChild, newSize);
	}

	modifyAtInternal(key: K, options: ModifyOptions<V>): SortedMapInner<K, V> {
		const { ifNew } = options;
		const entryIndex = this.context.findIndex(key, this.entries);

		if (entryIndex >= 0) {
			if (undefined === ifNew) return this;

			const { set, create } = ifNew;
			if (undefined === set && undefined === create) return this;

			const currentEntry = this.entries[entryIndex];
			const currentValue = currentEntry[1];
			const token = Symbol();

			const newValue = create !== undefined ? create(token) : set;

			if (Object.is(newValue, currentValue)) return this;

			if (token === newValue) {
				// remove inner entry
				const leftChild = this.children[entryIndex];
				const rightChild = this.children[entryIndex + 1];

				if (leftChild.entries.length >= rightChild.entries.length) {
					const [max, newLeft] = leftChild.deleteMax();
					const newEntries = Arr.set(this.entries, entryIndex, max);
					const newSelf = this.copy(newEntries);
					return newSelf.normalizeIncreaseChild(
						entryIndex,
						newLeft,
						this.size - 1,
					);
				}

				const [min, newRight] = rightChild.deleteMin();
				const newEntries = Arr.set(this.entries, entryIndex, min);
				const newSelf = this.copy(newEntries);
				return newSelf.normalizeIncreaseChild(
					entryIndex + 1,
					newRight,
					this.size - 1,
				);
			}

			// update inner entry
			const newEntry: [K, V] = [key, newValue];
			const newEntries = Arr.set(this.entries, entryIndex, newEntry);
			return this.copy(newEntries);
		}

		const childIndex = SortedIndex.next(entryIndex);
		const child = this.children[childIndex];

		const newChild = child.modifyAtInternal(key, options);
		const newSize = this.size + newChild.size - child.size;

		if (newChild.entries.length < this.context.minEntries) {
			return this.normalizeIncreaseChild(childIndex, newChild, newSize);
		}
		if (newChild.entries.length > this.context.maxEntries) {
			return this.normalizeDownsizeChild(childIndex, newChild, newSize);
		}

		const newChildren = Arr.set(this.children, childIndex, newChild);
		return this.copy(
			undefined,
			newChildren,
			this.size + newChild.size - child.size,
		);
	}

	takeInternal(amount: number): SortedMapNode<K, V> {
		return innerTakeInternal<SortedMapInner<K, V>, readonly [K, V]>(
			this,
			amount,
		);
	}

	dropInternal(amount: number): SortedMapNode<K, V> {
		return innerDropInternal<SortedMapInner<K, V>, readonly [K, V]>(
			this,
			amount,
		);
	}

	deleteMin(): [readonly [K, V], SortedMapInner<K, V>] {
		return innerDeleteMin<SortedMapInner<K, V>, readonly [K, V]>(this);
	}

	deleteMax(): [readonly [K, V], SortedMapInner<K, V>] {
		return innerDeleteMax<SortedMapInner<K, V>, readonly [K, V]>(this);
	}

	mutateSplitRight(index?: number): [readonly [K, V], SortedMapInner<K, V>] {
		return innerMutateSplitRight<SortedMapInner<K, V>, readonly [K, V]>(
			this,
			index,
		);
	}

	mutateGiveToLeft(
		left: SortedMapInner<K, V>,
		toLeft: readonly [K, V],
	): [readonly [K, V], SortedMapInner<K, V>] {
		return innerMutateGiveToLeft(this, left, toLeft);
	}

	mutateGiveToRight(
		right: SortedMapInner<K, V>,
		toRight: readonly [K, V],
	): [readonly [K, V], SortedMapInner<K, V>] {
		return innerMutateGiveToRight(this, right, toRight);
	}

	mutateGetFromLeft(
		left: SortedMapInner<K, V>,
		toMe: readonly [K, V],
	): [readonly [K, V], SortedMapInner<K, V>] {
		return innerMutateGetFromLeft(this, left, toMe);
	}

	mutateGetFromRight(
		right: SortedMapInner<K, V>,
		toMe: readonly [K, V],
	): [readonly [K, V], SortedMapInner<K, V>] {
		return innerMutateGetFromRight(this, right, toMe);
	}

	mutateJoinLeft(left: SortedMapInner<K, V>, entry: readonly [K, V]): void {
		innerMutateJoinLeft(this, left, entry);
	}

	mutateJoinRight(right: SortedMapInner<K, V>, entry: readonly [K, V]): void {
		innerMutateJoinRight(this, right, entry);
	}

	normalizeDownsizeChild(
		childIndex: number,
		newChild: SortedMapNode<K, V>,
		newSize: number,
	): SortedMapInner<K, V> {
		return innerNormalizeDownsizeChild<SortedMapInner<K, V>, readonly [K, V]>(
			this,
			childIndex,
			newChild,
			newSize,
		);
	}

	normalizeIncreaseChild(
		childIndex: number,
		newChild: SortedMapNode<K, V>,
		newSize: number,
	): SortedMapInner<K, V> {
		return innerNormalizeIncreaseChild<SortedMapInner<K, V>, readonly [K, V]>(
			this,
			childIndex,
			newChild,
			newSize,
		);
	}

	normalize(): SortedMap<K, V> {
		if (this.entries.length === 0) return this.children[0].normalize();

		if (this.entries.length <= this.context.maxEntries) return this;

		const size = this.size;
		const [upEntry, rightNode] = this.mutateSplitRight();

		return this.copy([upEntry], [this, rightNode], size);
	}
}