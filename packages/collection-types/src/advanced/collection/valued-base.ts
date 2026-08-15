// import type { Collection } from '@rimbu/collection-types/collection';
// import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
// // biome-ignore lint/correctness/noUnusedImports: TypesKey is used as a computed property key, which Biome does not detect
// import type { TypesKey } from '@rimbu/collection-types/types';

// import {
// 	CollectionEmptyBase,
// 	CollectionNonEmptyBase,
// } from '@rimbu/collection-types/advanced/collection-base';

// export abstract class ValuedCollectionEmptyBase<T>
// 	extends CollectionEmptyBase<T>
// 	implements ValuedCollection<T>
// {
// 	declare readonly [TypesKey]: ValuedCollection.Advanced.Types<T>;

// 	abstract readonly context: Collection.Advanced.ContextBase<
// 		ValuedCollection.Advanced.Types<T>
// 	>;

// 	has(): false {
// 		return false;
// 	}
// }

// export abstract class ValuedCollectionNonEmptyBase<T>
// 	extends CollectionNonEmptyBase<T>
// 	implements ValuedCollection.NonEmpty<T>
// {
// 	declare readonly [TypesKey]: ValuedCollection.Advanced.TypesNonEmpty<T>;

// 	abstract readonly context: Collection.Advanced.ContextBase<
// 		ValuedCollection.Advanced.TypesNonEmpty<T>
// 	>;

// 	abstract has(value: T): boolean;
// }
