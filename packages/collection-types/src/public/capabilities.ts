import type { Op } from '@rimbu/collection-types/types';
import type {
	ArrayNonEmpty,
	CollectFun,
	Comp,
	IndexRange,
	OptLazy,
	Range,
	RelatedTo,
	TraverseState,
} from '@rimbu/common';
import type { FastIterable, Stream, StreamSource } from '@rimbu/stream';

export interface Collection<
	E,
	Tp extends Collection.Advanced.Types<E> = Collection.Advanced.Types<E>,
> extends FastIterable<E>,
		Collection.Advanced.Trait<E, Tp> {
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
	toBuilder(): this['context']['__types']['_BUILDER'];
}

export declare namespace Collection {
	export interface NonEmpty<
		E,
		Tp extends
			Collection.Advanced.TypesNonEmpty<E> = Collection.Advanced.TypesNonEmpty<E>,
	> extends Collection<E, Tp> {
		asNormal(): this['context']['__types']['_NORMAL'];
	}

	export interface Builder<
		E,
		Tp extends Collection.Advanced.Types<E> = Collection.Advanced.Types<E>,
	> extends Collection.Advanced.Trait<E, Tp> {
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

	export namespace Advanced {
		export interface Trait<
			E,
			Tp extends Collection.Advanced.Types<E> = Collection.Advanced.Types<E>,
		> {
			readonly context: Collection.Advanced.ContextBase<Tp>;
		}

		export interface ContextBase<Tp extends Collection.Advanced.Types<any>> {
			readonly __types: Tp;

			empty<E extends Tp['_UPPER_E']>(): (Tp & {
				_NEW_E: E;
			})['_NEW_TYPES']['_NORMAL'];
			of<E extends Tp['_UPPER_E']>(
				...elements: ArrayNonEmpty<E>
			): (Tp & {
				_NEW_E: E;
			})['_NEW_TYPES']['_NON_EMPTY'];
			from<T extends Tp['_UPPER_E']>(
				...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
			): (Tp & { _NEW_E: T })['_NEW_TYPES']['_NON_EMPTY'];
			from<T extends Tp['_UPPER_E']>(
				...sources: ArrayNonEmpty<StreamSource<T>>
			): (Tp & { _NEW_E: T })['_NEW_TYPES']['_NORMAL'];
			builder<T extends Tp['_UPPER_E']>(): (Tp & {
				_NEW_E: T;
			})['_NEW_TYPES']['_BUILDER'];
		}

		export interface Types<E> {
			_NORMAL: Collection<E>;
			_NON_EMPTY: Collection.NonEmpty<E>;
			_SELF: this['_NORMAL'];
			_BUILDER: Collection.Builder<E>;
			_AS_STREAM: Stream<E>;

			_isEmpty: boolean;
			_nonEmpty: () => this is this['_NON_EMPTY'];
			_assumeNonEmpty: () => this['_NON_EMPTY'];
			_stream: () => Stream<E>;
			_toArray: () => E[];

			_UPPER_E: unknown;
			_NEW_E: this['_UPPER_E'];
			_NEW_TYPES: Collection.Advanced.Types<this['_NEW_E']>;
		}

		export interface TypesNonEmpty<E> extends Collection.Advanced.Types<E> {
			_SELF: this['_NON_EMPTY'];
			_AS_STREAM: Stream.NonEmpty<E>;

			_isEmpty: false;
			_stream: () => Stream.NonEmpty<E>;
			_toArray: () => ArrayNonEmpty<E>;

			_NEW_TYPES: Collection.Advanced.TypesNonEmpty<this['_NEW_E']>;
		}
	}

	export namespace Capability {
		export interface WithCollect<E> extends Collection.Advanced.Trait<E> {
			collect<E2 extends this['context']['__types']['_UPPER_E']>(
				collectFun: (
					element: E,
					skip: CollectFun.Skip,
					halt: () => void,
				) => E2 | CollectFun.Skip,
			): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
		}

		export interface WithConcat<E> extends Collection.Advanced.Trait<E> {
			concat(
				...sources: ArrayNonEmpty<StreamSource.NonEmpty<E>>
			): this['context']['__types']['_NON_EMPTY'];
			concat(
				...sources: ArrayNonEmpty<StreamSource<E>>
			): this['context']['__types']['_SELF'];

			flatMap<E2 extends this['context']['__types']['_UPPER_E']>(
				f: (element: E) => StreamSource.NonEmpty<E2>,
			): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
			flatMap<E2 extends this['context']['__types']['_UPPER_E']>(
				f: (element: E) => StreamSource<E2>,
			): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
		}

		export interface WithFilter<E> extends Collection.Advanced.Trait<E> {
			filter<E2 extends E, NE2 = Exclude<E, E2>>(
				pred: (element: E) => element is E2,
				options: { negate: true },
			): (this['context']['__types'] & {
				_NEW_E: NE2;
			})['_NEW_TYPES']['_NORMAL'];
			filter<E2 extends E>(
				pred: (element: E) => element is E2,
				options?: { negate?: false | undefined } | undefined,
			): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
			filter(
				pred: (element: E) => boolean,
				options?: { negate?: boolean | undefined } | undefined,
			): this['context']['__types']['_NORMAL'];
		}

		export interface WithMap<E> extends Collection.Advanced.Trait<E> {
			map<E2 extends this['context']['__types']['_UPPER_E']>(
				f: (element: E) => E2,
			): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
		}

		export interface WithMutate<E> extends Collection.Advanced.Trait<E> {
			mutate(
				f: (builder: this['context']['__types']['_BUILDER']) => void,
			): this['context']['__types']['_NORMAL'];
		}

		export interface WithRecompose<E> extends Collection.Advanced.Trait<E> {
			recompose<E2 extends this['context']['__types']['_UPPER_E']>(
				f: (
					stream: this['context']['__types']['_AS_STREAM'],
				) => StreamSource.NonEmpty<E2>,
			): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
			recompose<E2 extends this['context']['__types']['_UPPER_E']>(
				f: (
					stream: this['context']['__types']['_AS_STREAM'],
				) => StreamSource<E2>,
			): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
		}
	}
}

export interface IndexedCollection<
	E,
	Tp extends
		IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
> extends Collection<E, Tp> {
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
	splitAt: this['context']['__types']['_splitAt'];
	slice(range: IndexRange): this['context']['__types']['_NORMAL'];
}

export declare namespace IndexedCollection {
	export interface NonEmpty<
		E,
		Tp extends
			IndexedCollection.Advanced.TypesNonEmpty<E> = IndexedCollection.Advanced.TypesNonEmpty<E>,
	> extends IndexedCollection<E, Tp>,
			Collection.NonEmpty<E, Tp> {}

	export interface Builder<
		E,
		Tp extends
			IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
	> extends Collection.Builder<E, Tp> {
		at(index: number): E | undefined;
		at<O>(index: number, otherwise: OptLazy<O>): E | O;

		first: this['context']['__types']['_firstLast'];
		last: this['context']['__types']['_firstLast'];
	}

	export namespace Advanced {
		export interface Trait<
			E,
			Tp extends
				IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
		> extends Collection.Advanced.Trait<E, Tp> {}

		export interface FirstLast<R, IsNonEmpty extends boolean = boolean> {
			(): IsNonEmpty extends true ? R : R | undefined;
			<O>(otherwise: OptLazy<O>): IsNonEmpty extends true ? R : R | O;
		}

		export interface TakeNonEmpty<RN, RNE> {
			<const N extends number>(amount: N): 0 extends N ? RN : RNE;
			(amount: number): RN;
		}

		export interface SplitAtNonEmpty<RN, RNE> {
			<const N extends number>(amount: N): [0 extends N ? RN : RNE, RN];
			(amount: number): [RN, RN];
		}

		export interface Types<E> extends Collection.Advanced.Types<E> {
			_NORMAL: IndexedCollection<E>;
			_NON_EMPTY: IndexedCollection.NonEmpty<E>;
			_BUILDER: IndexedCollection.Builder<E>;

			_firstLast: IndexedCollection.Advanced.FirstLast<E>;
			_take: (amount: number) => this['_NORMAL'];
			_splitAt: (index: number) => [this['_NORMAL'], this['_NORMAL']];
			_stream: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream<E>;

			_NEW_TYPES: IndexedCollection.Advanced.Types<this['_NEW_E']>;
		}

		export interface TypesNonEmpty<E>
			extends Collection.Advanced.TypesNonEmpty<E> {
			_NORMAL: IndexedCollection<E>;
			_NON_EMPTY: IndexedCollection.NonEmpty<E>;
			_BUILDER: IndexedCollection.Builder<E>;

			_firstLast: IndexedCollection.Advanced.FirstLast<E, true>;
			_take: TakeNonEmpty<this['_NORMAL'], this['_NON_EMPTY']>;
			_splitAt: SplitAtNonEmpty<this['_NORMAL'], this['_NON_EMPTY']>;

			_stream: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream.NonEmpty<E>;

			_NEW_TYPES: IndexedCollection.Advanced.TypesNonEmpty<this['_NEW_E']>;
		}
	}

	export namespace Capability {
		export interface BWA<E, Tp extends IndexedCollection.Advanced.Types<E>>
			extends IndexedCollection.Builder<E, Tp> {
			prepend(element: E): void;
			append(element: E): void;
		}

		export interface BuilderWithAppendPrependTypes<E>
			extends IndexedCollection.Advanced.Types<E> {
			_BUILDER: BWA<E, BuilderWithAppendPrependTypes<E>>;

			_NEW_TYPES: BuilderWithAppendPrependTypes<this['_NEW_E']>;
		}

		export interface WithBuilderWithAppendPrepend<E>
			extends IndexedCollection<E, BuilderWithAppendPrependTypes<E>> {}

		export interface WithCollectIndexed<E>
			extends IndexedCollection.Advanced.Trait<E> {
			collectIndexed<E2 extends this['context']['__types']['_UPPER_E']>(
				collectFun: (
					element: E,
					index: number,
					skip: CollectFun.Skip,
					halt: () => void,
				) => E2 | CollectFun.Skip,
				options?: { indexOffset?: number | undefined } | undefined,
			): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
		}

		export interface WithFlatMapIndexed<E>
			extends IndexedCollection.Advanced.Trait<E> {
			flatMapIndexed<E2 extends this['context']['__types']['_UPPER_E']>(
				f: (element: E, index: number) => StreamSource.NonEmpty<E2>,
			): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
			flatMapIndexed<E2 extends this['context']['__types']['_UPPER_E']>(
				f: (element: E, index: number) => StreamSource<E2>,
			): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
		}

		export interface WithFilterIndexed<E>
			extends IndexedCollection.Advanced.Trait<E> {
			filterIndexed<E2 extends E, NE2 = Exclude<E, E2>>(
				pred: (element: E, index: number) => element is E2,
				options: { negate: true; indexOffset?: number | undefined },
			): (this['context']['__types'] & {
				_NEW_E: NE2;
			})['_NEW_TYPES']['_NORMAL'];
			filterIndexed<E2 extends E>(
				pred: (element: E, index: number) => element is E2,
				options?:
					| { negate?: false | undefined; indexOffset?: number | undefined }
					| undefined,
			): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
			filterIndexed(
				pred: (element: E, index: number) => boolean,
				options?:
					| { negate?: boolean | undefined; indexOffset?: number | undefined }
					| undefined,
			): this['context']['__types']['_NORMAL'];
		}

		export interface WithMapIndexed<E>
			extends IndexedCollection.Advanced.Trait<E> {
			mapIndexed<E2 extends this['context']['__types']['_UPPER_E']>(
				f: (element: E, index: number) => E2,
			): (this['context']['__types'] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
		}

		export interface WithOrderEditable<E>
			extends IndexedCollection.Advanced.Trait<E> {
			placeAt(
				index: number,
				element: E,
			): this['context']['__types']['_NON_EMPTY'];
			moveTo(index: number, element: E): this['context']['__types']['_SELF'];
		}

		export interface WithPadTo<E> extends IndexedCollection.Advanced.Trait<E> {
			padTo(
				size: number,
				fill: E,
				options?: { paddingLeftBias?: number | undefined } | undefined,
			): this['context']['__types']['_SELF'];
		}

		export interface WithPrependAppend<E>
			extends IndexedCollection.Advanced.Trait<E> {
			prepend(element: E): this['context']['__types']['_NON_EMPTY'];
			append(element: E): this['context']['__types']['_NON_EMPTY'];
		}

		export interface WithRepeat<E> extends IndexedCollection.Advanced.Trait<E> {
			repeat<N extends number>(
				amount: N,
			): 0 extends N
				? this['context']['__types']['_NORMAL']
				: this['context']['__types']['_SELF'];
		}

		export interface WithRemoveAt<E>
			extends IndexedCollection.Advanced.Trait<E> {
			removeAt(index: number): this['context']['__types']['_NORMAL'];
		}

		export interface WithReversed<E>
			extends IndexedCollection.Advanced.Trait<E> {
			reversed(): this['context']['__types']['_SELF'];
		}

		export interface WithRotate<E> extends IndexedCollection.Advanced.Trait<E> {
			rotateLeft(amount: number): this['context']['__types']['_SELF'];
		}

		export interface WithSpliceAt<E>
			extends IndexedCollection.Advanced.Trait<E> {
			spliceAt(
				index: number,
				options: {
					removeAmount?: number | undefined;
					insert: StreamSource.NonEmpty<E>;
				},
			): this['context']['__types']['_NON_EMPTY'];
			spliceAt(
				index: number,
				options?:
					| {
							removeAmount?: number | undefined;
							insert?: StreamSource<E> | undefined;
					  }
					| undefined,
			): this['context']['__types']['_NORMAL'];
			spliceAtAndReturn(
				index: number,
				options: {
					removeAmount?: number | undefined;
					insert: StreamSource.NonEmpty<E>;
				},
			): Op.WithResult<
				this['context']['__types']['_NON_EMPTY'],
				[
					removed: this['context']['__types']['_NORMAL'],
					inserted: this['context']['__types']['_NON_EMPTY'],
				],
				true
			>;
			spliceAtAndReturn(
				index: number,
				options?:
					| {
							removeAmount?: number | undefined;
							insert?: StreamSource<E> | undefined;
					  }
					| undefined,
			): Op.DynamicResult<
				this['context']['__types']['_SELF'],
				[
					removed: this['context']['__types']['_NORMAL'],
					inserted: this['context']['__types']['_NORMAL'],
				],
				[
					removed: this['context']['__types']['_NORMAL'],
					inserted: this['context']['__types']['_NORMAL'],
				],
				this['context']['__types']['_NORMAL']
			>;

			insertAt(
				index: number,
				values: StreamSource.NonEmpty<E>,
			): this['context']['__types']['_NON_EMPTY'];
			insertAt(
				index: number,
				values: StreamSource<E>,
			): this['context']['__types']['_SELF'];

			removeAt(
				index: number,
				amount?: number | undefined,
			): this['context']['__types']['_NORMAL'];

			removeAtAndReturn(
				index: number,
				amount?: number | undefined,
			): Op.DynamicResult<
				this['context']['__types']['_SELF'],
				this['context']['__types']['_NORMAL'],
				this['context']['__types']['_NON_EMPTY'],
				this['context']['__types']['_NORMAL']
			>;
		}

		export interface WithSwapAt<E> extends IndexedCollection.Advanced.Trait<E> {
			swapAt(
				index1: number,
				index2: number,
			): this['context']['__types']['_SELF'];
			swapAtAndReturn(
				index1: number,
				index2: number,
			): Op.DynamicResult<
				this['context']['__types']['_SELF'],
				[previous1: undefined, previous2: undefined],
				[previous1: E, previous2: E],
				this['context']['__types']['_NON_EMPTY']
			>;
		}

		export interface WithUpdateAt<E>
			extends IndexedCollection.Advanced.Trait<E> {
			setAt(index: number, element: E): this['context']['__types']['_SELF'];
			setAtAndReturn(
				index: number,
				element: E,
			): Op.DynamicResult<
				this['context']['__types']['_SELF'],
				undefined,
				E,
				this['context']['__types']['_NON_EMPTY']
			>;
			updateAt(
				index: number,
				f: (element: E) => E,
			): this['context']['__types']['_SELF'];
			updateAtAndReturn(
				index: number,
				f: (element: E) => E,
			): Op.DynamicResult<
				this['context']['__types']['_SELF'],
				[previous: undefined, current: undefined],
				[previous: E, current: E],
				this['context']['__types']['_NON_EMPTY']
			>;
		}
	}
}

export interface ValuedCollection<T> extends Collection<T> {
	readonly context: Collection.Advanced.ContextBase<
		ValuedCollection.Advanced.Types<T>
	>;

	has<UT = T>(value: RelatedTo<T, UT>): boolean;
}

export declare namespace ValuedCollection {
	export interface NonEmpty<T>
		extends ValuedCollection<T>,
			Collection.NonEmpty<T> {
		readonly context: Collection.Advanced.ContextBase<
			ValuedCollection.Advanced.TypesNonEmpty<T>
		>;
	}

	export interface Builder<T> extends Collection.Builder<T> {
		readonly context: Collection.Advanced.ContextBase<
			ValuedCollection.Advanced.Types<T>
		>;

		has<UT = T>(value: RelatedTo<T, UT>): boolean;
	}

	export namespace Advanced {
		export interface Types<T> extends Collection.Advanced.Types<T> {
			_NORMAL: ValuedCollection<T>;
			_NON_EMPTY: ValuedCollection.NonEmpty<T>;
			_BUILDER: ValuedCollection.Builder<T>;
			_NEW_TYPES: ValuedCollection.Advanced.Types<this['_NEW_E']>;
		}

		export interface TypesNonEmpty<T>
			extends Collection.Advanced.TypesNonEmpty<T> {
			_NORMAL: ValuedCollection<T>;
			_NON_EMPTY: ValuedCollection.NonEmpty<T>;
			_BUILDER: ValuedCollection.Builder<T>;
			_NEW_TYPES: ValuedCollection.Advanced.TypesNonEmpty<this['_NEW_E']>;
		}
	}
}

export interface KeyedCollection<K, V> extends Collection<readonly [K, V]> {
	readonly context: Collection.Advanced.ContextBase<
		KeyedCollection.Advanced.Types<K, V>
	>;

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
		readonly context: Collection.Advanced.ContextBase<
			KeyedCollection.Advanced.TypesNonEmpty<K, V>
		>;
	}

	export interface Builder<K, V> extends Collection.Builder<readonly [K, V]> {
		readonly context: Collection.Advanced.ContextBase<
			KeyedCollection.Advanced.Types<K, V>
		>;

		get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
		get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
		has<UK = K>(key: RelatedTo<K, UK>): boolean;
	}

	export namespace Advanced {
		export interface Types<K, V>
			extends Collection.Advanced.Types<readonly [K, V]> {
			_NORMAL: KeyedCollection<K, V>;
			_NON_EMPTY: KeyedCollection.NonEmpty<K, V>;
			_BUILDER: KeyedCollection.Builder<K, V>;

			_streamKeys: () => Stream<K>;
			_streamValues: () => Stream<V>;

			_NEW_K: unknown;
			_NEW_V: unknown;
			_NEW_TYPES: KeyedCollection.Advanced.Types<
				this['_NEW_K'],
				this['_NEW_V']
			>;
		}

		export interface TypesNonEmpty<K, V>
			extends Collection.Advanced.TypesNonEmpty<readonly [K, V]> {
			_NORMAL: KeyedCollection<K, V>;
			_NON_EMPTY: KeyedCollection.NonEmpty<K, V>;
			_BUILDER: KeyedCollection.Builder<K, V>;

			_streamKeys: () => Stream.NonEmpty<K>;
			_streamValues: () => Stream.NonEmpty<V>;

			_NEW_K: unknown;
			_NEW_V: unknown;
			_NEW_TYPES: KeyedCollection.Advanced.TypesNonEmpty<
				this['_NEW_K'],
				this['_NEW_V']
			>;
		}
	}

	export namespace Capability {
		export interface WithMapValues<K, V> extends KeyedCollection<K, V> {
			mapValues<V2>(
				f: (value: V, key: K, index: number) => V2,
			): (this['context']['__types'] & { _NEW_V: V2 })['_NEW_TYPES']['_SELF'];
		}
	}
}

export interface IndexedValuedCollection<T>
	extends IndexedCollection<T>,
		ValuedCollection<T> {
	readonly context: Collection.Advanced.ContextBase<
		IndexedValuedCollection.Advanced.Types<T>
	>;

	indexOf<UT = T>(value: RelatedTo<T, UT>): number | undefined;
	indexOf<UT, O>(value: RelatedTo<T, UT>, otherwise: OptLazy<O>): number | O;
}

export declare namespace IndexedValuedCollection {
	export interface NonEmpty<T>
		extends IndexedValuedCollection<T>,
			IndexedCollection.NonEmpty<T>,
			ValuedCollection.NonEmpty<T> {
		readonly context: Collection.Advanced.ContextBase<
			IndexedValuedCollection.Advanced.TypesNonEmpty<T>
		>;

		indexOf<UT = T>(value: RelatedTo<T, UT>): number | undefined;
		indexOf<UT, O>(value: RelatedTo<T, UT>, otherwise: OptLazy<O>): number | O;
	}

	export interface Builder<T>
		extends IndexedCollection.Builder<T>,
			ValuedCollection.Builder<T> {
		readonly context: Collection.Advanced.ContextBase<
			IndexedValuedCollection.Advanced.Types<T>
		>;

		indexOf<UT = T>(value: RelatedTo<T, UT>): number | undefined;
		indexOf<UT, O>(value: RelatedTo<T, UT>, otherwise: OptLazy<O>): number | O;
	}

	export namespace Advanced {
		export interface Types<T>
			extends IndexedCollection.Advanced.Types<T>,
				ValuedCollection.Advanced.Types<T> {
			_NORMAL: IndexedValuedCollection<T>;
			_NON_EMPTY: IndexedValuedCollection.NonEmpty<T>;
			_BUILDER: IndexedValuedCollection.Builder<T>;
			_NEW_TYPES: IndexedValuedCollection.Advanced.Types<this['_NEW_E']>;

			_stream: IndexedCollection.Advanced.Types<T>['_stream'];
		}

		export interface TypesNonEmpty<T>
			extends IndexedCollection.Advanced.TypesNonEmpty<T> {
			_NORMAL: IndexedValuedCollection<T>;
			_NON_EMPTY: IndexedValuedCollection.NonEmpty<T>;
			_BUILDER: IndexedValuedCollection.Builder<T>;
			_NEW_TYPES: IndexedValuedCollection.Advanced.TypesNonEmpty<
				this['_NEW_E']
			>;
		}
	}
}

export interface IndexedKeyedCollection<K, V>
	extends IndexedCollection<readonly [K, V]>,
		KeyedCollection<K, V> {
	readonly context: Collection.Advanced.ContextBase<
		IndexedKeyedCollection.Advanced.Types<K, V>
	>;

	indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
	indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
}

export declare namespace IndexedKeyedCollection {
	export interface NonEmpty<K, V>
		extends IndexedKeyedCollection<K, V>,
			IndexedCollection.NonEmpty<readonly [K, V]>,
			KeyedCollection.NonEmpty<K, V> {
		readonly context: Collection.Advanced.ContextBase<
			IndexedKeyedCollection.Advanced.TypesNonEmpty<K, V>
		>;

		indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
		indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
	}

	export interface Builder<K, V>
		extends IndexedCollection.Builder<readonly [K, V]>,
			KeyedCollection.Builder<K, V> {
		readonly context: Collection.Advanced.ContextBase<
			IndexedKeyedCollection.Advanced.Types<K, V>
		>;

		indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
		indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
	}

	export namespace Advanced {
		export interface Types<K, V>
			extends IndexedCollection.Advanced.Types<readonly [K, V]>,
				KeyedCollection.Advanced.Types<K, V> {
			_NORMAL: IndexedKeyedCollection<K, V>;
			_NON_EMPTY: IndexedKeyedCollection.NonEmpty<K, V>;
			_BUILDER: IndexedKeyedCollection.Builder<K, V>;

			_stream: IndexedCollection.Advanced.Types<readonly [K, V]>['_stream'];

			_streamKeys: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream<K>;
			_streamValues: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream<V>;

			_NEW_TYPES: IndexedKeyedCollection.Advanced.Types<
				this['_NEW_K'],
				this['_NEW_V']
			>;
		}

		export interface TypesNonEmpty<K, V>
			extends IndexedCollection.Advanced.TypesNonEmpty<readonly [K, V]>,
				KeyedCollection.Advanced.TypesNonEmpty<K, V> {
			_NORMAL: IndexedKeyedCollection<K, V>;
			_NON_EMPTY: IndexedKeyedCollection.NonEmpty<K, V>;
			_BUILDER: IndexedKeyedCollection.Builder<K, V>;

			_stream: IndexedCollection.Advanced.TypesNonEmpty<
				readonly [K, V]
			>['_stream'];

			_streamKeys: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream.NonEmpty<K>;
			_streamValues: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream.NonEmpty<V>;

			_NEW_TYPES: IndexedKeyedCollection.Advanced.TypesNonEmpty<
				this['_NEW_K'],
				this['_NEW_V']
			>;
		}
	}
}

export interface SortedCollection<S, E> extends Collection<E> {
	readonly context: Collection.Advanced.ContextBase<
		SortedCollection.Advanced.Types<S, E>
	>;

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
		readonly context: Collection.Advanced.ContextBase<
			SortedCollection.Advanced.TypesNonEmpty<S, E>
		>;
	}

	export interface Builder<S, E> extends Collection.Builder<E> {
		readonly context: Collection.Advanced.ContextBase<
			SortedCollection.Advanced.Types<S, E>
		>;

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

	export namespace Advanced {
		export interface Types<S, E> extends Collection.Advanced.Types<E> {
			_NORMAL: SortedCollection<S, E>;
			_NON_EMPTY: SortedCollection.NonEmpty<S, E>;
			_BUILDER: SortedCollection.Builder<S, E>;

			_NEW_S: unknown;
			_NEW_TYPES: SortedCollection.Advanced.Types<
				this['_NEW_S'],
				this['_NEW_E']
			>;
		}

		export interface TypesNonEmpty<S, E>
			extends Collection.Advanced.TypesNonEmpty<E> {
			_NORMAL: SortedCollection<S, E>;
			_NON_EMPTY: SortedCollection.NonEmpty<S, E>;
			_BUILDER: SortedCollection.Builder<S, E>;

			_NEW_S: unknown;
			_NEW_TYPES: SortedCollection.Advanced.TypesNonEmpty<
				this['_NEW_S'],
				this['_NEW_E']
			>;
		}
	}
}
