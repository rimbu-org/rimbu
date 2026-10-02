import type { BiMultiMap } from '@rimbu/bimultimap';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { RelatedTo } from '@rimbu/common/types';
import type { MultiMap } from '@rimbu/multimap';

import type { BiMultiMapContextImpl } from '#bimultimap/context-factory';

import * as RimbuError from '@rimbu/base/rimbu-error';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream, type StreamSource } from '@rimbu/stream';

export class BiMultiMapBuilder<K, V> implements BiMultiMap.Builder<K, V> {
	_lock = 0;

	constructor(
		readonly context: BiMultiMapContextImpl<K, V>,
		private source?: BiMultiMap.NonEmpty<K, V>,
	) {}

	private _keyValueMultiMap?: MultiMap.Builder<K, V> | undefined;

	private _valueKeyMultiMap?: MultiMap.Builder<V, K> | undefined;

	/**
	 * Initializes **both** builders together.
	 *
	 * The pre-migration builder had two getters with byte-identical bodies, each
	 * assigning a field it did not guard. That was correct only by accident: it
	 * relied on every write setting both fields, so a single initializer is the
	 * only safe shape — a getter that assigns the *other* field would silently
	 * discard reverse-map mutations.
	 */
	private initialize(): void {
		if (undefined !== this._keyValueMultiMap) return;

		if (undefined === this.source) {
			this._keyValueMultiMap =
				this.context.keyValueMultiMapContext.builder<readonly [K, V]>();
			this._valueKeyMultiMap =
				this.context.valueKeyMultiMapContext.builder<readonly [V, K]>();
		} else {
			this._keyValueMultiMap = this.source.keyValueMultiMap.toBuilder();
			this._valueKeyMultiMap = this.source.valueKeyMultiMap.toBuilder();
		}
	}

	private get forward(): MultiMap.Builder<K, V> {
		this.initialize();
		return this._keyValueMultiMap as MultiMap.Builder<K, V>;
	}

	private get reverse(): MultiMap.Builder<V, K> {
		this.initialize();
		return this._valueKeyMultiMap as MultiMap.Builder<V, K>;
	}

	checkLock(): void {
		if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
	}

	get size(): number {
		return this.source?.size ?? this.forward.size;
	}

	get isEmpty(): boolean {
		return this.size === 0;
	}

	has = <UK = K>(key: RelatedTo<K, UK>): boolean => {
		return this.source?.has(key) ?? this.forward.has(key);
	};

	hasValue = <UV = V>(value: RelatedTo<V, UV>): boolean => {
		return this.source?.hasValue(value) ?? this.reverse.has(value);
	};

	hasEntry = <UK = K, UV = V>(
		key: RelatedTo<K, UK>,
		value: RelatedTo<V, UV>,
	): boolean => {
		return this.forward.hasEntry(key, value as V);
	};

	getValues = <UK = K>(key: RelatedTo<K, UK>): SetCollection<V> => {
		if (undefined !== this.source) return this.source.getValues(key);
		return this.forward.getValues(key);
	};

	getKeys = <UV = V>(value: RelatedTo<V, UV>): SetCollection<K> => {
		if (undefined !== this.source) return this.source.getKeys(value);
		return this.reverse.getValues(value);
	};

	setEachValue = (key: K, values: StreamSource<V>): boolean => {
		this.checkLock();

		const removed = !this.removeKey(key).isEmpty;
		const added = this.addEach(
			Stream.from(values).map((value) => [key, value] as [K, V]),
		);

		return removed || added;
	};

	setEachKey = (value: V, keys: StreamSource<K>): boolean => {
		this.checkLock();

		const removed = !this.removeValue(value).isEmpty;
		const added = this.addEach(
			Stream.from(keys).map((key) => [key, value] as [K, V]),
		);

		return removed || added;
	};

	addTo = (key: K, value: V): boolean => {
		this.checkLock();

		if (!this.forward.addTo(key, value)) return false;
		this.source = undefined;
		return this.reverse.addTo(value, key);
	};

	addEach = (entries: StreamSource<readonly [K, V]>): boolean => {
		this.checkLock();

		return Stream.applyFilter(entries, { pred: this.addTo }).count() > 0;
	};

	/**
	 * Returns the values that were removed, using the **empty** set in place of
	 * `undefined` to mean "this key was not present". This is the value-set
	 * reading of the shared `_REMOVED_AT_KEY` slot.
	 */
	removeKey = <UK = K>(key: RelatedTo<K, UK>): SetCollection<V> => {
		this.checkLock();

		const values = this.getValues(key);

		if (values.isEmpty) return values;

		this.forward.removeKey(key);

		this.source = undefined;

		this.reverse.removeEntries(
			values.stream().map((value) => [value, key] as [V, K]),
		);

		return values;
	};

	removeKeys = <UK = K>(keys: StreamSource<RelatedTo<K, UK>>): boolean => {
		this.checkLock();

		let removedCount = 0;
		Stream.from(keys).forEach((key): void => {
			if (!this.removeKey(key).isEmpty) ++removedCount;
		});

		return removedCount > 0;
	};

	/**
	 * The value-direction counterpart of {@link removeKey}: returns the keys that
	 * referenced the value, empty meaning "not present".
	 */
	removeValue = <UV = V>(value: RelatedTo<V, UV>): SetCollection<K> => {
		this.checkLock();

		const keys = this.getKeys(value);

		if (keys.isEmpty) return keys;

		this.reverse.removeKey(value);

		this.source = undefined;

		this.forward.removeEntries(
			keys.stream().map((key) => [key, value] as [K, V]),
		);

		return keys;
	};

	removeValues = <UV = V>(values: StreamSource<RelatedTo<V, UV>>): boolean => {
		this.checkLock();

		let removedCount = 0;
		Stream.from(values).forEach((value): void => {
			if (!this.removeValue(value).isEmpty) ++removedCount;
		});

		return removedCount > 0;
	};

	removeEntry = <UK = K, UV = V>(
		key: RelatedTo<K, UK>,
		value: RelatedTo<V, UV>,
	): boolean => {
		this.checkLock();

		if (!this.forward.removeEntry(key, value)) return false;

		this.source = undefined;

		return this.reverse.removeEntry(value, key as K);
	};

	removeEntries = <UK = K, UV = V>(
		entries: StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>,
	): boolean => {
		this.checkLock();

		return Stream.applyFilter(entries, { pred: this.removeEntry }).count() > 0;
	};

	invert = (): BiMultiMap.Builder<V, K> => this.build().invert().toBuilder();

	forEach = (
		f: (entry: readonly [K, V]) => void,
		options?: { state?: TraverseState },
	): void => {
		this.lockedTraverse(options, f);
	};

	forEachIndexed = (
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
		options?: { state?: TraverseState },
	): void => {
		this.lockedTraverse(options, f);
	};

	/**
	 * `try`/`finally` is load-bearing: without it a throwing callback strands
	 * `_lock` at 1 and every later mutation throws
	 * `ModifiedBuilderWhileLoopingOverItError` on a builder that is otherwise
	 * perfectly healthy.
	 */
	private lockedTraverse(
		options: { state?: TraverseState } | undefined,
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
	): void {
		const { state = TraverseState() } = options ?? {};

		this._lock++;

		try {
			this.forward.forEachIndexed(f, { state });
		} finally {
			this._lock--;
		}
	}

	clear = (): void => {
		this.checkLock();

		this.source = undefined;
		this._keyValueMultiMap = undefined;
		this._valueKeyMultiMap = undefined;
	};

	build = (): BiMultiMap<K, V> => {
		if (undefined !== this.source) return this.source;

		if (this.isEmpty) return this.context.empty<readonly [K, V]>();

		const keyValueMultiMap = this.forward.build().assumeNonEmpty();
		const valueKeyMultiMap = this.reverse.build().assumeNonEmpty();

		return this.context.createNonEmpty(keyValueMultiMap, valueKeyMultiMap);
	};
}
