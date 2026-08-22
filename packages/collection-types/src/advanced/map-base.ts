import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { Op, TypesKey } from '@rimbu/collection-types/types';
import type { RelatedTo } from '@rimbu/common';
import type { StreamSource } from '@rimbu/stream';

import {
	KeyedCollectionBuilderBase,
	KeyedCollectionEmptyBase,
	type KeyedCollectionEmptyBaseCapabilities,
	KeyedCollectionNonEmptyBase,
	type KeyedCollectionNonEmptyBaseCapabilities,
} from '@rimbu/collection-types/advanced/collection/keyed-base';
import { Stream } from '@rimbu/stream';

export type MapCollectionEmptyBaseCapabilities<K, V> =
	KeyedCollectionEmptyBaseCapabilities<K, V> &
		MapCollection.Advanced.Family<K, V>;

export abstract class MapCollectionEmptyBase<K, V>
	extends KeyedCollectionEmptyBase<K, V>
	implements MapCollection<K, V, MapCollectionEmptyBaseCapabilities<K, V>>
{
	// biome-ignore lint/suspicious/noExplicitAny: see KeyedCollectionEmptyBase
	declare readonly [TypesKey]: any;

	abstract override readonly context: Collection.Context<
		Collection.Advanced.Types<
			MapCollectionEmptyBaseCapabilities<K, V>,
			readonly [K, V]
		>
	>;

	set(key: K, value: V): this[TypesKey]['_NON_EMPTY'] {
		return this.context.of([key, value] as readonly [
			K,
			V,
		]) as this[TypesKey]['_NON_EMPTY'];
	}

	setEntry(entry: readonly [K, V]): this[TypesKey]['_NON_EMPTY'] {
		return this.context.of(
			entry as readonly [K, V],
		) as this[TypesKey]['_NON_EMPTY'];
	}

	setAll(
		entries: StreamSource.NonEmpty<readonly [K, V]>,
	): this[TypesKey]['_NON_EMPTY'];
	setAll(entries: StreamSource<readonly [K, V]>): this[TypesKey]['_NORMAL'];
	setAll(entries: StreamSource<readonly [K, V]>): this[TypesKey]['_NORMAL'] {
		return this.context.from(
			entries as StreamSource<readonly [K, V]>,
		) as this[TypesKey]['_NORMAL'];
	}

	updateAt<UK>(_: RelatedTo<K, UK>, __: (value: V) => V): this {
		return this;
	}

	updateAtAndReturn<UK>(
		_: RelatedTo<K, UK>,
		__: (value: V) => V,
	): Op.WithResult<this, [previous: undefined, current: undefined], false> {
		return {
			collection: this,
			hasResult: false,
			result: [undefined, undefined],
			hasChanged: false,
		};
	}

	modifyAt(
		atKey: K,
		options: {
			ifNew?:
				| { set: V; create?: never }
				| {
						set?: never;
						create: <SKIP extends symbol>(skip: SKIP) => V | typeof skip;
				  };
			ifExists?:
				| { set: V; update?: never }
				| {
						set?: never;
						update: <REMOVE extends symbol>(
							current: V,
							remove: REMOVE,
						) => V | REMOVE;
				  };
		},
	): this[TypesKey]['_NORMAL'] {
		const { ifNew } = options;
		if (undefined === ifNew) return this as any;
		const { set, create } = ifNew as any;
		const token = Symbol();
		const newValue = undefined !== create ? create(token) : set;
		if (token === newValue) return this as any;
		return this.set(atKey, newValue) as any;
	}

	recompose<K2 extends K, V2>(
		f: (
			stream: Stream<readonly [K, V]>,
		) => StreamSource.NonEmpty<readonly [K2, V2]>,
	): Collection.Advanced.ReTyped<this[TypesKey], readonly [K2, V2]>['_SELF'];
	recompose<K2 extends K, V2>(
		f: (stream: Stream<readonly [K, V]>) => StreamSource<readonly [K2, V2]>,
	): Collection.Advanced.ReTyped<this[TypesKey], readonly [K2, V2]>['_NORMAL'];
	recompose<K2 extends K, V2>(
		f: (stream: Stream<readonly [K, V]>) => StreamSource<readonly [K2, V2]>,
	): Collection.Advanced.ReTyped<this[TypesKey], readonly [K2, V2]>['_NORMAL'] {
		return this.context.from(
			f(Stream.empty<readonly [K, V]>() as any) as any,
		) as any;
	}
}

export type MapCollectionNonEmptyBaseCapabilities<K, V> =
	KeyedCollectionNonEmptyBaseCapabilities<K, V> &
		MapCollection.Advanced.Family<K, V>;

export abstract class MapCollectionNonEmptyBase<K, V>
	extends KeyedCollectionNonEmptyBase<K, V>
	implements
		MapCollection.NonEmpty<K, V, MapCollectionNonEmptyBaseCapabilities<K, V>>
{
	// biome-ignore lint/suspicious/noExplicitAny: see KeyedCollectionEmptyBase
	declare readonly [TypesKey]: any;

	abstract override readonly context: Collection.Context<
		Collection.Advanced.TypesNonEmpty<
			MapCollectionNonEmptyBaseCapabilities<K, V>,
			readonly [K, V]
		>
	>;

	abstract set(key: K, value: V): this[TypesKey]['_NON_EMPTY'];
	abstract setEntry(entry: readonly [K, V]): this[TypesKey]['_NON_EMPTY'];
	abstract setAll(
		entries: StreamSource.NonEmpty<readonly [K, V]>,
	): this[TypesKey]['_NON_EMPTY'];
	abstract setAll(
		entries: StreamSource<readonly [K, V]>,
	): this[TypesKey]['_NORMAL'];
	abstract updateAt<UK>(
		key: RelatedTo<K, UK>,
		update: (value: V) => V,
	): this[TypesKey]['_SELF'];
	abstract updateAtAndReturn<UK>(
		key: RelatedTo<K, UK>,
		update: (value: V) => V,
	): Op.DynamicResult<
		this[TypesKey]['_SELF'],
		[previous: undefined, current: undefined],
		[previous: V, current: V],
		this[TypesKey]['_NON_EMPTY']
	>;
	abstract modifyAt(
		atKey: K,
		options: {
			ifNew?:
				| { set: V; create?: never }
				| {
						set?: never;
						create: <SKIP extends symbol>(skip: SKIP) => V | typeof skip;
				  };
			ifExists?:
				| { set: V; update?: never }
				| {
						set?: never;
						update: <REMOVE extends symbol>(
							current: V,
							remove: REMOVE,
						) => V | REMOVE;
				  };
		},
	): this[TypesKey]['_NORMAL'];
	abstract recompose<K2 extends K, V2>(
		f: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource.NonEmpty<readonly [K2, V2]>,
	): Collection.Advanced.ReTyped<this[TypesKey], readonly [K2, V2]>['_SELF'];
	abstract recompose<K2 extends K, V2>(
		f: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource<readonly [K2, V2]>,
	): Collection.Advanced.ReTyped<this[TypesKey], readonly [K2, V2]>['_NORMAL'];
}

export abstract class MapCollectionBuilderBase<K, V>
	extends KeyedCollectionBuilderBase<K, V>
	implements
		MapCollection.Builder<K, V, MapCollectionEmptyBaseCapabilities<K, V>>
{
	// biome-ignore lint/suspicious/noExplicitAny: see KeyedCollectionEmptyBase
	declare readonly [TypesKey]: any;

	abstract override readonly context: Collection.Context<
		Collection.Advanced.Types<
			MapCollectionEmptyBaseCapabilities<K, V>,
			readonly [K, V]
		>
	>;

	abstract set(key: K, value: V): boolean;
	abstract setEntry(entry: readonly [K, V]): boolean;
	abstract setAll(entries: StreamSource<readonly [K, V]>): boolean;
	abstract updateAt<UK>(
		key: RelatedTo<K, UK>,
		update: (value: V) => V,
	): boolean;
	abstract modifyAt(
		atKey: K,
		options: {
			ifNew?:
				| { set: V; create?: never }
				| {
						set?: never;
						create: <SKIP extends symbol>(skip: SKIP) => V | typeof skip;
				  };
			ifExists?:
				| { set: V; update?: never }
				| {
						set?: never;
						update: <REMOVE extends symbol>(
							current: V,
							remove: REMOVE,
						) => V | REMOVE;
				  };
		},
	): boolean;
}
