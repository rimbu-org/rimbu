import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
// biome-ignore lint/correctness/noUnusedImports: TypesKey is used as a computed property key, which Biome does not detect
import type { Op, TypesKey } from '@rimbu/collection-types/types';

import {
	CollectionBuilderBase,
	CollectionEmptyBase,
	type CollectionEmptyBaseCapabilities,
	CollectionNonEmptyBase,
	type CollectionNonEmptyBaseCapabilities,
} from '@rimbu/collection-types/advanced/collection-base';
import { OptLazy, type RelatedTo } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

export type KeyedCollectionEmptyBaseCapabilities<K, V> =
	CollectionEmptyBaseCapabilities<readonly [K, V]> &
		KeyedCollection.Advanced.Family<K, V> &
		KeyedCollection.Capability.WithRemove<K, V> &
		KeyedCollection.Capability.WithMapValues<K, V>;

export abstract class KeyedCollectionEmptyBase<K, V>
	extends CollectionEmptyBase<readonly [K, V]>
	implements KeyedCollection<K, V, KeyedCollectionEmptyBaseCapabilities<K, V>>
{
	declare readonly [TypesKey]: KeyedCollectionEmptyBaseCapabilities<K, V>;
	abstract readonly context: KeyedCollection.Context<this[TypesKey]>;

	get<UK, O>(_: RelatedTo<K, UK>, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	has(): false {
		return false;
	}

	streamKeys(): Stream<K> {
		return Stream.empty<K>();
	}

	streamValues(): Stream<V> {
		return Stream.empty<V>();
	}

	removeKey<UK>(_: RelatedTo<K, UK>): this {
		return this;
	}

	removeKeys<UK>(_: StreamSource<RelatedTo<K, UK>>): this {
		return this;
	}

	removeKeyAndReturn<UK, O>(
		_: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
	): Op.WithResult<this, O, false> {
		return {
			collection: this,
			hasResult: false,
			result: OptLazy(otherwise) as O,
			hasChanged: false,
		};
	}

	mapValues(): any {
		return this as any;
	}
}

export type KeyedCollectionNonEmptyBaseCapabilities<K, V> =
	CollectionNonEmptyBaseCapabilities<readonly [K, V]> &
		KeyedCollection.Advanced.Family<K, V>;

export abstract class KeyedCollectionNonEmptyBase<K, V>
	extends CollectionNonEmptyBase<readonly [K, V]>
	implements
		KeyedCollection.NonEmpty<
			K,
			V,
			KeyedCollectionNonEmptyBaseCapabilities<K, V>
		>
{
	declare readonly [TypesKey]: KeyedCollectionNonEmptyBaseCapabilities<K, V>;
	abstract readonly context: KeyedCollection.Context<this[TypesKey]>;

	abstract get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O;

	has<UK>(key: RelatedTo<K, UK>): boolean {
		const token = Symbol();
		return token !== this.get(key, token as any);
	}

	streamKeys(): Stream.NonEmpty<K> {
		return this.stream().map(([k]) => k);
	}

	streamValues(): Stream.NonEmpty<V> {
		return this.stream().map(([, v]) => v);
	}
}

export type KeyedCollectionBuilderBaseCapabilities<K, V> =
	CollectionEmptyBaseCapabilities<readonly [K, V]> &
		KeyedCollection.Advanced.Family<K, V>;

export abstract class KeyedCollectionBuilderBase<K, V>
	extends CollectionBuilderBase<readonly [K, V]>
	implements
		KeyedCollection.Builder<K, V, KeyedCollectionBuilderBaseCapabilities<K, V>>
{
	declare readonly [TypesKey]: KeyedCollectionBuilderBaseCapabilities<K, V>;
	abstract readonly context: KeyedCollection.Context<this[TypesKey]>;

	abstract get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O;

	has<UK>(key: RelatedTo<K, UK>): boolean {
		const token = Symbol();
		return token !== this.get(key, token as any);
	}
}
