import type { TypesKey } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty, TraverseState } from '@rimbu/common';
import type { FastIterable, Stream, StreamSource } from '@rimbu/stream';

export type Collection<
	E,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = Collection.Advanced.Types<F, E>['_NORMAL'];

export declare namespace Collection {
	export type NonEmpty<
		E,
		F extends Advanced.FamilyBase<E> = Advanced.Family<E>,
	> = Advanced.TypesNonEmpty<F, E>['_NON_EMPTY'];

	export type Builder<
		E,
		F extends Advanced.FamilyBase<E> = Advanced.Family<E>,
	> = Advanced.Types<F, E>['_BUILDER'];

	export interface Context<Tp extends Advanced.TypesBase> {
		empty<E extends Tp['_UPPER_E']>(): Collection.Advanced.ReTyped<
			Tp,
			E
		>['_NORMAL'];
		of<E extends Tp['_UPPER_E']>(
			...elements: ArrayNonEmpty<E>
		): Collection.Advanced.ReTyped<Tp, E>['_NON_EMPTY'];
		from<T extends Tp['_UPPER_E']>(
			...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
		): Collection.Advanced.ReTyped<Tp, T>['_NON_EMPTY'];
		from<T extends Tp['_UPPER_E']>(
			...sources: ArrayNonEmpty<StreamSource<T>>
		): Collection.Advanced.ReTyped<Tp, T>['_NORMAL'];
		builder<T extends Tp['_UPPER_E']>(): Collection.Advanced.ReTyped<
			Tp,
			T
		>['_BUILDER'];
	}

	export namespace Advanced {
		export type Types<F extends FamilyBase<any>, E> = F & {
			_FAM: F;
		} & NormalKind<E>;

		export type TypesNonEmpty<F extends FamilyBase<any>, E> = F & {
			_FAM: F;
		} & NonEmptyKind<E>;

		export interface FamilyBase<E> {
			/** the kind-free family this record was built from */
			_FAM: FamilyBase<E>;

			_NORMAL: unknown;
			_NON_EMPTY: unknown;
			_BUILDER: unknown;
			_CONTEXT: unknown;

			_AS_ARRAY: unknown;
			_AS_STREAM: unknown;
			_UPPER_E: unknown;

			_isEmpty: unknown;
			_stream: unknown;

			_NEW_E: unknown;
			_NEW_FAMILY: FamilyBase<this['_NEW_E']>;

			/** covariant witness, so `Col<number>` is a `Col<number | string>` */
			_COVARIANT: E;
		}

		export interface TypesBase extends FamilyBase<any> {
			_SELF: unknown;
			_NEW_TYPES: TypesBase;
		}

		export interface NormalKind<E> extends FamilyBase<E> {
			_SELF: this['_NORMAL'];
			_AS_ARRAY: E[];
			_AS_STREAM: Stream<E>;

			_isEmpty: boolean;
			_stream: () => Stream<E>;

			_NEW_TYPES: Types<this['_NEW_FAMILY'], this['_NEW_E']>;
		}

		export interface NonEmptyKind<E> extends FamilyBase<E> {
			_SELF: this['_NON_EMPTY'];

			_AS_ARRAY: ArrayNonEmpty<E>;
			_AS_STREAM: Stream.NonEmpty<E>;

			_isEmpty: false;
			_stream: () => Stream.NonEmpty<E>;

			_NEW_TYPES: TypesNonEmpty<this['_NEW_FAMILY'], this['_NEW_E']>;
		}

		export type ReTyped<Tp extends TypesBase, E2> =
			Tp extends NonEmptyKind<any>
				? TypesNonEmpty<(Tp & { _NEW_E: E2 })['_NEW_FAMILY'], E2>
				: Types<(Tp & { _NEW_E: E2 })['_NEW_FAMILY'], E2>;

		export type InvariantTypes<Tp extends TypesBase, E> = Tp & {
			readonly _INVARIANT: (e: E) => E;
		};

		export interface Api<E, Tp extends TypesBase> extends FastIterable<E> {
			/** phantom carrier of the types record; keeps `E` and the family invariant */
			readonly [TypesKey]: Tp;
			readonly context: Tp['_CONTEXT'];

			readonly isEmpty: Tp['_isEmpty'];
			readonly size: number;

			asNormal(): Tp['_NORMAL'];
			nonEmpty(): this is Tp['_NON_EMPTY'];
			assumeNonEmpty(): Tp['_NON_EMPTY'];

			stream: Tp['_stream'];

			forEach(f: (element: E) => void): void;
			forEachIndexed(
				f: (element: E, index: number, halt: () => void) => void,
				options?: { state?: TraverseState | undefined } | undefined,
			): void;

			filter<E2 extends E, NE2 extends Tp['_UPPER_E'] = Exclude<E, E2>>(
				pred: (element: E) => element is E2,
				options: { negate: true },
			): ReTyped<Tp, NE2>['_NORMAL'];
			filter<E2 extends E>(
				pred: (element: E) => element is E2,
				options?: { negate?: false | undefined } | undefined,
			): ReTyped<Tp, E2>['_NORMAL'];
			filter(
				pred: (element: E) => boolean,
				options?: { negate?: boolean | undefined } | undefined,
			): Tp['_NORMAL'];

			filterIndexed<E2 extends E, NE2 extends Tp['_UPPER_E'] = Exclude<E, E2>>(
				pred: (element: E, index: number) => element is E2,
				options: { negate: true; indexOffset?: number | undefined },
			): ReTyped<Tp, NE2>['_NORMAL'];
			filterIndexed<E2 extends E>(
				pred: (element: E, index: number) => element is E2,
				options?:
					| { negate?: false | undefined; indexOffset?: number | undefined }
					| undefined,
			): ReTyped<Tp, E2>['_NORMAL'];
			filterIndexed(
				pred: (element: E, index: number) => boolean,
				options?:
					| { negate?: boolean | undefined; indexOffset?: number | undefined }
					| undefined,
			): Tp['_NORMAL'];

			toArray(): Tp['_AS_ARRAY'];
		}

		export interface BuilderApi<E, Tp extends TypesBase> {
			readonly [TypesKey]: Tp;

			get isEmpty(): boolean;
			get size(): number;

			forEach(f: (element: E) => void): void;
			forEachIndexed(
				f: (element: E, index: number, halt: () => void) => void,
				options?: { state?: TraverseState | undefined } | undefined,
			): void;

			clear(): void;
			build(): Tp['_NORMAL'];
		}

		export interface Family<E> extends FamilyBase<E> {
			_NORMAL: Api<E, Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<E, TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<E, Types<this['_FAM'], E>>;
			_CONTEXT: Context<Types<this['_FAM'], E>>;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}

	export namespace Capability {
		export interface WithToBuilder<E> extends Advanced.Family<E> {
			_NORMAL: WithToBuilder.Api<E, Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithToBuilder.Api<E, Advanced.TypesNonEmpty<this['_FAM'], E>>;

			_FAM: WithToBuilder<E>;
			_NEW_FAMILY: WithToBuilder<this['_NEW_E']>;
		}

		export namespace WithToBuilder {
			export interface Api<E, Tp extends Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				[TypesKey]: Advanced.InvariantTypes<Tp, E>;

				toBuilder(): Tp['_BUILDER'];
			}
		}

		export interface WithMap<E> extends Advanced.Family<E> {
			_NORMAL: WithMap.Api<E, Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithMap.Api<E, Advanced.TypesNonEmpty<this['_FAM'], E>>;

			_FAM: WithMap<E>;
			_NEW_FAMILY: WithMap<this['_NEW_E']>;
		}

		export namespace WithMap {
			export interface Api<E, Tp extends Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				/**
				 * `map` may only produce elements within `_UPPER_E`, so widening `E`
				 * would hand out a collection that accepts elements its family cannot
				 * hold. This capability therefore makes `E` invariant.
				 */
				[TypesKey]: Advanced.InvariantTypes<Tp, E>;

				map<E2 extends Tp['_UPPER_E']>(
					f: (element: E) => E2,
				): Advanced.ReTyped<Tp, E2>['_SELF'];

				mapIndexed<E2 extends this[TypesKey]['_UPPER_E']>(
					f: (element: E, index: number) => E2,
				): Collection.Advanced.ReTyped<Tp, E2>['_SELF'];
			}
		}

		export interface WithFlatMap<E> extends Advanced.Family<E> {
			_NORMAL: WithFlatMap.Api<E, Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithFlatMap.Api<E, Advanced.TypesNonEmpty<this['_FAM'], E>>;

			_FAM: WithFlatMap<E>;
			_NEW_FAMILY: WithFlatMap<this['_NEW_E']>;
		}

		export namespace WithFlatMap {
			export interface Api<E, Tp extends Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				[TypesKey]: Advanced.InvariantTypes<Tp, E>;

				flatMap<E2 extends Tp['_UPPER_E']>(
					f: (element: E) => StreamSource.NonEmpty<E2>,
				): Collection.Advanced.ReTyped<Tp, E2>['_SELF'];
				flatMap<E2 extends Tp['_UPPER_E']>(
					f: (element: E) => StreamSource<E2>,
				): Collection.Advanced.ReTyped<Tp, E2>['_NORMAL'];

				flatMapIndexed<E2 extends Tp['_UPPER_E']>(
					f: (element: E, index: number) => StreamSource.NonEmpty<E2>,
					options: { indexOffset?: number | undefined } | undefined,
				): Collection.Advanced.ReTyped<Tp, E2>['_SELF'];
				flatMapIndexed<E2 extends Tp['_UPPER_E']>(
					f: (element: E, index: number) => StreamSource<E2>,
					options: { indexOffset?: number | undefined } | undefined,
				): Collection.Advanced.ReTyped<Tp, E2>['_NORMAL'];
			}
		}

		export interface WithMutate<E> extends Advanced.Family<E> {
			_NORMAL: WithMutate.Api<E, Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithMutate.Api<E, Advanced.TypesNonEmpty<this['_FAM'], E>>;

			_FAM: WithMutate<E>;
			_NEW_FAMILY: WithMutate<this['_NEW_E']>;
		}

		export namespace WithMutate {
			export interface Api<E, Tp extends Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				[TypesKey]: Advanced.InvariantTypes<Tp, E>;

				mutate(f: (builder: Tp['_BUILDER']) => void): Tp['_NORMAL'];
			}
		}

		export interface WithRecompose<E> extends Advanced.Family<E> {
			_NORMAL: WithRecompose.Api<E, Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithRecompose.Api<E, Advanced.TypesNonEmpty<this['_FAM'], E>>;

			_FAM: WithRecompose<E>;
			_NEW_FAMILY: WithRecompose<this['_NEW_E']>;
		}

		export namespace WithRecompose {
			export interface Api<E, Tp extends Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				[TypesKey]: Advanced.InvariantTypes<Tp, E>;

				recompose<E2 extends Tp['_UPPER_E']>(
					f: (stream: Tp['_AS_STREAM']) => StreamSource.NonEmpty<E2>,
				): Advanced.ReTyped<Tp, E2>['_SELF'];
				recompose<E2 extends Tp['_UPPER_E']>(
					f: (stream: Tp['_AS_STREAM']) => StreamSource<E2>,
				): Advanced.ReTyped<Tp, E2>['_NORMAL'];
			}
		}
	}
}
