import type { BiMap } from '@rimbu/bimap/bimap';
import type { MapCollection } from '@rimbu/collection-types/map';

import type { BiMapCollectionContext } from '#bimap/context';
import type { BiMapNonEmpty } from '#bimap/immutable/non-empty';

import { CollectionBuilderBase } from '@rimbu/collection-types/advanced/collection-base';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { OptLazy, type RelatedTo } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

export class BiMapBuilder<K, V>
	extends CollectionBuilderBase<readonly [K, V], BiMap.Advanced.Family<K, V>>
	implements BiMap.Builder<K, V>
{
	constructor(
		readonly context: BiMapCollectionContext<K, V>,
		public source?: BiMapNonEmpty<K, V>,
	) {
		super();
	}

	#keyValueMap: MapCollection.Builder<K, V> | undefined = undefined;
	#valueKeyMap: MapCollection.Builder<V, K> | undefined = undefined;

	#prepare(): void {
		if (undefined !== this.#keyValueMap) return;

		if (undefined === this.source) {
			this.#keyValueMap =
				this.context.keyValueContext.builder<readonly [K, V]>();
			this.#valueKeyMap =
				this.context.valueKeyContext.builder<readonly [V, K]>();
		} else {
			this.#keyValueMap = this.source.keyValueMap.toBuilder();
			this.#valueKeyMap = this.source.valueKeyMap.toBuilder();
		}
	}

	get keyValueMap(): MapCollection.Builder<K, V> {
		this.#prepare();

		return this.#keyValueMap as MapCollection.Builder<K, V>;
	}

	get valueKeyMap(): MapCollection.Builder<V, K> {
		this.#prepare();

		return this.#valueKeyMap as MapCollection.Builder<V, K>;
	}

	get size(): number {
		return this.source?.size ?? this.keyValueMap.size;
	}

	get = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
		if (undefined !== this.source) {
			return undefined === otherwise
				? (this.source.get(key) as V | O)
				: (this.source.get(key, otherwise) as V | O);
		}

		return undefined === otherwise
			? (this.keyValueMap.get(key) as V | O)
			: (this.keyValueMap.get(key, otherwise) as V | O);
	};

	has = <UK>(key: RelatedTo<K, UK>): boolean => {
		const token = Symbol();
		return token !== this.get(key, token);
	};

	getKey = <UV, O>(value: RelatedTo<V, UV>, otherwise?: OptLazy<O>): K | O => {
		if (undefined !== this.source) {
			return undefined === otherwise
				? (this.source.getKey(value) as K | O)
				: (this.source.getKey(value, otherwise) as K | O);
		}

		return undefined === otherwise
			? (this.valueKeyMap.get(value) as K | O)
			: (this.valueKeyMap.get(value, otherwise) as K | O);
	};

	hasValue = <UV>(value: RelatedTo<V, UV>): boolean => {
		const token = Symbol();
		return token !== this.getKey(value, token);
	};

	set = (key: K, value: V): boolean => {
		return this.add([key, value]);
	};

	add = (entry: readonly [K, V]): boolean => {
		this.checkLock();

		const [key, value] = entry;

		const token = Symbol();

		const oldValue = this.keyValueMap.get(key, token);
		const oldKey = this.valueKeyMap.get(value, token);

		if (token !== oldKey && token !== oldValue) {
			if (Object.is(oldKey, key) && Object.is(oldValue, value)) return false;

			this.keyValueMap.removeKey(oldKey as K);
			this.keyValueMap.set(key, value);

			this.valueKeyMap.removeKey(oldValue as V);
			this.valueKeyMap.set(value, key);
		} else if (token !== oldValue) {
			if (!Object.is(oldValue, value)) {
				this.valueKeyMap.removeKey(oldValue as V);
				this.valueKeyMap.set(value, key);
			}

			this.keyValueMap.set(key, value);
		} else if (token !== oldKey) {
			if (!Object.is(oldKey, key)) {
				this.keyValueMap.removeKey(oldKey as K);
				this.keyValueMap.set(key, value);
			}

			this.valueKeyMap.set(value, key);
		} else {
			this.keyValueMap.set(key, value);
			this.valueKeyMap.set(value, key);
		}

		this.source = undefined;
		return true;
	};

	addAll = (source: StreamSource<readonly [K, V]>): boolean => {
		this.checkLock();

		if (Stream.isEmptyStreamSourceInstance(source)) return false;

		return Stream.from(source).filterPure({ pred: this.add }).count() > 0;
	};

	removeKey = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
		this.checkLock();

		if (!this.context.keyValueContext.isValidKey(key)) {
			return OptLazy(otherwise) as O;
		}

		const token = Symbol();
		const value = this.keyValueMap.removeKey(key, token);

		if (token === value) return OptLazy(otherwise) as O;

		this.valueKeyMap.removeKey(value as V);

		this.source = undefined;

		return value as V;
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

	removeValue = <UV, O>(
		value: RelatedTo<V, UV>,
		otherwise?: OptLazy<O>,
	): K | O => {
		this.checkLock();

		if (!this.context.valueKeyContext.isValidKey(value)) {
			return OptLazy(otherwise) as O;
		}

		const token = Symbol();
		const key = this.valueKeyMap.removeKey(value, token);

		if (token === key) return OptLazy(otherwise) as O;

		this.keyValueMap.removeKey(key as K);
		this.source = undefined;

		return key as K;
	};

	removeValues = <UV>(values: StreamSource<RelatedTo<V, UV>>): boolean => {
		this.checkLock();

		if (Stream.isEmptyStreamSourceInstance(values)) return false;

		const notFound = Symbol();
		return (
			Stream.from(values)
				.mapPure(this.removeValue, notFound)
				.countElement(notFound, { negate: true }) > 0
		);
	};

	removeEntry = (entry: readonly [K, V]): boolean => {
		this.checkLock();

		const [key, value] = entry;

		const token = Symbol();
		const current = this.keyValueMap.get(key, token);

		if (token === current) return false;
		if (!Object.is(current, value)) return false;

		const removed = this.removeKey(key, token);
		return token !== removed;
	};

	removeEntries = (entries: StreamSource<readonly [K, V]>): boolean => {
		this.checkLock();

		if (Stream.isEmptyStreamSourceInstance(entries)) return false;

		let changed = false;

		const iter = Stream.from(entries)[Symbol.iterator]();
		const token = Symbol();
		let entry: readonly [K, V] | typeof token;

		while (token !== (entry = iter.fastNext(token))) {
			if (this.removeEntry(entry)) changed = true;
		}

		return changed;
	};

	modifyAtKey = (atKey: K, options: ModifyOptions<V>): boolean => {
		this.checkLock();

		if (checkEmptyModifyOptions(options)) return false;

		const { ifNew, ifExists } = options;
		const token = Symbol();
		const currentValue = this.keyValueMap.get(atKey, token);

		if (token !== currentValue) {
			if (undefined === ifExists) return false;

			const { set, update } = ifExists;
			const removeToken = Symbol();
			const newValue =
				undefined !== update ? update(currentValue as V, removeToken) : set;

			if (removeToken === newValue) {
				this.removeKey(atKey);
				return true;
			}

			if (Object.is(newValue, currentValue)) return false;
			return this.set(atKey, newValue as V);
		}

		if (undefined === ifNew) return false;

		const { set, create } = ifNew;
		const skipToken = Symbol();
		const newValue = undefined !== create ? create(skipToken) : set;

		if (skipToken === newValue) return false;
		return this.set(atKey, newValue as V);
	};

	modifyAtValue = (atValue: V, options: ModifyOptions<K>): boolean => {
		this.checkLock();

		if (checkEmptyModifyOptions(options)) return false;

		const { ifNew, ifExists } = options;
		const token = Symbol();
		const currentKey = this.valueKeyMap.get(atValue, token);

		if (token !== currentKey) {
			if (undefined === ifExists) return false;

			const { set, update } = ifExists;
			const removeToken = Symbol();
			const newKey =
				undefined !== update ? update(currentKey as K, removeToken) : set;

			if (removeToken === newKey) {
				this.removeValue(atValue);
				return true;
			}

			if (Object.is(newKey, currentKey)) return false;
			return this.set(newKey as K, atValue);
		}

		if (undefined === ifNew) return false;

		const { set, create } = ifNew;
		const skipToken = Symbol();
		const newKey = undefined !== create ? create(skipToken) : set;

		if (skipToken === newKey) return false;
		return this.set(newKey as K, atValue);
	};

	updateAtKey = <UK, O>(
		key: RelatedTo<K, UK>,
		f: (value: V) => V,
		otherwise?: OptLazy<O>,
	): [V | O, V | O] => {
		this.checkLock();

		const token = Symbol();
		const currentValue = this.get(key, token);

		if (token === currentValue) {
			const otherwiseValue = OptLazy(otherwise) as O;
			return [otherwiseValue, otherwiseValue];
		}

		const newValue = f(currentValue as V);
		this.set(key as K, newValue);

		return [currentValue as V, newValue];
	};

	buildMapValues = <V2 extends V>(
		f: (value: V, key: K) => V2,
	): BiMap<K, V2> => {
		const builder = this.context.keyedContext.builder<K, V2>();

		this.forEach(([key, value]) => {
			builder.set(key, f(value, key));
		});

		return builder.build();
	};

	forEach = (f: (entry: readonly [K, V]) => void): void => {
		this.startIteration();

		try {
			if (this.isEmpty) return;
			if (undefined !== this.source) {
				this.source.forEach(f);
				return;
			}

			this.keyValueMap.forEach(f);
		} finally {
			this.endIteration();
		}
	};

	clear = (): void => {
		this.checkLock();
		this.source = undefined;
		this.#keyValueMap = undefined;
		this.#valueKeyMap = undefined;
	};

	build = (): BiMap<K, V> => {
		if (undefined !== this.source) return this.source;
		if (this.size === 0) return this.context.empty();

		return this.context.createNonEmptyImpl(
			this.keyValueMap.build().assumeNonEmpty(),
			this.valueKeyMap.build().assumeNonEmpty(),
		);
	};
}
