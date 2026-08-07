import type { TypesKey } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty, CollectFun, TraverseState } from '@rimbu/common';
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

		export type WithSelf<
			E,
			C extends Collection<E>,
		> = Collection.Advanced.Trait<E> & {
			readonly [TypesKey]: Collection.Advanced.Family<E> & {
				_SELF: C;
			};
		};

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
