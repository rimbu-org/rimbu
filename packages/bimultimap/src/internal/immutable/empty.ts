import type { BiMultiMap } from '@rimbu/bimultimap';
import type { BiMultiMapCollection } from '@rimbu/bimultimap/advanced/bimultimap-base';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { Op } from '@rimbu/collection-types/types';
import type { RelatedTo } from '@rimbu/common/types';
import type { MultiMap } from '@rimbu/multimap';
import type { Stream } from '@rimbu/stream';

import type { BiMultiMapContextImpl } from '#bimultimap/context-factory';

import * as RimbuError from '@rimbu/base/rimbu-error';
import { type StreamSource, Stream as StreamValue } from '@rimbu/stream';

export class BiMultiMapEmpty<K, V> implements BiMultiMap<K, V> {
	declare readonly _NonEmptyType: BiMultiMap.NonEmpty<K, V>;

	constructor(readonly context: BiMultiMapContextImpl<K, V>) {}

	get isEmpty(): true {
		return true;
	}

	get size(): 0 {
		return 0;
	}

	get keySize(): 0 {
		return 0;
	}

	get keyValueMultiMap(): MultiMap<K, V> {
		return this.context.keyValueMultiMapContext.empty<readonly [K, V]>();
	}

	get valueKeyMultiMap(): MultiMap<V, K> {
		return this.context.valueKeyMultiMapContext.empty<readonly [V, K]>();
	}

	stream(): Stream<readonly [K, V]> {
		return StreamValue.empty();
	}

	streamKeys(): Stream<K> {
		return StreamValue.empty();
	}

	streamValues(): Stream<V> {
		return StreamValue.empty();
	}

	[Symbol.iterator](): ReturnType<BiMultiMap<K, V>[typeof Symbol.iterator]> {
		return this.stream()[Symbol.iterator]() as ReturnType<
			BiMultiMap<K, V>[typeof Symbol.iterator]
		>;
	}

	has(): boolean {
		return false;
	}

	hasValue(): boolean {
		return false;
	}

	hasEntry(): boolean {
		return false;
	}

	getValues<UK = K>(key: RelatedTo<K, UK>): SetCollection<V> {
		return this.context.keyValueMultiMapContext
			.empty<readonly [K, V]>()
			.getValues(key);
	}

	getKeys<UV = V>(value: RelatedTo<V, UV>): SetCollection<K> {
		return this.context.valueKeyMultiMapContext
			.empty<readonly [V, K]>()
			.getValues(value);
	}

	addTo(key: K, value: V): BiMultiMap.NonEmpty<K, V> {
		return this.context.createNonEmpty(
			this.context.keyValueMultiMapContext.of<readonly [K, V]>([key, value]),
			this.context.valueKeyMultiMapContext.of<readonly [V, K]>([value, key]),
		);
	}

	addEach(
		elements: StreamSource.NonEmpty<readonly [K, V]>,
	): BiMultiMap.NonEmpty<K, V>;
	addEach(elements: StreamSource<readonly [K, V]>): BiMultiMap<K, V>;
	addEach(elements: StreamSource<readonly [K, V]>): BiMultiMap<K, V> {
		const builder = this.context.createBuilder<K, V>();
		builder.addEach(elements);
		return builder.build();
	}

	setEachValue(
		key: K,
		values: StreamSource.NonEmpty<V>,
	): BiMultiMap.NonEmpty<K, V>;
	setEachValue(key: K, values: StreamSource<V>): BiMultiMap<K, V>;
	setEachValue(key: K, values: StreamSource<V>): BiMultiMap<K, V> {
		const builder = this.context.createBuilder<K, V>();
		builder.setEachValue(key, values);
		return builder.build();
	}

	setEachKey(
		value: V,
		keys: StreamSource.NonEmpty<K>,
	): BiMultiMap.NonEmpty<K, V>;
	setEachKey(value: V, keys: StreamSource<K>): BiMultiMap<K, V>;
	setEachKey(value: V, keys: StreamSource<K>): BiMultiMap<K, V> {
		const builder = this.context.createBuilder<K, V>();
		builder.setEachKey(value, keys);
		return builder.build();
	}

	removeKey(): BiMultiMap<K, V> {
		return this;
	}

	removeKeyAndReturn(): Op.DynamicResult<
		BiMultiMap<K, V>,
		undefined,
		SetCollection<V>,
		BiMultiMap<K, V>
	> {
		return {
			collection: this,
			hasResult: false,
			result: undefined,
			hasChanged: false,
		};
	}

	removeKeys(): BiMultiMap<K, V> {
		return this;
	}

	removeEntry(): BiMultiMap<K, V> {
		return this;
	}

	removeEntries(): BiMultiMap<K, V> {
		return this;
	}

	removeValue(): BiMultiMap<K, V> {
		return this;
	}

	removeValues(): BiMultiMap<K, V> {
		return this;
	}

	modifyValuesAt(
		_atKey: K,
		options: BiMultiMapCollection.Advanced.ModifySetOptions<V>,
	): BiMultiMap<K, V> {
		const { ifNew } = options;
		const source = ifNew?.create?.() ?? ifNew?.set;
		if (undefined === source) return this;

		const builder = this.context.createBuilder<K, V>();
		builder.setEachValue(_atKey, source);
		return builder.build();
	}

	modifyKeysAt(
		_atValue: V,
		options: BiMultiMapCollection.Advanced.ModifySetOptions<K>,
	): BiMultiMap<K, V> {
		const { ifNew } = options;
		const source = ifNew?.create?.() ?? ifNew?.set;
		if (undefined === source) return this;

		const builder = this.context.createBuilder<K, V>();
		builder.setEachKey(_atValue, source);
		return builder.build();
	}

	mapValues<V2 extends V>(
		_mapFun: (value: V, key: K) => V2,
	): BiMultiMap<K, V2> {
		return this as unknown as BiMultiMap<K, V2>;
	}

	map<K2 extends K, V2 extends V>(
		_f: (element: readonly [K, V]) => readonly [K2, V2],
	): BiMultiMap<K2, V2> {
		return this as unknown as BiMultiMap<K2, V2>;
	}

	mapIndexed<K2 extends K, V2 extends V>(
		_f: (element: readonly [K, V], index: number) => readonly [K2, V2],
	): BiMultiMap<K2, V2> {
		return this as unknown as BiMultiMap<K2, V2>;
	}

	flatMap<K2 extends K, V2 extends V>(
		_f: (element: readonly [K, V]) => StreamSource<readonly [K2, V2]>,
	): BiMultiMap<K2, V2> {
		return this as unknown as BiMultiMap<K2, V2>;
	}

	flatMapIndexed<K2 extends K, V2 extends V>(
		_f: (
			element: readonly [K, V],
			index: number,
		) => StreamSource<readonly [K2, V2]>,
	): BiMultiMap<K2, V2> {
		return this as unknown as BiMultiMap<K2, V2>;
	}

	filter(): BiMultiMap<K, V> {
		return this;
	}

	filterIndexed(): BiMultiMap<K, V> {
		return this;
	}

	mutate(
		_mutateFun: (builder: BiMultiMap.Builder<K, V>) => void,
	): BiMultiMap<K, V> {
		// Nothing to mutate: the result is unchanged.
		return this;
	}

	recompose(): BiMultiMap<K, V> {
		return this;
	}

	invert(): BiMultiMap<V, K> {
		return this.context.valueKeyMultiMapContext.empty<
			readonly [V, K]
		>() as unknown as BiMultiMap<V, K>;
	}

	forEach(): void {
		// Nothing to traverse.
	}

	forEachIndexed(): void {
		// Nothing to traverse.
	}

	toArray(): [K, V][] {
		return [];
	}

	nonEmpty(): this is BiMultiMap.NonEmpty<K, V> {
		return false;
	}

	assumeNonEmpty(): BiMultiMap.NonEmpty<K, V> {
		RimbuError.throwEmptyCollectionAssumedNonEmptyError();
	}

	asNormal(): BiMultiMap<K, V> {
		return this;
	}

	toBuilder(): BiMultiMap.Builder<K, V> {
		return this.context.createBuilder<K, V>();
	}

	toString(): string {
		return `${this.context.typeTag}()`;
	}
}
