import type { BiMultiMap } from '@rimbu/bimultimap';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { RelatedTo, ToJSON } from '@rimbu/common/types';
import type { MultiMap } from '@rimbu/multimap';

import type { BiMultiMapBase } from '#bimultimap/base';
import type { ContextImpl } from '#bimultimap/context-factory';

import {
	EmptyBase,
	NonEmptyBase,
} from '@rimbu/collection-types/advanced/common/empty-base';
import { Stream, type StreamSource } from '@rimbu/stream';

export class BiMultiMapEmpty<K, V>
	extends EmptyBase
	implements BiMultiMapBase<K, V>
{
	declare _NonEmptyType: BiMultiMap.NonEmpty<K, V>;

	constructor(readonly context: ContextImpl<K, V>) {
		super();
	}

	get keyValueMultiMap(): MultiMap<K, V> {
		return this.context.keyValueMultiMapContext.empty();
	}

	get valueKeyMultiMap(): MultiMap<V, K> {
		return this.context.valueKeyMultiMapContext.empty();
	}

	get keySize(): 0 {
		return 0;
	}

	streamKeys(): Stream<K> {
		return Stream.empty();
	}

	streamValues(): Stream<V> {
		return Stream.empty();
	}

	hasKey(): false {
		return false;
	}

	hasValue(): false {
		return false;
	}

	hasEntry(): false {
		return false;
	}

	add(key: K, value: V): BiMultiMap.NonEmpty<K, V> {
		return this.context.createNonEmpty(
			this.context.keyValueMultiMapContext.of([key, value]),
			this.context.valueKeyMultiMapContext.of([value, key]),
		);
	}

	addEntries(
		entries: StreamSource<readonly [K, V]>,
	): BiMultiMap.NonEmpty<K, V> {
		return this.context.from(entries) as BiMultiMap.NonEmpty<K, V>;
	}

	setValues(key: K, values: StreamSource<V>): BiMultiMap.NonEmpty<K, V> {
		return this.context.from<K, V>(
			Stream.from(values).map((value) => [key, value]),
		) as BiMultiMap.NonEmpty<K, V>;
	}

	setKeys(value: V, keys: StreamSource<K>): BiMultiMap.NonEmpty<K, V> {
		return this.context.from<K, V>(
			Stream.from(keys).map((key) => [key, value]),
		) as BiMultiMap.NonEmpty<K, V>;
	}

	valuesAt(): SetCollection<V> {
		return this.context.keyValueMultiMapContext.keyMapValuesContext.empty();
	}

	keysAt(): SetCollection<K> {
		return this.context.valueKeyMultiMapContext.keyMapValuesContext.empty();
	}

	removeKey(): BiMultiMap<K, V> {
		return this;
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

	toString(): string {
		return `${this.context.typeTag}()`;
	}

	toJSON(): ToJSON<any[]> {
		return {
			dataType: this.context.typeTag,
			value: [],
		};
	}

	toBuilder(): BiMultiMap.Builder<K, V> {
		return this.context.builder();
	}
}

export class BiMultiMapNonEmpty<K, V>
	extends NonEmptyBase<[K, V]>
	implements BiMultiMapBase.NonEmpty<K, V>
{
	declare _NonEmptyType: BiMultiMap.NonEmpty<K, V>;

	constructor(
		readonly context: ContextImpl<K, V>,
		readonly keyValueMultiMap: MultiMap.NonEmpty<K, V>,
		readonly valueKeyMultiMap: MultiMap.NonEmpty<V, K>,
	) {
		super();
	}

	assumeNonEmpty(): any {
		return this;
	}

	asNormal(): any {
		return this;
	}

	get keySize(): number {
		return this.keyValueMultiMap.keySize;
	}

	get size(): number {
		return this.keyValueMultiMap.size;
	}

	stream(): Stream.NonEmpty<[K, V]> {
		return this.keyValueMultiMap.stream() as unknown as Stream.NonEmpty<[K, V]>;
	}

	streamKeys(): Stream.NonEmpty<K> {
		return this.keyValueMultiMap.streamKeys();
	}

	streamValues(): Stream.NonEmpty<V> {
		return this.valueKeyMultiMap.streamKeys();
	}

	hasKey<UK = K>(key: RelatedTo<K, UK>): boolean {
		return this.keyValueMultiMap.has(key);
	}

	hasValue<UV = V>(key: RelatedTo<V, UV>): boolean {
		return this.valueKeyMultiMap.has(key);
	}

	hasEntry<UK = K, UV = V>(
		key: RelatedTo<K, UK>,
		value: RelatedTo<V, UV>,
	): boolean {
		return this.hasKey(key) && this.hasValue(value);
	}

	add(key: K, value: V): BiMultiMap.NonEmpty<K, V> {
		const newKeyValueMultiMap = this.keyValueMultiMap.addTo(key, value);

		if (newKeyValueMultiMap === this.keyValueMultiMap) return this;

		const newValueKeyMultiMap = this.valueKeyMultiMap.addTo(value, key);

		return this.context.createNonEmpty<K, V>(
			newKeyValueMultiMap,
			newValueKeyMultiMap,
		);
	}

	addEntries(
		entries: StreamSource<readonly [K, V]>,
	): BiMultiMap.NonEmpty<K, V> {
		const builder = this.toBuilder();
		builder.addEntries(entries);
		return builder.build().assumeNonEmpty();
	}

	setValues(key: K, values: StreamSource<V>): BiMultiMap.NonEmpty<K, V> {
		const builder = this.toBuilder();
		builder.setValues(key, values);
		return builder.build().assumeNonEmpty();
	}

	setKeys(value: V, keys: StreamSource<K>): BiMultiMap.NonEmpty<K, V> {
		const builder = this.toBuilder();
		builder.setKeys(value, keys);
		return builder.build().assumeNonEmpty();
	}

	valuesAt<UK = K>(key: RelatedTo<K, UK>): SetCollection<V> {
		return this.keyValueMultiMap.getValues(key);
	}

	keysAt<UV = V>(value: RelatedTo<V, UV>): SetCollection<K> {
		return this.valueKeyMultiMap.getValues(value);
	}

	removeKey<UK = K>(key: RelatedTo<K, UK>): BiMultiMap<K, V> {
		const { collection, result, hasResult } =
			this.keyValueMultiMap.removeKeyAndReturn(key);

		if (!hasResult) return this;

		const oldValues = result as SetCollection<V>;

		if (!collection.nonEmpty()) return this.context.empty();

		const newValueKeyMultiMap = this.valueKeyMultiMap
			.removeEntries(oldValues.stream().map((value) => [value, key] as [V, K]))
			.assumeNonEmpty();

		return this.context.createNonEmpty<K, V>(
			collection as MultiMap.NonEmpty<K, V>,
			newValueKeyMultiMap,
		);
	}

	removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): BiMultiMap<K, V> {
		const builder = this.toBuilder();

		builder.removeKeys(keys);
		return builder.build();
	}

	removeValue<UV = V>(value: RelatedTo<V, UV>): BiMultiMap<K, V> {
		const { collection, result, hasResult } =
			this.valueKeyMultiMap.removeKeyAndReturn(value);

		if (!hasResult) return this;

		const oldKeys = result as SetCollection<K>;

		if (!collection.nonEmpty()) return this.context.empty();

		const newKeyValueMultiMap = this.keyValueMultiMap
			.removeEntries(oldKeys.stream().map((key) => [key, value] as [K, V]))
			.assumeNonEmpty();

		return this.context.createNonEmpty<K, V>(
			newKeyValueMultiMap,
			this.valueKeyMultiMap,
		);
	}

	removeValues<UV = V>(
		values: StreamSource<RelatedTo<V, UV>>,
	): BiMultiMap<K, V> {
		const builder = this.toBuilder();

		builder.removeValues(values);
		return builder.build();
	}

	removeEntry<UK = K>(key: RelatedTo<K, UK>, value: V): BiMultiMap<K, V> {
		const newKeyValueMultiMap = this.keyValueMultiMap.removeEntry(key, value);

		if (newKeyValueMultiMap === this.keyValueMultiMap) return this;
		if (!newKeyValueMultiMap.nonEmpty()) return this.context.empty();

		const newValueKeyMultiMap = this.valueKeyMultiMap
			.removeEntry(value, key as K)
			.assumeNonEmpty();

		return this.context.createNonEmpty<K, V>(
			newKeyValueMultiMap,
			newValueKeyMultiMap,
		);
	}

	removeEntries<UK = K>(
		entries: StreamSource<[RelatedTo<K, UK>, V]>,
	): BiMultiMap<K, V> {
		const builder = this.toBuilder();
		builder.removeEntries(entries);
		return builder.build();
	}

	forEach(
		f: (entry: [K, V], index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		this.keyValueMultiMap.forEachIndexed(
			f as (entry: readonly [K, V], index: number, halt: () => void) => void,
			options,
		);
	}

	filter(
		pred: (entry: [K, V], index: number, halt: () => void) => boolean,
		options: { negate?: boolean } = {},
	): BiMultiMap<K, V> {
		const builder = this.context.builder<K, V>();

		builder.addEntries(this.stream().filter(pred, options));

		if (builder.size === this.size) return this;

		return builder.build();
	}

	toArray(): [K, V][] {
		return this.keyValueMultiMap.toArray() as unknown as [K, V][];
	}

	toString(): string {
		return this.keyValueMultiMap.streamKeys().join({
			start: `${this.context.typeTag}(`,
			sep: ', ',
			end: ')',
			valueToString: (key: K) => {
				return `${key} <-> ${this.keyValueMultiMap
					.getValues(key)
					.stream()
					.join({ start: '(', sep: ', ', end: ')' })}`;
			},
		});
	}

	toJSON(): ToJSON<[K, V[]][], this['context']['typeTag']> {
		// Built here rather than delegated: a MultiMap no longer exposes `toJSON`.
		return {
			dataType: this.context.typeTag,
			value: this.keyValueMultiMap
				.streamKeys()
				.map(
					(key) =>
						[key, this.keyValueMultiMap.getValues(key).toArray()] as [K, V[]],
				)
				.toArray(),
		};
	}

	toBuilder(): BiMultiMap.Builder<K, V> {
		return this.context.createBuilder<K, V>(this);
	}
}
