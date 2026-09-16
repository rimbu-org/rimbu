import type { IndexRange } from '@rimbu/common/index-range';
import type { RelatedTo, ToJSON, WithValueResult } from '@rimbu/common/types';
import type { SortedMap } from '@rimbu/sorted/map';

import type { ContextImpl } from '#map/context-factory';

import { IndexedKeyedSortedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/indexed-keyed-sorted-base';
import { KeyedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { CollectionEmpty } from '@rimbu/collection-types/advanced/collection-base';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { MapCollectionEmpty } from '@rimbu/collection-types/advanced/map-base';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream, type StreamSource } from '@rimbu/stream';

const EmptyBase = IndexedKeyedSortedCollectionEmpty.WithMixin(
	MapCollectionEmpty.WithMixin(
		KeyedCollectionEmpty.WithMixin(CollectionEmpty.Constructor),
	),
);

export class SortedMapEmpty<K = any, V = any>
	extends EmptyBase<K, V, SortedMap.Advanced.Family<K, V>>
	implements SortedMap<K, V>
{
	constructor(readonly context: ContextImpl<K>) {
		super(context);
	}

	streamRange(): Stream<readonly [K, V]> {
		return Stream.empty();
	}

	streamSliceIndex(): Stream<readonly [K, V]> {
		return Stream.empty();
	}

	get comp(): any {
		return this.context.comp;
	}

	atIndex<O>(_index: number, otherwise?: OptLazy<O>): readonly [K, V] | O {
		return OptLazy(otherwise) as O;
	}

	sliceIndex(_range: IndexRange): SortedMap<K, V> {
		return this;
	}

	nextEntry<O>(
		_key: K,
		options?: { inclusive?: boolean; otherwise?: OptLazy<O> },
	): O | readonly [K, V] {
		return OptLazy(options?.otherwise) as O;
	}

	previousEntry<O>(
		_key: K,
		options?: { inclusive?: boolean; otherwise?: OptLazy<O> },
	): O | readonly [K, V] {
		return OptLazy(options?.otherwise) as O;
	}

	modifyAt(atKey: K, options: ModifyOptions<V>): SortedMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;

		const { ifNew } = options;
		if (undefined === ifNew) return this;

		const { set, create } = ifNew;
		const skip = Symbol();
		const newValue = create !== undefined ? create(skip) : set;

		if (skip === newValue) return this;
		return this.context.leaf([[atKey, newValue]]);
	}

	transform<V2, K2 extends K>(
		transformFun: (stream: Stream<readonly [K, V]>) => StreamSource<[K2, V2]>,
	): SortedMap<K2, V2> {
		return this.context.from(transformFun(this.stream()));
	}

	updateAtAndGet(): WithValueResult<
		SortedMap.NonEmpty<K, V>,
		V,
		SortedMap<K, V>
	> {
		return [this, undefined, false];
	}

	updateAtKeyAndReturn<UK>(
		key: RelatedTo<K, UK>,
		update: (value: V) => V,
	): any {
		return {
			collection: this,
			hasResult: false,
			result: [undefined, undefined] as any,
			hasChanged: false,
		};
	}

	toString(): string {
		return `SortedMap()`;
	}
}
