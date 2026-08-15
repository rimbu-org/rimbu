// import type { Collection } from '@rimbu/collection-types/collection';
// import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
// import type { TypesKey } from '@rimbu/collection-types/types';

// import {
// 	CollectionEmptyBase,
// 	CollectionNonEmptyBase,
// } from '@rimbu/collection-types/advanced/collection-base';
// import { OptLazy } from '@rimbu/common';
// import { Stream } from '@rimbu/stream';

// export abstract class KeyedCollectionEmptyBase<K, V>
// 	extends CollectionEmptyBase<readonly [K, V]>
// 	implements
// 		KeyedCollection<K, V>,
// 		KeyedCollection.Capability.WithMapValues<K, V>
// {
// 	declare readonly [TypesKey]: KeyedCollection.Advanced.Types<K, V>;

// 	abstract readonly context: Collection.Advanced.ContextBase<
// 		KeyedCollection.Advanced.Types<K, V>
// 	>;

// 	get<O>(_: K, otherwise?: OptLazy<O>): O {
// 		return OptLazy(otherwise) as O;
// 	}

// 	has(): false {
// 		return false;
// 	}

// 	streamKeys(): Stream<K> {
// 		return Stream.empty<K>();
// 	}

// 	streamValues(): Stream<V> {
// 		return Stream.empty<V>();
// 	}

// 	mapValues<V2>(): (this[TypesKey] & {
// 		_NEW_V: V2;
// 	})['_NEW_TYPES']['_SELF'] {
// 		return this as any;
// 	}
// }

// function first<T>(tuple: readonly [T, unknown]): T {
// 	return tuple[0];
// }

// function second<T>(tuple: readonly [unknown, T]): T {
// 	return tuple[1];
// }

// export abstract class KeyedCollectionNonEmptyBase<K, V>
// 	extends CollectionNonEmptyBase<readonly [K, V]>
// 	implements KeyedCollection.NonEmpty<K, V>
// {
// 	declare readonly [TypesKey]: KeyedCollection.Advanced.TypesNonEmpty<K, V>;

// 	abstract readonly context: Collection.Advanced.ContextBase<
// 		KeyedCollection.Advanced.TypesNonEmpty<K, V>
// 	>;

// 	abstract get<UK, O>(key: UK, otherwise?: OptLazy<O>): O | V;

// 	has(key: K): boolean {
// 		const none = Symbol();
// 		return none !== this.get(key, none);
// 	}

// 	streamKeys(): Stream.NonEmpty<K> {
// 		return this.stream().map(first);
// 	}

// 	streamValues(): Stream.NonEmpty<V> {
// 		return this.stream().map(second);
// 	}
// }
