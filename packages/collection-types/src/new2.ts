// import type {
// 	ArrayNonEmpty,
// 	Comp,
// 	IndexRange,
// 	OptLazy,
// 	RelatedTo,
// 	TraverseState,
// } from '@rimbu/common';
// import type { FastIterable, Stream } from '@rimbu/stream';

// interface Collection<E, Tp extends Collection.Types<E> = Collection.Types<E>>
// 	extends FastIterable<E> {
// 	readonly isEmpty: Tp['_isEmpty'];
// 	readonly size: number;

// 	nonEmpty(): this is Tp['_nonEmpty'];
// 	assumeNonEmpty(): Tp['_nonEmpty'];

// 	stream: Tp['_toStream'];

// 	forEach(f: (element: E) => void): void;
// 	forEachIndexed(
// 		f: (element: E, index: number, halt: () => void) => void,
// 		options?: { state?: TraverseState },
// 	): void;

// 	toArray(): Tp['_toArray'];
// }

// namespace Collection {
// 	export interface Types<E = unknown> {
// 		_E: E;
// 		_normal: Collection<this['_E']>;
// 		_nonEmpty: Collection.NonEmpty<this['_E']>;
// 		_self: this['_normal'];
// 		_isEmpty: boolean;
// 		_toStream: () => Stream<this['_E']>;
// 		_toArray: this['_E'][];
// 	}

// 	export interface TypesNonEmpty<E = unknown> extends Types<E> {
// 		_self: this['_nonEmpty'];
// 		_isEmpty: false;
// 		_toStream: () => Stream.NonEmpty<this['_E']>;
// 		_toArray: ArrayNonEmpty<this['_E']>;
// 	}

// 	export interface NonEmpty<
// 		E,
// 		Tp extends Collection.TypesNonEmpty<E> = Collection.TypesNonEmpty<E>,
// 	> extends Collection<E, Tp> {
// 		asNormal(): Tp['_normal'];
// 	}
// }

// interface IndexedCollection<
// 	E,
// 	Tp extends IndexedCollection.Types<E> = IndexedCollection.Types<E>,
// > extends Collection<E, Tp> {
// 	streamSlice(range: IndexRange, options?: { reversed?: boolean }): Stream<E>;

// 	at(index: number): E | undefined;
// 	at<O>(index: number, otherwise: OptLazy<O>): E | O;

// 	first: Tp['_firstLast'];
// 	last: Tp['_firstLast'];

// 	take(amount: number): IndexedCollection<E>;
// 	drop(amount: number): IndexedCollection<E>;
// 	slice(range: IndexRange): IndexedCollection<E>;
// }

// namespace IndexedCollection {
// 	export interface FirstLast<R> {
// 		(): R;
// 		<O>(otherwise: OptLazy<O>): R | O;
// 	}

// 	export interface Types<E = unknown> extends Collection.Types<E> {
// 		_normal: IndexedCollection<this['_E']>;
// 		_nonEmpty: IndexedCollection.NonEmpty<this['_E']>;
// 		_toStream: (options?: { reversed?: boolean }) => Stream<this['_E']>;
// 		_firstLast: FirstLast<this['_E'] | undefined>;
// 	}

// 	export interface TypesNonEmpty<E = unknown>
// 		extends Collection.TypesNonEmpty<E> {
// 		_normal: IndexedCollection<this['_E']>;
// 		_nonEmpty: IndexedCollection.NonEmpty<this['_E']>;
// 		_toStream: (options?: {
// 			reversed?: boolean;
// 		}) => Stream.NonEmpty<this['_E']>;
// 		_firstLast: FirstLast<this['_E']>;
// 	}

// 	export interface NonEmpty<
// 		E,
// 		Tp extends
// 			IndexedCollection.TypesNonEmpty<E> = IndexedCollection.TypesNonEmpty<E>,
// 	> extends Collection.NonEmpty<E, Tp>,
// 			IndexedCollection<E, Tp> {
// 		take<N extends number>(
// 			amount: N,
// 		): N extends 0
// 			? IndexedCollection.NonEmpty<E>
// 			: IndexedCollection.NonEmpty<E>;
// 		drop(amount: 0): IndexedCollection.NonEmpty<E>;
// 		drop(amount: number): IndexedCollection<E>;
// 	}
// }

// interface ValuedCollection<
// 	T,
// 	Tp extends Collection.Types<T> = Collection.Types<T>,
// > extends Collection<T, Tp> {
// 	has<UT = T>(value: RelatedTo<T, UT>): boolean;
// }

// interface KeyedCollection<
// 	K,
// 	V,
// 	Tp extends Collection.Types<readonly [K, V]> = Collection.Types<
// 		readonly [K, V]
// 	>,
// > extends Collection<readonly [K, V], Tp> {
// 	get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
// 	get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
// 	has<UK = K>(key: RelatedTo<K, UK>): boolean;
// }

// interface IndexedValuedCollection<
// 	T,
// 	Tp extends IndexedCollection.Types<T> = IndexedCollection.Types<T>,
// > extends IndexedCollection<T, Tp>,
// 		ValuedCollection<T, Tp> {
// 	indexOf<UT = T>(value: RelatedTo<T, UT>): number | undefined;
// 	indexOf<UT, O>(value: RelatedTo<T, UT>, otherwise: OptLazy<O>): number | O;
// }

// export namespace IndexedValuedCollection {
// 	export interface NonEmpty<
// 		T,
// 		Tp extends
// 			IndexedCollection.TypesNonEmpty<T> = IndexedCollection.TypesNonEmpty<T>,
// 	> extends Collection.NonEmpty<T, Tp>,
// 			IndexedValuedCollection<T, Tp> {}
// }

// interface IndexedKeyedCollection<
// 	K,
// 	V,
// 	Tp extends IndexedCollection.Types<readonly [K, V]> = IndexedCollection.Types<
// 		readonly [K, V]
// 	>,
// > extends IndexedCollection<readonly [K, V], Tp>,
// 		KeyedCollection<K, V, Tp> {
// 	indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
// 	indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
// 	streamKeys(options?: { reversed?: boolean }): Stream<K>;
// 	streamValues(options?: { reversed?: boolean }): Stream<V>;
// }

// export namespace IndexedKeyedCollection {
// 	export interface NonEmpty<
// 		K,
// 		V,
// 		Tp extends IndexedCollection.TypesNonEmpty<
// 			readonly [K, V]
// 		> = IndexedCollection.TypesNonEmpty<readonly [K, V]>,
// 	> extends IndexedCollection.NonEmpty<readonly [K, V], Tp>,
// 			IndexedKeyedCollection<K, V, Tp> {
// 		first(): readonly [K, V];
// 		first<O>(otherwise: OptLazy<O>): readonly [K, V];
// 		last(): readonly [K, V];
// 		last<O>(otherwise: OptLazy<O>): readonly [K, V];

// 		take<N extends number>(
// 			amount: N,
// 		): N extends 0
// 			? IndexedCollection.NonEmpty<readonly [K, V]>
// 			: IndexedCollection.NonEmpty<readonly [K, V]>;
// 		drop(amount: 0): IndexedCollection.NonEmpty<readonly [K, V]>;
// 		drop(amount: number): IndexedCollection<readonly [K, V]>;

// 		streamKeys(options?: { reversed?: boolean }): Stream.NonEmpty<K>;
// 		streamValues(options?: { reversed?: boolean }): Stream.NonEmpty<V>;
// 	}
// }

// interface WithFilter<E, Tp extends Collection.Types<E> = Collection.Types<E>>
// 	extends Collection<E, Tp> {
// 	filter(
// 		pred: (element: E) => boolean,
// 		options?: { negate?: boolean },
// 	): Tp['_normal'];
// 	filterIndexed(
// 		pred: (element: E, index: number, halt: () => void) => boolean,
// 		options?: { negate?: boolean },
// 	): Tp['_normal'];
// }

// interface WithMap<E, Tp extends Collection.Types<E> = Collection.Types<E>>
// 	extends Collection<E, Tp> {
// 	map<R2>(f: (element: E) => R2): Tp['_self'];
// 	mapIndexed<R2>(
// 		f: (element: E, index: number, halt: () => void) => R2,
// 		options?: { state?: TraverseState },
// 	): Tp['_self'];
// }

// interface Lst<T> extends Collection<T, Lst.Types<T>> {}

// namespace Lst {
// 	export interface Types<T = unknown> extends Collection.Types<T> {
// 		// _normal: Lst<T>;
// 		// _nonEmpty: Lst.NonEmpty<T>;
// 	}

// 	export interface TypesNonEmpty<T = unknown>
// 		extends Collection.TypesNonEmpty<T> {
// 		// _normal: Lst<T>;
// 		// _nonEmpty: Lst.NonEmpty<T>;
// 	}

// 	export interface NonEmpty<T>
// 		extends Lst<T>,
// 			Collection.NonEmpty<T, Lst.TypesNonEmpty<T>> {}
// }

// const l: Lst<number> = null as any;

// const l2 = l.assumeNonEmpty().map((v) => String(v));

// interface SortedCollection<S, E> extends Collection<E> {
// 	readonly comp: Comp<S>;

// 	lowerBound(search: S): number;
// 	upperBound(search: S): number;

// 	next(
// 		search: S,
// 		options?: { inclusive?: boolean; otherwise?: never },
// 	): E | undefined;
// 	next<O>(
// 		search: S,
// 		options: { inclusive?: boolean; otherwise: OptLazy<O> },
// 	): E | O;
// 	previous(
// 		search: S,
// 		options?: { inclusive?: boolean; otherwise?: never },
// 	): E | undefined;
// 	previous<O>(
// 		search: S,
// 		options: { inclusive?: boolean; otherwise: OptLazy<O> },
// 	): E | O;

// 	// streamRange(range: Range<S>, options?: { reversed?: boolean }): Stream<E>;
// 	// sliceRange(range: Range<S>): SortedCollection<S, E>;
// }

// interface WithRemoveAt<E> extends IndexedCollection<E> {
// 	removeAt(index: number): WithRemoveAt<E>;
// }

// interface WithSwapAt<E> extends IndexedCollection<E> {
// 	swapAt(index1: number, index2: number): WithSwapAt<E>;
// }

// interface WithEditableOrder<E> extends IndexedCollection<E> {
// 	prepend(element: E): WithEditableOrder<E> & IndexedCollection.NonEmpty<E>;
// 	append(element: E): WithEditableOrder<E> & IndexedCollection.NonEmpty<E>;
// 	placeAt(
// 		index: number,
// 		element: E,
// 	): WithEditableOrder<E> & IndexedCollection.NonEmpty<E>;
// }

// interface WithMoveTo<I, E> extends IndexedCollection<E> {
// 	moveTo(index: number, identity: I): WithMoveTo<I, E>;
// }
