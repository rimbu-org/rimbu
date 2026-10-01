import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { Op } from '@rimbu/collection-types/types';
import type { MultiMap } from '@rimbu/multimap';
import type { MultiMapCollection } from '@rimbu/multimap/advanced/multimap-base';
import type { Stream, StreamSource } from '@rimbu/stream';

import type { MultiMapContextImpl } from '#multimap/context-factory';

import { CollectionEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { checkEmptyModifyOptions } from '@rimbu/collection-types/advanced/common';
import { Stream as StreamImpl } from '@rimbu/stream';

export class MultiMapEmpty<K, V>
	extends CollectionEmpty.Constructor<
		readonly [K, V],
		MultiMap.Advanced.Family<K, V>,
		Collection.Advanced.Types<MultiMap.Advanced.Family<K, V>, readonly [K, V]>
	>
	implements MultiMap<K, V>
{
	constructor(readonly context: MultiMapContextImpl<K, V>) {
		super(context);
	}

	/** `this` as the public type, for handing back to context factories. */
	get #self(): MultiMap<K, V> {
		return this as unknown as MultiMap<K, V>;
	}

	get keyMap(): MapCollection<K, SetCollection.NonEmpty<V>> {
		return this.context.keyMapContext.empty();
	}

	get keySize(): 0 {
		return 0;
	}

	streamKeys(): Stream<K> {
		return StreamImpl.empty<K>();
	}

	streamValues(): Stream<V> {
		return StreamImpl.empty<V>();
	}

	getValues(): SetCollection<V> {
		return this.context.keyMapValuesContext.empty();
	}

	has(): false {
		return false;
	}

	hasEntry(): false {
		return false;
	}

	count(): 0 {
		return 0;
	}

	addTo(key: K, value: V): MultiMap.NonEmpty<K, V> {
		return this.context.createNonEmpty(
			this.context.keyMapContext.of([
				key,
				this.context.keyMapValuesContext.of(value),
			] as [K, SetCollection.NonEmpty<V>]) as unknown as MapCollection.NonEmpty<
				K,
				SetCollection.NonEmpty<V>
			>,
			1,
		);
	}

	addEach(
		entries: StreamSource.NonEmpty<readonly [K, V]>,
	): MultiMap.NonEmpty<K, V>;
	addEach(entries: StreamSource<readonly [K, V]>): MultiMap<K, V>;
	addEach(entries: StreamSource<readonly [K, V]>): MultiMap<K, V> {
		return this.context.from(entries) as unknown as MultiMap<K, V>;
	}

	addEachValue(
		key: K,
		values: StreamSource.NonEmpty<V>,
	): MultiMap.NonEmpty<K, V>;
	addEachValue(key: K, values: StreamSource<V>): MultiMap<K, V>;
	addEachValue(key: K, values: StreamSource<V>): MultiMap<K, V> {
		return this.context.from(
			StreamImpl.from(values).map((v) => [key, v] as [K, V]),
		) as unknown as MultiMap<K, V>;
	}

	setEachValue(
		key: K,
		values: StreamSource.NonEmpty<V>,
	): MultiMap.NonEmpty<K, V>;
	setEachValue(key: K, values: StreamSource<V>): MultiMap<K, V>;
	setEachValue(key: K, values: StreamSource<V>): MultiMap<K, V> {
		const valueSet = this.context.keyMapValuesContext.from(values);
		if (!valueSet.nonEmpty()) return this.#self;
		return this.context.createNonEmpty(
			this.context.keyMapContext.of([key, valueSet] as [
				K,
				SetCollection.NonEmpty<V>,
			]) as unknown as MapCollection.NonEmpty<K, SetCollection.NonEmpty<V>>,
			valueSet.size,
		) as unknown as MultiMap<K, V>;
	}

	modifyValuesAt(
		atKey: K,
		options: MultiMapCollection.Advanced.ModifyValuesOptions<
			V,
			SetCollection.NonEmpty<V>
		>,
	): MultiMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this.#self;
		const { ifNew } = options;
		if (undefined === ifNew) return this.#self;
		const { set, create } = ifNew;
		return this.setEachValue(atKey, undefined !== create ? create() : set);
	}

	removeKey(): MultiMap<K, V> {
		return this.#self;
	}

	removeKeys(): MultiMap<K, V> {
		return this.#self;
	}

	removeEntry(): MultiMap<K, V> {
		return this.#self;
	}

	removeEntries(): MultiMap<K, V> {
		return this.#self;
	}

	removeKeyAndReturn(): Op.DynamicResult<
		MultiMap<K, V>,
		undefined,
		SetCollection<V>,
		MultiMap<K, V>
	> {
		return {
			collection: this.#self,
			hasResult: false,
			result: undefined,
			hasChanged: false,
		};
	}

	mapValues<V2 extends V>(mapFun: (value: V, key: K) => V2): MultiMap<K, V2> {
		return this.#self as unknown as MultiMap<K, V2>;
	}

	flatMapValues<V2 extends V>(
		flatMapFun: (value: V, key: K) => StreamSource<V2>,
	): MultiMap<K, V2> {
		return this.#self as unknown as MultiMap<K, V2>;
	}

	map<K2 extends K, V2 extends V>(
		mapFun: (entry: readonly [K, V]) => readonly [K2, V2],
	): MultiMap<K2, V2> {
		return this.#self as unknown as MultiMap<K2, V2>;
	}

	mapIndexed<K2 extends K, V2 extends V>(
		mapFun: (entry: readonly [K, V], index: number) => readonly [K2, V2],
		options?: { indexOffset?: number | undefined } | undefined,
	): MultiMap<K2, V2> {
		return this.#self as unknown as MultiMap<K2, V2>;
	}

	flatMap<K2 extends K, V2 extends V>(
		flatMapFun: (entry: readonly [K, V]) => StreamSource<readonly [K2, V2]>,
	): MultiMap<K2, V2> {
		return this.#self as unknown as MultiMap<K2, V2>;
	}

	flatMapIndexed<K2 extends K, V2 extends V>(
		flatMapFun: (
			entry: readonly [K, V],
			index: number,
		) => StreamSource<readonly [K2, V2]>,
		options?: { indexOffset?: number | undefined } | undefined,
	): MultiMap<K2, V2> {
		return this.#self as unknown as MultiMap<K2, V2>;
	}

	recompose<K2 extends K, V2 extends V>(
		recomposeFun: (
			stream: Stream<readonly [K, V]>,
		) => StreamSource<readonly [K2, V2]>,
	): MultiMap<K2, V2> {
		return this.#self as unknown as MultiMap<K2, V2>;
	}

	union<U extends V>(other: MultiMap.NonEmpty<K, U>): MultiMap.NonEmpty<K, V>;
	union<U extends V>(other: MultiMap<K, U>): MultiMap<K, V>;
	union<U extends V>(other: MultiMap<K, U>): MultiMap<K, V> {
		if (other.isEmpty) return this.#self;
		return this.context.from(other) as unknown as MultiMap<K, V>;
	}

	intersection<U extends V>(): MultiMap<K, V> {
		return this.#self;
	}

	difference<U extends V>(): MultiMap<K, V> {
		return this.#self;
	}

	symmetricDifference<U extends V>(other: MultiMap<K, U>): MultiMap<K, V> {
		if (other.isEmpty) return this.#self;
		return this.context.from(other) as unknown as MultiMap<K, V>;
	}

	toString(): string {
		return `${this.context.typeTag}()`;
	}
}
