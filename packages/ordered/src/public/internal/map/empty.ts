import type { RMap } from '@rimbu/collection-types';
import type { ToJSON } from '@rimbu/common/types';
import type { List } from '@rimbu/list';
import type { OrderedMap } from '@rimbu/ordered/map';

import type { OrderedMapBase } from '#map/base';
import type { ContextImpl } from '#map/context-factory';

import { Token } from '@rimbu/base/token';
import { EmptyBase } from '@rimbu/collection-types/common/empty-base';
import { OptLazy, OptLazyOr } from '@rimbu/common/opt-lazy';
import { Stream, type StreamSource } from '@rimbu/stream';
import { StreamFactory } from '@rimbu/stream/internal/factory';

export class OrderedMapEmpty<K = any, V = any>
	extends EmptyBase
	implements OrderedMapBase<K, V, OrderedMapBase.Types>
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
		if (StreamFactory().isEmptyStreamSourceInstance(entries)) {
			return this as any;
		}

		return this.context.from(entries) as any;
	}

	modifyAt(key: K, options: { ifNew?: OptLazyOr<V, Token> }): OrderedMap<K, V> {
		if (undefined === options.ifNew) return this;

		const value = OptLazyOr<V, Token>(options.ifNew, Token);

		if (Token === value) return this;

		return this.addEntry([key, value]);
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

	updateAt(): OrderedMap<K, V> {
		return this;
	}

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
