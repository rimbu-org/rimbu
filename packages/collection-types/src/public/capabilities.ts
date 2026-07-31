import type {
	ArrayNonEmpty,
	Comp,
	IndexRange,
	OptLazy,
	Range,
	RelatedTo,
	TraverseState,
} from '@rimbu/common';
import type { FastIterable, Stream } from '@rimbu/stream';

export interface Collection<E> extends FastIterable<E> {
	readonly context: {
		__types: Collection.Types<E>;
	};

	readonly isEmpty: this['context']['__types']['_isEmpty'];
	readonly size: number;

	nonEmpty: this['context']['__types']['_nonEmpty'];
	assumeNonEmpty: this['context']['__types']['_assumeNonEmpty'];

	stream: this['context']['__types']['_stream'];

	forEach(f: (element: E) => void): void;
	forEachIndexed(
		f: (element: E, index: number, halt: () => void) => void,
		options?: { state?: TraverseState | undefined } | undefined,
	): void;

	toArray: this['context']['__types']['_toArray'];
}

export declare namespace Collection {
	export interface NonEmpty<E> extends Collection<E> {
		readonly context: {
			__types: Collection.Types.NonEmpty<E>;
		};

		asNormal(): this['context']['__types']['_NORMAL'];
	}

	export interface Builder<E> {
		readonly context: {
			__types: Collection.Types<E>;
		};

		get isEmpty(): boolean;
		get size(): number;

		forEach(f: (element: E) => void): void;
		forEachIndexed(
			f: (element: E, index: number, halt: () => void) => void,
			options?: { state?: TraverseState | undefined } | undefined,
		): void;

		clear(): void;
		build(): this['context']['__types']['_NORMAL'];
	}

	export interface Types<E> {
		_NORMAL: Collection<E>;
		_NON_EMPTY: Collection.NonEmpty<E>;
		_SELF: this['_NORMAL'];

		_isEmpty: boolean;
		_nonEmpty: () => this is this['_NON_EMPTY'];
		_assumeNonEmpty: () => this['_NON_EMPTY'];
		_stream: () => Stream<E>;
		_toArray: () => E[];

		_UPPER_E: unknown;
		_NEW_E: this['_UPPER_E'];
		_NEW_TYPES: Collection.Types<this['_NEW_E']>;
	}

	export namespace Types {
		export interface NonEmpty<E> extends Types<E> {
			_SELF: this['_NON_EMPTY'];

			_isEmpty: false;
			_stream: () => Stream.NonEmpty<E>;
			_toArray: () => ArrayNonEmpty<E>;

			_NEW_TYPES: Collection.Types.NonEmpty<this['_NEW_E']>;
		}
	}

	export interface WithFilter<E> extends Collection<E> {
		filter<E2 extends E, NE2 = Exclude<E, E2>>(
			pred: (element: E) => element is E2,
			options: { negate: true },
		): (this['context']['__types'] & { _NEW_E: NE2 })['_NEW_TYPES']['_NORMAL'];
		filter<E2 extends E>(
			pred: (element: E) => element is E2,
			options?: { negate?: false | undefined } | undefined,
		): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
		filter(
			pred: (element: E) => boolean,
			options?: { negate?: boolean | undefined } | undefined,
		): this['context']['__types']['_NORMAL'];

		filterIndexed<E2 extends E, NE2 = Exclude<E, E2>>(
			pred: (element: E, index: number, halt: () => void) => element is E2,
			options: { negate: true },
		): (this['context']['__types'] & { _NEW_E: NE2 })['_NEW_TYPES']['_NORMAL'];
		filterIndexed<E2 extends E>(
			pred: (element: E, index: number, halt: () => void) => element is E2,
			options?: { negate?: false | undefined } | undefined,
		): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
		filterIndexed(
			pred: (element: E, index: number, halt: () => void) => boolean,
			options?: { negate?: boolean | undefined } | undefined,
		): this['context']['__types']['_NORMAL'];
	}
}

export interface IndexedCollection<E> extends Collection<E> {
	readonly context: {
		__types: IndexedCollection.Types<E>;
	};

	streamSlice(
		range: IndexRange,
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream<E>;

	at(index: number): E | undefined;
	at<O>(index: number, otherwise: OptLazy<O>): E | O;

	first: this['context']['__types']['_firstLast'];
	last: this['context']['__types']['_firstLast'];

	take: this['context']['__types']['_take'];
	drop(amount: number): this['context']['__types']['_NORMAL'];
	slice(range: IndexRange): this['context']['__types']['_NORMAL'];
}

export declare namespace IndexedCollection {
	export interface NonEmpty<E>
		extends IndexedCollection<E>,
			Collection.NonEmpty<E> {
		readonly context: {
			__types: IndexedCollection.Types.NonEmpty<E>;
		};
	}

	export interface Builder<E> extends Collection.Builder<E> {
		readonly context: {
			__types: IndexedCollection.Types<E>;
		};

		at(index: number): E | undefined;
		at<O>(index: number, otherwise: OptLazy<O>): E | O;

		first: this['context']['__types']['_firstLast'];
		last: this['context']['__types']['_firstLast'];
	}

	export interface FirstLast<R, IsNonEmpty extends boolean = boolean> {
		(): IsNonEmpty extends true ? R : R | undefined;
		<O>(otherwise: OptLazy<O>): IsNonEmpty extends true ? R : R | O;
	}

	export interface TakeNonEmpty<RN, RNE> {
		<const N extends number>(amount: N): 0 extends N ? RN : RNE;
		(amount: number): RN;
	}

	export interface Types<E> extends Collection.Types<E> {
		_NORMAL: IndexedCollection<E>;
		_NON_EMPTY: IndexedCollection.NonEmpty<E>;

		_firstLast: IndexedCollection.FirstLast<E>;
		_take: (amount: number) => this['_NORMAL'];
		_stream: (
			options?: { reversed?: boolean | undefined } | undefined,
		) => Stream<E>;

		_NEW_TYPES: IndexedCollection.Types<this['_NEW_E']>;
	}

	export namespace Types {
		export interface NonEmpty<E> extends Collection.Types.NonEmpty<E> {
			_NORMAL: IndexedCollection<E>;
			_NON_EMPTY: IndexedCollection.NonEmpty<E>;

			_firstLast: IndexedCollection.FirstLast<E, true>;
			_take: TakeNonEmpty<this['_NORMAL'], this['_NON_EMPTY']>;

			_stream: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream.NonEmpty<E>;

			_NEW_TYPES: IndexedCollection.Types.NonEmpty<this['_NEW_E']>;
		}
	}

	export interface WithMap<E> extends IndexedCollection<E> {
		map<E2 extends this['context']['__types']['_UPPER_E']>(
			f: (element: E) => E2,
		): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
		mapIndexed<E2 extends this['context']['__types']['_UPPER_E']>(
			f: (element: E, index: number) => E2,
		): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
	}

	export interface WithRemoveAt<E> extends IndexedCollection<E> {
		removeAt(index: number): this['context']['__types']['_NORMAL'];
	}

	export interface WithSwapAt<E> extends IndexedCollection<E> {
		swapAt(index1: number, index2: number): this['context']['__types']['_SELF'];
	}

	export interface WithOrderEditable<E> extends IndexedCollection<E> {
		prepend(element: E): this['context']['__types']['_NON_EMPTY'];
		append(element: E): this['context']['__types']['_NON_EMPTY'];
		placeAt(
			index: number,
			element: E,
		): this['context']['__types']['_NON_EMPTY'];
	}

	export interface WithMoveTo<I, E> extends IndexedCollection<E> {
		moveTo(index: number, element: E): this['context']['__types']['_SELF'];
	}
}

export interface ValuedCollection<T> extends Collection<T> {
	readonly context: {
		__types: ValuedCollection.Types<T>;
	};

	has<UT = T>(value: RelatedTo<T, UT>): boolean;
}

export declare namespace ValuedCollection {
	export interface NonEmpty<T>
		extends ValuedCollection<T>,
			Collection.NonEmpty<T> {
		readonly context: {
			__types: ValuedCollection.Types.NonEmpty<T>;
		};
	}

	export interface Builder<T> extends Collection.Builder<T> {
		readonly context: {
			__types: ValuedCollection.Types<T>;
		};

		has<UT = T>(value: RelatedTo<T, UT>): boolean;
	}

	export interface Types<T> extends Collection.Types<T> {
		_NORMAL: ValuedCollection<T>;
		_NON_EMPTY: ValuedCollection.NonEmpty<T>;
		_NEW_TYPES: ValuedCollection.Types<this['_NEW_E']>;
	}

	export namespace Types {
		export interface NonEmpty<T> extends Collection.Types.NonEmpty<T> {
			_NORMAL: ValuedCollection<T>;
			_NON_EMPTY: ValuedCollection.NonEmpty<T>;
			_NEW_TYPES: ValuedCollection.Types.NonEmpty<this['_NEW_E']>;
		}
	}
}

export interface KeyedCollection<K, V> extends Collection<readonly [K, V]> {
	readonly context: {
		__types: KeyedCollection.Types<K, V>;
	};

	get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
	get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
	has<UK = K>(key: RelatedTo<K, UK>): boolean;

	streamKeys: this['context']['__types']['_streamKeys'];
	streamValues: this['context']['__types']['_streamValues'];
}

export declare namespace KeyedCollection {
	export interface NonEmpty<K, V>
		extends KeyedCollection<K, V>,
			Collection.NonEmpty<readonly [K, V]> {
		readonly context: {
			__types: KeyedCollection.Types.NonEmpty<K, V>;
		};
	}

	export interface Builder<K, V> extends Collection.Builder<readonly [K, V]> {
		readonly context: {
			__types: KeyedCollection.Types<K, V>;
		};

		get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
		get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
		has<UK = K>(key: RelatedTo<K, UK>): boolean;
	}

	export interface Types<K, V> extends Collection.Types<readonly [K, V]> {
		_NORMAL: KeyedCollection<K, V>;
		_NON_EMPTY: KeyedCollection.NonEmpty<K, V>;

		_streamKeys: () => Stream<K>;
		_streamValues: () => Stream<V>;

		_NEW_K: unknown;
		_NEW_V: unknown;
		_NEW_TYPES: KeyedCollection.Types<this['_NEW_K'], this['_NEW_V']>;
	}

	export namespace Types {
		export interface NonEmpty<K, V>
			extends Collection.Types.NonEmpty<readonly [K, V]> {
			_NORMAL: KeyedCollection<K, V>;
			_NON_EMPTY: KeyedCollection.NonEmpty<K, V>;

			_streamKeys: () => Stream.NonEmpty<K>;
			_streamValues: () => Stream.NonEmpty<V>;

			_NEW_K: unknown;
			_NEW_V: unknown;
			_NEW_TYPES: KeyedCollection.Types.NonEmpty<
				this['_NEW_K'],
				this['_NEW_V']
			>;
		}
	}

	export interface WithMap<K, V> extends KeyedCollection<K, V> {
		map<V2>(
			f: (value: V, key: K) => V2,
		): (this['context']['__types'] & { _NEW_V: V2 })['_NEW_TYPES']['_SELF'];
		mapIndexed<V2>(
			f: (value: V, key: K, index: number) => V2,
		): (this['context']['__types'] & { _NEW_V: V2 })['_NEW_TYPES']['_SELF'];
	}
}

export interface IndexedValuedCollection<T>
	extends IndexedCollection<T>,
		ValuedCollection<T> {
	readonly context: {
		__types: IndexedValuedCollection.Types<T>;
	};

	indexOf<UT = T>(value: RelatedTo<T, UT>): number | undefined;
	indexOf<UT, O>(value: RelatedTo<T, UT>, otherwise: OptLazy<O>): number | O;
}

export declare namespace IndexedValuedCollection {
	export interface NonEmpty<T>
		extends IndexedValuedCollection<T>,
			IndexedCollection.NonEmpty<T>,
			ValuedCollection.NonEmpty<T> {
		readonly context: {
			__types: IndexedValuedCollection.Types.NonEmpty<T>;
		};

		indexOf<UT = T>(value: RelatedTo<T, UT>): number | undefined;
		indexOf<UT, O>(value: RelatedTo<T, UT>, otherwise: OptLazy<O>): number | O;
	}

	export interface Builder<T>
		extends IndexedCollection.Builder<T>,
			ValuedCollection.Builder<T> {
		readonly context: {
			__types: IndexedValuedCollection.Types<T>;
		};

		indexOf<UT = T>(value: RelatedTo<T, UT>): number | undefined;
		indexOf<UT, O>(value: RelatedTo<T, UT>, otherwise: OptLazy<O>): number | O;
	}

	export interface Types<T>
		extends IndexedCollection.Types<T>,
			ValuedCollection.Types<T> {
		_NORMAL: IndexedValuedCollection<T>;
		_NON_EMPTY: IndexedValuedCollection.NonEmpty<T>;
		_NEW_TYPES: IndexedValuedCollection.Types<this['_NEW_E']>;

		_stream: IndexedCollection.Types<T>['_stream'];
	}

	export namespace Types {
		export interface NonEmpty<T> extends IndexedCollection.Types.NonEmpty<T> {
			_NORMAL: IndexedValuedCollection<T>;
			_NON_EMPTY: IndexedValuedCollection.NonEmpty<T>;
			_NEW_TYPES: IndexedValuedCollection.Types.NonEmpty<this['_NEW_E']>;
		}
	}
}

export interface IndexedKeyedCollection<K, V>
	extends IndexedCollection<readonly [K, V]>,
		KeyedCollection<K, V> {
	readonly context: {
		__types: IndexedKeyedCollection.Types<K, V>;
	};

	indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
	indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
}

export declare namespace IndexedKeyedCollection {
	export interface NonEmpty<K, V>
		extends IndexedKeyedCollection<K, V>,
			IndexedCollection.NonEmpty<readonly [K, V]>,
			KeyedCollection.NonEmpty<K, V> {
		readonly context: {
			__types: IndexedKeyedCollection.Types.NonEmpty<K, V>;
		};

		indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
		indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
	}

	export interface Builder<K, V>
		extends IndexedCollection.Builder<readonly [K, V]>,
			KeyedCollection.Builder<K, V> {
		readonly context: { __types: IndexedKeyedCollection.Types<K, V> };

		indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
		indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
	}

	export interface Types<K, V>
		extends IndexedCollection.Types<readonly [K, V]>,
			KeyedCollection.Types<K, V> {
		_NORMAL: IndexedKeyedCollection<K, V>;
		_NON_EMPTY: IndexedKeyedCollection.NonEmpty<K, V>;

		_stream: IndexedCollection.Types<readonly [K, V]>['_stream'];

		_streamKeys: (
			options?: { reversed?: boolean | undefined } | undefined,
		) => Stream<K>;
		_streamValues: (
			options?: { reversed?: boolean | undefined } | undefined,
		) => Stream<V>;

		_NEW_TYPES: IndexedKeyedCollection.Types<this['_NEW_K'], this['_NEW_V']>;
	}

	export namespace Types {
		export interface NonEmpty<K, V>
			extends IndexedCollection.Types.NonEmpty<readonly [K, V]>,
				KeyedCollection.Types.NonEmpty<K, V> {
			_NORMAL: IndexedKeyedCollection<K, V>;
			_NON_EMPTY: IndexedKeyedCollection.NonEmpty<K, V>;

			_stream: IndexedCollection.Types.NonEmpty<readonly [K, V]>['_stream'];

			_streamKeys: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream.NonEmpty<K>;
			_streamValues: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream.NonEmpty<V>;

			_NEW_TYPES: IndexedKeyedCollection.Types.NonEmpty<
				this['_NEW_K'],
				this['_NEW_V']
			>;
		}
	}
}

export interface SortedCollection<S, E> extends Collection<E> {
	readonly comp: Comp<S>;

	lowerBound(search: S): number;
	upperBound(search: S): number;

	next(
		search: S,
		options?:
			| { inclusive?: boolean | undefined; otherwise?: never }
			| undefined,
	): E | undefined;
	next<O>(
		search: S,
		options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
	): E | O;
	previous(
		search: S,
		options?:
			| { inclusive?: boolean | undefined; otherwise?: never }
			| undefined,
	): E | undefined;
	previous<O>(
		search: S,
		options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
	): E | O;

	streamRange(
		range: Range<S>,
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream<E>;
	sliceRange(range: Range<S>): SortedCollection<S, E>;
}

export declare namespace SortedCollection {
	export interface NonEmpty<S, E>
		extends SortedCollection<S, E>,
			Collection.NonEmpty<E> {
		readonly context: {
			__types: SortedCollection.Types.NonEmpty<S, E>;
		};
	}

	export interface Builder<S, E> extends Collection.Builder<E> {
		readonly context: {
			__types: SortedCollection.Types<S, E>;
		};

		lowerBound(search: S): number;
		upperBound(search: S): number;

		next(
			search: S,
			options?:
				| { inclusive?: boolean | undefined; otherwise?: never }
				| undefined,
		): E | undefined;
		next<O>(
			search: S,
			options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
		): E | O;
		previous(
			search: S,
			options?:
				| { inclusive?: boolean | undefined; otherwise?: never }
				| undefined,
		): E | undefined;
		previous<O>(
			search: S,
			options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
		): E | O;
	}

	export interface Types<S, E> extends Collection.Types<E> {
		_NORMAL: SortedCollection<S, E>;
		_NON_EMPTY: SortedCollection.NonEmpty<S, E>;

		_NEW_S: unknown;
		_NEW_TYPES: SortedCollection.Types<this['_NEW_S'], this['_NEW_E']>;
	}

	export namespace Types {
		export interface NonEmpty<S, E> extends Collection.Types.NonEmpty<E> {
			_NORMAL: SortedCollection<S, E>;
			_NON_EMPTY: SortedCollection.NonEmpty<S, E>;

			_NEW_S: unknown;
			_NEW_TYPES: SortedCollection.Types.NonEmpty<
				this['_NEW_S'],
				this['_NEW_E']
			>;
		}
	}
}
