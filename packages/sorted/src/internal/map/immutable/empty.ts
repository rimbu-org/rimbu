import type { IndexRange } from '@rimbu/common/index-range';
import type { RelatedTo, ToJSON, WithValueResult } from '@rimbu/common/types';
import type { SortedMap } from '@rimbu/sorted/map';

import type { ContextImpl } from '#map/context-factory';

import { IndexedKeyedSortedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/indexed-keyed-sorted-base';
import { KeyedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { CollectionEmpty } from '@rimbu/collection-types/advanced/collection-base';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { MapCollectionEmpty } from '@rimbu/collection-types/advanced/map-base';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream, type StreamSource } from '@rimbu/stream';

const EmptyBase = IndexedKeyedSortedCollectionEmpty.WithMixin(
	MapCollectionEmpty.WithMixin(
		KeyedCollectionEmpty.WithMixin(CollectionEmpty.Constructor),
	),
);

export class SortedMapEmpty<K = any, V = any>
	extends EmptyBase<K, V, SortedMap.Advanced.Family<K, V>>
	implements SortedMap<K, V>
{
	declare _NonEmptyType: SortedMap.NonEmpty<K, V>;

	constructor(readonly context: ContextImpl<K>) {
		super(context);
	}

	streamRange(): Stream<readonly [K, V]> {
		return Stream.empty();
	}

	streamSliceIndex(): Stream<readonly [K, V]> {
		return Stream.empty();
	}

	get comp(): any {
		return this.context.comp;
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

	get<_, O>(key: any, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	at<_, O>(key: any, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	atIndex<O>(_index: number, otherwise?: OptLazy<O>): readonly [K, V] | O {
		return OptLazy(otherwise) as O;
	}

	sliceIndex(_range: IndexRange): SortedMap<K, V> {
		return this;
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

	nextEntry<O>(
		_key: K,
		options?: { inclusive?: boolean; otherwise?: OptLazy<O> },
	): O | readonly [K, V] {
		return OptLazy(options?.otherwise) as O;
	}

	previousEntry<O>(
		_key: K,
		options?: { inclusive?: boolean; otherwise?: OptLazy<O> },
	): O | readonly [K, V] {
		return OptLazy(options?.otherwise) as O;
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

	// aliases for Collection WithAdd
	add(...args: any[]): any {
		return (this as any).addEntry(...args);
	}
	addAll(...args: any[]): any {
		return (this as any).addEntries(...args);
	}

	// aliases for KeyedCollection WithRemove
	remove(...args: any[]): any {
		return (this as any).removeKey(...args);
	}
	removeAll(...args: any[]): any {
		return (this as any).removeKeys(...args);
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

	// aliases for WithModifyAtKey / WithUpdateAtKey
	modifyAtKey(...args: any[]): any {
		return (this as any).modifyAt(...args);
	}
	updateAtKey(...args: any[]): any {
		return (this as any).updateAt(...args);
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

	removeKeyAndReturn<UK>(key: RelatedTo<K, UK>, otherwise?: OptLazy<any>): any {
		const result = OptLazy(otherwise);
		return {
			collection: this,
			hasResult: false,
			result,
			hasChanged: false,
		};
	}

	updateAtKeyAndReturn<UK>(
		key: RelatedTo<K, UK>,
		update: (value: V) => V,
	): any {
		return {
			collection: this,
			hasResult: false,
			result: [undefined, undefined] as any,
			hasChanged: false,
		};
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
