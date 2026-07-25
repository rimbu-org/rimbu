// import type {
// 	ArrayNonEmpty,
// 	Comp,
// 	IndexRange,
// 	OptLazy,
// 	RelatedTo,
// 	TraverseState,
// } from '@rimbu/common';
// import type { FastIterable, Stream } from '@rimbu/stream';

// interface Collection<E> extends FastIterable<E> {
// 	readonly size: number;
// 	readonly isEmpty: boolean;

// 	nonEmpty(): this is Collection.NonEmpty<E>;
// 	assumeNonEmpty(): Collection.NonEmpty<E>;

// 	stream(): Stream<E>;
// 	forEach(f: (element: E) => void): void;
// 	forEachIndexed(
// 		f: (element: E, index: number, halt: () => void) => void,
// 		options?: { state?: TraverseState },
// 	): void;
// 	toArray(): E[];
// }

// namespace Collection {
// 	export interface NonEmpty<E> extends Collection<E> {
// 		readonly isEmpty: false;

// 		assumeNonEmpty(): this;
// 		asNormal(): Collection<E>;

// 		stream(): Stream.NonEmpty<E>;
// 		toArray(): ArrayNonEmpty<E>;
// 	}
// }

// interface IndexedCollection<E> extends Collection<E> {
// 	stream(options?: { reversed?: boolean }): Stream<E>;
// 	streamSlice(range: IndexRange, options?: { reversed?: boolean }): Stream<E>;

// 	at(index: number): E | undefined;
// 	at<O>(index: number, otherwise: OptLazy<O>): E | O;

// 	first(): E | undefined;
// 	first<O>(otherwise: OptLazy<O>): E | O;
// 	last(): E | undefined;
// 	last<O>(otherwise: OptLazy<O>): E | O;

// 	take(amount: number): IndexedCollection<E>;
// 	drop(amount: number): IndexedCollection<E>;
// 	slice(range: IndexRange): IndexedCollection<E>;
// }

// namespace IndexedCollection {
// 	export interface NonEmpty<E>
// 		extends Collection.NonEmpty<E>,
// 			IndexedCollection<E> {
// 		readonly isEmpty: false;
// 		assumeNonEmpty(): this;

// 		stream(options?: { reversed?: boolean }): Stream.NonEmpty<E>;

// 		first(): E;
// 		last(): E;

// 		take<N extends number>(
// 			amount: N,
// 		): N extends 0
// 			? IndexedCollection.NonEmpty<E>
// 			: IndexedCollection.NonEmpty<E>;
// 		drop(amount: 0): IndexedCollection.NonEmpty<E>;
// 		drop(amount: number): IndexedCollection<E>;

// 		toArray(): ArrayNonEmpty<E>;
// 	}
// }

// interface ValuedCollection<T> extends Collection<T> {
// 	has<UT = T>(value: RelatedTo<T, UT>): boolean;
// }

// interface KeyedCollection<K, V> extends Collection<readonly [K, V]> {
// 	get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
// 	get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
// 	has<UK = K>(key: RelatedTo<K, UK>): boolean;
// 	streamKeys(): Stream<K>;
// 	streamValues(): Stream<V>;
// }

// export namespace KeyedCollection {
// 	export interface NonEmpty<K, V>
// 		extends Collection.NonEmpty<readonly [K, V]>,
// 			KeyedCollection<K, V> {
// 		readonly isEmpty: false;
// 		assumeNonEmpty(): this;

// 		stream(): Stream.NonEmpty<readonly [K, V]>;
// 		streamKeys(): Stream.NonEmpty<K>;
// 		streamValues(): Stream.NonEmpty<V>;

// 		toArray(): ArrayNonEmpty<readonly [K, V]>;
// 	}
// }

// interface IndexedValuedCollection<T>
// 	extends IndexedCollection<T>,
// 		ValuedCollection<T> {
// 	stream(options?: { reversed?: boolean }): Stream<T>;

// 	indexOf<U = T>(value: RelatedTo<T, U>): number | undefined;
// 	indexOf<U, O>(value: RelatedTo<T, U>, otherwise: OptLazy<O>): number | O;
// }

// export namespace IndexedValuedCollection {
// 	export interface NonEmpty<T>
// 		extends Collection.NonEmpty<T>,
// 			IndexedValuedCollection<T> {
// 		readonly isEmpty: false;
// 		assumeNonEmpty(): this;

// 		stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;

// 		toArray(): ArrayNonEmpty<T>;
// 	}
// }

// interface IndexedKeyedCollection<K, V>
// 	extends IndexedCollection<readonly [K, V]>,
// 		KeyedCollection<K, V> {
// 	stream(options?: { reversed?: boolean }): Stream<readonly [K, V]>;

// 	indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
// 	indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
// 	streamKeys(options?: { reversed?: boolean }): Stream<K>;
// 	streamValues(options?: { reversed?: boolean }): Stream<V>;
// }

// export namespace IndexedKeyedCollection {
// 	export interface NonEmpty<K, V>
// 		extends IndexedCollection.NonEmpty<readonly [K, V]>,
// 			IndexedKeyedCollection<K, V> {
// 		readonly isEmpty: false;
// 		assumeNonEmpty(): this;

// 		stream(options?: { reversed?: boolean }): Stream.NonEmpty<readonly [K, V]>;

// 		first(): readonly [K, V];
// 		last(): readonly [K, V];

// 		take<N extends number>(
// 			amount: N,
// 		): N extends 0
// 			? IndexedCollection.NonEmpty<E>
// 			: IndexedCollection.NonEmpty<E>;
// 		drop(amount: 0): IndexedCollection.NonEmpty<E>;
// 		drop(amount: number): IndexedCollection<E>;

// 		toArray(): ArrayNonEmpty<readonly [K, V]>;
// 	}
// }

// interface FilterableCollection<E> extends Collection<E> {
// 	filter(
// 		pred: (element: E) => boolean,
// 		options?: { negate?: boolean },
// 	): FilterableCollection<E>;
// 	filterIndexed(
// 		pred: (element: E, index: number, halt: () => void) => boolean,
// 		options?: { negate?: boolean },
// 	): FilterableCollection<E>;
// }

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

// interface RemovableAtCollection<E> extends IndexedCollection<E> {
// 	removeAt(index: number): RemovableAtCollection<E>;
// }

// interface SwappableAtCollection<E> extends IndexedCollection<E> {
// 	swapAt(index1: number, index2: number): SwappableAtCollection<E>;
// }

// interface OrderEditableCollection<E> extends IndexedCollection<E> {
// 	prepend(
// 		element: E,
// 	): OrderEditableCollection<E> & IndexedCollection.NonEmpty<E>;
// 	append(
// 		element: E,
// 	): OrderEditableCollection<E> & IndexedCollection.NonEmpty<E>;
// 	placeAt(
// 		index: number,
// 		element: E,
// 	): OrderEditableCollection<E> & IndexedCollection.NonEmpty<E>;
// }

// interface ReorderableCollection<I, E> extends IndexedCollection<E> {
// 	moveTo(index: number, identity: I): ReorderableCollection<I, E>;
// }
