import type { ModifyOptions } from '@rimbu/collection-types/advanced/common';
import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { Op } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common';
import type { MultiMap } from '@rimbu/multimap';
import type { MultiMapCollection } from '@rimbu/multimap/advanced/multimap-base';
import type { Stream, StreamSource } from '@rimbu/stream';

import type { MultiMapContextImpl } from '#multimap/context-factory';

import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { checkEmptyModifyOptions } from '@rimbu/collection-types/advanced/common';
import { Stream as StreamImpl } from '@rimbu/stream';

type MultiMapTypesNonEmpty<K, V> = Collection.Advanced.TypesNonEmpty<
	MultiMap.Advanced.Family<K, V>,
	readonly [K, V]
>;

export class MultiMapNonEmpty<K, V>
	extends CollectionNonEmpty.Constructor<
		readonly [K, V],
		MultiMap.Advanced.Family<K, V>,
		MultiMapTypesNonEmpty<K, V>
	>
	implements MultiMap.NonEmpty<K, V>
{
	constructor(
		readonly context: MultiMapContextImpl<K, V>,
		readonly keyMap: MapCollection.NonEmpty<K, SetCollection.NonEmpty<V>>,
		readonly size: number,
	) {
		super(context);
	}

	/** `this` as the public types, for handing back to context factories. */
	get #self(): MultiMap.NonEmpty<K, V> {
		return this as unknown as MultiMap.NonEmpty<K, V>;
	}

	get #normal(): MultiMap<K, V> {
		return this as unknown as MultiMap<K, V>;
	}

	override assumeNonEmpty(): this {
		return this;
	}

	toBuilder(): MultiMap.Builder<K, V> {
		return this.context.createBuilder(this.#self);
	}

	mutate(f: (builder: MultiMap.Builder<K, V>) => void): MultiMap<K, V> {
		const builder = this.toBuilder();
		f(builder);
		return builder.build();
	}

	copy(
		keyMap: MapCollection.NonEmpty<K, SetCollection.NonEmpty<V>>,
		size: number,
	): MultiMap.NonEmpty<K, V> {
		if (keyMap === this.keyMap && size === this.size) return this.#self;
		return this.context.createNonEmpty(
			keyMap,
			size,
		) as unknown as MultiMap.NonEmpty<K, V>;
	}

	copyE(
		keyMap: MapCollection<K, SetCollection.NonEmpty<V>>,
		size: number,
	): MultiMap<K, V> {
		if (keyMap.nonEmpty()) {
			return this.copy(keyMap, size) as unknown as MultiMap<K, V>;
		}
		return this.context.empty<readonly [K, V]>();
	}

	stream(): Stream.NonEmpty<readonly [K, V]> {
		return this.keyMap
			.stream()
			.flatMap(
				([key, values]): Stream.NonEmpty<readonly [K, V]> =>
					values.stream().map((v) => [key, v] as const),
			);
	}

	streamKeys(): Stream.NonEmpty<K> {
		return this.keyMap.streamKeys();
	}

	streamValues(): Stream.NonEmpty<V> {
		return this.keyMap.streamValues().flatMap((values) => values.stream());
	}

	forEach(f: (entry: readonly [K, V]) => void): void {
		this.keyMap.forEachIndexed(([key, values]) => {
			values.forEach((value) => {
				f([key, value] as const);
			});
		});
	}

	filter<
		E2 extends readonly [K, V],
		NE2 extends readonly [K, V] = Exclude<readonly [K, V], E2>,
	>(
		pred: (element: readonly [K, V]) => element is E2,
		options: { negate: true },
	): Collection.Advanced.ReTyped<MultiMapTypesNonEmpty<K, V>, NE2>['_NORMAL'];
	filter<E2 extends readonly [K, V]>(
		pred: (element: readonly [K, V]) => element is E2,
		options?: { negate?: false | undefined } | undefined,
	): Collection.Advanced.ReTyped<MultiMapTypesNonEmpty<K, V>, E2>['_NORMAL'];
	filter(
		pred: (element: readonly [K, V]) => boolean,
		options?: { negate?: boolean | undefined } | undefined,
	): MultiMap<K, V>;
	filter(
		pred: (element: readonly [K, V], index?: number) => boolean,
		options?: { negate?: boolean | undefined } | undefined,
	): MultiMap<K, V> {
		const { negate = false } = options ?? {};
		const builder = this.context.builder<readonly [K, V]>();

		let index = 0;

		this.forEach((entry) => {
			if (negate !== pred(entry, index++)) {
				builder.addTo(entry[0], entry[1]);
			}
		});

		if (builder.size === this.size) return this.#normal;
		return builder.build();
	}

	toArray(): ArrayNonEmpty<readonly [K, V]> {
		return this.stream().toArray();
	}

	get keySize(): number {
		return this.keyMap.size;
	}

	getValues<U = K>(key: RelatedTo<K, U>): SetCollection<V> {
		return (
			(this.keyMap.get(key) as SetCollection.NonEmpty<V> | undefined) ??
			this.context.keyMapValuesContext.empty()
		);
	}

	has<U = K>(key: RelatedTo<K, U>): boolean {
		return this.keyMap.has(key);
	}

	hasEntry<U = K>(key: RelatedTo<K, U>, value: V): boolean {
		return this.keyMap.get(key)?.has(value) ?? false;
	}

	count<U = K>(key: RelatedTo<K, U>): number {
		return this.keyMap.get(key)?.size ?? 0;
	}

	addTo(key: K, value: V): MultiMap.NonEmpty<K, V> {
		let newSize = this.size;

		const newKeyMap = this.keyMap.modifyAtKey(key, {
			ifNew: {
				create: () => {
					newSize++;
					return this.context.keyMapValuesContext.of(value);
				},
			},
			ifExists: {
				update: (values) => {
					const newValues = values.add(value);
					if (newValues === values) return values;
					newSize -= values.size;
					newSize += newValues.size;
					return newValues;
				},
			},
		}) as unknown as MapCollection<K, SetCollection.NonEmpty<V>>;

		return this.copyE(newKeyMap, newSize).assumeNonEmpty();
	}

	addEach(
		entries: StreamSource.NonEmpty<readonly [K, V]>,
	): MultiMap.NonEmpty<K, V>;
	addEach(entries: StreamSource<readonly [K, V]>): MultiMap.NonEmpty<K, V>;
	addEach(entries: StreamSource<readonly [K, V]>): MultiMap<K, V> {
		if (StreamImpl.isEmptyStreamSourceInstance(entries)) return this.#normal;
		const builder = this.toBuilder();
		builder.addEach(entries);
		return builder.build();
	}

	addEachValue(
		key: K,
		values: StreamSource.NonEmpty<V>,
	): MultiMap.NonEmpty<K, V>;
	addEachValue(key: K, values: StreamSource<V>): MultiMap<K, V>;
	addEachValue(key: K, values: StreamSource<V>): MultiMap<K, V> {
		if (StreamImpl.isEmptyStreamSourceInstance(values)) return this.#normal;
		const builder = this.toBuilder();
		builder.addEachValue(key, values);
		return builder.build();
	}

	setEachValue(
		key: K,
		values: StreamSource.NonEmpty<V>,
	): MultiMap.NonEmpty<K, V>;
	setEachValue(key: K, values: StreamSource<V>): MultiMap<K, V>;
	setEachValue(key: K, values: StreamSource<V>): MultiMap<K, V> {
		return this.modifyValuesAt(key, {
			ifNew: { set: values },
			ifExists: { set: values },
		});
	}

	mapValues<V2 extends V>(
		mapFun: (value: V, key: K) => V2,
	): MultiMap.NonEmpty<K, V2> {
		const newKeyMap = this.keyMap.mapValues((values, key) =>
			this.context.keyMapValuesContext.from(
				values.stream().map((v) => mapFun(v, key)),
			),
		) as unknown as MapCollection.NonEmpty<K, SetCollection.NonEmpty<V2>>;

		// `size` is unchanged: mapping values never changes how many there are.
		if ((newKeyMap as unknown) === this.keyMap) {
			return this as unknown as MultiMap.NonEmpty<K, V2>;
		}

		return this.context.createNonEmpty<K, V2>(
			newKeyMap,
			this.size,
		) as unknown as MultiMap.NonEmpty<K, V2>;
	}

	flatMapValues<V2 extends V>(
		flatMapFun: (value: V, key: K) => StreamSource<V2>,
	): MultiMap<K, V2> {
		const builder = this.context.builder<readonly [K, V2]>();

		this.keyMap.forEachIndexed(([key, values]) => {
			const newValues = this.context.keyMapValuesContext.from(
				values.stream().flatMap((v) => flatMapFun(v, key)),
			);
			// A key whose values all map away is dropped, not stored empty.
			if (newValues.nonEmpty()) {
				builder.setEachValue(key, newValues);
			}
		});

		return builder.build();
	}

	map<K2 extends K, V2 extends V>(
		mapFun: (entry: readonly [K, V]) => readonly [K2, V2],
	): MultiMap.NonEmpty<K2, V2> {
		return this.context.from(
			this.stream().map(mapFun),
		) as unknown as MultiMap.NonEmpty<K2, V2>;
	}

	mapIndexed<K2 extends K, V2 extends V>(
		mapFun: (entry: readonly [K, V], index: number) => readonly [K2, V2],
		options?: { indexOffset?: number | undefined } | undefined,
	): MultiMap.NonEmpty<K2, V2> {
		const { indexOffset = 0 } = options ?? {};
		let index = indexOffset;
		return this.context.from(
			this.stream().map((entry) => mapFun(entry, index++)),
		) as unknown as MultiMap.NonEmpty<K2, V2>;
	}

	flatMap<K2 extends K, V2 extends V>(
		flatMapFun: (
			entry: readonly [K, V],
		) => StreamSource.NonEmpty<readonly [K2, V2]>,
	): MultiMap.NonEmpty<K2, V2>;
	flatMap<K2 extends K, V2 extends V>(
		flatMapFun: (entry: readonly [K, V]) => StreamSource<readonly [K2, V2]>,
	): MultiMap<K2, V2>;
	flatMap<K2 extends K, V2 extends V>(
		flatMapFun: (entry: readonly [K, V]) => StreamSource<readonly [K2, V2]>,
	): MultiMap<K2, V2> {
		return this.context.from(
			this.stream().flatMap(flatMapFun),
		) as unknown as MultiMap<K2, V2>;
	}

	flatMapIndexed<K2 extends K, V2 extends V>(
		flatMapFun: (
			entry: readonly [K, V],
			index: number,
		) => StreamSource.NonEmpty<readonly [K2, V2]>,
		options?: { indexOffset?: number | undefined } | undefined,
	): MultiMap.NonEmpty<K2, V2>;
	flatMapIndexed<K2 extends K, V2 extends V>(
		flatMapFun: (
			entry: readonly [K, V],
			index: number,
		) => StreamSource<readonly [K2, V2]>,
		options?: { indexOffset?: number | undefined } | undefined,
	): MultiMap<K2, V2>;
	flatMapIndexed<K2 extends K, V2 extends V>(
		flatMapFun: (
			entry: readonly [K, V],
			index: number,
		) => StreamSource<readonly [K2, V2]>,
		options?: { indexOffset?: number | undefined } | undefined,
	): MultiMap<K2, V2> {
		const { indexOffset = 0 } = options ?? {};
		let index = indexOffset;
		return this.context.from(
			this.stream().flatMap((entry) => flatMapFun(entry, index++)),
		) as unknown as MultiMap<K2, V2>;
	}

	recompose<K2 extends K, V2 extends V>(
		recomposeFun: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource.NonEmpty<readonly [K2, V2]>,
	): MultiMap.NonEmpty<K2, V2>;
	recompose<K2 extends K, V2 extends V>(
		recomposeFun: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource<readonly [K2, V2]>,
	): MultiMap<K2, V2>;
	recompose<K2 extends K, V2 extends V>(
		recomposeFun: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource<readonly [K2, V2]>,
	): MultiMap<K2, V2> {
		return this.context.from(
			recomposeFun(this.stream()),
		) as unknown as MultiMap<K2, V2>;
	}

	modifyValuesAt(
		atKey: K,
		options: MultiMapCollection.Advanced.ModifyValuesOptions<
			V,
			SetCollection.NonEmpty<V>
		>,
	): MultiMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this.#normal;

		let newSize = this.size;
		const { ifNew, ifExists } = options;

		const keyMapOptions: ModifyOptions<SetCollection.NonEmpty<V>> = {};

		if (undefined !== ifNew) {
			keyMapOptions.ifNew = {
				create: (skip) => {
					const { set, create } = ifNew;
					const newValues = this.context.keyMapValuesContext.from(
						undefined !== create ? create() : set,
					);
					// An empty result means "leave no values here", which for a
					// MultiMap is the same as not having the key at all.
					if (!newValues.nonEmpty()) return skip;
					newSize += newValues.size;
					return newValues;
				},
			};
		}

		if (undefined !== ifExists) {
			keyMapOptions.ifExists = {
				update: (currentValues, remove) => {
					const { set, update } = ifExists;
					const newValues = this.context.keyMapValuesContext.from(
						undefined !== update ? update(currentValues) : set,
					);
					if (!newValues.nonEmpty()) {
						newSize -= currentValues.size;
						return remove;
					}
					newSize -= currentValues.size;
					newSize += newValues.size;
					return newValues;
				},
			};
		}

		return this.copyE(
			this.keyMap.modifyAtKey(atKey, keyMapOptions) as unknown as MapCollection<
				K,
				SetCollection.NonEmpty<V>
			>,
			newSize,
		);
	}

	removeKey<U = K>(key: RelatedTo<K, U>): MultiMap<K, V> {
		if (!this.context.keyMapContext.isValidKey(key)) return this.#normal;
		return this.modifyValuesAt(key as K, { ifExists: { set: [] } });
	}

	removeKeyAndReturn<U = K>(
		key: RelatedTo<K, U>,
	): Op.DynamicResult<
		MultiMap.NonEmpty<K, V>,
		undefined,
		SetCollection<V>,
		MultiMap<K, V>
	> {
		const absent: Op.DynamicResult<
			MultiMap.NonEmpty<K, V>,
			undefined,
			SetCollection<V>,
			MultiMap<K, V>
		> = {
			collection: this.#self,
			hasResult: false,
			result: undefined,
			hasChanged: false,
		};

		if (!this.context.keyMapContext.isValidKey(key)) return absent;

		let removed: SetCollection.NonEmpty<V> | undefined;

		const result = this.modifyValuesAt(key as K, {
			ifExists: {
				update: (values) => {
					removed = values;
					return [];
				},
			},
		});

		if (undefined === removed) return absent;

		return {
			collection: result,
			hasResult: true,
			result: removed,
			hasChanged: true,
		};
	}

	removeKeys<U = K>(keys: StreamSource<RelatedTo<K, U>>): MultiMap<K, V> {
		if (StreamImpl.isEmptyStreamSourceInstance(keys)) return this.#normal;
		const builder = this.toBuilder();
		builder.removeKeys(keys);
		return builder.build();
	}

	removeEntry<U = K, UV = V>(
		key: RelatedTo<K, U>,
		value: RelatedTo<V, UV>,
	): MultiMap<K, V> {
		if (!this.context.keyMapContext.isValidKey(key)) return this.#normal;
		return this.modifyValuesAt(key as K, {
			ifExists: { update: (values) => values.remove(value) },
		});
	}

	removeEntries<U = K, UV = V>(
		entries: StreamSource<[RelatedTo<K, U>, RelatedTo<V, UV>]>,
	): MultiMap<K, V> {
		if (StreamImpl.isEmptyStreamSourceInstance(entries)) return this.#normal;
		const builder = this.toBuilder();
		builder.removeEntries(entries);
		return builder.build();
	}

	union<U extends V>(
		other: MultiMapCollection.CollectionNonEmpty<K, U>,
	): MultiMap.NonEmpty<K, V>;
	union<U extends V>(
		other: MultiMapCollection.Collection<K, U>,
	): MultiMap<K, V>;
	union<U extends V>(
		other: MultiMapCollection.Collection<K, U>,
	): MultiMap<K, V> {
		if (other.isEmpty) return this.#normal;
		if (other === (this as unknown)) return this.#normal;
		const builder = this.toBuilder();
		builder.addEach(other);
		return builder.build();
	}

	intersection<U extends V>(
		other: MultiMapCollection.Collection<K, U>,
	): MultiMap<K, V> {
		if (other.isEmpty) return this.context.empty<readonly [K, V]>();
		if (other === (this as unknown)) return this.#normal;
		const builder = this.context.builder<readonly [K, V]>();
		this.keyMap.forEachIndexed(([key, values]) => {
			const inter = values.intersection(other.getValues(key));
			if (inter.nonEmpty()) builder.setEachValue(key, inter);
		});
		return builder.build();
	}

	difference<U extends V>(
		other: MultiMapCollection.Collection<K, U>,
	): MultiMap<K, V> {
		if (other.isEmpty) return this.#normal;
		if (other === (this as unknown))
			return this.context.empty<readonly [K, V]>();
		return this.removeEntries(other as unknown as StreamSource<[K, U]>);
	}

	symmetricDifference<U extends V>(
		other: MultiMapCollection.Collection<K, U>,
	): MultiMap<K, V> {
		if (other.isEmpty) return this.#normal;
		if (other === (this as unknown))
			return this.context.empty<readonly [K, V]>();

		const builder = this.toBuilder();
		const otherBuilder = other.toBuilder();

		let thisEntry: readonly [K, SetCollection.NonEmpty<V>] | undefined;
		const thisIter = this.keyMap[Symbol.iterator]();

		while ((thisEntry = thisIter.fastNext()) !== undefined) {
			const [key, values] = thisEntry;
			const otherValues = otherBuilder.getValues(key) as SetCollection<V>;
			if (!otherValues.isEmpty) {
				otherBuilder.removeKey(key);
				builder.setEachValue(
					key,
					values.symmetricDifference(
						otherValues as SetCollection.NonEmpty<V>,
					) as unknown as SetCollection<V>,
				);
			}
		}

		otherBuilder.forEach(([key, otherValues]) => {
			builder.setEachValue(key, otherValues as SetCollection<V>);
		});

		return builder.build();
	}

	toString(): string {
		return this.keyMap.stream().join({
			start: `${this.context.typeTag}(`,
			sep: ', ',
			end: ')',
			valueToString: ([key, values]) =>
				`${key} -> ${values.stream().join({ start: '[', sep: ', ', end: ']' })}`,
		});
	}
}
