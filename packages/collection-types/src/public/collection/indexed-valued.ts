// import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
// import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
// import type { OptLazy, RelatedTo } from '@rimbu/common';

// export interface IndexedValuedCollection<
// 	T,
// 	Tp extends
// 		IndexedValuedCollection.Advanced.Types<T> = IndexedValuedCollection.Advanced.Types<T>,
// > extends IndexedCollection<T, Tp>,
// 		ValuedCollection<T, Tp> {
// 	indexOf<UT = T>(value: RelatedTo<T, UT>): number | undefined;
// 	indexOf<UT, O>(value: RelatedTo<T, UT>, otherwise: OptLazy<O>): number | O;
// }

// export declare namespace IndexedValuedCollection {
// 	export interface NonEmpty<
// 		T,
// 		Tp extends
// 			IndexedValuedCollection.Advanced.TypesNonEmpty<T> = IndexedValuedCollection.Advanced.TypesNonEmpty<T>,
// 	> extends IndexedValuedCollection<T, Tp>,
// 			IndexedCollection.NonEmpty<T, Tp>,
// 			ValuedCollection.NonEmpty<T, Tp> {
// 		indexOf<UT = T>(value: RelatedTo<T, UT>): number | undefined;
// 		indexOf<UT, O>(value: RelatedTo<T, UT>, otherwise: OptLazy<O>): number | O;
// 	}

// 	export interface Builder<
// 		T,
// 		Tp extends
// 			IndexedValuedCollection.Advanced.Types<T> = IndexedValuedCollection.Advanced.Types<T>,
// 	> extends IndexedCollection.Builder<T, Tp>,
// 			ValuedCollection.Builder<T, Tp> {
// 		indexOf<UT = T>(value: RelatedTo<T, UT>): number | undefined;
// 		indexOf<UT, O>(value: RelatedTo<T, UT>, otherwise: OptLazy<O>): number | O;
// 	}

// 	export namespace Advanced {
// 		// Combining two family axes still requires restating the narrowed
// 		// slots to resolve TS2320 -- but now only once, in the family, rather
// 		// than once per kind.
// 		export interface Family<T>
// 			extends IndexedCollection.Advanced.Family<T>,
// 				ValuedCollection.Advanced.Family<T> {
// 			_NORMAL: IndexedValuedCollection<T>;
// 			_NON_EMPTY: IndexedValuedCollection.NonEmpty<T>;
// 			_BUILDER: IndexedValuedCollection.Builder<T>;

// 			_NEW_FAMILY: IndexedValuedCollection.Advanced.Family<this['_NEW_E']>;
// 		}

// 		export interface NormalKind<T>
// 			extends IndexedCollection.Advanced.NormalKind<T>,
// 				ValuedCollection.Advanced.NormalKind<T> {
// 			_stream: IndexedCollection.Advanced.NormalKind<T>['_stream'];

// 			_NEW_TYPES: this['_NEW_FAMILY'] &
// 				IndexedValuedCollection.Advanced.NormalKind<this['_NEW_E']>;
// 		}

// 		export interface NonEmptyKind<T>
// 			extends IndexedCollection.Advanced.NonEmptyKind<T>,
// 				ValuedCollection.Advanced.NonEmptyKind<T> {
// 			_stream: IndexedCollection.Advanced.NonEmptyKind<T>['_stream'];

// 			_NEW_TYPES: this['_NEW_FAMILY'] &
// 				IndexedValuedCollection.Advanced.NonEmptyKind<this['_NEW_E']>;
// 		}

// 		export type Types<T> = IndexedValuedCollection.Advanced.Family<T> &
// 			IndexedValuedCollection.Advanced.NormalKind<T>;

// 		export type TypesNonEmpty<T> = IndexedValuedCollection.Advanced.Family<T> &
// 			IndexedValuedCollection.Advanced.NonEmptyKind<T>;
// 	}
// }
