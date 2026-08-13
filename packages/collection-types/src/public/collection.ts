import type { TypesKey } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty, TraverseState } from '@rimbu/common';
import type { FastIterable, Stream, StreamSource } from '@rimbu/stream';

export interface Collection<
	E,
	Tp extends Collection.Advanced.Types<E> = Collection.Advanced.Types<E>,
> extends FastIterable<E>,
		Collection.Advanced.Trait<Tp> {
	readonly isEmpty: this[TypesKey]['_isEmpty'];
	readonly size: number;

	nonEmpty(): this is this[TypesKey]['_NON_EMPTY'];
	assumeNonEmpty(): this[TypesKey]['_NON_EMPTY'];

	stream: this[TypesKey]['_stream'];

	forEach(f: (element: E) => void): void;
	forEachIndexed(
		f: (element: E, index: number, halt: () => void) => void,
		options?: { state?: TraverseState | undefined } | undefined,
	): void;

	filter<E2 extends E, NE2 extends this[TypesKey]['_UPPER_E'] = Exclude<E, E2>>(
		pred: (element: E) => element is E2,
		options: { negate: true },
	): Collection.Advanced.Retyped<this[TypesKey], NE2>['_NORMAL'];
	filter<E2 extends E>(
		pred: (element: E) => element is E2,
		options?: { negate?: false | undefined } | undefined,
	): Collection.Advanced.Retyped<this[TypesKey], E2>['_NORMAL'];
	filter(
		pred: (element: E) => boolean,
		options?: { negate?: boolean | undefined } | undefined,
	): this[TypesKey]['_NORMAL'];

	filterIndexed<
		E2 extends E,
		NE2 extends this[TypesKey]['_UPPER_E'] = Exclude<E, E2>,
	>(
		pred: (element: E, index: number) => element is E2,
		options: { negate: true; indexOffset?: number | undefined },
	): Collection.Advanced.Retyped<this[TypesKey], NE2>['_NORMAL'];
	filterIndexed<E2 extends E>(
		pred: (element: E, index: number) => element is E2,
		options?:
			| { negate?: false | undefined; indexOffset?: number | undefined }
			| undefined,
	): Collection.Advanced.Retyped<this[TypesKey], E2>['_NORMAL'];
	filterIndexed(
		pred: (element: E, index: number) => boolean,
		options?:
			| { negate?: boolean | undefined; indexOffset?: number | undefined }
			| undefined,
	): this[TypesKey]['_NORMAL'];

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
	> extends Collection.Advanced.Trait<Tp> {
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

	export namespace Advanced {
		/**
		 * Combines a collection shape with the capabilities a default method needs.
		 *
		 * Intersecting collection interfaces directly also intersects their `context`
		 * properties. This type replaces that intersection with one context over the
		 * merged types record, so all capability methods and context factories remain
		 * available to the implementation.
		 */
		export type WithCapabilities<
			Base extends Collection<any>,
			Capabilities extends Collection<any>,
		> = Omit<Base & Capabilities, 'context' | TypesKey> & {
			readonly [TypesKey]: Base[TypesKey] & Capabilities[TypesKey];
			readonly context: Collection.Advanced.ContextBase<
				Base[TypesKey] & Capabilities[TypesKey]
			>;
		};

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
			Tp extends
				Collection.Advanced.Types<any> = Collection.Advanced.Types<any>,
		> {
			readonly [TypesKey]: Tp;
			readonly context: Collection.Advanced.ContextBase<Tp>;
		}

		export interface ContextBase<Tp extends Collection.Advanced.Types<any>> {
			empty<E extends Tp['_UPPER_E']>(): Collection.Advanced.Retyped<
				Tp,
				E
			>['_NORMAL'];
			of<E extends Tp['_UPPER_E']>(
				...elements: ArrayNonEmpty<E>
			): Collection.Advanced.Retyped<Tp, E>['_NON_EMPTY'];
			from<T extends Tp['_UPPER_E']>(
				...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
			): Collection.Advanced.Retyped<Tp, T>['_NON_EMPTY'];
			from<T extends Tp['_UPPER_E']>(
				...sources: ArrayNonEmpty<StreamSource<T>>
			): Collection.Advanced.Retyped<Tp, T>['_NORMAL'];
			builder<T extends Tp['_UPPER_E']>(): Collection.Advanced.Retyped<
				Tp,
				T
			>['_BUILDER'];
		}

		/**
		 * The types record is split along two orthogonal axes.
		 *
		 * - **Family** — *which* collection this is: `_NORMAL`, `_NON_EMPTY`,
		 *   `_BUILDER`. Identical for the possibly-empty and non-empty Kinds,
		 *   so a package declares it exactly once.
		 * - **Kind** — whether the collection may be empty: `_SELF`,
		 *   `_isEmpty`, `_stream`, `_toArray`, ... Fully determined by this
		 *   library, so a package never restates it.
		 *
		 * The two axes are combined with `&`, never `extends`: an intersection
		 * has no "members must be identical" rule (TS2320), and `unknown & X`
		 * reduces to `X`, so a narrowing family composes cleanly with a Kind
		 * that leaves the family slots open.
		 *
		 * Consequently a `*Kind` interface must only ever extend the Kind
		 * chain — extending a *narrowing* family from a Kind reintroduces
		 * TS2320.
		 */
		export interface FamilyBase<E> {
			_NORMAL: unknown;
			_NON_EMPTY: unknown;
			_BUILDER: unknown;

			_UPPER_E: unknown;
			_NEW_E: unknown;
			_NEW_FAMILY: Collection.Advanced.FamilyBase<this['_NEW_E']>;
		}

		export interface Family<E> extends Collection.Advanced.FamilyBase<E> {
			_NORMAL: Collection<E>;
			_NON_EMPTY: Collection.NonEmpty<E>;
			_BUILDER: Collection.Builder<E>;

			_NEW_FAMILY: Collection.Advanced.Family<this['_NEW_E']>;
		}

		export interface NormalKind<E> extends Collection.Advanced.FamilyBase<E> {
			_SELF: this['_NORMAL'];
			_AS_STREAM: Stream<E>;

			_isEmpty: boolean;
			_stream: () => Stream<E>;
			_toArray: () => E[];

			_NEW_TYPES: this['_NEW_FAMILY'] &
				Collection.Advanced.NormalKind<this['_NEW_E']>;
		}

		export interface NonEmptyKind<E> extends Collection.Advanced.FamilyBase<E> {
			_SELF: this['_NON_EMPTY'];
			_AS_STREAM: Stream.NonEmpty<E>;

			_isEmpty: false;
			_stream: () => Stream.NonEmpty<E>;
			_toArray: () => ArrayNonEmpty<E>;

			_NEW_TYPES: this['_NEW_FAMILY'] &
				Collection.Advanced.NonEmptyKind<this['_NEW_E']>;
		}

		export type Types<E> = Collection.Advanced.Family<E> &
			Collection.Advanced.NormalKind<E>;

		export type TypesNonEmpty<E> = Collection.Advanced.Family<E> &
			Collection.Advanced.NonEmptyKind<E>;

		/**
		 * The types record of the same collection family as `Tp`, but with
		 * element type `E2` in place of `Tp`'s element type. The family slots
		 * (`_NORMAL`, `_NON_EMPTY`, `_BUILDER`, ...) are carried over unchanged,
		 * while the kind slots (`_SELF`, `_stream`, ...) are re-instantiated for
		 * `E2` — so every capability of the original record survives re-typing.
		 */
		export type Retyped<
			Tp extends Collection.Advanced.Types<any>,
			E2 extends Tp['_UPPER_E'],
		> = (Tp & { _NEW_E: E2 })['_NEW_TYPES'];
	}

	export namespace Capability {
		export interface WithMap<E>
			extends Collection<E, Collection.Capability.WithMap.Types<E>>,
				Collection.Capability.WithMap.API<
					E,
					Collection.Capability.WithMap.Types<E>
				> {}

		export namespace WithMap {
			export interface API<
				E,
				Tp extends Collection.Advanced.Types<E> = Collection.Advanced.Types<E>,
			> extends Collection.Advanced.Trait<Tp> {
				map<E2 extends this[TypesKey]['_UPPER_E']>(
					f: (element: E) => E2,
				): Collection.Advanced.Retyped<this[TypesKey], E2>['_SELF'];

				mapIndexed<E2 extends this[TypesKey]['_UPPER_E']>(
					f: (element: E, index: number) => E2,
				): Collection.Advanced.Retyped<this[TypesKey], E2>['_SELF'];
			}

			export interface NonEmpty<E>
				extends Collection.NonEmpty<
						E,
						Collection.Capability.WithMap.TypesNonEmpty<E>
					>,
					Collection.Capability.WithMap.API<
						E,
						Collection.Capability.WithMap.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends Collection.Advanced.Family<E> {
				_NORMAL: Collection.Capability.WithMap<E>;
				_NON_EMPTY: Collection.Capability.WithMap.NonEmpty<E>;

				_NEW_FAMILY: Collection.Capability.WithMap.Family<this['_NEW_E']>;
			}

			export type Types<E> = Collection.Capability.WithMap.Family<E> &
				Collection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> = Collection.Capability.WithMap.Family<E> &
				Collection.Advanced.NonEmptyKind<E>;
		}

		export interface WithMutate<E>
			extends Collection<E, Collection.Capability.WithMutate.Types<E>>,
				Collection.Capability.WithMutate.API<
					E,
					Collection.Capability.WithMutate.Types<E>
				> {}

		export namespace WithMutate {
			export interface API<
				E,
				Tp extends Collection.Advanced.Types<E> = Collection.Advanced.Types<E>,
			> extends Collection.Advanced.Trait<Tp> {
				mutate(
					f: (builder: this[TypesKey]['_BUILDER']) => void,
				): this[TypesKey]['_NORMAL'];
			}

			export interface NonEmpty<E>
				extends Collection.NonEmpty<
						E,
						Collection.Capability.WithMutate.TypesNonEmpty<E>
					>,
					Collection.Capability.WithMutate.API<
						E,
						Collection.Capability.WithMutate.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends Collection.Advanced.Family<E> {
				_NORMAL: Collection.Capability.WithMutate<E>;
				_NON_EMPTY: Collection.Capability.WithMutate.NonEmpty<E>;

				_NEW_FAMILY: Collection.Capability.WithMutate.Family<this['_NEW_E']>;
			}

			export type Types<E> = Collection.Capability.WithMutate.Family<E> &
				Collection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				Collection.Capability.WithMutate.Family<E> &
					Collection.Advanced.NonEmptyKind<E>;
		}

		export interface WithRecompose<E>
			extends Collection<E, Collection.Capability.WithRecompose.Types<E>>,
				Collection.Capability.WithRecompose.API<
					E,
					Collection.Capability.WithRecompose.Types<E>
				> {}

		export namespace WithRecompose {
			export interface API<
				E,
				Tp extends Collection.Advanced.Types<E> = Collection.Advanced.Types<E>,
			> extends Collection.Advanced.Trait<Tp> {
				recompose<E2 extends this[TypesKey]['_UPPER_E']>(
					f: (
						stream: this[TypesKey]['_AS_STREAM'],
					) => StreamSource.NonEmpty<E2>,
				): Collection.Advanced.Retyped<this[TypesKey], E2>['_SELF'];
				recompose<E2 extends this[TypesKey]['_UPPER_E']>(
					f: (stream: this[TypesKey]['_AS_STREAM']) => StreamSource<E2>,
				): Collection.Advanced.Retyped<this[TypesKey], E2>['_NORMAL'];
			}

			export interface NonEmpty<E>
				extends Collection.NonEmpty<
						E,
						Collection.Capability.WithRecompose.TypesNonEmpty<E>
					>,
					Collection.Capability.WithRecompose.API<
						E,
						Collection.Capability.WithRecompose.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends Collection.Advanced.Family<E> {
				_NORMAL: Collection.Capability.WithRecompose<E>;
				_NON_EMPTY: Collection.Capability.WithRecompose.NonEmpty<E>;

				_NEW_FAMILY: Collection.Capability.WithRecompose.Family<this['_NEW_E']>;
			}

			export type Types<E> = Collection.Capability.WithRecompose.Family<E> &
				Collection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				Collection.Capability.WithRecompose.Family<E> &
					Collection.Advanced.NonEmptyKind<E>;
		}
	}
}
