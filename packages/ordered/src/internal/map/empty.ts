import type { RMap } from '@rimbu/collection-types';
import type { ToJSON } from '@rimbu/common/types';
import type { List } from '@rimbu/list';
import type { OrderedMap } from '@rimbu/ordered/map';

import type { OrderedMapBase } from '#map/base';
import type { ContextImpl } from '#map/context-factory';

import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { EmptyBase } from '@rimbu/collection-types/advanced/common/empty-base';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream, type StreamSource } from '@rimbu/stream';

export class OrderedMapEmpty<K = any, V = any>
	extends EmptyBase
	implements OrderedMapBase<K, V>
{
	declare _NonEmptyType: OrderedMap.NonEmpty<K, V>;

	constructor(readonly context: ContextImpl<K>) {
		super();
	}

	get keyOrder(): List<K> {
		return this.context.listContext.empty();
	}

	get sourceMap(): RMap<K, V> {
		return this.context.mapContext.empty();
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

	get<O>(key: K, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	set(key: K, value: V): OrderedMap.NonEmpty<K, V> {
		return this.addEntry([key, value]);
	}

	addEntry(entry: readonly [K, V]): OrderedMap.NonEmpty<K, V> {
		return this.context.createNonEmpty<K, V>(
			this.context.listContext.of(entry[0]),
			this.context.mapContext.of(entry),
		);
	}

	addEntries(
		entries: StreamSource<readonly [K, V]>,
	): OrderedMap.NonEmpty<K, V> {
		if (Stream.isEmptyStreamSourceInstance(entries)) {
			return this as any;
		}

		return this.context.from(entries) as any;
	}

	modifyAt(key: K, options: ModifyOptions<V>): OrderedMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;

		const { ifNew } = options;
		if (undefined === ifNew) return this;

		const { set, create } = ifNew;
		const token = Symbol();
		const newValue = create !== undefined ? create(token) : set;

		if (token === newValue) return this;
		return this.addEntry([key, newValue]);
	}

	removeKey(): OrderedMap<K, V> {
		return this as any;
	}

	removeKeys(): OrderedMap<K, V> {
		return this as any;
	}

	removeKeyAndGet(): undefined {
		return undefined;
	}

	mapValues<V2>(): OrderedMap<K, V2> {
		return this as any;
	}

	transform<V2, K2 extends K>(
		transformFun: (stream: Stream<readonly [K, V]>) => StreamSource<[K2, V2]>,
	): OrderedMap<K2, V2> {
		return this.context.from(transformFun(this.stream()));
	}

	updateAt(): OrderedMap<K, V> {
		return this;
	}

	updateAtAndGet(): undefined {}

	toBuilder(): OrderedMap.Builder<K, V> {
		return this.context.builder();
	}

	toString(): string {
		return 'OrderedMap()';
	}

	toJSON(): ToJSON<any[]> {
		return {
			dataType: this.context.typeTag,
			value: [],
		};
	}
}
