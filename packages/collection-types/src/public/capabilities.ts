import type { Op, TypesKey } from '@rimbu/collection-types/types';
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
	readonly isEmpty: this[TypesKey]['_isEmpty'];
	readonly size: number;

	nonEmpty: this[TypesKey]['_nonEmpty'];
	assumeNonEmpty: this[TypesKey]['_assumeNonEmpty'];

	stream: this[TypesKey]['_stream'];

	forEach(f: (element: E) => void): void;
	forEachIndexed(
		f: (element: E, index: number, halt: () => void) => void,
		options?: { state?: TraverseState | undefined } | undefined,
	): void;

	toArray: this[TypesKey]['_toArray'];
	toBuilder(): this[TypesKey]['_BUILDER'];
}

export declare namespace Collection {
	export interface NonEmpty<
		E,
		Tp extends
			Collection.Advanced.TypesNonEmpty<E> = Collection.Advanced.TypesNonEmpty<E>,
	> extends Collection<E, Tp> {
		asNormal(): this[TypesKey]['_NORMAL'];
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
		build(): this[TypesKey]['_NORMAL'];
	}

	export namespace Builder {
		/**
		 * Optional capabilities a concrete `Collection.Builder` can mix in.
		 *
		 * Like `Collection.Capability.*`, these are plain interface mixins: they
		 * may *read* slots from the types record but must never *override* one.
		 * A capability that overrides a slot can only be composed with `&` on the
		 * types record, and `&` intersects every slot rather than overriding the
		 * single intended one — which leaks intersections such as
		 * `List<T> & IndexedCollection<T>` into `build()`'s return type.
		 * Composing read-only mixins with `extends` keeps concrete types exact.
		 */
		export namespace Capability {
			export interface WithAppendPrepend<E> {
				prepend(element: E): void;
				append(element: E): void;
			}
		}
	}

	export namespace Advanced {
		/**
		 * Carrier of the HKT types record.
		 *
		 * The record lives on the collection itself under the {@link TypesKey}
		 * symbol rather than on the context. A symbol key keeps it out of `.`
		 * autocomplete entirely, and holding it on the value (not on the shared
		 * context singleton) means the context no longer has to be parameterised
		 * by whether its holder is empty or non-empty.
		 */
		export interface Trait<
			E,
			Tp extends Collection.Advanced.Types<E> = Collection.Advanced.Types<E>,
		> {
			readonly [TypesKey]: Tp;
			readonly context: Collection.Advanced.ContextBase<Tp>;
		}

		export interface ContextBase<Tp extends Collection.Advanced.Types<any>> {
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

		/**
		 * The types record is split along two orthogonal axes.
		 *
		 * - **Family** — *which* collection this is: `_NORMAL`, `_NON_EMPTY`,
		 *   `_BUILDER`. Identical for the possibly-empty and non-empty variants,
		 *   so a package declares it exactly once.
		 * - **Variant** — whether the collection may be empty: `_SELF`,
		 *   `_isEmpty`, `_stream`, `_toArray`, ... Fully determined by this
		 *   library, so a package never restates it.
		 *
		 * The two axes are combined with `&`, never `extends`: an intersection
		 * has no "members must be identical" rule (TS2320), and `unknown & X`
		 * reduces to `X`, so a narrowing family composes cleanly with a variant
		 * that leaves the family slots open.
		 *
		 * Consequently a `*Variant` interface must only ever extend the variant
		 * chain — extending a *narrowing* family from a variant reintroduces
		 * TS2320.
		 */
		export interface FamilyBase<E> {
			_NORMAL: unknown;
			_NON_EMPTY: unknown;
			_BUILDER: unknown;

			_nonEmpty: () => this is this['_NON_EMPTY'];
			_assumeNonEmpty: () => this['_NON_EMPTY'];

			_UPPER_E: unknown;
			_NEW_E: this['_UPPER_E'];
			_NEW_FAMILY: Collection.Advanced.FamilyBase<this['_NEW_E']>;

			__e?: E;
		}

		export interface Family<E> extends Collection.Advanced.FamilyBase<E> {
			_NORMAL: Collection<E>;
			_NON_EMPTY: Collection.NonEmpty<E>;
			_BUILDER: Collection.Builder<E>;

			_NEW_FAMILY: Collection.Advanced.Family<this['_NEW_E']>;
		}

		export interface NormalVariant<E>
			extends Collection.Advanced.FamilyBase<E> {
			_SELF: this['_NORMAL'];
			_AS_STREAM: Stream<E>;

			_isEmpty: boolean;
			_stream: () => Stream<E>;
			_toArray: () => E[];

			_NEW_TYPES: this['_NEW_FAMILY'] &
				Collection.Advanced.NormalVariant<this['_NEW_E']>;
		}

		export interface NonEmptyVariant<E>
			extends Collection.Advanced.FamilyBase<E> {
			_SELF: this['_NON_EMPTY'];
			_AS_STREAM: Stream.NonEmpty<E>;

			_isEmpty: false;
			_stream: () => Stream.NonEmpty<E>;
			_toArray: () => ArrayNonEmpty<E>;

			_NEW_TYPES: this['_NEW_FAMILY'] &
				Collection.Advanced.NonEmptyVariant<this['_NEW_E']>;
		}

		export type Types<E> = Collection.Advanced.Family<E> &
			Collection.Advanced.NormalVariant<E>;

		export type TypesNonEmpty<E> = Collection.Advanced.Family<E> &
			Collection.Advanced.NonEmptyVariant<E>;
	}

	export namespace Capability {
		export interface WithCollect<E> extends Collection.Advanced.Trait<E> {
			collect<E2 extends this[TypesKey]['_UPPER_E']>(
				collectFun: (
					element: E,
					skip: CollectFun.Skip,
					halt: () => void,
				) => E2 | CollectFun.Skip,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
		}

		export interface WithConcat<E> extends Collection.Advanced.Trait<E> {
			concat(
				...sources: ArrayNonEmpty<StreamSource.NonEmpty<E>>
			): this[TypesKey]['_NON_EMPTY'];
			concat(
				...sources: ArrayNonEmpty<StreamSource<E>>
			): this[TypesKey]['_SELF'];

			flatMap<E2 extends this[TypesKey]['_UPPER_E']>(
				f: (element: E) => StreamSource.NonEmpty<E2>,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
			flatMap<E2 extends this[TypesKey]['_UPPER_E']>(
				f: (element: E) => StreamSource<E2>,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
		}

		export interface WithFilter<E> extends Collection.Advanced.Trait<E> {
			filter<E2 extends E, NE2 = Exclude<E, E2>>(
				pred: (element: E) => element is E2,
				options: { negate: true },
			): (this[TypesKey] & {
				_NEW_E: NE2;
			})['_NEW_TYPES']['_NORMAL'];
			filter<E2 extends E>(
				pred: (element: E) => element is E2,
				options?: { negate?: false | undefined } | undefined,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
			filter(
				pred: (element: E) => boolean,
				options?: { negate?: boolean | undefined } | undefined,
			): this[TypesKey]['_NORMAL'];
		}

		export interface WithMap<E> extends Collection.Advanced.Trait<E> {
			map<E2 extends this[TypesKey]['_UPPER_E']>(
				f: (element: E) => E2,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
		}

		export interface WithMutate<E> extends Collection.Advanced.Trait<E> {
			mutate(
				f: (builder: this[TypesKey]['_BUILDER']) => void,
			): this[TypesKey]['_NORMAL'];
		}

		export interface WithRecompose<E> extends Collection.Advanced.Trait<E> {
			recompose<E2 extends this[TypesKey]['_UPPER_E']>(
				f: (stream: this[TypesKey]['_AS_STREAM']) => StreamSource.NonEmpty<E2>,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
			recompose<E2 extends this[TypesKey]['_UPPER_E']>(
				f: (stream: this[TypesKey]['_AS_STREAM']) => StreamSource<E2>,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
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

	first: this[TypesKey]['_firstLast'];
	last: this[TypesKey]['_firstLast'];

	take: this[TypesKey]['_take'];
	drop(amount: number): this[TypesKey]['_NORMAL'];
	splitAt: this[TypesKey]['_splitAt'];
	slice(range: IndexRange): this[TypesKey]['_NORMAL'];
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

		first: this[TypesKey]['_firstLast'];
		last: this[TypesKey]['_firstLast'];
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

		export interface Family<E> extends Collection.Advanced.Family<E> {
			_NORMAL: IndexedCollection<E>;
			_NON_EMPTY: IndexedCollection.NonEmpty<E>;
			_BUILDER: IndexedCollection.Builder<E>;

			_NEW_FAMILY: IndexedCollection.Advanced.Family<this['_NEW_E']>;
		}

		export interface NormalVariant<E>
			extends Collection.Advanced.NormalVariant<E> {
			_firstLast: IndexedCollection.Advanced.FirstLast<E>;
			_take: (amount: number) => this['_NORMAL'];
			_splitAt: (index: number) => [this['_NORMAL'], this['_NORMAL']];
			_stream: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream<E>;

			_NEW_TYPES: this['_NEW_FAMILY'] &
				IndexedCollection.Advanced.NormalVariant<this['_NEW_E']>;
		}

		export interface NonEmptyVariant<E>
			extends Collection.Advanced.NonEmptyVariant<E> {
			_firstLast: IndexedCollection.Advanced.FirstLast<E, true>;
			_take: TakeNonEmpty<this['_NORMAL'], this['_NON_EMPTY']>;
			_splitAt: SplitAtNonEmpty<this['_NORMAL'], this['_NON_EMPTY']>;

			_stream: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream.NonEmpty<E>;

			_NEW_TYPES: this['_NEW_FAMILY'] &
				IndexedCollection.Advanced.NonEmptyVariant<this['_NEW_E']>;
		}

		export type Types<E> = IndexedCollection.Advanced.Family<E> &
			IndexedCollection.Advanced.NormalVariant<E>;

		export type TypesNonEmpty<E> = IndexedCollection.Advanced.Family<E> &
			IndexedCollection.Advanced.NonEmptyVariant<E>;
	}

	export namespace Capability {
		/**
		 * A types record describing "any collection whose builder supports
		 * `append`/`prepend`".
		 *
		 * This exists purely as a *constraint* for generic helpers such as
		 * `defaultCollect`. Concrete collections must never intersect it into
		 * their own `Builder` declaration — they simply mix in
		 * `Collection.Builder.Capability.WithAppendPrepend` via `extends`, and
		 * their own types record then satisfies this constraint structurally.
		 */
		export interface BuilderWithAppendPrependTypes<E>
			extends IndexedCollection.Advanced.Types<E> {
			_BUILDER: IndexedCollection.Builder<E, BuilderWithAppendPrependTypes<E>> &
				Collection.Builder.Capability.WithAppendPrepend<E>;

			_NEW_TYPES: BuilderWithAppendPrependTypes<this['_NEW_E']>;
		}

		export interface WithBuilderWithAppendPrepend<E>
			extends IndexedCollection<E, BuilderWithAppendPrependTypes<E>> {}

		export interface WithCollectIndexed<E>
			extends IndexedCollection.Advanced.Trait<E> {
			collectIndexed<E2 extends this[TypesKey]['_UPPER_E']>(
				collectFun: (
					element: E,
					index: number,
					skip: CollectFun.Skip,
					halt: () => void,
				) => E2 | CollectFun.Skip,
				options?: { indexOffset?: number | undefined } | undefined,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
		}

		export interface WithFlatMapIndexed<E>
			extends IndexedCollection.Advanced.Trait<E> {
			flatMapIndexed<E2 extends this[TypesKey]['_UPPER_E']>(
				f: (element: E, index: number) => StreamSource.NonEmpty<E2>,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
			flatMapIndexed<E2 extends this[TypesKey]['_UPPER_E']>(
				f: (element: E, index: number) => StreamSource<E2>,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
		}

		export interface WithFilterIndexed<E>
			extends IndexedCollection.Advanced.Trait<E> {
			filterIndexed<E2 extends E, NE2 = Exclude<E, E2>>(
				pred: (element: E, index: number) => element is E2,
				options: { negate: true; indexOffset?: number | undefined },
			): (this[TypesKey] & {
				_NEW_E: NE2;
			})['_NEW_TYPES']['_NORMAL'];
			filterIndexed<E2 extends E>(
				pred: (element: E, index: number) => element is E2,
				options?:
					| { negate?: false | undefined; indexOffset?: number | undefined }
					| undefined,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
			filterIndexed(
				pred: (element: E, index: number) => boolean,
				options?:
					| { negate?: boolean | undefined; indexOffset?: number | undefined }
					| undefined,
			): this[TypesKey]['_NORMAL'];
		}

		export interface WithMapIndexed<E>
			extends IndexedCollection.Advanced.Trait<E> {
			mapIndexed<E2 extends this[TypesKey]['_UPPER_E']>(
				f: (element: E, index: number) => E2,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
		}

		export interface WithOrderEditable<E>
			extends IndexedCollection.Advanced.Trait<E> {
			placeAt(index: number, element: E): this[TypesKey]['_NON_EMPTY'];
			moveTo(index: number, element: E): this[TypesKey]['_SELF'];
		}

		export interface WithPadTo<E> extends IndexedCollection.Advanced.Trait<E> {
			padTo(
				size: number,
				fill: E,
				options?: { paddingLeftBias?: number | undefined } | undefined,
			): this[TypesKey]['_SELF'];
		}

		export interface WithPrependAppend<E>
			extends IndexedCollection.Advanced.Trait<E> {
			prepend(element: E): this[TypesKey]['_NON_EMPTY'];
			append(element: E): this[TypesKey]['_NON_EMPTY'];
		}

		export interface WithRepeat<E> extends IndexedCollection.Advanced.Trait<E> {
			repeat<N extends number>(
				amount: N,
			): 0 extends N ? this[TypesKey]['_NORMAL'] : this[TypesKey]['_SELF'];
		}

		export interface WithRemoveAt<E>
			extends IndexedCollection.Advanced.Trait<E> {
			removeAt(index: number): this[TypesKey]['_NORMAL'];
		}

		export interface WithReversed<E>
			extends IndexedCollection.Advanced.Trait<E> {
			reversed(): this[TypesKey]['_SELF'];
		}

		export interface WithRotate<E> extends IndexedCollection.Advanced.Trait<E> {
			rotateLeft(amount: number): this[TypesKey]['_SELF'];
		}

		export interface WithSpliceAt<E>
			extends IndexedCollection.Advanced.Trait<E> {
			spliceAt(
				index: number,
				options: {
					removeAmount?: number | undefined;
					insert: StreamSource.NonEmpty<E>;
				},
			): this[TypesKey]['_NON_EMPTY'];
			spliceAt(
				index: number,
				options?:
					| {
							removeAmount?: number | undefined;
							insert?: StreamSource<E> | undefined;
					  }
					| undefined,
			): this[TypesKey]['_NORMAL'];
			spliceAtAndReturn(
				index: number,
				options: {
					removeAmount?: number | undefined;
					insert: StreamSource.NonEmpty<E>;
				},
			): Op.WithResult<
				this[TypesKey]['_NON_EMPTY'],
				[
					removed: this[TypesKey]['_NORMAL'],
					inserted: this[TypesKey]['_NON_EMPTY'],
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
				this[TypesKey]['_SELF'],
				[
					removed: this[TypesKey]['_NORMAL'],
					inserted: this[TypesKey]['_NORMAL'],
				],
				[
					removed: this[TypesKey]['_NORMAL'],
					inserted: this[TypesKey]['_NORMAL'],
				],
				this[TypesKey]['_NORMAL']
			>;

			insertAt(
				index: number,
				values: StreamSource.NonEmpty<E>,
			): this[TypesKey]['_NON_EMPTY'];
			insertAt(index: number, values: StreamSource<E>): this[TypesKey]['_SELF'];

			removeAt(
				index: number,
				amount?: number | undefined,
			): this[TypesKey]['_NORMAL'];

			removeAtAndReturn(
				index: number,
				amount?: number | undefined,
			): Op.DynamicResult<
				this[TypesKey]['_SELF'],
				this[TypesKey]['_NORMAL'],
				this[TypesKey]['_NON_EMPTY'],
				this[TypesKey]['_NORMAL']
			>;
		}

		export interface WithSwapAt<E> extends IndexedCollection.Advanced.Trait<E> {
			swapAt(index1: number, index2: number): this[TypesKey]['_SELF'];
			swapAtAndReturn(
				index1: number,
				index2: number,
			): Op.DynamicResult<
				this[TypesKey]['_SELF'],
				[previous1: undefined, previous2: undefined],
				[previous1: E, previous2: E],
				this[TypesKey]['_NON_EMPTY']
			>;
		}

		export interface WithUpdateAt<E>
			extends IndexedCollection.Advanced.Trait<E> {
			setAt(index: number, element: E): this[TypesKey]['_SELF'];
			setAtAndReturn(
				index: number,
				element: E,
			): Op.DynamicResult<
				this[TypesKey]['_SELF'],
				undefined,
				E,
				this[TypesKey]['_NON_EMPTY']
			>;
			updateAt(index: number, f: (element: E) => E): this[TypesKey]['_SELF'];
			updateAtAndReturn(
				index: number,
				f: (element: E) => E,
			): Op.DynamicResult<
				this[TypesKey]['_SELF'],
				[previous: undefined, current: undefined],
				[previous: E, current: E],
				this[TypesKey]['_NON_EMPTY']
			>;
		}
	}
}

export interface ValuedCollection<
	T,
	Tp extends
		ValuedCollection.Advanced.Types<T> = ValuedCollection.Advanced.Types<T>,
> extends Collection<T, Tp> {
	has<UT = T>(value: RelatedTo<T, UT>): boolean;
}

export declare namespace ValuedCollection {
	export interface NonEmpty<
		T,
		Tp extends
			ValuedCollection.Advanced.TypesNonEmpty<T> = ValuedCollection.Advanced.TypesNonEmpty<T>,
	> extends ValuedCollection<T, Tp>,
			Collection.NonEmpty<T, Tp> {}

	export interface Builder<
		T,
		Tp extends
			ValuedCollection.Advanced.Types<T> = ValuedCollection.Advanced.Types<T>,
	> extends Collection.Builder<T, Tp> {
		has<UT = T>(value: RelatedTo<T, UT>): boolean;
	}

	export namespace Advanced {
		export interface Family<T> extends Collection.Advanced.Family<T> {
			_NORMAL: ValuedCollection<T>;
			_NON_EMPTY: ValuedCollection.NonEmpty<T>;
			_BUILDER: ValuedCollection.Builder<T>;

			_NEW_FAMILY: ValuedCollection.Advanced.Family<this['_NEW_E']>;
		}

		export interface NormalVariant<T>
			extends Collection.Advanced.NormalVariant<T> {
			_NEW_TYPES: this['_NEW_FAMILY'] &
				ValuedCollection.Advanced.NormalVariant<this['_NEW_E']>;
		}

		export interface NonEmptyVariant<T>
			extends Collection.Advanced.NonEmptyVariant<T> {
			_NEW_TYPES: this['_NEW_FAMILY'] &
				ValuedCollection.Advanced.NonEmptyVariant<this['_NEW_E']>;
		}

		export type Types<T> = ValuedCollection.Advanced.Family<T> &
			ValuedCollection.Advanced.NormalVariant<T>;

		export type TypesNonEmpty<T> = ValuedCollection.Advanced.Family<T> &
			ValuedCollection.Advanced.NonEmptyVariant<T>;
	}
}

export interface KeyedCollection<
	K,
	V,
	Tp extends KeyedCollection.Advanced.Types<
		K,
		V
	> = KeyedCollection.Advanced.Types<K, V>,
> extends Collection<readonly [K, V], Tp> {
	get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
	get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
	has<UK = K>(key: RelatedTo<K, UK>): boolean;

	streamKeys: this[TypesKey]['_streamKeys'];
	streamValues: this[TypesKey]['_streamValues'];
}

export declare namespace KeyedCollection {
	export interface NonEmpty<
		K,
		V,
		Tp extends KeyedCollection.Advanced.TypesNonEmpty<
			K,
			V
		> = KeyedCollection.Advanced.TypesNonEmpty<K, V>,
	> extends KeyedCollection<K, V, Tp>,
			Collection.NonEmpty<readonly [K, V], Tp> {}

	export interface Builder<
		K,
		V,
		Tp extends KeyedCollection.Advanced.Types<
			K,
			V
		> = KeyedCollection.Advanced.Types<K, V>,
	> extends Collection.Builder<readonly [K, V], Tp> {
		get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
		get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
		has<UK = K>(key: RelatedTo<K, UK>): boolean;
	}

	export namespace Advanced {
		export interface FamilyBase<K, V>
			extends Collection.Advanced.FamilyBase<readonly [K, V]> {
			_NEW_K: unknown;
			_NEW_V: unknown;
		}

		export interface Family<K, V>
			extends Collection.Advanced.Family<readonly [K, V]>,
				KeyedCollection.Advanced.FamilyBase<K, V> {
			_NORMAL: KeyedCollection<K, V>;
			_NON_EMPTY: KeyedCollection.NonEmpty<K, V>;
			_BUILDER: KeyedCollection.Builder<K, V>;

			_NEW_FAMILY: KeyedCollection.Advanced.Family<
				this['_NEW_K'],
				this['_NEW_V']
			>;
		}

		export interface NormalVariant<K, V>
			extends Collection.Advanced.NormalVariant<readonly [K, V]>,
				KeyedCollection.Advanced.FamilyBase<K, V> {
			_streamKeys: () => Stream<K>;
			_streamValues: () => Stream<V>;

			_NEW_TYPES: this['_NEW_FAMILY'] &
				KeyedCollection.Advanced.NormalVariant<this['_NEW_K'], this['_NEW_V']>;
		}

		export interface NonEmptyVariant<K, V>
			extends Collection.Advanced.NonEmptyVariant<readonly [K, V]>,
				KeyedCollection.Advanced.FamilyBase<K, V> {
			_streamKeys: () => Stream.NonEmpty<K>;
			_streamValues: () => Stream.NonEmpty<V>;

			_NEW_TYPES: this['_NEW_FAMILY'] &
				KeyedCollection.Advanced.NonEmptyVariant<
					this['_NEW_K'],
					this['_NEW_V']
				>;
		}

		export type Types<K, V> = KeyedCollection.Advanced.Family<K, V> &
			KeyedCollection.Advanced.NormalVariant<K, V>;

		export type TypesNonEmpty<K, V> = KeyedCollection.Advanced.Family<K, V> &
			KeyedCollection.Advanced.NonEmptyVariant<K, V>;
	}

	export namespace Capability {
		export interface WithMapValues<K, V> extends KeyedCollection<K, V> {
			mapValues<V2>(
				f: (value: V, key: K, index: number) => V2,
			): (this[TypesKey] & { _NEW_V: V2 })['_NEW_TYPES']['_SELF'];
		}
	}
}

export interface IndexedValuedCollection<
	T,
	Tp extends
		IndexedValuedCollection.Advanced.Types<T> = IndexedValuedCollection.Advanced.Types<T>,
> extends IndexedCollection<T, Tp>,
		ValuedCollection<T, Tp> {
	indexOf<UT = T>(value: RelatedTo<T, UT>): number | undefined;
	indexOf<UT, O>(value: RelatedTo<T, UT>, otherwise: OptLazy<O>): number | O;
}

export declare namespace IndexedValuedCollection {
	export interface NonEmpty<
		T,
		Tp extends
			IndexedValuedCollection.Advanced.TypesNonEmpty<T> = IndexedValuedCollection.Advanced.TypesNonEmpty<T>,
	> extends IndexedValuedCollection<T, Tp>,
			IndexedCollection.NonEmpty<T, Tp>,
			ValuedCollection.NonEmpty<T, Tp> {
		indexOf<UT = T>(value: RelatedTo<T, UT>): number | undefined;
		indexOf<UT, O>(value: RelatedTo<T, UT>, otherwise: OptLazy<O>): number | O;
	}

	export interface Builder<
		T,
		Tp extends
			IndexedValuedCollection.Advanced.Types<T> = IndexedValuedCollection.Advanced.Types<T>,
	> extends IndexedCollection.Builder<T, Tp>,
			ValuedCollection.Builder<T, Tp> {
		indexOf<UT = T>(value: RelatedTo<T, UT>): number | undefined;
		indexOf<UT, O>(value: RelatedTo<T, UT>, otherwise: OptLazy<O>): number | O;
	}

	export namespace Advanced {
		// Combining two family axes still requires restating the narrowed
		// slots to resolve TS2320 -- but now only once, in the family, rather
		// than once per variant.
		export interface Family<T>
			extends IndexedCollection.Advanced.Family<T>,
				ValuedCollection.Advanced.Family<T> {
			_NORMAL: IndexedValuedCollection<T>;
			_NON_EMPTY: IndexedValuedCollection.NonEmpty<T>;
			_BUILDER: IndexedValuedCollection.Builder<T>;

			_NEW_FAMILY: IndexedValuedCollection.Advanced.Family<this['_NEW_E']>;
		}

		export interface NormalVariant<T>
			extends IndexedCollection.Advanced.NormalVariant<T>,
				ValuedCollection.Advanced.NormalVariant<T> {
			_stream: IndexedCollection.Advanced.NormalVariant<T>['_stream'];

			_NEW_TYPES: this['_NEW_FAMILY'] &
				IndexedValuedCollection.Advanced.NormalVariant<this['_NEW_E']>;
		}

		export interface NonEmptyVariant<T>
			extends IndexedCollection.Advanced.NonEmptyVariant<T>,
				ValuedCollection.Advanced.NonEmptyVariant<T> {
			_stream: IndexedCollection.Advanced.NonEmptyVariant<T>['_stream'];

			_NEW_TYPES: this['_NEW_FAMILY'] &
				IndexedValuedCollection.Advanced.NonEmptyVariant<this['_NEW_E']>;
		}

		export type Types<T> = IndexedValuedCollection.Advanced.Family<T> &
			IndexedValuedCollection.Advanced.NormalVariant<T>;

		export type TypesNonEmpty<T> = IndexedValuedCollection.Advanced.Family<T> &
			IndexedValuedCollection.Advanced.NonEmptyVariant<T>;
	}
}

export interface IndexedKeyedCollection<
	K,
	V,
	Tp extends IndexedKeyedCollection.Advanced.Types<
		K,
		V
	> = IndexedKeyedCollection.Advanced.Types<K, V>,
> extends IndexedCollection<readonly [K, V], Tp>,
		KeyedCollection<K, V, Tp> {
	indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
	indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
}

export declare namespace IndexedKeyedCollection {
	export interface NonEmpty<
		K,
		V,
		Tp extends IndexedKeyedCollection.Advanced.TypesNonEmpty<
			K,
			V
		> = IndexedKeyedCollection.Advanced.TypesNonEmpty<K, V>,
	> extends IndexedKeyedCollection<K, V, Tp>,
			IndexedCollection.NonEmpty<readonly [K, V], Tp>,
			KeyedCollection.NonEmpty<K, V, Tp> {
		indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
		indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
	}

	export interface Builder<
		K,
		V,
		Tp extends IndexedKeyedCollection.Advanced.Types<
			K,
			V
		> = IndexedKeyedCollection.Advanced.Types<K, V>,
	> extends IndexedCollection.Builder<readonly [K, V], Tp>,
			KeyedCollection.Builder<K, V, Tp> {
		indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
		indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
	}

	export namespace Advanced {
		export interface Family<K, V>
			extends IndexedCollection.Advanced.Family<readonly [K, V]>,
				KeyedCollection.Advanced.Family<K, V> {
			_NORMAL: IndexedKeyedCollection<K, V>;
			_NON_EMPTY: IndexedKeyedCollection.NonEmpty<K, V>;
			_BUILDER: IndexedKeyedCollection.Builder<K, V>;

			_NEW_FAMILY: IndexedKeyedCollection.Advanced.Family<
				this['_NEW_K'],
				this['_NEW_V']
			>;
		}

		export interface NormalVariant<K, V>
			extends IndexedCollection.Advanced.NormalVariant<readonly [K, V]>,
				KeyedCollection.Advanced.NormalVariant<K, V> {
			_stream: IndexedCollection.Advanced.NormalVariant<
				readonly [K, V]
			>['_stream'];

			_streamKeys: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream<K>;
			_streamValues: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream<V>;

			_NEW_TYPES: this['_NEW_FAMILY'] &
				IndexedKeyedCollection.Advanced.NormalVariant<
					this['_NEW_K'],
					this['_NEW_V']
				>;
		}

		export interface NonEmptyVariant<K, V>
			extends IndexedCollection.Advanced.NonEmptyVariant<readonly [K, V]>,
				KeyedCollection.Advanced.NonEmptyVariant<K, V> {
			_stream: IndexedCollection.Advanced.NonEmptyVariant<
				readonly [K, V]
			>['_stream'];

			_streamKeys: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream.NonEmpty<K>;
			_streamValues: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream.NonEmpty<V>;

			_NEW_TYPES: this['_NEW_FAMILY'] &
				IndexedKeyedCollection.Advanced.NonEmptyVariant<
					this['_NEW_K'],
					this['_NEW_V']
				>;
		}

		export type Types<K, V> = IndexedKeyedCollection.Advanced.Family<K, V> &
			IndexedKeyedCollection.Advanced.NormalVariant<K, V>;

		export type TypesNonEmpty<K, V> = IndexedKeyedCollection.Advanced.Family<
			K,
			V
		> &
			IndexedKeyedCollection.Advanced.NonEmptyVariant<K, V>;
	}
}

export interface SortedCollection<
	S,
	E,
	Tp extends SortedCollection.Advanced.Types<
		S,
		E
	> = SortedCollection.Advanced.Types<S, E>,
> extends Collection<E, Tp> {
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
	export interface NonEmpty<
		S,
		E,
		Tp extends SortedCollection.Advanced.TypesNonEmpty<
			S,
			E
		> = SortedCollection.Advanced.TypesNonEmpty<S, E>,
	> extends SortedCollection<S, E, Tp>,
			Collection.NonEmpty<E, Tp> {}

	export interface Builder<
		S,
		E,
		Tp extends SortedCollection.Advanced.Types<
			S,
			E
		> = SortedCollection.Advanced.Types<S, E>,
	> extends Collection.Builder<E, Tp> {
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
		export interface FamilyBase<S, E>
			extends Collection.Advanced.FamilyBase<E> {
			_NEW_S: unknown;
		}

		export interface Family<S, E>
			extends Collection.Advanced.Family<E>,
				SortedCollection.Advanced.FamilyBase<S, E> {
			_NORMAL: SortedCollection<S, E>;
			_NON_EMPTY: SortedCollection.NonEmpty<S, E>;
			_BUILDER: SortedCollection.Builder<S, E>;

			_NEW_FAMILY: SortedCollection.Advanced.Family<
				this['_NEW_S'],
				this['_NEW_E']
			>;
		}

		export interface NormalVariant<S, E>
			extends Collection.Advanced.NormalVariant<E>,
				SortedCollection.Advanced.FamilyBase<S, E> {
			_NEW_TYPES: this['_NEW_FAMILY'] &
				SortedCollection.Advanced.NormalVariant<this['_NEW_S'], this['_NEW_E']>;
		}

		export interface NonEmptyVariant<S, E>
			extends Collection.Advanced.NonEmptyVariant<E>,
				SortedCollection.Advanced.FamilyBase<S, E> {
			_NEW_TYPES: this['_NEW_FAMILY'] &
				SortedCollection.Advanced.NonEmptyVariant<
					this['_NEW_S'],
					this['_NEW_E']
				>;
		}

		export type Types<S, E> = SortedCollection.Advanced.Family<S, E> &
			SortedCollection.Advanced.NormalVariant<S, E>;

		export type TypesNonEmpty<S, E> = SortedCollection.Advanced.Family<S, E> &
			SortedCollection.Advanced.NonEmptyVariant<S, E>;
	}
}
