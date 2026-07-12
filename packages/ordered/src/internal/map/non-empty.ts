import type { RMap } from '@rimbu/collection-types';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { ArrayNonEmpty, RelatedTo, ToJSON } from '@rimbu/common/types';
import type { List } from '@rimbu/list';
import type { OrderedMap } from '@rimbu/ordered/map';

import type { OrderedMapBase } from '#map/base';
import type { ContextImpl } from '#map/context-factory';

import * as RimbuError from '@rimbu/base/rimbu-error';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/common';
import { NonEmptyBase } from '@rimbu/collection-types/common/empty-base';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream, type StreamSource } from '@rimbu/stream';

export class OrderedMapNonEmpty<K, V>
	extends NonEmptyBase<[K, V]>
	implements OrderedMapBase.NonEmpty<K, V>
{
	declare _NonEmptyType: OrderedMap.NonEmpty<K, V>;

	constructor(
		readonly context: ContextImpl<K>,
		readonly keyOrder: List.NonEmpty<K>,
		readonly sourceMap: RMap.NonEmpty<K, V>,
	) {
		super();
	}

	copy(
		keyOrder = this.keyOrder,
		sourceMap = this.sourceMap,
	): OrderedMapNonEmpty<K, V> {
		if (keyOrder === this.keyOrder && sourceMap === this.sourceMap) {
			return this;
		}

		return this.context.createNonEmpty<K, V>(keyOrder, sourceMap);
	}

	get size(): number {
		return this.keyOrder.length;
	}

	stream(): Stream.NonEmpty<[K, V]> {
		return this.streamKeys().map((k): [K, V] => [
			k,
			this.sourceMap.get(k, RimbuError.throwInvalidStateError),
		]);
	}

	streamKeys(): Stream.NonEmpty<K> {
		return this.keyOrder.stream();
	}

	streamValues(): Stream.NonEmpty<V> {
		return this.streamKeys().map(
			(k): V => this.sourceMap.get(k, RimbuError.throwInvalidStateError),
		);
	}

	hasKey<UK>(key: RelatedTo<K, UK>): boolean {
		return this.sourceMap.hasKey(key);
	}

	get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O {
		return this.sourceMap.get(key, otherwise!);
	}

	set(key: K, value: V): OrderedMap.NonEmpty<K, V> {
		let newKeyOrder = this.keyOrder;
		const newSourceMap = this.sourceMap.modifyAt(key, {
			ifNew: {
				create: (): V => {
					newKeyOrder = newKeyOrder.append(key);
					return value;
				},
			},
			ifExists: { set: value },
		});

		return this.copy(newKeyOrder, newSourceMap.assumeNonEmpty());
	}

	addEntry(entry: readonly [K, V]): OrderedMap.NonEmpty<K, V> {
		return this.set(entry[0], entry[1]);
	}

	addEntries(
		entries: StreamSource<readonly [K, V]>,
	): OrderedMap.NonEmpty<K, V> {
		if (Stream.isEmptyStreamSourceInstance(entries)) {
			return this;
		}

		const builder = this.toBuilder();
		builder.addEntries(entries);
		return builder.build().assumeNonEmpty();
	}

	removeKey<UK>(key: RelatedTo<K, UK>): OrderedMap<K, V> {
		if (!this.context.mapContext.isValidKey(key)) return this;

		const newSourceMap = this.sourceMap.removeKey(key);

		if (newSourceMap === this.sourceMap) return this;

		if (newSourceMap.nonEmpty()) {
			const index = this.keyOrder.stream().indexOf(key as K)!;
			const newKeyOrder = this.keyOrder.remove(index);

			if (newKeyOrder.nonEmpty()) {
				return this.copy(newKeyOrder, newSourceMap);
			}
		}

		return this.context.empty();
	}

	removeKeys<UK>(keys: StreamSource<RelatedTo<K, UK>>): OrderedMap<K, V> {
		if (Stream.isEmptyStreamSourceInstance(keys)) return this;

		const builder = this.toBuilder();
		builder.removeKeys(keys);
		return builder.build();
	}

	removeKeyAndGet<UK>(
		key: RelatedTo<K, UK>,
	): [OrderedMap<K, V>, V] | undefined {
		if (!this.context.mapContext.isValidKey(key)) {
			return undefined;
		}

		const removeSourceResult = this.sourceMap.removeKeyAndGet(key);

		if (undefined === removeSourceResult) {
			return undefined;
		}

		const [newSourceMap, removedValue] = removeSourceResult;

		if (newSourceMap.nonEmpty()) {
			const index = this.keyOrder.stream().indexOf(key as K)!;
			const newKeyOrder = this.keyOrder.remove(index);

			if (newKeyOrder.nonEmpty()) {
				return [this.copy(newKeyOrder, newSourceMap), removedValue!];
			}
		}

		return [this.context.empty(), removedValue!];
	}

	modifyAt(key: K, options: ModifyOptions<V>): OrderedMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;

		let newKeyOrder: List<K> = this.keyOrder;

		const result = this.sourceMap.modifyAt(key, options);
		if (result === this.sourceMap) return this;
		if (result.isEmpty) return this.context.empty<K, V>();

		if (result.size < this.sourceMap.size) {
			const index = this.keyOrder.stream().indexOf(key)!;
			newKeyOrder = newKeyOrder.remove(index);
		} else if (result.size > this.sourceMap.size) {
			newKeyOrder = newKeyOrder.append(key);
		}

		if (result.nonEmpty() && newKeyOrder.nonEmpty()) {
			return this.copy(newKeyOrder, result);
		}

		return this.context.empty();
	}

	forEach(
		f: (entry: [K, V], index: number, halt: () => void) => void,
		options: { reversed?: boolean; state?: TraverseState } = {},
	): void {
		const { reversed = false, state = TraverseState() } = options;

		if (state.halted) return;

		const keyIter = this.keyOrder.stream({ reversed })[Symbol.iterator]();

		const done = Symbol('Done');
		let key: K | typeof done;
		const sourceMap = this.sourceMap;
		const { halt } = state;

		while (!state.halted && done !== (key = keyIter.fastNext(done))) {
			f(
				[key, sourceMap.get(key, RimbuError.throwInvalidStateError)],
				state.nextIndex(),
				halt,
			);
		}
	}

	filter(
		pred: (entry: [K, V], index: number, halt: () => void) => boolean,
		options: { negate?: boolean } = {},
	): OrderedMap<K, V> {
		const { negate = false } = options;

		const builder = this.context.builder<K, V>();

		builder.addEntries(this.stream().filter(pred, { negate }));

		if (builder.size === this.size) return this;

		return builder.build();
	}

	transform<V2, K2 extends K>(
		transformFun: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource<[K2, V2]>,
	): any {
		return this.context.from(transformFun(this.stream()));
	}

	mapValues<V2>(mapFun: (value: V, key: K) => V2): any {
		return this.context.createNonEmpty<K, V2>(
			this.keyOrder,
			this.sourceMap.mapValues(mapFun),
		);
	}

	updateAt<UK>(key: RelatedTo<K, UK>, update: (value: V) => V): any {
		return this.copy(this.keyOrder, this.sourceMap.updateAt(key, update));
	}

	updateAtAndGet<U>(
		key: RelatedTo<K, U>,
		update: (value: V) => V,
	): [OrderedMap.NonEmpty<K, V>, V] | undefined {
		let oldValue: V | undefined;

		const newMap = this.updateAt(key, (value) => {
			oldValue = value;
			return update(value);
		});

		if (this === newMap) return undefined;

		return [newMap, oldValue as V];
	}

	toArray(): ArrayNonEmpty<[K, V]> {
		return this.stream().toArray();
	}

	toBuilder(): OrderedMap.Builder<K, V> {
		return this.context.createBuilder(this);
	}

	toString(): string {
		return this.stream().join({
			start: 'OrderedMap(',
			sep: ', ',
			end: ')',
			valueToString: (entry) => `${entry[0]} -> ${entry[1]}`,
		});
	}

	toJSON(): ToJSON<(readonly [K, V])[]> {
		return {
			dataType: this.context.typeTag,
			value: this.sourceMap.toJSON().value,
		};
	}
}
