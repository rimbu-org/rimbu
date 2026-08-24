import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { Op } from '@rimbu/collection-types/types';

import {
	CollectionBuilderBase,
	CollectionEmptyBase,
	CollectionNonEmptyBase,
} from '@rimbu/collection-types/advanced/collection-base';
import { OptLazy, type RelatedTo } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

export abstract class KeyedCollectionEmptyBase<
		K,
		V,
		FAM extends KeyedCollection.Advanced.Family<
			K,
			V
		> = KeyedCollection.Advanced.Family<K, V>,
		Tp extends Collection.Advanced.Types<
			FAM,
			readonly [K, V]
		> = Collection.Advanced.Types<FAM, readonly [K, V]>,
	>
	extends CollectionEmptyBase<readonly [K, V], FAM, Tp>
	implements
		KeyedCollection.Advanced.Api<K, V, Tp>,
		KeyedCollection.Capability.WithRemove.Api<K, V, Tp>,
		KeyedCollection.Capability.WithMapValues.Api<K, V, Tp>
{
	get<UK, O>(_: RelatedTo<K, UK>, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	has(): false {
		return false;
	}

	streamKeys(): Stream.NonEmpty<K> {
		return Stream.empty<K>() as any;
	}

	streamValues(): Stream.NonEmpty<V> {
		return Stream.empty<V>() as any;
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

export abstract class KeyedCollectionNonEmptyBase<
		K,
		V,
		FAM extends KeyedCollection.Advanced.Family<
			K,
			V
		> = KeyedCollection.Advanced.Family<K, V>,
		Tp extends Collection.Advanced.TypesNonEmpty<
			FAM,
			readonly [K, V]
		> = Collection.Advanced.TypesNonEmpty<FAM, readonly [K, V]>,
	>
	extends CollectionNonEmptyBase<readonly [K, V], FAM, Tp>
	implements KeyedCollection.Advanced.Api<K, V, Tp>
{
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

export abstract class KeyedCollectionBuilderBase<
		K,
		V,
		FAM extends KeyedCollection.Advanced.Family<
			K,
			V
		> = KeyedCollection.Advanced.Family<K, V>,
		Tp extends Collection.Advanced.Types<
			FAM,
			readonly [K, V]
		> = Collection.Advanced.Types<FAM, readonly [K, V]>,
	>
	extends CollectionBuilderBase<readonly [K, V], FAM, Tp>
	implements KeyedCollection.Advanced.BuilderApi<K, V, Tp>
{
	abstract get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O;

	has<UK>(key: RelatedTo<K, UK>): boolean {
		const token = Symbol();
		return token !== this.get(key, token as any);
	}
}
