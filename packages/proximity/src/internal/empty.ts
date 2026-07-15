import type { ToJSON, WithValueResult } from '@rimbu/common/types';
import type { ProximityMap } from '@rimbu/proximity';

import type { ContextImpl } from '#proximity/context-factory';

import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { EmptyBase } from '@rimbu/collection-types/advanced/common/empty-base';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream, type StreamSource } from '@rimbu/stream';

/**
 * Concrete empty implementation of {@link ProximityMap}.<br/>
 * <br/>
 * It represents an empty `ProximityMap` instance for a given context and efficiently
 * creates non-empty maps when elements are added.
 *
 * @typeparam K - the key type
 * @typeparam V - the value type
 */
export class ProximityMapEmpty<K = any, V = any>
	extends EmptyBase
	implements ProximityMap<K, V>
{
	declare _NonEmptyType: ProximityMap.NonEmpty<K, V>;

	constructor(readonly context: ContextImpl<K>) {
		super();
	}

	streamKeys(): Stream<K> {
		return Stream.empty();
	}

	streamValues(): Stream<V> {
		return Stream.empty();
	}

	get<O>(_key: K, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	hasKey(): false {
		return false;
	}

	set(key: K, value: V): ProximityMap.NonEmpty<K, V> {
		return this.context.from([[key, value]]);
	}

	addEntry(entry: readonly [K, V]): ProximityMap.NonEmpty<K, V> {
		return this.context.from([entry]);
	}

	addEntries(
		entries: StreamSource<readonly [K, V]>,
	): ProximityMap.NonEmpty<K, V> {
		return this.context.from(entries) as ProximityMap.NonEmpty<K, V>;
	}

	removeKeyAndGet(): WithValueResult<ProximityMap<K, V>, V> {
		return [this, undefined, false];
	}

	removeKey(): ProximityMap<K, V> {
		return this;
	}

	removeKeys(): ProximityMap<K, V> {
		return this;
	}

	modifyAt(atKey: K, options: ModifyOptions<V>): ProximityMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;

		const { ifNew } = options;
		if (undefined === ifNew) return this;

		const { set, create } = ifNew;
		const token = Symbol();
		const newValue = create !== undefined ? create(token) : set;

		if (token === newValue) return this;
		return this.set(atKey, newValue);
	}

	mapValues<V2>(): ProximityMap<K, V2> {
		return this as any;
	}

	transform<V2, K2 extends K>(
		transformFun: (stream: Stream<readonly [K, V]>) => StreamSource<[K2, V2]>,
	): ProximityMap<K2, V2> {
		return this.context.from(transformFun(this.stream()));
	}

	updateAt(): ProximityMap<K, V> {
		return this;
	}

	updateAtAndGet(): WithValueResult<
		ProximityMap.NonEmpty<K, V>,
		V,
		ProximityMap<K, V>
	> {
		return [this, undefined, false];
	}

	toBuilder(): ProximityMap.Builder<K, V> {
		return this.context.builder();
	}

	override toString(): string {
		return `${this.context.typeTag}()`;
	}

	toJSON(): ToJSON<(readonly [K, V])[]> {
		return {
			dataType: this.context.typeTag,
			value: [],
		};
	}
}
