// import type { Collection } from '@rimbu/collection-types/collection';
// import type { IndexedKeyedCollection } from '@rimbu/collection-types/collection/indexed-keyed';
// // biome-ignore lint/correctness/noUnusedImports: TypesKey is used as a computed property key, which Biome does not detect
// import type { TypesKey } from '@rimbu/collection-types/types';

// import { first, second } from '@rimbu/base';
// import {
// 	IndexedCollectionEmptyBase,
// 	IndexedCollectionNonEmptyBase,
// } from '@rimbu/collection-types/advanced/collection/indexed-base';
// import { OptLazy } from '@rimbu/common';
// import { Stream } from '@rimbu/stream';

// export abstract class IndexedKeyedCollectionEmptyBase<K, V>
// 	extends IndexedCollectionEmptyBase<readonly [K, V]>
// 	implements IndexedKeyedCollection<K, V>
// {
// 	declare readonly [TypesKey]: IndexedKeyedCollection.Advanced.Types<K, V>;

// 	abstract readonly context: Collection.Advanced.ContextBase<
// 		IndexedKeyedCollection.Advanced.Types<K, V>
// 	>;

// 	get<O>(_: K, otherwise?: OptLazy<O>): O {
// 		return OptLazy(otherwise) as O;
// 	}

// 	has(): false {
// 		return false;
// 	}

// 	indexOf<O>(_: K, otherwise?: OptLazy<O>): O {
// 		return OptLazy(otherwise) as O;
// 	}

// 	streamKeys(): Stream<K> {
// 		return Stream.empty<K>();
// 	}

// 	streamValues(): Stream<V> {
// 		return Stream.empty<V>();
// 	}
// }

// export abstract class IndexedKeyedCollectionNonEmptyBase<K, V>
// 	extends IndexedCollectionNonEmptyBase<readonly [K, V]>
// 	implements IndexedKeyedCollection.NonEmpty<K, V>
// {
// 	declare readonly [TypesKey]: IndexedKeyedCollection.Advanced.TypesNonEmpty<
// 		K,
// 		V
// 	>;

// 	abstract readonly context: Collection.Advanced.ContextBase<
// 		IndexedKeyedCollection.Advanced.TypesNonEmpty<K, V>
// 	>;
// 	abstract get<UK, O>(key: UK, otherwise?: OptLazy<O>): O | V;

// 	has(key: K): boolean {
// 		const none = Symbol();
// 		return none !== this.get(key, none);
// 	}

// 	abstract indexOf<UK, O>(key: UK, otherwise?: OptLazy<O>): number | O;

// 	streamKeys(): Stream.NonEmpty<K> {
// 		return this.stream().map(first);
// 	}

// 	streamValues(): Stream.NonEmpty<V> {
// 		return this.stream().map(second);
// 	}
// }
