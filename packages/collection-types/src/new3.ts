// import type { ArrayNonEmpty, OptLazy, TraverseState } from '@rimbu/common';
// import type { FastIterable, Stream } from '@rimbu/stream';

// interface Collection<E, Tp extends Collection.Types<E> = Collection.Types<E>>
// 	extends FastIterable<E> {
// 	readonly isEmpty: Tp['_isEmpty'];
// 	readonly size: number;

// 	nonEmpty: Tp['_nonEmpty'];
// 	assumeNonEmpty: Tp['_assumeNonEmpty'];

// 	stream: Tp['_stream'];

// 	forEach(f: (element: E) => void): void;
// 	forEachIndexed(
// 		f: (element: E, index: number, halt: () => void) => void,
// 		options?: { state?: TraverseState },
// 	): void;

// 	toArray: Tp['_toArray'];
// }

// namespace Collection {
// 	export interface Types<E = unknown> {
// 		_E: E;

// 		_NORMAL: Collection<this['_E']>;
// 		_NON_EMPTY: Collection.NonEmpty<this['_E']>;
// 		_SELF: this['_NORMAL'];

// 		_isEmpty: boolean;
// 		_nonEmpty: () => this is this['_NON_EMPTY'];
// 		_assumeNonEmpty: () => this['_NON_EMPTY'];
// 		_stream: () => Stream<this['_E']>;
// 		_toArray: this['_E'][];

// 		_NEW_E: unknown;
// 		_NEW_TYPES: Types<this['_NEW_E']>;
// 	}

// 	export interface TypesNonEmpty<E = unknown> extends Types<E> {
// 		_SELF: this['_NON_EMPTY'];
// 		_isEmpty: false;
// 		_stream: () => Stream.NonEmpty<this['_E']>;
// 		_toArray: ArrayNonEmpty<this['_E']>;
// 		_NEW_TYPES: TypesNonEmpty<this['_NEW_E']>;
// 	}

// 	export type NonEmpty<
// 		E,
// 		Tp extends TypesNonEmpty<E> = TypesNonEmpty<E>,
// 	> = Collection<E, Tp>;
// }

// interface IndexedCollection<
// 	E,
// 	Tp extends IndexedCollection.Types<E> = IndexedCollection.Types<E>,
// > extends Collection<E, Tp> {
// 	first: Tp['_firstLast'];
// 	last: Tp['_firstLast'];
// }

// namespace IndexedCollection {
// 	export interface FirstLast<R> {
// 		(): R;
// 		<O>(otherwise: OptLazy<O>): R | O;
// 	}

// 	export interface Types<E = unknown> extends Collection.Types<E> {
// 		_NORMAL: IndexedCollection<this['_E']>;
// 		_NON_EMPTY: IndexedCollection.NonEmpty<this['_E']>;

// 		_firstLast: IndexedCollection.FirstLast<this['_E'] | undefined>;
// 		_NEW_TYPES: Types<this['_NEW_E']>;
// 	}

// 	export interface TypesNonEmpty<E = unknown>
// 		extends Collection.TypesNonEmpty<E> {
// 		_NORMAL: IndexedCollection<this['_E']>;
// 		_NON_EMPTY: IndexedCollection.NonEmpty<this['_E']>;

// 		_firstLast: IndexedCollection.FirstLast<this['_E']>;
// 		_NEW_TYPES: TypesNonEmpty<this['_NEW_E']>;
// 	}

// 	export type NonEmpty<
// 		E,
// 		Tp extends
// 			IndexedCollection.TypesNonEmpty<E> = IndexedCollection.TypesNonEmpty<E>,
// 	> = IndexedCollection<E, Tp>;
// }

// interface WithMap<E, Tp extends Collection.Types<E> = Collection.Types<E>>
// 	extends Collection<E, Tp> {
// 	map<E2>(f: (element: E) => E2): (Tp & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
// }

// interface Lst<T>
// 	extends IndexedCollection<T, Lst.Types<T>>,
// 		WithMap<T, Lst.Types<T>> {}

// namespace Lst {
// 	export interface Types<T = unknown> extends IndexedCollection.Types<T> {
// 		_NORMAL: Lst<T>;
// 		_NON_EMPTY: Lst.NonEmpty<T>;
// 		_NEW_TYPES: Types<this['_NEW_E']>;
// 	}

// 	export interface TypesNonEmpty<T = unknown>
// 		extends IndexedCollection.TypesNonEmpty<T> {
// 		_NORMAL: Lst<T>;
// 		_NON_EMPTY: Lst.NonEmpty<T>;
// 		_NEW_TYPES: TypesNonEmpty<this['_NEW_E']>;
// 	}

// 	export interface NonEmpty<T>
// 		extends IndexedCollection.NonEmpty<T, Lst.TypesNonEmpty<T>>,
// 			WithMap<T, Lst.TypesNonEmpty<T>> {}
// }

// const f: Lst<number> = null as any;
// const f2 = f.assumeNonEmpty();

// const t = f.map((x) => String(x + 1));
// const t2 = f2.map((x) => String(x + 1));
// const r = f.stream();
// const r2 = f2.stream();
// f.first();
// f2.first();
