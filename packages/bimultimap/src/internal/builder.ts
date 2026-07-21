import type { BiMultiMap } from '@rimbu/bimultimap';
import type { RSet } from '@rimbu/collection-types';
import type { RelatedTo } from '@rimbu/common/types';
import type { MultiMap } from '@rimbu/multimap';

import type { BiMultiMapBase } from '#bimultimap/base';
import type { ContextImpl } from '#bimultimap/context-factory';

import * as RimbuError from '@rimbu/base/rimbu-error';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream, type StreamSource } from '@rimbu/stream';

export class BiMultiMapBuilder<K, V> implements BiMultiMapBase.Builder<K, V> {
	_lock = 0;

	constructor(
		readonly context: ContextImpl<K, V>,
		public source?: BiMultiMap.NonEmpty<K, V>,
	) {}

	_keyValueMultiMap?: MultiMap.Builder<K, V>;

	_valueKeyMultiMap?: MultiMap.Builder<V, K>;

	get keyValueMultiMap(): MultiMap.Builder<K, V> {
		if (undefined === this._keyValueMultiMap) {
			if (undefined === this.source) {
				this._keyValueMultiMap = this.context.keyValueMultiMapContext.builder();
				this._valueKeyMultiMap = this.context.valueKeyMultiMapContext.builder();
			} else {
				this._keyValueMultiMap = this.source.keyValueMultiMap.toBuilder();
				this._valueKeyMultiMap = this.source.valueKeyMultiMap.toBuilder();
			}
		}

		return this._keyValueMultiMap;
	}

	get valueKeyMultiMap(): MultiMap.Builder<V, K> {
		if (undefined === this._valueKeyMultiMap) {
			if (undefined === this.source) {
				this._keyValueMultiMap = this.context.keyValueMultiMapContext.builder();
				this._valueKeyMultiMap = this.context.valueKeyMultiMapContext.builder();
			} else {
				this._keyValueMultiMap = this.source.keyValueMultiMap.toBuilder();
				this._valueKeyMultiMap = this.source.valueKeyMultiMap.toBuilder();
			}
		}

		return this._valueKeyMultiMap;
	}

	checkLock(): void {
		if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
	}

	get size(): number {
		return this.source?.size ?? this.keyValueMultiMap.size;
	}

	get isEmpty(): boolean {
		return this.size === 0;
	}

	hasKey = <UK = K>(key: RelatedTo<K, UK>): boolean => {
		return this.source?.hasKey(key) ?? this.keyValueMultiMap.hasKey(key);
	};

	hasValue = <UV = V>(value: RelatedTo<V, UV>): boolean => {
		return this.source?.hasValue(value) ?? this.valueKeyMultiMap.hasKey(value);
	};

	hasEntry = <UK = K, UV = V>(
		key: RelatedTo<K, UK>,
		value: RelatedTo<V, UV>,
	): boolean => {
		return (
			this.source?.hasEntry(key, value) ??
			this.keyValueMultiMap.hasEntry(key, value as V)
		);
	};

	valuesAt = <UK = K>(key: RelatedTo<K, UK>): RSet<V> => {
		if (undefined !== this.source) {
			return this.source.valuesAt(key);
		}

		return this.keyValueMultiMap.valuesAt(key);
	};

	keysAt = <UV = V>(value: RelatedTo<V, UV>): RSet<K> => {
		if (undefined !== this.source) {
			return this.source.keysAt(value);
		}

		return this.valueKeyMultiMap.valuesAt(value);
	};

	setValues = (key: K, values: StreamSource<V>): boolean => {
		this.checkLock();

		const removed = this.removeKey(key);
		const added = this.addEntries(
			Stream.from(values).map((value) => [key, value]),
		);

		return removed || added;
	};

	setKeys = (value: V, keys: StreamSource<K>): boolean => {
		this.checkLock();

		const removed = this.removeValue(value);
		const added = this.addEntries(Stream.from(keys).map((key) => [key, value]));

		return removed || added;
	};

	add = (key: K, value: V): boolean => {
		this.checkLock();

		if (!this.keyValueMultiMap.add(key, value)) return false;
		this.source = undefined;
		return this.valueKeyMultiMap.add(value, key);
	};

	addEntries = (entries: StreamSource<readonly [K, V]>): boolean => {
		this.checkLock();

		return Stream.applyFilter(entries, { pred: this.add }).count() > 0;
	};

	removeKey = <UK = K>(key: RelatedTo<K, UK>): boolean => {
		this.checkLock();

		const values = this.valuesAt(key);

		if (values.isEmpty) return false;

		this.keyValueMultiMap.removeKey(key);

		this.source = undefined;

		return this.valueKeyMultiMap.removeEntries<V, UK>(
			values.stream().map((value) => [value, key]),
		);
	};

	removeKeys = <UK = K>(keys: StreamSource<RelatedTo<K, UK>>): boolean => {
		this.checkLock();

		return Stream.from(keys).filterPure({ pred: this.removeKey }).count() > 0;
	};

	removeValue = <UV = V>(value: RelatedTo<V, UV>): boolean => {
		this.checkLock();

		const keys = this.keysAt(value);

		if (keys.isEmpty) return false;

		this.valueKeyMultiMap.removeKey(value);

		this.source = undefined;

		return this.keyValueMultiMap.removeEntries(
			keys.stream().map((key) => [key, value]),
		);
	};

	removeValues = <UV = V>(values: StreamSource<RelatedTo<V, UV>>): boolean => {
		this.checkLock();

		return (
			Stream.from(values).filterPure({ pred: this.removeValue }).count() > 0
		);
	};

	removeEntry = <UK = K, UV = V>(
		key: RelatedTo<K, UK>,
		value: RelatedTo<V, UV>,
	): boolean => {
		this.checkLock();

		if (!this.keyValueMultiMap.removeEntry(key, value)) return false;

		this.source = undefined;

		return this.valueKeyMultiMap.removeEntry(value, key);
	};

	removeEntries = <UK = K, UV = V>(
		entries: StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>,
	): boolean => {
		this.checkLock();

		return Stream.applyFilter(entries, { pred: this.removeEntry }).count() > 0;
	};

	forEach = (
		f: (entry: [K, V], index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void => {
		const { state = TraverseState() } = options;

		this._lock++;

		this.keyValueMultiMap.forEach(f, { state });

		this._lock--;
	};

	build = (): BiMultiMap<K, V> => {
		if (undefined !== this.source) return this.source;

		if (this.isEmpty) {
			return this.context.empty();
		}

		const keyValueMultiMap = this.keyValueMultiMap.build().assumeNonEmpty();
		const valueKeyMultiMap = this.valueKeyMultiMap.build().assumeNonEmpty();

		return this.context.createNonEmpty(keyValueMultiMap, valueKeyMultiMap);
	};
}
