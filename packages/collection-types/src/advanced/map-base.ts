// import type { Collection } from '@rimbu/collection-types/collection';
// import type { MapCollection } from '@rimbu/collection-types/map';
// import type { Op, TypesKey } from '@rimbu/collection-types/types';
// import type { StreamSource } from '@rimbu/stream';

// import {
// 	KeyedCollectionBuilderBase,
// 	type KeyedCollectionBuilderBaseCapabilities,
// 	KeyedCollectionEmptyBase,
// 	type KeyedCollectionEmptyBaseCapabilities,
// 	KeyedCollectionNonEmptyBase,
// 	type KeyedCollectionNonEmptyBaseCapabilities,
// } from '@rimbu/collection-types/advanced/collection/keyed-base';
// import { Stream } from '@rimbu/stream';

// export type MapCollectionEmptyBaseCapabilities<K, V> =
// 	KeyedCollectionEmptyBaseCapabilities<K, V> &
// 		MapCollection.Advanced.Family<K, V> &
// 		Collection.Capability.WithAdd<readonly [K, V]> &
// 		MapCollection.Capability.WithSet<K, V> &
// 		MapCollection.Capability.WithUpdateAt<K, V>;
// // &
// // MapCollection.Capability.WithModifyAt<K, V>;

// export abstract class MapCollectionEmptyBase<K, V>
// 	extends KeyedCollectionEmptyBase<K, V>
// 	implements MapCollection<K, V, MapCollectionEmptyBaseCapabilities<K, V>>
// {
// 	declare readonly [TypesKey]: MapCollectionEmptyBaseCapabilities<K, V>;
// 	abstract readonly context: MapCollection.Context<this[TypesKey]>;

// 	set(key: K, value: V): this[TypesKey]['_NON_EMPTY'] {
// 		return this.context.of([key, value] as readonly [
// 			K,
// 			V,
// 		]) as this[TypesKey]['_NON_EMPTY'];
// 	}

// 	add(entry: readonly [K, V]): this[TypesKey]['_NON_EMPTY'] {
// 		return this.context.of(
// 			entry as readonly [K, V],
// 		) as this[TypesKey]['_NON_EMPTY'];
// 	}

// 	addAll(
// 		entries: StreamSource.NonEmpty<readonly [K, V]>,
// 	): this[TypesKey]['_NON_EMPTY'];
// 	addAll(entries: StreamSource<readonly [K, V]>): this[TypesKey]['_NORMAL'] {
// 		return this.context.from(
// 			entries as StreamSource<readonly [K, V]>,
// 		) as this[TypesKey]['_NORMAL'];
// 	}

// 	updateAt(): this[TypesKey]['_NORMAL'] {
// 		return this;
// 	}

// 	updateAtAndReturn(): Op.WithResult<
// 		this[TypesKey]['_NORMAL'],
// 		[previous: undefined, current: undefined],
// 		false
// 	> {
// 		return {
// 			collection: this,
// 			hasResult: false,
// 			result: [undefined, undefined],
// 			hasChanged: false,
// 		};
// 	}

// 	modifyAt(
// 		atKey: K,
// 		options: {
// 			ifNew?:
// 				| { set: V; create?: never }
// 				| {
// 						set?: never;
// 						create: <SKIP extends symbol>(skip: SKIP) => V | typeof skip;
// 				  };
// 			ifExists?:
// 				| { set: V; update?: never }
// 				| {
// 						set?: never;
// 						update: <REMOVE extends symbol>(
// 							current: V,
// 							remove: REMOVE,
// 						) => V | REMOVE;
// 				  };
// 		},
// 	): this[TypesKey]['_NORMAL'] {
// 		const { ifNew } = options;
// 		if (undefined === ifNew) return this;

// 		const { set, create } = ifNew;
// 		const token = Symbol();
// 		const newValue = undefined !== create ? create(token) : set;

// 		if (token === newValue) return this;

// 		return this.set(atKey, newValue);
// 	}

// 	recompose(f: any): any {
// 		return this.context.from(f(Stream.empty<readonly [K, V]>()));
// 	}
// }

// export type MapCollectionNonEmptyBaseCapabilities<K, V> =
// 	KeyedCollectionNonEmptyBaseCapabilities<K, V> &
// 		MapCollection.Advanced.Family<K, V>;

// export abstract class MapCollectionNonEmptyBase<K, V>
// 	extends KeyedCollectionNonEmptyBase<K, V>
// 	implements
// 		MapCollection.NonEmpty<K, V, MapCollectionNonEmptyBaseCapabilities<K, V>> {
// 	// declare readonly [TypesKey]: MapCollectionNonEmptyBaseCapabilities<K, V>;
// 	// abstract readonly context: MapCollection.Context<this[TypesKey]>;
// }

// export type MapCollectionBuilderBaseCapabilities<K, V> =
// 	KeyedCollectionBuilderBaseCapabilities<K, V> &
// 		MapCollection.Advanced.Family<K, V>;

// export abstract class MapCollectionBuilderBase<K, V>
// 	extends KeyedCollectionBuilderBase<K, V>
// 	implements
// 		MapCollection.Builder<K, V, MapCollectionBuilderBaseCapabilities<K, V>> {
// 	// declare readonly [TypesKey]: MapCollectionBuilderBaseCapabilities<K, V>;
// 	// abstract readonly context: MapCollection.Context<this[TypesKey]>;
// }
