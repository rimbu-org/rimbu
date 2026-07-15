import type { RMap, RSet } from '@rimbu/collection-types';
import type {
	ArrayNonEmpty,
	RelatedTo,
	ToJSON,
	WithValueResult,
} from '@rimbu/common/types';
import type { MultiMap } from '@rimbu/multimap';

import type { ContextImpl } from '#multimap/context-factory';
import type { MultiMapBase } from '#multimap/types';

import * as RimbuError from '@rimbu/base/rimbu-error';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import {
	EmptyBase,
	NonEmptyBase,
} from '@rimbu/collection-types/advanced/common/empty-base';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream, type StreamSource } from '@rimbu/stream';

export class MultiMapEmpty<K, V>
	extends EmptyBase
	implements MultiMapBase<K, V>
{
	declare _NonEmptyType: MultiMap.NonEmpty<K, V>;

	constructor(readonly context: ContextImpl<K, V>) {
		super();
	}

	get keyMap(): RMap<K, RSet.NonEmpty<V>> {
		return this.context.keyMapContext.empty();
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

	hasEntry(): false {
		return false;
	}

	add(key: K, value: V): MultiMap.NonEmpty<K, V> {
		const values = this.context.keyMapValuesContext.of(value);
		const keyMap = this.context.keyMapContext.of<K, RSet.NonEmpty<V>>([
			key,
			values,
		]) as RMap.NonEmpty<K, RSet.NonEmpty<V>>;

		return this.context.createNonEmpty(keyMap, 1);
	}

	addEntries(entries: StreamSource<readonly [K, V]>): any {
		return this.context.from(entries);
	}

	transform<K2 extends K, V2 extends V>(
		transformFun: (stream: Stream<[K, V]>) => StreamSource<[K2, V2]>,
	): any {
		return this.context.from(transformFun(Stream.empty()));
	}

	addValues(key: K, values: StreamSource<V>): any {
		return this.context.from(
			Stream.from(values).map((v) => [key, v] as [K, V]),
		);
	}

	flatMap(): any {
		return this;
	}

	mapValues(): any {
		return this;
	}

	flatMapValues(): any {
		return this;
	}

	count(): 0 {
		return 0;
	}

	union<U extends V>(other: MultiMap<K, U>): any {
		if (other.isEmpty) return this;
		return this.context.from(other);
	}

	intersect(): any {
		return this;
	}

	difference(): any {
		return this;
	}

	symDifference<U extends V>(other: MultiMap<K, U>): any {
		if (other.isEmpty) return this;
		return this.context.from(other);
	}

	getValues(): RSet<V> {
		return this.context.keyMapValuesContext.empty();
	}

	setValues(key: K, values: StreamSource<V>): any {
		const valueSet: RSet<V> = this.context.keyMapValuesContext.from(values);

		if (!valueSet.nonEmpty()) return this;

		const keyMap = this.context.keyMapContext.of<K, RSet.NonEmpty<V>>([
			key,
			valueSet,
		]);

		return this.context.createNonEmpty(keyMap, valueSet.size);
	}

	modifyAt(atKey: K, options: MultiMap.ModifyOptions<V>): MultiMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;

		const { ifNew } = options;
		if (undefined === ifNew) return this;

		const { set, create } = ifNew;
		const newValues = undefined !== create ? create() : set;

		return this.setValues(atKey, newValues);
	}

	removeKey(): MultiMap<K, V> {
		return this;
	}

	removeKeys(): MultiMap<K, V> {
		return this;
	}

	removeKeyAndGet(): WithValueResult<MultiMap<K, V>, RSet.NonEmpty<V>> {
		return [this, undefined, false];
	}

	removeEntry(): this {
		return this;
	}

	removeEntries(): this {
		return this;
	}

	toBuilder(): MultiMap.Builder<K, V> {
		return this.context.builder();
	}

	toString(): string {
		return `${this.context.typeTag}()`;
	}

	toJSON(): ToJSON<[K, V[]][]> {
		return {
			dataType: this.context.typeTag,
			value: [],
		};
	}
}

export class MultiMapNonEmpty<K, V>
	extends NonEmptyBase<[K, V]>
	implements MultiMapBase.NonEmpty<K, V>
{
	declare _NonEmptyType: MultiMap.NonEmpty<K, V>;

	constructor(
		readonly context: ContextImpl<K, V>,
		readonly keyMap: RMap.NonEmpty<K, RSet.NonEmpty<V>>,
		readonly size: number,
	) {
		super();
	}

	assumeNonEmpty(): this {
		return this;
	}

	asNormal(): this {
		return this;
	}

	copy(
		keyMap: RMap.NonEmpty<K, RSet.NonEmpty<V>>,
		size: number,
	): MultiMap.NonEmpty<K, V> {
		if (keyMap === this.keyMap) return this;
		return this.context.createNonEmpty<K, V>(keyMap, size);
	}

	copyE(keyMap: RMap<K, RSet.NonEmpty<V>>, size: number): MultiMap<K, V> {
		if (keyMap.nonEmpty()) {
			return this.copy(keyMap.assumeNonEmpty(), size);
		}

		return this.context.empty();
	}

	stream(): Stream.NonEmpty<[K, V]> {
		return this.keyMap
			.stream()
			.flatMap(
				([key, values]): Stream.NonEmpty<[K, V]> =>
					values.stream().map((v): [K, V] => [key, v]),
			);
	}

	streamKeys(): Stream.NonEmpty<K> {
		return this.keyMap.streamKeys();
	}

	streamValues(): Stream.NonEmpty<V> {
		return this.keyMap
			.streamValues()
			.flatMap((values): Stream.NonEmpty<V> => values.stream());
	}

	transform<K2 extends K, V2 extends V>(
		transformFun: (stream: Stream.NonEmpty<[K, V]>) => StreamSource<[K2, V2]>,
	): any {
		return this.context.from(transformFun(this.stream()));
	}

	addValues(key: K, values: StreamSource<V>): MultiMap.NonEmpty<K, V> {
		if (Stream.isEmptyStreamSourceInstance(values)) return this;

		const builder = this.toBuilder();
		builder.addValues(key, values);
		return builder.build().assumeNonEmpty();
	}

	flatMap<K2 extends K, V2 extends V>(
		flatMapFun: (
			entry: [K, V],
			index: number,
			halt: () => void,
		) => StreamSource<[K2, V2]>,
	): any {
		const builder = this.context.builder<K2, V2>();

		let entry: [K, V] | undefined;
		const iter = this[Symbol.iterator]();
		const state = TraverseState();

		while (!state.halted && (entry = iter.fastNext()) !== undefined) {
			builder.addEntries(flatMapFun(entry, state.nextIndex(), state.halt));
		}

		return builder.build();
	}

	mapValues<V2 extends V>(
		mapFun: (value: V, key: K) => V2,
	): MultiMap.NonEmpty<K, V2> {
		const newKeyMap = this.keyMap.mapValues((values, key) =>
			this.context.keyMapValuesContext.from(
				values.stream().map((v) => mapFun(v, key)),
			),
		);
		return this.context.createNonEmpty(newKeyMap, this.size);
	}

	flatMapValues<V2 extends V>(
		flatMapFun: (value: V, key: K) => StreamSource<V2>,
	): MultiMap<K, V2> {
		const builder = this.context.builder<K, V2>();

		let entry: readonly [K, RSet.NonEmpty<V>] | undefined;
		const iter = this.keyMap[Symbol.iterator]();
		const state = TraverseState();

		while (!state.halted && (entry = iter.fastNext()) !== undefined) {
			const [key, values] = entry;
			const newValues = this.context.keyMapValuesContext.from(
				values.stream().flatMap((v) => flatMapFun(v, key)),
			);
			if (newValues.nonEmpty()) {
				builder.setValues(key, newValues);
			}
		}

		return builder.build();
	}

	count<UK>(key: RelatedTo<K, UK>): number {
		return this.keyMap.get(key)?.size ?? 0;
	}

	union<U extends V>(other: MultiMap<K, U>): MultiMap.NonEmpty<K, V> {
		if (other.isEmpty) return this;
		if (other === (this as any)) return this;

		const builder = this.toBuilder();
		builder.addEntries(other);

		return builder.build().assumeNonEmpty();
	}

	intersect<U extends V>(other: MultiMap<K, U>): MultiMap<K, V> {
		if (other.isEmpty) return this.context.empty();
		if (other === (this as any)) return this;

		const builder = this.context.builder<K, V>();
		this.keyMap.forEach(([key, values]) => {
			const inter = values.intersect(other.getValues(key));
			if (inter.nonEmpty()) builder.setValues(key, inter);
		});
		return builder.build();
	}

	difference<U extends V>(other: MultiMap<K, U>): MultiMap<K, V> {
		if (other.isEmpty) return this;
		if (other === (this as any)) return this.context.empty();

		return this.removeEntries(other);
	}

	symDifference<U extends V>(other: MultiMap<K, U>): MultiMap<K, V> {
		if (other.isEmpty) return this;
		if (other === (this as any)) return this.context.empty();

		const builder = this.toBuilder();

		let thisEntry: readonly [K, RSet.NonEmpty<V>] | undefined;
		const thisIter = this.keyMap[Symbol.iterator]();
		const otherBuilder = other.keyMap.toBuilder();

		while ((thisEntry = thisIter.fastNext()) !== undefined) {
			const [key, values] = thisEntry;
			const otherValues = otherBuilder.get(key);

			if (undefined !== otherValues) {
				otherBuilder.removeKey(key);
				const sym = values.symDifference(otherValues);
				builder.setValues(key, sym);
			}
		}

		otherBuilder.forEach(([key, otherValues]) => {
			builder.setValues(key, otherValues);
		});

		return builder.build();
	}

	get keySize(): number {
		return this.keyMap.size;
	}

	hasKey<U>(key: RelatedTo<K, U>): boolean {
		return this.keyMap.hasKey<U>(key);
	}

	hasEntry<U>(key: RelatedTo<K, U>, value: V): boolean {
		const values = this.keyMap.get(key);

		return values?.has(value) ?? false;
	}

	getValues<U>(key: RelatedTo<K, U>): RSet<V> {
		return this.keyMap.get(key, this.context.keyMapValuesContext.empty());
	}

	add(key: K, value: V): MultiMap.NonEmpty<K, V> {
		let newSize = this.size;

		const newKeyMap = this.keyMap
			.modifyAt(key, {
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
			})
			.assumeNonEmpty();

		return this.copy(newKeyMap, newSize);
	}

	addEntries(entries: StreamSource<readonly [K, V]>): MultiMap.NonEmpty<K, V> {
		if (Stream.isEmptyStreamSourceInstance(entries)) return this;

		const builder = this.toBuilder();
		builder.addEntries(entries);
		return builder.build().assumeNonEmpty();
	}

	setValues(key: K, values: StreamSource<V>): MultiMap.NonEmpty<K, V> {
		return this.modifyAt(key, {
			ifNew: { set: values },
			ifExists: { set: values },
		}).assumeNonEmpty();
	}

	removeKey<UK>(key: RelatedTo<K, UK>): MultiMap<K, V> {
		if (!this.context.keyMapContext.isValidKey(key)) return this;
		return this.modifyAt(key, { ifExists: { set: [] } });
	}

	removeKeys<UK>(keys: StreamSource<RelatedTo<K, UK>>): MultiMap<K, V> {
		if (Stream.isEmptyStreamSourceInstance(keys)) return this;

		const builder = this.toBuilder();
		builder.removeKeys(keys);
		return builder.build();
	}

	removeKeyAndGet<UK>(
		key: RelatedTo<K, UK>,
	): WithValueResult<
		MultiMap<K, V>,
		RSet.NonEmpty<V>,
		MultiMap.NonEmpty<K, V>
	> {
		if (!this.context.keyMapContext.isValidKey(key))
			return [this, undefined, false];

		let removed: RSet.NonEmpty<V> | undefined;

		const result = this.modifyAt(key, {
			ifExists: {
				update: (values) => {
					removed = values;
					return [];
				},
			},
		});

		if (undefined === removed) return [this, undefined, false];

		return [result, removed, true];
	}

	removeEntry<UK, UV>(
		key: RelatedTo<K, UK>,
		value: RelatedTo<V, UV>,
	): MultiMap<K, V> {
		if (!this.context.keyMapContext.isValidKey(key)) return this;

		return this.modifyAt(key, {
			ifExists: { update: (values) => values.remove(value) },
		});
	}

	removeEntries<UK, UV>(
		entries: StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>,
	): MultiMap<K, V> {
		if (Stream.isEmptyStreamSourceInstance(entries)) return this;

		const builder = this.toBuilder();
		builder.removeEntries(entries);
		return builder.build();
	}

	filter(
		pred: (entry: [K, V], index: number, halt: () => void) => boolean,
		options: { negate?: boolean } = {},
	): MultiMap<K, V> {
		const builder = this.context.builder();

		builder.addEntries(this.stream().filter(pred, options));

		if (builder.size === this.size) return this;
		return builder.build();
	}

	forEach(
		f: (entry: [K, V], index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		this.stream().forEach(f, { state });
	}

	modifyAt(atKey: K, options: MultiMap.ModifyOptions<V>): MultiMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;

		let newSize = this.size;

		const { ifNew, ifExists } = options;

		const keyMapOptions: ModifyOptions<RSet.NonEmpty<V>> = {};
		if (undefined !== ifNew) {
			keyMapOptions.ifNew = {
				create: (skip) => {
					const { set, create } = ifNew;
					const newValueStream = undefined !== create ? create() : set;

					const newValues =
						this.context.keyMapValuesContext.from(newValueStream);

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

					const newValueStream =
						undefined !== update ? update(currentValues) : set;

					const newValues =
						this.context.keyMapValuesContext.from(newValueStream);

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

		const newKeyMap = this.keyMap.modifyAt(atKey, keyMapOptions);
		return this.copyE(newKeyMap, newSize);
	}

	toArray(): ArrayNonEmpty<[K, V]> {
		return this.stream().toArray();
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

	toJSON(): ToJSON<[K, V[]][]> {
		return {
			dataType: this.context.typeTag,
			value: this.keyMap
				.stream()
				.map((entry) => [entry[0], entry[1].toArray()] as [K, V[]])
				.toArray(),
		};
	}

	toBuilder(): MultiMap.Builder<K, V> {
		return this.context.createBuilder(this);
	}
}

export class MultiMapBuilder<K, V> implements MultiMapBase.Builder<K, V> {
	_lock = 0;
	_size = 0;

	constructor(
		readonly context: ContextImpl<K, V>,
		public source?: MultiMap.NonEmpty<K, V>,
	) {
		if (undefined !== source) this._size = source.size;
	}

	_keyMap?: RMap.Builder<K, RSet.Builder<V>>;

	get keyMap(): RMap.Builder<K, RSet.Builder<V>> {
		if (undefined === this._keyMap) {
			if (undefined === this.source) {
				this._keyMap = this.context.keyMapContext.builder();
			} else {
				this._keyMap = this.source.keyMap
					.mapValues((v) => v.toBuilder())
					.toBuilder();
			}
		}

		return this._keyMap;
	}

	checkLock(): void {
		if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
	}

	get size(): number {
		return this._size;
	}

	get isEmpty(): boolean {
		return this.size === 0;
	}

	getValues = <UK>(key: RelatedTo<K, UK>): any => {
		return (
			this.source?.getValues(key) ??
			this.keyMap.get(key)?.build() ??
			this.context.keyMapValuesContext.empty()
		);
	};

	hasKey = <UK>(key: RelatedTo<K, UK>): boolean => {
		return this.source?.hasKey(key) ?? this.keyMap.hasKey(key);
	};

	hasEntry = <UK>(key: RelatedTo<K, UK>, value: V): boolean => {
		return (
			this.source?.hasEntry(key, value) ??
			this.keyMap.get(key)?.has(value) ??
			false
		);
	};

	add = (key: K, value: V): boolean => {
		this.checkLock();

		let changed = true;

		this.keyMap.modifyAt(key, {
			ifNew: {
				create: () => {
					this._size++;
					const valueBuilder = this.context.keyMapValuesContext.builder();
					valueBuilder.add(value);
					return valueBuilder;
				},
			},
			ifExists: {
				update: (valueBuilder) => {
					this._size -= valueBuilder.size;

					changed = valueBuilder.add(value);

					this._size += valueBuilder.size;
					return valueBuilder;
				},
			},
		});

		if (changed) this.source = undefined;

		return changed;
	};

	addEntries = (source: StreamSource<readonly [K, V]>): boolean => {
		this.checkLock();

		return Stream.applyFilter(source, { pred: this.add }).count() > 0;
	};

	setValues = (key: K, source: StreamSource<V>): boolean => {
		this.checkLock();

		const values = this.context.keyMapValuesContext.from(source).toBuilder();
		const size = values.size;

		if (size <= 0) return this.removeKey(key);

		return this.keyMap.modifyAt(key, {
			ifNew: {
				create: () => {
					this._size += size;

					this.source = undefined;

					return values;
				},
			},
			ifExists: {
				update: (oldValues) => {
					this._size -= oldValues.size;
					this._size += size;

					this.source = undefined;

					return values;
				},
			},
		});
	};

	addValues = (key: K, values: StreamSource<V>): boolean => {
		this.checkLock();

		const valueSet = this.context.keyMapValuesContext.from(values);

		if (!valueSet.nonEmpty()) return false;

		const prevSize = this._size;

		this.keyMap.modifyAt(key, {
			ifNew: {
				create: () => {
					this._size += valueSet.size;
					this.source = undefined;
					return valueSet.toBuilder();
				},
			},
			ifExists: {
				update: (current) => {
					const wasSize = current.size;
					let changed = false;
					valueSet.stream().forEach((v) => {
						if (current.add(v)) changed = true;
					});
					if (changed) {
						this._size -= wasSize;
						this._size += current.size;
						this.source = undefined;
					}
					return current;
				},
			},
		});

		return this._size !== prevSize;
	};

	removeEntry = <UK, UV>(
		key: RelatedTo<K, UK>,
		value: RelatedTo<V, UV>,
	): boolean => {
		this.checkLock();

		if (!this.context.keyMapContext.isValidKey(key)) return false;

		let changed = false;

		this.keyMap.modifyAt(key, {
			ifExists: {
				update: (valueBuilder, remove) => {
					if (valueBuilder.remove(value)) {
						this._size--;
						changed = true;
					}

					if (valueBuilder.size <= 0) return remove;
					return valueBuilder;
				},
			},
		});

		if (changed) this.source = undefined;

		return changed;
	};

	removeEntries = <UK, UV>(
		entries: StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>,
	): boolean => {
		this.checkLock();

		return Stream.applyFilter(entries, { pred: this.removeEntry }).count() > 0;
	};

	removeKey = <UK>(key: RelatedTo<K, UK>): boolean => {
		this.checkLock();

		if (!this.context.keyMapContext.isValidKey(key)) return false;

		const changed = this.keyMap.modifyAt(key, {
			ifExists: {
				update: (valueBuilder, remove) => {
					this._size -= valueBuilder.size;
					return remove;
				},
			},
		});

		if (changed) this.source = undefined;

		return changed;
	};

	removeKeys = <UK>(keys: StreamSource<RelatedTo<K, UK>>): boolean => {
		this.checkLock();

		return Stream.from(keys).filterPure({ pred: this.removeKey }).count() > 0;
	};

	forEach = (
		f: (entry: [K, V], index: number, halt: () => void) => void,
		options: { reversed?: boolean; state?: TraverseState } = {},
	): void => {
		const { reversed = false, state = TraverseState() } = options;

		if (state.halted) return;

		this._lock++;

		this.keyMap.forEach(
			([key, values], _, outerHalt): void => {
				values.forEach(
					(value, index, halt): void => {
						f([key, value], index, halt);
					},
					{
						reversed,
						state,
					} as any,
				);
				if (state.halted) outerHalt();
			},
			{ reversed } as any,
		);

		this._lock--;
	};

	build = (): MultiMap<K, V> => {
		if (undefined !== this.source) return this.source;

		if (this.isEmpty) return this.context.empty();

		return this.context.createNonEmpty(
			this.keyMap
				.buildMapValues((values) => values.build().assumeNonEmpty())
				.assumeNonEmpty(),
			this.size,
		);
	};
}
