import type { BiMap } from '@rimbu/bimap/bimap';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { Op } from '@rimbu/collection-types/types';

import type { BiMapCollectionContext } from '#bimap/context';

import {
	KeyedCollectionEmpty,
	KeyedCollectionNonEmpty,
} from '@rimbu/collection-types/advanced/collection/keyed-base';
import {
	CollectionEmpty,
	CollectionNonEmpty,
} from '@rimbu/collection-types/advanced/collection-base';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import {
	MapCollectionEmpty,
	MapCollectionNonEmpty,
} from '@rimbu/collection-types/advanced/map-base';
import { type ArrayNonEmpty, OptLazy, type RelatedTo } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

const BiMapEmptyBase = MapCollectionEmpty.WithMixin(
	KeyedCollectionEmpty.WithMixin(CollectionEmpty.Constructor),
);

export class BiMapEmpty<K = any, V = any>
	extends BiMapEmptyBase<K, V, BiMap.Advanced.Family<K, V>>
	implements BiMap<K, V>
{
	constructor(readonly context: BiMapCollectionContext<K, V>) {
		super(context);
	}

	get keyValueMap(): MapCollection<K, V> {
		return this.context.keyValueContext.empty<readonly [K, V]>();
	}

	get valueKeyMap(): MapCollection<V, K> {
		return this.context.valueKeyContext.empty<readonly [V, K]>();
	}

	getKey<UV = V>(value: RelatedTo<V, UV>): K | undefined;
	getKey<UV, O>(value: RelatedTo<V, UV>, otherwise: OptLazy<O>): K | O;
	getKey<UV, O>(_value: RelatedTo<V, UV>, otherwise?: OptLazy<O>): K | O {
		return OptLazy(otherwise) as O;
	}

	hasValue(): false {
		return false;
	}

	removeValue(): this {
		return this;
	}

	removeValueAndReturn<UV = V>(
		value: RelatedTo<V, UV>,
	): Op.DynamicResult<BiMap<K, V>, undefined, K, BiMap<K, V>>;
	removeValueAndReturn<UV, O>(
		value: RelatedTo<V, UV>,
		otherwise: OptLazy<O>,
	): Op.DynamicResult<BiMap<K, V>, O, K, BiMap<K, V>>;
	removeValueAndReturn<UV, O>(
		_value: RelatedTo<V, UV>,
		otherwise?: OptLazy<O>,
	): Op.DynamicResult<BiMap<K, V>, O | undefined, K, BiMap<K, V>> {
		return {
			collection: this,
			hasResult: false,
			result: OptLazy(otherwise) as O,
			hasChanged: false,
		};
	}

	removeValues(): this {
		return this;
	}

	removeEntries(): this {
		return this;
	}

	removeEntry(): this {
		return this;
	}

	updateAtValue(): this {
		return this;
	}

	updateAtValueAndReturn(): Op.DynamicResult<
		BiMap.NonEmpty<K, V>,
		[previous: undefined, current: undefined],
		[previous: K, current: K],
		BiMap.NonEmpty<K, V>
	> {
		return {
			collection: this as any,
			hasResult: false,
			result: [undefined, undefined],
			hasChanged: false,
		};
	}

	modifyAtValue(atValue: V, options: ModifyOptions<K>): BiMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;
		const { ifNew } = options;
		if (undefined === ifNew) return this;

		const { set, create } = ifNew;
		const skip = Symbol();
		const newKey = undefined !== create ? create(skip) : set;

		if (skip === newKey) return this;
		return this.set(newKey, atValue);
	}

	invert(): BiMap<V, K> {
		return this.context.invertContext().empty<readonly [V, K]>();
	}

	addAndReturn(
		entry: readonly [K, V],
	): Op.DynamicResult<
		BiMap.NonEmpty<K, V>,
		undefined,
		readonly [K, V],
		BiMap.NonEmpty<K, V>
	> {
		return {
			collection: this.add(entry),
			hasResult: false,
			result: undefined,
			hasChanged: true,
		};
	}

	setAndReturn(
		key: K,
		value: V,
	): Op.DynamicResult<
		BiMap.NonEmpty<K, V>,
		undefined,
		readonly [K, V],
		BiMap.NonEmpty<K, V>
	> {
		return this.addAndReturn([key, value]);
	}

	toBuilder(): BiMap.Builder<K, V> {
		return this.context.builder();
	}

	toString(): string {
		return `BiMap()`;
	}
}

const BiMapNonEmptyMixin = MapCollectionNonEmpty.WithMixin(
	KeyedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor),
);

export abstract class BiMapNonEmptyBase<K, V>
	extends BiMapNonEmptyMixin<K, V, BiMap.Advanced.Family<K, V>>
	implements BiMap.NonEmpty<K, V>
{
	abstract readonly context: BiMapCollectionContext<K, V>;
	abstract readonly keyValueMap: MapCollection.NonEmpty<K, V>;
	abstract readonly valueKeyMap: MapCollection.NonEmpty<V, K>;

	abstract get size(): number;
	abstract stream(): Stream.NonEmpty<readonly [K, V]>;
	abstract forEach(f: (entry: readonly [K, V]) => void): void;
	abstract toArray(): ArrayNonEmpty<readonly [K, V]>;

	abstract get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
	abstract get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;

	abstract add(entry: readonly [K, V]): BiMap.NonEmpty<K, V>;
	abstract modifyAtKey(atKey: K, options: ModifyOptions<V>): BiMap<K, V>;
	abstract mapValues<V2 extends V>(
		mapFun: (value: V, key: K) => V2,
	): BiMap.NonEmpty<K, V2>;
	abstract toBuilder(): BiMap.Builder<K, V>;

	abstract getKey<UV = V>(value: RelatedTo<V, UV>): K | undefined;
	abstract getKey<UV, O>(value: RelatedTo<V, UV>, otherwise: OptLazy<O>): K | O;

	abstract hasValue<UV = V>(value: RelatedTo<V, UV>): boolean;

	abstract removeValue<UV = V>(value: RelatedTo<V, UV>): BiMap<K, V>;
	abstract removeValues<UV = V>(
		values: StreamSource<RelatedTo<V, UV>>,
	): BiMap<K, V>;
	abstract removeValueAndReturn<UV = V>(
		value: RelatedTo<V, UV>,
	): Op.DynamicResult<BiMap.NonEmpty<K, V>, undefined, K, BiMap<K, V>>;
	abstract removeValueAndReturn<UV, O>(
		value: RelatedTo<V, UV>,
		otherwise: OptLazy<O>,
	): Op.DynamicResult<BiMap.NonEmpty<K, V>, O, K, BiMap<K, V>>;

	abstract removeEntries(entries: StreamSource<readonly [K, V]>): BiMap<K, V>;

	abstract removeEntry(entry: readonly [K, V]): BiMap<K, V>;

	abstract updateAtValue<UV = V>(
		keyUpdate: (key: K) => K,
		value: RelatedTo<V, UV>,
	): BiMap.NonEmpty<K, V>;
	abstract updateAtValueAndReturn<UV = V>(
		keyUpdate: (key: K) => K,
		value: RelatedTo<V, UV>,
	): Op.DynamicResult<
		BiMap.NonEmpty<K, V>,
		[previous: undefined, current: undefined],
		[previous: K, current: K],
		BiMap.NonEmpty<K, V>
	>;

	abstract modifyAtValue(atValue: V, options: ModifyOptions<K>): BiMap<K, V>;

	abstract invert(): BiMap.NonEmpty<V, K>;

	abstract setAndReturn(
		key: K,
		value: V,
	): Op.DynamicResult<
		BiMap.NonEmpty<K, V>,
		undefined,
		readonly [K, V],
		BiMap.NonEmpty<K, V>
	>;
	abstract addAndReturn(
		entry: readonly [K, V],
	): Op.DynamicResult<
		BiMap.NonEmpty<K, V>,
		undefined,
		readonly [K, V],
		BiMap.NonEmpty<K, V>
	>;

	toString(): string {
		return this.stream().join({
			start: 'BiMap(',
			sep: ', ',
			end: ')',
			valueToString: (entry) => `${entry[0]} <-> ${entry[1]}`,
		});
	}
}

export class BiMapImpl<K, V> extends BiMapNonEmptyBase<K, V> {
	constructor(
		readonly context: BiMapCollectionContext<K, V>,
		readonly keyValueMap: MapCollection.NonEmpty<K, V>,
		readonly valueKeyMap: MapCollection.NonEmpty<V, K>,
	) {
		super(context);
	}

	copy(
		keyValueMap = this.keyValueMap,
		valueKeyMap = this.valueKeyMap,
	): BiMap.NonEmpty<K, V> {
		if (keyValueMap === this.keyValueMap && valueKeyMap === this.valueKeyMap)
			return this;
		return new BiMapImpl(this.context, keyValueMap, valueKeyMap);
	}

	copyE(
		keyValueMap: MapCollection<K, V> = this.keyValueMap,
		valueKeyMap: MapCollection<V, K> = this.valueKeyMap,
	): BiMap<K, V> {
		if (keyValueMap.nonEmpty() && valueKeyMap.nonEmpty()) {
			return new BiMapImpl(this.context, keyValueMap, valueKeyMap);
		}
		return this.context.empty();
	}

	get size(): number {
		return this.keyValueMap.size;
	}

	stream(): Stream.NonEmpty<readonly [K, V]> {
		return this.keyValueMap.stream();
	}

	get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
	get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
	get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O {
		if (undefined === otherwise) {
			return this.keyValueMap.get(key) as V | O;
		}
		return this.keyValueMap.get(key, otherwise) as V | O;
	}

	getKey<UV = V>(value: RelatedTo<V, UV>): K | undefined;
	getKey<UV, O>(value: RelatedTo<V, UV>, otherwise: OptLazy<O>): K | O;
	getKey<UV, O>(value: RelatedTo<V, UV>, otherwise?: OptLazy<O>): K | O {
		if (undefined === otherwise) {
			return this.valueKeyMap.get(value) as K | O;
		}
		return this.valueKeyMap.get(value, otherwise) as K | O;
	}

	has<UK = K>(key: RelatedTo<K, UK>): boolean {
		return this.keyValueMap.has(key);
	}

	hasValue<UV = V>(value: RelatedTo<V, UV>): boolean {
		return this.valueKeyMap.has(value);
	}

	add(entry: readonly [K, V]): BiMap.NonEmpty<K, V> {
		const [key, value] = entry;

		const token = Symbol();
		const currentValue = this.keyValueMap.get(key, token);
		const currentKey = this.valueKeyMap.get(value, token);

		if (token !== currentValue) {
			if (token !== currentKey) {
				if (Object.is(currentKey, key) && Object.is(currentValue, value)) {
					return this;
				}

				return this.copy(
					this.keyValueMap
						.removeKey(key)
						.removeKey(currentKey)
						.set(key, value) as MapCollection.NonEmpty<K, V>,
					this.valueKeyMap
						.removeKey(value)
						.removeKey(currentValue)
						.set(value, key) as MapCollection.NonEmpty<V, K>,
				);
			}

			return this.copy(
				this.keyValueMap
					.removeKey(key)
					.set(key, value) as MapCollection.NonEmpty<K, V>,
				this.valueKeyMap
					.removeKey(currentValue)
					.set(value, key) as MapCollection.NonEmpty<V, K>,
			);
		}

		if (token !== currentKey) {
			return this.copy(
				this.keyValueMap
					.removeKey(currentKey)
					.set(key, value) as MapCollection.NonEmpty<K, V>,
				this.valueKeyMap
					.removeKey(value)
					.set(value, key) as MapCollection.NonEmpty<V, K>,
			);
		}

		return this.copy(
			this.keyValueMap.set(key, value),
			this.valueKeyMap.set(value, key),
		);
	}

	addAndReturn(
		entry: readonly [K, V],
	): Op.DynamicResult<
		BiMap.NonEmpty<K, V>,
		undefined,
		readonly [K, V],
		BiMap.NonEmpty<K, V>
	> {
		const [key, value] = entry;

		const token = Symbol();
		const currentValue = this.keyValueMap.get(key, token);
		const currentKey = this.valueKeyMap.get(value, token);

		if (token !== currentValue) {
			if (token !== currentKey) {
				if (Object.is(currentKey, key) && Object.is(currentValue, value)) {
					return {
						collection: this,
						hasResult: true,
						result: entry,
						hasChanged: false,
					};
				}

				return {
					collection: this.copy(
						this.keyValueMap
							.removeKey(key)
							.removeKey(currentKey)
							.set(key, value) as MapCollection.NonEmpty<K, V>,
						this.valueKeyMap
							.removeKey(value)
							.removeKey(currentValue)
							.set(value, key) as MapCollection.NonEmpty<V, K>,
					),
					hasResult: true,
					result: [key, currentValue] as readonly [K, V],
					hasChanged: true,
				};
			}

			return {
				collection: this.copy(
					this.keyValueMap
						.removeKey(key)
						.set(key, value) as MapCollection.NonEmpty<K, V>,
					this.valueKeyMap
						.removeKey(currentValue)
						.set(value, key) as MapCollection.NonEmpty<V, K>,
				),
				hasResult: true,
				result: [key, currentValue] as readonly [K, V],
				hasChanged: true,
			};
		}

		if (token !== currentKey) {
			return {
				collection: this.copy(
					this.keyValueMap
						.removeKey(currentKey)
						.set(key, value) as MapCollection.NonEmpty<K, V>,
					this.valueKeyMap
						.removeKey(value)
						.set(value, key) as MapCollection.NonEmpty<V, K>,
				),
				hasResult: true,
				result: [currentKey, value] as readonly [K, V],
				hasChanged: true,
			};
		}

		return {
			collection: this.copy(
				this.keyValueMap.set(key, value),
				this.valueKeyMap.set(value, key),
			),
			hasResult: false,
			result: undefined,
			hasChanged: true,
		};
	}

	setAndReturn(
		key: K,
		value: V,
	): Op.DynamicResult<
		BiMap.NonEmpty<K, V>,
		undefined,
		readonly [K, V],
		BiMap.NonEmpty<K, V>
	> {
		return this.addAndReturn([key, value]);
	}

	removeKey<UK = K>(key: RelatedTo<K, UK>): BiMap<K, V> {
		const token = Symbol();
		const removedValue = this.keyValueMap.get(key, token);

		if (token === removedValue) return this;

		if (this.size === 1) return this.context.empty();

		return this.copy(
			this.keyValueMap.removeKey(key).assumeNonEmpty(),
			this.valueKeyMap.removeKey(removedValue as V).assumeNonEmpty(),
		);
	}

	removeKeyAndReturn<UK = K>(
		key: RelatedTo<K, UK>,
	): Op.DynamicResult<BiMap.NonEmpty<K, V>, undefined, V, BiMap<K, V>>;
	removeKeyAndReturn<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise: OptLazy<O>,
	): Op.DynamicResult<BiMap.NonEmpty<K, V>, O, V, BiMap<K, V>>;
	removeKeyAndReturn<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
	): Op.DynamicResult<BiMap.NonEmpty<K, V>, V | O | undefined, V, BiMap<K, V>> {
		const token = Symbol();
		const removedValue = this.keyValueMap.get(key, token);

		if (token === removedValue) {
			return {
				collection: this,
				hasResult: false,
				result: OptLazy(otherwise) as O,
				hasChanged: false,
			};
		}

		if (this.size === 1) {
			return {
				collection: this.context.empty(),
				hasResult: true,
				result: removedValue as V,
				hasChanged: true,
			};
		}

		return {
			collection: this.copy(
				this.keyValueMap.removeKey(key).assumeNonEmpty(),
				this.valueKeyMap.removeKey(removedValue as V).assumeNonEmpty(),
			),
			hasResult: true,
			result: removedValue as V,
			hasChanged: true,
		};
	}

	removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): BiMap<K, V> {
		if (Stream.isEmptyStreamSourceInstance(keys)) return this;

		const builder = this.toBuilder();

		builder.removeKeys(keys);

		return builder.build();
	}

	removeValue<UV = V>(value: RelatedTo<V, UV>): BiMap<K, V> {
		const token = Symbol();
		const removedKey = this.valueKeyMap.get(value, token);

		if (token === removedKey) return this;

		if (this.size === 1) return this.context.empty();

		return this.copy(
			this.keyValueMap.removeKey(removedKey as K).assumeNonEmpty(),
			this.valueKeyMap.removeKey(value).assumeNonEmpty(),
		);
	}

	removeValueAndReturn<UV = V>(
		value: RelatedTo<V, UV>,
	): Op.DynamicResult<BiMap.NonEmpty<K, V>, undefined, K, BiMap<K, V>>;
	removeValueAndReturn<UV, O>(
		value: RelatedTo<V, UV>,
		otherwise: OptLazy<O>,
	): Op.DynamicResult<BiMap.NonEmpty<K, V>, O, K, BiMap<K, V>>;
	removeValueAndReturn<UV, O>(
		value: RelatedTo<V, UV>,
		otherwise?: OptLazy<O>,
	): Op.DynamicResult<BiMap.NonEmpty<K, V>, K | O | undefined, K, BiMap<K, V>> {
		const token = Symbol();
		const removedKey = this.valueKeyMap.get(value, token);

		if (token === removedKey) {
			return {
				collection: this,
				hasResult: false,
				result: OptLazy(otherwise) as O,
				hasChanged: false,
			};
		}

		if (this.size === 1) {
			return {
				collection: this.context.empty(),
				hasResult: true,
				result: removedKey as K,
				hasChanged: true,
			};
		}

		return {
			collection: this.copy(
				this.keyValueMap.removeKey(removedKey as K).assumeNonEmpty(),
				this.valueKeyMap.removeKey(value).assumeNonEmpty(),
			),
			hasResult: true,
			result: removedKey as K,
			hasChanged: true,
		};
	}

	removeValues<UV = V>(values: StreamSource<RelatedTo<V, UV>>): BiMap<K, V> {
		if (Stream.isEmptyStreamSourceInstance(values)) return this;

		const builder = this.toBuilder();

		builder.removeValues(values);

		return builder.build();
	}

	removeEntry(entry: readonly [K, V]): BiMap<K, V> {
		return this.modifyAtKey(entry[0], {
			ifExists: {
				update: (currentValue, remove) =>
					currentValue === entry[1] ? remove : currentValue,
			},
		});
	}

	removeEntries(entries: StreamSource<readonly [K, V]>): BiMap<K, V> {
		if (Stream.isEmptyStreamSourceInstance(entries)) return this;

		const builder = this.toBuilder();

		builder.removeEntries(entries);

		return builder.build();
	}

	updateAtValue<UV = V>(
		keyUpdate: (key: K) => K,
		value: RelatedTo<V, UV>,
	): BiMap.NonEmpty<K, V> {
		const token = Symbol();
		const currentKey = this.valueKeyMap.get(value, token);

		if (token === currentKey) return this;

		const newKey = keyUpdate(currentKey as K);

		if (Object.is(newKey, currentKey)) return this;

		return this.set(newKey, value as V);
	}

	updateAtValueAndReturn<UV = V>(
		keyUpdate: (key: K) => K,
		value: RelatedTo<V, UV>,
	): Op.DynamicResult<
		BiMap.NonEmpty<K, V>,
		[previous: undefined, current: undefined],
		[previous: K, current: K],
		BiMap.NonEmpty<K, V>
	> {
		const token = Symbol();
		const currentKey = this.valueKeyMap.get(value, token);

		if (token === currentKey) {
			return {
				collection: this,
				hasResult: false,
				result: [undefined, undefined],
				hasChanged: false,
			};
		}

		const oldKey = currentKey as K;
		const newKey = keyUpdate(oldKey);

		if (Object.is(newKey, oldKey)) {
			return {
				collection: this,
				hasResult: true,
				result: [oldKey, newKey],
				hasChanged: false,
			};
		}

		return {
			collection: this.set(newKey, value as V),
			hasResult: true,
			result: [oldKey, newKey],
			hasChanged: true,
		};
	}

	modifyAtKey(atKey: K, options: ModifyOptions<V>): BiMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;

		let newValueKeyMap = this.valueKeyMap.asNormal();
		const { ifNew, ifExists } = options;

		const keyValueMapOptions: ModifyOptions<V> = {};
		if (undefined !== ifNew) {
			keyValueMapOptions.ifNew = {
				create: (skip) => {
					const { set, create } = ifNew;
					const token = Symbol();
					const newValue = undefined !== create ? create(token) : set;
					if (token === newValue) return skip;

					newValueKeyMap = newValueKeyMap.set(newValue, atKey);
					return newValue;
				},
			};
		}
		if (undefined !== ifExists) {
			keyValueMapOptions.ifExists = {
				update: (currentValue, remove) => {
					const { set, update } = ifExists;

					const token = Symbol();
					const newValue =
						undefined !== update ? update(currentValue, token) : set;

					if (token === newValue) {
						newValueKeyMap = newValueKeyMap.removeKey(currentValue);
						return remove;
					}

					newValueKeyMap = newValueKeyMap.set(newValue, atKey);
					return newValue;
				},
			};
		}

		const newKeyValueMap = this.keyValueMap.modifyAtKey(
			atKey,
			keyValueMapOptions,
		);
		if (newKeyValueMap === this.keyValueMap) return this;

		if (newKeyValueMap.nonEmpty() && newValueKeyMap.nonEmpty()) {
			return this.copy(newKeyValueMap, newValueKeyMap);
		}

		return this.context.empty();
	}

	modifyAtValue(atValue: V, options: ModifyOptions<K>): BiMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;

		let newKeyValueMap = this.keyValueMap.asNormal();

		const { ifNew, ifExists } = options;

		const valueKeyMapOptions: ModifyOptions<K> = {};
		if (undefined !== ifNew) {
			valueKeyMapOptions.ifNew = {
				create: (skip) => {
					const { set, create } = ifNew;
					const token = Symbol();
					const newKey = undefined !== create ? create(token) : set;

					if (token === newKey) return skip;

					newKeyValueMap = newKeyValueMap.set(newKey, atValue);
					return newKey;
				},
			};
		}
		if (undefined !== ifExists) {
			valueKeyMapOptions.ifExists = {
				update: (currentKey, remove) => {
					const { set, update } = ifExists;
					const token = Symbol();
					const newKey = undefined !== update ? update(currentKey, token) : set;

					if (token === newKey) {
						newKeyValueMap = newKeyValueMap.removeKey(currentKey);
						return remove;
					}

					newKeyValueMap = newKeyValueMap.set(newKey, atValue);
					return newKey;
				},
			};
		}

		const newValueKeyMap = this.valueKeyMap.modifyAtKey(
			atValue,
			valueKeyMapOptions,
		);
		if (newValueKeyMap === this.valueKeyMap) return this;

		if (newKeyValueMap.nonEmpty() && newValueKeyMap.nonEmpty()) {
			return this.copy(newKeyValueMap, newValueKeyMap);
		}

		return this.context.empty();
	}

	forEach(f: (entry: readonly [K, V]) => void): void {
		this.keyValueMap.forEach(f);
	}

	toArray(): ArrayNonEmpty<readonly [K, V]> {
		return this.keyValueMap.toArray();
	}

	mapValues<V2 extends V>(
		mapFun: (value: V, key: K) => V2,
	): BiMap.NonEmpty<K, V2> {
		return this.toBuilder().buildMapValues(mapFun).assumeNonEmpty();
	}

	invert(): BiMap.NonEmpty<V, K> {
		return this.context
			.invertContext()
			.createNonEmptyImpl(this.valueKeyMap, this.keyValueMap);
	}

	toBuilder(): BiMap.Builder<K, V> {
		return this.context.createBuilder(this);
	}
}
